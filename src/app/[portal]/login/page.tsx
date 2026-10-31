import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isRole, ROLE_LABEL, type Role } from "@/lib/auth/portals";

export const generateMetadata = async ({ params }: { params: Promise<{ portal: string }> }): Promise<Metadata> => ({
  title: `${ROLE_LABEL[(await params).portal as Role]} login`,
});

export default async function LoginPage({ params, searchParams }: { params: Promise<{ portal: string }>; searchParams: Promise<{ error?: string; reset?: string }> }) {
  const portal = (await params).portal as Role;
  if (!isRole(portal)) notFound();
  const sp = await searchParams;
  const notice = sp.error === "link_expired" ? "That link has expired. Request a new one." : sp.reset ? "Password updated. Sign in with your new password." : undefined;
  const demoCredentials = { email: `${portal}@brightloop.demo`, password: portal === "admin" ? "AdminDemo@123" : portal === "staff" ? "StaffDemo@123" : "CustomerDemo@123" };
  return (
    <AuthShell portal={portal} title={`${ROLE_LABEL[portal]} sign in`} subtitle="Welcome back. Enter your details to continue.">
      <LoginForm portal={portal} notice={notice} demoCredentials={demoCredentials} />
    </AuthShell>
  );
}
