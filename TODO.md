# WatchIT Tower — Roadmap para nota 100

Baseado na avaliação de 78/100 do sistema. Itens ordenados por impacto na nota final.
Cada seção indica a nota atual → meta e os pontos que estão sendo deixados na mesa.

---

## Testes — 74 → 95

Maior gap absoluto. Statements em 46% é o principal limitador.

### Cobertura de código
- [ ] Aumentar cobertura de statements de 46% para 80%+ — foco em `worker/monitors/unifi.ts` (434 linhas, zero cobertura de linha) e páginas de UI (`app/(dashboard)/**`)
- [ ] Cobrir caminho Inform API no `unifi.ts`: autenticação user/pass com CSRF token (login → extract CSRF → request autenticado)
- [ ] Adicionar testes para `app/api/reports/route.ts` (endpoint sem cobertura)
- [ ] Corrigir TS errors pré-existentes em `__tests__/components/ping-chart.test.tsx` e `skeleton-list.test.tsx`

### Novos tipos de teste
- [ ] Testes E2E com Playwright — golden path: login → dashboard → device detail → report PDF
- [ ] Testes de integração com banco real para rotas críticas (usando `testcontainers` ou banco de teste dedicado)
- [ ] Testes de carga mínimos: simular 50 devices com check interval de 10s no worker

---

## Segurança — 76 → 90

