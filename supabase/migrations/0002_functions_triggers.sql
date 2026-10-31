-- Role helpers (security definer so RLS policies can call them without recursion) -------------
create or replace function current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

create or replace function is_staff() returns boolean   -- admin or staff
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'staff') from profiles where id = auth.uid()), false)
$$;

create or replace function current_customer_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from customers where user_id = auth.uid()
$$;

-- updated_at ------------------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger customers_updated before update on customers for each row execute function set_updated_at();
create trigger products_updated before update on products for each row execute function set_updated_at();
create trigger plans_updated before update on plans for each row execute function set_updated_at();
create trigger subscriptions_updated before update on subscriptions for each row execute function set_updated_at();
create trigger quotations_updated before update on quotations for each row execute function set_updated_at();
create trigger invoices_updated before update on invoices for each row execute function set_updated_at();

-- Signup: self-registered users are always CUSTOMERS. user_metadata (client-writable) can never grant a role.
-- Staff/admin accounts are created server-side with the service role, which sets app_metadata.role
-- (app_metadata is NOT client-writable); those accounts get a profile but no customer record.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', '');
  v_role user_role := case new.raw_app_meta_data ->> 'role'
                        when 'staff' then 'staff'::user_role
                        when 'admin' then 'admin'::user_role
                        else 'customer'::user_role end;
begin
  insert into profiles (id, email, full_name, role) values (new.id, new.email, v_name, v_role);
  if v_role = 'customer' then
    -- Link to an existing customer record staff created with the same email, else create one.
    update customers set user_id = new.id where lower(email) = lower(new.email) and user_id is null;
    if not found then
      insert into customers (user_id, name, company, email)
      values (new.id, coalesce(nullif(v_name, ''), split_part(new.email, '@', 1)),
              coalesce(new.raw_user_meta_data ->> 'company', ''), new.email);
    end if;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Block privilege escalation: only an admin (or the service role / SQL, where auth.uid() is null) may change roles.
create or replace function guard_profile_role() returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then
    raise exception 'Only an admin can change roles' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on profiles for each row execute function guard_profile_role();

-- Payments: validate against the invoice, then keep invoices.amount_paid / status in sync ------------
create or replace function payments_validate() returns trigger language plpgsql as $$
declare inv invoices%rowtype;
begin
  select * into inv from invoices where id = new.invoice_id for update;   -- serialises concurrent payments
  if not found then raise exception 'Invoice not found'; end if;
  if inv.status not in ('confirmed', 'paid') then
    raise exception 'Payments can only be recorded against confirmed invoices (status: %)', inv.status;
  end if;
  if new.customer_id <> inv.customer_id then
    raise exception 'Payment customer does not match invoice customer';
  end if;
  if inv.amount_paid + new.amount > inv.total then
    raise exception 'Payment of % exceeds outstanding balance of %', new.amount, inv.total - inv.amount_paid;
  end if;
  return new;
end $$;

create trigger payments_before_insert before insert on payments for each row execute function payments_validate();

create or replace function payments_sync_invoice() returns trigger language plpgsql as $$
declare v_invoice uuid := coalesce(new.invoice_id, old.invoice_id);
        v_paid numeric(12,2);
begin
  select coalesce(sum(amount), 0) into v_paid from payments where invoice_id = v_invoice;
  update invoices
     set amount_paid = v_paid,
         status = case when v_paid >= total and total > 0 then 'paid'::invoice_status
                       when status = 'paid' then 'confirmed'::invoice_status
                       else status end
   where id = v_invoice;
  return null;
end $$;

create trigger payments_after_change after insert or update or delete on payments
  for each row execute function payments_sync_invoice();

-- Invoice lifecycle: draft -> confirmed -> paid (cancel allowed before any payment) ------------------
create or replace function invoices_guard_status() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'draft'     and new.status in ('confirmed', 'cancelled')) or
      (old.status = 'confirmed' and new.status in ('paid', 'cancelled', 'confirmed')) or
      (old.status = 'paid'      and new.status = 'confirmed')   -- only via payment removal (trigger above)
    ) then
      raise exception 'Invalid invoice transition % -> %', old.status, new.status;
    end if;
    if new.status = 'paid' and new.amount_paid < new.total then
      raise exception 'Invoice cannot be marked paid until payments cover the total';
    end if;
    if new.status = 'cancelled' and old.amount_paid > 0 then
      raise exception 'Cannot cancel an invoice that has payments';
    end if;
  end if;
  return new;
end $$;

create trigger invoices_status_guard before update on invoices for each row execute function invoices_guard_status();

-- Subscription lifecycle: draft -> quotation -> confirmed -> active -> closed -------------------------
create or replace function subscriptions_guard_status() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'draft'     and new.status = 'quotation') or
      (old.status = 'quotation' and new.status = 'confirmed') or
      (old.status = 'confirmed' and new.status in ('active', 'closed')) or
      (old.status = 'active'    and new.status = 'closed')
    ) then
      raise exception 'Invalid subscription transition % -> %', old.status, new.status;
    end if;
  end if;
  return new;
end $$;

create trigger subscriptions_status_guard before update on subscriptions
  for each row execute function subscriptions_guard_status();
