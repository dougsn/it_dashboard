/**
 * OBSOLETO — migração já aplicada (SEC-029).
 *
 * As colunas routerosUser e routerosPass foram removidas do banco em
 * 20260613000000_drop_routeros_plaintext. Todas as credenciais estão
 * armazenadas exclusivamente nas colunas criptografadas *Enc.
 *
 * Este script é mantido apenas para referência histórica.
 */
console.log(
  "Migração de credenciais já foi aplicada (SEC-029).\n" +
  "As colunas routerosUser e routerosPass foram removidas do banco.\n" +
  "Nenhuma ação necessária."
);
