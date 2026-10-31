"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Errors = Partial<Record<"name" | "email" | "phone" | "password" | "confirm" | "terms" | "form", string>>;

/** Public sign-up. It can only ever create a Customer: the database trigger ignores any role in the metadata. */
export function RegisterForm() {
  const router = useRouter();
  const [v, setV] = useState({ name: "", email: "", phone: "", company: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  function validate(): Errors {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
    if (!/^[+()\d\s-]{7,20}$/.test(v.phone.trim())) e.phone = "Enter a valid phone number.";
    if (v.password.length < 8) e.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = "Include at least one letter and one number.";
    if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
    if (!terms) e.terms = "You must accept the terms to continue.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const { data, error } = await createClient().auth.signUp({
      email: v.email.trim(),
      password: v.password,
      options: {
        data: { full_name: v.name.trim(), phone: v.phone.trim(), company: v.company.trim(), terms_accepted: "true" },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/customer/dashboard`,
      },
    });
    setBusy(false);
    if (error) return setErrors({ form: error.message });
    if (data.user && data.user.identities?.length === 0) return setErrors({ email: "An account with this email already exists. Sign in instead." });
    if (data.session) {
      router.replace("/customer/dashboard");
      router.refresh();
    } else setSentTo(v.email.trim());
  }

  if (sentTo)
    return (
      <div className="rounded-xl border bg-card p-6 text-center shadow-card">
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><MailCheck className="size-6" /></span>
        <h2 className="font-semibold">Check your email</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">We sent a confirmation link to <strong>{sentTo}</strong>. Open it to activate your account, then sign in.</p>
        <Button asChild className="mt-5"><Link href="/customer/login">Go to sign in</Link></Button>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Full name" error={errors.name}><Input autoComplete="name" value={v.name} onChange={set("name")} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email}><Input type="email" autoComplete="email" value={v.email} onChange={set("email")} /></Field>
        <Field label="Phone" error={errors.phone}><Input type="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} /></Field>
      </div>
      <Field label="Company (optional)"><Input autoComplete="organization" value={v.company} onChange={set("company")} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" error={errors.password} hint="8+ characters, letters and numbers"><Input type="password" autoComplete="new-password" value={v.password} onChange={set("password")} /></Field>
        <Field label="Confirm password" error={errors.confirm}><Input type="password" autoComplete="new-password" value={v.confirm} onChange={set("confirm")} /></Field>
      </div>
      <div>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-4 accent-[hsl(var(--primary))]" />
          <span>I accept the <Link href="/terms" className="text-primary hover:underline">terms and conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">privacy policy</Link>.</span>
        </label>
        {errors.terms && <p role="alert" className="mt-1 text-xs text-destructive">{errors.terms}</p>}
      </div>
      {errors.form && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.form}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Create account</Button>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/customer/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
    </form>
  );
}