### Média prioridade (impacto alto, esforço médio)
- [ ] **SEC-020 parcial**: migrar `script-src` de `'unsafe-inline'` para nonces gerados por requisição — seguir [guia Next.js com nonces](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [ ] **SEC-033**: criptografar `snmpCommunity` com AES-256-GCM, igual às credenciais RouterOS — criar migration Prisma + `snmpCommunityEnc` + adaptar `worker/monitors/snmp.ts`
- [ ] **SEC-027**: adicionar suporte a `X-Webhook-Token` header como alternativa ao query param `?token=` — documentar como preferencial para evitar exposição em logs de proxy
- [ ] **SEC-029**: remover colunas `routerosUser` e `routerosPass` do schema Prisma após confirmar que todos os dispositivos foram migrados — criar migration `DROP COLUMN`

### Baixa prioridade (hardening)
- [ ] **SEC-022**: monitorar saída da versão estável do `next-auth@5` e atualizar quando sair do beta — remover `^` do `package.json` e usar pin exato até lá
- [ ] **SEC-031**: definir `NEXTAUTH_URL` no `.env.example` e na documentação de deploy — elimina risco de host header injection com `trustHost: true`
- [ ] **SEC-026 complemento**: considerar `node-lru-cache` com TTL para substituir o Map do rate limiter — mais robusto que purga manual por threshold
- [ ] Adicionar `Helmet`-equivalente para headers que o Next.js não cobre nativamente (ex: `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`)

---

## Observabilidade — 72 → 90

### Alertas ativos (maior gap funcional)
- [ ] Implementar sistema de notificações: quando dispositivo fica offline por N checks consecutivos, disparar alerta — suporte a pelo menos um canal: webhook configurável (Slack, Teams, Telegram)
- [ ] Adicionar campo `alertWebhookUrl` e `alertThreshold` (ex: 3 checks falhos) ao modelo `Device` no Prisma
- [ ] Worker: após `N` falhas consecutivas, chamar `sendAlert(device, lastStatus)` — incluir cooldown para não spam
- [ ] Notificar quando `workerStatus === "stale"` em `/api/health` — enviar alerta para canal configurado

### Métricas exportáveis
- [ ] Endpoint `GET /api/metrics` em formato Prometheus/OpenMetrics — expor: devices online/offline, ping médio por device, uptime% 24h, worker heartbeat age
- [ ] Documentar como conectar ao Grafana com datasource HTTP

### Rastreamento
- [ ] Logar queries lentas do Prisma (> 500ms) via `$on('query', ...)` em `lib/db.ts`

---

## Performance — 70 → 85

### Paginação (evita degradação com crescimento)
- [ ] `GET /api/devices` — adicionar `?page=&limit=` (padrão 50) com total no header `X-Total-Count`
- [ ] `GET /api/notes` — paginação + filtros por `severity` e `status`
- [ ] `GET /api/links` — paginação

### Cache
- [ ] Adicionar cache em memória com TTL para `GET /api/overview` (dados agregados) — TTL de 15s evita N queries a cada poll de 30s do dashboard
- [ ] Cache para `GET /api/devices` com invalidação no POST/PUT/DELETE

### Dashboard
- [ ] Substituir polling cego de 30s por `ETag` / `Last-Modified` — backend retorna `304 Not Modified` se dados não mudaram, economizando parse e re-render

### Worker
- [ ] Adicionar backoff exponencial para dispositivos com falhas consecutivas — após 5 falhas, reduzir frequência de check para `checkInterval × 4` até voltar online
- [ ] Adicionar semáforo máximo de checks simultâneos para evitar contenção com muitos devices (ex: máx 20 checks em paralelo)

---

## Qualidade de Código — 82 → 92

- [ ] Extrair `worker/monitors/unifi.ts` em submódulos: `unifi-auth.ts`, `unifi-client.ts`, `unifi-ssid.ts` — arquivo de 434 linhas com 3 responsabilidades distintas
- [ ] Extrair função `handleExportPdf` de `app/(dashboard)/reports/page.tsx` para `lib/pdf-export.ts` — ~80 linhas de lógica de domínio dentro de um componente React
- [ ] Corrigir TS errors pré-existentes nos testes (ver seção Testes acima)
- [ ] Adicionar `strict: true` no `tsconfig.json` se ainda não estiver ativo — verificar e habilitar `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`

---

## Documentação — 78 → 95

- [ ] Documentar as 3 rotas ausentes no OpenAPI: `POST /api/reports`, `GET /api/links/{id}/live-traffic`, `POST /api/devices/test-unifi`
- [ ] Atualizar OpenAPI com campos UniFi adicionados na `feat/unifi-ap-integration`: `unifiEnabled`, `unifiAuthMethod`, `unifiApiKey`, `unifiTlsVerify`, `unifiControllerIp`, `unifiSite`, `unifiData` em `DeviceStatus`
- [ ] Criar `CHANGELOG.md` com histórico de versões seguindo [Keep a Changelog](https://keepachangelog.com/)
- [ ] Adicionar `.env.example` com todas as variáveis documentadas (valores de exemplo, sem secrets reais)

---

## Arquitetura — 85 → 93

- [ ] Substituir rate limiter em memória por implementação persistente — opção leve: SQLite via Prisma (sem Redis), opção robusta: Redis com `ioredis`
- [ ] Adicionar `prisma.$on('query', ...)` para detectar N+1 queries em desenvolvimento
- [ ] Avaliar substituição de `setInterval` por fila de jobs leve (ex: `p-queue` com concorrência limitada) — resolve o problema de contenção com muitos devices sem adicionar dependência pesada

---

## Features — 78 → 90

- [ ] **Janelas de manutenção**: campo `maintenanceUntil: DateTime?` no `Device` — worker não gera incidente se o device estiver em manutenção programada
- [ ] **Múltiplos usuários**: adicionar campo `role: "ADMIN" | "VIEWER"` no modelo `User` — viewers veem o dashboard mas não editam devices
- [ ] **Comparação de períodos nos relatórios**: selecionar dois períodos (ex: "semana passada vs semana atual") e mostrar delta de uptime e ping médio
- [ ] **Exportação de histórico**: endpoint `GET /api/devices/{id}/export?format=csv&hours=720` para exportar `StatusHistory` como CSV

---

## DevEx — 88 → 96

- [ ] Adicionar `nodemon` (ou `tsx --watch`) ao worker em desenvolvimento — hoje uma mudança em `worker/` exige reiniciar `npm run dev:all` manualmente
- [ ] Criar `docker-compose.dev.yml` com perfil completo: PostgreSQL + Redis (para quando o rate limiter for migrado)
- [ ] Documentar processo de deploy em VPS Linux (nginx como reverse proxy, systemd units para Next.js e worker, variáveis de ambiente)

---

## Resumo de impacto por esforço

| Prioridade | Item | Esforço | Ganho estimado |
|---|---|---|---|
| 🔴 Alta | Cobertura de testes (statements 46% → 80%) | Grande | +8 pts |
| 🔴 Alta | Sistema de alertas ativos | Grande | +6 pts |
| 🟡 Média | CSP com nonces (remover unsafe-inline) | Médio | +4 pts |
| 🟡 Média | Paginação nos endpoints principais | Médio | +4 pts |
| 🟡 Média | Testes E2E (Playwright) | Médio | +3 pts |
| 🟡 Média | OpenAPI atualizado + 3 rotas faltantes | Pequeno | +3 pts |
| 🟢 Baixa | Criptografar SNMP community | Pequeno | +2 pts |
| 🟢 Baixa | Refatorar unifi.ts | Médio | +2 pts |
| 🟢 Baixa | Backoff exponencial no worker | Pequeno | +2 pts |
| 🟢 Baixa | Métricas Prometheus | Médio | +2 pts |
| 🟢 Baixa | Demais itens | Variado | +4 pts |

**Nota atual: 78 → Nota estimada após todos os itens: 97–99**
