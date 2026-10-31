"use client";

import { useAppStore } from "@/store/app-store";
import type { DemoAutomationSettings, DemoCurrency } from "@/types";
import { formatMoney } from "@/lib/utils";

const rates: Record<DemoCurrency, string> = { INR: "Base currency", USD: "Demo rate: ₹83 per $1", EUR: "Demo rate: ₹90 per €1", GBP: "Demo rate: ₹105 per £1" };
const defaults: DemoAutomationSettings = { renewalReminders: true, overdueFollowups: true, recoveryRetries: true };
const settingsList: [keyof DemoAutomationSettings, string, string][] = [["renewalReminders", "Renewal reminders", "Highlight subscriptions renewing within 30 days."], ["overdueFollowups", "Overdue follow-up queue", "Surface past-due invoices on staff and admin dashboards."], ["recoveryRetries", "Smart payment recovery", "Allow staff to record a local retry for failed payment attempts."]];

export function OperationsSettings() {
  const { data, setData } = useAppStore();
  const automation = data.automationSettings ?? defaults;
  const setAutomation = (key: keyof DemoAutomationSettings, value: boolean) => setData({ ...data, automationSettings: { ...automation, [key]: value } });
  const currency = data.currency ?? "INR";
  return <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"><header><span className="text-xs font-semibold uppercase tracking-wider text-primary">Workspace controls</span><h2 className="mt-1 text-lg font-semibold">Automation & display currency</h2><p className="mt-1 text-xs text-muted-foreground">Preferences apply to dashboards and local demo workflows.</p></header><div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-xl bg-violet-50/70 p-4"><label htmlFor="currency" className="text-sm font-semibold">Reporting currency</label><select id="currency" className="mt-2 w-full rounded-xl border bg-card px-3 py-2.5 text-sm" value={currency} onChange={(event)=>setData({...data,currency:event.target.value as DemoCurrency})}><option value="INR">INR · Indian rupee</option><option value="USD">USD · US dollar</option><option value="EUR">EUR · Euro</option><option value="GBP">GBP · British pound</option></select><p className="mt-2 text-xs text-muted-foreground">{rates[currency]}. Illustrative conversion for this demo; original records remain INR-based.</p><p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs">Example · ₹10,000 displays as <b>{formatMoney(10000,false,currency)}</b></p></div><div className="divide-y rounded-xl border px-4">{settingsList.map(([key,title,description])=><label key={key} className="flex cursor-pointer items-start justify-between gap-4 py-3"><span><b className="block text-sm font-medium">{title}</b><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span></span><input type="checkbox" className="mt-1 size-4 accent-primary" checked={automation[key]} onChange={(event)=>setAutomation(key,event.target.checked)}/></label>)}</div></div><p className="mt-4 text-[11px] text-muted-foreground">Automations are interactive demo controls. They do not run as background jobs while this browser is closed.</p></section>;
}
