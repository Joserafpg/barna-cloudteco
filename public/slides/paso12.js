/* ===========================================================
   PASO 12 · "Cierre + quiz"  ->  window.BARNA_SLIDES[11]
   Cierre de la clase. Tres bloques:
     A) Recomendaciones finales (mismo look en alumno y profe)
     B) Compromisos          (solo alumno · 3 inputs + guardar)
     C) Quiz de repaso       (solo profe · proyectado, se revela
                              la correcta al hacer click)
   El alumno no ve el quiz (lo responde el salón en voz alta).
   =========================================================== */
(() => {
  'use strict';

  // ---------- A · reglas de oro (mismo componente en ambos roles) ----------
  const RULES = [
    { icon: 'shieldCheck',   chip: 'green', t: 'Activa el 2FA' },
    { icon: 'key',           chip: 'navy',  t: 'Clave larga: una frase' },
    { icon: 'hash',          chip: 'navy',  t: 'Tu código no se comparte' },
    { icon: 'eye',           chip: 'navy',  t: 'Revisa la URL antes de teclear' },
    { icon: 'alertTriangle', chip: 'amber', t: 'Urgencia + dinero = estafa' },
    { icon: 'user',          chip: 'navy',  t: 'Ante la duda, verifica aparte' },
  ];

  // ---------- C · preguntas del quiz (correct = índice de la opción buena) ----------
  const QUIZ = [
    { q: 'Te llega un código de 6 dígitos y un amigo te lo pide. ¿Qué haces?',
      options: ['No lo compartas NUNCA', 'Se lo paso si es mi amigo', 'Lo comparto si dice urgente'],
      correct: 0 },
    { q: '¿Cuál es la más segura?',
      options: ['P@s5!', 'PerroAzulComeArroz2', '123456', 'tunombre'],
      correct: 1 },
    { q: 'El candado (https) significa que la página es…',
      options: ['Segura y confiable', 'Solo que va cifrada', 'Del gobierno'],
      correct: 1 },
    { q: '¿Cuál URL es la real de Microsoft?',
      options: ['rnicrosoft.com', 'microsoft.com', 'microsoft-seguro.net'],
      correct: 1 },
    { q: '¿Qué es lo primero que debe tener tu correo?',
      options: ['Una foto bonita', 'La contraseña más fuerte y 2FA', 'Nada especial'],
      correct: 1 },
    { q: 'Te escriben "Mami cambié de número, mándame dinero". ¿Qué haces?',
      options: ['Le mando', 'Llamo al número viejo para verificar', 'Le pregunto cuánto necesita'],
      correct: 1 },
  ];

  const LETTERS = ['A', 'B', 'C', 'D'];

  // ---------- estado local del ALUMNO (persiste entre re-render del paso) ----------
  let committed = false;
  const savedItems = ['', '', ''];

  // ---------- estado local del PRESENTADOR (sobrevive a los re-render) ----------
  let qIndex = 0;      // pregunta actual del quiz
  let revealed = false; // si ya se reveló la respuesta de la pregunta actual

  // -------------------- markup compartido (bloque A) --------------------
  function rulesGrid(ctx) {
    const cards = RULES.map((r) => `
      <div class="paso12-rule">
        <div class="icon-chip ${r.chip} paso12-rule-chip">${ctx.icon(r.icon, { size: 20, sw: 1.9 })}</div>
        <div class="paso12-rule-txt">${r.t}</div>
      </div>`).join('');
    return `<div class="paso12-rules">${cards}</div>`;
  }

  function thanks(ctx) {
    return `
      <div class="paso12-thanks">
        <div class="paso12-thanks-msg">${ctx.icon('shieldCheck', { size: 20 })} ¡Gracias!</div>
        <img class="logo-navy paso12-logo" src="/assets/barna-blanco.webp" alt="Barna" />
      </div>`;
  }

  // ==========================================================
  //  ALUMNO — A (reglas) + B (compromisos)
  // ==========================================================
  function studentMarkup(ctx) {
    return `
      <div class="slide paso12 paso12-stu">
        <div class="kicker">${ctx.icon('shieldCheck', { size: 14 })} Cierre de la clase</div>
        <h2 class="q">Tus <span class="hl">reglas de oro</span> para no caer</h2>

        ${rulesGrid(ctx)}

        <div class="paso12-commit" id="paso12-commit">
          ${committed ? commitDone(ctx) : commitForm(ctx)}
        </div>

        ${thanks(ctx)}
      </div>`;
  }

  function commitForm(ctx) {
    const rows = [0, 1, 2].map((i) => `
      <label class="paso12-fieldrow">
        <span class="paso12-num">${i + 1}</span>
        <input class="field paso12-field" id="paso12-c${i}" maxlength="90"
          placeholder="Mi compromiso ${i + 1}" autocomplete="off"
          value="${ctx.escapeHtml(savedItems[i])}" />
      </label>`).join('');
    return `
      <div class="paso12-commit-head">${ctx.icon('target', { size: 18 })} Escribe tus 3 compromisos</div>
      <div class="paso12-fields">${rows}</div>
      <button class="btn paso12-save" id="paso12-save" disabled>
        Guardar mis compromisos ${ctx.icon('checkCircle', { size: 20 })}
      </button>
      <div class="paso12-hint">Escribe los tres para poder guardarlos.</div>`;
  }

  function commitDone(ctx) {
    const list = savedItems
      .filter((s) => s.trim())
      .map((s) => `<li>${ctx.icon('check', { size: 16 })} ${ctx.escapeHtml(s)}</li>`)
      .join('');
    return `
      <div class="paso12-confirm">
        <div class="icon-chip green paso12-confirm-chip">${ctx.icon('checkCircle', { size: 28 })}</div>
        <div class="paso12-confirm-body">
          <div class="paso12-confirm-title">Guardado. Cúmplelos empezando hoy.</div>
          <ul class="paso12-confirm-list">${list}</ul>
        </div>
      </div>`;
  }

  function wireStudent(container, ctx) {
    if (committed) return; // ya guardó: nada que enganchar
    const host = container.querySelector('#paso12-commit');
    const inputs = [0, 1, 2].map((i) => container.querySelector('#paso12-c' + i));
    const btn = container.querySelector('#paso12-save');
    if (!btn || inputs.some((el) => !el)) return;

    const allFilled = () => inputs.every((el) => el.value.trim());
    const sync = () => {
      inputs.forEach((el, i) => { savedItems[i] = el.value; }); // persistir lo tecleado
      btn.disabled = !allFilled();
    };
    inputs.forEach((el) => {
      el.addEventListener('input', sync);
      el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); save(); } });
    });

    const save = () => {
      if (!allFilled()) return; // no guardar vacío
      const items = inputs.map((el) => el.value.trim());
      items.forEach((v, i) => { savedItems[i] = v; });
      committed = true;
      ctx.sendWs({ type: 'commitments', items });
      // confirmación limpia sin re-renderizar todo el paso
      if (host) host.innerHTML = commitDone(ctx);
    };
    btn.addEventListener('click', save);
    sync();
  }

  // ==========================================================
  //  PRESENTADOR — A (reglas) + C (quiz) · o cierre "¡Gracias!"
  // ==========================================================
  function presenterMarkup(ctx) {
    const item = QUIZ[qIndex];
    const last = qIndex === QUIZ.length - 1;

    const opts = item.options.map((opt, i) => {
      const state = revealed ? (i === item.correct ? ' correct' : ' wrong') : '';
      const badge = revealed
        ? ctx.icon(i === item.correct ? 'checkCircle' : 'xCircle', { size: 22 })
        : LETTERS[i];
      return `
        <button class="paso12-opt${state}${revealed ? ' revealed' : ''}" data-i="${i}" type="button">
          <span class="paso12-opt-badge">${badge}</span>
          <span class="paso12-opt-txt">${ctx.escapeHtml(opt)}</span>
        </button>`;
    }).join('');

    return `
      <div class="slide paso12 paso12-pres">
        <div class="kicker">${ctx.icon('shieldCheck', { size: 14 })} Cierre · reglas de oro</div>
        ${rulesGrid(ctx)}

        <div class="paso12-quiz">
          <div class="paso12-quiz-head">
            <div class="kicker">${ctx.icon('target', { size: 14 })} Quiz de repaso · Pregunta ${qIndex + 1} de ${QUIZ.length}</div>
            <div class="paso12-quiz-hint">${ctx.icon('users', { size: 15 })} El salón responde en voz alta</div>
          </div>
          <h3 class="paso12-quiz-q">${ctx.escapeHtml(item.q)}</h3>
          <div class="paso12-opts">${opts}</div>
          <div class="paso12-quiz-foot">
            <button class="btn navy paso12-next" id="paso12-next" type="button">
              ${last ? 'Terminar' : 'Siguiente pregunta'} ${ctx.icon('arrowRight', { size: 18 })}
            </button>
          </div>
        </div>
      </div>`;
  }

  function finaleMarkup(ctx) {
    return `
      <div class="slide paso12 paso12-pres paso12-finale">
        <div class="icon-chip green paso12-finale-chip">${ctx.icon('trophy', { size: 40 })}</div>
        <h2 class="q paso12-finale-title">¡Gracias!</h2>
        <p class="paso12-finale-sub">Cuídate en internet y comparte hoy mismo lo que aprendiste.</p>
        ${rulesGrid(ctx)}
        <img class="logo-navy paso12-finale-logo" src="/assets/barna-blanco.webp" alt="Barna" />
        <button class="btn ghost paso12-restart" id="paso12-restart" type="button">
          Repetir quiz ${ctx.icon('refresh', { size: 18 })}
        </button>
      </div>`;
  }

  // revela la correcta (verde) y las incorrectas (rojo tenue), sin re-render total
  function applyReveal(container, item, ctx) {
    container.querySelectorAll('.paso12-opt').forEach((btn, i) => {
      btn.classList.add('revealed', i === item.correct ? 'correct' : 'wrong');
      const badge = btn.querySelector('.paso12-opt-badge');
      if (badge) badge.innerHTML = ctx.icon(i === item.correct ? 'checkCircle' : 'xCircle', { size: 22 });
    });
  }

  function wirePresenter(container, ctx) {
    const item = QUIZ[qIndex];
    if (!revealed) {
      container.querySelectorAll('.paso12-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (revealed) return;
          revealed = true;
          applyReveal(container, item, ctx);
        });
      });
    }
    const next = container.querySelector('#paso12-next');
    if (next) next.addEventListener('click', () => {
      qIndex += 1;
      revealed = false;
      ctx.render();
    });
  }

  // ==========================================================
  //  REGISTRO DEL MÓDULO
  // ==========================================================
  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[11] = {
    student(container, ctx) {
      container.innerHTML = studentMarkup(ctx);
      wireStudent(container, ctx);
    },
    presenter(container, ctx) {
      if (qIndex >= QUIZ.length) {
        container.innerHTML = finaleMarkup(ctx);
        const r = container.querySelector('#paso12-restart');
        if (r) r.addEventListener('click', () => { qIndex = 0; revealed = false; ctx.render(); });
        return;
      }
      container.innerHTML = presenterMarkup(ctx);
      wirePresenter(container, ctx);
    },

    css: `
      /* ---- layout general del paso ---- */
      .paso12.slide { gap: 20px; }
      .paso12-stu.slide { justify-content: flex-start; padding-top: 8px; padding-bottom: 24px; }
      .paso12-pres.slide { gap: 22px; }

      /* ---- A · tarjetas de recomendación (mismo look en ambos roles) ---- */
      .paso12-rules { display: grid; grid-template-columns: 1fr; gap: 12px; }
      .paso12-rule {
        display: flex; align-items: center; gap: 13px;
        background: var(--surface); border: 1px solid var(--line);
        border-radius: 16px; padding: 12px 15px; box-shadow: var(--shadow-sm);
      }
      .paso12-rule-chip { width: 40px; height: 40px; border-radius: 12px; flex: none; }
      .paso12-rule-txt {
        font-family: var(--display); font-weight: 600; font-size: 0.98rem;
        line-height: 1.28; color: var(--navy);
        min-width: 0; overflow-wrap: anywhere;
      }

      /* ---- B · compromisos del alumno ---- */
      .paso12-commit {
        display: flex; flex-direction: column; gap: 13px;
        background: var(--surface-2); border: 1px solid var(--line);
        border-radius: 20px; padding: 20px;
      }
      .paso12-commit-head {
        display: inline-flex; align-items: center; gap: 9px;
        font-family: var(--display); font-weight: 700; font-size: 1.1rem; color: var(--navy);
      }
      .paso12-commit-head .ic { color: var(--blue); }
      .paso12-fields { display: flex; flex-direction: column; gap: 10px; }
      .paso12-fieldrow { display: flex; align-items: center; gap: 11px; }
      .paso12-num {
        flex: none; width: 28px; height: 28px; border-radius: 9px;
        display: inline-flex; align-items: center; justify-content: center;
        font-family: var(--mono); font-weight: 700; font-size: 0.85rem;
        background: var(--blue-soft); color: var(--blue);
      }
      .paso12-commit .field.paso12-field {
        max-width: none; text-align: left; flex: 1; min-width: 0;
        font-size: 1rem; padding: 13px 14px;
      }
      .paso12-save { align-self: flex-start; }
      .paso12-hint { font-family: var(--body); font-size: 0.85rem; color: var(--muted); }

      /* confirmación tras guardar */
      .paso12-confirm {
        display: flex; align-items: flex-start; gap: 14px;
        background: var(--green-soft); border: 1px solid #bfe6d3;
        border-radius: 18px; padding: 18px 20px;
      }
      .paso12-confirm-chip { flex: none; width: 48px; height: 48px; border-radius: 14px; }
      .paso12-confirm-body { min-width: 0; }
      .paso12-confirm-title {
        font-family: var(--display); font-weight: 700; font-size: 1.1rem;
        color: var(--green); margin-bottom: 9px;
      }
      .paso12-confirm-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
      .paso12-confirm-list li {
        display: flex; align-items: flex-start; gap: 8px;
        font-family: var(--display); font-weight: 600; font-size: 0.98rem;
        line-height: 1.35; color: var(--navy);
        min-width: 0; overflow-wrap: anywhere;
      }
      .paso12-confirm-list li .ic { color: var(--green); flex: none; margin-top: 2px; }

      /* ---- C · quiz (solo profe) ---- */
      .paso12-quiz {
        display: flex; flex-direction: column; gap: 14px;
        background: var(--surface); border: 1px solid var(--line);
        border-radius: 22px; padding: 22px 24px; box-shadow: var(--shadow-sm);
      }
      .paso12-quiz-head {
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 10px;
      }
      .paso12-quiz-hint {
        display: inline-flex; align-items: center; gap: 7px;
        font-family: var(--mono); font-size: 0.76rem; color: var(--muted);
      }
      .paso12-quiz-hint .ic { color: var(--blue); }
      .paso12-quiz-q {
        font-family: var(--display); font-weight: 600; font-size: 1.6rem;
        line-height: 1.2; color: var(--navy);
      }
      .paso12-opts { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 2px; }
      .paso12-opt {
        display: flex; align-items: center; gap: 14px; text-align: left; width: 100%;
        background: var(--surface); border: 2px solid var(--line); border-radius: 16px;
        padding: 15px 18px; cursor: pointer; font: inherit;
        transition: border-color .18s, background .18s, box-shadow .18s, transform .12s, opacity .18s;
      }
      .paso12-opt:hover { border-color: var(--blue); box-shadow: var(--shadow-sm); }
      .paso12-opt:active { transform: scale(0.99); }
      .paso12-opt.revealed { cursor: default; }
      .paso12-opt.revealed:hover { box-shadow: none; }
      .paso12-opt-badge {
        flex: none; width: 38px; height: 38px; border-radius: 11px;
        display: inline-flex; align-items: center; justify-content: center;
        font-family: var(--display); font-weight: 700; font-size: 1.05rem;
        background: var(--blue-soft); color: var(--blue);
      }
      .paso12-opt-txt {
        font-family: var(--display); font-weight: 600; font-size: 1.05rem;
        line-height: 1.3; color: var(--navy);
        min-width: 0; overflow-wrap: anywhere;
      }
      /* correcta = verde sólido claro */
      .paso12-opt.correct { border-color: var(--green); background: var(--green-soft); }
      .paso12-opt.correct .paso12-opt-badge { background: var(--green); color: #fff; }
      .paso12-opt.correct .paso12-opt-txt { color: var(--green); }
      /* incorrecta = rojo tenue */
      .paso12-opt.wrong { border-color: var(--line); background: var(--surface); opacity: 0.5; }
      .paso12-opt.wrong .paso12-opt-badge { background: var(--red-soft); color: var(--red); }
      .paso12-opt.wrong .paso12-opt-txt { color: var(--muted); }
      .paso12-quiz-foot { display: flex; justify-content: flex-end; margin-top: 2px; }

      /* ---- cierre "¡Gracias!" (alumno) ---- */
      .paso12-thanks {
        display: flex; flex-direction: column; align-items: center; gap: 10px;
        margin-top: 4px; padding-top: 4px;
      }
      .paso12-thanks-msg {
        display: inline-flex; align-items: center; gap: 9px;
        font-family: var(--display); font-weight: 700; font-size: 1.25rem; color: var(--navy);
      }
      .paso12-thanks-msg .ic { color: var(--green); }
      .paso12-logo { height: 26px; }

      /* ---- cierre "¡Gracias!" (profe · foco) ---- */
      .paso12-finale { align-items: center; text-align: center; justify-content: center; gap: 16px; }
      .paso12-finale-chip { width: 88px; height: 88px; border-radius: 26px; }
      .paso12-finale-title { font-size: 3rem; }
      .paso12-finale-sub {
        font-family: var(--display); font-weight: 500; font-size: 1.2rem;
        color: var(--muted); max-width: 560px;
      }
      .paso12-finale .paso12-rules {
        grid-template-columns: repeat(3, 1fr); width: 100%; max-width: 820px; margin-top: 4px;
      }
      .paso12-finale-logo { height: 34px; margin-top: 4px; }
      .paso12-restart { margin-top: 2px; }

      /* ---- responsive: profe (ancho) en rejilla; celular en 1 col ---- */
      @media (min-width: 700px) {
        .paso12-rules { grid-template-columns: repeat(3, 1fr); }
        .paso12-opts { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 620px) {
        .paso12-stu.slide { gap: 16px; }
        /* B · compromisos cómodos y sin bordes pegados */
        .paso12-commit { padding: 16px; border-radius: 18px; gap: 12px; }
        .paso12-commit-head { font-size: 1.05rem; }
        .paso12-fieldrow { gap: 10px; }
        .paso12-commit .field.paso12-field { font-size: 1.02rem; padding: 15px 14px; }
        /* botón Guardar grande: ocupa todo el ancho */
        .paso12-save { align-self: stretch; width: 100%; padding: 16px 22px; }
        .paso12-confirm { padding: 16px; }
        /* quiz (por si el profe abre en pantalla estrecha) */
        .paso12-quiz { padding: 18px; }
        .paso12-quiz-q { font-size: 1.3rem; }
        .paso12-opt { padding: 14px 15px; gap: 12px; }
        .paso12-finale-title { font-size: 2.2rem; }
        .paso12-finale .paso12-rules { grid-template-columns: 1fr; }
      }
    `,
  };
})();
