/**
 * TestimonialsCarousel.tsx
 * 
 * Modern minimalist testimonials carousel with aesthetic design
 * Features: smooth animations, bottom navigation, clean typography
 */

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSectionColors } from "@/hooks/useSectionColors";

export function TestimonialsCarousel() {
  // Apply section colors
  useSectionColors();

  // Data fetching
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    queryFn: async () => {
      const response = await fetch("/api/testimonials");
      if (!response.ok) throw new Error('Error fetching testimonials');
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Configuration data
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

  const testimonialsSection = configs?.find((c: any) => c.key === 'testimonials_section')?.value as any || {};
  const sectionVisibility = configs?.find((c: any) => c.key === 'section_visibility')?.value as any || {};
  const isTestimonialsVisible = sectionVisibility?.testimonials !== false;
  const badgeGradient = configs?.find((c: any) => c.key === 'badge_gradient')?.value?.gradient;

  // Component state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    stopAutoPlay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    stopAutoPlay();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    stopAutoPlay();
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    // Não retoma mais - uma vez que o usuário interage, ele assume o controle
  };

  // Touch handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      stopAutoPlay(); // Para o sistema automático
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      stopAutoPlay(); // Para o sistema automático
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="testimonials" data-section="testimonials" className="main-section relative" style={{ margin: 0, padding: 0 }}>
        <div className="relative py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-medium text-gray-600 mt-4">Carregando depoimentos...</h2>
          </div>
        </div>
      </section>
    );
  }

  // Visibility checks
  if (!isTestimonialsVisible || !testimonials.length) {
    return null;
  }

  return (
    <section id="testimonials" data-section="testimonials" className="main-section relative" style={{ margin: 0, padding: 0 }}>
      <div className="relative py-16 sm:py-20 lg:py-24">
        {/* Section Header */}
        <SectionHeader
          badge={testimonialsSection.badge || "DEPOIMENTOS"}
          title={testimonialsSection.title || "Histórias de (transformação)"}
          description={testimonialsSection.description || "Depoimentos de pessoas que encontraram acolhimento, superação e crescimento através do meu acompanhamento psicológico."}
          badgeGradient={badgeGradient}
          animated={true}
          sectionKey="testimonials"
        />

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Testimonials Slider */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative"
              >
                <TestimonialCard testimonial={testimonials[currentSlide]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-center mt-12 gap-6">
            {/* Previous Button */}
            <motion.button
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-300"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative transition-all duration-300 ${
                    index === currentSlide 
                      ? "w-8 h-3 bg-gray-700 rounded-full" 
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <motion.button
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-300"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonial Card Component - Design Aesthetic Minimalista
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="relative">
      {/* Card Principal - Clean e Elegante */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md border border-gray-200/30 transition-all duration-500 hover:bg-white/90">
        
        {/* Layout Horizontal Minimalista */}
        <div className="flex items-start gap-6 mb-8">
          {/* Foto do Perfil */}
          <div className="relative flex-shrink-0">
            <div className="w-[5.25rem] h-[5.25rem] md:w-[6.3rem] md:h-[6.3rem] rounded-full overflow-hidden bg-gray-100 shadow-md border-4 border-white/70">
              {testimonial.photo && testimonial.photo.trim() !== '' ? (
                <img 
                  src={testimonial.photo.startsWith('/') ? testimonial.photo : `/uploads/testimonials/${testimonial.photo}`}
                  alt={`Foto de ${testimonial.name}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9ca3af"/>
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9ca3af"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="flex-1 min-w-0">
            {/* Nome */}
            <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-1 leading-tight">
              {testimonial.name}
            </h3>
            
            {/* Tipo de Terapia */}
            <p className="text-gray-500 text-base md:text-lg mb-2 font-light">
              {testimonial.service}
            </p>
            
            {/* Estrelas Clean */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    i < testimonial.rating 
                      ? "text-amber-400 fill-amber-400" 
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quote Icon Sutil */}
          <div className="flex-shrink-0">
            <Quote className="w-8 h-8 text-gray-300 fill-current" />
          </div>
        </div>

        {/* Linha Separadora Minimalista */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>

        {/* Texto do Depoimento */}
        <blockquote>
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-light italic text-center">
            "{testimonial.testimonial}"
          </p>
        </blockquote>
      </div>
    </div>
  );
}