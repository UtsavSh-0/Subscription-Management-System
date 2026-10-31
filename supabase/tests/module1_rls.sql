-- Run after migrations against a DB with Supabase's auth schema. Raises on the first failed assertion.
\set ON_ERROR_STOP on
create or replace function pg_temp.as_user(u uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', coalesce(u::text, ''), false); end $$;
create or replace function pg_temp.expect_fail(sql text, label text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'PASS (blocked): % -> %', label, sqlerrm; return; end;
  raise exception 'FAIL (was allowed): %', label;
end $$;

-- seed (as superuser)
insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data) values
 ('00000000-0000-0000-0000-0000000000a1','admin@x.io','{}','{"role":"admin"}'),
 ('00000000-0000-0000-0000-0000000000b1','staff@x.io','{}','{"role":"staff"}'),
 ('00000000-0000-0000-0000-0000000000c1','c1@x.io','{"full_name":"Cust One"}','{}'),
 ('00000000-0000-0000-0000-0000000000c2','c2@x.io','{"full_name":"Cust Two","role":"admin"}','{}');
do $$ begin
  assert (select role from profiles where email='c2@x.io')='customer', 'client user_metadata role must be ignored';
  assert (select role from profiles where email='staff@x.io')='staff' and (select role from profiles where email='admin@x.io')='admin';
  assert (select count(*) from customers)=2, 'staff/admin signups must not create customer rows';
  raise notice 'PASS: signup ignores client role; service-created staff/admin get no customer row';
end $$;
insert into plans (id,name,price,frequency,start_date) values ('00000000-0000-0000-0000-0000000000f1','P',100,'monthly','2026-01-01');
insert into subscriptions (id,customer_id,plan_id,start_date,expiry_date)
 select '00000000-0000-0000-0000-0000000000e1', id, '00000000-0000-0000-0000-0000000000f1','2026-01-01','2027-01-01' from customers where email='c1@x.io';
insert into invoices (id,customer_id,subscription_id,period_start,period_end,due_date,total,status)
 select '00000000-0000-0000-0000-0000000000d1', id, '00000000-0000-0000-0000-0000000000e1','2026-10-01','2026-10-31','2026-11-14',1000,'confirmed' from customers where email='c1@x.io';
insert into invoices (customer_id,due_date,total,status)
 select id,'2026-11-14',500,'confirmed' from customers where email='c2@x.io';

-- duplicate billing guard
select pg_temp.expect_fail($q$insert into invoices (customer_id,subscription_id,period_start,period_end,due_date,total)
 select id,'00000000-0000-0000-0000-0000000000e1','2026-10-01','2026-10-31','2026-11-14',1000 from customers where email='c1@x.io'$q$, 'duplicate invoice for same subscription+period');

-- payments: partial, multiple, overpay
insert into payments (invoice_id,customer_id,method,amount) select '00000000-0000-0000-0000-0000000000d1', id,'UPI',400 from customers where email='c1@x.io';
do $$ begin assert (select amount_paid from invoices where id='00000000-0000-0000-0000-0000000000d1')=400 and (select status from invoices where id='00000000-0000-0000-0000-0000000000d1')='confirmed', 'partial payment keeps confirmed'; raise notice 'PASS: partial payment -> balance 600, still confirmed'; end $$;
select pg_temp.expect_fail($q$insert into payments (invoice_id,customer_id,method,amount) select '00000000-0000-0000-0000-0000000000d1', id,'UPI',700 from customers where email='c1@x.io'$q$, 'overpayment');
insert into payments (invoice_id,customer_id,method,amount) select '00000000-0000-0000-0000-0000000000d1', id,'Card',600 from customers where email='c1@x.io';
do $$ begin assert (select status from invoices where id='00000000-0000-0000-0000-0000000000d1')='paid', 'fully paid'; raise notice 'PASS: second payment settles invoice -> paid'; end $$;
select pg_temp.expect_fail($q$update invoices set status='cancelled' where id='00000000-0000-0000-0000-0000000000d1'$q$, 'cancel a paid invoice');
select pg_temp.expect_fail($q$update subscriptions set status='active' where id='00000000-0000-0000-0000-0000000000e1'$q$, 'skip subscription lifecycle draft->active');

-- RLS as each role
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  assert (select count(*) from customers)=1, 'customer sees only self';
  assert (select count(*) from invoices)=1, 'customer sees only own invoices';
  assert (select count(*) from payments)=2, 'customer sees own payments';
  assert (select count(*) from products)=0, 'customer cannot read products (cost_price)';
  raise notice 'PASS: customer isolation (customers/invoices/payments/products)';
end $$;
select pg_temp.expect_fail($q$update profiles set role='admin' where id=auth.uid()$q$, 'customer self-promotes to admin');
select pg_temp.expect_fail($q$insert into discounts (name,type,value,start_date) values ('x','fixed',10,'2026-01-01')$q$, 'customer creates discount');
do $$ begin
  update invoices set total = 1 where id='00000000-0000-0000-0000-0000000000d1';
  assert (select total from invoices where id='00000000-0000-0000-0000-0000000000d1')=1000, 'customer cannot edit invoice';
  raise notice 'PASS: customer invoice update affected 0 rows';
end $$;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1');
do $$ begin assert (select count(*) from customers)=2 and (select count(*) from invoices)=2, 'staff sees all'; raise notice 'PASS: staff sees all customers/invoices'; end $$;
select pg_temp.expect_fail($q$insert into discounts (name,type,value,start_date) values ('x','fixed',10,'2026-01-01')$q$, 'staff creates discount');
select pg_temp.expect_fail($q$insert into products (name,sales_price) values ('x',1)$q$, 'staff creates product');
select pg_temp.expect_fail($q$update profiles set role='admin' where id=auth.uid()$q$, 'staff self-promotes to admin');
do $$ begin assert (select count(*) from audit_logs)=0; end $$;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1');
insert into discounts (name,type,value,start_date) values ('Admin disc','percentage',10,'2026-01-01');
insert into products (name,sales_price) values ('Admin product',1);
do $$ begin raise notice 'PASS: admin can create discounts and products'; end $$;
select pg_temp.as_user(null);
reset role;
select 'ALL ASSERTIONS PASSED' as result;
