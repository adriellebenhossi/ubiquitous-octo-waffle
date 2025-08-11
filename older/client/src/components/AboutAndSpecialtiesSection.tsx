import { motion } from "framer-motion";
import { 
  Brain, Heart, BookOpen, Users, Award, Clock, MapPin, Phone, Mail, Star,
  CheckCircle, Camera, Stethoscope, Activity, Zap, Shield, Target,
  UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
  MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
  Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
  Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
  Timer, Calendar, Hourglass
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Specialty } from "@shared/schema";
import { processTextWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSectionColors } from "@/hooks/useSectionColors";

export default function AboutAndSpecialtiesSection() {
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const { data: specialties = [], isLoading: isSpecialtiesLoading } = useQuery({
    queryKey: ["/api/specialties"],
    queryFn: async () => {
      const response = await fetch("/api/specialties");
      if (!response.ok) throw new Error(`Falha ao carregar especialidades: ${response.status}`);
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 3,
  });

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Hook para aplicar cores dinâmicas das seções do painel administrativo
  useSectionColors();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Configurações das seções
  const generalInfo = configs?.find((c: any) => c.key === "general_info")?.value as any || {};
  const aboutSection = configs?.find((c: any) => c.key === 'about_section')?.value as any || {};
  const specialtiesSection = configs?.find((c: any) => c.key === 'specialties_section')?.value || {};
  const badgeSettings = configs?.find((c: any) => c.key === 'badge_gradient')?.value || {};
  const heroImage = configs?.find((c: any) => c.key === "hero_image");

  // Visibilidade das seções
  const sectionVisibility = configs?.find((c: any) => c.key === 'section_visibility')?.value || {};
  const isAboutVisible = sectionVisibility.about !== false;
  const isSpecialtiesVisible = sectionVisibility.specialties !== false;

  // Se ambas estão desabilitadas, não renderiza nada
  if (!isAboutVisible && !isSpecialtiesVisible) {
    return null;
  }

  // Dados da seção About
  const currentCrp = generalInfo.crp || "08/123456";
  const aboutText = aboutSection.description || "";
  const badgeGradient = badgeSettings?.gradient;

  // Chaves de gradiente para os riscos superiores
  const aboutGradientKey = badgeSettings.about || badgeSettings.gradient || 'pink-purple';
  const specialtiesGradientKey = badgeSettings.specialties || badgeSettings.gradient || 'indigo-purple';

  // Dados da seção Specialties
  const activeSpecialties = specialties
    .filter((specialty: Specialty) => specialty.isActive)
    .sort((a: Specialty, b: Specialty) => a.order - b.order);

  const badgeGradientCSS = BADGE_GRADIENTS[specialtiesGradientKey as keyof typeof BADGE_GRADIENTS] || "from-purple-500 to-pink-500";

  // Mapeamento de ícones
  const iconMap: Record<string, any> = {
    Brain, Heart, BookOpen, Users, Award, Clock, MapPin, Phone, Mail, Star,
    CheckCircle, Camera, Stethoscope, Activity, Zap, Shield, Target,
    UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
    MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
    Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
    Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
    Timer, Calendar, Hourglass
  };

  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substr(0, 2), 16);
    const g = parseInt(hexValue.substr(2, 2), 16);
    const b = parseInt(hexValue.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Textos das seções
  const aboutTexts = {
    title: aboutSection.title || generalInfo.aboutSectionName || "Dra. (Adrielle Benhossi)",
    subtitle: aboutSection.subtitle || "SOBRE MIM",
  };

  const specialtiesTexts = {
    title: specialtiesSection.title || "Minhas (Especialidades)",
    subtitle: specialtiesSection.description || "Áreas de atuação onde posso te ajudar a encontrar bem-estar e equilíbrio emocional",
    badge: specialtiesSection.badge || "ESPECIALIDADES"
  };

  return (
    <section 
      id="about" 
      data-section="about" 
      className="py-8 sm:py-12 relative" 
      ref={ref}
    >
      {/* Background decorativo original */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Layout responsivo original */}
        <div className={`grid gap-8 lg:gap-12 ${
          isAboutVisible && isSpecialtiesVisible 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 justify-items-center'
        }`}>

          {/* Card Sobre Mim */}
          {isAboutVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`${!isSpecialtiesVisible ? 'max-w-3xl' : ''} w-full`}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-500 p-8 lg:p-10 h-full flex flex-col relative overflow-hidden">

                {/* Risco superior colorido dinâmico baseado no gradiente dos badges */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${BADGE_GRADIENTS[aboutGradientKey as keyof typeof BADGE_GRADIENTS] || 'from-purple-500 to-pink-500'}`} style={{ opacity: 0.4 }}></div>

                {/* Header do About */}
                <SectionHeader
                  badge={aboutTexts.subtitle}
                  title={aboutTexts.title}
                  description=""
                  badgeGradient={badgeGradient}
                  animated={true}
                  className="mb-2"
                  sectionKey="about"
                />

                <div className="mb-8 text-center">
                  <p className="text-sm font-medium mt-[-62px] mb-4" style={{
                      color: (() => {
                        const professionalTitleColor = configs?.find((c: any) => c.key === "professional_title_color")?.value as any || {};
                        return professionalTitleColor.color || "#ec4899";
                      })()
                    }}>
                    {(() => {
                      const professionalTitleInfo = configs?.find((c: any) => c.key === "professional_title")?.value as any || {};
                      return professionalTitleInfo.title || "Psicóloga Clínica";
                    })()} • CFP: {currentCrp}
                  </p>
                  
                  {/* Risquinho sutil minimalista */}
                  <div className={`w-12 h-px mx-auto mb-6 bg-gradient-to-r ${BADGE_GRADIENTS[aboutGradientKey as keyof typeof BADGE_GRADIENTS] || 'from-purple-500 to-pink-500'}`} style={{ opacity: 0.3 }}></div>
                </div>

                {/* Conteúdo About - Flex grow para ocupar espaço disponível */}
                <div className="flex-1 flex flex-col">
                  <div className="text-gray-600 leading-relaxed text-base font-light mb-8">
                    {(aboutText || "Este é o espaço para escrever sobre você no painel administrativo.")
                      .split('\n')
                      .map((paragraph: string, index: number) => (
                        <p key={index} className={index > 0 ? "mt-4" : ""}>
                          {paragraph}
                        </p>
                      ))
                    }
                  </div>

                  {/* Credenciais fixas na parte inferior */}
                  <div className="mt-auto">
                    {(() => {
                      const aboutCredentials = configs?.find((c: any) => c.key === "about_credentials")?.value as any[] || [];
                      const activeCredentials = aboutCredentials
                        .filter(cred => cred.isActive !== false)
                        .sort((a, b) => (a.order || 0) - (b.order || 0));

                      if (activeCredentials.length === 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-3 rounded-xl border border-pink-100/50">
                              <div className="text-xs font-semibold text-gray-700">Centro Universitário Integrado</div>
                              <div className="text-xs text-gray-500 mt-1">Formação Acadêmica</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100/50">
                              <div className="text-xs font-semibold text-gray-700">Terapia Cognitivo-Comportamental</div>
                              <div className="text-xs text-gray-500 mt-1">Abordagem Terapêutica</div>
                            </div>
                          </div>
                        );
                      }

                      // Layout especial para exatamente 3 credenciais no desktop
                      if (activeCredentials.length === 3) {
                        return (
                          <div className="space-y-3">
                            {/* Primeiro par de credentials - lado a lado no desktop, empilhadas no mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeCredentials.slice(0, 2).map((credential: any) => (
                                <div 
                                  key={credential.id} 
                                  className={`bg-gradient-to-br ${credential.gradient} p-3 rounded-xl border border-white/20`}
                                >
                                  <div className="text-xs font-semibold text-gray-700">{credential.title}</div>
                                  <div className="text-xs text-gray-500 mt-1">{credential.subtitle}</div>
                                </div>
                              ))}
                            </div>
                            {/* Terceira credencial ocupando toda a largura no desktop, normal no mobile */}
                            <div className="grid grid-cols-1 gap-3">
                              <div 
                                key={activeCredentials[2].id} 
                                className={`bg-gradient-to-br ${activeCredentials[2].gradient} p-3 rounded-xl border border-white/20`}
                              >
                                <div className="text-xs font-semibold text-gray-700">{activeCredentials[2].title}</div>
                                <div className="text-xs text-gray-500 mt-1">{activeCredentials[2].subtitle}</div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Layout padrão para outras quantidades
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeCredentials.map((credential: any) => (
                            <div 
                              key={credential.id} 
                              className={`bg-gradient-to-br ${credential.gradient} p-3 rounded-xl border border-white/20`}
                            >
                              <div className="text-xs font-semibold text-gray-700">{credential.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{credential.subtitle}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card Especialidades */}
          {isSpecialtiesVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: isAboutVisible ? 0.2 : 0 }}
              className={`${!isAboutVisible ? 'max-w-5xl' : ''} w-full`}
            >
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-700 p-8 lg:p-10 h-full flex flex-col relative overflow-hidden">

                {/* Risco superior colorido dinâmico baseado no gradiente dos badges */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${BADGE_GRADIENTS[specialtiesGradientKey as keyof typeof BADGE_GRADIENTS] || 'from-indigo-500 to-purple-500'}`} style={{ opacity: 0.4 }}></div>

                {/* Header das Especialidades */}
                <SectionHeader
                  badge={specialtiesTexts.badge}
                  title={specialtiesTexts.title}
                  description={specialtiesTexts.subtitle}
                  badgeGradient={specialtiesGradientKey}
                  animated={true}
                  className="mb-6"
                  sectionKey="specialties"
                />

                {/* Conteúdo de especialidades híbrido */}
                <div className="flex-1 flex flex-col">
                  {isSpecialtiesLoading ? (
                    <div className="space-y-3 lg:space-y-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-xl"></div>
                      ))}
                    </div>
                  ) : activeSpecialties.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      <p>Nenhuma especialidade disponível</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop: Lista original minimalista */}
                      <div className="hidden lg:block flex-1">
                        <div className="space-y-3 w-full">
                          {activeSpecialties.slice(0, -1).map((specialty: Specialty, index: number) => {
                            const IconComponent = iconMap[specialty.icon] || Brain;

                            return (
                              <motion.div
                                key={specialty.id}
                                className="group w-full"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                                transition={{ 
                                  duration: 0.4, 
                                  delay: 0.3 + index * 0.06,
                                  ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                              >
                                <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100/60 hover:border-gray-200/80 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-gray-200/40 group-hover:-translate-y-1">
                                  
                                  <div className="relative px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                      {/* Minimalist icon container */}
                                      <div className="flex-shrink-0">
                                        <div 
                                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300"
                                          style={{ 
                                            backgroundColor: `${specialty.iconColor}08`,
                                            border: `1px solid ${specialty.iconColor}20`
                                          }}
                                        >
                                          <IconComponent 
                                            className="w-5 h-5 transition-all duration-300" 
                                            style={{ color: specialty.iconColor }}
                                          />
                                        </div>
                                      </div>

                                      {/* Content with better typography */}
                                      <div className="flex-1 space-y-1">
                                        <h4 className="text-gray-900 font-medium text-[14px] leading-tight tracking-wide">
                                          {specialty.title}
                                        </h4>
                                        <p className="text-gray-600 text-[12px] leading-snug font-light tracking-wide line-clamp-2">
                                          {specialty.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mobile: Cards com ícones centralizados */}
                      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeSpecialties.map((specialty: Specialty, index: number) => {
                          const IconComponent = iconMap[specialty.icon] || Brain;

                          return (
                            <motion.div
                              key={specialty.id}
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
                              transition={{ 
                                duration: 0.5, 
                                delay: 0.3 + index * 0.1,
                                ease: [0.16, 1, 0.3, 1]
                              }}
                            >
                              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col">
                                
                                {/* Ícone centralizado */}
                                <div className="text-center mb-4">
                                  <div 
                                    className="inline-flex w-12 h-12 rounded-xl items-center justify-center"
                                    style={{ 
                                      backgroundColor: `${specialty.iconColor}10`,
                                      border: `2px solid ${specialty.iconColor}20`
                                    }}
                                  >
                                    <IconComponent 
                                      className="w-6 h-6" 
                                      style={{ color: specialty.iconColor }}
                                    />
                                  </div>
                                </div>

                                {/* Conteúdo centralizado */}
                                <div className="text-center">
                                  <h4 className="text-gray-900 font-medium text-sm leading-tight mb-2">
                                    {specialty.title}
                                  </h4>
                                  <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    {specialty.description}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Última especialidade fixa na parte inferior - apenas desktop */}
                      <div className="hidden lg:block mt-auto pt-3">
                        {(() => {
                          const lastSpecialty = activeSpecialties[activeSpecialties.length - 1];
                          if (!lastSpecialty) return null;
                          
                          const IconComponent = iconMap[lastSpecialty.icon] || Brain;
                          const lastIndex = activeSpecialties.length - 1;

                          return (
                            <motion.div
                              key={lastSpecialty.id}
                              className="group w-full"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                              transition={{ 
                                duration: 0.4, 
                                delay: 0.3 + lastIndex * 0.06,
                                ease: [0.25, 0.46, 0.45, 0.94]
                              }}
                            >
                              <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100/60 hover:border-gray-200/80 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-gray-200/40 group-hover:-translate-y-1">

                                <div className="relative px-6 py-4">
                                  <div className="flex items-center space-x-4">
                                    {/* Minimalist icon container */}
                                    <div className="flex-shrink-0">
                                      <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300"
                                        style={{ 
                                          backgroundColor: `${lastSpecialty.iconColor}08`,
                                          border: `1px solid ${lastSpecialty.iconColor}20`
                                        }}
                                      >
                                        <IconComponent 
                                          className="w-5 h-5 transition-all duration-300" 
                                          style={{ color: lastSpecialty.iconColor }}
                                        />
                                      </div>
                                    </div>

                                    {/* Content with better typography */}
                                    <div className="flex-1 space-y-1">
                                      <h4 className="text-gray-900 font-medium text-[14px] leading-tight tracking-wide">
                                        {lastSpecialty.title}
                                      </h4>
                                      <p className="text-gray-600 text-[12px] leading-snug font-light tracking-wide line-clamp-2">
                                        {lastSpecialty.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()}

                        {/* Indicador fixo na parte inferior */}
                        {activeSpecialties.length > 6 && (
                          <div className="text-center pt-6">
                            <p className="text-xs text-gray-500">
                              +{activeSpecialties.length - 6} especialidades adicionais
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}