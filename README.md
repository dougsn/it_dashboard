# WatchIT Tower Monitoramento

Dashboard local para monitoramento centralizado de infraestrutura de TI — Mikrotiks, DVRs, câmeras, switches e outros dispositivos de rede. Roda 100% na rede interna, sem dependências de nuvem.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend + API | Next.js (App Router) | 16.x |
| UI | shadcn/ui v4 (Base UI) + Tailwind CSS | v4 |
| Banco de dados | PostgreSQL via Docker | 16 |
| ORM | Prisma | 7.x |
| Autenticação | NextAuth.js (JWT, sem sessão no banco) | v5 beta |
| Worker de monitoramento | Node.js separado (`worker/`) via `tsx` | — |
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

# Webhook — gere um secret seguro: openssl rand -hex 32
# Usado para autenticar chamadas de UP/DOWN de links externos (ex: Zabbix, scripts)
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

> **Importante:** `prisma migrate dev` exige TTY. Se estiver rodando via `docker exec` ou em CI, aplique o SQL manualmente:
> ```bash
> docker compose exec -T postgres psql -U it_dashboard -d it_dashboard -f migration.sql
> npm run db:generate
> ```

### 4. Criar o usuário administrador

```bash
npm run create-user
```

O script solicitará nome de usuário e senha interativamente.

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

### 6. Popular notas de segurança (opcional)

```bash
npm run seed:security
```

Cria 12 findings de segurança pré-definidos na aba **Notas & Segurança**.

---

## Produção

### 1. Variáveis de ambiente

Configure no servidor — **não use valores de desenvolvimento**:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/it_dashboard"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://<ip-ou-hostname>:3000"
WEBHOOK_SECRET="<openssl rand -hex 32>"
ENCRYPTION_KEY="<openssl rand -hex 16>"
```

### 2. Banco de dados e build

```bash
docker compose up -d
npm run db:migrate
npm run create-user
npm run build
```

### 3. Iniciar em produção

```bash
npm run start:all
```

Para manter o processo vivo após reinicialização, use um process manager:

```bash
npm install -g pm2
pm2 start "npm run start:all" --name watchit-tower
pm2 save
pm2 startup
```

---

## Protocolos de monitoramento

| Protocolo | Dispositivos compatíveis | O que monitora |
|---|---|---|
| **ICMP Ping** | Todos | Latência (ms), disponibilidade (online/offline) |
| **HTTP** | DVRs, câmeras, qualquer device com interface web | Status HTTP (código de resposta) |
| **SNMP v2c** | Switches, roteadores genéricos | CPU%, memória%, uptime |
| **RouterOS API** | Mikrotiks | CPU%, memória%, uptime, tráfego de interfaces |

Cada dispositivo pode ter um ou mais protocolos habilitados simultaneamente. O worker executa todos em paralelo via `Promise.allSettled` a cada `checkInterval` segundos (padrão: 60s).

### Tráfego RouterOS

O monitoramento de tráfego em links Mikrotik usa dois samples de `/interface/print` com intervalo de 1 segundo e calcula `(Δbytes × 8) = bits/segundo`. O comando `/interface/monitor-traffic` é streaming e não aceita `=count=` via API, por isso o método de dois samples é usado.

---

## Links de internet monitorados

Links representam conexões WAN com configuração de banda contratada. O worker faz polling a cada 60s via RouterOS API e atualiza os campos de tráfego em tempo real.

### Campos de banda contratada

Cada link pode ter `contractedDownloadBps` e `contractedUploadBps` configurados manualmente (em bps). O componente **BandwidthCell** exibe uma barra de progresso colorida:

| Utilização | Cor |
|---|---|
| Abaixo de 70% | Verde |
| 70% a 90% | Âmbar |
| Acima de 90% | Vermelho |

### Webhooks de status

Links podem receber notificações externas de UP/DOWN via webhook autenticado por HMAC-SHA256:

```bash
# Marcar link como DOWN
curl -X POST https://seu-host/api/links/{id}/down \
  -H "x-webhook-token: <token>"

