import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  footer,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  footer: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      <div className="mt-3 text-sm text-muted-foreground">{footer}</div>
    </Card>
  );
}

export const KpiCardSkeleton = () => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="size-8" />
    </div>
    <Skeleton className="mt-4 h-7 w-32" />
    <Skeleton className="mt-4 h-4 w-40" />
  </Card>
);
