"use client";

import { AlertTriangle } from "lucide-react";

interface WorkerStatusBannerProps {
  workerStatus: "ok" | "stale" | "unknown";
  workerLastSeen: string | null;
}

export function WorkerStatusBanner({ workerStatus, workerLastSeen }: WorkerStatusBannerProps) {
  if (workerStatus !== "stale") return null;

  let ago = "";
  if (workerLastSeen) {
    const diffMs = Date.now() - new Date(workerLastSeen).getTime();
    const m = Math.floor(diffMs / 60_000);
    ago = m < 1 ? "menos de 1 min atrás" : m === 1 ? "1 min atrás" : `${m} min atrás`;
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-warning/10 border-b border-warning/30 text-warning">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="text-sm font-medium">
        Worker parado · dados podem estar desatualizados
        {ago && <span className="font-normal"> · última verificação {ago}</span>}
      </p>
    </div>
  );
}
