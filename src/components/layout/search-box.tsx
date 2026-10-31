"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { navFor } from "@/lib/nav";
import { useAppStore } from "@/store/app-store";

/** Jump-to-page search. Record search (customers, invoices) plugs into `items` as those pages ship. */
export function SearchBox() {
  const router = useRouter();
  const { user } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);

  const items = useMemo(
    () => user ? navFor(user).flatMap((g) => g.items) : [],
    [user],
  );
  const results = q.trim() ? items.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase())) : items;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement).tagName);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setCursor(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setCursor((c) => Math.min(c + 1, results.length - 1));
          if (e.key === "ArrowUp") setCursor((c) => Math.max(c - 1, 0));
          if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
          if (e.key === "Escape") inputRef.current?.blur();
        }}
        placeholder="Search pages"
        aria-label="Search pages"
        className="h-9 w-full rounded-md border bg-card pl-9 pr-9 text-sm shadow-card outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-xs text-muted-foreground sm:block">
        /
      </kbd>
      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 animate-pop rounded-lg bg-card p-1 shadow-pop">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No pages match &ldquo;{q}&rdquo;.</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.href}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r.href)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${i === cursor ? "bg-muted" : ""}`}
              >
                <r.icon className="size-4 text-muted-foreground" />
                {r.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
