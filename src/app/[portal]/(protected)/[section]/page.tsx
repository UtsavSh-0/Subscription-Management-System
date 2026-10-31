import { DemoWorkspace } from "@/components/demo/demo-workspace";
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  return <DemoWorkspace section={(await params).section} />;
}
