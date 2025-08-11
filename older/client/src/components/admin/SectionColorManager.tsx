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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Palette, Home, User, Briefcase, MessageSquare, HelpCircle, Camera, Phone, Sparkles, Calendar } from "lucide-react";
import type { SiteConfig } from "@shared/schema";

interface SectionColorManagerProps {
  configs: SiteConfig[];
}

export function SectionColorManager({ configs }: SectionColorManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Debug log para verificar se o componente novo está carregando
  React.useEffect(() => {
    console.log("🔄 SectionColorManager NOVO carregado - Sistema refatorado ativo!");
  }, []);

  // Obtém as configurações de cores das seções
  const getSectionColors = () => {
    const sectionColorsConfig = configs?.find(c => c.key === 'section_colors')?.value as any || {};
    return sectionColorsConfig;
  };

  // Obtém configuração do botão de agendamento
  const getSchedulingButtonColor = () => {
    const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};
    return generalInfo.schedulingButtonColor || "#ec4899";
  };

  // Cores padrão para cada seção (originais do site)
  const getDefaultSectionColors = (section: string) => {
    const defaultColors: Record<string, any> = {
      hero: {
        backgroundColor: "#fff7ed",
        backgroundType: "solid",
        gradientDirection: "to-br",
        gradientColors: ["#ec4899", "#8b5cf6"],
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      },
      about: {
        backgroundColor: "#f8fafc",
        backgroundType: "solid", 
        gradientDirection: "to-br",
        gradientColors: ["#f0f9ff", "#e0f2fe"],
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      },
      services: {
        backgroundColor: "#ffffff",
        backgroundType: "solid",
        gradientDirection: "to-br", 
        gradientColors: ["#fdf2f8", "#f3e8ff"],
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      },
      testimonials: {
        backgroundColor: "#f9fafb",
        backgroundType: "solid",
        gradientDirection: "to-br",
        gradientColors: ["#f0fdf4", "#dcfce7"], 
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      },
      contact: {
        backgroundColor: "#ffffff",
        backgroundType: "solid",
        gradientDirection: "to-br",
        gradientColors: ["#fff7ed", "#fed7aa"],
        opacity: 1,
        overlayColor: "#000000", 
        overlayOpacity: 0,
      },
      faq: {
        backgroundColor: "#f8fafc",
        backgroundType: "solid",
        gradientDirection: "to-br",
        gradientColors: ["#f0f9ff", "#dbeafe"],
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      },
      articles: {
        backgroundColor: "#ffffff",
        backgroundType: "solid",
        gradientDirection: "to-br", 
        gradientColors: ["#fef3c7", "#fde68a"],
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      },
      inspirational: {
        backgroundColor: "#f8fafc",
        backgroundType: "solid",
        gradientDirection: "to-br",
        gradientColors: ["#faf5ff", "#f3e8ff"],
        opacity: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
      }
    };

    return defaultColors[section] || defaultColors.hero;
  };

  const sectionColorSchema = z.object({
    backgroundColor: z.string().min(1, "Cor de fundo é obrigatória"),
    backgroundType: z.enum(["solid", "gradient", "pattern"]),
    gradientDirection: z.string().optional(),
    gradientColors: z.array(z.string()).optional(),
    opacity: z.number().min(0).max(1),
    overlayColor: z.string().optional(),
    overlayOpacity: z.number().min(0).max(1).optional(),
    schedulingButtonColor: z.string().optional(),
  });

  type SectionColorForm = z.infer<typeof sectionColorSchema>;

  const form = useForm<SectionColorForm>({
    resolver: zodResolver(sectionColorSchema),
    defaultValues: {
      backgroundColor: "#ffffff",
      backgroundType: "solid",
      gradientDirection: "to-br",
      gradientColors: ["#ec4899", "#8b5cf6"],
      opacity: 1,
      overlayColor: "#000000",
      overlayOpacity: 0,
      schedulingButtonColor: getSchedulingButtonColor(),
    },
  });

  // Seções disponíveis para personalização
  const sections = [
    {
      id: "hero",
      name: "Seção Hero",
      icon: Home,
      description: "Seção principal com foto e botões",
      hasSchedulingButton: true
    },
    {
      id: "about",
      name: "Seção Sobre",
      icon: User,
      description: "Informações sobre a psicóloga"
    },
    {
      id: "services",
      name: "Seção Serviços",
      icon: Briefcase,
      description: "Lista de serviços oferecidos"
    },
    {
      id: "testimonials",
      name: "Seção Depoimentos",
      icon: MessageSquare,
      description: "Avaliações de pacientes"
    },
    {
      id: "gallery",
      name: "Seção Galeria",
      icon: Camera,
      description: "Carrossel de fotos do consultório"
    },
    {
      id: "faq",
      name: "Seção FAQ",
      icon: HelpCircle,
      description: "Perguntas frequentes"
    },
    {
      id: "contact",
      name: "Seção Contato",
      icon: Phone,
      description: "Informações de contato e agendamento"
    },
    {
      id: "inspirational",
      name: "Seção Citação",
      icon: Sparkles,
      description: "Citação inspiracional"
    },
  ];

  // Templates de cores pré-definidos
  const colorTemplates = {
    professional: {
      name: "Profissional",
      templates: [
        {
          id: "white-pure",
          name: "Branco Puro",
          backgroundColor: "#ffffff",
          backgroundType: "solid" as const,
          opacity: 1,
        },
        {
          id: "gray-light",
          name: "Cinza Claro",
          backgroundColor: "#f8fafc",
          backgroundType: "solid" as const,
          opacity: 1,
        },
        {
          id: "blue-soft",
          name: "Azul Suave",
          backgroundColor: "#eff6ff",
          backgroundType: "solid" as const,
          opacity: 1,
        },
      ]
    },
    feminine: {
      name: "Feminino",
      templates: [
        {
          id: "pink-baby",
          name: "Rosa Bebê",
          backgroundColor: "#fdf2f8",
          backgroundType: "solid" as const,
          opacity: 1,
        },
        {
          id: "lavender",
          name: "Lavanda",
          backgroundColor: "#f3e8ff",
          backgroundType: "solid" as const,
          opacity: 1,
        },
        {
          id: "peach",
          name: "Pêssego",
          backgroundColor: "#fff7ed",
          backgroundType: "solid" as const,
          opacity: 1,
        },
      ]
    },
    services: {
      name: "Profissional - Serviços",
      templates: [
        {
          id: "clean-white",
          name: "Branco Limpo",
          backgroundColor: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#ffffff", "#f8fafc"],
          opacity: 1,
        },
        {
          id: "trust-blue",
          name: "Azul Confiança",
          backgroundColor: "linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#f0f9ff", "#dbeafe"],
          opacity: 1,
        },
        {
          id: "calm-green",
          name: "Verde Calmo",
          backgroundColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#f0fdf4", "#dcfce7"],
          opacity: 1,
        },
        {
          id: "warm-gray",
          name: "Cinza Acolhedor",
          backgroundColor: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#f9fafb", "#f3f4f6"],
          opacity: 1,
        },
        {
          id: "soft-beige",
          name: "Bege Suave",
          backgroundColor: "linear-gradient(135deg, #fefcfb 0%, #fef7ed 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#fefcfb", "#fef7ed"],
          opacity: 1,
        },
      ]
    },
    gradients: {
      name: "Gradientes Decorativos",
      templates: [
        {
          id: "pink-purple",
          name: "Rosa para Roxo",
          backgroundColor: "linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#fdf2f8", "#f3e8ff"],
          opacity: 1,
        },
        {
          id: "blue-sky",
          name: "Azul Céu",
          backgroundColor: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#dbeafe", "#e0f2fe"],
          opacity: 1,
        },
        {
          id: "sunset-warm",
          name: "Sunset Warm",
          backgroundColor: "linear-gradient(135deg, #fed7aa 0%, #fecaca 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#fed7aa", "#fecaca"],
          opacity: 1,
        },
        {
          id: "nature-fresh",
          name: "Nature Fresh",
          backgroundColor: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#dcfce7", "#d1fae5"],
          opacity: 1,
        },
        {
          id: "ocean-breeze",
          name: "Ocean Breeze",
          backgroundColor: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#e0f7fa", "#b2ebf2"],
          opacity: 1,
        },
        {
          id: "mint-fresh",
          name: "Mint Fresh",
          backgroundColor: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#f0fdfa", "#ccfbf1"],
          opacity: 1,
        },
        {
          id: "royal-purple",
          name: "Royal Purple",
          backgroundColor: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#f3e8ff", "#e9d5ff"],
          opacity: 1,
        },
        {
          id: "golden-hour",
          name: "Golden Hour",
          backgroundColor: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#fef3c7", "#fde68a"],
          opacity: 1,
        },
        {
          id: "cherry-blossom",
          name: "Cherry Blossom",
          backgroundColor: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#fce7f3", "#fbcfe8"],
          opacity: 1,
        },
        {
          id: "arctic-blue",
          name: "Arctic Blue",
          backgroundColor: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#f0f9ff", "#e0f2fe"],
          opacity: 1,
        },
        {
          id: "warm-embrace",
          name: "Warm Embrace",
          backgroundColor: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#fff7ed", "#fed7aa"],
          opacity: 1,
        },
        {
          id: "soft-lavender",
          name: "Soft Lavender",
          backgroundColor: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
          backgroundType: "gradient" as const,
          gradientDirection: "to-br",
          gradientColors: ["#faf5ff", "#f3e8ff"],
          opacity: 1,
        },
      ]
    }
  };

  // Carrega as cores da seção ativa
  React.useEffect(() => {
    const sectionColors = getSectionColors();
    const currentSectionColors = sectionColors[activeSection] || {};

    form.reset({
      backgroundColor: currentSectionColors.backgroundColor || "#ffffff",
      backgroundType: currentSectionColors.backgroundType || "solid",
      gradientDirection: currentSectionColors.gradientDirection || "to-br",
      gradientColors: currentSectionColors.gradientColors || ["#ec4899", "#8b5cf6"],
      opacity: currentSectionColors.opacity || 1,
      overlayColor: currentSectionColors.overlayColor || "#000000",
      overlayOpacity: currentSectionColors.overlayOpacity || 0,
      schedulingButtonColor: getSchedulingButtonColor(),
    });

    setSelectedTemplate(null);
  }, [activeSection, configs, form]);

  const updateSectionColorsMutation = useMutation({
    mutationFn: async (data: { section: string; colors: SectionColorForm }) => {
      const currentSectionColors = getSectionColors();
      const newSectionColors = {
        ...currentSectionColors,
        [data.section]: {
          backgroundColor: data.colors.backgroundColor,
          backgroundType: data.colors.backgroundType,
          gradientDirection: data.colors.gradientDirection,
          gradientColors: data.colors.gradientColors,
          opacity: data.colors.opacity,
          overlayColor: data.colors.overlayColor,
          overlayOpacity: data.colors.overlayOpacity,
        }
      };

      await apiRequest("POST", "/api/admin/config", {
        key: "section_colors",
        value: newSectionColors
      });

      // Se for seção hero, também atualiza a cor do botão
      if (data.section === "hero" && data.colors.schedulingButtonColor) {
        const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};
        await apiRequest("POST", "/api/admin/config", {
          key: "general_info",
          value: {
            ...generalInfo,
            schedulingButtonColor: data.colors.schedulingButtonColor,
          }
        });
      }

      // Aplica as cores dinamicamente
      applySectionColorsToSite(data.section, data.colors);
    },
    onSuccess: (response, { section, colors }) => {
      // Atualizar configurações de cores da seção
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const filtered = old.filter(config => config.key !== 'section_colors');
        const currentSectionColors = getSectionColors();
        const newSectionColors = {
          ...currentSectionColors,
          [section]: {
            backgroundColor: colors.backgroundColor,
            backgroundType: colors.backgroundType,
            gradientDirection: colors.gradientDirection,
            gradientColors: colors.gradientColors,
            opacity: colors.opacity,
            overlayColor: colors.overlayColor,
            overlayOpacity: colors.overlayOpacity,
          }
        };
        return [...filtered, { key: 'section_colors', value: newSectionColors }];
      });

      // Se for seção hero, atualizar também a cor do botão
      if (section === "hero" && colors.schedulingButtonColor) {
        queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
          const filtered = old.filter(config => config.key !== 'general_info');
          const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};
          const updatedGeneralInfo = {
            ...generalInfo,
            schedulingButtonColor: colors.schedulingButtonColor,
          };
          return [...filtered, { key: 'general_info', value: updatedGeneralInfo }];
        });
      }

      toast({ title: "Cores da seção atualizadas com sucesso!" });
    },
  });

  // Função para aplicar cores dinamicamente ao site
  const applySectionColorsToSite = (sectionId: string, colors: SectionColorForm) => {
    // Mapeia IDs das seções para seletores CSS
    const sectionSelectors = {
      hero: '#hero-section',
      about: '#about-section',
      services: '#services-section',
      testimonials: '#testimonials-section',
      gallery: '#photo-carousel-section',
      faq: '#faq-section',
      contact: '#contact-section',
      inspirational: '#inspirational-section'
    };

    const selector = sectionSelectors[sectionId as keyof typeof sectionSelectors];
    if (!selector) return;

    const sectionElement = document.querySelector(selector);
    if (sectionElement) {
      const element = sectionElement as HTMLElement;

      if (colors.backgroundType === "solid") {
        element.style.background = colors.backgroundColor;
      } else if (colors.backgroundType === "gradient" && colors.gradientColors) {
        const direction = colors.gradientDirection || "to-br";
        element.style.background = `linear-gradient(${direction}, ${colors.gradientColors[0]}, ${colors.gradientColors[1]})`;
      } else if (colors.backgroundType === "pattern") {
        element.style.background = colors.backgroundColor;
      }

      element.style.opacity = colors.opacity.toString();

      if (colors.overlayColor && colors.overlayOpacity && colors.overlayOpacity > 0) {
        element.style.position = "relative";
        element.style.setProperty("--overlay-color", colors.overlayColor);
        element.style.setProperty("--overlay-opacity", colors.overlayOpacity.toString());
      }
    }

    // Atualiza cor do botão de agendamento se for seção hero
    if (sectionId === "hero" && colors.schedulingButtonColor) {
      const buttons = document.querySelectorAll('.scheduling-button');
      buttons.forEach(button => {
        (button as HTMLElement).style.backgroundColor = colors.schedulingButtonColor!;
      });
    }
  };

  const onSubmit = (data: SectionColorForm) => {
    updateSectionColorsMutation.mutate({
      section: activeSection,
      colors: data
    });
  };

  const applyTemplate = (template: any) => {
    setSelectedTemplate(template.id);
    form.setValue("backgroundColor", template.backgroundColor);
    form.setValue("backgroundType", template.backgroundType);
    if (template.gradientDirection) {
      form.setValue("gradientDirection", template.gradientDirection);
    }
    if (template.gradientColors) {
      form.setValue("gradientColors", template.gradientColors);
    }
    form.setValue("opacity", template.opacity);
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentIcon = currentSection?.icon || Palette;

    // Define quick templates
    const quickTemplates = [
        {
            name: "Branco Puro",
            backgroundColor: "#ffffff",
            description: "Fundo branco para um visual clean.",
        },
        {
            name: "Cinza Claro",
            backgroundColor: "#f8fafc",
            description: "Fundo cinza claro suave.",
        },
        {
            name: "Rosa Bebê",
            backgroundColor: "#fdf2f8",
            description: "Fundo rosa bebê delicado.",
        },
        {
            name: "Azul Suave",
            backgroundColor: "#eff6ff",
            description: "Fundo azul suave e calmante.",
        },
    ];

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Palette className="w-5 h-5" />
          Personalizar Cores por Seção
        </CardTitle>
        <CardDescription className="text-sm">
          Personalize a aparência de cada seção individualmente com cores, gradientes e padrões
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Seção */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Escolha a Seção</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              const sectionColors = getSectionColors()[section.id];

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isActive 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium text-xs">{section.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                  {sectionColors && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Personalizada
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor de Cores */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <CurrentIcon className="w-5 h-5" />
            <h4 className="font-medium">Editando: {currentSection?.name}</h4>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Templates Rápidos - Dropdown com Preview */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Templates Rápidos</h5>
                  <Select onValueChange={(value) => {
                    // Encontra o template selecionado
                    const allTemplates = Object.values(colorTemplates).flatMap((category: any) => category.templates);
                    const template = allTemplates.find((t: any) => t.id === value) as any;
                    if (template) {
                      applyTemplate(template);
                    }
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha um template de cor..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {Object.entries(colorTemplates).map(([categoryId, category]) => (
                        <div key={categoryId}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {category.name}
                          </div>
                          {category.templates.map((template: any) => (
                            <SelectItem key={template.id} value={template.id} className="py-3">
                              <div className="flex items-center gap-3 w-full">
                                <div 
                                  className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0"
                                  style={{
                                    background: template.backgroundType === 'gradient' 
                                      ? `linear-gradient(${template.gradientDirection}, ${template.gradientColors?.[0]}, ${template.gradientColors?.[1]})`
                                      : template.backgroundColor
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{template.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {template.backgroundType === 'gradient' ? 'Gradiente' : 'Cor sólida'}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configuração Personalizada - NOVO SISTEMA REFATORADO */}
              <div className="space-y-6 border-t pt-6">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h5 className="font-semibold text-base">Configuração Personalizada</h5>
                  <Badge variant="outline" className="text-xs">NOVO</Badge>
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
                      <FormLabel className="text-base font-medium">Tipo de fundo</FormLabel>
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
                {form.watch("backgroundType") === "solid" && (
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
                {form.watch("backgroundType") === "gradient" && (
                  <div className="space-y-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-pink-500 to-purple-500"></div>
                      <h6 className="font-medium text-purple-900">Configuração do Gradiente</h6>
                    </div>

                    {/* Preview do gradiente */}
                    <div 
                      className="w-full h-20 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{
                        background: `linear-gradient(${form.watch("gradientDirection") || "to-br"}, ${form.watch("gradientColors")?.[0] || "#ec4899"}, ${form.watch("gradientColors")?.[1] || "#8b5cf6"})`
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
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.watch("gradientColors")?.[0] || "#ec4899" }}></div>
                          Cor Inicial
                        </FormLabel>
                        <div className="space-y-2">
                          <div 
                            className="w-full h-12 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: form.watch("gradientColors")?.[0] || "#ec4899" }}
                          ></div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 border-2 border-gray-200 rounded cursor-pointer"
                              value={form.watch("gradientColors")?.[0] || "#ec4899"}
                              onChange={(e) => {
                                const current = form.getValues("gradientColors") || [];
                                form.setValue("gradientColors", [e.target.value, current[1] || "#8b5cf6"]);
                              }}
                            />
                            <Input
                              placeholder="#ec4899"
                              className="flex-1 font-mono text-sm"
                              value={form.watch("gradientColors")?.[0] || "#ec4899"}
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
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.watch("gradientColors")?.[1] || "#8b5cf6" }}></div>
                          Cor Final
                        </FormLabel>
                        <div className="space-y-2">
                          <div 
                            className="w-full h-12 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: form.watch("gradientColors")?.[1] || "#8b5cf6" }}
                          ></div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 border-2 border-gray-200 rounded cursor-pointer"
                              value={form.watch("gradientColors")?.[1] || "#8b5cf6"}
                              onChange={(e) => {
                                const current = form.getValues("gradientColors") || [];
                                form.setValue("gradientColors", [current[0] || "#ec4899", e.target.value]);
                              }}
                            />
                            <Input
                              placeholder="#8b5cf6"
                              className="flex-1 font-mono text-sm"
                              value={form.watch("gradientColors")?.[1] || "#8b5cf6"}
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
                {form.watch("backgroundType") === "pattern" && (
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

                {/* Controle de Opacidade */}
                {form.watch("backgroundType") !== "pattern" && (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="opacity"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Transparência</FormLabel>
                            <span className="text-sm font-medium text-purple-600">
                              {Math.round(field.value * 100)}%
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                                style={{
                                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${field.value * 100}%, #e5e7eb ${field.value * 100}%, #e5e7eb 100%)`
                                }}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Transparente</span>
                                <span>Opaco</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Cor do Botão de Agendamento para seção Hero */}
                {activeSection === "hero" && (
                  <div className="space-y-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => {
                  form.reset({
                    backgroundColor: "#ffffff",
                    backgroundType: "solid",
                    opacity: 1,
                    overlayOpacity: 0,
                    schedulingButtonColor: "#ec4899",
                  });
                  setSelectedTemplate(null);
                }} className="w-full py-3">
                  Resetar
                </Button>
                <Button type="submit" disabled={updateSectionColorsMutation.isPending} className="btn-admin w-full py-3">
                  {updateSectionColorsMutation.isPending ? "Salvando..." : "Aplicar cores"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}