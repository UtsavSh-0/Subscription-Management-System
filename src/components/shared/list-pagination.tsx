"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ListPagination({ page, hasNext }: { page: number; hasNext: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const href = (n: number) => {
    const next = new URLSearchParams(params.toString());
    if (n === 1) next.delete("page"); else next.set("page", String(n));
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };
  if (page === 1 && !hasNext) return null;
  return <nav aria-label="Table pages" className="flex items-center justify-between border-t px-4 py-3 text-sm">
    <span className="text-muted-foreground">Page {page} · 50 rows per page</span>
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm" disabled={page <= 1}><Link href={href(page - 1)} aria-disabled={page <= 1}>Previous</Link></Button>
      <Button asChild variant="outline" size="sm" disabled={!hasNext}><Link href={href(page + 1)} aria-disabled={!hasNext}>Next</Link></Button>
    </div>
  </nav>;
}
