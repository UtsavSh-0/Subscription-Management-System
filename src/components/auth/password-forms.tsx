"use client";
import Link from "next/link";
import type { Role } from "@/lib/auth/portals";

export function ForgotPasswordForm({ portal }: { portal: Role }) {
  return <div className="space-y-4 rounded-xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">Password recovery is disabled in this local demo. Use the credentials on the portal sign-in page.</p>
    <Link className="text-primary underline" href={"/" + portal + "/login"}>Back to sign in</Link>
  </div>;
}
export function ResetPasswordForm({ portal }: { portal: Role }) {
  return <div className="space-y-4 rounded-xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">Demo passwords are managed locally. Return to the portal sign-in page.</p>
    <Link className="text-primary underline" href={"/" + portal + "/login"}>Back to sign in</Link>
  </div>;
}
