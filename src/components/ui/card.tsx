import * as React from "react";
import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...p }: DivProps) => (
  <div className={cn("rounded-xl border bg-card shadow-card", className)} {...p} />
);
export const CardHeader = ({ className, ...p }: DivProps) => (
  <div className={cn("flex items-start justify-between gap-4 px-5 pb-3 pt-5", className)} {...p} />
);
export const CardTitle = ({ className, ...p }: DivProps) => (
  <h3 className={cn("text-[15px] font-semibold leading-tight tracking-tight", className)} {...p} />
);
export const CardDescription = ({ className, ...p }: DivProps) => (
  <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...p} />
);
export const CardContent = ({ className, ...p }: DivProps) => <div className={cn("px-5 pb-5", className)} {...p} />;
