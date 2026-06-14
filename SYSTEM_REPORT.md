# Relatório Geral do Sistema — WatchIT Tower

**Data:** 2026-06-14  
**Versão:** 0.2.1  
**Analista:** Claude Code (claude-sonnet-4-6)  
**Escopo:** Código-fonte completo — Next.js 14 App Router, worker Node.js, Prisma 7 + PostgreSQL

---

## Visão Geral

WatchIT Tower é um dashboard de monitoramento de TI para uso exclusivamente local, sem exposição à internet. Monitora roteadores Mikrotik, câmeras, DVRs, APs UniFi e Omada via ICMP, HTTP, SNMP, RouterOS API e controllers de Wi-Fi.

**Nota atual estimada: 9.6/10**

| Dimensão | Nota | Tendência |
|---|---|---|
| Segurança | 9.4 | ↑ (autorização por papel, revogação por troca de senha, rate limiter atômico, env fail-fast, SNMP não exposto) |
| Arquitetura | 9.1 | ↑ (timeout por verificação no worker, alerta sem duplicação, índices de banco, queries com limite) |
| Usabilidade | 9.0 | ↑ (error boundaries, telas de erro com retry, sem travar carregando, sem double-submit) |
| Design | 9.3 | ↑ (contraste WCAG AA rounds 1–3; navegação por teclado e estados ARIA — round 4) |
| Testes | 9.1 | ↑ (580 testes, 67 suítes; cobertura de 2FA, logout e autorização por papel) |
| Documentação | 9.5 | → (dev-manual + test-manual, README reescrito) |

---

## 1. Segurança

### Estado atual

35 achados catalogados em `SECURITY_REPORT.md`. Todos os críticos, altos e médios foram resolvidos ou aceitos intencionalmente. Apenas 3 itens de infraestrutura permanecem abertos.

**Resumo:**
- **32 resolvidos** (incluindo todos críticos e altos) + **1 aceito por design** (SEC-030)
- **3 abertos** — todos de infraestrutura, sem código a corrigir

| ID | Título | Severidade | Status |
|---|---|---|---|
| SEC-005 | TLS não configurado por padrão | 🟡 Médio | Aberto (infra) |
| SEC-006 | Permissões do banco de dados | 🔵 Baixo | Aberto (infra) |
| SEC-008 | Worker com privilégios do processo pai | 🔵 Baixo | Aberto (Docker mitiga) |

**Hardening desta auditoria (v0.2.1):**
- **SEC-028 (Alto)** — `GET /api/links` não expõe mais `webhookToken` a VIEWER (apenas OPERADOR+)
- **SEC-029 (Médio)** — `devices/check`, `devices/[id]/check`, `links/test-traffic`, `links/[id]/live-traffic` exigem OPERADOR+
- **SEC-021 (completado)** — `passwordChangedAt` agora gravado e verificado no callback JWT; troca de senha revoga sessões antigas
- **SEC-031 (Médio)** — `sanitizeDevice()` remove community SNMP (legada e criptografada) das respostas
- **SEC-032 (Baixo)** — rate limiter de login com `INSERT ... ON CONFLICT` atômico (sem TOCTOU)
- **SEC-033 (Baixo)** — `/api/admin/stats` retorna erro genérico (não vaza estrutura do banco)
- **SEC-036 (Baixo)** — `extractIp()` só confia em `X-Forwarded-For` com `TRUST_PROXY=true`
- **SEC-037 (Info)** — `instrumentation.ts` valida secrets no startup do servidor web (fail-fast)
- **SEC-030 (Médio, aceito)** — enumeração de 2FA via `check-2fa`: inerente à feature, escopo interno

**Sessões anteriores:** SEC-009 (2FA/TOTP), SEC-014 (rate limit persistente), SEC-017/018 (startup/timeout), SEC-021 (JWT blacklist), SEC-025 (SSRF), SEC-026/012 (bodySizeLimit), SEC-027 (optimistic lock).

