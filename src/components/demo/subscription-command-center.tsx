"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarClock, CircleAlert, CreditCard, HeartPulse, RotateCcw, Users } from "lucide-react";
import type { AppData, DemoPaymentFailure, Invoice, Payment } from "@/types";
import { formatMoney } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
const daysFrom = (date: string) => Math.floor((new Date(`${date}T00:00:00Z`).getTime() - new Date(`${today()}T00:00:00Z`).getTime()) / 86_400_000);
const panel = "rounded-2xl border bg-card p-5 shadow-[0_10px_30px_-24px_rgba(37,30,76,.36)] sm:p-6";
const linkClass = "group inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:gap-2";

function Stat({ title, value, note, icon: Icon, tone = "orange", href }: { title: string; value: string | number; note: string; icon: typeof Users; tone?: "orange" | "violet" | "green" | "red"; href: string }) {
  const tones = { orange: "bg-orange-50 text-orange-700 ring-orange-100", violet: "bg-violet-50 text-violet-700 ring-violet-100", green: "bg-emerald-50 text-emerald-700 ring-emerald-100", red: "bg-rose-50 text-rose-700 ring-rose-100" };
  return <Link href={href} className="group rounded-2xl border bg-card p-4 shadow-[0_8px_24px_-22px_rgba(37,30,76,.4)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ring-1 ${tones[tone]}`}><Icon className="size-[18px]" /></span></div><p className="mt-3 text-xs text-muted-foreground">{note}</p></Link>;
}

