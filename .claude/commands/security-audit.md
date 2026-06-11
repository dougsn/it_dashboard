---
description: Audita o codebase em busca de vulnerabilidades de segurança (OWASP Top 10) e atualiza SECURITY_REPORT.md com novos achados
allowed-tools: Read, Bash(find:*), Bash(grep:*), Bash(git log:*), Bash(git diff:*), Bash(npm audit:*), Bash(npx tsc --noEmit:*)
---

Você é um especialista em segurança da informação (AppSec). Realize uma auditoria de segurança completa do projeto WatchIT Tower.

## Contexto do projeto

- Next.js 14 App Router + Prisma 7 + PostgreSQL
- Worker Node.js separado para monitoramento de rede (Mikrotik RouterOS, UniFi AP, SNMP, ICMP)
- Autenticação JWT via NextAuth.js v5
- Credenciais RouterOS criptografadas com AES-256-GCM
- Webhooks protegidos por HMAC-SHA256

## Passo 1 — Leia o relatório existente

Leia `/home/evora/Github/it_dashboard/SECURITY_REPORT.md` para entender os achados anteriores e não duplicá-los. Anote o maior ID SEC-XXX existente para continuar a numeração.

## Passo 2 — Leia os arquivos críticos

Leia **obrigatoriamente** (use Read em cada um):

1. `next.config.ts` — headers HTTP, CSP, HSTS
2. `middleware.ts` — rate limiting, proteção de rotas
3. `lib/auth.ts` e `lib/auth.config.ts` — JWT, cookies, sessão
4. `lib/crypto.ts` — AES-GCM, validateKey
5. `lib/webhook.ts` — HMAC, timingSafeEqual
6. `lib/with-auth.ts` — padrão de autenticação de rotas
7. `prisma/schema.prisma` — campos sensíveis, defaults inseguros
8. `lib/schemas/device.ts` — validação Zod de inputs
9. `worker/monitors/ping.ts` — command injection
10. `worker/monitors/snmp.ts` — injeção via OID/community
11. `worker/monitors/routeros.ts` — credenciais, TLS
12. `worker/monitors/unifi.ts` (se existir) — TLS, credenciais
13. `package.json` — dependências vulneráveis

Depois rode:
```
find . -path ./node_modules -prune -o -name "route.ts" -print | sort
```
e leia qualquer rota que **não** contenha `requireAuth` para verificar se é uma omissão ou intencional.

## Passo 3 — Execute verificações automatizadas

```bash
cd /home/evora/Github/it_dashboard && npm audit --json 2>/dev/null | head -100
```

```bash
cd /home/evora/Github/it_dashboard && git log --oneline -10
```

## Passo 4 — Analise cada categoria OWASP

Para cada categoria abaixo, documente o que encontrou (mesmo que seja "OK"):

**A01 — Broken Access Control**
- Toda rota em `app/api/` tem `requireAuth()`? (exceto `/api/auth/*` e webhooks com HMAC)
- Recursos de um usuário acessíveis por outro?

**A02 — Cryptographic Failures**
- IV reutilizado no AES-GCM?
- Bcrypt rounds ≥ 12?
- Chave de criptografia com comprimento mínimo verificado?
- Credenciais em plaintext no banco?

**A03 — Injection**
- Raw queries Prisma (`$queryRaw`, `$executeRaw`)?
- IPs passados diretamente para comandos do sistema sem sanitização?
- `httpPath` validado contra path traversal?

**A05 — Security Misconfiguration**
- CSP contém `unsafe-inline` ou `unsafe-eval`?
- HSTS presente e correto?
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` presentes?
- `trustHost: true` sem `NEXTAUTH_URL`?
- TLS verificado por padrão em conexões externas (UniFi, RouterOS)?

**A06 — Vulnerable and Outdated Components**
- `npm audit` retorna vulnerabilidades HIGH ou CRITICAL?
- `next-auth` ainda em beta?

**A07 — Auth Failures**
- `session.maxAge` configurado?
- Cookie com `httpOnly`, `secure`, `sameSite`?
- Rate limiting apenas no login?

**A09 — Logging Failures**
- Logs expõem senhas, chaves ou stack traces?
- Memory leak no rate limiter?

## Passo 5 — Compare com o estado atual

Para cada achado aberto no `SECURITY_REPORT.md`, verifique se já foi corrigido lendo o código atual. Se corrigido, marque como `[RESOLVIDO]`.

## Passo 6 — Reporte novos achados

Para cada vulnerabilidade **nova** (não presente no SECURITY_REPORT.md), use o formato:

```
**SEC-XXX** | SEVERIDADE | Categoria OWASP A0X
Descrição: ...
Localização: arquivo:linha
Impacto: ...
Recomendação: ...
```

Severidades: CRITICAL / HIGH / MEDIUM / LOW / INFO

## Passo 7 — Entrega final

Produza:

1. **Status dos achados existentes** — lista com ID, título e se foi resolvido ou ainda aberto
2. **Novos achados** (se houver) no formato acima
3. **Tabela resumo** — todos os achados abertos por severidade
4. **Top 3 riscos** a corrigir imediatamente com justificativa
5. **Nota geral 0–10** com justificativa

Se houver novos achados, atualize o `SECURITY_REPORT.md` com eles.

> **Importante:** Não assuma — leia o código atual. Um achado anterior pode já ter sido corrigido. Novos achados devem ser verificados com evidência do arquivo:linha.
