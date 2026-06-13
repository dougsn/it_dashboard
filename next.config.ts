import type { NextConfig } from "next";

// SEC-020: CSP is emitted per-request with a nonce by middleware.ts.
// Only static security headers that don't need per-request values live here.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  // SEC-021: HSTS enviado em todos os ambientes (não apenas produção)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Previne ataques de cross-origin via window.opener e SharedArrayBuffer
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
