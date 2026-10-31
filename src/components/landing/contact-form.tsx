"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(body?.error?.message ?? "Could not send your message. Please try again.");
    setDone(true);
  }

  if (done)
    return (
      <div className="grid place-items-center rounded-2xl border bg-card p-10 text-center shadow-card">
        <CheckCircle2 className="size-10 text-success" />
        <h3 className="mt-3 font-semibold">Message sent</h3>
        <p className="mt-1 text-sm text-muted-foreground">Thanks, we will get back to you by email.</p>
      </div>
    );
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-pop">
      <Field label="Name"><Input required minLength={2} maxLength={120} value={v.name} onChange={set("name")} /></Field>
      <Field label="Email"><Input required type="email" maxLength={200} value={v.email} onChange={set("email")} /></Field>
      <Field label="How can we help?">
        <textarea required minLength={10} maxLength={2000} rows={4} value={v.message} onChange={set("message")} className="w-full rounded-md border bg-card px-3 py-2 text-sm shadow-card outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </Field>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={v.website} onChange={set("website")} />
      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Send />} Send message</Button>
    </form>
  );
}
