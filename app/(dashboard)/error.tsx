"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console for diagnostics
    console.error("[dashboard] erro de renderização:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-5">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="text-lg font-bold text-foreground mb-1.5">Algo deu errado nesta página</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-1">
        Ocorreu um erro inesperado ao carregar este conteúdo. O restante do sistema continua funcionando.
      </p>
      {error.digest && (
        <p className="text-[11px] text-muted-foreground/60 font-mono mb-6">Ref: {error.digest}</p>
      )}
      {!error.digest && <div className="mb-6" />}
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <RotateCcw className="h-4 w-4" />
        Tentar novamente
      </button>
    </div>
  );
}
