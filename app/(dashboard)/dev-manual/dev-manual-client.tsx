"use client";

import { useState, useEffect, useRef } from "react";
import { Topbar } from "@/components/topbar";
import {
  Code2, Server, Database, Shield, Cpu, Network, Key,
  Zap, TestTube2, GitBranch, Settings, FileCode2, Terminal,
  AlertTriangle, CheckCircle, Package, Layers, Menu, X,
  ChevronRight, Lock, RefreshCw, Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Sections ─────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections?: { id: string; title: string }[];
}

const SECTIONS: Section[] = [
  { id: "overview",     title: "Visão geral",             icon: Layers },
  { id: "stack",        title: "Stack técnica",            icon: Package,
    subsections: [
      { id: "stack-frontend",  title: "Frontend" },
      { id: "stack-backend",   title: "Backend / API" },
      { id: "stack-worker",    title: "Worker" },
      { id: "stack-db",        title: "Banco de dados" },
    ],
  },
  { id: "auth",         title: "Autenticação",             icon: Lock,
    subsections: [
      { id: "auth-session",   title: "JWT e sessão" },
      { id: "auth-totp",      title: "TOTP 2FA" },
      { id: "auth-blacklist", title: "Token Blacklist" },
      { id: "auth-middleware",title: "Middleware" },
      { id: "auth-roles",     title: "Roles e permissões" },
    ],
  },
  { id: "database",     title: "Banco de dados",           icon: Database,
    subsections: [
      { id: "db-schema",      title: "Schema" },
      { id: "db-migrations",  title: "Migrations" },
      { id: "db-client",      title: "Prisma client" },
      { id: "db-queries",     title: "Queries pesadas (SQL)" },
    ],
  },
  { id: "api",          title: "Rotas de API",             icon: Network,
    subsections: [
      { id: "api-pattern",    title: "Padrão de rota" },
      { id: "api-auth-guard", title: "Guard de autenticação" },
      { id: "api-validation", title: "Validação Zod" },
      { id: "api-errors",     title: "Tratamento de erros" },
    ],
  },
  { id: "worker",       title: "Worker de monitoramento",  icon: Cpu,
    subsections: [
      { id: "worker-entry",    title: "Entry point" },
      { id: "worker-scheduler",title: "Scheduler" },
      { id: "worker-monitors", title: "Monitores" },
      { id: "worker-heartbeat",title: "Heartbeat" },
      { id: "worker-shutdown", title: "Graceful shutdown" },
    ],
  },
  { id: "protocols",    title: "Protocolos",               icon: Zap,
    subsections: [
      { id: "proto-ping",      title: "ICMP Ping" },
      { id: "proto-http",      title: "HTTP" },
      { id: "proto-snmp",      title: "SNMP v2c" },
      { id: "proto-routeros",  title: "RouterOS API" },
      { id: "proto-unifi",     title: "UniFi API" },
      { id: "proto-omada",     title: "Omada API" },
      { id: "proto-traffic",   title: "Tráfego RouterOS" },
    ],
  },
  { id: "crypto",       title: "Criptografia",             icon: Key,
    subsections: [
      { id: "crypto-aes",     title: "AES-256-GCM" },
      { id: "crypto-webhook", title: "HMAC Webhook" },
    ],
  },
  { id: "webhooks",     title: "Webhooks",                 icon: Webhook },
  { id: "frontend",     title: "Frontend",                 icon: Code2,
    subsections: [
      { id: "fe-router",      title: "App Router" },
      { id: "fe-components",  title: "Componentes" },
      { id: "fe-forms",       title: "Formulários" },
      { id: "fe-theme",       title: "Tema e acessibilidade" },
    ],
  },
  { id: "security",     title: "Segurança",                icon: Shield,
    subsections: [
      { id: "sec-secrets",    title: "Secrets e variáveis" },
      { id: "sec-ssrf",       title: "SSRF prevention" },
      { id: "sec-sanitize",   title: "Sanitização de dados" },
      { id: "sec-ratelimit",  title: "Rate limiting" },
      { id: "sec-audit",      title: "Audit log" },
    ],
  },
  { id: "testing",      title: "Testes",                   icon: TestTube2,
    subsections: [
      { id: "test-unit",       title: "Testes unitários" },
      { id: "test-api",        title: "Testes de API" },
      { id: "test-integration",title: "Testes de integração" },
      { id: "test-coverage",   title: "Cobertura" },
    ],
  },
  { id: "extending",    title: "Extensão do sistema",      icon: GitBranch,
    subsections: [
      { id: "ext-protocol",   title: "Novo protocolo" },
      { id: "ext-api",        title: "Nova rota de API" },
      { id: "ext-model",      title: "Novo modelo no banco" },
    ],
  },
  { id: "env",          title: "Variáveis de ambiente",    icon: Settings },
  { id: "logging",      title: "Logging",                  icon: Terminal },
  { id: "deploy",       title: "Deploy",                   icon: Server },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function Sec({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-6 mb-14">{children}</section>;
}

function H1({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-foreground mb-5 flex items-center gap-3 border-b border-border pb-3">
      <Icon className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
      {children}
    </h2>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-6 text-base font-bold text-foreground mt-9 mb-3 flex items-center gap-2">
      <ChevronRight className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1.5 mb-4 ml-1">{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-[14px] text-muted-foreground leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12.5px] bg-muted px-1.5 py-0.5 rounded text-accent-foreground">
      {children}
    </code>
  );
}

function Block({ children, lang = "" }: { children: string; lang?: string }) {
  return (
    <pre className={cn("bg-[#0f1117] text-[#e2e4f0] text-[12.5px] rounded-xl p-4 mb-5 overflow-x-auto leading-relaxed font-mono border border-border/40", lang)}>
      <code>{children.trim()}</code>
    </pre>
  );
}

function Callout({ variant = "info", children }: { variant?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const map = {
    info:    { cls: "bg-primary/5 border-primary/30 text-primary",       label: "Nota" },
    warning: { cls: "bg-warning/5 border-warning/30 text-warning",       label: "Atenção" },
    tip:     { cls: "bg-success/5 border-success/30 text-success",       label: "Dica" },
  };
  const { cls, label } = map[variant];
  return (
    <div className={cn("border rounded-lg p-4 mb-4 text-[13px] leading-relaxed", cls)}>
      <span className="font-bold">{label}: </span>
      <span className="text-muted-foreground">{children}</span>
    </div>
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
  return <th className="px-4 py-3 text-left font-semibold text-muted-foreground bg-muted/50 border-b border-border">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-foreground border-b border-border/50 last:border-0">{children}</td>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DevManualClient() {
  const [activeId, setActiveId] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) setActiveId(e.target.id); } },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 }
    );
    document.querySelectorAll("section[id], h3[id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <>
      <Topbar
        title="Manual do Desenvolvedor"
        subtitle="Arquitetura, padrões e guias internos — acesso restrito a administradores"
        icon={Code2}
      />

      <div className="flex min-h-0 relative">
        {/* Mobile toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Fechar índice" : "Abrir índice"}
          className="fixed bottom-6 right-6 z-50 lg:hidden h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
        >
          {sidebarOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        {/* Sidebar */}
        <aside
          aria-label="Índice do manual do desenvolvedor"
          tabIndex={0}
          className={cn(
            "w-64 shrink-0 border-r border-border bg-card overflow-y-auto sticky top-0 h-[calc(100vh-57px)] transition-all duration-200",
            sidebarOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="p-3 pt-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[.09em] text-muted-foreground px-2 pb-2">
              Conteúdo
            </div>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeId === s.id || s.subsections?.some((sub) => sub.id === activeId);
              return (
                <div key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-[8px] text-[13px] font-semibold text-left transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-accent-foreground" : "")} aria-hidden="true" />
                    {s.title}
                  </button>
                  {s.subsections && isActive && (
                    <div className="ml-5 border-l border-border/60 pl-3 mt-0.5 mb-0.5">
                      {s.subsections.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => scrollTo(sub.id)}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded-[6px] text-[12px] transition-colors",
                            activeId === sub.id
                              ? "text-accent-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <main className="flex-1 min-w-0 px-8 py-8 max-w-4xl">

          {/* ── Visão geral ──────────────────────────────────────────────── */}
          <Sec id="overview">
            <H1 icon={Layers}>Visão geral</H1>
            <P>
              WatchIT Tower é composto por dois processos Node.js independentes que compartilham o mesmo banco PostgreSQL:
              o servidor Next.js (UI + API) e o worker de monitoramento. Eles comunicam-se exclusivamente via banco de dados
              — nenhuma chamada direta entre processos.
            </P>
            <Block>{`
npm run dev:all
  └── Next.js (porta 3000)   ←→   PostgreSQL (porta 5432)
  └── worker/index.ts        ←→   PostgreSQL (porta 5432)
`}</Block>
            <P>
              O worker lê dispositivos do banco, configura um <Code>setInterval</Code> por dispositivo e escreve resultados
              em <Code>DeviceStatus</Code> (upsert) e <Code>StatusHistory</Code> (append). O Next.js lê esses dados nas
              rotas de API e os serve ao browser.
            </P>
            <Callout variant="warning">
              Nunca adicione lógica de monitoramento dentro de rotas Next.js. Todo polling de dispositivos deve viver
              exclusivamente em <Code>worker/</Code>.
            </Callout>
          </Sec>

          {/* ── Stack ──────────────────────────────────────────────────── */}
          <Sec id="stack">
            <H1 icon={Package}>Stack técnica</H1>

            <H2 id="stack-frontend">Frontend</H2>
            <P>Next.js 16 com App Router. Todas as páginas autenticadas ficam sob <Code>app/(dashboard)/</Code>. O layout
              desse grupo verifica a sessão — rotas públicas ficam sob <Code>app/(auth)/</Code>.</P>
            <P>UI construída com <strong>shadcn/ui v4</strong>, que usa <strong>Base UI</strong> internamente (não Radix).
              O <Code>Button</Code> não suporta <Code>asChild</Code> — use <Code>buttonVariants()</Code> com um
              <Code>&lt;Link&gt;</Code> quando precisar de link estilizado como botão. Dialogs usam a prop <Code>render</Code>.</P>
            <P>Formulários com <Code>react-hook-form</Code> + <Code>zod</Code>. Estilos com Tailwind CSS 4 (JIT).
              Gráficos com Recharts. Exportação PDF com html2pdf.js via <Code>lib/pdf-export.ts</Code>.</P>

            <H2 id="stack-backend">Backend / API</H2>
            <P>As rotas de API são Route Handlers do Next.js em <Code>app/api/</Code>. Autenticação via NextAuth.js v5
              (JWT, sem sessão no banco). Validação de dados com Zod. ORM com Prisma 7.</P>
            <P>Parsing de body sempre via <Code>parseBody()</Code> de <Code>lib/parse-body.ts</Code> — nunca
              <Code>req.json()</Code> diretamente, pois um JSON malformado causaria 500 em vez de 400.</P>

            <H2 id="stack-worker">Worker</H2>
            <P>Processo Node.js separado em <Code>worker/index.ts</Code>, rodado via <Code>tsx</Code>. Usa o mesmo
              Prisma client que o Next.js. Executa em paralelo via <Code>concurrently</Code> no script
              <Code>dev:all</Code>.</P>

            <H2 id="stack-db">Banco de dados</H2>
            <P>PostgreSQL 16 via Docker. Configuração da conexão em <Code>.env</Code> (<Code>DATABASE_URL</Code>).
              O arquivo <Code>prisma.config.ts</Code> carrega o <Code>.env</Code> via <Code>dotenv/config</Code> e
              valida que <Code>DATABASE_URL</Code> existe antes de iniciar — falha em tempo de boot, não silenciosamente.</P>
          </Sec>

          {/* ── Auth ──────────────────────────────────────────────────── */}
          <Sec id="auth">
            <H1 icon={Lock}>Autenticação</H1>

            <H2 id="auth-session">JWT e sessão</H2>
            <P>NextAuth.js v5 com credentials provider. A sessão é um JWT armazenado em cookie httpOnly.
              Nenhuma tabela de sessão existe no banco. O payload do JWT contém <Code>id</Code>, <Code>username</Code>,
              <Code>role</Code> e <Code>version</Code> (campo de optimistic locking para invalidação).</P>
            <Block>{`
// lib/auth.ts — acessar sessão no servidor
import { auth } from "@/lib/auth";
const session = await auth();
const role = (session?.user as { role?: string })?.role;

// lib/with-auth.ts — helper para rotas de API
import { withAuth } from "@/lib/with-auth";
export const GET = withAuth(async (req, session) => { ... });
`}</Block>

            <H2 id="auth-totp">TOTP 2FA</H2>
            <P>Autenticação em dois fatores com TOTP (Time-based One-Time Password) via <Code>lib/totp.ts</Code>.
              Compatível com Google Authenticator, Authy e qualquer app TOTP.</P>
            <UL>
              <LI>O segredo TOTP é gerado por <Code>generateTotpSecret()</Code> e armazenado criptografado no banco</LI>
              <LI><Code>verifyTotp(secret, token)</Code> valida o token com janela de ±1 período (30s)</LI>
              <LI>Configurado por usuário via <Code>/api/users/[id]/totp</Code></LI>
              <LI>O callback de login do NextAuth verifica TOTP antes de emitir o JWT</LI>
            </UL>

            <H2 id="auth-blacklist">Token Blacklist</H2>
            <P>JWTs são invalidados na tabela <Code>TokenBlacklist</Code> em dois casos: logout explícito
              (<Code>/api/auth/logout</Code>) e troca de senha. A verificação acontece no middleware a cada request.</P>
            <Block>{`
// O middleware checa se o jti (JWT ID) está na blacklist
// antes de permitir acesso à rota protegida
`}</Block>
            <Callout variant="info">
              A limpeza de tokens expirados da blacklist é feita automaticamente via <Code>SystemConfig</Code> de retenção
              — tokens mais velhos que a expiração do JWT são removidos periodicamente.
            </Callout>

            <H2 id="auth-middleware">Middleware</H2>
            <P>O arquivo <Code>middleware.ts</Code> na raiz intercepta todos os requests e:</P>
            <UL>
              <LI>Redireciona <Code>/</Code> e subpaths sem sessão para <Code>/login</Code></LI>
              <LI>Permite <Code>/api/auth/*</Code> e webhooks de link sem autenticação</LI>
              <LI>Aplica rate limiting de 10 tentativas/15min por IP no endpoint de login</LI>
              <LI>Verifica se o JWT está na blacklist (tokens invalidados)</LI>
            </UL>

            <H2 id="auth-roles">Roles e permissões</H2>
            <TableWrap>
              <thead><tr><Th>Role</Th><Th>Capacidades</Th></tr></thead>
              <tbody>
                <tr><td className="px-4 py-3 font-mono text-[13px] border-b border-border/50">ADMIN</td><Td>Acesso total — gerencia usuários, configura sistema, vê manual do desenvolvedor</Td></tr>
                <tr><td className="px-4 py-3 font-mono text-[13px] border-b border-border/50">OPERADOR</td><Td>Cria, edita e exclui dispositivos e links. Não acessa usuários nem sistema</Td></tr>
                <tr><td className="px-4 py-3 font-mono text-[13px]">VIEWER</td><Td>Somente leitura. Sem criação, edição ou exclusão de nada</Td></tr>
              </tbody>
            </TableWrap>
            <P>Páginas admin verificam a role no Server Component antes de renderizar:</P>
            <Block>{`
// app/(dashboard)/users/page.tsx
export default async function UsersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/");
  return <UsersClient />;
}
`}</Block>
          </Sec>

          {/* ── Database ─────────────────────────────────────────────── */}
          <Sec id="database">
            <H1 icon={Database}>Banco de dados</H1>

            <H2 id="db-schema">Schema</H2>
            <TableWrap>
              <thead><tr><Th>Modelo</Th><Th>Descrição</Th><Th>Chave de acesso</Th></tr></thead>
              <tbody>
                {[
                  ["Device", "Configuração do dispositivo: IP, tipo, protocolos habilitados, credenciais AES-256-GCM, intervalo", "id"],
                  ["DeviceStatus", "Uma linha por device — resultado mais recente (upsert). Lida pelo dashboard em tempo real", "deviceId (único)"],
                  ["StatusHistory", "Append-only de cada checagem. Base dos gráficos de histórico. Retida por N dias (SystemConfig)", "(deviceId, timestamp) + (timestamp)"],
                  ["User", "Credenciais (bcrypt) + TOTP. version = optimistic locking; passwordChangedAt invalida JWTs emitidos antes da troca de senha", "id, username"],
                  ["TokenBlacklist", "JWTs invalidados. Consultado no middleware a cada request autenticado", "jti"],
                  ["RateLimit", "Contadores de rate limiting persistidos. Usado pelo middleware de login", "(key, window)"],
                  ["Link", "Link WAN: config RouterOS, banda contratada (bps), tráfego ao vivo (atualizado pelo worker)", "id"],
                  ["LinkEvent", "UP/DOWN por link. Fonte do gráfico de disponibilidade e cálculo de uptime%", "(linkId, timestamp) + (timestamp)"],
                  ["WorkerHeartbeat", "Singleton upsertado a cada 60s pelo worker. Lido por /api/health para detectar crash", "id (sempre 1)"],
                  ["AuditLog", "CREATE/UPDATE/DELETE com IP, usuário, entidade e payload JSON", "(entity, timestamp)"],
                  ["SystemConfig", "Configurações de retenção de dados e outras configs globais", "key"],
                ].map(([model, desc, key]) => (
                  <tr key={model}>
                    <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-accent-foreground border-b border-border/50 whitespace-nowrap">{model}</td>
                    <Td>{desc}</Td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground border-b border-border/50 whitespace-nowrap">{key}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>

            <H2 id="db-migrations">Migrations</H2>
            <P>Migrations ficam em <Code>prisma/migrations/</Code>. Após alterar <Code>prisma/schema.prisma</Code>:</P>
            <Block>{`
npm run db:migrate    # cria e aplica a migration
npm run db:generate   # regenera o Prisma Client com os novos tipos
`}</Block>
            <Callout variant="warning">
              <Code>prisma migrate dev</Code> exige TTY interativo. Em CI ou via <Code>docker exec -T</Code>, aplique o SQL
              manualmente e registre na tabela <Code>_prisma_migrations</Code>.
            </Callout>

            <H2 id="db-client">Prisma client</H2>
            <P>O singleton do Prisma Client está em <Code>lib/db.ts</Code>. Em desenvolvimento o Next.js faz hot-reload
              e criaria múltiplas conexões — o singleton usa <Code>global</Code> para reaproveitar a instância.</P>
            <Block>{`
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
`}</Block>

            <H2 id="db-queries">Queries pesadas no banco (window functions)</H2>
            <P>Endpoints que antes carregavam todo o <Code>StatusHistory</Code> da janela em memória para
              detectar incidentes ou montar relatórios foram movidos para SQL, evitando trafegar milhões
              de linhas. Há dois módulos dedicados:</P>
            <P><Code>lib/incident-detection.ts</Code> — <Code>getOnlineTransitions</Code> /
              <Code>getDeviceStatusEvents</Code> usam a window function <Code>LAG()</Code> para retornar
              apenas as linhas onde o estado mudou (transição de online/offline ou de bucket de
              alta-latência), mais a primeira e a última da janela. <Code>detectIncidents</Code> reconstrói
              os incidentes a partir dessa sequência reduzida — provadamente idêntico ao algoritmo em memória,
              pois incidentes dependem só dos pontos de transição e das bordas.</P>
            <P><Code>lib/report-queries.ts</Code> — <Code>getDeviceReportStats</Code> calcula todas as
              estatísticas numa passada com <Code>COUNT/AVG/MIN/MAX FILTER (WHERE ...)</Code>;
              <Code>getDeviceChartSamples</Code> faz o downsample dos gráficos com um stride no próprio SQL
              (<Code>idx % ceil(total/maxPoints)</Code>), equivalente ao stride em JS de antes.</P>
            <Callout variant="info">As funções aceitam um cliente Prisma opcional (default = singleton
              global) para que os testes de integração (<Code>incident-detection.test.ts</Code>) rodem o SQL
              real contra o PostgreSQL de teste.</Callout>
            <P><strong>Índice de suporte:</strong> consultas por período sobre a frota inteira filtram só
              por <Code>timestamp</Code>, e o índice composto <Code>(deviceId, timestamp)</Code> não serve
              (lidera pela id). Por isso <Code>StatusHistory</Code> e <Code>LinkEvent</Code> têm também um
              índice standalone <Code>(timestamp)</Code> — sem ele, <Code>/api/health</Code>, sparklines,
              timeline, incidents e o pruning fariam Seq Scan da tabela inteira.</P>
            <P>As sparklines do <Code>/api/overview</Code> usam
              <Code>ROW_NUMBER() OVER (PARTITION BY deviceId ORDER BY timestamp DESC)</Code> para trazer só
              os 60 pontos mais recentes por device, em vez de puxar 6h e fatiar em JS.</P>
          </Sec>

          {/* ── API ──────────────────────────────────────────────────── */}
          <Sec id="api">
            <H1 icon={Network}>Rotas de API</H1>

            <H2 id="api-pattern">Padrão de rota</H2>
            <P>Toda rota segue o padrão: autenticar → parsear body → validar com Zod → executar → responder.</P>
            <Block>{`
// app/api/devices/route.ts
import { withAuth } from "@/lib/with-auth";
import { parseBody } from "@/lib/parse-body";
import { deviceCreateSchema } from "@/lib/schemas/device";
import { db } from "@/lib/db";

export const POST = withAuth(async (req, session) => {
  const body = await parseBody(req, deviceCreateSchema);
  if (!body.ok) return body.response; // 400 com erro Zod

  const device = await db.device.create({ data: body.data });
  return Response.json(device, { status: 201 });
});
`}</Block>

            <H2 id="api-auth-guard">Guard de autenticação</H2>
            <P><Code>withAuth()</Code> em <Code>lib/with-auth.ts</Code> envolve o handler e retorna 401 se não houver
              sessão válida. Rotas admin verificam adicionalmente se <Code>session.user.role === "ADMIN"</Code>.</P>
            <Block>{`
// Rota pública de webhook — sem withAuth
export const POST = async (req: NextRequest) => {
  const token = req.headers.get("x-webhook-token");
  if (!await verifyWebhookToken(token, linkId)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
};
`}</Block>

            <H2 id="api-validation">Validação Zod</H2>
            <P>Schemas ficam em <Code>lib/schemas/device.ts</Code> (e arquivos similares por domínio). Reutilizados
              tanto nas rotas de API quanto nos formulários do frontend.</P>
            <Block>{`
// lib/schemas/device.ts
export const deviceCreateSchema = z.object({
  name: z.string().min(1).max(64),
  ip: z.string().ip(),
  type: z.enum(["MIKROTIK", "DVR", "CAMERA", "SWITCH", "AP_UNIFI", "AP_OMADA", "OTHER"]),
  checkInterval: z.number().int().min(10).max(3600).default(60),
  // ...
});
`}</Block>

            <H2 id="api-errors">Tratamento de erros</H2>
            <P>Erros Prisma são capturados via <Code>lib/prisma-error.ts</Code> que mapeia códigos conhecidos
              (P2002 = unique constraint) para respostas HTTP legíveis. Erros inesperados retornam 500 com
              mensagem genérica — nunca vaze stack trace para o cliente.</P>
          </Sec>

          {/* ── Worker ───────────────────────────────────────────────── */}
          <Sec id="worker">
            <H1 icon={Cpu}>Worker de monitoramento</H1>

            <H2 id="worker-entry">Entry point</H2>
            <P><Code>worker/index.ts</Code> é o ponto de entrada. Na inicialização ele:</P>
            <UL>
              <LI>Chama <Code>validateKey()</Code> — aborta se <Code>ENCRYPTION_KEY</Code> estiver ausente ou curta</LI>
              <LI>Chama <Code>validateSecret()</Code> — aborta se <Code>WEBHOOK_SECRET</Code> estiver ausente ou curto</LI>
              <LI>Conecta ao banco via Prisma</LI>
              <LI>Chama <Code>startScheduler()</Code></LI>
              <LI>Registra handlers de <Code>SIGTERM</Code>/<Code>SIGINT</Code> para graceful shutdown</LI>
            </UL>
            <Callout variant="tip">
              O fail-fast em startup garante que erros de configuração apareçam nos logs imediatamente, não na primeira
              checagem de algum dispositivo minutos depois.
            </Callout>

            <H2 id="worker-scheduler">Scheduler</H2>
            <P><Code>worker/scheduler.ts</Code> — coração do worker:</P>
            <UL>
              <LI>Lê todos os devices do banco na inicialização</LI>
              <LI>Cria um <Code>setInterval</Code> por device com base em <Code>device.checkInterval</Code></LI>
              <LI>A cada tick chama <Code>runChecks(device)</Code> que executa todos os monitores habilitados em paralelo via <Code>Promise.allSettled</Code></LI>
              <LI>Upserta <Code>DeviceStatus</Code> e insere em <Code>StatusHistory</Code> com o resultado</LI>
              <LI>Roda <Code>pollLinks()</Code> a cada 60s para atualizar tráfego dos links</LI>
              <LI>Faz upsert em <Code>WorkerHeartbeat</Code> a cada 60s</LI>
            </UL>
            <Block>{`
// Fluxo simplificado de runChecks
async function runChecks(device: Device) {
  const results = await Promise.allSettled([
    device.pingEnabled     ? runPing(device)     : skip,
    device.httpEnabled     ? runHttp(device)     : skip,
    device.snmpEnabled     ? runSnmp(device)     : skip,
    device.routerosEnabled ? runRouteros(device) : skip,
    device.unifiEnabled    ? runUnifi(device)    : skip,
    device.omadaEnabled    ? runOmada(device)    : skip,
  ]);
  await writeResults(device, results);
}
`}</Block>

            <H2 id="worker-monitors">Monitores</H2>
            <P>Cada monitor em <Code>worker/monitors/</Code> recebe o device e retorna um objeto tipado com os
              campos de resultado (latência, CPU%, status, etc.). Eles nunca escrevem no banco — isso é
              responsabilidade do scheduler.</P>

            <H2 id="worker-heartbeat">Heartbeat</H2>
            <P>O worker faz upsert em <Code>WorkerHeartbeat</Code> a cada 60s.
              <Code>/api/health</Code> lê esse registro e compara o timestamp com o horário atual:</P>
            <UL>
              <LI><strong>ok</strong> — heartbeat nos últimos 3 minutos</LI>
              <LI><strong>stale</strong> — heartbeat entre 3 e 10 minutos atrás → dispara webhook de alerta</LI>
              <LI><strong>unknown</strong> — sem registro (worker nunca rodou)</LI>
            </UL>

            <H2 id="worker-shutdown">Graceful shutdown</H2>
            <P>Ao receber <Code>SIGTERM</Code>/<Code>SIGINT</Code>, o worker:</P>
            <UL>
              <LI>Para de criar novos intervalos</LI>
              <LI>Limpa todos os <Code>setInterval</Code> existentes</LI>
              <LI>Aguarda todas as operações em andamento terminarem via <Code>pendingChecks: Set&lt;Promise&gt;</Code></LI>
              <LI>Chama <Code>db.$disconnect()</Code></LI>
            </UL>
            <P>Isso garante que nenhuma escrita no banco seja perdida durante um <Code>docker stop</Code> ou deploy.</P>
          </Sec>

          {/* ── Protocols ────────────────────────────────────────────── */}
          <Sec id="protocols">
            <H1 icon={Zap}>Protocolos de monitoramento</H1>

            <H2 id="proto-ping">ICMP Ping</H2>
            <P>Usa o pacote npm <Code>ping</Code>. Retorna latência em ms e status online/offline.
              Funciona em Linux sem root (usa <Code>ping</Code> do sistema). Timeout configurável.</P>

            <H2 id="proto-http">HTTP</H2>
            <P>Faz um <Code>fetch()</Code> para a URL configurada no device. Verifica o código HTTP de resposta.
              Aceita certificados auto-assinados via <Code>NODE_TLS_REJECT_UNAUTHORIZED=0</Code> quando necessário
              (configurável por device).</P>

            <H2 id="proto-snmp">SNMP v2c</H2>
            <P>Usa <Code>net-snmp</Code>. Lê OIDs padrão: CPU (<Code>1.3.6.1.4.1.9.2.1.57.0</Code>),
              memória (<Code>1.3.6.1.2.1.25.2.3.1.6.*</Code>) e uptime (<Code>1.3.6.1.2.1.1.3.0</Code>).
              Community string configurada por device.</P>

            <H2 id="proto-routeros">RouterOS API</H2>
            <P>Usa o pacote <Code>routeros</Code> (cliente da API proprietária Mikrotik na porta 8728/8729).
              Credenciais armazenadas criptografadas com AES-256-GCM. <Code>resolveRouterosCredentials()</Code>
              em <Code>lib/device-utils.ts</Code> decifra no momento do uso — nunca em memória persistente.</P>
            <P>Coleta: CPU%, memória%, uptime e lista de interfaces para cálculo de tráfego.</P>

            <H2 id="proto-unifi">UniFi API</H2>
            <P>Suporta três modos de autenticação:</P>
            <UL>
              <LI><strong>Credentials</strong> (<Code>unifi.ts</Code>) — usuário/senha no controller local (UniFi Network)</LI>
              <LI><strong>API Key</strong> (<Code>unifi-apikey.ts</Code>) — chave de API (UniFi Network Application 8.x+)</LI>
              <LI><strong>HTTP direto</strong> (<Code>unifi-http.ts</Code>) / <strong>Inform</strong> (<Code>unifi-inform.ts</Code>) — modos alternativos para APs standalone</LI>
            </UL>
            <P>Coleta: APs online, redes Wi-Fi ativas, clientes conectados por SSID.</P>

            <H2 id="proto-omada">Omada API</H2>
            <P>Conecta ao Omada Software Development Center (SDC). Autentica com usuário/senha, obtém
              um token de sessão e consulta sites/APs/clientes. As credenciais são armazenadas
              criptografadas igual ao RouterOS. O controller IP é validado contra loopback e link-local
              via <Code>controllerIpSchema</Code> (SSRF prevention).</P>

            <H2 id="proto-traffic">Tráfego RouterOS (dois samples)</H2>
            <P>O comando <Code>/interface/monitor-traffic</Code> é streaming e não aceita <Code>=count=</Code>
              via API Mikrotik. A solução é:</P>
            <Block>{`
1. Lê rx-byte e tx-byte de /interface/print  (sample A)
2. Aguarda 1 segundo
3. Lê novamente                              (sample B)
4. Calcula: (ΔBytes × 8) = bits/segundo
`}</Block>
          </Sec>

          {/* ── Crypto ───────────────────────────────────────────────── */}
          <Sec id="crypto">
            <H1 icon={Key}>Criptografia</H1>

            <H2 id="crypto-aes">AES-256-GCM</H2>
            <P>Implementado em <Code>lib/crypto.ts</Code>. Usa AES-256-GCM com IV aleatório de 12 bytes por operação.
              O ciphertext é armazenado como <Code>iv:ciphertext:authTag</Code> em base64.</P>
            <Block>{`
import { encrypt, decrypt, validateKey } from "@/lib/crypto";

// Criptografar antes de salvar no banco
const enc = encrypt(plaintext); // retorna "iv:ct:tag" em base64

// Decifrar ao usar (ex: no worker)
const plain = decrypt(enc);

// validateKey() lança erro se ENCRYPTION_KEY estiver ausente ou < 32 bytes
validateKey(); // chamado no startup do worker
`}</Block>
            <Callout variant="warning">
              A chave é lida de <Code>ENCRYPTION_KEY</Code>. Se você rotacionar a chave, todos os campos
              criptografados existentes no banco se tornam ilegíveis. Use <Code>scripts/migrate-credentials.ts</Code>
              para re-cifrar com a nova chave.
            </Callout>

            <H2 id="crypto-webhook">HMAC Webhook</H2>
            <P>Implementado em <Code>lib/webhook.ts</Code>. Tokens de webhook são
              <Code>HMAC-SHA256(WEBHOOK_SECRET, linkId)</Code>. A verificação usa
              <Code>crypto.timingSafeEqual</Code> para evitar timing attacks.</P>
            <Block>{`
import { generateWebhookToken, verifyWebhookToken } from "@/lib/webhook";

const token = generateWebhookToken(linkId);
const valid = await verifyWebhookToken(token, linkId); // true/false
`}</Block>
          </Sec>

          {/* ── Webhooks ─────────────────────────────────────────────── */}
          <Sec id="webhooks">
            <H1 icon={Webhook}>Webhooks</H1>
            <P>Endpoints <Code>POST /api/links/[id]/up</Code> e <Code>POST /api/links/[id]/down</Code> recebem
              notificações externas (Zabbix, Nagios, scripts) sem sessão JWT. Autenticados via token HMAC no
              header <Code>x-webhook-token</Code> ou query string <Code>?token=</Code>.</P>
            <P>Cada chamada é registrada em <Code>AuditLog</Code> com <Code>username: "webhook"</Code>, IP de origem
              e payload. Os eventos ficam em <Code>LinkEvent</Code> e são a base do gráfico de disponibilidade
              (48 segmentos de 30 minutos).</P>
            <Block>{`
# Gerar token para um link específico (use no worker ou script externo)
import { generateWebhookToken } from "@/lib/webhook";
const token = generateWebhookToken(linkId);

# Chamar o webhook
curl -X POST https://host/api/links/{id}/down \\
  -H "x-webhook-token: {token}"
`}</Block>
          </Sec>

          {/* ── Frontend ─────────────────────────────────────────────── */}
          <Sec id="frontend">
            <H1 icon={Code2}>Frontend</H1>

            <H2 id="fe-router">App Router</H2>
            <P>Toda a área autenticada fica sob <Code>app/(dashboard)/</Code>. O <Code>layout.tsx</Code> desse
              grupo verifica a sessão e renderiza Sidebar + conteúdo. Componentes de página que precisam de
              dados do cliente usam o padrão Server Component → Client Component:</P>
            <Block>{`
// page.tsx (Server Component) — busca dados, verifica auth
export default async function Page() {
  const session = await auth();
  const data = await db.device.findMany();
  return <PageClient initialData={data} />;
}

// page-client.tsx ("use client") — interatividade
"use client";
export default function PageClient({ initialData }) { ... }
`}</Block>

            <H2 id="fe-components">Componentes</H2>
            <P>Componentes reutilizáveis ficam em <Code>components/</Code>. Componentes shadcn ficam em
              <Code>components/ui/</Code> e <strong>não devem ser editados manualmente</strong> — são regenerados
              pelo CLI do shadcn.</P>
            <P>Drawers laterais (<Code>device-detail-drawer.tsx</Code>, <Code>link-detail-drawer.tsx</Code>) usam
              <Code>Sheet</Code> do shadcn com <Code>showCloseButton={"{false}"}</Code> para renderizar botão
              de fechar próprio com <Code>aria-label</Code> correto.</P>

            <H2 id="fe-forms">Formulários</H2>
            <P>Formulários usam <Code>react-hook-form</Code> com resolver Zod (<Code>@hookform/resolvers/zod</Code>).
              O schema Zod é compartilhado entre o formulário e a rota de API correspondente, garantindo validação
              idêntica em ambos os lados.</P>
            <P>O formulário de device tem sua seção de protocolos extraída em
              <Code>components/device-form-protocols.tsx</Code> para manter o componente principal gerenciável.</P>

            <H2 id="fe-theme">Tema e acessibilidade</H2>
            <P>Tema claro/escuro via <Code>components/theme-provider.tsx</Code> (next-themes) e
              <Code>components/theme-toggle.tsx</Code>. As cores são CSS custom properties em
              <Code>app/globals.css</Code>, definidas para ambos os modos.</P>
            <P>Todas as cores passam pelo critério WCAG AA (contraste mínimo 4.5:1 para texto normal).
              Em desenvolvimento, <Code>components/axe-provider.tsx</Code> executa auditoria de acessibilidade
              automaticamente via <Code>@axe-core/react</Code> e reporta no console.</P>
          </Sec>

          {/* ── Security ─────────────────────────────────────────────── */}
          <Sec id="security">
            <H1 icon={Shield}>Segurança</H1>

            <H2 id="sec-secrets">Secrets e variáveis de ambiente</H2>
            <TableWrap>
              <thead><tr><Th>Variável</Th><Th>Uso</Th><Th>Como gerar</Th></tr></thead>
              <tbody>
                {[
                  ["NEXTAUTH_SECRET", "Assina JWTs de sessão", "openssl rand -base64 32"],
                  ["ENCRYPTION_KEY", "AES-256-GCM para credenciais RouterOS/Omada", "openssl rand -hex 16"],
                  ["WEBHOOK_SECRET", "HMAC-SHA256 para autenticar webhooks de link", "openssl rand -hex 32"],
                ].map(([k, v, g]) => (
                  <tr key={k}>
                    <td className="px-4 py-3 font-mono text-[12px] text-accent-foreground border-b border-border/50">{k}</td>
                    <Td>{v}</Td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground border-b border-border/50">{g}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>

            <H2 id="sec-ssrf">SSRF prevention</H2>
            <P><Code>controllerIpSchema</Code> em <Code>lib/schemas/device.ts</Code> valida IPs de controllers
              UniFi/Omada e rejeita loopback (<Code>127.x</Code>), link-local (<Code>169.254.x</Code>),
              multicast (<Code>224.x–239.x</Code>) e endereços privados de classe A/B/C que poderiam apontar
              para serviços internos.</P>

            <H2 id="sec-sanitize">Sanitização de dados</H2>
            <P><Code>sanitizeDevice()</Code> em <Code>lib/device-utils.ts</Code> remove todos os campos de
              credenciais de qualquer device antes de retornar pela API. Substitui por
              <Code>hasRouterosCredentials: boolean</Code>. <strong>Nenhuma senha ou chave é enviada ao browser.</strong></P>

            <H2 id="sec-ratelimit">Rate limiting</H2>
            <P>O endpoint de login (<Code>POST /api/auth/callback/credentials</Code>) aceita no máximo
              10 requests por IP em janelas de 15 minutos. O estado fica na tabela <Code>RateLimit</Code>
              do banco (persiste entre restarts). A resposta excedida retorna 429.</P>

            <H2 id="sec-audit">Audit log</H2>
            <P>Toda operação de escrita (create, update, delete) registra uma linha em <Code>AuditLog</Code>
              via <Code>lib/audit.ts</Code>:</P>
            <Block>{`
import { writeAudit } from "@/lib/audit";

await writeAudit({
  action: "UPDATE",
  entity: "Device",
  entityId: device.id,
  userId: session.user.id,
  ip: req.headers.get("x-forwarded-for") ?? "unknown",
  payload: { before: oldData, after: newData },
});
`}</Block>
            <P>Webhooks de link usam <Code>userId: "webhook"</Code> e IP de origem para rastreabilidade.</P>
          </Sec>

          {/* ── Testing ──────────────────────────────────────────────── */}
          <Sec id="testing">
            <H1 icon={TestTube2}>Testes</H1>

            <H2 id="test-unit">Testes unitários</H2>
            <P>Ficam em <Code>__tests__/lib/</Code> e <Code>__tests__/worker/</Code>. Testam funções puras
              e monitores com mocks das dependências externas (banco, rede).</P>
            <Block>{`
npm test                          # todos os testes
npm run test:watch                # modo watch
npm test -- --testPathPatterns="__tests__/lib/crypto"
`}</Block>

            <H2 id="test-api">Testes de API</H2>
            <P>Ficam em <Code>__tests__/api/</Code>. Mocam o Prisma Client e a sessão NextAuth para testar
              cada rota isoladamente. Verificam status HTTP, formato da resposta e comportamento de erro.</P>
            <Block>{`
// Padrão de mock em testes de API
jest.mock("@/lib/db", () => ({ db: { device: { findMany: jest.fn() } } }));
jest.mock("@/lib/auth", () => ({ auth: jest.fn().mockResolvedValue({
  user: { id: "1", role: "ADMIN" }
})}));
`}</Block>

            <H2 id="test-integration">Testes de integração</H2>
            <P>Ficam em <Code>__tests__/integration/</Code> e requerem o container PostgreSQL rodando.
              Testam fluxos end-to-end reais (criação de device, webhook UP/DOWN, etc.).</P>
            <Block>{`
npm run test:integration   # requer: docker compose up -d
`}</Block>

            <H2 id="test-coverage">Cobertura</H2>
            <Block>{`
npm run test:coverage
# Relatório em coverage/lcov-report/index.html
`}</Block>
            <Callout variant="tip">
              Ao adicionar uma nova rota de API, adicione o teste correspondente em <Code>__tests__/api/</Code>
              e inclua o endpoint na lista de rotas protegidas em <Code>__tests__/security/api-auth-full.test.ts</Code>.
            </Callout>
          </Sec>

          {/* ── Extending ────────────────────────────────────────────── */}
          <Sec id="extending">
            <H1 icon={GitBranch}>Extensão do sistema</H1>

            <H2 id="ext-protocol">Adicionar novo protocolo de monitoramento</H2>
            <Block>{`
1. Crie worker/monitors/seuprotocolo.ts
   → Retorne interface tipada: { online: boolean; latencyMs?: number; ... }

2. Importe em worker/scheduler.ts → runChecks()
   → Adicione à chamada Promise.allSettled

3. Mapeie resultado para DeviceStatus e StatusHistory
   → Adicione os campos necessários no schema

4. Atualize prisma/schema.prisma
   npm run db:migrate && npm run db:generate

5. Adicione toggle e campos de config em components/device-form-protocols.tsx

6. Adicione schema de validação em lib/schemas/device.ts

7. Escreva testes em __tests__/worker/seuprotocolo.test.ts
`}</Block>

            <H2 id="ext-api">Adicionar nova rota de API</H2>
            <Block>{`
1. Crie app/api/recurso/route.ts
   → Use withAuth() para autenticação
   → Use parseBody() para body parsing seguro
   → Use schema Zod para validação

2. Adicione à lista de rotas protegidas:
   __tests__/security/api-auth-full.test.ts

3. Escreva testes em __tests__/api/recurso.test.ts

4. Documente em docs/openapi.yaml
`}</Block>

            <H2 id="ext-model">Adicionar novo modelo no banco</H2>
            <Block>{`
1. Edite prisma/schema.prisma
   → Adicione o model com índices adequados

2. npm run db:migrate    # gera e aplica a migration
   npm run db:generate   # regenera o Prisma Client

3. Se o model tiver dados sensíveis:
   → Cifre com encrypt() de lib/crypto.ts antes de salvar
   → Decifre com decrypt() ao usar, nunca ao serializar para API

4. Se o model tiver operações de escrita pela UI:
   → Chame writeAudit() nas operações relevantes
`}</Block>
          </Sec>

          {/* ── Env ──────────────────────────────────────────────────── */}
          <Sec id="env">
            <H1 icon={Settings}>Variáveis de ambiente</H1>
            <TableWrap>
              <thead><tr><Th>Variável</Th><Th>Obrigatório</Th><Th>Descrição</Th></tr></thead>
              <tbody>
                {[
                  ["DATABASE_URL", "Sim", "Connection string PostgreSQL"],
                  ["NEXTAUTH_SECRET", "Sim", "Segredo para assinar JWTs de sessão (mín. 32 chars)"],
                  ["NEXTAUTH_URL", "Sim", "URL base da aplicação (ex: http://localhost:3000)"],
                  ["ENCRYPTION_KEY", "Sim (worker)", "32 bytes hex para AES-256-GCM. Worker aborta sem ela"],
                  ["WEBHOOK_SECRET", "Sim (worker)", "Mín. 32 chars para HMAC-SHA256. Worker aborta sem ela"],
                  ["WORKER_STALE_WEBHOOK_URL", "Não", "URL para notificação quando worker ficar stale (cooldown 1h)"],
                  ["NODE_ENV", "Não", "development | production. Afeta logging e otimizações"],
                ].map(([k, req, desc]) => (
                  <tr key={k}>
                    <td className="px-4 py-3 font-mono text-[12px] text-accent-foreground border-b border-border/50 whitespace-nowrap">{k}</td>
                    <td className={cn("px-4 py-3 text-[13px] border-b border-border/50 whitespace-nowrap font-semibold",
                      req === "Sim" ? "text-destructive" : req === "Não" ? "text-muted-foreground" : "text-warning"
                    )}>{req}</td>
                    <Td>{desc}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Sec>

          {/* ── Logging ──────────────────────────────────────────────── */}
          <Sec id="logging">
            <H1 icon={Terminal}>Logging</H1>
            <P>O worker usa <Code>lib/logger.ts</Code> para emitir logs estruturados em JSON para stdout.
              O Next.js usa o logger padrão do Node.js/Next.</P>
            <Block>{`
import { log } from "@/lib/logger";

log("info",  "Device check completed", { deviceId, latencyMs });
log("warn",  "SNMP timeout",           { deviceId, ip });
log("error", "RouterOS auth failed",   { deviceId, error: err.message });
`}</Block>
            <P>Formato de saída:</P>
            <Block>{`
{"level":"info","msg":"Device check completed","deviceId":"abc","latencyMs":12,"ts":"2026-06-14T10:00:00.000Z"}
`}</Block>
            <Callout variant="warning">
              Nunca use <Code>console.log</Code> diretamente no worker. Use sempre <Code>log()</Code> para
              manter o formato estruturado e o roteamento por nível correto.
            </Callout>
          </Sec>

          {/* ── Deploy ───────────────────────────────────────────────── */}
          <Sec id="deploy">
            <H1 icon={Server}>Deploy</H1>
            <P>Consulte <Code>docs/deploy-vps.md</Code> para o guia completo. Resumo:</P>
            <Block>{`
# 1. Configurar .env com todos os secrets de produção
# 2. Subir banco
docker compose up -d

# 3. Aplicar migrations e criar usuário admin
npm run db:migrate
npm run create-user

# 4. Build de produção
npm run build

# 5. Iniciar com PM2
npm install -g pm2
pm2 start "npm run start:all" --name watchit-tower
pm2 save && pm2 startup
`}</Block>
            <Callout variant="tip">
              Use <Code>docker-compose.dev.yml</Code> para desenvolvimento local com volume de hot-reload
              e sem as restrições de rede de produção.
            </Callout>
            <P>Em produção, monitore <Code>/api/health</Code> periodicamente. O campo <Code>workerStatus</Code>
              indica se o worker está ativo. Configure <Code>WORKER_STALE_WEBHOOK_URL</Code> para receber alertas
              automáticos quando o worker parar de responder.</P>
          </Sec>

        </main>
      </div>
    </>
  );
}
