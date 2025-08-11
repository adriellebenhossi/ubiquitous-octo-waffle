/**
 * Footer.tsx
 * 
 * Footer moderno e minimalista redesenhado
 * Design profissional com layout organizado e responsive
 * Suporte dark/light mode com aesthetic limpo
 * Mantém todas as funcionalidades existentes
 */

import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaFacebookF, FaTelegramPlane, FaDiscord, FaSkype, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
import { FaXTwitter, FaThreads, FaBluesky } from "react-icons/fa6";
import { 
  Star, 
  Sparkles, 
  Heart, 
  Globe, 
  Shield, 
  Lock, 
  CheckCircle, 
  ShieldCheck, 
  Scale, 
  Award,
  Users,
  FileCheck,
  Zap,
  Crown,
  Gem,
  Badge as BadgeIcon,
  Verified,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BookOpen
} from "lucide-react"; // Ícones decorativos
import { Avatar } from "./Avatar"; // Avatar da psicóloga
import { useQuery } from "@tanstack/react-query"; // Para buscar configurações do site
import { Link } from "wouter"; // Para navegação

export function Footer() {
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

  // Buscar configurações do footer
  const { data: footerSettings } = useQuery({
    queryKey: ["/api/admin/footer-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/footer-settings");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Extrair a imagem personalizada do hero se disponível
  const heroImage = configs?.find((c: any) => c.key === 'hero_image');
  const customImage = heroImage?.value?.path || null;

  // Extrair informações gerais das configurações
  const generalInfo = configs?.find((c: any) => c.key === 'general_info')?.value as any || {};
  const currentName = generalInfo.headerName || generalInfo.name || "Dra. Adrielle Benhossi";
  const currentCrp = generalInfo.crp || "08/123456";

  // Configurações do footer com fallbacks
  const footerData = footerSettings || {};
  const generalFooterInfo = footerData.general_info || {};
  const contactButtons = footerData.contact_buttons || [];
  const certificationItems = footerData.certification_items || [];
  const trustSeals = footerData.trust_seals || [];
  const bottomInfo = footerData.bottom_info || {};

  // Filtrar apenas badges ativos para exibição pública
  const activeTrustSeals = trustSeals.filter((badge: any) => badge.isActive);

  // Mapeamento completo de ícones para badges
  const badgeIconMap: Record<string, any> = {
    // Segurança & Proteção
    shield: Shield,
    lock: Lock,
    'shield-check': ShieldCheck,
    verified: Verified,
    
    // Certificações & Qualidade
    'check-circle': CheckCircle,
    badge: BadgeIcon,
    award: Award,
    crown: Crown,
    gem: Gem,
    star: Star,
    
    // Profissional & Legal
    scale: Scale,
    'file-check': FileCheck,
    'book-open': BookOpen,
    
    // Atendimento & Serviços
    users: Users,
    heart: Heart,
    clock: Clock,
    calendar: Calendar,
    'map-pin': MapPin,
    
    // Contato & Comunicação
    phone: Phone,
    mail: Mail,
    globe: Globe,
    
    // Tecnologia & Inovação
    zap: Zap,
    sparkles: Sparkles,
    'credit-card': CreditCard,
    settings: Award, // Usando Award como fallback para settings
  };

  // Função para obter componente do ícone do badge
  const getBadgeIconComponent = (iconName: string) => {
    if (badgeIconMap[iconName]) {
      return badgeIconMap[iconName];
    }
    return Shield; // Fallback
  };

  // Mapeamento de ícones sincronizado com FooterManager.tsx
  const iconMap: Record<string, any> = {
    FaWhatsapp: FaWhatsapp,
    FaInstagram: FaInstagram,
    FaLinkedinIn: FaLinkedinIn,
    FaFacebookF: FaFacebookF,
    FaXTwitter: FaXTwitter,
    FaTelegramPlane: FaTelegramPlane,
    FaYoutube: FaYoutube,
    FaTiktok: FaTiktok,
    FaThreads: FaThreads,
    FaDiscord: FaDiscord,
    FaSkype: FaSkype,
    FaBluesky: FaBluesky,
    FaPinterest: FaPinterest,
    Globe: Globe,
  };

  const getIconComponent = (iconName: string) => {
    // Buscar por nome exato no mapeamento
    if (iconMap[iconName]) {
      return iconMap[iconName];
    }
    
    // Fallback para WhatsApp se não encontrar o ícone
    console.warn(`Ícone "${iconName}" não encontrado. Usando WhatsApp como fallback.`);
    return FaWhatsapp;
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-50 overflow-hidden">
      {/* Efeitos de fundo aesthetic */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-500/10 via-pink-500/8 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/8 via-indigo-500/6 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-rose-500/6 to-orange-500/6 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative">
        {/* Container principal */}
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
          
          {/* Header do footer com info principal */}
          <div className="mb-12 lg:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Brand section redesenhada */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {customImage ? (
                    <img 
                      src={customImage} 
                      alt={currentName} 
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl object-cover border border-slate-700/50 shadow-2xl"
                    />
                  ) : (
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/30 shadow-2xl flex items-center justify-center">
                      <svg viewBox="0 0 48 48" className="w-10 h-10 lg:w-12 lg:h-12">
                        <path d="M 24 10 Q 30 10 34 15 Q 36 18 36 24 Q 36 28 34 31 Q 30 34 26 34 Q 24 36 22 34 Q 18 31 18 24 Q 18 18 22 15 Q 24 10 24 10 Z" 
                              fill="rgb(148 163 184)" opacity="0.8"/>
                        <path d="M 14 34 Q 18 32 24 32 Q 30 32 34 34 Q 36 36 36 42 L 12 42 Q 12 36 14 34 Z" 
                              fill="rgb(148 163 184)" opacity="0.8"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-2.5 h-2.5 text-white" fill="currentColor" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-100 via-slate-50 to-slate-200 bg-clip-text text-transparent mb-1">
                    {currentName}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-800/60 border border-slate-700/50 rounded-md text-xs font-medium text-slate-300">
                      CFP: {currentCrp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="lg:max-w-md">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {generalFooterInfo.description || "Cuidando da sua saúde mental com carinho e dedicação"}
                </p>
              </div>
            </div>
          </div>

          {/* Grid principal reorganizado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
            
            {/* Seção de Contato */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-0.5 bg-gradient-to-r from-slate-400 to-transparent"></div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Canais de Contato
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contactButtons
                  .filter((button: any) => button.isActive)
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((button: any) => {
                    const IconComponent = getIconComponent(button.icon);
                    return (
                      <a
                        key={button.id}
                        href={button.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:bg-slate-800/50 hover:border-slate-600/60 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${button.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                          <IconComponent className="text-white text-xl sm:text-2xl" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-100 text-sm block leading-tight">{button.title || button.label}</span>
                          {(button.description || button.type) && (
                            <span className="text-xs text-slate-400 mt-0.5 block">{button.description || button.type}</span>
                          )}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-500 transition-colors"></div>
                      </a>
                    );
                  })}
              </div>
            </div>

            {/* Links legais */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-0.5 bg-gradient-to-r from-slate-400 to-transparent"></div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Links Importantes
                </h3>
              </div>
              <div className="space-y-3">
                <Link to="/privacy-policy">
                  <div className="group text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-800/30">
                    Política de Privacidade
                  </div>
                </Link>
                <Link to="/terms-of-use">
                  <div className="group text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-800/30">
                    Termos de Uso
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Badges de Certificação - Design Moderno */}
          {(activeTrustSeals.length > 0 || (bottomInfo.certificationText && bottomInfo.certificationText.trim())) && (
            <div className="border-t border-slate-700/50 pt-8 pb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-0.5 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Certificações
                </h3>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
              </div>
              
              {activeTrustSeals.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                  {activeTrustSeals.map((badge: any) => {
                  const BadgeIcon = getBadgeIconComponent(badge.icon);
                  const badgeStyle = badge.useGradient 
                    ? { background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})` }
                    : { backgroundColor: badge.backgroundColor };
                  
                  return (
                    <div
                      key={badge.id}
                      className="group relative"
                    >
                      {/* Badge principal */}
                      <div
                        className="relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50"
                        style={{
                          ...badgeStyle,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        title={badge.description}
                      >
                        {/* Efeito de brilho */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        {/* Conteúdo do badge */}
                        <div className="relative flex flex-col items-center text-center space-y-1 sm:space-y-2">
                          {/* Ícone com efeito de profundidade */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-black/20 rounded-lg blur-sm transform translate-y-1"></div>
                            <div 
                              className="relative bg-white/10 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 lg:p-2 border border-white/20"
                              style={{ 
                                backgroundColor: `${badge.textColor}20`,
                                borderColor: `${badge.textColor}30`
                              }}
                            >
                              <BadgeIcon 
                                className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0 drop-shadow-sm" 
                                style={{ color: badge.textColor || '#ffffff' }}
                              />
                            </div>
                          </div>
                          
                          {/* Texto do badge */}
                          <div className="space-y-0.5 sm:space-y-1">
                            <span 
                              className="text-xs sm:text-xs lg:text-sm font-bold tracking-wide block leading-tight drop-shadow-sm"
                              style={{ color: badge.textColor || '#ffffff' }}
                            >
                              {badge.label}
                            </span>
                            {badge.description && (
                              <span 
                                className="text-xs opacity-90 leading-tight block hidden sm:block"
                                style={{ color: badge.textColor || '#ffffff' }}
                              >
                                {badge.description.length > 15 
                                  ? `${badge.description.substring(0, 15)}...` 
                                  : badge.description
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Indicador de verificação */}
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-1 h-1 sm:w-2 sm:h-2 text-white" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Tooltip expandido ao hover */}
                      {badge.description && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                          <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-700 max-w-48 text-center">
                            <div className="font-medium mb-1">{badge.label}</div>
                            <div className="text-slate-300">{badge.description}</div>
                            {/* Seta do tooltip */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
              
              {/* Texto de certificações personalizado */}
              {bottomInfo.certificationText && bottomInfo.certificationText.trim() && (
                <div className="mt-6 text-left">
                  <div 
                    className="text-sm text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: bottomInfo.certificationText.replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Bottom section minimalista */}
          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-300">
                  {bottomInfo.copyright || `© 2024 ${currentName} • Todos os direitos reservados`}
                </p>
                {generalFooterInfo.showCnpj && generalFooterInfo.cnpj && (
                  <p className="text-xs text-slate-500">
                    CNPJ: {generalFooterInfo.cnpj}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-amber-400 fill-current" />
                <span>and</span>
                <span className="text-amber-400">☕</span>
                <span>by ∞</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;