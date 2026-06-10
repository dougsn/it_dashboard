import * as https from "https";

export interface UnifiSSID {
  ssid: string;
  band: string;
  channel: number;
  clients: number;
  txBytes: number;
  rxBytes: number;
}

export interface UnifiClient {
  id: string;
  name: string;
  mac: string;
  ip: string | null;
  connectedAt: string | null;
  signal: number | null;  // dBm — only available via Inform API (user/pass)
  ssid: string | null;    // SSID name — only available via Inform API (user/pass)
}

export interface UnifiResult {
  model: string | null;
  firmware: string | null;
  uptime: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
  uplinkTxBps: number | null;
  uplinkRxBps: number | null;
  totalClients: number;
  ssids: UnifiSSID[];
  clients: UnifiClient[];
}

export type UnifiAuth =
  | { method: "apikey"; apiKey: string }
  | { method: "userpass"; username: string; password: string };

// ── Shared TLS error normalizer ──────────────────────────────────────────────

function normalizeNetworkError(err: NodeJS.ErrnoException, host: string, port: number): Error {
  if (err.code === "ECONNREFUSED")
    return new Error(`Conexão recusada em ${host}:${port} — verifique IP e porta`);
  if (err.code === "ETIMEDOUT" || err.message.includes("Timeout"))
    return new Error(`Timeout ao conectar a ${host}:${port}`);
  if (["DEPTH_ZERO_SELF_SIGNED_CERT","CERT_HAS_EXPIRED","UNABLE_TO_VERIFY_LEAF_SIGNATURE","ERR_TLS_CERT_ALTNAME_INVALID"].includes(err.code ?? ""))
    return new Error("Certificado TLS inválido — desabilite 'Verificar certificado TLS' para aceitar certificados autoassinados");
  return err;
}

// ══════════════════════════════════════════════════════════════════════════════
// Integration API (X-API-KEY)
// ══════════════════════════════════════════════════════════════════════════════

// On UniFi OS (port 443) the app is proxied under /proxy/network/.
// On standalone Network Application (port 8443) the path is direct.
const CANDIDATE_BASES = [
  "/proxy/network/integration/v1",
  "/integration/v1",
];

interface Page<T>       { data?: T[] }
interface SiteItem      { id: string; name: string; internalReference?: string }
interface DeviceItem    { id: string; macAddress: string; model?: string; firmwareVersion?: string; ipAddress?: string; state?: string }
interface StatsItem     { uptimeSec?: number; cpuUtilizationPct?: number; memoryUtilizationPct?: number; uplink?: { txRateBps?: number; rxRateBps?: number } }
interface ClientItem    { id: string; type?: string; name?: string; macAddress?: string; ipAddress?: string; connectedAt?: string; uplinkDeviceId?: string }
interface BroadcastItem { id: string; name: string; enabled?: boolean; broadcastingFrequenciesGHz?: number[] }

function httpsGetApiKey(
  host: string, port: number, path: string, apiKey: string, tlsVerify: boolean,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: host, port, path, method: "GET",
        headers: { "X-API-KEY": apiKey, Accept: "application/json" },
        rejectUnauthorized: tlsVerify },
      (res) => {
        let raw = "";
        res.on("data", (c: string) => (raw += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode ?? 0, body: null }); }
        });
      },
    );
    req.on("error", (err: NodeJS.ErrnoException) => reject(normalizeNetworkError(err, host, port)));
    req.setTimeout(10_000, () => req.destroy(new Error("Timeout")));
    req.end();
  });
}

async function discoverBase(
  host: string, port: number, apiKey: string, tlsVerify: boolean,
): Promise<string> {
  let lastError: Error | null = null;
  for (const base of CANDIDATE_BASES) {
    try {
      const { status } = await httpsGetApiKey(host, port, `${base}/sites`, apiKey, tlsVerify);
      if (status === 401 || status === 403) throw new Error("Chave de API inválida ou sem permissão (HTTP " + status + ")");
      if (status < 400) return base;
      lastError = new Error(`HTTP ${status} em ${base}/sites`);
    } catch (e) {
      const err = e as Error;
      if (/inválid|permissão|recusad|Timeout|Certificado/i.test(err.message)) throw err;
      lastError = err;
    }
  }
  throw lastError ?? new Error("API UniFi não encontrada — verifique IP, porta e versão do controlador (≥ 9.3)");
}

function freqLabel(ghz: number): string {
  if (ghz === 2.4) return "2.4 GHz";
  if (ghz === 5) return "5 GHz";
  if (ghz === 6) return "6 GHz";
  return `${ghz} GHz`;
}

