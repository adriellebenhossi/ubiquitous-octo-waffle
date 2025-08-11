/**
 * SectionHeader - Componente padronizado para títulos de seção
 * 
 * Sistema de badges completamente renovado:
 * - Design minimalista e moderno
 * - Integração direta com painel admin de cores
 * - Ícones automáticos por seção
 * - Visual neutro e profissional
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { processTextWithGradient, getFirstColorFromGradient, hexToRgba } from '@/utils/textGradient';
import { getIconByName, DEFAULT_SECTION_ICONS } from '@/utils/sectionIcons';

interface SectionHeaderProps {
  badge: string;
  title: string;
  description: string;
  badgeGradient?: string;
  titleGradient?: string;
  className?: string;
  centered?: boolean;
  animated?: boolean;
  forceBadgeVisible?: boolean;
  icon?: React.ComponentType<any>;
  sectionKey?: string; // Chave da seção para extrair cores e ícones do admin
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
  // Buscar configurações direto do painel admin
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Sistema de badges completamente novo
  const createMinimalistBadge = () => {
    // Verificar se badges devem ser exibidos
    const badgeConfig = (configs && Array.isArray(configs)) 
      ? configs.find((c: any) => c.key === "show_badges")?.value as any 
      : { enabled: true };
    const shouldShowBadge = forceBadgeVisible || (badgeConfig?.enabled !== false);
    
    if (!shouldShowBadge) return null;

    // Extrair cores das configurações de seção
    const sectionColors = (configs && Array.isArray(configs))
      ? configs.find((c: any) => c.key === "section_colors")?.value
      : null;

    // Determinar cor do badge baseada na seção
    let badgeColor = '#6366f1'; // Cor neutra padrão (indigo-500)
    
    if (sectionKey && sectionColors && sectionColors[sectionKey]) {
      const sectionConfig = sectionColors[sectionKey];
      // Priorizar gradientColors[0] para consistência com o sistema admin
      if (sectionConfig.gradientColors && sectionConfig.gradientColors.length > 0) {
        badgeColor = sectionConfig.gradientColors[0];
      } else if (sectionConfig.backgroundColor) {
        badgeColor = sectionConfig.backgroundColor;
      }
    }

    // Obter ícone padrão da seção ou customizado
    let BadgeIcon = Icon;
    if (sectionKey && !BadgeIcon) {
      const defaultIconName = DEFAULT_SECTION_ICONS[sectionKey as keyof typeof DEFAULT_SECTION_ICONS];
      if (defaultIconName) {
        BadgeIcon = getIconByName(defaultIconName) || undefined;
      }
    }

    // Customização de ícone via admin (opcional)
    const customIconName = sectionKey && Array.isArray(configs) 
      ? configs.find((c: any) => c.key === `${sectionKey}_badge_icon`)?.value?.replace(/"/g, '') 
      : null;
    if (customIconName) {
      const CustomIcon = getIconByName(customIconName);
      if (CustomIcon) BadgeIcon = CustomIcon;
    }

    // Estilos minimalistas e neutros
    const badgeStyles = {
      backgroundColor: `${badgeColor}08`, // 3% opacity
      borderColor: `${badgeColor}20`, // 12% opacity
      color: badgeColor,
    };

    return (
      <div className="flex items-center justify-center mb-6">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium text-xs uppercase tracking-widest transition-all duration-200 hover:shadow-sm"
          style={badgeStyles}
        >
          {BadgeIcon && (
            <BadgeIcon 
              className="h-3 w-3 opacity-70" 
              style={{ color: badgeColor }} 
            />
          )}
          <span className="font-semibold text-[10px] tracking-[0.1em]">
            {badge}
          </span>
        </div>
      </div>
    );
  };

  const content = (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      {/* Badge redesenhado do zero */}
      {createMinimalistBadge()}
      
      {/* Título padronizado */}
      <h2 className={`font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-tight leading-tight mb-5`}>
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