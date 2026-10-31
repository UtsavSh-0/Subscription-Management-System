-- 0004: multi-portal support. Staff assignment, configurable staff permissions, support desk,
-- customer requests, settings, contact inbox. Replaces the broad staff policies from 0003 with
-- assignment + permission scoped ones. Run after 0001-0003.

-- Columns --------------------------------------------------------------------------------------
alter table profiles  add column if not exists phone text;
alter table customers add column if not exists assigned_staff_id uuid references profiles (id) on delete set null;
alter table customers add column if not exists billing_name text;
alter table customers add column if not exists billing_address text;
alter table customers add column if not exists tax_id text;
alter table customers add column if not exists terms_accepted_at timestamptz;
create index if not exists customers_assigned_idx on customers (assigned_staff_id);

-- Staff permissions (configured by admin) ------------------------------------------------------
create table staff_permissions (
  profile_id uuid not null references profiles (id) on delete cascade,
  module text not null check (module in ('customers','subscriptions','quotations','invoices','payments','support')),
  can_view boolean not null default true,
  can_create boolean not null default false,
  can_edit boolean not null default false,
  primary key (profile_id, module)
);
alter table staff_permissions enable row level security;

create or replace function has_permission(p_module text, p_action text) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or coalesce((
    select case p_action when 'view' then sp.can_view when 'create' then sp.can_create when 'edit' then sp.can_edit else false end
    from staff_permissions sp join profiles p on p.id = sp.profile_id
    where sp.profile_id = auth.uid() and sp.module = p_module and p.role = 'staff'), false)
$$;

-- A staff member manages a customer only if it is assigned to them. Admin manages all.
create or replace function staff_manages(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from customers c join profiles p on p.id = auth.uid()
    where c.id = cid and c.assigned_staff_id = auth.uid() and p.role = 'staff')
$$;

