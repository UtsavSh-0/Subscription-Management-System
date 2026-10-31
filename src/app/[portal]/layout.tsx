import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isRole, ROLES } from "@/lib/auth/portals";

export const dynamicParams = false;
export const generateStaticParams = () => ROLES.map((portal) => ({ portal }));

/** Each portal gets its own accent theme via data-portal. */
export default async function PortalLayout({ children, params }: { children: ReactNode; params: Promise<{ portal: string }> }) {
  const { portal } = await params;
  if (!isRole(portal)) notFound();
  return <div data-portal={portal} className="min-h-screen bg-background">{children}</div>;
}
