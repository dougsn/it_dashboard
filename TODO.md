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

### Branch `perf/bounded-queries` ✅ CONCLUÍDA (parcial — ver nota)
- [x] **Índices ausentes no Prisma** — `@@index` em `Device.type`, `Link.mikrotikDeviceId`,
      `AuditLog([ipAddress, timestamp])`. Migração `20260614000000_perf_indexes` aplicada + `db:generate`.
- [x] **`take` seguro onde não muda semântica** — `devices/[id]/export` (cap 100k linhas) e
      `links/[id]/events` (2000 eventos mais recentes, reordenados asc).

### Branch `perf/incident-detection-sql` (separada — refactor arriscado)
- [ ] **Histórico ilimitado em memória** — `incidents/route.ts`, `timeline/route.ts`, `lib/report-builder.ts`
      compartilham o algoritmo `buildIncidents` que exige histórico ordenado completo (detecção de transições
      via `LAG`). Reescrever com query SQL de window function (`$queryRaw`) retornando só transições, e
      reescrever os testes dos três. Queries já são indexadas por `[deviceId, timestamp]` — é memória, não scan.
      Separado de `perf/bounded-queries` por exigir refactor cross-cutting + reescrita de testes.

---

## 🟡 P2 — Correções médias

### Branch `fix/input-validation` ✅ CONCLUÍDA
- [x] **Datas de query sem validar `isNaN`** — `admin/audit/route.ts` e `audit/export`: retornam 400 em data
      inválida. Testes adicionados em `admin-audit.test.ts`.
- [x] **`parse-body` — Content-Length burlável** — agora lê o corpo via `text()` e valida `Buffer.byteLength`
      antes do parse (fecha a brecha de requisição chunked sem header).
- [x] **IP do device sem validação de formato no client** — `device-form.tsx`: regex IPv4 + octetos ≤ 255,
      espelhando o `ipSchema` do servidor.

### Branch `fix/credential-exposure` ✅ CONCLUÍDA (SEC-031, SEC-033, SEC-036)
- [x] ✓ **`snmpCommunity` legado em texto claro** — `sanitizeDevice()` remove `snmpCommunity`+`snmpCommunityEnc`,
      expõe `hasSnmpCredentials`. Campo virou write-only no form. Teste em `devices.test.ts`.
- [x] **Erro interno do PostgreSQL vaza ao cliente** — `admin/stats`: msg genérica, erro logado no servidor.
- [x] **`extractIp` confia cego em `X-Forwarded-For`** — só honra headers com `TRUST_PROXY=true`; documentado em `.env.example`.
- [ ] _Follow-up: `POST /api/devices/bulk` grava community SNMP em texto claro na coluna (criptografia-em-repouso
      não aplicada no bulk). Mover para o padrão `snmpCommunityEnc` como nos demais handlers._

### Branch `fix/auth-hardening` ✅ CONCLUÍDA (SEC-030 aceito, SEC-032, SEC-037)
- [x] **Enumeração via `/api/auth/check-2fa`** (SEC-030) — aceito por design: a feature exige revelar
      `totpEnabled` antes do submit; vazamento de baixo valor (escopo interno). Documentado no handler e no relatório.
- [x] **Rate limiter TOCTOU** (SEC-032) — `auth/rate-check`: `INSERT ... ON CONFLICT DO UPDATE` atômico
      (`$queryRaw`) substitui o `findUnique`+`update`. Teste reescrito.
- [x] **Validação de env no Next.js** (SEC-037) — `instrumentation.ts` chama `validateKey()`/`validateSecret()`
      no `register()` — fail-fast no startup do servidor web.

### Branch `fix/data-fetching-races` ✅ CONCLUÍDA
- [x] **Sem `AbortController` em nenhum poll** — `usePolling` agora cria/aborta `AbortController` por tick;
      `page`, `devices`, `devices/[id]`, `device-detail-drawer` e `link-detail-drawer` propagam o signal e
      ignoram `AbortError`. Corrige a corrida de troca de parâmetro (drawer 1h→7d) e o clobber pós-close.
      Também corrige o `refreshTraffic` ausente nas deps do link-drawer.
- [x] **Cache de `/api/overview` em variável de módulo** — documentado como premissa single-process
      (consistente com SEC-014); migrar para Redis/`unstable_cache` se escalar horizontalmente.

### Branch `fix/forms-ux` ✅ CONCLUÍDA
- [x] **`Select` de tipo não controlado por RHF** — `device-form.tsx` e `bulk-device-form.tsx` agora usam
      `value={deviceType}` (sincroniza com RHF, ex.: reset).
- [x] **Double-submit possível** — `device-form` submit usa `disabled={loading || isSubmitting}`;
      `try/finally` em todos os handlers de `users-client.tsx` (create/edit/delete/totp×3) para nunca
      travar o botão em erro de rede. (profile-client já estava correto.)

---

## 🔵 P3 — Baixo impacto, acessibilidade e melhorias

### Branch `fix/a11y-round4` ✅ CONCLUÍDA
- [x] **Cards/linhas clicáveis sem teclado/ARIA** — ProblemRow, DeviceOverviewCard e linhas de incidente
      agora têm `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Espaço) e foco visível.
- [x] **Faltam estados ARIA** — `aria-pressed` (FilterChip, janelas de incidents), `aria-expanded`
      (clientes/DHCP/histórico em devices/[id]; SSIDs/clientes em unifi), `aria-sort` + texto sr-only
      (SortableHeader de devices), `aria-label="Voltar"` no Topbar; ícones de sort marcados decorativos.
- [x] **CSP nonce validado** — build de produção (`npm run build`) OK; o Next.js injeta o nonce nos
      próprios scripts a partir do header CSP do middleware. Não é bug de produção.

### Branch `refactor/dedup` ✅ CONCLUÍDA (parcial — ver follow-ups)
- [x] **`formatBytes`/`formatBps` duplicados** — `formatBytes` consolidado em `lib/format.ts`; removidas as
      3 cópias locais (devices/[id], unifi, system). `formatBps` local de devices/[id] também removido. +2 testes.
- [x] **`MetricTile`/`InfoRow` duplicados** — extraídos para `components/drawer-primitives.tsx` (versão superset).
- [ ] _Follow-up (cosmético): `SortButton`/`SortBtn` dentro do render → escopo de módulo (exige props nos call sites;
      ganho de perf mínimo em botões triviais)._
- [ ] _Follow-up (risco em form): `handleTestUnifi`/`handleTestOmada` (device-form-protocols vs bulk) → hook
      compartilhado. Adiado por tocar lógica de formulário em dois lugares._

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
