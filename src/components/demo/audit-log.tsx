"use client";

import { ScrollText } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function AuditLog() {
  const { data } = useAppStore();
  const events = data.auditLogs ?? [];
  return <div className="mx-auto max-w-5xl space-y-5"><header><span className="text-xs font-semibold uppercase tracking-wider text-primary">Workspace history</span><h1 className="mt-2 text-2xl font-semibold tracking-tight">Audit log</h1><p className="mt-1 text-sm text-muted-foreground">Recent changes recorded by the local demo workspace.</p></header><section className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="grid grid-cols-[1fr_auto] gap-3 border-b bg-muted/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Activity</span><span>Time</span></div>{events.map((event)=><div key={event.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b px-5 py-4 last:border-0"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><ScrollText className="size-4"/></span><div className="min-w-0"><p className="truncate text-sm font-medium">{event.action}</p><p className="mt-0.5 text-xs text-muted-foreground">by {event.actor}</p></div></div><time className="text-right text-[11px] text-muted-foreground" dateTime={event.at}>{new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(event.at))}</time></div>)}{!events.length&&<div className="px-6 py-14 text-center"><ScrollText className="mx-auto size-8 text-muted-foreground/50"/><p className="mt-3 text-sm font-medium">No changes recorded yet</p><p className="mt-1 text-xs text-muted-foreground">Workspace changes will appear here automatically.</p></div>}</section><p className="text-xs text-muted-foreground">Local audit history is stored in browser storage and is intended for demo review, not compliance evidence.</p></div>;
}
