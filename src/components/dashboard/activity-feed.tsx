import { AlertCircle, History, Receipt, Repeat, Wallet, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { Activity, ActivityKind } from "@/lib/analytics";
import { cn, relativeDay } from "@/lib/utils";

const KIND: Record<ActivityKind, { icon: LucideIcon; tone: string }> = {
  payment: { icon: Wallet, tone: "bg-success/10 text-success" },
  invoice: { icon: Receipt, tone: "bg-info/10 text-info" },
  overdue: { icon: AlertCircle, tone: "bg-destructive/10 text-destructive" },
  subscription: { icon: Repeat, tone: "bg-primary/10 text-primary" },
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0)
    return <EmptyState icon={History} title="No activity yet" description="Billing and payment events will appear here as they happen." />;
  return (
    <ul className="space-y-4 px-5 pb-5">
      {items.map((a) => {
        const { icon: Icon, tone } = KIND[a.kind];
        return (
          <li key={a.id} className="flex gap-3">
            <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full", tone)}>
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-snug">{a.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{relativeDay(a.at)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
