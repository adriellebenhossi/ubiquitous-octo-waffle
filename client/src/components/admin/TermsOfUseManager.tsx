/**
 * TermsOfUseManager.tsx
 * 
 * Gerenciador de Termos de Uso no painel administrativo
 * Editor rich text para conteúdo HTML dos termos
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, FileText, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

const termsOfUseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  isActive: z.boolean(),
});

type TermsOfUseForm = z.infer<typeof termsOfUseSchema>;

interface TermsOfUse extends TermsOfUseForm {
  id: number;
  lastUpdated: string;
  updatedAt: string;
}

export function TermsOfUseManager() {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  // Buscar termos atuais
  const { data: terms, isLoading } = useQuery<TermsOfUse>({
    queryKey: ['/api/terms-of-use'],
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<TermsOfUseForm>({
    resolver: zodResolver(termsOfUseSchema),
    defaultValues: {
      title: "Termos de Uso",
      content: "",
      isActive: true,
    },
  });

  // Atualizar formulário quando dados chegarem
  useState(() => {
    if (terms) {
      form.reset({
        title: terms.title,
        content: terms.content,
        isActive: terms.isActive,
      });
    }
  });

  // Mutação para salvar termos
  const updateMutation = useMutation({
    mutationFn: async (data: TermsOfUseForm) => {
      const response = await apiRequest('PUT', '/api/admin/terms-of-use', data);
      if (!response.ok) {
        throw new Error('Erro ao salvar termos');
      }
      return response.json();
    },
    onSuccess: (updatedData, formData) => {
      // Atualizar cache diretamente
      queryClient.setQueryData(['/api/terms-of-use'], updatedData);
      
      toast({
        title: "Termos salvos",
        description: "Os termos de uso foram atualizados com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os termos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TermsOfUseForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  const watchedValues = form.watch();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Termos de Uso
              </h3>
              <p className="text-sm text-gray-600">
                Gerencie o conteúdo dos termos de uso do site
              </p>
            </div>
          </div>

          <Link href="/terms-of-use">
            <Button variant="outline" size="sm">
              <ExternalLink size={16} className="mr-2" />
              Ver página
            </Button>
          </Link>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status ativo/inativo */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      Termos ativos
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Controla se os termos estão visíveis publicamente
                    </div>
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

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título dos termos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Termos de Uso"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conteúdo */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo dos termos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o conteúdo dos termos de uso aqui. Você pode usar HTML básico como <h2>, <p>, <strong>, etc."
                      className="min-h-[300px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    Suporte a HTML básico: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-admin w-full sm:flex-1"
              >
                <Save size={16} className="mr-2" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar informações'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full sm:w-auto"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? 'Ocultar' : 'Preview'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      {/* Preview do conteúdo */}
      {showPreview && (
        <Card className="p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Visualização do Conteúdo
          </h4>
          
          <div className="bg-white rounded-lg p-6 border max-h-96 overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {watchedValues.title}
            </h1>
            
            <div 
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: watchedValues.content }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}