/*
import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardView />;
}
*/
import { DemoWorkspace } from "@/components/demo/demo-workspace";
export default function DashboardPage() { return <DemoWorkspace section="dashboard" />; }
