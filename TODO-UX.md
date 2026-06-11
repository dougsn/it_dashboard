# WatchIT Tower — Roadmap UX/UI

Baseado na auditoria de 6.9/10. Itens ordenados por impacto operacional.
Cada seção indica a nota atual → meta e o que está sendo deixado na mesa.

---

## Quick Wins — < 2h cada

Melhorias de alto impacto que podem ser feitas imediatamente.

### QW-1 — Banner de worker stale ⚠ CRÍTICO
- [ ] Renderizar `health.workerStatus` na UI — atualmente buscado mas **nunca exibido** (`app/(dashboard)/page.tsx`)
- [ ] Adicionar banner no topo do dashboard quando `workerStatus === "stale"` com tempo desde a última verificação
- [ ] Banner deve ser amarelo/laranja com ícone de alerta e texto "Worker parado · dados podem estar desatualizados · última verificação X min atrás"

### QW-2 — Overflow horizontal nas tabelas
- [ ] `app/(dashboard)/devices/page.tsx` — envolver tabela com `<div className="overflow-x-auto">`
- [ ] `app/(dashboard)/links/page.tsx` — envolver tabela com `<div className="overflow-x-auto">`
- [ ] `app/(dashboard)/devices/[id]/page.tsx` — envolver tabelas de histórico com `<div className="overflow-x-auto">`

### QW-3 — Substituir `confirm()` por AlertDialog
- [ ] `app/(dashboard)/links/page.tsx` linha 240 — substituir `window.confirm()` pelo mesmo padrão `<AlertDialog>` já usado em `devices/[id]/page.tsx`
- [ ] `app/(dashboard)/notes/page.tsx` linha 144 — idem
- [ ] Extrair `<ConfirmDialog>` como componente reutilizável em `components/confirm-dialog.tsx` para evitar regressões futuras

### QW-4 — Grid responsivo no device detail
- [ ] `app/(dashboard)/devices/[id]/page.tsx` linha 237 — `grid-cols-4` → `grid-cols-2 sm:grid-cols-4`
- [ ] `app/(dashboard)/devices/[id]/page.tsx` linha 274 — idem
- [ ] Verificar skeleton de loading na linha 150 — também usa `grid-cols-4` fixo

### QW-5 — aria-label em botões ícone
- [ ] `app/(dashboard)/links/page.tsx` linhas 416–433 — adicionar `aria-label="Ver detalhes"`, `aria-label="Editar link"`, `aria-label="Excluir link"` nos botões da tabela
- [ ] Auditar todos os botões ícone sem texto visível no projeto e adicionar `aria-label` descritivo

### QW-6 — Texto acessível no StatusBadge
- [ ] `components/status-badge.tsx` — adicionar `<span className="sr-only">{status === "online" ? "Online" : "Offline"}</span>` para leitores de tela
- [ ] O ponto animado atual não comunica estado para tecnologias assistivas

### QW-7 — Remover inline styles da sidebar
- [ ] `components/sidebar.tsx` linha 158 — `style={{ padding: "18px 14px 14px" }}` → classes Tailwind `pt-[18px] px-3.5 pb-3.5`
- [ ] Auditar outros `style={{}}` hardcoded e migrar para tokens Tailwind onde possível

---

## Melhorias Médias — 2–8h cada

### MM-1 — Unificar sistema de filtros
- [ ] `app/(dashboard)/notes/page.tsx` linhas 222–263 usa `<Button size="sm">` para filtros de severidade/status
- [ ] Migrar para `<FilterChip>` (já usado em Devices, Links, Incidents) para consistência visual
- [ ] Garantir que todos os filtros do projeto usem o mesmo componente

### MM-2 — Eliminar polling duplicado da sidebar
- [ ] `components/sidebar.tsx` linhas 129–154 faz fetch de `/api/devices` e `/api/links` a cada 30s
- [ ] As páginas `/`, `/devices`, `/links` também fazem poll dos mesmos endpoints → 2 chamadas simultâneas por endpoint
- [ ] Solução A (simples): passar counts como props via layout servidor
- [ ] Solução B (robusta): criar contexto React `DeviceCountContext` compartilhado entre sidebar e páginas

### MM-3 — Indicador de última atualização mais proeminente
- [ ] Timestamp "Atualizado às HH:MM:SS" está em 11.5px muted no Topbar — quase invisível
- [ ] Para NOC é crítico saber quando os dados foram atualizados pela última vez
- [ ] Tornar o indicador mais visível (badge no canto) e adicionar contagem regressiva até o próximo poll (ex: "próximo em 14s")

### MM-4 — Campo de busca por texto em Dispositivos
- [ ] Nenhuma página tem campo de busca free-text
- [ ] Adicionar `<input placeholder="Buscar por nome ou IP..." />` filtrando por `name.includes()` / `ip.startsWith()` no estado local
- [ ] Aplicar em `app/(dashboard)/devices/page.tsx` como primeira iteração
- [ ] Considerar também em `app/(dashboard)/incidents/page.tsx`

### MM-5 — Filtro por localização
- [ ] `Device.location` existe no modelo e aparece nos cards mas não é filtrável
- [ ] Adicionar `FilterChip` dinâmico populado com os valores únicos de `location` nos dispositivos
- [ ] Aplicar em `app/(dashboard)/devices/page.tsx` ao lado dos filtros de tipo

### MM-6 — Tooltip nos segmentos de uptime
- [ ] Os segmentos coloridos de 30 min em `DeviceDetailDrawer` e na página de detalhe não têm tooltip
- [ ] Adicionar Tooltip do shadcn informando período e status (ex: "14:00–14:30 · Offline")
- [ ] O componente `Tooltip` já está disponível no design system

---

## Melhorias Estruturais — > 1 sprint

