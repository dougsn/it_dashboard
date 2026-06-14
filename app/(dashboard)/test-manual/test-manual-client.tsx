"use client";

import { Topbar } from "@/components/topbar";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: "overview",       title: "Visão geral" },
  { id: "config",         title: "Configuração Jest" },
  { id: "how-to-run",     title: "Como executar" },
  { id: "api",            title: "Testes de API" },
  { id: "worker",         title: "Testes do Worker" },
  { id: "components",     title: "Testes de Componentes" },
  { id: "lib",            title: "Testes de Biblioteca" },
  { id: "security",       title: "Testes de Segurança" },
  { id: "integration",    title: "Testes de Integração" },
  { id: "load",           title: "Teste de Carga" },
  { id: "patterns",       title: "Padrões e Convenções" },
  { id: "coverage",       title: "Cobertura de Código" },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-[12.5px] font-mono text-foreground overflow-x-auto leading-relaxed my-4">
      {children}
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted border border-border rounded px-1.5 py-0.5 text-[12px] font-mono text-foreground">
      {children}
    </code>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[17px] font-bold text-foreground mb-3 mt-10 first:mt-0 scroll-mt-8">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[14px] font-bold text-foreground mb-2 mt-6">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13.5px] text-foreground/75 leading-relaxed mb-3">{children}</p>;
}