async function checkUnifiApiKey(
  apIp: string, controllerIp: string, apiKey: string,
  port: number, site: string, tlsVerify: boolean,
): Promise<UnifiResult> {
  const base = await discoverBase(controllerIp, port, apiKey, tlsVerify);

  const sitesRes = await httpsGetApiKey(controllerIp, port, `${base}/sites?limit=200`, apiKey, tlsVerify);
  const sites = (sitesRes.body as Page<SiteItem>).data ?? [];
  const siteObj = sites.find((s) => s.name === site || s.id === site || s.internalReference === site);
  if (!siteObj) {
    const available = sites.map((s) => `"${s.name}" (ref: ${s.internalReference ?? s.id})`).join(", ");
    throw new Error(`Site "${site}" não encontrado. Disponíveis: ${available || "(nenhum)"}`);
  }
  const siteId = siteObj.id;

  const devRes = await httpsGetApiKey(controllerIp, port, `${base}/sites/${siteId}/devices?limit=200`, apiKey, tlsVerify);
  const devices = (devRes.body as Page<DeviceItem>).data ?? [];
  const ap = devices.find((d) => d.ipAddress === apIp) ?? (devices.length === 1 ? devices[0] : undefined);
  if (!ap) {
    throw new Error(`AP com IP ${apIp} não encontrado no site "${siteObj.name}" (${devices.length} dispositivo(s))`);
  }

  let cpuLoad: number | null = null;
  let memoryUsed: number | null = null;
  let uptime: number | null = null;
  let uplinkTxBps: number | null = null;
  let uplinkRxBps: number | null = null;
  try {
    const statsRes = await httpsGetApiKey(
      controllerIp, port,
      `${base}/sites/${siteId}/devices/${ap.id}/statistics/latest`,
      apiKey, tlsVerify,
    );
    const s = statsRes.body as StatsItem | null;
    if (s) {
      uptime      = s.uptimeSec          ?? null;
      cpuLoad     = s.cpuUtilizationPct  ?? null;
      memoryUsed  = s.memoryUtilizationPct ?? null;
      uplinkTxBps = s.uplink?.txRateBps  ?? null;
      uplinkRxBps = s.uplink?.rxRateBps  ?? null;
    }
  } catch { /* non-fatal */ }

  const clientsRes = await httpsGetApiKey(controllerIp, port, `${base}/sites/${siteId}/clients?limit=200`, apiKey, tlsVerify);
  const allClients = (clientsRes.body as Page<ClientItem>).data ?? [];
  const apClients = allClients.filter((c) => c.type === "WIRELESS" && c.uplinkDeviceId === ap.id);

  let ssids: UnifiSSID[] = [];
  try {
    const broadcastsRes = await httpsGetApiKey(controllerIp, port, `${base}/sites/${siteId}/wifi/broadcasts?limit=200`, apiKey, tlsVerify);
    const broadcasts = (broadcastsRes.body as Page<BroadcastItem>).data ?? [];
    ssids = broadcasts
      .filter((b) => b.enabled !== false)
      .map((b) => ({
        ssid: b.name,
        band: (b.broadcastingFrequenciesGHz ?? []).map(freqLabel).join(" / ") || "—",
        channel: 0, clients: 0, txBytes: 0, rxBytes: 0,
      }));
  } catch { /* non-fatal */ }

  const clients: UnifiClient[] = apClients.map((c) => ({
    id: c.id,
    name: c.name ?? c.macAddress ?? c.id,
    mac: c.macAddress ?? "",
    ip: c.ipAddress ?? null,
    connectedAt: c.connectedAt ?? null,
    signal: null,
    ssid: null,
  }));

  return { model: ap.model ?? null, firmware: ap.firmwareVersion ?? null, uptime, cpuLoad, memoryUsed, uplinkTxBps, uplinkRxBps, totalClients: apClients.length, ssids, clients };
}

// Inform API path candidates: UniFi OS proxies under /proxy/network; standalone is direct
const INFORM_BASES = ["/proxy/network", ""];

// ══════════════════════════════════════════════════════════════════════════════
// Inform API (username / password)  — exposes RSSI + SSID per client
// ══════════════════════════════════════════════════════════════════════════════

interface InformVap {
  essid?: string;
  radio?: string;    // "ng" = 2.4 GHz, "na" = 5 GHz, "6e" = 6 GHz
  channel?: number;
  num_sta?: number;
  rx_bytes?: number;
  tx_bytes?: number;
  up?: boolean;
}

