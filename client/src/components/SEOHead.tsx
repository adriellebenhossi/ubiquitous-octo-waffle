/**
 * SEOHead.tsx
 * 
 * Componente responsável por gerenciar as meta tags SEO e Open Graph
 * Aplica dinamicamente título, descrição, palavras-chave e imagem social
 * Integração com configurações administrativas para controle total
 * Suporte completo para compartilhamento em redes sociais
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function SEOHead() {
  const { data: configs } = useQuery<any[]>({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    if (!configs) return;

    // Detectar se as meta tags já foram injetadas server-side
    const seoInjected = document.querySelector('meta[name="x-seo-injected"]');
    if (seoInjected) {
      console.log('🔍 SEO já foi injetado server-side, pulando injeção client-side');
      return;
    }

    console.log('🔍 Aplicando meta tags SEO client-side (modo desenvolvimento)');

    const seoInfo = configs.find(c => c.key === 'seo_meta')?.value as any || {};
    const marketingInfo = configs.find(c => c.key === 'marketing_pixels')?.value as any || {};
    const generalInfo = configs.find(c => c.key === 'general_info')?.value as any || {};

    // Aplicar título da página
    const siteName = generalInfo.siteName || "Adrielle Benhossi";
    const metaTitle = seoInfo.metaTitle || siteName;
    if (document.title !== metaTitle) {
      document.title = metaTitle;
    }

    // Função para criar ou atualizar meta tag
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Meta tags básicas de SEO
    setMetaTag('description', seoInfo.metaDescription || 'Psicóloga especialista em terapia. Atendimento presencial e online.');
    setMetaTag('keywords', seoInfo.metaKeywords || 'psicóloga, terapia, saúde mental');
    setMetaTag('author', generalInfo.headerName || 'Adrielle Benhossi');

    // Meta tags robots baseado na configuração de indexação
    const enableGoogleIndexing = marketingInfo.enableGoogleIndexing ?? true;
    const robotsContent = enableGoogleIndexing ? "index, follow" : "noindex, nofollow";
    setMetaTag('robots', robotsContent);
    setMetaTag('googlebot', robotsContent);

    // Open Graph tags para redes sociais
    const ogTitle = seoInfo.ogTitle || seoInfo.metaTitle || siteName;
    const ogDescription = seoInfo.ogDescription || seoInfo.metaDescription || 'Psicóloga especialista em terapia. Atendimento presencial e online.';
    const ogImage = seoInfo.ogImage;

    setMetaTag('og:title', ogTitle, true);
    setMetaTag('og:description', ogDescription, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('og:site_name', siteName, true);
    
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
      setMetaTag('og:image:alt', ogTitle, true);
    }

    // Twitter Card tags
    const twitterCard = seoInfo.twitterCard || 'summary_large_image';
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:title', ogTitle);
    setMetaTag('twitter:description', ogDescription);
    if (ogImage) {
      setMetaTag('twitter:image', ogImage);
    }

    // WhatsApp específico (usa Open Graph)
    if (ogImage) {
      setMetaTag('og:image:type', 'image/jpeg', true);
      setMetaTag('og:image:secure_url', ogImage, true);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    console.log('✅ SEO Meta Tags aplicadas:', {
      title: metaTitle,
      description: seoInfo.metaDescription,
      ogImage: ogImage,
      twitterCard: twitterCard,
      url: window.location.href
    });

  }, [configs]);

  return null; // Este componente não renderiza nada visual
}