import WebSocket from 'ws';
const URL = 'ws://localhost:3090/ws';
const log = (who, m) => console.log(`[${who}]`, JSON.stringify(m));
const open = () => new Promise((res) => { const w = new WebSocket(URL); w.on('open', () => res(w)); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const results = { studentGotSlide: null, presenterSawStudent: false, studentGotPoll: null, presenterGotCapture: false };

const pres = await open();
pres.on('message', (d) => {
  const m = JSON.parse(d);
  if (m.type === 'roster' && m.students?.some((s) => s.name === 'Ana')) results.presenterSawStudent = true;
  if (m.type === 'captures' && m.list?.some((c) => c.pass === 'clave123')) results.presenterGotCapture = true;
});
pres.send(JSON.stringify({ type: 'join', role: 'presenter', key: 'barna2026' }));
await wait(200);

const stu = await open();
stu.on('message', (d) => {
  const m = JSON.parse(d);
  if (m.type === 'state') results.studentGotSlide = m.slide;
  if (m.type === 'poll') results.studentGotPoll = m;
});
stu.send(JSON.stringify({ type: 'join', role: 'student', name: 'Ana' }));
await wait(300);

// presentador avanza al paso 3
pres.send(JSON.stringify({ type: 'goto', slide: 3 }));
await wait(300);

// alumno vota en el paso 1
stu.send(JSON.stringify({ type: 'vote', slide: 1, option: 'si' }));
await wait(200);

// alumno "cae" en el login falso
stu.send(JSON.stringify({ type: 'capture', user: 'ana@correo.com', pass: 'clave123' }));
await wait(300);

console.log('\n=== RESULTADOS ===');
console.log('Alumno recibió slide del presentador (esperado 3):', results.studentGotSlide);
console.log('Presentador vio al alumno en roster:', results.presenterSawStudent);
console.log('Alumno recibió conteo de encuesta:', results.studentGotPoll?.counts);
console.log('Presentador recibió captura del login falso:', results.presenterGotCapture);
const ok = results.studentGotSlide === 3 && results.presenterSawStudent && results.presenterGotCapture && results.studentGotPoll?.counts?.si === 1;
console.log('\n' + (ok ? '✅ SINCRONIZACIÓN OK' : '❌ ALGO FALLÓ'));
pres.close(); stu.close();
process.exit(ok ? 0 : 1);
