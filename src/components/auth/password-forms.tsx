"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Role } from "@/lib/auth/portals";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({ portal }: { portal: Role }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    setError(null);
    setBusy(true);
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/${portal}/reset-password`,
    });
    setBusy(false);
    if (err && err.status !== 400 && err.status !== 422) return setError("Could not send the email. Please try again shortly.");
    setDone(true); // Same message whether or not the account exists, so emails cannot be probed.
  }

  if (done)
    return (
      <div className="rounded-xl border bg-card p-6 text-center shadow-card">
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><MailCheck className="size-6" /></span>
        <p className="text-sm text-muted-foreground">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
        <Button asChild variant="outline" className="mt-5"><Link href={`/${portal}/login`}>Back to sign in</Link></Button>
      </div>
    );
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Email" error={error ?? undefined}><Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Send reset link</Button>
      <p className="text-center text-sm"><Link href={`/${portal}/login`} className="text-primary hover:underline">Back to sign in</Link></p>
    </form>
  );
}

export function ResetPasswordForm({ portal }: { portal: Role }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return setError("Use at least 8 characters with letters and numbers.");
    if (pw !== confirm) return setError("Passwords do not match.");
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    await supabase.auth.signOut();
    router.replace(`/${portal}/login?reset=1`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="New password"><Input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Update password</Button>
    </form>
  );
}
