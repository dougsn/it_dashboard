"use client";

import { formatBps } from "@/lib/format";

export function BandwidthCell({ current, contracted, color }: {
  current: number | null;
  contracted: number | null;
  color: "success" | "primary";
}) {
  if (current == null) return <span className="text-muted-foreground/50 text-xs font-normal">sem dados</span>;
  const pct = contracted && contracted > 0 ? Math.min((current / contracted) * 100, 100) : null;
  const barColor = pct == null ? "" : pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : color === "success" ? "bg-success" : "bg-primary";
  const textColor = color === "success" ? "text-success" : "text-primary";
  return (
    <div className="inline-flex flex-col items-end gap-0.5 min-w-18">
      <span className={`font-mono text-xs font-semibold ${textColor}`}>{formatBps(current)}</span>
      {contracted != null && (
        <>
          <span className="text-[10px] text-muted-foreground font-mono">/ {formatBps(contracted)}</span>
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </>
      )}
    </div>
  );
}
