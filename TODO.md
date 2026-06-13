# WatchIT Tower — Roadmap para nota 100

Baseado na avaliação de 78/100 do sistema.
Itens já concluídos (fases 1–4) foram removidos.

---

## Testes — (maior gap restante)

### Cobertura de código
- [ ] Aumentar cobertura de statements de 46% para 80%+ — foco nos novos submódulos `unifi-http.ts`, `unifi-apikey.ts`, `unifi-inform.ts` e páginas de UI (`app/(dashboard)/**`)
- [ ] Testes de integração com banco real para rotas críticas (usando `testcontainers` ou banco de teste dedicado)
- [ ] Testes de carga mínimos: simular 50 devices com check interval de 10s no worker

---

## Segurança

- [ ] **SEC-022**: monitorar saída da versão estável do `next-auth@5` e atualizar quando sair do beta — usar pin exato em vez de `^`
- [ ] **SEC-031**: criar `.env.example` com `NEXTAUTH_URL` e demais variáveis documentadas — elimina risco de host header injection com `trustHost: true`
- [ ] Adicionar `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Resource-Policy: same-origin` nos headers do `next.config.ts`

---

## Observabilidade

- [ ] Alerta quando `workerStatus === "stale"` detectado em `/api/health` — disparar webhook configurável para notificar worker parado

---

## Qualidade de Código

- [ ] Extrair `handleExportPdf` de `app/(dashboard)/reports/page.tsx` para `lib/pdf-export.ts` — ~80 linhas de lógica de domínio dentro de um componente React

---

## Documentação

- [x] Documentar rotas no OpenAPI: `POST /api/reports`, `GET /api/links/{id}/events`, `POST /api/devices/test-unifi`, `POST /api/devices/test-omada`, `GET /api/metrics`
- [x] Atualizar OpenAPI com campos adicionados: alertas (`alertWebhookUrl`, `alertThreshold`, `lastAlertAt`), paginação (`page`, `limit`) e filtros de notas (`severity`, `status`)
- [x] Criar `CHANGELOG.md` com histórico de versões seguindo [Keep a Changelog](https://keepachangelog.com/)
- [x] Criar `.env.example` com todas as variáveis documentadas (valores de exemplo, sem secrets reais)

---

## Arquitetura

- [ ] Migrar rate limiter do middleware para `RateLimit` table (já existe no schema) via API route dedicada — resolve limitação de Edge Runtime sem adicionar Redis

---

## Features

- [ ] **Janelas de manutenção**: campo `maintenanceUntil: DateTime?` no `Device` — worker não gera incidente se dispositivo estiver em manutenção programada
- [ ] **Comparação de períodos nos relatórios**: selecionar dois intervalos e mostrar delta de uptime e ping médio
- [ ] **Exportação de histórico**: `GET /api/devices/{id}/export?format=csv&hours=720` para exportar `StatusHistory` como CSV

---

## DevEx

- [ ] `docker-compose.dev.yml` com perfil completo: PostgreSQL + volume persistente + healthcheck
- [ ] Documentar processo de deploy em VPS Linux (nginx, systemd units, variáveis de ambiente)

---

## Resumo de impacto por esforço

| Prioridade | Item | Esforço | Ganho estimado |
|---|---|---|---|
| 🔴 Alta | Cobertura de testes (statements → 80%) | Grande | +8 pts |
| 🟡 Média | OpenAPI atualizado + rotas faltantes | Pequeno | +3 pts |
| 🟡 Média | .env.example + CHANGELOG + SEC-031 | Pequeno | +3 pts |
| 🟡 Média | Security headers COOP/CORP | Mínimo | +1 pt |
| 🟡 Média | Extrair handleExportPdf | Pequeno | +1 pt |
| 🟢 Baixa | Alerta worker stale | Pequeno | +1 pt |
| 🟢 Baixa | Rate limiter persistente | Médio | +1 pt |
| 🟢 Baixa | Features (manutenção, CSV, comparação) | Grande | +3 pts |
| 🟢 Baixa | DevEx (docker-compose.dev, deploy docs) | Médio | +2 pts |

**Nota atual estimada: ~90 → Meta: 97–99**
