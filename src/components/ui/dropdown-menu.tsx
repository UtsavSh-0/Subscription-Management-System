"use client";

import * as React from "react";
import * as D from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = D.Root;
export const DropdownMenuTrigger = D.Trigger;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof D.Content>,
  React.ComponentPropsWithoutRef<typeof D.Content>
>(({ className, sideOffset = 8, ...p }, ref) => (
  <D.Portal>
    <D.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn("z-50 min-w-[12rem] animate-pop rounded-lg bg-card p-1 text-sm shadow-pop", className)}
      {...p}
    />
  </D.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof D.Item>,
  React.ComponentPropsWithoutRef<typeof D.Item>
>(({ className, ...p }, ref) => (
  <D.Item
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted [&_svg]:size-4",
      className,
    )}
    {...p}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)} {...p} />
);
export const DropdownMenuSeparator = () => <D.Separator className="-mx-1 my-1 h-px bg-border" />;
