import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { AppStoreProvider } from "@/store/app-store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Brightloop: Manage Every Subscription. Simplify Every Operation.", template: "%s | Brightloop" },
  description: "Subscription management for recurring-revenue businesses: plans, quotations, invoices and payments for admins, staff and customers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
        <Toaster position="bottom-right" closeButton />
      </body>
    </html>
  );
}
