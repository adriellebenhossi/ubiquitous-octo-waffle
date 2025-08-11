/**
 * PrivacyPolicyManager.tsx
 * 
 * Gerenciador de Política de Privacidade no painel administrativo
 * Editor rich text para conteúdo HTML da política
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Shield, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

const privacyPolicySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  isActive: z.boolean(),
});

type PrivacyPolicyForm = z.infer<typeof privacyPolicySchema>;

interface PrivacyPolicy extends PrivacyPolicyForm {
  id: number;
  lastUpdated: string;
  updatedAt: string;
}

export function PrivacyPolicyManager() {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  // Buscar política atual
  const { data: policy, isLoading } = useQuery<PrivacyPolicy>({
    queryKey: ['/api/privacy-policy'],
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<PrivacyPolicyForm>({
    resolver: zodResolver(privacyPolicySchema),
    defaultValues: {
      title: "Política de Privacidade",
      content: "",
      isActive: true,
    },
  });

  // Atualizar formulário quando dados chegarem
  useState(() => {
    if (policy) {
      form.reset({
        title: policy.title,
        content: policy.content,
        isActive: policy.isActive,
      });
    }
  });

  // Mutação para salvar política
  const updateMutation = useMutation({
    mutationFn: async (data: PrivacyPolicyForm) => {
      const response = await apiRequest('PUT', '/api/admin/privacy-policy', data);
      if (!response.ok) {
        throw new Error('Erro ao salvar política');
      }
      return response.json();
    },
    onSuccess: (updatedPolicy) => {
      queryClient.setQueryData(['/api/privacy-policy'], updatedPolicy);
      toast({
        title: "Política salva",
        description: "A política de privacidade foi atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a política. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PrivacyPolicyForm) => {
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Política de Privacidade
              </h3>
              <p className="text-sm text-gray-600">
                Gerencie o conteúdo da política de privacidade do site
              </p>
            </div>
          </div>

          <Link href="/privacy-policy">
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
                      Política ativa
                    </FormLabel>
                    <div className="text-sm text-gray-600">
                      Controla se a política está visível publicamente
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
                  <FormLabel>Título da política</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Política de Privacidade"
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
                  <FormLabel>Conteúdo da política</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o conteúdo da política de privacidade aqui. Você pode usar HTML básico como <h2>, <p>, <strong>, etc."
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
                onClick={() => setShowPreview(!showPreview)}
                className="btn-admin-cancel w-full sm:w-auto"
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
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: watchedValues.content }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}