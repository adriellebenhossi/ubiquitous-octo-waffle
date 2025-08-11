/**
 * seoRenderer.ts
 * 
 * Utilitário para renderização server-side das meta tags SEO e OpenGraph
 * Injeta dinamicamente informações do banco de dados no HTML estático
 * Resolve o problema das redes sociais não executarem JavaScript
 * Garante que links compartilhados mostrem as informações corretas
 */

import { storage } from "../storage";
import path from "path";
import fs from "fs/promises";

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  siteName: string;
  twitterCard: string;
}

/**
 * Busca configurações SEO do banco de dados
 * Retorna dados formatados para injeção no HTML
 */
export async function getSEOData(url: string): Promise<SEOData & { enableGoogleIndexing: boolean }> {
  try {
    // Buscar configurações do banco de dados
    const configs = await storage.getAllSiteConfigs();
    
    const seoConfig = configs.find(c => c.key === 'seo_meta')?.value as any || {};
    const marketingConfig = configs.find(c => c.key === 'marketing_pixels')?.value as any || {};
    const generalConfig = configs.find(c => c.key === 'general_info')?.value as any || {};

    // Dados padrões caso não estejam configurados
    const siteName = generalConfig.siteName || "Adrielle Benhossi - Psicóloga";
    const defaultTitle = generalConfig.headerName || siteName;
    const defaultDescription = "Psicóloga especialista em terapia. Atendimento presencial e online. Agende sua consulta.";
    const defaultAuthor = generalConfig.headerName || "Adrielle Benhossi";

    // Construir URL completa da imagem OpenGraph se existir
    // Priorizar imagem do marketing_pixels (onde é salva via upload) sobre seo_meta
    let ogImageUrl = marketingConfig.ogImage || seoConfig.ogImage || '';
    if (ogImageUrl && !ogImageUrl.startsWith('http')) {
      // Se for um caminho relativo, construir URL completa
      const baseUrl = getBaseUrl(url);
      ogImageUrl = `${baseUrl}${ogImageUrl}`;
    }

    // Verificar configuração de indexação do Google (padrão é true)
    const enableGoogleIndexing = marketingConfig.enableGoogleIndexing ?? true;

    return {
      title: seoConfig.metaTitle || defaultTitle,
      description: seoConfig.metaDescription || defaultDescription,
      keywords: seoConfig.metaKeywords || 'psicóloga, terapia, saúde mental, psicologia, consultório',
      author: defaultAuthor,
      ogTitle: marketingConfig.ogTitle || seoConfig.ogTitle || seoConfig.metaTitle || defaultTitle,
      ogDescription: marketingConfig.ogDescription || seoConfig.ogDescription || seoConfig.metaDescription || defaultDescription,
      ogImage: ogImageUrl,
      ogUrl: url,
      siteName: siteName,
      twitterCard: seoConfig.twitterCard || 'summary_large_image',
      enableGoogleIndexing: enableGoogleIndexing
    };
  } catch (error) {
    console.error('❌ Erro ao buscar dados SEO:', error);
    
    // Retornar dados de fallback em caso de erro
    return {
      title: "Adrielle Benhossi - Psicóloga",
      description: "Psicóloga especialista em terapia. Atendimento presencial e online.",
      keywords: "psicóloga, terapia, saúde mental",
      author: "Adrielle Benhossi",
      ogTitle: "Adrielle Benhossi - Psicóloga",
      ogDescription: "Psicóloga especialista em terapia. Atendimento presencial e online.",
      ogImage: "",
      ogUrl: url,
      siteName: "Adrielle Benhossi",
      twitterCard: "summary_large_image",
      enableGoogleIndexing: true
    };
  }
}

/**
 * Extrai URL base da requisição
 */
function getBaseUrl(fullUrl: string): string {
  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return '';
  }
}

/**
 * Gera as meta tags HTML com base nos dados SEO
 */
