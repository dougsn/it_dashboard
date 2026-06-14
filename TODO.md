# WatchIT Tower — Roadmap de Correções e Melhorias

Plano priorizado derivado da auditoria de 14/06/2026 (backend, frontend, segurança, testes, dependências).
Itens marcados com ✓ foram verificados diretamente no código; os demais devem ser confirmados antes da correção.

**Legenda de prioridade:** 🔴 P0 (crítico/segurança) · 🟠 P1 (alta) · 🟡 P2 (média) · 🔵 P3 (baixa/melhoria)

**Convenção:** cada grupo abaixo mapeia para uma branch (`type/escopo`). Resolver na ordem; não misturar escopos.

---

## 🔴 P0 — Segurança crítica (corrigir primeiro)

### Branch `fix/viewer-authorization` ✅ CONCLUÍDA (SEC-028, SEC-029)
- [x] ✓ **VIEWER obtém webhook tokens e manipula links** — `app/api/links/route.ts`
      `GET /api/links` agora resolve papel via `getSessionRole()`; `webhookToken` só para OPERADOR+.
- [x] ✓ **VIEWER dispara operações de rede e lê tráfego ao vivo** — `requireRole("OPERADOR")` em
      `devices/check`, `devices/[id]/check`, `links/test-traffic`, `links/[id]/live-traffic`.
- [x] **Testes de autorização** — `__tests__/security/viewer-authorization.test.ts` (8 testes: VIEWER→403,
      OPERADOR→ok, webhookToken ausente p/ VIEWER e presente p/ OPERADOR).

### Branch `fix/password-change-revocation` ✅ CONCLUÍDA (SEC-021)
- [x] ✓ **`passwordChangedAt` é controle de segurança morto** — agora gravado no update de senha
      (`app/api/users/[id]/route.ts`) e comparado com `token.iat` no callback `jwt` (`lib/auth.ts`);
      tokens emitidos antes da troca são rejeitados. Testes em `__tests__/api/users-id.test.ts` (16 casos).

---

## 🟠 P1 — Estabilidade e robustez

### Branch `fix/worker-timeouts` ✅ CONCLUÍDA
- [x] ✓ **`runChecks` sem timeout externo** — `worker/scheduler.ts`: helper `withTimeout` (deadline
      `CHECK_TIMEOUT_MS = 30s`) envolve cada check; `db.$transaction(..., { timeout: 5000 })`.
- [x] **SNMP engole erros de rede** — `worker/monitors/snmp.ts`: `getOids` rejeita no erro de request;
      `checkSnmp` loga a falha e mantém o contrato (retorna nulls). Coberto pelo teste existente.
- [x] **RouterOS `conn.close()` no happy-path** — `worker/monitors/routeros.ts`: movido para `finally`.
- [x] **Buffers de resposta sem limite** — `unifi-http.ts` e `omada.ts`: `MAX_RESPONSE_BYTES = 8MB`,
      `req.destroy()` ao exceder.
- [x] **Race de alerta duplicado (TOCTOU)** — `worker/scheduler.ts`: `updateMany` atômico com guarda em
      `lastAlertAt` (cooldown); só envia se `count === 1`.
      _Nota: teste do caminho de alerta (interno a safeRun) movido para `test/coverage-gaps`._

### Branch `fix/frontend-error-handling` ✅ CONCLUÍDA
- [x] ✓ **Sem error boundaries** — criados `app/(dashboard)/error.tsx` (nível de segmento, mantém sidebar)
      e `app/global-error.tsx` (rede de segurança do layout raiz), ambos com botão "Tentar novamente".
- [x] **Loading trava no erro de fetch** — `try/catch/finally` em `page.tsx`, `devices/page.tsx`,
      `incidents/page.tsx` (+ `res.ok` check e toast), `unifi/page.tsx`, `omada/page.tsx`, `devices/[id]/page.tsx`.
- [x] **`fetch` sem checar `res.ok`** — `links/page.tsx` confirmDelete agora valida `res.ok` antes do toast de sucesso.

### Branch `perf/bounded-queries`
- [ ] **Histórico ilimitado em memória** — `incidents/route.ts`, `timeline/route.ts`,
      `lib/report-builder.ts`, `devices/[id]/export/route.ts`
      `findMany` de `StatusHistory` sem `take`; janela de 30d × 100 devices = milhões de linhas.
      Usar `aggregate`/`_avg` no banco e `take` nas subqueries.
- [ ] **Índices ausentes no Prisma** — adicionar `@@index` em `Device.type`, `Link.mikrotikDeviceId`
      (consultado a cada 60s), `AuditLog.ipAddress`. Rodar `db:migrate` + `db:generate`.

---

## 🟡 P2 — Correções médias

### Branch `fix/input-validation`
- [ ] **Datas de query sem validar `isNaN`** — `admin/audit/route.ts`, `audit/export` (Invalid Date → 500/resultado errado).
- [ ] **`parse-body` — Content-Length burlável** — corpo sem header não é limitado; usar `bodySizeLimit` global.
- [ ] **IP do device sem validação de formato no client** — `device-form.tsx:27` usar `z.string().ip()`.

### Branch `fix/credential-exposure`
- [ ] ✓ **`snmpCommunity` legado em texto claro** — `lib/device-utils.ts`
      `sanitizeDevice()` não remove o campo legado; expor `hasSnmpCredentials: boolean`.
