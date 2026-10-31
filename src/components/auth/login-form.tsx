"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { homeFor, isRole, ROLE_LABEL, ROLES, type Role } from "@/lib/auth/portals";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ portal, notice, demoCredentials }: { portal: Role; notice?: string; demoCredentials?: { email: string; password: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError || !data.user) {
      setBusy(false);
      return setError(authError?.message.toLowerCase().includes("confirm") ? "Confirm your email first. Check your inbox for the link." : "Invalid email or password.");
    }
    // The portal is decided by the role stored in the database, not by anything the browser sends.
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    const role = profile?.role as string | undefined;
    if (!isRole(role) || role !== portal) {
      await supabase.auth.signOut();
      setBusy(false);
      return setError(isRole(role) ? `This is the ${ROLE_LABEL[portal]} login. Your account belongs to the ${ROLE_LABEL[role]} portal.` : "Your account has no access to this portal.");
    }
    router.replace(homeFor(portal));
    router.refresh();
  }

  return (
    <div className="space-y-5">
    {demoCredentials && <section aria-labelledby="demo-credentials" className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      <h2 id="demo-credentials" className="font-semibold">Demo Credentials</h2>
      <dl className="mt-2 grid grid-cols-[5rem_1fr] gap-x-2 gap-y-1 text-muted-foreground">
        <dt>Email</dt><dd className="break-all font-mono text-foreground">{demoCredentials.email}</dd>
        <dt>Password</dt><dd className="break-all font-mono text-foreground">{demoCredentials.password}</dd>
      </dl>
    </section>}
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {notice && <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">{notice}</p>}
      <Field label="Email">
        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </Field>
      <Field label="Password">
        <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy && <Loader2 className="animate-spin" />} Sign in
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href={`/${portal}/forgot-password`} className="text-primary hover:underline">Forgot password?</Link>
        {portal === "customer" && <Link href="/customer/register" className="font-medium text-primary hover:underline">Create account</Link>}
      </div>
      <p className="border-t pt-4 text-center text-xs text-muted-foreground">
        Other portals:{" "}
        {ROLES.filter((r) => r !== portal).map((r, i) => (
          <span key={r}>{i > 0 && " · "}<Link href={`/${r}/login`} className="hover:text-foreground hover:underline">{ROLE_LABEL[r]}</Link></span>
        ))}
      </p>
    </form>
    </div>
  );
}
