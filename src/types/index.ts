export type Period = "daily" | "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "draft" | "quotation" | "confirmed" | "active" | "paused" | "closed";
export type InvoiceStatus = "draft" | "confirmed" | "paid" | "cancelled";
export type PaymentMethod = "Card" | "Bank transfer" | "UPI" | "Cheque";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  createdAt: string;
  assignedStaffId?: string;
  phone?: string;
  address?: string;
  billingName?: string;
  billingAddress?: string;
  taxId?: string;
  archived?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: Period;
  minQuantity: number;
  startDate: string;
  endDate: string | null;
  autoClose: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  archived?: boolean;
}

export interface Subscription {
  id: string;
  number: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  quantity: number;
  /** Recurring amount per billing period, before tax. */
  amount: number;
  startDate: string;
  expiryDate: string;
  paymentTerms: string;
  request?: "renewal" | "upgrade" | "downgrade" | "cancellation";
  requestedPlanId?: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  note: string;
}

export interface DemoPaymentFailure {
  id: string;
  invoiceId: string;
  customerId: string;
  attemptedAt: string;
  amount: number;
  reason: string;
  status: "failed" | "resolved";
}

export interface DemoProduct { id: string; name: string; price: number; category: string; variant?: string; variants?: string[]; archived?: boolean }
export interface DemoQuotation { id: string; number: string; customerId: string; planId: string; items: { productId: string; variant?: string; quantity: number }[]; status: "draft" | "sent" | "accepted" | "rejected"; validUntil: string; subtotal?: number; total: number }
export interface DemoQuotationTemplate { id: string; name: string; planId: string; productId: string; variant?: string; quantity: number; items?: { productId: string; variant?: string; quantity: number }[]; archived?: boolean }
export interface DemoBillingSettings { taxRate: number; discountRate: number }

export interface AppData {
  customers: Customer[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  paymentFailures?: DemoPaymentFailure[];
  products?: DemoProduct[];
  quotations?: DemoQuotation[];
  quotationTemplates?: DemoQuotationTemplate[];
  billingSettings?: DemoBillingSettings;
}
