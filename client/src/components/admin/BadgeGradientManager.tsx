/**
 * BadgeGradientManager.tsx - Interface Modernizada
 * 
 * Componente reformulado para gerenciar gradientes dos badges
 * Design minimalista, intuitivo e responsivo para melhor UX
 * Focado na experiência do usuário não-técnico
 */

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Wand2, Info, Target, ChevronDown, MessageSquare, Palette } from "lucide-react";
import type { SiteConfig } from "@shared/schema";
import { BADGE_GRADIENTS } from "@/utils/textGradient";

interface BadgeGradientManagerProps {
  configs: SiteConfig[];
}

const badgeGradientSchema = z.object({
  gradient: z.string().min(1, "Selecione um gradiente"),
});

type BadgeGradientForm = z.infer<typeof badgeGradientSchema>;

export function BadgeGradientManager({ configs }: BadgeGradientManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtém a configuração atual de gradiente dos badges
  const getBadgeGradient = () => {
    const badgeConfig = configs?.find(c => c.key === 'badge_gradient')?.value as any;
    return badgeConfig?.gradient || 'pink-purple';
  };

  const form = useForm<BadgeGradientForm>({
    resolver: zodResolver(badgeGradientSchema),
    defaultValues: {
      gradient: getBadgeGradient(),
    },
  });

  React.useEffect(() => {
    form.setValue('gradient', getBadgeGradient());
  }, [configs, form]);

  const updateBadgeGradientMutation = useMutation({
    mutationFn: async (data: BadgeGradientForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "badge_gradient",
        value: { gradient: data.gradient }
      });
    },
    onSuccess: () => {
      // Atualização silenciosa do cache
      queryClient.setQueryData(["/api/admin/config"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((config: any) => 
          config.key === "badge_gradient" 
            ? { ...config, value: { gradient: form.getValues('gradient') } }
            : config
        );
      });
      
      toast({ 
        title: "Gradiente dos badges atualizado!", 
        description: "Todas as palavras destacadas agora usam o novo gradiente." 
      });
    },
  });

  const onSubmit = (data: BadgeGradientForm) => {
    updateBadgeGradientMutation.mutate(data);
  };

  // Gradientes organizados por categoria com melhor experiência visual
  const gradientCollections = [
    {
      id: "feminine",
      name: "Feminino & Delicado",
      description: "Tons suaves que transmitem acolhimento e serenidade",
      gradients: [
        { 
          key: 'pink-purple', 
          name: 'Rosa Vibrante', 
          preview: 'from-pink-500 to-purple-600',
          description: 'Clássico rosa-roxo, feminino e acolhedor'
        },
        { 
          key: 'rose-pink', 
          name: 'Rosa Delicado', 
          preview: 'from-rose-500 to-pink-600',
          description: 'Tons de rosa suaves e elegantes'
        },
        { 
          key: 'fuchsia-pink', 
          name: 'Fúcsia Vibrante', 
          preview: 'from-fuchsia-500 to-pink-600',
          description: 'Fúcsia energético com toque feminino'
        },
        { 
          key: 'violet-purple', 
          name: 'Violeta Dreamy', 
          preview: 'from-violet-500 to-purple-600',
          description: 'Violeta relaxante e terapêutico'
        },
        { 
          key: 'lavender-pink', 
          name: 'Lavanda Suave', 
          preview: 'from-purple-300 to-pink-400',
          description: 'Lavanda delicada e reconfortante'
        },
        { 
          key: 'coral-rose', 
          name: 'Coral Romântico', 
          preview: 'from-pink-400 to-rose-500',
          description: 'Coral caloroso e afetuoso'
        },
        { 
          key: 'magenta-purple', 
          name: 'Magenta Intenso', 
          preview: 'from-purple-500 to-fuchsia-500',
          description: 'Magenta vibrante e expressivo'
        },
      ]
    },
    {
      id: "professional",
      name: "Profissional & Confiança",
      description: "Azuis que transmitem credibilidade e serenidade",
      gradients: [
        { 
          key: 'blue-purple', 
          name: 'Azul Profissional', 
          preview: 'from-blue-500 to-purple-600',
          description: 'Azul confiável com toque de criatividade'
        },
        { 
          key: 'indigo-purple', 
          name: 'Índigo Elegante', 
          preview: 'from-indigo-500 to-purple-600',
          description: 'Índigo sofisticado e profissional'
        },
        { 
          key: 'sky-blue', 
          name: 'Céu Sereno', 
          preview: 'from-sky-500 to-blue-600',
          description: 'Azul céu que transmite calma'
        },
        { 
          key: 'cyan-blue', 
          name: 'Ciano Fresh', 
          preview: 'from-cyan-500 to-blue-600',
          description: 'Ciano moderno e refrescante'
        },
        { 
          key: 'slate-blue', 
          name: 'Ardósia Executivo', 
          preview: 'from-slate-500 to-blue-600',
          description: 'Cinza-azul corporativo e sólido'
        },
        { 
          key: 'navy-indigo', 
          name: 'Marinho Clássico', 
          preview: 'from-blue-800 to-indigo-600',
          description: 'Azul marinho tradicional e confiável'
        },
        { 
          key: 'steel-cyan', 
          name: 'Aço Moderno', 
          preview: 'from-gray-500 to-cyan-500',
          description: 'Cinza metálico com toque tech'
        },
      ]
    },
    {
      id: "nature",
      name: "Natureza & Bem-estar",
      description: "Verdes que representam crescimento e renovação",
      gradients: [
        { 
          key: 'green-blue', 
          name: 'Verde Crescimento', 
          preview: 'from-green-500 to-blue-600',
          description: 'Verde que simboliza crescimento e mudança'
        },
        { 
          key: 'emerald-teal', 
          name: 'Esmeralda Zen', 
          preview: 'from-emerald-500 to-teal-600',
          description: 'Esmeralda equilibrada e harmoniosa'
        },
        { 
          key: 'teal-cyan', 
          name: 'Turquesa Peaceful', 
          preview: 'from-teal-500 to-cyan-600',
          description: 'Turquesa que acalma e tranquiliza'
        },
        { 
          key: 'lime-green', 
          name: 'Lima Vitalidade', 
          preview: 'from-lime-500 to-green-600',
          description: 'Lima energético e vitalizante'
        },
        { 
          key: 'forest-emerald', 
          name: 'Floresta Profunda', 
          preview: 'from-green-700 to-emerald-500',
          description: 'Verde floresta rico e natural'
        },
        { 
          key: 'mint-teal', 
          name: 'Menta Refrescante', 
          preview: 'from-green-300 to-teal-400',
          description: 'Verde menta suave e revigorante'
        },
        { 
          key: 'sage-green', 
          name: 'Sálvia Orgânico', 
          preview: 'from-green-400 to-emerald-600',
          description: 'Verde sálvia terroso e equilibrado'
        },
      ]
    },
    {
      id: "energy",
      name: "Energia & Vitalidade",
      description: "Tons quentes que inspiram ação e otimismo",
      gradients: [
        { 
          key: 'orange-red', 
          name: 'Laranja Motivação', 
          preview: 'from-orange-500 to-red-600',
          description: 'Laranja que motiva e energiza'
        },
        { 
          key: 'amber-orange', 
          name: 'Âmbar Caloroso', 
          preview: 'from-amber-500 to-orange-600',
          description: 'Âmbar acolhedor e encorajador'
        },
        { 
          key: 'yellow-orange', 
          name: 'Amarelo Otimismo', 
          preview: 'from-yellow-500 to-orange-600',
          description: 'Amarelo que traz alegria e positividade'
        },
        { 
          key: 'sunset-red', 
          name: 'Pôr do Sol', 
          preview: 'from-orange-400 to-red-500',
          description: 'Cores quentes do entardecer'
        },
        { 
          key: 'gold-amber', 
          name: 'Ouro Radiante', 
          preview: 'from-yellow-400 to-amber-500',
          description: 'Dourado brilhante e inspirador'
        },
        { 
          key: 'fire-orange', 
          name: 'Fogo Intenso', 
          preview: 'from-red-500 to-orange-400',
          description: 'Vermelho-laranja dinâmico e poderoso'
        },
      ]
    },
    {
      id: "luxury",
      name: "Luxo & Sofisticação",
      description: "Tons metálicos e ricos que transmitem elegância premium",
      gradients: [
        { 
          key: 'gold-bronze', 
          name: 'Ouro Bronze', 
          preview: 'from-amber-300 to-amber-600',
          description: 'Dourado clássico e luxuoso'
        },
        { 
          key: 'silver-gray', 
          name: 'Prata Elegante', 
          preview: 'from-gray-300 to-gray-600',
          description: 'Prata sofisticada e atemporal'
        },
        { 
          key: 'rose-gold', 
          name: 'Ouro Rosa', 
          preview: 'from-pink-300 to-amber-400',
          description: 'Ouro rosé moderno e refinado'
        },
        { 
          key: 'platinum-silver', 
          name: 'Platina Premium', 
          preview: 'from-gray-200 to-slate-500',
          description: 'Platina exclusiva e prestigiosa'
        },
        { 
          key: 'copper-bronze', 
          name: 'Cobre Artesanal', 
          preview: 'from-orange-300 to-amber-700',
          description: 'Cobre artístico e aquecido'
        },
        { 
          key: 'champagne-gold', 
          name: 'Champagne Dourado', 
          preview: 'from-yellow-200 to-amber-500',
          description: 'Champagne borbulhante e celebrativo'
        },
      ]
    },
    {
      id: "modern",
      name: "Moderno & Tecnológico",
      description: "Cores vibrantes e futuristas para um visual inovador",
      gradients: [
        { 
          key: 'electric-blue', 
          name: 'Azul Elétrico', 
          preview: 'from-blue-400 to-cyan-300',
          description: 'Azul energético e tecnológico'
        },
        { 
          key: 'neon-purple', 
          name: 'Roxo Neon', 
          preview: 'from-purple-400 to-pink-300',
          description: 'Roxo vibrante estilo neon'
        },
        { 
          key: 'digital-green', 
          name: 'Verde Digital', 
          preview: 'from-green-400 to-cyan-300',
          description: 'Verde tecnológico e inovador'
        },
        { 
          key: 'holographic', 
          name: 'Holográfico', 
          preview: 'from-purple-400 to-blue-400 via-pink-400',
          description: 'Efeito holográfico futurista'
        },
        { 
          key: 'cyber-pink', 
          name: 'Rosa Cyber', 
          preview: 'from-pink-400 to-purple-300',
          description: 'Rosa cyberpunk e moderno'
        },
        { 
          key: 'matrix-green', 
          name: 'Verde Matrix', 
          preview: 'from-lime-400 to-green-500',
          description: 'Verde digital estilo Matrix'
        },
      ]
    },
    {
      id: "calm",
      name: "Calmo & Sereno",
      description: "Tons pastéis suaves que transmitem paz e tranquilidade",
      gradients: [
        { 
          key: 'powder-blue', 
          name: 'Azul Pó', 
          preview: 'from-blue-200 to-cyan-300',
          description: 'Azul suave e relaxante'
        },
        { 
          key: 'soft-lavender', 
          name: 'Lavanda Macia', 
          preview: 'from-purple-200 to-pink-200',
          description: 'Lavanda delicada e calmante'
        },
        { 
          key: 'gentle-mint', 
          name: 'Menta Gentil', 
          preview: 'from-green-200 to-teal-200',
          description: 'Verde menta tranquilizante'
        },
        { 
          key: 'cream-beige', 
          name: 'Creme Bege', 
          preview: 'from-amber-100 to-orange-200',
          description: 'Bege cremoso e aconchegante'
        },
        { 
          key: 'pearl-white', 
          name: 'Pérola Branca', 
          preview: 'from-gray-100 to-blue-100',
          description: 'Branco perolado e puro'
        },
        { 
          key: 'whisper-gray', 
          name: 'Cinza Sussurro', 
          preview: 'from-gray-200 to-slate-300',
          description: 'Cinza suave e minimalista'
        },
      ]
    },
  ];

  const currentGradient = form.watch('gradient');
  const currentGradientData = gradientCollections
    .flatMap(c => c.gradients)
    .find(g => g.key === currentGradient);

  return (
    <div className="space-y-6">
      {/* Explicação Visual Modernizada - Responsivo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200/50 shadow-lg">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-8 sm:-translate-y-16 translate-x-8 sm:translate-x-16"></div>
        
        <div className="relative p-4 sm:p-8">
          {/* Header com ícone destacado - Responsivo */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-shrink-0">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                O que são Badges?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Sistema inteligente de destaque visual</p>
            </div>
          </div>

          {/* Explicação principal com visual aprimorado - Responsivo */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/50 shadow-sm mb-4 sm:mb-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs sm:text-sm">1</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                  <strong className="text-gray-900">Badges</strong> são palavras especiais destacadas automaticamente. 
                  Digite qualquer texto entre parênteses e ele vira um badge colorido.
                </p>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Sintaxe:</span>
                  </div>
                  <div className="overflow-x-auto">
                    <code className="bg-blue-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-mono text-xs sm:text-sm text-blue-800 border whitespace-nowrap">
                      (palavra) → <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-semibold">palavra</span>
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Impacto visual expandido - Responsivo */}
          <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-200/50">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 font-bold text-xs sm:text-sm">2</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-amber-800 mb-2 sm:mb-3 flex items-center gap-2">
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                  Identidade Visual Completa
                </h4>
                <p className="text-xs sm:text-sm text-amber-700 mb-3 sm:mb-4 leading-relaxed">
                  O gradiente escolhido não afeta apenas os badges - ele cria uma identidade visual coesa 
                  em todos os elementos decorativos do site:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-amber-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>
                      <span className="text-xs sm:text-sm font-medium text-amber-800">Detalhes</span>
                    </div>
                    <p className="text-xs text-amber-700">Pontos decorativos</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 sm:p-3 border border-amber-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                      <span className="text-xs sm:text-sm font-medium text-amber-800">Ênfases</span>
                    </div>
                    <p className="text-xs text-amber-700">Elementos de destaque</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Seleção de Gradientes */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Configuração de Gradientes</h3>
            </div>

            <FormField
              control={form.control}
              name="gradient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-700">
                    Template de Gradiente
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl shadow-sm transition-all duration-200">
                        <SelectValue placeholder="Selecione um gradiente para os badges" />
                        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                      {gradientCollections.map((collection) => (
                        <div key={collection.id} className="px-2 py-2">
                          {/* Category Header */}
                          <div className="px-3 py-2 mb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-indigo-400">
                            <h4 className="font-semibold text-gray-800 text-sm">{collection.name}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{collection.description}</p>
                          </div>
                          
                          {/* Gradient Options */}
                          {collection.gradients.map((gradient) => (
                            <SelectItem 
                              key={gradient.key} 
                              value={gradient.key}
                              className="flex items-center justify-between p-3 my-1 hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg cursor-pointer border border-transparent hover:border-indigo-200 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3 w-full">
                                {/* Gradient Preview Circle */}
                                <div 
                                  className={`w-6 h-6 rounded-full bg-gradient-to-r ${gradient.preview} border-2 border-white shadow-sm flex-shrink-0`}
                                />
                                
                                {/* Text Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 text-sm">{gradient.name}</div>
                                  <div className="text-xs text-gray-600 truncate">{gradient.description}</div>
                                </div>
                                
                                {/* Preview Badge */}
                                <div className="flex-shrink-0 bg-gray-50 rounded px-2 py-1 border">
                                  <span className={`text-xs bg-gradient-to-r ${gradient.preview} bg-clip-text text-transparent font-semibold`}>
                                    Badge
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Divider between categories */}
                          {collection.id !== gradientCollections[gradientCollections.length - 1].id && (
                            <div className="border-t border-gray-100 mt-3 mb-2" />
                          )}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Preview Expandido */}
          {currentGradientData && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Preview do gradiente selecionado</h3>
              </div>
              
              <div className="space-y-4">
                {/* Preview do Badge */}
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm font-medium text-gray-700 mb-2">✨ Badge em Texto:</p>
                  <p className="text-lg">
                    "Histórias de <span className={`bg-gradient-to-r ${currentGradientData.preview} bg-clip-text text-transparent font-semibold`}>
                      transformação
                    </span>"
                  </p>
                </div>

                {/* Preview de Outros Elementos */}
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm font-medium text-gray-700 mb-3">🎨 Outros elementos afetados:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${currentGradientData.preview} text-white shadow-sm`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-700">Ícones de aspas em depoimentos</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentGradientData.preview} shadow-sm`}></div>
                      <span className="text-sm text-gray-700">Detalhes decorativos e pontos de destaque</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Sparkles className={`w-5 h-5 bg-gradient-to-r ${currentGradientData.preview} bg-clip-text text-transparent`} />
                      <span className="text-sm text-gray-700">Elementos de ênfase e separadores</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 italic">
                    Gradiente: {currentGradientData.name} • {currentGradientData.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Salvamento - Responsivo */}
          <div className="flex justify-center pt-4 border-t">
            <Button 
              type="submit" 
              disabled={updateBadgeGradientMutation.isPending}
              className="btn-admin w-full sm:w-auto px-8 py-2"
            >
              {updateBadgeGradientMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aplicando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Aplicar gradiente
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}