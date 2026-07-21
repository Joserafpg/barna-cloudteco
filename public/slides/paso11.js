/* ===========================================================
   Paso 11 · Hash real  (window.BARNA_SLIDES[10])
   Demo de SHA-256: escribe una clave y mira su huella digital.
   Alumno y profe casi idénticos (misma vista compartida).
   =========================================================== */
(() => {
  'use strict';

  const PLACEHOLDER = 'El hash SHA-256 aparecerá aquí…';

  // estado local (persiste entre re-renders del módulo)
  let lastText = '';
  let lastHash = '';
  let focused = false;

  // SHA-256 -> hex. crypto.subtle devuelve Promise; exige contexto seguro (https/localhost).
  function sha256hex(text) {
    if (!(window.crypto && window.crypto.subtle)) {
      return Promise.reject(new Error('no-subtle'));
    }
    return window.crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(text))
      .then((buf) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      );
  }

  // vista compartida por alumno y profe
  function build(container, ctx) {
    const { icon, escapeHtml } = ctx;
    const hasHash = !!lastHash;

    container.innerHTML = `
      <div class="slide">
        <div class="kicker">${icon('hash', { size: 14 })} Hash</div>
        <h2 class="q">La <span class="hl">huella digital</span> de tu contraseña.</h2>
        <p class="paso11-guide">${icon('zap', { size: 16 })} Cambia UNA sola letra y mira cómo cambia TODO.</p>
        <input class="field paso11-input" id="p11in" maxlength="64"
               placeholder="Escribe una contraseña" autocomplete="off"
               value="${escapeHtml(lastText)}" />
        <div class="paso11-hashbox ${hasHash ? 'has' : ''}" id="p11hash">${
          hasHash ? escapeHtml(lastHash) : PLACEHOLDER
        }</div>
        <div class="paso11-pills">
          <span class="pill-navy">${icon('lock', { size: 18 })} Es de una sola vía: del hash NO se puede volver a tu clave.</span>
          <span class="pill-navy">${icon('shield', { size: 18 })} Así guardan tu contraseña los sitios serios: guardan el hash, no tu clave.</span>
          <span class="pill-navy">${icon('hash', { size: 18 })} El estándar se llama SHA-256.</span>
        </div>
        <p class="paso11-remate">Por eso una contraseña larga es
          <span class="hl">carísima de romper</span> aunque roben la base de datos.</p>
      </div>`;

    const input = container.querySelector('#p11in');
    const box = container.querySelector('#p11hash');
    let timer = null;

    const compute = () => {
      const text = input.value;
      lastText = text;
      if (!text) {
        lastHash = '';
        box.textContent = PLACEHOLDER;
        box.classList.remove('has');
        return;
      }
      sha256hex(text)
        .then((hex) => {
          if (input.value !== text) return; // el usuario ya cambió el texto: descartar
          lastHash = hex;
          box.textContent = hex;
          box.classList.add('has');
        })
        .catch(() => {
          box.textContent = 'No se pudo calcular el hash en este dispositivo.';
          box.classList.remove('has');
        });
    };

    input.oninput = () => { clearTimeout(timer); timer = setTimeout(compute, 120); };
    input.onfocus = () => { focused = true; };
    input.onblur = () => { focused = false; };

    // al reconstruir (cambio de paso, o el profe recibe un dato) recalcula sin perder lo escrito
    if (lastText) compute();
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
    .paso11-hashbox {
      font-family: var(--mono); font-size: 1.05rem; line-height: 1.6; color: var(--muted);
      background: var(--surface-2); border: 1px dashed var(--line-2);
      border-radius: 16px; padding: 18px 22px; min-height: 84px;
      display: flex; align-items: center;
      overflow-wrap: anywhere; word-break: break-word;
      transition: color .2s, background .2s;
    }
    .paso11-hashbox.has {
      color: var(--navy); font-weight: 700; letter-spacing: 0.5px;
      background: var(--blue-soft); border: 1px solid transparent;
    }
    .paso11-pills { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
    .paso11-pills .pill-navy { text-align: left; align-items: flex-start; }
    .paso11-pills .pill-navy .ic { margin-top: 2px; }
    .paso11-remate { color: var(--muted); font-size: 1rem; line-height: 1.5; }
    @media (max-width: 620px) {
      .paso11-hashbox { font-size: 0.92rem; }
      .paso11-pills .pill-navy { font-size: 0.88rem; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[10] = { student, presenter, css };
})();
