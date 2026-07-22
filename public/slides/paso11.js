/* ===========================================================
   Paso 11 · Hash real  (window.BARNA_SLIDES[10])
   Demo de SHA-256: escribe una clave y mira su huella digital
   CONSTRUIRSE ficha por ficha (32 bytes). Cambia una letra y
   todo el hash cambia. Alumno y profe comparten la vista.
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

  // la huella se CONSTRUYE: cada carácter aparece en cascada, de izquierda a
  // derecha, dentro de un único bloque de texto
  function buildHash(box, hex, animate) {
    box.classList.remove('empty');
    // los caracteres van dentro de UN solo hijo: si fueran hijos directos del
    // flex no harían wrap y el hash se saldría del bloque
    box.innerHTML = `<span class="paso11-line">${[...hex]
      .map((ch, i) => `<span class="paso11-ch${animate ? ' in' : ''}"${animate ? ` style="animation-delay:${i * 11}ms"` : ''}>${ch}</span>`)
      .join('')}</span>`;
  }

  function emptyHash(box, msg) {
    box.classList.add('empty');
    box.textContent = msg;
  }

  // vista compartida por alumno y profe
  function build(container, ctx) {
    const { icon, escapeHtml } = ctx;

    container.innerHTML = `
      <div class="slide paso11">
        <div class="kicker">${icon('fingerprint', { size: 14 })} Hash</div>
        <h2 class="q">La <span class="hl">huella digital</span> de tu contraseña.</h2>
        <p class="paso11-guide">${icon('zap', { size: 16 })} Cambia UNA sola letra y mira cómo cambia TODO.</p>

        <input class="field paso11-input" id="p11in" maxlength="64"
               placeholder="Escribe una contraseña" autocomplete="off"
               autocapitalize="off" autocorrect="off" spellcheck="false"
               value="${escapeHtml(lastText)}" />

        <div class="paso11-hashwrap">
          <div class="paso11-hash empty" id="p11hash">${PLACEHOLDER}</div>
          <span class="paso11-note" id="p11note"></span>
        </div>
      </div>`;

    const input = container.querySelector('#p11in');
    const box = container.querySelector('#p11hash');
    const note = container.querySelector('#p11note');
    let timer = null;

    const NOTE_OK = 'Cambia una letra y mira: no se parece en nada.';

    // al volver al paso se repinta el hash guardado, sin re-animar
    if (lastHash) { buildHash(box, lastHash, false); note.textContent = NOTE_OK; }

    const compute = () => {
      const text = input.value;
      lastText = text;
      if (!text) {
        lastHash = '';
        emptyHash(box, PLACEHOLDER);
        note.textContent = '';
        return;
      }
      sha256hex(text)
        .then((hex) => {
          if (input.value !== text) return; // el usuario ya cambió el texto: descartar
          lastHash = hex;
          buildHash(box, hex, true);
          note.textContent = NOTE_OK;
        })
        .catch(() => {
          emptyHash(box, 'No se pudo calcular el hash en este dispositivo.');
          note.textContent = '';
        });
    };

    input.oninput = () => { clearTimeout(timer); timer = setTimeout(compute, 120); };
    input.onfocus = () => { focused = true; };
    input.onblur = () => { focused = false; };

    if (focused) {
      input.focus();
      const n = input.value.length;
      try { input.setSelectionRange(n, n); } catch (_) { /* noop */ }
    }
  }

  function student(container, ctx) { build(container, ctx); }
  function presenter(container, ctx) { build(container, ctx); }

  const css = `
    /* vista centrada y con aire, como la pantalla de cifrado del paso 10 */
    .paso11 { align-items: center; text-align: center; }
    .paso11 .kicker { align-self: center; }
    .paso11-guide {
      display: inline-flex; align-items: center; gap: 8px;
      color: var(--blue); font-family: var(--display); font-weight: 600; font-size: 1rem;
    }
    .paso11-guide .ic { color: var(--amber); }
    .paso11-input { width: 100%; max-width: 380px; text-align: center; }

    .paso11-hashwrap { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }

    /* la huella en UN bloque de texto, sin cuadritos */
    .paso11-hash {
      width: 100%; max-width: 620px; min-height: 92px;
      display: flex; align-items: center; justify-content: center;
      background: var(--blue-soft); border: 1px solid var(--hl);
      border-radius: 18px; padding: 20px 24px; box-shadow: var(--shadow-sm);
      font-family: var(--mono); font-weight: 700; font-size: 1.25rem;
      line-height: 1.7; letter-spacing: 2px; color: var(--navy);
      overflow-wrap: anywhere; word-break: break-all;
    }
    .paso11-hash.empty { color: var(--muted); font-weight: 400; font-size: 1rem; letter-spacing: 0; }
    .paso11-line { display: block; text-align: center; }
    /* la cascada: cada carácter entra con su propio retraso */
    .paso11-ch { display: inline-block; }
    .paso11-ch.in { animation: paso11In .3s cubic-bezier(.2, .8, .3, 1) both; }
    @keyframes paso11In {
      from { opacity: 0; transform: translateY(7px) scale(.8); }
      to   { opacity: 1; transform: none; }
    }
    .paso11-note { color: var(--muted); font-size: 0.92rem; }

    @media (max-width: 620px) {
      .paso11-input { max-width: none; }
      .paso11-hash { font-size: 0.95rem; letter-spacing: 1px; padding: 16px 16px; min-height: 78px; }
      .paso11-hash.empty { font-size: 0.92rem; letter-spacing: 0; }
    }
  `;

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[10] = { student, presenter, css };
})();
