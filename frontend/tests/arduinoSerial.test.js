import test from 'node:test';
import assert from 'node:assert/strict';
import { createSerialConnection, parseSensorLine } from '../src/lib/arduinoSerial.js';
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function setup() {
  const events = [];
  let stream;
  let opened = 0, closed = 0, requested = 0;
  const port = {
    async open(options) { opened++; assert.equal(options.baudRate, 9600); this.readable = new ReadableStream({ start(controller) { stream = controller; } }); },
    async close() { assert.equal(this.readable.locked, false); closed++; },
  };
  const owner = createSerialConnection({ async requestPort() { requested++; return port; } }, event => events.push(event));
  return { owner, events, send: text => stream.enqueue(new TextEncoder().encode(text)), fail: () => stream.error(new Error('USB removida')), counts: () => ({ opened, closed, requested }) };
}
test('aceita zero e aliases, rejeita mensagens inválidas sem fabricar valores', () => {
  assert.deepEqual(parseSensorLine('{"gas":0,"vazao":0,"temperatura":22}'), {gas_value:0,flow_value:0,temp_value:22});
  assert.deepEqual(parseSensorLine('{"temp_value":23}'), {temp_value:23});
  for (const line of ['null','[]','{}','{"gas": "98%"}','{"gas":1e999}','<img src=x onerror=alert(1)>']) assert.throws(() => parseSensorLine(line));
});
test('uma porta, linhas fragmentadas, recuperação de erro e reconexão', async () => {
  const s = setup();
  await s.owner.connect(9600); await tick();
  assert.equal(await s.owner.connect(9600), false);
  s.send('{"gas_value":'); s.send('0}\r\ninvalid\n{"temp_value":22}\n'); await tick();
  const lines=s.events.filter(e=>e.line);
  assert.equal(lines.length,3); assert.equal(lines[0].sensors.gas_value,0); assert.ok(lines[1].error); assert.equal(lines[2].sensors.temp_value,22);
  await s.owner.disconnect();
  assert.deepEqual(s.counts(),{opened:1,closed:1,requested:1});
  assert.equal(s.events.at(-1).status,'OFFLINE');
  await s.owner.connect(9600); await tick(); await s.owner.disconnect();
  assert.equal(s.counts().closed,2);
});
test('descarta linha longa até nova quebra e trata remoção física', async () => {
  const s=setup(); await s.owner.connect(9600); await tick();
  s.send('x'.repeat(5000)+'\n{"gas":1}\n'); await tick();
  assert.ok(s.events.some(e=>e.error?.includes('4096')));
  assert.equal(s.events.filter(e=>e.line).length,1);
  s.fail(); await tick();
  assert.equal(s.events.at(-1).status,'OFFLINE'); assert.equal(s.counts().closed,1);
});
test('navegador sem suporte e cancelamento do seletor', async () => {
  const events=[];
  assert.equal(await createSerialConnection(null,e=>events.push(e)).connect(),false);
  const owner=createSerialConnection({requestPort:async()=>{throw Object.assign(new Error(),{name:'NotFoundError'});}},e=>events.push(e));
  await owner.connect(); await tick();
  assert.equal(events.at(-1).status,'OFFLINE'); assert.ok(events.some(e=>e.error?.includes('cancelada')));
});
