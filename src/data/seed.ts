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
const addPeriod = (iso: string, n: number, period: Plan["period"]) => {
  const date = new Date(`${iso}T00:00:00Z`);
  if (period === "daily") return addDays(iso, n);
  if (period === "weekly") return addDays(iso, n * 7);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + (period === "monthly" ? n : 0);
  const year = date.getUTCFullYear() + (period === "yearly" ? n : 0);
  const first = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(day, lastDay));
  return first.toISOString().slice(0, 10);
};
const startOn = (monthsAgo: number, day: number) =>
  `${addMonths(`${REF_DATE.slice(0, 7)}-01`, -monthsAgo).slice(0, 8)}${String(day).padStart(2, "0")}`;

const people: [string, string, string][] = [
  ["Meera Kapoor", "Northwind Traders", "customer@brightloop.demo"],
  ["Arjun Rao", "Kestrel Logistics", "arjun@kestrellogistics.com"],
  ["Sana Qureshi", "Lumen Health", "sana@lumenhealth.in"],
  ["Vikram Shah", "Orbit Retail", "vikram@orbitretail.co"],
  ["Isha Menon", "Paperplane Studio", "isha@paperplane.studio"],
  ["Dev Malhotra", "Harbor & Co", "dev@harborco.in"],
  ["Nisha Iyer", "Greenfield Foods", "nisha@greenfieldfoods.in"],
  ["Kabir Sethi", "Tandem Labs", "kabir@tandemlabs.io"],
  ["Anaya Joshi", "Bluebird Academy", "anaya@bluebirdacademy.in"],
  ["Rahul Bansal", "Ironwood Works", "rahul@ironwoodworks.com"],
  ["Tara Sood", "Maple & Main", "tara@mapleandmain.in"],
  ["Rohan Kulkarni", "Cedar Mobility", "rohan@cedarmobility.in"],
  ["Aditi Sen", "Pixel Orchard", "aditi@pixelorchard.in"],
  ["Neil Fernandes", "Summit Learning", "neil@summitlearning.in"],
  ["Pooja Nair", "Silverline Care", "pooja@silverlinecare.in"],
  ["Kunal Mehta", "Freshfield Supply", "kunal@freshfieldsupply.in"],
  ["Zoya Mirza", "Beacon Creative", "zoya@beaconcreative.in"],
  ["Aarav Desai", "Westbridge Services", "aarav@westbridgeservices.in"],
];

const customers: Customer[] = people.map(([name, company, email], i) => ({
  id: `cus-${i + 1}`,
  name,
  company,
  email,
  createdAt: addMonths(REF_DATE, -14 + i),
  assignedStaffId: "demo-staff",
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
  plan("plan-daily", "Daily service", 199, "daily", 1, true),
  plan("plan-weekly", "Weekly support", 899, "weekly", 1, true),
  plan("plan-operations", "Operations monthly", 21900, "monthly", 3, true),
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
  [2, 5, "active", 1, 2, 20],
  [4, 6, "active", 2, 1, 16],
  [10, 1, "active", 7, 3, 5],
  [11, 0, "active", 9, 2, 11],
  [12, 2, "active", 13, 1, 20],
  [13, 4, "closed", 10, 4, 9],
  [14, 1, "active", 3, 5, 14],
  [15, 0, "active", 5, 2, 19],
  [16, 3, "active", 8, 1, 8],
  [17, 4, "active", 2, 3, 24],
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

  for (let k = 0; ; k++) {
    const issue = addPeriod(start, k, p.period);
    if (issue > REF_DATE || issue >= expiry) break;
    const isLast = addPeriod(start, k + 1, p.period) > REF_DATE;
    const open =
      status !== "closed" &&
      (isLast ? !yearly && [0, 1, 5, 6].includes(idx) : (idx + k) % 5 === 4 && addPeriod(issue, 3, p.period) > REF_DATE);
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

export const seedData: AppData = {
  customers, plans, subscriptions, invoices, payments,
  supportTickets: [
    { id: "ticket-001", customerId: "cus-1", subject: "Question about my upcoming renewal", category: "Subscription", priority: "Normal", status: "In progress", message: "Could you confirm which plan will renew next month?", response: "Your Business plan is scheduled to renew at the current rate.", createdAt: addDays(REF_DATE, -2) },
    { id: "ticket-002", customerId: "cus-2", subject: "Invoice payment confirmation", category: "Billing", priority: "High", status: "Open", message: "I have completed the transfer and would like to confirm it was received.", createdAt: addDays(REF_DATE, -1) },
    { id: "ticket-003", customerId: "cus-4", subject: "Add another team seat", category: "Subscription", priority: "Normal", status: "Resolved", message: "Please share the process to add one seat to our subscription.", response: "You can request a plan update from the subscription page.", createdAt: addDays(REF_DATE, -8) },
  ],
  paymentFailures: invoices.filter((invoice) => invoice.status === "confirmed").slice(0, 3).map((invoice, index) => ({
    id: `failure-${index + 1}`,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    attemptedAt: addDays(invoice.issueDate, 1),
    amount: invoice.total,
    reason: ["Card declined", "Bank authorization expired", "Insufficient funds"][index],
    status: "failed" as const,
  })),
  products: [
    { id: "prd-core", name: "Brightloop Core", category: "Software", price: 2499, variant: "Standard", variants: ["Standard", "Plus", "Enterprise"] },
    { id: "prd-analytics", name: "Analytics Suite", category: "Software", price: 999, variant: "Advanced" },
    { id: "prd-support", name: "Priority Support", category: "Service", price: 1499, variant: "Business hours", variants: ["Business hours", "24/7"] },
    { id: "prd-onboarding", name: "Guided onboarding", category: "Service", price: 4999, variant: "Remote" },
    { id: "prd-seats", name: "Additional seats", category: "Software", price: 699, variant: "Per seat", variants: ["Per seat", "Five-seat bundle"] },
    { id: "prd-api", name: "API access", category: "Software", price: 1899, variant: "Standard" },
    { id: "prd-training", name: "Team training", category: "Service", price: 3499, variant: "Workshop" },
    { id: "prd-storage", name: "Secure storage", category: "Software", price: 499, variant: "100 GB", variants: ["100 GB", "500 GB", "1 TB"] },
  ],
  quotations: [
    { id: "quote-001", number: "QT-2026-001", customerId: "cus-1", planId: "plan-business", items: [{ productId: "prd-core", variant: "Standard", quantity: 1 }, { productId: "prd-analytics", variant: "Advanced", quantity: 1 }], status: "sent", validUntil: "2026-12-15", subtotal: 11497, total: 13566 },
    { id: "quote-002", number: "QT-2026-002", customerId: "cus-2", planId: "plan-starter", items: [{ productId: "prd-core", variant: "Standard", quantity: 1 }], status: "draft", validUntil: "2026-12-20", subtotal: 4998, total: 5898 },
  ],
  quotationTemplates: [
    { id: "template-standard", name: "Standard onboarding", planId: "plan-business", productId: "prd-onboarding", quantity: 1 },
    { id: "template-starter", name: "Starter package", planId: "plan-starter", productId: "prd-core", quantity: 1 },
  ],
  billingSettings: { taxRate: 18, discountRate: 0 },
};
