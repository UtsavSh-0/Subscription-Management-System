import { REF_DATE } from "@/lib/config";
import type { AppData, Customer, Invoice, Payment, PaymentMethod, Plan, Subscription, SubscriptionStatus } from "@/types";

const GST = 0.18;
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const addMonths = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};
const startOn = (monthsAgo: number, day: number) =>
  `${addMonths(`${REF_DATE.slice(0, 7)}-01`, -monthsAgo).slice(0, 8)}${String(day).padStart(2, "0")}`;

const people: [string, string, string][] = [
  ["Meera Kapoor", "Northwind Traders", "meera@northwindtraders.in"],
  ["Arjun Rao", "Kestrel Logistics", "arjun@kestrellogistics.com"],
  ["Sana Qureshi", "Lumen Health", "sana@lumenhealth.in"],
  ["Vikram Shah", "Orbit Retail", "vikram@orbitretail.co"],
  ["Isha Menon", "Paperplane Studio", "isha@paperplane.studio"],
  ["Dev Malhotra", "Harbor & Co", "dev@harborco.in"],
  ["Nisha Iyer", "Greenfield Foods", "nisha@greenfieldfoods.in"],
  ["Kabir Sethi", "Tandem Labs", "kabir@tandemlabs.io"],
  ["Anaya Joshi", "Bluebird Academy", "anaya@bluebirdacademy.in"],
  ["Rahul Bansal", "Ironwood Works", "rahul@ironwoodworks.com"],
];

const customers: Customer[] = people.map(([name, company, email], i) => ({
  id: `cus-${i + 1}`,
  name,
  company,
  email,
  createdAt: addMonths(REF_DATE, -14 + i),
}));

const plan = (id: string, name: string, price: number, period: Plan["period"], minQuantity: number, pause: boolean): Plan => ({
  id,
  name,
  price,
  period,
  minQuantity,
  startDate: "2025-01-01",
  endDate: null,
  autoClose: false,
  allowEarlyClose: true,
  allowPause: pause,
  allowRenew: true,
});

const plans: Plan[] = [
  plan("plan-starter", "Starter", 2499, "monthly", 1, true),
  plan("plan-business", "Business", 7999, "monthly", 5, true),
  plan("plan-business-y", "Business annual", 79990, "yearly", 5, false),
  plan("plan-enterprise-y", "Enterprise annual", 249900, "yearly", 1, false),
  plan("plan-analytics", "Analytics add-on", 999, "monthly", 1, true),
];

// [customer, plan, status, months ago started, quantity, billing day]
const spec: [number, number, SubscriptionStatus, number, number, number][] = [
  [0, 1, "active", 10, 6, 3],
  [1, 0, "active", 8, 3, 12],
  [2, 3, "active", 14, 1, 5],
  [3, 1, "active", 6, 10, 18],
  [4, 2, "active", 5, 8, 9],
  [5, 0, "active", 4, 2, 22],
  [6, 4, "active", 9, 12, 7],
  [7, 1, "active", 3, 4, 15],
  [8, 0, "active", 2, 1, 25],
  [9, 2, "active", 11, 5, 2],
  [0, 4, "active", 7, 6, 3],
  [3, 4, "active", 5, 10, 18],
  [1, 1, "closed", 12, 2, 12],
  [5, 1, "quotation", 0, 3, 0],
  [6, 2, "confirmed", 0, 6, 0],
  [8, 3, "draft", 0, 1, 0],
];

type PendingInvoice = Omit<Invoice, "id" | "number">;
const subscriptions: Subscription[] = [];
const pending: PendingInvoice[] = [];

spec.forEach(([ci, pi, status, ago, qty, day], idx) => {
  const p = plans[pi];
  const notStarted = status === "draft" || status === "quotation" || status === "confirmed";
  const start = notStarted ? addDays(REF_DATE, 5 + idx) : startOn(ago, day);
  const yearly = p.period === "yearly";
  const expiry = addMonths(start, yearly ? 24 : status === "closed" ? 6 : 12);
  const amount = p.price * qty;
  subscriptions.push({
    id: `sub-${idx + 1}`,
    number: `SUB-${String(idx + 1).padStart(4, "0")}`,
    customerId: customers[ci].id,
    planId: p.id,
    status,
    quantity: qty,
    amount,
    startDate: start,
    expiryDate: expiry,
    paymentTerms: yearly ? "Net 30" : "Net 14",
  });
  if (notStarted) return;

  const step = yearly ? 12 : 1;
  for (let k = 0; ; k++) {
    const issue = addMonths(start, k * step);
    if (issue > REF_DATE || issue >= expiry) break;
    const isLast = addMonths(start, (k + 1) * step) > REF_DATE;
    const open =
      status !== "closed" &&
      (isLast ? !yearly && [0, 1, 5, 6].includes(idx) : (idx + k) % 5 === 4 && addMonths(issue, 3) > REF_DATE);
    const tax = Math.round(amount * GST);
    pending.push({
      customerId: customers[ci].id,
      subscriptionId: `sub-${idx + 1}`,
      issueDate: issue,
      dueDate: addDays(issue, yearly ? 30 : 14),
      subtotal: amount,
      tax,
      total: amount + tax,
      status: open ? "confirmed" : "paid",
    });
  }
});

pending.sort((a, b) => a.issueDate.localeCompare(b.issueDate));

const methods: PaymentMethod[] = ["Card", "Bank transfer", "UPI", "Cheque"];
const invoices: Invoice[] = [];
const payments: Payment[] = [];

pending.forEach((inv, i) => {
  const id = `inv-${i + 1}`;
  invoices.push({ ...inv, id, number: `INV-${inv.issueDate.slice(0, 4)}-${String(i + 1).padStart(4, "0")}` });
  if (inv.status !== "paid") return;
  const paidOn = addDays(inv.issueDate, 2 + (i % 8));
  payments.push({
    id: `pay-${payments.length + 1}`,
    invoiceId: id,
    customerId: inv.customerId,
    method: methods[i % methods.length],
    amount: inv.total,
    date: paidOn > REF_DATE ? REF_DATE : paidOn,
    note: i % 5 === 0 ? "Settled after reminder" : "Recurring subscription payment",
  });
});

export const seedData: AppData = { customers, plans, subscriptions, invoices, payments };
