import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { SiteConfig } from '@shared/schema';

export function useSectionColors() {
  const { data: configs } = useQuery<SiteConfig[]>({
    queryKey: ['/api/admin/config'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/config');
      return response.json();
    },
  });

  const applySectionColors = () => {
    if (!configs) return;

    // Obtém configurações de cores das seções
    const sectionColorsConfig = configs.find(c => c.key === 'section_colors')?.value as any || {};
    


    // Obtém cor do botão de agendamento
    const generalInfo = configs.find(c => c.key === 'general_info')?.value as any || {};
    const schedulingButtonColor = generalInfo.schedulingButtonColor;

    // Mapeia IDs das seções para seletores CSS mais genéricos
    const sectionSelectors = {
      hero: ['#hero-section', '[data-section="hero"]', '.hero-section'],
      about: ['#about-section', '[data-section="about"]', '.about-section'],
      services: ['#services', '#services-section', '[data-section="services"]', '.services-section'],
      testimonials: ['#testimonials-section', '[data-section="testimonials"]', '.testimonials-section'],
      articles: ['#artigos', '[data-section="articles"]', '.articles-section'],
      gallery: ['#photo-carousel', '#photo-carousel-section', '[data-section="gallery"]', '.photo-carousel-section', '.gallery-section'],
      faq: ['#faq-section', '[data-section="faq"]', '.faq-section'],
      contact: ['#contact', '[data-section="contact"]', '#contact-section', '.contact-section'],
      inspirational: ['#inspirational-section', '[data-section="inspirational"]', '.inspirational-section']
    };

    // Aplica cores para cada seção
    Object.entries(sectionColorsConfig).forEach(([sectionId, colors]: [string, any]) => {
      const selectors = sectionSelectors[sectionId as keyof typeof sectionSelectors];
      if (!selectors || !colors) return;

      let sectionElement: HTMLElement | null = null;

      // Tenta encontrar o elemento usando diferentes seletores
      for (const selector of selectors) {
        sectionElement = document.querySelector(selector) as HTMLElement;
        if (sectionElement) break;
      }

      if (sectionElement) {
        // Remove estilos antigos
        sectionElement.style.removeProperty('background');
        sectionElement.style.removeProperty('background-color');
        sectionElement.style.removeProperty('background-image');
        sectionElement.style.removeProperty('opacity');

        // Remove backgrounds fixos específicos das seções problemáticas
        if (sectionId === 'faq') {
          const faqContainer = sectionElement.querySelector('div[class*="bg-gradient-to-br"]');
          if (faqContainer) {
            (faqContainer as HTMLElement).className = (faqContainer as HTMLElement).className.replace(/bg-gradient-to-br[^\\s]*/, '').replace(/from-[^\\s]*/, '').replace(/via-[^\\s]*/, '').replace(/to-[^\\s]*/, '');
          }
        }

        // Para a seção de contato, remove qualquer background CSS fixo
        if (sectionId === 'contact') {
          // Remove classe CSS que pode estar definindo background
          sectionElement.classList.remove('bg-gradient-to-br', 'from-gray-50', 'via-white', 'to-gray-50');
          
          // Remove estilos inline que podem estar interferindo
          const childElements = sectionElement.querySelectorAll('*');
          childElements.forEach((child) => {
            const childEl = child as HTMLElement;
            if (childEl.style.background || childEl.style.backgroundColor) {
              // Preserva apenas backgrounds de cards internos, não do container principal
              if (!childEl.closest('.backdrop-blur-sm, .rounded-3xl, .card')) {
                childEl.style.removeProperty('background');
                childEl.style.removeProperty('background-color');
              }
            }
          });
        }

        // Para a galeria, força a remoção de qualquer background fixo
        if (sectionId === 'gallery') {
          // Remove todas as classes de background do elemento principal
          const bgClasses = ['bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gradient-to-br'];
          bgClasses.forEach(cls => sectionElement.classList.remove(cls));
          
          // Remove backgrounds dos elementos filhos que podem estar interferindo, mas preserva containers principais
          const childDivs = sectionElement.querySelectorAll('div');
          childDivs.forEach((div) => {
            const divEl = div as HTMLElement;
            // Remove apenas de elementos que não são containers principais nem o card da galeria
            if (!divEl.classList.contains('gallery-card') && 
                !divEl.classList.contains('container') && 
                !divEl.classList.contains('max-w-7xl') &&
                !divEl.classList.contains('mx-auto') &&
                !divEl.closest('img')) {
              divEl.style.removeProperty('background');
              divEl.style.removeProperty('background-color');
              divEl.style.removeProperty('background-image');
            }
          });
          
          // Adiciona marca temporal para debug de aplicação de cor da galeria
          sectionElement.setAttribute('data-gallery-color-applied', Date.now().toString());
        }

        if (colors.backgroundType === "solid") {
          sectionElement.style.setProperty('background-color', colors.backgroundColor, 'important');
          // Para galeria, também define variável CSS para persistência e log específico
          if (sectionId === 'gallery') {
            document.documentElement.style.setProperty('--gallery-bg-color', colors.backgroundColor);
            console.log('✅ Cores aplicadas para seção gallery:', colors);
          }
        } else if (colors.backgroundType === "gradient" && colors.gradientColors) {
          const direction = colors.gradientDirection || "to-br";
          const cssDirection = direction.replace('to-', '');
          let gradientDirection = '';

          switch (cssDirection) {
            case 'r': gradientDirection = 'to right'; break;
            case 'l': gradientDirection = 'to left'; break;
            case 'b': gradientDirection = 'to bottom'; break;
            case 't': gradientDirection = 'to top'; break;
            case 'br': gradientDirection = 'to bottom right'; break;
            case 'bl': gradientDirection = 'to bottom left'; break;
            case 'tr': gradientDirection = 'to top right'; break;
            case 'tl': gradientDirection = 'to top left'; break;
            default: gradientDirection = 'to bottom right';
          }

          sectionElement.style.backgroundImage = `linear-gradient(${gradientDirection}, ${colors.gradientColors[0]}, ${colors.gradientColors[1]})`;
        } else if (colors.backgroundType === "pattern") {
          sectionElement.style.backgroundColor = colors.backgroundColor;
        }

        if (colors.opacity !== undefined && colors.opacity !== 1) {
          sectionElement.style.opacity = colors.opacity.toString();
        }

        if (colors.overlayColor && colors.overlayOpacity && colors.overlayOpacity > 0) {
          sectionElement.style.position = "relative";

          // Remove overlay anterior se existir
          const existingOverlay = sectionElement.querySelector('.section-overlay');
          if (existingOverlay) {
            existingOverlay.remove();
          }

          // Adiciona novo overlay
          const overlay = document.createElement('div');
          overlay.className = 'section-overlay';
          overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${colors.overlayColor};
            opacity: ${colors.overlayOpacity};
            pointer-events: none;
            z-index: 1;
          `;
          sectionElement.appendChild(overlay);

          // Garante que o conteúdo fique acima do overlay
          const content = sectionElement.children;
          for (let i = 0; i < content.length; i++) {
            if (content[i] !== overlay) {
              (content[i] as HTMLElement).style.position = 'relative';
              (content[i] as HTMLElement).style.zIndex = '2';
            }
          }
        }

        console.log(`✅ Cores aplicadas para seção ${sectionId}:`, colors);
      } else {
        // Apenas mostra warning para seções importantes que realmente deveriam estar presentes
        if (['hero', 'about', 'services'].includes(sectionId)) {
          console.warn(`Elemento da seção ${sectionId} não encontrado`);
        }
      }
    });

    // Aplicar cor aos botões de agendamento se especificada
    if (schedulingButtonColor) {
      // Encontrar botões que contenham texto "Agendar"
      const allButtons = document.querySelectorAll('button, a');
      allButtons.forEach(button => {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (buttonText.includes('agendar') || buttonText.includes('consulta')) {
          (button as HTMLElement).style.backgroundColor = schedulingButtonColor;
        }
      });

      // Também aplicar aos botões com classes específicas
      const specificButtons = document.querySelectorAll('.scheduling-button, .btn-scheduling');
      specificButtons.forEach(button => {
        (button as HTMLElement).style.backgroundColor = schedulingButtonColor;
      });
    }
  };

  useEffect(() => {
    if (!configs) return;

    console.log('🎨 FIXED: Aplicando cores UMA ÚNICA VEZ - sem delays múltiplos');
    
    // ÚNICA aplicação de cores - SEM retries múltiplos que causam piscada
    applySectionColors();
    
    // Sistema de monitoramento específico para galeria com inteligência
    let galleryMonitoringActive = true;
    const galleryRetryInterval = setInterval(() => {
      if (!galleryMonitoringActive) return;
      
      const galleryElement = document.querySelector('#photo-carousel, #photo-carousel-section, [data-section="gallery"]') as HTMLElement;
      if (galleryElement && configs) {
        const sectionColorsConfig = configs.find(c => c.key === 'section_colors')?.value as any || {};
        const galleryColors = sectionColorsConfig.gallery;
        
        if (galleryColors) {
          const hasBackground = galleryElement.style.backgroundColor || galleryElement.style.backgroundImage;
          const appliedTime = galleryElement.getAttribute('data-gallery-color-applied');
          const timeSinceApplied = appliedTime ? Date.now() - parseInt(appliedTime) : Infinity;
          
          // Se não tem background ou foi aplicado há muito tempo, reaplicar
          if (!hasBackground) {
            console.log('🔄 Monitoramento: Reaplicando cores da galeria');
            applySectionColors();
          } else if (timeSinceApplied > 30000) {
            // Se as cores estão consistentemente aplicadas por 30s, reduz monitoramento
            galleryMonitoringActive = false;
            console.log('✅ Galeria estável - reduzindo monitoramento');
          }
        }
      }
    }, 8000); // Verifica a cada 8 segundos

    // Cleanup
    return () => {
      clearInterval(galleryRetryInterval);
    };
  }, [configs]);

  

  return null;
}