/*
 * ==============================================================================
 * PROJETO SANGUE ARTIFICIAL - FECART (FLOWTIFICIAL)
 * Firmware de Telemetria Serial Arduino -> Dashboard Web
 * ==============================================================================
 * 
 * Este sketch faz a leitura contínua dos sensores biomédicos físicos (ou potenciômetros
 * de teste) e transmite os dados para a porta Serial USB a 115200 baud.
 * O site (Flowtificial) se conecta diretamente a este Arduino pelo navegador
 * via Web Serial API (Google Chrome / Microsoft Edge).
 *
 * ⚠️ AVISO IMPORTANTE:
 * Antes de clicar em "CONECTAR ARDUINO" no site, FECHE o "Monitor Serial" da
 * Arduino IDE (Ctrl+Shift+M), pois o Windows não permite que dois programas
 * acessem a mesma porta COM simultaneamente.
 * ==============================================================================
 */

// --- CONFIGURAÇÃO DE PINOS DOS SENSORES ---
// Caso não tenha os sensores específicos conectados, você pode conectar
// potenciômetros comuns nestes pinos para simular as variações na feira.
const int PINO_SENSOR_GAS_O2    = A0; // Sensor de Oxigenação / Gás (ex: MAX30102 ou Potenciômetro)
const int PINO_SENSOR_FLUXO     = A1; // Sensor de Vazão / Fluxo (ex: YF-S201 ou Potenciômetro)
const int PINO_SENSOR_TEMP      = A2; // Sensor de Temperatura (ex: LM35, NTC ou Potenciômetro)

// Taxa de atualização (em milissegundos)
const unsigned long INTERVALO_ENVIO_MS = 1000; // Envia a cada 1 segundo
unsigned long ultimoEnvio = 0;

// Modo de simulação inteligente caso nenhum sensor esteja conectado (pinos flutuando)
const bool MODO_DEMO_BANCADA = false; // Mude para true se quiser gerar dados automáticos

void setup() {
  // Inicialização da porta serial em 115200 bps (alta velocidade e estabilidade)
  Serial.begin(115200);
  
  // Aguarda a estabilização da conexão serial
  delay(1000);
  
  // Mensagem inicial de identificação do hardware
  Serial.println(F("{\"status\": \"HARDWARE_ONLINE\", \"dispositivo\": \"ARDUINO_FLOWTIFICIAL\"}"));
}

void loop() {
  unsigned long tempoAtual = millis();

  // Executa o ciclo de leitura e transmissão no intervalo definido
  if (tempoAtual - ultimoEnvio >= INTERVALO_ENVIO_MS) {
    ultimoEnvio = tempoAtual;

    float gas_val = 0.0;
    float flow_val = 0.0;
    float temp_val = 0.0;

    if (MODO_DEMO_BANCADA) {
      // Gera pequenas variações realistas em torno dos valores ideais clínicos
      gas_val = 97.0 + (random(-10, 15) / 10.0);   // 96.0% a 98.5%
      flow_val = 4.8 + (random(-3, 3) / 10.0);     // 4.5 a 5.1 L/min
      temp_val = 22.0 + (random(-8, 8) / 10.0);    // 21.2°C a 22.8°C
    } else {
      // Leitura dos pinos analógicos (0 a 1023)
      int rawGas = analogRead(PINO_SENSOR_GAS_O2);
      int rawFlow = analogRead(PINO_SENSOR_FLUXO);
      int rawTemp = analogRead(PINO_SENSOR_TEMP);

      // Mapeamento para unidades clínicas do projeto:
      // Oxigenação / Carga gasosa: 70.0% a 100.0%
      gas_val = mapFloat(rawGas, 0, 1023, 70.0, 100.0);

      // Vazão / Resistência de fluxo: 0.0 a 6.0 L/min
      flow_val = mapFloat(rawFlow, 0, 1023, 1.0, 6.0);

      // Temperatura biomédica: 15.0°C a 40.0°C
      temp_val = mapFloat(rawTemp, 0, 1023, 15.0, 40.0);
    }

    // =========================================================================
    // TRANSMISSÃO SERIAL: Formato JSON Compatível com o Dashboard Flowtificial
    // =========================================================================
    // O site aceita tanto este JSON quanto CSV simples: Serial.println("98.5,4.8,22.0");
    Serial.print(F("{\"gas_value\": "));
    Serial.print(gas_val, 1);
    Serial.print(F(", \"flow_value\": "));
    Serial.print(flow_val, 1);
    Serial.print(F(", \"temp_value\": "));
    Serial.print(temp_val, 1);
    Serial.println(F("}"));

    // Opcional: Para visualização limpa também no formato CSV, descomente a linha abaixo:
    // Serial.println(String(gas_val, 1) + "," + String(flow_val, 1) + "," + String(temp_val, 1));
  }
}

/**
 * Função utilitária para mapeamento proporcional com precisão em ponto flutuante (float).
 */
float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  if (in_max == in_min) return out_min;
  float resultado = (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  if (resultado < out_min) resultado = out_min;
  if (resultado > out_max) resultado = out_max;
  return resultado;
}
