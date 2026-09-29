"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { contactInterests } from "@/lib/content";
import { validateContact, type ContactInterest } from "@/lib/contact";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * `full` (contact page): service picker + company field + 5-row message.
 * `compact` (home page): name, email, message only.
 */
export function ContactForm({ variant = "full", header }: { variant?: "full" | "compact"; header?: ReactNode }) {
  const id = useId();
  const [interest, setInterest] = useState<ContactInterest | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const full = variant === "full";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      message: String(data.get("message") ?? ""),
      interest,
    };

    const found = validateContact(payload);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setStatus({ kind: "error", message: json.error ?? "Something went wrong. Please try again." });
        return;
      }
      form.reset();
      setInterest(null);
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    }
  }

  const fieldProps = (name: string) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
  });
  const fieldError = (name: string) =>
    errors[name] ? (
      <span id={`${id}-${name}-err`} className="form-status form-status--err">
        {errors[name]}
      </span>
    ) : null;

  const nameField = (
    <div className="field">
      <label htmlFor={`${id}-name`}>Name</label>
      <input type="text" autoComplete="name" {...fieldProps("name")} />
      {fieldError("name")}
    </div>
  );

  return (
    <form className="contact__form" onSubmit={onSubmit} noValidate>
      {header}
      {full && (
        <fieldset className="field">
          <legend>What are you interested in?</legend>
          <div className="pills">
            {contactInterests.map((opt) => (
              <button
                key={opt}
                type="button"
                className="pill"
                aria-pressed={interest === opt}
                onClick={() => setInterest((cur) => (cur === opt ? null : opt))}
              >
                {opt}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {full ? (
        <div className="field-row">
          {nameField}
          <div className="field">
            <label htmlFor={`${id}-company`}>Company (optional)</label>
            <input type="text" autoComplete="organization" {...fieldProps("company")} />
          </div>
        </div>
      ) : (
        nameField
      )}

      <div className="field">
        <label htmlFor={`${id}-email`}>Email</label>
        <input type="email" autoComplete="email" {...fieldProps("email")} />
        {fieldError("email")}
      </div>

      <div className="field">
        <label htmlFor={`${id}-message`}>What are you building?</label>
        <textarea rows={full ? 5 : 4} {...fieldProps("message")} />
        {fieldError("message")}
      </div>

      <button
        type="submit"
        className="btn btn--primary shine"
        style={{ alignSelf: "flex-start" }}
        disabled={status.kind === "sending"}
      >
        {status.kind === "sending" ? "Sending…" : "Send"}
      </button>

      <div aria-live="polite">
        {status.kind === "sent" && (
          <p className="form-status form-status--ok">Thanks. We&apos;ll reply within one business day.</p>
        )}
        {status.kind === "error" && <p className="form-status form-status--err">{status.message}</p>}
      </div>
    </form>
  );
}