create or replace function staff_can(p_module text, p_action text, cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (has_permission(p_module, p_action) and staff_manages(cid))
$$;

create policy staff_perm_select on staff_permissions for select to authenticated using (profile_id = auth.uid() or is_admin());
create policy staff_perm_admin on staff_permissions for all to authenticated using (is_admin()) with check (is_admin());

-- Signup: store phone + terms, seed default staff permissions ----------------------------------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', '');
  v_phone text := nullif(new.raw_user_meta_data ->> 'phone', '');
  v_terms timestamptz := case when new.raw_user_meta_data ->> 'terms_accepted' = 'true' then now() end;
  v_role user_role := case new.raw_app_meta_data ->> 'role'
                        when 'staff' then 'staff'::user_role
                        when 'admin' then 'admin'::user_role
                        else 'customer'::user_role end;
begin
  insert into profiles (id, email, full_name, role, phone) values (new.id, new.email, v_name, v_role, v_phone);
  if v_role = 'customer' then
    update customers set user_id = new.id, phone = coalesce(phone, v_phone), terms_accepted_at = coalesce(terms_accepted_at, v_terms)
     where lower(email) = lower(new.email) and user_id is null;
    if not found then
      insert into customers (user_id, name, company, email, phone, terms_accepted_at)
      values (new.id, coalesce(nullif(v_name, ''), split_part(new.email, '@', 1)),
              coalesce(new.raw_user_meta_data ->> 'company', ''), new.email, v_phone, v_terms);
    end if;
  elsif v_role = 'staff' then
    insert into staff_permissions (profile_id, module, can_view, can_create, can_edit)
    select new.id, m, true, m in ('quotations','invoices','payments','support'), m <> 'customers'
      from unnest(array['customers','subscriptions','quotations','invoices','payments','support']) m;
  end if;
  return new;
end $$;

-- Guards -----------------------------------------------------------------------------------------
create or replace function guard_profile_role() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not is_admin() then
    if new.role is distinct from old.role then raise exception 'Only an admin can change roles' using errcode = '42501'; end if;
    if new.email is distinct from old.email then raise exception 'Email cannot be changed here' using errcode = '42501'; end if;
  end if;
  return new;
end $$;

create or replace function guard_customer_update() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null then
    if new.assigned_staff_id is distinct from old.assigned_staff_id and not is_admin() then
      raise exception 'Only an admin can assign customers' using errcode = '42501';
    end if;
    if not is_staff() and (new.email is distinct from old.email or new.user_id is distinct from old.user_id) then
      raise exception 'Email and account link cannot be changed' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger customers_guard before update on customers for each row execute function guard_customer_update();

-- Replace broad staff policies with assignment + permission scoped ones --------------------------
drop policy customers_select on customers;
drop policy customers_insert on customers;
drop policy customers_update on customers;
create policy customers_select on customers for select to authenticated using (user_id = auth.uid() or staff_can('customers','view',id));
create policy customers_insert on customers for insert to authenticated
  with check (is_admin() or (is_staff() and has_permission('customers','create') and assigned_staff_id = auth.uid()));
create policy customers_update on customers for update to authenticated
  using (user_id = auth.uid() or staff_can('customers','edit',id))
  with check (user_id = auth.uid() or staff_can('customers','edit',id));

drop policy quotations_select on quotations;
drop policy quotations_insert on quotations;
drop policy quotations_update on quotations;
create policy quotations_select on quotations for select to authenticated using (customer_id = current_customer_id() or staff_can('quotations','view',customer_id));
create policy quotations_insert on quotations for insert to authenticated with check (staff_can('quotations','create',customer_id));
create policy quotations_update on quotations for update to authenticated using (staff_can('quotations','edit',customer_id)) with check (staff_can('quotations','edit',customer_id));
drop policy quotation_items_select on quotation_items;
drop policy quotation_items_write on quotation_items;
create policy quotation_items_select on quotation_items for select to authenticated
  using (exists (select 1 from quotations q where q.id = quotation_id and (q.customer_id = current_customer_id() or staff_can('quotations','view',q.customer_id))));
create policy quotation_items_write on quotation_items for all to authenticated
  using (exists (select 1 from quotations q where q.id = quotation_id and staff_can('quotations','edit',q.customer_id)))
  with check (exists (select 1 from quotations q where q.id = quotation_id and staff_can('quotations','edit',q.customer_id)));

drop policy subs_select on subscriptions;
drop policy subs_insert on subscriptions;
drop policy subs_update on subscriptions;
create policy subs_select on subscriptions for select to authenticated using (customer_id = current_customer_id() or staff_can('subscriptions','view',customer_id));
create policy subs_insert on subscriptions for insert to authenticated with check (staff_can('subscriptions','create',customer_id));
create policy subs_update on subscriptions for update to authenticated using (staff_can('subscriptions','edit',customer_id)) with check (staff_can('subscriptions','edit',customer_id));
drop policy sub_items_select on subscription_items;
drop policy sub_items_write on subscription_items;
create policy sub_items_select on subscription_items for select to authenticated
  using (exists (select 1 from subscriptions s where s.id = subscription_id and (s.customer_id = current_customer_id() or staff_can('subscriptions','view',s.customer_id))));
create policy sub_items_write on subscription_items for all to authenticated
  using (exists (select 1 from subscriptions s where s.id = subscription_id and staff_can('subscriptions','edit',s.customer_id)))
  with check (exists (select 1 from subscriptions s where s.id = subscription_id and staff_can('subscriptions','edit',s.customer_id)));

drop policy invoices_select on invoices;
drop policy invoices_insert on invoices;
drop policy invoices_update on invoices;
create policy invoices_select on invoices for select to authenticated
  using (staff_can('invoices','view',customer_id) or (customer_id = current_customer_id() and status <> 'draft'));
create policy invoices_insert on invoices for insert to authenticated with check (staff_can('invoices','create',customer_id));
create policy invoices_update on invoices for update to authenticated using (staff_can('invoices','edit',customer_id)) with check (staff_can('invoices','edit',customer_id));
drop policy invoice_items_select on invoice_items;
drop policy invoice_items_write on invoice_items;
create policy invoice_items_select on invoice_items for select to authenticated
  using (exists (select 1 from invoices i where i.id = invoice_id and (staff_can('invoices','view',i.customer_id) or (i.customer_id = current_customer_id() and i.status <> 'draft'))));
create policy invoice_items_write on invoice_items for all to authenticated
  using (exists (select 1 from invoices i where i.id = invoice_id and staff_can('invoices','edit',i.customer_id)))
  with check (exists (select 1 from invoices i where i.id = invoice_id and staff_can('invoices','edit',i.customer_id)));

drop policy payments_select on payments;
drop policy payments_insert on payments;
create policy payments_select on payments for select to authenticated using (customer_id = current_customer_id() or staff_can('payments','view',customer_id));
create policy payments_insert on payments for insert to authenticated with check (staff_can('payments','create',customer_id));

-- Support desk -----------------------------------------------------------------------------------
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high');
create sequence ticket_number_seq;

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('TKT-' || lpad(nextval('ticket_number_seq')::text, 4, '0')),
  customer_id uuid not null references customers (id),
  subject text not null check (length(trim(subject)) > 0),
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  assigned_to uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_tickets_customer_idx on support_tickets (customer_id);
create trigger support_tickets_updated before update on support_tickets for each row execute function set_updated_at();

create table ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets (id) on delete cascade,
  author_id uuid not null references profiles (id),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);
