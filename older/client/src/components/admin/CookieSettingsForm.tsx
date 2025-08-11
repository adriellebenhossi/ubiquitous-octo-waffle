/**
 * CookieSettingsForm.tsx
 * 
 * Formulário para gerenciar configurações de cookies no painel administrativo
 * Permite personalizar mensagem, botões e posicionamento do pop-up de cookies
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Cookie, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

const cookieSettingsSchema = z.object({
  isEnabled: z.boolean(),
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  acceptButtonText: z.string().min(1, 'Texto do botão é obrigatório'),
  declineButtonText: z.string().min(1, 'Texto do botão é obrigatório'),
  privacyLinkText: z.string().min(1, 'Texto do link é obrigatório'),
  termsLinkText: z.string().min(1, 'Texto do link é obrigatório'),
});

type CookieSettingsForm = z.infer<typeof cookieSettingsSchema>;

interface CookieSettings extends CookieSettingsForm {
  id: number;
  updatedAt: string;
}

export function CookieSettingsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);

  // Buscar configurações atuais
  const { data: settings, isLoading } = useQuery<CookieSettings>({
    queryKey: ['/api/cookie-settings'],
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<CookieSettingsForm>({
    resolver: zodResolver(cookieSettingsSchema),
    defaultValues: {
      isEnabled: true,
      title: "Cookies & Privacidade",
      message: "Utilizamos cookies para melhorar sua experiência no site e personalizar conteúdo. Ao continuar navegando, você concorda com nossa política de privacidade.",
      acceptButtonText: "Aceitar Cookies",
      declineButtonText: "Não Aceitar",
      privacyLinkText: "Política de Privacidade",
      termsLinkText: "Termos de Uso",
    },
  });

  // Atualizar formulário quando dados chegarem
  useEffect(() => {
    if (settings) {
      console.log('Carregando configurações de cookies:', settings);
      form.reset({
        isEnabled: settings.isEnabled,
        title: settings.title,
        message: settings.message,
        acceptButtonText: settings.acceptButtonText,
        declineButtonText: (settings as any).declineButtonText || "Não Aceitar",
        privacyLinkText: settings.privacyLinkText,
        termsLinkText: settings.termsLinkText,
      });
    }
  }, [settings, form]);

  // Mutação para salvar configurações
  const updateMutation = useMutation({
    mutationFn: async (data: CookieSettingsForm) => {
      const response = await apiRequest('PUT', '/api/admin/cookie-settings', data);
      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }
      return response.json();
    },
    onSuccess: (updatedData) => {
      // Atualizar cache das configurações de cookies
      queryClient.setQueryData(['/api/cookie-settings'], updatedData.data);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de cookies foram atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CookieSettingsForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  const watchedValues = form.watch();

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="divide-y divide-gray-100">
            
            {/* Toggle Section */}
            <div className="p-6 sm:p-8">
              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <FormLabel className="text-base font-semibold text-gray-900">
                        Pop-up de Cookies
                      </FormLabel>
                      <div className="text-sm text-gray-500">
                        Ativa ou desativa a exibição do consentimento de cookies para visitantes
                      </div>
                    </div>
                    <FormControl>
                      <div className="flex-shrink-0">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-gray-900"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Título
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Título exibido no pop-up"
                        className="h-11 border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Message Field */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Mensagem
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Texto informativo sobre o uso de cookies"
                        className="min-h-[100px] sm:min-h-[120px] border-gray-300 focus:border-gray-400 focus:ring-gray-400 resize-y transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Buttons Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="acceptButtonText"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Botão Aceitar
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Texto do botão de aceitar"
                          className="h-11 border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="declineButtonText"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Botão Recusar
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Texto do botão de recusar"
                          className="h-11 border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="privacyLinkText"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Link Política de Privacidade
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Texto do link da política"
                          className="h-11 border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termsLinkText"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Link Termos de Uso
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Texto do link dos termos"
                          className="h-11 border-gray-300 focus:border-gray-400 focus:ring-gray-400 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="px-6 py-4 sm:px-8 sm:py-6 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                <Button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto h-11 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Preview Section */}
      {showPreview && watchedValues.isEnabled && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">
                Visualização do Pop-up
              </h4>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                Demonstrativo
              </span>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="relative max-w-lg mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 text-base leading-tight">
                      {watchedValues.title || 'Título do cookie'}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed">
                  {watchedValues.message || 'Mensagem sobre cookies aparecerá aqui...'}
                </p>
                
                <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                  <span>Leia nossa</span>
                  <button className="text-gray-800 underline hover:no-underline">
                    {watchedValues.privacyLinkText || 'Política de Privacidade'}
                  </button>
                  <span>e</span>
                  <button className="text-gray-800 underline hover:no-underline">
                    {watchedValues.termsLinkText || 'Termos de Uso'}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button className="flex-1 bg-gray-900 text-white text-center py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    {watchedValues.acceptButtonText || 'Aceitar'}
                  </button>
                  <button className="flex-1 text-gray-700 text-center py-2.5 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
                    {watchedValues.declineButtonText || 'Recusar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}