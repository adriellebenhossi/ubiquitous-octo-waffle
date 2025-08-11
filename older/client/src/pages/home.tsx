/**
 * home.tsx
 * 
 * Página principal do site da psicóloga
 * Organiza todas as seções em uma single-page application
 * Layout: Header -> Hero -> About -> Services -> Quotes -> Testimonials -> FAQ -> Contact -> Footer
 * Controla botão "voltar ao topo" baseado na posição do scroll
 */

import { useState, useEffect, useRef, Suspense, lazy } from "react"; // Controle do botão scroll to top
import { ChevronUp } from "lucide-react"; // Ícone do botão voltar ao topo
import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/HeroSection";
import { Navigation } from "@/components/Navigation";
import { MarketingPixels } from "@/components/MarketingPixels";
import { MaintenancePage } from "@/components/MaintenancePage";
import { LoadingFallback, SectionSkeleton } from "@/components/LoadingFallback";
import { useSectionVisibility } from "@/hooks/useSectionVisibility";
import { useSectionColors } from "@/hooks/useSectionColors";

import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

// Lazy loading para seções não críticas
const AboutAndSpecialtiesSection = lazy(() => import("@/components/AboutAndSpecialtiesSection").then(m => ({ default: m.default })));
const ServicesSection = lazy(() => import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection })));
const TestimonialsCarousel = lazy(() => import("@/components/TestimonialsCarousel").then(m => ({ default: m.TestimonialsCarousel })));
const FAQSection = lazy(() => import("@/components/FAQSection").then(m => ({ default: m.default })));
const ContactSection = lazy(() => import("@/components/ContactSection").then(m => ({ default: m.ContactSection })));
const PhotoCarousel = lazy(() => import("@/components/PhotoCarousel").then(m => ({ default: m.PhotoCarousel })));
const InspirationalQuotes = lazy(() => import("@/components/InspirationalQuotes").then(m => ({ default: m.InspirationalQuotes })));
const ArticlesSection = lazy(() => import("@/components/ArticlesSection").then(m => ({ default: m.ArticlesSection })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
// Componente principal da página home
export default function Home() {
  // Verifica modo de manutenção usando endpoint público
  const { data: maintenanceCheck, isLoading: isMaintenanceLoading } = useQuery({
    queryKey: ["/api/maintenance-check"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/maintenance-check");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 1,
  });

  const [showBackToTop, setShowBackToTop] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Hook para controlar visibilidade das seções
  const {
    isHeroVisible,
    isAboutVisible,
    isSpecialtiesVisible,
    isArticlesVisible,
    isServicesVisible,
    isTestimonialsVisible,
    isFaqVisible,
    isContactVisible,
    isPhotoCarouselVisible,
    isInspirationalVisible
  } = useSectionVisibility();

  // Buscar ordem das seções
  const { data: configs, isLoading: isConfigsLoading } = useQuery({
    queryKey: ["/api/config"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 1,
  });

  const orderConfig = Array.isArray(configs) ? 
    configs.find((c: any) => c.key === 'section_order')?.value as any || {} : 
    {};

  // Debug da configuração de ordem
  useEffect(() => {
    if (Object.keys(orderConfig).length > 0) {
      console.log("🏠 Home - Order Config:", orderConfig);
    }
  }, [orderConfig]);

  // Definir seções ordenáveis com seus componentes
  const sections = [
    {
      key: 'hero',
      component: <HeroSection />,
      visible: isHeroVisible,
      order: orderConfig.hero !== undefined ? orderConfig.hero : 0
    },
    {
      key: 'about',
      component: <AboutAndSpecialtiesSection />,
      visible: isAboutVisible,
      order: orderConfig.about ?? 1
    },
    {
      key: 'specialties',
      component: null, // Incluída na AboutAndSpecialtiesSection
      visible: isSpecialtiesVisible,
      order: orderConfig.specialties ?? 1.5
    },
    {
      key: 'articles',
      component: <ArticlesSection />,
      visible: isArticlesVisible,
      order: orderConfig.articles ?? 2
    },
    {
      key: 'gallery',
      component: <PhotoCarousel />,
      visible: isPhotoCarouselVisible,
      order: orderConfig.gallery ?? 3
    },
    {
      key: 'services',
      component: <ServicesSection />,
      visible: isServicesVisible, 
      order: orderConfig.services ?? 4
    },
    {
      key: 'testimonials',
      component: <TestimonialsCarousel />,
      visible: isTestimonialsVisible,
      order: orderConfig.testimonials ?? 5
    },
    {
      key: 'faq',
      component: <FAQSection />,
      visible: isFaqVisible,
      order: orderConfig.faq ?? 6
    },
    {
      key: 'contact',
      component: <ContactSection />,
      visible: isContactVisible,
      order: orderConfig.contact ?? 7
    },
    {
      key: 'inspirational',
      component: <InspirationalQuotes />,
      visible: isInspirationalVisible,
      order: orderConfig.inspirational ?? 8
    }
  ].sort((a, b) => a.order - b.order);

  // Debug das seções ordenadas
  useEffect(() => {
    if (sections.length > 0) {
      console.log("🏠 Home - Sections ordered:", sections.map(s => ({ key: s.key, order: s.order, visible: s.visible })));
    }
  }, [sections]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);

    // Check if critical content is loaded
    const checkContentReady = () => {
      const heroSection = document.querySelector('[data-section="hero"]');
      const navigation = document.querySelector('nav');

      if (heroSection && navigation) {
        setInitialLoading(false);
        clearTimeout(timer);
      }
    };

    // Check immediately and after a short delay
    checkContentReady();
    const readyTimer = setTimeout(checkContentReady, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(readyTimer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Verifica se o modo de manutenção está ativo
  const isMaintenanceMode = maintenanceCheck?.maintenance?.enabled || false;

  const sectionVisibility = useSectionVisibility();
  useSectionColors(); // Aplica as cores das seções

  // Loading inicial para evitar flash de conteúdo
  if (isMaintenanceLoading || isConfigsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <LoadingFallback type="spinner" />
      </div>
    );
  }

  // Se o modo de manutenção estiver ativo, exibe apenas a página de manutenção
  if (isMaintenanceMode) {
    return (
      <>
        <MarketingPixels />
        <MaintenancePage />
      </>
    );
  }

  return (
    // Container principal com fonte e overflow controlado - flexbox vertical
    <div className="main-page-container font-sans text-gray-800 overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50 min-h-screen flex flex-col relative">
      {/* Background decorativo sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-100/15 to-blue-100/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navegação fixa no topo - sempre visível */}
      <Navigation />

      {/* Container principal das seções - ocupa o espaço disponível */}
      <main className="relative z-10 w-full flex-grow">
        {/* Seções dinâmicas ordenadas pelo admin */}
        {sections
          .filter(section => section.visible && section.component) 
          .map((section, index) => (
            <Suspense 
              key={section.key} 
              fallback={<SectionSkeleton />}
            >
              <section className="w-full">
                {section.component}
              </section>
            </Suspense>
          ))
        }
      </main>

      {/* Rodapé - informações finais - sempre colado na parte inferior */}
      <Suspense fallback={<SectionSkeleton className="bg-gray-100" />}>
        <footer ref={footerRef} className="relative z-10 w-full">
          <Footer />
        </footer>
      </Suspense>

      {/* Botão voltar ao topo - aparece quando scroll > 300px */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-[120] card-aesthetic p-4 text-gray-700 hover:text-purple-600 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} className="group-hover:animate-bounce" />
        </button>
      )}

      <MarketingPixels />
    </div>
  );
}