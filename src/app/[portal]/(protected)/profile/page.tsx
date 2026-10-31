import type { Metadata } from "next";
import { ProfileForm } from "@/components/shared/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import type { Role } from "@/lib/auth/portals";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage({ params }: { params: Promise<{ portal: string }> }) {
  const user = await requireRole((await params).portal as Role);
  const db = await createClient();
  const { data: profile } = await db.from("profiles").select("full_name,phone").eq("id", user.id).single();
  const { data: customer } = user.customerId
    ? await db.from("customers").select("name,company,phone,address,billing_name,billing_address,tax_id").eq("id", user.customerId).single()
    : { data: null };
  return (
    <>
      <PageHeader title="Profile" description={user.role === "customer" ? "Your contact and billing details." : "Your account details."} breadcrumbs={[{ label: "Profile" }]} />
      <ProfileForm role={user.role} userId={user.id} email={user.email} customerId={user.customerId}
        initial={{ full_name: profile?.full_name ?? "", phone: profile?.phone ?? "", company: customer?.company ?? "", address: customer?.address ?? "", billing_name: customer?.billing_name ?? "", billing_address: customer?.billing_address ?? "", tax_id: customer?.tax_id ?? "" }} />
    </>
  );
}
