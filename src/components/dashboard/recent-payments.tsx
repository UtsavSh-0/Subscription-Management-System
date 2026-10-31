import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { recentPayments } from "@/lib/analytics";
import { formatMoney, initials, relativeDay } from "@/lib/utils";

export function RecentPayments({ rows }: { rows: ReturnType<typeof recentPayments> }) {
  if (rows.length === 0)
    return <EmptyState icon={Wallet} title="No payments yet" description="Payments you record against invoices will show up here." />;
  return (
    <ul className="divide-y">
      {rows.map((p) => (
        <li key={p.id} className="flex items-center gap-3 px-5 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
            {initials(p.customer?.company ?? "?")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.customer?.company}</p>
            <p className="truncate text-xs text-muted-foreground">
              {p.invoice?.number} &middot; {p.method}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium tabular-nums">{formatMoney(p.amount)}</p>
            <p className="text-xs text-muted-foreground">{relativeDay(p.date)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