export function SubscriptionCommandCenter({ data, onRetry }: { data: AppData; onRetry: (failure: DemoPaymentFailure) => void }) {
  const now = today();
  const monthStart = `${now.slice(0, 7)}-01`;
  const priorMonth = new Date(`${monthStart}T00:00:00Z`);
  priorMonth.setUTCMonth(priorMonth.getUTCMonth() - 1);
  const priorStart = priorMonth.toISOString().slice(0, 7) + "-01";
  const active = data.subscriptions.filter((x) => x.status === "active");
  const planById = new Map(data.plans.map((x) => [x.id, x]));
  const monthlyRunRate = active.reduce((sum, subscription) => {
    const period = planById.get(subscription.planId)?.period;
    const factor = period === "yearly" ? 1 / 12 : period === "weekly" ? 52 / 12 : period === "daily" ? 365 / 12 : 1;
    return sum + subscription.amount * factor;
  }, 0);
  const openInvoices = data.invoices.filter((x) => x.status !== "paid" && x.status !== "cancelled");
  const overdue = openInvoices.filter((x) => x.dueDate < now);
  const failures = (data.paymentFailures ?? []).filter((x) => x.status === "failed");
  const renewals = active.filter((x) => daysFrom(x.expiryDate) >= 0 && daysFrom(x.expiryDate) <= 30).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const paidInvoices = data.invoices.filter((x) => x.status === "paid").length;
  const collectionRate = data.invoices.length ? paidInvoices / data.invoices.length : 1;
  const overdueRate = data.invoices.length ? overdue.length / data.invoices.length : 0;
  const churnRate = data.subscriptions.length ? data.subscriptions.filter((x) => x.status === "closed").length / data.subscriptions.length : 0;
  const health = Math.max(0, Math.min(100, Math.round(collectionRate * 55 + (1 - Math.min(overdueRate * 4, 1)) * 25 + (1 - churnRate) * 20)));
  const healthLabel = health >= 82 ? "Healthy" : health >= 65 ? "Needs attention" : "At risk";
  const receivedThisMonth = data.payments.filter((x) => x.date >= monthStart && x.date <= now).reduce((sum, x) => sum + x.amount, 0);
  const receivedLastMonth = data.payments.filter((x) => x.date >= priorStart && x.date < monthStart).reduce((sum, x) => sum + x.amount, 0);
  const revenueChange = receivedLastMonth ? ((receivedThisMonth - receivedLastMonth) / receivedLastMonth) * 100 : null;
  const atRiskIds = new Set([...overdue.map((x) => x.customerId), ...failures.map((x) => x.customerId)]);
  const atRiskCustomers = data.customers.filter((x) => atRiskIds.has(x.id));
  const lastSixMonths = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(`${monthStart}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - (5 - offset));
    const key = date.toISOString().slice(0, 7);
    return { key, label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date), amount: data.payments.filter((x) => x.date.startsWith(key)).reduce((sum, x) => sum + x.amount, 0) };
  });
  const maxRevenue = Math.max(1, ...lastSixMonths.map((x) => x.amount));
  const customerById = new Map(data.customers.map((x) => [x.id, x]));
  const invoiceById = new Map(data.invoices.map((x) => [x.id, x]));

  return <div className="space-y-6">
    <header className="relative overflow-hidden rounded-[1.5rem] bg-[#17151c] px-5 py-6 text-white shadow-[0_24px_60px_-34px_rgba(20,15,25,.62)] sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute -right-12 -top-28 size-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-5"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-orange-200"><HeartPulse className="size-3.5" /> BUSINESS PULSE</span><h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Subscription Command Center</h1><p className="mt-1.5 max-w-2xl text-sm text-white/60">Your renewals, collections and customer health, in one view.</p></div><div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-white/70">Updated from this browser’s demo records</div></div>
      <div className="relative mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-white/[.055] px-4 py-3"><p className="text-[11px] text-white/55">Monthly recurring revenue</p><p className="mt-1 text-2xl font-semibold">{formatMoney(monthlyRunRate)}</p></div><div className="rounded-xl border border-white/10 bg-white/[.055] px-4 py-3"><p className="text-[11px] text-white/55">Collected this month</p><p className="mt-1 text-2xl font-semibold">{formatMoney(receivedThisMonth)}</p></div><div className="rounded-xl border border-white/10 bg-white/[.055] px-4 py-3"><p className="text-[11px] text-white/55">Revenue change vs last month</p><p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold">{revenueChange === null ? "—" : <>{revenueChange >= 0 ? <ArrowUpRight className="size-5 text-emerald-300" /> : <ArrowDownRight className="size-5 text-rose-300" />}{Math.abs(revenueChange).toFixed(1)}%</>}</p></div></div>
    </header>

    <section aria-label="Business metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat title="Renewals in 30 days" value={renewals.length} note={`${renewals.slice(0, 3).map((x) => customerById.get(x.customerId)?.company ?? "Customer").join(" · ") || "No renewals due"}`} icon={CalendarClock} tone="violet" href="/admin/subscriptions" />
      <Stat title="Failed payment attempts" value={failures.length} note={failures.length ? `${formatMoney(failures.reduce((sum, x) => sum + x.amount, 0))} needs a retry` : "No unresolved payment issues"} icon={CreditCard} tone="red" href="/admin/invoices" />
      <Stat title="Overdue invoices" value={overdue.length} note={`${formatMoney(overdue.reduce((sum, x) => sum + x.total, 0))} outstanding`} icon={CircleAlert} tone="red" href="/admin/invoices" />
      <Stat title="Customers at risk" value={atRiskCustomers.length} note="Has a failed attempt or overdue balance" icon={Users} tone="orange" href="/admin/customers" />
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.55fr_.85fr]">
      <article className={panel}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold tracking-tight">Revenue movement</h2><p className="mt-1 text-xs text-muted-foreground">Payments received in the last six months</p></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">Collected</span></div><div className="mt-7 flex h-44 items-end gap-2 border-b px-1 sm:gap-4">{lastSixMonths.map((month, index) => <div key={month.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end"><div title={formatMoney(month.amount)} className={`mx-auto w-full max-w-12 rounded-t-md transition-all ${index === lastSixMonths.length - 1 ? "bg-primary" : "bg-violet-200"}`} style={{ height: `${Math.max(4, (month.amount / maxRevenue) * 100)}%` }} /></div><span className="mb-2 text-[10px] text-muted-foreground">{month.label}</span></div>)}</div><p className="mt-3 text-xs text-muted-foreground">Total collected · <b className="font-semibold text-foreground">{formatMoney(lastSixMonths.reduce((sum, x) => sum + x.amount, 0))}</b></p></article>
      <article className={`${panel} flex flex-col justify-between`}><div><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-tight">Business health</h2><p className="mt-1 text-xs text-muted-foreground">Collection, overdue and retention signals</p></div><HeartPulse className="size-5 text-primary" /></div><div className="mt-5 flex items-center gap-5"><div className="relative grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${health >= 65 ? "#f97316" : "#e11d48"} ${health * 3.6}deg, #f0edf5 0deg)` }}><div className="grid size-[5.3rem] place-content-center rounded-full bg-card text-center"><span className="text-2xl font-semibold tracking-tight">{health}</span><span className="text-[9px] text-muted-foreground">OUT OF 100</span></div></div><div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${health >= 82 ? "bg-emerald-50 text-emerald-700" : health >= 65 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{healthLabel}</span><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{health >= 82 ? "Collections are steady and subscription retention is strong." : "Review the open payment and renewal items below."}</p></div></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-center"><div><p className="text-sm font-semibold">{Math.round(collectionRate * 100)}%</p><p className="mt-1 text-[10px] text-muted-foreground">Paid invoices</p></div><div><p className="text-sm font-semibold">{Math.round((1 - churnRate) * 100)}%</p><p className="mt-1 text-[10px] text-muted-foreground">Retained</p></div><div><p className="text-sm font-semibold">{atRiskCustomers.length}</p><p className="mt-1 text-[10px] text-muted-foreground">At risk</p></div></div></article>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <article className={panel}><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-tight">Upcoming renewals</h2><p className="mt-1 text-xs text-muted-foreground">Active subscriptions ending in the next 30 days</p></div><Link href="/admin/subscriptions" className={linkClass}>All subscriptions <ArrowRight className="size-3.5" /></Link></div><div className="mt-4 divide-y">{renewals.slice(0, 5).map((subscription) => <div key={subscription.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{customerById.get(subscription.customerId)?.company ?? "Customer"}</p><p className="mt-0.5 text-xs text-muted-foreground">{subscription.number} · {planById.get(subscription.planId)?.name}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold">{formatMoney(subscription.amount)}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{daysFrom(subscription.expiryDate) === 0 ? "Today" : `In ${daysFrom(subscription.expiryDate)} days`}</p></div></div>)}{renewals.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No renewals coming up in the next 30 days.</p>}</div></article>
      <article className={panel}><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-tight">Needs attention</h2><p className="mt-1 text-xs text-muted-foreground">Failed attempts and unpaid invoices to follow up</p></div><Link href="/admin/invoices" className={linkClass}>Open billing <ArrowRight className="size-3.5" /></Link></div><div className="mt-4 divide-y">{failures.slice(0, 3).map((failure) => { const invoice = invoiceById.get(failure.invoiceId); return <div key={failure.id} className="flex items-center gap-3 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700"><CreditCard className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{customerById.get(failure.customerId)?.company ?? "Customer"} · payment failed</p><p className="mt-0.5 text-xs text-muted-foreground">{failure.reason} · {invoice?.number}</p></div><button onClick={() => onRetry(failure)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted"><RotateCcw className="size-3" /> Retry</button></div>; })}{overdue.slice(0, Math.max(0, 4 - failures.length)).map((invoice: Invoice) => <div key={invoice.id} className="flex items-center gap-3 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><CircleAlert className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{customerById.get(invoice.customerId)?.company ?? "Customer"} · overdue</p><p className="mt-0.5 text-xs text-muted-foreground">{invoice.number} · due {invoice.dueDate}</p></div><span className="shrink-0 text-sm font-semibold">{formatMoney(invoice.total)}</span></div>)}{failures.length === 0 && overdue.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Everything is up to date.</p>}</div></article>
    </section>

    <section className={panel}><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-tight">Customer risk watch</h2><p className="mt-1 text-xs text-muted-foreground">Accounts with an outstanding payment signal</p></div><Link href="/admin/customers" className={linkClass}>Customer directory <ArrowRight className="size-3.5" /></Link></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{atRiskCustomers.slice(0, 6).map((customer) => { const balance = openInvoices.filter((x) => x.customerId === customer.id).reduce((sum, x) => sum + x.total, 0); return <div key={customer.id} className="flex items-center justify-between gap-3 rounded-xl border bg-background/70 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{customer.company}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{customer.name}</p></div><div className="text-right"><p className="text-sm font-semibold">{formatMoney(balance)}</p><span className="text-[10px] font-medium text-rose-700">Follow up</span></div></div>; })}{atRiskCustomers.length === 0 && <p className="py-7 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">No customers are currently flagged as at risk.</p>}</div></section>
  </div>;
}
