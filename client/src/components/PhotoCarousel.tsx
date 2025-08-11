import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { PhotoCarousel as PhotoCarouselType } from "@shared/schema";
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSectionColors } from "@/hooks/useSectionColors";

export function PhotoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Apply section colors using robust hook
  useSectionColors();
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set()); // Sistema simplificado
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoCarouselType | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Buscar fotos do carrossel
  const { data: photos = [], isLoading } = useQuery<PhotoCarouselType[]>({
    queryKey: ["/api/photo-carousel"],
    queryFn: async () => {
      const response = await fetch("/api/photo-carousel");
      const data = await response.json();
      return data;
    },
  });

  // Buscar configurações da seção de galeria
  const { data: configs = [] } = useQuery<any[]>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
  });

  const photoCarouselConfig = configs.find((c: any) => c.key === 'photo_carousel_section')?.value as any || {};
  const badgeGradient = configs.find((c: any) => c.key === 'badge_gradient')?.value?.gradient;

  const activePhotos = photos.filter(photo => photo.isActive);

  // REMOVED: Duplicated color application logic - now handled by useSectionColors hook with robust monitoring

  // Sistema de lazy loading simplificado - removido para debug
  // const preloadImage = useCallback((index: number) => {
  //   // Sistema simplificado - todas as imagens são carregadas diretamente
  // }, [activePhotos]);

  // // Não há mais pré-carregamento condicional
  // useEffect(() => {
  //   // Sistema simplificado
  // }, [currentSlide, activePhotos.length]);

  // Auto play do carrossel (pausado quando pop-up está aberto)
  useEffect(() => {
    if (isAutoPlaying && activePhotos.length > 1 && !isTransitioning && !selectedPhoto) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 7000); // Aumentado para 7 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, activePhotos.length, isTransitioning, currentSlide, selectedPhoto]);

  // Navegação com prevenção de cliques duplos
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;

    setIsTransitioning(true);
    setCurrentSlide(index);
    // preloadImage removido - imagens carregam diretamente

    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [currentSlide, isTransitioning]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    const nextIndex = (currentSlide + 1) % activePhotos.length;
    goToSlide(nextIndex);
  }, [currentSlide, activePhotos.length, goToSlide, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    const prevIndex = (currentSlide - 1 + activePhotos.length) % activePhotos.length;
    goToSlide(prevIndex);
  }, [currentSlide, activePhotos.length, goToSlide, isTransitioning]);

  // Abrir foto no pop-up
  const openPhotoPopup = (photo: PhotoCarouselType) => {
    setSelectedPhoto(photo);
    setIsAutoPlaying(false);
    // Trava o scroll do body usando classe CSS
    document.body.classList.add('modal-open');
    // Força z-index do modal na próxima renderização
    setTimeout(() => {
      const modal = document.querySelector('.photo-modal-overlay') as HTMLElement;
      if (modal) {
        modal.style.setProperty('z-index', '999999999', 'important');
      }
    }, 50);
  };

  // Fechar pop-up
  const closePhotoPopup = () => {
    setSelectedPhoto(null);
    setIsAutoPlaying(true);
    // Restaura o scroll do body removendo classe CSS
    document.body.classList.remove('modal-open');
  };

  // Suporte para tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedPhoto) {
        closePhotoPopup();
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedPhoto]);

  // Touch/swipe para mobile com melhor responsividade
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 75; // Aumentado o threshold para evitar swipes acidentais
    const isRightSwipe = distance < -75;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTimeout(() => setIsAutoPlaying(true), 2000);
  };

  if (isLoading || activePhotos.length === 0) {
    return null;
  }

  const currentPhoto = activePhotos[currentSlide];

  return (
    <section 
      id="photo-carousel" 
      data-section="gallery"
      className="py-8 sm:py-16 relative overflow-hidden"
      ref={sectionRef}
    >

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <SectionHeader
          badge={photoCarouselConfig.badge || "GALERIA"}
          title={photoCarouselConfig.title || "Nossa (Galeria)"}
          description={photoCarouselConfig.description || "Um olhar pelo ambiente acolhedor onde acontece o cuidado"}
          badgeGradient={badgeGradient}
          animated={true}
          className="mb-16"
          sectionKey="gallery"
        />

        {/* Galeria Simples e Robusta */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl xl:max-w-2xl mx-auto"
        >
          <div className="relative">
            {/* Container da galeria */}
            <div className="relative rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-200/50 backdrop-blur-sm">
              
              {/* Container das imagens com suporte a swipe */}
              <div 
                className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[420px] xl:h-[480px] 2xl:h-[520px] overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                
                {/* Todas as imagens empilhadas */}
                {activePhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover cursor-pointer md:cursor-default"
                      onClick={() => {
                        // Só permite expansão no mobile (largura menor que 768px)
                        if (window.innerWidth < 768) {
                          openPhotoPopup(activePhotos[currentSlide]);
                        }
                      }}
                    />
                    
                    {/* Overlay do texto apenas na imagem atual */}
                    {index === currentSlide && photo.showText && (photo.title || photo.description) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                          <div className="text-white">
                            {photo.title && (
                              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
                                {photo.title}
                              </h3>
                            )}
                            {photo.description && (
                              <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed font-light line-clamp-2 lg:line-clamp-3">
                                {photo.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
              </div>
            </div>

            {/* Bottom Navigation - Same as Testimonials */}
            {activePhotos.length > 1 && (
              <div className="flex items-center justify-center mt-12 gap-6">
                {/* Previous Button */}
                <motion.button
                  onClick={prevSlide}
                  disabled={isTransitioning}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                {/* Dot Indicators */}
                <div className="flex items-center gap-2">
                  {activePhotos.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isTransitioning}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative transition-all duration-300 ${
                        index === currentSlide 
                          ? "w-8 h-3 bg-gray-700 rounded-full" 
                          : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
                      }`}
                      aria-label={`Ir para foto ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={nextSlide}
                  disabled={isTransitioning}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}

            {/* Contador com efeito glass */}
            {activePhotos.length > 1 && (
              <div className="absolute top-3 left-3 z-20">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium px-2 py-1 rounded-lg shadow-lg">
                  {currentSlide + 1}/{activePhotos.length}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal da Foto - Sistema Novo e Simples */}
      {selectedPhoto && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999999] p-4 sm:p-4" 
          onClick={closePhotoPopup}
        >
          {/* Botão Fechar */}
          <button
            onClick={closePhotoPopup}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 rounded-full p-2.5 sm:p-2 transition-all z-[9999999]"
            aria-label="Fechar foto"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Container da Imagem e Descrição */}
          <div 
            className="relative max-w-[85vw] max-h-[75vh] sm:max-w-[85vw] sm:max-h-[75vh] md:max-w-[92vw] md:max-h-[82vh] lg:max-w-[94vw] lg:max-h-[84vh] xl:max-w-[96vw] xl:max-h-[86vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title || "Foto"}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Informações da Foto - Logo abaixo da imagem */}
            {selectedPhoto.showText && (selectedPhoto.title || selectedPhoto.description) && (
              <div className="mt-4 text-center max-w-full">
                {selectedPhoto.title && (
                  <h3 className="text-white text-lg sm:text-xl font-bold mb-2">
                    {selectedPhoto.title}
                  </h3>
                )}
                {selectedPhoto.description && (
                  <p className="text-white/90 text-sm leading-relaxed">
                    {selectedPhoto.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

export default PhotoCarousel;