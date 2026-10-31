-- Demo accounts use the normal application and Supabase Auth, while demo principals
-- are restricted to synthetic customer records. Never seed real customer data here.
alter table profiles add column if not exists is_demo boolean not null default false;
alter table customers add column if not exists is_demo boolean not null default false;
alter table products add column if not exists is_demo boolean not null default false;
alter table plans add column if not exists is_demo boolean not null default false;
insert into system_settings (key, value) values ('demo_access_enabled', 'true'::jsonb) on conflict (key) do nothing;

create or replace function demo_access_enabled() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (value #>> '{}')::boolean from system_settings where key = 'demo_access_enabled'), false)
$$;

create or replace function is_demo_user() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_demo from profiles where id = auth.uid()), false)
$$;

create or replace function customer_is_demo(p_customer uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_demo from customers where id = p_customer), false)
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' and (not is_demo or demo_access_enabled()) from profiles where id = auth.uid()), false)
$$;
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'staff') and (not is_demo or demo_access_enabled()) from profiles where id = auth.uid()), false)
$$;

-- A demo admin retains admin permissions over synthetic customer rows only.
create or replace function staff_manages(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select (is_admin() and (not is_demo_user() or customer_is_demo(cid))) or exists (
    select 1 from customers c join profiles p on p.id = auth.uid()
    where c.id = cid and c.assigned_staff_id = auth.uid() and p.role = 'staff'
      and (not is_demo_user() or (demo_access_enabled() and customer_is_demo(cid))))
$$;

create or replace function staff_can(p_module text, p_action text, cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select staff_manages(cid) and (is_admin() or has_permission(p_module, p_action))
$$;

drop policy profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or (is_staff() and (not is_demo_user() or is_demo)));
drop policy profiles_admin_all on profiles;
create policy profiles_admin_all on profiles for all to authenticated
  using (is_admin() and (not is_demo_user() or is_demo))
  with check (is_admin() and (not is_demo_user() or is_demo));

drop policy customers_select on customers;
create policy customers_select on customers for select to authenticated
  using ((user_id = auth.uid() and (not is_demo_user() or demo_access_enabled())) or staff_can('customers','view',id));
drop policy customers_insert on customers;
create policy customers_insert on customers for insert to authenticated
  with check ((is_admin() and (not is_demo_user() or is_demo)) or (is_staff() and has_permission('customers','create') and assigned_staff_id = auth.uid() and (not is_demo_user() or is_demo)));
drop policy customers_update on customers;
create policy customers_update on customers for update to authenticated
  using ((user_id = auth.uid() or staff_can('customers','edit',id)) and (not is_demo_user() or (demo_access_enabled() and is_demo)))
  with check ((user_id = auth.uid() or staff_can('customers','edit',id)) and (not is_demo_user() or (demo_access_enabled() and is_demo)));
drop policy customers_delete on customers;
create policy customers_delete on customers for delete to authenticated
  using (is_admin() and (not is_demo_user() or is_demo));

create or replace function guard_demo_profile() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and new.is_demo is distinct from old.is_demo then
    raise exception 'Demo account status is server-managed' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_guard_demo before update on profiles for each row execute function guard_demo_profile();

drop policy contact_admin_select on contact_messages;
create policy contact_admin_select on contact_messages for select to authenticated using (is_admin() and not is_demo_user());

-- Prevent demo administrators from changing shared production configuration or reading logs.
drop policy products_admin on products;
create policy products_admin on products for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy products_select on products;
create policy products_select on products for select to authenticated using (is_staff() and (not is_demo_user() or is_demo));
drop policy variants_admin on product_variants;
create policy variants_admin on product_variants for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy variants_select on product_variants;
create policy variants_select on product_variants for select to authenticated using (
  is_staff() and (not is_demo_user() or exists (select 1 from products p where p.id = product_id and p.is_demo))
);
drop policy taxes_admin on taxes;
create policy taxes_admin on taxes for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy product_taxes_admin on product_taxes;
create policy product_taxes_admin on product_taxes for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy plans_admin on plans;
create policy plans_admin on plans for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy plans_select on plans;
create policy plans_select on plans for select to authenticated using (not is_demo_user() or (demo_access_enabled() and is_demo));
drop policy qt_admin on quotation_templates;
create policy qt_admin on quotation_templates for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy qtl_admin on quotation_template_lines;
create policy qtl_admin on quotation_template_lines for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy discounts_admin on discounts;
create policy discounts_admin on discounts for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());
drop policy discounts_select on discounts;
create policy discounts_select on discounts for select to authenticated using (is_staff() and not is_demo_user());
drop policy discount_usage_select on discount_usage;
create policy discount_usage_select on discount_usage for select to authenticated using (
  (is_staff() and not is_demo_user()) or
  (is_demo_user() and demo_access_enabled() and exists (select 1 from customers c where c.id = customer_id and c.is_demo))
);
drop policy audit_select on audit_logs;
create policy audit_select on audit_logs for select to authenticated using (is_admin() and not is_demo_user());
drop policy billing_runs_select on billing_runs;
create policy billing_runs_select on billing_runs for select to authenticated using (is_admin() and not is_demo_user());
drop policy billing_failures_select on billing_failures;
create policy billing_failures_select on billing_failures for select to authenticated using (is_admin() and not is_demo_user());

