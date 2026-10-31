import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      success: "bg-success/10 text-success",
      info: "bg-info/10 text-info",
      warning: "bg-warning/10 text-warning",
      danger: "bg-destructive/10 text-destructive",
      muted: "bg-muted text-muted-foreground",
      outline: "border bg-card text-foreground",
    },
  },
  defaultVariants: { variant: "muted" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...p }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...p}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
