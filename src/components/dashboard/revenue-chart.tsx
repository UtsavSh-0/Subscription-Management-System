"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/chart-colors";
import { formatMoney } from "@/lib/utils";

interface Point {
  label: string;
  full: string;
  billed: number;
  collected: number;
}

interface TipProps {
  active?: boolean;
  payload?: { payload: Point }[];
}

function Tip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg bg-card px-3 py-2 text-sm shadow-pop">
      <p className="mb-1 font-medium">{p.full}</p>
      <p className="flex items-center justify-between gap-6 text-muted-foreground">
        <span>Billed</span>
        <span className="tabular-nums text-foreground">{formatMoney(p.billed)}</span>
      </p>
      <p className="flex items-center justify-between gap-6 text-muted-foreground">
        <span>Collected</span>
        <span className="tabular-nums text-foreground">{formatMoney(p.collected)}</span>
      </p>
    </div>
  );
}

export function RevenueChart({ data }: { data: Point[] }) {
  const tick = { fontSize: 12, fill: "#66726F" };
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={tick}
            width={52}
            tickFormatter={(v: number) => formatMoney(v, true)}
          />
          <Tooltip content={<Tip />} cursor={{ stroke: chartColors.grid }} />
          <Area
            type="monotone"
            dataKey="billed"
            stroke={chartColors.muted}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            fill="none"
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke={chartColors.primary}
            strokeWidth={2}
            fill={chartColors.primary}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