drop policy staff_perm_select on staff_permissions;
create policy staff_perm_select on staff_permissions for select to authenticated
  using (profile_id = auth.uid() or (is_admin() and (not is_demo_user() or exists (select 1 from profiles p where p.id = profile_id and p.is_demo))));
drop policy staff_perm_admin on staff_permissions;
create policy staff_perm_admin on staff_permissions for all to authenticated
  using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());

drop policy settings_admin on system_settings;
create policy settings_admin on system_settings for all to authenticated using (is_admin() and not is_demo_user()) with check (is_admin() and not is_demo_user());

-- An operator can revoke demo database access immediately, including for unexpired JWTs.
drop policy quotations_select on quotations;
create policy quotations_select on quotations for select to authenticated
  using ((customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('quotations','view',customer_id));
drop policy quotation_items_select on quotation_items;
create policy quotation_items_select on quotation_items for select to authenticated
  using (exists (select 1 from quotations q where q.id = quotation_id and
    ((q.customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('quotations','view',q.customer_id))));

drop policy subs_select on subscriptions;
create policy subs_select on subscriptions for select to authenticated
  using ((customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('subscriptions','view',customer_id));
drop policy sub_items_select on subscription_items;
create policy sub_items_select on subscription_items for select to authenticated
  using (exists (select 1 from subscriptions s where s.id = subscription_id and
    ((s.customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('subscriptions','view',s.customer_id))));

drop policy invoices_select on invoices;
create policy invoices_select on invoices for select to authenticated using (
  staff_can('invoices','view',customer_id) or
  (customer_id = current_customer_id() and status <> 'draft' and (not is_demo_user() or demo_access_enabled()))
);
drop policy invoice_items_select on invoice_items;
create policy invoice_items_select on invoice_items for select to authenticated
  using (exists (select 1 from invoices i where i.id = invoice_id and
    (staff_can('invoices','view',i.customer_id) or (i.customer_id = current_customer_id() and i.status <> 'draft' and (not is_demo_user() or demo_access_enabled())))));

drop policy payments_select on payments;
create policy payments_select on payments for select to authenticated
  using ((customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('payments','view',customer_id));
drop policy tickets_select on support_tickets;
create policy tickets_select on support_tickets for select to authenticated
  using ((customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('support','view',customer_id));
drop policy tickets_insert on support_tickets;
create policy tickets_insert on support_tickets for insert to authenticated
  with check ((customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('support','create',customer_id));
drop policy tmsg_insert on ticket_messages;
create policy tmsg_insert on ticket_messages for insert to authenticated with check (
  author_id = auth.uid() and exists (select 1 from support_tickets t where t.id = ticket_id and
    ((t.customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('support','edit',t.customer_id)))
);
drop policy sreq_select on subscription_requests;
create policy sreq_select on subscription_requests for select to authenticated
  using ((customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled())) or staff_can('subscriptions','view',customer_id));
drop policy sreq_insert on subscription_requests;
create policy sreq_insert on subscription_requests for insert to authenticated with check (
  customer_id = current_customer_id() and (not is_demo_user() or demo_access_enabled()) and status = 'pending' and reviewed_by is null
  and (subscription_id is null or exists (select 1 from subscriptions s where s.id = subscription_id and s.customer_id = current_customer_id()))
);
