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
      content: instructionsConfig.content || `# Instruções do espaço administrativo

## Credenciais de acesso
- **Email**: admin@sistema.local
- **Senha**: [inserir senha aqui]

## Informações técnicas
- **Domínio**: exemplo.com.br
- **Hospedagem**: [inserir provedor]
- **Email**: [inserir configurações de email]

## Configurações importantes
- **Facebook Pixel**: [inserir ID do pixel]
- **Google Analytics**: [inserir código GA]
- **Backup**: [inserir informações sobre backup]

## Instruções para gestores
1. Para atualizar textos: vá na aba correspondente e clique em "Editar"
2. Para adicionar depoimentos: use a aba "Depoimentos" 
3. Para mudanças de design: use "Aparência"
4. Para marketing: use a aba "Marketing"

## Contatos técnicos
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
            Instruções do sistema
          </CardTitle>
          <CardDescription>
            Bloco de notas para informações importantes - senhas, configurações e instruções da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 border border-red-900/20 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white tracking-tight">Área confidencial</h4>
                <div className="ml-auto px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-full">
                  RESTRITO
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-slate-300">
                <p className="leading-relaxed">
                  Esta área é destinada para informações internas e confidenciais.
                </p>
                <p className="leading-relaxed">
                  Use para armazenar senhas, configurações técnicas e instruções para a equipe.
                </p>
                
                <div className="flex items-start gap-3 mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-200 font-medium leading-relaxed">
                    Estas informações são visíveis apenas para administradores logados.
                  </p>
                </div>
              </div>
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

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="btn-admin w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Salvando..." : "Salvar instruções"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}