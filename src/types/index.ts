export type Period = "daily" | "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "draft" | "quotation" | "confirmed" | "active" | "closed";
export type InvoiceStatus = "draft" | "confirmed" | "paid" | "cancelled";
export type PaymentMethod = "Card" | "Bank transfer" | "UPI" | "Cheque";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  createdAt: string;
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
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
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

export interface AppData {
  customers: Customer[];
  plans: Plan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
}
