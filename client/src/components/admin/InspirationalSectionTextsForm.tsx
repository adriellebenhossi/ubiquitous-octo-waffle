import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

const inspirationalSectionSchema = z.object({
  subtitle: z.string().min(1, "Subtítulo/Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type InspirationalSectionForm = z.infer<typeof inspirationalSectionSchema>;

interface InspirationalSectionTextsFormProps {
  configs: SiteConfig[];
}

export function InspirationalSectionTextsForm({ configs }: InspirationalSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inspirationalConfig = configs.find((c) => c.key === "inspirational_section");
  const currentData = inspirationalConfig?.value || {};

  const form = useForm<InspirationalSectionForm>({
    resolver: zodResolver(inspirationalSectionSchema),
    defaultValues: {
      subtitle: (currentData as any)?.subtitle || "",
      title: (currentData as any)?.title || "",
      description: (currentData as any)?.description || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InspirationalSectionForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "inspirational_section",
        value: {
          ...currentData,
          ...data,
        },
      });
      return response.json();
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        return old.map(config => 
          config.key === "inspirational_section" 
            ? { ...config, value: newData.value }
            : config
        );
      });
      toast({ title: "Textos da seção inspiracional atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: InspirationalSectionForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Type className="w-3 h-3 text-gray-400" />
                Subtítulo (badge)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="INSPIRAÇÃO" 
                  {...field} 
                  className="pl-4 py-3 mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                Badge que aparece acima do título. Use () para aplicar gradiente colorido.
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
                <Sparkles className="w-3 h-3 text-gray-400" />
                Título
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Pensamento do (Dia)" 
                  {...field} 
                  className="pl-4 py-3 mt-2 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                Título principal da seção. Use () para aplicar gradiente colorido.
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
                <FileText className="w-3 h-3 text-gray-400" />
                Descrição
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Reflexões que inspiram crescimento e bem-estar emocional"
                  rows={2}
                  className="resizable-textarea min-h-[60px] pl-4 py-3 mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                Descrição que aparece abaixo do título. Arraste o canto inferior direito para redimensionar.
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