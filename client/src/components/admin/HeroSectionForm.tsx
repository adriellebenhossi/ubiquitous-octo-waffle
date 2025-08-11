
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";
import { HeroImageUpload } from "./HeroImageUpload";
import { Upload } from "lucide-react";

interface HeroSectionFormProps {
  configs: SiteConfig[];
}

export function HeroSectionForm({ configs }: HeroSectionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const heroSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().min(1, "Subtítulo é obrigatório"),
    buttonText1: z.string().min(1, "Texto do botão 1 é obrigatório"),
    buttonText2: z.string().min(1, "Texto do botão 2 é obrigatório"),
  });

  type HeroForm = z.infer<typeof heroSchema>;

  const getHeroData = () => {
    const heroSection = configs?.find(c => c.key === 'hero_section')?.value as any || {};
    
    return {
      title: heroSection.title || "Cuidando da sua saúde mental com carinho",
      subtitle: heroSection.subtitle || "Psicóloga especializada em terapia cognitivo-comportamental",
      buttonText1: heroSection.buttonText1 || "Agendar consulta",
      buttonText2: heroSection.buttonText2 || "Saiba mais",
    };
  };

  const form = useForm<HeroForm>({
    resolver: zodResolver(heroSchema),
    defaultValues: getHeroData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getHeroData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: HeroForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "hero_section",
        value: data
      });
    },
    onSuccess: () => {
      // Atualiza cache manualmente SEM invalidação para evitar recarregamentos
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'hero_section');
        
        const newConfig = {
          key: 'hero_section',
          value: {
            title: form.getValues('title'),
            subtitle: form.getValues('subtitle'),
            buttonText1: form.getValues('buttonText1'),
            buttonText2: form.getValues('buttonText2'),
          }
        };
        
        if (index >= 0) {
          updated[index] = newConfig;
        } else {
          updated.push(newConfig);
        }
        
        return updated;
      });
      
      toast({ title: "Seção Hero atualizada com sucesso!" });
    },
  });

  const onSubmit = (data: HeroForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Upload de Foto de Perfil Principal */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Foto de Perfil Principal
        </h4>
        <p className="text-sm text-muted-foreground">
          Esta foto aparecerá automaticamente em todas as seções do site: Header, Hero, Footer e seção sobre.
        </p>
        <HeroImageUpload />
      </div>

      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800">
          🎨 Use (palavra) para aplicar cores degradê automáticas nos títulos. Exemplo: "Cuidando da sua (saúde mental)"
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título principal</FormLabel>
                <FormControl>
                  <Input placeholder="Cuidando da sua saúde mental com carinho" {...field} />
                </FormControl>
                <FormDescription>
                  Frase de impacto que define sua abordagem profissional. Use (palavra) para efeito degradê.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Textarea placeholder="Psicóloga especializada em terapia cognitivo-comportamental..." rows={3} {...field} />
                </FormControl>
                <FormDescription>
                  Descrição mais detalhada sobre sua especialização e abordagem terapêutica
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buttonText1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto botão 1 (principal)</FormLabel>
                  <FormControl>
                    <Input placeholder="Agendar consulta" {...field} />
                  </FormControl>
                  <FormDescription>
                    Botão principal que leva para a seção de contato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonText2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto botão 2 (secundário)</FormLabel>
                  <FormControl>
                    <Input placeholder="Saiba mais" {...field} />
                  </FormControl>
                  <FormDescription>
                    Botão que rola a página para a seção "sobre"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending} className="btn-admin w-full sm:w-auto">
            {updateMutation.isPending ? "Salvando..." : "Salvar Seção Hero"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
