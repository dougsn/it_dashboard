import { Skeleton } from "@/components/ui/skeleton";

// Shared presentational primitives for the device/link detail drawers.

export function MetricTile({ label, value, unit, loading }: {
  label: string; value: string | number | null; unit?: string; loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3.5">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      {loading ? <Skeleton className="h-7 w-16" /> : (
        <div className="flex items-baseline gap-1">
          <span className="text-[1.6rem] font-extrabold leading-none tabular-nums text-foreground">
            {value ?? "—"}
          </span>
          {unit && value != null && (
            <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function InfoRow({ label, value, suppressHydration }: {
  label: string; value: string; suppressHydration?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right" suppressHydrationWarning={suppressHydration}>{value}</span>
    </div>
  );
}
