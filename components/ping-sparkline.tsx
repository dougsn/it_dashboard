"use client";

import { useState } from "react";

interface Props {
  data: (number | null)[];
  /** unique suffix to avoid gradient ID collisions across cards */
  uid: string;
  /** ping threshold for "unstable" in ms (default 150) */
  threshold?: number;
  width?: number;
  height?: number;
  /** when true, SVG stretches to fill its container width */
  responsive?: boolean;
  /** when true, shows an interactive tooltip on hover */
  showTooltip?: boolean;
  /** timestamp labels shown in the tooltip, one per data point */
  labels?: string[];
}

type Seg = "online" | "unstable" | "offline";

const SEG_STROKE: Record<Seg, string> = {
  online:   "var(--success)",
  unstable: "var(--warning)",
  offline:  "var(--destructive)",
};

function classify(v: number | null, threshold: number): Seg {
  if (v === null) return "offline";
  if (v > threshold) return "unstable";
  return "online";
}

// SVG tooltip bubble rendered inside the chart
function TooltipBubble({
  x, y, value, label, color, chartW, chartH,
}: {
  x: number; y: number; value: number | null; label?: string;
  color: string; chartW: number; chartH: number;
}) {
  const text1 = value != null ? `${value}ms` : "Offline";
  const hasLabel = !!label;
  const bw = Math.max(text1.length * 6, hasLabel ? (label?.length ?? 0) * 5 : 0) + 16;
  const bh = hasLabel ? 28 : 16;
  const bx = x > chartW / 2 ? x - bw - 6 : x + 6;
  const by = Math.min(Math.max(y - bh / 2, 2), chartH - bh - 2);

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect x={bx} y={by} width={bw} height={bh} rx="3"
        fill="var(--popover)" stroke="var(--border)" strokeWidth="0.75" />
      <text x={bx + 6} y={by + 11} fontSize="9" fontWeight="700"
        fontFamily="ui-monospace,monospace" fill={color}>
        {text1}
      </text>
      {hasLabel && (
        <text x={bx + 6} y={by + 22} fontSize="7.5"
          fontFamily="ui-monospace,monospace" fill="var(--muted-foreground)">
          {label}
        </text>
      )}
    </g>
  );
}

export function PingSparkline({
  data,
  uid,
  threshold = 150,
  width = 120,
  height = 44,
  responsive = false,
  showTooltip = false,
  labels,
}: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length < 3) return null;

  const W = width;
  const H = height;
  const PAD = 3;

  const vals = data.filter((v): v is number => v !== null);
  const minV = vals.length > 0 ? Math.min(...vals) : 0;
  const maxV = vals.length > 0 ? Math.max(...vals) : 0;
  const range = maxV - minV || 1;

  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: v === null
      ? H - PAD
      : PAD + (1 - (v - minV) / range) * (H - PAD * 2 - 2),
    seg: classify(v, threshold),
  }));

  function buildLinePath(indices: number[]): string {
    if (indices.length < 2) return "";
    const first = pts[indices[0]];
    let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
    for (let j = 1; j < indices.length; j++) {
      const prev = pts[indices[j - 1]];
      const curr = pts[indices[j]];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx.toFixed(2)} ${prev.y.toFixed(2)}, ${cpx.toFixed(2)} ${curr.y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }
    return d;
  }

  type Run = { seg: Seg; indices: number[] };
  const runs: Run[] = [];
  for (let i = 0; i < pts.length; i++) {
    const seg = pts[i].seg;
    if (!runs.length || runs[runs.length - 1].seg !== seg) {
      runs.push({ seg, indices: [i] });
    } else {
      runs[runs.length - 1].indices.push(i);
    }
  }

  const segments = runs.map((run, ri) => {
    const prevLast = ri > 0 ? runs[ri - 1].indices.at(-1)! : null;
    const allIdx = prevLast !== null ? [prevLast, ...run.indices] : run.indices;
    const linePath = buildLinePath(allIdx);
    const first = pts[allIdx[0]];
    const last  = pts[allIdx.at(-1)!];
    const areaPath = `${linePath} L ${last.x.toFixed(2)} ${H} L ${first.x.toFixed(2)} ${H} Z`;
    return { seg: run.seg, linePath, areaPath, gradId: `psg-${uid}-${ri}` };
  });

  const lastPt = pts.at(-1)!;
  const hovered = hoveredIdx !== null ? pts[hoveredIdx] : null;

  function handleMouseMove(e: React.MouseEvent<SVGRectElement>) {
    const svg = e.currentTarget.ownerSVGElement!;
    const pt  = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    let minDist = Infinity, nearest = 0;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(pts[i].x - svgPt.x);
      if (d < minDist) { minDist = d; nearest = i; }
    }
    setHoveredIdx(nearest);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={responsive ? "100%" : W}
      height={H}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        {segments.map(({ seg, gradId }) => (
          <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={SEG_STROKE[seg]} stopOpacity="0.30" />
            <stop offset="100%" stopColor={SEG_STROKE[seg]} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>

      {segments.map(({ areaPath, gradId }) => (
        <path key={`a-${gradId}`} d={areaPath} fill={`url(#${gradId})`} />
      ))}

      {segments.map(({ linePath, seg, gradId }) => (
        <path key={`l-${gradId}`} d={linePath} fill="none"
          stroke={SEG_STROKE[seg]} strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* Dot at current value */}
      <circle cx={lastPt.x.toFixed(2)} cy={lastPt.y.toFixed(2)} r="2.5"
        fill={SEG_STROKE[lastPt.seg]} />

      {/* Tooltip layer */}
      {showTooltip && (
        <>
          {/* Transparent overlay captures mouse events */}
          <rect x={0} y={0} width={W} height={H} fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIdx(null)} />

          {hovered && (
            <g>
              {/* Vertical guide */}
              <line x1={hovered.x} y1={PAD} x2={hovered.x} y2={H - PAD}
                stroke="var(--foreground)" strokeOpacity="0.15" strokeWidth="1" />
              {/* Highlighted dot */}
              <circle cx={hovered.x} cy={hovered.y} r="3.5"
                fill={SEG_STROKE[hovered.seg]}
                stroke="var(--background)" strokeWidth="1.5" />
              <TooltipBubble
                x={hovered.x} y={hovered.y}
                value={data[hoveredIdx!]}
                label={labels?.[hoveredIdx!]}
                color={SEG_STROKE[hovered.seg]}
                chartW={W} chartH={H}
              />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
