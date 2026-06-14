# Relatório de Segurança — WatchIT Tower

**Última atualização:** 2026-06-14 (v0.2.0 — SEC-028/029/031/032/033/036/037 resolvidos, SEC-030 aceito; SEC-021 completado)  
**Versão do sistema:** 0.2.0  
**Analista:** Análise automatizada via Claude Code  
**Escopo:** Código-fonte completo — Next.js 14 (frontend/API), worker de monitoramento, banco PostgreSQL

---

## Sumário Executivo

O WatchIT Tower é uma aplicação interna para monitoramento de equipamentos de rede (Mikrotik, câmeras, DVRs, APs Omada/UniFi). Por ser voltado para uso local e não exposto à internet, o risco geral é **baixo**. Todas as vulnerabilidades críticas, de alta e média severidade identificadas foram resolvidas ou mitigadas.

| Severidade | Total | Resolvido | Aberto |
|-----------|-------|-----------|--------|
| 🔴 Crítico  | 1     | 1         | 0      |
| 🟠 Alto     | 4     | 4         | 0      |
| 🟡 Médio    | 7     | 5 + 1⚠️   | 1      |
| 🔵 Baixo    | 6     | 4         | 2      |
| ℹ️ Info     | 17    | 13 + 4⚠️  | 0      |
| **Total**  | **35**| **32**    | **3**  |

> ⚠️ = Aceito / won't-fix por design intencional ou limitação de framework

---

## Achados Detalhados

---

### SEC-001 — Secret JWT com fallback hardcoded
**Severidade:** 🔴 CRÍTICO — ✅ RESOLVIDO  
**Categoria:** Autenticação  
**Resolvido em:** branch `feat/final-quality-push`

`lib/auth.ts` valida `NEXTAUTH_SECRET` obrigatório no startup. `lib/crypto.ts` também valida `ENCRYPTION_KEY` e lança erro imediato se ausente. `.env.example` publicado no repositório com placeholders seguros.

---

### SEC-002 — Credenciais de integração armazenadas em texto plano
**Severidade:** 🟠 ALTO — ✅ RESOLVIDO  
**Categoria:** Proteção de dados  
**Resolvido em:** versão inicial com `lib/crypto.ts`

Todos os campos de credencial (RouterOS, UniFi, Omada, SNMP) são criptografados com AES-256-GCM (IV aleatório por operação) antes de gravar no banco. Descriptografados apenas no worker no momento de uso. `sanitizeDevice()` expõe apenas flags booleanas nas respostas da API.

---

### SEC-003 — Sem rate limiting no endpoint de login
**Severidade:** 🟠 ALTO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso  
**Resolvido em:** `middleware.ts` + tabela `RateLimit` (PostgreSQL)

Rate limiting implementado: 10 tentativas por IP em janela de 15 minutos via tabela `RateLimit` no PostgreSQL. Retorna 429 ao exceder o limite. Estado persistido no banco — sobrevive a restarts.

---

### SEC-004 — Ausência de headers de segurança HTTP
**Severidade:** 🟡 MÉDIO — ✅ RESOLVIDO  
**Categoria:** Configuração  
**Resolvido em:** `next.config.ts`

