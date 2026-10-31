# Brightloop — Subscription Management System

<p align="center">
  <strong>Manage Every Subscription. Simplify Every Operation.</strong>
</p>

<p align="center">
  A modern subscription-management demo built to help businesses manage customers, plans, subscriptions, billing, payments, and revenue insights from one workspace.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Demo%20Project-orange" alt="Project status">
  <img src="https://img.shields.io/badge/Frontend-Next.js-black" alt="Frontend">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Data-Local%20Demo%20Storage-purple" alt="Local demo storage">
</p>

---

## Overview

**Brightloop** is a subscription-management system designed around three role-based portals:

- **Admin Portal** — manage the business, staff, customers, products, plans, subscriptions, billing, and analytics.
- **Staff Portal** — manage assigned customers, quotations, follow-ups, invoices, and payment activity.
- **Customer Portal** — view plans, manage subscriptions, review quotations, access invoices, and track payments.

The project is configured as a **self-contained demo application**. Demo records are stored locally in the browser, so the demonstration does not require a Supabase project or an external database.

> **Demo limitation:** Local browser storage and demo authentication are intended for evaluation and presentations. They are not a substitute for production authentication, secure server-side storage, or real payment processing.

---

## Screenshots

Add your screenshots to the `pictures/` folder and use the filenames below, or update the paths to match your own files.

### Landing page

![Brightloop landing page](pictures/landing-page.png)

### Admin dashboard

![Brightloop admin dashboard](pictures/admin-dashboard.png)

### Subscription management

![Brightloop subscription management](pictures/subscriptions.png)

### Customer management

![Brightloop customer management](pictures/customers.png)

### Revenue analytics

![Brightloop revenue analytics](pictures/revenue-analytics.png)

---

## Key Features

### 1. Subscription Command Center

A centralized operational overview that brings important subscription activity together.

- Upcoming renewals and billing dates.
- Failed and overdue payment indicators.
- Active, pending, paused, and expired subscriptions.
- At-risk customer visibility.
- Recent business activity and quick actions.

### 2. Revenue Forecasting

Help administrators understand revenue trends and estimate future recurring income.

- MRR and ARR overview.
- Revenue trend analysis.
- Forecasts based on current subscriptions and renewal dates.
- Revenue growth comparisons.
- Visual reporting for business performance.

*Forecasts are estimates based on available demo records, not guaranteed financial outcomes.*

### 3. Customer Health & Churn Score

Identify customers who may need attention.

- Customer health score.
- Healthy, needs-attention, and at-risk segments.
- Payment and renewal history indicators.
- Subscription activity overview.
- Churn-risk insights based on demo rules and available records.

### 4. Workflow Automation

Configure rule-based actions for common subscription operations.

Example workflows:

- When an invoice becomes overdue, create a follow-up task.
- Before a subscription renews, create a renewal reminder.
- When a payment is recorded, update the invoice status.
- When a customer becomes inactive, flag the account for review.

### 5. Smart Payment Recovery

Organize follow-up for failed, pending, and overdue payments.

- Failed-payment tracking.
- Payment retry simulation.
- Reminder schedules.
- Outstanding balance tracking.
- Payment recovery overview.

*Payment retries and recovery actions in the demo are simulations. No real payment is collected.*

### 6. What-if Revenue Simulator

Explore how business changes could affect recurring revenue.

- Adjust subscription prices.
- Model customer growth.
- Change estimated churn assumptions.
- Compare projected revenue scenarios.
- Review the difference between current and simulated results.

### 7. Support Ticket Management

Keep customer support activity connected to subscription records.

- Create and manage support tickets.
- Track ticket status and priority.
- Assign tickets to staff.
- Add internal notes and customer updates.
- Review customer support history.

### 8. Multi-currency Support

Represent subscription and revenue data in different currencies.

- Currency selection.
- Currency-aware price display.
- Currency preference for business reporting.

*Unless a live exchange-rate provider is connected, currency conversion should be treated as a demo/configured-rate feature rather than a live financial quote.*

### 9. Audit Logs

Provide visibility into important actions performed in the application.

- Record key create, update, and delete actions.
- Identify the demo user and action.
- Show timestamps.
- Review changes to customers, plans, subscriptions, invoices, and payments.

### 10. Import/Export Center

Make demo business data easier to move and review.

- Export customer records.
- Export subscriptions and invoices.
- Export payment and report data.
- Import supported CSV files.
- Validate rows and show import errors.

---

## Core Subscription Management

Brightloop also brings together the essential day-to-day subscription workflows.

