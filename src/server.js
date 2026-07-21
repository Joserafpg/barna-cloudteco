import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

/**
 * barna.cloudteco.com — clase interactiva de ciberseguridad.
 * Un solo proceso: sirve la SPA y sincroniza por WebSocket.
 *
 *  - El PRESENTADOR (la laptop de Jose) controla en qué paso está la clase.
 *  - Los ALUMNOS (celulares) siguen automáticamente. Pueden ir 1 paso atrás,
 *    nunca adelantarse. Al final el presentador "libera" y navegan libre.
 *  - Los datos interactivos (encuestas, captura del login falso, juego de
 *    cifrado, quiz) viajan del celular a la laptop en vivo.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');

const PORT = process.env.PORT || 3090;
// clave del presentador — entra por barna.cloudteco.com/p?k=CLAVE
const PRESENTER_KEY = process.env.PRESENTER_KEY || 'barna2026';

const SLIDE_COUNT = 12; // los 12 pasos de la clase (0 = portada/QR + susto)

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- estado en memoria de la clase ----------
const state = {
  slide: 0,
  unlocked: false,
  students: new Map(), // id -> {id, name, slide, ws, at}
  polls: new Map(), // slide -> Map(option -> Set(studentId))
  captures: [], // login falso: {id, name, user, pass, at}
  ciphers: new Map(), // studentId -> {name, encoded}
  quiz: { answers: new Map(), order: [] }, // studentId -> Map(q -> {choice, correct, ms})
  commitments: new Map(), // studentId -> [a,b,c]
};

// persistencia ligera de compromisos (lo único que vale la pena guardar)
const COMMIT_FILE = path.join(DATA_DIR, 'commitments.json');
function saveCommitments() {
  try {
    const obj = {};
    for (const [id, items] of state.commitments) {
      const s = state.students.get(id);
      obj[id] = { name: s?.name || '?', items, at: new Date().toISOString() };
    }
    const tmp = `${COMMIT_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, COMMIT_FILE);
  } catch (err) {
    console.error('no se pudo guardar compromisos:', err.message);
  }
}

// ---------- helpers de cifrado para el juego de nombres (A=01) ----------
function encodeName(name) {
  return [...name.toUpperCase()]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) return String(code - 64).padStart(2, '0');
      if (ch === ' ') return '·';
      return ch; // números, acentos, símbolos quedan igual
    })
    .join(name.includes(' ') ? ' ' : '-');
}

// ---------- app HTTP ----------
const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '32kb' }));
app.use(express.static(PUBLIC_DIR, { index: false }));

const baseUrl = (req) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${proto}://${req.headers.host}`;
};

// portada: alumno por defecto; presentador entra por /admin
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get(['/admin', '/p'], (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// QR que apunta a la URL pública para que entren los alumnos
app.get('/api/qr', async (req, res) => {
  try {
    const url = baseUrl(req);
    const svg = await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      color: { dark: '#0b1220', light: '#ffffff' },
    });
    res.type('svg').send(svg);
  } catch (err) {
    res.status(500).send('qr error');
  }
});

// endpoint informativo (por si el presentador quiere el link a mano)
app.get('/api/join-url', (req, res) => res.json({ url: baseUrl(req) }));

const server = http.createServer(app);

// ---------- WebSocket: sincronización en vivo ----------
const wss = new WebSocketServer({ server, path: '/ws' });

function send(ws, obj) {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}
function broadcast(obj, filter) {
  const msg = JSON.stringify(obj);
  for (const s of state.students.values()) {
    if (filter && !filter(s)) continue;
    if (s.ws && s.ws.readyState === s.ws.OPEN) s.ws.send(msg);
  }
  for (const p of presenters) if (p.readyState === p.OPEN) p.send(msg);
}

const presenters = new Set();

// resúmenes que se envían a las pantallas
function rosterPayload() {
  return {
    type: 'roster',
    count: state.students.size,
    students: [...state.students.values()].map((s) => ({ id: s.id, name: s.name, slide: s.slide })),
  };
}
function pollPayload(slide) {
  const p = state.polls.get(slide);
  const counts = {};
  let total = 0;
  if (p) for (const [opt, voters] of p) { counts[opt] = voters.size; total += voters.size; }
  return { type: 'poll', slide, counts, total };
}
function capturesPayload() {
  return { type: 'captures', list: state.captures };
}
function ciphersPayload() {
  return {
    type: 'ciphers',
    list: [...state.ciphers.entries()].map(([id, v]) => ({ id, name: v.name, encoded: v.encoded })),
  };
}
function quizRanking() {
  const rows = [];
  for (const [id, answers] of state.quiz.answers) {
    const s = state.students.get(id);
    let points = 0;
    for (const a of answers.values()) if (a.correct) points += a.points || 0;
    rows.push({ id, name: s?.name || '—', points, answered: answers.size });
  }
  rows.sort((a, b) => b.points - a.points);
  return { type: 'quiz_ranking', ranking: rows };
}

function pushState(ws, who) {
  send(ws, {
    type: 'state',
    slide: state.slide,
    unlocked: state.unlocked,
    count: state.students.size,
    you: who,
  });
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
  let role = null;
  let studentId = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // ---- ingreso ----
    if (msg.type === 'join') {
      if (msg.role === 'presenter' && msg.key === PRESENTER_KEY) {
        role = 'presenter';
        presenters.add(ws);
        pushState(ws, { role: 'presenter' });
        send(ws, rosterPayload());
        send(ws, capturesPayload());
        send(ws, ciphersPayload());
        send(ws, quizRanking());
        for (let i = 0; i < SLIDE_COUNT; i++) if (state.polls.get(i)) send(ws, pollPayload(i));
        return;
      }
      // alumno
      role = 'student';
      studentId = crypto.randomBytes(8).toString('hex');
      const name = String(msg.name || 'Anónimo').trim().slice(0, 24) || 'Anónimo';
      state.students.set(studentId, { id: studentId, name, slide: state.slide, ws, at: Date.now() });
      send(ws, { type: 'joined', id: studentId, name });
      pushState(ws, { role: 'student', id: studentId, name });
      broadcast(rosterPayload(), () => false); // solo a presentadores vía broadcast
      return;
    }

    // ---- reconexión de alumno (mantiene su id/nombre) ----
    if (msg.type === 'rejoin' && msg.id) {
      role = 'student';
      studentId = String(msg.id);
      const name = String(msg.name || 'Anónimo').trim().slice(0, 24) || 'Anónimo';
      const prev = state.students.get(studentId);
      state.students.set(studentId, {
        id: studentId, name, slide: prev?.slide ?? state.slide, ws, at: Date.now(),
      });
      send(ws, { type: 'joined', id: studentId, name });
      pushState(ws, { role: 'student', id: studentId, name });
      broadcast(rosterPayload(), () => false);
      return;
    }

    // ---- el alumno reporta en qué paso está mirando (para el roster) ----
    if (role === 'student' && msg.type === 'at_slide') {
      const s = state.students.get(studentId);
      if (s) { s.slide = Math.max(0, Math.min(SLIDE_COUNT - 1, msg.slide | 0)); broadcast(rosterPayload(), () => false); }
      return;
    }

    // ---- controles del presentador ----
    if (role === 'presenter') {
      if (msg.type === 'goto') {
        state.slide = Math.max(0, Math.min(SLIDE_COUNT - 1, msg.slide | 0));
        broadcast({ type: 'state', slide: state.slide, unlocked: state.unlocked, count: state.students.size });
        return;
      }
      if (msg.type === 'unlock') {
        state.unlocked = !!msg.value;
        broadcast({ type: 'state', slide: state.slide, unlocked: state.unlocked, count: state.students.size });
        return;
      }
      if (msg.type === 'reset_slide') {
        const slide = msg.slide | 0;
        state.polls.delete(slide);
        if (msg.slide === 'captures' || msg.what === 'captures') { /* handled below */ }
        broadcast(pollPayload(slide));
        return;
      }
      if (msg.type === 'reset_captures') {
        state.captures = [];
        broadcast(capturesPayload());
        return;
      }
      if (msg.type === 'quiz_start') {
        state.quiz.answers.clear();
        broadcast({ type: 'quiz_go', q: msg.q | 0 });
        broadcast(quizRanking());
        return;
      }
      return;
    }

    // ---- interacciones del alumno ----
    if (role !== 'student') return;

    if (msg.type === 'vote') {
      const slide = msg.slide | 0;
      const opt = String(msg.option).slice(0, 40);
      if (!state.polls.has(slide)) state.polls.set(slide, new Map());
      const poll = state.polls.get(slide);
      // un voto por alumno: quita votos previos en este slide
      for (const voters of poll.values()) voters.delete(studentId);
      if (!poll.has(opt)) poll.set(opt, new Set());
      poll.get(opt).add(studentId);
      broadcast(pollPayload(slide));
      return;
    }

    if (msg.type === 'capture') {
      const s = state.students.get(studentId);
      state.captures.push({
        id: studentId,
        name: s?.name || 'Anónimo',
        user: String(msg.user || '').slice(0, 60),
        pass: String(msg.pass || '').slice(0, 60),
        at: Date.now(),
      });
      if (state.captures.length > 100) state.captures.shift();
      broadcast(capturesPayload(), () => false); // solo presentadores
      return;
    }

    if (msg.type === 'cipher') {
      const s = state.students.get(studentId);
      const name = String(msg.name || s?.name || '').trim().slice(0, 24);
      if (name) {
        state.ciphers.set(studentId, { name, encoded: encodeName(name) });
        broadcast(ciphersPayload());
      }
      return;
    }

    if (msg.type === 'quiz_answer') {
      if (!state.quiz.answers.has(studentId)) state.quiz.answers.set(studentId, new Map());
      const a = state.quiz.answers.get(studentId);
      const q = msg.q | 0;
      if (!a.has(q)) {
        // puntos por acertar + bono por rapidez (máx 1000)
        const correct = !!msg.correct;
        const points = correct ? Math.max(500, 1000 - Math.min(500, (msg.ms | 0) / 20)) | 0 : 0;
        a.set(q, { choice: msg.choice, correct, points, ms: msg.ms | 0 });
        broadcast(quizRanking());
      }
      return;
    }

    if (msg.type === 'commitments') {
      const items = Array.isArray(msg.items) ? msg.items.slice(0, 3).map((x) => String(x).slice(0, 120)) : [];
      state.commitments.set(studentId, items);
      saveCommitments();
      return;
    }
  });

  ws.on('close', () => {
    if (role === 'presenter') presenters.delete(ws);
    if (role === 'student' && studentId) {
      // no lo borramos de inmediato (puede reconectar); solo soltamos el ws
      const s = state.students.get(studentId);
      if (s) s.ws = null;
      broadcast(rosterPayload(), () => false);
    }
  });
});

// heartbeat: limpia conexiones muertas
const beat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    try { ws.ping(); } catch { /* noop */ }
  });
}, 30000);
beat.unref?.();

process.on('uncaughtException', (err) => console.error('💥 [uncaughtException]', err));
process.on('unhandledRejection', (r) => console.error('💥 [unhandledRejection]', r));

server.listen(PORT, () => {
  console.log(`✅ Barna Ciberseguridad en http://localhost:${PORT}`);
  console.log(`   Alumnos:     http://localhost:${PORT}/`);
  console.log(`   Presentador: http://localhost:${PORT}/admin  (clave: ${PRESENTER_KEY})`);
});
