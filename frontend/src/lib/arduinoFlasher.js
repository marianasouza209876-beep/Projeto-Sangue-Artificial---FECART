/**
 * Flasher de Firmware Arduino em JavaScript puro para Web Serial API (STK500v1 Optiboot)
 * Permite gravar o binário Intel HEX gerado pela compilação diretamente no Arduino Uno/Nano.
 */

// Constantes do Protocolo STK500v1
const STK_OK = 0x10;
const STK_FAILED = 0x11;
const STK_UNKNOWN = 0x12;
const STK_INSYNC = 0x14;
const STK_NOSYNC = 0x15;

const STK_GET_SYNC = 0x30;
const STK_GET_SIGN_ON = 0x31;
const STK_SET_PARAMETER = 0x40;
const STK_GET_PARAMETER = 0x41;
const STK_SET_DEVICE = 0x42;
const STK_SET_DEVICE_EXT = 0x45;
const STK_ENTER_PROGMODE = 0x50;
const STK_LEAVE_PROGMODE = 0x51;
const STK_CHIP_ERASE = 0x52;
const STK_CHECK_AUTOINC = 0x53;
const STK_LOAD_ADDRESS = 0x55;
const STK_UNIVERSAL = 0x56;
const STK_UNIVERSAL_MULTI = 0x57;
const STK_PROG_FLASH = 0x60;
const STK_PROG_DATA = 0x61;
const STK_PROG_FUSE = 0x62;
const STK_PROG_LOCK = 0x63;
const STK_PROG_PAGE = 0x64;
const STK_PROG_FUSE_EXT = 0x65;
const STK_READ_FLASH = 0x70;
const STK_READ_DATA = 0x71;
const STK_READ_FUSE = 0x72;
const STK_READ_LOCK = 0x73;
const STK_READ_PAGE = 0x74;
const STK_READ_SIGN = 0x75;
const STK_READ_OSCCAL = 0x76;
const STK_READ_FUSE_EXT = 0x77;
const STK_READ_OSCCAL_EXT = 0x78;

const SYNC_PACKET = new Uint8Array([STK_GET_SYNC, 0x20]);

/**
 * Converte string Intel HEX em Array de Bytes de memória flash
 */
export function parseIntelHex(hexString) {
  const lines = hexString.split(/\r?\n/);
  const data = new Uint8Array(32768); // 32KB para ATmega328P
  data.fill(0xFF);
  
  let maxAddress = 0;
  let upperAddress = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith(':')) continue;

    const len = parseInt(line.substr(1, 2), 16);
    const addr = parseInt(line.substr(3, 4), 16);
    const type = parseInt(line.substr(7, 2), 16);

    if (type === 0x00) { // Data record
      const absoluteAddr = upperAddress + addr;
      for (let j = 0; j < len; j++) {
        const byteVal = parseInt(line.substr(9 + (j * 2), 2), 16);
        if (absoluteAddr + j < data.length) {
          data[absoluteAddr + j] = byteVal;
          if (absoluteAddr + j > maxAddress) {
            maxAddress = absoluteAddr + j;
          }
        }
      }
    } else if (type === 0x01) { // End of file
      break;
    } else if (type === 0x04) { // Extended linear address
      upperAddress = parseInt(line.substr(9, 4), 16) << 16;
    }
  }

  const binaryLength = maxAddress + 1;
  return data.slice(0, binaryLength > 0 ? binaryLength : 0);
}

/**
 * Utilitário para pausar execução async
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Grava o binário Intel HEX na placa Arduino via Web Serial usando o protocolo STK500v1
 */
