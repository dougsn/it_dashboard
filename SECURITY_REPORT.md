# Relatório de Segurança — IT Dashboard

**Última atualização:** 2026-06-05  
**Versão do sistema:** 0.1.0  
**Analista:** Análise automatizada via Claude Code  
**Escopo:** Código-fonte completo — Next.js (frontend/API), worker de monitoramento, banco PostgreSQL

---

## Sumário Executivo

O IT Dashboard é uma aplicação interna para monitoramento de equipamentos de rede. Por ser voltado para uso local e não exposto à internet, o risco geral é **baixo a moderado**. As vulnerabilidades críticas e de alta severidade identificadas na análise inicial foram resolvidas.

| Severidade | Total | Resolvido | Aberto |
|-----------|-------|-----------|--------|
| 🔴 Crítico  | 1     | 1         | 0      |
| 🟠 Alto     | 2     | 2         | 0      |
| 🟡 Médio    | 3     | 1         | 2      |
| 🔵 Baixo    | 3     | 0         | 3      |
| ℹ️ Info     | 9     | 2         | 7      |
| **Total**  | **18**| **6**     | **12** |

---

## Achados Detalhados

---

### SEC-001 — Secret JWT com fallback hardcoded
**Severidade:** 🔴 CRÍTICO — ✅ RESOLVIDO  
**Categoria:** Autenticação  
**Resolvido em:** branch `feat/final-quality-push`

`lib/auth.ts` valida `NEXTAUTH_SECRET` obrigatório no startup. `lib/crypto.ts` também valida `ENCRYPTION_KEY` e lança erro imediato se ausente. `.env.example` publicado no repositório com placeholders seguros.

---

### SEC-002 — Credenciais RouterOS armazenadas em texto plano
**Severidade:** 🟠 ALTO — ✅ RESOLVIDO  
**Categoria:** Proteção de dados  
**Resolvido em:** versão inicial com `lib/crypto.ts`

Campos `routerosUser` e `routerosPass` são criptografados com AES-256-GCM (IV aleatório por operação) antes de gravar no banco. Descriptografados apenas no worker no momento de uso via `resolveRouterosCredentials()`. Campos plaintext nunca retornam nas respostas da API (`sanitizeDevice()`).

---

### SEC-003 — Sem rate limiting no endpoint de login
**Severidade:** 🟠 ALTO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso  
**Resolvido em:** `middleware.ts`

Rate limiting implementado: 10 tentativas por IP em janela de 15 minutos. Retorna 429 ao exceder o limite. Estado mantido em memória (ver SEC-014).

---

### SEC-004 — Ausência de headers de segurança HTTP
**Severidade:** 🟡 MÉDIO — ✅ RESOLVIDO  
**Categoria:** Configuração  
**Resolvido em:** `next.config.ts`

