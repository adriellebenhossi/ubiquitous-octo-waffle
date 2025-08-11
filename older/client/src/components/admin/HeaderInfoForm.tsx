import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

interface HeaderInfoFormProps {
  configs: SiteConfig[];
}

export function HeaderInfoForm({ configs }: HeaderInfoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const headerSchema = z.object({
    headerName: z.string().min(1, "Nome para Header/Navegação é obrigatório"),
    crp: z.string().min(1, "CFP é obrigatório"),
    siteName: z.string().min(1, "Nome do Site é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
  });

  type HeaderForm = z.infer<typeof headerSchema>;

  const getHeaderData = () => {
    const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};

    return {
      headerName: generalInfo.headerName || "Dra. Adrielle Benhossi",
      crp: generalInfo.crp || "08/123456",
      siteName: generalInfo.siteName || "Dra. Adrielle Benhossi - Psicóloga",
      description: generalInfo.description || "Psicóloga CFP 08/123456",
    };
  };

  const form = useForm<HeaderForm>({
    resolver: zodResolver(headerSchema),
    defaultValues: getHeaderData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getHeaderData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: HeaderForm) => {
      const promises = [
        apiRequest("POST", "/api/admin/config", {
          key: "general_info",
          value: {
            headerName: data.headerName,
            crp: data.crp,
            siteName: data.siteName,
            description: data.description,
          }
        }),
      ];
      return Promise.all(promises);
    },
    onSuccess: (result) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'general_info');
        
        if (index !== -1) {
          updated[index] = result[0];
        } else {
          updated.push(result[0]);
        }
        
        return updated;
      });

      // Atualizar cache público
      queryClient.setQueryData(["/api/config"], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'general_info');
        
        if (index !== -1) {
          updated[index] = result[0];
        } else {
          updated.push(result[0]);
        }
        
        return updated;
      });

      toast({
        title: "✅ Cabeçalho atualizado",
        description: "As informações profissionais foram salvas com sucesso!",
      });
    },
    onError: (error) => {
      console.error("❌ Erro ao salvar informações do cabeçalho:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Houve um problema ao salvar as informações do cabeçalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HeaderForm) => {
    console.log("💾 Salvando informações do cabeçalho:", data);
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Nome para Header/Navegação */}
          <FormField
            control={form.control}
            name="headerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">
                  Nome para Header/Navegação <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Dra. Adrielle Benhossi"
                    {...field}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Nome que aparece na barra de navegação (header) do site
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* CFP */}
          <FormField
            control={form.control}
            name="crp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">
                  CFP <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: 08/123456"
                    {...field}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Registro profissional no Conselho Federal de Psicologia
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Nome do Site */}
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Nome do Site <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Dra. Adrielle Benhossi - Psicóloga"
                  {...field}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Título principal do site que aparece na aba do navegador
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Descrição <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ex: Psicóloga CFP 08/123456 especializada em terapia cognitivo-comportamental"
                  rows={3}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl resizable-textarea"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Descrição profissional que aparece em mecanismos de busca e redes sociais
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-admin w-full sm:w-auto px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Salvando..." : "Salvar cabeçalho"}
          </Button>
        </div>
      </form>
    </Form>
  );
}