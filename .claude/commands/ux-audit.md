---
description: Audita a interface do WatchIT Tower com foco em UX/UI — acessibilidade, consistência visual, fluxos de usuário e boas práticas — e entrega sugestões priorizadas de melhoria
allowed-tools: Read, Bash(find:*), Bash(grep:*)
---

Você é um especialista em UX/UI e design de sistemas com experiência em dashboards de monitoramento operacional. Realize uma auditoria completa de UX/UI do projeto WatchIT Tower.

## Contexto do projeto

- **WatchIT Tower** — dashboard de monitoramento de TI local (dispositivos Mikrotik, DVRs, câmeras, APs UniFi)
- Stack: Next.js 14 App Router, shadcn/ui v4 (Base UI), Tailwind CSS
- Personas principais: técnico de TI ou analista de infraestrutura que monitora 10–200 dispositivos
- Uso: visualização contínua em tela dedicada (NOC) + operação reativa quando há incidentes

## Passo 1 — Leia o layout base e componentes compartilhados

Leia **obrigatoriamente** (use Read em cada um):

1. `app/(dashboard)/layout.tsx` — estrutura de layout, sidebar, main content
2. `components/sidebar.tsx` — navegação, hierarquia de itens, indicadores de estado
3. `components/topbar.tsx` — cabeçalho, breadcrumbs, indicador "live"
4. `components/status-badge.tsx` — consistência visual de estados Online/Offline
5. `components/device-type-badge.tsx` — hierarquia visual de tipos de dispositivo
6. `components/empty-state.tsx` — feedback quando não há dados
7. `components/skeleton-list.tsx` — feedback de carregamento

## Passo 2 — Leia as páginas principais

Leia cada página com foco no fluxo do usuário, hierarquia de informação e estados da UI:

8. `app/(dashboard)/page.tsx` — Overview/dashboard principal (KPIs, grid de devices, links)
9. `app/(dashboard)/devices/page.tsx` — Lista de dispositivos (tabela, filtros, ações)
10. `app/(dashboard)/devices/[id]/page.tsx` — Detalhe do dispositivo (gráficos, histórico)
11. `app/(dashboard)/links/page.tsx` — Gerenciamento de links (utilização de banda)
12. `app/(dashboard)/incidents/page.tsx` — Histórico de incidentes (paginação, filtros)
13. `app/(dashboard)/notes/page.tsx` — Notas de segurança
14. `app/(dashboard)/reports/page.tsx` — Exportação de relatórios PDF

## Passo 3 — Leia os componentes de dados e interação

15. `components/device-card.tsx` — Card do dispositivo no grid do overview
16. `components/device-detail-drawer.tsx` — Drawer lateral de detalhe rápido
17. `components/device-form.tsx` — Formulário de criação/edição de dispositivo
18. `components/link-detail-drawer.tsx` — Drawer de detalhe de link
19. `components/metrics-chart.tsx` — Gráfico de métricas (AreaChart)
20. `components/ping-chart.tsx` e `components/ping-sparkline.tsx` — Visualizações de ping
21. `components/bandwidth-cell.tsx` — Célula de utilização de banda com progress bar

## Passo 4 — Mapeie os arquivos de componentes UI

```bash
find components/ui -name "*.tsx" | sort
```

Leia os componentes customizados mais relevantes (button, dialog, table, badge, card, drawer).

## Passo 5 — Busque padrões e inconsistências

Execute as buscas abaixo e analise os resultados:

```bash
# Cores hardcoded vs tokens Tailwind
grep -r "style={{" app/ components/ --include="*.tsx" | grep -v "node_modules" | head -30

# Uso de text-sm, text-xs, text-base — inconsistência tipográfica
grep -rn "text-sm\|text-xs\|text-base\|text-lg" components/ app/\(dashboard\) --include="*.tsx" | wc -l

# Estados de loading — onde há e onde falta
grep -rn "loading\|isLoading\|skeleton\|Skeleton" app/\(dashboard\) --include="*.tsx" | head -30

# Estados vazios — onde há e onde falta
grep -rn "EmptyState\|empty-state\|length === 0\|\.length == 0" app/\(dashboard\) --include="*.tsx" | head -20

# Uso de aria-label, role — acessibilidade
grep -rn "aria-label\|aria-describedby\|role=" components/ app/ --include="*.tsx" | grep -v "node_modules" | wc -l

# Mensagens de erro para o usuário
grep -rn "toast\|sonner\|alert\|setError" app/\(dashboard\) --include="*.tsx" | head -20
```

