/* ===========================================================
   Barna · Ciberseguridad — Paso 9 · "Laboratorio de claves"
   Laboratorio de fuerza bruta. TODO se calcula localmente en
   el celular: NADA sale del teléfono ni se manda al servidor.
   Se registra en window.BARNA_SLIDES[8].
   =========================================================== */
(() => {
  'use strict';

  // ---------- estado del módulo (persiste entre renders) ----------
  let animId = null;   // RAF de la animación del alumno
  let presId = null;   // RAF del contador demo del presentador

  // ---------- matemática de la fuerza bruta ----------
  const YEAR = 60 * 60 * 24 * 365.25; // ≈ 31.557.600 s
  const RATE = 1e10;                   // 10 mil millones de intentos/seg (un GPU)

  // tamaño del alfabeto según lo que use la contraseña
  function alphabetSize(pw) {
    let a = 0;
    if (/[0-9]/.test(pw)) a += 10;
    if (/[a-z]/.test(pw)) a += 26;
    if (/[A-Z]/.test(pw)) a += 26;
    if (/[^A-Za-z0-9]/.test(pw)) a += 33;
    return a || 1;
  }

  // segundos para romperla por fuerza bruta = alfabeto^longitud / intentos_por_seg
  function crackSeconds(pw) {
    if (!pw) return 0;
    const combos = Math.pow(alphabetSize(pw), pw.length);
    return combos / RATE;
  }

  function unit(n, sing, plur) {
    n = Math.round(n);
    return n + ' ' + (n === 1 ? sing : plur);
  }

  // formatea segundos a lenguaje humano (con cuidado de no desbordar)
  function humanTime(s) {
    if (!isFinite(s)) return 'más que la edad del universo';
    if (s < 1) return 'instantáneo';
    if (s < 60) return unit(s, 'segundo', 'segundos');
    if (s < 3600) return unit(s / 60, 'minuto', 'minutos');
    if (s < 86400) return unit(s / 3600, 'hora', 'horas');
    if (s < YEAR) return unit(s / 86400, 'día', 'días');
    const y = s / YEAR;
    if (y < 1000) return unit(y, 'año', 'años');
    if (y < 1e6) return 'miles de años';
    if (y < 1e17) return 'millones de años';
    return 'más que la edad del universo';
  }

  // es "fuerte" cuando tarda al menos un año (se muestra en años/miles/millones)
  function isStrong(s) { return s >= YEAR; }

  function cancelAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } }
  let presTimer = null;
  let decryptId = null;
  function cancelDecrypt() { if (decryptId) { cancelAnimationFrame(decryptId); decryptId = null; } }
  function cancelPres() {
    if (presId) { cancelAnimationFrame(presId); presId = null; }
    if (presTimer) { clearTimeout(presTimer); presTimer = null; }
    cancelDecrypt();
  }

  // ---------- animaciones del contador (el hacker probando) ----------

  // caso numérico: el contador cuenta 0 -> TU número exacto y "aterriza"
  function animLand(counter, status, pw, secs, ctx) {
    cancelAnim();
    const target = parseInt(pw, 10);
    const len = pw.length;
    const dur = 450 + Math.random() * 650; // 0.45 – 1.1 s
    const t0 = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = Math.floor(e * target);
      counter.textContent = String(val).padStart(len, '0');
      if (t < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        counter.textContent = String(target).padStart(len, '0');
        counter.dataset.state = 'cracked';
        const ht = humanTime(secs);
        status.className = 'paso9-status cracked';
        status.innerHTML = `${ctx.icon('lockOpen', { size: 16 })} <b>¡DESCIFRADA!</b> ${ht === 'instantáneo' ? 'Al instante.' : 'En ' + ht + '.'}`;
        if (navigator.vibrate) navigator.vibrate([40, 30, 80]);
        animId = null;
      }
    };
    animId = requestAnimationFrame(frame);
  }

  // caso NO descifrable: el contador corre rapidísimo y nunca llega
  function animSpin(counter, status, len, strong, secs, ctx) {
    cancelAnim();
    const width = Math.min(8, Math.max(4, len));
    const mod = Math.pow(10, width);
    const dur = 2400;
    const t0 = performance.now();
    let last = 0, n = 0;
    const frame = (now) => {
      const t = (now - t0) / dur;
      if (now - last > 32) { // legible pero veloz
        n += Math.floor(53 + Math.random() * 940);
        counter.textContent = String(n % mod).padStart(width, '0');
        last = now;
      }
      if (t < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        counter.dataset.state = strong ? 'stuck' : 'weak';
        if (strong) {
          status.className = 'paso9-status stuck';
          status.innerHTML = `${ctx.icon('shieldCheck', { size: 16 })} El hacker se rinde: seguiría probando ${humanTime(secs)}`;
        } else {
          status.className = 'paso9-status weak';
          status.innerHTML = `${ctx.icon('alertTriangle', { size: 16 })} Caería en ${humanTime(secs)}. Demasiado poco.`;
        }
        animId = null;
      }
    };
    animId = requestAnimationFrame(frame);
  }

  // pinta el resultado (contador + estado + tarjeta de veredicto) y lanza la animación
  function showResult(pw, stage, ctx) {
    cancelAnim();
    const secs = crackSeconds(pw);
    const strong = isStrong(secs);
    const time = humanTime(secs);
    stage.hidden = false;
    stage.innerHTML = `
      <div class="paso9-counter" data-state="run">0</div>
      <div class="paso9-status">${ctx.icon('scan', { size: 15 })} Probando combinaciones…</div>
      <div class="paso9-verdict ${strong ? 'strong' : 'weak'}">
        <span class="paso9-tag ${strong ? 'strong' : 'weak'}">${ctx.icon(strong ? 'shieldCheck' : 'shieldAlert', { size: 16 })} ${strong ? 'FUERTE' : 'DÉBIL'}</span>
        <span class="paso9-vbody">
          <span class="paso9-vlabel">Un ordenador la rompería en</span>
          <span class="paso9-time">${time}</span>
          <span class="paso9-vsub">${strong
            ? 'Así se ve una buena clave.'
            : 'Añade mayúsculas, números y símbolos.'}</span>
        </span>
      </div>`;
    const counter = stage.querySelector('.paso9-counter');
    const status = stage.querySelector('.paso9-status');
    const numeric = /^[0-9]+$/.test(pw);
    // solo números (y que quepa en pantalla) → cuenta hasta TU número exacto
    if (numeric && pw.length <= 12) animLand(counter, status, pw, secs, ctx);
    else animSpin(counter, status, pw.length, strong, secs, ctx);
  }

  // ---------- ALUMNO ----------
  function student(container, ctx) {
    cancelAnim();
    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${ctx.icon('zap', { size: 14 })} Laboratorio</div>
        <h2 class="q">¿Cuánto aguanta <span class="hl">tu contraseña</span>?</h2>
        <div class="paso9-lab">
          <input class="field paso9-input" id="p9pw" type="text" maxlength="40"
                 placeholder="Escribe una contraseña" autocomplete="off"
                 autocapitalize="off" autocorrect="off" spellcheck="false" />
          <button class="btn paso9-go" id="p9go">${ctx.icon('zap', { size: 20 })} Comprobar</button>
        </div>
        <div class="paso9-stage" id="p9stage" hidden></div>
        <div class="paso9-privacy">${ctx.icon('lock', { size: 13 })} Nada de esto sale de tu teléfono</div>
      </div>`;
    const input = container.querySelector('#p9pw');
    const stage = container.querySelector('#p9stage');
    const run = () => {
      const pw = input.value;
      if (!pw) { input.focus(); return; }
      showResult(pw, stage, ctx);
    };
    container.querySelector('#p9go').onclick = run;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  }

  // ---------- PRESENTADOR ----------
  const TABLE = [
    { pw: '1234', label: 'instantáneo', tier: 'weak' },
    { pw: 'carlos', label: 'segundos', tier: 'weak' },
    { pw: 'Carlos2024', label: 'semanas', tier: 'mid' },
    { pw: 'PerroAzulComeArroz', label: 'MATH ERROR', tier: 'strong' },
  ];

  // efecto "desencriptando": el texto se revuelve y se resuelve al password real
  function decrypt(el, finalText, durMs, done) {
    cancelDecrypt();
    const glyphs = '!<>-_\\/[]{}=+*^?#0123456789ABCDEF@%$&';
    const total = finalText.length;
    const t0 = performance.now();
    const tick = (now) => {
      if (!el.isConnected) { decryptId = null; return; }
      const p = Math.min(1, (now - t0) / durMs);
      const locked = Math.floor(p * total);
      let s = '';
      for (let k = 0; k < total; k++) {
        const ch = finalText[k];
        s += (k < locked || ch === ' ') ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = s;
      if (p < 1) decryptId = requestAnimationFrame(tick);
      else { el.textContent = finalText; decryptId = null; if (done) done(); }
    };
    decryptId = requestAnimationFrame(tick);
  }

  // las claves flotan; de la nada se agarra una → al centro-izquierda,
  // y a la derecha se desencripta hasta revelar su tiempo de crackeo
  function presDemo(root) {
    cancelPres();
    const chips = [...root.querySelectorAll('.paso9-chip')];
    const pool = root.querySelector('#p9pool');
    const focus = root.querySelector('#p9focus');
    const tgt = root.querySelector('#p9tgt');
    const out = root.querySelector('#p9out');
    const timeEl = root.querySelector('#p9time');
    if (!chips.length || !pool || !focus || !tgt || !out || !timeEl) return;
    let i = -1;
    const grab = () => {
      if (!root.isConnected) { presTimer = null; return; }
      cancelDecrypt();
      let n; do { n = Math.floor(Math.random() * chips.length); } while (chips.length > 1 && n === i);
      i = n;
      const chip = chips[i];
      const pw = chip.dataset.pw;
      const tier = chip.dataset.tier;
      const durMs = tier === 'strong' ? 1800 : tier === 'mid' ? 1300 : 850;
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      tgt.textContent = pw;
      timeEl.textContent = '';
      timeEl.className = 'paso9-crack-time';
      pool.classList.add('dim');
      focus.classList.add('on');
      decrypt(out, pw, durMs, () => {
        timeEl.textContent = chip.dataset.time;
        timeEl.className = 'paso9-crack-time ' + tier;
      });
      presTimer = setTimeout(release, 2700);
    };
    const release = () => {
      if (!root.isConnected) { presTimer = null; return; }
      focus.classList.remove('on');
      pool.classList.remove('dim');
      chips.forEach((c) => c.classList.remove('active'));
      presTimer = setTimeout(grab, 1500);
    };
    presTimer = setTimeout(grab, 250); // deferir: la diapositiva aún no está en el DOM
  }

  function presenter(container, ctx) {
    cancelPres();
    const { icon, escapeHtml } = ctx;
    const chips = TABLE.map((r) => `
      <span class="paso9-chip ${r.tier}" data-tier="${r.tier}" data-pw="${escapeHtml(r.pw)}" data-time="${r.label}">${escapeHtml(r.pw)}</span>`).join('');
    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${icon('zap', { size: 14 })} Laboratorio</div>
        <h2 class="q">Así rompe un hacker tu clave: <span class="hl">prueba todo</span> hasta acertar.</h2>
        <div class="paso9-arena">
          <div class="paso9-pool" id="p9pool">${chips}</div>
          <div class="paso9-focus" id="p9focus">
            <div class="paso9-focus-l">
              <span class="paso9-clab">${icon('target', { size: 13 })} Objetivo</span>
              <code class="paso9-target" id="p9tgt"></code>
            </div>
            <span class="paso9-focus-arrow">${icon('arrowRight', { size: 24 })}</span>
            <div class="paso9-focus-r">
              <span class="paso9-clab">${icon('scan', { size: 13 })} Desencriptando…</span>
              <code class="paso9-out" id="p9out"></code>
              <span class="paso9-crack-time" id="p9time"></span>
            </div>
          </div>
        </div>
        <p class="paso9-note big">${icon('key', { size: 16 })} Cada carácter que añades <b>multiplica</b> las combinaciones. Es matemática, no magia.</p>
      </div>`;
    presDemo(container);
  }

  // ---------- CSS del módulo (prefijo paso9-) ----------
  const css = `
    .paso9-privacy {
      display: inline-flex; align-items: center; gap: 6px; align-self: center;
      margin-top: 8px; font-size: 0.8rem; color: var(--muted);
    }
    .paso9-privacy .ic { color: var(--muted); }

    .paso9-lab { display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap; margin-top: 2px; }
    .paso9-input { flex: 1; min-width: 180px; max-width: none; text-align: left; }
    .paso9-go { white-space: nowrap; }

    .paso9-stage { display: flex; flex-direction: column; gap: 16px; margin-top: 6px; }

    .paso9-counter {
      font-family: var(--mono); font-weight: 700;
      font-size: clamp(1.9rem, 10vw, 4.4rem); line-height: 1;
      letter-spacing: 2px; font-variant-numeric: tabular-nums;
      color: var(--navy); text-align: center; white-space: nowrap;
      max-width: 100%; overflow: hidden; padding: 6px 0;
      transition: color 0.25s;
    }
    .paso9-counter.big { font-size: clamp(3rem, 9vw, 6rem); letter-spacing: 5px; }
    .paso9-counter[data-state="cracked"],
    .paso9-counter[data-state="weak"] { color: var(--red); }
    .paso9-counter[data-state="stuck"] { color: var(--green); }

    .paso9-status {
      font-family: var(--display); font-weight: 600; color: var(--muted);
      display: flex; align-items: center; gap: 8px; line-height: 1.35;
    }
    .paso9-status b { font-weight: 700; }
    .paso9-status.cracked, .paso9-status.weak { color: var(--red); }
    .paso9-status.stuck { color: var(--green); }

    .paso9-verdict {
      display: flex; align-items: center; gap: 18px;
      border-radius: 20px; padding: 18px 22px;
      background: var(--surface); box-shadow: var(--shadow-sm);
    }
    .paso9-verdict.weak { background: var(--red-soft); }
    .paso9-verdict.strong { background: var(--green-soft); }
    .paso9-tag {
      display: inline-flex; align-items: center; gap: 7px; flex: none;
      font-family: var(--display); font-weight: 700; font-size: 1rem;
      padding: 8px 14px; border-radius: 999px; color: #fff;
    }
    .paso9-tag .ic { color: rgba(255,255,255,0.9); }
    .paso9-tag.weak { background: var(--red); }
    .paso9-tag.strong { background: var(--green); }
    .paso9-vbody { display: flex; flex-direction: column; gap: 2px; }
    .paso9-vlabel {
      font-family: var(--mono); font-size: 0.7rem; letter-spacing: 1.5px;
      text-transform: uppercase; color: var(--muted); font-weight: 700;
    }
    .paso9-time { font-family: var(--display); font-weight: 700; font-size: 1.7rem; line-height: 1.1; color: var(--navy); }
    .paso9-vsub { color: var(--muted); font-size: 0.9rem; line-height: 1.4; }

    /* arena: pool de claves flotando + foco de captura */
    .paso9-arena { position: relative; min-height: 210px; margin: 10px 0; }
    .paso9-pool { position: absolute; inset: 0; transition: opacity .4s, filter .4s; }
    .paso9-pool.dim { opacity: 0.16; filter: blur(1px); }
    .paso9-chip {
      position: absolute; font-family: var(--mono); font-weight: 700; font-size: 1.05rem;
      color: var(--navy); background: var(--surface); box-shadow: var(--shadow-sm);
      border-radius: 999px; padding: 9px 18px; white-space: nowrap;
    }
    .paso9-chip:nth-child(1) { left: 4%;  top: 14%; animation: paso9Drift 6s ease-in-out infinite; }
    .paso9-chip:nth-child(2) { left: 42%; top: 64%; animation: paso9Drift 7.5s ease-in-out -2s infinite; }
    .paso9-chip:nth-child(3) { left: 64%; top: 10%; animation: paso9Drift 6.8s ease-in-out -1s infinite; }
    .paso9-chip:nth-child(4) { left: 28%; top: 34%; animation: paso9Drift 8s ease-in-out -3s infinite; }
    @keyframes paso9Drift {
      0%,100% { transform: translate(0,0); }
      25% { transform: translate(20px,-16px); }
      50% { transform: translate(-16px,14px); }
      75% { transform: translate(12px,18px); }
    }

    /* foco: objetivo (centro-izq) → desencriptando (der) */
    .paso9-focus {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-start;
      gap: 22px; padding: 0 6% 0 2%; opacity: 0; pointer-events: none; transition: opacity .45s;
    }
    .paso9-focus.on { opacity: 1; }
    .paso9-focus-l, .paso9-focus-r { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    .paso9-focus-l { flex: 0 1 auto; max-width: 44%; }
    .paso9-focus-r { flex: 1; min-width: 0; }
    .paso9-clab { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 0.66rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); font-weight: 700; }
    .paso9-clab .ic { color: var(--blue); }
    .paso9-target, .paso9-out { font-family: var(--mono); font-weight: 700; font-size: 1.7rem; line-height: 1.15; overflow-wrap: anywhere; }
    .paso9-target { color: var(--navy); }
    .paso9-out { color: var(--blue-2); }
    .paso9-focus-arrow { color: var(--line-2); flex: none; align-self: center; }
    .paso9-crack-time {
      align-self: flex-start; margin-top: 2px; font-family: var(--display); font-weight: 700; font-size: 0.95rem;
      padding: 6px 14px; border-radius: 999px; white-space: nowrap; color: transparent;
      transition: background .3s;
    }
    .paso9-crack-time.weak { color: #fff; background: var(--red); }
    .paso9-crack-time.mid { color: #fff; background: var(--amber); }
    .paso9-crack-time.strong { color: #fff; background: var(--green); }

    .paso9-note { color: var(--muted); font-size: 0.95rem; line-height: 1.5; display: flex; align-items: center; gap: 8px; }
    .paso9-note.big { font-size: 1.05rem; margin-top: 4px; }
    .paso9-note b { color: var(--navy); }
    .paso9-note .ic { color: var(--blue); flex: none; }

    @media (max-width: 620px) {
      .paso9-lab { flex-direction: column; gap: 10px; }
      .paso9-go { width: 100%; }
      .paso9-counter { letter-spacing: 1px; padding: 4px 0; }
      .paso9-verdict { flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px; }
      .paso9-tag { font-size: 0.92rem; padding: 7px 12px; }
      .paso9-time { font-size: 1.4rem; }
      .paso9-arena { min-height: 250px; }
      .paso9-chip { font-size: 0.84rem; padding: 8px 13px; }
      .paso9-focus { flex-direction: column; align-items: flex-start; justify-content: center; gap: 14px; padding: 0 10px; }
      .paso9-focus-l { max-width: 100%; }
      .paso9-focus-arrow { display: none; }
      .paso9-target, .paso9-out { font-size: 1.25rem; }
      .paso9-note.big { font-size: 0.98rem; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[8] = { student, presenter, css };
})();
