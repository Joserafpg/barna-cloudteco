/* ===========================================================
   Barna · Ciberseguridad — Paso 5 · "El reveal"
   El remate de la demo de phishing: lo que escribieron llegó al
   profe, y esto nunca fue instagram.com. Mismo look en alumno y
   profe (regla del brief), estilo Barna .slide.
   Se registra en window.BARNA_SLIDES[4].
   =========================================================== */
(() => {
  'use strict';

  // markup compartido entre alumno y profe (solo cambia el bloque central)
  function core(ctx, roleBlock) {
    return `
      <div class="slide">
        <div class="kicker">${ctx.icon('alertTriangle', { size: 14 })} El reveal</div>
        <h2 class="q">Todo lo que escribiste... <span class="hl">me llegó a mí</span>.</h2>

        <p class="paso5-key">Y esto <b>NUNCA</b> fue instagram.com.</p>

        <div class="paso5-bar">
          <div class="paso5-url paso5-fake">
            <span class="paso5-uic">${ctx.icon('alertTriangle', { size: 20 })}</span>
            <span class="paso5-strike">instagram.com</span>
            <span class="paso5-tag">lo que creíste ver</span>
          </div>
          <div class="paso5-vs">${ctx.icon('arrowRight', { size: 22 })}</div>
          <div class="paso5-url paso5-real">
            <span class="paso5-uic">${ctx.icon('shieldCheck', { size: 20 })}</span>
            <span class="paso5-dom">barna.cloudteco.com</span>
            <span class="paso5-tag">lo que decía la barra de dirección</span>
          </div>
        </div>

        ${roleBlock}

        <div class="pill-navy paso5-lesson">
          ${ctx.icon('eye', { size: 20 })}
          <span>Antes de escribir tu clave, <b>MIRA la barra de dirección</b>. El dominio real es lo último antes de la primera barra <span class="paso5-slash">/</span></span>
        </div>
      </div>`;
  }

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[4] = {
    // -------------------------------------------------------
    //  ALUMNO — mensaje empático
    // -------------------------------------------------------
    student(container, ctx) {
      const block = `
        <div class="paso5-msg">
          <span class="paso5-msg-ic">${ctx.icon('shieldCheck', { size: 26 })}</span>
          <span>Caíste, y no pasa nada: ese era el punto. <b>Ahora ya sabes.</b></span>
        </div>`;
      container.innerHTML = core(ctx, block);
    },

    // -------------------------------------------------------
    //  PROFE — cuántos cayeron + lista
    // -------------------------------------------------------
    presenter(container, ctx) {
      const caps = ctx.cache.captures || [];
      const n = caps.length;
      const verb = n === 1 ? 'escribió' : 'escribieron';
      const names = n
        ? `<div class="paso5-names">${caps
            .map((c) => `<span class="paso5-chip">${ctx.icon('user', { size: 14 })}${ctx.escapeHtml(c.name || 'Anónimo')}</span>`)
            .join('')}</div>`
        : '';
      const block = `
        <div class="paso5-count">
          <span class="paso5-num">${n}</span>
          <span class="paso5-count-txt">de ustedes ${verb} sus datos</span>
        </div>
        ${names}`;
      container.innerHTML = core(ctx, block);
    },

    // -------------------------------------------------------
    //  CSS mínimo (prefijado paso5-)
    // -------------------------------------------------------
    css: `
      .paso5-key { font-family: var(--display); font-weight: 600; font-size: 1.4rem; color: var(--ink); }
      .paso5-key b { color: var(--red); }

      .paso5-bar { display: flex; align-items: stretch; gap: 16px; flex-wrap: wrap; }
      .paso5-url {
        flex: 1; min-width: 220px;
        display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
        padding: 16px 20px; border-radius: 16px;
        border: 1px solid var(--line); background: var(--surface);
      }
      .paso5-uic { display: inline-flex; }
      .paso5-fake { background: var(--bg); border-color: var(--line-2); }
      .paso5-fake .paso5-uic { color: var(--red); }
      .paso5-strike {
        font-family: var(--mono); font-size: 1.3rem; color: var(--muted);
        text-decoration: line-through; text-decoration-color: var(--red); text-decoration-thickness: 2px;
      }
      .paso5-real { background: var(--green-soft); border-color: #bfe6d3; }
      .paso5-real .paso5-uic { color: var(--green); }
      .paso5-dom {
        font-family: var(--mono); font-size: 1.3rem; font-weight: 700; color: var(--navy);
        background: var(--hl); border-radius: 6px; padding: 2px 9px;
      }
      .paso5-tag { font-family: var(--display); font-size: 0.82rem; font-weight: 600; color: var(--muted); }
      .paso5-vs { display: flex; align-items: center; color: var(--muted); }

      .paso5-msg {
        display: flex; align-items: center; gap: 12px;
        background: var(--green-soft); border: 1px solid #bfe6d3; border-radius: 16px;
        padding: 16px 20px;
        font-family: var(--display); font-weight: 500; font-size: 1.15rem; color: var(--navy);
      }
      .paso5-msg-ic { color: var(--green); flex: none; display: inline-flex; }
      .paso5-msg b { font-weight: 700; }

      .paso5-count { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
      .paso5-num { font-family: var(--display); font-weight: 700; font-size: 3rem; line-height: 1; color: var(--red); }
      .paso5-count-txt { font-family: var(--display); font-weight: 600; font-size: 1.3rem; color: var(--navy); }
      .paso5-names { display: flex; flex-wrap: wrap; gap: 8px; }
      .paso5-chip {
        display: inline-flex; align-items: center; gap: 6px;
        background: var(--surface); border: 1px solid var(--line); border-radius: 999px;
        padding: 6px 12px; font-family: var(--display); font-weight: 600; font-size: 0.9rem; color: var(--navy);
      }
      .paso5-chip .ic { color: var(--muted); }

      .paso5-lesson {
        align-self: stretch; align-items: flex-start; line-height: 1.5;
        font-weight: 500; font-size: 1.02rem;
      }
      .paso5-lesson .ic { flex: none; margin-top: 2px; }
      .paso5-lesson b { color: #fff; }
      .paso5-slash { font-family: var(--mono); color: var(--hl); font-weight: 700; }

      @media (max-width: 620px) {
        .paso5-key { font-size: 1.1rem; }
        .paso5-bar { gap: 12px; }
        .paso5-vs { transform: rotate(90deg); align-self: center; }
        .paso5-strike, .paso5-dom { font-size: 1.1rem; }
        .paso5-num { font-size: 2.2rem; }
        .paso5-count-txt { font-size: 1.05rem; }
        .paso5-msg { font-size: 1.02rem; }
      }
    `,
  };
})();
