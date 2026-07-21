/* ===========================================================
   Paso 11 · Hash real  (window.BARNA_SLIDES[10])
   Demo de SHA-256: escribe una clave y mira su huella digital
   calcularse (los hex se revuelven y se resuelven). Cambia una
   letra y TODO el hash cambia. Alumno y profe comparten la vista.
   =========================================================== */
(() => {
  'use strict';

  const PLACEHOLDER = 'Escribe arriba para ver su huella…';

  // estado local (persiste entre re-renders del módulo)
  let lastText = '';
  let lastHash = '';
  let focused = false;

  // SHA-256 -> hex. crypto.subtle exige contexto seguro (https/localhost).
  function sha256hex(text) {
    if (!(window.crypto && window.crypto.subtle)) return Promise.reject(new Error('no-subtle'));
    return window.crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(text))
      .then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''));
  }

  // reveal "calculándose": los hex se revuelven y se van fijando de izq a der
  let animId = null;
  function cancelAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } }
  function revealHash(el, finalHex, durMs) {
    cancelAnim();
    const HEX = '0123456789abcdef';
    const total = finalHex.length;
    const t0 = performance.now();
    const tick = (now) => {
      if (!el.isConnected) { animId = null; return; }
      const p = Math.min(1, (now - t0) / durMs);
      const locked = Math.floor(p * total);
      let s = '';
      for (let k = 0; k < total; k++) s += k < locked ? finalHex[k] : HEX[(Math.random() * 16) | 0];
      el.textContent = s;
      if (p < 1) animId = requestAnimationFrame(tick);
      else { el.textContent = finalHex; animId = null; }
    };
    animId = requestAnimationFrame(tick);
  }

  // vista compartida por alumno y profe
  function build(container, ctx) {
    const { icon, escapeHtml } = ctx;
    const hasHash = !!lastHash;

    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${icon('fingerprint', { size: 14 })} Hash</div>
        <h2 class="q">La <span class="hl">huella digital</span> de tu contraseña.</h2>
        <p class="paso11-guide">${icon('zap', { size: 16 })} Cambia UNA sola letra y mira cómo cambia TODO.</p>
        <input class="field paso11-input" id="p11in" maxlength="64"
               placeholder="Escribe una contraseña" autocomplete="off"
               autocapitalize="off" autocorrect="off" spellcheck="false"
               value="${escapeHtml(lastText)}" />
        <div class="paso11-hashwrap">
          <span class="paso11-hlabel">${icon('fingerprint', { size: 13 })} Huella · SHA-256</span>
          <div class="paso11-hash ${hasHash ? '' : 'empty'}" id="p11hash">${hasHash ? escapeHtml(lastHash) : PLACEHOLDER}</div>
        </div>
        <div class="paso11-pills">
          <span class="pill-navy">${icon('lock', { size: 18 })} Una sola vía: del hash no se vuelve a tu clave.</span>
          <span class="pill-navy">${icon('shield', { size: 18 })} Los sitios serios guardan el hash, no tu clave.</span>
          <span class="pill-navy">${icon('hash', { size: 18 })} El estándar se llama SHA-256.</span>
        </div>
        <p class="paso11-remate">Por eso una clave larga es
          <span class="hl">carísima de romper</span> aunque roben la base de datos.</p>
      </div>`;

    const input = container.querySelector('#p11in');
    const box = container.querySelector('#p11hash');
    let timer = null;

    const compute = () => {
      const text = input.value;
      lastText = text;
      if (!text) {
        lastHash = ''; cancelAnim();
        box.textContent = PLACEHOLDER; box.classList.add('empty');
        return;
      }
      sha256hex(text)
        .then((hex) => {
          if (input.value !== text) return; // el usuario ya cambió el texto: descartar
          lastHash = hex;
          box.classList.remove('empty');
          revealHash(box, hex, 500);
        })
        .catch(() => {
          cancelAnim();
          box.textContent = 'No se pudo calcular el hash en este dispositivo.';
          box.classList.add('empty');
        });
    };

    input.oninput = () => { clearTimeout(timer); timer = setTimeout(compute, 120); };
    input.onfocus = () => { focused = true; };
    input.onblur = () => { focused = false; };

    // al reconstruir (cambio de paso / dato del profe) se muestra el hash guardado, sin re-animar
    if (focused) {
      input.focus();
      const n = input.value.length;
      try { input.setSelectionRange(n, n); } catch (_) { /* noop */ }
    }
  }

  function student(container, ctx) { build(container, ctx); }
  function presenter(container, ctx) { build(container, ctx); }

  const css = `
    .paso11-guide {
      display: inline-flex; align-items: center; gap: 8px;
      color: var(--blue); font-family: var(--display); font-weight: 600; font-size: 1rem;
    }
    .paso11-guide .ic { color: var(--amber); }
    .paso11-input { max-width: 520px; text-align: left; }

    .paso11-hashwrap { display: flex; flex-direction: column; gap: 9px; }
    .paso11-hlabel {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: var(--mono); font-size: 0.68rem; letter-spacing: 1.5px;
      text-transform: uppercase; color: var(--muted); font-weight: 700;
    }
    .paso11-hlabel .ic { color: var(--blue); }
    .paso11-hash {
      font-family: var(--mono); font-size: 1.1rem; line-height: 1.75; letter-spacing: 1px;
      font-weight: 700; color: var(--navy);
      background: var(--surface-2); border-radius: 16px; padding: 20px 22px; min-height: 86px;
      display: flex; align-items: center; box-shadow: var(--shadow-sm);
      overflow-wrap: anywhere; word-break: break-all;
    }
    .paso11-hash.empty { color: var(--muted); font-weight: 400; letter-spacing: 0; font-size: 1rem; }

    .paso11-pills { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
    .paso11-pills .pill-navy { text-align: left; align-items: flex-start; }
    .paso11-pills .pill-navy .ic { margin-top: 2px; flex: none; }
    .paso11-remate { color: var(--muted); font-size: 1rem; line-height: 1.5; }

    @media (max-width: 620px) {
      .paso11-input { max-width: none; }
      .paso11-hash { font-size: 0.92rem; padding: 16px 16px; line-height: 1.7; }
      .paso11-hash.empty { font-size: 0.92rem; }
      .paso11-pills .pill-navy { font-size: 0.88rem; padding: 11px 14px; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[10] = { student, presenter, css };
})();