Headers implementados: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`. HSTS ativo apenas em produção (`NODE_ENV=production`).

---

### SEC-005 — Tráfego sem criptografia (HTTP)
**Severidade:** 🟡 MÉDIO — 🔴 ABERTO  
**Categoria:** Transporte seguro

O dashboard não inclui TLS por padrão — responsabilidade da infraestrutura. Para uso em produção, configurar reverse proxy com TLS.

**Mitigação recomendada:**
```
# Caddy (automático, certificado autoassinado)
dashboard.local {
  reverse_proxy localhost:3000
  tls internal
}
```

---

### SEC-006 — Permissões do banco de dados
**Severidade:** 🔵 BAIXO — 🔴 ABERTO  
**Categoria:** Proteção de dados

O banco PostgreSQL corre em container Docker. Permissões de acesso dependem da configuração do host e do `docker-compose.yml`. Em ambiente multi-usuário, verificar que o socket do Docker não é acessível a usuários não autorizados.

**Mitigação:** Configurar `DATABASE_URL` com credenciais dedicadas de leitura/escrita mínimas. Não usar o usuário `postgres` padrão em produção.

---

### SEC-007 — Sem auditoria de ações administrativas
**Severidade:** 🔵 BAIXO — 🔴 ABERTO  
**Categoria:** Rastreabilidade

Não há registro de quem criou, editou ou removeu dispositivos, links e notas.

**Mitigação futura:** Adicionar modelo `AuditLog` ao schema Prisma com campos `action`, `entity`, `entityId`, `userId`, `payload` e `createdAt`. Registrar em todos os handlers PUT/DELETE/POST.

---

### SEC-008 — Worker com privilégios do processo pai
**Severidade:** 🔵 BAIXO — 🔴 ABERTO  
**Categoria:** Menor privilégio  

O worker executa com os privilégios do usuário que iniciou o processo. O Dockerfile já cria usuário não-root `app` para o container — em deploy via Docker o risco é mitigado. Em execução direta (`npm run worker`), o worker roda com o usuário do terminal.

**Mitigação:** Em produção, sempre usar o container Docker que já aplica `USER app`.

---

### SEC-009 — Autenticação de fator único
**Severidade:** ℹ️ INFO — 🔴 ABERTO  
**Categoria:** Autenticação

Apenas usuário e senha protegem o acesso. Sem 2FA/TOTP.

**Mitigação futura:** Implementar TOTP opcional com `otplib` e QR code na primeira configuração.

---

### SEC-010 — Validação de IP aceita octetos fora do range padrão
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (design intencional)  
**Categoria:** Validação de entrada

O campo `ip` aceita qualquer string não vazia sem validar formato IPv4 estrito. Isso é intencional: o dashboard monitora dispositivos WireGuard com endereços `10.255.255.x/29` que poderiam ser rejeitados por validações mais restritivas. O risco de injection via IP é mitigado pelo uso de bibliotecas (`ping`, `routeros`, `net-snmp`) que não passam o IP para shell diretamente.

---

### SEC-011 — Sem timeout de sessão explícito
**Severidade:** ℹ️ INFO — 🔴 ABERTO  
**Categoria:** Gerenciamento de sessão

Tokens JWT usam o `maxAge` padrão do NextAuth (30 dias).

**Mitigação futura:**
```typescript
// lib/auth.ts
session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 horas
```

---

### SEC-012 — Sem limite de tamanho explícito nas requisições
**Severidade:** ℹ️ INFO — 🔴 ABERTO  
**Categoria:** DoS

Payloads de qualquer tamanho são aceitos. Os schemas Zod limitam o conteúdo por campo (`max(100)`, `max(500)`), mas não há limite de bytes no corpo da requisição.

**Mitigação futura:** Configurar `bodySizeLimit` no `next.config.ts`.

---

### SEC-013 — req.json() sem guard contra JSON malformado
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Tratamento de erros  
**Resolvido em:** branch `fix/json-parse-guard`

8 rotas de API expunham `SyntaxError` não tratada quando o body da requisição era JSON inválido, resultando em resposta 500 em vez de 400. Corrigido com helper `lib/parse-body.ts` aplicado em todas as rotas POST/PUT.

---

### SEC-014 — Rate limiting em memória (não persiste entre restarts)
**Severidade:** ℹ️ INFO — 🔴 ABERTO  
**Categoria:** Controle de acesso

O rate limiter do login mantém estado em um `Map` em memória. O contador zera em cada reinício do processo e não é compartilhado entre réplicas.

**Impacto:** Baixo no contexto single-instance atual. Em deploy com múltiplas réplicas, o limite efetivo seria multiplicado pelo número de instâncias.

**Mitigação futura:** Mover estado do rate limiter para Redis ou tabela do banco com TTL.

---

### SEC-015 — CSP inclui unsafe-eval (limitação do Next.js 14)
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (limitação do framework)  
**Categoria:** Content Security Policy

O Next.js 14 com App Router requer `unsafe-eval` no CSP para funcionamento interno. Remover essa diretiva quebraria o framework.

**Contexto:** O risco prático é baixo em dashboard interno sem conteúdo de usuário renderizado como HTML. A alternativa seria migrar para Next.js 15+ que suporta nonces, eliminando a necessidade de `unsafe-eval`.

---

### SEC-016 — Endpoints de webhook sem autenticação de sessão
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (design intencional)  
**Categoria:** Autenticação

As rotas `GET /api/links/:id/up` e `GET /api/links/:id/down` não exigem sessão — protegidas apenas por HMAC-SHA256 via query param `?token=`. Isso é intencional para integração com Zabbix, Nagios e scripts externos.

**Risco residual:** Vazamento de `WEBHOOK_SECRET` permite mudar status de qualquer link. Não há log de auditoria para chamadas webhook (IP de origem, timestamp).

**Mitigação futura:** Adicionar logging estruturado com IP de origem em cada chamada webhook.

---

### SEC-017 — startScheduler sem cobertura de testes
**Severidade:** ℹ️ INFO — 🔴 ABERTO  
**Categoria:** Qualidade / Operacional

A função que orquestra heartbeat, reconciliação de devices e polling de links não possui testes de integração. Bugs de inicialização só são detectados em runtime.

**Mitigação futura:** Teste de integração com fake timers, mockando `db.device.findMany` e verificando criação e drenagem dos intervals.

---

### SEC-018 — Sem timeout global na inicialização do worker
**Severidade:** ℹ️ INFO — 🔴 ABERTO  
**Categoria:** Operacional / Resiliência

Se o banco ficar indisponível na subida, `startScheduler()` pode travar indefinidamente em `db.device.findMany()` sem encerrar o processo nem emitir sinal de falha ao orquestrador (Docker/systemd).

**Mitigação futura:** Adicionar `AbortSignal` com timeout em `startScheduler()` ou watchdog via `setTimeout` que chama `process.exit(1)` se a inicialização não completar em 30 segundos.

---

## Plano de Mitigação — Itens Abertos

| # | Item | Severidade | Esforço | Prioridade |
|---|------|-----------|---------|-----------|
| SEC-005 | Configurar TLS/HTTPS via reverse proxy | 🟡 Médio | Infra (1h) | Alta |
| SEC-006 | Permissões do banco / credenciais mínimas | 🔵 Baixo | Infra (30min) | Média |
| SEC-007 | Auditoria de ações administrativas | 🔵 Baixo | Código (1 dia) | Média |
| SEC-008 | Sempre usar container Docker em produção | 🔵 Baixo | Infra (0) | Baixa |
| SEC-011 | Session maxAge de 8h | ℹ️ Info | Código (5min) | Baixa |
| SEC-012 | Limite de tamanho de requisição | ℹ️ Info | Código (15min) | Baixa |
| SEC-014 | Rate limiter persistente (Redis/banco) | ℹ️ Info | Código (4h) | Baixa |
| SEC-017 | Testes para startScheduler | ℹ️ Info | Código (2h) | Baixa |
| SEC-018 | Timeout de inicialização do worker | ℹ️ Info | Código (30min) | Baixa |
| SEC-009 | 2FA/TOTP opcional | ℹ️ Info | Código (1 dia) | Muito baixa |

---

## Rastreamento no Dashboard

Todos os achados abertos foram importados como notas em `/notes`.  
Para inserir novas notas: `npx tsx scripts/add-security-notes.ts`  
Para importar o conjunto inicial: `npm run seed:security`

---

## Contexto de Uso

Este dashboard é projetado para uso **exclusivamente na rede local interna**. O nível de risco é significativamente menor comparado a uma aplicação exposta à internet. As vulnerabilidades críticas e de alta severidade foram resolvidas. Os itens abertos restantes são adequados para resolução incremental sem bloquear o uso em produção em ambiente controlado.
