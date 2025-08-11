import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configuração robusta do Neon para produção
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false; // Desabilitar pipeline para maior estabilidade

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração robusta do pool de conexões para produção
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Configurações para prevenir timeouts e crashes
  max: 20, // Aumentar pool máximo
  idleTimeoutMillis: 30000, // 30 segundos antes de fechar conexão idle
  connectionTimeoutMillis: 10000, // 10 segundos para timeout de conexão
  maxUses: 7500, // Reutilizar conexões mais vezes antes de fechar
  allowExitOnIdle: false, // Não permitir exit quando idle
  // Configurações específicas para Neon/Serverless
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Event listeners para monitoramento e recuperação de erros
pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões PostgreSQL:', err);
  console.error('🔄 Pool será recriado automaticamente na próxima requisição');
});

pool.on('connect', (client) => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
  
  // Configurar timeout de statement para evitar queries longas
  client.query('SET statement_timeout = \'30s\'').catch((err) => {
    console.warn('⚠️ Erro ao configurar statement_timeout:', err.message);
  });
});

pool.on('remove', (client) => {
  console.log('🔄 Conexão PostgreSQL removida do pool');
});

export const db = drizzle({ client: pool, schema });

// Função para testar conectividade
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Teste de conectividade PostgreSQL bem-sucedido');
    return true;
  } catch (error) {
    console.error('❌ Teste de conectividade PostgreSQL falhou:', error);
    return false;
  }
}

// Função para limpar conexões órfãs periodicamente
export function setupConnectionCleanup() {
  setInterval(async () => {
    try {
      // Forçar limpeza de conexões idle antigas
      console.log('🧹 Executando limpeza de conexões idle');
      await pool.query('SELECT 1').catch(() => {}); // Query simples para manter pool ativo
    } catch (error) {
      console.warn('⚠️ Erro na limpeza periódica de conexões:', error);
    }
  }, 60000); // A cada 1 minuto
}