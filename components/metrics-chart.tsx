"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { StatusHistory } from "@prisma/client";
import { fmtTime } from "@/lib/format";

interface MetricsChartProps {
  history: StatusHistory[];
  metric: "pingMs" | "cpuLoad" | "memoryUsed";
  label: string;
  color?: string;
  unit?: string;
}

export function MetricsChart({
  history,
  metric,
  label,
  color = "#3b82f6",
  unit = "",
}: MetricsChartProps) {
  const data = history.map((h) => ({
    time: fmtTime(h.timestamp, { hour: "2-digit", minute: "2-digit" }),
    value: (h[metric] as number | null) ?? null,
  }));

  return (
    <div className="h-44">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(v) =>
              v != null ? [`${Number(v).toFixed(1)}${unit}`, label] : ["—", label]
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${metric})`}
            connectNulls={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
