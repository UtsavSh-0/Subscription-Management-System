import { createClient } from "@supabase/supabase-js";

const required = (key) => {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  return process.env[key];
};
if (process.env.DEMO_ACCESS_ENABLED !== "true") throw new Error("Set DEMO_ACCESS_ENABLED=true before provisioning demo accounts.");
const db = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
const check = (r) => { if (r.error) throw r.error; return r.data; };
const accounts = [
  { role: "admin", email: "admin@brightloop.demo", name: "Brightloop Demo Admin", password: required("DEMO_ADMIN_PASSWORD") },
  { role: "staff", email: "staff@brightloop.demo", name: "Brightloop Demo Staff", password: required("DEMO_STAFF_PASSWORD") },
  { role: "customer", email: "customer@brightloop.demo", name: "Alex Morgan (Demo)", password: required("DEMO_CUSTOMER_PASSWORD") },
];
if (accounts.some((account) => account.password.length < 12) || new Set(accounts.map((account) => account.password)).size !== accounts.length) {
  throw new Error("Use three different demo passwords of at least 12 characters.");
}

// Protect existing production identities and customer records from accidental reuse.
let existingAuthPage = 1, existingCustomerAuth;
do {
  const listed = check(await db.auth.admin.listUsers({ page: existingAuthPage, perPage: 1000 }));
  existingCustomerAuth = listed.users.find((u) => u.email?.toLowerCase() === "customer@brightloop.demo");
  if (existingCustomerAuth || listed.users.length < 1000) break;
  existingAuthPage++;
} while (true);
if (existingCustomerAuth) {
  const existingProfile = check(await db.from("profiles").select("is_demo").eq("id", existingCustomerAuth.id).single());
  if (!existingProfile.is_demo) throw new Error("Refusing to modify an existing non-demo customer account.");
}
const existingCustomerRows = check(await db.from("customers").select("email,is_demo,user_id").in("email", [
  "customer@brightloop.demo", "jamie@sample.brightloop.demo", "taylor@sample.brightloop.demo",
]));
for (const row of existingCustomerRows) {
  if (row.email === "customer@brightloop.demo" && existingCustomerAuth?.id === row.user_id) continue;
  if (!row.is_demo) throw new Error(`Refusing to overwrite non-demo customer data for ${row.email}.`);
}
async function ensureAccount({ role, email, name, password }) {
  let page = 1, user;
  do {
    const result = check(await db.auth.admin.listUsers({ page, perPage: 1000 }));
    user = result.users.find((u) => u.email?.toLowerCase() === email);
    if (user || result.users.length < 1000) break;
    page++;
  } while (true);
  if (user) {
    const profile = check(await db.from("profiles").select("is_demo").eq("id", user.id).single());
    if (!profile.is_demo) throw new Error(`Refusing to modify existing non-demo account ${email}.`);
  }
  user = user
    ? check(await db.auth.admin.updateUserById(user.id, { password, email_confirm: true, ban_duration: "none", app_metadata: { ...user.app_metadata, role } })).user
    : check(await db.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role }, user_metadata: { full_name: name } })).user;
  check(await db.from("profiles").update({ role, full_name: name, is_demo: true }).eq("id", user.id));
  if (role === "staff") check(await db.from("staff_permissions").upsert(["customers", "subscriptions", "quotations", "invoices", "payments", "support"].map((module) => ({
    profile_id: user.id, module, can_view: true, can_create: ["quotations", "invoices", "payments", "support"].includes(module), can_edit: module !== "customers",
  })), { onConflict: "profile_id,module" }));
  return user.id;
}

const [adminId, staffId, customerUserId] = await Promise.all(accounts.map(ensureAccount));
const customers = [
  { name: "Alex Morgan", company: "Cedar & Finch Studio", email: "customer@brightloop.demo", phone: "+1 555 010 0200", address: "100 Demo Lane", assigned_staff_id: staffId, is_demo: true },
  { id: "d0000000-0000-4000-8000-000000000002", name: "Jamie Lee", company: "Juniper Works (Demo)", email: "jamie@sample.brightloop.demo", phone: "+1 555 010 0201", address: "200 Sample Street", assigned_staff_id: staffId, is_demo: true },
  { id: "d0000000-0000-4000-8000-000000000003", name: "Taylor Reed", company: "Northstar Goods (Demo)", email: "taylor@sample.brightloop.demo", phone: "+1 555 010 0202", address: "300 Example Avenue", assigned_staff_id: staffId, is_demo: true },
];
check(await db.from("customers").update({ name: customers[0].name, company: customers[0].company, phone: customers[0].phone, address: customers[0].address, assigned_staff_id: staffId, is_demo: true }).eq("user_id", customerUserId));
const linkedCustomer = check(await db.from("customers").select("id").eq("user_id", customerUserId).single());
customers[0] = { ...customers[0], id: linkedCustomer.id, user_id: customerUserId };
check(await db.from("customers").upsert(customers[0], { onConflict: "id" }));
check(await db.from("customers").upsert(customers.slice(1), { onConflict: "id" }));
const customerRows = check(await db.from("customers").select("id,email").in("email", customers.map((c) => c.email)));
for (const customer of customers) customer.id = customerRows.find((row) => row.email === customer.email).id;

