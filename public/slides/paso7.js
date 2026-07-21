/* ===========================================================
   Paso 7 · "¿Caes o no caes?"  (window.BARNA_SLIDES[6])
   Votación en vivo tipo Paso 2: un mensaje-trampa de WhatsApp
   y dos tiles ("Le caigo" / "No le caigo") que se llenan solos
   con los votos. El motor global (updatePollLive) actualiza los
   tiles en sitio porque replicamos EXACTAMENTE el markup de
   pollView (.slide.poll[data-slide="6"] con .poll-choices,
   .choice[data-k], .fill[data-pct], .content, .big, .pct, .cnt).
   =========================================================== */
(function () {
  'use strict';
  window.BARNA_SLIDES = window.BARNA_SLIDES || {};

  const SLIDE = 6;

  // Config de la encuesta. Se registra en ctx.POLLS[6] en el primer
  // render (ctx solo existe dentro de student/presenter) para que el
  // motor de encuestas la actualice en vivo con updatePollLive(6).
  const POLL_CFG = {
    q: '¿Caerías en este mensaje?',
    options: [
      { k: 'caigo', label: 'Le caigo', color: '#e5484d', soft: '#f8ccce', icon: 'alertTriangle' },
      { k: 'nocaigo', label: 'No le caigo', color: '#12885c', soft: '#c6ecda', icon: 'shieldCheck' },
    ],
  };

  // voto de ESTE alumno, en variable local del módulo (para marcar su tile con 'mine')
  let myVote = null;

  function ensurePoll(ctx) {
    if (ctx.POLLS && !ctx.POLLS[SLIDE]) ctx.POLLS[SLIDE] = POLL_CFG;
  }

  // markup idéntico al de pollView (cambiando el slide a 6), más la
  // burbuja de chat arriba y el panel de señales de alerta abajo.
  function buildSlide(ctx, isStudent) {
    const cfg = (ctx.POLLS && ctx.POLLS[SLIDE]) || POLL_CFG;
    const data = ctx.cache.polls[SLIDE] || { counts: {}, total: 0 };
    const total = data.total || 0;

    const tiles = cfg.options.map((o) => {
      const c = data.counts[o.k] || 0;
      const pct = total ? Math.round((c / total) * 100) : 0;
      return `
        <button class="choice ${isStudent ? 'tap' : 'display'} ${myVote === o.k ? 'mine' : ''}" data-k="${o.k}" style="--c:${o.color};--cs:${o.soft}">
          <span class="fill" data-pct="${pct}"></span>
          <span class="content">
            <span class="ic-wrap">${ctx.icon(o.icon, { size: 38, sw: 1.7 })}</span>
            <span class="big">${o.label}</span>
            <span class="pct">${pct}%</span>
            <span class="cnt">${c} ${c === 1 ? 'voto' : 'votos'}</span>
          </span>
        </button>`;
    }).join('');

    const foot = isStudent
      ? (myVote
          ? `<span class="ok">${ctx.icon('check', { size: 16 })} Tu respuesta quedó registrada</span>`
          : 'Toca tu respuesta')
      : `${total} ${total === 1 ? 'voto' : 'votos'} en total`;

    return `
      <div class="slide poll" data-slide="${SLIDE}">
        <div class="kicker">${ctx.icon('message', { size: 14 })} Mensaje sospechoso</div>
        <h2 class="q">${cfg.q}</h2>

        <div class="paso7-chat">
          <div class="paso7-chat-head">
            <span class="paso7-avatar">${ctx.icon('user', { size: 18 })}</span>
            <span class="paso7-chat-meta">
              <span class="paso7-chat-name">+34 632 04 11 87</span>
              <span class="paso7-chat-sub">Número desconocido</span>
            </span>
          </div>
          <div class="paso7-bubble">
            Hola, te mandé un código por error sin querer. ¿Me lo puedes reenviar? Es que es urgente.
            <span class="paso7-time">14:32</span>
          </div>
        </div>

        <div class="poll-choices">${tiles}</div>
        <div class="poll-foot">${foot}</div>

        <div class="paso7-alerts">
          <div class="paso7-alert-title">${ctx.icon('alertTriangle', { size: 15 })} Señales de alerta</div>
          <div class="paso7-signals">
            <span class="paso7-signal"><span class="paso7-sig-ic">${ctx.icon('clock', { size: 18 })}</span>Urgencia: te apura para que no pienses</span>
            <span class="paso7-signal"><span class="paso7-sig-ic">${ctx.icon('hash', { size: 18 })}</span>Te pide un código de 6 dígitos</span>
            <span class="paso7-signal"><span class="paso7-sig-ic">${ctx.icon('user', { size: 18 })}</span>Alguien que "se equivocó" y te escribe</span>
          </div>
          <div class="paso7-punch">Nadie legítimo te pide un código que te llegó a ti. <span class="hl">NUNCA lo compartas.</span></div>
        </div>
      </div>`;
  }

  // anima los fills igual que pollView (solo hay .fill dentro de los tiles)
  function animateFills(container) {
    requestAnimationFrame(() => {
      container.querySelectorAll('.fill').forEach((f) => {
        f.style.transform = 'scaleY(' + (f.dataset.pct || 0) / 100 + ')';
      });
    });
  }

  window.BARNA_SLIDES[SLIDE] = {
    student(container, ctx) {
      ensurePoll(ctx);
      container.innerHTML = buildSlide(ctx, true);
      animateFills(container);
      container.querySelectorAll('.choice.tap').forEach((b) => {
        b.onclick = () => {
          myVote = b.dataset.k;
          ctx.sendWs({ type: 'vote', slide: SLIDE, option: myVote });
          ctx.render(); // re-render del alumno: marca 'mine' y anima (igual que pollView)
        };
      });
    },

    presenter(container, ctx) {
      ensurePoll(ctx);
      container.innerHTML = buildSlide(ctx, false); // tiles solo display, % en vivo desde ctx.cache.polls[6]
      animateFills(container);
    },

    css: `
      /* ---- burbuja de chat tipo WhatsApp (mensaje-trampa) ---- */
      .paso7-chat { display: flex; flex-direction: column; gap: 10px; align-self: flex-start; max-width: 540px; width: 100%; }
      .paso7-chat-head { display: flex; align-items: center; gap: 10px; }
      .paso7-avatar {
        display: inline-flex; align-items: center; justify-content: center; flex: none;
        width: 38px; height: 38px; border-radius: 50%;
        background: var(--blue-soft); color: var(--muted);
      }
      .paso7-chat-meta { display: flex; flex-direction: column; line-height: 1.2; }
      .paso7-chat-name { font-family: var(--display); font-weight: 600; font-size: 0.95rem; color: var(--navy); }
      .paso7-chat-sub { font-family: var(--mono); font-size: 0.72rem; color: var(--muted); }
      .paso7-bubble {
        align-self: flex-start; max-width: 100%;
        background: var(--green-soft); color: var(--ink);
        border: 1px solid #c6ecda; border-radius: 16px 16px 16px 4px;
        padding: 13px 16px; font-size: 1.02rem; line-height: 1.5; font-weight: 500;
        box-shadow: var(--shadow-sm);
      }
      .paso7-time { display: block; text-align: right; margin-top: 4px; font-family: var(--mono); font-size: 0.68rem; color: var(--muted); }

      /* ---- panel de señales de alerta (siempre visible) ---- */
      .paso7-alerts {
        display: flex; flex-direction: column; gap: 12px;
        background: var(--surface); border: 1px solid var(--line);
        border-radius: 18px; padding: 16px 18px; box-shadow: var(--shadow-sm);
      }
      .paso7-alert-title {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: var(--mono); font-size: 0.72rem; letter-spacing: 2px;
        text-transform: uppercase; color: var(--red); font-weight: 700;
      }
      .paso7-signals { display: flex; flex-direction: column; gap: 9px; }
      .paso7-signal {
        display: flex; align-items: center; gap: 12px;
        font-family: var(--body); font-weight: 600; font-size: 1rem; color: var(--ink);
      }
      .paso7-sig-ic {
        display: inline-flex; align-items: center; justify-content: center; flex: none;
        width: 34px; height: 34px; border-radius: 10px;
        background: var(--amber-soft); color: var(--amber);
      }
      .paso7-punch {
        margin-top: 2px; padding: 12px 15px; border-radius: 14px;
        background: var(--navy); color: #fff; font-weight: 600; font-size: 1rem; line-height: 1.45;
      }

      @media (max-width: 620px) {
        .paso7-bubble { font-size: 0.98rem; }
        .paso7-signal { font-size: 0.94rem; }
        .paso7-punch { font-size: 0.94rem; }
      }
    `,
  };
})();