### ME-1 — Dark mode com toggle
- [ ] As variáveis CSS `.dark` já estão definidas em `globals.css` (linhas 61–110)
- [ ] Instalar `next-themes` para persistência via `localStorage`
- [ ] Criar componente `<ThemeToggle>` e adicionar ao footer da sidebar
- [ ] Envolver `layout.tsx` raiz com `<ThemeProvider>`
- [ ] Testar todos os componentes no modo escuro (especialmente gráficos e badges)
- [ ] Para NOC com luz ambiente baixa, dark mode é essencial para reduzir fadiga visual

### ME-2 — Modo de alta densidade para NOC (compact view)
- [ ] Adicionar terceiro modo de view: "compact" além dos modos cards e tabela já existentes
- [ ] Compact view: grade de texto com dots coloridos, linhas de 28px, sem cards
- [ ] Permite visualizar 100+ dispositivos simultaneamente em tela de 27"
- [ ] Toggle salvo em `localStorage` para persistir entre sessões
- [ ] Layout alvo:
  ```
  ● AP-Sala1  192.168.1.10  23ms  |  ● AP-Sala2  192.168.1.11  18ms
  ● DVR-PTZ   192.168.2.50  —     |  ● MKT-WAN   10.0.0.1       5ms
  ○ CAM-Ext   192.168.3.20  ✗     |  ● DVR-Int   192.168.3.21  31ms
  ```

### ME-3 — Web Notifications para alertas no browser
- [ ] Implementar `Notification.requestPermission()` na primeira visita ao dashboard
- [ ] Disparar notificação push quando dispositivo muda de `online` → `offline` durante o polling
- [ ] Incluir nome do dispositivo, IP e localização na notificação
- [ ] Adicionar cooldown (ex: máx 1 notificação por dispositivo a cada 5 min) para não spammar
- [ ] Mostrar botão "Ativar notificações" no topbar se permissão ainda não foi concedida

### ME-4 — Acessibilidade estrutural (WCAG 2.1 AA completo)
- [ ] Auditoria completa com axe-core: `npm install --save-dev @axe-core/react` e integrar ao dev mode
- [ ] Adicionar `<caption>` ou `aria-label` em todas as tabelas
- [ ] Garantir navegação por teclado em todos os drawers (Escape para fechar, Tab dentro do drawer)
- [ ] Verificar contraste de cor de todos os textos muted (target: ratio ≥ 4.5:1)
- [ ] Adicionar `role="status"` e `aria-live="polite"` nos cards de KPI do dashboard
- [ ] Revisar formulários: todo `<input>` deve ter `<label>` associado via `htmlFor`

---

## Novos Componentes a Criar

| Componente | Arquivo alvo | Justificativa |
|---|---|---|
| `<WorkerStatusBanner>` | `components/worker-status-banner.tsx` | Crítico para NOC — worker caído é invisível |
| `<ConfirmDialog>` | `components/confirm-dialog.tsx` | Substituir `confirm()` e padronizar AlertDialog |
| `<DeviceSearchInput>` | `components/device-search-input.tsx` | Busca por nome/IP — nenhuma página tem |
| `<ThemeToggle>` | `components/theme-toggle.tsx` | Dark mode — CSS já pronto, falta o botão |
| `<CountdownBadge>` | `components/countdown-badge.tsx` | Indicar tempo até próximo poll no Topbar |

---

## Scorecard atual → meta

| Dimensão | Atual | Meta | Principais ações |
|---|---|---|---|
| Hierarquia visual | 7.5 | 9.0 | QW-1 (worker banner) + MM-3 (indicador de atualização) |
| Consistência | 7.0 | 9.5 | QW-3 (AlertDialog) + MM-1 (unificar filtros) + QW-7 (inline styles) |
| Feedback e estados | 7.5 | 9.5 | QW-3 + MM-4 (busca) + ME-3 (web notifications) |
| Acessibilidade | 4.5 | 8.5 | QW-5 + QW-6 + ME-4 (auditoria completa) |
| Fluxos de usuário | 8.0 | 9.5 | MM-4 (busca) + MM-5 (filtro location) |
| Responsividade | 6.5 | 9.0 | QW-2 (overflow) + QW-4 (grid responsivo) |
| Performance percebida | 7.0 | 9.0 | MM-2 (dedup polling) + MM-3 (countdown) |
| Uso em NOC | 7.5 | 9.5 | ME-1 (dark mode) + ME-2 (compact view) + ME-3 (notifications) |
| **Nota geral** | **6.9** | **9.3** | |

---

## Resumo de impacto por esforço

| Prioridade | Item | Esforço | Ganho UX |
|---|---|---|---|
| 🔴 Alta | QW-1 — Banner worker stale | < 1h | Operacional crítico |
| 🔴 Alta | QW-2 — overflow-x-auto tabelas | < 30min | Funcional em 1024px |
| 🔴 Alta | QW-3 — AlertDialog unificado | 2h | Consistência + segurança |
| 🟡 Média | ME-1 — Dark mode | 4h | Conforto em NOC |
| 🟡 Média | MM-4 — Busca por texto | 3h | Usabilidade com 50+ devices |
| 🟡 Média | MM-2 — Dedup polling sidebar | 3h | Performance percebida |
| 🟡 Média | ME-4 — Acessibilidade estrutural | 6h | WCAG 2.1 AA |
| 🟢 Baixa | ME-2 — Compact view NOC | 1 sprint | NOC de alto volume |
| 🟢 Baixa | ME-3 — Web Notifications | 1 sprint | Alerta proativo |
| 🟢 Baixa | MM-5 — Filtro por localização | 2h | Multi-site |

**Nota atual: 6.9 → Nota estimada após todos os itens: 9.3**
