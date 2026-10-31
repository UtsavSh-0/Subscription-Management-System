"use client";

import { useMemo, useState } from "react";
import { Gauge, TrendingDown, TrendingUp } from "lucide-react";
import type { AppData } from "@/types";
import { formatDate, formatMoney } from "@/lib/utils";

const day = () => new Date().toISOString().slice(0, 10);
const shell = "rounded-2xl border bg-card p-5 shadow-[0_10px_30px_-24px_rgba(37,30,76,.36)] sm:p-6";

export function RevenueInsights({ data }: { data: AppData }) {
  const [monthlyChurn, setMonthlyChurn] = useState(3);
  const [newSubscriptions, setNewSubscriptions] = useState(4);
  const currency = data.currency ?? "INR";
  const money = (value: number) => formatMoney(value, false, currency);
  const mrr = data.subscriptions.filter((x) => x.status === "active").reduce((sum, sub) => {
    const period = data.plans.find((plan) => plan.id === sub.planId)?.period;
    return sum + sub.amount * (period === "yearly" ? 1 / 12 : period === "weekly" ? 52 / 12 : period === "daily" ? 365 / 12 : 1);
  }, 0);
  const activeSubscriptions = data.subscriptions.filter((x) => x.status === "active");
  const averageSubscription = activeSubscriptions.reduce((sum, subscription) => {
    const period = data.plans.find((plan) => plan.id === subscription.planId)?.period;
    return sum + subscription.amount * (period === "yearly" ? 1 / 12 : period === "weekly" ? 52 / 12 : period === "daily" ? 365 / 12 : 1);
  }, 0) / Math.max(1, activeSubscriptions.length);
  const monthlySeries = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(`${day().slice(0, 7)}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - (5 - index));
    const month = date.toISOString().slice(0, 7);
    return { month, label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date), collected: data.payments.filter((p) => p.date.startsWith(month)).reduce((sum, p) => sum + p.amount, 0) };
  }), [data.payments]);
  const churn = monthlyChurn / 100;
  const forecast = Array.from({ length: 6 }, (_, index) => { const months = index + 1; const retention = Math.pow(1 - churn, months); const newMrr = newSubscriptions * averageSubscription * (churn ? (1 - retention) / churn : months); return mrr * retention + newMrr; });
  const forecastMRR = forecast[forecast.length - 1] ?? mrr;
  const invoicesOpen = data.invoices.filter((x) => x.status !== "paid" && x.status !== "cancelled");
  const healthRows = data.customers.filter((c) => !c.archived).map((customer) => {
    const overdue = invoicesOpen.filter((i) => i.customerId === customer.id && i.dueDate < day()).length;
    const open = (data.supportTickets ?? []).filter((t) => t.customerId === customer.id && t.status !== "Resolved").length;
    const active = data.subscriptions.some((s) => s.customerId === customer.id && s.status === "active");
    const score = Math.max(0, Math.min(100, 100 - overdue * 26 - open * 8 - (active ? 0 : 18)));
    return { customer, overdue, open, score };
  }).sort((a, b) => a.score - b.score);
  const maxCollected = Math.max(1, ...monthlySeries.map((x) => x.collected));

  return <div className="space-y-6"><header><span className="text-xs font-semibold uppercase tracking-wider text-primary">Planning & retention</span><h1 className="mt-2 text-2xl font-semibold tracking-tight">Revenue outlook</h1><p className="mt-1 text-sm text-muted-foreground">A directional forecast from your active subscriptions and actual demo collections.</p></header>
    <section className="grid gap-3 sm:grid-cols-3"><div className={shell}><p className="text-xs text-muted-foreground">Current MRR</p><b className="mt-2 block text-2xl">{money(mrr)}</b><span className="mt-2 block text-xs text-muted-foreground">Normalized across billing frequencies</span></div><div className={shell}><p className="text-xs text-muted-foreground">6-month forecast</p><b className="mt-2 block text-2xl">{money(forecastMRR)}</b><span className="mt-2 block text-xs text-muted-foreground">Scenario estimate from current MRR</span></div><div className={shell}><p className="text-xs text-muted-foreground">Portfolio retention</p><b className="mt-2 block text-2xl">{Math.round(100 * data.subscriptions.filter((x)=>x.status!=="closed").length/Math.max(1,data.subscriptions.length))}%</b><span className="mt-2 block text-xs text-muted-foreground">Based on subscription status records</span></div></section>
    <section className="grid gap-4 xl:grid-cols-2"><article className={shell}><div className="flex items-center justify-between"><div><h2 className="font-semibold">Collections trend</h2><p className="mt-1 text-xs text-muted-foreground">Real payments recorded each month</p></div><TrendingUp className="size-5 text-emerald-600"/></div><div className="mt-6 flex h-44 items-end gap-3 border-b px-1">{monthlySeries.map((month,index)=><div key={month.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end"><div title={money(month.collected)} className={`mx-auto w-full max-w-12 rounded-t-md ${index===5?"bg-primary":"bg-violet-200"}`} style={{height:`${Math.max(4,month.collected/maxCollected*100)}%`}}/></div><span className="mb-2 text-[10px] text-muted-foreground">{month.label}</span></div>)}</div><p className="mt-3 text-xs text-muted-foreground">Actual collections · {money(monthlySeries.reduce((s,x)=>s+x.collected,0))} over the period</p></article>
      <article className={shell}><div className="flex items-center justify-between"><div><h2 className="font-semibold">What-if revenue simulator</h2><p className="mt-1 text-xs text-muted-foreground">Adjust assumptions to compare a six-month MRR outcome</p></div><Gauge className="size-5 text-violet-600"/></div><div className="mt-5 space-y-5"><label className="block text-sm">Monthly churn <span className="float-right font-semibold">{monthlyChurn}%</span><input className="mt-3 w-full accent-primary" type="range" min="0" max="12" value={monthlyChurn} onChange={(e)=>setMonthlyChurn(Number(e.target.value))}/><span className="mt-1 block text-[11px] text-muted-foreground">Share of recurring revenue lost each month</span></label><label className="block text-sm">New subscriptions per month <span className="float-right font-semibold">{newSubscriptions}</span><input className="mt-3 w-full accent-primary" type="range" min="0" max="20" value={newSubscriptions} onChange={(e)=>setNewSubscriptions(Number(e.target.value))}/><span className="mt-1 block text-[11px] text-muted-foreground">Uses the current average subscription value</span></label></div><div className="mt-5 rounded-xl bg-[#17151c] p-4 text-white"><p className="text-xs text-white/60">Estimated MRR after 6 months</p><p className="mt-1 text-2xl font-semibold">{money(forecastMRR)}</p><p className="mt-1 text-xs text-white/55">{forecastMRR>=mrr?<TrendingUp className="mr-1 inline size-3 text-emerald-300"/>:<TrendingDown className="mr-1 inline size-3 text-rose-300"/>}{forecastMRR>=mrr?"Above":"Below"} current MRR of {money(mrr)} · directional demo estimate</p></div></article></section>
    <section className={shell}><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold">Customer health & churn signals</h2><p className="mt-1 text-xs text-muted-foreground">Scores use overdue invoices, open support requests and active subscription status.</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700">Demo portfolio analysis</span></div><div className="mt-4 divide-y">{healthRows.slice(0,8).map(({customer,overdue,open,score})=><div key={customer.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><div><p className="text-sm font-medium">{customer.company}</p><p className="text-xs text-muted-foreground">{customer.name}</p></div><p className="text-xs text-muted-foreground">{overdue} overdue · {open} open support {open===1?"request":"requests"}</p><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${score<55?"bg-rose-500":score<80?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${score}%`}}/></div><b className="w-8 text-right text-xs">{score}</b></div></div>)}{!healthRows.length&&<p className="py-6 text-sm text-muted-foreground">Customer signals will appear as records are added.</p>}</div><p className="mt-3 border-t pt-3 text-[11px] text-muted-foreground">This is a transparent demo indicator, not a prediction of customer behavior. Updated from records as of {formatDate(day())}.</p></section>
  </div>;
}
