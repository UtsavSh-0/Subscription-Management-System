import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Terms() {
  return (
    <LegalPage title="Terms and conditions" sections={[
      ["Your account", "You are responsible for keeping your login details confidential and for activity under your account. Provide accurate information when you register."],
      ["Subscriptions and billing", "Subscriptions renew according to the plan you accept. Invoices are issued per billing period and are payable by the due date shown on each invoice."],
      ["Cancellations and changes", "Renewal, upgrade, downgrade and cancellation requests are reviewed by our team. Changes take effect once approved."],
      ["Acceptable use", "You agree not to misuse the service, attempt to access other customers' records, or interfere with its operation."],
      ["Changes to these terms", "We may update these terms. Continued use of the service after an update means you accept the revised terms."],
    ]} />
  );
}
