# SPEC 02 — Página de Inicio (Home) de Arcade Vault

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-17
> **Objective:** Reemplazar la landing page actual (`/`, hoy la Biblioteca) por la nueva página de Inicio de `references/templates/home-about` — hero, por qué Arcade Vault, juegos destacados, estadísticas, actividad en vivo y precios — moviendo la Biblioteca a `/games` y actualizando el Nav y todos los enlaces internos que apuntaban a `/`.

---

## Por qué este spec toma estas decisiones

Igual que en spec 01, los archivos de `references/templates/home-about` están completamente desordenados respecto a sus nombres: `home.jsx` contiene en realidad el componente `Nav`, `about.jsx` contiene en realidad el CSS completo del tema (incluyendo las secciones de Home, About, un widget de gamepad sin usar, actividad y precios), `download (1)` contiene el `About.jsx` real, y `arcade-vault-standalone.html` es en realidad una imagen WebP. El archivo `nav.jsx`, pese a su nombre, es el bundle HTML standalone completo (con assets embebidos en base64): ningún `.jsx` de la carpeta trae el código fuente real de la página de Inicio.

Para recuperar el diseño y el copy real de Inicio se sirvió `nav.jsx` con un servidor HTTP local y se inspeccionó renderizado en el navegador (hero, 4 secciones intermedias y CTA final), extrayendo el texto exacto con la herramienta de lectura de página. Esa es la fuente de verdad para el copy de este spec, ya que el JSX original de Home no sobrevive en ningún archivo — mismo tipo de reconstrucción visual que se hizo con la pantalla de Detalle de juego en spec 01.

Dos hallazgos relevantes de esa inspección:

- Los íconos flotantes de "libro" y "globo" en la esquina inferior derecha del bundle son UI inyectada por la herramienta de previsualización del archivo de referencia (no aparecen en el árbol de texto de la página ni usan clases del tema) — se excluyen del alcance.
- Las 7 filas de "últimas puntuaciones" en la sección "Actividad en vivo" coinciden exactamente, una a una, con el campo `best` de los primeros 7 juegos de `GAMES` (p. ej. `+184.220` es el `best` de `caida`), así que esa parte de la sección se deriva de datos ya existentes en vez de inventarse.

El usuario confirmó además que la página "Acerca de" (`About.jsx`, recuperado íntegro en `download (1)`) queda fuera de este spec para uno futuro.

---

## Scope

**In:**

- Nueva ruta `/` como página de Inicio (Home) con las secciones del template: hero, "¿Por qué Arcade Vault?", "Juegos disponibles ahora" (6 juegos destacados + enlace a la biblioteca completa), bloque de estadísticas, "Actividad en vivo" (últimas puntuaciones + top jugadores de hoy), precios ($0 siempre + FAQ) y CTA final.
- Mover la Biblioteca actual (grilla con buscador y chips de categoría, hoy en `/`) a la nueva ruta `/games`, sin cambios de comportamiento.
- Actualizar `app/components/nav.tsx`: agregar el enlace "Inicio" → `/`, cambiar el enlace "Biblioteca" para que apunte a `/games`, y ajustar el resaltado de enlace activo (escritorio y panel móvil).
- Actualizar todos los enlaces y redirecciones internas que hoy apuntan a `/` asumiendo que es la Biblioteca, para que apunten a `/games`.
- Portar a `app/globals.css` el CSS del tema que falta para las secciones de Home (`.home-hero`, `.feature-grid`, `.mini-rail`, `.home-stats`, `.activity-grid`, `.pricing-grid`, `.home-final`, `.reveal`, etc.), recuperado del archivo que en realidad contiene el CSS completo (`about.jsx`).
- Un componente nuevo de tarjeta compacta de juego para el mini-rail, y los datos ficticios de "Actividad en vivo" descritos en Data model.

**Out of scope (para futuros specs):**

