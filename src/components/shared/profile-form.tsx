"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import type { Role } from "@/lib/auth/portals";
import { createClient } from "@/lib/supabase/client";

type V = { full_name: string; phone: string; company: string; address: string; billing_name: string; billing_address: string; tax_id: string };

/** Updates run as the signed-in user, so RLS decides what they may change (their own profile and customer row only). */
export function ProfileForm({ role, userId, email, customerId, initial }: { role: Role; userId: string; email: string; customerId?: string; initial: V }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof V) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (v.full_name.trim().length < 2) return toast.error("Enter your full name.");
    setBusy(true);
    const db = createClient();
    const a = await db.from("profiles").update({ full_name: v.full_name.trim(), phone: v.phone.trim() || null }).eq("id", userId);
    let err = a.error?.message;
    if (!err && customerId) {
      const b = await db.from("customers").update({
        name: v.full_name.trim(), phone: v.phone.trim() || null, company: v.company.trim(), address: v.address.trim() || null,
        billing_name: v.billing_name.trim() || null, billing_address: v.billing_address.trim() || null, tax_id: v.tax_id.trim() || null,
      }).eq("id", customerId);
      err = b.error?.message;
    }
    setBusy(false);
    if (err) return toast.error(err);
    toast.success("Profile saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><div><CardTitle>Account</CardTitle><CardDescription>Signed in as {email}</CardDescription></div></CardHeader>
        <div className="space-y-4 px-5 pb-5">
          <Field label="Full name"><Input value={v.full_name} onChange={set("full_name")} /></Field>
          <Field label="Phone"><Input type="tel" value={v.phone} onChange={set("phone")} /></Field>
          {role === "customer" && (<>
            <Field label="Company"><Input value={v.company} onChange={set("company")} /></Field>
            <Field label="Address"><Input value={v.address} onChange={set("address")} /></Field>
          </>)}
        </div>
      </Card>
      {role === "customer" && (
        <Card>
          <CardHeader><div><CardTitle>Billing details</CardTitle><CardDescription>Used on your invoices.</CardDescription></div></CardHeader>
          <div className="space-y-4 px-5 pb-5">
            <Field label="Billing name"><Input value={v.billing_name} onChange={set("billing_name")} /></Field>
            <Field label="Billing address"><Input value={v.billing_address} onChange={set("billing_address")} /></Field>
            <Field label="Tax ID / GSTIN"><Input value={v.tax_id} onChange={set("tax_id")} /></Field>
          </div>
        </Card>
      )}
      <div className="lg:col-span-2"><Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save changes</Button></div>
    </form>
  );
}
