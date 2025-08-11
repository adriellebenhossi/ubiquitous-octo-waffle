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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo/Badge ()</FormLabel>
              <FormControl>
                <Input 
                  placeholder="INSPIRAÇÃO" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
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
            <FormItem>
              <FormLabel>Título ()</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Pensamento do (Dia)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
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
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Reflexões que inspiram crescimento e bem-estar emocional"
                  rows={2}
                  className="resizable-textarea min-h-[60px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
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