- La página "Acerca de" / Contacto — confirmado con el usuario, queda para un spec futuro. El enlace "Acerca de" no se agrega al Nav en este spec.
- Cualquier backend real para "Actividad en vivo" o para el plan de precios (sigue sin existir pago ni checkout reales).
- Los íconos flotantes "libro"/"globo" vistos en la previsualización del bundle — son parte de la herramienta de referencia, no del sitio.
- Mecánicas jugables reales, autenticación real, base de datos, internacionalización, tests automatizados — mismas exclusiones ya vigentes desde spec 01.

---

## Data model

```ts
// app/data/games.ts — se agrega, no reemplaza nada existente

export interface ActivityRow {
  name: string;    // de PLAYERS
  gameId: string;  // id de GAMES
  score: number;   // = GAMES.find(g => g.id === gameId)!.best
  ago: string;     // "hace 2 min", fijo
}

// 7 filas fijas, una por cada uno de los primeros 7 juegos de GAMES (en su
// orden actual), reconstruidas del template real: el puntaje de cada fila
// es el `best` de ese juego.
export const RECENT_ACTIVITY: ActivityRow[] = [
  { name: "NEONFOX",  gameId: "caida",         score: 184220, ago: "hace 2 min" },
  { name: "PX_KAI",   gameId: "gloton",        score: 96400,  ago: "hace 5 min" },
  { name: "Z3R0COOL", gameId: "invasores",     score: 54190,  ago: "hace 8 min" },
  { name: "VAULT_07", gameId: "rocas",         score: 41200,  ago: "hace 12 min" },
  { name: "GLITCHA",  gameId: "bloque-buster", score: 28450,  ago: "hace 18 min" },
  { name: "ARKADYA",  gameId: "serpentina",    score: 7820,   ago: "hace 24 min" },
  { name: "CYBER_LU", gameId: "ranaria",       score: 18900,  ago: "hace 31 min" },
];

export interface TopPlayerRow {
  rank: number;
  name: string;
  score: number;
}

// 5 filas fijas, copiadas tal cual del template real (no se correlacionan
// con RECENT_ACTIVITY ni con GAMES).
export const TOP_PLAYERS_TODAY: TopPlayerRow[] = [
  { rank: 1, name: "NEONFOX",  score: 312840 },
  { rank: 2, name: "PX_KAI",   score: 248110 },
  { rank: 3, name: "M00NRYU",  score: 196720 },
  { rank: 4, name: "VAULT_07", score: 154300 },
  { rank: 5, name: "GLITCHA",  score: 138900 },
];
```

No se introduce persistencia nueva ni claves de `localStorage` adicionales; estos datos son estáticos, igual que `seededScores`.

---

## Implementation plan