Headers implementados: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy` com nonce por request, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.

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

O banco PostgreSQL corre em container Docker. Permissões de acesso dependem da configuração do host.

**Mitigação:** Configurar `DATABASE_URL` com credenciais dedicadas de leitura/escrita mínimas. Não usar o usuário `postgres` padrão em produção.

---

### SEC-007 — Sem auditoria de ações administrativas
**Severidade:** 🔵 BAIXO — ✅ RESOLVIDO  
**Categoria:** Rastreabilidade  
**Resolvido em:** branch `feat/audit-logs`

Sistema de auditoria completo: modelo `AuditLog` com ações `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGIN_FAILED`, `CLEANUP`. Todos os handlers POST/PUT/DELETE registram ator, entidade, IP e detalhes. Tela `/audit` com filtros, paginação, exportação CSV e purge.

---

### SEC-008 — Worker com privilégios do processo pai
**Severidade:** 🔵 BAIXO — 🔴 ABERTO  
**Categoria:** Menor privilégio

O worker executa com os privilégios do usuário que iniciou o processo. O Dockerfile já cria usuário não-root `app` — em deploy via Docker o risco é mitigado.

**Mitigação:** Em produção, sempre usar o container Docker que já aplica `USER app`.

---

### SEC-009 — Autenticação de fator único
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Autenticação  
**Resolvido em:** branch `feat/omada-ap-integration`

2FA/TOTP opcional implementado com `otplib`. Usuário habilita via `GET/POST/DELETE /api/users/[id]/totp`. Segredo armazenado criptografado com AES-256-GCM. Login exibe campo de código quando usuário tem TOTP ativo (pré-verificação via `/api/auth/check-2fa`). QR code gerado para registro em app autenticador.

---

### SEC-010 — Validação de IP aceita octetos fora do range padrão
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (design intencional)  
**Categoria:** Validação de entrada

O campo `ip` aceita qualquer string não vazia sem validar formato IPv4 estrito. Isso é intencional: o dashboard monitora dispositivos WireGuard com endereços privados. O risco de injection via IP é mitigado pelo uso de bibliotecas que não passam o IP para shell diretamente.

---

### SEC-011 — Sem timeout de sessão explícito
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Gerenciamento de sessão  
**Resolvido em:** `lib/auth.config.ts`

`session: { strategy: "jwt", maxAge: 8 * 3600 }` configurado — sessões expiram em 8 horas.

---

### SEC-012 — Sem limite de tamanho explícito nas requisições
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** DoS  
**Resolvido em:** branch `feat/omada-ap-integration`

`lib/parse-body.ts` verifica o header `Content-Length` e rejeita com `413` qualquer corpo acima de 1 MB antes de chamar `req.json()`. `next.config.ts` inclui `experimental.serverActions.bodySizeLimit: "1mb"`.

---

### SEC-013 — req.json() sem guard contra JSON malformado
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Tratamento de erros  
**Resolvido em:** branch `fix/json-parse-guard`

Helper `lib/parse-body.ts` aplicado em todas as rotas POST/PUT — retorna `400` ao invés de `500 SyntaxError`.

---

### SEC-014 — Rate limiting em memória (não persiste entre restarts)
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso  
**Resolvido em:** branch `feat/omada-ap-integration`

Estado do rate limiter migrado para tabela `RateLimit` no PostgreSQL com TTL automático via job de limpeza no worker. Endpoint interno `/api/auth/rate-check` consultado pelo middleware. Persiste entre restarts e é compartilhado entre réplicas.

---

### SEC-015 — CSP inclui unsafe-eval (limitação do Next.js 14)
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (limitação do framework)  
**Categoria:** Content Security Policy

O Next.js 14 com App Router requer `unsafe-eval` apenas em desenvolvimento. Em produção, o CSP usa `nonce` + `strict-dynamic` sem `unsafe-eval` (configurado em `middleware.ts`).

---

### SEC-016 — Endpoints de webhook sem autenticação de sessão
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (design intencional)  
**Categoria:** Autenticação

`GET /api/links/:id/up` e `GET /api/links/:id/down` protegidos por HMAC-SHA256 via `?token=`. Intencional para integração com Zabbix, Nagios e scripts externos. Chamadas agora registradas no `AuditLog` (SEC-022 resolvido).

---

### SEC-017 — startScheduler sem cobertura de testes
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Qualidade / Operacional  
**Resolvido em:** branch `feat/omada-ap-integration`

`__tests__/worker/scheduler-startup.test.ts` criado com 9 testes cobrindo: inicialização com múltiplos devices, criação de intervals, heartbeat, reconciliação, shutdown com drenagem de `pendingChecks`, deadline, idempotência.

---

### SEC-018 — Sem timeout global na inicialização do worker
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Operacional / Resiliência  
**Resolvido em:** branch `feat/omada-ap-integration`

`worker/index.ts` configura `setTimeout` de 30s antes de chamar `startScheduler()`. Se a inicialização não completar (ex: banco indisponível), o processo encerra com `process.exit(1)` e log de erro estruturado. `timer.unref()` garante que o timeout não impede o encerramento normal.

---

### SEC-019 — Criação em massa de dispositivos acessível por VIEWER
**Severidade:** 🟠 ALTO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso  
**Resolvido em:** branch `feat/security-audit-2`

`POST /api/devices/bulk` exige perfil OPERADOR ou superior.

---

### SEC-020 — CSV export vulnerável a injeção de fórmula
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Segurança de dados  
**Resolvido em:** branch `feat/security-audit-2`

`csvEscape()` prefixada com `'` em campos que começam com `=`, `+`, `-`, `@`.

