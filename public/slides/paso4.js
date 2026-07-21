/* Paso 4 (índice 3) — Mi primer hackeo. Un párrafo + imagen animada.
   El botón "RECLAMAR AHORA" abre un dialog que revive el hackeo paso a paso. */
(() => {
  'use strict';
  const IMG_SRC = '/assets/hackeo.jpg';
  const VIDEO_SRC = '/assets/hackeo.mp4';

  function visual() {
    return `
      <div class="paso4-phone">
        <div class="paso4-notch"></div>
        <div class="paso4-screen">
          <video class="paso4-media paso4-vid" src="${VIDEO_SRC}" playsinline muted loop preload="metadata" style="display:none"></video>
          <img class="paso4-media paso4-img" src="${IMG_SRC}" alt="" style="display:none" />
          <div class="paso4-bait">
            <div class="paso4-steam">STEAM</div>
            <div class="paso4-glow"></div>
            <div class="paso4-fifty">$50</div>
            <div class="paso4-free">GRATIS</div>
            <button class="paso4-claim" id="paso4-claim" type="button">RECLAMAR AHORA</button>
            <div class="paso4-shine"></div>
          </div>
        </div>
      </div>`;
  }

  // pasos de la reconstrucción del hackeo (dentro del dialog)
  function hackSteps(ctx) {
    return [
      {
        story: true,
        screen: `<div class="paso4-story">
          <div class="kicker">${ctx.icon('alertTriangle', { size: 14 })} Mi primer hackeo</div>
          <h2 class="paso4-title">Así me hackearon <span class="hl">la primera vez</span></h2>
          <p class="paso4-p">
            Un TikTok: <b>«Steam regala $50»</b>. Entré, puse mis datos en una web <b>idéntica</b> a
            la real y di dos códigos que llegaron… <b>en ruso</b>. Minutos después, mi cuenta ya no
            era mía.
          </p>
          <div class="pill-navy">${ctx.icon('lock', { size: 18 })} Con esos códigos, <span class="hl">yo mismo aprobé el robo</span>.</div>
        </div>`,
      },
      {
        screen: `<div class="paso4-fake steam">
          <div class="paso4-fake-logo">STEAM</div>
          <div class="paso4-fake-field">jose_rd</div>
          <div class="paso4-fake-field">••••••••••</div>
          <div class="paso4-fake-btn">Iniciar sesión</div>
        </div>`,
        cap: 'Puse mi usuario y contraseña en la página <b>idéntica</b> a Steam.',
      },
      {
        screen: `<div class="paso4-fake steam">
          <div class="paso4-fake-logo">Steam Guard</div>
          <div class="paso4-fake-ru">Введите код подтверждения</div>
          <div class="paso4-fake-code">4&nbsp;8&nbsp;2&nbsp;1&nbsp;3</div>
          <div class="paso4-fake-btn">Отправить</div>
        </div>`,
        cap: 'Me pidió un código… <b>en ruso</b>. Por ignorante, lo puse.',
      },
      {
        screen: `<div class="paso4-fake steam">
          <div class="paso4-fake-err">Ошибка. Повторите вход.</div>
          <div class="paso4-fake-ru">Введите код подтверждения</div>
          <div class="paso4-fake-code">9&nbsp;0&nbsp;5&nbsp;7&nbsp;7</div>
          <div class="paso4-fake-btn">Отправить</div>
        </div>`,
        cap: '"Algo salió mal, entra de nuevo." Llegó <b>otro</b> código. Lo volví a poner.',
      },
      {
        screen: `<div class="paso4-fake danger">
          <div class="paso4-fake-alert">${ctx.icon('alertTriangle', { size: 44, sw: 1.7 })}</div>
          <div class="paso4-fake-ru">Ваш пароль был изменён</div>
          <div class="paso4-fake-sub">Tu contraseña fue cambiada con éxito</div>
        </div>`,
        cap: 'Y ya. En <b>segundos</b>, la cuenta dejó de ser mía.',
      },
      {
        reveal: true,
        screen: `<div class="paso4-reveal">
          <div class="icon-chip red" style="width:64px;height:64px;border-radius:18px">${ctx.icon('lock', { size: 32 })}</div>
          <h3>Me robaron en 30 segundos</h3>
          <p>Esos códigos eran de Steam <b>de verdad</b>. Al dárselos, aprobé el login del ladrón y el cambio de clave.</p>
          <div class="pill-navy">${ctx.icon('shieldCheck', { size: 18 })} Nunca des un código que te llega. <span class="hl">Nunca.</span></div>
        </div>`,
      },
    ];
  }

  function openHackDialog(dlg, ctx) {
    const steps = hackSteps(ctx);
    let i = 0;
    const render = () => {
      const s = steps[i];
      const last = i === steps.length - 1;
      const label = last ? 'Entendido' : s.story ? 'Ver cómo pasó' : 'Siguiente';
      dlg.innerHTML = `
        <button class="paso4-x" id="paso4-x" type="button" aria-label="Cerrar">${ctx.icon('x', { size: 18 })}</button>
        <div class="paso4-hd-body ${s.reveal ? 'is-reveal' : ''}">${s.screen}</div>
        ${s.cap ? `<p class="paso4-cap">${s.cap}</p>` : ''}
        <div class="paso4-hd-foot">
          <div class="paso4-dots">${steps.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>
          <button class="btn ${last ? '' : 'navy'} paso4-next" id="paso4-next" type="button">${label} ${ctx.icon(last ? 'check' : 'arrowRight', { size: 18 })}</button>
        </div>`;
      dlg.querySelector('#paso4-x').onclick = () => dlg.close();
      dlg.querySelector('#paso4-next').onclick = () => { if (last) dlg.close(); else { i++; render(); } };
    };
    render();
    if (!dlg.open) dlg.showModal();
    dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); }; // clic fuera cierra
  }

  function mount(container, ctx, role) {
    container.innerHTML = `
      <div class="slide paso3 paso4-${role}">
        <div class="paso4-only">${visual()}</div>
        <dialog class="paso4-hack" id="paso4-hack"></dialog>
      </div>`;

    // prioridad: video real > imagen real > ilustración animada
    const vid = container.querySelector('.paso4-vid');
    const img = container.querySelector('.paso4-img');
    const bait = container.querySelector('.paso4-bait');
    let used = false;
    if (vid) {
      vid.addEventListener('loadeddata', () => {
        if (used) return; used = true;
        vid.style.display = 'block'; if (img) img.remove(); if (bait) bait.remove();
        vid.play().catch(() => {});
      });
      vid.addEventListener('error', () => vid.remove());
    }
    if (img) {
      img.addEventListener('load', () => {
        if (used) return; used = true;
        img.style.display = 'block'; if (bait) bait.remove();
      });
      img.addEventListener('error', () => img.remove());
    }

    // clic en cualquier parte del celular (incluido "RECLAMAR AHORA") → revive el hackeo
    const phone = container.querySelector('.paso4-phone');
    const dlg = container.querySelector('#paso4-hack');
    if (phone && dlg) phone.addEventListener('click', () => openHackDialog(dlg, ctx));
  }

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[3] = {
    student(container, ctx) { mount(container, ctx, 'stu'); },
    presenter(container, ctx) { mount(container, ctx, 'pres'); },
    css: `
      .paso3 { max-width:100%; }
      /* la vista es solo el celular, centrado en el escenario */
      .paso4-only { display:flex; align-items:center; justify-content:center; width:100%; }

      /* marco de celular */
      .paso4-phone {
        position:relative; width:250px; height:500px; border-radius:40px; background:#0b1220;
        padding:11px; box-shadow:var(--shadow-lg); animation:paso4-float 5s ease-in-out infinite;
        cursor:pointer;
      }
      .paso4-pres .paso4-phone { width:300px; height:600px; }
      .paso4-stu .paso4-phone { width:200px; height:400px; }
      .paso4-notch { position:absolute; top:11px; left:50%; transform:translateX(-50%); width:120px; height:22px; background:#0b1220; border-radius:0 0 16px 16px; z-index:3; }
      .paso4-screen { position:relative; width:100%; height:100%; border-radius:30px; overflow:hidden; background:#0b1220; }
      .paso4-media { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
      .paso4-img { animation:paso4-kb 12s ease-in-out infinite alternate; }
      @keyframes paso4-float { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-12px) } }
      @keyframes paso4-kb { from{ transform:scale(1.02) } to{ transform:scale(1.14) } }

      /* ilustración animada del scam de Steam */
      .paso4-bait { position:absolute; inset:0; background:radial-gradient(120% 90% at 50% 22%, #1b2838, #0a141f); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; overflow:hidden; }
      .paso4-steam { color:#c7d5e0; font-family:var(--display); font-weight:700; letter-spacing:6px; font-size:1rem; margin-bottom:10px; }
      .paso4-glow { position:absolute; width:230px; height:230px; border-radius:50%; background:radial-gradient(circle, rgba(102,192,244,0.35), transparent 65%); animation:paso4-pulse 2.6s ease-in-out infinite; }
      .paso4-fifty { position:relative; color:#ffd166; font-family:var(--display); font-weight:700; font-size:4.4rem; line-height:1; text-shadow:0 4px 26px rgba(255,209,102,0.45); }
      .paso4-free { position:relative; color:#66c0f4; font-family:var(--display); font-weight:700; letter-spacing:9px; font-size:1.15rem; }
      .paso4-claim { position:relative; margin-top:20px; border:none; background:#66c0f4; color:#0a141f; font-family:var(--display); font-weight:700; font-size:0.8rem; padding:11px 20px; border-radius:999px; cursor:pointer; animation:paso4-pulse2 1.8s ease-in-out infinite; }
      .paso4-claim:active { transform:scale(0.96); }
      @keyframes paso4-pulse { 0%,100%{ transform:scale(0.9); opacity:0.65 } 50%{ transform:scale(1.15); opacity:1 } }
      @keyframes paso4-pulse2 { 0%,100%{ transform:scale(1); box-shadow:0 0 0 0 rgba(102,192,244,0.5) } 50%{ transform:scale(1.05); box-shadow:0 0 0 12px rgba(102,192,244,0) } }
      .paso4-shine { position:absolute; top:0; left:-60%; width:50%; height:100%; background:linear-gradient(100deg, transparent, rgba(255,255,255,0.16), transparent); animation:paso4-sweep 3.6s ease-in-out infinite; pointer-events:none; }
      @keyframes paso4-sweep { 0%{ left:-60% } 60%,100%{ left:120% } }

      /* ---- dialog: revivir el hackeo ---- */
      .paso4-hack {
        margin:auto; width:min(460px, calc(100vw - 32px)); border:none; border-radius:24px;
        padding:22px; background:var(--surface); color:var(--ink); box-shadow:var(--shadow-lg);
        position:relative; overflow:visible;
      }
      .paso4-hack::backdrop { background:rgba(11,18,32,0.55); backdrop-filter:blur(3px); }
      .paso4-x { position:absolute; top:12px; right:12px; width:32px; height:32px; border-radius:50%; border:none; background:var(--bg); color:var(--muted); cursor:pointer; display:flex; align-items:center; justify-content:center; }
      .paso4-x:hover { color:var(--red); }
      .paso4-hd-body { display:flex; flex-direction:column; align-items:center; }

      /* primera pantalla del dialog: la historia */
      .paso4-story { display:flex; flex-direction:column; gap:14px; width:100%; text-align:left; }
      .paso4-title { font-family:var(--display); font-weight:600; font-size:1.6rem; line-height:1.2; letter-spacing:-0.01em; color:var(--navy); }
      .paso4-p { font-size:1.02rem; line-height:1.6; color:var(--ink); margin:0; }
      .paso4-p b { color:var(--navy); font-weight:700; }
      .paso4-story .pill-navy { max-width:100%; }

      /* pantallas falsas dentro del dialog */
      .paso4-fake { width:100%; border-radius:16px; padding:22px 18px; display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; }
      .paso4-fake.steam { background:radial-gradient(120% 100% at 50% 0%, #1b2838, #0a141f); color:#c7d5e0; }
      .paso4-fake.danger { background:#2a0e12; color:#ffd7db; }
      .paso4-fake-logo { font-family:var(--display); font-weight:700; letter-spacing:4px; color:#66c0f4; font-size:1.1rem; margin-bottom:4px; }
      .paso4-fake-field { width:100%; max-width:240px; background:rgba(255,255,255,0.08); border-radius:8px; padding:10px 12px; font-family:var(--mono); font-size:0.9rem; color:#e6eefb; text-align:left; }
      .paso4-fake-ru { font-family:var(--mono); font-size:0.9rem; color:#9fb3cf; }
      .paso4-fake-code { font-family:var(--mono); font-weight:700; font-size:1.8rem; letter-spacing:2px; color:#fff; }
      .paso4-fake-err { color:#ff7a85; font-family:var(--mono); font-size:0.85rem; }
      .paso4-fake-btn { margin-top:4px; background:#66c0f4; color:#0a141f; font-family:var(--display); font-weight:700; font-size:0.82rem; padding:9px 22px; border-radius:8px; }
      .paso4-fake-alert { color:#ff5566; }
      .paso4-fake-sub { font-size:0.82rem; color:#e9b7bd; }
      .paso4-cap { text-align:center; color:var(--ink); font-size:0.98rem; line-height:1.5; margin:14px 4px 4px; }
      .paso4-cap b { color:var(--navy); font-weight:700; }

      /* pantalla de reveal dentro del dialog */
      .paso4-reveal { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; padding:6px 4px; }
      .paso4-reveal h3 { font-family:var(--display); font-weight:700; font-size:1.3rem; color:var(--navy); }
      .paso4-reveal p { color:var(--muted); font-size:0.95rem; line-height:1.55; }
      .paso4-reveal p b { color:var(--navy); }

      .paso4-hd-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:18px; }
      .paso4-dots { display:flex; gap:6px; }
      .paso4-dots span { width:7px; height:7px; border-radius:50%; background:var(--line-2); }
      .paso4-dots span.on { background:var(--blue); }
      .paso4-next { padding:11px 20px; font-size:0.9rem; }

      @media (max-width:620px){
        .paso4-phone, .paso4-stu .paso4-phone, .paso4-pres .paso4-phone { width:210px; height:420px; padding:9px; border-radius:34px; }
        .paso4-notch { width:96px; height:18px; top:9px; }
        .paso4-screen { border-radius:26px; }
        .paso4-steam { font-size:0.85rem; letter-spacing:5px; margin-bottom:8px; }
        .paso4-glow { width:190px; height:190px; }
        .paso4-fifty { font-size:3.6rem; }
        .paso4-free { font-size:0.95rem; letter-spacing:6px; }
        .paso4-claim { font-size:0.72rem; padding:9px 16px; margin-top:16px; }
        .paso4-title { font-size:1.35rem; }
        .paso4-p { font-size:0.95rem; line-height:1.55; }
        .paso4-story .pill-navy { font-size:0.86rem; padding:10px 14px; }
      }
      @media (max-width:400px){
        .paso4-phone, .paso4-stu .paso4-phone, .paso4-pres .paso4-phone { width:180px; height:360px; }
        .paso4-fifty { font-size:3.1rem; }
      }
    `,
  };
})();