function Callout({ type = "info", children }: { type?: "info" | "warn" | "tip"; children: React.ReactNode }) {
  const styles = {
    info: "bg-primary/5 border-primary/20 text-primary",
    warn: "bg-warning/5 border-warning/20 text-warning",
    tip:  "bg-success/5 border-success/20 text-success",
  };
  return (
    <div className={cn("border-l-4 rounded-r-lg px-4 py-3 text-[13px] leading-relaxed mb-4", styles[type])}>
      {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-[12.5px] border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 font-bold text-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-foreground/75 font-mono whitespace-pre-wrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TestManualClient() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

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
    const elements = document.querySelectorAll("[data-section]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Topbar
        title="Manual de Testes"
        subtitle="Estratégia, metodologia e guia de execução da suite de testes"
      />

      <div className="flex gap-0 min-h-0 flex-1">
        {/* ToC */}
        <aside
          aria-label="Índice do manual de testes"
          tabIndex={0}
          className="w-52 shrink-0 border-r border-border px-3 py-6 sticky top-0 max-h-[calc(100vh-57px)] overflow-y-auto"
        >
          <div className="text-[10.5px] font-bold uppercase tracking-[.09em] text-muted-foreground mb-3 px-2">
            Conteúdo
          </div>
          <nav className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "block px-2 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors",
                  activeId === s.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div ref={contentRef} tabIndex={0} className="flex-1 px-10 py-8 max-w-3xl overflow-y-auto">

          {/* OVERVIEW */}
          <div data-section id="overview">
            <SectionTitle id="overview">Visão geral</SectionTitle>
            <P>
              O WatchIT Tower possui uma suite com <strong>586 testes</strong> em <strong>69 suítes</strong>{" "}
              (run padrão) cobrindo API routes, worker de monitoramento, componentes React,
              bibliotecas utilitárias, segurança e fluxos de integração end-to-end.
            </P>
            <P>
              A estratégia segue a pirâmide de testes: a base são testes unitários rápidos e isolados
              (lib, worker, components), o meio são testes de API com mocks de banco, e o topo são
              testes de integração contra PostgreSQL real rodando em Docker.
            </P>

            <Table
              headers={["Camada", "Arquivos", "Ambiente", "Banco"]}
              rows={[
                ["API Routes",     "33 arquivos",  "node",   "Mock (jest-mock-extended)"],
                ["Worker Monitors","12 arquivos",  "node",   "Mock"],
                ["Componentes",    "17 arquivos",  "jsdom",  "–"],
                ["Bibliotecas",    "5 arquivos",   "node",   "–"],
                ["Segurança",      "3 arquivos",   "node",   "Mock"],
                ["Integração",     "4 arquivos",   "node",   "PostgreSQL real (Docker)"],
                ["Carga",          "1 arquivo",    "node",   "PostgreSQL real (Docker)"],
              ]}
            />
          </div>

          {/* CONFIG */}
          <div data-section id="config">
            <SectionTitle id="config">Configuração Jest</SectionTitle>
            <P>
              O arquivo <InlineCode>jest.config.ts</InlineCode> usa o wrapper do Next.js (
              <InlineCode>next/jest</InlineCode>) que pré-configura transformers para TSX, path aliases
              e variáveis de ambiente do Next.js.
            </P>
            <Code>{`// jest.config.ts — pontos relevantes
{
  coverageProvider: "v8",         // V8 nativo, mais rápido que Babel
  testEnvironment: "jsdom",       // padrão para componentes React
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },  // alias @/ → raiz

  // Excluídos do run padrão (npm test):
  testPathIgnorePatterns: [
    "__tests__/integration/",      // requerem PostgreSQL rodando
    "__tests__/worker/load.test.ts" // teste de carga demorado
  ],

  // Cobertura coletada de:
  collectCoverageFrom: [
    "lib/**/*.ts",
    "app/api/**/*.ts",
    "worker/**/*.ts",
    "components/**/*.tsx",
    "!components/ui/**",  // shadcn/ui não testado (código gerado)
  ]
}`}
            </Code>
            <P>
              Testes que precisam de Node.js (acesso a <InlineCode>process.env</InlineCode>, módulos
              nativos, Prisma) declaram no topo do arquivo:
            </P>
            <Code>{`/**
 * @jest-environment node
 */`}
            </Code>
            <P>
              O arquivo <InlineCode>jest.setup.ts</InlineCode> inicializa o mock global do Prisma antes
              de cada suite via <InlineCode>jest-mock-extended</InlineCode>.
            </P>
          </div>

          {/* HOW TO RUN */}
          <div data-section id="how-to-run">
            <SectionTitle id="how-to-run">Como executar</SectionTitle>

            <SubTitle>Suite padrão (rápida)</SubTitle>
            <Code>{`npm test                   # todos exceto integração e carga
npm run test:coverage      # com relatório de cobertura (lcov + text)
npm test -- --watch        # modo watch para desenvolvimento`}
            </Code>

            <SubTitle>Arquivo ou padrão específico</SubTitle>
            <Code>{`npm test -- --testPathPatterns="__tests__/api/devices.test.ts"
npm test -- --testPathPatterns="api/devices"   # parcial também funciona
npm test -- --testNamePattern="DELETE"         # filtrar por nome de describe/it`}
            </Code>

            <SubTitle>Testes de integração (requer Docker)</SubTitle>
            <Code>{`docker compose up -d                     # PostgreSQL na porta 5432
npm run db:migrate                       # aplica migrations no banco test
npm run test:integration                 # roda __tests__/integration/ + load`}
            </Code>
            <Callout type="warn">
              Os testes de integração usam o banco <InlineCode>it_dashboard_test</InlineCode> (banco
              separado do desenvolvimento). Cada suite cria registros com prefixo único (
              <InlineCode>{`integ-${"{Date.now()}"}`}</InlineCode>) e faz cleanup em{" "}
              <InlineCode>afterAll</InlineCode>.
            </Callout>

            <SubTitle>Variáveis de ambiente para testes</SubTitle>
            <P>
              Testes unitários e de API definem as variáveis diretamente no arquivo ou via{" "}
              <InlineCode>jest.setup.ts</InlineCode>. Testes de integração requerem:
            </P>
            <Code>{`DATABASE_URL=postgresql://it_dashboard:it_dashboard@localhost:5432/it_dashboard_test
ENCRYPTION_KEY=<64 hex chars>
WEBHOOK_SECRET=<min 32 chars>
NEXTAUTH_SECRET=<min 32 chars>`}
            </Code>
          </div>

          {/* API TESTS */}
          <div data-section id="api">
            <SectionTitle id="api">Testes de API</SectionTitle>
            <P>
              Cobrem todos os 17+ endpoints da aplicação. Cada arquivo importa o handler diretamente
              (sem subir o servidor HTTP) e chama <InlineCode>handler(req)</InlineCode> recebendo um{" "}
              <InlineCode>NextResponse</InlineCode>.
            </P>
            <Callout type="tip">
              O Prisma é completamente mockado via <InlineCode>jest-mock-extended</InlineCode>. Nenhum
              teste de API toca o banco real — isso garante velocidade e isolamento total.
            </Callout>

            <Table
              headers={["Arquivo", "O que testa"]}
              rows={[
                ["devices.test.ts",          "GET /api/devices (filtro ?type=), POST create, validação Zod"],
                ["devices-id.test.ts",        "GET/PUT/DELETE /api/devices/[id], sanitização de credenciais"],
                ["devices-bulk.test.ts",      "POST /api/devices/bulk, range de IPs, limite de 256"],
                ["devices-check.test.ts",     "POST /api/devices/[id]/check (trigger manual de check)"],
                ["devices-export.test.ts",    "GET /api/devices/export (CSV, proteção de fórmula)"],
                ["health.test.ts",            "GET /api/health — uptime%, worker liveness, webhook stale"],
                ["incidents.test.ts",         "GET /api/incidents — paginação, filtros por tipo/status"],
                ["links.test.ts",             "CRUD completo de links, campos de bandwidth"],
                ["links-webhook.test.ts",     "POST /api/links/[id]/up|down — verificação HMAC-SHA256"],
                ["links-events.test.ts",      "GET /api/links/[id]/events — histórico de UP/DOWN"],
                ["links-live-traffic.test.ts","GET /api/links/[id]/live-traffic — leitura de bps em tempo real"],
                ["links-test-traffic.test.ts","POST /api/links/test-traffic — validação de conexão RouterOS"],
                ["overview.test.ts",          "GET /api/overview — sparklines, link segments, NaN guard"],
                ["status.test.ts",            "GET /api/status/[deviceId] — histórico com ?hours="],
                ["timeline.test.ts",          "GET /api/timeline — eventos unificados, dedup, ?hours="],
                ["reports.test.ts",           "GET /api/reports/[id] — downtime, ping, CPU/memória"],
                ["users.test.ts",             "GET/POST /api/users — roles, bcrypt hash, totpEnabled"],
                ["users-id.test.ts",          "PUT/DELETE /api/users/[id], TOTP enable/disable/verify"],
                ["admin-audit.test.ts",       "GET /api/admin/audit — logs paginados com filtros"],
                ["admin-audit-export.test.ts","GET /api/admin/audit/export — CSV, proteção de fórmula"],
                ["admin-audit-purge.test.ts", "DELETE /api/admin/audit — purge por data"],
                ["admin-audit-stats.test.ts", "GET /api/admin/audit/stats — contadores por ação"],
                ["admin-cleanup.test.ts",     "POST /api/admin/cleanup — retenção de histórico"],
                ["admin-config.test.ts",      "GET/PUT /api/admin/config — configurações do sistema"],
                ["admin-stats.test.ts",       "GET /api/admin/stats — métricas do banco"],
                ["metrics.test.ts",           "GET /api/metrics — CPU, memória do processo Node"],
                ["version.test.ts",           "GET /api/version — build number via git"],
                ["counts.test.ts",            "GET /api/counts — contagens leves de dispositivos/links para a sidebar (offline = total − online)"],
                ["auth-rate-check.test.ts",   "GET /api/auth/rate-check — estado do rate limiter por IP"],
                ["test-unifi.test.ts",        "POST /api/devices/test-unifi — SSRF prevention"],
              ]}
            />
          </div>

          {/* WORKER TESTS */}
          <div data-section id="worker">
            <SectionTitle id="worker">Testes do Worker</SectionTitle>
            <P>
              Testam os monitores individuais e o scheduler. Todos os protocolos externos (ICMP,
              SNMP, RouterOS API, HTTP) são mockados — os testes verificam lógica de tratamento de
              resultados, não a conectividade real.
            </P>

            <Table
              headers={["Arquivo", "O que testa"]}
              rows={[
                ["ping.test.ts",              "checkPing — alive/timeout, latência, tratamento de erro do pacote ICMP"],
                ["http.test.ts",              "checkHttp — status 2xx/3xx/5xx, timeout, headers customizados"],
                ["snmp.test.ts",              "checkSnmp — OIDs sysUpTime e hrProcessorLoad, fallback v1"],
                ["routeros.test.ts",          "checkRouterOS — CPU%, memória, uptime, parsing de strings RouterOS"],
                ["link-traffic.test.ts",      "checkLinkTraffic — dois samples delta, bits/s, erro de conexão"],
                ["omada.test.ts",             "checkOmada — OAuth2 token, contagem de clientes por AP"],
                ["unifi.test.ts",             "checkUnifi — autenticação cookie, contagem de clientes"],
                ["alert.test.ts",             "dispatchAlert — webhook POST, cooldown, HMAC header"],
                ["scheduler.test.ts",         "startScheduler/shutdown — drain de pendingChecks, idempotência"],
                ["scheduler-startup.test.ts", "fail-fast: ENCRYPTION_KEY e WEBHOOK_SECRET ausentes aborta worker"],
                ["scheduler-alert.test.ts",   "caminho de alerta: claim atômico (updateMany), cooldown, sem re-alerta após threshold"],
              ]}
            />

            <SubTitle>Padrão de mock dos monitores</SubTitle>
            <Code>{`// Cada teste de worker mocka o módulo externo:
jest.mock("@/worker/monitors/ping", () => ({
  checkPing: jest.fn().mockResolvedValue({ alive: true, responseMs: 12 }),
}));

// E o Prisma via jest.setup.ts (automático):
import { prismaMock } from "@/jest.setup";
prismaMock.deviceStatus.upsert.mockResolvedValue({ ... });`}
            </Code>

            <SubTitle>Scheduler — shutdown drain</SubTitle>
            <P>
              O teste mais complexo do scheduler verifica que <InlineCode>shutdown()</InlineCode> aguarda
              todas as Promises em <InlineCode>pendingChecks</InlineCode> antes de desconectar o banco.
              O teste injeta Promises artificiais de longa duração e confirma que{" "}
              <InlineCode>db.$disconnect()</InlineCode> só é chamado depois que todas resolvem.
            </P>
          </div>

          {/* COMPONENT TESTS */}
          <div data-section id="components">
            <SectionTitle id="components">Testes de Componentes</SectionTitle>
            <P>
              Usam <InlineCode>@testing-library/react</InlineCode> com ambiente <InlineCode>jsdom</InlineCode>.
              Testam renderização, interações do usuário (click, input) e estados condicionais.
            </P>

            <Table
              headers={["Arquivo", "O que testa"]}
              rows={[
                ["device-card.test.tsx",         "Renderização de status, badge de tipo, ping sparkline, link de detalhe"],
                ["device-type-badge.test.tsx",    "Cada DeviceType mapeia para a cor e label corretos"],
                ["device-form.test.tsx",          "Validação Zod no submit, campos condicionais por tipo"],
                ["device-detail-drawer.test.tsx", "Abertura/fechamento, tabs de gráfico, dados de status"],
                ["bulk-device-form.test.tsx",     "Range de IPs, cálculo de quantidade, limite de 256"],
                ["status-badge.test.tsx",         "Online/Offline/Unknown — cores e aria-labels"],
                ["sidebar.test.tsx",              "NavItems admin visíveis apenas para ADMIN, link /profile no footer"],
                ["topbar.test.tsx",               "Título, subtítulo, slot de ações"],
                ["metrics-chart.test.tsx",        "Recharts renderiza com dados, exibe empty state sem dados"],
                ["ping-chart.test.tsx",           "Eixos, tooltip, dados de historico de ping"],
                ["ping-sparkline.test.tsx",       "SVG inline com path correto para série de dados"],
                ["link-detail-drawer.test.tsx",   "Tiles de tráfego ao vivo, barra de utilização"],
                ["report-view.test.tsx",          "Filtro de datas, exportação CSV, gráfico de downtime"],
                ["bandwidth-cell.test.tsx",       "Verde/amber/vermelho por percentual, tooltip com Mbps"],
                ["filter-chip.test.tsx",          "Ativo/inativo, callback on click"],
                ["empty-state.test.tsx",          "Ícone e mensagem personalizáveis"],
                ["skeleton-list.test.tsx",        "Número correto de skeletons renderizados"],
              ]}
            />
          </div>

          {/* LIB TESTS */}
          <div data-section id="lib">
            <SectionTitle id="lib">Testes de Biblioteca</SectionTitle>
            <P>
              Testes unitários puros das funções utilitárias. Sem mocks externos — entrada/saída determinística.
            </P>

            <Table
              headers={["Arquivo", "O que testa"]}
              rows={[
                ["crypto.test.ts",       "encrypt/decrypt roundtrip, IV aleatório por chamada, erro sem ENCRYPTION_KEY, comprimento incorreto"],
                ["webhook.test.ts",      "generateWebhookToken, verifyWebhookToken com timingSafeEqual, rejeita token inválido"],
                ["format.test.ts",       "formatUptime (dias/horas/minutos), formatResponseTime (ms/s), formatPercent (arredondamento)"],
                ["logger.test.ts",       "Saída JSON no stdout para info/warn, stderr para error, campos ctx incluídos"],
                ["prisma-error.test.ts", "handlePrismaError mapeia P2002 (unique) e P2025 (not found) para HTTP codes"],
              ]}
            />

            <SubTitle>Crypto — IV aleatório</SubTitle>
            <P>
              Um dos testes mais importantes: verifica que duas chamadas a{" "}
              <InlineCode>encrypt("same")</InlineCode> produzem ciphertexts diferentes (IV gerado
              aleatoriamente por operação via <InlineCode>crypto.getRandomValues</InlineCode>). Isso
              garante que o AES-256-GCM é usado corretamente e não reutiliza IV.
            </P>
          </div>

          {/* SECURITY TESTS */}
          <div data-section id="security">
            <SectionTitle id="security">Testes de Segurança</SectionTitle>
            <P>
              Garantem que rotas protegidas retornam <strong>401</strong> quando não autenticadas e
              que endpoints sensíveis respeitam os requisitos de role.
            </P>

            <SubTitle>api-auth.test.ts</SubTitle>
            <P>
              Mocka <InlineCode>auth()</InlineCode> para retornar <InlineCode>null</InlineCode> e verifica
              que cada rota protegida responde 401. Cobre o subconjunto principal de endpoints.
            </P>

            <SubTitle>api-auth-full.test.ts</SubTitle>
            <P>
              Versão expandida que itera sobre <strong>todos</strong> os handlers importados e verifica
              401 em massa. Usa <InlineCode>@jest-environment node</InlineCode> para ter acesso ao
              módulo de autenticação real.
            </P>

            <SubTitle>viewer-authorization.test.ts</SubTitle>
            <P>
              Verifica autorização <strong>por papel</strong> (não só 401): um VIEWER recebe <strong>403</strong>{" "}
              em endpoints que disparam operações de rede (<InlineCode>devices/check</InlineCode>,{" "}
              <InlineCode>links/test-traffic</InlineCode>, <InlineCode>links/[id]/live-traffic</InlineCode>) e
              não recebe o <InlineCode>webhookToken</InlineCode> em <InlineCode>GET /api/links</InlineCode> —
              cobre os achados SEC-028 e SEC-029.
            </P>

            <SubTitle>Rotas de autenticação (TOTP, logout, check-2fa)</SubTitle>
            <P>
              <InlineCode>users-totp.test.ts</InlineCode> cobre ativação/desativação de 2FA (admin e
              auto-gerenciamento, 403 para terceiros, token inválido, criptografia do segredo);{" "}
              <InlineCode>auth-logout.test.ts</InlineCode> cobre a blacklist do JWT (idempotência, limpeza
              de cookie); <InlineCode>auth-check-2fa.test.ts</InlineCode> cobre a detecção de 2FA sem enumeração.
            </P>
            <Code>{`// Padrão usado em ambos os arquivos:
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue(null),  // simula sem sessão
}));

it("GET /api/devices returns 401 without session", async () => {
  const req = new Request("http://localhost/api/devices");
  const res = await GET(req);
  expect(res.status).toBe(401);
});`}
            </Code>

            <Callout type="info">
              A regra de 401 é crítica: qualquer nova rota de API adicionada ao sistema <strong>deve</strong>{" "}
              ter um teste correspondente em <InlineCode>api-auth-full.test.ts</InlineCode>. Isso evita
              exposição acidental de dados sem autenticação.
            </Callout>
          </div>

          {/* INTEGRATION TESTS */}
          <div data-section id="integration">
            <SectionTitle id="integration">Testes de Integração</SectionTitle>
            <P>
              Os únicos testes que usam um banco PostgreSQL real. Executados separadamente via{" "}
              <InlineCode>npm run test:integration</InlineCode> para não bloquear o CI padrão.
            </P>

            <Table
              headers={["Arquivo", "O que testa"]}
              rows={[
                ["devices-crud.test.ts", "CRUD completo de Device no banco real — create, read, update, delete, filtros"],
                ["webhook-flow.test.ts", "Fluxo UP/DOWN de link: cria link no banco, dispara webhook, verifica LinkEvent gravado"],
                ["webhook-e2e.test.ts",  "Versão expandida do webhook com múltiplos eventos e verificação de estado final"],
                ["incident-detection.test.ts", "Valida as queries SQL com window function (LAG) — colapso de transições de incidente/latência e agregações de relatório (FILTER/stride) contra PostgreSQL real"],
              ]}
            />

            <SubTitle>Isolamento de dados</SubTitle>
            <P>
              Cada suite gera um prefixo único com timestamp (<InlineCode>{`integ-${"{Date.now()}"}`}</InlineCode>)
              para todos os registros criados. O bloco <InlineCode>afterAll</InlineCode> deleta todos
              os registros com aquele prefixo, garantindo que testes paralelos não colidam e que o
              banco fique limpo após a execução.
            </P>
            <Code>{`// db-helper.ts — fábrica de cliente de teste
export function createTestDb() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

// Em cada suite:
const PREFIX = \`integ-\${Date.now()}\`;
afterAll(async () => {
  await db.device.deleteMany({ where: { name: { startsWith: PREFIX } } });
  await db.$disconnect();
});`}
            </Code>
          </div>

          {/* LOAD TEST */}
          <div data-section id="load">
            <SectionTitle id="load">Teste de Carga</SectionTitle>
            <P>
              O arquivo <InlineCode>__tests__/worker/load.test.ts</InlineCode> simula{" "}
              <strong>50 dispositivos</strong> com interval de 1 segundo no scheduler real, com todos
              os monitores mockados para retornar imediatamente. O objetivo é medir throughput do
              scheduler e escrita no banco — não a latência dos protocolos externos.
            </P>
            <Callout type="warn">
              Este teste é excluído do <InlineCode>npm test</InlineCode> padrão e só roda com{" "}
              <InlineCode>npm run test:integration</InlineCode>. Requer PostgreSQL real e pode levar
              30–60 segundos para completar.
            </Callout>
            <P>
              O teste verifica que após N ticks, o número de registros em{" "}
              <InlineCode>StatusHistory</InlineCode> corresponde ao esperado (50 dispositivos × N ticks).
              Isso detecta race conditions no scheduler ou perda silenciosa de writes.
            </P>
          </div>

          {/* PATTERNS */}
          <div data-section id="patterns">
            <SectionTitle id="patterns">Padrões e Convenções</SectionTitle>

            <SubTitle>Mock global do Prisma</SubTitle>
            <P>
              O <InlineCode>jest.setup.ts</InlineCode> exporta um <InlineCode>prismaMock</InlineCode>{" "}
              criado com <InlineCode>mockDeep&lt;PrismaClient&gt;()</InlineCode>. Cada teste que precisa
              do banco importa esse mock e configura retornos com{" "}
              <InlineCode>prismaMock.model.method.mockResolvedValue()</InlineCode>.
            </P>
            <Code>{`import { prismaMock } from "@/jest.setup";

prismaMock.device.findMany.mockResolvedValue([
  { id: "1", name: "Router-1", ip: "192.168.1.1", ... }
]);`}
            </Code>

            <SubTitle>Request helper para API routes</SubTitle>
            <P>
              Testes de API criam <InlineCode>Request</InlineCode> do Web API diretamente — não há
              servidor HTTP. O handler recebe o request e retorna um <InlineCode>Response</InlineCode>
              que é inspecionado:
            </P>
            <Code>{`import { GET, POST } from "@/app/api/devices/route";

const req = new Request("http://localhost/api/devices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Router-1", ip: "10.0.0.1", type: "MIKROTIK" }),
});
const res = await POST(req);
expect(res.status).toBe(201);
const body = await res.json();
expect(body.name).toBe("Router-1");`}
            </Code>

            <SubTitle>Parâmetros de rota dinâmica</SubTitle>
            <P>
              Rotas com <InlineCode>[id]</InlineCode> recebem o segundo argumento{" "}
              <InlineCode>{"{ params: { id: \"...\" } }"}</InlineCode>:
            </P>
            <Code>{`import { GET } from "@/app/api/devices/[id]/route";

const res = await GET(
  new Request("http://localhost/api/devices/abc"),
  { params: { id: "abc" } }
);`}
            </Code>

            <SubTitle>Asserção de autenticação</SubTitle>
            <P>
              Testes que verificam proteção de rota mockam <InlineCode>auth</InlineCode> no topo do
              arquivo e confirmam status 401:
            </P>
            <Code>{`jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue(null),
}));`}
            </Code>

            <SubTitle>Nomeação de describes e its</SubTitle>
            <P>
              Convenção usada em toda a suite: <InlineCode>describe</InlineCode> com o nome do
              endpoint ou função, <InlineCode>it</InlineCode> com frase descritiva no formato
              "verbo + condição":
            </P>
            <Code>{`describe("GET /api/devices", () => {
  it("returns filtered list when ?type=MIKROTIK", async () => { ... });
  it("returns 401 without session", async () => { ... });
  it("returns empty array when no devices exist", async () => { ... });
});`}
            </Code>
          </div>

          {/* COVERAGE */}
          <div data-section id="coverage">
            <SectionTitle id="coverage">Cobertura de Código</SectionTitle>
            <P>
              A cobertura é medida com o provider V8 do Node.js, que é mais preciso que a
              instrumentação via Babel para código TypeScript compilado.
            </P>
            <Code>{`npm run test:coverage
# Gera relatório em:
# - terminal (text)
# - coverage/lcov-report/index.html  (HTML navegável)
# - coverage/lcov.info               (para integração com ferramentas externas)`}
            </Code>

            <SubTitle>Escopo da cobertura</SubTitle>
            <Table
              headers={["Incluído", "Excluído"]}
              rows={[
                ["lib/**/*.ts",            "components/ui/** (shadcn — código gerado)"],
                ["app/api/**/*.ts",        "app/(dashboard)/**/*.tsx (páginas — testadas via componentes)"],
                ["worker/**/*.ts",         "scripts/** (utilitários CLI)"],
                ["components/**/*.tsx",    "**/*.d.ts (tipos)"],
              ]}
            />

            <Callout type="tip">
              A meta não é 100% de cobertura — é cobertura <strong>significativa</strong>. Paths de
              erro de rede, timeouts e condições de corrida do scheduler são priorizados sobre linhas
              triviais de renderização de componentes. O critério é: "se essa linha falhar em produção,
              temos um teste que detecta?"
            </Callout>

            <SubTitle>Adicionando testes para novas funcionalidades</SubTitle>
            <P>
              Ao adicionar uma nova rota de API:
            </P>
            <Code>{`1. Criar __tests__/api/nome-da-rota.test.ts
2. Adicionar @jest-environment node no topo
3. Mockar auth() para testar 401
4. Mockar prismaMock para as queries usadas
5. Adicionar o handler em api-auth-full.test.ts`}
            </Code>
            <P>
              Ao adicionar um novo monitor ao worker:
            </P>
            <Code>{`1. Criar __tests__/worker/nomeprotocolo.test.ts
2. Mockar a biblioteca externa (net-snmp, routeros, etc.)
3. Testar: resultado de sucesso, timeout, erro de conexão
4. Atualizar __tests__/worker/load.test.ts para incluir o mock do novo monitor`}
            </Code>
          </div>

        </div>
      </div>
    </>
  );
}