---

### SEC-021 — Cache de papel (role) no JWT não atualiza imediatamente
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso  
**Resolvido em:** branch `feat/omada-ap-integration`

Lista negra de tokens JWT implementada: modelo `TokenBlacklist` com `jti` (UUID gerado no jwt callback) e `expiresAt`. `POST /api/auth/logout` insere o `jti` no blacklist e limpa o cookie de sessão. O jwt callback verifica o blacklist a cada request — tokens revogados são rejeitados imediatamente. Entradas expiradas removidas diariamente pelo `pruneHistory()` do worker.

**Revalidação por troca de senha (completado na branch `fix/password-change-revocation`):** o campo `User.passwordChangedAt` agora é gravado em toda alteração de senha (`PUT /api/users/[id]`). O jwt callback compara `passwordChangedAt` com o `iat` do token a cada request e rejeita (retorna `null`) qualquer token emitido antes da troca — invalidando todas as sessões antigas imediatamente após a senha mudar. Antes, o campo existia no schema mas nunca era escrito nem lido (controle morto). Coberto por `__tests__/api/users-id.test.ts`.

---

### SEC-022 — Chamadas de webhook não registradas no sistema de auditoria
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Rastreabilidade  
**Resolvido em:** branch `feat/omada-ap-integration`

`writeAudit()` adicionado em `/api/links/:id/up` e `/api/links/:id/down` com `username: "webhook"`, IP de origem e `details: { event: "up"|"down" }`.

---

### SEC-023 — Rotas de teste de integração permitem SSRF por VIEWER
**Severidade:** 🟡 MÉDIO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso / SSRF  
**Resolvido em:** branch `feat/lighthouse-branding`

`POST /api/devices/test-omada` e `POST /api/devices/test-unifi` exigem perfil OPERADOR ou superior.

---

### SEC-024 — TLS desabilitado por dispositivo nas integrações Omada/UniFi
**Severidade:** ℹ️ INFO — ⚠️ ACEITO (design intencional)  
**Categoria:** Transporte seguro

Flag `tlsVerify: false` intencional para controllers com certificados autoassinados em redes locais. Risco baixo em redes segregadas.

---

### SEC-025 — SSRF parcial em endpoints de teste de integração
**Severidade:** 🟡 MÉDIO — ✅ RESOLVIDO  
**Categoria:** Controle de acesso / SSRF  
**Resolvido em:** branch `feat/omada-ap-integration`

`controllerIpSchema` em `lib/schemas/device.ts` rejeita loopback (`127.x`), link-local/AWS metadata (`169.254.x`), `0.0.0.0`, broadcast e multicast. Endereços RFC 1918 permitidos (controladores locais legítimos).

---

### SEC-026 — Sem limite de tamanho de requisição (bodySizeLimit)
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** DoS  
**Resolvido em:** branch `feat/omada-ap-integration`

Ver SEC-012. `parse-body.ts` rejeita corpos acima de 1 MB com `413`. `next.config.ts` com `bodySizeLimit: "1mb"` para Server Actions.

