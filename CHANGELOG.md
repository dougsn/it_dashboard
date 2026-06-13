# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [0.1.0] — 2026-06-13

### Adicionado
- Integração Omada Northbound API — autenticação OAuth2, contagem de clientes por AP, painel dedicado
- Integração UniFi Controller — clientes por AP, painel dedicado
- Clientes DHCP do RouterOS exibidos no detalhe do dispositivo
- Painéis dedicados por tipo de dispositivo (Mikrotik, Omada, UniFi)
- Sistema de auditoria de alterações — log completo com filtros, paginação e exportação CSV
- Controle de usuários com roles ADMIN / OPERADOR / VIEWER
- Página de sistema com métricas do banco e controle de retenção de logs
- Relatórios por dispositivo: downtime, ping, CPU/memória e exportação CSV
- KPI "Clientes Wi-Fi" unifica contagem de APs UniFi e Omada
- Versão e build number no rodapé da sidebar (via `git rev-list`)
- Página `/changelog` com histórico de versões
- Agente `/ux-audit` para auditoria de UX/UI

### Alterado
- Rebrand: aplicação renomeada para **WatchIT Tower** com ícone de farol
- Redesign completo da interface — tokens de design, sidebar, topbar, cards e tabelas (Fases 1–7)
- Página de login reformulada com branding, lista de recursos e campo de senha com toggle
- Filtro OMADA_AP adicionado na visão geral e na página de dispositivos

### Corrigido
- Cálculo de downtime no relatório — não inflava períodos sem histórico suficiente
- Polling do detalhe do dispositivo atualiza gráficos automaticamente
- Cache HTTP desabilitado nas rotas monitoradas — dados sempre frescos
- Strings do RouterOS sanitizadas antes de gravar no PostgreSQL (caracteres inválidos Unicode)
- Horários padronizados para `America/Sao_Paulo` em toda a interface
- CSP: `unsafe-eval` reintroduzido apenas em desenvolvimento (limitação do Next.js 14)

### Segurança
- Auditoria completa: 24 achados documentados (SEC-001 a SEC-024), todos os críticos e altos resolvidos
- SEC-019: criação em massa de dispositivos restringida ao perfil OPERADOR
- SEC-020: exportação CSV protegida contra injeção de fórmula (Excel/LibreOffice)
- SEC-023: rotas de teste Omada/UniFi bloqueadas para VIEWER (prevenção de SSRF)
- Credenciais RouterOS, UniFi e Omada criptografadas com AES-256-GCM
- Rate limiting: 10 tentativas/15 min por IP no endpoint de login
- Tokens de webhook via HMAC-SHA256 com `timingSafeEqual`

---

## [0.0.1] — 2026-05-01

### Adicionado
- Implementação inicial: monitoramento de dispositivos via ping, HTTP, SNMP e RouterOS API
- Banco de dados PostgreSQL via Docker com Prisma ORM
- Links de internet com histórico de status UP/DOWN via webhooks
- Notas de segurança e operacionais com severidade e categoria
- Autenticação com NextAuth.js v5 (JWT, credenciais)
- Worker de background para polling independente dos requests HTTP
- Shutdown gracioso do worker (drain de operações em andamento)
- Heartbeat do worker com detecção de crash em `/api/health`
- Criação em massa de dispositivos por range de IP

[0.1.0]: https://github.com/yourusername/it_dashboard/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/yourusername/it_dashboard/releases/tag/v0.0.1
