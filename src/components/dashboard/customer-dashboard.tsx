"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertCircle, CalendarClock, FileText, Repeat, Sparkles, Wallet } from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { REF_DATE } from "@/lib/config";
import { isOverdue } from "@/lib/analytics";
import { daysBetween, formatDate, formatMoney } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function CustomerDashboard({ name }: { name: string }) {
  const { data } = useAppStore();
  const v = useMemo(() => {
    const plans = new Map(data.plans.map((p) => [p.id, p]));
    const active = data.subscriptions.filter((s) => s.status === "active");
    const renewals = active
      .map((s) => ({ ...s, days: daysBetween(REF_DATE, s.expiryDate) }))
      .filter((s) => s.days >= 0 && s.days <= 30)
      .sort((a, b) => a.days - b.days);
    const open = data.invoices.filter((i) => i.status === "confirmed");
    const outstanding = open.reduce((a, i) => a + i.total, 0) - data.payments.filter((p) => open.some((i) => i.id === p.invoiceId)).reduce((a, p) => a + p.amount, 0);
    const recent = [...data.invoices].filter((i) => i.status !== "draft").sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 5);
    return { plans, active, renewals, open, outstanding, recent, overdue: open.filter((i) => isOverdue(i)).length };
  }, [data]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-fuchsia-600/80 p-6 text-primary-foreground shadow-pop sm:p-8">
        <div className="absolute -right-10 -top-10 size-56 rounded-full bg-white/10 blur-xl" aria-hidden />
        <Sparkles className="absolute bottom-4 right-6 size-24 text-white/10" aria-hidden />
        <p className="text-sm text-primary-foreground/80">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{name.split(" ")[0]}, here is your account at a glance.</h1>
        <p className="mt-2 max-w-xl text-sm text-primary-foreground/85">
          {v.overdue > 0 ? `You have ${v.overdue} overdue ${v.overdue === 1 ? "invoice" : "invoices"} that need attention.` : "You are all caught up. Nothing is overdue."}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary">
        <KpiCard label="Active subscriptions" value={String(v.active.length)} icon={Repeat} footer="Currently running" />
        <KpiCard label="Upcoming renewals" value={String(v.renewals.length)} icon={CalendarClock} footer="Within the next 30 days" />
        <KpiCard label="Pending payments" value={formatMoney(Math.max(v.outstanding, 0))} icon={Wallet} footer={`${v.open.length} open ${v.open.length === 1 ? "invoice" : "invoices"}`} />
        <KpiCard label="Overdue" value={String(v.overdue)} icon={AlertCircle} tone="danger" footer="Invoices past due date" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle>Subscription overview</CardTitle><CardDescription>Your active plans and when they end.</CardDescription></div></CardHeader>
          {v.active.length === 0 ? (
            <EmptyState icon={Repeat} title="No active subscriptions" description="Once a subscription is activated for you, it will show up here." />
          ) : (
            <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
              {v.active.map((s) => (
                <div key={s.id} className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{v.plans.get(s.planId)?.name ?? s.number}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(s.amount)}<span className="text-sm font-normal text-muted-foreground"> / {v.plans.get(s.planId)?.period ?? "period"}</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.number} &middot; ends {formatDate(s.expiryDate)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Upcoming renewals</CardTitle><CardDescription>Next 30 days.</CardDescription></div></CardHeader>
          {v.renewals.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing renewing soon" description="Renewals due within 30 days appear here." />
          ) : (
            <ul className="divide-y px-5 pb-3">
              {v.renewals.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <span><span className="block font-medium">{v.plans.get(s.planId)?.name ?? s.number}</span><span className="text-xs text-muted-foreground">{formatDate(s.expiryDate)}</span></span>
                  <Badge variant={s.days <= 7 ? "warning" : "info"}>{s.days === 0 ? "Today" : `${s.days}d`}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div><CardTitle>Recent invoices</CardTitle><CardDescription>Your latest billing documents.</CardDescription></div>
          <Link href="/customer/invoices" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </CardHeader>
        {v.recent.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices yet" description="Invoices appear here as soon as they are issued." />
        ) : (
          <div className="overflow-x-auto px-5 pb-4">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2 font-medium">Invoice</th><th className="font-medium">Issued</th><th className="font-medium">Due</th><th className="font-medium">Status</th><th className="text-right font-medium">Total</th></tr></thead>
              <tbody className="divide-y">
                {v.recent.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 font-medium">{i.number}</td><td>{formatDate(i.issueDate)}</td><td>{formatDate(i.dueDate)}</td>
                    <td><StatusBadge status={isOverdue(i) ? "overdue" : i.status} /></td><td className="text-right tabular-nums">{formatMoney(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
