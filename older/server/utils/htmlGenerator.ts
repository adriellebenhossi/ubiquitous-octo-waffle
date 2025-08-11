/**
 * htmlGenerator.ts
 * 
 * Gerador de HTML estático com meta tags SEO injetadas
 * Atualiza o arquivo client/index.html sempre que as configurações SEO mudam
 * Garante que bots de redes sociais sempre encontrem meta tags corretas
 */

import fs from 'fs/promises';
import path from 'path';
import { getSEOData, generateMetaTags, escapeHtml } from './seoRenderer';

// REMOVIDO: Template hardcoded que poderia sobrescrever o HTML atual

/**
 * Gera meta tags completas incluindo título
 */
export function generateCompleteMetaTags(seoData: any): string {
  const tags = [];
  
  // Meta tag para indicar que foi gerado estaticamente
  tags.push(`<meta name="x-seo-generated" content="static-html">`);
  
  // Título da página
  tags.push(`<title>${escapeHtml(seoData.title)}</title>`);
  
  // Meta tags básicas
  tags.push(`<meta name="description" content="${escapeHtml(seoData.description)}">`);
  tags.push(`<meta name="keywords" content="${escapeHtml(seoData.keywords)}">`);
  tags.push(`<meta name="author" content="${escapeHtml(seoData.author)}">`);
  tags.push(`<meta name="robots" content="index, follow">`);
  tags.push(`<meta name="googlebot" content="index, follow">`);
  
  // Open Graph / Facebook
  tags.push(`<meta property="og:type" content="website">`);
  tags.push(`<meta property="og:url" content="${escapeHtml(seoData.ogUrl)}">`);
  tags.push(`<meta property="og:title" content="${escapeHtml(seoData.ogTitle)}">`);
  tags.push(`<meta property="og:description" content="${escapeHtml(seoData.ogDescription)}">`);
  tags.push(`<meta property="og:site_name" content="${escapeHtml(seoData.siteName)}">`);
  
  if (seoData.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(seoData.ogImage)}">`);
    tags.push(`<meta property="og:image:width" content="1200">`);
    tags.push(`<meta property="og:image:height" content="630">`);
    tags.push(`<meta property="og:image:alt" content="${escapeHtml(seoData.ogTitle)}">`);
  }
  
  // Twitter
  tags.push(`<meta property="twitter:card" content="${escapeHtml(seoData.twitterCard)}">`);
  tags.push(`<meta property="twitter:url" content="${escapeHtml(seoData.ogUrl)}">`);
  tags.push(`<meta property="twitter:title" content="${escapeHtml(seoData.ogTitle)}">`);
  tags.push(`<meta property="twitter:description" content="${escapeHtml(seoData.ogDescription)}">`);
  
  if (seoData.ogImage) {
    tags.push(`<meta property="twitter:image" content="${escapeHtml(seoData.ogImage)}">`);
  }
  
  // Meta tags adicionais
  tags.push(`<meta name="theme-color" content="#ec4899">`);
  tags.push(`<meta name="msapplication-navbutton-color" content="#ec4899">`);
  tags.push(`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`);
  tags.push(`<link rel="canonical" href="${escapeHtml(seoData.ogUrl)}">`);
  
  return tags.join('\n    ');
}

/**
 * Cria arquivo HTML separado APENAS com meta tags SEO estáticas
 * Preserva o index.html original com todos os scripts e códigos customizados
 */
export async function regenerateStaticHTML(baseUrl: string = 'https://example.com'): Promise<void> {
  try {
    console.log('🔄 Criando arquivo HTML SEO estático separado...');
    
    // Caminhos dos arquivos
    const originalHtmlPath = path.resolve(process.cwd(), 'client', 'index.html');
    const seoHtmlPath = path.resolve(process.cwd(), 'client', 'index-seo.html');
    
    // Ler HTML original (NÃO MODIFICAMOS ELE)
    const originalHTML = await fs.readFile(originalHtmlPath, 'utf8');
    console.log('📖 HTML original lido (será preservado intacto)');
    
    // Buscar dados SEO atuais do banco
    const seoData = await getSEOData(baseUrl);
    console.log('📊 Dados SEO obtidos:', { 
      title: seoData.title, 
      hasImage: !!seoData.ogImage 
    });
    
    // Gerar meta tags completas
    const metaTags = generateCompleteMetaTags(seoData);
    
    // Criar versão SEO do HTML original
    let seoHTML = originalHTML;
    
    // 1. Atualizar título
    const titleRegex = /<title>.*?<\/title>/i;
    const newTitle = `<title>${escapeHtml(seoData.title)}</title>`;
    if (titleRegex.test(seoHTML)) {
      seoHTML = seoHTML.replace(titleRegex, newTitle);
    }
    
    // 2. Limpar meta tags SEO antigas (se existirem)
    seoHTML = seoHTML.replace(/\s*<meta name="x-seo-generated"[^>]*>\s*/gi, '');
    seoHTML = seoHTML.replace(/\s*<!-- META TAGS SEO DINÂMICAS[\s\S]*?<!-- FIM META TAGS SEO -->\s*/gi, '');
    
    // 3. Inserir novas meta tags APÓS viewport
    const viewportRegex = /(<meta name="viewport"[^>]*>)/i;
    if (viewportRegex.test(seoHTML)) {
      seoHTML = seoHTML.replace(viewportRegex, `$1
    
    <!-- META TAGS SEO ESTÁTICAS - HARDCODED PARA BOTS -->
    ${metaTags}
    <!-- FIM META TAGS SEO -->`);
    }
    
    // 4. Escrever APENAS o arquivo SEO separado
    await fs.writeFile(seoHtmlPath, seoHTML, 'utf8');
    
    console.log('✅ Arquivo HTML SEO estático criado separadamente!');
    console.log('📁 Original preservado:', originalHtmlPath);
    console.log('📁 SEO criado:', seoHtmlPath);
    console.log('🛡️ Scripts customizados e códigos do painel admin estão seguros no original');
    
  } catch (error) {
    console.error('❌ Erro ao criar HTML SEO estático:', error);
    throw error;
  }
}

/**
 * Verifica se o HTML SEO separado foi gerado
 */
export async function isHTMLStaticallyGenerated(): Promise<boolean> {
  try {
    const seoHtmlPath = path.resolve(process.cwd(), 'client', 'index-seo.html');
    
    // Verifica se arquivo SEO separado existe
    try {
      await fs.access(seoHtmlPath);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar HTML SEO estático:', error);
    return false;
  }
}

/**
 * Força atualização do HTML estático (útil para testes)
 */
export async function forceHTMLRegeneration(baseUrl?: string): Promise<{ success: boolean; message: string }> {
  try {
    await regenerateStaticHTML(baseUrl);
    return {
      success: true,
      message: 'HTML estático regenerado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao regenerar HTML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}