export function generateMetaTags(seoData: SEOData & { enableGoogleIndexing: boolean }): string {
  const escapedTitle = escapeHtml(seoData.title);
  const escapedDescription = escapeHtml(seoData.description);
  const escapedKeywords = escapeHtml(seoData.keywords);
  const escapedAuthor = escapeHtml(seoData.author);
  const escapedOgTitle = escapeHtml(seoData.ogTitle);
  const escapedOgDescription = escapeHtml(seoData.ogDescription);
  const escapedSiteName = escapeHtml(seoData.siteName);

  // Configurar robots baseado na configuração de indexação
  const robotsContent = seoData.enableGoogleIndexing ? "index, follow" : "noindex, nofollow";

  return `
    <!-- Meta tags SEO dinâmicas injetadas pelo servidor -->
    <meta name="x-seo-injected" content="server-side">
    <meta name="description" content="${escapedDescription}">
    <meta name="keywords" content="${escapedKeywords}">
    <meta name="author" content="${escapedAuthor}">
    <meta name="robots" content="${robotsContent}">
    <meta name="googlebot" content="${robotsContent}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(seoData.ogUrl)}">
    <meta property="og:title" content="${escapedOgTitle}">
    <meta property="og:description" content="${escapedOgDescription}">
    <meta property="og:site_name" content="${escapedSiteName}">
    ${seoData.ogImage ? `<meta property="og:image" content="${escapeHtml(seoData.ogImage)}">` : ''}
    ${seoData.ogImage ? `<meta property="og:image:width" content="1200">` : ''}
    ${seoData.ogImage ? `<meta property="og:image:height" content="630">` : ''}
    ${seoData.ogImage ? `<meta property="og:image:alt" content="${escapedOgTitle}">` : ''}
    
    <!-- Twitter -->
    <meta property="twitter:card" content="${escapeHtml(seoData.twitterCard)}">
    <meta property="twitter:url" content="${escapeHtml(seoData.ogUrl)}">
    <meta property="twitter:title" content="${escapedOgTitle}">
    <meta property="twitter:description" content="${escapedOgDescription}">
    ${seoData.ogImage ? `<meta property="twitter:image" content="${escapeHtml(seoData.ogImage)}">` : ''}
    
    <!-- Meta tags adicionais para melhor SEO -->
    <meta name="theme-color" content="#ec4899">
    <meta name="msapplication-navbutton-color" content="#ec4899">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="canonical" href="${escapeHtml(seoData.ogUrl)}">
  `;
}

/**
 * Injeta meta tags SEO no HTML estático
 * Substitui título e adiciona meta tags antes do fechamento do head
 */
export async function injectSEOIntoHTML(htmlContent: string, seoData: SEOData & { enableGoogleIndexing: boolean }): Promise<string> {
  // Substituir título da página
  const titleRegex = /<title>.*?<\/title>/i;
  const newTitle = `<title>${escapeHtml(seoData.title)}</title>`;
  let modifiedHtml = htmlContent.replace(titleRegex, newTitle);

  // Gerar meta tags
  const metaTags = generateMetaTags(seoData);

  // Injetar meta tags antes do fechamento do head
  const headCloseRegex = /<\/head>/i;
  if (headCloseRegex.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(headCloseRegex, `${metaTags}\n  </head>`);
  } else {
    console.warn('⚠️  Tag </head> não encontrada no HTML');
  }

  return modifiedHtml;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Lê o arquivo HTML base do cliente
 */
export async function getBaseHTML(): Promise<string> {
  try {
    // Tentar primeiro o caminho de produção, depois desenvolvimento
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'public', 'index.html'), // Produção
      path.join(process.cwd(), 'client', 'index.html'), // Desenvolvimento
    ];
    
    for (const htmlPath of possiblePaths) {
      try {
        const content = await fs.readFile(htmlPath, 'utf-8');
        console.log(`✅ HTML base encontrado em: ${htmlPath}`);
        return content;
      } catch (err) {
        console.log(`⚠️  HTML não encontrado em: ${htmlPath}`);
        continue;
      }
    }
    
    throw new Error('Nenhum arquivo HTML base encontrado');
  } catch (error) {
    console.error('❌ Erro ao ler arquivo HTML base:', error);
    throw new Error('Arquivo HTML base não encontrado');
  }
}