1. Crear `app/games/page.tsx` moviendo tal cual el contenido actual de `app/page.tsx` (hero de biblioteca, buscador, chips, grilla). Manual test: `/games` muestra la grilla y el filtro funciona igual que antes en `/`.
2. Agregar `RECENT_ACTIVITY` y `TOP_PLAYERS_TODAY` a `app/data/games.ts` con los valores exactos de Data model.
3. Portar a `app/globals.css` las clases CSS de Home listadas en Scope, recuperadas de `references/templates/home-about/about.jsx` (que en realidad es el CSS completo del tema), sin portar las clases de About (`about-*`, `contact-*`, `terminal-success`) ni del gamepad (`gp-*`), que no se usan en Home.
4. Crear `app/components/game-mini-card.tsx`: tarjeta compacta (clases `.mini-card`, `.mini-cover`, `.mini-meta`, `.mini-title`, `.mini-cat`) que recibe un `Game` y enlaza a `/juego/[id]`, reutilizando `cover-bg` + `game.cover` para la portada.
5. Reescribir `app/page.tsx` (`"use client"`) como la nueva página de Inicio:
   - Hero: eyebrow "INSERTA UNA MONEDA_", título de 3 líneas ("EL ARCADE" / "CLÁSICO ESTÁ" / "DE VUELTA"), subtítulo, botones "EXPLORAR JUEGOS" → `/games` y "✦ CREAR CUENTA" → `/iniciar-sesion`, indicador "DESLIZA ▼", y las mascotas flotantes decorativas (`home-silos`) reconstruidas de forma aproximada con SVG/CSS simple.
   - "¿Por qué Arcade Vault?": 4 `feature-card` estáticas (Juegos Clásicos, 100% Gratis, Ladder Boards, Siempre Creciendo) con el copy exacto capturado del template.
   - "Juegos disponibles ahora": `GAMES.slice(0, 6)` renderizados con `GameMiniCard`, más el enlace "VER TODOS LOS JUEGOS →" a `/games`.
   - Bloque de estadísticas: `${GAMES.length}+` juegos (calculado, no hardcodeado), "MILES" de partidas jugadas cada día, "GLOBAL" ranking — copy estático para las dos últimas.
   - "Actividad en vivo": ticker izquierdo con `RECENT_ACTIVITY`, lista derecha "TOP JUGADORES · HOY" con `TOP_PLAYERS_TODAY` y enlace "VER SALÓN →" a `/salon-de-la-fama`.
   - Precios: tarjeta "PLAN ÚNICO · JUGADOR VAULT", `$0 / SIEMPRE`, los 6 beneficios, botón "EMPEZAR GRATIS →" a `/iniciar-sesion`, y las 3 preguntas frecuentes.
   - CTA final: "¿LISTO PARA JUGAR?" + botón "INSERTAR MONEDA →" a `/games`.
   Manual test: `npm run dev`, abrir `/`, recorrer todas las secciones y verificar que cada enlace lleva a la ruta correcta.
6. Aplicar el patrón de revelado al hacer scroll (`IntersectionObserver` + clases `.reveal`/`.in`, igual que en el `About.jsx` real) a las secciones de Inicio posteriores al hero.
7. Actualizar `app/components/nav.tsx`: agregar el enlace "Inicio" → `/` (activo cuando `pathname === "/"`), cambiar "Biblioteca" para apuntar a `/games` (activo cuando `pathname === "/games" || pathname.startsWith("/juego/")`), tanto en el nav de escritorio como en el panel móvil.
8. Actualizar los enlaces/redirecciones que hoy apuntan a `/` asumiendo que es la Biblioteca, para que apunten a `/games`:
   - `app/juego/[id]/page.tsx` — botón "VOLVER".
   - `app/components/game-player.tsx` — botón "VOLVER AL VAULT".
   - `app/salon-de-la-fama/page.tsx` — botón "VOLVER A LA BIBLIOTECA".
   - `app/iniciar-sesion/page.tsx` — las dos redirecciones (`router.push("/")`) tras iniciar sesión / crear cuenta / entrar como invitado.
9. Correr `npm run build` para confirmar que no hay errores de TypeScript/ESLint, y revisar manualmente que el logo del Nav siga llevando a `/` (ahora Inicio).

---

## Acceptance criteria

- [ ] `/` muestra la nueva página de Inicio con sus secciones (hero, por qué, juegos destacados, estadísticas, actividad en vivo, precios) y el CTA final.
- [ ] `/games` muestra la misma Biblioteca (grilla, buscador, chips) que antes vivía en `/`, sin pérdida de funcionalidad.
- [ ] El Nav muestra "Inicio" y "Biblioteca" como enlaces separados; "Inicio" resalta en `/` y "Biblioteca" resalta en `/games` y en `/juego/[id]`.
- [ ] Los botones del hero ("Explorar Juegos" → `/games`, "Crear Cuenta" → `/iniciar-sesion`) y el CTA final ("Insertar Moneda" → `/games`) navegan a las rutas correctas.
- [ ] La sección "Juegos disponibles ahora" muestra los primeros 6 juegos de `GAMES`, cada tarjeta enlaza a `/juego/[id]`, y "Ver todos los juegos" enlaza a `/games`.
- [ ] La sección "Actividad en vivo" muestra las 7 filas de `RECENT_ACTIVITY` y las 5 filas de `TOP_PLAYERS_TODAY`; "Ver Salón" enlaza a `/salon-de-la-fama`.
- [ ] La sección de precios muestra la tarjeta `$0 / siempre` con sus 6 beneficios y las 3 preguntas frecuentes; "Empezar Gratis" enlaza a `/iniciar-sesion`.
- [ ] Los botones "Volver" (Detalle de juego), "Volver al Vault" (Reproductor), "Volver a la Biblioteca" (Salón de la Fama) y las redirecciones de `/iniciar-sesion` llevan a `/games` en vez de `/`.
- [ ] `npm run build` compila sin errores de TypeScript ni de ESLint.

