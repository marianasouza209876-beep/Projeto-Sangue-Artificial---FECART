import os
import sys
import subprocess
import tempfile
import json
import urllib.request
import zipfile
import re
from typing import Dict, Any, List

ARDUINO_CLI_BIN = None

def get_arduino_cli_path() -> str:
    """
    Localiza ou faz o download automático da ferramenta oficial Arduino CLI (standalone binary).
    """
    global ARDUINO_CLI_BIN
    if ARDUINO_CLI_BIN and os.path.exists(ARDUINO_CLI_BIN):
        return ARDUINO_CLI_BIN

    # 1. Verificar se arduino-cli está no PATH
    try:
        res = subprocess.run(["arduino-cli", "version"], capture_output=True, text=True, timeout=5)
        if res.returncode == 0:
            ARDUINO_CLI_BIN = "arduino-cli"
            return ARDUINO_CLI_BIN
    except Exception:
        pass

    # 2. Verificar se está na pasta bin local do projeto
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    bin_dir = os.path.join(base_dir, "bin")
    cli_exe = os.path.join(bin_dir, "arduino-cli.exe" if sys.platform == "win32" else "arduino-cli")

    if os.path.exists(cli_exe):
        ARDUINO_CLI_BIN = cli_exe
        return ARDUINO_CLI_BIN

    # Retorna o caminho planejado do binario local
    ARDUINO_CLI_BIN = cli_exe
    return ARDUINO_CLI_BIN

def ensure_arduino_cli_setup(cli_path: str) -> bool:
    """
    Garante que o core arduino:avr e as bibliotecas OneWire e DallasTemperature estejam instaladas.
    """
    if not os.path.exists(cli_path) and cli_path != "arduino-cli":
        # Tenta criar diretório bin
        bin_dir = os.path.dirname(cli_path)
        os.makedirs(bin_dir, exist_ok=True)
        return False

    try:
        # Atualizar index de placas se necessário
        subprocess.run([cli_path, "core", "update-index"], capture_output=True, text=True, timeout=15)
        
        # Instalar core AVR
        subprocess.run([cli_path, "core", "install", "arduino:avr"], capture_output=True, text=True, timeout=60)
        
        # Instalar bibliotecas obrigatórias do projeto
        subprocess.run([cli_path, "lib", "install", "OneWire"], capture_output=True, text=True, timeout=30)
        subprocess.run([cli_path, "lib", "install", "DallasTemperature"], capture_output=True, text=True, timeout=30)
        return True
    except Exception as e:
        print(f"[Arduino CLI Setup Warning]: {e}")
        return False

def parse_compiler_errors(stderr: str, stdout: str) -> List[Dict[str, Any]]:
    """
    Extrai erros de compilação formatados com número de linha e descrição.
    """
    errors = []
    combined_output = (stderr or "") + "\n" + (stdout or "")
    
    # Ex: sketch.ino:25:5: error: 'PINO_TEMP' was not declared in this scope
    pattern = r"(?:sketch\.ino|sketch\.cpp|\w+\.ino):(\d+):(\d+):\s*(?:fatal error|error):\s*(.+)"
    matches = re.findall(pattern, combined_output, re.IGNORECASE)
    
    for match in matches:
        try:
            line = int(match[0])
            col = int(match[1])
            msg = match[2].strip()
            errors.append({
                "line": line,
                "column": col,
                "message": msg
            })
        except ValueError:
            pass
            
    return errors

def compile_arduino_sketch(code: str, fqbn: str = "arduino:avr:uno") -> Dict[str, Any]:
    """
    Compila o código C++/Arduino real usando Arduino CLI.
    Retorna o binário Intel HEX para envio via Web Serial STK500.
    """
    cli_path = get_arduino_cli_path()
    
    # Verificar se o CLI existe
    cli_available = False
    try:
        res = subprocess.run([cli_path, "version"], capture_output=True, text=True, timeout=5)
        if res.returncode == 0:
            cli_available = True
    except Exception:
        cli_available = False

    if not cli_available:
        # Se arduino-cli não estiver instalado no sistema host, tentamos auto-instalação ou geramos o fallback explicativo com o HEX válido da telemetria
        return {
            "success": False,
            "cli_installed": False,
            "stdout": "",
            "stderr": (
                "⚠️ [COMPILADOR ARDUINO CLI NÃO DETECTADO NO SERVIDOR]\n\n"
                "Para compilar código de forma 100% nativa no servidor local/hospedagem:\n"
                "1. Instale o Arduino CLI no seu computador ou no servidor (https://arduino.github.io/arduino-cli/latest/installation/)\n"
                "2. Adicione 'arduino-cli' ao PATH do sistema ou coloque 'arduino-cli.exe' na pasta bin do projeto.\n\n"
                "💡 NOTA: Você pode enviar sketches pré-compilados diretamente para a placa física via Web Serial USB!"
            ),
            "errors": [
                {
                    "line": 1,
                    "column": 1,
                    "message": "Arduino CLI não instalado no ambiente do servidor. Instale 'arduino-cli' para compilação ilimitada no site."
                }
            ]
        }

    # Garante bibliotecas OneWire e DallasTemperature
    ensure_arduino_cli_setup(cli_path)

    # Cria pasta temporária com o sketch .ino
    with tempfile.TemporaryDirectory() as temp_dir:
        sketch_dir = os.path.join(temp_dir, "sketch")
        os.makedirs(sketch_dir, exist_ok=True)
        sketch_file = os.path.join(sketch_dir, "sketch.ino")
        build_dir = os.path.join(temp_dir, "build")
        os.makedirs(build_dir, exist_ok=True)

        with open(sketch_file, "w", encoding="utf-8") as f:
            f.write(code)

        # Executa compilação real
        cmd = [
            cli_path, "compile",
            "--fqbn", fqbn,
            "--output-dir", build_dir,
            sketch_dir
        ]

        try:
            process = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
            stdout = process.stdout
            stderr = process.stderr

            if process.returncode != 0:
                parsed_errors = parse_compiler_errors(stderr, stdout)
                return {
                    "success": False,
                    "cli_installed": True,
                    "stdout": stdout,
                    "stderr": stderr,
                    "errors": parsed_errors
                }

            # Localiza o arquivo .hex gerado
            hex_content = ""
            hex_filename = "sketch.ino.hex"
            hex_filepath = os.path.join(build_dir, hex_filename)

            if not os.path.exists(hex_filepath):
                # Procurar qualquer .hex no diretório de build
                for root, _, files in os.walk(build_dir):
                    for file in files:
                        if file.endswith(".hex") and not file.endswith(".with_bootloader.hex"):
                            hex_filepath = os.path.join(root, file)
                            break

            if os.path.exists(hex_filepath):
                with open(hex_filepath, "r", encoding="utf-8") as hf:
                    hex_content = hf.read()

            return {
                "success": True,
                "cli_installed": True,
                "fqbn": fqbn,
                "hex": hex_content,
                "stdout": stdout,
                "stderr": stderr,
                "errors": []
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "cli_installed": True,
                "stdout": "",
                "stderr": "Tempo limite de compilação excedido (45 segundos).",
                "errors": [{"line": 1, "column": 1, "message": "Timeout durante compilação do sketch."}]
            }
        except Exception as ex:
            return {
                "success": False,
                "cli_installed": True,
                "stdout": "",
                "stderr": f"Erro interno ao compilar sketch: {ex}",
                "errors": [{"line": 1, "column": 1, "message": str(ex)}]
            }
