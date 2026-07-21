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

  // ---------------- ALUMNO ----------------
  function student(container, ctx) {
    const { icon, escapeHtml } = ctx;
    const hasResult = !!lastEncoded;
    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${icon('key', { size: 14 })} Cifrado</div>
        <h2 class="q">Convierte tu nombre en <span class="hl">un secreto</span>.</h2>
        <p class="paso10-lead">Cada letra es un número: <b>A=01</b>, <b>B=02</b>… hasta <b>Z=26</b>.</p>
        <div class="paso10-form">
          <input class="field paso10-input" id="p10name" maxlength="24"
                 placeholder="Tu nombre" autocomplete="off"
                 value="${escapeHtml(lastName)}" />
          <button class="btn" id="p10go">${icon('lock', { size: 18 })} Cifrar</button>
        </div>
        <div class="paso10-result ${hasResult ? 'has' : ''}" id="p10out">${
          hasResult ? escapeHtml(lastEncoded) : 'Aquí verás tu nombre convertido en números.'
        }</div>
        ${alphaStrip()}
      </div>`;

    const input = container.querySelector('#p10name');
    const out = container.querySelector('#p10out');
    const go = container.querySelector('#p10go');

    const doCipher = () => {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      const encoded = encodeName(name);
      lastName = name;
      lastEncoded = encoded;
      out.textContent = encoded;
      out.classList.add('has');
      ctx.sendWs({ type: 'cipher', name });
    };

    go.onclick = doCipher;
    input.onkeydown = (e) => { if (e.key === 'Enter') doCipher(); };
  }

  // ---------------- PROFE (el juego) ----------------
  function presenter(container, ctx) {
    const { icon, escapeHtml } = ctx;
    const ciphers = ctx.cache.ciphers || [];

    const body = ciphers.length
      ? `<div class="paso10-cards">${
          ciphers
            .map((c, i) => `
              <div class="paso10-card">
                <span class="paso10-card-n">#${i + 1}</span>
                ${escapeHtml(c.encoded || '')}
              </div>`)
            .join('')
        }</div>`
      : `<div class="paso10-empty">${icon('clock', { size: 18 })} Esperando a que cifren sus nombres…</div>`;

    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${icon('key', { size: 14 })} Cifrado</div>
        <h2 class="q">¿Quién es quién? <span class="hl">Descífralos.</span></h2>
        ${body}
        ${alphaStrip()}
        <p class="paso10-remate">Esto es cifrado de verdad… solo que los reales son
          <span class="hl">millones de veces</span> más complejos.</p>
      </div>`;
  }

  const css = `
    .paso10-lead { color: var(--muted); font-size: 1rem; line-height: 1.5; }
    .paso10-lead b { color: var(--navy); font-family: var(--mono); font-weight: 700; }
    .paso10-form { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .paso10-form .paso10-input { max-width: 320px; text-align: left; }
    .paso10-result {
      font-family: var(--mono); font-size: 1.05rem; color: var(--muted);
      background: var(--surface-2); border: 1px dashed var(--line-2);
      border-radius: 16px; padding: 18px 22px; min-height: 76px;
      display: flex; align-items: center; word-break: break-word;
      transition: color .2s, background .2s, font-size .2s;
    }
    .paso10-result.has {
      font-weight: 700; font-size: 2.2rem; letter-spacing: 1px;
      color: var(--navy); background: var(--blue-soft); border: 1px solid transparent;
    }
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
    .paso10-card {
      position: relative; text-align: center;
      font-family: var(--mono); font-weight: 700; font-size: 1.5rem; letter-spacing: 1px;
      color: var(--navy); background: var(--surface); border: 2px solid var(--line);
      border-radius: 16px; padding: 26px 18px 22px; word-break: break-word;
      box-shadow: var(--shadow-sm); animation: paso10In .4s ease both;
    }
    .paso10-card-n {
      position: absolute; top: 8px; left: 12px;
      font-size: 0.7rem; color: var(--blue); font-weight: 700;
    }
    @keyframes paso10In { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .paso10-empty {
      display: inline-flex; align-items: center; gap: 9px;
      color: var(--muted); font-family: var(--display); font-weight: 600; font-size: 1.1rem;
    }
    .paso10-empty .ic { color: var(--blue); }
    .paso10-remate { color: var(--muted); font-size: 1rem; line-height: 1.5; }
    @media (max-width: 620px) {
      .paso10-result.has { font-size: 1.6rem; }
      .paso10-cards { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      .paso10-card { font-size: 1.2rem; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[9] = { student, presenter, css };
})();
