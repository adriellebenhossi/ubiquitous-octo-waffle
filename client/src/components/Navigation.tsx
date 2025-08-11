/**
 * Navigation.tsx
 * 
 * Barra de navegação responsiva do site
 * Funcionalidades: menu fixo, navegação smooth scroll, menu mobile hambúrguer
 * Contém informações profissionais da psicóloga (nome, CFP, avatar)
 */

import { useState, useEffect } from "react"; // Hooks do React
import { Menu, X, Mail, MapPin, Clock, MessageCircle } from "lucide-react"; // Ícones para menu mobile
import { Avatar } from "./Avatar"; // Componente do avatar
import { useQuery } from "@tanstack/react-query"; // Para buscar configurações
import { useSectionVisibility } from "@/hooks/useSectionVisibility"; // Para controlar visibilidade das seções

export function Navigation() {
  // Buscar configurações do site incluindo a imagem do hero
  const { data: configs } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const response = await fetch("/api/config");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Hook para verificar visibilidade das seções
  const { 
    isAboutVisible, 
    isArticlesVisible,
    isPhotoCarouselVisible,
    isServicesVisible, 
    isTestimonialsVisible, 
    isFaqVisible,
    isContactVisible,
    isInspirationalVisible
  } = useSectionVisibility();

  // Extrair a imagem personalizada do hero se disponível
  const heroImage = configs?.find((c: any) => c.key === 'hero_image');
  const customImage = heroImage?.value?.path || null;

  // Extrair CFP das configurações
  const generalInfo = configs?.find((c: any) => c.key === 'general_info')?.value as any || {};
  const currentCrp = generalInfo.crp || "08/123456";
  
  // Buscar configuração de ordem das seções
  const sectionOrderConfig = configs?.find((c: any) => c.key === 'section_order')?.value as Record<string, number> || {};

  // Estado para controlar se a página foi rolada (muda aparência da nav)
  const [isScrolled, setIsScrolled] = useState(false);
  // Estado para controlar se menu mobile está aberto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Definir seções de navegação com ordem dinâmica
  const navigationSections = [
    {
      key: 'hero',
      id: 'home',
      name: generalInfo.navHome || 'Início',
      visible: true,
      order: sectionOrderConfig.hero ?? 0
    },
    {
      key: 'about',
      id: 'about',
      name: generalInfo.navAbout || 'Sobre',
      visible: isAboutVisible,
      order: sectionOrderConfig.about ?? 1
    },
    {
      key: 'articles',
      id: 'articles',
      name: generalInfo.navArticles || 'Artigos',
      visible: isArticlesVisible,
      order: sectionOrderConfig.articles ?? 2
    },
    {
      key: 'gallery',
      id: 'gallery',
      name: generalInfo.navGallery || 'Galeria',
      visible: isPhotoCarouselVisible,
      order: sectionOrderConfig.gallery ?? 3
    },
    {
      key: 'services',
      id: 'services',
      name: generalInfo.navServices || 'Serviços',
      visible: isServicesVisible,
      order: sectionOrderConfig.services ?? 4
    },
    {
      key: 'testimonials',
      id: 'testimonials',
      name: generalInfo.navTestimonials || 'Depoimentos',
      visible: isTestimonialsVisible,
      order: sectionOrderConfig.testimonials ?? 5
    },
    {
      key: 'faq',
      id: 'faq',
      name: generalInfo.navFaq || 'FAQ',
      visible: isFaqVisible,
      order: sectionOrderConfig.faq ?? 6
    },
    {
      key: 'contact',
      id: 'contact',
      name: generalInfo.navContact || 'Contato',
      visible: isContactVisible,
      order: sectionOrderConfig.contact ?? 7
    },
    {
      key: 'inspirational',
      id: 'inspirational',
      name: generalInfo.navInspirational || 'Citação',
      visible: isInspirationalVisible,
      order: sectionOrderConfig.inspirational ?? 8
    }
  ].filter(section => section.visible).sort((a, b) => a.order - b.order);

  // Effect para detectar scroll da página
  useEffect(() => {
    const handleScroll = () => {
      // Ativa fundo opaco após rolar 100px
      setIsScrolled(window.scrollY > 100);
    };

    // Adiciona listener de scroll
    window.addEventListener("scroll", handleScroll);
    // Remove listener quando componente é desmontado
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Primeiro tenta encontrar por ID direto
    let element = document.getElementById(sectionId);
    
    // Se não encontrar, tenta encontrar por data-section
    if (!element) {
      element = document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement;
    }
    
    // Mapeamento para IDs alternativos se necessário
    const idMapping: { [key: string]: string } = {
      'home': 'hero',
      'hero': 'hero',
      'about': 'about-specialties',
      'gallery': 'photo-carousel',
      'inspirational': 'inspirational'
    };
    
    // Se ainda não encontrar, tenta o mapeamento alternativo
    if (!element && idMapping[sectionId]) {
      element = document.getElementById(idMapping[sectionId]);
      if (!element) {
        element = document.querySelector(`[data-section="${idMapping[sectionId]}"]`) as HTMLElement;
      }
    }
    
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // Apenas mostra warning para seções que deveriam estar sempre presentes
      const essentialSections = ['hero', 'contact'];
      if (essentialSections.includes(sectionId)) {
        console.warn(`Elemento da seção ${sectionId} não encontrado`);
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "glass-strong" : "glass"
        }`}
      >
        {/* Divisor minimalista */}
        <div className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-300 ${
          isScrolled 
            ? "bg-gray-300/60" 
            : "bg-gray-200/40"
        }`}></div>
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-7xl relative">
          <div className="flex items-center justify-center sm:justify-between w-full">
            {/* Avatar no canto esquerdo - apenas mobile */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 sm:hidden">
              {customImage ? (
                <img 
                  src={customImage} 
                  alt="Dra. Adrielle" 
                  className="w-7 h-7 rounded-full object-cover border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                  <svg viewBox="0 0 40 40" className="w-5 h-5">
                    <path d="M 20 8 Q 25 8 28 12 Q 30 15 30 20 Q 30 24 28 26 Q 25 28 22 28 Q 20 30 18 28 Q 15 26 15 20 Q 15 15 18 12 Q 20 8 20 8 Z" 
                          fill="#9ca3af" opacity="0.7"/>
                    <path d="M 12 28 Q 15 26 20 26 Q 25 26 28 28 Q 30 30 30 34 L 10 34 Q 10 30 12 28 Z" 
                          fill="#9ca3af" opacity="0.7"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Nome centralizado */}
            {/* Avatar e nome para desktop - canto esquerdo */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* 
                SUBSTITUIÇÃO POR PNG - HEADER:
                Para usar foto PNG, substitua por:
                <img 
                  src="/sua-foto-header.png" 
                  alt="Dra. Adrielle" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                />
              */}
              {customImage ? (
                <img 
                  src={customImage} 
                  alt="Dra. Adrielle" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                  <svg viewBox="0 0 40 40" className="w-8 h-8">
                    <path d="M 20 8 Q 25 8 28 12 Q 30 15 30 20 Q 30 24 28 26 Q 25 28 22 28 Q 20 30 18 28 Q 15 26 15 20 Q 15 15 18 12 Q 20 8 20 8 Z" 
                          fill="#d1c4e9" opacity="0.8"/>
                    <path d="M 12 28 Q 15 26 20 26 Q 25 26 28 28 Q 30 30 30 34 L 10 34 Q 10 30 12 28 Z" 
                          fill="#d1c4e9" opacity="0.8"/>
                  </svg>
                </div>
              )}
              <div>
                <div className="font-display font-medium text-base md:text-lg text-gray-500">
                  {generalInfo.headerName || "Dra. Adrielle Benhossi"}
                </div>
                <div className="text-xs text-gray-400 font-light">
                  CFP {currentCrp}
                </div>
              </div>
            </div>

            {/* Apenas nome centralizado no mobile */}
            <div className="sm:hidden text-center">
              <div className="font-display font-medium text-base text-gray-500">
                {generalInfo.headerName || "Dra. Adrielle Benhossi"}
              </div>
              <div className="text-xs text-gray-400 font-light">
                CFP {currentCrp}
              </div>
            </div>

            {/* Menu desktop - no canto direito */}
            <div className="hidden md:flex space-x-8 text-sm font-light text-gray-600">
              {navigationSections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => scrollToSection(section.id)}
                  className="hover:text-purple-soft transition-colors duration-300"
                >
                  {section.name}
                </button>
              ))}
            </div>

            {/* Botão menu mobile */}
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/20 bg-opacity-30" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="fixed top-0 right-0 w-full max-w-xs h-full bg-white/95 backdrop-blur-md shadow-xl z-50 border-l border-white/20">
            <div className="p-6 pt-20">
              <nav className="space-y-4">
                {navigationSections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.id)}
                    className="block w-full text-left text-gray-700 hover:text-purple-soft transition-colors duration-300 py-3 px-4"
                  >
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}