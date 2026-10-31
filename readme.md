# Brightloop: Subscription Management

Next.js 15 (App Router) · TypeScript · Tailwind · Supabase (Auth + Postgres + RLS) · Recharts

## Portals and routes
| Route | Who | Notes |
|---|---|---|
| `/` | Public | Landing page, contact form |
| `/admin/login`, `/staff/login`, `/customer/login` | Each role | Wrong-role sign-ins are rejected and signed out |
| `/customer/register` | Public | Creates **customers only**. `/admin/register` and `/staff/register` return 404 |
| `/{portal}/forgot-password`, `/{portal}/reset-password` | Each role | Email link lands on `/auth/callback` |
| `/{portal}/dashboard`, `/profile` | Signed-in role | Real data under RLS |
| `/admin/*`, `/staff/*` | customers, subscriptions, invoices, payments (read) | Staff see assigned customers only |
| `/admin/staff`, `/admin/messages` | Admin | Invite staff, edit permissions, contact inbox |
| `/customer/subscriptions`, `/invoices`, `/payments` | Customer | Own records only |

## Security model
1. `middleware.ts` refreshes the session and sends signed-out visitors to the matching login.
2. `(protected)/layout.tsx` reads the role **from the `profiles` table** and redirects to the user's own dashboard if it does not match the portal.
3. Row Level Security is the final authority (see `supabase/migrations`). Staff reach a customer's records only if the customer is assigned to them AND they hold the module permission.

## Setup
1. `npm install`, copy `.env.example` to `.env.local`, fill it in.
2. Apply `supabase/migrations/0001` to `0005` in order (see `supabase/README.md`), then create the first admin.
3. Auth > URL Configuration: Site URL = `NEXT_PUBLIC_APP_URL`; add `<APP_URL>/auth/callback` to Redirect URLs.
4. `npm run dev`, then check `/api/health`.
5. Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Deploy (Vercel or any Node host)
Set the five env vars above on the host (service-role key as a server-only secret), set `NEXT_PUBLIC_APP_URL` to the production URL, add that URL to Supabase Redirect URLs, then deploy. For production email, configure custom SMTP in Supabase (the default sender is heavily rate-limited).

Optional Supabase-backed demo accounts are documented in [supabase/README.md](supabase/README.md#demo-accounts). Keep demo passwords in server-only deployment secrets; set `DEMO_ACCESS_ENABLED=false` in production to hide demo access.

## Not built yet
Create/edit forms and workflows for products, plans, taxes, discounts, quotations, subscriptions, invoices (incl. PDF) and payments; the recurring billing job; reports; system settings UI; customer plan browsing/compare/subscribe, requests and support desk UI. The database tables for requests, support and settings already exist (migration 0004).
