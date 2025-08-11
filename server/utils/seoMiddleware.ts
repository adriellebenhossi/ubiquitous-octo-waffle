/**
 * seoMiddleware.ts
 * 
 * Middleware especial para injeção de SEO que funciona tanto em desenvolvimento quanto em produção
 * Detecta bots de redes sociais e serve HTML com meta tags injetadas server-side
 * Para browsers normais em desenvolvimento, permite que o React controle as meta tags
 */

import { Request, Response, NextFunction } from "express";
import { getSEOData, injectSEOIntoHTML, getBaseHTML } from "./seoRenderer";

// Lista de user agents de bots de redes sociais que precisam de meta tags server-side
const SOCIAL_MEDIA_BOTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'SkypeUriPreview',
  'AppleBot',
  'Google-StructuredDataTestingTool',
  'FacebookBot',
  'LinkedInBot',
  'SlackBot',
  'DiscordBot'
];

/**
 * Detecta se a requisição vem de um bot de rede social
 */
function isSocialMediaBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const lowerUserAgent = userAgent.toLowerCase();
  return SOCIAL_MEDIA_BOTS.some(bot => 
    lowerUserAgent.includes(bot.toLowerCase())
  );
}

/**
 * Middleware que injeta SEO apenas para bots de redes sociais
 * Para usuários normais, deixa o React controlar as meta tags
 */
export async function seoMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const userAgent = req.get('User-Agent') || '';
    const isBot = isSocialMediaBot(userAgent);
    
    console.log(`🤖 SEO Middleware - User Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`🤖 SEO Middleware - Is Bot: ${isBot}`);
    
    // Se não for um bot de rede social, continuar normalmente
    if (!isBot) {
      console.log('🌐 Usuário normal detectado - deixando React controlar SEO');
      return next();
    }
    
    console.log('🔍 Bot de rede social detectado - aplicando SEO server-side');
    
    // Construir URL completa da requisição
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;
    
    console.log('🌐 URL da requisição:', fullUrl);
    
    // Buscar dados SEO do banco de dados
    const seoData = await getSEOData(fullUrl);
    console.log('📊 Dados SEO obtidos:', { 
      title: seoData.title, 
      hasImage: !!seoData.ogImage,
      imageUrl: seoData.ogImage?.substring(0, 50) + '...'
    });
    
    // Ler HTML base e injetar SEO
    const baseHTML = await getBaseHTML();
    const htmlWithSEO = await injectSEOIntoHTML(baseHTML, seoData);
    
    console.log('✅ SEO injetado com sucesso - enviando HTML customizado para bot');
    
    // Definir headers apropriados
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora para bots
      'Vary': 'User-Agent, Accept-Encoding'
    });
    
    return res.send(htmlWithSEO);
  } catch (error) {
    console.error('❌ Erro no middleware SEO:', error);
    // Em caso de erro, continuar com o fluxo normal
    next();
  }
}

/**
 * Rota especial para testar o SEO com diferentes user agents
 */
export async function seoTestRoute(req: Request, res: Response) {
  try {
    const testUserAgent = req.query.userAgent as string || 'facebookexternalhit/1.1';
    const testUrl = req.query.url as string || `${req.protocol}://${req.get('host')}`;
    
    console.log(`🧪 Testando SEO com User Agent: ${testUserAgent}`);
    console.log(`🧪 Testando SEO para URL: ${testUrl}`);
    
    // Buscar dados SEO
    const seoData = await getSEOData(testUrl);
    
    // Se for uma requisição para JSON (para debugging)
    if (req.query.format === 'json') {
      return res.json({
        success: true,
        testUserAgent,
        testUrl,
        isBot: isSocialMediaBot(testUserAgent),
        seoData,
        message: "Dados SEO obtidos com sucesso"
      });
    }
    
    // Gerar HTML com SEO injetado
    const baseHTML = await getBaseHTML();
    const htmlWithSEO = await injectSEOIntoHTML(baseHTML, seoData);
    
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'X-SEO-Test': 'true'
    });
    
    res.send(htmlWithSEO);
  } catch (error) {
    console.error('❌ Erro no teste SEO:', error);
    res.status(500).json({ 
      error: "Erro no teste SEO",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}