## Passo 6 — Avalie cada dimensão de UX/UI

Para cada dimensão abaixo, dê uma nota de 0–10 e liste os problemas encontrados com referência ao arquivo:linha.

### 6.1 — Hierarquia visual e escaneabilidade
- O usuário consegue entender o estado geral do ambiente em menos de 5 segundos?
- KPIs mais importantes estão em destaque?
- Há contraste adequado entre elementos primários e secundários?
- Tipografia: uso consistente de tamanhos, pesos e cores para hierarquia?

### 6.2 — Consistência de design
- Componentes com a mesma função têm a mesma aparência em todas as páginas?
- Paleta de cores consistente? (verde=online, vermelho=offline, amarelo=warning)
- Espaçamentos e padding seguem escala consistente?
- Ícones usados de forma consistente?

### 6.3 — Feedback e estados da UI
- Toda ação assíncrona tem feedback visual (loading state)?
- Erros são comunicados de forma clara e acionável?
- Listas vazias têm empty state informativo (não apenas "nenhum resultado")?
- Formulários têm validação inline com mensagens úteis?
- Confirmações destrutivas (delete) têm diálogo de confirmação?

### 6.4 — Acessibilidade (WCAG 2.1 AA)
- Elementos interativos têm `aria-label` quando necessário?
- Navegação por teclado funcional (Tab, Enter, Escape)?
- Textos com contraste mínimo de 4.5:1 sobre o fundo?
- Imagens e ícones sem texto têm `aria-label` ou `aria-hidden`?
- Formulários têm `<label>` associado a cada input?

### 6.5 — Fluxos de usuário (User Flows)
- Fluxo de adicionar novo dispositivo: quantos cliques? Há fricção desnecessária?
- Fluxo de investigar um incidente: dashboard → device → histórico — é intuitivo?
- Ações destrutivas são difíceis de acionar acidentalmente?
- A navegação reflete a frequência de uso de cada seção?

### 6.6 — Responsividade e layout
- Dashboard funciona em telas menores (1280px, 1024px)?
- Tabelas longas têm overflow correto ou scroll horizontal?
- Drawers e modais funcionam bem em telas menores?
- A sidebar tem comportamento responsivo?

### 6.7 — Performance percebida
- Há skeleton screens para carregamentos longos?
- O polling de 30s causa re-renders perceptíveis (flash de conteúdo)?
- Gráficos têm animações suaves?
- Há estados otimistas para ações rápidas?

### 6.8 — Densidade de informação (NOC use case)
- Para uso em tela de NOC (visão contínua), o dashboard é legível à distância?
- Cores de alerta são perceptíveis para daltônicos (não apenas vermelho/verde)?
- Há modo de alta densidade para monitorar muitos devices simultaneamente?

## Passo 7 — Identifique quick wins e melhorias estruturais

Separe os problemas em três categorias:

**Quick wins (< 2h de implementação cada):**
Melhorias que podem ser feitas imediatamente com impacto visual alto.

**Melhorias médias (2–8h cada):**
Refatorações de componentes ou novos padrões de interação.

**Iniciativas grandes (> 1 sprint):**
Redesigns de página, novos sistemas de design, fluxos novos.

## Passo 8 — Entrega final

Produza um relatório com as seguintes seções:

### Scorecard UX/UI

| Dimensão | Nota | Maiores problemas |
|---|---|---|
| Hierarquia visual | X/10 | ... |
| Consistência | X/10 | ... |
| Feedback e estados | X/10 | ... |
| Acessibilidade | X/10 | ... |
| Fluxos de usuário | X/10 | ... |
| Responsividade | X/10 | ... |
| Performance percebida | X/10 | ... |
| Uso em NOC | X/10 | ... |
| **Nota geral** | **X/10** | |

### Top 5 problemas críticos
Para cada um: descrição, impacto no usuário, arquivo:linha, solução recomendada.

### Quick wins priorizados
Lista ordenada por impacto/esforço, com indicação de qual arquivo modificar.

### Melhorias estruturais
Sugestões de novos layouts, padrões de interação ou sistemas de design com wireframe em texto (ASCII) quando necessário para ilustrar a ideia.

### Sugestões de novos componentes ou padrões
Componentes que estão faltando e fariam diferença (ex: timeline visual, mapa de calor de status, painel de alertas em tempo real).

> **Importante:** Baseie cada observação em evidência do código lido. Não assuma o que não foi verificado. Se um componente não existir, diga que está faltando. Priorize o ponto de vista do usuário técnico que monitora infraestrutura, não o de um usuário web genérico.
