import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import type { Role } from "@/lib/auth/portals";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPage({ params }: { params: Promise<{ portal: string }> }) {
  const portal = (await params).portal as Role;
  if (!(await getSessionUser())) redirect(`/${portal}/forgot-password`);   // needs the recovery session from the email link
  return (
    <AuthShell portal={portal} title="Choose a new password" subtitle="Use at least 8 characters with letters and numbers.">
      <ResetPasswordForm portal={portal} />
    </AuthShell>
  );
}
