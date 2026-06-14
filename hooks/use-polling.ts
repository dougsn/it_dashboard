import { useEffect } from "react";

/**
 * Polls `fn` immediately and every `intervalMs`. Each invocation receives an
 * AbortSignal that is aborted before the next tick fires and on unmount, so a
 * slow response from a previous tick can't clobber fresher state (stale-write race).
 * Callers should forward the signal to their fetch() calls and ignore AbortError.
 */
export function usePolling(fn: (signal: AbortSignal) => void | Promise<void>, intervalMs: number) {
  useEffect(() => {
    let controller = new AbortController();
    void fn(controller.signal);

    const id = setInterval(() => {
      controller.abort();          // cancel the previous (possibly in-flight) tick
      controller = new AbortController();
      void fn(controller.signal);
    }, intervalMs);

    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, [fn, intervalMs]);
}
