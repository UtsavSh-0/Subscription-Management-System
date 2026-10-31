import { PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { overdueInvoices } from "@/lib/analytics";
import { formatDate, formatMoney } from "@/lib/utils";

export function OverdueTable({ rows }: { rows: ReturnType<typeof overdueInvoices> }) {
  if (rows.length === 0)
    return <EmptyState icon={PartyPopper} title="Nothing overdue" description="Every open invoice is within its payment terms." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-y bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Invoice</th>
            <th className="px-3 py-2.5 font-medium">Customer</th>
            <th className="px-3 py-2.5 font-medium">Due date</th>
            <th className="px-3 py-2.5 font-medium">Overdue by</th>
            <th className="px-5 py-2.5 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-5 py-3 font-medium">{r.number}</td>
              <td className="px-3 py-3">{r.customer?.company}</td>
              <td className="px-3 py-3 text-muted-foreground">{formatDate(r.dueDate)}</td>
              <td className="px-3 py-3">
                <Badge variant="danger">{r.daysOverdue} days</Badge>
              </td>
              <td className="px-5 py-3 text-right font-medium tabular-nums">{formatMoney(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
