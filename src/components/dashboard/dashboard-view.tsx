"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { getKpis, overdueInvoices, recentActivity, recentPayments, revenueSeries, statusBreakdown } from "@/lib/analytics";
import { cn, formatMoney } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const RANGES = [3, 6, 12] as const;

export function DashboardView({ title = "Overview", description = "Recurring revenue, billing and collections across Brightloop.", extra }: { title?: string; description?: string; extra?: ReactNode }) {
  const { data } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const reload = () => { setLoading(true); router.refresh(); setTimeout(() => setLoading(false), 600); };
  const [range, setRange] = useState<(typeof RANGES)[number]>(6);

  const kpis = useMemo(() => getKpis(data), [data]);
  const series = useMemo(() => revenueSeries(data, range), [data, range]);
  const breakdown = useMemo(() => statusBreakdown(data), [data]);
  const payments = useMemo(() => recentPayments(data, 6), [data]);
  const overdue = useMemo(() => overdueInvoices(data, 6), [data]);
  const activity = useMemo(() => recentActivity(data, 7), [data]);

  const delta = kpis.collectedDelta;

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
              value={String(kpis.activeCount)}
              icon={Repeat}
              footer={
                <>
                  {kpis.startedThisMonth > 0 ? `${kpis.startedThisMonth} started this month` : "No new starts this month"}
                  <span className="block">{formatMoney(kpis.mrr, true)} monthly recurring</span>
                </>
              }
            />
            <KpiCard
              label="Collected this month"
              value={formatMoney(kpis.collectedThisMonth)}
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
              value={formatMoney(kpis.outstanding)}
              icon={Hourglass}
              footer={`${kpis.openCount} open ${kpis.openCount === 1 ? "invoice" : "invoices"}`}
            />
            <KpiCard
              label="Overdue invoices"
              value={String(kpis.overdueCount)}
              icon={AlertTriangle}
              tone="danger"
              footer={`${formatMoney(kpis.overdueAmount)} past due`}
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
              {kpis.overdueCount > 0 && <Badge variant="danger">{kpis.overdueCount} overdue</Badge>}
            </CardHeader>
            <OverdueTable rows={overdue} />
          </Card>
        </div>
      )}
    </>
  );
}
