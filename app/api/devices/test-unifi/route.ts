import { NextResponse } from "next/server";
import { z } from "zod";
import * as https from "https";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { resolveUnifiApiKey, resolveUnifiCredentials } from "@/lib/crypto";
import { parseBody } from "@/lib/parse-body";

const schema = z.object({
  controllerIp:   z.string().min(1),
  port:           z.number().int().min(1).max(65535),
  site:           z.string().min(1),
  tlsVerify:      z.boolean(),
  authMethod:     z.enum(["apikey", "userpass"]).default("apikey"),
  // API key auth
  apiKey:         z.string().optional(),
  // User/pass auth
  unifiUser:      z.string().optional(),
  unifiPass:      z.string().optional(),
  // Existing device — decrypt stored credentials
  deviceId:       z.string().optional(),
});

// ── Integration API (X-API-KEY) ─────────────────────────────────────────────

const CANDIDATE_BASES = [
  "/proxy/network/integration/v1",
  "/integration/v1",
];

interface SiteItem { id: string; name: string; internalReference?: string }
interface Page<T>  { data?: T[] }

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
    req.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ECONNREFUSED")
        reject(new Error(`Conexão recusada em ${host}:${port} — verifique IP e porta`));
      else if (err.code === "ETIMEDOUT" || err.message.includes("Timeout"))
        reject(new Error(`Timeout ao conectar a ${host}:${port}`));
      else if (["DEPTH_ZERO_SELF_SIGNED_CERT","CERT_HAS_EXPIRED","UNABLE_TO_VERIFY_LEAF_SIGNATURE","ERR_TLS_CERT_ALTNAME_INVALID"].includes(err.code ?? ""))
        reject(new Error("Certificado TLS inválido — desabilite 'Verificar certificado TLS' para aceitar certificados autoassinados"));
      else reject(err);
    });
    req.setTimeout(10_000, () => req.destroy(new Error("Timeout")));
    req.end();
  });
}

async function testApiKey(
  controllerIp: string, port: number, site: string, tlsVerify: boolean, key: string,
) {
  let workingBase: string | null = null;
  let lastError = "";
  const triedPaths: string[] = [];

  for (const base of CANDIDATE_BASES) {
    const path = `${base}/sites`;
    triedPaths.push(path);
    try {
      const { status, body } = await httpsGetApiKey(controllerIp, port, path, key, tlsVerify);
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: `Chave de API inválida ou sem permissão (HTTP ${status})` }, { status: 422 },
        );
      }
      if (status < 400) {
        workingBase = base;
        const sites = (body as Page<SiteItem>).data ?? [];
        const siteObj = sites.find((s) => s.name === site || s.id === site || s.internalReference === site);
        const siteNames = sites.map((s) =>
          s.internalReference && s.internalReference !== s.name
            ? `${s.name} (ref: ${s.internalReference})` : s.name,
        );
        return NextResponse.json({
          ok: true, base: workingBase, sites: siteNames, siteFound: !!siteObj,
          message: sites.length === 0
            ? `Conectado via ${workingBase}. Nenhum site encontrado.`
            : siteObj
              ? `Conectado. Site "${site}" encontrado (${sites.length} site(s) no total).`
              : `Conectado, mas site "${site}" não encontrado. Sites disponíveis: ${siteNames.join(", ")}`,
        });
      }
      lastError = `HTTP ${status} em ${path}`;
    } catch (e) {
      const msg = (e as Error).message;
      if (/inválid|permissão|recusad|Timeout|Certificado/i.test(msg)) {
        return NextResponse.json({ error: msg }, { status: 422 });
      }
      lastError = msg;
    }
  }
  return NextResponse.json(
    { error: `API UniFi não encontrada em ${controllerIp}:${port}. Caminhos tentados: ${triedPaths.join(", ")}. Último erro: ${lastError}. Verifique se o Network Application é versão ≥ 9.3.` },
    { status: 422 },
  );
}

// ── Inform API (username/password) ──────────────────────────────────────────

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
    req.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ECONNREFUSED")
        reject(new Error(`Conexão recusada em ${host}:${port} — verifique IP e porta`));
      else if (err.code === "ETIMEDOUT" || err.message.includes("Timeout"))
        reject(new Error(`Timeout ao conectar a ${host}:${port}`));
      else if (["DEPTH_ZERO_SELF_SIGNED_CERT","CERT_HAS_EXPIRED","UNABLE_TO_VERIFY_LEAF_SIGNATURE","ERR_TLS_CERT_ALTNAME_INVALID"].includes(err.code ?? ""))
        reject(new Error("Certificado TLS inválido — desabilite 'Verificar certificado TLS' para aceitar certificados autoassinados"));
      else reject(err);
    });
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
    req.on("error", reject);
    req.setTimeout(10_000, () => req.destroy(new Error("Timeout")));
    req.end();
  });
}

