# Changelog

Todas as mudanças notáveis do WatchIT Tower são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Unreleased]

---

## [0.7.0] — 2026-06-13 — Bloco C: PDF Export + Alerta Worker Stale

### Adicionado
- `lib/pdf-export.ts` com `exportToPdf(element: HTMLElement)` — extração das ~150 linhas de lógica de PDF de `reports/page.tsx`; rasterização de SVG, resolução de cores oklch→rgb e geração html2pdf encapsuladas em função pura
- `GET /api/health`: alerta de worker stale via webhook configurável (`WORKER_STALE_WEBHOOK_URL`); disparo fire-and-forget com cooldown de 1 hora, sem afetar a resposta da rota
- `WORKER_STALE_WEBHOOK_URL` documentado no `.env.example`

### Alterado
- `reports/page.tsx`: `handleExportPdf` reduzido a wrapper de 6 linhas que delega para `exportToPdf`

---

## [0.6.0] — 2026-06-13 — Bloco A/B: Documentação & Headers de Segurança

### Adicionado
- `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Resource-Policy: same-origin` em `next.config.ts`
- `E2E_BASE_URL`, `E2E_USERNAME`, `E2E_PASSWORD` no `.env.example` (para testes Playwright)
- OpenAPI atualizado com `GET /api/metrics` (formato Prometheus), paginação (`page`, `limit`, `X-Total-Count`) em `/api/devices`, `/api/links` e `/api/notes`, filtros `?severity=` e `?status=` em `/api/notes`
- OpenAPI: campos `alertWebhookUrl`, `alertThreshold`, `lastAlertAt` no schema `Device` e `alertWebhookUrl`, `alertThreshold` no `DeviceInput`
- OpenAPI: `routerosUser`/`routerosPass` marcados como `deprecated: true` no `DeviceInput`
- OpenAPI: header `ETag` documentado em `GET /api/devices`
- `CHANGELOG.md` com histórico completo em formato Keep a Changelog (v0.1.0–v0.6.0)

---

## [0.5.0] — 2026-06-13 — Fase 4: Performance & Qualidade

### Adicionado
- Cache em memória com TTL de 15 s para `GET /api/overview` — reduz N queries a cada poll de 30 s do dashboard
- ETag via `aggregate(count + maxUpdatedAt)` em `GET /api/devices` — retorna `304 Not Modified` sem buscar dados quando nada mudou
- Semáforo de concorrência no worker (máx 20 checks simultâneos) — evita contenção de rede/banco com muitos devices
- `prisma.$on('query')` em desenvolvimento: `console.warn` para queries ≥ 500 ms

### Corrigido
- `role: "ADMIN"` ausente nos `FAKE_SESSION` de testes — causava 403 em rotas com `requireRole("OPERADOR")`
- Mock `db.device.aggregate` faltante em `devices.test.ts` e `api-auth.test.ts`
- `resetOverviewCache()` exportado para evitar contaminação entre testes do `overview.test.ts`
- Assinatura `GET(_req: Request)` em `/api/overview/route.ts` para aceitar argumento sem usar

---

## [0.4.0] — 2026-06-13 — Fase 3: Hardening & Refatoração

### Adicionado
- CSP por requisição com nonce + `'strict-dynamic'` no `middleware.ts` — remove `'unsafe-inline'` do `script-src` em produção (SEC-020)
- Rate limiter migrado de `Map` manual para `LRUCache` (TTL 15 min, cap 10 k IPs) — Edge Runtime compatible (SEC-026)
- `GET /api/metrics` em formato Prometheus/OpenMetrics: devices online/offline, uptime 24 h, worker heartbeat age, ping médio por device
- Testes E2E com Playwright: login → dashboard (usa Chrome do sistema via `channel: 'chrome'`)
- `worker/monitors/unifi.ts` refatorado em três submódulos:
  - `unifi-http.ts` — primitivas HTTPS (`httpsGetApiKey`, `httpsPostJson`, `httpsGetCookie`, `normalizeNetworkError`)
  - `unifi-apikey.ts` — Integration API v1 (`discoverBase`, `checkUnifiApiKey`)
  - `unifi-inform.ts` — Inform API user/pass com login multi-path e CSRF (`checkUnifiInform`)
- Tabela `RateLimit` no schema Prisma (para futura persistência do rate limiter fora do Edge Runtime)