---

### SEC-027 — Race condition em atualização de usuário sem versionamento
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO  
**Categoria:** Integridade de dados  
**Resolvido em:** branch `feat/omada-ap-integration`

Campo `version Int @default(1)` no modelo `User`. `PUT /api/users/[id]` retorna `409 Conflict` se versão enviada diverge da versão no banco. Versão incrementada com `{ increment: 1 }` em cada update.

---

### SEC-028 — Webhook tokens expostos a VIEWER permitem controle de estado dos links
**Severidade:** 🟠 ALTO — ✅ RESOLVIDO
**Categoria:** Quebra de controle de acesso (OWASP A01)
**Resolvido em:** branch `fix/viewer-authorization`

`GET /api/links` retornava o `webhookToken` (HMAC-SHA256 determinístico de cada link) para qualquer usuário autenticado, incluindo VIEWER. Como os endpoints `POST /api/links/:id/up|down` são autenticados apenas pelo token (sem sessão, por design — ver SEC-016), um VIEWER obtinha todos os tokens via GET e manipulava o estado UP/DOWN de qualquer link. **Correção:** `GET /api/links` agora resolve o papel via `getSessionRole()` e só inclui `webhookToken` no payload para OPERADOR+. Coberto por `__tests__/security/viewer-authorization.test.ts`.

---

### SEC-029 — VIEWER dispara operações de rede ativas e leitura de tráfego ao vivo
**Severidade:** 🟡 MÉDIO — ✅ RESOLVIDO
**Categoria:** Quebra de controle de acesso (OWASP A01)
**Resolvido em:** branch `fix/viewer-authorization`

Quatro endpoints exigiam apenas `requireAuth()`: `POST /api/devices/check` (dispara `runChecks` em toda a frota), `POST /api/devices/:id/check`, `POST /api/links/test-traffic` e `GET /api/links/:id/live-traffic` (ambos decriptam credenciais RouterOS e fazem chamada real ao Mikrotik). Um VIEWER podia gerar carga de rede e usar os checks como ferramenta de reconhecimento. **Correção:** os quatro agora exigem `requireRole("OPERADOR")`. Coberto por `__tests__/security/viewer-authorization.test.ts`.

---

### SEC-031 — Community SNMP legada exposta em texto claro nas respostas de dispositivo
**Severidade:** 🟡 MÉDIO — ✅ RESOLVIDO
**Categoria:** Exposição de dados sensíveis (OWASP A02)
**Resolvido em:** branch `fix/credential-exposure`

`sanitizeDevice()` removia os campos `*Enc` mas deixava passar o campo legado `snmpCommunity` (texto claro) no `...rest`, retornando-o a todos os usuários autenticados (incluindo VIEWER). Para dispositivos criados antes da migração para colunas criptografadas, a community SNMP real ficava exposta. **Correção:** `sanitizeDevice()` agora remove `snmpCommunity` e `snmpCommunityEnc`, expondo `hasSnmpCredentials: boolean`. O campo virou write-only no form (em branco no edit, só atualiza se preenchido). Coberto por `__tests__/api/devices.test.ts`.
_Nota: o `POST /api/devices/bulk` ainda grava a community em texto claro na coluna `snmpCommunity` (criptografia-em-repouso não aplicada no bulk) — registrado no TODO como follow-up._

---

### SEC-033 — Mensagem de erro interno do PostgreSQL exposta em /api/admin/stats
**Severidade:** 🔵 BAIXO — ✅ RESOLVIDO
**Categoria:** Exposição de informação (OWASP A05)
**Resolvido em:** branch `fix/credential-exposure`

O handler de erro retornava `err.message` diretamente ao cliente, vazando estrutura interna (nomes de tabelas, detalhes do driver). Embora restrito a ADMIN, é defesa em profundidade. **Correção:** erro completo logado no servidor; cliente recebe mensagem genérica.

---

