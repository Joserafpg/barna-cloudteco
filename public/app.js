/* ===========================================================
   Barna · Ciberseguridad — cliente (alumno + presentador)
   Un solo archivo sirve las dos vistas: /admin = presentador.
   Iconos SVG inline (sin emojis).
   =========================================================== */
(() => {
  'use strict';

  const IS_PRESENTER = /^\/(admin|p)\b/.test(location.pathname);
  const app = document.getElementById('app');
  const LS = window.localStorage;

  // ---------- iconos SVG (line, stroke currentColor) ----------
  const ICONS = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldAlert: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    lockOpen: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    alertTriangle: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.3-8.3"/><path d="m16 5 3 3"/><path d="m18.5 2.5 3 3"/>',
    fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.5-.5 3-1 4"/><path d="M8 14a10 10 0 0 1 .5-8"/><path d="M12 2a10 10 0 0 1 10 10c0 3-1 5-1 5"/><path d="M12 6a6 6 0 0 1 6 6c0 2 0 4-.5 5.5"/><path d="M14 13.5c0 3-1 5.5-1.5 6.5"/>',
    wifi: '<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M12 20h.01"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    atSign: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  };
  function icon(name, opts = {}) {
    const size = opts.size || 24, sw = opts.sw || 1.9, cls = opts.cls || '';
    return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  // metadatos de cada paso (título para la barra del presentador)
  const SLIDES = [
    { t: 'Ingreso' },                    // 0  · Paso 1
    { t: '¿Te han hackeado?' },          // 1  · Paso 2
    { t: 'Instagram' },                  // 2  · Paso 3
    { t: 'Mi primer hackeo' },           // 3  · Paso 4
    { t: 'El reveal' },                  // 4  · Paso 5
    { t: 'Valida la URL' },              // 5  · Paso 6
    { t: '¿Caes o no caes?' },           // 6  · Paso 7
    { t: 'Cómo blindarte' },             // 7  · Paso 8
    { t: 'Laboratorio de claves' },      // 8  · Paso 9
    { t: 'Cifrado de nombres' },         // 9  · Paso 10
    { t: 'Hash real' },                  // 10 · Paso 11
    { t: 'Cierre + quiz' },              // 11 · Paso 12
  ];
  const SLIDE_COUNT = SLIDES.length;

  // configuración de encuestas por paso
  const POLLS = {
    1: {
      q: '¿A ti o a alguien cercano lo han hackeado o estafado?',
      options: [
        { k: 'si', label: 'Sí', color: '#e5484d', soft: '#f8ccce', icon: 'alertTriangle' },
        { k: 'no', label: 'No', color: '#12885c', soft: '#c6ecda', icon: 'shieldCheck' },
      ],
    },
  };

  // ---------- estado del cliente ----------
  const me = { role: IS_PRESENTER ? 'presenter' : 'student', id: null, name: null, key: null };
  const S = { slide: 0, unlocked: false, count: 0 };
  let view = 0;
  let hackShown = false;
  const myVotes = {}; // slide -> opción elegida por este alumno
  const cache = { polls: {}, captures: [], roster: [], ciphers: [], ranking: [] };

  let ws = null;
  let wsReady = false;

  // ---------- WebSocket ----------
  function wsUrl() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${location.host}/ws`;
  }
  function connect() {
    ws = new WebSocket(wsUrl());
    ws.onopen = () => { wsReady = true; doJoin(); };
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch { /* noop */ } };
    ws.onclose = () => { wsReady = false; setTimeout(connect, 1500); };
    ws.onerror = () => { try { ws.close(); } catch { /* noop */ } };
  }
  function sendWs(obj) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); }

  function doJoin() {
    if (me.role === 'presenter') sendWs({ type: 'join', role: 'presenter', key: me.key });
    else if (me.id) sendWs({ type: 'rejoin', id: me.id, name: me.name });
    else sendWs({ type: 'join', role: 'student', name: me.name });
  }

  function onMessage(m) {
    switch (m.type) {
      case 'joined':
        me.id = m.id; me.name = m.name;
        LS.setItem('barna_id', m.id); LS.setItem('barna_name', m.name);
        break;
      case 'state':
        S.slide = m.slide ?? S.slide; S.unlocked = !!m.unlocked;
        if (typeof m.count === 'number') S.count = m.count;
        onServerSlide();
        break;
      case 'roster': S.count = m.count; cache.roster = m.students || []; break;
      case 'poll':
        cache.polls[m.slide] = { counts: m.counts || {}, total: m.total || 0 };
        if (updatePollLive(m.slide)) return; // actualiza en sitio, sin reconstruir
        break;
      case 'captures': cache.captures = m.list || []; break;
      case 'ciphers': cache.ciphers = m.list || []; break;
      case 'quiz_ranking': cache.ranking = m.ranking || []; break;
      default: break;
    }
    // el presentador refleja todo en vivo; el alumno solo re-renderiza al cambiar de paso
    // (así no se le borra lo que esté escribiendo con mensajes de fondo)
    if (me.role === 'presenter' || m.type === 'state' || m.type === 'joined') render();
  }

  function onServerSlide() {
    if (me.role === 'student') {
      const min = S.unlocked ? 0 : Math.max(0, S.slide - 1);
      const max = S.unlocked ? SLIDE_COUNT - 1 : S.slide;
      view = Math.max(min, Math.min(max, S.slide));
      sendWs({ type: 'at_slide', slide: view });
    }
  }

  // ===========================================================
  //  RENDER PRINCIPAL
  // ===========================================================
  function render() {
    if (me.role === 'presenter') return renderPresenter();
    return renderStudent();
  }

  // ---------- ALUMNO ----------
  function renderStudent() {
    if (!me.name) return renderNameGate();
    if (!hackShown) return; // la animación del susto se dispara aparte
    app.innerHTML = '';
    const wrap = el('div', 'center-screen');
    const slideFn = STUDENT_SLIDES[view] || studentStub;
    slideFn(wrap);
    app.appendChild(wrap);
    // logo fijo en la esquina superior
    const top = el('div', 'stu-top');
    top.innerHTML = `<img class="logo-navy" src="/assets/barna-blanco.webp" alt="Barna" />`;
    app.appendChild(top);
  }

  function renderNameGate() {
    app.innerHTML = '';
    const c = el('div', 'center-screen join');
    c.innerHTML = `
      <div class="icon-chip navy" style="width:64px;height:64px;border-radius:18px">${icon('shield', { size: 32 })}</div>
      <div class="kicker">Clase de ciberseguridad</div>
      <h1>¿Cómo te llamas?</h1>
      <p class="sub">Escribe tu nombre para entrar a la clase.</p>
      <input class="field" id="nm" maxlength="24" placeholder="Tu nombre" autocomplete="off" />
      <button class="btn" id="go">Entrar ${icon('arrowRight', { size: 20 })}</button>
    `;
    app.appendChild(c);
    const input = c.querySelector('#nm');
    input.focus();
    const submit = () => {
      const v = input.value.trim();
      if (!v) { input.focus(); return; }
      me.name = v; connect(); startHack();
    };
    c.querySelector('#go').onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  }

  // ---------- el susto ----------
  function startHack() {
    app.innerHTML = '';
    const scr = el('div', 'hack');
    scr.innerHTML = `
      <div class="hack-card shake">
        <div class="big-alert">${icon('shieldAlert', { size: 58, sw: 1.7 })}</div>
        <div class="warn">ESTÁS SIENDO HACKEADO</div>
        <div class="term" id="term"></div>
        <div class="bar"><i id="bar"></i></div>
      </div>
    `;
    app.appendChild(scr);
    if (navigator.vibrate) navigator.vibrate([120, 60, 120, 60, 250]);

    const lines = [
      `&gt; objetivo: ${escapeHtml(me.name)}`,
      '&gt; accediendo a @instagram ...',
      '&gt; descargando fotos ...',
      '&gt; leyendo mensajes privados ...',
      '&gt; robando contraseñas ...',
      '&gt; <span class="bad">acceso total conseguido</span>',
    ];
    const term = scr.querySelector('#term');
    const bar = scr.querySelector('#bar');
    let i = 0;
    const tick = () => {
      if (i < lines.length) {
        term.innerHTML += lines[i] + '<br>';
        bar.style.transition = 'width 0.4s';
        bar.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
        i++;
        setTimeout(tick, 620);
      } else {
        setTimeout(revealGotcha, 700);
      }
    };
    setTimeout(tick, 400);
  }

  function revealGotcha() {
    const g = el('div', 'gotcha');
    g.innerHTML = `
      <div class="icon-chip green" style="width:78px;height:78px;border-radius:22px">${icon('shieldCheck', { size: 42 })}</div>
      <h2>Era broma</h2>
      <p>Respira... no te hackeamos. Pero por <b>5 segundos</b> te asustaste, ¿verdad?<br><br>De eso se trata la clase. Ahora mira la pantalla grande.</p>
    `;
    app.appendChild(g);
    requestAnimationFrame(() => g.classList.add('show'));
    if (navigator.vibrate) navigator.vibrate(60);
    setTimeout(() => { hackShown = true; onServerSlide(); render(); }, 4200);
  }

  function studentWait(wrap, title, subtitle) {
    wrap.classList.add('wait');
    wrap.innerHTML = `
      <img class="logo-top logo-navy" src="/assets/barna-blanco.webp" alt="Barna" />
      <div class="pulse-dot"></div>
      <h2>${title || 'Mira la pantalla grande'}</h2>
      <p>${subtitle || 'Jose va guiando la clase.'}</p>
    `;
  }
  function studentStub(wrap) {
    studentWait(wrap, SLIDES[view]?.t || 'Siguiente', 'Este paso lo estamos construyendo.');
  }

  // ---------- PASO 2 · encuesta en vivo (misma vista para alumno y profe) ----------
  function pollView(container, slide) {
    const cfg = POLLS[slide];
    const data = cache.polls[slide] || { counts: {}, total: 0 };
    const total = data.total || 0;
    const isStudent = me.role === 'student';
    const mine = myVotes[slide];
    const tiles = cfg.options.map((o) => {
      const c = data.counts[o.k] || 0;
      const pct = total ? Math.round((c / total) * 100) : 0;
      return `
        <button class="choice ${isStudent ? 'tap' : 'display'} ${mine === o.k ? 'mine' : ''}" data-k="${o.k}" style="--c:${o.color};--cs:${o.soft}">
          <span class="fill" data-pct="${pct}"></span>
          <span class="content">
            <span class="ic-wrap">${icon(o.icon, { size: 38, sw: 1.7 })}</span>
            <span class="big">${o.label}</span>
            <span class="pct">${pct}%</span>
            <span class="cnt">${c} ${c === 1 ? 'voto' : 'votos'}</span>
          </span>
        </button>`;
    }).join('');
    const foot = isStudent
      ? (mine
          ? `<span class="ok">${icon('check', { size: 16 })} Tu respuesta quedó registrada</span>`
          : 'Toca tu respuesta')
      : `${total} ${total === 1 ? 'voto' : 'votos'} en total`;
    container.innerHTML = `
      <div class="slide poll" data-slide="${slide}">
        <div class="kicker">${icon('users', { size: 14 })} Encuesta en vivo</div>
        <h2 class="q">${cfg.q}</h2>
        <div class="poll-choices">${tiles}</div>
        <div class="poll-foot">${foot}</div>
      </div>`;
    requestAnimationFrame(() => {
      container.querySelectorAll('.fill').forEach((f) => { f.style.transform = 'scaleY(' + (f.dataset.pct || 0) / 100 + ')'; });
    });
    if (isStudent) {
      container.querySelectorAll('.choice.tap').forEach((b) => {
        b.onclick = () => { const k = b.dataset.k; myVotes[slide] = k; sendWs({ type: 'vote', slide, option: k }); render(); };
      });
    }
  }

  // actualiza los tiles de la encuesta en sitio (sin reconstruir, para que crezcan suave)
  function updatePollLive(slide) {
    const host = document.querySelector('.poll[data-slide="' + slide + '"]');
    if (!host) return false;
    const cfg = POLLS[slide]; if (!cfg) return false;
    const data = cache.polls[slide] || { counts: {}, total: 0 };
    const total = data.total || 0;
    cfg.options.forEach((o) => {
      const c = data.counts[o.k] || 0;
      const pct = total ? Math.round((c / total) * 100) : 0;
      const btn = host.querySelector('.choice[data-k="' + o.k + '"]');
      if (!btn) return;
      btn.querySelector('.fill').style.transform = 'scaleY(' + pct / 100 + ')';
      btn.querySelector('.pct').textContent = pct + '%';
      btn.querySelector('.cnt').textContent = c + ' ' + (c === 1 ? 'voto' : 'votos');
    });
    if (me.role === 'presenter') {
      const foot = host.querySelector('.poll-foot');
      if (foot) foot.textContent = total + ' ' + (total === 1 ? 'voto' : 'votos') + ' en total';
    }
    return true;
  }

  const STUDENT_SLIDES = {
    0: (w) => studentWait(w, '¡Ya estás dentro!', 'Espera a que empecemos.'),
    1: (w) => pollView(w, 1),
  };

  // ===========================================================
  //  PRESENTADOR
  // ===========================================================
  function renderPresenter() {
    if (!me.key) return renderKeyGate();
    app.innerHTML = '';
    const pres = el('div', 'pres');

    const stage = el('div', 'pres-stage');
    (PRESENTER_SLIDES[S.slide] || presenterStub)(stage);
    pres.appendChild(stage);

    // HUD flotante (no una barra separada)
    const hudLogo = el('div', 'hud hud-logo');
    hudLogo.innerHTML = `<img class="logo-navy" src="/assets/barna-blanco.webp" alt="Barna" />`;
    const hudCount = el('div', 'hud hud-count');
    hudCount.innerHTML = `${icon('users', { size: 15 })} ${S.count}`;
    const hudCtrl = el('div', 'hud hud-ctrl');
    hudCtrl.innerHTML = `
      <button class="round" id="prev">${icon('chevronLeft', { size: 18 })}</button>
      <span class="step">Paso ${S.slide + 1}/${SLIDE_COUNT} · ${SLIDES[S.slide]?.t || ''}</span>
      <button class="primary" id="next">Siguiente ${icon('chevronRight', { size: 18 })}</button>
      <span class="sep"></span>
      <button id="unlock">${S.unlocked ? icon('lock', { size: 16 }) + ' Bloquear' : icon('lockOpen', { size: 16 }) + ' Liberar'}</button>
    `;
    pres.append(hudLogo, hudCount, hudCtrl);
    app.appendChild(pres);

    hudCtrl.querySelector('#prev').onclick = () => gotoSlide(S.slide - 1);
    hudCtrl.querySelector('#next').onclick = () => gotoSlide(S.slide + 1);
    hudCtrl.querySelector('#unlock').onclick = () => sendWs({ type: 'unlock', value: !S.unlocked });

    document.onkeydown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') gotoSlide(S.slide + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') gotoSlide(S.slide - 1);
    };
  }

  function gotoSlide(n) { sendWs({ type: 'goto', slide: Math.max(0, Math.min(SLIDE_COUNT - 1, n)) }); }

  function renderKeyGate() {
    app.innerHTML = '';
    const c = el('div', 'center-screen join');
    c.innerHTML = `
      <div class="icon-chip navy" style="width:64px;height:64px;border-radius:18px">${icon('lock', { size: 30 })}</div>
      <div class="kicker">Modo presentador</div>
      <h1>Clave de acceso</h1>
      <input class="field" id="k" type="password" placeholder="Clave" autocomplete="off" />
      <button class="btn navy" id="go">Entrar ${icon('arrowRight', { size: 20 })}</button>
    `;
    app.appendChild(c);
    const input = c.querySelector('#k');
    input.focus();
    const submit = () => { me.key = input.value; connect(); render(); };
    c.querySelector('#go').onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  }

  // ---- inicio: nombres de la gente entrando, flotando hacia arriba ----
  let joinOverlay = null, joinGuard = null;
  const joinSeen = new Set();
  function ensureJoinOverlay() {
    if (!joinOverlay) { joinOverlay = el('div', 'join-float'); document.body.appendChild(joinOverlay); }
    if (!joinGuard) joinGuard = setInterval(() => { if (S.slide !== 0) teardownJoinFloat(); }, 400);
  }
  function teardownJoinFloat() {
    if (joinGuard) { clearInterval(joinGuard); joinGuard = null; }
    if (joinOverlay) { joinOverlay.remove(); joinOverlay = null; }
    joinSeen.clear();
  }
  function spawnJoinName(s) {
    if (!joinOverlay) return;
    const card = el('div', 'join-chip');
    const dur = 10 + Math.random() * 5;
    card.style.left = (5 + Math.random() * 82) + '%';
    card.style.setProperty('--drift', Math.round((Math.random() - 0.5) * 150) + 'px');
    card.style.animationDuration = dur.toFixed(1) + 's';
    card.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
    card.innerHTML = `${icon('checkCircle', { size: 16 })}<span>${escapeHtml(s.name)}</span>`;
    joinOverlay.appendChild(card);
  }

  function presenterJoinQR(stage) {
    const url = `${location.origin}/`;
    const n = cache.roster.length;
    stage.innerHTML = `
      <div class="qr-wrap">
        <div class="qr-side">
          <div class="kicker">${icon('scan', { size: 14 })} Escanea para entrar</div>
          <h1>Bienvenidos a<br><span class="hl">Ciberseguridad</span></h1>
          <p class="lead">Apunta la cámara de tu celular al código y entra a la clase.</p>
          <div class="join-count">${icon('users', { size: 16 })} ${n ? `${n} ${n === 1 ? 'persona ya entró' : 'personas ya entraron'}` : 'Esperando a que entren…'}</div>
        </div>
        <div class="qr-col">
          <div class="qr-card" id="qr"></div>
          <div class="url">${icon('wifi', { size: 16 })} ${url.replace(/^https?:\/\//, '')}</div>
        </div>
      </div>
    `;
    fetch('/api/qr').then((r) => r.text()).then((svg) => {
      const qr = stage.querySelector('#qr'); if (qr) qr.innerHTML = svg;
    }).catch(() => {});
    // nombres flotando hacia arriba (gente entrando)
    ensureJoinOverlay();
    cache.roster.forEach((s) => { if (!joinSeen.has(s.id)) { joinSeen.add(s.id); spawnJoinName(s); } });
  }

  function presenterStub(stage) {
    stage.innerHTML = `
      <div class="stub">
        <div class="n">PASO ${S.slide + 1} / ${SLIDE_COUNT}</div>
        <h2>${SLIDES[S.slide]?.t || ''}</h2>
        <p>Construyendo este paso…</p>
      </div>
    `;
  }

  const PRESENTER_SLIDES = {
    0: presenterJoinQR,
    1: (s) => pollView(s, 1),
  };

  // ---------- utilidades ----------
  function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- carga de módulos de pasos (public/slides/pasoN.js) ----------
  // cada módulo se registra en window.BARNA_SLIDES[n] = { student(container, ctx), presenter(container, ctx), css }
  const ctx = {
    icon, escapeHtml, el, sendWs, render,
    me, S, cache, myVotes, POLLS,
    get view() { return view; },
    get role() { return me.role; },
  };
  function injectCss(css, id) {
    const sid = 'css-' + id;
    let s = document.getElementById(sid);
    if (!s) { s = document.createElement('style'); s.id = sid; document.head.appendChild(s); }
    s.textContent = css;
  }
  function loadSlideModules() {
    if (!window.BARNA_SLIDES) return;
    for (const [n, mod] of Object.entries(window.BARNA_SLIDES)) {
      const i = Number(n);
      if (mod.student) STUDENT_SLIDES[i] = (w) => mod.student(w, ctx);
      if (mod.presenter) PRESENTER_SLIDES[i] = (s) => mod.presenter(s, ctx);
      if (mod.css) injectCss(mod.css, 'slide-' + i);
    }
  }

  function boot() {
    loadSlideModules();
    if (me.role === 'presenter') {
      const k = new URLSearchParams(location.search).get('k');
      if (k) { me.key = k; connect(); }
      render();
    } else {
      const id = LS.getItem('barna_id'), nm = LS.getItem('barna_name');
      if (id && nm) { me.id = id; me.name = nm; hackShown = true; connect(); }
      render();
    }
  }
  boot();
})();
