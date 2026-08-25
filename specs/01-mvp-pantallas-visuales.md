# SPEC 01 — MVP visual de las 5 pantallas de Arcade Vault

> **Status:** Implementado
> **Depends on:** Ninguno
> **Date:** 2026-08-24
> **Objective:** Implementar, solo en su parte visual y sin backend real, las 5 pantallas de `references/templates` (Biblioteca, Detalle de juego, Reproductor, Autenticación y Salón de la Fama) como rutas reales de Next.js App Router.

---

## Por qué este spec toma estas decisiones

Los archivos dentro de `references/templates` tienen su contenido completamente desordenado respecto a sus nombres: cada `.jsx` contiene el código real de una pantalla distinta a la que su nombre sugiere (por ejemplo, `salon.jsx` contiene el reproductor, y `styles.css` contiene el salón de la fama). Rastreando los 9 archivos se recuperó el código real de 8 de las 9 piezas (HTML shell, Library, Nav, datos, CSS, Auth, App, GamePlayer, HallOfFame). La única pieza que no existe en ningún archivo es el JSX de **GameDetail** (pantalla de detalle de un juego): solo sobreviven sus clases CSS (`.av-detail`, `.detail-info`, `.leaderboard`, `.lb-row`, `.stat-strip`, `.detail-tags`, `.detail-actions`) y su enrutamiento en `app.jsx`. Este spec reconstruye esa pantalla a partir de esas clases, decisión confirmada con el usuario.

El CSS completo del tema (variables, `.av-nav`, `.av-hero`, `.card`, `.av-detail`, `.crt`, `.auth-card`, `.av-hall`, etc.) ya está portado íntegramente en `app/globals.css`, y `app/layout.tsx` ya trae las 3 fuentes (`Press Start 2P`, `Courier Prime`, `JetBrains Mono`) y los divs `av-bg`/`av-noise`/`root`. Este spec no toca esa base; solo agrega páginas, componentes y datos.

---

## Scope

**In:**

- 5 rutas de Next.js App Router:
  - `/` — Biblioteca (grilla de juegos, buscador, chips de categoría).
  - `/juego/[id]` — Detalle de juego (portada, descripción, estadísticas, tabla de puntuaciones).
  - `/juego/[id]/jugar` — Reproductor (animación CRT decorativa, HUD, modal de fin de partida).
  - `/iniciar-sesion` — Autenticación (pestañas iniciar sesión / crear cuenta, invitado).
  - `/salon-de-la-fama` — Salón de la Fama (podio, tabla completa, pestañas por juego).
- `Nav` y pie de página compartidos, montados una sola vez en `app/layout.tsx`.
- Datos ficticios de 8 juegos, lista de jugadores y generador de puntuaciones porteados a `app/data/games.ts`, tipados, simulando la futura fuente de datos real.
- Interactividad de cliente sin backend: buscador y chips en Biblioteca, pestañas en Salón de la Fama, formulario y modo invitado en Auth, sesión de usuario y guardado de puntuación simulados con `localStorage` (mismas claves que el template: `av_user`, `av_scores`).
- Reconstrucción visual de la pantalla de Detalle de juego a partir de las clases CSS ya existentes en `app/globals.css`.

**Out of scope (para futuros specs):**

- Autenticación real, base de datos o cualquier API/backend.
- Mecánicas jugables reales de cualquiera de los 8 juegos (el reproductor sigue siendo la animación CRT decorativa genérica).
- Registro real de cuentas, recuperación de contraseña, u OAuth con Google/GitHub (esos botones quedan decorativos, sin `onClick`).
- Puntuaciones compartidas entre usuarios en un servidor; el Salón de la Fama sigue usando datos generados por semilla, no las puntuaciones guardadas localmente.
- Internacionalización / soporte multi-idioma.
- Tests automatizados.

---

## Data model

```ts
// app/data/games.ts
export interface Game {
  id: string; // slug, ej. "bloque-buster"
  title: string;
  short: string; // descripción corta (tarjeta)
  long: string; // descripción larga (detalle)
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string; // clase CSS del fondo generado, ej. "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string; // ej. "12.4K"
}

export const GAMES: Game[] = [
  /* los mismos 8 juegos de references/templates (biblioteca.jsx real): 
     bloque-buster, caida, serpentina, gloton, invasores, rocas, ranaria, duelo-pixel */
];

export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];

export const PLAYERS: string[] = [ /* mismos 18 nombres del template */ ];

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // DD/MM/2026
}

// Generador determinista de puntuaciones (mismo algoritmo del template)
export function seededScores(seed: number, count?: number): ScoreRow[];
```