---

## Decisions

- **Sí:** `/` pasa a ser la nueva página de Inicio y la Biblioteca (antes en `/`) se mueve a `/games` — decisión explícita del usuario, incluyendo el slug en inglés para esta ruta puntual (diverge del resto de rutas en español, p. ej. `/iniciar-sesion`, `/salon-de-la-fama`).
- **Sí:** la página "Acerca de" queda fuera de este spec — decisión explícita del usuario, se abordará en un spec futuro. El Nav no agrega el enlace "Acerca de" todavía.
- **Sí:** la sección "Juegos disponibles ahora" reutiliza `GAMES` de `app/data/games.ts` (primeros 6) en vez de datos propios — confirmado con el usuario, consistente con la fuente de datos única de spec 01.
- **Sí:** "Actividad en vivo" usa datos ficticios deterministas — confirmado con el usuario. Las "últimas puntuaciones" se reconstruyeron notando que sus 7 montos coinciden exactamente con `game.best` de los primeros 7 juegos de `GAMES`, así que se derivan de datos ya existentes en vez de inventarse; el "top jugadores de hoy" es una lista fija nueva, copiada tal cual del template real.
- **Sí:** el JSX real de Inicio se recuperó inspeccionando en el navegador `references/templates/home-about/nav.jsx`, que pese a su nombre es en realidad el bundle HTML standalone completo con assets embebidos — ningún `.jsx` de la carpeta trae el código fuente real de Home (mismo problema de archivos desordenados ya documentado en spec 01).
- **Sí:** los íconos flotantes de "libro" y "globo" en la esquina inferior derecha del bundle se excluyen del alcance — son UI inyectada por la herramienta de previsualización, no aparecen en el árbol de texto de la página ni usan clases del tema.
- **Sí:** las mascotas flotantes del hero (`home-silos`) se reconstruyen de forma aproximada (SVG o CSS simple, mismas clases/posiciones), no pixel-perfect, porque su JSX original tampoco sobrevive en ningún archivo — mismo tipo de reconstrucción visual que la pantalla de Detalle de juego en spec 01.
- **No:** no se portan a `app/globals.css` las clases CSS de About (`about-*`, `contact-*`, `terminal-success`) ni del gamepad (`gp-*`, sin uso visible en Home ni en About) — quedan pendientes para cuando se aborde la página Acerca de, para no cargar CSS muerto ahora.
- **No:** no se agrega backend real para "Actividad en vivo" ni para el plan de precios — ambos siguen siendo estáticos/decorativos.

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Cambiar `/` de Biblioteca a Inicio puede dejar enlaces rotos a la Biblioteca en el resto del sitio | Se listaron explícitamente (paso 8) todos los `href="/"` y `router.push("/")` existentes y se actualizan a `/games` en el mismo spec. |
| El hero y las mascotas flotantes (`home-silos`) no tienen JSX original recuperable | Se reconstruyen visualmente a partir de las clases CSS y la captura del bundle renderizado; no se exige fidelidad pixel-perfect en los criterios de aceptación. |

---

## What is **not** in this spec

- La página "Acerca de" / Contacto.
- Backend real para actividad en vivo, puntuaciones compartidas o precios.
- Autenticación real, base de datos, mecánicas jugables reales, internacionalización, tests automatizados — mismas exclusiones de spec 01.

Cada uno de estos, si se necesita, va en su propio spec.