const product = "d1000000-0000-4000-8000-000000000001";
const planIds = ["d2000000-0000-4000-8000-000000000001", "d2000000-0000-4000-8000-000000000002"];
check(await db.from("products").upsert({ id: product, name: "Managed Studio Service (Demo)", type: "service", sales_price: 120, cost_price: 50, notes: "Synthetic demonstration item", archived: false, is_demo: true }, { onConflict: "id" }));
check(await db.from("plans").upsert([
  { id: planIds[0], name: "Studio Essentials (Demo)", price: 120, frequency: "monthly", min_quantity: 1, start_date: "2025-01-01", allow_renew: true, is_demo: true },
  { id: planIds[1], name: "Growth Plus (Demo)", price: 240, frequency: "monthly", min_quantity: 1, start_date: "2025-01-01", allow_renew: true, is_demo: true },
], { onConflict: "id" }));

const subIds = ["d3000000-0000-4000-8000-000000000001", "d3000000-0000-4000-8000-000000000002"];
check(await db.from("subscriptions").upsert([
  { id: subIds[0], number: "SUB-DEMO-0001", customer_id: customers[0].id, plan_id: planIds[0], status: "active", start_date: "2026-01-01", expiry_date: "2026-12-31", next_billing_date: "2026-11-01", payment_terms: "Net 14", created_by: adminId },
  { id: subIds[1], number: "SUB-DEMO-0002", customer_id: customers[1].id, plan_id: planIds[1], status: "active", start_date: "2026-03-01", expiry_date: "2027-02-28", next_billing_date: "2026-11-01", payment_terms: "Net 14", created_by: adminId },
], { onConflict: "id" }));
check(await db.from("subscription_items").upsert(subIds.map((subscription_id, i) => ({ id: `d3100000-0000-4000-8000-00000000000${i + 1}`, subscription_id, product_id: product, quantity: 1, unit_price: i ? 240 : 120, tax_rate: 8 })), { onConflict: "id" }));

const quoteIds = ["d4000000-0000-4000-8000-000000000001", "d4000000-0000-4000-8000-000000000002"];
check(await db.from("quotations").upsert([
  { id: quoteIds[0], number: "QUO-DEMO-0001", customer_id: customers[0].id, plan_id: planIds[1], status: "quotation", valid_until: "2026-12-31", payment_terms: "Net 14", created_by: staffId },
  { id: quoteIds[1], number: "QUO-DEMO-0002", customer_id: customers[2].id, plan_id: planIds[0], status: "confirmed", valid_until: "2026-12-31", payment_terms: "Net 14", created_by: staffId },
], { onConflict: "id" }));
check(await db.from("quotation_items").upsert(quoteIds.map((quotation_id, i) => ({ id: `d4100000-0000-4000-8000-00000000000${i + 1}`, quotation_id, product_id: product, quantity: 1, unit_price: i ? 120 : 240, tax_rate: 8 })), { onConflict: "id" }));

const invoiceIds = ["d5000000-0000-4000-8000-000000000001", "d5000000-0000-4000-8000-000000000002"];
check(await db.from("invoices").upsert([
  { id: invoiceIds[0], number: "INV-DEMO-0001", customer_id: customers[0].id, subscription_id: subIds[0], issue_date: "2026-10-01", due_date: "2026-10-15", subtotal: 120, tax: 9.6, total: 129.6, status: "confirmed" },
  { id: invoiceIds[1], number: "INV-DEMO-0002", customer_id: customers[1].id, subscription_id: subIds[1], issue_date: "2026-10-01", due_date: "2026-10-15", subtotal: 240, tax: 19.2, total: 259.2, status: "confirmed" },
], { onConflict: "id" }));
check(await db.from("invoice_items").upsert(invoiceIds.map((invoice_id, i) => ({ id: `d5100000-0000-4000-8000-00000000000${i + 1}`, invoice_id, product_id: product, description: "Managed Studio Service (Demo)", quantity: 1, unit_price: i ? 240 : 120, tax_rate: 8, tax_amount: i ? 19.2 : 9.6, amount: i ? 240 : 120 })), { onConflict: "id" }));
check(await db.from("payments").upsert([
  { id: "d6000000-0000-4000-8000-000000000001", invoice_id: invoiceIds[0], customer_id: customers[0].id, method: "Card", amount: 129.6, paid_on: "2026-10-05", note: "Demo payment", created_by: staffId },
  { id: "d6000000-0000-4000-8000-000000000002", invoice_id: invoiceIds[1], customer_id: customers[1].id, method: "Bank transfer", amount: 100, paid_on: "2026-10-07", note: "Demo partial payment", created_by: staffId },
], { onConflict: "id" }));
// Open RLS access only after accounts and every demo fixture are ready.
check(await db.from("system_settings").upsert({ key: "demo_access_enabled", value: true }, { onConflict: "key" }));
console.log("Demo accounts and synthetic sample records are provisioned.");
