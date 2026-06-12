/**
 * Inserts security notes that don't already exist (matched by title).
 * Safe to run multiple times — skips duplicates.
 * Run with: npx tsx scripts/add-security-notes.ts
 */
import "dotenv/config";
import { db } from "../lib/db";

const notes = [
  {
    title: "CSP com unsafe-eval (limitação do Next.js 14)",
    content:
      `O header Content-Security-Policy inclui 'unsafe-eval' porque o Next.js 14 com App Router ` +
      `exige essa diretiva para funcionamento interno (hot reload, edge runtime, etc.). ` +
      `Remover unsafe-eval quebraria o framework sem downgrade.\n\n` +
      `Impacto: Abre superfície para ataques XSS via eval() caso algum conteúdo dinâmico não sanitizado chegue ao cliente. ` +
      `Em um dashboard interno sem conteúdo de usuário renderizado como HTML, o risco prático é baixo.\n\n` +
      `Opções:\n` +
      `1. Migrar para Next.js 15+ que suporta nonces para eliminar unsafe-eval.\n` +
      `2. Manter como aceito dado o contexto de uso interno isolado.`,
    severity: "WARNING" as const,
    category: "SECURITY" as const,
    status: "OPEN" as const,
  },
  {
    title: "Rate limiting em memória — não sobrevive a restarts",
    content:
      `O rate limiting do endpoint de login é implementado em memória (Map local no processo). ` +
      `Isso significa que:\n` +
      `- O contador zera quando o processo Next.js reinicia\n` +
      `- Em modo cluster/multi-instância, cada worker tem seu próprio contador independente\n\n` +
      `Impacto: Um atacante pode contornar o limite de 10 tentativas reiniciando entre ataques ` +
      `(improvável em uso real) ou em deploys com múltiplas réplicas.\n\n` +
      `Mitigação futura: Mover o estado do rate limiter para Redis ou para a tabela do banco ` +
      `(ex: tabela LoginAttempts com TTL). Aceitável no contexto single-instance atual.`,
    severity: "INFO" as const,
    category: "SECURITY" as const,
    status: "OPEN" as const,
  },
  {
    title: "Endpoints de webhook sem autenticação de sessão",
    content:
      `As rotas GET /api/links/:id/up e /api/links/:id/down não exigem sessão — são protegidas ` +
      `apenas por HMAC-SHA256 via query param ?token=. Isso é intencional para integração com ` +
      `sistemas externos (Zabbix, Nagios, scripts de monitoramento).\n\n` +
      `Risco residual:\n` +
      `- Se WEBHOOK_SECRET vazar, qualquer um pode mudar o status de qualquer link\n` +
      `- Não há log de auditoria para eventos webhook (quem chamou, quando, de qual IP)\n\n` +
      `Mitigação futura: Adicionar logging estruturado com IP de origem em cada chamada webhook. ` +
      `Considerar rotação periódica do WEBHOOK_SECRET.`,
    severity: "INFO" as const,
    category: "SECURITY" as const,
    status: "OPEN" as const,
  },
  {
    title: "startScheduler não coberta por testes automatizados",
    content:
      `A função startScheduler() em worker/scheduler.ts — responsável por orquestrar heartbeat, ` +
      `reconciliação de devices e polling de links — não possui testes de integração.\n\n` +
      `Risco: Bugs de inicialização (ex: loop infinito sem devices, falha no primeiro heartbeat) ` +
      `passariam despercebidos na CI e só seriam detectados em runtime.\n\n` +
      `O que existe: 3 testes de shutdown (drain de operações em andamento) e testes unitários ` +
      `para cada monitor individual (ping, http, snmp, routeros, link-traffic).\n\n` +
      `Mitigação futura: Adicionar teste de integração do scheduler usando fake timers do Jest, ` +
      `mockando db.device.findMany e verificando que intervals são criados e drainados corretamente.`,
    severity: "INFO" as const,
    category: "OPERATIONAL" as const,
    status: "OPEN" as const,
  },
  {
    title: "Sem timeout global na inicialização do worker",
    content:
      `Se o banco de dados ficar indisponível durante a inicialização, startScheduler() ` +
      `pode travar indefinidamente em db.device.findMany() sem encerrar o processo.\n\n` +
      `Comportamento atual: O Prisma tem timeout de conexão configurável, mas o worker não ` +
      `implementa um watchdog que force process.exit após N segundos de inicialização travada.\n\n` +
      `Impacto: Em falha do banco na subida do container, o worker permanece em estado ` +
      `"rodando mas não funcional" sem emitir sinal de falha ao orquestrador (Docker/systemd).\n\n` +
      `Mitigação futura: Adicionar AbortSignal com timeout em startScheduler(), ou um watchdog ` +
      `via setTimeout que chama process.exit(1) se a inicialização não completar em 30s.`,
    severity: "INFO" as const,
    category: "OPERATIONAL" as const,
    status: "OPEN" as const,
  },
  {
    title: "SEC-021 — Cache de papel JWT não invalida imediatamente",
    content:
      `O papel do usuário (ADMIN, OPERADOR, VIEWER) é embutido no token JWT no momento do login. ` +
      `Alterações de papel feitas por um administrador só têm efeito na próxima sessão (até 8h depois).\n\n` +
      `Impacto: Rebaixamento de cargo ou revogação de acesso não são imediatos — ` +
      `o usuário afetado mantém o papel antigo até o token expirar.\n\n` +
      `Ação imediata em caso de emergência: excluir o usuário do banco via Prisma Studio ` +
      `ou script. Alterar o papel não é suficiente sem forçar o logout.\n\n` +
      `Mitigação futura: Lista negra de tokens JWT (Redis/banco) ou migrar para sessões de banco ` +
      `que permitem invalidação instantânea.`,
    severity: "INFO" as const,
    category: "SECURITY" as const,
    status: "OPEN" as const,
  },
  {
    title: "SEC-022 — Eventos de webhook de links não registrados no AuditLog",
    content:
      `As rotas GET /api/links/:id/up e GET /api/links/:id/down alteram o status de links de internet ` +
      `mas não registram nenhuma entrada no sistema de auditoria.\n\n` +
      `Impacto: Mudanças de status via webhook (Zabbix, Nagios, scripts externos) ficam invisíveis ` +
      `nos Logs de Alterações — não é possível rastrear quem chamou, de qual IP e quando.\n\n` +
      `Mitigação: Adicionar writeAudit com action "UPDATE", entity "Link", ipAddress e ` +
      `details: { event: "up" | "down", source: "webhook" } em ambas as rotas webhook.`,
    severity: "INFO" as const,
    category: "SECURITY" as const,
    status: "OPEN" as const,
  },
];

async function main() {
  console.log("Verificando notas existentes por título...");
  let created = 0;
  let skipped = 0;

  for (const note of notes) {
    const exists = await db.note.findFirst({ where: { title: note.title } });
    if (exists) {
      console.log(`  SKIP   ${note.title}`);
      skipped++;
    } else {
      await db.note.create({ data: note });
      console.log(`  CREATE ${note.severity.padEnd(8)} ${note.title}`);
      created++;
    }
  }

  console.log(`\nConcluído: ${created} criada(s), ${skipped} ignorada(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect?.());