interface InformDevice {
  mac: string;
  ip?: string;
  model?: string;
  version?: string;
  uptime?: number;
  "sys_stats"?: { cpu?: number; mem_used?: number; mem_total?: number };
  "system-stats"?: { cpu?: string; mem?: string };
  vap_table?: InformVap[];
  // Top-level cumulative traffic counters (present on most AP firmware)
  tx_bytes?: number;
  rx_bytes?: number;
  // Per-radio stat block (alternative location)
  stat?: { ap?: { tx_bytes?: number; rx_bytes?: number } };
  uplink?: { rx_bytes?: number; tx_bytes?: number };
}

function deviceBytes(d: InformDevice): { tx: number; rx: number } | null {
  // Prefer top-level fields; fall back to stat.ap; last resort: uplink port counters
  const tx = d.tx_bytes ?? d.stat?.ap?.tx_bytes ?? d.uplink?.tx_bytes;
  const rx = d.rx_bytes ?? d.stat?.ap?.rx_bytes ?? d.uplink?.rx_bytes;
  if (tx == null || rx == null) return null;
  return { tx, rx };
}

interface InformClient {
  mac: string;
  hostname?: string;
  ip?: string;
  signal?: number;
  essid?: string;
  ap_mac?: string;
  last_seen?: number;
}

function radioToBand(radio: string): string {
  if (radio === "ng") return "2.4 GHz";
  if (radio === "na") return "5 GHz";
  if (radio === "6e") return "6 GHz";
  return radio;
}

function httpsPostJson(
  host: string, port: number, path: string, body: unknown, tlsVerify: boolean,
): Promise<{ status: number; body: unknown; cookies: string[] }> {
  const bodyStr = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: host, port, path, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(bodyStr) },
        rejectUnauthorized: tlsVerify },
      (res) => {
        let raw = "";
        res.on("data", (c: string) => (raw += c));
        res.on("end", () => {
          const cookies = ((res.headers["set-cookie"] ?? []) as string[]);
          try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(raw), cookies }); }
          catch { resolve({ status: res.statusCode ?? 0, body: null, cookies }); }
        });
      },
    );
    req.on("error", (err: NodeJS.ErrnoException) => reject(normalizeNetworkError(err, host, port)));
    req.setTimeout(10_000, () => req.destroy(new Error("Timeout")));
    req.write(bodyStr);
    req.end();
  });
}

function httpsGetCookie(
  host: string, port: number, path: string, cookie: string, tlsVerify: boolean,
  csrfToken?: string,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = { Cookie: cookie, Accept: "application/json" };
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
    const req = https.request(
      { hostname: host, port, path, method: "GET", headers, rejectUnauthorized: tlsVerify },
      (res) => {
        let raw = "";
        res.on("data", (c: string) => (raw += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode ?? 0, body: null }); }
        });
      },
    );
    req.on("error", (err: NodeJS.ErrnoException) => reject(normalizeNetworkError(err, host, port)));
    req.setTimeout(10_000, () => req.destroy(new Error("Timeout")));
    req.end();
  });
}

function extractCsrf(body: unknown): string | undefined {
  const b = body as Record<string, unknown> | null;
  if (!b) return undefined;
  if (typeof b.csrf === "string" && b.csrf) return b.csrf;
  if (typeof b.csrfToken === "string" && b.csrfToken) return b.csrfToken;
  return undefined;
}