Persistencia en `localStorage` (misma forma que el template, sin cambios de esquema):

- `av_user`: `{ name: string } | null`.
- `av_scores`: arreglo de `{ game: string; score: number; name: string; at: number }`, se hace `push` cada vez que se guarda una puntuación desde el reproductor.

No se introduce ninguna base de datos ni API; ambas claves viven solo en el navegador.

---

## Implementation plan

1. Crear `app/data/games.ts` con la interfaz `Game`, el arreglo `GAMES` (8 juegos), `CATS`, `PLAYERS` y la función `seededScores`, portando los valores exactos del `data.jsx` real recuperado de `references/templates/biblioteca.jsx`.
2. Crear `app/components/user-provider.tsx` (`"use client"`): contexto `UserContext` con `{ user, login, logout }`, inicializado en `null` y sincronizado con `localStorage["av_user"]` en un `useEffect`; exportar el hook `useUser()`.
3. Crear `app/components/nav.tsx` (`"use client"`): portar `Nav` del template (logo, enlaces Biblioteca/Salón de la Fama vía `next/link`, resaltado de activo con `usePathname()`, contador de créditos estático, botón de sesión usando `useUser()`, panel móvil con hamburguesa). Manual test: importarlo temporalmente en `app/page.tsx` y verificar que renderiza sin errores.
4. Modificar `app/layout.tsx`: envolver `children` con `<UserProvider>`, renderizar `<Nav />` antes de `children` y el `<footer>` (idéntico texto del template) después. Sistema queda funcional con el scaffold actual de Next.js.
5. Crear `app/components/game-card.tsx`: tarjeta de juego (portada con clase `cover-*`, etiqueta de categoría, título, descripción corta, mejor puntuación, botón "JUGAR" que enlaza a `/juego/[id]`).
6. Reescribir `app/page.tsx` (`"use client"`) como pantalla Biblioteca: hero con título parpadeante, buscador y chips de categoría con `useState` local, grilla de `GameCard` filtrada, mensaje de "sin resultados". Manual test: `npm run dev`, abrir `/`, escribir en el buscador y alternar categorías.
7. Crear `app/juego/[id]/page.tsx` (server component): buscar el juego por `id` en `GAMES`, llamar `notFound()` si no existe; reconstruir la pantalla de Detalle con `.detail-cover`, `.detail-info`, `.detail-tags`, `.stat-strip` (mejor puntuación, partidas jugadas, categoría) y `.detail-actions` (Link a jugar y a volver); tabla `.leaderboard`/`.lb-row` con `seededScores`. Manual test: abrir `/juego/bloque-buster` y `/juego/no-existe` (debe dar 404).
8. Crear `app/juego/[id]/jugar/page.tsx` (`"use client"`): portar `GamePlayer` (HUD de puntuación/vidas/nivel, `setInterval` que incrementa el puntaje, pausa/reanudar, arena CRT decorativa, botón "FIN" que abre el modal de fin de partida, guardado de puntuación en `localStorage["av_scores"]` con mensaje de confirmación tipo máquina de escribir, "JUGAR DE NUEVO" y "VOLVER AL VAULT"). Manual test: jugar, pausar, terminar partida y guardar puntuación.
9. Crear `app/iniciar-sesion/page.tsx` (`"use client"`): portar `Auth` (pestañas iniciar sesión/crear cuenta, campos, envío que llama `login()` y redirige a `/` con `useRouter().push`, botón "JUGAR COMO INVITADO", botones decorativos de Google/GitHub sin handler). Manual test: iniciar sesión y comprobar que el `Nav` muestra el nombre; cerrar sesión y comprobar que vuelve a "Iniciar Sesión".
10. Crear `app/salon-de-la-fama/page.tsx` (`"use client"`): portar `HallOfFame` (chips por juego, podio top-3, tabla completa con `seededScores`, fila "tu mejor marca" cuando `useUser()` tiene sesión). Manual test: alternar juegos en las pestañas y comprobar que el podio/tabla cambian.
11. Revisar en cada pantalla que los enlaces del `Nav` y los botones "volver" apunten a las rutas correctas, y correr `npm run build` para confirmar que no hay errores de TypeScript/ESLint.

---

## Acceptance criteria

