
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Palette, Type, FileText, Sparkles, Save } from "lucide-react";
import type { SiteConfig } from "@shared/schema";

interface PhotoCarouselTextsFormProps {
  configs: SiteConfig[];
}

export function PhotoCarouselTextsForm({ configs }: PhotoCarouselTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const photoCarouselSchema = z.object({
    badge: z.string().min(1, "Badge é obrigatório"),
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
  });

  type PhotoCarouselTextsForm = z.infer<typeof photoCarouselSchema>;

  const getPhotoCarouselData = () => {
    const photoCarouselSection = configs?.find(c => c.key === 'photo_carousel_section')?.value as any || {};
    
    return {
      badge: photoCarouselSection.badge || "GALERIA",
      title: photoCarouselSection.title || "Galeria",
      description: photoCarouselSection.description || "Um espaço pensado especialmente para seu bem-estar e conforto durante as consultas",
    };
  };

  const form = useForm<PhotoCarouselTextsForm>({
    resolver: zodResolver(photoCarouselSchema),
    defaultValues: getPhotoCarouselData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getPhotoCarouselData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: PhotoCarouselTextsForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "photo_carousel_section",
        value: {
          badge: data.badge,
          title: data.title,
          description: data.description,
        }
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const filtered = old.filter(config => config.key !== 'photo_carousel_section');
        return [...filtered, response];
      });
      toast({ title: "Textos da galeria atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: PhotoCarouselTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Textos da Seção Galeria
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Configure os textos que aparecem no cabeçalho da galeria de fotos
            </CardDescription>
          </div>
        </div>
        

      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Badge Field */}
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
                    <div className="relative">
                      <Input 
                        placeholder="GALERIA" 
                        {...field} 
                        className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                    Pequeno texto que identifica a seção, aparece acima do título
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Field */}
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
                    <div className="relative">
                      <Input 
                        placeholder="Ambiente de (atendimento)" 
                        {...field} 
                        className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-1 flex-wrap">
                      Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: Ambiente de (atendimento)
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
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
                    <div className="relative">
                      <Textarea 
                        placeholder="Um cantinho sereno, projetado para que você se sinta confortável desde o primeiro momento." 
                        rows={4} 
                        {...field} 
                        className="pl-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100">
                    Descrição que explica o que significa esta seção
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Modern Submit Button */}
            <div className="pt-4 border-t border-gray-200/50">
              <div className="flex justify-center w-full">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="btn-admin w-full sm:w-auto min-w-[200px] px-8 py-3 text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {updateMutation.isPending ? "Salvando..." : "Salvar textos"}
                  </div>
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