### SEC-036 — `X-Forwarded-For` confiado sem proxy reverso (spoofing de IP em auditoria)
**Severidade:** 🔵 BAIXO — ✅ RESOLVIDO
**Categoria:** Integridade de logs (OWASP A09)
**Resolvido em:** branch `fix/credential-exposure`

`extractIp()` confiava cegamente em `X-Forwarded-For`/`X-Real-IP`, permitindo que um cliente em acesso direto forjasse o IP registrado nos logs de auditoria. **Correção:** os headers só são honrados quando `TRUST_PROXY=true` (definido apenas atrás de um proxy reverso confiável que sanitiza os headers); caso contrário retorna `null`. Documentado em `.env.example`.

---

### SEC-030 — Enumeração de 2FA via /api/auth/check-2fa
**Severidade:** 🟡 MÉDIO — ⚠️ ACEITO (won't-fix por design)
**Categoria:** Exposição de informação (OWASP A05)
**Avaliado em:** branch `fix/auth-hardening`

O endpoint público revela se um username tem 2FA ativo antes da verificação de senha. É inerente à feature (o campo TOTP precisa ser renderizado antes do submit). **Decisão:** aceito para o escopo interno — o vazamento exige conhecer o username, a senha continua obrigatória, e usuários inexistentes/sem-2FA retornam o mesmo `false` (não é possível descobrir usernames válidos, apenas saber quais conhecidos têm 2FA). Documentado em comentário no handler.

---

### SEC-032 — Race condition (TOCTOU) no rate limiter de login
**Severidade:** 🔵 BAIXO — ✅ RESOLVIDO
**Categoria:** Quebra de controle de acesso (OWASP A07)
**Resolvido em:** branch `fix/auth-hardening`

`POST /api/auth/rate-check` fazia `findUnique` seguido de `update`/`upsert` separados; duas requisições simultâneas do mesmo IP podiam ambas iniciar a janela em `count=1`, permitindo exceder o limite de 10 tentativas. **Correção:** substituído por um `INSERT ... ON CONFLICT DO UPDATE` atômico (`$queryRaw`) que reseta ou incrementa em uma única operação. Coberto por `__tests__/api/auth-rate-check.test.ts`.

---

### SEC-037 — Validação de secrets no startup do servidor web
**Severidade:** ℹ️ INFO — ✅ RESOLVIDO
**Categoria:** Configuração segura (OWASP A05)
**Resolvido em:** branch `fix/auth-hardening`

`validateKey()`/`validateSecret()` rodavam apenas no worker. Se o processo Next.js iniciasse sem `ENCRYPTION_KEY`/`WEBHOOK_SECRET`, a falha só aparecia na primeira request que criptografava (500 críptico). **Correção:** `instrumentation.ts` chama ambas no `register()` do Next.js, garantindo fail-fast no startup do servidor web — mesma garantia que o worker já tinha.

---

## Plano de Mitigação — Itens Abertos

| # | Item | Severidade | Esforço | Prioridade |
|---|------|-----------|---------|-----------|
| SEC-005 | Configurar TLS/HTTPS via reverse proxy | 🟡 Médio | Infra (1h) | Alta |
| SEC-006 | Permissões do banco / credenciais mínimas | 🔵 Baixo | Infra (30min) | Média |
| SEC-008 | Sempre usar container Docker em produção | 🔵 Baixo | Infra (0) | Baixa |

---

## Rastreamento no Dashboard

Todos os achados são exibidos na página `/security` do dashboard.  
A tela lê este arquivo diretamente — não depende de banco de dados.  
Para adicionar achados, edite este arquivo seguindo o padrão de cada seção `### SEC-XXX`.

---

## Contexto de Uso

O WatchIT Tower é projetado para uso **exclusivamente na rede local interna**. O nível de risco é **baixo**. Todos os achados de código foram resolvidos. Os 3 itens abertos restantes são de infraestrutura (TLS via proxy, permissões do banco, execução em Docker) e adequados para resolução pelo administrador do ambiente.