| Area | Capabilities |
|---|---|
| Customers | Customer profiles, assignments, status, notes, and activity |
| Products | Product catalog, variants, pricing, and archive controls |
| Plans | Billing frequency, plan pricing, trials, and plan comparison |
| Quotations | Create, review, accept, and convert quotations |
| Subscriptions | Activate, pause, resume, renew, upgrade, downgrade, and cancel |
| Invoices | Invoice generation, tax, discounts, balances, and status tracking |
| Payments | Payment records, partial payments, balances, and history |
| Reports | Revenue, customer, subscription, and collection insights |
| Notifications | Renewal reminders, payment updates, and overdue alerts |
| Access | Separate Admin, Staff, and Customer experiences |

---

## Portals

### Admin Portal

The admin workspace provides business-wide visibility and management tools.

- Business overview and analytics.
- Staff and customer management.
- Product and plan management.
- Quotations and templates.
- Subscription lifecycle management.
- Invoices, payments, taxes, and discounts.
- Reports, settings, and audit history.

### Staff Portal

The staff workspace focuses on assigned customers and operational follow-up.

- Assigned customer list.
- Customer details and activity.
- Quotation creation and tracking.
- Subscription and invoice visibility.
- Payment follow-up.
- Tasks, reminders, and support tickets.

### Customer Portal

The customer workspace provides self-service access to subscription information.

- Personal subscription overview.
- Available plans and plan comparisons.
- Quotations and requests.
- Invoices and payment history.
- Renewal, upgrade, downgrade, and cancellation requests.
- Support and profile settings.

---

## Demo Architecture

The demo version is designed to run without a hosted backend.

- **Frontend:** Next.js and TypeScript.
- **UI:** Existing project components and styling system.
- **Demo data:** Seeded local records.
- **Persistence:** Browser `localStorage`.
- **Demo access:** Role-based demo sign-in and portal navigation.
- **Business logic:** Client-side services for demo CRUD and workflow calculations.

### Demo data behavior

- Initial sample data is loaded when the demo store is empty.
- Changes are saved in browser storage and remain after a refresh in the same browser.
- Reset Demo Data restores the initial sample dataset, if enabled in the application.
- Different browsers or devices do not automatically share local demo data.

### Security and production note

This project uses demo-only authentication and browser-side storage. It must not be used to store real customer information, credentials, payment details, or confidential business data. A production deployment would require secure server-side authentication, authorization, persistent database storage, server-side validation, and a payment provider integration.

---

## Getting Started

### Prerequisites

- Node.js (use a version compatible with the project's Next.js version).
- npm.

### Installation

```bash
git clone <your-repository-url>
cd <your-project-folder>
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

No Supabase credentials or database connection are required for the self-contained demo configuration.

---

## Demo Login

Use the demo accounts configured in the application:

| Role | Demo email | Demo password |
|---|---|---|
| Admin | `admin@brightloop.demo` | `AdminDemo@123` |
| Staff | `staff@brightloop.demo` | `StaffDemo@123` |
| Customer | `customer@brightloop.demo` | `CustomerDemo@123` |

These are demonstration credentials only. Change or disable them before sharing a public deployment.

---

## Suggested Demo Walkthrough

For a clear project presentation, demonstrate one complete business workflow:

1. Sign in as Admin and review the Subscription Command Center.
2. Create or select a product and subscription plan.
3. Sign in as Staff and create a quotation for an assigned customer.
4. Sign in as Customer and review and accept the quotation.
5. Show the resulting subscription and generated invoice.
6. Record a demo payment and show the invoice balance and status update.
7. Return to Admin and show the updated revenue and subscription overview.
8. Demonstrate a revenue forecast, customer health insight, or workflow automation.

Use only features that are implemented and verified in the current build.

---

## Project Structure

The exact structure may vary as the application evolves. A typical organization is:

```text
brightloop/
├── public/
├── pictures/
│   ├── landing-page.png
│   ├── admin-dashboard.png
│   ├── subscriptions.png
│   ├── customers.png
│   └── revenue-analytics.png
├── src/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── package.json
└── README.md
```

---

## Roadmap

Potential areas for further development:

- Production-grade authentication and role permissions.
- Secure multi-tenant database architecture.
- Real payment gateway integration.
- Email and messaging provider integration.
- Server-side scheduled billing and renewal jobs.
- Live currency exchange-rate integration.
- Automated testing and performance benchmarking.

---

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected workflows.
5. Submit a pull request with a clear description.

---

## License

Add the license that applies to this project before publishing or redistributing it.

---

<p align="center">
  <strong>Brightloop</strong><br>
  Manage Every Subscription. Simplify Every Operation.
</p>
