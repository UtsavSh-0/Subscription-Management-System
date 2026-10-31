import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account" };

/** Public registration exists for customers only; /admin/register and /staff/register do not exist. */
export default async function RegisterPage({ params }: { params: Promise<{ portal: string }> }) {
  if ((await params).portal !== "customer") notFound();
  return (
    <AuthShell portal="customer" title="Create your account" subtitle="Manage your subscriptions, invoices and payments in one place.">
      <RegisterForm />
    </AuthShell>
  );
}
