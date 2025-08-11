/**
 * ArticlesSectionTextsForm.tsx
 * 
 * Formulário para editar textos da seção de artigos
 * Gerencia título, subtítulo, badge e descrição
 * Interface simples e intuitiva para o admin
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, Sparkles, Type, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

const articlesTextsSchema = z.object({
  articles_title: z.string().min(1, "Título é obrigatório"),
  articles_badge: z.string().min(1, "Badge é obrigatório"),
  articles_description: z.string().min(1, "Descrição é obrigatória"),
  articles_button_text: z.string().min(1, "Texto do botão é obrigatório"),
  articles_button_icon: z.string().min(1, "Ícone do botão é obrigatório"),
});

type ArticlesTextsFormData = z.infer<typeof articlesTextsSchema>;

export function ArticlesSectionTextsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ArticlesTextsFormData>({
    resolver: zodResolver(articlesTextsSchema),
    defaultValues: {
      articles_title: "Artigos Científicos",
      articles_badge: "Publicações",
      articles_description: "Explore nossas publicações científicas mais recentes, pesquisas e estudos na área da psicologia clínica e comportamental.",
      articles_button_text: "Biblioteca Completa",
      articles_button_icon: "FileText",
    },
  });

  // Query para buscar configurações atuais
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json() as Promise<SiteConfig[]>;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Atualizar formulário quando os dados chegarem
  useEffect(() => {
    if (configs && Array.isArray(configs)) {
      const articlesTitle = configs.find(c => c.key === 'articles_title')?.value as string;
      const articlesBadge = configs.find(c => c.key === 'articles_badge')?.value as string;
      const articlesDescription = configs.find(c => c.key === 'articles_description')?.value as string;
      const articlesButtonText = configs.find(c => c.key === 'articles_button_text')?.value as string;
      const articlesButtonIcon = configs.find(c => c.key === 'articles_button_icon')?.value as string;

      form.reset({
        articles_title: articlesTitle || "Artigos Científicos",
        articles_badge: articlesBadge || "Publicações",
        articles_description: articlesDescription || "Explore nossas publicações científicas mais recentes, pesquisas e estudos na área da psicologia clínica e comportamental.",
        articles_button_text: articlesButtonText || "Biblioteca Completa",
        articles_button_icon: articlesButtonIcon || "FileText",
      });
    }
  }, [configs, form]);

  // Mutation para salvar configurações
  const saveMutation = useMutation({
    mutationFn: async (data: ArticlesTextsFormData) => {
      setIsLoading(true);
      const promises = Object.entries(data).map(([key, value]) =>
        apiRequest("POST", "/api/admin/config", { key, value })
      );
      
      await Promise.all(promises);
    },
    onSuccess: (response, data) => {
      // Atualizar cache admin para cada item
      Object.entries(data).forEach(([key, value]) => {
        queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
          const existingIndex = oldData.findIndex((config: any) => config.key === key);
          if (existingIndex >= 0) {
            return oldData.map((config, index) => 
              index === existingIndex 
                ? { ...config, value }
                : config
            );
          } else {
            return [...oldData, { key, value }];
          }
        });
      });
      
      toast({
        title: "Sucesso",
        description: "Textos da seção de artigos atualizados com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: ArticlesTextsFormData) => {
    saveMutation.mutate(data);
  };

  const resetToDefaults = () => {
    form.reset({
      articles_title: "Artigos Científicos",
      articles_badge: "Publicações",
      articles_description: "Explore nossas publicações científicas mais recentes, pesquisas e estudos na área da psicologia clínica e comportamental.",
      articles_button_text: "Biblioteca Completa",
      articles_button_icon: "FileText",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Textos da Seção de Artigos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Título */}
            <FormField
              control={form.control}
              name="articles_title"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="p-1 bg-purple-100 rounded">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                    </div>
                    Título Principal
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Artigos científicos" 
                      {...field} 
                      className="pl-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-purple-50/80 p-2 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-1 flex-wrap">
                      Coloque <Badge variant="outline" className="text-xs">()</Badge> em volta da palavra para aplicar gradiente. Ex: Artigos sobre (terapia)
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Badge */}
            <FormField
              control={form.control}
              name="articles_badge"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="p-1 bg-blue-100 rounded">
                      <Type className="w-3 h-3 text-blue-600" />
                    </div>
                    Badge
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Publicações" 
                      {...field} 
                      className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                    Texto que aparece no badge ao lado do ícone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="articles_description"
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
                      placeholder="Explore nossas publicações científicas mais recentes..."
                      rows={4}
                      {...field} 
                      className="pl-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-green-50/80 p-2 rounded-lg border border-green-100">
                    Descrição completa da seção que aparece abaixo do subtítulo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Separador Visual */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações do botão "Biblioteca completa"</h3>
            </div>

            {/* Texto do Botão */}
            <FormField
              control={form.control}
              name="articles_button_text"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <div className="p-1 bg-blue-100 rounded">
                      <Type className="w-3 h-3 text-blue-600" />
                    </div>
                    Texto do Botão
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Biblioteca completa" 
                      {...field} 
                      className="pl-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg">
                    Texto que aparece no botão que leva à página completa de artigos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ícone do Botão */}
            <FormField
              control={form.control}
              name="articles_button_icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone do Botão</FormLabel>
                  <FormControl>
                    <select 
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="FileText">📄 Arquivo de Texto</option>
                      <option value="Book">📖 Livro</option>
                      <option value="Bookmark">🔖 Marcador</option>
                      <option value="Library">📚 Biblioteca</option>
                      <option value="Archive">🗃️ Arquivo</option>
                      <option value="FolderOpen">📂 Pasta Aberta</option>
                      <option value="Globe">🌐 Globo</option>
                      <option value="Database">🗄️ Banco de Dados</option>
                      <option value="Search">🔍 Pesquisar</option>
                      <option value="ExternalLink">🔗 Link Externo</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    Ícone que aparece no botão "Biblioteca Completa"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || saveMutation.isPending}
                className="btn-admin w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={resetToDefaults}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurar Padrões
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}