function extractCsrf(loginRes: { status: number; body: unknown; cookies: string[] }): string | undefined {
  const b = loginRes.body as Record<string, unknown> | null;
  if (b && typeof b.csrf === "string" && b.csrf) return b.csrf;
  if (b && typeof b.csrfToken === "string" && b.csrfToken) return b.csrfToken;
  return undefined;
}

// Inform API path candidates:
//   /proxy/network  — UniFi OS (Cloud Key Gen2+, UDM): Network App proxied
//   (empty)         — standalone Network Application (port 8443)
// UniFi OS native auth (/api/auth/login) is tried separately below.
const INFORM_BASES = ["/proxy/network", ""];

async function testUserPass(
  controllerIp: string, port: number, site: string, tlsVerify: boolean,
  username: string, password: string,
) {
  let lastLoginStatus = 0;

  // Also try UniFi OS native auth endpoint (Cloud Key Gen2+ / UDM)
  const allCandidates: Array<{ loginPath: string; base: string }> = [
    { loginPath: "/api/auth/login", base: "/proxy/network" },
    ...INFORM_BASES.map((base) => ({ loginPath: `${base}/api/login`, base })),
  ];

  for (const { loginPath, base } of allCandidates) {
    let loginRes: { status: number; body: unknown; cookies: string[] };
    try {
      loginRes = await httpsPostJson(
        controllerIp, port, loginPath, { username, password }, tlsVerify,
      );
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 422 });
    }

    // 404 on this path means the base prefix is wrong — try the next candidate
    if (loginRes.status === 404) continue;

    lastLoginStatus = loginRes.status;

    if (loginRes.status !== 200) {
      return NextResponse.json(
        { error: `Credenciais inválidas em ${loginPath} (HTTP ${loginRes.status}) — verifique usuário e senha` },
        { status: 422 },
      );
    }

    const cookie = loginRes.cookies.map((c) => c.split(";")[0]).join("; ");
    if (!cookie) {
      return NextResponse.json({ error: "Login retornou HTTP 200 mas sem cookie de sessão" }, { status: 422 });
    }
    const csrfToken = extractCsrf(loginRes);

    let devRes: { status: number; body: unknown };
    try {
      devRes = await httpsGetCookie(
        controllerIp, port, `${base}/api/s/${site}/stat/device`, cookie, tlsVerify, csrfToken,
      );
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 422 });
    }

    if (devRes.status === 404) {
      return NextResponse.json(
        { error: `Site "${site}" não encontrado. Verifique o nome do site (geralmente "default").` },
        { status: 422 },
      );
    }
    if (devRes.status !== 200) {
      return NextResponse.json(
        { error: `Erro ao consultar dispositivos no site "${site}" (HTTP ${devRes.status})` },
        { status: 422 },
      );
    }

    const devices = ((devRes.body as { data?: unknown[] })?.data ?? []);
    return NextResponse.json({
      ok: true,
      sites: [site],
      siteFound: true,
      message: `Login bem-sucedido via ${base || "/"} (Inform API). ${devices.length} dispositivo(s) encontrado(s) no site "${site}".`,
    });
  }

  return NextResponse.json(
    { error: `Endpoint de login não encontrado (último HTTP ${lastLoginStatus}) — verifique IP e porta do controlador` },
    { status: 422 },
  );
}

// ── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = schema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });

  const { controllerIp, port, site, tlsVerify, authMethod, apiKey, unifiUser, unifiPass, deviceId } = parsed.data;

  if (authMethod === "userpass") {
    let username = unifiUser?.trim() || null;
    let password = unifiPass?.trim() || null;
    if ((!username || !password) && deviceId) {
      const device = await db.device.findUnique({
        where: { id: deviceId },
        select: { unifiUserEnc: true, unifiPassEnc: true },
      });
      if (device) {
        const creds = resolveUnifiCredentials(device);
        if (creds) { username = creds.username; password = creds.password; }
      }
    }
    if (!username || !password) {
      return NextResponse.json({ error: "Informe usuário e senha para testar a conexão" }, { status: 422 });
    }
    return testUserPass(controllerIp, port, site, tlsVerify, username, password);
  }

  // apikey
  let resolvedKey = apiKey?.trim() || null;
  if (!resolvedKey && deviceId) {
    const device = await db.device.findUnique({ where: { id: deviceId }, select: { unifiApiKeyEnc: true } });
    if (device) resolvedKey = resolveUnifiApiKey(device);
  }
  if (!resolvedKey) {
    return NextResponse.json({ error: "Informe a chave de API para testar a conexão" }, { status: 422 });
  }
  return testApiKey(controllerIp, port, site, tlsVerify, resolvedKey);
}
