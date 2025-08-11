/**
 * SectionHeader - Componente padronizado para títulos de seção
 * 
 * Garante consistência visual em todas as seções:
 * - Badge: mesmo tamanho, fonte e espaçamento
 * - Título: mesmo tamanho de fonte e espaçamento
 * - Descrição: mesmo estilo e limitação de largura
 * - Gaps padronizados entre elementos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { processTextWithGradient, getFirstColorFromGradient, hexToRgba } from '@/utils/textGradient';
import { BADGE_GRADIENTS } from '@/utils/textGradient';
import { getIconByName } from '@/utils/sectionIcons';

interface SectionHeaderProps {
  badge: string;
  title: string;
  description: string;
  badgeGradient?: string;
  titleGradient?: string;
  className?: string;
  centered?: boolean;
  animated?: boolean;
  forceBadgeVisible?: boolean; // Para forçar exibição de badges específicos (ex: título profissional)
  icon?: React.ComponentType<any>; // Ícone opcional para o badge
  sectionKey?: string; // Chave da seção para buscar ícone dinamicamente
}

export function SectionHeader({
  badge,
  title,
  description,
  badgeGradient,
  titleGradient,
  className = '',
  centered = true,
  animated = true,
  forceBadgeVisible = false,
  icon: Icon,
  sectionKey
}: SectionHeaderProps) {
  // Buscar configuração de badges do banco de dados (mesma API do useSectionColors)
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    enabled: !forceBadgeVisible, // Só busca se não for forçado a mostrar badge
    staleTime: 0, // Permitir atualizações em tempo real
    gcTime: Infinity,
    refetchOnMount: true, // Permitir refetch para pegar atualizações
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Verificar se badges devem ser exibidos
  const badgeConfig = (configs && Array.isArray(configs)) 
    ? configs.find((c: any) => c.key === "show_badges")?.value as any 
    : { enabled: true };
  const shouldShowBadge = forceBadgeVisible || (badgeConfig?.enabled !== false);
  
  // Buscar configuração de cores das seções (mesma lógica do useSectionColors)
  const sectionColors = (configs && Array.isArray(configs))
    ? configs.find((c: any) => c.key === "section_colors")?.value
    : null;
  
  // Obter cores específicas da seção ou usar sistema de gradientes como fallback
  let primaryColor: string;
  let backgroundColorWithOpacity: string;
  
  if (sectionKey && sectionColors && sectionColors[sectionKey]) {
    // Usar cores da seção específica - sempre preferir gradientColors para badges coloridos
    const sectionColorConfig = sectionColors[sectionKey];
    
    if (sectionColorConfig.gradientColors && sectionColorConfig.gradientColors.length > 0) {
      primaryColor = sectionColorConfig.gradientColors[0]; // Sempre usar primeira cor do gradiente
    } else {
      primaryColor = sectionColorConfig.backgroundColor || getFirstColorFromGradient('pink-purple');
    }
  } else {
    // Fallback para sistema de gradientes antigo
    const badgeColors = (configs && Array.isArray(configs))
      ? configs.find((c: any) => c.key === "badge_gradient")?.value
      : null;
    const gradientKey = badgeColors?.gradient || (badgeGradient ? badgeGradient : 'pink-purple');
    primaryColor = getFirstColorFromGradient(gradientKey);
  }
  
  // Aumentar opacidade para garantir visibilidade
  backgroundColorWithOpacity = hexToRgba(primaryColor, 0.15);
  
  const badgeStyles = {
    backgroundColor: backgroundColorWithOpacity,
    color: primaryColor,
    borderColor: hexToRgba(primaryColor, 0.2)
  };

  // Buscar ícone dinâmico se sectionKey for fornecida
  const badgeIconName = sectionKey && Array.isArray(configs) 
    ? configs.find((c: any) => c.key === `${sectionKey}_badge_icon`)?.value?.replace(/"/g, '') 
    : null;
  const BadgeIcon = badgeIconName ? getIconByName(badgeIconName) : null;
  const FinalIcon = BadgeIcon || Icon;

  const content = (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      {/* Badge padronizado com ícone - condicional */}
      {shouldShowBadge && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium text-xs"
            style={badgeStyles}
          >
            {FinalIcon && <FinalIcon className="h-4 w-4" style={{ color: primaryColor }} />}
            <span>{badge}</span>
          </div>
        </div>
      )}
      
      {/* Título padronizado */}
      <h2 className={`font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-tight leading-tight ${shouldShowBadge ? 'mb-6' : 'mb-8'}`}>
        {processTextWithGradient(title, titleGradient || badgeGradient)}
      </h2>
      
      {/* Descrição padronizada */}
      <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-light px-4 sm:px-6">
        {description}
      </p>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 sm:mb-16"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="mb-12 sm:mb-16">
      {content}
    </div>
  );
}