import { Topbar } from "@/components/topbar";
import { ShieldCheck, Sparkles, Wrench, RefreshCcw } from "lucide-react";

type ChangeType = "feat" | "fix" | "security" | "refactor" | "perf";

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  label?: string;
  latest?: boolean;
  changes: Change[];
}

const RELEASES: Release[] = [
  {
    version: "0.2.1",
    date: "14 Jun 2026",
    label: "Hardening de segurança e estabilidade",
    latest: true,
    changes: [
      { type: "security", text: "Autorização por papel reforçada — VIEWER não obtém mais tokens de webhook nem dispara verificações de rede/tráfego ao vivo (apenas OPERADOR+)" },
      { type: "security", text: "Trocar a senha de um usuário invalida imediatamente todas as sessões antigas dele" },
      { type: "security", text: "Community SNMP nunca mais é retornada nas respostas da API — exposta apenas como indicador 'configurado'" },
      { type: "security", text: "Rate limiter de login agora é atômico — fecha brecha de concorrência que permitia exceder o limite de tentativas" },
      { type: "security", text: "Validação de chaves de criptografia/webhook no startup do servidor (falha rápida em vez de erro críptico na primeira requisição)" },
      { type: "security", text: "Mensagens de erro internas do banco não vazam mais ao cliente; IP de auditoria só confia em proxy reverso quando configurado (TRUST_PROXY)" },
      { type: "fix", text: "Worker mais resiliente — timeout por verificação evita travamento, e alertas de queda nunca disparam em duplicidade" },
      { type: "fix", text: "Páginas mostram erro com opção de recarregar em vez de ficar presas carregando; novas telas de erro evitam tela branca" },
      { type: "fix", text: "Trocar o período nos gráficos não embaralha mais os dados (corridas de requisição canceladas corretamente)" },
      { type: "fix", text: "Cadastro valida formato de IP; filtros de data inválidos retornam erro claro; formulários impedem envio duplicado" },
      { type: "perf", text: "Índices de banco em tipo de dispositivo, links Mikrotik e auditoria por IP; exportações e listas de eventos com limite de memória" },
      { type: "perf", text: "Detecção de incidentes, timeline e relatórios processados no banco (transições e agregações) — escalam para janelas longas e frotas grandes sem carregar todo o histórico na memória" },
      { type: "perf", text: "Índice por data no histórico de status e eventos de link — painel, saúde do sistema e limpeza deixam de varrer a tabela inteira (consultas por período ~centenas de vezes mais rápidas em bases grandes)" },
      { type: "perf", text: "Sparklines do painel buscam só os últimos pontos por dispositivo no banco; reconcile do worker agrupa dispositivos alterados numa única consulta" },
      { type: "fix", text: "Acessibilidade: cards e linhas clicáveis navegáveis por teclado, estados ARIA (pressed/expanded/sort) em filtros, seções e tabelas, e rótulo no botão Voltar" },
      { type: "fix", text: "Busca de dispositivos por IP encontra trechos no meio do endereço (ex: '168.1'), não apenas o início" },
      { type: "feat", text: "Badges da sidebar (dispositivos offline, links online) atualizam ao vivo a cada 30s, sem precisar recarregar a página" },
      { type: "security", text: "Criação em massa de dispositivos passa a criptografar a community SNMP em repouso, como os demais cadastros" },
      { type: "refactor", text: "Qualidade interna: helpers de formatação e componentes de drawer deduplicados; cobertura de testes ampliada para 2FA, logout e autorização por papel (586 testes); dependências atualizadas" },
    ],
  },
  {
    version: "0.2.0",
    date: "14 Jun 2026",
    label: "Segurança e acessibilidade",
    latest: false,
    changes: [
      { type: "security", text: "Autenticação em dois fatores (TOTP/2FA) — ativação via QR code, compatível com Google Authenticator e Authy" },
      { type: "security", text: "Gerenciamento de 2FA por usuário na página de administração — admins podem ativar/desativar para qualquer conta" },
      { type: "security", text: "session.user.id agora exposto corretamente pelo callback de sessão do NextAuth" },
      { type: "feat", text: "Página /profile — cada usuário gerencia seu próprio 2FA e visualiza informações da conta" },
      { type: "feat", text: "Manual do usuário integrado (/manual) — documentação completa da plataforma em 10 seções" },
      { type: "feat", text: "Manual do desenvolvedor (/dev-manual) — arquitetura, padrões e guias internos, restrito a administradores" },
      { type: "refactor", text: "Rodapé da sidebar vira link para /profile; nome e role do usuário clicáveis" },
      { type: "refactor", text: "Coluna 2FA na tabela de usuários com badge de status Ativo/Inativo" },
      { type: "feat", text: "Manual de testes integrado (/test-manual) — 12 seções cobrindo estratégia, Jest config, todas as suítes (API, worker, componentes, segurança, integração) e padrões de mock; restrito a administradores" },
      { type: "fix", text: "Contraste WCAG AA (rounds 1–3) — muted-foreground, primary, success, destructive e warning (#8c5500) corrigidos; versão da sidebar sem opacity; regiões roláveis com tabIndex para teclado" },
      { type: "fix", text: "Acessibilidade: aria-labels em botões ícone-apenas, aria-hidden em ícones decorativos, landmarks únicos" },
      { type: "fix", text: "Migrações alert_fields e rate_limit_table aplicadas ao banco de dados" },
    ],
  },
  {
    version: "0.1.0",
    date: "13 Jun 2026",
    label: "Release inicial",
    latest: false,
    changes: [
      { type: "security", text: "Auditoria de segurança completa — 24 achados documentados (SEC-001 a SEC-024), todos os críticos e altos resolvidos" },
      { type: "security", text: "SEC-019: criação em massa de dispositivos restringida ao perfil OPERADOR" },
      { type: "security", text: "SEC-020: exportação CSV protegida contra injeção de fórmula (Excel/LibreOffice)" },
      { type: "security", text: "SEC-023: rotas de teste Omada/UniFi bloqueadas para VIEWER (prevenção de SSRF)" },
      { type: "feat", text: "Integração Omada Northbound API — autenticação OAuth2, clientes por AP, painel dedicado" },
      { type: "feat", text: "Integração UniFi Controller — clientes por AP, painel dedicado" },
      { type: "feat", text: "Clientes DHCP do RouterOS exibidos no detalhe do dispositivo" },
      { type: "feat", text: "Painéis dedicados por tipo de dispositivo (Mikrotik, Omada, UniFi)" },
      { type: "feat", text: "Sistema de auditoria de alterações — log completo com filtros, paginação e exportação CSV" },
      { type: "feat", text: "Controle de usuários com roles ADMIN / OPERADOR / VIEWER" },
      { type: "feat", text: "Página de sistema: métricas do banco e controle de retenção de logs" },
      { type: "feat", text: "Relatórios por dispositivo: downtime, ping, CPU/memória e exportação CSV" },
      { type: "feat", text: "KPI 'Clientes Wi-Fi' unifica contagem de APs UniFi e Omada" },
      { type: "feat", text: "Versão e build number no rodapé da sidebar (via git rev-list)" },
      { type: "refactor", text: "Rebrand: aplicação renomeada para WatchIT Tower com ícone de farol" },
      { type: "refactor", text: "Redesign completo da interface — tokens, sidebar, topbar, cards e tabelas (Fases 1–7)" },
      { type: "refactor", text: "Página de login reformulada com branding, recursos e campo de senha com toggle" },
      { type: "fix", text: "Cálculo de downtime corrigido — não inflava períodos sem histórico suficiente" },
      { type: "fix", text: "Filtro OMADA_AP adicionado na visão geral e na página de dispositivos" },
      { type: "fix", text: "Polling do detalhe do dispositivo atualiza gráficos automaticamente" },
      { type: "fix", text: "Cache HTTP desabilitado nas rotas monitoradas — dados sempre frescos" },
      { type: "fix", text: "Strings do RouterOS sanitizadas antes de gravar no PostgreSQL" },
      { type: "fix", text: "Horários padronizados para America/Sao_Paulo em toda a interface" },
    ],
  },
];

