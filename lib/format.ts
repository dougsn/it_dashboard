export function formatUptime(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const s = Number(seconds);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatResponseTime(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return `${ms}ms`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1)}%`;
}
