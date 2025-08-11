import { Pool } from '@neondatabase/serverless';

async function setupCookieSettings() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    // Verificar se a tabela já existe
    const tableExists = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'cookie_settings'
    `);

    if (tableExists.rows.length === 0) {
      // Criar tabela
      await client.query(`
        CREATE TABLE cookie_settings (
          id SERIAL PRIMARY KEY,
          is_enabled BOOLEAN NOT NULL DEFAULT true,
          title TEXT NOT NULL DEFAULT 'Cookies & Privacidade',
          message TEXT NOT NULL DEFAULT 'Utilizamos cookies para melhorar sua experiência no site e personalizar conteúdo. Ao continuar navegando, você concorda com nossa política de privacidade.',
          accept_button_text TEXT NOT NULL DEFAULT 'Aceitar Cookies',
          decline_button_text TEXT NOT NULL DEFAULT 'Não Aceitar',
          privacy_link_text TEXT NOT NULL DEFAULT 'Política de Privacidade',
          terms_link_text TEXT NOT NULL DEFAULT 'Termos de Uso',
          position TEXT NOT NULL DEFAULT 'top',
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela cookie_settings criada');
    } else {
      console.log('ℹ️ Tabela cookie_settings já existe');
    }

    // Verificar se há dados na tabela
    const dataExists = await client.query('SELECT COUNT(*) FROM cookie_settings');
    const count = parseInt(dataExists.rows[0].count);

    if (count === 0) {
      // Inserir configuração padrão
      await client.query(`
        INSERT INTO cookie_settings (
          is_enabled,
          title,
          message,
          accept_button_text,
          decline_button_text,
          privacy_link_text,
          terms_link_text,
          position
        ) VALUES (
          true,
          'Cookies & Privacidade',
          'Utilizamos cookies para melhorar sua experiência no site e personalizar conteúdo. Ao continuar navegando, você concorda com nossa política de privacidade.',
          'Aceitar Cookies',
          'Não Aceitar',
          'Política de Privacidade',
          'Termos de Uso',
          'top'
        );
      `);
      console.log('✅ Configurações padrão de cookies inseridas');
    } else {
      console.log(`ℹ️ Tabela cookie_settings já contém ${count} registro(s)`);
    }

    // Verificar dados finais
    const finalData = await client.query('SELECT * FROM cookie_settings ORDER BY id DESC LIMIT 1');
    console.log('📋 Configuração atual:', finalData.rows[0]);

  } catch (error) {
    console.error('❌ Erro ao configurar cookie_settings:', error);
    throw error;
  } finally {
    client.release();
  }
}

setupCookieSettings()
  .then(() => {
    console.log('🎉 Setup de cookie settings concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Falha no setup:', error);
    process.exit(1);
  });