async function checkUnifiInform(
  apIp: string, controllerIp: string,
  username: string, password: string,
  port: number, site: string, tlsVerify: boolean,
): Promise<UnifiResult> {
  // 1. Login — try UniFi OS native auth, then proxied app login, then standalone
  const loginCandidates: Array<{ loginPath: string; base: string }> = [
    { loginPath: "/api/auth/login",           base: "/proxy/network" },
    { loginPath: "/proxy/network/api/login",  base: "/proxy/network" },
    { loginPath: "/api/login",                base: "" },
  ];
  let cookie = "";
  let base = "";
  let csrf: string | undefined;
  for (const { loginPath, base: candidateBase } of loginCandidates) {
    const loginRes = await httpsPostJson(
      controllerIp, port, loginPath, { username, password }, tlsVerify,
    );
    if (loginRes.status === 404) continue;
    if (loginRes.status !== 200) throw new Error(`Credenciais inválidas (HTTP ${loginRes.status})`);
    cookie = (loginRes.cookies as string[]).map((c) => c.split(";")[0]).join("; ");
    if (!cookie) throw new Error("Login retornou HTTP 200 mas sem cookie de sessão");
    csrf = extractCsrf(loginRes.body);
    base = candidateBase;
    break;
  }
  if (!cookie) throw new Error("Endpoint de login não encontrado — verifique IP e porta do controlador");

  // 2. Device list — find AP by IP
  const devRes = await httpsGetCookie(controllerIp, port, `${base}/api/s/${site}/stat/device`, cookie, tlsVerify, csrf);
  if (devRes.status === 404) throw new Error(`Site "${site}" não encontrado (HTTP 404)`);
  const devices = ((devRes.body as { data?: InformDevice[] })?.data ?? []);
  const ap = devices.find((d) => d.ip === apIp) ?? (devices.length === 1 ? devices[0] : undefined);
  if (!ap) throw new Error(`AP ${apIp} não encontrado no site "${site}" (${devices.length} dispositivo(s))`);

  // Parse CPU: sys_stats.cpu (float 0-100) or system-stats.cpu (string "XX.X")
  const cpuRaw = ap["sys_stats"]?.cpu ?? (ap["system-stats"]?.cpu != null ? parseFloat(ap["system-stats"]!.cpu!) : undefined);
  const cpuLoad: number | null = cpuRaw != null && !isNaN(cpuRaw) ? cpuRaw : null;

  // Parse memory: sys_stats.mem_used/mem_total → % or system-stats.mem (string "XX.X")
  let memoryUsed: number | null = null;
  const ss = ap["sys_stats"];
  if (ss?.mem_used != null && ss?.mem_total != null && ss.mem_total > 0) {
    memoryUsed = (ss.mem_used / ss.mem_total) * 100;
  } else if (ap["system-stats"]?.mem != null) {
    const parsed = parseFloat(ap["system-stats"]!.mem!);
    if (!isNaN(parsed)) memoryUsed = parsed;
  }

  // 3. Connected clients — filter by ap_mac
  const clientsRes = await httpsGetCookie(controllerIp, port, `${base}/api/s/${site}/stat/sta`, cookie, tlsVerify, csrf);
  const allClients = ((clientsRes.body as { data?: InformClient[] })?.data ?? []);
  const apClients = allClients.filter((c) => c.ap_mac === ap.mac);

  // 4. SSIDs from vap_table — includes band, channel, per-SSID traffic and client count
  const ssids: UnifiSSID[] = (ap.vap_table ?? [])
    .filter((v) => v.up !== false && v.essid)
    .map((v) => ({
      ssid: v.essid!,
      band: v.radio ? radioToBand(v.radio) : "—",
      channel: v.channel ?? 0,
      clients: v.num_sta ?? 0,
      txBytes: v.tx_bytes ?? 0,
      rxBytes: v.rx_bytes ?? 0,
    }));

  const clients: UnifiClient[] = apClients.map((c) => ({
    id: c.mac,
    name: c.hostname ?? c.mac,
    mac: c.mac,
    ip: c.ip ?? null,
    connectedAt: c.last_seen != null ? new Date(c.last_seen * 1000).toISOString() : null,
    signal: c.signal ?? null,
    ssid: c.essid ?? null,
  }));

  // 5. Uplink rate: sample tx_bytes/rx_bytes twice with 1-second gap → bits/s
  let uplinkTxBps: number | null = null;
  let uplinkRxBps: number | null = null;
  const snap1 = deviceBytes(ap);
  if (snap1) {
    await new Promise((r) => setTimeout(r, 1_000));
    try {
      const devRes2 = await httpsGetCookie(
        controllerIp, port, `${base}/api/s/${site}/stat/device`, cookie, tlsVerify, csrf,
      );
      const devices2 = ((devRes2.body as { data?: InformDevice[] })?.data ?? []);
      const ap2 = devices2.find((d) => d.ip === apIp) ?? (devices2.length === 1 ? devices2[0] : undefined);
      const snap2 = ap2 ? deviceBytes(ap2) : null;
      if (snap2) {
        uplinkTxBps = Math.max(0, snap2.tx - snap1.tx) * 8;
        uplinkRxBps = Math.max(0, snap2.rx - snap1.rx) * 8;
      }
    } catch { /* non-fatal */ }
  }

  return {
    model: ap.model ?? null,
    firmware: ap.version ?? null,
    uptime: ap.uptime ?? null,
    cpuLoad,
    memoryUsed,
    uplinkTxBps,
    uplinkRxBps,
    totalClients: apClients.length,
    ssids,
    clients,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Public entry point
// ══════════════════════════════════════════════════════════════════════════════

export async function checkUnifi(
  apIp: string,
  controllerIp: string,
  auth: UnifiAuth,
  port: number,
  site: string,
  tlsVerify: boolean,
): Promise<UnifiResult> {
  if (auth.method === "userpass") {
    return checkUnifiInform(apIp, controllerIp, auth.username, auth.password, port, site, tlsVerify);
  }
  return checkUnifiApiKey(apIp, controllerIp, auth.apiKey, port, site, tlsVerify);
}