# Ou via query string
curl "https://seu-host/api/links/{id}/up?token=<token>"
```

O token é gerado com `WEBHOOK_SECRET + linkId` via HMAC-SHA256. Use `lib/webhook.ts` para gerar tokens.

---

## Banco de dados

### Comandos

```bash
npm run db:migrate       # Aplicar migrations pendentes
npm run db:studio        # Abrir Prisma Studio em http://localhost:5555
npm run db:generate      # Regenerar cliente Prisma após editar schema.prisma
```

### Backup

```bash
docker exec it_dashboard_db pg_dump -U it_dashboard it_dashboard > backup_$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
docker exec -i it_dashboard_db psql -U it_dashboard it_dashboard < backup.sql
```

### Schema resumido

| Modelo | Descrição |
|---|---|
| `Device` | Configuração do dispositivo (IP, tipo, protocolos, credenciais, intervalo de checagem) |
| `DeviceStatus` | Uma linha por dispositivo — resultado mais recente (upsert a cada checagem) |
| `StatusHistory` | Log append-only de cada checagem, indexado por `(deviceId, timestamp)` |
| `User` | Credenciais do login (senha com bcrypt) |
| `Note` | Notas de segurança/operacionais com severidade e status de resolução |
| `Link` | Configuração de link WAN: RouterOS config, banda contratada, tráfego ao vivo |
| `LinkEvent` | Eventos UP/DOWN por link, indexado por `(linkId, timestamp)` |

---

## Testes

```bash
npm test                  # Todos os testes
npm run test:watch        # Modo watch
npm run test:coverage     # Com relatório de cobertura
```

Cobertura por camada:

| Pasta | O que testa |
|---|---|
| `__tests__/lib/` | Utilitários de formatação (`formatUptime`, `formatResponseTime`, `formatPercent`) |
| `__tests__/api/` | Rotas de API (devices, status, notes) |
| `__tests__/worker/` | Monitores: ping, HTTP, SNMP, RouterOS |
| `__tests__/components/` | Componentes React |
| `__tests__/security/` | Enforcement de autenticação em todas as rotas protegidas |

---

## Estrutura do projeto

```
app/
  (auth)/login/               # Página de login (pública)
  (dashboard)/                # Área protegida (layout verifica sessão)
    page.tsx                  # Overview: KPIs, saúde do sistema, links, linha do tempo, grid de devices
    devices/
      page.tsx                # Lista de dispositivos com filtros e status
      [id]/page.tsx           # Detalhe do dispositivo com gráficos de histórico
      [id]/edit/page.tsx      # Formulário de edição
      new/page.tsx            # Formulário de criação
      new/bulk/page.tsx       # Criação em massa por faixa de IP
    links/
      page.tsx                # Gerenciamento de links WAN + formulário com RouterOS config
      [id]/page.tsx           # Detalhe do link com card de tráfego ao vivo
    incidents/page.tsx        # Histórico de incidentes por device
    notes/page.tsx            # Notas de segurança e issues operacionais
  api/
    auth/[...nextauth]/       # Handler NextAuth
    devices/                  # GET (suporta ?type=) + POST
    devices/bulk/             # POST criação em massa por faixa de IP
    devices/[id]/             # GET, PUT, DELETE
    status/[deviceId]/        # GET histórico de status (?hours=24, máx 168)
    health/                   # GET resumo de saúde do sistema (uptime%, contagens)
    overview/                 # GET sparklines + segmentos de disponibilidade de links
    incidents/                # GET incidentes derivados do StatusHistory (?hours=168, máx 720)
    timeline/                 # GET linha do tempo unificada de devices + links (?hours=24, máx 168)
    links/                    # GET todos + POST criar
    links/[id]/               # GET, PUT, DELETE
    links/[id]/up             # POST + GET webhook de UP (autenticado por HMAC)
    links/[id]/down           # POST + GET webhook de DOWN (autenticado por HMAC)
    links/[id]/events/        # GET histórico de eventos UP/DOWN (?hours=24)
    links/test-traffic/       # POST validar conexão RouterOS antes de salvar
    notes/                    # GET todos + POST criar
    notes/[id]/               # GET, PUT, DELETE

