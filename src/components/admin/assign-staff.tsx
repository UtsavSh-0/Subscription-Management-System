"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/** Admin-only control. The update runs as the admin under RLS; the database trigger blocks anyone else. */
export function AssignStaff({ customerId, value, staff }: { customerId: string; value: string | null; staff: { id: string; name: string }[] }) {
  const router = useRouter();
  const [v, setV] = useState(value ?? "");
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    const prev = v;
    setV(next);
    setBusy(true);
    const { error } = await createClient().from("customers").update({ assigned_staff_id: next || null }).eq("id", customerId);
    setBusy(false);
    if (error) {
      setV(prev);
      return toast.error(error.message);
    }
    toast.success(next ? "Customer assigned" : "Assignment removed");
    router.refresh();
  }

  return (
    <select aria-label="Assigned staff" value={v} disabled={busy} onChange={(e) => change(e.target.value)} className="h-8 rounded-md border bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
      <option value="">Unassigned</option>
      {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}