const TYPE_ORDER: ChangeType[] = ["security", "feat", "refactor", "fix", "perf"];

const TYPE_META: Record<ChangeType, { label: string; icon: React.ElementType; color: string }> = {
  security: { label: "Segurança",             icon: ShieldCheck,  color: "text-destructive" },
  feat:     { label: "Novas funcionalidades", icon: Sparkles,     color: "text-primary" },
  refactor: { label: "Melhorias",             icon: RefreshCcw,   color: "text-foreground" },
  fix:      { label: "Correções",             icon: Wrench,       color: "text-success" },
  perf:     { label: "Performance",           icon: Sparkles,     color: "text-warning" },
};

function groupByType(changes: Change[]): [ChangeType, Change[]][] {
  const map = new Map<ChangeType, Change[]>();
  for (const c of changes) {
    if (!map.has(c.type)) map.set(c.type, []);
    map.get(c.type)!.push(c);
  }
  return TYPE_ORDER.filter((t) => map.has(t)).map((t) => [t, map.get(t)!]);
}

export default function ChangelogPage() {
  return (
    <>
      <Topbar title="Changelog" subtitle="Histórico de versões e alterações do sistema" />

      <div className="p-8 max-w-3xl mx-auto divide-y divide-border">
        {RELEASES.map((release) => (
          <div key={release.version} className="py-10 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-8 md:gap-12">

            {/* Left — version meta */}
            <div className="md:w-36 shrink-0">
              <div className="md:sticky md:top-8 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[15px] font-bold tracking-tight">v{release.version}</span>
                  {release.latest && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary border border-primary/30 rounded-full px-1.5 py-px">
                      Atual
                    </span>
                  )}
                </div>
                {release.label && (
                  <p className="text-[12px] text-muted-foreground font-medium">{release.label}</p>
                )}
                <p className="text-[11px] text-muted-foreground/50 pt-0.5">{release.date}</p>
              </div>
            </div>

            {/* Right — changes */}
            <div className="flex-1 space-y-7">
              {groupByType(release.changes).map(([type, items]) => {
                const { label, icon: Icon, color } = TYPE_META[type];
                return (
                  <div key={type}>
                    <h3 className={`flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-widest mb-3 ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </h3>
                    <ul className="space-y-2.5">
                      {items.map((change, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-foreground/70 leading-relaxed">
                          <span className="mt-2 shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" />
                          {change.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>
    </>
  );
}
