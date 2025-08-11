import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Type, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface SpecialtiesSectionTextsFormProps {
  configs: SiteConfig[];
}

export function SpecialtiesSectionTextsForm({ configs }: SpecialtiesSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const specialtiesTextsSchema = z.object({
    badge: z.string().min(1, "Badge é obrigatório"),
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
  });

  type SpecialtiesTextsForm = z.infer<typeof specialtiesTextsSchema>;

  const getSpecialtiesTextsData = () => {
    const specialtiesSection = configs?.find(c => c.key === 'specialties_section')?.value as any || {};

    return {
      badge: specialtiesSection.badge || "ESPECIALIDADES",
      title: specialtiesSection.title || "Minhas (Especialidades)",
      description: specialtiesSection.description || "Áreas de atuação onde posso te ajudar com experiência profissional",
    };
  };

  const form = useForm<SpecialtiesTextsForm>({
    resolver: zodResolver(specialtiesTextsSchema),
    defaultValues: getSpecialtiesTextsData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getSpecialtiesTextsData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SpecialtiesTextsForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "specialties_section",
        value: {
          badge: data.badge,
          title: data.title,
          description: data.description,
        }
      });
    },
    onSuccess: () => {
      // Atualiza cache manualmente SEM invalidação para evitar recarregamentos
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'specialties_section');
        
        const newConfig = {
          key: 'specialties_section',
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
      
      toast({ title: "Textos da seção Especialidades atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: SpecialtiesTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-full space-y-6 sm:space-y-8 mt-4">
          {/* Badge/Subtítulo */}
          <FormField
            control={form.control}
            name="badge"
            render={({ field }) => (
              <FormItem className="w-full space-y-3">
                <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 break-words">
                  <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                    <Type className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="break-words">Subtítulo/Badge</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ESPECIALIDADES" 
                    {...field} 
                    disabled={updateMutation.isPending}
                    className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg break-words">
                  Pequeno texto que identifica a seção, aparece acima do título
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full space-y-3">
                <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 break-words">
                  <div className="p-1 bg-purple-100 rounded flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="break-words">Título</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Minhas (Especialidades)" 
                    {...field} 
                    disabled={updateMutation.isPending}
                    className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </FormControl>
                <div className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-1 flex-wrap break-words">
                    <span className="break-words">Coloque</span> <Badge variant="outline" className="text-xs flex-shrink-0">()</Badge> <span className="break-words">em volta da palavra para aplicar gradiente. Ex: Minhas (especialidades)</span>
                  </div>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-3">
                <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800 break-words">
                  <div className="p-1 bg-green-100 rounded flex-shrink-0">
                    <FileText className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="break-words">Descrição</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Áreas de atuação onde posso te ajudar com experiência profissional" 
                    {...field} 
                    disabled={updateMutation.isPending}
                    rows={4}
                    className="pl-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100 break-words">
                  Descrição que explica o que significa esta seção
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Botão de Salvar */}
          <div className="flex justify-center w-full pt-2">
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="btn-admin w-full sm:w-auto min-w-[200px] px-8 py-3 text-sm font-medium"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar textos"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}