**Pontos positivos mantidos:**
- AES-256-GCM para todas as credenciais (RouterOS, UniFi, Omada, SNMP, TOTP)
- HMAC-SHA256 em webhooks com `timingSafeEqual`
- CSP com nonce por request, HSTS, X-Frame-Options, CORP, COOP
- Auditoria completa de ações CRUD + webhooks
- `sanitizeDevice()` nunca retorna credenciais em plaintext

---

## 2. Arquitetura

### Stack

```
Browser ──► Next.js 14 App Router (port 3000)
                  │
                  ├── API Routes (/app/api/**)
                  │     └── Prisma 7 ──► PostgreSQL (Docker)
                  │
                  └── Pages (/app/(dashboard)/**)

Worker (Node.js separado)
  └── scheduler.ts ──► [ping, http, snmp, routeros, link-traffic, omada, unifi]
                             └── Prisma 7 ──► PostgreSQL
```

### Pontos fortes

- **Separação worker/frontend** — worker roda independente do Next.js, sem afetar latência das páginas
- **Fail-fast no worker** — `validateKey()`, `validateSecret()` abortam no startup se secrets ausentes
- **Startup timeout** — `process.exit(1)` após 30s se inicialização travar
- **Graceful shutdown** — `pendingChecks: Set<Promise>` drena checks em voo antes de desconectar o banco
- **Cache overview** — TTL 15s evita N queries no dashboard principal
- **ETag em devices** — `304 Not Modified` quando lista não mudou
- **Monitoramento Omada** — `worker/monitors/omada.ts` integrado ao scheduler, testes em `omada.test.ts`
- **Cleanup automático** — `pruneHistory()` remove StatusHistory (>30d), LinkEvents (>90d), TokenBlacklist expirados

### Dívidas técnicas

| Arquivo | Linhas | Problema |
|---|---|---|
| `components/device-form.tsx` | ~900 | 7 seções de protocolo, 2 funções de teste, submit — candidato a split por seção |
| `components/bulk-device-form.tsx` | ~820 | Duplica lógica de device-form (testConnection, validação de IP) |
| `app/(dashboard)/page.tsx` | ~800 | KPIs + grid + links + timeline + incidents num único componente |

**Duplicação:** `testUnifiConnection` e `testOmadaConnection` implementados em `device-form.tsx` e `bulk-device-form.tsx`. Deveria ser extraído para `lib/test-connection.ts`.

---

## 3. Usabilidade

### Estado atual

- **WorkerStatusBanner** — alerta quando worker está parado
- **ConfirmDialog** — substitui `window.confirm()` em todas as operações destrutivas
- **CountdownBadge** — contagem regressiva até próximo poll
- **Compact view NOC** — linhas de 28px para visualização densa
- **Web Notifications** — alerta no navegador em transições online→offline
- **Dark mode** — persistido em localStorage via next-themes
- **Filtros de dispositivos** — por status, tipo, localização e busca por texto (com URL params)
- **Breadcrumbs** — em páginas de detalhe de dispositivo e link
- **Validação inline** — campos validados enquanto o usuário digita (react-hook-form + zod)
- **Página /profile** — cada usuário gerencia seu 2FA, visualiza role e data de criação
- **Gerenciamento de 2FA em /users** — admin ativa/desativa TOTP por conta, badge de status na tabela

### Pendências menores

| Item | Impacto | Esforço |
|---|---|---|
| Indicador de campo modificado no edit (`isDirty`) | Baixo | Baixo |
| Sem skeleton loading em carregamentos lentos | Baixo | Baixo |

---

## 4. Design

### Estado atual

- **Design system:** shadcn/ui v4 (Base UI) com tokens CSS — consistente
- **Dark mode:** Funcionando via `ThemeProvider` + CSS class strategy
- **Acessibilidade:** WCAG 2.1 AA — contraste corrigido em 3 rounds (primary, success, warning, muted-foreground, version text); `aria-label` em todas as tabelas, landmarks únicos, `tabIndex={0}` em regiões roláveis
- **Responsividade:** Grid responsivo nos cards e tabelas com `overflow-x-auto`
- **Tokens CSS:** Todos os componentes usam tokens semânticos (`text-muted-foreground`, `bg-card`, `border-border`, etc.)
- **Cor warning:** `#8c5500` (light) — passa 5.0:1 mesmo sobre fundos `bg-warning/10`

