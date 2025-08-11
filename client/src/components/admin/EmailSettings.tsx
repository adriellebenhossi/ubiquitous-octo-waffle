/**
 * EmailSettings.tsx
 * 
 * Componente para configurações de email no painel administrativo
 * Permite configurar e testar o Mailgun
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const testEmailSchema = z.object({
  subject: z.string().min(1, "Assunto é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  senderName: z.string().min(1, "Nome é obrigatório"),
  senderEmail: z.string().email("Email inválido"),
});

type TestEmailForm = z.infer<typeof testEmailSchema>;

export function EmailSettings() {
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<{success: boolean, error?: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TestEmailForm>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      subject: "Teste de Email - Sistema Configurado",
      message: "Este é um email de teste para verificar se o sistema de email está funcionando corretamente com o Mailgun.",
      senderName: "Administrador do Sistema",
      senderEmail: "admin@test.com",
    },
  });

  // Mutation para testar conexão do Mailgun
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/test-email-connection");
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(data);
      if (data.success) {
        toast({ 
          title: "Conexão testada com sucesso!", 
          description: "O Mailgun está configurado corretamente." 
        });
      } else {
        toast({ 
          title: "Erro na conexão", 
          description: data.error || "Erro desconhecido",
          variant: "destructive" 
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao testar conexão:", error);
      setTestResult({ success: false, error: "Erro ao conectar com o servidor" });
      toast({ 
        title: "Erro na conexão", 
        description: "Não foi possível testar a conexão",
        variant: "destructive" 
      });
    },
  });

  // Mutation para enviar email de teste
  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: TestEmailForm) => {
      const response = await apiRequest("POST", "/api/admin/send-test-email", {
        name: data.senderName,
        email: data.senderEmail,
        subject: data.subject,
        message: data.message,
        type: "test"
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ 
          title: "Email de teste enviado!", 
          description: "Verifique sua caixa de entrada." 
        });
        setTestResult({ success: true });
      } else {
        toast({ 
          title: "Erro ao enviar email", 
          description: data.error || "Erro desconhecido",
          variant: "destructive" 
        });
        setTestResult({ success: false, error: data.error });
      }
    },
    onError: (error) => {
      console.error("Erro ao enviar email de teste:", error);
      toast({ 
        title: "Erro ao enviar email", 
        description: "Não foi possível enviar o email de teste",
        variant: "destructive" 
      });
      setTestResult({ success: false, error: "Erro ao conectar com o servidor" });
    },
  });

  const onSubmitTest = (data: TestEmailForm) => {
    setIsLoading(true);
    sendTestEmailMutation.mutate(data);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Status da Configuração */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Settings className="w-4 h-4 text-white" />
            </div>
            Status da configuração do email
          </CardTitle>
          <CardDescription className="text-sm">
            Verifique se o Mailgun está configurado corretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botão de teste de conexão */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => testConnectionMutation.mutate()}
              disabled={testConnectionMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {testConnectionMutation.isPending ? "Testando..." : "Testar Conexão Mailgun"}
            </Button>
          </div>

          {/* Resultado do teste de conexão */}
          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  {testResult.success 
                    ? "✅ Mailgun configurado corretamente! Sistema pronto para enviar emails."
                    : `❌ Erro na configuração: ${testResult.error}`
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Informações de configuração */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📧 Configurações ativas:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• <strong>Serviço:</strong> Mailgun</div>
              <div>• <strong>Status:</strong> Configurado via Secrets</div>
              <div>• <strong>Domínio:</strong> Configurado</div>
              <div>• <strong>Email de destino:</strong> Configurado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Envio de Email */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Send className="w-4 h-4 text-white" />
            </div>
            Teste de Envio de Email
          </CardTitle>
          <CardDescription className="text-sm">
            Envie um email de teste para verificar se tudo está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitTest)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Remetente</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senderEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Remetente</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Assunto do email de teste" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite sua mensagem de teste aqui..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={sendTestEmailMutation.isPending || isLoading}
                className="w-full flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendTestEmailMutation.isPending || isLoading ? "Enviando..." : "Enviar Email de Teste"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Informações sobre o sistema */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <CardContent className="p-6">
          <h4 className="font-medium text-purple-900 mb-3">📋 Como funciona o sistema de email:</h4>
          <div className="text-sm text-purple-800 space-y-2">
            <div>• Todas as mensagens do formulário de contato do site são enviadas automaticamente</div>
            <div>• Os emails chegam no endereço configurado nas secrets</div>
            <div>• O sistema usa Mailgun para garantir entrega confiável</div>
            <div>• Logs detalhados são registrados no console para monitoramento</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}