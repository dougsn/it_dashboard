import * as https from "https";
import * as http from "http";

// Cap controller responses to avoid buffering an unbounded payload in worker memory.
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024; // 8 MB

export interface OmadaSSID {
  ssid: string;
  band: string;
  channel: string | null;
  clients: number;
}

export interface OmadaClient {
  id: string;
  name: string;
  mac: string;
  ip: string | null;
  signal: number | null;
  snr: number | null;
  ssid: string | null;
  band: string | null;
  wifiMode: number | null; // 4=Wi-Fi 4 (n), 5=Wi-Fi 5 (ac), 6=Wi-Fi 6 (ax)
  uptime: number | null;   // seconds connected
}

export interface OmadaResult {
  model: string | null;
  firmware: string | null;
  uptime: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
  uplinkTxBps: number | null;
  uplinkRxBps: number | null;
  totalClients: number;
  ssids: OmadaSSID[];
  clients: OmadaClient[];
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function normalizeNetworkError(err: NodeJS.ErrnoException, host: string): Error {
  if (err.code === "ECONNREFUSED")
    return new Error(`Conexão recusada em ${host} — verifique IP`);
  if (err.code === "ETIMEDOUT" || err.message.includes("Timeout"))
    return new Error(`Timeout ao conectar a ${host}`);
  if (
    ["DEPTH_ZERO_SELF_SIGNED_CERT", "CERT_HAS_EXPIRED", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "ERR_TLS_CERT_ALTNAME_INVALID"].includes(
      err.code ?? "",
    )
  )
    return new Error(
      "Certificado TLS inválido — desabilite 'Verificar certificado TLS' para aceitar certificados autoassinados",
    );
  return err;
}

function rawRequest(
  host: string,
  port: number,
  path: string,
  method: "GET" | "POST",
  bodyStr: string | undefined,
  allHeaders: Record<string, string>,
  tlsVerify: boolean,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: host, port, path, method, headers: allHeaders, rejectUnauthorized: tlsVerify },
      (res) => {
        const status = res.statusCode ?? 0;
        let raw = "";
        res.on("data", (c: string) => {
          raw += c;
          if (raw.length > MAX_RESPONSE_BYTES) req.destroy(new Error(`Resposta excedeu ${MAX_RESPONSE_BYTES} bytes`));
        });
        res.on("end", () => {
          try { resolve({ status, body: JSON.parse(raw) }); }
          catch { resolve({ status, body: null }); }
        });
      },
    );
    req.on("error", (err: NodeJS.ErrnoException) =>
      reject(normalizeNetworkError(err, host)),
    );
    req.setTimeout(10_000, () => req.destroy(new Error("Timeout")));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function apiRequest(
  host: string,
  port: number,
  path: string,
  method: "GET" | "POST",
  body: unknown | null,
  headers: Record<string, string>,
  tlsVerify: boolean,
): Promise<{ status: number; body: unknown }> {
  const bodyStr = body != null ? JSON.stringify(body) : undefined;
  const allHeaders: Record<string, string> = { Accept: "application/json", ...headers };
  if (bodyStr) {
    allHeaders["Content-Type"] = "application/json";
    allHeaders["Content-Length"] = String(Buffer.byteLength(bodyStr));
  }
  return rawRequest(host, port, path, method, bodyStr, allHeaders, tlsVerify);
}

// ── Northbound API types ──────────────────────────────────────────────────────

interface TokenResponse {
  errorCode: number;
  result?: { accessToken: string; expiresIn: number; refreshToken: string };
}

interface DeviceItem {
  mac: string;
  ip?: string;
  name?: string;
  model?: string;
  modelName?: string;
  firmwareVersion?: string;
  uptime?: number;
  cpuUtil?: number;
  memUtil?: number;
  download?: number;
  upload?: number;
  clientNum?: number;
  status?: number;
  type?: string;
}

