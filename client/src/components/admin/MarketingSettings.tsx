import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Globe, Search, Ban, Code, Upload, Image, Share2, AlertCircle, Target, Save } from "lucide-react";
import { CustomCodesManager } from "./CustomCodesManager";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MarketingSettings({ configs }: { configs: SiteConfig[] }) {
  console.log('🚀 COMPONENTE - MarketingSettings montado/atualizado');
  console.log('🚀 Props recebidas - configs:', configs?.length || 0, 'itens');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===================== SEÇÃO 1: PIXELS DE MARKETING =====================
  
  const pixelsSchema = z.object({
    facebookPixel1: z.string().optional(),
    facebookPixel2: z.string().optional(),
    googlePixel: z.string().optional(),
    enableGoogleIndexing: z.boolean().default(true),
  });

  type PixelsForm = z.infer<typeof pixelsSchema>;

  const getPixelsData = () => {
    const marketingInfo = configs?.find(c => c.key === 'marketing_pixels')?.value as any || {};
    return {
      facebookPixel1: marketingInfo.facebookPixel1 || "",
      facebookPixel2: marketingInfo.facebookPixel2 || "",
      googlePixel: marketingInfo.googlePixel || "",
      enableGoogleIndexing: marketingInfo.enableGoogleIndexing ?? true,
    };
  };

  const pixelsForm = useForm<PixelsForm>({
    resolver: zodResolver(pixelsSchema),
    defaultValues: getPixelsData(),
  });

  React.useEffect(() => {
    pixelsForm.reset(getPixelsData());
  }, [configs]);

  const pixelsMutation = useMutation({
    mutationFn: async (data: PixelsForm) => {
      console.log('💾 Salvando pixels de marketing:', data);
      return apiRequest("POST", "/api/admin/config", {
        key: 'marketing_pixels',
        value: data
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/admin/config'], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'marketing_pixels');
        const config = {
          key: 'marketing_pixels',
          value: pixelsForm.getValues(),
          updatedAt: new Date().toISOString()
        };
        
        if (index >= 0) {
          updated[index] = config;
        } else {
          updated.push(config);
        }
        
        return updated;
      });
      
      toast({
        title: "Pixels salvos!",
        description: "Configurações de marketing atualizadas.",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao salvar pixels:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar os pixels de marketing.",
        variant: "destructive",
      });
    },
  });

  // ===================== SEÇÃO 2: SEO META TAGS =====================
  
  const seoSchema = z.object({
    metaTitle: z.string().min(1, "Título SEO é obrigatório"),
    metaDescription: z.string().min(1, "Descrição SEO é obrigatória"),
    metaKeywords: z.string().optional(),
    twitterCard: z.string().default("summary_large_image"),
  });

  type SeoForm = z.infer<typeof seoSchema>;

  const getSeoData = () => {
    const seoInfo = configs?.find(c => c.key === 'seo_meta')?.value as any || {};
    return {
      metaTitle: seoInfo.metaTitle || "Adrielle Benhossi - Psicóloga",
      metaDescription: seoInfo.metaDescription || "Psicóloga especialista em terapia. Atendimento presencial e online.",
      metaKeywords: seoInfo.metaKeywords || "psicóloga, terapia, saúde mental",
      twitterCard: seoInfo.twitterCard || "summary_large_image",
    };
  };

  const seoForm = useForm<SeoForm>({
    resolver: zodResolver(seoSchema),
    defaultValues: getSeoData(),
  });

  React.useEffect(() => {
    seoForm.reset(getSeoData());
  }, [configs]);

  const seoMutation = useMutation({
    mutationFn: async (data: SeoForm) => {
      console.log('💾 Salvando SEO meta tags:', data);
      return apiRequest("POST", "/api/admin/config", {
        key: 'seo_meta',
        value: data
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/admin/config'], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'seo_meta');
        const config = {
          key: 'seo_meta',
          value: seoForm.getValues(),
          updatedAt: new Date().toISOString()
        };
        
        if (index >= 0) {
          updated[index] = config;
        } else {
          updated.push(config);
        }
        
        return updated;
      });
      
      toast({
        title: "SEO salvo!",
        description: "Meta tags atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao salvar SEO:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar as configurações de SEO.",
        variant: "destructive",
      });
    },
  });

  // ===================== SEÇÃO 3: OPEN GRAPH =====================

  const openGraphSchema = z.object({
    ogImage: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
  });

  type OpenGraphForm = z.infer<typeof openGraphSchema>;

  // Estados simples para upload (baseado na versão antiga que funcionava)
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(() => {
    // Recuperar imagem temporária do localStorage se existir
    const tempImage = localStorage.getItem('temp_preview_image');
    return tempImage || "";
  });
  
  console.log('🖼️ Estado atual previewImage:', previewImage);

  const getOpenGraphData = () => {
    const ogInfo = configs?.find(c => c.key === 'open_graph')?.value as any || {};
    const seoInfo = configs?.find(c => c.key === 'seo_meta')?.value as any || {};
    
    return {
      ogImage: ogInfo.ogImage || "",
      ogTitle: ogInfo.ogTitle || "",
      ogDescription: ogInfo.ogDescription || "",
    };
  };

  const openGraphForm = useForm<OpenGraphForm>({
    resolver: zodResolver(openGraphSchema),
    defaultValues: getOpenGraphData(),
  });

  // Inicializar prévia com imagem existente - respeitando remoções
  React.useEffect(() => {
    const wasRemoved = localStorage.getItem('image_removed');
    
    if (wasRemoved) {
      console.log('🚫 Imagem foi removida intencionalmente, não restaurar');
      return;
    }
    
    const data = getOpenGraphData();
    if (data.ogImage && !previewImage) {
      console.log('🔄 Inicializando previewImage com:', data.ogImage);
      setPreviewImage(data.ogImage);
    }
  }, [configs, previewImage]);

  React.useEffect(() => {
    openGraphForm.reset(getOpenGraphData());
  }, [configs]);

  // Upload de imagem (versão simples que funcionava)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎯 UPLOAD INICIADO');
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('📁 Arquivo:', file.name, file.size, 'bytes');

    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande');
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    console.log('⏳ Iniciando upload...');
    setIsUploading(true);

    // Limpar flag de remoção ao fazer novo upload
    localStorage.removeItem('image_removed');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'seo');

      console.log('📤 Enviando requisição...');
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Resposta recebida:', response.status, response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload bem-sucedido! URL:', result.url);
        console.log('🖼️ Definindo previewImage para:', result.url);
        
        // Salvar no estado E no localStorage temporariamente
        setPreviewImage(result.url);
        localStorage.setItem('temp_preview_image', result.url);
        
        console.log('✅ Estado e localStorage atualizados!');
        
        toast({
          title: "Imagem carregada",
          description: "Clique em 'Salvar Open Graph' para aplicar.",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro do servidor:', response.status, errorText);
        throw new Error(`Falha no upload: ${response.status}`);
      }
    } catch (error) {
      console.error('💥 Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao carregar a imagem.",
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Finalizando upload...');
      setIsUploading(false);
    }
  };

  // Remover imagem (versão simples que funcionava)
  const handleRemoveImage = () => {
    console.log('🗑️ REMOVENDO IMAGEM');
    console.log('🗑️ Estado atual antes:', previewImage);
    
    setPreviewImage('');
    localStorage.removeItem('temp_preview_image');
    
    // Marcar que a imagem foi removida intencionalmente
    localStorage.setItem('image_removed', 'true');
    
    console.log('🗑️ Estado definido para vazio e localStorage limpo');
    
    toast({
      title: "Imagem removida",
      description: "Clique em 'Salvar Open Graph' para aplicar.",
    });
  };

  const openGraphMutation = useMutation({
    mutationFn: async (data: OpenGraphForm) => {
      console.log('💾 Salvando Open Graph:', data);
      
      const wasRemoved = localStorage.getItem('image_removed');
      
      // Usar previewImage se disponível, exceto se foi removida intencionalmente
      if (wasRemoved) {
        data.ogImage = '';
        console.log('🗑️ Imagem foi removida, salvando como vazio');
      } else if (previewImage) {
        data.ogImage = previewImage;
        console.log('📷 Usando imagem do estado:', previewImage);
      }
      
      return apiRequest("POST", "/api/admin/config", {
        key: 'open_graph',
        value: data
      });
    },
    onSuccess: () => {
      const wasRemoved = localStorage.getItem('image_removed');
      const formValues = openGraphForm.getValues();
      
      queryClient.setQueryData(['/api/admin/config'], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'open_graph');
        const config = {
          key: 'open_graph',
          value: {
            ...formValues,
            ogImage: wasRemoved ? '' : (previewImage || formValues.ogImage || ''),
          },
          updatedAt: new Date().toISOString()
        };
        
        if (index >= 0) {
          updated[index] = config;
        } else {
          updated.push(config);
        }
        
        return updated;
      });
      
      // Limpar estados temporários do localStorage após salvar
      localStorage.removeItem('temp_preview_image');
      localStorage.removeItem('image_removed');
      
      toast({
        title: "Open Graph salvo!",
        description: "Configurações de compartilhamento atualizadas.",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao salvar Open Graph:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar as configurações de Open Graph.",
        variant: "destructive",
      });
    },
  });

  const onPixelsSubmit = (data: PixelsForm) => {
    console.log('💾 SALVAMENTO Pixels:', data);
    pixelsMutation.mutate(data);
  };

  const onSeoSubmit = (data: SeoForm) => {
    console.log('💾 SALVAMENTO SEO:', data);
    seoMutation.mutate(data);
  };

  const onOpenGraphSubmit = (data: OpenGraphForm) => {
    console.log('💾 SALVAMENTO Open Graph:', data);
    openGraphMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">


      {/* ===================== SEÇÃO 1: PIXELS DE MARKETING ===================== */}
      
      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Pixels de marketing</CardTitle>
              <CardDescription>Facebook e Google Analytics</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200/60">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>🤖 Pixels são IAs das redes sociais</strong> que rastreiam comportamentos e usam machine learning 
              para conhecer visitantes melhor que a própria família. O Facebook conhece mais sobre você que sua mãe após apenas 6 curtidas!
            </p>
          </div>

          <Form {...pixelsForm}>
            <form onSubmit={pixelsForm.handleSubmit(onPixelsSubmit)} className="space-y-6">
              {/* Facebook Pixels */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Facebook Pixels</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">até 2</span>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={pixelsForm.control}
                    name="facebookPixel1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Pixel principal
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 1234567890123456" 
                            {...field} 
                            className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0 transition-colors font-mono text-sm"
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Business Manager → Eventos → Pixels
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={pixelsForm.control}
                    name="facebookPixel2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Pixel secundário <span className="text-gray-400">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 9876543210987654" 
                            {...field} 
                            className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0 transition-colors font-mono text-sm"
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Para campanhas específicas ou testes
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Google Pixel */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Google Analytics</h4>
                </div>
                
                <FormField
                  control={pixelsForm.control}
                  name="googlePixel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        ID do Google Analytics
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: G-XXXXXXXXXX ou GA_MEASUREMENT_ID" 
                          {...field} 
                          className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0 transition-colors font-mono text-sm"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        Google Analytics → Admin → Fluxos de dados
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Indexação do Google */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <FormField
                  control={pixelsForm.control}
                  name="enableGoogleIndexing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium text-gray-900">
                          Permitir indexação do Google
                        </FormLabel>
                        <FormDescription className="text-sm text-gray-600">
                          Permite que o Google encontre e indexe seu site nos resultados de busca
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Botão de Salvar Pixels */}
              <div className="flex justify-center pt-4 border-t border-gray-200/60">
                <Button 
                  type="submit" 
                  disabled={pixelsMutation.isPending}
                  className="btn-admin w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {pixelsMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>Salvar Pixels</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ===================== SEÇÃO 2: SEO META TAGS ===================== */}
      
      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">SEO Meta Tags</CardTitle>
              <CardDescription>Otimização para mecanismos de busca</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200/60">
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>🔍 Meta tags controlam como seu site aparece no Google</strong> - título, descrição e palavras-chave 
              que aparecem nos resultados de busca quando alguém procura por psicólogos.
            </p>
          </div>

          <Form {...seoForm}>
            <form onSubmit={seoForm.handleSubmit(onSeoSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={seoForm.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Adrielle Benhossi - Psicóloga Especialista" 
                          {...field} 
                          className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0"
                        />
                      </FormControl>
                      <FormDescription>
                        Título que aparece no Google (recomendado: 50-60 caracteres)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={seoForm.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição SEO</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: Psicóloga especialista em terapia cognitivo-comportamental. Atendimento presencial e online para seu bem-estar emocional." 
                          rows={3}
                          {...field} 
                          className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0"
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição que aparece abaixo do título no Google (recomendado: 150-160 caracteres)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={seoForm.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavras-chave</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: psicóloga, terapia, saúde mental, consulta psicológica" 
                          {...field} 
                          className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0"
                        />
                      </FormControl>
                      <FormDescription>
                        Palavras separadas por vírgula (opcional, mas ajuda no SEO)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>

              {/* Botão de Salvar SEO */}
              <div className="flex justify-center pt-4 border-t border-gray-200/60">
                <Button 
                  type="submit" 
                  disabled={seoMutation.isPending}
                  className="btn-admin w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {seoMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>Salvar SEO</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ===================== SEÇÃO 3: OPEN GRAPH ===================== */}
      
      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Open Graph</CardTitle>
              <CardDescription>Como aparece no WhatsApp, Facebook, Instagram</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200/60">
            <p className="text-sm text-purple-800 leading-relaxed">
              <strong>📱 Open Graph controla a prévia do seu link</strong> nas redes sociais. Quando alguém compartilha 
              seu site no WhatsApp ou Facebook, essas informações definem a imagem, título e descrição que aparecem.
            </p>
          </div>

          <Form {...openGraphForm}>
            <form onSubmit={openGraphForm.handleSubmit(onOpenGraphSubmit)} className="space-y-6">
              
              {/* Upload de Imagem Open Graph */}
              <div>
                <FormLabel className="text-base font-medium mb-3 block">
                  Imagem
                  <span className="text-sm font-normal text-gray-500 ml-2">(1200x630px recomendado)</span>
                </FormLabel>
                
                <div className="space-y-4">
                  {/* Prévia da imagem Open Graph */}
                  {previewImage && (
                    <div className="relative">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 mb-3">Prévia do compartilhamento nas redes sociais</h5>
                            <div className="max-w-md bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                              <div className="relative">
                                <img 
                                  src={previewImage} 
                                  alt="Prévia Open Graph"
                                  className="w-full h-40 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgNzVMMjI1IDEyNUwxNzUgMTc1SDE1MFYxNTBMMTc1IDEyNUwxNTAgMTAwVjc1SDE3NVoiIGZpbGw9IiM5Q0E0QUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW0gTsOjbyBDYXJyZWdhZGE8L3RleHQ+Cjwvc3ZnPgo=';
                                  }}
                                />
                                <div className="absolute top-2 right-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      console.log('🗑️ CLIQUE - Botão de remover imagem clicado');
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveImage();
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                                    title="Remover imagem"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="p-3">
                                <h6 className="font-medium text-sm text-gray-900 line-clamp-2">
                                  {openGraphForm.watch('ogTitle') || seoForm.watch('metaTitle') || 'Adrielle Benhossi - Psicóloga'}
                                </h6>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {openGraphForm.watch('ogDescription') || seoForm.watch('metaDescription') || 'Psicóloga especialista em terapia. Atendimento presencial e online.'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">seusite.com</p>
                              </div>
                            </div>
                            
                            {/* Indicador de mudanças não salvas */}
                            {(localStorage.getItem('temp_preview_image') || localStorage.getItem('image_removed')) && (
                              <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Clique em "Salvar Open Graph" para aplicar a alteração</span>
                              </div>
                            )}
                            
                            <p className="text-xs text-blue-600 mt-2">
                              💡 Assim sua página aparecerá no WhatsApp, Facebook, Instagram e Twitter quando compartilhada
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload de Nova Imagem */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                        />
                      </div>
                      
                      {/* Indicador de upload automático */}
                      {isUploading && (
                        <div className="flex items-center gap-2 text-purple-600">
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Enviando...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status do upload */}
                    {!previewImage && (
                      <p className="text-xs text-gray-500 italic">
                        Nenhuma imagem selecionada. Upload será feito automaticamente após escolher o arquivo. (Recomendado: 1200x630 pixels)
                      </p>
                    )}
                  </div>
                  
                  {/* Campo oculto para ogImage */}
                  <FormField
                    control={openGraphForm.control}
                    name="ogImage"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Twitter/X Card Configuration */}
              <FormField
                control={seoForm.control}
                name="twitterCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo do card exibido no X (Twitter)</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full p-2 border border-gray-200 rounded-md bg-gray-50/50 focus:border-gray-400 focus:ring-0"
                      >
                        <option value="summary">Resumo simples</option>
                        <option value="summary_large_image">Resumo com imagem grande</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Como o link aparece quando compartilhado no Twitter/X
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Título e Descrição Personalizados */}
              <div className="space-y-4">
                <FormField
                  control={openGraphForm.control}
                  name="ogTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título personalizado</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Deixe vazio para usar o título SEO"
                          {...field} 
                          className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0"
                        />
                      </FormControl>
                      <FormDescription>
                        Título que aparece quando compartilhado. Se vazio, usa o título SEO.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={openGraphForm.control}
                  name="ogDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição personalizada</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deixe vazio para usar a descrição SEO"
                          rows={3}
                          {...field} 
                          className="bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-0"
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição que aparece quando compartilhado. Se vazio, usa a descrição SEO.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botão de Salvar Open Graph */}
              <div className="flex justify-center pt-4 border-t border-gray-200/60">
                <Button 
                  type="submit" 
                  disabled={openGraphMutation.isPending}
                  className="btn-admin w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {openGraphMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>Salvar Open Graph</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Seção de Códigos Customizados */}
      <CustomCodesManager />
    </div>
  );
}