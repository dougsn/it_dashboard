"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownBadgeProps {
  intervalMs: number;
  lastUpdated: Date | null;
}

export function CountdownBadge({ intervalMs, lastUpdated }: CountdownBadgeProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      if (!lastUpdated) { setRemaining(null); return; }
      const elapsed = Date.now() - lastUpdated.getTime();
      const rem = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000));
      setRemaining(rem);
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [intervalMs, lastUpdated]);

  if (remaining === null) return null;

  return (
    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums select-none">
      próximo em <span className="font-semibold text-foreground w-5 text-right">{remaining}s</span>
    </span>
  );
}
