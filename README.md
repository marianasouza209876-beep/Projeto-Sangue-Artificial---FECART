# Projeto-Sangue-Artificial---FECART
Área de verificação e desenvolvimento do código do projeto da FECART.


## Conexão direta do Arduino ao painel

No painel principal, use **Conectar Arduino USB**. Selecione a velocidade usada
pelo firmware em `Serial.begin()` (9600 ou 115200, por exemplo), clique em
**Conectar Arduino** e escolha a porta. Feche antes o Monitor Serial da IDE e
qualquer ponte Python que esteja usando a mesma porta.

O Arduino deve enviar um objeto JSON por linha, com valores numéricos:

```json
{"gas_value":98,"flow_value":4.8,"temp_value":22}
```

Use `Serial.println()` para terminar cada pacote com uma quebra de linha.
Os aliases `gas`/`oxigenacao`, `flow`/`vazao` e `temp`/`temperatura` também são
aceitos. Os valores devem representar as grandezas e unidades esperadas pelo
seu projeto; o monitor exibe os números brutos sem atribuir calibração.
Campos ausentes aparecem como `—` no monitor. Texto que não seja JSON continua
visível no histórico, mas não é interpretado como leitura válida.

A conexão usa Web Serial no Chrome/Edge para computador, em HTTPS ou localhost.
Os dados USB permanecem no navegador conectado; não são enviados à API nem
compartilhados com outros computadores. O histórico guarda as últimas 40 linhas.
Após 15 segundos sem JSON válido, o monitor indica que aguarda dados.
Use **Desconectar** antes de trocar a velocidade ou usar a porta em outro programa.

A integração apenas recebe dados: não envia comandos, não grava firmware e não
confirma atuação física. A API e a ponte Python continuam sendo um caminho
separado. Não execute a ponte e a conexão USB do navegador na mesma porta.

Validação automatizada, sem hardware:

```sh
node --test frontend/tests/arduinoSerial.test.js
npm --prefix frontend run build
```

Antes de publicar, valide com o Arduino real: velocidade correta, leitura dos
sensores, desconexão/reconexão e remoção do cabo. Os testes simulados não
comprovam funcionamento físico.
