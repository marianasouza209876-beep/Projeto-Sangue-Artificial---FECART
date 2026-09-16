/*
 * ==============================================================================
 * PROJETO SANGUE ARTIFICIAL - FECART (FLOWTIFICIAL)
 * Firmware de Telemetria Multisensores (DS18B20, YF-S201, MQ-135)
 * ==============================================================================
 * 
 * Este sketch faz a leitura contínua dos 3 sensores biomédicos físicos:
 *  - DS18B20 (Digital via OneWire / DallasTemperature no Pino 7) -> Temperatura em °C
 *  - YF-S201 (Pulsos de Vazão por Interrupção no Pino 3) -> Vazão (L/min) e Volume Acumulado (L)
 *  - MQ-135 (Analógico no Pino A0) -> Qualidade do Ar / Gás bruto (0 a 1023)
 *
 * Transmite os dados para a porta Serial USB a 9600 baud em formato JSON por linha.
 * O site FLOWTIFICIAL se conecta diretamente via Web Serial API ou ponte local.
 * ==============================================================================
 */

#include <OneWire.h>
#include <DallasTemperature.h>

// --- MAPEAMENTO DE PINOS DOS SENSORES ---
#define PINO_ONE_WIRE          7   // Pino Digital para o sensor DS18B20 (com resistor pull-up 4.7k)
#define PINO_SENSOR_FLUXO      3   // Pino Digital de Interrupção para o YF-S201
#define PINO_MQ135             A0  // Pino Analógico para o sensor MQ-135

// Configuração do barramento OneWire e DallasTemperature
OneWire oneWire(PINO_ONE_WIRE);
DallasTemperature sensorTemperatura(&oneWire);

// Variáveis de controle de vazão (YF-S201)
volatile unsigned long contadorPulsos = 0;
float vazaoLmin = 0.0;
float volumeTotalLitros = 0.0;
float fatorCalibracaoYF = 7.5; // Fator padrão do sensor YF-S201: 7.5 Hz por L/min

// Intervalo de transmissão (em milissegundos)
const unsigned long INTERVALO_LEITURA_MS = 1000;
unsigned long ultimoTempoLeitura = 0;

// Modo de simulação inteligente caso o hardware físico esteja desconectado ou em teste
bool MODO_SIMULADO = false;

// Interrupção ativada na borda de subida do pulso do YF-S201
void contaPulso() {
  contadorPulsos++;
}

void setup() {
  // Inicialização serial de alta velocidade (115200 bps)
  Serial.begin(9600);
  delay(500);

  // Inicializa o sensor DS18B20
  sensorTemperatura.begin();

  // Configura pino do sensor de fluxo com pull-up interno e interrupção
  pinMode(PINO_SENSOR_FLUXO, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PINO_SENSOR_FLUXO), contaPulso, RISING);

  // Configura pino analógico do MQ-135
  pinMode(PINO_MQ135, INPUT);

  // Mensagem inicial de handshaking JSON
  Serial.println(F("{\"status\":\"HARDWARE_ONLINE\",\"dispositivo\":\"FLOWTIFICIAL_MULTISENSOR\",\"sensores\":[\"DS18B20\",\"YF-S201\",\"MQ-135\"]}"));
}

void loop() {
  unsigned long tempoAtual = millis();

  if (tempoAtual - ultimoTempoLeitura >= INTERVALO_LEITURA_MS) {
    unsigned long deltaTempoMs = tempoAtual - ultimoTempoLeitura;
    ultimoTempoLeitura = tempoAtual;

    // 1. LEITURA DE TEMPERATURA (DS18B20)
    sensorTemperatura.requestTemperatures();
    float tempC = sensorTemperatura.getTempCByIndex(0);

    // Se o DS18B20 retornar valor inválido (-127.0 ou 85.0 de erro de inicialização), ativa fallback
    bool tempValida = (tempC > -55.0 && tempC < 125.0 && tempC != 85.0);

    // 2. CÁLCULO DE VAZÃO E VOLUME (YF-S201)
    // Desativa interrupções momentaneamente para leitura atômica
    noInterrupts();
    unsigned long pulsos = contadorPulsos;
    contadorPulsos = 0;
    interrupts();

    // Vazão em L/min = (Pulsos / Fator) * (1000ms / DeltaTempo)
    vazaoLmin = ((float)pulsos / fatorCalibracaoYF) * (1000.0 / (float)deltaTempoMs);
    
    // Volume acumulado em Litros = Litros nesta janela
    float volumeJanela = (vazaoLmin / 60.0) * ((float)deltaTempoMs / 1000.0);
    volumeTotalLitros += volumeJanela;

    // 3. LEITURA DE GÁS / QUALIDADE DO AR (MQ-135)
    int rawMQ135 = analogRead(PINO_MQ135);

    // 4. VERIFICAÇÃO E MONTAGEM DE DADOS FÍSICOS OU SIMULADOS
    bool ehSimulado = MODO_SIMULADO || (!tempValida && pulsos == 0 && rawMQ135 < 10);

    float finalTemp = tempC;
    float finalVazao = vazaoLmin;
    float finalVolume = volumeTotalLitros;
    int finalMQ135 = rawMQ135;

    if (ehSimulado) {
      // Gera dados biomédicos simulados e consistentes para testes sem placa física
      finalTemp = 36.5 + (random(-10, 10) / 10.0);
      finalVazao = 4.8 + (random(-4, 4) / 10.0);
      finalVolume += (finalVazao / 60.0);
      finalMQ135 = 320 + random(-20, 20);
    }

    // 5. TRANSMISSÃO EM FORMATO JSON POR LINHA (LINE-DELIMITED JSON)
    Serial.print(F("{\"temp\":"));
    Serial.print(finalTemp, 1);
    Serial.print(F(",\"flow_rate\":"));
    Serial.print(finalVazao, 1);
    Serial.print(F(",\"volume\":"));
    Serial.print(finalVolume, 2);
    Serial.print(F(",\"mq135_raw\":"));
    Serial.print(finalMQ135);
    Serial.print(F(",\"is_simulated\":"));
    Serial.print(ehSimulado ? F("true") : F("false"));
    Serial.print(F(",\"lote_id\":\"SA-023\""));
    Serial.println(F("}"));
  }
}
