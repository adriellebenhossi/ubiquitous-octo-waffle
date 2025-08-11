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

interface AboutSectionTextsFormProps {
  configs: SiteConfig[];
}

export function AboutSectionTextsForm({ configs }: AboutSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const aboutSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().min(1, "Subtítulo é obrigatório"),
    professionalTitle: z.string().min(1, "Título profissional é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
  });

  type AboutTextsForm = z.infer<typeof aboutSchema>;

  const getAboutData = () => {
    const aboutSection = configs?.find(c => c.key === 'about_section')?.value as any || {};
    const professionalTitleInfo = configs?.find(c => c.key === 'professional_title')?.value as any || {};

    return {
      title: aboutSection.title || "Dra. Adrielle Benhossi",
      subtitle: aboutSection.subtitle || "SOBRE MIM",
      professionalTitle: professionalTitleInfo.title || "Psicóloga clínica",
      description: aboutSection.description || "Com experiência em terapia cognitivo-comportamental, ofereço um espaço seguro e acolhedor para você trabalhar suas questões emocionais e desenvolver ferramentas para uma vida mais equilibrada.",
    };
  };

  const form = useForm<AboutTextsForm>({
    resolver: zodResolver(aboutSchema),
    defaultValues: getAboutData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getAboutData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: AboutTextsForm) => {
      const promises = [
        apiRequest("POST", "/api/admin/config", {
          key: "about_section",
          value: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
          }
        }),
        apiRequest("POST", "/api/admin/config", {
          key: "professional_title",
          value: {
            title: data.professionalTitle,
          }
        }),
      ];

      await Promise.all(promises);
    },
    onSuccess: (_, data) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const filtered = old.filter(c => c.key !== 'about_section' && c.key !== 'professional_title');
        return [
          ...filtered,
          { key: 'about_section', value: { title: data.title, subtitle: data.subtitle, description: data.description } },
          { key: 'professional_title', value: { title: data.professionalTitle } }
        ];
      });

      // Atualizar cache público
      queryClient.setQueryData(["/api/config"], (old: any[] = []) => {
        const filtered = old.filter(c => c.key !== 'about_section' && c.key !== 'professional_title');
        return [
          ...filtered,
          { key: 'about_section', value: { title: data.title, subtitle: data.subtitle, description: data.description } },
          { key: 'professional_title', value: { title: data.professionalTitle } }
        ];
      });
      
      toast({ title: "Textos da seção sobre atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: AboutTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          
          {/* Grid responsivo principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Título da seção */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="p-1 bg-purple-100 rounded">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                    </div>
                    Título da seção
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Dra. Adrielle Benhossi" 
                      {...field} 
                      className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-1 flex-wrap">
                      Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: Dra. (Adrielle)
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subtítulo da seção */}
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="p-1 bg-blue-100 rounded">
                      <Type className="w-3 h-3 text-blue-600" />
                    </div>
                    Subtítulo da seção
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Sobre mim" 
                      {...field} 
                      className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                    Subtítulo que aparece como badge decorativo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Título profissional - largura total */}
          <FormField
            control={form.control}
            name="professionalTitle"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <div className="p-1 bg-blue-100 rounded">
                    <Type className="w-3 h-3 text-blue-600" />
                  </div>
                  Título profissional
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Psicóloga Clínica CFP 08/123456" 
                    {...field} 
                    className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                  Qualificação profissional e número do conselho (ex: CFP, CRM)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descrição principal */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <div className="p-1 bg-green-100 rounded">
                    <FileText className="w-3 h-3 text-green-600" />
                  </div>
                  Descrição profissional
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Com experiência em terapia cognitivo-comportamental, ofereço um espaço seguro e acolhedor para você trabalhar suas questões emocionais..." 
                    rows={5}
                    {...field} 
                    className="pl-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none min-h-[120px]"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100">
                  Apresentação detalhada da sua abordagem e experiência profissional. Seja autêntica e humanizada para gerar conexão
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botão de salvar com design melhorado */}
          <div className="flex items-center justify-center pt-4 sm:pt-6 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto btn-admin px-6 py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}