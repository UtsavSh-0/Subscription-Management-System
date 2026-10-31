import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((c, i) => (
        <span key={c.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
          {c.href && i < items.length - 1 ? (
            <Link href={c.href} className="hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "text-foreground" : ""}>
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
