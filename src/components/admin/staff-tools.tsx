"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export const MODULES = ["customers", "subscriptions", "quotations", "invoices", "payments", "support"] as const;
export type Perm = { module: string; can_view: boolean; can_create: boolean; can_edit: boolean };

export function InviteStaff() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(body?.error?.message ?? "Could not create the staff account");
    toast.success(`Invitation sent to ${email}`);
    setName(""); setEmail("");
    router.refresh();
  }

  return (
    <Card className="mb-6">
      <CardHeader><div><CardTitle>Invite a staff member</CardTitle><CardDescription>They receive an email to set their password, then sign in at /staff/login.</CardDescription></div></CardHeader>
      <form onSubmit={onSubmit} className="grid gap-3 px-5 pb-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Full name"><Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Work email"><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <UserPlus />} Send invite</Button>
      </form>
    </Card>
  );
}

/** Per-staff permission grid. Writes go straight to staff_permissions; RLS only lets admins do it. */
export function PermissionsEditor({ profileId, initial }: { profileId: string; initial: Perm[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Perm[]>(MODULES.map((m) => initial.find((p) => p.module === m) ?? { module: m, can_view: false, can_create: false, can_edit: false }));
  const [busy, setBusy] = useState(false);

  const toggle = (m: string, k: "can_view" | "can_create" | "can_edit") =>
    setRows((rs) => rs.map((r) => (r.module === m ? { ...r, [k]: !r[k], ...(k === "can_view" && r.can_view ? { can_create: false, can_edit: false } : {}), ...(k !== "can_view" && !r[k] ? { can_view: true } : {}) } : r)));

  async function save() {
    setBusy(true);
    const { error } = await createClient().from("staff_permissions").upsert(rows.map((r) => ({ ...r, profile_id: profileId })));
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Permissions saved");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1.5 font-medium">Module</th><th className="font-medium">View</th><th className="font-medium">Create</th><th className="font-medium">Edit</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.module} className="border-t">
                <td className="py-2 capitalize">{r.module}</td>
                {(["can_view", "can_create", "can_edit"] as const).map((k) => (
                  <td key={k}><input type="checkbox" aria-label={`${r.module} ${k}`} checked={r[k]} onChange={() => toggle(r.module, k)} className="size-4 accent-[hsl(var(--primary))]" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" onClick={save} disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save permissions</Button>
    </div>
  );
}
