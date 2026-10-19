"use client";

import { useActionState, useState, startTransition } from "react";
import { sendContact, type ContactState } from "@/app/about/actions";

const INITIAL: ContactState = { status: "idle" };
const EMPTY = { name: "", email: "", message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContact, INITIAL);
  const [form, setForm] = useState(EMPTY);
  const [shake, setShake] = useState(false);
  // Permite volver al formulario tras un éxito sin reiniciar el estado de la acción.
  const [dismissed, setDismissed] = useState(false);

  const showSuccess = state.status === "success" && !dismissed && !pending;
  const showError = state.status === "error" && !dismissed && !pending;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    // Se invoca la acción manualmente (sin <form action>) para que React no
    // reinicie los campos y se conserve lo escrito si el envío falla.
    const data = new FormData(e.currentTarget);
    setDismissed(false);
    startTransition(() => formAction(data));
  };

  const reset = () => {
    setForm(EMPTY);
    setDismissed(true);
  };

  return (
    <form
      className={"contact-form" + (shake ? " shake" : "")}
      onSubmit={onSubmit}
      noValidate
    >
      {showSuccess ? (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r"></span>
            <span className="dot y"></span>
            <span className="dot g"></span>
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message
              --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS,{" "}
              {(state.name ?? "").toUpperCase()}.
              <span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {showError && (
            <div
              className="terminal-success error"
              role="alert"
              style={{ marginBottom: 18 }}
            >
              <div className="term-bar">
                <span className="dot r"></span>
                <span className="dot y"></span>
                <span className="dot g"></span>
                <span className="term-title">VAULT-OS // ERROR</span>
              </div>
              <div className="term-body">
                <div className="line success">&gt; {state.error}</div>
              </div>
            </div>
          )}
          <div className="field">
            <label htmlFor="contact-name">NOMBRE</label>
            <input
              id="contact-name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="px_kai"
              maxLength={80}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jugador@vault.gg"
              maxLength={120}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-message">MENSAJE</label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Cuéntanos qué tienes en mente…"
              maxLength={4000}
            ></textarea>
          </div>
          {/* Honeypot: los usuarios no lo ven; los bots suelen rellenarlo. */}
          <div className="hp" aria-hidden="true">
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>
          <button
            className="btn xl press"
            type="submit"
            style={{ width: "100%" }}
            disabled={pending}
          >
            {pending ? "▶  ENVIANDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      )}
    </form>
  );
}
