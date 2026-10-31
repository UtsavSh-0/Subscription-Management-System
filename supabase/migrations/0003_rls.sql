-- Row Level Security. Model:
--   admin    : everything
--   staff    : read the catalog; create/update customers, quotations, subscriptions, invoices, payments
--              (no deletes; cannot change catalog, taxes, discounts, templates or roles)
--   customer : read only their own customer/subscription/quotation/invoice/payment rows
-- The service role (used only in server code) bypasses RLS. products.cost_price is staff-only data,
-- so customers get no direct read access to products/variants/taxes.

alter table profiles enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table taxes enable row level security;
alter table product_taxes enable row level security;
alter table plans enable row level security;
alter table quotation_templates enable row level security;
alter table quotation_template_lines enable row level security;
alter table subscriptions enable row level security;
alter table subscription_items enable row level security;
alter table quotations enable row level security;
alter table quotation_items enable row level security;
alter table discounts enable row level security;
alter table discount_usage enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;
alter table billing_runs enable row level security;
alter table billing_failures enable row level security;

-- profiles
create policy profiles_select on profiles for select to authenticated using (id = auth.uid() or is_staff());
create policy profiles_update_self on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on profiles for all to authenticated using (is_admin()) with check (is_admin());

-- customers
create policy customers_select on customers for select to authenticated using (user_id = auth.uid() or is_staff());
create policy customers_insert on customers for insert to authenticated with check (is_staff());
create policy customers_update on customers for update to authenticated
  using (user_id = auth.uid() or is_staff()) with check (user_id = auth.uid() or is_staff());
create policy customers_delete on customers for delete to authenticated using (is_admin());

-- catalog: staff read, admin write
create policy products_select on products for select to authenticated using (is_staff());
create policy products_admin on products for all to authenticated using (is_admin()) with check (is_admin());
create policy variants_select on product_variants for select to authenticated using (is_staff());
create policy variants_admin on product_variants for all to authenticated using (is_admin()) with check (is_admin());
create policy taxes_select on taxes for select to authenticated using (is_staff());
create policy taxes_admin on taxes for all to authenticated using (is_admin()) with check (is_admin());
create policy product_taxes_select on product_taxes for select to authenticated using (is_staff());
create policy product_taxes_admin on product_taxes for all to authenticated using (is_admin()) with check (is_admin());
-- plans are not sensitive; any signed-in user may read them (customers see their plan names)
create policy plans_select on plans for select to authenticated using (true);
create policy plans_admin on plans for all to authenticated using (is_admin()) with check (is_admin());

-- quotation templates: staff read, admin write
create policy qt_select on quotation_templates for select to authenticated using (is_staff());
create policy qt_admin on quotation_templates for all to authenticated using (is_admin()) with check (is_admin());
create policy qtl_select on quotation_template_lines for select to authenticated using (is_staff());
create policy qtl_admin on quotation_template_lines for all to authenticated using (is_admin()) with check (is_admin());

-- quotations
create policy quotations_select on quotations for select to authenticated
  using (is_staff() or customer_id = current_customer_id());
create policy quotations_insert on quotations for insert to authenticated with check (is_staff());
create policy quotations_update on quotations for update to authenticated using (is_staff()) with check (is_staff());
create policy quotations_delete on quotations for delete to authenticated using (is_admin());
create policy quotation_items_select on quotation_items for select to authenticated
  using (is_staff() or exists (select 1 from quotations q where q.id = quotation_id and q.customer_id = current_customer_id()));
create policy quotation_items_write on quotation_items for all to authenticated using (is_staff()) with check (is_staff());

-- subscriptions
create policy subs_select on subscriptions for select to authenticated
  using (is_staff() or customer_id = current_customer_id());
create policy subs_insert on subscriptions for insert to authenticated with check (is_staff());
create policy subs_update on subscriptions for update to authenticated using (is_staff()) with check (is_staff());
create policy subs_delete on subscriptions for delete to authenticated using (is_admin());
create policy sub_items_select on subscription_items for select to authenticated
  using (is_staff() or exists (select 1 from subscriptions s where s.id = subscription_id and s.customer_id = current_customer_id()));
create policy sub_items_write on subscription_items for all to authenticated using (is_staff()) with check (is_staff());

-- discounts: staff read, admin write. Usage rows are written by the billing engine (service role).
create policy discounts_select on discounts for select to authenticated using (is_staff());
create policy discounts_admin on discounts for all to authenticated using (is_admin()) with check (is_admin());
create policy discount_usage_select on discount_usage for select to authenticated using (is_staff());

-- invoices: customers never see drafts
create policy invoices_select on invoices for select to authenticated
  using (is_staff() or (customer_id = current_customer_id() and status <> 'draft'));
create policy invoices_insert on invoices for insert to authenticated with check (is_staff());
create policy invoices_update on invoices for update to authenticated using (is_staff()) with check (is_staff());
create policy invoice_items_select on invoice_items for select to authenticated
  using (is_staff() or exists (select 1 from invoices i where i.id = invoice_id and i.customer_id = current_customer_id() and i.status <> 'draft'));
create policy invoice_items_write on invoice_items for all to authenticated using (is_staff()) with check (is_staff());

-- payments: staff record; nobody edits history except admin
create policy payments_select on payments for select to authenticated
  using (is_staff() or customer_id = current_customer_id());
create policy payments_insert on payments for insert to authenticated with check (is_staff());
create policy payments_admin on payments for update to authenticated using (is_admin()) with check (is_admin());
create policy payments_delete on payments for delete to authenticated using (is_admin());

-- operations: admin read only; all writes go through the service role
create policy audit_select on audit_logs for select to authenticated using (is_admin());
create policy billing_runs_select on billing_runs for select to authenticated using (is_admin());
create policy billing_failures_select on billing_failures for select to authenticated using (is_admin());
