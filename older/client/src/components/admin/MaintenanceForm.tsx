
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

export function MaintenanceForm({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const maintenanceSchema = z.object({
    isEnabled: z.boolean(),
    title: z.string().min(1, "Título é obrigatório"),
    message: z.string().min(1, "Mensagem é obrigatória"),
  });

  type MaintenanceForm = z.infer<typeof maintenanceSchema>;

  // Extrair configurações de manutenção
  const getMaintenanceData = () => {
    const maintenanceConfig = configs?.find(c => c.key === 'maintenance_mode')?.value as any || {};
    
    return {
      isEnabled: maintenanceConfig.isEnabled ?? false,
      title: maintenanceConfig.title || "Site em Manutenção",
      message: maintenanceConfig.message || "Estamos fazendo algumas melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!",
    };
  };

  const form = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: getMaintenanceData(),
  });

  // Atualiza o formulário quando as configurações mudam
  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getMaintenanceData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: MaintenanceForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: 'maintenance_mode',
        value: data
      });
      return response.json();
    },
    onSuccess: (updatedConfig, data) => {
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const filtered = old.filter(c => c.key !== 'maintenance_mode');
        return [...filtered, { key: 'maintenance_mode', value: data }];
      });
      toast({ 
        title: "Configurações de manutenção atualizadas!",
        description: "As alterações foram salvas com sucesso."
      });
    },
    onError: () => {
      toast({ 
        title: "Erro ao salvar configurações", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: MaintenanceForm) => {
    updateMutation.mutate(data);
  };

  const currentData = form.watch();

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-orange-800">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="break-words">Modo de manutenção</span>
        </CardTitle>
        <CardDescription className="text-orange-700 text-xs sm:text-sm">
          Controle se o site fica público ou exibe uma página de manutenção
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Alerta quando manutenção está ativa */}
        {currentData.isEnabled && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Modo manutenção ativo</AlertTitle>
            <AlertDescription className="text-red-700">
              O site está atualmente em modo de manutenção. Apenas administradores podem acessar o painel. 
              Os visitantes verão a página de manutenção configurada abaixo.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 bg-white">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <FormLabel className="text-sm sm:text-base font-medium break-words">
                      Ativar modo manutenção
                    </FormLabel>
                    <div className="text-xs sm:text-sm text-muted-foreground break-words">
                      Quando ativo, apenas administradores podem acessar o site completo
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-red-500 flex-shrink-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Configurações da página de manutenção</h4>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Página</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Site em Manutenção" 
                        {...field} 
                        className="bg-white"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Título principal exibido na página de manutenção
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem para os Visitantes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Estamos fazendo algumas melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!"
                        rows={4}
                        {...field} 
                        className="bg-white"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Mensagem explicativa sobre a manutenção
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="btn-admin w-full sm:w-auto"
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar configurações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
