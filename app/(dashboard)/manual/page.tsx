"use client";

import { useState, useEffect, useRef } from "react";
import { Topbar } from "@/components/topbar";
import {
  LayoutDashboard, Server, Network, AlertCircle, Router, RadioTower, Wifi,
  FileText, ShieldCheck, Users, Settings, ClipboardList, LogIn, KeyRound,
  Edit, Trash2, Search, Filter, Download, Bell, Moon,
  RefreshCw, ChevronRight, Menu, X, BookOpen, Cpu,
  Zap, Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections?: { id: string; title: string }[];
}

// ── Navigation sections ──────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "intro",
    title: "Introdução",
    icon: BookOpen,
  },
  {
    id: "acesso",
    title: "Acesso ao Sistema",
    icon: LogIn,
    subsections: [
      { id: "login", title: "Login" },
      { id: "2fa", title: "Autenticação em dois fatores" },
      { id: "perfis", title: "Perfis de usuário" },
    ],
  },
  {
    id: "visao-geral",
    title: "Visão Geral",
    icon: LayoutDashboard,
    subsections: [
      { id: "kpis", title: "KPIs e indicadores" },
      { id: "grid", title: "Grade de dispositivos" },
      { id: "links-dash", title: "Tabela de links" },
      { id: "timeline", title: "Linha do tempo" },
      { id: "incidentes-dash", title: "Últimos incidentes" },
    ],
  },
  {
    id: "dispositivos",
    title: "Dispositivos",
    icon: Server,
    subsections: [
      { id: "tipos", title: "Tipos de dispositivo" },
      { id: "listar", title: "Listar e filtrar" },
      { id: "adicionar", title: "Adicionar dispositivo" },
      { id: "bulk", title: "Cadastro em massa" },
      { id: "editar", title: "Editar e excluir" },
      { id: "detalhe", title: "Detalhe do dispositivo" },
      { id: "manutencao", title: "Janela de manutenção" },
    ],
  },
  {
    id: "links",
    title: "Links de Internet",
    icon: Network,
    subsections: [
      { id: "gerenciar-links", title: "Gerenciar links" },
      { id: "bandwidth", title: "Utilização de banda" },
      { id: "webhook", title: "Webhooks UP/DOWN" },
    ],
  },
  {
    id: "incidentes",
    title: "Incidentes",
    icon: AlertCircle,
  },
  {
    id: "paineis",
    title: "Painéis específicos",
    icon: Cpu,
    subsections: [
      { id: "mikrotik", title: "Mikrotik" },
      { id: "omada", title: "Omada" },
      { id: "unifi", title: "UniFi" },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    icon: FileText,
  },
  {
    id: "seguranca",
    title: "Segurança",
    icon: ShieldCheck,
  },
  {
    id: "administracao",
    title: "Administração",
    icon: Settings,
    subsections: [
      { id: "usuarios", title: "Usuários" },
      { id: "totp-admin", title: "Configurar 2FA" },
      { id: "sistema", title: "Sistema" },
      { id: "audit", title: "Logs de alterações" },
    ],
  },
  {
    id: "atalhos",
    title: "Atalhos e dicas",
    icon: Zap,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 mb-12">
      {children}
    </section>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-3">
      {children}
    </h2>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-6 text-base font-bold text-foreground mt-8 mb-3">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-none space-y-1.5 mb-4 ml-1">{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-[14px] text-muted-foreground leading-relaxed">
      <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Callout({
  variant = "info",
  children,
}: {
  variant?: "info" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info:    "bg-primary/5 border-primary/30 text-primary",
    warning: "bg-warning/5 border-warning/30 text-warning",
    tip:     "bg-success/5 border-success/30 text-success",
  };
  const labels = { info: "Nota", warning: "Atenção", tip: "Dica" };
  return (
    <div className={cn("border rounded-lg p-4 mb-4 text-[13px] leading-relaxed", styles[variant])}>
      <span className="font-bold">{labels[variant]}: </span>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

function Badge({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "green" | "blue" | "purple" | "red" }) {
  const cls = {
    default: "bg-muted text-muted-foreground",
    green:   "bg-success/10 text-success",
    blue:    "bg-primary/10 text-primary",
    purple:  "bg-purple-500/10 text-purple-500",
    red:     "bg-destructive/10 text-destructive",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold mr-1", cls[color])}>
      {children}
    </span>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto mb-6 rounded-lg border border-border">
      <table className="w-full text-[13px]">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-semibold text-muted-foreground bg-muted/50 border-b border-border">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-foreground border-b border-border/50 last:border-0">{children}</td>;
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ManualPage() {
  const [activeId, setActiveId] = useState("intro");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Highlight active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 }
    );
    const headings = document.querySelectorAll("section[id], h3[id]");
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <>
      <Topbar
        title="Manual do Usuário"
        subtitle="Guia completo de uso da plataforma WatchIT Tower"
      />

      <div className="flex min-h-0 relative">
        {/* Sidebar toggle for small screens */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Fechar índice" : "Abrir índice"}
          className="fixed bottom-6 right-6 z-50 lg:hidden h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
        >
          {sidebarOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        {/* Manual sidebar */}
        <aside
          aria-label="Índice do manual"
          tabIndex={0}
          className={cn(
            "w-60 shrink-0 border-r border-border bg-card overflow-y-auto sticky top-0 h-[calc(100vh-57px)] transition-all duration-200",
            sidebarOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="p-3 pt-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[.09em] text-muted-foreground px-2 pb-2">
              Conteúdo
            </div>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeId === section.id || section.subsections?.some((s) => s.id === activeId);
              return (
                <div key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.75 rounded-[8px] text-[13px] font-semibold text-left transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("h-3.75 w-3.75 shrink-0", isActive ? "text-accent-foreground" : "")} />
                    {section.title}
                  </button>
                  {section.subsections && isActive && (
                    <div className="ml-5 border-l border-border/60 pl-3 mt-0.5 mb-0.5">
                      {section.subsections.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => scrollTo(sub.id)}
                          className={cn(
                            "w-full text-left px-2 py-1.25 rounded-[6px] text-[12px] font-medium transition-colors",
                            activeId === sub.id
                              ? "text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div ref={contentRef} tabIndex={0} className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">

            {/* ── Introdução ──────────────────────────────────────── */}
            <Section id="intro">
              <H1><BookOpen className="h-6 w-6 text-primary" /> Introdução</H1>
              <P>
                O <strong>WatchIT Tower</strong> é uma plataforma de monitoramento de TI para redes internas.
                Ele acompanha roteadores Mikrotik, câmeras IP, DVRs, APs UniFi e Omada, e links de internet
                em tempo real, exibindo status, alertas e histórico em um único painel.
              </P>
              <P>
                Este manual descreve todas as funcionalidades disponíveis, como navegá-las e como
                administrar o sistema. As seções estão organizadas da mesma forma que o menu lateral
                da plataforma.
              </P>
              <Callout variant="info">
                O dashboard atualiza automaticamente a cada 30 segundos. Não é necessário recarregar a página manualmente.
              </Callout>

              <H2 id="requisitos-acesso">Requisitos de acesso</H2>
              <UL>
                <LI>Navegador moderno (Chrome 100+, Firefox 100+, Edge 100+, Safari 16+)</LI>
                <LI>Acesso à rede local onde o servidor WatchIT Tower está rodando</LI>
                <LI>Credenciais de acesso fornecidas pelo administrador</LI>
              </UL>
            </Section>

            {/* ── Acesso ──────────────────────────────────────────── */}
            <Section id="acesso">
              <H1><LogIn className="h-6 w-6 text-primary" /> Acesso ao Sistema</H1>

              <H2 id="login">Login</H2>
              <P>
                Acesse a URL do dashboard em seu navegador. A página de login solicita
                <strong> nome de usuário</strong> e <strong>senha</strong>.
              </P>
              <UL>
                <LI>Digite seu usuário e senha nos campos correspondentes.</LI>
                <LI>Clique em <strong>Entrar</strong> ou pressione Enter.</LI>
                <LI>Em caso de erro, verifique caps lock e tente novamente. Após 10 tentativas em 15 minutos, o acesso é bloqueado temporariamente por IP.</LI>
              </UL>
              <Callout variant="warning">
                O sistema não possui recuperação de senha por e-mail. Em caso de bloqueio ou senha esquecida, contate o administrador do sistema.
              </Callout>

              <H2 id="2fa">Autenticação em dois fatores (2FA)</H2>
              <P>
                Se o administrador habilitou o 2FA em sua conta, após informar usuário e senha
                será exibido um campo adicional solicitando o código de 6 dígitos gerado pelo
                seu aplicativo autenticador (Google Authenticator, Authy, etc.).
              </P>
              <UL>
                <LI>Abra o aplicativo autenticador no seu celular.</LI>
                <LI>Localize a entrada <strong>WatchIT Tower</strong>.</LI>
                <LI>Digite o código de 6 dígitos exibido antes que ele expire (validade de 30 segundos).</LI>
                <LI>Clique em <strong>Verificar</strong>.</LI>
              </UL>
              <Callout variant="tip">
                Para configurar ou remover o 2FA da sua conta, acesse <strong>Administração → Usuários</strong> (requer perfil ADMIN).
              </Callout>

              <H2 id="perfis">Perfis de usuário</H2>
              <P>
                O sistema possui três perfis com permissões diferentes:
              </P>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Perfil</Th>
                    <Th>O que pode fazer</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td><Badge color="red">ADMIN</Badge></Td>
                    <Td>Acesso total — gerencia usuários, configurações do sistema, logs de auditoria e todos os dispositivos/links.</Td>
                  </tr>
                  <tr>
                    <Td><Badge color="blue">OPERADOR</Badge></Td>
                    <Td>Pode criar, editar e excluir dispositivos e links. Pode testar conexões RouterOS/UniFi/Omada. Não acessa administração de usuários.</Td>
                  </tr>
                  <tr>
                    <Td><Badge color="default">VIEWER</Badge></Td>
                    <Td>Somente leitura — visualiza todos os painéis, dispositivos, links, incidentes e relatórios, mas não pode criar nem alterar nada.</Td>
                  </tr>
                </tbody>
              </TableWrap>

              <H2 id="logout">Sair do sistema</H2>
              <P>
                Para encerrar a sessão, passe o mouse sobre seu nome no rodapé da sidebar e clique
                no ícone de saída (<strong>→</strong>). A sessão é invalidada imediatamente no servidor
                e o token JWT é bloqueado.
              </P>
            </Section>

            {/* ── Visão Geral ─────────────────────────────────────── */}
            <Section id="visao-geral">
              <H1><LayoutDashboard className="h-6 w-6 text-primary" /> Visão Geral</H1>
              <P>
                A página inicial (<strong>/</strong>) é o painel central de monitoramento.
                Ela consolida o estado de toda a infraestrutura em uma única tela,
                atualizando a cada 30 segundos automaticamente. Os badges do menu lateral
                (dispositivos offline e links online) também se atualizam sozinhos a cada
                30 segundos, sem precisar recarregar a página.
              </P>

              <H2 id="kpis">KPIs e indicadores</H2>
              <P>No topo da página estão os cartões de métricas principais:</P>
              <TableWrap>
                <thead>
                  <tr><Th>KPI</Th><Th>O que mostra</Th></tr>
                </thead>
                <tbody>
                  <tr><Td>Dispositivos Online</Td><Td>Quantidade de dispositivos ativos vs total cadastrado.</Td></tr>
                  <tr><Td>Uptime Médio</Td><Td>Percentual médio de disponibilidade das últimas 24h.</Td></tr>
                  <tr><Td>Incidentes Hoje</Td><Td>Número de eventos de queda registrados no dia.</Td></tr>
                  <tr><Td>Links Ativos</Td><Td>Links de internet online vs total.</Td></tr>
                  <tr><Td>Clientes Wi-Fi</Td><Td>Total de clientes conectados em APs UniFi e Omada.</Td></tr>
                  <tr><Td>Saúde do Sistema</Td><Td>Estado do worker de monitoramento (OK / Parado / Desconhecido).</Td></tr>
                </tbody>
              </TableWrap>
              <Callout variant="warning">
                Se o indicador <strong>Saúde do Sistema</strong> mostrar "Worker Parado", os checks de monitoramento
                foram interrompidos. Verifique o processo <code>npm run worker</code> no servidor.
              </Callout>

              <H2 id="grid">Grade de dispositivos</H2>
              <P>
                Abaixo dos KPIs há uma grade com cartão para cada dispositivo cadastrado.
                Cada cartão exibe: nome, tipo, localização, status (online/offline),
                ping, uptime e sparkline dos últimos pings.
              </P>
              <UL>
                <LI>Clique em um cartão para abrir o painel lateral de detalhes sem sair da página.</LI>
                <LI>O botão <strong>Ver detalhes</strong> no painel lateral navega para a página completa do dispositivo.</LI>
                <LI>Use os filtros no topo (<strong>Todos / Online / Offline / Em manutenção</strong>) para focar em um subconjunto.</LI>
                <LI>O modo <strong>Compacto</strong> (ícone de linhas densas) reduz a altura dos cartões para visualização NOC.</LI>
              </UL>

              <H2 id="links-dash">Tabela de links</H2>
              <P>
                A seção de links exibe o status de cada link de internet com barra de utilização de banda.
                As cores indicam:
              </P>
              <UL>
                <LI><Badge color="green">Verde</Badge> — utilização abaixo de 70% da banda contratada.</LI>
                <LI><Badge color="default">Âmbar</Badge> — utilização entre 70% e 90%.</LI>
                <LI><Badge color="red">Vermelho</Badge> — utilização acima de 90%.</LI>
              </UL>

              <H2 id="timeline">Linha do tempo</H2>
              <P>
                Abaixo da tabela de links há uma linha do tempo unificada com os eventos recentes
                (dispositivos e links) nas últimas 24 horas. Cada evento exibe horário, tipo e descrição.
              </P>

              <H2 id="incidentes-dash">Últimos incidentes</H2>
              <P>
                A parte inferior da página lista os incidentes mais recentes
                (quedas e retornos) com duração calculada. Clique em
                <strong> Ver todos</strong> para ir à página completa de incidentes.
              </P>
            </Section>

            {/* ── Dispositivos ────────────────────────────────────── */}
            <Section id="dispositivos">
              <H1><Server className="h-6 w-6 text-primary" /> Dispositivos</H1>
              <P>
                A seção <strong>Dispositivos</strong> permite cadastrar e monitorar todos os
                equipamentos da rede. Cada dispositivo tem seus protocolos de monitoramento
                configurados individualmente.
              </P>

              <H2 id="tipos">Tipos de dispositivo</H2>
              <TableWrap>
                <thead><tr><Th>Tipo</Th><Th>Protocolos disponíveis</Th></tr></thead>
                <tbody>
                  <tr><Td>MIKROTIK</Td><Td>Ping, HTTP, SNMP, RouterOS API</Td></tr>
                  <tr><Td>CAMERA_IP</Td><Td>Ping, HTTP</Td></tr>
                  <tr><Td>DVR_NVR</Td><Td>Ping, HTTP, SNMP</Td></tr>
                  <tr><Td>OMADA_AP</Td><Td>Ping, Omada Northbound API</Td></tr>
                  <tr><Td>UNIFI_AP</Td><Td>Ping, UniFi Controller API</Td></tr>
                  <tr><Td>SERVER</Td><Td>Ping, HTTP, SNMP</Td></tr>
                  <tr><Td>SWITCH</Td><Td>Ping, SNMP</Td></tr>
                  <tr><Td>GENERIC</Td><Td>Ping, HTTP</Td></tr>
                </tbody>
              </TableWrap>

              <H2 id="listar">Listar e filtrar</H2>
              <P>
                A página <strong>/devices</strong> exibe todos os dispositivos em uma tabela com
                status, tipo, localização e métricas do último check.
              </P>
              <UL>
                <LI>Use a barra de <Search className="h-3.5 w-3.5 inline" /> busca para filtrar por nome ou IP.</LI>
                <LI>Use os filtros de <Filter className="h-3.5 w-3.5 inline" /> tipo, status e localização para segmentar a lista.</LI>
                <LI>Os filtros são preservados na URL — você pode salvar ou compartilhar a URL com os filtros aplicados.</LI>
                <LI>Clique no cabeçalho de coluna para ordenar.</LI>
              </UL>

              <H2 id="adicionar">Adicionar dispositivo</H2>
              <P>
                Clique em <strong>+ Novo dispositivo</strong> no topo da página de dispositivos.
                O formulário está organizado em seções expansíveis:
              </P>
              <UL>
                <LI><strong>Informações básicas:</strong> nome, IP, tipo, localização e notas.</LI>
                <LI><strong>Ping:</strong> habilitado por padrão. Intervalo de verificação configurável (10s a 300s).</LI>
                <LI><strong>HTTP:</strong> porta e caminho do endpoint a verificar.</LI>
                <LI><strong>SNMP:</strong> community string e porta (padrão 161).</LI>
                <LI><strong>RouterOS:</strong> usuário e senha da API do Mikrotik (porta padrão 8728). Credenciais armazenadas criptografadas.</LI>
                <LI><strong>UniFi:</strong> endereço do controller, chave de API ou usuário/senha, site e porta.</LI>
                <LI><strong>Omada:</strong> endereço do controller, Client ID e Client Secret da Northbound API.</LI>
              </UL>
              <Callout variant="tip">
                Use os botões <strong>Testar conexão</strong> nas seções RouterOS, UniFi e Omada antes de salvar para validar
                que as credenciais estão corretas e o controller está acessível.
              </Callout>
              <Callout variant="info">
                Credenciais de RouterOS, UniFi, Omada e SNMP são criptografadas com AES-256-GCM antes de serem gravadas no banco.
                A API nunca retorna o valor em texto claro.
              </Callout>

              <H2 id="bulk">Cadastro em massa</H2>
              <P>
                O cadastro em massa (<strong>+ Importar range</strong>) permite criar vários dispositivos
                de uma vez a partir de um intervalo de IPs. Requer perfil <Badge color="blue">OPERADOR</Badge> ou superior.
              </P>
              <UL>
                <LI>Informe o IP inicial e IP final do range (ex: 192.168.1.1 → 192.168.1.50).</LI>
                <LI>Defina as configurações comuns (tipo, localização, protocolos) que serão aplicadas a todos.</LI>
                <LI>O sistema criará um dispositivo para cada IP no intervalo.</LI>
                <LI>IPs já cadastrados são ignorados automaticamente.</LI>
              </UL>

              <H2 id="editar">Editar e excluir</H2>
              <UL>
                <LI>Na lista de dispositivos, clique nos três pontos (⋯) à direita de um dispositivo para ver as opções.</LI>
                <LI><Edit className="h-3.5 w-3.5 inline" /> <strong>Editar:</strong> abre o formulário pré-preenchido.</LI>
                <LI><Trash2 className="h-3.5 w-3.5 inline" /> <strong>Excluir:</strong> solicita confirmação antes de remover. A exclusão também apaga todo o histórico do dispositivo.</LI>
              </UL>
              <Callout variant="warning">
                A exclusão de um dispositivo é permanente e remove todo o histórico de status associado.
              </Callout>

              <H2 id="detalhe">Detalhe do dispositivo</H2>
              <P>
                A página de detalhe (<strong>/devices/[id]</strong>) exibe:
              </P>
              <UL>
                <LI><strong>Status atual:</strong> online/offline, ping, uptime das últimas 24h.</LI>
                <LI><strong>Gráfico de ping:</strong> latência e disponibilidade ao longo do tempo (24h/7d/30d).</LI>
                <LI><strong>Métricas RouterOS:</strong> CPU, memória, tempo de atividade (uptime do equipamento).</LI>
                <LI><strong>Clientes DHCP:</strong> lista de leases ativas (Mikrotik com RouterOS habilitado).</LI>
                <LI><strong>Clientes Wi-Fi:</strong> dispositivos conectados (APs Omada e UniFi).</LI>
              </UL>

              <H2 id="manutencao">Janela de manutenção</H2>
              <P>
                Dispositivos em manutenção são marcados como "Online" no sistema durante o período
                configurado, evitando falsos alertas de queda durante intervenções programadas.
              </P>
              <UL>
                <LI>Para ativar, edite o dispositivo e defina a data/hora de <strong>Manutenção até</strong>.</LI>
                <LI>Um badge <Badge color="default">Em manutenção</Badge> aparece no cartão e na lista.</LI>
                <LI>Após o horário configurado, o monitoramento normal é retomado automaticamente.</LI>
              </UL>
            </Section>

            {/* ── Links ───────────────────────────────────────────── */}
            <Section id="links">
              <H1><Network className="h-6 w-6 text-primary" /> Links de Internet</H1>
              <P>
                A página <strong>/links</strong> gerencia os links de internet monitorados,
                com medição de tráfego em tempo real via RouterOS e rastreamento de eventos UP/DOWN.
              </P>

              <H2 id="gerenciar-links">Gerenciar links</H2>
              <UL>
                <LI>Clique em <strong>+ Novo link</strong> para cadastrar um link.</LI>
                <LI>Campos obrigatórios: nome e localização.</LI>
                <LI>Para medição de tráfego: selecione o dispositivo Mikrotik e a interface de saída.</LI>
                <LI>Informe a banda contratada (download/upload em Mbps) para cálculo de utilização.</LI>
                <LI>O status online/offline é atualizado via webhooks externos (Zabbix, Nagios, scripts).</LI>
              </UL>

              <H2 id="bandwidth">Utilização de banda</H2>
              <P>
                O worker lê o tráfego em bytes/segundo da interface RouterOS a cada 60 segundos
                usando dois snapshots de 1 segundo de diferença. O valor exibido é a taxa média
                calculada entre os dois snapshots.
              </P>
              <UL>
                <LI>Barra verde: abaixo de 70% da banda contratada.</LI>
                <LI>Barra âmbar: 70%–90% — atenção.</LI>
                <LI>Barra vermelha: acima de 90% — saturação.</LI>
                <LI>A página de detalhe do link (<strong>/links/[id]</strong>) exibe um gráfico histórico de tráfego.</LI>
              </UL>

              <H2 id="webhook">Webhooks UP/DOWN</H2>
              <P>
                Cada link possui dois endpoints de webhook para marcar o status como UP ou DOWN
                a partir de sistemas externos:
              </P>
              <UL>
                <LI><code>GET /api/links/[id]/up?token=TOKEN</code> — marca o link como online.</LI>
                <LI><code>GET /api/links/[id]/down?token=TOKEN</code> — marca o link como offline.</LI>
              </UL>
              <P>
                O token HMAC é gerado automaticamente e exibido na página de detalhes do link.
                Todas as chamadas de webhook ficam registradas nos logs de auditoria.
              </P>
              <Callout variant="info">
                Os endpoints de webhook não exigem sessão autenticada — são projetados para integração com Zabbix, Nagios, scripts shell e outros sistemas de monitoramento externos.
              </Callout>
            </Section>

            {/* ── Incidentes ──────────────────────────────────────── */}
            <Section id="incidentes">
              <H1><AlertCircle className="h-6 w-6 text-primary" /> Incidentes</H1>
              <P>
                A página <strong>/incidents</strong> lista todos os eventos de queda e retorno
                registrados no histórico, com paginação e filtros.
              </P>
              <UL>
                <LI>Cada incidente exibe: dispositivo afetado, horário de início, horário de fim e duração.</LI>
                <LI>Incidentes em aberto (sem horário de fim) indicam dispositivos ainda offline.</LI>
                <LI>Use os filtros de período para focar em um intervalo de tempo específico.</LI>
                <LI>A paginação mostra 50 incidentes por página.</LI>
              </UL>
              <Callout variant="info">
                Incidentes são gerados automaticamente pelo worker a partir do histórico de status. Um incidente é criado quando um dispositivo passa de Online para Offline, e fechado quando retorna a Online.
              </Callout>
            </Section>

            {/* ── Painéis ─────────────────────────────────────────── */}
            <Section id="paineis">
              <H1><Cpu className="h-6 w-6 text-primary" /> Painéis Específicos</H1>
              <P>
                Os painéis de Mikrotik, Omada e UniFi agrupam todos os dispositivos desse tipo
                e exibem métricas consolidadas.
              </P>

              <H2 id="mikrotik">Mikrotik</H2>
              <P>
                O painel <strong>/mikrotik</strong> lista todos os roteadores Mikrotik cadastrados com:
              </P>
              <UL>
                <LI>Status online/offline e latência de ping.</LI>
                <LI>CPU e uso de memória (se RouterOS habilitado).</LI>
                <LI>Tempo de atividade do equipamento (uptime).</LI>
                <LI>Número de clientes DHCP ativos.</LI>
              </UL>

              <H2 id="omada">Omada</H2>
              <P>
                O painel <strong>/omada</strong> lista todos os APs Omada com:
              </P>
              <UL>
                <LI>Status do AP (Online/Offline/Isolado).</LI>
                <LI>Número de clientes Wi-Fi conectados por AP.</LI>
                <LI>Dados buscados diretamente do controller Omada via Northbound API (OAuth2).</LI>
              </UL>
              <Callout variant="info">
                Para que os dados de clientes apareçam, o dispositivo deve ter as credenciais Omada configuradas (Client ID e Client Secret) e o controller deve estar acessível.
              </Callout>

              <H2 id="unifi">UniFi</H2>
              <P>
                O painel <strong>/unifi</strong> lista todos os APs UniFi com:
              </P>
              <UL>
                <LI>Status do AP e modelo.</LI>
                <LI>Número de clientes Wi-Fi por AP.</LI>
                <LI>Dados buscados via UniFi Controller API (chave de API ou usuário/senha).</LI>
              </UL>
            </Section>

            {/* ── Relatórios ──────────────────────────────────────── */}
            <Section id="relatorios">
              <H1><FileText className="h-6 w-6 text-primary" /> Relatórios</H1>
              <P>
                A página <strong>/reports</strong> permite gerar relatórios de disponibilidade
                por dispositivo com exportação em PDF e CSV.
              </P>
              <UL>
                <LI>Selecione um ou mais dispositivos no seletor múltiplo.</LI>
                <LI>Escolha o período: <strong>24h</strong>, <strong>7 dias</strong> ou <strong>30 dias</strong>.</LI>
                <LI>O relatório exibe: uptime, downtime total, ping médio/máximo, CPU e memória médias.</LI>
                <LI><Download className="h-3.5 w-3.5 inline" /> Exporte como <strong>PDF</strong> (formato A4, pronto para impressão) ou <strong>CSV</strong> (para análise em planilha).</LI>
                <LI>O botão <Printer className="h-3.5 w-3.5 inline" /> <strong>Imprimir</strong> abre o diálogo de impressão do navegador.</LI>
              </UL>
              <Callout variant="tip">
                O relatório em PDF utiliza a engine do navegador para renderizar — certifique-se de que a opção "Gráficos de fundo" esteja habilitada no diálogo de impressão para preservar as cores.
              </Callout>
            </Section>

            {/* ── Segurança ───────────────────────────────────────── */}
            <Section id="seguranca">
              <H1><ShieldCheck className="h-6 w-6 text-primary" /> Segurança</H1>
              <P>
                A página <strong>/security</strong> exibe o relatório de segurança da plataforma —
                todos os achados identificados, suas severidades e status de resolução.
              </P>
              <UL>
                <LI>O relatório é lido diretamente do arquivo <code>SECURITY_REPORT.md</code> no servidor.</LI>
                <LI>Achados são classificados como: 🔴 Crítico, 🟠 Alto, 🟡 Médio, 🔵 Baixo e ℹ️ Info.</LI>
                <LI>Cada achado mostra: título, categoria, status (Resolvido/Aberto) e descrição da mitigação.</LI>
                <LI>Apenas leitura — para atualizar, edite o arquivo no servidor.</LI>
              </UL>
            </Section>

            {/* ── Administração ───────────────────────────────────── */}
            <Section id="administracao">
              <H1><Settings className="h-6 w-6 text-primary" /> Administração</H1>
              <P>
                As páginas de administração são visíveis apenas para usuários com perfil
                <Badge color="red">ADMIN</Badge>.
              </P>

              <H2 id="usuarios">Usuários</H2>
              <P>
                A página <strong>/users</strong> lista todos os usuários cadastrados e permite
                criar, editar e remover contas.
              </P>
              <UL>
                <LI>Clique em <strong>+ Novo usuário</strong> para criar uma conta.</LI>
                <LI>Campos: nome de exibição, nome de usuário (login), senha e perfil (ADMIN/OPERADOR/VIEWER).</LI>
                <LI>Para alterar a senha, edite o usuário e preencha o campo <strong>Nova senha</strong>.</LI>
                <LI>Não é possível excluir o único usuário ADMIN do sistema.</LI>
              </UL>

              <H2 id="totp-admin">Configurar 2FA por usuário</H2>
              <P>
                Na página de usuários, clique no ícone de <KeyRound className="h-3.5 w-3.5 inline" /> chave
                ao lado do usuário para gerenciar o 2FA:
              </P>
              <UL>
                <LI><strong>Habilitar:</strong> gera um QR code para o usuário escanear com o aplicativo autenticador.</LI>
                <LI>O usuário deve confirmar o código gerado pelo app para ativar o 2FA.</LI>
                <LI><strong>Desabilitar:</strong> remove o 2FA da conta (útil em caso de troca de celular).</LI>
              </UL>
              <Callout variant="warning">
                O QR code é exibido uma única vez. O usuário deve escaneá-lo imediatamente — não é possível recuperá-lo depois.
              </Callout>

              <H2 id="sistema">Sistema</H2>
              <P>
                A página <strong>/system</strong> exibe métricas internas e permite ajustar políticas de retenção:
              </P>
              <UL>
                <LI><strong>Saúde do worker:</strong> último heartbeat, status e número de dispositivos monitorados.</LI>
                <LI><strong>Banco de dados:</strong> tamanho total das tabelas, número de registros por entidade.</LI>
                <LI><strong>Retenção de histórico:</strong> quantos dias manter o histórico de status (padrão 30 dias) e eventos de link (padrão 90 dias).</LI>
                <LI><strong>Limpeza manual:</strong> botão para forçar a purga imediata de registros antigos sem aguardar o ciclo automático.</LI>
              </UL>
              <Callout variant="info">
                A limpeza automática roda diariamente via worker. Reduzir a retenção melhora a performance do banco em instalações com muitos dispositivos.
              </Callout>

              <H2 id="audit">Logs de alterações</H2>
              <P>
                A página <strong>/audit</strong> registra todas as ações realizadas no sistema:
              </P>
              <UL>
                <LI>Criações, edições e exclusões de dispositivos, links e usuários.</LI>
                <LI>Logins e tentativas de login falhas.</LI>
                <LI>Chamadas de webhook UP/DOWN.</LI>
                <LI>Operações de limpeza do banco.</LI>
              </UL>
              <P>Recursos disponíveis:</P>
              <UL>
                <LI><Filter className="h-3.5 w-3.5 inline" /> Filtros por tipo de ação, usuário e período.</LI>
                <LI><Download className="h-3.5 w-3.5 inline" /> Exportação em CSV do log filtrado.</LI>
                <LI><Trash2 className="h-3.5 w-3.5 inline" /> Purge de registros antigos (configura quantos dias manter).</LI>
              </UL>
            </Section>

            {/* ── Atalhos ─────────────────────────────────────────── */}
            <Section id="atalhos">
              <H1><Zap className="h-6 w-6 text-primary" /> Atalhos e Dicas</H1>

              <H2 id="tema">Tema claro/escuro</H2>
              <P>
                Passe o mouse sobre seu nome no rodapé da sidebar e clique no ícone de
                <Moon className="h-3.5 w-3.5 inline mx-1" /> lua para alternar entre tema claro e escuro.
                A preferência é salva no navegador.
              </P>

              <H2 id="notificacoes">Notificações do navegador</H2>
              <P>
                O dashboard pode enviar notificações push do navegador quando um dispositivo
                vai offline. Para habilitar:
              </P>
              <UL>
                <LI>Clique no ícone de <Bell className="h-3.5 w-3.5 inline" /> sino na topbar.</LI>
                <LI>Autorize as notificações quando o navegador solicitar permissão.</LI>
                <LI>Para desabilitar, revogue a permissão nas configurações do navegador.</LI>
              </UL>

              <H2 id="view-compacta">Visualização compacta</H2>
              <P>
                A grade de dispositivos na visão geral possui dois modos de exibição:
              </P>
              <UL>
                <LI><strong>Padrão:</strong> cartões com mais espaço e sparkline de ping visível.</LI>
                <LI><strong>Compacto:</strong> linhas densas de 28px — ideal para monitores NOC com muitos dispositivos.</LI>
              </UL>

              <H2 id="atualizar">Atualização manual</H2>
              <P>
                Além do polling automático de 30s, você pode forçar uma atualização imediata
                clicando no ícone de <RefreshCw className="h-3.5 w-3.5 inline" /> refresh na topbar.
              </P>

              <H2 id="filtros-url">Filtros preservados na URL</H2>
              <P>
                Na página de dispositivos, os filtros ativos são refletidos na URL
                (ex: <code>/devices?status=offline&type=MIKROTIK</code>).
                Você pode salvar ou compartilhar essa URL para retornar com os mesmos filtros aplicados.
              </P>

              <H2 id="faq">Perguntas frequentes</H2>
              <TableWrap>
                <thead><tr><Th>Pergunta</Th><Th>Resposta</Th></tr></thead>
                <tbody>
                  <tr>
                    <Td>O dispositivo aparece offline mas está funcionando</Td>
                    <Td>Verifique se o ICMP (ping) está permitido no firewall do equipamento. O worker usa ping como primeiro check.</Td>
                  </tr>
                  <tr>
                    <Td>Os gráficos não atualizam</Td>
                    <Td>Verifique se o worker está rodando em <strong>Visão Geral → Saúde do Sistema</strong>. Se estiver parado, reinicie com <code>npm run worker</code>.</Td>
                  </tr>
                  <tr>
                    <Td>Não consigo fazer login depois de errar a senha várias vezes</Td>
                    <Td>O IP fica bloqueado por 15 minutos após 10 tentativas falhas. Aguarde ou peça ao administrador para limpar o rate limit na página Sistema.</Td>
                  </tr>
                  <tr>
                    <Td>O relatório PDF está sem cores</Td>
                    <Td>No diálogo de impressão do navegador, habilite a opção "Gráficos de fundo" ou "Imagens de fundo".</Td>
                  </tr>
                  <tr>
                    <Td>O número de clientes Wi-Fi no KPI está zerado</Td>
                    <Td>Verifique se os dispositivos UniFi/Omada têm as credenciais configuradas e se o controller está acessível. Use "Testar conexão" no formulário de edição.</Td>
                  </tr>
                </tbody>
              </TableWrap>
            </Section>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center text-[12px] text-muted-foreground/50">
              WatchIT Tower — Manual do Usuário · Atualizado em junho de 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
