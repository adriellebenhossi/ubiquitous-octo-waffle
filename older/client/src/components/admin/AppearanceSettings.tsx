/**
 * AppearanceSettings.tsx - Interface Modernizada e Responsiva
 * 
 * Componente redesenhado para configurações de cores globais do sistema
 * Design minimalista, intuitivo e totalmente responsivo para mobile
 * Foco na experiência do usuário não-técnico
 */

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Palette, Sparkles, Wand2, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";
import { ProfessionalTitleColorManager } from "./ProfessionalTitleColorManager";

export function AppearanceSettings({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customMode, setCustomMode] = React.useState(false);

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const colorsConfig = getConfigValue('colors') as any;

  const appearanceSchema = z.object({
    primary: z.string().min(1, "Cor primária é obrigatória"),
    secondary: z.string().min(1, "Cor secundária é obrigatória"),
    accent: z.string().min(1, "Cor de destaque é obrigatória"),
    background: z.string().min(1, "Background é obrigatório"),
  });

  // Templates de gradiente simplificados e únicos
  const gradientTemplates = [
    {
      id: "rose-purple",
      name: "Rosa & Roxo",
      gradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
      primary: "#ec4899",
      secondary: "#8b5cf6"
    },
    {
      id: "ocean-blue",
      name: "Azul Oceano",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
      primary: "#0ea5e9",
      secondary: "#3b82f6"
    },
    {
      id: "mint-green",
      name: "Verde Menta",
      gradient: "linear-gradient(135deg, #06d6a0 0%, #10b981 100%)",
      primary: "#06d6a0",
      secondary: "#10b981"
    },
    {
      id: "coral-orange",
      name: "Coral Quente",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #f97316 100%)",
      primary: "#ff6b6b",
      secondary: "#f97316"
    },
    {
      id: "lavender-dream",
      name: "Lavanda",
      gradient: "linear-gradient(135deg, #a855f7 0%, #d946ef 100%)",
      primary: "#a855f7",
      secondary: "#d946ef"
    },
    {
      id: "sunset-gold",
      name: "Dourado",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      primary: "#fbbf24",
      secondary: "#f59e0b"
    },
    {
      id: "teal-cyan",
      name: "Azul Turquesa",
      gradient: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
      primary: "#14b8a6",
      secondary: "#06b6d4"
    },
    {
      id: "purple-indigo",
      name: "Roxo Profundo",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
      primary: "#7c3aed",
      secondary: "#6366f1"
    }
  ];

  type AppearanceForm = z.infer<typeof appearanceSchema>;

  const form = useForm<AppearanceForm>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      primary: "#ec4899",
      secondary: "#8b5cf6", 
      accent: "#6366f1",
      background: "linear-gradient(135deg, hsl(276, 100%, 95%) 0%, hsl(339, 100%, 95%) 50%, hsl(276, 100%, 95%) 100%)",
    },
  });

  // Popula o formulário com as cores atuais quando os dados chegam
  React.useEffect(() => {
    if (colorsConfig && Object.keys(colorsConfig).length > 0) {
      console.log("Carregando configurações de cores:", colorsConfig);
      form.setValue("primary", colorsConfig.primary || "#ec4899");
      form.setValue("secondary", colorsConfig.secondary || "#8b5cf6");
      form.setValue("accent", colorsConfig.accent || "#6366f1");
      form.setValue("background", colorsConfig.background || "linear-gradient(135deg, hsl(276, 100%, 95%) 0%, hsl(339, 100%, 95%) 50%, hsl(276, 100%, 95%) 100%)");
    }
  }, [colorsConfig, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: AppearanceForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "colors",
        value: data
      });
      return response.json();
    },
    onSuccess: (response, variables) => {
      // ÚNICA atualização - SEM múltiplas operações para evitar delay
      queryClient.setQueryData(["/api/admin/config"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((config: any) => 
          config.key === "colors" 
            ? { ...config, value: variables }
            : config
        );
      });
      
      // Aplica as cores dinamicamente ao site
      applyColorsToSite(variables);
      
      toast({ title: "Cores atualizadas!" });
    },
  });

  // Função para aplicar cores dinamicamente ao site
  const applyColorsToSite = (colors: AppearanceForm) => {
    const root = document.documentElement;
    
    // Converte hex para HSL para compatibilidade
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
    };
    
    // Aplica as cores personalizadas
    root.style.setProperty('--coral', colors.primary);
    root.style.setProperty('--purple-soft', colors.secondary);
    root.style.setProperty('--primary', `hsl(${hexToHsl(colors.primary)})`);
    
    // Atualiza background gradient se especificado
    if (colors.background.includes('gradient')) {
      const style = document.createElement('style');
      style.innerHTML = `.gradient-bg { background: ${colors.background} !important; }`;
      document.head.appendChild(style);
    }
  };

  const onSubmit = (data: AppearanceForm) => {
    updateMutation.mutate(data);
  };

  // Função auxiliar para verificar se um template está ativo
  const isTemplateActive = (template: any) => {
    const currentPrimary = form.watch("primary");
    const currentSecondary = form.watch("secondary");
    
    return template.primary === currentPrimary && 
           template.secondary === currentSecondary;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Templates de Gradiente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-800">Escolha o Gradiente</h3>
              <Badge variant="secondary" className="text-xs px-2 py-1">Clique para selecionar</Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gradientTemplates.map((template) => {
                const isActive = isTemplateActive(template);
                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      form.setValue("primary", template.primary);
                      form.setValue("secondary", template.secondary);
                      form.setValue("accent", template.primary);
                    }}
                    className={`group cursor-pointer rounded-lg border-2 transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? "border-purple-400 shadow-lg ring-2 ring-purple-200 scale-105" 
                        : "border-gray-200 hover:border-purple-300 hover:shadow-md hover:scale-[1.02]"
                    }`}
                  >
                    <div 
                      className="h-12 sm:h-16 w-full"
                      style={{ background: template.gradient }}
                    />
                    <div className="p-2 sm:p-3 bg-white">
                      <h4 className={`text-xs sm:text-sm font-medium transition-colors text-center ${
                        isActive ? "text-purple-700" : "text-gray-700 group-hover:text-purple-700"
                      }`}>
                        {template.name}
                      </h4>
                      {isActive && (
                        <div className="mt-1 text-center">
                          <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                            ✓ Ativo
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modo Personalizado */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-semibold text-gray-800">Cores Personalizadas</h3>
              </div>
              <Button
                type="button"
                variant={customMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCustomMode(!customMode)}
                className="text-xs"
              >
                {customMode ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Personalizar
                  </>
                )}
              </Button>
            </div>
            
            {customMode && (
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg border">
                <FormField
                  control={form.control}
                  name="primary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Cor primária</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input {...field} type="color" className="h-10 w-16 p-1 rounded-md border cursor-pointer" />
                          <Input {...field} className="flex-1 text-sm font-mono" placeholder="#ec4899" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Cor secundária</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input {...field} type="color" className="h-10 w-16 p-1 rounded-md border cursor-pointer" />
                          <Input {...field} className="flex-1 text-sm font-mono" placeholder="#8b5cf6" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Cor de destaque</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input {...field} type="color" className="h-10 w-16 p-1 rounded-md border cursor-pointer" />
                          <Input {...field} className="flex-1 text-sm font-mono" placeholder="#6366f1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Botão de Salvamento */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <div className="flex-1 text-sm text-gray-600">
              As cores serão aplicadas em todo o site instantaneamente
            </div>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="btn-admin w-full sm:w-auto px-6 py-2"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Aplicar Cores
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Configuração da Cor do Título Profissional */}
      <div className="mt-6">
        <ProfessionalTitleColorManager configs={configs} />
      </div>
    </div>
  );
}