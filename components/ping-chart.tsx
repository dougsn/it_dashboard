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

interface Props {
  history: StatusHistory[];
  threshold?: number;
}

type Seg = "online" | "unstable" | "offline";

const SEG_COLOR: Record<Seg, string> = {
  online:   "var(--success)",
  unstable: "var(--warning)",
  offline:  "var(--destructive)",
};

function classify(v: number | null, t: number): Seg {
  if (v === null) return "offline";
  if (v > t) return "unstable";
  return "online";
}

export function PingChart({ history, threshold = 150 }: Props) {
  if (history.length < 2) return null;

  const data = history.map((h) => ({
    time: fmtTime(h.timestamp, { hour: "2-digit", minute: "2-digit" }),
    // null when offline (line gap), pingMs when online
    value: h.isOnline ? (h.pingMs ?? null) : null,
    seg: classify(h.isOnline ? (h.pingMs ?? null) : null, threshold),
  }));

  // Build horizontal linearGradient stops that match segment boundaries
  // Each stop pair creates a hard color transition at segment edge
  type GStop = { offset: string; color: string };
  const stops: GStop[] = [];
  const n = data.length;

  for (let i = 0; i < n; i++) {
    const pct = `${((i / (n - 1)) * 100).toFixed(2)}%`;
    const color = SEG_COLOR[data[i].seg];
    const prevColor = i > 0 ? SEG_COLOR[data[i - 1].seg] : null;

    if (i === 0) {
      stops.push({ offset: pct, color });
    } else if (data[i].seg !== data[i - 1].seg) {
      // Hard transition: close previous color then open new one at same offset
      stops.push({ offset: pct, color: prevColor! });
      stops.push({ offset: pct, color });
    } else if (i === n - 1) {
      stops.push({ offset: pct, color });
    }
  }
  if (stops.length === 0 || stops[stops.length - 1].offset !== "100.00%") {
    stops.push({ offset: "100.00%", color: SEG_COLOR[data[n - 1].seg] });
  }

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <defs>
            {/* Horizontal gradient for the line stroke (multi-color by segment) */}
            <linearGradient id="ping-line-color" x1="0%" x2="100%" y1="0%" y2="0%">
              {stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
            {/* Vertical gradient for area fill (neutral fade) */}
            <linearGradient id="ping-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            unit="ms"
            width={42}
          />

          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(v, _name, props) => {
              if (props.payload?.seg === "offline") return ["Offline", "Status"];
              return [`${Number(v).toFixed(0)}ms`, "Latência"];
            }}
            labelFormatter={(l) => `🕐 ${l}`}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#ping-line-color)"
            strokeWidth={1.8}
            fill="url(#ping-area-fill)"
            dot={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
