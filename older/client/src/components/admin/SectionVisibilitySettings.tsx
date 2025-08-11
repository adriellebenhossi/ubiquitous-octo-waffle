/**
 * SectionVisibilitySettings.tsx
 * 
 * Interface moderna e minimalista para gerenciar visibilidade das seções
 * Design estético com gradientes suaves e animações
 */

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, ChevronUp, ChevronDown, GripVertical, Home, User, Star, FileText, Camera, Settings, MessageCircle, HelpCircle, Phone, Heart, Sparkles, Layout } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Configuração estética com design neutro e minimalista
const sectionConfig = {
  hero: { 
    icon: Home, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  about: { 
    icon: User, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  specialties: { 
    icon: Star, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  articles: { 
    icon: FileText, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  gallery: { 
    icon: Camera, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  services: { 
    icon: Settings, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  testimonials: { 
    icon: MessageCircle, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  faq: { 
    icon: HelpCircle, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  contact: { 
    icon: Phone, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  },
  inspirational: { 
    icon: Heart, 
    gradient: "from-gray-100/10 via-gray-50/10 to-gray-100/10",
    background: "bg-gray-50/60 dark:bg-gray-800/30",
    border: "border-gray-200/40 dark:border-gray-700/40", 
    iconColor: "text-gray-500 dark:text-gray-400",
    glow: "shadow-gray-200/10"
  }
};

// Interface dos dados das seções 
interface SectionData {
  key: string;
  name: string;
  description: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

// Componente estético com design moderno e minimalista
function SortableSectionItem({ section, onToggleVisibility, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: {
  section: SectionData;
  onToggleVisibility: (key: string, visible: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const config = sectionConfig[section.key as keyof typeof sectionConfig];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-4 overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] ${
        config?.background || 'bg-white/80 dark:bg-gray-900/80'
      } ${
        config?.border || 'border-gray-200/50 dark:border-gray-800/50'
      } ${
        isDragging ? `shadow-2xl ${config?.glow} ring-2 ring-offset-2 ring-blue-500/30` : `hover:shadow-xl ${config?.glow}`
      }`}
    >
      {/* Layout Desktop - Padrão uniforme e limpo */}
      <div className="hidden sm:flex items-center gap-3 p-4">
        {/* Drag Handle - Padrão */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100 transition-colors"
          title="Arraste para reordenar"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Controles de movimento - Padrão uniforme */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-6 w-6 p-0"
            title="Mover para cima"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-6 w-6 p-0"
            title="Mover para baixo"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Ícone da seção - Compacto */}
        <div className={`relative p-3 rounded-xl ${config?.background} border ${config?.border}`}>
          {(() => {
            const IconComponent = config?.icon;
            return IconComponent ? (
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            ) : null;
          })()}
          {section.isVisible && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {section.name}
            </h3>
            <Badge 
              variant={section.isVisible ? "default" : "secondary"} 
              className={`text-xs px-2 py-0.5 rounded-full ${
                section.isVisible 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {section.isVisible ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {section.description}
          </p>
        </div>

        {/* Toggle de visibilidade - Padrão limpo */}
        <div className="flex items-center gap-2">
          {section.isVisible ? (
            <Eye className="w-4 h-4 text-emerald-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
          <Switch 
            checked={section.isVisible} 
            onCheckedChange={(checked) => onToggleVisibility(section.key, checked)}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      {/* Layout Mobile - Elegante e minimalista */}
      <div className="sm:hidden p-4 space-y-4">
        {/* Cabeçalho da seção - Mobile */}
        <div className="flex items-center gap-4">
          <div className={`relative p-3 rounded-xl shadow-sm ${config?.background} border ${config?.border}`}>
            {(() => {
              const IconComponent = config?.icon;
              return IconComponent ? (
                <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
              ) : null;
            })()}
            {section.isVisible && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm animate-pulse"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {section.name}
              </h3>
              <Badge 
                variant={section.isVisible ? "default" : "secondary"} 
                className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                  section.isVisible 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {section.isVisible ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {section.description}
            </p>
          </div>
        </div>

        {/* Divisor elegante */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

        {/* Controles - Mobile elegantes */}
        <div className="space-y-3">
          {/* Toggle de visibilidade - Mobile premium */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              {section.isVisible ? (
                <Eye className="w-4 h-4 text-emerald-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {section.isVisible ? 'seção visível' : 'seção oculta'}
              </span>
            </div>
            <Switch 
              checked={section.isVisible} 
              onCheckedChange={(checked) => onToggleVisibility(section.key, checked)}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Controles de movimento - Mobile elegantes */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-11 rounded-xl font-medium transition-all duration-300 disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-gray-200/60 dark:border-gray-700/60"
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              Subir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-11 rounded-xl font-medium transition-all duration-300 disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-gray-200/60 dark:border-gray-700/60"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Descer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionVisibilitySettings({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const sectionVisibilityConfig = configs.find(c => c.key === 'section_visibility')?.value as Record<string, boolean> || {};
  const sectionOrderConfig = configs.find(c => c.key === 'section_order')?.value as Record<string, number> || {};

  // Sensores otimizados APENAS para desktop (mobile usa apenas setas)
  const sensors = useSensors(
    // TouchSensor removido - mobile não precisa de drag-and-drop
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Apenas para desktop
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Definir todas as seções disponíveis
  const allSections = [
    {
      key: 'hero',
      name: 'Seção principal (hero)',
      description: 'Primeiro contato com os visitantes - foto, nome e call-to-action',
      icon: 'Home'
    },
    {
      key: 'about', 
      name: 'Sobre mim',
      description: 'Apresentação profissional, credenciais e especialidades',
      icon: 'User'
    },
    {
      key: 'specialties',
      name: 'Especialidades',
      description: 'Áreas de atuação e especialidades',
      icon: 'Star'
    },
    {
      key: 'articles',
      name: 'Artigos científicos',
      description: 'Publicações acadêmicas, pesquisas e artigos científicos',
      icon: 'FileText'
    },
    {
      key: 'gallery',
      name: 'Galeria de fotos',
      description: 'Carrossel com fotos do consultório e ambiente',
      icon: 'Camera'
    },
    {
      key: 'services',
      name: 'Meus serviços', 
      description: 'Lista dos tipos de atendimento oferecidos',
      icon: 'Settings'
    },
    {
      key: 'testimonials',
      name: 'Depoimentos',
      description: 'Avaliações e feedback dos pacientes',
      icon: 'MessageCircle'
    },
    {
      key: 'faq',
      name: 'Perguntas frequentes',
      description: 'Respostas para dúvidas comuns sobre os serviços',
      icon: 'HelpCircle'
    },
    {
      key: 'contact',
      name: 'Contato e agendamento',
      description: 'Botões de contato, horários e informações para agendamento',
      icon: 'Phone'
    },
    {
      key: 'inspirational',
      name: 'Frase autoral',
      description: 'Citação inspiracional personalizada para engajamento dos visitantes',
      icon: 'Heart'
    }
  ];

  // Criar dados das seções com visibilidade e ordem
  const [localSections, setLocalSections] = useState<SectionData[]>([]);
  
  useEffect(() => {
    const sectionsData: SectionData[] = allSections.map(section => ({
      ...section,
      isVisible: sectionVisibilityConfig[section.key] ?? true,
      order: sectionOrderConfig[section.key] ?? 999
    })).sort((a, b) => a.order - b.order);
    
    setLocalSections(sectionsData);
  }, [configs]);

  // Mutações para atualizar configurações
  const updateSectionVisibility = useMutation({
    mutationFn: async (data: { key: string; visible: boolean }) => {
      console.log("🔄 SectionVisibility - Atualizando visibilidade:", data);
      const newVisibility = { ...sectionVisibilityConfig, [data.key]: data.visible };
      const response = await apiRequest("POST", "/api/admin/config", {
        key: 'section_visibility',
        value: newVisibility
      });
      return response.json();
    },
    onSuccess: (response, variables) => {
      console.log("✅ SectionVisibility - Visibilidade atualizada com sucesso");
      
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const newVisibility = { ...sectionVisibilityConfig, [variables.key]: variables.visible };
        const existingIndex = oldData.findIndex((config: any) => config.key === "section_visibility");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: newVisibility }
              : config
          );
        } else {
          return [...oldData, { key: "section_visibility", value: newVisibility }];
        }
      });
      
      // Atualizar cache público
      queryClient.setQueryData(["/api/config"], (oldData: any[] = []) => {
        const newVisibility = { ...sectionVisibilityConfig, [variables.key]: variables.visible };
        const existingIndex = oldData.findIndex((config: any) => config.key === "section_visibility");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: newVisibility }
              : config
          );
        } else {
          return [...oldData, { key: "section_visibility", value: newVisibility }];
        }
      });
      
      toast({ title: "Visibilidade da seção atualizada!" });
    },
    onError: (error) => {
      console.error("❌ SectionVisibility - Erro ao atualizar visibilidade:", error);
      toast({ 
        title: "Erro ao atualizar visibilidade",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  });

  const updateSectionOrder = useMutation({
    mutationFn: async (newOrder: Record<string, number>) => {
      console.log("🔄 SectionOrder - Atualizando ordem:", newOrder);
      const response = await apiRequest("POST", "/api/admin/config", {
        key: 'section_order',
        value: newOrder
      });
      return response.json();
    },
    onSuccess: (response, newOrder) => {
      console.log("✅ SectionOrder - Ordem atualizada com sucesso");
      
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const existingIndex = oldData.findIndex((config: any) => config.key === "section_order");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: newOrder }
              : config
          );
        } else {
          return [...oldData, { key: "section_order", value: newOrder }];
        }
      });
      
      // Atualizar cache público
      queryClient.setQueryData(["/api/config"], (oldData: any[] = []) => {
        const existingIndex = oldData.findIndex((config: any) => config.key === "section_order");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: newOrder }
              : config
          );
        } else {
          return [...oldData, { key: "section_order", value: newOrder }];
        }
      });
      
      toast({ title: "Ordem das seções atualizada!" });
    },
    onError: (error) => {
      console.error("❌ SectionOrder - Erro ao atualizar ordem:", error);
      toast({ 
        title: "Erro ao atualizar ordem",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  });

  const handleToggleVisibility = (key: string, visible: boolean) => {
    updateSectionVisibility.mutate({ key, visible });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      console.log("🔄 Drag End - Moving:", active.id, "to position of:", over.id);
      
      const oldIndex = localSections.findIndex(section => section.key === active.id);
      const newIndex = localSections.findIndex(section => section.key === over.id);
      
      console.log("📍 Indexes - Old:", oldIndex, "New:", newIndex);
      
      const reorderedSections = arrayMove(localSections, oldIndex, newIndex);
      setLocalSections(reorderedSections);
      
      const newOrder: Record<string, number> = {};
      reorderedSections.forEach((section, index) => {
        newOrder[section.key] = index;
      });
      
      console.log("💾 New Order Config:", newOrder);
      updateSectionOrder.mutate(newOrder);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      console.log("⬆️ Moving Up - Section:", localSections[index].key, "from index:", index, "to:", index - 1);
      
      const newSections = [...localSections];
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      setLocalSections(newSections);
      
      const newOrder: Record<string, number> = {};
      newSections.forEach((section, idx) => {
        newOrder[section.key] = idx;
      });
      
      console.log("💾 New Order Config (Move Up):", newOrder);
      updateSectionOrder.mutate(newOrder);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < localSections.length - 1) {
      console.log("⬇️ Moving Down - Section:", localSections[index].key, "from index:", index, "to:", index + 1);
      
      const newSections = [...localSections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setLocalSections(newSections);
      
      const newOrder: Record<string, number> = {};
      newSections.forEach((section, idx) => {
        newOrder[section.key] = idx;
      });
      
      console.log("💾 New Order Config (Move Down):", newOrder);
      updateSectionOrder.mutate(newOrder);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
            <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Visibilidade das seções
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Controle a exibição e ordem das seções do seu site
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Dica elegante */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="relative p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Personalização inteligente</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                <span className="hidden sm:inline">Arraste e solte as seções ou use as setas para reordenar.</span>
                <span className="sm:hidden">Use os botões para reordenar as seções.</span>
                {' '}Os switches controlam a visibilidade instantaneamente.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de seções com spacing elegante */}
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localSections.map(s => s.key)} strategy={verticalListSortingStrategy}>
              {localSections.map((section, index) => (
                <SortableSectionItem
                  key={section.key}
                  section={section}
                  onToggleVisibility={handleToggleVisibility}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  canMoveUp={index > 0}
                  canMoveDown={index < localSections.length - 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Rodapé informativo */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            {localSections.filter(s => s.isVisible).length} de {localSections.length} seções ativas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}