import { KpiCardSkeleton } from "@/components/shared/kpi-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Block = ({ h }: { h: string }) => (
  <Card className="p-5">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="mt-2 h-3 w-56" />
    <Skeleton className={`mt-6 w-full ${h}`} />
  </Card>
);

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Block h="h-[240px]" />
        </div>
        <Block h="h-[240px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Block h="h-[200px]" />
        </div>
        <Block h="h-[200px]" />
      </div>
    </div>
  );
}
