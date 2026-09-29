"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "@phosphor-icons/react";
import { contactInterests } from "@/lib/content";
import { validateContact, type ContactInterest } from "@/lib/contact";
import { SpecularButton } from "@/components/SpecularButton";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * `full` (contact page): service picker + company field + 5-row message.
 * `compact` (home page): name, email, message only.
 */
export function ContactForm({ variant = "full" }: { variant?: "full" | "compact" }) {
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
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
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

  if (status.kind === "sent") {
    return (
      <div className="contact__form surface" aria-live="polite">
        <div className="form-sent">
          <span className="form-sent__icon">
            <Check size={24} weight="bold" aria-hidden />
          </span>
          <h3>Message received.</h3>
          <p className="body-2">We&apos;ll reply within one business day, usually sooner.</p>
          <SpecularButton type="button" className="btn btn--ghost btn--sm" onClick={() => setStatus({ kind: "idle" })}>
            Send another message
          </SpecularButton>
        </div>
      </div>
    );
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
    <form className="contact__form surface" onSubmit={onSubmit} noValidate>
      {full && (
        <fieldset className="field">
          <legend>What are you interested in?</legend>
          <div className="pills">
            {contactInterests.map((opt) => (
              <SpecularButton
                key={opt}
                type="button"
                className="pill"
                aria-pressed={interest === opt}
                onClick={() => setInterest((cur) => (cur === opt ? null : opt))}
              >
                {opt}
              </SpecularButton>
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

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <SpecularButton type="submit" autoAnimate className="btn btn--primary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Send"}
          {status.kind !== "sending" && <ArrowUpRight size={18} weight="bold" aria-hidden />}
        </SpecularButton>
        <div aria-live="polite">
          {status.kind === "error" && <p className="form-status form-status--err">{status.message}</p>}
        </div>
      </div>
    </form>
  );
}
