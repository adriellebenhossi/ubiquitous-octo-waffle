/**
 * index.ts
 * 
 * Servidor Express principal da aplicação
 * Configura middleware, rotas da API e servir arquivos estáticos
 * Integração com Vite para desenvolvimento hot-reload
 * Ponto de entrada do backend da aplicação
 */

import express, { type Request, Response, NextFunction } from "express"; // Framework web
import compression from "compression"; // Compressão gzip/deflate
import path from "path"; // Para paths de arquivos
import { registerRoutes } from "./routes"; // Configuração das rotas da API
import { getSEOData, injectSEOIntoHTML, getBaseHTML } from "./utils/seoRenderer"; // Utilitário SEO
import { seoMiddleware, seoTestRoute } from "./utils/seoMiddleware"; // Middleware SEO inteligente
import { handleBotRequest, simulateBotRequest } from "./utils/botDetector"; // Detector de bots

// Exportar funcões de geração de ícones para uso externo
export { generateAllPresetIcons } from "./utils/presetIconGenerator";

// Importar funcionalidades do servidor de logs para integrar no servidor principal
import { LogReporter } from "./utils/logReporter";

// Função auxiliar para formatar logs em HTML
function formatLogsAsHTML(report: any, month?: string): string {
  const monthName = month ? 
    new Date(month + '-01').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }) :
    'Mês Atual';
    
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logs do Sistema - ${monthName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .summary { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .log-entry { background: #f8f9fa; margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
    .timestamp { font-weight: bold; color: #007bff; }
    .ip { color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Logs do Sistema - ${monthName}</h1>
    <div class="summary">
      <strong>Total de Alterações:</strong> ${report.totalChanges}<br>
      <strong>Total de Acessos:</strong> ${report.totalAccess}<br>
      <strong>Gerado em:</strong> ${report.generatedAt}
    </div>
    
    <h2>📝 Alterações</h2>
    ${report.changes.length > 0 ? 
      report.changes.map((change: any, index: number) => `
        <div class="log-entry">
          <div class="timestamp">${index + 1}. ${change.timestamp}</div>
          <div>IP: <span class="ip">${change.ip}</span></div>
          <div>Ação: ${change.action}</div>
          <div>Seção: ${change.section}</div>
          <div>Campo: ${change.field}</div>
          ${change.details ? `<div>Detalhes: ${change.details}</div>` : ''}
        </div>
      `).join('') : 
      '<p>Nenhuma alteração registrada.</p>'
    }
    
    <h2>🔐 Acessos</h2>
    ${report.access.length > 0 ? 
      report.access.map((access: any, index: number) => `
        <div class="log-entry">
          <div class="timestamp">${index + 1}. ${access.timestamp}</div>
          <div>IP: <span class="ip">${access.ip}</span></div>
          <div>Ação: ${access.action}</div>
          <div>Status: ${access.status}</div>
          ${access.userAgent && access.userAgent !== 'unknown' ? `<div>Navegador: ${access.userAgent.substring(0, 100)}...</div>` : ''}
          ${access.details ? `<div>Detalhes: ${access.details}</div>` : ''}
        </div>
      `).join('') : 
      '<p>Nenhum acesso registrado.</p>'
    }
  </div>
</body>
</html>`;
}

// Simple log function as fallback
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

// Performance optimizations
// Compressão otimizada para performance
app.use(compression({ 
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Cache headers otimizados para performance 
app.use((req, res, next) => {
  // Assets estáticos - cache longo
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 ano
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  }
  // HTML - cache curto mas válido
  else if (req.url.match(/\.(html)$/) || req.url === '/') {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutos
    res.setHeader('Expires', new Date(Date.now() + 300000).toUTCString());
  }
  // API - sem cache
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Middleware especial para interceptar bots ANTES de qualquer outra coisa
// Detecta bots de redes sociais e serve HTML com SEO injetado server-side
// Funciona tanto em desenvolvimento quanto em produção
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Só processar requisições GET para a página principal
  if (req.path === '/' && req.method === 'GET') {
    try {
      const botHandled = await handleBotRequest(req, res);
      if (botHandled) {
        // Bot foi detectado e resposta enviada, não continuar processamento
        return;
      }
    } catch (error) {
      console.error('❌ Erro no middleware de detecção de bot:', error);
      // Em caso de erro, continuar normalmente
    }
  }
  next();
});

// Cache headers para assets estáticos
app.use('/uploads', express.static('uploads', {
  maxAge: '30d',
  etag: true,
  lastModified: true
}));

// Middleware para garantir que rotas da API sejam processadas antes do Vite
app.use('/api/*', (req, res, next) => {
  console.log(`🔍 API route intercepted: ${req.method} ${req.originalUrl} | Path: ${req.path}`);
  console.log(`🔍 API headers:`, req.headers['content-type']);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`🔍 API body:`, JSON.stringify(req.body, null, 2));
  }
  next(); // Reload trigger comment - v2.1
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Import Vite utilities conditionally to avoid production dependencies
  let setupVite: any, serveStatic: any;

  if (process.env.NODE_ENV === "development") {
    try {
      // Dynamic import with string to prevent esbuild bundling
      const viteModulePath = "./vite" + ".js";
      const viteUtils = await import(viteModulePath);
      setupVite = viteUtils.setupVite;
      serveStatic = viteUtils.serveStatic;
    } catch (error) {
      console.log('⚠️ Vite module not available in development - using static fallback');
      setupVite = null;
      serveStatic = createStaticServer();
    }
  } else {
    // Simple static server function for production
    serveStatic = createStaticServer();
  }

  // Helper function to create static server
  function createStaticServer() {
    return (app: any) => {
      const distPath = path.resolve(process.cwd(), "dist", "public");
      
      // Use fs module for checking existence (will be imported at top of file)
      import("fs").then(fsModule => {
        if (!fsModule.existsSync(distPath)) {
          throw new Error(
            `Could not find the build directory: ${distPath}, make sure to build the client first`,
          );
        }
      });
      
      app.use(express.static(distPath));
      
      // fall through to index.html if the file doesn't exist
      app.use("*", (_req: any, res: any) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    };
  }

  // Inicializar monitoramento de banco de dados com tratamento de erro robusto
  let dbConnected = false;
  try {
    const { testDatabaseConnection, setupConnectionCleanup } = await import('./db');
    
    console.log('🔧 Testando conectividade do banco de dados...');
    dbConnected = await testDatabaseConnection();
    if (dbConnected) {
      console.log('✅ Banco de dados conectado com sucesso');
      console.log('🔧 Configurando limpeza automática de conexões...');
      setupConnectionCleanup();
    } else {
      console.warn('⚠️ Falha na conectividade inicial do banco - aplicação continuará sem funcionalidades de banco');
    }
  } catch (error) {
    console.error('❌ Erro crítico na inicialização do banco de dados:', error);
    console.log('🔧 Aplicação continuará sem funcionalidades de banco de dados');
  }
  
  // Health check simples para Fly.io (antes de qualquer outra rota)
  app.get('/api/health', (req: Request, res: Response) => {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbConnected ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };
    
    res.status(200).json(healthCheck);
  });

  // Register API routes FIRST before any other middleware
  console.log('🔧 Setting up API routes...');
  const server = await registerRoutes(app);
  console.log('✅ API routes registered successfully');

  // Integrar rotas de logs no servidor principal (para compatibilidade Fly.io)
  console.log('🔧 Integrando rotas de logs administrativos...');
  
  // Middleware para autenticação dos logs
  const requireLogPassword = (req: any, res: any, next: any) => {
    const password = req.query.password || req.headers['x-log-password'];
    if (password !== '24092002') {
      res.status(401).json({ 
        error: "Acesso negado. Senha necessária para acessar logs.",
        message: "Use o parâmetro ?password=SENHA ou header X-Log-Password"
      });
      return;
    }
    next();
  };

  // Rotas de logs integradas ao servidor principal
  app.get("/logs/test", requireLogPassword, (req, res) => {
    res.json({ 
      success: true, 
      message: "Servidor de logs funcionando no servidor principal!",
      timestamp: new Date().toISOString(),
      server: "Integrado - Porta 3000"
    });
  });

  app.get("/logs/view/:month?", requireLogPassword, async (req, res) => {
    try {
      const month = req.params.month;
      console.log(`📊 Visualizando logs${month ? ` do mês ${month}` : ' do mês atual'}`);
      
      const report = month ? 
        LogReporter.generateReport(month) : 
        LogReporter.generateReport();
      
      const html = formatLogsAsHTML(report, month);
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('❌ Erro ao visualizar logs:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/logs/report/:month?", requireLogPassword, async (req, res) => {
    try {
      const month = req.params.month;
      console.log(`📄 Gerando relatório${month ? ` do mês ${month}` : ' do mês atual'}`);
      
      const report = month ? 
        LogReporter.generateTextReport(month) : 
        LogReporter.generateTextReport();
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const filename = `logs-${month || currentMonth}.txt`;
      
      res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(report);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/logs/summary", requireLogPassword, async (req, res) => {
    try {
      console.log('📈 Gerando resumo de logs...');
      const logReporter = new LogReporter();
      const summary = await logReporter.generateSummary();
      res.json(summary);
    } catch (error) {
      console.error('❌ Erro ao gerar resumo:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  console.log('✅ Rotas de logs integradas ao servidor principal');

  // Rotas especiais para teste de SEO DEPOIS das rotas API
  app.get('/seo-test', seoTestRoute);
  app.get('/bot-test', simulateBotRequest);

  // Middleware para servir HTML SEO separado para bots (preserva index.html original)
  app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isSocialMediaBot } = await import('./utils/botDetector');
      const botDetected = isSocialMediaBot(req.headers['user-agent'] || '');
      
      if (botDetected) {
        console.log('🤖 Bot detectado - servindo HTML SEO estático');
        
        // Verificar se arquivo SEO existe
        const { isHTMLStaticallyGenerated } = await import('./utils/htmlGenerator');
        const hasSEOFile = await isHTMLStaticallyGenerated();
        
        if (hasSEOFile) {
          const path = await import('path');
          const seoHtmlPath = path.resolve(process.cwd(), 'client', 'index-seo.html');
          
          console.log('📁 Servindo arquivo SEO:', seoHtmlPath);
          return res.sendFile(seoHtmlPath);
        } else {
          console.log('⚠️ Arquivo SEO não existe - usando middleware dinâmico');
        }
      }
      
      // Para usuários normais ou se arquivo SEO não existe, continuar normal
      next();
    } catch (error) {
      console.error('❌ Erro no middleware SEO:', error);
      next();
    }
  });

  // Middleware robusto de tratamento de erros - especialmente para falhas de banco
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    let status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    
    // Log detalhado do erro para investigação
    console.error('🚨 ERRO CAPTURADO:', {
      url: req.url,
      method: req.method,
      status,
      error: err.message,
      stack: err.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
    
    // Tratar especificamente erros de banco de dados
    if (err.message?.includes('connect') || 
        err.message?.includes('connection') ||
        err.message?.includes('ENOTFOUND') ||
        err.message?.includes('timeout') ||
        err.code === 'ECONNRESET' ||
        err.code === 'ECONNREFUSED') {
      console.error('💥 ERRO DE CONECTIVIDADE DE BANCO DETECTADO');
      message = "Erro temporário de conectividade. Tente novamente em alguns segundos.";
      status = 503; // Service Unavailable
      
      // Tentar reconectar em background
      setTimeout(async () => {
        try {
          const { testDatabaseConnection } = await import('./db');
          await testDatabaseConnection();
        } catch (reconnectError) {
          console.error('❌ Falha na tentativa de reconexão:', reconnectError);
        }
      }, 1000);
    }

    // Não fazer throw que pode crashar o processo - apenas log e responder
    if (!res.headersSent) {
      res.status(status).json({ 
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
    
    // Log sem fazer throw para evitar crash
    console.error(`❌ Erro ${status} processado sem crash da aplicação`);
  });

  // Setup vite AFTER API routes to prevent interference
  if (app.get("env") === "development") {
    console.log('🔧 Setting up Vite middleware...');
    try {
      if (setupVite && typeof setupVite === 'function') {
        await setupVite(app, server);
        console.log('✅ Vite middleware configured');
      } else {
        throw new Error('setupVite is not available - using static fallback');
      }
    } catch (viteError) {
      console.error('❌ Failed to setup Vite middleware:', viteError);
      console.log('🔄 Continuing without Vite middleware - serving static fallback');
      // Fallback: serve static files directly
      serveStatic(app);
    }
  } else {
    // In production, add SEO middleware BEFORE serving static files
    app.get('/', async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log('🔍 [PROD] Interceptando requisição para página principal - aplicando SEO dinâmico');
        
        // Construir URL completa da requisição
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
        const fullUrl = `${protocol}://${host}${req.originalUrl}`;
        
        console.log('🌐 [PROD] URL da requisição:', fullUrl);
        
        // Buscar dados SEO do banco de dados
        const seoData = await getSEOData(fullUrl);
        console.log('📊 [PROD] Dados SEO obtidos:', { 
          title: seoData.title, 
          hasImage: !!seoData.ogImage,
          imageUrl: seoData.ogImage?.substring(0, 50) + '...'
        });
        
        // Ler HTML base de produção e injetar SEO
        const baseHTML = await getBaseHTML();
        const htmlWithSEO = await injectSEOIntoHTML(baseHTML, seoData);
        
        console.log('✅ [PROD] SEO injetado com sucesso - enviando HTML customizado');
        
        // Definir headers apropriados
        res.set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
          'Vary': 'Accept-Encoding'
        });
        
        return res.send(htmlWithSEO);
      } catch (error) {
        console.error('❌ [PROD] Erro na injeção de SEO:', error);
        // Em caso de erro, continuar com o fluxo normal
        next();
      }
    });
    
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 for Fly.io compatibility.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Para Replit: usar porta 5001 que mapeia para 3000 externa
  // Para Fly.io: usar porta 3000 (padrão de produção)
  const defaultPort = process.env.NODE_ENV === 'production' ? '3000' : '5001';
  const port = parseInt(process.env.PORT || defaultPort, 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
