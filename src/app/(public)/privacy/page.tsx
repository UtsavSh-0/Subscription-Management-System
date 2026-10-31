import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" sections={[
      ["What we collect", "Your name, email, phone number, company and billing details, plus the subscriptions, invoices and payments linked to your account."],
      ["How we use it", "To provide the service, issue invoices, record payments, and respond to support requests and enquiries."],
      ["Who can see it", "You see only your own records. Brightloop staff see only the customers assigned to them, and administrators see records needed to operate the service."],
      ["Security", "Data is stored in a managed database with row-level access control so each account can only read its own data."],
      ["Your choices", "You can update your details from your profile at any time, or contact us to request correction or deletion."],
    ]} />
  );
}
