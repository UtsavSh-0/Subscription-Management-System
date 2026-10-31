"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { chartColors } from "@/lib/chart-colors";
import type { SubscriptionStatus } from "@/types";

const LABEL: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  confirmed: "Confirmed",
  quotation: "Quotation",
  draft: "Draft",
  closed: "Closed",
};

export function StatusDonut({ data }: { data: { status: SubscriptionStatus; count: number }[] }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  return (
    <div>
      <div className="relative mx-auto h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.status} fill={chartColors.status[d.status]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-semibold tabular-nums leading-none">{total}</p>
            <p className="mt-1 text-xs text-muted-foreground">subscriptions</p>
          </div>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2.5 text-sm">
            <span className="size-2.5 rounded-sm" style={{ background: chartColors.status[d.status] }} />
            <span className="text-muted-foreground">{LABEL[d.status]}</span>
            <span className="ml-auto font-medium tabular-nums">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