interface ClientItem {
  mac: string;
  hostName?: string;
  ip?: string;
  rssi?: number;
  snr?: number;
  ssid?: string;
  radioId?: number; // 0=2.4GHz 1=5GHz 2=6GHz
  apMac?: string;
  channel?: number;
  rxRate?: number; // bps — client receiving from AP (= AP downlink)
  txRate?: number; // bps — client transmitting to AP (= AP uplink)
  wifiMode?: number;
  uptime?: number;       // seconds connected
  trafficDown?: number;  // cumulative bytes
  trafficUp?: number;    // cumulative bytes
}


function parseUptimeSeconds(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val !== "string") return null;
  // e.g. "6day(s) 9h 17m 13s"
  let s = 0;
  const d = val.match(/(\d+)\s*day/i);
  const h = val.match(/(\d+)\s*h/i);
  const m = val.match(/(\d+)\s*m/i);
  const sc = val.match(/(\d+)\s*s/i);
  if (d) s += parseInt(d[1]) * 86400;
  if (h) s += parseInt(h[1]) * 3600;
  if (m) s += parseInt(m[1]) * 60;
  if (sc) s += parseInt(sc[1]);
  return s > 0 ? s : null;
}

function bandLabel(id: number): string {
  if (id === 0) return "2.4 GHz";
  if (id === 1) return "5 GHz";
  if (id === 2) return "6 GHz";
  return `Band ${id}`;
}

// ── Shared auth helper ────────────────────────────────────────────────────────

export async function getOmadaToken(
  controllerIp: string,
  omadacId: string,
  clientId: string,
  clientSecret: string,
  tlsVerify: boolean,
  port = 443,
): Promise<string> {
  const res = await apiRequest(
    controllerIp, port,
    `/openapi/authorize/token?grant_type=client_credentials`,
    "POST",
    { omadacId, client_id: clientId, client_secret: clientSecret },
    {},
    tlsVerify,
  );
  const body = res.body as TokenResponse;
  if (res.status !== 200 || body.errorCode !== 0 || !body.result?.accessToken) {
    const code = body?.errorCode ?? res.status;
    if (code === -44106) throw new Error("client_id ou client_secret inválidos");
    throw new Error(`Falha na autenticação Omada (código ${code})`);
  }
  return body.result.accessToken;
}

// ── Utility: list sites (used by test-omada route) ────────────────────────────

export async function listOmadaSites(
  controllerIp: string,
  omadacId: string,
  token: string,
  tlsVerify: boolean,
  port = 443,
): Promise<Array<{ siteId: string; name: string }>> {
  const res = await apiRequest(
    controllerIp, port,
    `/openapi/v1/${omadacId}/sites?page=1&pageSize=100`,
    "GET", null,
    { Authorization: `AccessToken=${token}` },
    tlsVerify,
  );
  const data =
    (res.body as { result?: { data?: Array<{ siteId: string; name: string }> } })?.result?.data ?? [];
  return data.map((s) => ({ siteId: s.siteId, name: s.name }));
}

// Resolve a site's API id from its display name. Used by the worker to self-heal
// devices created in bulk, where only the site name was stored (omadaSiteId empty).
// Matches the name case-insensitively; if no name matches but the controller has
// exactly one site, falls back to it (the common single-site case — the bulk form's
// "default" placeholder rarely matches the real site name). Returns null otherwise.
export async function resolveOmadaSiteId(
  controllerIp: string,
  omadacId: string,
  clientId: string,
  clientSecret: string,
  siteName: string,
  tlsVerify: boolean,
  port = 443,
): Promise<{ siteId: string; name: string; matchedByName: boolean } | null> {
  const token = await getOmadaToken(controllerIp, omadacId, clientId, clientSecret, tlsVerify, port);
  const sites = await listOmadaSites(controllerIp, omadacId, token, tlsVerify, port);
  const target = siteName.trim().toLowerCase();
  const byName = sites.find((s) => s.name.trim().toLowerCase() === target);
  if (byName) return { siteId: byName.siteId, name: byName.name, matchedByName: true };
  if (sites.length === 1) return { siteId: sites[0].siteId, name: sites[0].name, matchedByName: false };
  return null;
}

// ── Main monitor ──────────────────────────────────────────────────────────────

