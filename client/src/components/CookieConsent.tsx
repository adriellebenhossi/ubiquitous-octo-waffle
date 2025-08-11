/**
 * CookieConsent.tsx
 * 
 * Componente de consentimento de cookies com design moderno e efeito glass
 * Posicionamento responsivo: topo no desktop, inferior no mobile
 * Integrado com as configurações do painel administrativo
 */

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { BADGE_GRADIENTS } from '@/utils/textGradient';

interface CookieSettings {
  id: number;
  isEnabled: boolean;
  title: string;
  message: string;
  acceptButtonText: string;
  declineButtonText: string;
  privacyLinkText: string;
  termsLinkText: string;
  updatedAt: string;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Buscar configurações de cookies
  const { data: cookieSettings } = useQuery<CookieSettings>({
    queryKey: ['/api/cookie-settings'],
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar configurações do sistema para usar o gradient dos badges
  const { data: siteConfigs } = useQuery<Array<{key: string, value: any}>>({
    queryKey: ['/api/admin/config'],
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Extrair cores do gradient dos badges usando exatamente o mesmo sistema dos textos entre parênteses
  const getBadgeGradient = () => {
    if (!siteConfigs || !Array.isArray(siteConfigs)) {
      return 'from-pink-500 to-purple-600';
    }
    
    const badgeGradientConfig = siteConfigs.find((c: any) => c.key === 'badge_gradient')?.value;
    if (!badgeGradientConfig?.gradient) {
      return 'from-pink-500 to-purple-600';
    }
    
    const { gradient } = badgeGradientConfig;
    
    // Usar exatamente o mesmo mapeamento dos textos entre parênteses
    return BADGE_GRADIENTS[gradient as keyof typeof BADGE_GRADIENTS] || 'from-pink-500 to-purple-600';
  };

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookieAccepted = localStorage.getItem('cookie-consent-accepted');
    const acceptedTimestamp = localStorage.getItem('cookie-consent-timestamp');
    
    console.log('Cookie Debug:', {
      cookieAccepted,
      acceptedTimestamp,
      cookieSettings,
      isEnabled: cookieSettings?.isEnabled
    });
    
    if (cookieAccepted === 'true' && acceptedTimestamp) {
      // Verificar se já passou mais de 30 dias (revalidar consentimento)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (parseInt(acceptedTimestamp) > thirtyDaysAgo) {
        setHasAccepted(true);
        return;
      }
    }

    // Mostrar popup após um pequeno delay se cookies estiverem habilitados
    if (cookieSettings?.isEnabled) {
      const timer = setTimeout(() => {
        console.log('Setting cookie consent visible');
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cookieSettings]);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie-consent-accepted', 'true');
    localStorage.setItem('cookie-consent-timestamp', Date.now().toString());
    setHasAccepted(true);
    setIsVisible(false);

    // Disparar evento customizado para outros componentes
    window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
  };

  const handleDeclineCookies = () => {
    setIsVisible(false);
    // Não salvar no localStorage - pop-up aparecerá novamente na próxima visita
  };

  // Não renderizar se cookies estão desabilitados, usuário já aceitou, ou não há configurações
  if (!cookieSettings?.isEnabled || hasAccepted || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay sutil */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[200] pointer-events-none" />
      
      {/* Pop-up de cookies - sempre bottom no mobile */}
      <div 
        className="
          fixed z-[201] left-4 right-4 max-w-md mx-auto
          bottom-4
          md:left-6 md:right-auto md:max-w-lg
          animate-in fade-in slide-in-from-bottom-4 duration-500
        "
      >
        <Card className="
          relative overflow-hidden
          bg-white/95 dark:bg-gray-900/95 
          backdrop-blur-xl backdrop-saturate-150
          border border-white/20 dark:border-gray-700/50
          shadow-2xl shadow-purple-500/10
          rounded-2xl
        ">
          {/* Efeito glass decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          
          {/* Botão de fechar */}
          <button
            onClick={handleDeclineCookies}
            className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
            aria-label="Fechar aviso de cookies"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          <div className="p-6 space-y-4">
            {/* Cabeçalho com ícone fofo de cookie */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Cookie size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {cookieSettings.title}
              </h3>
            </div>

            {/* Mensagem */}
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {cookieSettings.message}
            </p>

            {/* Links para políticas */}
            <div className="flex flex-wrap gap-1 text-xs text-gray-600 dark:text-gray-400">
              <span>Leia nossa</span>
              <Link to="/privacy-policy">
                <span className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline transition-colors cursor-pointer">
                  {cookieSettings.privacyLinkText}
                </span>
              </Link>
              <span>e</span>
              <Link to="/terms-of-use">
                <span className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline transition-colors cursor-pointer">
                  {cookieSettings.termsLinkText}
                </span>
              </Link>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAcceptCookies}
                className={`
                  flex-1 bg-gradient-to-r ${getBadgeGradient()}
                  hover:opacity-90
                  text-white font-medium rounded-xl
                  shadow-lg
                  transition-all duration-200
                  hover:shadow-xl
                  hover:scale-[1.02]
                `}
              >
                {cookieSettings.acceptButtonText}
              </Button>
              
              <Button
                onClick={handleDeclineCookies}
                variant="ghost"
                className="
                  flex-1 text-gray-600 dark:text-gray-400 
                  hover:text-gray-800 dark:hover:text-gray-200
                  hover:bg-gray-100/50 dark:hover:bg-gray-800/50
                  rounded-xl border border-gray-200/50 dark:border-gray-700/50
                  transition-all duration-200
                "
              >
                {cookieSettings.declineButtonText || 'Não Aceitar'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}