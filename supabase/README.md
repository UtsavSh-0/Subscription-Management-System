# Supabase setup

1. Create a project at supabase.com. Copy the URL, anon key and service-role key into `.env.local` (see `.env.example`).
2. Apply the migrations in order, either by pasting each file into **SQL Editor** or with the CLI
   (`supabase link --project-ref <ref> && supabase db push`):
   - `migrations/0001_schema.sql`: tables, enums, indexes, constraints
   - `migrations/0002_functions_triggers.sql`: role helpers, signup trigger, payment and lifecycle guards
   - `migrations/0003_rls.sql`: Row Level Security policies
   - `migrations/0004_portals.sql`: staff assignment + permissions, assignment-scoped RLS, support tickets, customer requests, settings, contact inbox
   - `migrations/0005_demo_isolation.sql`: demo account markers and RLS scoping for synthetic data
3. **Create the first admin.** Dashboard > Authentication > Users > Add user (email + password). Then in SQL Editor:
   `update profiles set role = 'admin' where email = 'you@example.com';`
   After that, admins create staff from the app (the service role sets `app_metadata.role`, which clients cannot write).
4. Authentication > URL Configuration: set Site URL to `NEXT_PUBLIC_APP_URL` and add `<APP_URL>/auth/callback` to Redirect URLs (email confirmation and password reset both land there).
5. Check it works: `npm run dev`, then open `http://localhost:3000/api/health` and expect `{"ok":true,"database":"connected"}`.

## Demo accounts

Demo accounts authenticate through Supabase Auth and use the same application routes and RLS as other users. Apply migration `0005_demo_isolation.sql` after `0004_portals.sql`. It adds server-managed demo markers and restricts demo admins and staff to synthetic demo customer rows; demo admins cannot read profiles, contact messages, or operational records outside the demo set, and cannot change shared catalog/settings. The migration also adds a database demo-access switch checked by RLS, so disabling demo access cuts off existing sessions as well as new sign-ins.

Set `DEMO_ACCESS_ENABLED=true` and three distinct strong passwords (`DEMO_ADMIN_PASSWORD`, `DEMO_STAFF_PASSWORD`, `DEMO_CUSTOMER_PASSWORD`) in the server environment. Keep them out of `NEXT_PUBLIC_*` variables and source control. Run `npm run provision:demo` to create/update the three confirmed Supabase Auth users and seed fictional customers, subscriptions, quotations, invoices and payments. The public Try Demo section and each role's Demo Credentials panel appear only when demo access is enabled and all passwords are configured. The customer account is linked only to the synthetic Cedar & Finch Studio record; the staff account is assigned only synthetic demo customers.

To disable demo access in production, set `DEMO_ACCESS_ENABLED=false` and redeploy/restart, then run `npm run disable:demo` with the production Supabase URL and service-role key available as server environment variables. This hides demo links and credentials, flips the database RLS switch off immediately, and bans the three demo Auth users. To re-enable, set the flag to `true` and run `npm run provision:demo`, which restores the accounts with the configured passwords and turns the RLS switch back on.

## Security model (summary)
- Self-signup always yields a `customer`. Roles can only be changed by an admin or the service role.
- Customers read only their own rows. They have no direct access to `products` (it holds `cost_price`).
- Staff cannot change catalog, taxes, discounts, templates or roles, and cannot delete.
- Duplicate invoices are impossible: `unique (subscription_id, period_start, period_end)`.
- Payments are validated and `invoices.amount_paid`/`status` are maintained by database triggers.

`tests/module1_rls.sql` asserts all of the above. It needs Supabase's `auth` schema (or an equivalent stub) to run.
