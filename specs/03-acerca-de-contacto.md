# SPEC 03 — Página "Acerca de" y formulario de contacto con Resend

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-10-18
> **Objective:** Implementar la página `/about` de `references/templates/home-about` (misión, highlights, divisor y formulario de contacto) y hacer que el formulario envíe un correo real al equipo mediante una Server Action de Next.js que usa Resend.

---

## Por qué este spec toma estas decisiones

Igual que en specs 01 y 02, los archivos de `references/templates/home-about` están desordenados respecto a sus nombres. Para esta página las piezas reales son:

- `download (1)` — contiene el `About.jsx` real (hero "Acerca de", fila de highlights con íconos SVG pixelados, divisor animado, sección de contacto con formulario y estado de éxito tipo terminal). Es la fuente de verdad para JSX y copy.
- `about.jsx` — contiene en realidad el CSS completo del tema; las clases de About/Contacto están en la sección `/* ===== ABOUT PAGE ===== */` (`.about-*`, `.highlight*`, `.about-divider`, `.div-*`, `.contact-*`, `.btn.press`, `.terminal-success`, `.term-*`, `@keyframes shake`/`pxblink`).

Spec 02 dejó explícitamente fuera estas clases de `app/globals.css` ("para no cargar CSS muerto ahora"); este spec las porta, ya que ahora sí se usan. Las clases del gamepad (`.gp-*`, `.dp*`, `.ab*`, `.lg-*`) siguen sin uso y siguen fuera.

El template original simula el envío (`setSent(name)` sin llamar a ningún servidor). Este spec reemplaza esa simulación por un envío real con Resend, manteniendo el resto de la UI idéntica.

---

## Scope

**In:**

- Nueva ruta `/about` (slug en inglés, decisión del usuario) con las secciones del template: hero "Acerca de Arcade Vault" con misión, 3 highlights (corazón / navegador / planta), divisor animado de píxeles, y sección "Contáctanos" con intro, 3 tips y formulario.
- Formulario de contacto (nombre, correo electrónico, mensaje) que invoca una Server Action; esta valida en el servidor y envía el correo con Resend.
- Estados del formulario: normal, shake por validación fallida, enviando, éxito (terminal verde del template con "ENVIAR OTRO MENSAJE") y error de envío (terminal roja, conserva lo escrito).
- Patrón de revelado al hacer scroll (`IntersectionObserver` + `.reveal`/`.in`), igual que en Home.
- Agregar el enlace "Acerca de" → `/about` al Nav (escritorio y panel móvil), con resaltado activo.
- Portar a `app/globals.css` el CSS de About/Contacto del template, más estilos para el estado de error y de "enviando" (nuevos, no existen en el template).
- Dependencia `resend`, variables de entorno y un `.env.example`.

**Out of scope (para futuros specs):**

- Guardar los mensajes en base de datos o cualquier bandeja de entrada en la app.
- Rate limiting, CAPTCHA o protección anti-spam más allá de un campo honeypot básico (ver Decisions).
- Correo de confirmación/auto-respuesta al visitante.
- Dominio propio verificado en Resend (para desarrollo se usa el remitente de pruebas `onboarding@resend.dev`; configurar el dominio es tarea operativa del usuario).
- Plantilla HTML elaborada del correo (se envía texto plano).
- Enlace "Acerca de" en el footer.
- Gamepad, autenticación real, i18n, tests automatizados — exclusiones vigentes desde specs 01 y 02.

---

## Data model

No se introduce persistencia. Se agregan únicamente tipos para el contrato de la Server Action:

```ts
// app/about/actions.ts

export interface ContactState {
  status: "idle" | "success" | "error";
  name?: string;     // nombre enviado, para el mensaje de éxito
  error?: string;    // mensaje legible cuando status === "error"
}

// Server Action: recibe el FormData del formulario
export async function sendContact(
  prev: ContactState,
  formData: FormData,
): Promise<ContactState>;
```

Variables de entorno (solo servidor, nunca `NEXT_PUBLIC_*`):

| Variable | Uso | Valor sugerido |
| --- | --- | --- |
| `RESEND_API_KEY` | API key de Resend | (secreto del usuario) |
| `CONTACT_TO_EMAIL` | Destinatario de los mensajes | correo del usuario |
| `CONTACT_FROM_EMAIL` | Remitente | `Arcade Vault <onboarding@resend.dev>` |

