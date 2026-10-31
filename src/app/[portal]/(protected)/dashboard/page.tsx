import type { Metadata } from "next";
import { CalendarClock, FileClock, FileText, UserCog, Users } from "lucide-react";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { KpiCard } from "@/components/shared/kpi-card";
import { requireRole } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/portals";
import { countOf } from "@/lib/data/load";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ params }: { params: Promise<{ portal: string }> }) {
  const portal = (await params).portal as Role;
  const user = await requireRole(portal);

  if (portal === "customer") return <CustomerDashboard name={user.name} />;

  const pendingQuotes = await countOf("quotations", (q) => q.in("status", ["draft", "quotation"]));
  if (portal === "admin") {
    const [customers, staff] = await Promise.all([countOf("customers"), countOf("profiles", (q) => q.eq("role", "staff"))]);
    return (
      <DashboardView
        extra={
          <section aria-label="Team" className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Total customers" value={String(customers)} icon={Users} footer="Registered accounts" />
            <KpiCard label="Total staff" value={String(staff)} icon={UserCog} footer="Staff accounts" />
            <KpiCard label="Pending quotations" value={String(pendingQuotes)} icon={FileText} footer="Draft or sent, awaiting confirmation" />
          </section>
        }
      />
    );
  }
  const draftInvoices = await countOf("invoices", (q) => q.eq("status", "draft"));
  const assigned = await countOf("customers");
  return (
    <DashboardView
      title="My workspace"
      description="Your assigned customers, quotations, invoices and collections."
      extra={
        <section aria-label="Workload" className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Assigned customers" value={String(assigned)} icon={Users} footer="Customers you manage" />
          <KpiCard label="Pending quotations" value={String(pendingQuotes)} icon={FileClock} footer="Awaiting confirmation" />
          <KpiCard label="Draft invoices" value={String(draftInvoices)} icon={CalendarClock} footer="Not yet sent to customers" />
        </section>
      }
    />
  );
}