export async function checkOmada(
  apIp: string,
  controllerIp: string,
  omadacId: string,
  clientId: string,
  clientSecret: string,
  siteId: string,
  tlsVerify: boolean,
  port = 443,
): Promise<OmadaResult> {
  // 1. Obtain access token
  const token = await getOmadaToken(controllerIp, omadacId, clientId, clientSecret, tlsVerify, port);
  const authHeaders = { Authorization: `AccessToken=${token}` };

  // 2. Fetch devices list and clients list in parallel — neither depends on the other
  const [devicesRes, clientsRes] = await Promise.all([
    apiRequest(controllerIp, port,
      `/openapi/v1/${omadacId}/sites/${siteId}/devices?page=1&pageSize=200`,
      "GET", null, authHeaders, tlsVerify),
    apiRequest(controllerIp, port,
      `/openapi/v1/${omadacId}/sites/${siteId}/clients?page=1&pageSize=200&clientType=0`,
      "GET", null, authHeaders, tlsVerify),
  ]);

  const devices: DeviceItem[] =
    (devicesRes.body as { result?: { data?: DeviceItem[] } })?.result?.data ?? [];

  const ap =
    devices.find((d) => d.ip === apIp) ??
    (devices.length === 1 ? devices[0] : undefined);

  if (!ap) {
    throw new Error(
      `AP com IP ${apIp} não encontrado no site (${devices.length} dispositivo(s) no site)`,
    );
  }

  const allClients: ClientItem[] =
    (clientsRes.body as { result?: { data?: ClientItem[] } })?.result?.data ?? [];
  const apClients = ap.mac
    ? allClients.filter((c) => c.apMac === ap.mac)
    : allClients;

  // 5. Aggregate per-client rates to estimate AP throughput.
  //    rxRate = client receiving from AP (AP downlink); txRate = client sending to AP (AP uplink).
  let downlinkBps = 0;
  let uplinkBps   = 0;
  for (const c of apClients) {
    downlinkBps += c.rxRate ?? 0;
    uplinkBps   += c.txRate ?? 0;
  }

  // 6. Build SSID summary from connected clients
  // Track bands and channels per radioId so multi-band SSIDs show "1 / 149" for channel.
  const ssidMap = new Map<string, { clients: number; bandChannels: Map<number, number> }>();
  for (const c of apClients) {
    if (!c.ssid) continue;
    if (!ssidMap.has(c.ssid)) ssidMap.set(c.ssid, { clients: 0, bandChannels: new Map() });
    const entry = ssidMap.get(c.ssid)!;
    entry.clients++;
    if (c.radioId != null && c.channel != null) {
      entry.bandChannels.set(c.radioId, c.channel);
    }
  }
  const ssids: OmadaSSID[] = Array.from(ssidMap.entries()).map(([ssid, { clients, bandChannels }]) => {
    const sortedRadios = [...bandChannels.keys()].sort();
    return {
      ssid,
      band:    sortedRadios.length > 0 ? sortedRadios.map(bandLabel).join(" / ")             : "—",
      channel: sortedRadios.length > 0 ? sortedRadios.map((r) => bandChannels.get(r)!).join(" / ") : null,
      clients,
    };
  });

  const clients: OmadaClient[] = apClients.map((c) => ({
    id: c.mac,
    name: c.hostName ?? c.mac,
    mac: c.mac,
    ip: c.ip ?? null,
    signal: c.rssi ?? null,
    snr: c.snr ?? null,
    ssid: c.ssid ?? null,
    band: c.radioId != null ? bandLabel(c.radioId) : null,
    wifiMode: c.wifiMode ?? null,
    uptime: c.uptime ?? null,
  }));

  return {
    model:        ap.modelName ?? ap.model ?? null,
    firmware:     ap.firmwareVersion ?? null,
    uptime:       parseUptimeSeconds(ap.uptime),
    cpuLoad:      ap.cpuUtil ?? null,
    memoryUsed:   ap.memUtil ?? null,
    uplinkTxBps:  uplinkBps   > 0 ? uplinkBps   : null,
    uplinkRxBps:  downlinkBps > 0 ? downlinkBps : null,
    totalClients: apClients.length,
    ssids,
    clients,
  };
}

// Keep http import alive for test mocking (jest.mock("http", ...))
void http;
