import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AppData } from "@/types";

const n = (v: unknown) => Number(v ?? 0);
const MAX = 5000;

/**
 * Loads everything the signed-in user is allowed to see, as the user (RLS applies).
 * Staff therefore get only their assigned customers' records; customers only their own.
 */
export async function loadAppData(): Promise<AppData> {
  const db = await createClient();
  const [c, p, s, i, pay] = await Promise.all([
    db.from("customers").select("id,name,company,email,created_at").limit(MAX),
    db.from("plans").select("*").limit(MAX),
    db.from("subscriptions").select("*, subscription_items(quantity,amount)").limit(MAX),
    db.from("invoices").select("id,number,customer_id,subscription_id,issue_date,due_date,subtotal,tax,total,status").limit(MAX),
    db.from("payments").select("id,invoice_id,customer_id,method,amount,paid_on,note").limit(MAX),
  ]);
  const err = [c, p, s, i, pay].find((r) => r.error)?.error;
  if (err) throw new Error(`Could not load data: ${err.message}`);

  const planPrice = new Map((p.data ?? []).map((x) => [x.id, n(x.price)]));
  return {
    customers: (c.data ?? []).map((x) => ({ id: x.id, name: x.name, company: x.company || x.name, email: x.email, createdAt: String(x.created_at).slice(0, 10) })),
    plans: (p.data ?? []).map((x) => ({
      id: x.id, name: x.name, price: n(x.price), period: x.frequency, minQuantity: x.min_quantity,
      startDate: x.start_date, endDate: x.end_date, autoClose: x.auto_close, allowEarlyClose: x.allow_early_close,
      allowPause: x.allow_pause, allowRenew: x.allow_renew,
    })),
    subscriptions: (s.data ?? []).map((x) => {
      const items = (x.subscription_items ?? []) as { quantity: number; amount: number }[];
      const amount = items.reduce((a, it) => a + n(it.amount), 0);
      return {
        id: x.id, number: x.number, customerId: x.customer_id, planId: x.plan_id, status: x.status,
        quantity: items.reduce((a, it) => a + it.quantity, 0) || 1,
        amount: amount || planPrice.get(x.plan_id) || 0,
        startDate: x.start_date, expiryDate: x.expiry_date, paymentTerms: x.payment_terms,
      };
    }),
    invoices: (i.data ?? []).map((x) => ({
      id: x.id, number: x.number, customerId: x.customer_id, subscriptionId: x.subscription_id ?? "",
      issueDate: x.issue_date, dueDate: x.due_date, subtotal: n(x.subtotal), tax: n(x.tax), total: n(x.total), status: x.status,
    })),
    payments: (pay.data ?? []).map((x) => ({
      id: x.id, invoiceId: x.invoice_id, customerId: x.customer_id, method: x.method, amount: n(x.amount), date: x.paid_on, note: x.note,
    })),
  };
}

export async function countOf(table: string, filter?: (q: any) => any): Promise<number> {
  const db = await createClient();
  let q: any = db.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}
