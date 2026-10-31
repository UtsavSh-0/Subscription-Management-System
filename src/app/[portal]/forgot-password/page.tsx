import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";
import type { Role } from "@/lib/auth/portals";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPage({ params }: { params: Promise<{ portal: string }> }) {
  const portal = (await params).portal as Role;
  return (
    <AuthShell portal={portal} title="Reset your password" subtitle="Enter your email and we will send you a link.">
      <ForgotPasswordForm portal={portal} />
    </AuthShell>
  );
}
