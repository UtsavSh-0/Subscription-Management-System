import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ListPagination } from "@/components/shared/list-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Column { key: string; label: string; align?: "right"; hideOnMobile?: boolean }
export type Row = { id: string } & Record<string, ReactNode>;

/** Responsive data table inside a page header. Rows are plain server-rendered cells. */
export function ListPage({
  title, description, icon, columns, rows, emptyTitle, emptyText, actions, above, page, hasNext,
}: {
  title: string; description: string; icon: LucideIcon; columns: Column[]; rows: Row[];
  emptyTitle: string; emptyText: string; actions?: ReactNode; above?: ReactNode;
  page?: number; hasNext?: boolean;
}) {
  return (
    <>
      <PageHeader title={title} description={description} breadcrumbs={[{ label: title }]} actions={actions} />
      {above}
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={icon} title={emptyTitle} description={emptyText} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>{columns.map((c) => <th key={c.key} className={cn("px-4 py-2.5 text-left font-medium", c.align === "right" && "text-right", c.hideOnMobile && "hidden md:table-cell")}>{c.label}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40">
                    {columns.map((c) => <td key={c.key} className={cn("px-4 py-3", c.align === "right" && "text-right tabular-nums", c.hideOnMobile && "hidden md:table-cell")}>{r[c.key] ?? "-"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {page !== undefined && <ListPagination page={page} hasNext={Boolean(hasNext)} />}
    </>
  );
}