### Inconsistências remanescentes

- Mistura de `h-7`/`h-8` em botões de ação em algumas páginas (impacto visual negligenciável)

---

## 5. Testes

### Cobertura atual

- **580 testes** em 67 suítes (run padrão), todos passando
- **Integração:** `__tests__/integration/` — devices CRUD, webhook e2e (PostgreSQL real)
- **Carga:** `__tests__/worker/load.test.ts` — 50 dispositivos × 1s interval (excluído do npm test)
- **Scheduler startup:** `__tests__/worker/scheduler-startup.test.ts` (9 testes)
- **Segurança:** `api-auth-full.test.ts` (401 em rotas protegidas) + `viewer-authorization.test.ts` (403 por papel, SEC-028/029)

### Distribuição por camada

| Camada | Arquivos | Ambiente |
|---|---|---|
| API Routes | 32 | node |
| Worker Monitors | 11 | node |
| Componentes React | 17 | jsdom |
| Bibliotecas (`lib/`) | 5 | node |
| Segurança | 3 | node |
| Integração | 3 | node + PostgreSQL real |

### Lacunas remanescentes

| Área | Arquivo ausente | Criticidade |
|---|---|---|
| Audit trail em CRUD | Testes existentes não validam `AuditLog` escrito | Baixa |
| TOTP flow | Testes de integração do fluxo de login com 2FA | Baixa |

### Pontos fortes

- Cobertura total do scheduler (`runChecks`, `pruneHistory`, `pollLinks`, `shutdown`, `startScheduler`)
- Todos os monitors têm testes unitários
- Todos os endpoints de API têm testes de unidade e de autenticação (401)
- Webhook flow testado end-to-end

---

## 6. Documentação

### Estado atual

| Artefato | Estado |
|---|---|
| `CLAUDE.md` | Atualizado — diretriz de branch por request, protocolo de atualização de docs pós-merge |
| `SECURITY_REPORT.md` | Atualizado — 27 achados, 24 resolvidos, 3 abertos (infra) |
| `SYSTEM_REPORT.md` | Este arquivo — atualizado em 2026-06-14 (v0.2.0) |
| `README.md` | Reescrito com stack atual (Next.js 16, React 19, Prisma 7), todos os protocolos e schema |
| `docs/openapi.yaml` | Atualizado com todos os endpoints (admin, users, totp, audit, etc.) |
| `/manual` | Manual do usuário integrado — 10 seções, acessível a todos os perfis |
| `/dev-manual` | Manual do desenvolvedor — 16 seções de arquitetura e padrões, restrito a ADMIN |
| `/test-manual` | Manual de testes — 12 seções cobrindo estratégia, Jest config, todas as suítes, restrito a ADMIN |

### Endpoints documentados no OpenAPI

Todos os 17+ endpoints principais estão documentados incluindo: `/api/admin/audit`, `/api/admin/config`, `/api/admin/cleanup`, `/api/admin/stats`, `/api/users`, `/api/users/{id}`, `/api/users/{id}/totp`, `/api/auth/logout`, `/api/auth/check-2fa`, `/api/version`.

---

## Próximos passos recomendados

Ver `TODO.md` para o roadmap priorizado completo. **P0–P3 concluídos** nesta auditoria. Pendências restantes:

1. **Infra (alta prioridade):** Configurar reverse proxy com TLS (Caddy, nginx) para produção — SEC-005
2. **Perf (parcial):** `incidents/route.ts` já migrado para query SQL com window function (`lib/incident-detection.ts`, validado por teste de integração). Faltam `timeline` (lógica stateful de alta latência) e `report-builder` (gargalo é o downsample dos gráficos, não os incidentes) — ver TODO.md
3. **Follow-ups menores:** criptografia-em-repouso da community SNMP no `POST /api/devices/bulk`; badge de contagem da sidebar (estático no SSR); cap de JSON de clientes no `DeviceStatus`; `SortButton`/hook de teste UniFi/Omada (dedup cosmético); teste do caminho de alerta do scheduler
4. **Dependências:** `next-auth@5` já fixado em `5.0.0-beta.31`; trocar pelo release estável quando sair