worker/
  index.ts                    # Entry point — conecta ao DB e inicia o scheduler
  scheduler.ts                # setInterval por device + pollLinks() a cada 60s
  monitors/
    ping.ts                   # ICMP via pacote `ping`
    http.ts                   # HTTP fetch
    snmp.ts                   # SNMP v2c via `net-snmp`
    routeros.ts               # RouterOS API via pacote `routeros`
    link-traffic.ts           # Dois samples de /interface/print para calcular bps

lib/
  db.ts                       # Singleton do Prisma client
  auth.ts                     # Configuração NextAuth
  auth.config.ts              # Config base (providers, callbacks)
  format.ts                   # formatUptime, formatResponseTime, formatPercent
  webhook.ts                  # generateWebhookToken + verifyWebhookToken (HMAC-SHA256)
  schemas/device.ts           # Zod schemas: deviceConfigSchema, bulkDeviceSchema

components/
  device-card.tsx             # Card de status no overview grid
  device-detail-drawer.tsx    # Drawer lateral com detalhes + sparkline do device
  device-form.tsx             # Formulário compartilhado criar/editar (react-hook-form + zod)
  device-type-badge.tsx       # Badge colorido por tipo de dispositivo
  link-detail-drawer.tsx      # Drawer lateral com detalhes + tiles de tráfego ao vivo
  status-badge.tsx            # Badge Online/Offline
  metrics-chart.tsx           # AreaChart Recharts para métricas históricas
  ping-chart.tsx              # Gráfico de histórico de ping
  ping-sparkline.tsx          # Sparkline SVG inline para histórico de ping
  topbar.tsx                  # Header da página com título, subtítulo e indicador live
  sidebar.tsx                 # Navegação lateral
  ui/                         # Componentes shadcn (não editar manualmente)

prisma/
  schema.prisma               # Schema do banco de dados
  migrations/                 # Histórico de migrations (PostgreSQL)

scripts/
  create-user.ts              # CLI para criar/atualizar usuário admin
  seed-security-notes.ts      # Popula findings de segurança iniciais

__tests__/
  lib/                        # Testes unitários de utilitários
  api/                        # Testes de rotas de API
  worker/                     # Testes de monitores do worker
  components/                 # Testes de componentes React
  security/                   # Testes de enforcement de autenticação

middleware.ts                 # Proteção de rotas + rate limiting de login (10 tentativas/15min por IP)
```

---

## Segurança

O relatório completo está em [SECURITY_REPORT.md](SECURITY_REPORT.md). Pontos críticos:

- **`NEXTAUTH_SECRET`** deve ser string longa e aleatória em produção (`openssl rand -base64 32`)
- **`ENCRYPTION_KEY`** deve ter exatamente 32 bytes hex (`openssl rand -hex 16`) — usada para criptografar credenciais RouterOS com AES-256-GCM
- **`WEBHOOK_SECRET`** deve ter ao menos 32 caracteres (`openssl rand -hex 32`) — protege endpoints de webhook com HMAC-SHA256
- Credenciais RouterOS são armazenadas criptografadas (AES-256-GCM) — o banco nunca contém senhas em texto plano
- Rate limiting de login: 10 tentativas por IP em 15 minutos (implementado em `middleware.ts`)
- Todas as rotas de API (exceto webhooks de link e `/api/auth/*`) exigem sessão JWT válida

---

## Adicionar um novo protocolo de monitoramento

1. Crie `worker/monitors/seuprotocolo.ts` retornando uma interface tipada com o resultado
2. Importe e chame em `worker/scheduler.ts` dentro de `runChecks()` via `Promise.allSettled`
3. Mapeie o resultado para o upsert em `DeviceStatus` e insert em `StatusHistory`
4. Adicione campos de enable/config em `prisma/schema.prisma`:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```
5. Exponha os campos de toggle e configuração em `components/device-form.tsx`

---

## API

A documentação completa da API está em [docs/openapi.yaml](docs/openapi.yaml) no formato OpenAPI 3.1.

Para visualizar interativamente, importe o arquivo em [editor.swagger.io](https://editor.swagger.io) ou use a extensão OpenAPI do VS Code.
