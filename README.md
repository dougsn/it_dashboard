# WatchIT Tower

Dashboard local para monitoramento centralizado de infraestrutura de TI — Mikrotiks, DVRs, câmeras, switches, APs UniFi/Omada e outros dispositivos de rede. Roda 100% na rede interna, sem dependências de nuvem.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  Next.js App Router (React 19 + shadcn/ui v4)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼─────────────────────────────────────┐
│  Next.js 16 Server                                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐ │
│  │  Middleware  │  │   API Routes    │  │  NextAuth.js v5    │ │
│  │  Auth check  │  │   /api/*        │  │  JWT + TOTP 2FA    │ │
│  │  Rate-limit  │  │   Zod + Prisma  │  │  Token Blacklist   │ │
│  └──────┬───────┘  └────────┬────────┘  └────────────────────┘ │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │ read/write
┌─────────▼──────────────────▼──────────────────────────────────┐
│  PostgreSQL (Docker)                                           │
│  Device · DeviceStatus · StatusHistory · WorkerHeartbeat      │
│  Link · LinkEvent · User · TokenBlacklist · RateLimit         │
│  AuditLog · SystemConfig                                       │
└──────────────────────────────┬─────────────────────────────────┘
                               │ read/write
┌──────────────────────────────▼─────────────────────────────────┐
│  Worker (Node.js separado — npm run worker)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Scheduler — setInterval por dispositivo                 │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌───────────┐  │  │
│  │  │ Ping │ │ HTTP │ │ SNMP │ │RouterOS│ │UniFi/Omada│  │  │
│  └──┴──────┴─┴──────┴─┴──────┴─┴────────┴─┴───────────┴──┘  │
└──────────────────────────────┬─────────────────────────────────┘
                               ▼
              Dispositivos de rede
              Mikrotik · DVR · Câmera · UniFi AP · Omada AP
```

**Modelo de dois processos:** o Next.js serve a UI e as rotas API; o worker roda em paralelo via `npm run dev:all`. O worker emite heartbeat a cada 60s — `/api/health` detecta crash se o heartbeat ficar stale por mais de 3 minutos.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend + API | Next.js App Router | 16.x |
| UI | shadcn/ui v4 (Base UI) + Tailwind CSS | v4 |
| Runtime frontend | React | 19.x |
| Banco de dados | PostgreSQL via Docker | 16 |
| ORM | Prisma | 7.x |
| Autenticação | NextAuth.js v5 beta (JWT, sem sessão no banco) | v5 beta |
| 2FA | TOTP via `otpauth` (compatível com Google Authenticator) | — |
| Worker | Node.js separado (`worker/`) via `tsx` | — |
| Testes | Jest + Testing Library | 30.x |

---

## Pré-requisitos

- Node.js 20 ou superior
- Docker e Docker Compose
- `npm`

---

## Desenvolvimento

### 1. Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://it_dashboard:it_dashboard@localhost:5432/it_dashboard"

# NextAuth — gere um secret seguro: openssl rand -base64 32
NEXTAUTH_SECRET="change-me-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Criptografia de credenciais RouterOS (AES-256-GCM) — exatamente 32 bytes hex
# openssl rand -hex 16
ENCRYPTION_KEY="change-me-in-production"

# Webhook — protege endpoints de UP/DOWN com HMAC-SHA256
# openssl rand -hex 32
WEBHOOK_SECRET="change-me-in-production"
```

### 2. Subir o banco de dados

```bash
docker compose up -d
```

Inicia um container PostgreSQL 16 na porta `5432`. Os dados são persistidos no volume Docker `postgres_data`.

### 3. Aplicar migrations

```bash
npm run db:migrate
```

> **Importante:** `prisma migrate dev` exige TTY. Em `docker exec` ou CI, aplique o SQL manualmente:
> ```bash
> docker compose exec -T postgres psql -U it_dashboard -d it_dashboard -f migration.sql
> npm run db:generate
> ```

### 4. Criar o usuário administrador

```bash
npm run create-user
```

O script solicita nome de usuário e senha interativamente.

### 5. Rodar o projeto

```bash
# Next.js + worker de monitoramento em paralelo (recomendado)
npm run dev:all

# Apenas o Next.js
npm run dev

# Apenas o worker de monitoramento
npm run worker
```

Acesse [http://localhost:3000](http://localhost:3000) e faça login.

---

## Produção

### Variáveis de ambiente

Configure no servidor — **não use valores de desenvolvimento**:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/it_dashboard"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://<ip-ou-hostname>:3000"
ENCRYPTION_KEY="<openssl rand -hex 16>"
WEBHOOK_SECRET="<openssl rand -hex 32>"
```

### Build e inicialização

```bash
docker compose up -d
npm run db:migrate
npm run create-user
npm run build
npm run start:all
```

Para manter o processo vivo após reinicialização:

```bash
npm install -g pm2
pm2 start "npm run start:all" --name watchit-tower
pm2 save && pm2 startup
```

Consulte [docs/deploy-vps.md](docs/deploy-vps.md) para o guia completo de deploy em VPS.

---

## Protocolos de monitoramento

| Protocolo | Dispositivos compatíveis | O que monitora |
|---|---|---|
| **ICMP Ping** | Todos | Latência (ms), disponibilidade |
| **HTTP** | DVRs, câmeras, qualquer device com interface web | Código de resposta HTTP |
| **SNMP v2c** | Switches, roteadores genéricos | CPU%, memória%, uptime |
| **RouterOS API** | Mikrotiks | CPU%, memória%, uptime, tráfego de interfaces |
| **UniFi API** | APs e switches UniFi | Status, clientes conectados, redes Wi-Fi |
| **Omada API** | APs e switches TP-Link Omada | Status, clientes conectados, redes Wi-Fi |

Cada dispositivo pode ter um ou mais protocolos habilitados simultaneamente. O worker executa todos em paralelo via `Promise.allSettled` a cada `checkInterval` segundos (padrão: 60s).

### Tráfego RouterOS

O monitoramento de tráfego usa dois samples de `/interface/print` com intervalo de 1 segundo e calcula `(Δbytes × 8) = bits/segundo`. O comando `/interface/monitor-traffic` é streaming e não aceita `=count=` via API.

---

## Links de internet

Links representam conexões WAN. O worker faz polling a cada 60s via RouterOS API e atualiza tráfego em tempo real.

### Utilização de banda contratada

Cada link pode ter `contractedDownloadBps` / `contractedUploadBps` configurados (em bps). O componente **BandwidthCell** exibe uma barra de progresso colorida:

| Utilização | Cor |
|---|---|
| Abaixo de 70% | Verde |
| 70% a 90% | Âmbar |
| Acima de 90% | Vermelho |

### Webhooks de status

Endpoints de UP/DOWN autenticados por HMAC-SHA256 — projetados para integradores externos (Zabbix, Nagios, scripts):

```bash
# Marcar link como DOWN
curl -X POST https://seu-host/api/links/{id}/down \
  -H "x-webhook-token: <token>"

# Via query string
curl "https://seu-host/api/links/{id}/up?token=<token>"
```

O token é `HMAC-SHA256(WEBHOOK_SECRET, linkId)`. Use `lib/webhook.ts` para gerar tokens.

---

## Banco de dados

```bash
npm run db:migrate       # Aplicar migrations pendentes
npm run db:studio        # Abrir Prisma Studio em http://localhost:5555
npm run db:generate      # Regenerar cliente Prisma após editar schema.prisma
```

### Backup / restore

```bash
# Backup
docker exec it_dashboard_db pg_dump -U it_dashboard it_dashboard > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i it_dashboard_db psql -U it_dashboard it_dashboard < backup.sql
```

### Schema

| Modelo | Descrição |
|---|---|
| `Device` | Configuração do dispositivo (IP, tipo, protocolos, credenciais cifradas, intervalo) |
| `DeviceStatus` | Uma linha por dispositivo — resultado mais recente (upsert a cada checagem) |
| `StatusHistory` | Log append-only de cada checagem, indexado por `(deviceId, timestamp)` |
| `User` | Credenciais de login (bcrypt), campo `version` para optimistic locking |
| `TokenBlacklist` | JWTs invalidados pelo logout ou troca de senha |
| `RateLimit` | Contadores de rate-limit persistidos no banco |
| `Link` | Configuração de link WAN: RouterOS config, banda contratada, tráfego ao vivo |
| `LinkEvent` | Eventos UP/DOWN por link, indexado por `(linkId, timestamp)` |
| `WorkerHeartbeat` | Singleton atualizado a cada 60s pelo worker; lido por `/api/health` |
| `AuditLog` | Registro de CREATE/UPDATE/DELETE/CLEANUP com IP, usuário e payload |
| `SystemConfig` | Configurações de retenção de dados (StatusHistory, LinkEvent) |

---

## Testes

```bash
npm test                   # Todos os testes unitários (~560 testes)
npm run test:watch         # Modo watch
npm run test:coverage      # Com relatório de cobertura
npm run test:integration   # Testes de integração (requer container PostgreSQL)
npm test -- --testPathPatterns="__tests__/api/devices.test.ts"  # Arquivo único
```

| Pasta | O que testa |
|---|---|
| `__tests__/api/` | Rotas de API (devices, links, users, admin, webhooks) |
| `__tests__/worker/` | Monitores: ping, HTTP, SNMP, RouterOS, scheduler, load |
| `__tests__/components/` | Componentes React |
| `__tests__/lib/` | Utilitários: crypto, webhook, format, logger |
| `__tests__/security/` | Enforcement de autenticação em todas as rotas protegidas |
| `__tests__/integration/` | Fluxos end-to-end com banco real (webhook, CRUD de devices) |

---

## Estrutura do projeto

```
app/
  (auth)/login/               # Página de login (pública)
  (dashboard)/                # Área protegida (layout verifica sessão)
    page.tsx                  # Overview: KPIs, saúde do sistema, links, linha do tempo, grid
    devices/[id]/page.tsx     # Detalhe com gráficos de histórico
    devices/page.tsx          # Lista com filtros e status
    links/[id]/page.tsx       # Detalhe do link com tráfego ao vivo
    links/page.tsx            # Gerenciamento de links WAN
    incidents/page.tsx        # Histórico de incidentes
    mikrotik/page.tsx         # Painel RouterOS: interfaces, DHCP, clientes
    omada/page.tsx            # Painel Omada: APs, redes Wi-Fi, clientes
    unifi/page.tsx            # Painel UniFi: APs, redes Wi-Fi, clientes
    reports/page.tsx          # Relatórios exportáveis (PDF/CSV)
    security/page.tsx         # Findings de segurança (SECURITY_REPORT.md)
    manual/page.tsx           # Manual do usuário integrado
    audit/page.tsx            # Logs de alterações com filtros
    users/page.tsx            # Gerenciamento de usuários (admin)
    system/page.tsx           # Configurações do sistema (admin)
    changelog/page.tsx        # Histórico de versões

  api/
    auth/[...nextauth]/       # Handler NextAuth
    auth/logout/              # Invalida o JWT atual (blacklist)
    auth/check-2fa/           # Verifica se o usuário tem TOTP configurado
    devices/                  # GET (suporta ?type=) + POST
    devices/[id]/             # GET, PUT, DELETE
    devices/[id]/export/      # GET exportar dados do dispositivo
    devices/bulk/             # POST criação em massa por faixa de IP
    devices/test-omada/       # POST testar conexão com controller Omada
    devices/test-unifi/       # POST testar conexão com controller UniFi
    status/[deviceId]/        # GET histórico (?hours=24, máx 168)
    health/                   # GET saúde do sistema + liveness do worker
    overview/                 # GET sparklines + segmentos de disponibilidade
    incidents/                # GET incidentes derivados do StatusHistory
    timeline/                 # GET linha do tempo unificada devices + links
    links/                    # GET + POST
    links/[id]/               # GET, PUT, DELETE
    links/[id]/up|down        # Webhooks HMAC-SHA256 (sem sessão)
    links/[id]/events/        # GET histórico de eventos UP/DOWN
    links/test-traffic/       # POST validar conexão RouterOS
    users/                    # GET + POST (admin)
    users/[id]/               # PUT, DELETE (admin)
    users/[id]/totp/          # GET status + POST configurar + DELETE remover TOTP
    reports/                  # GET gerar relatório
    admin/stats/              # GET estatísticas globais
    metrics/                  # GET métricas consolidadas
    version/                  # GET versão e build do sistema

worker/
  index.ts                    # Entry point — fail-fast + SIGTERM/SIGINT + graceful shutdown
  scheduler.ts                # setInterval por device + pollLinks() + WorkerHeartbeat
  monitors/
    ping.ts                   # ICMP via pacote `ping`
    http.ts                   # HTTP fetch
    snmp.ts                   # SNMP v2c via `net-snmp`
    routeros.ts               # RouterOS API via pacote `routeros`
    link-traffic.ts           # Dois samples de /interface/print para calcular bps
    unifi.ts                  # UniFi controller API (credentials)
    unifi-apikey.ts           # UniFi controller API (API key)
    unifi-http.ts             # UniFi via HTTP direto
    unifi-inform.ts           # UniFi Inform protocol
    omada.ts                  # Omada controller API
    alert.ts                  # Disparo de alertas (webhook stale, etc.)

lib/
  db.ts                       # Singleton Prisma client
  auth.ts / auth.config.ts    # Configuração NextAuth
  crypto.ts                   # AES-256-GCM encrypt/decrypt + validateKey()
  webhook.ts                  # HMAC-SHA256 token generation/verification
  totp.ts                     # Geração e verificação de TOTP (2FA)
  audit.ts                    # Helper de escrita no AuditLog
  device-utils.ts             # Utilitários de dispositivo (sanitize, resolve credentials)
  device-colors.ts            # Mapeamento de cores por tipo de dispositivo
  device-tests.ts             # Funções de teste de conectividade por protocolo
  report-builder.ts           # Geração de relatórios (PDF/CSV)
  pdf-export.ts               # Exportação PDF via html2pdf.js
  parse-body.ts               # Wrapper seguro de req.json() (400 em vez de 500)
  logger.ts                   # Log estruturado JSON para o worker
  format.ts                   # formatUptime, formatResponseTime, formatBps, fmtDate
  with-auth.ts                # Helper de autenticação para API routes
  schemas/device.ts           # Zod schemas: create, update, bulk

components/
  sidebar.tsx                 # Navegação lateral com contadores live
  topbar.tsx                  # Header com título, subtítulo e indicador live
  theme-toggle.tsx            # Alternador claro/escuro
  worker-status-banner.tsx    # Banner de alerta quando worker está stale
  device-card.tsx             # Card de status no overview grid
  device-detail-drawer.tsx    # Drawer com detalhes + sparkline de ping
  device-form.tsx             # Formulário criar/editar (react-hook-form + zod)
  device-form-protocols.tsx   # Seção de protocolos no formulário de device
  device-search-input.tsx     # Input de busca de dispositivos
  device-type-badge.tsx       # Badge colorido por tipo
  link-detail-drawer.tsx      # Drawer com uptime 30d + tiles de tráfego ao vivo
  status-badge.tsx            # Badge Online/Offline/Degraded
  bandwidth-cell.tsx          # Barra de utilização de banda com threshold colorido
  report-view.tsx             # Visualização de relatório exportável
  metrics-chart.tsx           # AreaChart Recharts para métricas históricas
  ping-chart.tsx              # Gráfico de histórico de ping
  ping-sparkline.tsx          # Sparkline SVG inline
  confirm-dialog.tsx          # Dialog de confirmação genérico
  countdown-badge.tsx         # Badge com contagem regressiva
  axe-provider.tsx            # Provider de auditoria de acessibilidade (dev only)

hooks/
  use-device-notifications.ts # Hook de notificações de status de dispositivos
  use-polling.ts              # Hook genérico de polling com intervalo

prisma/
  schema.prisma               # Schema do banco
  migrations/                 # Histórico de migrations

scripts/
  create-user.ts              # CLI para criar/atualizar usuário admin
  migrate-credentials.ts      # Migração one-time de credenciais para AES-256-GCM

docs/
  openapi.yaml                # Especificação OpenAPI 3.1 de todas as rotas
  deploy-vps.md               # Guia de deploy em VPS

__tests__/
  api/                        # Testes de rotas de API
  worker/                     # Testes de monitores e scheduler
  components/                 # Testes de componentes React
  lib/                        # Testes de utilitários
  security/                   # Enforcement de autenticação
  integration/                # Testes end-to-end com banco real

middleware.ts                 # Proteção de rotas + rate limiting (10 tentativas/15min por IP)
```

---

## Segurança

O relatório completo está em [SECURITY_REPORT.md](SECURITY_REPORT.md). Pontos críticos:

| Secret | Como gerar | Uso |
|---|---|---|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Assina JWTs de sessão |
| `ENCRYPTION_KEY` | `openssl rand -hex 16` (32 bytes hex) | AES-256-GCM para credenciais RouterOS |
| `WEBHOOK_SECRET` | `openssl rand -hex 32` | HMAC-SHA256 para webhooks de link |

- Credenciais RouterOS são armazenadas criptografadas — o banco nunca contém senhas em texto plano
- JWTs são invalidados no logout e na troca de senha via `TokenBlacklist`
- Rate limiting de login: 10 tentativas por IP em 15 minutos (`middleware.ts`)
- 2FA TOTP disponível por usuário (compatível com Google Authenticator, Authy, etc.)
- Todas as rotas de API (exceto webhooks de link e `/api/auth/*`) exigem sessão JWT válida
- Audit log registra todas as operações com IP e usuário

---

## Adicionar um novo protocolo de monitoramento

1. Crie `worker/monitors/seuprotocolo.ts` retornando uma interface tipada com o resultado
2. Importe e chame em `worker/scheduler.ts` dentro de `runChecks()` via `Promise.allSettled`
3. Mapeie o resultado para o upsert em `DeviceStatus` e insert em `StatusHistory`
4. Adicione campos de enable/config em `prisma/schema.prisma`:
   ```bash
   npm run db:migrate && npm run db:generate
   ```
5. Exponha os campos de toggle e configuração em `components/device-form-protocols.tsx`

---

## API

Documentação completa em [docs/openapi.yaml](docs/openapi.yaml) — formato OpenAPI 3.1.

Para visualizar interativamente, importe em [editor.swagger.io](https://editor.swagger.io) ou use a extensão OpenAPI do VS Code.