- [ ] **Erro interno do PostgreSQL vaza ao cliente** — `admin/stats/route.ts:91` — logar no servidor, retornar msg genérica.
- [ ] **`extractIp` confia cego em `X-Forwarded-For`** — `lib/audit.ts:16` — só confiar atrás de proxy (`TRUST_PROXY`).

### Branch `fix/auth-hardening`
- [ ] **Enumeração via `/api/auth/check-2fa`** — adicionar rate limit por IP; delay artificial p/ usuário inexistente.
- [ ] **Rate limiter TOCTOU** — `auth/rate-check/route.ts` — `upsert` atômico com `increment`, sem `findUnique` prévio.
- [ ] **Validação de env no Next.js** — criar `instrumentation.ts` chamando `validateKey()`/`validateSecret()` no startup.

### Branch `fix/data-fetching-races`
- [ ] **Sem `AbortController` em nenhum poll** — resposta lenta sobrescreve dados frescos (drawer 1h→7d).
      Adicionar `AbortController` + `signal` em cada `load`, abortar no cleanup/poll seguinte.
- [ ] **Cache de `/api/overview` em variável de módulo** — inútil/stale em multi-processo; usar `unstable_cache` ou documentar premissa single-process.

### Branch `fix/forms-ux`
- [ ] **`Select` de tipo não controlado por RHF** — `device-form.tsx:228`, `bulk-device-form.tsx` — usar `value={watch("type")}`.
- [ ] **Double-submit possível** — usar `disabled={loading || isSubmitting}`; `try/finally` nos handlers de
      `users-client.tsx` (create/edit/delete/totp) para não travar o botão.

---

## 🔵 P3 — Baixo impacto, acessibilidade e melhorias

### Branch `fix/a11y-round4`
- [ ] **Cards/linhas clicáveis sem teclado/ARIA** — `<div onClick>` em `page.tsx` (ProblemRow, DeviceOverviewCard),
      `incidents/page.tsx` — usar `<button>` ou `role/tabIndex/onKeyDown`.
- [ ] **Faltam estados ARIA** — `aria-pressed` (FilterChip, botões de janela), `aria-expanded` (seções colapsáveis),
      `aria-sort` (cabeçalhos ordenáveis), `aria-label` no botão voltar do Topbar sem `backLabel`.
- [ ] **Validar CSP nonce em build de produção** — `middleware.ts` gera nonce mas não aparece no código de app;
      o Next.js aplica automaticamente quando está no header CSP — confirmar que scripts carregam em `NODE_ENV=production`.

### Branch `refactor/dedup`
- [ ] **`formatBytes`/`formatBps` duplicados** (3 arquivos) → consolidar em `lib/format.ts`.
- [ ] **`handleTestUnifi`/`handleTestOmada` duplicados** (device-form vs bulk) → hook `useUnifiTest`/`useOmadaTest`.
- [ ] **`MetricTile`/`InfoRow` duplicados** (dois drawers) → `components/drawer-primitives.tsx`.
- [ ] **`SortButton`/`SortBtn` definidos dentro do render** — mover para escopo de módulo (evita remount).

### Branch `refactor/misc`
- [ ] **Busca de IP usa `startsWith`** — `devices/page.tsx:276` — trocar por `includes` (achar octeto do meio).
- [ ] **Badge offline da sidebar congela** — só SSR inicial; atualizar via polling.
- [ ] **`DeviceStatus` guarda JSON sem limite nem pruning** — limitar lista de clientes/leases; podar tabela.
- [ ] **`countdown-badge.tsx` — `rafRef` guarda `setInterval`** — renomear (clareza).

### Branch `test/coverage-gaps`
- [ ] **Zero testes para `/api/users/[id]/totp`** (geração/verificação/criptografia de segredo).
- [ ] **Zero testes para `/api/auth/logout`** (blacklist JWT, idempotência, limpeza de cookie).
- [ ] **Zero testes para `/api/auth/check-2fa`**.
- [ ] **`expect([201, 400]).toContain()`** em `api-auth.test.ts:112` não testa nada — definir comportamento esperado.
- [ ] **`useFakeTimers`/`useRealTimers` sem `afterEach`** — `scheduler-startup.test.ts` — risco de flakiness entre testes.
- [ ] **Caminho de alerta do scheduler sem teste** — `safeRun` (claim atômico `updateMany`, cooldown,
      `sendAlert`); exige fake timers + mock de `@/worker/monitors/alert`.

### Branch `chore/deps`
- [ ] **`next-auth` em beta não pinada** — `package.json` `"^5.0.0-beta.31"` → pin exato (item SEC-025 original).
- [ ] **Patches menores** — `next 16.2.7→16.2.9`, `react 19.2.4→19.2.7`, `react-hook-form 7.77→7.79`, `lucide-react`, `tailwindcss`.
- [ ] **`npm audit`** — 7 vulnerabilidades (postcss via next, XSS no stringify, impacto baixo). NÃO usar
      `audit fix --force` (faz downgrade do Next); aguardar patch upstream do Next.

---

## Itens herdados (já no TODO anterior)

- O pin do `next-auth@5` (acima em `chore/deps`) corresponde ao antigo **SEC-025**.

---

_Última atualização: 2026-06-14 — gerado a partir da auditoria completa de backend, frontend, segurança, testes e dependências._
