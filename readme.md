# 💳 Subscription Management System

**A Unified Platform for Subscription Management, Recurring Billing & Financial Operations.**

The Subscription Management System is a centralized SaaS platform designed to simplify and automate subscription-based business operations. It helps businesses manage products, subscription plans, customers, quotations, recurring invoices, discounts, payments and revenue analytics from a single dashboard.

Built around the business requirements of **Brightloop Software**, the platform aims to eliminate manual billing processes, prevent missed renewals and provide real-time visibility into recurring revenue.

---

## 🚀 Project Overview

Managing subscriptions manually can lead to missed renewals, incorrect invoices, payment tracking issues and inaccurate revenue reports.

This project aims to solve these challenges through an integrated platform that manages the complete subscription lifecycle, from customer registration to recurring billing and financial reporting.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure user registration and login.
- Password validation and reset functionality.
- Role-based access control.
- Three user roles: Admin, Staff and Customer.
- Restricted staff account creation.

### 📦 Product Management
- Create, update and manage products.
- Configure product types and pricing.
- Manage product variants.
- Support additional variant-based pricing.
- Track sales price and cost price.

### 📋 Subscription Plan Management
- Create and manage subscription plans.
- Daily, weekly, monthly and yearly billing.
- Configure minimum quantities.
- Set plan availability dates.
- Pause, resume, renew and close subscriptions.

### 👥 Customer Management
- Customer profiles and records.
- Customer subscription history.
- Invoice and payment history.
- Search and filtering.

### 📝 Quotation Management
- Create and manage quotations.
- Reusable quotation templates.
- Add products and subscription plans.
- Configure quotation validity.
- Convert approved quotations into subscriptions.

### 🔄 Subscription Management
- Unique subscription identification.
- Subscription lifecycle tracking.
- Automatic expiry handling.
- Renewal management.
- Pause and resume functionality.
- Product and quantity management.

### 🧾 Invoice & Recurring Billing
- Automatic invoice generation.
- Invoice numbering.
- Automatic tax calculations.
- Discount application.
- Invoice confirmation and cancellation.
- PDF invoice generation.
- Duplicate billing prevention.

### 🎯 Discount Management
- Fixed amount discounts.
- Percentage-based discounts.
- Minimum purchase requirements.
- Usage limits.
- Start and expiry dates.
- Product-specific and subscription-wide discounts.

### 💰 Payment Management
- Record payments against invoices.
- Multiple payment methods.
- Partial and full payment tracking.
- Outstanding balance calculation.
- Overdue invoice identification.
- Payment history.

### 📊 Dashboard & Analytics
- Total customers.
- Active subscriptions.
- Revenue overview.
- Outstanding payments.
- Overdue invoices.
- Monthly revenue charts.
- Recent transactions.
- Financial summaries and filters.

### 🧑‍💻 Customer Portal
- Personal dashboard.
- Subscription overview.
- Invoice access.
- PDF invoice downloads.
- Payment history.
- Profile management.
- Permitted subscription actions.

---

## 👤 User Roles

| Role | Access |
|---|---|
| Admin | Complete system management |
| Staff | Day-to-day operational management |
| Customer | Personal subscriptions, invoices and payments |

## 🔄 Subscription Lifecycle

```text
Draft
  ↓
Quotation
  ↓
Confirmed
  ↓
Active
  ↓
Closed
```

Additional lifecycle operations include pausing, resuming, renewing and early closure where permitted.

## 🛠️ Proposed Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| Backend | To be finalized |
| Database | PostgreSQL / Supabase |
| Charts | Recharts |
| Icons | Lucide Icons |
| Version Control | Git & GitHub |

*The final stack will be updated to reflect the actual implementation.*

## 📁 Project Structure

```text
subscription-management-system/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── plans/
│   │   ├── customers/
│   │   ├── quotations/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   ├── discounts/
│   │   ├── payments/
│   │   └── settings/
│   │
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── database/
├── migrations/
├── .env.example
├── package.json
└── README.md
```

*This is the proposed structure; actual folders may differ.*

## ⚙️ Getting Started

### Prerequisites

- Node.js (LTS)
- npm
- Git
- PostgreSQL / Supabase account

### Installation

```bash
# Clone the repository
git clone YOUR_REPOSITORY_URL

# Navigate into the project
cd subscription-management-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser:

```text
http://localhost:3000
```

### Environment Variables

Create a `.env.local` file and configure the required credentials according to your selected backend.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose service-role keys or other private credentials in frontend code.

## 🎯 Project Objectives

- Centralize subscription business operations.
- Automate recurring billing and invoice generation.
- Reduce manual administrative work.
- Improve payment tracking and reconciliation.
- Provide accurate revenue visibility.
- Maintain secure role-based access.
- Support business growth through scalable architecture.

## 📈 Performance Goals

- Support thousands of subscriptions.
- Target page response times below two seconds under expected workloads.
- Optimize database queries.
- Implement pagination and indexing.
- Prevent duplicate billing during retries.
- Use background processing for recurring operations.

*These are project targets, not yet verified performance results.*

## 🗺️ Development Roadmap

- [ ] Requirement analysis and architecture
- [ ] Database design and implementation
- [ ] Project setup
- [ ] Authentication and authorization
- [ ] Product management
- [ ] Subscription plan management
- [ ] Customer management
- [ ] Quotation management
- [ ] Subscription management
- [ ] Invoice and recurring billing
- [ ] Tax and discount management
- [ ] Payment management
- [ ] Admin dashboard and analytics
- [ ] Customer portal
- [ ] Testing and security
- [ ] Production deployment

## 🔒 Security Considerations

- Role-based access control.
- Secure authentication.
- Server-side validation.
- Database access policies.
- Customer-level data isolation.
- Secure environment variable management.
- Protection against duplicate billing.

## 🤝 Contribution

Contributions, suggestions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Submit a Pull Request.

## 📄 License

License information will be added when the project license is selected.

---

**Built to simplify subscription management and automate recurring business operations.**