
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Type, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

interface ContactSectionFormProps {
  configs: SiteConfig[];
}

const contactSectionSchema = z.object({
  badge: z.string().min(1, "Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type ContactSectionForm = z.infer<typeof contactSectionSchema>;

export function ContactSectionForm({ configs }: ContactSectionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const contactSection = getConfigValue('contact_section') as any;

  const form = useForm<ContactSectionForm>({
    resolver: zodResolver(contactSectionSchema),
    defaultValues: {
      badge: contactSection.badge || "AGENDAMENTO",
      title: contactSection.title || "Vamos conversar?",
      description: contactSection.description || "Se algo dentro de você pede cuidado, atenção ou simplesmente um espaço para respirar — estou aqui.",
    },
  });

  React.useEffect(() => {
    if (contactSection && Object.keys(contactSection).length > 0) {
      form.reset({
        badge: contactSection.badge || "AGENDAMENTO",
        title: contactSection.title || "Vamos conversar?",
        description: contactSection.description || "Se algo dentro de você pede cuidado, atenção ou simplesmente um espaço para respirar — estou aqui.",
      });
    }
  }, [contactSection, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ContactSectionForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "contact_section",
        value: data
      });
      return response.json();
    },
    onSuccess: (updatedConfig, data) => {
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const filtered = old.filter(c => c.key !== 'contact_section');
        return [...filtered, { key: 'contact_section', value: data }];
      });
      toast({ title: "Seção de contato atualizada com sucesso!" });
    },
  });

  const onSubmit = (data: ContactSectionForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Type className="w-3 h-3 text-gray-400" />
                Subtítulo (badge)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: AGENDAMENTO" 
                  {...field} 
                  className="pl-4 py-3 mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
                <Sparkles className="w-3 h-3 text-gray-400" />
                Título Principal
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Vamos conversar?" 
                  {...field} 
                  className="pl-4 py-3 mt-2 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FileText className="w-3 h-3 text-gray-400" />
                Descrição
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ex: Se algo dentro de você pede cuidado, atenção ou simplesmente um espaço para respirar — estou aqui."
                  rows={4}
                  {...field} 
                  className="pl-4 py-3 mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100">
                Descrição que aparece na seção de contato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="w-full btn-admin"
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Form>
  );
}