export async function flashArduinoBoard({
  port,
  hexString,
  baudRate = 115200,
  pageSize = 128,
  onProgress,
  onLog
}) {
  const log = (msg) => {
    if (onLog) onLog(msg);
    console.log(`[STK500 Flasher]: ${msg}`);
  };

  const updateProgress = (pct) => {
    if (onProgress) onProgress(Math.min(100, Math.max(0, Math.round(pct))));
  };

  log("Iniciando rotina de gravação no Arduino...");
  
  const hexBytes = parseIntelHex(hexString);
  if (hexBytes.length === 0) {
    throw new Error("Arquivo Intel HEX inválido ou vazio.");
  }
  log(`Tamanho do código compilado: ${hexBytes.length} bytes (aproximadamente ${Math.ceil(hexBytes.length / 1024)} KB)`);

  let reader = null;
  let writer = null;

  try {
    // Reabre a porta serial com o baudrate do bootloader
    if (!port.readable || !port.writable) {
      await port.open({ baudRate });
    }

    writer = port.writable.getWriter();
    reader = port.readable.getReader();

    // Pulso DTR para dar RESET no Arduino e entrar no Bootloader
    log("Enviando sinal de RESET (DTR/RTS) para ativar o Optiboot...");
    await port.setSignals({ dataTerminalReady: false, requestToSend: false });
    await sleep(250);
    await port.setSignals({ dataTerminalReady: true, requestToSend: true });
    await sleep(150);

    // Função de leitura de resposta do STK500 com timeout
    const readResponse = async (timeoutMs = 1000) => {
      const buffer = [];
      const startTime = Date.now();

      while (Date.now() - startTime < timeoutMs) {
        const { value, done } = await Promise.race([
          reader.read(),
          sleep(100).then(() => ({ value: null, done: false }))
        ]);

        if (done) break;
        if (value) {
          for (let b of value) buffer.push(b);
          if (buffer.length >= 2 && buffer[0] === STK_INSYNC && buffer[buffer.length - 1] === STK_OK) {
            return buffer;
          }
        }
      }
      return buffer;
    };

    // Sincronização STK500
    log("Aguardando sincronização STK_GET_SYNC...");
    let synced = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      await writer.write(SYNC_PACKET);
      const resp = await readResponse(400);
      if (resp.length >= 2 && resp[0] === STK_INSYNC && resp[1] === STK_OK) {
        synced = true;
        log(`Placa sincronizada com sucesso na tentativa ${attempt}!`);
        break;
      }
      await sleep(100);
    }

    if (!synced) {
      throw new Error("Não foi possível sincronizar com o bootloader do Arduino. Verifique a porta COM e a placa selecionada.");
    }

    // Gravação das páginas de memória
    const totalBytes = hexBytes.length;
    let bytesFlashed = 0;

    log("Gravando páginas de memória Flash...");

    for (let address = 0; address < totalBytes; address += pageSize) {
      const wordAddress = address / 2; // STK500 usa endereço de palavra (16 bits)
      
      // Load Address: STK_LOAD_ADDRESS (0x55), Low, High, Sync(0x20)
      const loadAddrPacket = new Uint8Array([
        STK_LOAD_ADDRESS,
        wordAddress & 0xFF,
        (wordAddress >> 8) & 0xFF,
        0x20
      ]);
      await writer.write(loadAddrPacket);
      await readResponse(300);

      // Bloco de dados da página
      const chunkLen = Math.min(pageSize, totalBytes - address);
      const chunk = hexBytes.slice(address, address + chunkLen);

      // STK_PROG_PAGE: 0x64, len_hi, len_lo, 'F'(0x46), bytes..., 0x20
      const pageHeader = new Uint8Array([
        STK_PROG_PAGE,
        (chunkLen >> 8) & 0xFF,
        chunkLen & 0xFF,
        0x46 // 'F' para Flash
      ]);
      const pageFooter = new Uint8Array([0x20]);

      const fullPagePacket = new Uint8Array(pageHeader.length + chunk.length + pageFooter.length);
      fullPagePacket.set(pageHeader, 0);
      fullPagePacket.set(chunk, pageHeader.length);
      fullPagePacket.set(pageFooter, pageHeader.length + chunk.length);

      await writer.write(fullPagePacket);
      const pageResp = await readResponse(500);

      if (pageResp.length < 2 || pageResp[0] !== STK_INSYNC) {
        throw new Error(`Falha de confirmação ao gravar a página no endereço 0x${address.toString(16)}.`);
      }

      bytesFlashed += chunkLen;
      updateProgress((bytesFlashed / totalBytes) * 100);
    }

    // Finalizar modo de gravação
    log("Gravação concluída 100%! Encerrando modo de programação (STK_LEAVE_PROGMODE)...");
    const leavePacket = new Uint8Array([STK_LEAVE_PROGMODE, 0x20]);
    await writer.write(leavePacket);
    await readResponse(300);

    updateProgress(100);
    log("✅ Upload concluído com sucesso! O sketch está rodando no Arduino.");

  } catch (err) {
    log(`❌ Erro no envio para a placa: ${err.message}`);
    throw err;
  } finally {
    if (reader) {
      try { reader.releaseLock(); } catch (e) {}
    }
    if (writer) {
      try { writer.releaseLock(); } catch (e) {}
    }
  }
}