`.env.local` (ignorado por git) contiene los valores reales; `.env.example` (versionado) lista las tres claves vacías.

---

## Implementation plan

1. Instalar la dependencia: `npm install resend`. Crear `.env.example` con las 3 variables; verificar que `.gitignore` ignora `.env*.local`. Leer antes la guía de Server Actions / formularios en `node_modules/next/dist/docs/01-app/` (Next 16.3.1).
2. Portar a `app/globals.css` el bloque `/* ===== ABOUT PAGE ===== */` de `references/templates/home-about/about.jsx` (`.about`, `.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`, `.highlight*`, `.about-divider`, `.div-bar`, `.div-pixels`, `@keyframes pxblink`, `.about-contact`, `.contact-*`, `.contact-form*`, `@keyframes shake`, `.btn.press`, `.terminal-success`, `.term-*`), sin las clases `.gp-*`. Agregar `.terminal-success.error` (borde/texto magenta) y estilo `disabled` del botón para el estado "enviando". Sistema sigue funcional (CSS sin uso).
3. Crear `app/about/actions.ts` (`"use server"`): `sendContact` valida en servidor (nombre, correo con formato válido y mensaje no vacíos, con límites de longitud razonables; honeypot oculto debe venir vacío), arma el correo (`from: CONTACT_FROM_EMAIL`, `to: CONTACT_TO_EMAIL`, `replyTo`: correo del visitante, `subject`: `[Arcade Vault] Mensaje de <nombre>`, cuerpo en texto plano) y llama `resend.emails.send`. Devuelve `ContactState`; si faltan variables de entorno o Resend retorna `error`, devuelve `status: "error"` sin filtrar detalles internos. Manual test: invocarlo desde el formulario del paso 5.
4. Crear `app/components/highlight-icon.tsx`: los 3 SVG pixelados (`HEART`, `BROWSER`, `PLANT`) portados tal cual de `download (1)`.
5. Crear `app/about/contact-form.tsx` (`"use client"`): formulario con `useActionState(sendContact, { status: "idle" })`, `useFormStatus`/`pending` para deshabilitar el botón ("▶ ENVIANDO…"), validación en cliente de campos vacíos que dispara el `shake` (400 ms) antes de enviar, terminal de éxito con `GRACIAS, {NOMBRE}` y botón "ENVIAR OTRO MENSAJE" que restablece el formulario, y terminal de error con el mensaje devuelto.
6. Crear `app/about/page.tsx`: página (server component) con hero, highlights con `HighlightIcon`, divisor, y sección de contacto con el copy exacto del template (misión, 3 tips "RESPUESTA EN 24-48H" / "SUGERENCIAS BIENVENIDAS" / "SIN SPAM, JAMÁS"). Exportar `metadata` con título.
7. Aplicar el efecto de revelado a `.reveal`: reutilizar el mecanismo de Home; si Home lo tiene inline en `app/page.tsx`, extraerlo a un hook/componente compartido (`app/components/reveal.tsx` o `use-reveal.ts`) y usarlo en ambas páginas sin cambiar el comportamiento de Home.
8. Actualizar `app/components/nav.tsx`: agregar el enlace "Acerca de" → `/about` (activo cuando `pathname === "/about"`) en el nav de escritorio y en el panel móvil.
9. Probar de extremo a extremo con `npm run dev`: configurar `.env.local` con una API key real de Resend, enviar un mensaje desde `/about` y confirmar que llega al correo destino con `reply-to` correcto; probar también los casos de error (campos vacíos, correo inválido, API key inválida).
10. Correr `npm run build` para confirmar que no hay errores de TypeScript/ESLint.

---

## Acceptance criteria

