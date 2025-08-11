import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Save, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

const instructionsSchema = z.object({
  content: z.string().min(1, "Conteúdo das instruções é obrigatório"),
});

type InstructionsForm = z.infer<typeof instructionsSchema>;

export function InstructionsManager({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extrair instruções das configurações
  const getInstructionsData = () => {
    const instructionsConfig = configs?.find(c => c.key === 'admin_instructions')?.value as any || {};
    
    return {
      content: instructionsConfig.content || `# Instruções do Espaço administrativo

## Credenciais de Acesso
- **Email**: admin@sistema.local
- **Senha**: [inserir senha aqui]

## Informações Técnicas
- **Domínio**: exemplo.com.br
- **Hospedagem**: [inserir provedor]
- **Email**: [inserir configurações de email]

## Configurações Importantes
- **Facebook Pixel**: [inserir ID do pixel]
- **Google Analytics**: [inserir código GA]
- **Backup**: [inserir informações sobre backup]

## Instruções para Gestores
1. Para atualizar textos: vá na aba correspondente e clique em "Editar"
2. Para adicionar depoimentos: use a aba "Depoimentos" 
3. Para mudanças de design: use "Aparência"
4. Para marketing: use a aba "Marketing"

## Contatos Técnicos
- **Desenvolvedor**: [inserir contato]
- **Designer**: [inserir contato]
- **Suporte**: [inserir contato]

---
*Última atualização: ${new Date().toLocaleDateString('pt-BR')}*`
    };
  };

  const form = useForm<InstructionsForm>({
    resolver: zodResolver(instructionsSchema),
    defaultValues: getInstructionsData(),
  });

  // Atualiza o formulário quando as configurações mudam
  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getInstructionsData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: InstructionsForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: 'admin_instructions',
        value: { content: data.content }
      });
      return response.json();
    },
    onSuccess: (response, data) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const existingIndex = oldData.findIndex((config: any) => config.key === "admin_instructions");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: { content: data.content } }
              : config
          );
        } else {
          return [...oldData, { key: "admin_instructions", value: { content: data.content } }];
        }
      });
      
      toast({ 
        title: "Instruções atualizadas com sucesso!",
        description: "As alterações foram salvas."
      });
    },
    onError: () => {
      toast({ 
        title: "Erro ao salvar instruções", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: InstructionsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Instruções do Sistema
          </CardTitle>
          <CardDescription>
            Bloco de notas para informações importantes - senhas, configurações e instruções da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">🔒 Área Confidencial</h4>
            <div className="text-sm text-amber-800 space-y-1">
              <p>Esta área é destinada para informações internas e confidenciais.</p>
              <p>Use para armazenar senhas, configurações técnicas e instruções para a equipe.</p>
              <p className="font-medium">⚠️ Estas informações são visíveis apenas para administradores logados.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Conteúdo das instruções</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite aqui todas as informações importantes: senhas, configurações, instruções..."
                        rows={20}
                        className="font-mono text-sm resizable-textarea"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Suporte para Markdown: Use # para títulos, ** para negrito, - para listas, etc.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="btn-admin"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Salvando..." : "Salvar Instruções"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}