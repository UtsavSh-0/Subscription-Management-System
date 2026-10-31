# Brightloop local demo

Brightloop is a self-contained subscription workflow demonstration built with Next.js 15, TypeScript, Tailwind CSS and Recharts. It uses browser localStorage for demo records and sessions. It needs no external database, authentication service, API key, or environment variable.

## Run locally

    npm install
    npm run dev

Open http://localhost:3000. The production build commands are npm run build, npm run lint, and npm run typecheck.

## Demo logins

| Portal | Email | Password |
|---|---|---|
| Admin | admin@brightloop.demo | AdminDemo@123 |
| Staff | staff@brightloop.demo | StaffDemo@123 |
| Customer | customer@brightloop.demo | CustomerDemo@123 |

These are presentation credentials only. Passwords and records are kept in browser storage and can be inspected or changed by the browser user. This is not production authentication or a secure multi-user backend. Use synthetic information only. Payments are demo ledger entries; no money is processed. Email delivery is not configured. Invoices can be printed or saved as PDF through the browser.

## Try the complete workflow

1. Sign in as Admin and add a product and plan in Products and plans.
2. Open Customers and assign a customer to Avery Morgan (demo Staff).
3. Sign in as Staff, create a quotation for that assigned customer, and choose a product, plan, or quotation template.
4. Sign in as that Customer and accept the quotation. Brightloop creates a subscription and invoice.
5. Return to Staff or Admin and record a payment on the invoice.
6. Reopen the dashboard to see revenue and invoice totals update.
7. In Admin, use Subscriptions → Run recurring billing to generate due invoices. Repeating the run will not create a second invoice for the same subscription date.
8. In Admin settings, reset demo data to restore the original sample dataset.

Admin and Staff demo views are separated by portal and assigned-customer filters. Customers see associated records in the interface. Because the complete dataset is client-side, these filters are demonstration behavior, not an authorization boundary.

## Demo data and storage

The first visit initializes sample customers, products, plans, subscriptions, quotations, invoices, payments, and quotation templates. Changes persist in that browser. Clearing browser site data also clears the demo workspace. The Admin settings page can reset the data and additional demo accounts.

No Supabase configuration is used. .env.example is retained as an informational note; no .env file is required.
