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
  function cancelPres() { if (presId) { cancelAnimationFrame(presId); presId = null; } }

  // ---------- animaciones del contador (el hacker probando) ----------

  // caso descifrable: el contador cuenta 0000 -> valor y "llega"
  function animLand(counter, status, pw, ctx) {
    cancelAnim();
    const target = parseInt(pw, 10);
    const len = pw.length;
    const dur = 350 + Math.random() * 520; // 0.35 – 0.87 s
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
        const took = ((now - t0) / 1000).toFixed(1);
        status.className = 'paso9-status cracked';
        status.innerHTML = `${ctx.icon('lockOpen', { size: 16 })} <b>¡DESCIFRADA!</b> La adivinó en ${took} s`;
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
      <div class="paso9-status">${ctx.icon('scan', { size: 15 })} El hacker está probando combinaciones…</div>
      <div class="paso9-verdict ${strong ? 'strong' : 'weak'}">
        <span class="paso9-tag ${strong ? 'strong' : 'weak'}">${ctx.icon(strong ? 'shieldCheck' : 'shieldAlert', { size: 16 })} ${strong ? 'FUERTE' : 'DÉBIL'}</span>
        <span class="paso9-vbody">
          <span class="paso9-vlabel">Un ordenador la rompería en</span>
          <span class="paso9-time">${time}</span>
          <span class="paso9-vsub">${strong
            ? 'Ni con miles de máquinas a la vez. Así se ve una buena clave.'
            : 'Súmale mayúsculas, números y símbolos y mira dispararse el tiempo.'}</span>
        </span>
      </div>`;
    const counter = stage.querySelector('.paso9-counter');
    const status = stage.querySelector('.paso9-status');
    const numeric = /^[0-9]+$/.test(pw);
    if (numeric && pw.length <= 6) animLand(counter, status, pw, ctx);
    else animSpin(counter, status, pw.length, strong, secs, ctx);
  }

  // ---------- ALUMNO ----------
  function student(container, ctx) {
    cancelAnim();
    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${ctx.icon('zap', { size: 14 })} Laboratorio</div>
        <h2 class="q">¿Cuánto aguanta <span class="hl">tu contraseña</span>?</h2>
        <div class="pill-navy paso9-privacy">${ctx.icon('lock', { size: 15 })} Nada de lo que escribas sale de tu teléfono</div>
        <div class="paso9-lab">
          <input class="field paso9-input" id="p9pw" type="text" maxlength="40"
                 placeholder="Escribe una contraseña" autocomplete="off"
                 autocapitalize="off" autocorrect="off" spellcheck="false" />
          <button class="btn paso9-go" id="p9go">${ctx.icon('zap', { size: 20 })} Comprobar</button>
        </div>
        <div class="paso9-stage" id="p9stage" hidden></div>
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
    { pw: 'PerroAzulComeArroz', label: 'millones de años', tier: 'strong' },
  ];

  function presLoop(el) {
    cancelPres();
    let last = 0, n = 0;
    const frame = (now) => {
      if (!el.isConnected) { presId = null; return; } // se auto-detiene al salir del paso
      if (now - last > 45) {
        n += Math.floor(80 + Math.random() * 1900);
        el.textContent = String(n % 1000000).padStart(6, '0');
        last = now;
      }
      presId = requestAnimationFrame(frame);
    };
    presId = requestAnimationFrame(frame);
  }

  function presenter(container, ctx) {
    cancelPres();
    const rows = TABLE.map((r) => `
      <div class="paso9-row">
        <code class="paso9-pw">${ctx.escapeHtml(r.pw)}</code>
        <span class="paso9-arrow">${ctx.icon('arrowRight', { size: 18 })}</span>
        <span class="paso9-label ${r.tier}">${r.label}</span>
      </div>`).join('');
    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${ctx.icon('zap', { size: 14 })} Laboratorio</div>
        <h2 class="q">Así rompe un hacker tu clave: <span class="hl">prueba todo</span> hasta acertar.</h2>
        <div class="paso9-pres">
          <div class="paso9-demo">
            <div class="paso9-demo-label">${ctx.icon('scan', { size: 16 })} Probando combinaciones…</div>
            <div class="paso9-counter big" data-state="run" id="p9demo">000000</div>
          </div>
          <div class="paso9-table">${rows}</div>
        </div>
        <p class="paso9-note big">${ctx.icon('key', { size: 16 })} Cada letra o símbolo que agregas <b>multiplica</b> las combinaciones. No es magia, es matemática.</p>
      </div>`;
    presLoop(container.querySelector('#p9demo'));
  }

  // ---------- CSS del módulo (prefijo paso9-) ----------
  const css = `
    .paso9-privacy { align-self: flex-start; font-size: 0.9rem; }

    .paso9-lab { display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap; margin-top: 2px; }
    .paso9-input { flex: 1; min-width: 220px; max-width: none; text-align: left; }
    .paso9-go { white-space: nowrap; }

    .paso9-stage { display: flex; flex-direction: column; gap: 16px; margin-top: 6px; }

    .paso9-counter {
      font-family: var(--mono); font-weight: 700;
      font-size: clamp(2.6rem, 13vw, 4.2rem); line-height: 1;
      letter-spacing: 2px; font-variant-numeric: tabular-nums;
      color: var(--navy); background: var(--surface-2);
      border: 1px solid var(--line); border-radius: 16px;
      padding: 18px 20px; text-align: center;
      transition: color 0.25s, background 0.25s, border-color 0.25s;
    }
    .paso9-counter.big { font-size: clamp(3.4rem, 9vw, 6rem); letter-spacing: 4px; }
    .paso9-counter[data-state="cracked"],
    .paso9-counter[data-state="weak"] { color: var(--red); border-color: var(--red); background: var(--red-soft); }
    .paso9-counter[data-state="stuck"] { color: var(--green); border-color: var(--green); background: var(--green-soft); }

    .paso9-status {
      font-family: var(--display); font-weight: 600; color: var(--muted);
      display: flex; align-items: center; gap: 8px; line-height: 1.35;
    }
    .paso9-status b { font-weight: 700; }
    .paso9-status.cracked, .paso9-status.weak { color: var(--red); }
    .paso9-status.stuck { color: var(--green); }

    .paso9-verdict {
      display: flex; align-items: center; gap: 18px;
      border: 2px solid var(--line); border-radius: 20px;
      padding: 18px 20px; background: var(--surface);
    }
    .paso9-verdict.weak { border-color: var(--red); background: var(--red-soft); }
    .paso9-verdict.strong { border-color: var(--green); background: var(--green-soft); }
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

    .paso9-pres { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: center; margin-top: 6px; }
    .paso9-demo { display: flex; flex-direction: column; gap: 12px; }
    .paso9-demo-label { font-family: var(--display); font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 8px; }
    .paso9-demo-label .ic { color: var(--blue); }

    .paso9-table { display: flex; flex-direction: column; gap: 12px; }
    .paso9-row {
      display: flex; align-items: center; gap: 14px;
      background: var(--surface); border: 1px solid var(--line);
      border-radius: 14px; padding: 12px 16px;
    }
    .paso9-pw { font-family: var(--mono); font-weight: 700; font-size: 1.1rem; color: var(--navy); }
    .paso9-arrow { color: var(--muted); display: inline-flex; }
    .paso9-label {
      margin-left: auto; font-family: var(--display); font-weight: 700;
      font-size: 1rem; padding: 5px 12px; border-radius: 999px; white-space: nowrap;
    }
    .paso9-label.weak { color: var(--red); background: var(--red-soft); }
    .paso9-label.mid { color: var(--amber); background: var(--amber-soft); }
    .paso9-label.strong { color: var(--green); background: var(--green-soft); }

    .paso9-note { color: var(--muted); font-size: 0.95rem; line-height: 1.5; display: flex; align-items: center; gap: 8px; }
    .paso9-note.big { font-size: 1.05rem; margin-top: 4px; }
    .paso9-note b { color: var(--navy); }
    .paso9-note .ic { color: var(--blue); flex: none; }

    @media (max-width: 620px) {
      .paso9-pres { grid-template-columns: 1fr; gap: 16px; }
      .paso9-verdict { flex-direction: column; align-items: flex-start; gap: 12px; }
      .paso9-time { font-size: 1.4rem; }
      .paso9-pw { font-size: 0.95rem; }
      .paso9-label { font-size: 0.85rem; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[8] = { student, presenter, css };
})();
