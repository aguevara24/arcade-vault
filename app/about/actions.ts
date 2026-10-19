"use server";

import { Resend } from "resend";

export interface ContactState {
  status: "idle" | "success" | "error";
  name?: string;
  error?: string;
}

const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_MESSAGE = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_ERROR =
  "NO PUDIMOS ENVIAR TU MENSAJE. INTÉNTALO DE NUEVO EN UNOS MINUTOS.";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: los bots rellenan el campo oculto. Fingimos éxito sin enviar.
  if (field(formData, "website") !== "") {
    return { status: "success", name: "JUGADOR" };
  }

  const name = field(formData, "name");
  const email = field(formData, "email");
  const message = field(formData, "message");

  if (!name || !email || !message) {
    return { status: "error", error: "COMPLETA TODOS LOS CAMPOS." };
  }
  if (
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    message.length > MAX_MESSAGE
  ) {
    return { status: "error", error: "ALGÚN CAMPO ES DEMASIADO LARGO." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", error: "EL CORREO ELECTRÓNICO NO ES VÁLIDO." };
  }
  // Evita inyección de cabeceras vía saltos de línea en el asunto.
  if (/[\r\n]/.test(name)) {
    return { status: "error", error: "EL NOMBRE NO ES VÁLIDO." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error("[contact] faltan variables de entorno de Resend");
    return { status: "error", error: GENERIC_ERROR };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\n${message}`,
    });
    if (error) {
      console.error("[contact] Resend devolvió error:", error);
      return { status: "error", error: GENERIC_ERROR };
    }
  } catch (err) {
    console.error("[contact] fallo al enviar:", err);
    return { status: "error", error: GENERIC_ERROR };
  }

  return { status: "success", name };
}
