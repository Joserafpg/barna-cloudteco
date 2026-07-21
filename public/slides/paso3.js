/* Paso 3 (índice 2) — Mi primer hackeo. Un párrafo + una imagen animada. */
(() => {
  'use strict';
  // Si pones una foto/screenshot aquí, se usa (animada con zoom lento).
  // Si no existe, sale la ilustración animada del scam de Steam. Video opcional.
  const IMG_SRC = '/assets/hackeo.jpg';
  const VIDEO_SRC = '/assets/hackeo.mp4';

  function visual() {
    return `
      <div class="paso3-phone">
        <div class="paso3-notch"></div>
        <div class="paso3-screen">
          <video class="paso3-media paso3-vid" src="${VIDEO_SRC}" playsinline muted loop preload="metadata" style="display:none"></video>
          <img class="paso3-media paso3-img" src="${IMG_SRC}" alt="" style="display:none" />
          <div class="paso3-bait">
            <div class="paso3-steam">STEAM</div>
            <div class="paso3-glow"></div>
            <div class="paso3-fifty">$50</div>
            <div class="paso3-free">GRATIS</div>
            <div class="paso3-claim">RECLAMAR AHORA</div>
            <div class="paso3-shine"></div>
          </div>
        </div>
      </div>`;
  }

  function mount(container, ctx, role) {
    container.innerHTML = `
      <div class="slide paso3 paso3-${role}">
        <div class="paso3-cols">
          <div class="paso3-visual">${visual()}</div>
          <div class="paso3-text">
            <div class="kicker">${ctx.icon('alertTriangle', { size: 14 })} Mi primer hackeo</div>
            <h2 class="q">Así me hackearon <span class="hl">la primera vez</span></h2>
            <p class="paso3-p">
              Todo empezó con un TikTok: <b>«Steam está regalando $50»</b>. Entré al link, puse mis
              datos en una página <b>idéntica</b> a la real, y hasta le di dos códigos que me llegaron
              por mensaje… <b>en ruso</b>. Minutos después, mi cuenta ya no era mía.
            </p>
            <div class="pill-navy">${ctx.icon('lock', { size: 18 })} Al darles esos códigos, <span class="hl">yo mismo aprobé el robo</span>.</div>
          </div>
        </div>
      </div>`;

    // prioridad: video real > imagen real > ilustración animada
    const vid = container.querySelector('.paso3-vid');
    const img = container.querySelector('.paso3-img');
    const bait = container.querySelector('.paso3-bait');
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
  }

  window.BARNA_SLIDES = window.BARNA_SLIDES || {};
  window.BARNA_SLIDES[2] = {
    student(container, ctx) { mount(container, ctx, 'stu'); },
    presenter(container, ctx) { mount(container, ctx, 'pres'); },
    css: `
      .paso3-cols { display:flex; align-items:center; gap:52px; width:100%; }
      .paso3-stu .paso3-cols { flex-direction:column; gap:24px; }
      .paso3-visual { flex:none; }
      .paso3-text { flex:1; text-align:left; }
      .paso3-p { font-size:1.2rem; line-height:1.7; color:var(--ink); margin:14px 0 22px; max-width:540px; }
      .paso3-p b { color:var(--navy); font-weight:700; }
      .paso3-stu .paso3-p { font-size:1.02rem; }
      .paso3-stu .paso3-text { text-align:center; }
      .paso3-stu .paso3-p { margin-left:auto; margin-right:auto; }
      .paso3-stu .pill-navy { margin:0 auto; }

      /* marco de celular */
      .paso3-phone {
        position:relative; width:250px; height:500px; border-radius:40px; background:#0b1220;
        padding:11px; box-shadow:var(--shadow-lg); animation:paso3-float 5s ease-in-out infinite;
      }
      .paso3-stu .paso3-phone { width:200px; height:400px; }
      .paso3-notch { position:absolute; top:11px; left:50%; transform:translateX(-50%); width:120px; height:22px; background:#0b1220; border-radius:0 0 16px 16px; z-index:3; }
      .paso3-screen { position:relative; width:100%; height:100%; border-radius:30px; overflow:hidden; background:#0b1220; }
      .paso3-media { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
      .paso3-img { animation:paso3-kb 12s ease-in-out infinite alternate; }
      @keyframes paso3-float { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-12px) } }
      @keyframes paso3-kb { from{ transform:scale(1.02) } to{ transform:scale(1.14) } }

      /* ilustración animada del scam de Steam (fallback) */
      .paso3-bait { position:absolute; inset:0; background:radial-gradient(120% 90% at 50% 22%, #1b2838, #0a141f); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; overflow:hidden; }
      .paso3-steam { color:#c7d5e0; font-family:var(--display); font-weight:700; letter-spacing:6px; font-size:1rem; margin-bottom:10px; }
      .paso3-glow { position:absolute; width:230px; height:230px; border-radius:50%; background:radial-gradient(circle, rgba(102,192,244,0.35), transparent 65%); animation:paso3-pulse 2.6s ease-in-out infinite; }
      .paso3-fifty { position:relative; color:#ffd166; font-family:var(--display); font-weight:700; font-size:4.4rem; line-height:1; text-shadow:0 4px 26px rgba(255,209,102,0.45); }
      .paso3-free { position:relative; color:#66c0f4; font-family:var(--display); font-weight:700; letter-spacing:9px; font-size:1.15rem; }
      .paso3-claim { position:relative; margin-top:20px; background:#66c0f4; color:#0a141f; font-family:var(--display); font-weight:700; font-size:0.8rem; padding:11px 20px; border-radius:999px; animation:paso3-pulse2 1.8s ease-in-out infinite; }
      @keyframes paso3-pulse { 0%,100%{ transform:scale(0.9); opacity:0.65 } 50%{ transform:scale(1.15); opacity:1 } }
      @keyframes paso3-pulse2 { 0%,100%{ transform:scale(1); box-shadow:0 0 0 0 rgba(102,192,244,0.5) } 50%{ transform:scale(1.05); box-shadow:0 0 0 12px rgba(102,192,244,0) } }
      .paso3-shine { position:absolute; top:0; left:-60%; width:50%; height:100%; background:linear-gradient(100deg, transparent, rgba(255,255,255,0.16), transparent); animation:paso3-sweep 3.6s ease-in-out infinite; }
      @keyframes paso3-sweep { 0%{ left:-60% } 60%,100%{ left:120% } }

      @media (max-width:620px){
        .paso3-cols { gap:18px; }
        .paso3-phone { width:190px; height:380px; }
      }
    `,
  };
})();