### Alterado
- `next.config.ts`: `Content-Security-Policy` removido dos headers estáticos — agora gerado dinamicamente no middleware com nonce por request
- `unifi.ts` convertido em entry point: re-exporta tipos e funções dos submódulos

---

## [0.3.0] — 2026-06-13 — Fase 2: Funcionalidades & Observabilidade

### Adicionado
- **SEC-033**: campo `snmpCommunityEnc` no model `Device` — `snmpCommunity` agora criptografado com AES-256-GCM; `resolveSnmpCommunity()` em `lib/crypto.ts`
- Backoff exponencial no worker: após 5 falhas consecutivas, o check é pausado por `checkInterval × 4` segundos; recuperação automática ao voltar online
- Sistema de alertas por webhook: `alertWebhookUrl` + `alertThreshold` + `lastAlertAt` no model `Device`; cooldown de 1 hora entre disparos; `worker/monitors/alert.ts`
- Paginação opt-in (`?page=&limit=`) com header `X-Total-Count` em `GET /api/devices`, `GET /api/notes` e `GET /api/links`
- Filtros `?severity=` e `?status=` em `GET /api/notes`
- Testes para `app/api/reports/route.ts` (20 casos, 96 % de cobertura de statements)
- Constantes exportadas `BACKOFF_THRESHOLD = 5` e `BACKOFF_MULTIPLIER = 4` em `scheduler.ts`

### Alterado
- `lib/crypto.ts`: `resolveRouterosCredentials` não aceita mais campos plaintext; adicionado `resolveSnmpCommunity`
- `components/device-form.tsx`: campos `alertWebhookUrl` e `alertThreshold` adicionados ao formulário

---

## [0.2.0] — 2026-06-11 — Fase 1: Quick Wins de Segurança & Qualidade

### Adicionado
- `lib/parse-body.ts`: wrapper `parseBody()` que retorna `400` em vez de `500` em JSON malformado
- `lib/with-auth.ts`: helpers `requireAuth()` e `requireRole(minRole)` usados em todas as rotas
- `lib/audit.ts`: `writeAudit()` registra ações CREATE/UPDATE/DELETE com usuário e detalhes
- `lib/webhook.ts`: `generateWebhookToken()` e `verifyWebhookToken()` com `timingSafeEqual` (SEC-015)
- Validação fail-fast em `worker/index.ts`: `validateKey()` e `validateSecret()` abortam o worker se secrets estiverem ausentes ou fracos
- `sanitizeDevice()` em `lib/device-utils.ts`: strip de todos os campos de credencial em respostas de API
- Graceful shutdown no worker: `SIGTERM`/`SIGINT` → `shutdown()` drena checks em andamento antes de `db.$disconnect()`
- Worker heartbeat: upsert de `WorkerHeartbeat` a cada 60 s; `/api/health` reporta `workerStatus: "ok" | "stale" | "unknown"`
- Structured logging com `lib/logger.ts`: JSON no stdout, nunca `console.log` direto no worker

### Corrigido
- Credenciais RouterOS migradas de plaintext para AES-256-GCM (`routerosUserEnc`, `routerosPassEnc`); `scripts/migrate-credentials.ts`
- Rate limiting em `middleware.ts`: 10 tentativas / 15 min por IP no endpoint de login

---

## [0.1.0] — Histórico de features principais

### Adicionado
- Dashboard de overview com KPIs, grade de devices, tabela de links, timeline de incidentes
- Monitoring worker com checks paralelos: Ping, HTTP, SNMP, RouterOS, UniFi AP, Omada AP
- Autenticação JWT com NextAuth.js v5; roles ADMIN / OPERADOR / VIEWER
- Página de devices com tabela, filtros, drawer de detalhes, sparkline de ping
- Página de links com utilização de banda (progress bar verde/âmbar/vermelho vs. capacidade contratada)
- Página de incidents derivada de `StatusHistory`
- Notas de segurança/operacionais com severidade e status
- Relatórios PDF por device (html2pdf.js)
- Bulk import de devices por faixa de IP
- Webhooks UP/DOWN para links externos (Zabbix, Nagios, scripts)
- Sistema de auditoria de alterações
- Controle de retenção de histórico (`SystemConfig`: `statusHistoryDays`, `linkEventDays`)
- Página de sistema com métricas do banco e controle de retenção
- Suporte a Omada AP (autenticação OAuth2 client_credentials)
- OpenAPI 3.1 spec em `docs/openapi.yaml`
