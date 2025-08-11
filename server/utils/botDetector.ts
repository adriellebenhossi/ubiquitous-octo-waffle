/**
 * botDetector.ts
 * 
 * Utilitário para detectar bots de redes sociais e retornar HTML com SEO injetado
 * Funciona como um proxy que é chamado ANTES do Vite interceptar as requisições
 */

import { Request, Response } from "express";
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
  'DiscordBot',
  'facebookcatalog',
  'facebookplatform',
  'Applebot',
  'vkShare',
  'Googlebot'
];

/**
 * Detecta se a requisição vem de um bot de rede social
 */
export function isSocialMediaBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const lowerUserAgent = userAgent.toLowerCase();
  return SOCIAL_MEDIA_BOTS.some(bot => 
    lowerUserAgent.includes(bot.toLowerCase())
  );
}

/**
 * Middleware especial que funciona tanto em desenvolvimento quanto em produção
 * Retorna HTML com SEO injetado para bots de redes sociais
 */
export async function handleBotRequest(req: Request, res: Response): Promise<boolean> {
  try {
    const userAgent = req.get('User-Agent') || '';
    const isBot = isSocialMediaBot(userAgent);
    
    console.log(`🤖 Bot Detector - User Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`🤖 Bot Detector - Is Bot: ${isBot}`);
    
    // Se não for um bot, retornar false para continuar o fluxo normal
    if (!isBot) {
      return false;
    }
    
    console.log('🔍 Bot de rede social detectado - servindo HTML com SEO server-side');
    
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
    
    console.log('✅ HTML com SEO gerado para bot - enviando resposta');
    
    // Definir headers apropriados
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora para bots
      'Vary': 'User-Agent, Accept-Encoding',
      'X-Bot-Detected': 'true',
      'X-SEO-Injected': 'server-side'
    });
    
    res.send(htmlWithSEO);
    return true; // Indica que a requisição foi processada
    
  } catch (error) {
    console.error('❌ Erro no detector de bot:', error);
    return false; // Em caso de erro, continuar com o fluxo normal
  }
}

/**
 * Endpoint especial para simular requisições de bot (útil para testes)
 */
export async function simulateBotRequest(req: Request, res: Response) {
  try {
    const testUserAgent = req.query.userAgent as string || 'facebookexternalhit/1.1';
    const testUrl = req.query.url as string || `${req.protocol}://${req.get('host')}`;
    
    console.log(`🧪 Simulando bot - User Agent: ${testUserAgent}`);
    console.log(`🧪 Simulando bot - URL: ${testUrl}`);
    
    // Se for uma requisição para JSON (para debugging)
    if (req.query.format === 'json') {
      const seoData = await getSEOData(testUrl);
      return res.json({
        success: true,
        testUserAgent,
        testUrl,
        isBot: isSocialMediaBot(testUserAgent),
        seoData,
        message: "Simulação de bot executada com sucesso"
      });
    }
    
    // Simular requisição de bot injetando User-Agent
    const originalUserAgent = req.get('User-Agent');
    req.headers['user-agent'] = testUserAgent;
    
    const botHandled = await handleBotRequest(req, res);
    
    // Restaurar User-Agent original
    if (originalUserAgent) {
      req.headers['user-agent'] = originalUserAgent;
    }
    
    if (!botHandled) {
      res.json({
        success: false,
        message: "User-Agent não foi reconhecido como bot de rede social",
        testUserAgent,
        isBot: isSocialMediaBot(testUserAgent)
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na simulação de bot:', error);
    res.status(500).json({ 
      error: "Erro na simulação de bot",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}