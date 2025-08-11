/**
 * SpecialtiesManager.tsx
 * 
 * Manager padronizado para gerenciar especialidades da psicóloga
 * Sistema uniforme de drag-and-drop com setas e controles
 * Interface consistente com outros managers
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Brain, Heart, Users, Activity, Zap, Shield, Sun, Moon, Star, Sparkles, MessageCircle, Handshake, HelpCircle, TrendingUp, Award, BookOpen, Leaf, Flower, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Waves, Mountain, Timer, Clock, MapPin, Palette, Compass, Home, Coffee, Smile, Eye, Headphones, Volume2, Music, Camera, Lightbulb, Key, Lock, Gift, Diamond, Gem, Circle, Square, Triangle, Hexagon, Feather } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Specialty } from "@shared/schema";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { ResponsiveAdminContainer } from "./base/ResponsiveAdminContainer";
import { ResponsiveGrid, ResponsiveButtonGroup } from "./base/ResponsiveFormFields";
import { useManagerMutations } from "@/hooks/useManagerMutations";
import { ModernIconSelector } from "./base/ModernIconSelector";

const specialtySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  iconColor: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type SpecialtyForm = z.infer<typeof specialtySchema>;

// Ícones organizados por categorias (SEM emojis para evitar duplicação)
const ICON_CATEGORIES = [
  {
    category: "Saúde Mental",
    icons: [
      { value: "Brain", label: "Cérebro", component: Brain },
      { value: "Heart", label: "Coração", component: Heart },
      { value: "Shield", label: "Proteção", component: Shield },
      { value: "Target", label: "Foco", component: Target },
    ]
  },
  {
    category: "Relacionamentos",
    icons: [
      { value: "Users", label: "Pessoas", component: Users },
      { value: "Handshake", label: "Parceria", component: Handshake },
      { value: "MessageCircle", label: "Comunicação", component: MessageCircle },
      { value: "Home", label: "Família", component: Home },
    ]
  },
  {
    category: "Bem-estar", 
    icons: [
      { value: "Sparkles", label: "Transformação", component: Sparkles },
      { value: "Star", label: "Excelência", component: Star },
      { value: "Sun", label: "Energia", component: Sun },
      { value: "Moon", label: "Tranquilidade", component: Moon },
    ]
  },
  {
    category: "Crescimento",
    icons: [
      { value: "BookOpen", label: "Aprendizado", component: BookOpen },
      { value: "TrendingUp", label: "Progresso", component: TrendingUp },
      { value: "Award", label: "Conquistas", component: Award },
      { value: "Compass", label: "Orientação", component: Compass },
    ]
  },
  {
    category: "Mindfulness",
    icons: [
      { value: "Leaf", label: "Natureza", component: Leaf },
      { value: "Flower", label: "Florescimento", component: Flower },
      { value: "Waves", label: "Fluidez", component: Waves },
      { value: "Mountain", label: "Estabilidade", component: Mountain },
    ]
  },
  {
    category: "Suporte",
    icons: [
      { value: "LifeBuoy", label: "Socorro", component: LifeBuoy },
      { value: "HelpCircle", label: "Ajuda", component: HelpCircle },
      { value: "Activity", label: "Atividade", component: Activity },
      { value: "Zap", label: "Energia", component: Zap },
    ]
  },
  {
    category: "Criatividade",
    icons: [
      { value: "Palette", label: "Arte", component: Palette },
      { value: "Camera", label: "Fotografia", component: Camera },
      { value: "Music", label: "Música", component: Music },
      { value: "Lightbulb", label: "Ideias", component: Lightbulb },
      { value: "Feather", label: "Escrita", component: Feather },
    ]
  },
  {
    category: "Sensoriais",
    icons: [
      { value: "Eye", label: "Visão", component: Eye },
      { value: "Headphones", label: "Audição", component: Headphones },
      { value: "Volume2", label: "Som", component: Volume2 },
      { value: "Coffee", label: "Sabor", component: Coffee },
      { value: "Smile", label: "Expressão", component: Smile },
    ]
  },
  {
    category: "Formas & Simbolos",
    icons: [
      { value: "Circle", label: "Círculo", component: Circle },
      { value: "Square", label: "Quadrado", component: Square },
      { value: "Triangle", label: "Triângulo", component: Triangle },
      { value: "Hexagon", label: "Hexágono", component: Hexagon },
      { value: "Diamond", label: "Diamante", component: Diamond },
      { value: "Gem", label: "Joia", component: Gem },
    ]
  },
  {
    category: "Natureza & Elementos",
    icons: [
      { value: "TreePine", label: "Pinheiro", component: TreePine },
      { value: "Leaf", label: "Folha", component: Leaf },
      { value: "Flower", label: "Flor", component: Flower },
      { value: "Wind", label: "Vento", component: Wind },
    ]
  },
  {
    category: "Objetos & Utilitários",
    icons: [
      { value: "Key", label: "Chave", component: Key },
      { value: "Lock", label: "Cadeado", component: Lock },
      { value: "Gift", label: "Presente", component: Gift },
      { value: "Timer", label: "Cronômetro", component: Timer },
      { value: "Clock", label: "Relógio", component: Clock },
      { value: "MapPin", label: "Localização", component: MapPin },
      { value: "Puzzle", label: "Quebra-cabeça", component: Puzzle },
      { value: "Umbrella", label: "Guarda-chuva", component: Umbrella },
    ]
  },
];

// Cores disponíveis (expandidas)
const COLOR_OPTIONS = [
  { value: "#ec4899", label: "Rosa", color: "#ec4899" },
  { value: "#3b82f6", label: "Azul", color: "#3b82f6" },
  { value: "#10b981", label: "Verde", color: "#10b981" },
  { value: "#f59e0b", label: "Amarelo", color: "#f59e0b" },
  { value: "#8b5cf6", label: "Roxo", color: "#8b5cf6" },
  { value: "#ef4444", label: "Vermelho", color: "#ef4444" },
  { value: "#6b7280", label: "Cinza", color: "#6b7280" },
  { value: "#06b6d4", label: "Ciano", color: "#06b6d4" },
  { value: "#84cc16", label: "Verde Lima", color: "#84cc16" },
  { value: "#f97316", label: "Laranja", color: "#f97316" },
  { value: "#a855f7", label: "Violeta", color: "#a855f7" },
  { value: "#14b8a6", label: "Teal", color: "#14b8a6" },
  { value: "#f43f5e", label: "Rosa Intenso", color: "#f43f5e" },
  { value: "#6366f1", label: "Índigo", color: "#6366f1" },
  { value: "#eab308", label: "Dourado", color: "#eab308" },
  { value: "#22c55e", label: "Verde Esmeralda", color: "#22c55e" },
  { value: "#dc2626", label: "Vermelho Escuro", color: "#dc2626" },
  { value: "#0891b2", label: "Azul Céu", color: "#0891b2" },
  { value: "#7c3aed", label: "Roxo Profundo", color: "#7c3aed" },
  { value: "#0d9488", label: "Verde Água", color: "#0d9488" },
];

interface SpecialtiesManagerProps {
  specialties: Specialty[];
}

export function SpecialtiesManager({ specialties }: SpecialtiesManagerProps) {
  const { toast } = useToast();
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localSpecialties, setLocalSpecialties] = useState<Specialty[]>([]);

  // Usar hook de mutações padronizado
  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useManagerMutations({
    adminQueryKey: "/api/admin/specialties",
    publicQueryKey: "/api/specialties",
    entityName: "Especialidade"
  });

  // Atualizar lista local quando dados mudam
  useEffect(() => {
    if (specialties && Array.isArray(specialties)) {
      const sortedSpecialties = [...specialties].sort((a, b) => a.order - b.order);
      setLocalSpecialties(sortedSpecialties);
    } else {
      setLocalSpecialties([]);
    }
  }, [specialties]);

  const form = useForm<SpecialtyForm>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "Brain",
      iconColor: "#ec4899",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = (data: SpecialtyForm) => {
    const finalData = {
      ...data,
      order: editingSpecialty ? editingSpecialty.order : localSpecialties.length,
    };

    if (editingSpecialty) {
      updateMutation.mutate({ id: editingSpecialty.id, data: finalData });
    } else {
      createMutation.mutate(finalData);
    }

    setEditingSpecialty(null);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    form.reset({
      title: specialty.title,
      description: specialty.description,
      icon: specialty.icon,
      iconColor: specialty.iconColor,
      isActive: specialty.isActive,
      order: specialty.order,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta especialidade?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = localSpecialties.findIndex(s => s.id === id);
    if (currentIndex > 0) {
      const newOrder = [...localSpecialties];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = localSpecialties.findIndex(s => s.id === id);
    if (currentIndex < localSpecialties.length - 1) {
      const newOrder = [...localSpecialties];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleReorder = (reorderedItems: Array<{ id: number | string; order: number }>) => {
    const items = reorderedItems.map(item => ({ id: Number(item.id), order: item.order }));
    reorderMutation.mutate(items);
  };

  // Encontrar componente do ícone
  const getIconComponent = (iconName: string) => {
    for (const category of ICON_CATEGORIES) {
      const icon = category.icons.find(i => i.value === iconName);
      if (icon) return icon.component;
    }
    return Brain; // Fallback
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <CardTitle className="flex items-center gap-2 break-words">
              <Target className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className="break-words">Especialidades</span>
            </CardTitle>
            <CardDescription className="break-words text-sm mt-1">
              Configure as especialidades e áreas de atuação
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingSpecialty(null);
                  form.reset();
                }}
                className="btn-admin w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="break-words">Nova Especialidade</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw]">
              <DialogHeader>
                <DialogTitle className="break-words">
                  {editingSpecialty ? "Editar Especialidade" : "Nova Especialidade"}
                </DialogTitle>
                <DialogDescription className="break-words text-sm">
                  Configure uma área de especialização profissional
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="break-words">Título da especialidade</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Terapia de Casal" 
                            {...field} 
                            className="w-full break-words"
                          />
                        </FormControl>
                        <FormMessage className="break-words text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="break-words">Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada da especialidade..."
                            className="min-h-[100px] resizable-textarea w-full break-words"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="break-words text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="break-words">Ícone</FormLabel>
                          <ModernIconSelector
                            options={ICON_CATEGORIES.flatMap(category => 
                              category.icons.map(icon => ({
                                value: icon.value,
                                label: icon.label,
                                component: icon.component,
                                category: category.category
                              }))
                            )}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Selecione um ícone"
                          />
                          <FormMessage className="break-words text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="iconColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="break-words">Cor do Ícone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma cor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COLOR_OPTIONS.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                      style={{ backgroundColor: color.color }}
                                    ></div>
                                    <span className="break-words">{color.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="break-words text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Prévia do Ícone Selecionado */}
                  {form.watch("icon") && form.watch("iconColor") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Prévia</label>
                      <div className="flex items-center justify-center">
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center border-2"
                          style={{ 
                            backgroundColor: `${form.watch("iconColor")}15`, 
                            borderColor: `${form.watch("iconColor")}30` 
                          }}
                        >
                          {(() => {
                            const selectedIcon = form.watch("icon");
                            const IconComponent = getIconComponent(selectedIcon);
                            return (
                              <IconComponent 
                                className="w-8 h-8" 
                                style={{ color: form.watch("iconColor") }}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormLabel className="break-words">Visível no site</FormLabel>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded flex-shrink-0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="btn-admin w-full sm:w-auto"
                    >
                      {editingSpecialty ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {localSpecialties.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2 break-words">Nenhuma especialidade</h3>
            <p className="text-gray-500 mb-4 break-words">Comece adicionando a primeira especialidade profissional</p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-admin w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="break-words">Adicionar primeira especialidade</span>
            </Button>
          </div>
        ) : (
          <DragAndDropContainer
            items={localSpecialties.map(s => ({ id: s.id, order: s.order }))}
            onReorder={handleReorder}
          >
            {localSpecialties.map((specialty, index) => {
              const IconComponent = getIconComponent(specialty.icon);
              return (
                <DragAndDropItem
                  key={specialty.id}
                  id={specialty.id}
                  isActive={specialty.isActive}
                  isFirst={index === 0}
                  isLast={index === localSpecialties.length - 1}
                  onToggleActive={() => handleToggleActive(specialty.id, !specialty.isActive)}
                  onMoveUp={() => handleMoveUp(specialty.id)}
                  onMoveDown={() => handleMoveDown(specialty.id)}
                  onEdit={() => handleEdit(specialty)}
                  onDelete={() => handleDelete(specialty.id)}
                >
                  {/* Layout Simples com Ícone e Textos Centralizados */}
                  <div className="w-full">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {/* Ícone colorido */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${specialty.iconColor}15`, border: `1px solid ${specialty.iconColor}30` }}
                      >
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{ color: specialty.iconColor }}
                        />
                      </div>
                      

                    </div>
                    
                    {/* Título SEMPRE VISÍVEL */}
                    <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight break-words">
                      {specialty.title}
                    </h3>
                    
                    {/* Descrição SEMPRE VISÍVEL */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 break-words">
                      {specialty.description}
                    </p>

                  </div>
                </DragAndDropItem>
              );
            })}
          </DragAndDropContainer>
        )}
      </CardContent>
    </Card>
  );
}