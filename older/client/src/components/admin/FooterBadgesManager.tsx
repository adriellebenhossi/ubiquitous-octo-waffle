/**
 * FooterBadgesManager.tsx
 * 
 * Gerenciador completo de badges do rodapé (CFP, cadeado, etc.)
 * Permite configurar cores, ícones, texto, gradientes e reordenação
 * Interface moderna com drag-and-drop e editor de cores
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  CheckCircle,
  ShieldCheck,
  Scale,
  Award,
  Star,
  Heart,
  Settings,
  GripVertical,
  Globe,
  Users,
  FileCheck,
  Zap,
  Crown,
  Gem,
  Badge as BadgeIcon,
  Verified,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DragAndDropContainer } from './base/DragAndDropContainer';
import { DragAndDropItem } from './base/DragAndDropItem';
import { ModernIconSelector } from './base/ModernIconSelector';

// Schema de validação para badges
const badgeSchema = z.object({
  label: z.string().min(1, 'Texto é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().min(4, 'Cor é obrigatória'),
  backgroundColor: z.string().min(4, 'Cor de fundo é obrigatória'),
  gradientFrom: z.string().min(4, 'Cor inicial do gradiente é obrigatória'),
  gradientTo: z.string().min(4, 'Cor final do gradiente é obrigatória'),
  useGradient: z.boolean(),
  textColor: z.string().min(4, 'Cor do texto é obrigatória'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type BadgeForm = z.infer<typeof badgeSchema>;

interface Badge {
  id: number;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  useGradient: boolean;
  textColor: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export function FooterBadgesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Buscar configurações do footer
  const { data: footerSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/footer-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/footer-settings');
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const badges: Badge[] = footerSettings?.trust_seals || [];

  // Debug: Log para verificar dados
  React.useEffect(() => {
    console.log('FooterBadgesManager - footerSettings:', footerSettings);
    console.log('FooterBadgesManager - badges:', badges);
    console.log('FooterBadgesManager - isLoading:', isLoading);
  }, [footerSettings, badges, isLoading]);

  // Ícones disponíveis expandido
  const availableIcons = [
    // Segurança & Proteção
    { value: 'shield', label: 'Escudo', icon: Shield, category: 'Segurança' },
    { value: 'lock', label: 'Cadeado', icon: Lock, category: 'Segurança' },
    { value: 'shield-check', label: 'Escudo Verificado', icon: ShieldCheck, category: 'Segurança' },
    { value: 'verified', label: 'Verificado', icon: Verified, category: 'Segurança' },
    
    // Certificações & Qualidade
    { value: 'check-circle', label: 'Aprovado', icon: CheckCircle, category: 'Certificação' },
    { value: 'badge', label: 'Distintivo', icon: BadgeIcon, category: 'Certificação' },
    { value: 'award', label: 'Prêmio', icon: Award, category: 'Certificação' },
    { value: 'crown', label: 'Coroa', icon: Crown, category: 'Certificação' },
    { value: 'gem', label: 'Joia', icon: Gem, category: 'Certificação' },
    { value: 'star', label: 'Estrela', icon: Star, category: 'Certificação' },
    
    // Profissional & Legal
    { value: 'scale', label: 'Balança', icon: Scale, category: 'Legal' },
    { value: 'file-check', label: 'Documento', icon: FileCheck, category: 'Legal' },
    { value: 'book-open', label: 'Livro', icon: BookOpen, category: 'Legal' },
    
    // Atendimento & Serviços
    { value: 'users', label: 'Pessoas', icon: Users, category: 'Atendimento' },
    { value: 'heart', label: 'Coração', icon: Heart, category: 'Atendimento' },
    { value: 'clock', label: 'Horário', icon: Clock, category: 'Atendimento' },
    { value: 'calendar', label: 'Agenda', icon: Calendar, category: 'Atendimento' },
    { value: 'map-pin', label: 'Localização', icon: MapPin, category: 'Atendimento' },
    
    // Contato & Comunicação
    { value: 'phone', label: 'Telefone', icon: Phone, category: 'Contato' },
    { value: 'mail', label: 'Email', icon: Mail, category: 'Contato' },
    { value: 'globe', label: 'Website', icon: Globe, category: 'Contato' },
    
    // Tecnologia & Inovação
    { value: 'zap', label: 'Energia', icon: Zap, category: 'Tecnologia' },
    { value: 'sparkles', label: 'Brilho', icon: Sparkles, category: 'Tecnologia' },
    { value: 'credit-card', label: 'Pagamento', icon: CreditCard, category: 'Tecnologia' },
    { value: 'settings', label: 'Configurações', icon: Settings, category: 'Tecnologia' },
  ];

  // Form para criar/editar badge
  const form = useForm<BadgeForm>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      label: '',
      icon: 'shield',
      color: '#3b82f6',
      backgroundColor: '#3b82f6',
      gradientFrom: '#3b82f6',
      gradientTo: '#1d4ed8',
      useGradient: true,
      textColor: '#ffffff',
      description: '',
      isActive: true,
    },
  });

  // Mutation para atualizar footer
  const updateFooterMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      try {
        console.log('🚀 Frontend: Enviando dados para API:', JSON.stringify(updatedData, null, 2));
        const response = await apiRequest('PUT', '/api/admin/footer-settings', updatedData);
        const result = await response.json();
        console.log('✅ Frontend: Resposta recebida da API:', JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error('❌ Frontend: Erro na requisição:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Frontend: Mutation bem-sucedida, atualizando cache');
      queryClient.setQueryData(['/api/admin/footer-settings'], data);
      toast({
        title: '✨ Badges atualizados!',
        description: 'As configurações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      console.error('❌ Frontend: Erro na mutation:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast({
        title: '❌ Erro',
        description: 'Falha ao salvar as configurações.',
        variant: 'destructive',
      });
    },
  });

  // Criar novo badge
  const createBadge = (data: BadgeForm) => {
    if (!footerSettings) return;

    const newBadge: Badge = {
      id: Date.now(),
      ...data,
      order: badges.length,
    };

    const updatedBadges = [...badges, newBadge];
    
    const payload = {
      id: footerSettings.id,
      trust_seals: updatedBadges,
    };

    updateFooterMutation.mutate(payload);

    form.reset();
    setIsCreateDialogOpen(false);
  };

  // Editar badge existente
  const editBadge = (data: BadgeForm) => {
    if (!editingBadge || !footerSettings) return;

    const updatedBadges = badges.map(badge =>
      badge.id === editingBadge.id ? { ...badge, ...data } : badge
    );

    console.log('🔧 Editando badge - dados do formulário:', data);
    console.log('🔧 Badge sendo editado:', editingBadge);
    console.log('🔧 Badges atualizados:', updatedBadges);

    const payload = {
      id: footerSettings.id,
      trust_seals: updatedBadges,
    };

    console.log('🚀 Payload para edição:', payload);

    updateFooterMutation.mutate(payload);

    setEditingBadge(null);
    form.reset();
  };

  // Deletar badge
  const deleteBadge = (badgeId: number) => {
    const updatedBadges = badges.filter(badge => badge.id !== badgeId);
    
    const payload = {
      id: footerSettings.id,
      trust_seals: updatedBadges,
    };

    updateFooterMutation.mutate(payload);
  };

  // Toggle ativo/inativo
  const toggleBadgeActive = (badgeId: number) => {
    const updatedBadges = badges.map(badge =>
      badge.id === badgeId ? { ...badge, isActive: !badge.isActive } : badge
    );

    const payload = {
      id: footerSettings.id,
      trust_seals: updatedBadges,
    };

    updateFooterMutation.mutate(payload);
  };

  // Reordenar badges com drag and drop
  const handleReorder = (reorderedItems: { id: string | number; order: number; }[]) => {
    // Mapear itens reordenados de volta para badges
    const sortedBadges = badges.sort((a, b) => a.order - b.order);
    const updatedBadges = reorderedItems.map((item, index) => {
      const originalBadge = sortedBadges.find(badge => badge.id.toString() === item.id.toString());
      return originalBadge ? { ...originalBadge, order: index } : null;
    }).filter(Boolean) as Badge[];

    const payload = {
      id: footerSettings.id,
      trust_seals: updatedBadges,
    };

    updateFooterMutation.mutate(payload);

    toast({
      title: 'Ordem atualizada!',
      description: 'A ordem dos badges foi alterada com sucesso.',
    });
  };

  // Reordenar badges com setas
  const moveBadge = (badgeId: number, direction: 'up' | 'down') => {
    const currentIndex = badges.findIndex(b => b.id === badgeId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= badges.length) return;

    const reorderedBadges = [...badges];
    const [removed] = reorderedBadges.splice(currentIndex, 1);
    reorderedBadges.splice(newIndex, 0, removed);
    
    handleReorder(reorderedBadges);
  };

  // Preparar form para edição
  const startEdit = (badge: Badge) => {
    setEditingBadge(badge);
    form.reset({
      label: badge.label,
      icon: badge.icon,
      color: badge.color,
      backgroundColor: badge.backgroundColor,
      gradientFrom: badge.gradientFrom,
      gradientTo: badge.gradientTo,
      useGradient: badge.useGradient,
      textColor: badge.textColor,
      description: badge.description || '',
      isActive: badge.isActive,
    });
  };

  // Função para obter o componente do ícone
  const getBadgeIconComponent = (iconName: string) => {
    const iconConfig = availableIcons.find(icon => icon.value === iconName);
    return iconConfig ? iconConfig.icon : Shield; // Fallback para Shield
  };

  const renderBadgePreview = (badge: Badge) => {
    const style = badge.useGradient
      ? { background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})` }
      : { backgroundColor: badge.backgroundColor };

    const IconComponent = getBadgeIconComponent(badge.icon);

    return (
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden"
        style={style}
      >
        {/* Ícone principal */}
        <IconComponent 
          className="w-5 h-5 drop-shadow-sm" 
          style={{ color: badge.textColor || '#ffffff' }}
        />
        
        {/* Badge de verificação pequeno */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
          <CheckCircle className="w-2.5 h-2.5 text-white" fill="currentColor" />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              Badges do Rodapé
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Configure os badges de certificação (CFP, cadeado, etc.) exibidos no rodapé
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle>Criar novo badge</DialogTitle>
                  <DialogDescription id="dialog-description">
                    Configure um novo badge para exibir no rodapé do site
                  </DialogDescription>
                </DialogHeader>
                <BadgeForm
                  form={form}
                  onSubmit={createBadge}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  availableIcons={availableIcons}
                />
              </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={editingBadge !== null} onOpenChange={(open) => !open && setEditingBadge(null)}>
              <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto" aria-describedby="edit-dialog-description">
                <DialogHeader>
                  <DialogTitle>Editar badge</DialogTitle>
                  <DialogDescription id="edit-dialog-description">
                    Modifique as configurações do badge selecionado
                  </DialogDescription>
                </DialogHeader>
                <BadgeForm
                  form={form}
                  onSubmit={editBadge}
                  onCancel={() => setEditingBadge(null)}
                  availableIcons={availableIcons}
                  isEditing={true}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={async () => {
                try {
                  const response = await apiRequest('POST', '/api/admin/reset-footer-badges');
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/footer-settings'] });
                  toast({
                    title: 'Dados resetados!',
                    description: 'Os badges foram resetados para os valores padrão.',
                  });
                } catch (error) {
                  toast({
                    title: 'Erro',
                    description: 'Falha ao resetar os dados.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-spin" />
            <p>Carregando badges...</p>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum badge configurado ainda</p>
            <p className="text-sm">Clique em "Novo Badge" para começar</p>
          </div>
        ) : (
          <DragAndDropContainer
            items={badges.sort((a, b) => a.order - b.order)}
            onReorder={handleReorder}
          >
            {badges.sort((a, b) => a.order - b.order).map((badge, index) => (
              <DragAndDropItem
                key={badge.id}
                id={badge.id}
                isActive={badge.isActive}
                isFirst={index === 0}
                isLast={index === badges.length - 1}
                onToggleActive={() => toggleBadgeActive(badge.id)}
                onMoveUp={() => moveBadge(badge.id, 'up')}
                onMoveDown={() => moveBadge(badge.id, 'down')}
                onEdit={() => startEdit(badge)}
                onDelete={() => deleteBadge(badge.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {renderBadgePreview(badge)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{badge.label}</h4>
                      <Badge variant={badge.isActive ? 'default' : 'secondary'} className="text-xs">
                        {badge.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {badge.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{badge.description}</p>
                    )}
                  </div>
                </div>
              </DragAndDropItem>
            ))}
          </DragAndDropContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Componente do formulário
interface BadgeFormProps {
  form: any;
  onSubmit: (data: BadgeForm) => void;
  onCancel: () => void;
  availableIcons: any[];
  isEditing?: boolean;
}

function BadgeForm({ form, onSubmit, onCancel, availableIcons, isEditing = false }: BadgeFormProps) {
  const useGradient = form.watch('useGradient');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Texto do Badge */}
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto do badge</FormLabel>
                <FormControl>
                  <Input placeholder="CFP, 🔒, ⚖️..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ícone */}
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone</FormLabel>
                <ModernIconSelector
                  options={availableIcons.map(icon => ({
                    value: icon.value,
                    label: icon.label,
                    component: icon.icon,
                    category: 'Segurança & Confiança'
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione um ícone"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Switch para gradiente */}
        <FormField
          control={form.control}
          name="useGradient"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Usar Gradiente</FormLabel>
                <p className="text-sm text-gray-600">
                  Se desabilitado, usa cor sólida
                </p>
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

        {/* Cores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useGradient ? (
            <>
              <FormField
                control={form.control}
                name="gradientFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Inicial do Gradiente</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10" />
                        <Input {...field} placeholder="#3b82f6" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradientTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Final do Gradiente</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10" />
                        <Input {...field} placeholder="#1d4ed8" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <FormField
              control={form.control}
              name="backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor de Fundo</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="w-16 h-10" />
                      <Input {...field} placeholder="#3b82f6" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor do Texto</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="color" {...field} className="w-16 h-10" />
                    <Input {...field} placeholder="#ffffff" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do badge para tooltip/hover..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status ativo */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Badge Ativo</FormLabel>
                <p className="text-sm text-gray-600">
                  Badge será exibido no rodapé
                </p>
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

        <Separator />

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" className="btn-admin w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Salvar Alterações' : 'Criar Badge'}
          </Button>
        </div>
      </form>
    </Form>
  );
}