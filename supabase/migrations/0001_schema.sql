-- Brightloop: core schema. Money is numeric(12,2). Roles/statuses mirror src/types and src/lib/nav.ts (lowercase).

create type user_role as enum ('admin', 'staff', 'customer');
create type billing_frequency as enum ('daily', 'weekly', 'monthly', 'yearly');
create type subscription_status as enum ('draft', 'quotation', 'confirmed', 'active', 'closed');
create type quotation_status as enum ('draft', 'quotation', 'confirmed');
create type invoice_status as enum ('draft', 'confirmed', 'paid', 'cancelled');
create type payment_method as enum ('Card', 'Bank transfer', 'UPI', 'Cheque');
create type discount_type as enum ('fixed', 'percentage');
create type discount_scope as enum ('product', 'subscription');

create sequence subscription_number_seq;
create sequence quotation_number_seq;
create sequence invoice_number_seq;

-- Users & roles ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles (id) on delete set null,
  name text not null,
  company text not null default '',
  email text not null unique,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_search_idx on customers (lower(name), lower(company));

-- Catalog -------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'service',
  sales_price numeric(12,2) not null check (sales_price >= 0),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  notes text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_active_idx on products (archived, name);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  attribute text not null,            -- e.g. "Brand"
  value text not null,                -- e.g. "Odoo"
  additional_price numeric(12,2) not null default 0,  -- e.g. 560
  unique (product_id, attribute, value)
);

create table taxes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  rate numeric(5,2) not null check (rate >= 0 and rate <= 100),
  active boolean not null default true
);

create table product_taxes (
  product_id uuid not null references products (id) on delete cascade,
  tax_id uuid not null references taxes (id) on delete restrict,
  primary key (product_id, tax_id)
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  frequency billing_frequency not null,
  min_quantity integer not null default 1 check (min_quantity >= 1),
  start_date date not null,
  end_date date,
  auto_close boolean not null default false,
  allow_early_close boolean not null default false,
  allow_pause boolean not null default false,
  allow_renew boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);
create index plans_active_idx on plans (archived, start_date);

-- Quotations ----------------------------------------------------------------
create table quotation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  validity_days integer not null default 30 check (validity_days > 0),
  plan_id uuid references plans (id),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table quotation_template_lines (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references quotation_templates (id) on delete cascade,
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  quantity integer not null default 1 check (quantity > 0)
);

-- Subscriptions -------------------------------------------------------------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('SUB-' || lpad(nextval('subscription_number_seq')::text, 4, '0')),
  customer_id uuid not null references customers (id),
  plan_id uuid not null references plans (id),
  status subscription_status not null default 'draft',
  start_date date not null,
  expiry_date date not null,
  payment_terms text not null default 'Net 14',
  next_billing_date date,
  paused_at timestamptz,
  closed_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expiry_date >= start_date)
);
create index subscriptions_customer_idx on subscriptions (customer_id);
create index subscriptions_status_idx on subscriptions (status);
-- Billing engine scan: only active, unpaused subscriptions with a billing date.
create index subscriptions_due_idx on subscriptions (next_billing_date)
  where status = 'active' and paused_at is null;

create table subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),  -- sales price + variant extra, snapshotted
  tax_rate numeric(5,2) not null default 0,                    -- snapshotted combined product tax rate
  amount numeric(12,2) generated always as (quantity * unit_price) stored
);
create index subscription_items_sub_idx on subscription_items (subscription_id);

create table quotations (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('QUO-' || lpad(nextval('quotation_number_seq')::text, 4, '0')),
  customer_id uuid not null references customers (id),
  plan_id uuid not null references plans (id),
  template_id uuid references quotation_templates (id),
  status quotation_status not null default 'draft',
  valid_until date not null,
  payment_terms text not null default 'Net 14',
  start_date date,
  -- Set exactly once on conversion; unique => a quotation can never produce two subscriptions.
  subscription_id uuid unique references subscriptions (id),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotations_customer_idx on quotations (customer_id);
create index quotations_status_idx on quotations (status);

create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations (id) on delete cascade,
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 0,
  amount numeric(12,2) generated always as (quantity * unit_price) stored
);
create index quotation_items_q_idx on quotation_items (quotation_id);

-- Discounts -----------------------------------------------------------------
create table discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type discount_type not null,
  value numeric(12,2) not null check (value > 0),
  scope discount_scope not null default 'subscription',
  product_id uuid references products (id),
  min_purchase numeric(12,2) not null default 0,
  min_quantity integer not null default 0,
  start_date date not null,
  end_date date,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  times_used integer not null default 0,
  active boolean not null default true,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  check (type <> 'percentage' or value <= 100),
  check (scope <> 'product' or product_id is not null),
  check (end_date is null or end_date >= start_date)
);
create index discounts_lookup_idx on discounts (active, start_date, end_date);

-- Invoices & payments -------------------------------------------------------
create table invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0')),
  customer_id uuid not null references customers (id),
  subscription_id uuid references subscriptions (id),
  period_start date,
  period_end date,
  issue_date date not null default current_date,
  due_date date not null,
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  status invoice_status not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- THE duplicate-billing guard: one invoice per subscription per period.
  unique (subscription_id, period_start, period_end)
);
create index invoices_customer_idx on invoices (customer_id);
create index invoices_status_due_idx on invoices (status, due_date);
create index invoices_subscription_idx on invoices (subscription_id);
create index invoices_issue_idx on invoices (issue_date);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  product_id uuid references products (id),
  description text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  amount numeric(12,2) not null            -- line amount after discount, before tax
);
create index invoice_items_invoice_idx on invoice_items (invoice_id);

create table discount_usage (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references discounts (id),
  invoice_id uuid not null references invoices (id) on delete cascade,
  customer_id uuid not null references customers (id),
  amount numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique (discount_id, invoice_id)
);
create index discount_usage_discount_idx on discount_usage (discount_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id),
  customer_id uuid not null references customers (id),
  method payment_method not null,
  amount numeric(12,2) not null check (amount > 0),
  paid_on date not null default current_date,
  note text not null default '',
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);
create index payments_invoice_idx on payments (invoice_id);
create index payments_customer_idx on payments (customer_id);
create index payments_paid_on_idx on payments (paid_on);

-- Operations ----------------------------------------------------------------
create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs (entity, entity_id);
create index audit_logs_created_idx on audit_logs (created_at desc);

create table billing_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  due_count integer not null default 0,
  created_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  triggered_by text not null default 'cron'
);

create table billing_failures (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references billing_runs (id) on delete set null,
  subscription_id uuid not null references subscriptions (id),
  period_start date,
  error text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index billing_failures_open_idx on billing_failures (resolved, created_at desc);
