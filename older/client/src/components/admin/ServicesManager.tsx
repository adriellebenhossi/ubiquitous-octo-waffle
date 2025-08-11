/**
 * ServicesManager.tsx
 * 
 * Manager padronizado para gerenciar serviços oferecidos
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Brain, Heart, Users, Activity, Zap, Shield, Target, Sun, Moon, Star, Sparkles, MessageCircle, Handshake, HelpCircle, TrendingUp, Award, BookOpen, Leaf, Flower, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Waves, Mountain, Timer, Clock, MapPin, Palette, Compass, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@shared/schema";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { ResponsiveAdminContainer } from "./base/ResponsiveAdminContainer";
import { ResponsiveGrid, ResponsiveButtonGroup, ResponsiveFieldset } from "./base/ResponsiveFormFields";
import { useManagerMutations } from "@/hooks/useManagerMutations";

const serviceSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  duration: z.string().optional(),
  price: z.string().optional(),
  icon: z.string().min(1, "Ícone é obrigatório"),
  gradient: z.string().min(1, "Gradiente é obrigatório"),
  showPrice: z.boolean(),
  showDuration: z.boolean(),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type ServiceForm = z.infer<typeof serviceSchema>;

// Ícones organizados por categorias conforme especificação do projeto
const ICON_CATEGORIES = [
  {
    category: "🧠 Saúde Mental",
    icons: [
      { value: "Brain", label: "Cérebro", component: Brain },
      { value: "Heart", label: "Coração", component: Heart },
      { value: "Shield", label: "Proteção", component: Shield },
      { value: "Target", label: "Foco", component: Target },
    ]
  },
  {
    category: "👥 Relacionamentos",
    icons: [
      { value: "Users", label: "Pessoas", component: Users },
      { value: "Handshake", label: "Parceria", component: Handshake },
      { value: "MessageCircle", label: "Comunicação", component: MessageCircle },
      { value: "Home", label: "Família", component: Home },
    ]
  },
  {
    category: "✨ Bem-estar",
    icons: [
      { value: "Sparkles", label: "Transformação", component: Sparkles },
      { value: "Star", label: "Excelência", component: Star },
      { value: "Sun", label: "Energia", component: Sun },
      { value: "Moon", label: "Tranquilidade", component: Moon },
    ]
  },
  {
    category: "🎓 Crescimento",
    icons: [
      { value: "BookOpen", label: "Aprendizado", component: BookOpen },
      { value: "TrendingUp", label: "Progresso", component: TrendingUp },
      { value: "Award", label: "Conquistas", component: Award },
      { value: "Compass", label: "Orientação", component: Compass },
    ]
  },
  {
    category: "🌿 Mindfulness",
    icons: [
      { value: "Leaf", label: "Natureza", component: Leaf },
      { value: "Flower", label: "Florescimento", component: Flower },
      { value: "Waves", label: "Fluidez", component: Waves },
      { value: "Mountain", label: "Estabilidade", component: Mountain },
    ]
  },
  {
    category: "🆘 Suporte",
    icons: [
      { value: "LifeBuoy", label: "Socorro", component: LifeBuoy },
      { value: "HelpCircle", label: "Ajuda", component: HelpCircle },
      { value: "Activity", label: "Atividade", component: Activity },
      { value: "Zap", label: "Energia", component: Zap },
    ]
  },
  {
    category: "⏰ Tempo e Organização",
    icons: [
      { value: "Clock", label: "Tempo", component: Clock },
      { value: "Timer", label: "Cronômetro", component: Timer },
      { value: "MapPin", label: "Localização", component: MapPin },
      { value: "Palette", label: "Criatividade", component: Palette },
    ]
  }
];

// Gradientes disponíveis
const GRADIENT_OPTIONS = [
  { value: "from-pink-500 to-purple-600", label: "Rosa → Roxo" },
  { value: "from-blue-500 to-cyan-500", label: "Azul → Ciano" },
  { value: "from-green-500 to-teal-500", label: "Verde → Teal" },
  { value: "from-yellow-500 to-orange-500", label: "Amarelo → Laranja" },
  { value: "from-purple-500 to-indigo-500", label: "Roxo → Índigo" },
  { value: "from-red-500 to-pink-500", label: "Vermelho → Rosa" },
  { value: "from-gray-500 to-gray-700", label: "Cinza Claro → Escuro" },
  { value: "from-indigo-500 to-purple-500", label: "Índigo → Roxo" },
];

interface ServicesManagerProps {
  services: Service[];
}

export function ServicesManager({ services }: ServicesManagerProps) {
  const { toast } = useToast();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localServices, setLocalServices] = useState<Service[]>([]);

  // Usar hook de mutações padronizado
  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useManagerMutations({
    adminQueryKey: "/api/admin/services",
    publicQueryKey: "/api/services",
    entityName: "Serviço"
  });

  // Atualizar lista local quando dados mudam
  useEffect(() => {
    const sortedServices = [...services].sort((a, b) => a.order - b.order);
    setLocalServices(sortedServices);
  }, [services]);

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      price: "",
      icon: "Brain",
      gradient: "from-pink-500 to-purple-600",
      showPrice: true,
      showDuration: true,
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = (data: ServiceForm) => {
    const finalData = {
      ...data,
      order: editingService ? editingService.order : localServices.length,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: finalData });
    } else {
      createMutation.mutate(finalData);
    }

    setEditingService(null);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      title: service.title,
      description: service.description,
      duration: service.duration || "",
      price: service.price || "",
      icon: service.icon,
      gradient: service.gradient,
      showPrice: service.showPrice,
      showDuration: service.showDuration,
      isActive: service.isActive,
      order: service.order,
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
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = localServices.findIndex(s => s.id === id);
    if (currentIndex > 0) {
      const newOrder = [...localServices];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = localServices.findIndex(s => s.id === id);
    if (currentIndex < localServices.length - 1) {
      const newOrder = [...localServices];
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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Gerenciar serviços
            </CardTitle>
            <CardDescription className="text-sm">
              Configure os serviços oferecidos pela psicóloga
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingService(null);
                  form.reset();
                }}
                className="w-full sm:w-auto btn-admin"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes do serviço oferecido
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Serviço</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Terapia Cognitivo-Comportamental" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada do serviço..."
                            className="min-h-[100px] resizable-textarea"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ResponsiveGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um ícone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-64">
                              {ICON_CATEGORIES.map((category) => (
                                <div key={category.category}>
                                  <div className="px-2 py-1 text-sm font-medium text-gray-500 bg-gray-50">
                                    {category.category}
                                  </div>
                                  {category.icons.map((icon) => {
                                    const IconComponent = icon.component;
                                    return (
                                      <SelectItem key={icon.value} value={icon.value}>
                                        <div className="flex items-center gap-2">
                                          <IconComponent className="w-4 h-4" />
                                          {icon.label}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gradient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gradiente</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um gradiente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADIENT_OPTIONS.map((gradient) => (
                                <SelectItem key={gradient.value} value={gradient.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient.value}`}></div>
                                    {gradient.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ResponsiveGrid>

                  <ResponsiveGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 50 minutos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: R$ 150" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ResponsiveGrid>

                  <ResponsiveGrid cols={3}>
                    <FormField
                      control={form.control}
                      name="showPrice"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Mostrar Preço</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showDuration"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Mostrar Duração</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Ativo</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </ResponsiveGrid>

                  <div className="pt-4 border-t border-gray-100">
                    <ResponsiveButtonGroup align="right">
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
                        className="w-full sm:w-auto btn-admin"
                      >
                        {editingService ? "Atualizar" : "Criar"}
                      </Button>
                    </ResponsiveButtonGroup>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {localServices.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço</h3>
            <p className="text-gray-500 mb-4">Comece adicionando o primeiro serviço oferecido</p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-admin">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro serviço
            </Button>
          </div>
        ) : (
          <DragAndDropContainer
            items={localServices.map(s => ({ id: s.id, order: s.order }))}
            onReorder={handleReorder}
          >
            {localServices.map((service, index) => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <DragAndDropItem
                  key={service.id}
                  id={service.id}
                  isActive={service.isActive}
                  isFirst={index === 0}
                  isLast={index === localServices.length - 1}
                  onToggleActive={() => handleToggleActive(service.id, !service.isActive)}
                  onMoveUp={() => handleMoveUp(service.id)}
                  onMoveDown={() => handleMoveDown(service.id)}
                  onEdit={() => handleEdit(service)}
                  onDelete={() => handleDelete(service.id)}
                >
                  <div className="w-full max-w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      {/* Ícone */}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.gradient} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0 max-w-full w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {service.title}
                          </h4>
                          <div className="flex gap-1 flex-wrap">
                            {service.showPrice && service.price && (
                              <Badge variant="secondary" className="text-xs">
                                {service.price}
                              </Badge>
                            )}
                            {service.showDuration && service.duration && (
                              <Badge variant="outline" className="text-xs">
                                {service.duration}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 break-words">
                          {service.description}
                        </p>
                      </div>
                    </div>
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