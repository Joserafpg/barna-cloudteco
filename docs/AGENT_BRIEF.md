# Brief para construir un paso (slide) — Barna Ciberseguridad

Clase interactiva de ciberseguridad para jóvenes. La laptop del profe (`/admin`) controla
en qué paso está la clase; los celulares de los alumnos (`/`) siguen en vivo por WebSocket.
Tú construyes **un archivo de paso** en `public/slides/pasoN.js`. No toques `app.js`,
`styles.css` ni `index.html` — solo crea/edita tu(s) archivo(s) `pasoN.js`.

## Regla de oro del diseño
1. **NADA de emojis.** Usa SIEMPRE `ctx.icon('nombre', { size, sw })` (SVG line, tipo Lucide).
2. **Cliente y presentador casi idénticos.** El mismo paso se ve igual en el celular del alumno
   y en el proyector del profe. El profe ve la versión completa/grande y los datos agregados;
   el alumno ve lo mismo pero con su parte interactiva. Comparte el markup entre `student` y `presenter`.
3. **Blanco, limpio, delicado, "young".** Estilo de los posts de Barna: mucho aire, tipografía
   fina (peso 500–600), palabras clave resaltadas en periwinkle con `<span class="hl">palabra</span>`,
   píldoras navy con iconos de línea (`.pill-navy`).
4. **Colores "clarito" y sólidos** (tintes claros opacos), nunca transparentes ni oscuros/pesados.
5. Reutiliza las clases existentes: `.slide`, `.slide .kicker`, `.slide .q`, `.hl`, `.pill-navy`,
   `.icon-chip` (+ `.navy/.red/.green/.amber`), `.btn` (+ `.navy/.ghost/.danger`), `.field`.
   Mira `public/app.js` (funciones `pollView` y `presenterJoinQR`) y `public/styles.css` como
   referencia EXACTA del estilo — cópialo. Solo agrega CSS propio mínimo en `mod.css`, con clases
   prefijadas `pasoN-...` para no chocar.

## Tokens CSS disponibles (variables globales, ya definidas)
`--navy:#14284d` (primario)  `--blue:#2f5bd8`  `--blue-soft:#e9eefb`  `--hl:#c6d2f0` (periwinkle)
`--bg:#f3f4f7`  `--surface:#fff`  `--ink:#0f1e38`  `--muted:#66799b`  `--line:#e4ebf6`
`--red:#e5484d`  `--green:#12885c`  `--amber:#c77700`
`--mono` (JetBrains Mono)  `--display` (Space Grotesk)  `--body` (Inter)  `--radius:20px`
Sombras: `--shadow-sm`, `--shadow`, `--shadow-lg`.

## API `ctx` (segundo argumento de student/presenter)
- `ctx.icon(name, {size=24, sw=1.9})` → string SVG. Iconos disponibles:
  `shield shieldAlert shieldCheck lock lockOpen alertTriangle check checkCircle x xCircle eye
   key fingerprint wifi mail message user users phone atSign hash arrowRight arrowLeft
   chevronRight chevronLeft trophy target zap scan clock refresh`
- `ctx.escapeHtml(s)` → escapa texto de usuario (ÚSALO siempre con nombres/inputs).
- `ctx.el(tag, cls)` → crea elemento.
- `ctx.sendWs(obj)` → manda mensaje al servidor. Tipos que el servidor entiende:
  - `{ type:'vote', slide, option }`  (encuesta; un voto por alumno)
  - `{ type:'capture', user, pass }`  (login falso; llega SOLO al profe; NO se guarda en disco)
  - `{ type:'cipher', name }`         (el servidor cifra el nombre A=01 y lo difunde en `ciphers`)
  - `{ type:'quiz_answer', q, choice, correct, ms }`  (respuesta de quiz con puntos por rapidez)
  - `{ type:'commitments', items:[a,b,c] }`  (compromisos del alumno)
- `ctx.cache` (léelo para pintar datos en vivo):
  - `cache.polls[slide]` = `{ counts:{opt:n}, total }`
  - `cache.captures` = `[{ name, user, pass, at }]`  (lo que escribieron en el login falso)
  - `cache.roster` = `[{ id, name, slide }]`
  - `cache.ciphers` = `[{ id, name, encoded }]`  (nombres cifrados A=01, ej "10-15-19-05")
  - `cache.ranking` = `[{ id, name, points, answered }]`  (quiz, ya ordenado desc)
- `ctx.me` = `{ role, id, name }`   ·   `ctx.role` = 'student' | 'presenter'
- `ctx.S` = `{ slide, unlocked, count }`   ·   `ctx.view` = paso que mira el alumno
- `ctx.render()` → fuerza re-render (rara vez necesario).
- `ctx.POLLS` → objeto de config de encuestas. Si tu paso es tipo encuesta, registra
  `ctx.POLLS[N] = { q, options:[{k,label,color,soft,icon}] }` para que el motor lo actualice en vivo.

## Comportamiento del render (IMPORTANTE)
- El **presentador** re-renderiza en cada dato nuevo → tu `presenter(container, ctx)` debe pintarse
  SIEMPRE desde `ctx.cache` (sin estado propio). Cuando llega un dato nuevo, se te llama otra vez.
- El **alumno** solo re-renderiza al cambiar de paso → su input local (lo que escribe) NO se borra.
  Maneja la interacción del alumno con eventos y estado en variables de tu módulo.

## Contenedores
- `student(container, ...)`: `container` es un `.center-screen` (flex, centrado). Mete adentro un
  `<div class="slide">…</div>`. En celular hay un logo fijo arriba-izquierda; deja ~50px de aire arriba.
- `presenter(container, ...)`: `container` es `.pres-stage`. Abajo-centro flota el HUD de controles;
  deja ~110px de aire abajo (ya hay padding). Mete un `<div class="slide">…</div>`.

## Patrón del módulo
```js
window.BARNA_SLIDES = window.BARNA_SLIDES || {};
window.BARNA_SLIDES[N] = {
  student(container, ctx) {
    container.innerHTML = `<div class="slide"> ... </div>`;
    // enganchar eventos con container.querySelector(...)
  },
  presenter(container, ctx) {
    container.innerHTML = `<div class="slide"> ... </div>`;
  },
  css: `
    .pasoN-algo { ... }
  `,
};
```

## Ejemplo de estructura de una diapositiva (cópiala como base)
```html
<div class="slide">
  <div class="kicker">${ctx.icon('shield', {size:14})} Etiqueta corta</div>
  <h2 class="q">Título con una <span class="hl">palabra</span> resaltada</h2>
  <!-- contenido: píldoras, tiles, texto, etc. -->
</div>
```
`.slide .q` ya es grande (2.3rem) y navy; `.kicker` es mono azul en mayúsculas.

Verifica siempre `node --check public/slides/pasoN.js` antes de terminar.
