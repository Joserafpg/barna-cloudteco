/* ===========================================================
   Paso 10 · Cifrado de nombres  (window.BARNA_SLIDES[9])
   Alumno: cifra su nombre A=01..Z=26 y lo manda al profe.
   Profe : el juego de descifrar — muestra SOLO los códigos.
   =========================================================== */
(() => {
  'use strict';

  // estado local del alumno (persiste entre re-renders del módulo)
  let lastName = '';
  let lastEncoded = '';
  const flipped = new Set(); // ids de tarjetas volteadas (profe), persiste entre renders

  // A=01, B=02 ... Z=26 · letras unidas con "-", palabras separadas por espacio
  // ej: "Jose" -> "10-15-19-05"
  function encodeName(name) {
    return String(name || '')
      .toUpperCase()
      .split(/\s+/)
      .map((word) =>
        word
          .replace(/[^A-Z]/g, '')
          .split('')
          .map((ch) => String(ch.charCodeAt(0) - 64).padStart(2, '0'))
          .join('-')
      )
      .filter(Boolean)
      .join('   ');
  }

  // fichas letra→número que se voltean una por una
  let flipTimers = [];
  function cancelEnc() { flipTimers.forEach(clearTimeout); flipTimers = []; }
  function nameTiles(name) {
    return [...String(name).toUpperCase()].map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        const num = String(code - 64).padStart(2, '0');
        return `<div class="paso10-tile" data-tile>
          <div class="paso10-tile-inner">
            <div class="paso10-face paso10-tile-front">${ch}</div>
            <div class="paso10-face paso10-tile-back">${num}</div>
          </div>
        </div>`;
      }
      if (ch === ' ') return '<span class="paso10-gap"></span>';
      return '';
    }).join('');
  }

  // tira de referencia A=01 B=02 ... Z=26 (pequeña)
  function alphaStrip() {
    let cells = '';
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      const num = String(i + 1).padStart(2, '0');
      cells += `<span class="paso10-cell"><b>${letter}</b>${num}</span>`;
    }
    return `<div class="paso10-alpha">${cells}</div>`;
  }

  // el abecedario va detrás de un botón (modal) para que no estorbe a la vista
  function alphaBtn(ctx) {
    return `
      <button class="btn ghost paso10-alphabtn" type="button" data-alpha>${ctx.icon('lock', { size: 16 })} Ver encriptación</button>
      <dialog class="paso10-dlg" data-alphadlg>
        <button class="paso10-x" type="button" data-close aria-label="Cerrar">${ctx.icon('x', { size: 18 })}</button>
        <div class="paso10-dlg-title">¿Cómo funciona la encriptación?</div>
        <p class="paso10-dlg-sub">Encriptar es convertir un mensaje en algo ilegible usando una <b>regla secreta</b>. Aquí la regla es sencilla: <b>cada letra vale su número</b> en el abecedario.</p>
        <p class="paso10-dlg-sub">A=01, B=02… hasta Z=26. Así <b>JOSE</b> se vuelve <b>10-15-19-05</b>. Solo quien conoce la regla puede volver a leerlo.</p>
        ${alphaStrip()}
        <p class="paso10-dlg-foot">Los sistemas reales usan reglas <b>millones de veces</b> más complejas — imposibles de adivinar.</p>
      </dialog>`;
  }
  function wireAlpha(container) {
    const btn = container.querySelector('[data-alpha]');
    const dlg = container.querySelector('[data-alphadlg]');
    if (!btn || !dlg) return;
    btn.onclick = () => dlg.showModal();
    dlg.querySelector('[data-close]').onclick = () => dlg.close();
    dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };
  }

  // ---------------- ALUMNO ----------------
  function student(container, ctx) {
    const { icon, escapeHtml } = ctx;

    // pantalla de resultado: el nombre cifrado a pantalla completa
    const drawResult = (animate) => {
      container.innerHTML = `
        <div class="paso10-result-screen">
          <span class="paso10-rs-label">${icon('lock', { size: 14 })} ${escapeHtml(lastName)} en clave secreta</span>
          <div class="paso10-tiles">${nameTiles(lastName)}</div>
          <button class="btn ghost" id="p10retry">${icon('refresh', { size: 18 })} Volver a intentar</button>
        </div>`;
      const tiles = container.querySelectorAll('[data-tile]');
      if (animate) {
        tiles.forEach((t, k) => flipTimers.push(setTimeout(() => t.classList.add('flipped'), 300 + k * 160)));
      } else {
        tiles.forEach((t) => t.classList.add('flipped'));
      }
      container.querySelector('#p10retry').onclick = () => {
        lastName = ''; lastEncoded = '';
        draw();
      };
    };

    // pantalla de entrada: escribe el nombre
    const drawInput = () => {
      container.innerHTML = `
        <div class="slide">
          <div class="kicker">${icon('key', { size: 14 })} Cifrado</div>
          <h2 class="q">Convierte tu nombre en <span class="hl">un secreto</span>.</h2>
          <div class="paso10-form">
            <input class="field paso10-input" id="p10name" maxlength="24"
                   placeholder="Tu nombre" autocomplete="off" value="${escapeHtml(lastName)}" />
            <button class="btn" id="p10go">${icon('lock', { size: 18 })} Cifrar</button>
          </div>
          ${alphaBtn(ctx)}
        </div>`;
      wireAlpha(container);
      const input = container.querySelector('#p10name');
      const doCipher = () => {
        const name = input.value.trim();
        if (!name) { input.focus(); return; }
        lastName = name;
        lastEncoded = encodeName(name);
        ctx.sendWs({ type: 'cipher', name });
        draw(true); // muestra el resultado encriptándose
      };
      container.querySelector('#p10go').onclick = doCipher;
      input.onkeydown = (e) => { if (e.key === 'Enter') doCipher(); };
    };

    const draw = (animate) => {
      cancelEnc();
      if (lastEncoded) drawResult(!!animate); else drawInput();
    };
    draw();
  }

  // ---------------- PROFE (el juego) ----------------
  function presenter(container, ctx) {
    const { icon, escapeHtml } = ctx;
    const ciphers = ctx.cache.ciphers || [];

    const body = ciphers.length
      ? `<div class="paso10-flip-hint">${icon('key', { size: 14 })} Toca una tarjeta para revelar el nombre.</div>
         <div class="paso10-cards">${
          ciphers.map((c, i) => `
            <div class="paso10-card ${flipped.has(c.id) ? 'flipped' : ''}" data-flip data-id="${escapeHtml(c.id)}">
              <div class="paso10-card-inner">
                <div class="paso10-face paso10-front">
                  <span class="paso10-card-n">#${i + 1}</span>
                  <span class="paso10-code">${escapeHtml(c.encoded || '')}</span>
                </div>
                <div class="paso10-face paso10-back">
                  <span class="paso10-card-n">#${i + 1}</span>
                  <span class="paso10-name">${escapeHtml(c.name || '')}</span>
                </div>
              </div>
            </div>`).join('')
        }</div>`
      : `<div class="paso10-empty">${icon('clock', { size: 18 })} Esperando a que cifren sus nombres…</div>`;

    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${icon('key', { size: 14 })} Cifrado</div>
        <h2 class="q">¿Quién es quién? <span class="hl">Descífralos.</span></h2>
        ${body}
        ${alphaBtn(ctx)}
        <p class="paso10-remate">Cifrado real: solo que los de verdad son
          <span class="hl">millones de veces</span> más complejos.</p>
      </div>`;
    container.querySelectorAll('[data-flip]').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (flipped.has(id)) flipped.delete(id); else flipped.add(id);
        card.classList.toggle('flipped');
      });
    });
    wireAlpha(container);
  }

  const css = `
    .paso10-dlg-sub { color: var(--muted); font-size: 0.92rem; line-height: 1.5; margin: 0 0 14px; }
    .paso10-dlg-sub b { color: var(--navy); font-family: var(--mono); font-weight: 700; }
    .paso10-dlg-foot { color: var(--muted); font-size: 0.85rem; line-height: 1.5; margin-top: 16px; }
    .paso10-dlg-foot b { color: var(--navy); }
    .paso10-form { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .paso10-form .paso10-input { max-width: 320px; text-align: left; }
    /* pantalla de resultado: el nombre cifrado a pantalla completa */
    .paso10-result-screen {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 22px; text-align: center; width: 100%; padding: 20px 0;
    }
    .paso10-rs-label {
      display: inline-flex; align-items: center; gap: 7px;
      font-family: var(--mono); font-size: 0.78rem; letter-spacing: 1.2px; text-transform: uppercase;
      color: var(--muted); font-weight: 700;
    }
    .paso10-rs-label .ic { color: var(--blue); }
    /* fichas letra→número: se voltean en 3D (frente letra, reverso número) */
    .paso10-tiles { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-items: center; max-width: 100%; }
    .paso10-tile { perspective: 500px; min-width: 66px; height: 62px; }
    .paso10-tile-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .55s cubic-bezier(.4, .2, .2, 1); }
    .paso10-tile.flipped .paso10-tile-inner { transform: rotateY(180deg); }
    .paso10-face {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      border-radius: 13px; font-family: var(--mono); font-weight: 700; white-space: nowrap;
      box-shadow: var(--shadow-sm); -webkit-backface-visibility: hidden; backface-visibility: hidden;
    }
    .paso10-tile-front { background: var(--blue-soft); color: var(--navy); font-size: 1.7rem; }
    .paso10-tile-back { background: var(--navy); color: #fff; font-size: 1.55rem; letter-spacing: 1px; transform: rotateY(180deg); }
    .paso10-gap { width: 12px; height: 1px; }
    .paso10-alpha { display: flex; flex-wrap: wrap; gap: 6px; }
    .paso10-cell {
      display: inline-flex; align-items: baseline; gap: 3px;
      font-family: var(--mono); font-size: 0.72rem; color: var(--muted);
      background: var(--surface); border: 1px solid var(--line);
      border-radius: 8px; padding: 4px 7px;
    }
    .paso10-cell b { color: var(--navy); font-weight: 700; }
    .paso10-cards {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 14px;
    }
    /* flip cards: frente = código, reverso = nombre (el profe las voltea) */
    .paso10-flip-hint { display: inline-flex; align-items: center; gap: 7px; color: var(--muted); font-size: 0.9rem; }
    .paso10-flip-hint .ic { color: var(--blue); }
    .paso10-card { perspective: 1000px; cursor: pointer; min-height: 124px; animation: paso10In .4s ease both; }
    .paso10-card-inner {
      position: relative; width: 100%; height: 100%; min-height: 124px;
      transform-style: preserve-3d; transition: transform .55s cubic-bezier(.4, .2, .2, 1);
    }
    .paso10-card.flipped .paso10-card-inner { transform: rotateY(180deg); }
    .paso10-face {
      position: absolute; inset: 0;
      -webkit-backface-visibility: hidden; backface-visibility: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border-radius: 16px; box-shadow: var(--shadow); padding: 22px 14px;
      text-align: center; overflow-wrap: anywhere; word-break: break-word;
    }
    .paso10-front { background: var(--surface); }
    .paso10-back { background: var(--navy); transform: rotateY(180deg); }
    .paso10-code { font-family: var(--mono); font-weight: 700; font-size: 1.5rem; letter-spacing: 1px; color: var(--navy); }
    .paso10-name { font-family: var(--display); font-weight: 700; font-size: 1.4rem; color: #fff; }
    .paso10-card-n { position: absolute; top: 8px; left: 12px; font-size: 0.7rem; font-weight: 700; }
    .paso10-front .paso10-card-n { color: var(--blue); }
    .paso10-back .paso10-card-n { color: rgba(255, 255, 255, 0.65); }
    @keyframes paso10In { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .paso10-empty {
      display: inline-flex; align-items: center; gap: 9px;
      color: var(--muted); font-family: var(--display); font-weight: 600; font-size: 1.1rem;
    }
    .paso10-empty .ic { color: var(--blue); }
    .paso10-remate { color: var(--muted); font-size: 1rem; line-height: 1.5; }

    /* abecedario en modal (botón "Ver abecedario") */
    .paso10-alphabtn { align-self: flex-start; }
    .paso10-dlg {
      margin: auto; border: none; border-radius: 22px; padding: 24px;
      width: min(460px, calc(100vw - 32px)); background: var(--surface);
      box-shadow: var(--shadow-lg); position: relative; color: var(--ink);
    }
    .paso10-dlg::backdrop { background: rgba(11,18,32,0.5); backdrop-filter: blur(3px); }
    .paso10-dlg-title { font-family: var(--display); font-weight: 700; color: var(--navy); font-size: 1.05rem; margin: 2px 0 8px; }
    .paso10-x {
      position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%;
      border: none; background: var(--bg); color: var(--muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .paso10-x:hover { color: var(--red); }
    .paso10-dlg .paso10-alpha { gap: 8px; }
    .paso10-dlg .paso10-cell { font-size: 0.82rem; padding: 6px 9px; }

    @media (max-width: 620px) {
      .paso10-form { flex-direction: column; gap: 10px; align-items: stretch; }
      .paso10-form .paso10-input { max-width: none; }
      .paso10-form .btn { width: 100%; }
      .paso10-cards { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
      .paso10-code { font-size: 1.2rem; }
      .paso10-name { font-size: 1.15rem; }
      .paso10-tiles { gap: 7px; }
      .paso10-tile { min-width: 54px; height: 54px; }
      .paso10-tile-front { font-size: 1.45rem; }
      .paso10-tile-back { font-size: 1.3rem; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[9] = { student, presenter, css };
})();
