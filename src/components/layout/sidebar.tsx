"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { navFor, ROLE_LABEL } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: Props) {
  const pathname = usePathname();
  const { user } = useAppStore();
  const groups = navFor(user);
  const hide = collapsed ? "lg:hidden" : "";

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        aria-label="Primary"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r bg-card transition-[width,transform] duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[252px]",
        )}
      >
        <div className={cn("flex h-16 items-center gap-2.5 bg-gradient-to-r from-primary to-primary/80 px-4 text-primary-foreground", collapsed && "lg:justify-center lg:px-0")}>
          <Logo className="size-8 rounded-lg ring-2 ring-white/30" />
          <span className={cn("leading-tight", hide)}>
            <span className="block text-[15px] font-semibold tracking-tight">Brightloop</span>
            <span className="block text-[11px] uppercase tracking-wider text-primary-foreground/75">{ROLE_LABEL[user.role]} portal</span>
          </span>
          <button onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-md hover:bg-white/15 lg:hidden" aria-label="Close menu">
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group, gi) => (
            <div key={group.label ?? gi} className={gi > 0 ? "mt-5" : ""}>
              {group.label && <p className={cn("mb-1.5 px-2.5 text-xs font-medium text-muted-foreground", hide)}>{group.label}</p>}
              {collapsed && gi > 0 && <div className="mx-2 mb-2 hidden border-t lg:block" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors",
                          collapsed && "lg:justify-center lg:px-0",
                          active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="size-[18px] shrink-0" />
                        <span className={hide}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="hidden border-t p-3 lg:block">
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground", collapsed && "justify-center px-0")}
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
