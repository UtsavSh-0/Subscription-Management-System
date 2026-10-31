import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreditCard, Mail, Receipt, Repeat, UserCog, Users } from "lucide-react";
import { AssignStaff } from "@/components/admin/assign-staff";
import { InviteStaff, PermissionsEditor, type Perm } from "@/components/admin/staff-tools";
import { ListPage, type Row } from "@/components/shared/list-page";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { type Role } from "@/lib/auth/portals";
import { requireModule, requireRole } from "@/lib/auth/session";
import { REF_DATE } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMoney } from "@/lib/utils";

const SECTIONS: Record<string, Role[]> = {
  customers: ["admin", "staff"],
  subscriptions: ["admin", "staff", "customer"],
  invoices: ["admin", "staff", "customer"],
  payments: ["admin", "staff", "customer"],
  staff: ["admin"],
  messages: ["admin"],
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const s = (await params).section;
  return { title: s.charAt(0).toUpperCase() + s.slice(1) };
}

// PostgREST returns embedded to-one relations as an object (typed loosely here because the client is untyped).
const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined);
const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };

export default async function SectionPage({ params }: { params: Promise<{ portal: string; section: string }> }) {
  const { portal, section } = await params;
  if (!SECTIONS[section]?.includes(portal as Role)) notFound();
  const user = await requireRole(portal as Role);
  if (["customers", "subscriptions", "invoices", "payments"].includes(section)) requireModule(user, section);
  const db = await createClient();
  const isCustomer = portal === "customer";
  const cust = (c: any) => { const x = one<{ name: string; company: string }>(c); return x ? x.company || x.name : "-"; };

  if (section === "customers") {
    const { data, error } = await db.from("customers").select("id,name,company,email,phone,created_at,assigned_staff_id").order("created_at", { ascending: false });
    fail(error);
    let staff: { id: string; name: string }[] = [];
    if (portal === "admin") {
      const r = await db.from("profiles").select("id,full_name,email").eq("role", "staff").order("full_name");
      fail(r.error);
      staff = (r.data ?? []).map((s) => ({ id: s.id, name: s.full_name || s.email }));
    }
    const rows: Row[] = (data ?? []).map((c) => ({
      id: c.id, name: <span className="font-medium">{c.name}</span>, company: c.company || "-", email: c.email, phone: c.phone ?? "-",
      joined: formatDate(c.created_at),
      assigned: portal === "admin" ? <AssignStaff customerId={c.id} value={c.assigned_staff_id} staff={staff} /> : "You",
    }));
    return (
      <ListPage title={portal === "staff" ? "My customers" : "Customers"} icon={Users}
        description={portal === "staff" ? "Customers assigned to you by an admin." : "Every customer account. Assign each one to a staff member."}
        columns={[{ key: "name", label: "Name" }, { key: "company", label: "Company", hideOnMobile: true }, { key: "email", label: "Email" }, { key: "phone", label: "Phone", hideOnMobile: true }, { key: "joined", label: "Joined", hideOnMobile: true }, { key: "assigned", label: "Assigned to" }]}
        rows={rows} emptyTitle={portal === "staff" ? "No customers assigned yet" : "No customers yet"}
        emptyText={portal === "staff" ? "An admin needs to assign customers to you." : "Customers appear here after they register."} />
    );
  }

  if (section === "subscriptions") {
    const { data, error } = await db.from("subscriptions").select("id,number,status,start_date,expiry_date,customer:customers(name,company),plan:plans(name,price,frequency)").order("created_at", { ascending: false });
    fail(error);
    const rows: Row[] = (data ?? []).map((s: any) => {
      const plan = one<{ name: string; price: number; frequency: string }>(s.plan);
      return { id: s.id, number: <span className="font-medium">{s.number}</span>, customer: cust(s.customer), plan: plan?.name ?? "-", price: plan ? `${formatMoney(Number(plan.price))} / ${plan.frequency}` : "-", status: <StatusBadge status={s.status} />, start: formatDate(s.start_date), expiry: formatDate(s.expiry_date) };
    });
    return (
      <ListPage title={isCustomer ? "My subscriptions" : "Subscriptions"} icon={Repeat} description={isCustomer ? "Your plans and their status." : "Subscriptions for the customers you can access."}
        columns={[{ key: "number", label: "Number" }, ...(isCustomer ? [] : [{ key: "customer", label: "Customer" }]), { key: "plan", label: "Plan" }, { key: "price", label: "Price", hideOnMobile: true }, { key: "status", label: "Status" }, { key: "start", label: "Start", hideOnMobile: true }, { key: "expiry", label: "Expires", hideOnMobile: true }]}
        rows={rows} emptyTitle="No subscriptions" emptyText={isCustomer ? "You have no subscriptions yet." : "No subscriptions to show."} />
    );
  }

  if (section === "invoices") {
    const { data, error } = await db.from("invoices").select("id,number,status,issue_date,due_date,total,amount_paid,customer:customers(name,company)").order("issue_date", { ascending: false });
    fail(error);
    const rows: Row[] = (data ?? []).map((i: any) => ({
      id: i.id, number: <span className="font-medium">{i.number}</span>, customer: cust(i.customer), issued: formatDate(i.issue_date), due: formatDate(i.due_date),
      status: <StatusBadge status={i.status === "confirmed" && i.due_date < REF_DATE ? "overdue" : i.status} />,
      paid: formatMoney(Number(i.amount_paid)), total: formatMoney(Number(i.total)),
    }));
    return (
      <ListPage title={isCustomer ? "My invoices" : "Invoices"} icon={Receipt} description={isCustomer ? "Invoices issued to you." : "Invoices for the customers you can access."}
        columns={[{ key: "number", label: "Invoice" }, ...(isCustomer ? [] : [{ key: "customer", label: "Customer" }]), { key: "issued", label: "Issued", hideOnMobile: true }, { key: "due", label: "Due", hideOnMobile: true }, { key: "status", label: "Status" }, { key: "paid", label: "Paid", align: "right" as const, hideOnMobile: true }, { key: "total", label: "Total", align: "right" as const }]}
        rows={rows} emptyTitle="No invoices" emptyText="Invoices appear here once they are issued." />
    );
  }

  if (section === "payments") {
    const { data, error } = await db.from("payments").select("id,method,amount,paid_on,note,invoice:invoices(number),customer:customers(name,company)").order("paid_on", { ascending: false });
    fail(error);
    const rows: Row[] = (data ?? []).map((p: any) => ({ id: p.id, date: formatDate(p.paid_on), invoice: one<{ number: string }>(p.invoice)?.number ?? "-", customer: cust(p.customer), method: p.method, note: p.note || "-", amount: formatMoney(Number(p.amount)) }));
    return (
      <ListPage title={isCustomer ? "My payments" : "Payments"} icon={CreditCard} description={isCustomer ? "Payments you have made." : "Payments received from the customers you can access."}
        columns={[{ key: "date", label: "Date" }, { key: "invoice", label: "Invoice" }, ...(isCustomer ? [] : [{ key: "customer", label: "Customer" }]), { key: "method", label: "Method", hideOnMobile: true }, { key: "note", label: "Note", hideOnMobile: true }, { key: "amount", label: "Amount", align: "right" as const }]}
        rows={rows} emptyTitle="No payments" emptyText="Payments appear here once recorded." />
    );
  }

  if (section === "staff") {
    const { data, error } = await db.from("profiles").select("id,full_name,email,phone,created_at, staff_permissions(module,can_view,can_create,can_edit)").eq("role", "staff").order("created_at", { ascending: false });
    fail(error);
    const rows: Row[] = (data ?? []).map((s: any) => {
      const perms = (s.staff_permissions ?? []) as Perm[];
      return {
        id: s.id, name: <span className="font-medium">{s.full_name || "-"}</span>, email: s.email, phone: s.phone ?? "-",
        access: <Badge variant="info">{perms.filter((p) => p.can_view).length} of 6 modules</Badge>,
        perms: <details className="min-w-[260px]"><summary className="cursor-pointer text-sm font-medium text-primary">Edit</summary><div className="mt-3"><PermissionsEditor profileId={s.id} initial={perms} /></div></details>,
      };
    });
    return (
      <ListPage title="Staff" icon={UserCog} description="Invite staff and control what each person can see and do." above={<InviteStaff />}
        columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone", hideOnMobile: true }, { key: "access", label: "Access" }, { key: "perms", label: "Permissions" }]}
        rows={rows} emptyTitle="No staff yet" emptyText="Invite your first staff member above." />
    );
  }

  const { data, error } = await db.from("contact_messages").select("id,name,email,message,created_at").order("created_at", { ascending: false });
  fail(error);
  const rows: Row[] = (data ?? []).map((m) => ({ id: m.id, date: formatDate(m.created_at), name: <span className="font-medium">{m.name}</span>, email: <a className="text-primary hover:underline" href={`mailto:${m.email}`}>{m.email}</a>, message: <span className="whitespace-pre-wrap">{m.message}</span> }));
  return (
    <ListPage title="Contact messages" icon={Mail} description="Messages sent from the public website contact form."
      columns={[{ key: "date", label: "Received" }, { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "message", label: "Message" }]}
      rows={rows} emptyTitle="No messages" emptyText="Messages from the website contact form appear here." />
  );
}
