/* ===========================================================
   Paso 6 · "Valida la URL" — window.BARNA_SLIDES[5]
   No es un juego: es MOSTRAR y enseñar a leer la dirección.
   Mismo markup para alumno y presentador (contenido estático).
   =========================================================== */
(() => {
  'use strict';
  window.BARNA_SLIDES = window.BARNA_SLIDES || {};

  // letras separadas de "rnicrosoft.com" — resaltamos la "rn" (índices 0 y 1)
  function letters(ctx) {
    return 'rnicrosoft.com'.split('').map((ch, i) => {
      const trap = i === 0 || i === 1;
      const dot = ch === '.';
      return `<span class="paso6-ch${trap ? ' paso6-trap' : ''}${dot ? ' paso6-dot' : ''}">${ch}</span>`;
    }).join('');
  }

  // URLs trampa: la parte tramposa va marcada en rojo, con su truco etiquetado
  const TRAPS = [
    { url: `<span class="paso6-trap">1</span>nstagram.com`, why: 'un "1" en vez de la "i"' },
    { url: `instagra<span class="paso6-trap">n</span>.com`, why: 'una "n" en vez de la "m"' },
    { url: `paypa<span class="paso6-trap">I</span>.com`, why: 'una "I" mayúscula haciéndose pasar por "l" minúscula' },
    { url: `instagram.com.<span class="paso6-trap">seguridad-cuenta.net</span>`, why: 'el dominio REAL es seguridad-cuenta.net, no Instagram', wide: true },
  ];

  function markup(ctx) {
    const { icon } = ctx;

    const list = TRAPS.map((t) => `
      <div class="paso6-url${t.wide ? ' paso6-wide' : ''}">
        <code class="paso6-mono">${t.url}</code>
        <div class="paso6-why">${icon('x', { size: 14 })} ${t.why}</div>
      </div>`).join('');

    return `
      <div class="slide paso6">
        <div class="kicker">${icon('scan', { size: 14 })} Valida la URL</div>
        <h2 class="q">El truco está en <span class="hl">la dirección</span>.</h2>

        <div class="paso6-hero">
          <span class="paso6-tag">Míralo de cerca</span>
          <div class="paso6-fake"><span class="paso6-trap">rn</span>icrosoft.com</div>
          <div class="paso6-zoom">${letters(ctx)}</div>
          <div class="paso6-aha">
            ${icon('alertTriangle', { size: 20 })}
            <span>La <b>r</b> y la <b>n</b> pegadas parecen una <b>m</b>. No es <b>microsoft</b>, es <b>rnicrosoft</b>.</span>
          </div>
        </div>

        <div class="paso6-list">${list}</div>

        <div class="paso6-rules">
          <span class="pill-navy">${icon('arrowLeft', { size: 16 })} Lee el dominio de derecha a izquierda</span>
          <span class="pill-navy">${icon('eye', { size: 16 })} Ojo con letras gemelas: rn=m, 0=o, 1=i</span>
          <span class="pill-navy">${icon('lock', { size: 16 })} El candado no significa "seguro", solo "cifrado"</span>
        </div>
      </div>`;
  }

  window.BARNA_SLIDES[5] = {
    student(container, ctx) { container.innerHTML = markup(ctx); },
    presenter(container, ctx) { container.innerHTML = markup(ctx); },
    css: `
      .paso6-hero {
        background: var(--red-soft); border: 1px solid #f4d3d4;
        border-radius: var(--radius); padding: 20px 22px;
        display: flex; flex-direction: column; align-items: center; gap: 13px; text-align: center;
      }
      .paso6-tag {
        font-family: var(--mono); font-size: 0.72rem; letter-spacing: 2px;
        text-transform: uppercase; color: var(--red); font-weight: 700;
      }
      .paso6-fake {
        font-family: var(--mono); font-weight: 700; line-height: 1; color: var(--navy);
        font-size: clamp(2rem, 6vw, 3.4rem); letter-spacing: 0.01em;
      }
      .paso6-trap { color: var(--red); }
      .paso6-zoom { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
      .paso6-ch {
        font-family: var(--mono); font-weight: 700; font-size: clamp(1rem, 3vw, 1.45rem);
        min-width: 1.6em; padding: 0.34em 0.12em; border-radius: 9px;
        background: #fff; border: 1px solid var(--line); color: var(--navy);
        display: inline-flex; align-items: center; justify-content: center;
      }
      .paso6-ch.paso6-trap { background: #fbe0e1; border-color: #f0b6b8; }
      .paso6-ch.paso6-dot { min-width: 1em; color: var(--muted); }
      .paso6-aha {
        display: inline-flex; align-items: center; gap: 10px; text-align: left;
        background: #fff; border: 1px solid #f3b9bb; border-radius: 14px;
        padding: 10px 16px; color: var(--ink); font-weight: 500;
        font-size: 0.98rem; line-height: 1.4; max-width: 580px;
      }
      .paso6-aha .ic { color: var(--red); flex: none; }
      .paso6-aha b { color: var(--navy); }

      .paso6-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .paso6-url {
        background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
        padding: 14px 16px; display: flex; flex-direction: column; gap: 8px;
      }
      .paso6-url.paso6-wide { grid-column: 1 / -1; }
      .paso6-mono {
        font-family: var(--mono); font-weight: 700; color: var(--navy);
        font-size: clamp(1rem, 2.4vw, 1.35rem); line-height: 1.25; word-break: break-all;
      }
      .paso6-why {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 0.9rem; color: var(--muted); font-weight: 500;
      }
      .paso6-why .ic { color: var(--red); flex: none; }

      .paso6-rules { display: flex; flex-wrap: wrap; gap: 10px; }
      .paso6-rules .pill-navy { font-size: 0.9rem; }

      @media (max-width: 620px) {
        .paso6-hero { padding: 16px 16px; }
        .paso6-list { grid-template-columns: 1fr; }
        .paso6-url.paso6-wide { grid-column: auto; }
        .paso6-rules .pill-navy { font-size: 0.82rem; padding: 9px 13px; }
      }
    `,
  };
})();
