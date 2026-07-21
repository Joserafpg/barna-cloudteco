import WebSocket from 'ws';
const URL = 'ws://localhost:3090/ws';
const open = () => new Promise((res, rej) => { const w = new WebSocket(URL); w.on('open', () => res(w)); w.on('error', rej); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const NAMES = ['Carlos', 'María', 'José', 'Ana', 'Pedro', 'Luisa', 'Diego', 'Valentina', 'Juan', 'Rosa',
  'Miguel', 'Carmen', 'Luis', 'Sofía', 'Ramón', 'Elena', 'Francisco', 'Paola', 'Andrés', 'Isabel',
  'Rafael', 'Daniela', 'Gabriel', 'Fernanda', 'Héctor', 'Patricia', 'Manuel', 'Lucía', 'Ángel', 'Yamilet'];

const PASS = ['clave123', 'miamor2024', 'instagram1', 'holahola', 'tequiero', 'password', '123456', 'perrito7',
  'santo2024', 'quisqueya', 'amor4ever', 'bebe123', 'flaka22', 'elmejor', 'reina09'];

const conns = [];
let si = 0, caigo = 0;
for (let i = 0; i < NAMES.length; i++) {
  const name = NAMES[i];
  const w = await open();
  conns.push(w);
  w.send(JSON.stringify({ type: 'join', role: 'student', name }));
  await wait(70);
  // paso 2 (slide 1): ~77% sí
  const v1 = Math.random() < 0.77 ? 'si' : 'no'; if (v1 === 'si') si++;
  w.send(JSON.stringify({ type: 'vote', slide: 1, option: v1 }));
  // paso 7 (slide 6): ~45% caigo
  const v6 = Math.random() < 0.45 ? 'caigo' : 'nocaigo'; if (v6 === 'caigo') caigo++;
  w.send(JSON.stringify({ type: 'vote', slide: 6, option: v6 }));
  // paso 4: login falso capturado
  const user = name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + (i + 1);
  w.send(JSON.stringify({ type: 'capture', user: user + '@correo.com', pass: PASS[i % PASS.length] }));
  // paso 10: cifra su nombre
  w.send(JSON.stringify({ type: 'cipher', name }));
  await wait(40);
}
await wait(600);
console.log(`✅ 30 alumnos: ${si} sí / ${30 - si} no (paso2), ${caigo} caigo / ${30 - caigo} no (paso7), 30 capturas, 30 nombres cifrados`);
process.exit(0);
