// Next.js runs register() once at server startup. We use it to fail fast when
// required secrets are missing/weak — same fail-fast guarantee the worker has via
// worker/index.ts — instead of throwing a cryptic 500 on the first request that
// tries to encrypt a credential or sign a webhook token.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateKey } = await import("@/lib/crypto");
    const { validateSecret } = await import("@/lib/webhook");
    validateKey();   // ENCRYPTION_KEY present and 64 hex chars
    validateSecret(); // WEBHOOK_SECRET present and >= 32 chars
  }
}