- [ ] La ruta `/` muestra la grilla de 8 juegos; escribir en el buscador y elegir una categoría filtra la grilla en el cliente.
- [ ] La ruta `/juego/[id]` muestra portada, etiquetas, descripción larga, `stat-strip` y tabla de puntuaciones para cada uno de los 8 ids válidos.
- [ ] Visitar `/juego/id-inexistente` muestra la página 404 de Next.js.
- [ ] La ruta `/juego/[id]/jugar` anima la arena CRT, incrementa el puntaje automáticamente, permite pausar/reanudar con el botón correspondiente, y el botón "FIN" abre el modal de fin de partida con la puntuación final.
- [ ] Guardar la puntuación en el modal persiste una entrada en `localStorage["av_scores"]` y muestra el mensaje de confirmación.
- [ ] La ruta `/iniciar-sesion` permite alternar entre las pestañas "Iniciar Sesión" / "Crear Cuenta"; enviar el formulario o elegir "Jugar como invitado" redirige a `/`.
- [ ] Tras iniciar sesión, recargar cualquier página conserva la sesión (`localStorage["av_user"]`) y el botón del `Nav` muestra el nombre del usuario en vez de "Iniciar Sesión".
- [ ] Cerrar sesión desde el `Nav` borra `av_user` y el botón vuelve a mostrar "Iniciar Sesión".
- [ ] La ruta `/salon-de-la-fama` muestra el podio (oro/plata/bronce), la tabla completa, y cambiar de pestaña cambia los datos mostrados.
- [ ] El menú móvil (hamburguesa) se abre y cierra en viewport angosto, y el enlace activo en el `Nav` corresponde a la ruta actual.
- [ ] `npm run build` compila sin errores de TypeScript ni de ESLint.

---

## Decisions

- **Sí:** rutas reales de Next.js App Router (`/`, `/juego/[id]`, `/juego/[id]/jugar`, `/iniciar-sesion`, `/salon-de-la-fama`) en vez de un SPA con hash routing como el template. Razón: coherente con el stack ya elegido en `CLAUDE.md`, permite enlaces directos y confirmado con el usuario.
- **Sí:** segmentos de URL en español (`juego`, `iniciar-sesion`, `salon-de-la-fama`), consistentes con el resto del copy del sitio y el README en español. No se le preguntó explícitamente al usuario esta variante puntual; se mantiene el idioma ya usado en toda la interfaz.
- **Sí:** reconstrucción visual de la pantalla de Detalle de juego a partir de las clases CSS existentes, porque su JSX original no existe en ningún archivo de `references/templates` (confirmado con el usuario tras rastrear el contenido real de los 9 archivos).
- **Sí:** los datos ficticios se centralizan en `app/data/games.ts`, tipados con una interfaz `Game`, simulando la forma que tendría el dato cuando venga de una base de datos real (pedido explícito del usuario).
- **Sí:** la sesión (`av_user`) se comparte vía un contexto de cliente (`UserProvider`) montado en `app/layout.tsx`, porque ahora no existe un único componente raíz con estado (como el `App` del template) que se lo pase a todas las pantallas por props.
- **Sí:** se replica la interactividad simulada del template (buscador, chips, pestañas, sesión y guardado de puntuación con estado de React + `localStorage`), sin llamadas a servidor ni validación real, confirmado con el usuario.
- **No:** autenticación real, base de datos o API routes — fuera de alcance explícito de este MVP.
- **No:** mecánicas de juego reales para ninguno de los 8 títulos — el reproductor mantiene la animación CRT decorativa genérica del template, confirmado con el usuario.
- **No:** filtros de la Biblioteca vía query params de URL — se mantiene estado local de React por simplicidad, igual que el template original.

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Leer `localStorage` durante el render en servidor rompe la hidratación (el server no tiene `window`) | `UserProvider` inicializa `user` en `null` y solo lee `localStorage` dentro de un `useEffect` en el cliente; `Nav`, Auth, Reproductor y Salón de la Fama son Client Components. |
| Una URL con un `id` de juego inventado no debe romper la app | `app/juego/[id]/page.tsx` y `app/juego/[id]/jugar/page.tsx` llaman a `notFound()` de `next/navigation` cuando el id no está en `GAMES`. |

---

## What is **not** in this spec

- Autenticación real, base de datos o cualquier API/backend.
- Mecánicas jugables reales de cualquiera de los 8 juegos.
- Registro real de cuentas, recuperación de contraseña, u OAuth con Google/GitHub.
- Puntuaciones compartidas entre usuarios en un servidor.
- Internacionalización y tests automatizados.

Cada uno de estos, si se necesita, va en su propio spec.
