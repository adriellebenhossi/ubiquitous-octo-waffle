
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Type, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface SchedulingCardFormProps {
  configs: SiteConfig[];
}

const schedulingCardSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string().min(1, "Subtítulo é obrigatório"),
  description: z.string().optional(),
  buttonText: z.string().min(1, "Texto do botão é obrigatório"),
});

type SchedulingCardForm = z.infer<typeof schedulingCardSchema>;

export function SchedulingCardForm({ configs }: SchedulingCardFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const schedulingCard = getConfigValue('scheduling_card') as any;

  const form = useForm<SchedulingCardForm>({
    resolver: zodResolver(schedulingCardSchema),
    defaultValues: {
      title: schedulingCard.title || "Vamos conversar?",
      subtitle: schedulingCard.subtitle || "Agende sua consulta",
      description: schedulingCard.description || "Estou aqui para te ajudar a encontrar o equilíbrio emocional",
      buttonText: schedulingCard.buttonText || "Falar no WhatsApp",
    },
  });

  React.useEffect(() => {
    if (schedulingCard && Object.keys(schedulingCard).length > 0) {
      form.reset({
        title: schedulingCard.title || "Vamos conversar?",
        subtitle: schedulingCard.subtitle || "Agende sua consulta",
        description: schedulingCard.description || "Estou aqui para te ajudar a encontrar o equilíbrio emocional",
        buttonText: schedulingCard.buttonText || "Falar no WhatsApp",
      });
    }
  }, [schedulingCard, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SchedulingCardForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "scheduling_card",
        value: data
      });
      return response.json();
    },
    onSuccess: (newConfig) => {
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const filtered = old.filter(config => config.key !== 'scheduling_card');
        return [...filtered, newConfig];
      });
      toast({ title: "Card de agendamento atualizado com sucesso!" });
    },
  });

  const onSubmit = (data: SchedulingCardForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="p-1 bg-purple-100 rounded">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </div>
                Título Principal
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Vamos conversar?" 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                <div className="flex items-center gap-1 flex-wrap">
                  Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: Vamos (conversar)!
                </div>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="p-1 bg-blue-100 rounded">
                  <Type className="w-3 h-3 text-blue-600" />
                </div>
                Subtítulo
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Agende sua consulta" 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                <div className="flex items-center gap-1 flex-wrap">
                  Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: Agende sua (consulta)
                </div>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="p-1 bg-green-100 rounded">
                  <FileText className="w-3 h-3 text-green-600" />
                </div>
                Descrição (Opcional)
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Estou aqui para te ajudar a encontrar o equilíbrio emocional" 
                  rows={4} 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100">
                Texto adicional que aparece no card (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="p-1 bg-blue-100 rounded">
                  <Type className="w-3 h-3 text-blue-600" />
                </div>
                Texto do Botão
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Falar no WhatsApp" 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                Texto que aparece no botão de ação do card
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateMutation.isPending} className="btn-admin">
          {updateMutation.isPending ? "Salvando..." : "Salvar card"}
        </Button>
      </form>
    </Form>
  );
}
