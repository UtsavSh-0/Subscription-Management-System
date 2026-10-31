"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, Hourglass, RefreshCw, Repeat } from "lucide-react";
import { toast } from "sonner";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { OverdueTable } from "@/components/dashboard/overdue-table";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity, ActivityKind } from "@/lib/analytics";
import { cn, formatMoney } from "@/lib/utils";

const RANGES = [3, 6, 12] as const;

export function DashboardView({ title = "Overview", description = "Recurring revenue, billing and collections across Brightloop.", extra }: { title?: string; description?: string; extra?: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const reload = () => { setLoading(true); router.refresh(); setTimeout(() => setLoading(false), 600); };
  const [range, setRange] = useState<(typeof RANGES)[number]>(6);
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => {
    let live = true;
    fetch(`/api/dashboard?months=${range}`, { cache: "no-store" }).then(r => r.ok ? r.json() : Promise.reject()).then(v => { if (live) setSummary(v); }).catch(() => { if (live) setSummary(null); });
    return () => { live = false; };
  }, [range]);
  const kpis = summary?.kpis ?? { active_count: 0, started_this_month: 0, mrr: 0, collected_this_month: 0, collected_last_month: 0, outstanding: 0, open_count: 0, overdue_count: 0, overdue_amount: 0 };
  const delta = Number(kpis.collected_last_month) > 0 ? (Number(kpis.collected_this_month)-Number(kpis.collected_last_month))/Number(kpis.collected_last_month) : null;
  const series = useMemo(() => (summary?.series ?? []).map((p: any) => { const date = new Date(`${p.month}-01T00:00:00Z`); return { ...p, billed: Number(p.billed), collected: Number(p.collected), label: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }).format(date), full: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(date) }; }), [summary]);
  const breakdown = summary?.breakdown ?? [];
  const payments = (summary?.payments ?? []).map((p: any) => ({ id:p.id, method:p.method, amount:Number(p.amount), date:p.paid_on, customer:{company:p.customer}, invoice:{number:p.invoice} }));
  const overdue = (summary?.overdue ?? []).map((i:any) => ({ id:i.id, number:i.number, dueDate:i.due_date, total:Number(i.total)-Number(i.amount_paid), daysOverdue:Math.max(0,Math.floor((Date.now()-new Date(`${i.due_date}T00:00:00`).getTime())/86400000)), customer:{company:i.customer} }));
  const activity: Activity[] = (summary?.activity ?? []).map((a:any) => ({...a, kind: (a.kind === "invoice" ? "invoice" : "payment") as ActivityKind}));

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              reload();
              toast.success("Dashboard refreshed");
            }}
          >
            <RefreshCw className={cn(loading && "animate-spin")} /> Refresh
          </Button>
        }
      />

      {(
        <div className="space-y-6">
          {extra}
          <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Active subscriptions"
              value={String(kpis.active_count)}
              icon={Repeat}
              footer={
                <>
                  {kpis.started_this_month > 0 ? `${kpis.started_this_month} started this month` : "No new starts this month"}
                  <span className="block">{formatMoney(Number(kpis.mrr), true)} monthly recurring</span>
                </>
              }
            />
            <KpiCard
              label="Collected this month"
              value={formatMoney(Number(kpis.collected_this_month))}
              icon={Banknote}
              footer={
                delta === null ? (
                  "No payments last month to compare"
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Badge variant={delta >= 0 ? "success" : "danger"}>
                      {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {Math.abs(delta * 100).toFixed(1)}%
                    </Badge>
                    vs last month
                  </span>
                )
              }
            />
            <KpiCard
              label="Outstanding"
              value={formatMoney(Number(kpis.outstanding))}
              icon={Hourglass}
              footer={`${kpis.open_count} open ${kpis.open_count === 1 ? "invoice" : "invoices"}`}
            />
            <KpiCard
              label="Overdue invoices"
              value={String(kpis.overdue_count)}
              icon={AlertTriangle}
              tone="danger"
              footer={`${formatMoney(Number(kpis.overdue_amount))} past due`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Billed and collected</CardTitle>
                  <CardDescription>Invoices issued against payments received, by month.</CardDescription>
                </div>
                <div role="group" aria-label="Date range" className="flex rounded-md border bg-muted p-0.5 text-sm">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      aria-pressed={range === r}
                      className={cn(
                        "rounded px-2.5 py-1 font-medium transition-colors",
                        range === r ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {r}M
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 bg-primary" /> Collected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 border-t-2 border-dashed border-muted-foreground" /> Billed
                  </span>
                </div>
                <RevenueChart data={series} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Subscription status</CardTitle>
                  <CardDescription>Where every subscription stands today.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
            <StatusDonut data={breakdown} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-1">
                <div>
                  <CardTitle>Recent payments</CardTitle>
                  <CardDescription>The latest money received.</CardDescription>
                </div>
              </CardHeader>
              <RecentPayments rows={payments} />
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Billing events as they happen.</CardDescription>
                </div>
              </CardHeader>
              <ActivityFeed items={activity} />
            </Card>
          </section>

          <Card>
            <CardHeader className="pb-4">
              <div>
                <CardTitle>Overdue invoices</CardTitle>
                <CardDescription>Open invoices past their due date, longest overdue first.</CardDescription>
              </div>
              {kpis.overdue_count > 0 && <Badge variant="danger">{kpis.overdue_count} overdue</Badge>}
            </CardHeader>
            <OverdueTable rows={overdue} />
          </Card>
        </div>
      )}
    </>
  );
}
