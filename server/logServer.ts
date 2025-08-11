/**
 * logServer.ts
 * 
 * Servidor separado para servir logs administrativos
 * Roda em porta separada para evitar conflito com Vite
 * Inclui autenticação por senha para acesso aos logs
 */

import express from 'express';
import { LogReporter } from './utils/logReporter';

const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Middleware para CORS se necessário
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Log-Password');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Middleware para autenticação dos logs
const requireLogPassword = (req: any, res: any, next: any) => {
  console.log('🔐 Log Server - Auth check for:', req.originalUrl);
  
  const password = req.query.password || req.headers['x-log-password'];
  
  if (password !== '24092002') {
    console.log('🚫 Log Server - Auth failed');
    res.status(401).json({ 
      error: "Acesso negado. Senha necessária para acessar logs.",
      message: "Use o parâmetro ?password=SENHA ou header X-Log-Password",
      provided: password ? 'Senha incorreta' : 'Senha não fornecida'
    });
    return;
  }
  
  console.log('✅ Log Server - Auth success');
  next();
};

// Endpoint de teste
app.get("/test", requireLogPassword, (req, res) => {
  res.json({ 
    success: true, 
    message: "Servidor de logs funcionando corretamente!",
    timestamp: new Date().toISOString(),
    server: "LogServer dedicado - Porta 5001"
  });
});

// Gerar e baixar relatório de texto de um mês específico
app.get("/report/:month?", requireLogPassword, async (req, res) => {
  try {
    const month = req.params.month;
    console.log(`📋 Log Server - Generating report for month: ${month || 'current'}`);

    const reporter = new LogReporter();
    const result = await reporter.generateMonthlyReport(month);

    if (!result.success) {
      res.status(404).json({ 
        error: result.error,
        availableMonths: result.availableMonths 
      });
      return;
    }

    // Definir headers para download
    const filename = `logs_admin_${result.month}.txt`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    console.log(`📥 Log Server - Sending report file: ${filename}`);
    res.send(result.content);

  } catch (error) {
    console.error('❌ Log Server - Error generating report:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Visualizar logs de um mês específico no navegador
app.get("/view/:month?", requireLogPassword, async (req, res) => {
  try {
    const month = req.params.month;
    console.log(`👀 Log Server - Viewing logs for month: ${month || 'current'}`);

    const reporter = new LogReporter();
    const result = await reporter.generateMonthlyReport(month);

    if (!result.success) {
      const errorHtml = `
        <html>
          <head><title>Logs - Erro</title></head>
          <body style="font-family: monospace; padding: 20px;">
            <h2>❌ Erro ao carregar logs</h2>
            <p><strong>Erro:</strong> ${result.error}</p>
            ${result.availableMonths ? `
              <p><strong>Meses disponíveis:</strong></p>
              <ul>
                ${result.availableMonths.map((m: string) => `<li><a href="/view/${m}?password=24092002">${m}</a></li>`).join('')}
              </ul>
            ` : ''}
          </body>
        </html>
      `;
      res.send(errorHtml);
      return;
    }

    // Converter quebras de linha para HTML
    const htmlContent = (result.content || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const html = `
      <html>
        <head>
          <title>Logs Admin - ${result.month}</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: monospace; padding: 20px; background: #f5f5f5;">
          <h2>📋 Logs Administrativos - ${result.month}</h2>
          <p>
            <a href="/report/${result.month}?password=24092002" download>📥 Baixar como arquivo</a> |
            <a href="/view?password=24092002">📅 Mês atual</a>
          </p>
          <hr>
          <div style="background: white; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error('❌ Log Server - Error viewing logs:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: monospace; padding: 20px;">
          <h2>❌ Erro interno do servidor</h2>
          <p>Não foi possível carregar os logs.</p>
        </body>
      </html>
    `);
  }
});

// Resumo dos logs disponíveis
app.get("/summary", requireLogPassword, async (req, res) => {
  try {
    console.log('📊 Log Server - Generating summary');

    const reporter = new LogReporter();
    const summary = await reporter.generateSummary();

    res.json(summary);

  } catch (error) {
    console.error('❌ Log Server - Error generating summary:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Página inicial com instruções
app.get("/", (req, res) => {
  const html = `
    <html>
      <head>
        <title>Servidor de Logs Administrativos</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <h1>🔒 Servidor de Logs Administrativos</h1>
        <p>Este servidor requer autenticação por senha para acessar os logs.</p>
        
        <h3>Endpoints disponíveis:</h3>
        <ul>
          <li><strong>GET /test?password=SENHA</strong> - Teste de autenticação</li>
          <li><strong>GET /view?password=SENHA</strong> - Visualizar logs do mês atual</li>
          <li><strong>GET /view/YYYY-MM?password=SENHA</strong> - Visualizar logs de um mês específico</li>
          <li><strong>GET /report?password=SENHA</strong> - Baixar logs do mês atual</li>
          <li><strong>GET /report/YYYY-MM?password=SENHA</strong> - Baixar logs de um mês específico</li>
          <li><strong>GET /summary?password=SENHA</strong> - Resumo dos logs disponíveis</li>
        </ul>
        
        <p><small>Porta: 5001 | Versão: 1.0.0</small></p>
      </body>
    </html>
  `;
  
  res.send(html);
});

// Iniciar servidor na porta 5001
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de logs rodando na porta ${PORT}`);
  console.log(`📝 Acesse: http://localhost:${PORT}`);
  console.log(`🔒 Senha necessária: 24092002`);
});

export default app;