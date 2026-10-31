import { REF_DATE } from "@/lib/config";
import { daysBetween } from "@/lib/utils";
import type { AppData, Invoice, Period, SubscriptionStatus } from "@/types";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const monthKey = (iso: string) => iso.slice(0, 7);
const shiftMonth = (key: string, delta: number) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};
const toMonthly = (amount: number, period: Period) =>
  ({ daily: amount * 30, weekly: (amount * 52) / 12, monthly: amount, yearly: amount / 12 })[period];

/** Overdue is derived, never stored: a confirmed invoice past its due date. */
export const isOverdue = (inv: Invoice, ref = REF_DATE) => inv.status === "confirmed" && inv.dueDate < ref;

export function getKpis(data: AppData) {
  const cur = monthKey(REF_DATE);
  const prev = shiftMonth(cur, -1);
  const planPeriod = new Map(data.plans.map((p) => [p.id, p.period]));
  const active = data.subscriptions.filter((s) => s.status === "active");
  const collected = (key: string) => sum(data.payments.filter((p) => monthKey(p.date) === key).map((p) => p.amount));
  const open = data.invoices.filter((i) => i.status === "confirmed");
  const overdue = open.filter((i) => isOverdue(i));
  const thisMonth = collected(cur);
  const lastMonth = collected(prev);

  return {
    activeCount: active.length,
    startedThisMonth: active.filter((s) => monthKey(s.startDate) === cur).length,
    mrr: Math.round(sum(active.map((s) => toMonthly(s.amount, planPeriod.get(s.planId) ?? "monthly")))),
    collectedThisMonth: thisMonth,
    collectedDelta: lastMonth > 0 ? (thisMonth - lastMonth) / lastMonth : null,
    outstanding: sum(open.map((i) => i.total)),
    openCount: open.length,
    overdueCount: overdue.length,
    overdueAmount: sum(overdue.map((i) => i.total)),
  };
}

export function revenueSeries(data: AppData, months: number) {
  const cur = monthKey(REF_DATE);
  const fmt = (key: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: "UTC" }).format(new Date(`${key}-01`));
  return Array.from({ length: months }, (_, n) => {
    const key = shiftMonth(cur, -(months - 1 - n));
    return {
      key,
      label: fmt(key, { month: "short" }),
      full: fmt(key, { month: "long", year: "numeric" }),
      billed: sum(
        data.invoices
          .filter((i) => i.status !== "draft" && i.status !== "cancelled" && monthKey(i.issueDate) === key)
          .map((i) => i.total),
      ),
      collected: sum(data.payments.filter((p) => monthKey(p.date) === key).map((p) => p.amount)),
    };
  });
}

export function statusBreakdown(data: AppData) {
  const order: SubscriptionStatus[] = ["active", "confirmed", "quotation", "draft", "closed"];
  return order.map((status) => ({ status, count: data.subscriptions.filter((s) => s.status === status).length }));
}

export function recentPayments(data: AppData, limit: number) {
  const customers = new Map(data.customers.map((c) => [c.id, c]));
  const invoices = new Map(data.invoices.map((i) => [i.id, i]));
  return [...data.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((p) => ({ ...p, customer: customers.get(p.customerId), invoice: invoices.get(p.invoiceId) }));
}

export function overdueInvoices(data: AppData, limit: number) {
  const customers = new Map(data.customers.map((c) => [c.id, c]));
  return data.invoices
    .filter((i) => isOverdue(i))
    .map((i) => ({ ...i, customer: customers.get(i.customerId), daysOverdue: daysBetween(i.dueDate, REF_DATE) }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, limit);
}

export type ActivityKind = "payment" | "invoice" | "overdue" | "subscription";
export interface Activity {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
}

export function recentActivity(data: AppData, limit: number): Activity[] {
  const customers = new Map(data.customers.map((c) => [c.id, c.company]));
  const invoices = new Map(data.invoices.map((i) => [i.id, i]));
  const events: Activity[] = [];
  data.payments.forEach((p) =>
    events.push({
      id: p.id,
      kind: "payment",
      title: `${customers.get(p.customerId)} paid ${invoices.get(p.invoiceId)?.number ?? "an invoice"}`,
      detail: p.method,
      at: p.date,
    }),
  );
  data.invoices.forEach((i) => {
    if (i.status === "draft" || i.status === "cancelled") return;
    events.push({ id: `${i.id}-i`, kind: "invoice", title: `${i.number} sent to ${customers.get(i.customerId)}`, detail: "Invoice", at: i.issueDate });
    if (isOverdue(i))
      events.push({ id: `${i.id}-o`, kind: "overdue", title: `${i.number} is overdue`, detail: customers.get(i.customerId) ?? "", at: i.dueDate });
  });
  data.subscriptions.forEach((s) => {
    if (s.status === "active")
      events.push({ id: `${s.id}-s`, kind: "subscription", title: `${customers.get(s.customerId)} started ${s.number}`, detail: "Subscription", at: s.startDate });
  });
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
