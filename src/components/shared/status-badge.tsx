import { Badge, type BadgeProps } from "@/components/ui/badge";

const MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  active: { label: "Active", variant: "success" },
  paid: { label: "Paid", variant: "success" },
  confirmed: { label: "Confirmed", variant: "info" },
  quotation: { label: "Quotation", variant: "warning" },
  draft: { label: "Draft", variant: "muted" },
  closed: { label: "Closed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "muted" },
  overdue: { label: "Overdue", variant: "danger" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = MAP[status] ?? { label: status, variant: "muted" as const };
  return (
    <Badge variant={m.variant} dot>
      {m.label}
    </Badge>
  );
}
