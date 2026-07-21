import WebSocket from 'ws';
const URL = 'ws://localhost:3090/ws';
const open = () => new Promise((res) => { const w = new WebSocket(URL); w.on('open', () => res(w)); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// 5 alumnos: 4 dicen "sí", 1 dice "no"
const votes = ['si', 'si', 'si', 'si', 'no'];
const names = ['Carlos', 'María', 'Pedro', 'Luisa', 'Diego'];
for (let i = 0; i < votes.length; i++) {
  const w = await open();
  w.send(JSON.stringify({ type: 'join', role: 'student', name: names[i] }));
  await wait(120);
  w.send(JSON.stringify({ type: 'vote', slide: 1, option: votes[i] }));
  await wait(120);
}
await wait(300);
console.log('✅ votos enviados (4 sí, 1 no) al paso 1');
process.exit(0);