create index ticket_messages_ticket_idx on ticket_messages (ticket_id, created_at);

alter table support_tickets enable row level security;
alter table ticket_messages enable row level security;
create policy tickets_select on support_tickets for select to authenticated using (customer_id = current_customer_id() or staff_can('support','view',customer_id));
create policy tickets_insert on support_tickets for insert to authenticated with check (customer_id = current_customer_id() or staff_can('support','create',customer_id));
create policy tickets_update on support_tickets for update to authenticated using (staff_can('support','edit',customer_id)) with check (staff_can('support','edit',customer_id));
create policy tmsg_select on ticket_messages for select to authenticated using (exists (select 1 from support_tickets t where t.id = ticket_id));
create policy tmsg_insert on ticket_messages for insert to authenticated
  with check (author_id = auth.uid() and exists (
    select 1 from support_tickets t where t.id = ticket_id and (t.customer_id = current_customer_id() or staff_can('support','edit',t.customer_id))));

-- Customer requests: new subscription, renewal, upgrade, downgrade, cancellation ------------------
create type request_type as enum ('new', 'renewal', 'upgrade', 'downgrade', 'cancellation');
create type request_status as enum ('pending', 'approved', 'rejected');

create table subscription_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id),
  subscription_id uuid references subscriptions (id),
  type request_type not null,
  target_plan_id uuid references plans (id),
  reason text not null default '',
  status request_status not null default 'pending',
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (type = 'new' or subscription_id is not null),
  check (type not in ('new', 'upgrade', 'downgrade') or target_plan_id is not null)
);
create index sub_requests_customer_idx on subscription_requests (customer_id, status);
-- One open request of each kind per subscription (idempotent: double-clicks cannot duplicate it).
create unique index sub_requests_open_uniq on subscription_requests (subscription_id, type) where status = 'pending' and subscription_id is not null;

alter table subscription_requests enable row level security;
create policy sreq_select on subscription_requests for select to authenticated using (customer_id = current_customer_id() or staff_can('subscriptions','view',customer_id));
create policy sreq_insert on subscription_requests for insert to authenticated
  with check (customer_id = current_customer_id() and status = 'pending' and reviewed_by is null
              and (subscription_id is null or exists (select 1 from subscriptions s where s.id = subscription_id and s.customer_id = current_customer_id())));
create policy sreq_update on subscription_requests for update to authenticated using (staff_can('subscriptions','edit',customer_id)) with check (staff_can('subscriptions','edit',customer_id));

-- Settings and contact inbox -----------------------------------------------------------------------
create table system_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references profiles (id),
  updated_at timestamptz not null default now()
);
alter table system_settings enable row level security;
create policy settings_select on system_settings for select to authenticated using (true);
create policy settings_admin on system_settings for all to authenticated using (is_admin()) with check (is_admin());
insert into system_settings (key, value) values
  ('company_name', '"Brightloop"'), ('support_email', '"support@brightloop.io"'), ('default_payment_terms', '"Net 14"')
on conflict do nothing;

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  email text not null,
  message text not null check (length(trim(message)) > 0),
  created_at timestamptz not null default now()
);
alter table contact_messages enable row level security;   -- inserts come from /api/contact (service role)
create policy contact_admin_select on contact_messages for select to authenticated using (is_admin());
