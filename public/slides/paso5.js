/* ===========================================================
   Barna · Ciberseguridad — Paso 5 · "El reveal"
   Remate de la demo de phishing. Minimalista y de golpe:
   línea fuerte + contraste de URL + (profe) cuántos cayeron.
   Mismo look en alumno y profe. Se registra en BARNA_SLIDES[4].
   =========================================================== */
(() => {
  'use strict';

  // markup compartido; solo cambia el bloque central (roleBlock)
  function core(ctx, roleBlock) {
    return `
      <div class="slide paso5">
        <div class="kicker">${ctx.icon('alertTriangle', { size: 14 })} El reveal</div>
        <h2 class="q">Todo lo que escribiste <span class="hl">me llegó a mí</span>.</h2>

        <div class="paso5-urls">
          <div class="paso5-url paso5-fake">
            <span class="paso5-lbl">Falso</span>
            <span class="paso5-strike">instagram.com</span>
          </div>
          <div class="paso5-arrow">${ctx.icon('arrowRight', { size: 18 })}</div>
          <div class="paso5-url paso5-real">
            <span class="paso5-lbl">Real</span>
            <span class="paso5-dom">barna.cloudteco.com</span>
          </div>
        </div>

        ${roleBlock}
      </div>`;
  }

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[4] = {
    // ---------- ALUMNO: una línea empática ----------
    student(container, ctx) {
      const block = `
        <div class="paso5-msg">
          <span class="paso5-msg-ic">${ctx.icon('shieldCheck', { size: 22 })}</span>
          <span>Caíste, y está bien: <b>ahora ya lo sabes</b>.</span>
        </div>`;
      container.innerHTML = core(ctx, block);
    },

    // ---------- PROFE: un número grande = cuántos cayeron ----------
    presenter(container, ctx) {
      const n = (ctx.cache.captures || []).length;
      const block = `
        <div class="paso5-count">
          <span class="paso5-num">${n}</span>
          <span class="paso5-count-txt">cayeron</span>
        </div>`;
      container.innerHTML = core(ctx, block);
    },

    // ---------- CSS mínimo (prefijado paso5-) ----------
    css: `
      /* sin max-width propio: hereda el ancho centrado de .slide (900px, margin auto) */
      .paso5 { align-items: center; text-align: center; }
      .paso5 .kicker { align-self: center; }

      /* contraste de URL: apiladas, corto y visual */
      .paso5-urls { display: flex; flex-direction: column; align-items: stretch; gap: 8px; max-width: 480px; width: 100%; }
      .paso5-url {
        display: flex; align-items: center; gap: 12px;
        padding: 13px 16px; border-radius: 14px;
        border: 1px solid var(--line); background: var(--surface); max-width: 100%;
      }
      .paso5-lbl {
        flex: none; font-family: var(--display); font-weight: 700; font-size: 0.72rem;
        text-transform: uppercase; letter-spacing: 1.5px;
      }
      .paso5-fake { background: var(--bg); border-color: var(--line-2); }
      .paso5-fake .paso5-lbl { color: var(--muted); }
      .paso5-real { background: var(--green-soft); border-color: #bfe6d3; }
      .paso5-real .paso5-lbl { color: var(--green); }
      .paso5-strike {
        font-family: var(--mono); font-size: clamp(1.05rem, 4.6vw, 1.4rem); color: var(--muted);
        text-decoration: line-through; text-decoration-color: var(--red); text-decoration-thickness: 2px;
        overflow-wrap: anywhere; min-width: 0;
      }
      .paso5-dom {
        font-family: var(--mono); font-size: clamp(1.05rem, 4.6vw, 1.4rem); font-weight: 700; color: var(--navy);
        background: var(--hl); border-radius: 6px; padding: 2px 8px;
        overflow-wrap: anywhere; min-width: 0;
      }
      .paso5-arrow { display: flex; justify-content: center; color: var(--muted); }
      .paso5-arrow .ic { transform: rotate(90deg); }

      /* alumno: una línea */
      .paso5-msg {
        display: flex; align-items: center; gap: 10px; max-width: 480px;
        background: var(--green-soft); border: 1px solid #bfe6d3; border-radius: 14px;
        padding: 14px 16px;
        font-family: var(--display); font-weight: 500; font-size: clamp(1rem, 4vw, 1.2rem); color: var(--navy);
      }
      .paso5-msg-ic { color: var(--green); flex: none; display: inline-flex; }
      .paso5-msg b { font-weight: 700; }

      /* profe: número grande */
      .paso5-count { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
      .paso5-num { font-family: var(--display); font-weight: 700; font-size: clamp(3rem, 12vw, 5rem); line-height: 1; color: var(--red); font-variant-numeric: tabular-nums; }
      .paso5-count-txt { font-family: var(--display); font-weight: 700; font-size: clamp(1.2rem, 5vw, 1.9rem); color: var(--navy); }

      @media (max-width: 620px) {
        .paso5-urls, .paso5-msg { max-width: 100%; }
        .paso5-url { padding: 12px 14px; gap: 10px; }
      }
    `,
  };
})();
