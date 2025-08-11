
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

interface FaqSectionTextsFormProps {
  configs: SiteConfig[];
}

const faqTextsSchema = z.object({
  badge: z.string().min(1, "Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type FaqTextsForm = z.infer<typeof faqTextsSchema>;

export function FaqSectionTextsForm({ configs }: FaqSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const faqTexts = getConfigValue('faq_section') as any;

  const form = useForm<FaqTextsForm>({
    resolver: zodResolver(faqTextsSchema),
    defaultValues: {
      badge: faqTexts.badge || "PERGUNTAS FREQUENTES",
      title: faqTexts.title || "Respondemos suas (principais dúvidas)",
      description: faqTexts.description || "Encontre respostas para as principais questões sobre o atendimento psicológico",
    },
  });

  React.useEffect(() => {
    if (faqTexts && Object.keys(faqTexts).length > 0) {
      form.reset({
        badge: faqTexts.badge || "PERGUNTAS FREQUENTES",
        title: faqTexts.title || "Respondemos suas (principais dúvidas)",
        description: faqTexts.description || "Encontre respostas para as principais questões sobre o atendimento psicológico",
      });
    }
  }, [faqTexts, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: FaqTextsForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "faq_section",
        value: data
      });
      return response.json();
    },
    onSuccess: (response, data) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const existingIndex = oldData.findIndex((config: any) => config.key === "faq_section");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: data }
              : config
          );
        } else {
          return [...oldData, { key: "faq_section", value: data }];
        }
      });
      
      toast({ title: "Textos da seção FAQ atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: FaqTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo/badge</FormLabel>
              <FormControl>
                <Input placeholder="PERGUNTAS FREQUENTES" {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">
                Pequeno texto que identifica a seção, aparece acima do título
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="p-1 bg-purple-100 rounded">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </div>
                Título
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Respondemos suas (principais dúvidas)" 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                <div className="flex items-center gap-1 flex-wrap">
                  Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: Respondemos suas (principais) dúvidas
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
                Descrição
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Encontre respostas para as principais questões sobre o atendimento psicológico" 
                  rows={4} 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100">
                Descrição que explica o que significa esta seção
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center w-full pt-2">
          <Button 
            type="submit" 
            disabled={updateMutation.isPending} 
            className="btn-admin w-full sm:w-auto min-w-[200px] px-8 py-3 text-sm font-medium"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar textos"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
