import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import type { Role } from "@/lib/auth/portals";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPage({ params }: { params: Promise<{ portal: string }> }) {
  const portal = (await params).portal as Role;
  return (
    <AuthShell portal={portal} title="Choose a new password" subtitle="Use at least 8 characters with letters and numbers.">
      <ResetPasswordForm portal={portal} />
    </AuthShell>
  );
}
