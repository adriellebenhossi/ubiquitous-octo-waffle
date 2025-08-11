
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

interface TestimonialsSectionTextsFormProps {
  configs: SiteConfig[];
}

const testimonialsTextsSchema = z.object({
  badge: z.string().min(1, "Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type TestimonialsTextsForm = z.infer<typeof testimonialsTextsSchema>;

export function TestimonialsSectionTextsForm({ configs }: TestimonialsSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const testimonialsTexts = getConfigValue('testimonials_section') as any;

  const form = useForm<TestimonialsTextsForm>({
    resolver: zodResolver(testimonialsTextsSchema),
    defaultValues: {
      badge: testimonialsTexts.badge || "DEPOIMENTOS",
      title: testimonialsTexts.title || "O que dizem sobre (mim)",
      description: testimonialsTexts.description || "Depoimentos de pessoas que encontraram acolhimento, superação e crescimento através do meu acompanhamento psicológico.",
    },
  });

  React.useEffect(() => {
    if (testimonialsTexts && Object.keys(testimonialsTexts).length > 0) {
      form.reset({
        badge: testimonialsTexts.badge || "DEPOIMENTOS",
        title: testimonialsTexts.title || "O que dizem sobre (mim)",
        description: testimonialsTexts.description || "Depoimentos de pessoas que encontraram acolhimento, superação e crescimento através do meu acompanhamento psicológico.",
      });
    }
  }, [testimonialsTexts, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: TestimonialsTextsForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "testimonials_section",
        value: data
      });
      return response.json();
    },
    onSuccess: (result) => {
      // Atualiza cache manualmente SEM invalidação para evitar recarregamentos
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'testimonials_section');
        
        const newConfig = {
          key: 'testimonials_section',
          value: {
            badge: form.getValues('badge'),
            title: form.getValues('title'),
            description: form.getValues('description'),
          }
        };
        
        if (index >= 0) {
          updated[index] = newConfig;
        } else {
          updated.push(newConfig);
        }
        
        return updated;
      });
      
      toast({ title: "Textos da seção de depoimentos atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: TestimonialsTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <div className="p-1 bg-blue-100 rounded">
                  <Type className="w-3 h-3 text-blue-600" />
                </div>
                Subtítulo/Badge
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="DEPOIMENTOS" 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                Pequeno texto que identifica a seção, aparece acima do título
              </FormDescription>
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
                  placeholder="O que dizem sobre (mim)" 
                  {...field} 
                  className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                <div className="flex items-center gap-1 flex-wrap">
                  Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: O que dizem sobre (mim)
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
                  placeholder="Depoimentos de pessoas que encontraram acolhimento, superação e crescimento através do meu acompanhamento psicológico." 
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
