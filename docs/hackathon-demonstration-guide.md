# Brightloop hackathon demonstration guide

## Demo credentials

- Admin: admin@brightloop.demo / AdminDemo@123
- Staff: staff@brightloop.demo / StaffDemo@123
- Customer: customer@brightloop.demo / CustomerDemo@123

Credentials are intentionally visible for evaluation. The demo stores sessions, added-account passwords, and sample data in browser localStorage. This does not provide production-grade authentication or server-enforced data isolation.

## Role scenarios

### Admin
- Review dashboards, revenue, open invoices, and overdue totals.
- Create and edit products and plans; archive catalog entries.
- Assign customers to Avery Morgan or another demo staff account.
- Create quotation templates and configure tax and discount defaults.
- Create demo staff/customer accounts.
- Run recurring billing and reset the local dataset.

### Staff
- Sign in separately at /staff/login.
- Open My customers to see assigned records.
- Create quotations and manage subscription requests.
- Record a full or partial demo payment on an invoice.

### Customer
- Sign in separately at /customer/login.
- Review records associated with the signed-in demo customer in the interface.
- View and accept/reject quotations, then view subscriptions and invoices.
- Request renewal, upgrade, downgrade, or cancellation.
- Update profile and billing information.

## Billing walkthrough

1. Admin creates/assigns a customer and configures a product and plan.
2. Staff creates a quotation for an assigned customer.
3. Customer accepts it. Brightloop creates an active subscription and invoice with current tax/discount defaults.
4. Staff or Admin records a payment; invoice balance and paid status update.
5. Admin sets “Simulate billing through” to a future date, then runs recurring billing. The demo handles daily, weekly, monthly, and yearly periods and avoids duplicate billing dates.
6. Use Print / Save as PDF on an invoice and choose Save as PDF in the browser print dialog.

No real payment is processed and no email is sent. The PDF is produced through the browser print dialog.

## Verification performed

- npm run build: passed.
- npm run lint: passed.
- npx tsc --noEmit: passed.

A browser-driven end-to-end run across three separate accounts was not available in this environment. The server smoke check returned HTTP 200 for the landing page and all three login pages, with Try Demo and Demo Credentials present. LocalStorage role filters are UI behavior and do not protect data from a user who inspects browser storage.

## Run and limitations

Run npm install, then npm run dev. No external services or environment variables are required. For a production build, run npm run build then npm run start.

This is a browser-local demo, not a production deployment architecture. Browser storage is per-browser and is not shared across evaluators or devices. Do not enter real customer data or passwords.