- [ ] `/about` muestra el hero "ACERCA DE ARCADE VAULT" con la misión, los 3 highlights con sus íconos, el divisor de píxeles y la sección "CONTÁCTANOS" con sus 3 tips y el formulario.
- [ ] El Nav muestra "Acerca de" en escritorio y en el panel móvil; resalta solo en `/about`.
- [ ] Enviar el formulario con nombre, correo válido y mensaje entrega un correo en `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de <nombre>`, el mensaje en el cuerpo y `reply-to` igual al correo del visitante.
- [ ] Tras un envío exitoso se muestra la terminal verde con "MENSAJE RECIBIDO… GRACIAS, <NOMBRE>"; "ENVIAR OTRO MENSAJE" devuelve el formulario vacío.
- [ ] Enviar con algún campo vacío no llama a Resend y dispara el efecto shake.
- [ ] Un correo con formato inválido es rechazado por el servidor (aunque se evada la validación del cliente) y muestra el mensaje de error.
- [ ] Si Resend falla (p. ej. API key inválida) o faltan variables de entorno, se muestra la terminal roja con un mensaje genérico, el formulario conserva lo escrito y no se filtra ningún detalle interno ni la API key.
- [ ] Mientras se envía, el botón está deshabilitado y evita envíos duplicados.
- [ ] `RESEND_API_KEY` no aparece en el bundle del cliente (no existe ninguna variable `NEXT_PUBLIC_*` para ella) y `.env.local` no está versionado; `.env.example` sí.
- [ ] El efecto de revelado al hacer scroll funciona en `/about` y Home sigue comportándose igual.
- [ ] `npm run build` compila sin errores de TypeScript ni de ESLint.

---

## Decisions

- **Sí:** la ruta es `/about` con enlace "Acerca de" en el Nav — decisión explícita del usuario (slug en inglés, igual que `/games`; diverge de las rutas en español `/iniciar-sesion`, `/salon-de-la-fama`).
- **Sí:** el envío usa una Server Action (`app/about/actions.ts`) en vez de un Route Handler — confirmado con el usuario. La API key vive solo en el servidor y no hay endpoint público extra que mantener.
- **Sí:** Resend como proveedor de correo — decisión explícita del usuario.
- **Sí:** destinatario y remitente salen de variables de entorno (`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) — confirmado con el usuario; permite empezar con `onboarding@resend.dev` y cambiar a un dominio verificado sin tocar código. `reply-to` = correo del visitante para poder responder directo.
- **Sí:** validación en el servidor (campos requeridos, formato de correo, longitudes) más manejo de error visible en UI — confirmado con el usuario. El cliente conserva la validación de campos vacíos con shake del template como mejora de UX, pero no es la fuente de verdad.
- **Sí:** UI idéntica al template (`download (1)`), incluido el copy y el estado de éxito tipo terminal; solo se agregan los estados "enviando" y "error", que el template no tenía porque el envío era simulado.
- **Sí:** un campo honeypot oculto como defensa mínima anti-bots — es barato y no cambia la UX; no sustituye un rate limit real (fuera de alcance).
- **Sí:** se portan las clases CSS de About/Contacto que spec 02 había dejado pendientes; las del gamepad (`.gp-*` etc.) siguen sin portarse por no tener uso.
- **No:** persistir mensajes en base de datos, correo de auto-respuesta, plantilla HTML del correo y dominio propio — cada uno, si se necesita, va en su propio spec.
- **No:** Route Handler `/api/contacto` — descartado en favor de la Server Action.

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Sin dominio verificado, Resend con `onboarding@resend.dev` solo entrega al correo dueño de la cuenta | `CONTACT_TO_EMAIL` debe ser el correo de la cuenta de Resend durante desarrollo; documentado en `.env.example`. Pasar a dominio propio es cambio de variable, no de código. |
| Filtrar la API key o errores internos al cliente | Variables sin prefijo `NEXT_PUBLIC_`, la acción solo devuelve mensajes genéricos, errores reales solo a `console.error` del servidor. |
| Spam / abuso del formulario público | Honeypot + validación de longitudes; rate limiting queda como spec futuro si se detecta abuso. |
| La API de Resend o de Server Actions en Next 16.3.1 difiere de lo conocido | Leer la guía en `node_modules/next/dist/docs/` antes de escribir la acción (paso 1) y la documentación vigente de `resend` al instalarla. |
| Extraer el efecto de revelado de Home podría romperlo | El paso 7 exige conservar el comportamiento; se verifica manualmente en `/` y `/about`. |

---

## What is **not** in this spec

- Almacenamiento de mensajes en base de datos o panel de administración.
- Correo de confirmación al visitante y plantilla HTML del correo.
- Rate limiting / CAPTCHA.
- Verificación de dominio propio en Resend.
- Gamepad, autenticación real, i18n, tests automatizados.

Cada uno de estos, si se necesita, va en su propio spec.
