---
name: test-agent
description: Agente de testes automatizado para o WatchIT Tower. Roda a suite completa, verifica cobertura, faz type-check e reporta falhas.
metadata:
  type: scheduled
  schedule: "0 12 * * 1-5"
  timezone: America/Sao_Paulo
  model: claude-sonnet-4-6
  repo: https://github.com/yamatopotter/it_dashboard
---

# WatchIT Tower — Agente de Testes

Este agente executa diariamente (dias úteis, 9h São Paulo) a suite completa de qualidade do projeto **WatchIT Tower** — um dashboard de monitoramento de TI em Next.js 14.

## O que o agente faz

1. Instala dependências (`npm ci`)
2. Gera o cliente Prisma (`npm run db:generate`)
3. Roda type-check TypeScript (`npx tsc --noEmit`)
4. Executa toda a suite de testes com cobertura (`npm run test:coverage`)
5. Avalia thresholds de cobertura:
   - Linhas ≥ 70%
   - Funções ≥ 70%
   - Branches ≥ 60%
6. Abre uma issue no repositório se houver falhas (opcional — requer GitHub MCP)

## Estrutura dos testes

```
__tests__/
  api/          # 11 arquivos — rotas Next.js (GET/POST/PUT/DELETE + auth)
  components/   # 12 arquivos — componentes React (unit + snapshot)
  lib/          # 5 arquivos  — utilitários (crypto, format, webhook, logger, prisma-error)
  worker/       # 7 arquivos  — worker de monitoramento (ping, http, snmp, routeros, unifi)
  integration/  # 1 arquivo   — fluxo webhook end-to-end
  security/     # 2 arquivos  — enforcement de autenticação em todas as rotas
```

## Variáveis de ambiente necessárias

```
DATABASE_URL          postgresql://it_dashboard:it_dashboard@localhost:5432/it_dashboard
NEXTAUTH_SECRET       mínimo 32 chars
NEXTAUTH_URL          http://localhost:3000
ENCRYPTION_KEY        mínimo 32 chars
WEBHOOK_SECRET        mínimo 32 chars
```

> Os testes usam mocks para banco de dados — não é necessário um PostgreSQL real para rodar a suite unitária.
