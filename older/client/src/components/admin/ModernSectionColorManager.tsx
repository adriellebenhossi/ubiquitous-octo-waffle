/**
 * ModernSectionColorManager.tsx
 * 
 * Interface modernizada e intuitiva para personalização de cores por seção
 * Implementa design limpo, responsivo e com preview em tempo real
 * Melhoria solicitada: organização visual mais estética e intuitiva com dropdown
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Palette, Home, User, Briefcase, MessageSquare, HelpCircle, 
  Camera, Phone, Sparkles, Zap, Droplets, BookOpen, ChevronDown 
} from "lucide-react";
import type { SiteConfig } from "@shared/schema";

interface ModernSectionColorManagerProps {
  configs: SiteConfig[];
}

const sectionColorSchema = z.object({
  backgroundColor: z.string().min(1, "Cor de fundo é obrigatória"),
  backgroundType: z.enum(["solid", "gradient", "pattern"]),
  gradientDirection: z.string().optional(),
  gradientColors: z.array(z.string()).optional(),
  opacity: z.number().min(0).max(1),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  schedulingButtonColor: z.string().optional(),
  quoteIconColor: z.string().optional(),
});

type SectionColorForm = z.infer<typeof sectionColorSchema>;

// Função para obter cores padrão por seção
const getDefaultSectionColors = (sectionId: string) => {
  const defaults = {
    hero: {
      backgroundColor: "#ffffff",
      backgroundType: "pattern" as const,
      gradientColors: ["#f8fafc", "#e2e8f0"],
      gradientDirection: "to-br",
      opacity: 1,
      schedulingButtonColor: "#ec4899"
    },
    about: {
      backgroundColor: "#f9fafb",
      backgroundType: "pattern" as const,
      gradientColors: ["#f0f9ff", "#e0f2fe"],
      gradientDirection: "to-br",
      opacity: 1
    },
    services: {
      backgroundColor: "#ffffff",
      backgroundType: "pattern" as const,
      gradientColors: ["#fafbfc", "#f4f6f8"],
      gradientDirection: "to-br",
      opacity: 1
    },
    testimonials: {
      backgroundColor: "#fef7f0",
      backgroundType: "pattern" as const,
      gradientColors: ["#fef7f0", "#fed7aa"],
      gradientDirection: "to-br",
      opacity: 1
    },
    articles: {
      backgroundColor: "#f8fafc",
      backgroundType: "pattern" as const,
      gradientColors: ["#f1f5f9", "#e2e8f0"],
      gradientDirection: "to-br",
      opacity: 1
    },
    gallery: {
      backgroundColor: "#fdf4ff",
      backgroundType: "pattern" as const,
      gradientColors: ["#fdf4ff", "#f3e8ff"],
      gradientDirection: "to-br",
      opacity: 1
    },
    faq: {
      backgroundColor: "#f0fdf4",
      backgroundType: "pattern" as const,
      gradientColors: ["#f0fdf4", "#dcfce7"],
      gradientDirection: "to-br",
      opacity: 1
    },
    contact: {
      backgroundColor: "#fefce8",
      backgroundType: "pattern" as const,
      gradientColors: ["#fefce8", "#fef3c7"],
      gradientDirection: "to-br",
      opacity: 1
    },
    inspirational: {
      backgroundColor: "#fffbeb",
      backgroundType: "pattern" as const,
      gradientColors: ["#fffbeb", "#fed7aa"],
      gradientDirection: "to-br",
      opacity: 1
    }
  };
  
  return defaults[sectionId as keyof typeof defaults] || defaults.hero;
};

export function ModernSectionColorManager({ configs }: ModernSectionColorManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("hero");

  // Seções disponíveis com design moderno
  const sections = [
    { id: "hero", name: "Principal", icon: Home, color: "from-blue-500 to-cyan-500", description: "Primeira seção" },
    { id: "about", name: "Sobre", icon: User, color: "from-purple-500 to-pink-500", description: "Informações pessoais" },
    { id: "services", name: "Serviços", icon: Briefcase, color: "from-green-500 to-emerald-500", description: "Lista de atendimentos" },
    { id: "testimonials", name: "Depoimentos", icon: MessageSquare, color: "from-orange-500 to-red-500", description: "Avaliações de pacientes" },
    { id: "articles", name: "Artigos", icon: BookOpen, color: "from-blue-600 to-indigo-600", description: "Publicações científicas" },
    { id: "gallery", name: "Galeria", icon: Camera, color: "from-pink-500 to-rose-500", description: "Fotos do consultório" },
    { id: "faq", name: "Perguntas", icon: HelpCircle, color: "from-indigo-500 to-purple-500", description: "Dúvidas frequentes" },
    { id: "contact", name: "Contato", icon: Phone, color: "from-teal-500 to-green-500", description: "Informações de contato" },
    { id: "inspirational", name: "Citação", icon: Sparkles, color: "from-yellow-500 to-orange-500", description: "Frase inspiracional" },
  ];

  // Templates organizados por categoria
  const colorTemplates = {
    professional: {
      name: "🏢 Profissional",
      icon: Briefcase,
      templates: [
        { id: "clean-white", name: "Branco Limpo", color: "#ffffff", gradient: null, type: "solid" },
        { id: "soft-gray", name: "Cinza Suave", color: "#f8fafc", gradient: null, type: "solid" },
        { id: "trust-blue", name: "Azul Confiança", color: "#eff6ff", gradient: null, type: "solid" },
        { id: "calm-green", name: "Verde Calmo", color: "#f0fdf4", gradient: null, type: "solid" },
      ]
    },
    feminine: {
      name: "🌸 Feminino",
      icon: Sparkles,
      templates: [
        { id: "rose-petal", name: "Rosa Pétala", color: "#fdf2f8", gradient: null, type: "solid" },
        { id: "lavender-dream", name: "Lavanda", color: "#f3e8ff", gradient: null, type: "solid" },
        { id: "peach-soft", name: "Pêssego Suave", color: "#fff7ed", gradient: null, type: "solid" },
        { id: "mint-fresh", name: "Menta Fresca", color: "#f0fdfa", gradient: null, type: "solid" },
      ]
    },
    gradients: {
      name: "🎨 Gradientes",
      icon: Palette,
      templates: [
        { id: "sunset", name: "Pôr do Sol", color: null, gradient: ["#fef3c7", "#fde68a"], type: "gradient" },
        { id: "ocean", name: "Oceano", color: null, gradient: ["#f0f9ff", "#e0f2fe"], type: "gradient" },
        { id: "garden", name: "Jardim", color: null, gradient: ["#f0fdf4", "#dcfce7"], type: "gradient" },
        { id: "bloom", name: "Flor", color: null, gradient: ["#fce7f3", "#fbcfe8"], type: "gradient" },
      ]
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);

  const getSectionColors = () => {
    const config = configs.find(c => c.key === "section_colors");
    if (!config) return {};
    
    // Se já é um objeto, retorna diretamente
    if (typeof config.value === 'object') {
      return config.value;
    }
    
    // Se é string, faz parse
    try {
      return JSON.parse(config.value as string);
    } catch (error) {
      console.error('Erro ao fazer parse das cores das seções:', error);
      return {};
    }
  };

  const sectionColors = getSectionColors();
  const currentSectionColors = sectionColors[activeSection] || {};

  const form = useForm<SectionColorForm>({
    resolver: zodResolver(sectionColorSchema),
    defaultValues: {
      backgroundColor: currentSectionColors.backgroundColor || "#ffffff",
      backgroundType: currentSectionColors.backgroundType || "solid",
      gradientDirection: currentSectionColors.gradientDirection || "to-br",
      gradientColors: currentSectionColors.gradientColors || ["#ffffff", "#f8fafc"],
      opacity: currentSectionColors.opacity ?? 1,
      overlayColor: currentSectionColors.overlayColor || "#000000",
      overlayOpacity: currentSectionColors.overlayOpacity ?? 0,
      schedulingButtonColor: currentSectionColors.schedulingButtonColor || "#6366f1",
      quoteIconColor: currentSectionColors.quoteIconColor || "#ec4899",
    },
  });

  const watchedValues = form.watch();

  React.useEffect(() => {
    const currentSectionColors = sectionColors[activeSection] || {};
    form.reset({
      backgroundColor: currentSectionColors.backgroundColor || "#ffffff",
      backgroundType: currentSectionColors.backgroundType || "solid",
      gradientDirection: currentSectionColors.gradientDirection || "to-br",
      gradientColors: currentSectionColors.gradientColors || ["#ffffff", "#f8fafc"],
      opacity: currentSectionColors.opacity ?? 1,
      overlayColor: currentSectionColors.overlayColor || "#000000",
      overlayOpacity: currentSectionColors.overlayOpacity ?? 0,
      schedulingButtonColor: currentSectionColors.schedulingButtonColor || "#6366f1",
      quoteIconColor: currentSectionColors.quoteIconColor || "#ec4899",
    });
  }, [activeSection, sectionColors, form]);

  const updateSectionColors = useMutation({
    mutationFn: async ({ section, colors }: { section: string; colors: SectionColorForm }) => {
      console.log('🚀 MutationFn foi chamada!');
      console.log('🎨 Iniciando atualização de cores:', { section, colors });
      
      console.log('📋 Configs disponíveis:', configs);
      const sectionColorsConfig = configs.find(c => c.key === "section_colors");
      console.log('📋 Config section_colors encontrado:', sectionColorsConfig);
      
      let currentSectionColors: Record<string, any> = {};
      if (sectionColorsConfig) {
        if (typeof sectionColorsConfig.value === 'object' && sectionColorsConfig.value !== null) {
          currentSectionColors = sectionColorsConfig.value as Record<string, any>;
        } else {
          try {
            currentSectionColors = JSON.parse(sectionColorsConfig.value as string);
          } catch (e) {
            console.error('Erro no parse:', e);
            currentSectionColors = {};
          }
        }
      }
      
      console.log('📋 Current section colors:', currentSectionColors);
      
      const updatedSectionColors = {
        ...currentSectionColors,
        [section]: colors
      };

      console.log('📤 Enviando para API:', {
        key: "section_colors", 
        value: updatedSectionColors
      });

      try {
        console.log('🔍 Fazendo requisição para:', 'POST /api/admin/config');
        console.log('🔍 URL completa seria:', `${window.location.origin}/api/admin/config`);
        
        const response = await fetch('/api/admin/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: "section_colors",
            value: updatedSectionColors
          })
        });
        
        console.log('🔍 Status da resposta:', response.status);
        console.log('🔍 Response OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro HTTP:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Dados da API:', data);
        return updatedSectionColors;
      } catch (error) {
        console.error('💥 Erro na requisição:', error);
        if (error instanceof Error) {
          console.error('💥 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        throw error;
      }
    },
    onSuccess: (newSectionColors) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (old: SiteConfig[]) => {
        const filtered = old?.filter(config => config.key !== 'section_colors') || [];
        return [...filtered, { key: 'section_colors', value: newSectionColors }];
      });

      // Atualizar cache público
      queryClient.setQueryData(["/api/config"], (old: SiteConfig[]) => {
        const filtered = old?.filter(config => config.key !== 'section_colors') || [];
        return [...filtered, { key: 'section_colors', value: newSectionColors }];
      });

      toast({ 
        title: "🎨 Cores atualizadas!", 
        description: `Seção ${currentSection?.name} foi personalizada com sucesso`
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar cores:', error);
      toast({ 
        title: "Erro ao salvar cores", 
        description: "Houve um problema ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    },
  });

  const onSubmit = (data: SectionColorForm) => {
    console.log('🎯 Form onSubmit chamado com:', data);
    console.log('🎯 Active section:', activeSection);
    
    try {
      updateSectionColors.mutate({
        section: activeSection,
        colors: data
      });
    } catch (error) {
      console.error('🎯 Erro no onSubmit:', error);
    }
  };

  const applyTemplate = (template: any) => {
    if (template.type === "solid") {
      form.setValue("backgroundColor", template.color);
      form.setValue("backgroundType", "solid");
    } else if (template.type === "gradient") {
      form.setValue("backgroundType", "gradient");
      form.setValue("gradientColors", template.gradient);
      form.setValue("gradientDirection", "to-br");
    }
    form.setValue("opacity", 1);
  };

  return (
    <div className="space-y-8">
      {/* Header Modernizado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Personalização de Cores
            </h3>
            <p className="text-gray-600 mt-2">Interface intuitiva para configurar cores por seção com preview instantâneo</p>
          </div>
        </div>
      </div>

      {/* Seletor de Seção Modernizado */}
      <div className="mb-8">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Personalizar Cores por Seção
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Escolha a seção e configure suas cores únicas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Dropdown de Seleção de Seções */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-700">
                  Seção para Personalizar
                </label>
                <Select value={activeSection} onValueChange={setActiveSection}>
                  <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const currentSection = sections.find(s => s.id === activeSection);
                        const Icon = currentSection?.icon;
                        return (
                          <>
                            {Icon && (
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${currentSection.color} text-white shadow-sm`}>
                                <Icon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800">{currentSection?.name}</div>
                              <div className="text-xs text-gray-500">{currentSection?.description}</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const hasCustomColors = getSectionColors()[section.id];
                      
                      return (
                        <SelectItem 
                          key={section.id} 
                          value={section.id}
                          className="flex items-center p-3 hover:bg-purple-50 focus:bg-purple-50 rounded-lg cursor-pointer border border-transparent hover:border-purple-200 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 w-full">
                            {/* Ícone com gradiente */}
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} text-white shadow-sm flex-shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm">{section.name}</div>
                              <div className="text-xs text-gray-600">{section.description}</div>
                            </div>
                            
                            {/* Badge de personalização */}
                            {hasCustomColors && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200 flex-shrink-0">
                                <Sparkles className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Custom</span>
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor de Cores Modernizado */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            {currentSection && React.createElement(currentSection.icon, { className: "w-5 h-5" })}
            Editando: {currentSection?.name}
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure cores, gradientes e transparências
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Templates Rápidos com Grid Moderno */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Templates Rápidos
                </h4>
                
                <Tabs defaultValue="professional" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
                    {Object.entries(colorTemplates).map(([key, category]) => (
                      <TabsTrigger 
                        key={key} 
                        value={key}
                        className="flex items-center gap-1 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <category.icon className="w-3 h-3" />
                        {category.name.split(' ')[1]}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(colorTemplates).map(([key, category]) => (
                    <TabsContent key={key} value={key} className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.templates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="group p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-inner flex-shrink-0"
                                style={{
                                  background: template.type === 'gradient' 
                                    ? `linear-gradient(135deg, ${template.gradient?.[0]}, ${template.gradient?.[1]})`
                                    : (template.color || "#ffffff")
                                }}
                              ></div>
                              <div className="text-left flex-1">
                                <div className="font-medium text-sm text-gray-800 group-hover:text-purple-700 transition-colors">
                                  {template.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {template.type === 'gradient' ? 'Gradiente suave' : 'Cor sólida'}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Configuração Personalizada - SISTEMA REFATORADO */}
              <div className="space-y-6 border-t pt-6">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h5 className="font-semibold text-base">Configuração Personalizada</h5>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Configure cores, gradientes e transparências para esta seção
                </p>

                {/* Tipo de Fundo com Cards Visuais */}
                <FormField
                  control={form.control}
                  name="backgroundType"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-medium">Tipo de Fundo</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Cor Sólida */}
                          <div 
                            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                              field.value === "solid" 
                                ? "border-purple-500 bg-purple-50 shadow-sm" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => field.onChange("solid")}
                          >
                            <div className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 mb-3"></div>
                            <div className="text-center">
                              <div className="font-medium text-sm">Cor Sólida</div>
                              <div className="text-xs text-muted-foreground">Uma cor única</div>
                            </div>
                            {field.value === "solid" && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Gradiente */}
                          <div 
                            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                              field.value === "gradient" 
                                ? "border-purple-500 bg-purple-50 shadow-sm" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => field.onChange("gradient")}
                          >
                            <div className="w-full h-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 mb-3"></div>
                            <div className="text-center">
                              <div className="font-medium text-sm">Gradiente</div>
                              <div className="text-xs text-muted-foreground">Transição de cores</div>
                            </div>
                            {field.value === "gradient" && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Padrão */}
                          <div 
                            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                              field.value === "pattern" 
                                ? "border-purple-500 bg-purple-50 shadow-sm" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              field.onChange("pattern");
                              // Restaurar cores padrão automaticamente
                              const defaultColors = getDefaultSectionColors(activeSection);
                              form.setValue("backgroundColor", defaultColors.backgroundColor);
                              form.setValue("gradientColors", defaultColors.gradientColors);
                              form.setValue("gradientDirection", defaultColors.gradientDirection);
                              form.setValue("opacity", defaultColors.opacity);
                            }}
                          >
                            <div className="w-full h-12 rounded-lg bg-gradient-to-r from-gray-100 to-white border-2 border-dashed border-gray-300 mb-3 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">PADRÃO</span>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-sm">Padrão</div>
                              <div className="text-xs text-muted-foreground">Cor original do site</div>
                            </div>
                            {field.value === "pattern" && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Configurações para Cor Sólida */}
                {watchedValues.backgroundType === "solid" && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <h6 className="font-medium text-blue-900">Configuração da Cor Sólida</h6>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione a Cor</FormLabel>
                          <div className="space-y-3">
                            {/* Preview da cor */}
                            <div 
                              className="w-full h-16 rounded-lg border-2 border-gray-200 shadow-sm"
                              style={{ backgroundColor: field.value }}
                            ></div>
                            
                            {/* Seletor de cor */}
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <Input 
                                  type="color" 
                                  className="w-16 h-12 border-2 border-gray-200 rounded-lg cursor-pointer" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormControl>
                                <Input 
                                  placeholder="#ffffff" 
                                  className="flex-1 font-mono text-sm"
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Configurações para Gradiente */}
                {watchedValues.backgroundType === "gradient" && (
                  <div className="space-y-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-pink-500 to-purple-500"></div>
                      <h6 className="font-medium text-purple-900">Configuração do Gradiente</h6>
                    </div>

                    {/* Preview do gradiente */}
                    <div 
                      className="w-full h-20 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{
                        background: `linear-gradient(${watchedValues.gradientDirection || "to-br"}, ${watchedValues.gradientColors?.[0] || "#ec4899"}, ${watchedValues.gradientColors?.[1] || "#8b5cf6"})`
                      }}
                    ></div>

                    {/* Direção do gradiente */}
                    <FormField
                      control={form.control}
                      name="gradientDirection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Direção do Gradiente</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { value: "to-r", label: "→", name: "Direita" },
                                { value: "to-l", label: "←", name: "Esquerda" },
                                { value: "to-b", label: "↓", name: "Baixo" },
                                { value: "to-t", label: "↑", name: "Cima" },
                                { value: "to-br", label: "↘", name: "Diagonal DR" },
                                { value: "to-bl", label: "↙", name: "Diagonal DL" },
                                { value: "to-tr", label: "↗", name: "Diagonal UR" },
                                { value: "to-tl", label: "↖", name: "Diagonal UL" },
                              ].map((direction) => (
                                <div
                                  key={direction.value}
                                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all hover:shadow-sm ${
                                    field.value === direction.value
                                      ? "border-purple-500 bg-purple-100 text-purple-700"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                  onClick={() => field.onChange(direction.value)}
                                >
                                  <div className="text-xl font-bold">{direction.label}</div>
                                  <div className="text-xs mt-1">{direction.name}</div>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Cores do gradiente */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <FormLabel className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: watchedValues.gradientColors?.[0] || "#ec4899" }}></div>
                          Cor Inicial
                        </FormLabel>
                        <div className="space-y-2">
                          <div 
                            className="w-full h-12 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: watchedValues.gradientColors?.[0] || "#ec4899" }}
                          ></div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 border-2 border-gray-200 rounded cursor-pointer"
                              value={watchedValues.gradientColors?.[0] || "#ec4899"}
                              onChange={(e) => {
                                const current = form.getValues("gradientColors") || [];
                                form.setValue("gradientColors", [e.target.value, current[1] || "#8b5cf6"]);
                              }}
                            />
                            <Input
                              placeholder="#ec4899"
                              className="flex-1 font-mono text-sm"
                              value={watchedValues.gradientColors?.[0] || "#ec4899"}
                              onChange={(e) => {
                                const current = form.getValues("gradientColors") || [];
                                form.setValue("gradientColors", [e.target.value, current[1] || "#8b5cf6"]);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <FormLabel className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: watchedValues.gradientColors?.[1] || "#8b5cf6" }}></div>
                          Cor Final
                        </FormLabel>
                        <div className="space-y-2">
                          <div 
                            className="w-full h-12 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: watchedValues.gradientColors?.[1] || "#8b5cf6" }}
                          ></div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 border-2 border-gray-200 rounded cursor-pointer"
                              value={watchedValues.gradientColors?.[1] || "#8b5cf6"}
                              onChange={(e) => {
                                const current = form.getValues("gradientColors") || [];
                                form.setValue("gradientColors", [current[0] || "#ec4899", e.target.value]);
                              }}
                            />
                            <Input
                              placeholder="#8b5cf6"
                              className="flex-1 font-mono text-sm"
                              value={watchedValues.gradientColors?.[1] || "#8b5cf6"}
                              onChange={(e) => {
                                const current = form.getValues("gradientColors") || [];
                                form.setValue("gradientColors", [current[0] || "#ec4899", e.target.value]);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configurações para Padrão */}
                {watchedValues.backgroundType === "pattern" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400 bg-white"></div>
                      <h6 className="font-medium text-gray-700">Cores Padrão do Site</h6>
                    </div>
                    
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-100 to-white border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">ORIGINAL</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        As cores originais programadas do site serão aplicadas
                      </p>
                      <p className="text-xs text-gray-500">
                        Esta opção restaura automaticamente as configurações padrão desta seção
                      </p>
                    </div>
                  </div>
                )}

                {/* Campo específico para cor do botão de agendamento */}
                {activeSection === "hero" && (
                  <div className="space-y-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <h6 className="font-medium text-orange-900">Botão de Agendamento</h6>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="schedulingButtonColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor do botão "Agendar consulta"</FormLabel>
                          <div className="space-y-3">
                            {/* Preview do botão */}
                            <div className="flex justify-center">
                              <div 
                                className="px-6 py-3 rounded-lg text-white font-medium shadow-sm"
                                style={{ backgroundColor: field.value }}
                              >
                                Agendar Consulta
                              </div>
                            </div>
                            
                            {/* Seletor de cor */}
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <Input 
                                  type="color" 
                                  className="w-16 h-12 border-2 border-gray-200 rounded-lg cursor-pointer" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormControl>
                                <Input 
                                  placeholder="#ec4899" 
                                  className="flex-1 font-mono text-sm"
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                          </div>
                          <FormDescription className="text-xs">
                            Define a cor do botão principal de agendamento na seção Hero
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Campo específico para cor do ícone da citação */}
                {activeSection === "inspirational" && (
                  <div className="space-y-4 p-4 border-2 border-yellow-300 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-yellow-700 font-medium">
                      🎯 Seção Citação Ativa - Campo Especial
                    </div>
                    <FormField
                      control={form.control}
                      name="quoteIconColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-yellow-800">
                            🎨 Cor do Ícone da Citação
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                {...field}
                                className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-inner"
                              />
                              <Input
                                {...field}
                                placeholder="#ec4899"
                                className="flex-1 bg-white border-2 border-gray-200 focus:border-purple-400"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="opacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Transparência: {Math.round(field.value * 100)}%
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="btn-admin px-8 py-3 w-full sm:w-auto"
                    disabled={updateSectionColors.isPending}
                  >
                    {updateSectionColors.isPending ? "Salvando..." : "Aplicar cores"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}