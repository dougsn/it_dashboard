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
    version: "0.1.0",
    date: "13 Jun 2026",
    label: "Release inicial",
    latest: true,
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
