"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { overdueInvoices } from "@/lib/analytics";
import { formatMoney } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function NotificationsMenu() {
  const { data } = useAppStore();
  const [read, setRead] = useState(false);
  const items = useMemo(() => overdueInvoices(data, 5), [data]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          {!read && items.length > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Overdue invoices</DropdownMenuLabel>
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing overdue. Nice work.</p>
        ) : (
          items.map((i) => (
            <div key={i.id} className="flex items-start justify-between gap-3 rounded-md px-2 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{i.customer?.company}</p>
                <p className="text-xs text-muted-foreground">
                  {i.number} &middot; {i.daysOverdue} days overdue
                </p>
              </div>
              <span className="shrink-0 tabular-nums">{formatMoney(i.total)}</span>
            </div>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            setRead(true);
            toast.success("Notifications marked as read");
          }}
        >
          <CheckCheck /> Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
