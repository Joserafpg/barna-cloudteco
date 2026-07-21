/* ===========================================================
   Paso 8 · "Cómo blindarte" — window.BARNA_SLIDES[7]
   Consejos de defensa: 4 tarjetas limpias con .icon-chip.
   Mismo markup para alumno y presentador (contenido estático).
   =========================================================== */
(() => {
  'use strict';
  window.BARNA_SLIDES = window.BARNA_SLIDES || {};

  // 4 defensas. "chip" = clase de .icon-chip (verde/azul-base/navy/amber).
  const CARDS = [
    {
      icon: 'shieldCheck', chip: 'green', h: '2FA en todo',
      p: 'Si haces solo <b>UNA</b> cosa hoy, que sea esta. Mejor una app de códigos que SMS.',
    },
    {
      icon: 'key', chip: '', h: 'Contraseñas largas',
      p: 'Una frase como <code class="paso8-code paso8-good">PerroAzulComeArroz</code> vale más —y se recuerda mejor— que <code class="paso8-code paso8-bad">P@s5w!</code>',
    },
    {
      icon: 'lock', chip: 'navy', h: 'Nada en equipos ajenos',
      p: 'No guardes tus claves en el navegador de un equipo que no es tuyo.',
    },
    {
      icon: 'mail', chip: 'amber', h: 'El correo es la llave maestra',
      p: 'Si te lo roban, roban todo. Ponle tu clave más fuerte.',
    },
  ];

  function markup(ctx) {
    const { icon } = ctx;

    const cards = CARDS.map((c, i) => `
      <div class="paso8-card">
        <span class="paso8-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="icon-chip ${c.chip}">${icon(c.icon, { size: 26 })}</div>
        <div class="paso8-txt">
          <div class="paso8-h">${c.h}</div>
          <p class="paso8-p">${c.p}</p>
        </div>
      </div>`).join('');

    return `
      <div class="slide paso8">
        <div class="kicker">${icon('shieldCheck', { size: 14 })} Cómo blindarte</div>
        <h2 class="q">4 cosas que te hacen <span class="hl">casi imposible</span> de hackear.</h2>
        <div class="paso8-grid">${cards}</div>
      </div>`;
  }

  window.BARNA_SLIDES[7] = {
    student(container, ctx) { container.innerHTML = markup(ctx); },
    presenter(container, ctx) { container.innerHTML = markup(ctx); },
    css: `
      .paso8-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .paso8-card {
        position: relative; min-width: 0; background: var(--surface);
        border: 1px solid var(--line); border-radius: var(--radius);
        padding: 20px 22px; display: flex; gap: 16px; align-items: flex-start;
        box-shadow: var(--shadow-sm);
      }
      .paso8-card .icon-chip { flex: none; }
      .paso8-txt { min-width: 0; }
      .paso8-h {
        font-family: var(--display); font-weight: 700; font-size: 1.15rem;
        line-height: 1.2; color: var(--navy); margin-bottom: 5px;
        padding-right: 22px; overflow-wrap: anywhere;
      }
      .paso8-p { color: var(--muted); font-size: 0.98rem; line-height: 1.5; overflow-wrap: anywhere; }
      .paso8-p b { color: var(--ink); font-weight: 700; }
      .paso8-code {
        font-family: var(--mono); font-weight: 700; font-size: 0.88em;
        padding: 1px 6px; border-radius: 6px; overflow-wrap: anywhere;
      }
      .paso8-good { color: var(--green); background: var(--green-soft); }
      .paso8-bad { color: var(--red); background: var(--red-soft); }
      .paso8-num {
        position: absolute; top: 14px; right: 16px;
        font-family: var(--mono); font-weight: 700; font-size: 0.8rem; color: var(--line-2);
      }

      @media (max-width: 620px) {
        .paso8-grid { grid-template-columns: 1fr; }
        .paso8-card { padding: 16px 16px; gap: 13px; }
        .paso8-card .icon-chip { width: 48px; height: 48px; border-radius: 14px; }
        .paso8-h { font-size: 1.05rem; }
        .paso8-p { font-size: 0.94rem; }
      }
    `,
  };
})();
