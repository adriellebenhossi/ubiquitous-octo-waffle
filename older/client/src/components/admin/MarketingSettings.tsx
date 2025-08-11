import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe, Search, Ban, Upload, X, Eye, EyeOff, Code, Archive, FileText, Trash2, Plus, Target, Users, Zap, Brain, Filter } from "lucide-react";
import { SiFacebook, SiGoogle, SiTiktok, SiLinkedin, SiInstagram, SiWhatsapp } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { SEOHead } from "@/components/SEOHead";

interface Config {
  id: number;
  key: string;
  value: any;
}

interface MarketingSettingsProps {
  configs: Config[];
}

// Schema de validação para marketing
const marketingSchema = z.object({
  facebookPixel1: z.string().optional(),
  facebookPixel2: z.string().optional(),
  googlePixel: z.string().optional(),
  enableGoogleIndexing: z.boolean(),
  metaTitle: z.string().min(1, "Título é obrigatório"),
  metaDescription: z.string().min(1, "Descrição é obrigatória"),
  metaKeywords: z.string().optional(),
  ogImage: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  twitterCard: z.string().optional(),
});

// Schema para códigos customizados
const customCodeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  location: z.enum(['header', 'body']),
  isActive: z.boolean(),
});

type MarketingFormData = z.infer<typeof marketingSchema>;
type CustomCodeForm = z.infer<typeof customCodeSchema>;

export function MarketingSettings({ configs }: MarketingSettingsProps) {
  console.log('🚀 COMPONENTE - MarketingSettings montado/atualizado');
  console.log('🚀 Props recebidas - configs:', configs?.length || 0, 'itens');

  // Estados simples para upload
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(() => {
    // Recuperar imagem temporária do localStorage se existir
    const tempImage = localStorage.getItem('temp_preview_image');
    return tempImage || "";
  });
  
  // Debug do estado
  console.log('🖼️ Estado atual previewImage:', previewImage);

  // Estados para códigos customizados
  const [editingCode, setEditingCode] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para códigos customizados
  const { data: customCodes = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/custom-codes"],
  });

  const headerCodes = customCodes.filter((code) => code.location === 'header');
  const bodyCodes = customCodes.filter((code) => code.location === 'body');

  // Extrair dados das configurações
  const initialData = useMemo(() => {
    console.log('🧠 MEMO - Recalculando dados iniciais');
    console.log('🧠 Configs disponíveis:', configs?.length || 0);
    
    const marketingInfo = configs?.find(c => c.key === 'marketing_pixels')?.value as any || {};
    const seoInfo = configs?.find(c => c.key === 'seo_meta')?.value as any || {};
    
    // DEBUGGING: Log para verificar fonte dos dados da imagem
    console.log('🔍 [MEMO DEBUG] marketingInfo.ogImage:', marketingInfo.ogImage);
    console.log('🔍 [MEMO DEBUG] seoInfo.ogImage:', seoInfo.ogImage);
    
    const data = {
      facebookPixel1: marketingInfo.facebookPixel1 || "",
      facebookPixel2: marketingInfo.facebookPixel2 || "",
      googlePixel: marketingInfo.googlePixel || "",
      enableGoogleIndexing: marketingInfo.enableGoogleIndexing ?? true,
      metaTitle: seoInfo.metaTitle || "Adrielle Benhossi - Psicóloga",
      metaDescription: seoInfo.metaDescription || "Psicóloga especialista em terapia. Atendimento presencial e online.",
      metaKeywords: seoInfo.metaKeywords || "psicóloga, terapia, saúde mental",
      ogImage: marketingInfo.ogImage || "",
      ogTitle: marketingInfo.ogTitle || seoInfo.ogTitle || "",
      ogDescription: marketingInfo.ogDescription || seoInfo.ogDescription || "",
      twitterCard: seoInfo.twitterCard || "summary_large_image",
    };

    console.log('🧠 Dados memoizados calculados:', data);
    return data;
  }, [configs]);

  // Form para configurações de marketing
  const form = useForm<MarketingFormData>({
    resolver: zodResolver(marketingSchema),
    defaultValues: initialData,
  });

  // Form para códigos customizados
  const codeForm = useForm<CustomCodeForm>({
    resolver: zodResolver(customCodeSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "header",
      isActive: true,
    },
  });

  // Inicializar prévia com imagem existente - respeitando remoções
  useEffect(() => {
    const wasRemoved = localStorage.getItem('image_removed');
    
    if (wasRemoved) {
      console.log('🚫 Imagem foi removida intencionalmente, não restaurar');
      return;
    }
    
    if (initialData.ogImage && !previewImage) {
      console.log('🔄 Inicializando previewImage com:', initialData.ogImage);
      setPreviewImage(initialData.ogImage);
    }
  }, [initialData.ogImage, previewImage]);

  // Reset form quando dados mudarem (sem afetar previewImage)
  useEffect(() => {
    console.log('📝 Resetando form com initialData');
    form.reset(initialData);
  }, [initialData, form]);

  // Upload com debug completo
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
          description: "Clique em 'Salvar Configurações' para aplicar.",
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

  // Remover imagem com debug
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
      description: "Clique em 'Salvar Configurações' para aplicar.",
    });
  };

  // Salvar configurações simples
  const saveMutation = useMutation({
    mutationFn: async (data: MarketingFormData) => {
      console.log('💾 INICIANDO SALVAMENTO:', data);
      
      const wasRemoved = localStorage.getItem('image_removed');
      
      // Separar dados de pixels de marketing e dados de SEO
      const marketingPixelsData = {
        facebookPixel1: data.facebookPixel1,
        facebookPixel2: data.facebookPixel2,
        googlePixel: data.googlePixel,
        enableGoogleIndexing: data.enableGoogleIndexing,
        // Se foi removida intencionalmente, salvar como vazio
        ogImage: wasRemoved ? '' : (previewImage || data.ogImage || ''),
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        twitterCard: data.twitterCard,
      };
      
      const seoMetaData = {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        twitterCard: data.twitterCard,
      };
      
      console.log('💾 SALVANDO - Pixels:', marketingPixelsData);
      console.log('💾 SALVANDO - SEO Meta:', seoMetaData);

      // Salvar configurações de marketing (pixels)
      const marketingResponse = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'marketing_pixels',
          value: marketingPixelsData
        })
      });

      if (!marketingResponse.ok) {
        throw new Error('Falha ao salvar configurações de marketing');
      }

      // Salvar configurações de SEO
      const seoResponse = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'seo_meta',
          value: seoMetaData
        })
      });

      if (!seoResponse.ok) {
        throw new Error('Falha ao salvar configurações de SEO');
      }

      return { marketing: await marketingResponse.json(), seo: await seoResponse.json() };
    },
    onSuccess: () => {
      console.log('✅ Configurações salvas com sucesso');
      
      // Verificar se a imagem foi removida para atualizar o cache corretamente
      const wasRemoved = localStorage.getItem('image_removed');
      const formValues = form.getValues();
      
      // Atualizar cache sem forçar reload completo
      queryClient.setQueryData(['/api/admin/config'], (old: any[] = []) => {
        const updated = [...old];
        
        // Atualizar configuração de marketing_pixels
        const marketingIndex = updated.findIndex(item => item.key === 'marketing_pixels');
        const marketingConfig = {
          key: 'marketing_pixels',
          value: {
            facebookPixel1: formValues.facebookPixel1,
            facebookPixel2: formValues.facebookPixel2,
            googlePixel: formValues.googlePixel,
            enableGoogleIndexing: formValues.enableGoogleIndexing,
            ogImage: wasRemoved ? '' : (previewImage || formValues.ogImage || ''),
            ogTitle: formValues.ogTitle,
            ogDescription: formValues.ogDescription,
            twitterCard: formValues.twitterCard,
          },
          updatedAt: new Date().toISOString()
        };
        
        // Atualizar configuração de seo_meta
        const seoIndex = updated.findIndex(item => item.key === 'seo_meta');
        const seoConfig = {
          key: 'seo_meta',
          value: {
            metaTitle: formValues.metaTitle,
            metaDescription: formValues.metaDescription,
            metaKeywords: formValues.metaKeywords,
            ogTitle: formValues.ogTitle,
            ogDescription: formValues.ogDescription,
            twitterCard: formValues.twitterCard,
          },
          updatedAt: new Date().toISOString()
        };
        
        // Aplicar as atualizações
        if (marketingIndex >= 0) {
          updated[marketingIndex] = marketingConfig;
        } else {
          updated.push(marketingConfig);
        }
        
        if (seoIndex >= 0) {
          updated[seoIndex] = seoConfig;
        } else {
          updated.push(seoConfig);
        }
        
        console.log('✅ Cache atualizado com ambas configurações');
        return updated;
      });
      
      // Limpar todos os estados temporários do localStorage após salvar
      localStorage.removeItem('temp_preview_image');
      localStorage.removeItem('image_removed');
      
      toast({
        title: "Configurações salvas!",
        description: "Todas as alterações foram aplicadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  // Mutations para códigos customizados
  const createCodeMutation = useMutation({
    mutationFn: async (data: CustomCodeForm) => {
      const response = await apiRequest("POST", "/api/admin/custom-codes", data);
      return response.json();
    },
    onSuccess: (newCode) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], (old: any[] = []) => [...old, newCode]);
      toast({ title: "Código customizado criado com sucesso!" });
      setIsDialogOpen(false);
      codeForm.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar código", variant: "destructive" });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CustomCodeForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/custom-codes/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedCode, { id }) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], (old: any[] = []) => 
        old.map(code => code.id === id ? updatedCode : code)
      );
      toast({ title: "Código atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingCode(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar código", variant: "destructive" });
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/custom-codes/${id}`);
      return response.json();
    },
    onSuccess: (response, deletedId) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], (old: any[] = []) => 
        old.filter(code => code.id !== deletedId)
      );
      toast({ title: "Código removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover código", variant: "destructive" });
    },
  });

  const reorderCodeMutation = useMutation({
    mutationFn: async (reorderData: Array<{ id: number | string; order: number }>) => {
      const response = await apiRequest("PUT", "/api/admin/custom-codes/reorder", reorderData);
      return response.json();
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["/api/admin/custom-codes"], updatedData);
      toast({ title: "Ordem dos códigos atualizada!" });
    },
    onError: () => {
      toast({ title: "Erro ao reordenar códigos", variant: "destructive" });
    },
  });

  // Handlers para códigos customizados
  const onSubmitCode = (data: CustomCodeForm) => {
    if (editingCode) {
      updateCodeMutation.mutate({ id: editingCode.id, data });
    } else {
      const codesInLocation = customCodes.filter((c) => c.location === data.location);
      const finalData = { ...data, order: codesInLocation.length };
      createCodeMutation.mutate(finalData);
    }
  };

  const handleEditCode = (code: any) => {
    setEditingCode(code);
    codeForm.reset({
      name: code.name,
      code: code.code,
      location: code.location,
      isActive: code.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleToggleCodeActive = (id: number, isActive: boolean) => {
    updateCodeMutation.mutate({ id, data: { isActive } });
  };

  const handleDeleteCode = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este código?")) {
      deleteCodeMutation.mutate(id);
    }
  };

  const handleReorderCodes = (reorderedItems: Array<{ id: string | number; order: number }>) => {
    const normalizedItems = reorderedItems.map(item => ({
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      order: item.order
    }));
    reorderCodeMutation.mutate(normalizedItems);
  };

  // Componente para lista de códigos
  const CodesList = ({ codes, location }: { codes: any[]; location: 'header' | 'body' }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          {location === 'header' ? <Archive className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          {location === 'header' ? 'Códigos do Header' : 'Códigos do Body'}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCode(null);
                codeForm.reset({ location });
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar código
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Templates de Pixels Modernos - apenas na seção header */}
      {location === 'header' && (
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 px-2">
              Templates Inteligentes
            </h4>
            <p className="text-gray-600 text-xs sm:text-sm max-w-2xl mx-auto px-4 leading-relaxed">
              Códigos pré-configurados das principais plataformas. Clique em "Usar" e personalize com seus IDs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Facebook Pixel Template */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">f</span>
                </div>
              </div>
              
              <div className="mb-3 sm:mb-4 pr-8 sm:pr-10 md:pr-12">
                <h5 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-1 sm:mb-2 break-words leading-tight">Facebook Pixel</h5>
                <p className="text-xs sm:text-sm text-blue-700 leading-relaxed break-words">
                  Rastreamento completo de visitantes para Meta Ads (Facebook & Instagram)
                </p>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-600 bg-blue-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                  <span className="break-words text-xs">Substitua: SEU_PIXEL_ID_AQUI</span>
                </div>
              </div>
              
              <Button
                className="w-full btn-admin shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  setEditingCode(null);
                  codeForm.reset({
                    name: "Facebook Pixel",
                    location: "header",
                    isActive: false,
                    code: `<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID_AQUI');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none" 
src="https://www.facebook.com/tr?id=SEU_PIXEL_ID_AQUI&ev=PageView&noscript=1" />
</noscript>
<!-- End Facebook Pixel Code -->`
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Usar Template
              </Button>
            </div>

            {/* Google Analytics Template */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">G</span>
                </div>
              </div>
              
              <div className="mb-3 sm:mb-4 pr-8 sm:pr-10 md:pr-12">
                <h5 className="text-sm sm:text-base md:text-lg font-bold text-orange-900 mb-1 sm:mb-2 break-words leading-tight">Google Analytics</h5>
                <p className="text-xs sm:text-sm text-orange-700 leading-relaxed break-words">
                  Análise completa de tráfego e comportamento dos visitantes
                </p>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-orange-600 bg-orange-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                  <span className="break-words text-xs">Substitua: SEU_GA_ID_AQUI</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  setEditingCode(null);
                  codeForm.reset({
                    name: "Google Analytics",
                    location: "header",
                    isActive: false,
                    code: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=SEU_GA_ID_AQUI"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'SEU_GA_ID_AQUI');
</script>`
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Usar Template
              </Button>
            </div>

            {/* TikTok Pixel Template */}
            <div className="group relative bg-gradient-to-br from-pink-50 to-purple-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">T</span>
                </div>
              </div>
              
              <div className="mb-3 sm:mb-4 pr-8 sm:pr-10 md:pr-12">
                <h5 className="text-sm sm:text-base md:text-lg font-bold text-pink-900 mb-1 sm:mb-2 break-words leading-tight">TikTok Pixel</h5>
                <p className="text-xs sm:text-sm text-pink-700 leading-relaxed break-words">
                  Rastreamento de eventos para campanhas no TikTok Ads Manager
                </p>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-pink-600 bg-pink-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                  <span className="break-words text-xs">Substitua: SEU_TIKTOK_PIXEL_ID_AQUI</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  setEditingCode(null);
                  codeForm.reset({
                    name: "TikTok Pixel",
                    location: "header",
                    isActive: false,
                    code: `<!-- TikTok Pixel Code Start -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('SEU_TIKTOK_PIXEL_ID_AQUI');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- TikTok Pixel Code End -->`
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Usar Template
              </Button>
            </div>

            {/* LinkedIn Insight Tag Template */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">in</span>
                </div>
              </div>
              
              <div className="mb-3 sm:mb-4 pr-8 sm:pr-10 md:pr-12">
                <h5 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-1 sm:mb-2 break-words leading-tight">LinkedIn Insight</h5>
                <p className="text-xs sm:text-sm text-blue-700 leading-relaxed break-words">
                  Rastreamento profissional para campanhas B2B no LinkedIn
                </p>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-600 bg-blue-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                  <span className="break-words text-xs">Substitua: SEU_LINKEDIN_PARTNER_ID_AQUI</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  setEditingCode(null);
                  codeForm.reset({
                    name: "LinkedIn Insight Tag",
                    location: "header",
                    isActive: false,
                    code: `<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "SEU_LINKEDIN_PARTNER_ID_AQUI";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=SEU_LINKEDIN_PARTNER_ID_AQUI&fmt=gif" />
</noscript>`
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Usar Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum código {location === 'header' ? 'do header' : 'do body'} cadastrado</p>
        </div>
      ) : (
        <DragAndDropContainer
          items={codes}
          onReorder={handleReorderCodes}
        >
          {codes.map((code) => (
            <div
              key={code.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{code.name}</h4>
                    <Badge variant={code.isActive ? "default" : "secondary"}>
                      {code.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <code className="text-xs text-gray-600 whitespace-pre-wrap">
                      {code.code.substring(0, 200)}
                      {code.code.length > 200 && "..."}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleCodeActive(code.id, !code.isActive)}
                  >
                    {code.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCode(code)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCode(code.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </DragAndDropContainer>
      )}
    </div>
  );

  return (
    <>
      <SEOHead />
      
      <div className="space-y-6">
        {/* Seção Principal de Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Marketing Digital & SEO
            </CardTitle>
            <CardDescription>
              Configure pixels de rastreamento, meta tags e códigos personalizados para otimizar seu marketing digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Informações educativas sobre marketing com design moderno */}
            <div className="mb-6 sm:mb-8 space-y-6 sm:space-y-8">
              {/* O que são Pixels de Marketing? */}
              <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3 pr-12 sm:pr-16 md:pr-20 leading-tight">
                    O que são Pixels de Marketing?
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 break-words">
                    Pixels são <span className="font-bold text-cyan-300">inteligências artificiais das redes sociais</span> (Facebook, Google, TikTok, LinkedIn) que estudam o comportamento dos visitantes do seu site. 
                    Eles funcionam como "assistentes digitais" das próprias plataformas para criar campanhas mais eficazes.
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-bold text-xs sm:text-sm">1</span>
                      </div>
                      <h4 className="text-white font-bold text-sm sm:text-base md:text-lg">Como Funciona</h4>
                    </div>
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {[
                        "Visitante entra no seu site → Pixel é ativado automaticamente",
                        "Pixel registra: páginas visitadas, tempo de permanência, ações realizadas", 
                        "Dados são enviados para plataformas (Facebook, Google, TikTok, LinkedIn)",
                        "Plataformas criam um \"perfil comportamental\" detalhado do visitante",
                        "Você pode criar campanhas direcionadas especificamente para esse perfil"
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span className="text-white/90 text-xs sm:text-sm md:text-base break-words leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estratégias Práticas para Psicólogos */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-emerald-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-900 flex items-start gap-2 sm:gap-3 leading-tight">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Estratégias Práticas para Psicólogos</span>
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2 bg-emerald-200 px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-full self-start">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-800 font-medium text-xs sm:text-sm">Estratégias Comprovadas</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg break-words leading-tight">Públicos Inteligentes</h4>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        "Pessoas que leram artigos sobre ansiedade",
                        "Visitantes que permaneceram 3+ minutos no site", 
                        "Quem visualizou a página de serviços",
                        "Usuários que preencheram formulários de contato",
                        "Pessoas que baixaram materiais educativos"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-bold text-xs">{index + 1}</span>
                          </div>
                          <span className="text-gray-700 text-xs sm:text-sm md:text-base break-words leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg break-words leading-tight">Segmentação Avançada</h4>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { label: "Idade", value: "25-45 anos (público principal)" },
                        { label: "Interesses", value: "Saúde Mental, Bem-estar, Autocuidado" },
                        { label: "Comportamento", value: "Pesquisou \"terapia online\" ou \"psicólogo\"" },
                        { label: "Localização", value: "Sua cidade + 50km de raio" },
                        { label: "Dispositivo", value: "Mobile-first (80% dos acessos)" }
                      ].map((item, index) => (
                        <div key={index} className="bg-orange-50 rounded-lg p-2 sm:p-3 border border-orange-100">
                          <div className="flex flex-col gap-0.5 sm:gap-1">
                            <span className="text-orange-800 font-semibold text-xs uppercase tracking-wide">{item.label}</span>
                            <span className="text-gray-700 text-xs sm:text-sm break-words leading-relaxed">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inteligência Artificial em Ação */}
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 rounded-3xl p-4 sm:p-6 lg:p-8 border border-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 break-words">Inteligência Artificial em Ação</h3>
                    <p className="text-amber-700 text-sm sm:text-base break-words">Exemplo Real de Remarketing Inteligente</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-200">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">🤖</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2 break-words">Cenário: "Remarketing Inteligente"</h4>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
                        Uma pessoa pesquisa "como superar ansiedade" no Google, clica no seu anúncio e visita seu site. 
                        Ela não agenda consulta imediatamente, mas lê 3 artigos sobre o tema e fica 8 minutos navegando.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 sm:p-5 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <h5 className="font-bold text-amber-900 text-sm sm:text-base break-words">O que o Pixel registra automaticamente:</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                      {[
                        "Alto interesse em conteúdo sobre ansiedade",
                        "Tempo de permanência: 8 minutos (excelente engajamento)",
                        "Leu artigos específicos sobre tratamento", 
                        "Não converteu ainda (não agendou consulta)",
                        "Perfil: Pessoa em busca ativa de ajuda psicológica"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-amber-800 text-xs sm:text-sm break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 sm:p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">✨</span>
                      </div>
                      <h5 className="font-bold text-green-900 text-sm sm:text-base break-words">Resultado da IA:</h5>
                    </div>
                    <p className="text-green-800 leading-relaxed text-sm sm:text-base break-words">
                      Nos próximos 30 dias, essa pessoa verá seus anúncios personalizados no Facebook, Instagram e TikTok 
                      com mensagens específicas sobre ansiedade e depoimentos de pacientes que superaram o problema, 
                      <span className="font-bold"> aumentando drasticamente as chances de conversão.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Instruções Técnicas Modernizadas */}
              <div className="bg-gradient-to-r from-slate-900 to-gray-800 rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white break-words">Instruções Técnicas</h3>
                    <p className="text-gray-300 text-sm sm:text-base break-words">Onde Inserir Cada Código</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs sm:text-sm">&lt;/&gt;</span>
                      </div>
                      <h4 className="text-white font-bold text-sm sm:text-base break-words">Header (dentro do &lt;head&gt;)</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base break-words">
                      Meta Pixel do Facebook, Google Analytics, Google Ads, TikTok Pixel, LinkedIn Insight Tag
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs sm:text-sm">{ }</span>
                      </div>
                      <h4 className="text-white font-bold text-sm sm:text-base break-words">Body (antes do &lt;/body&gt;)</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base break-words">
                      Chat widgets, pop-ups de saída, códigos de conversão, remarketing, botões flutuantes do WhatsApp
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="pixels" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pixels">Pixels & SEO</TabsTrigger>
                <TabsTrigger value="header">Header ({headerCodes.length})</TabsTrigger>
                <TabsTrigger value="body">Body ({bodyCodes.length})</TabsTrigger>
              </TabsList>

              {/* Tab 1: Pixels e SEO */}
              <TabsContent value="pixels" className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-6">
                    {/* Seção de Pixels - Design Melhorado */}
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-indigo-200">
                        {/* Header da Seção */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8 gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-white text-sm sm:text-base md:text-lg font-bold">📊</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words leading-tight">Configuração de Pixels de Rastreamento</h3>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words leading-relaxed">Configure pixels para monitorar conversões e otimizar campanhas</p>
                            </div>
                            <div className="flex">
                              <div className="px-2 py-1 sm:px-3 sm:py-1 bg-white/60 backdrop-blur-sm rounded-full border border-white/40">
                                <span className="text-xs font-medium text-indigo-700">Essencial para Marketing</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                          {/* Facebook Pixels - Card Elegante */}
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-white text-xs sm:text-sm font-bold">f</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-blue-900 text-base sm:text-lg break-words">Facebook Pixels</h4>
                                <p className="text-xs text-blue-700 break-words">Até 2 pixels para campanhas diferentes</p>
                              </div>
                            </div>
                            
                            <div className="space-y-5">
                              <FormField
                                control={form.control}
                                name="facebookPixel1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      Facebook Pixel #1 (Principal)
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input 
                                          placeholder="Ex: 1234567890123456" 
                                          {...field} 
                                          className="font-mono bg-white/80 border-blue-200 focus:border-blue-400 focus:bg-white transition-all pl-10"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                          <span className="text-blue-500 text-xs">🏷️</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                      <div className="text-xs text-blue-800 flex items-start gap-2">
                                        <span className="text-blue-500">💡</span>
                                        <span>Encontre no <strong>Facebook Business Manager → Eventos → Pixels</strong></span>
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="facebookPixel2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                      Facebook Pixel #2 (Opcional)
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input 
                                          placeholder="Ex: 9876543210987654" 
                                          {...field} 
                                          className="font-mono bg-white/80 border-blue-200 focus:border-blue-400 focus:bg-white transition-all pl-10"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                          <span className="text-blue-400 text-xs">🎯</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                      <div className="text-xs text-blue-800 flex items-start gap-2">
                                        <span className="text-blue-400">✨</span>
                                        <span>Para campanhas específicas ou como backup</span>
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Google Analytics - Card Elegante */}
                          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-white text-xs sm:text-sm font-bold">G</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-orange-900 text-base sm:text-lg break-words">Google Analytics</h4>
                                <p className="text-xs text-orange-700 break-words">Rastreamento detalhado de usuários</p>
                              </div>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="googlePixel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    Google Analytics / Google Ads ID
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        placeholder="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXX" 
                                        {...field} 
                                        className="font-mono bg-white/80 border-orange-200 focus:border-orange-400 focus:bg-white transition-all pl-10"
                                      />
                                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <span className="text-orange-500 text-xs">📈</span>
                                      </div>
                                    </div>
                                  </FormControl>
                                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                    <div className="space-y-2">
                                      <div className="text-xs text-orange-800 flex items-start gap-2">
                                        <span className="text-orange-500">📊</span>
                                        <span><strong>G-XXXXXXXXXX</strong> para Google Analytics 4</span>
                                      </div>
                                      <div className="text-xs text-orange-800 flex items-start gap-2">
                                        <span className="text-orange-500">🎯</span>
                                        <span><strong>AW-XXXXXXXXX</strong> para Google Ads</span>
                                      </div>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Indexação do Google - Design Melhorado */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <FormField
                                control={form.control}
                                name="enableGoogleIndexing"
                                render={({ field }) => (
                                  <FormItem className="space-y-4">
                                    <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-white" />
                                          </div>
                                          <div>
                                            <FormLabel className="text-sm font-semibold text-gray-900">
                                              Permitir Indexação no Google
                                            </FormLabel>
                                            <div className="text-xs text-gray-600">
                                              Controla se o site aparece nos resultados de busca
                                            </div>
                                          </div>
                                        </div>
                                        <FormControl>
                                          <Switch 
                                            checked={field.value} 
                                            onCheckedChange={field.onChange} 
                                          />
                                        </FormControl>
                                      </div>
                                    </div>
                                    
                                    {!field.value && (
                                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mt-0.5">
                                            <Ban className="w-4 h-4 text-red-600" />
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-red-900 flex items-center gap-2">
                                              <span>⚠️</span> Indexação Desabilitada
                                            </h5>
                                            <p className="text-sm text-red-800 mt-2 leading-relaxed">
                                              Seu site <strong>NÃO aparecerá</strong> nos resultados do Google. 
                                              Use apenas durante desenvolvimento ou para sites privados.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {field.value && (
                                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                                            <Search className="w-4 h-4 text-green-600" />
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-green-900 flex items-center gap-2">
                                              <span>✅</span> Indexação Habilitada
                                            </h5>
                                            <p className="text-sm text-green-800 mt-2 leading-relaxed">
                                              Seu site será indexado pelo Google e aparecerá nos resultados de busca. 
                                              Essencial para SEO e visibilidade online.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seção de SEO */}
                      <div className="border-t pt-6 sm:pt-8">
                        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-200 mb-6 sm:mb-8">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 break-words">SEO e meta informações</h3>
                              <p className="text-xs sm:text-sm text-emerald-700 break-words">Configure como seu site aparece no Google e redes sociais</p>
                            </div>
                            <div className="flex sm:hidden md:block">
                              <div className="px-3 py-1 bg-emerald-200/60 backdrop-blur-sm rounded-full border border-emerald-300/40">
                                <span className="text-xs font-medium text-emerald-800">Essencial para SEO</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview das Redes Sociais */}
                        <div className="mb-6 sm:mb-8 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/40 shadow-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 leading-tight">
                                Preview do Compartilhamento
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                Veja como seu site aparecerá quando compartilhado no WhatsApp, Facebook, Instagram, etc.
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Preview Facebook/WhatsApp */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 group">
                              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                                    <SiFacebook className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-xs sm:text-sm leading-tight">Facebook / WhatsApp</span>
                                    <p className="text-xs text-blue-100">Preview</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Imagem do card */}
                              <div className="aspect-[1.91/1] bg-gray-100 relative">
                                {previewImage ? (
                                  <img 
                                    src={previewImage} 
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-2 sm:px-4">
                                    <div className="text-center max-w-full">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-600 font-medium leading-tight">Adicione uma imagem</p>
                                      <p className="text-xs text-gray-500 mt-1 leading-tight">
                                        <span className="hidden sm:inline">1200×630px recomendado</span>
                                        <span className="sm:hidden">1200×630px</span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Informações do card - área bem visível */}
                              <div className="p-3 sm:p-4 md:p-5 bg-white">
                                <div className="mb-2 sm:mb-3">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium break-all">
                                    {window.location.hostname || "seusite.com.br"}
                                  </p>
                                </div>
                                <h5 className="font-bold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-tight line-clamp-2">
                                  {form.watch("ogTitle") || form.watch("metaTitle") || "Título para redes sociais"}
                                </h5>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                                  {form.watch("ogDescription") || form.watch("metaDescription") || "Descrição que aparecerá quando o link for compartilhado nas redes sociais..."}
                                </p>
                              </div>
                            </div>

                            {/* Preview Twitter/X */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 group">
                              <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-900 to-black text-white">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm font-bold">𝕏</span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-xs sm:text-sm leading-tight">Twitter / X</span>
                                    <p className="text-xs text-gray-300">Preview</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Imagem do card */}
                              <div className="aspect-[2/1] bg-gray-100 relative">
                                {previewImage ? (
                                  <img 
                                    src={previewImage} 
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 px-2 sm:px-4">
                                    <div className="text-center max-w-full">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center">
                                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-600 font-medium leading-tight">Adicione uma imagem</p>
                                      <p className="text-xs text-gray-500 mt-1 leading-tight">
                                        <span className="hidden sm:inline">1200×630px recomendado</span>
                                        <span className="sm:hidden">1200×630px</span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Informações do card - área bem visível */}
                              <div className="p-3 sm:p-4 md:p-5 bg-white">
                                <div className="mb-2 sm:mb-3">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium break-all">
                                    {window.location.hostname || "seusite.com.br"}
                                  </p>
                                </div>
                                <h5 className="font-bold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-tight line-clamp-2">
                                  {form.watch("ogTitle") || form.watch("metaTitle") || "Título para redes sociais"}
                                </h5>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                                  {form.watch("ogDescription") || form.watch("metaDescription") || "Descrição que aparecerá quando o link for compartilhado nas redes sociais..."}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border border-amber-200/60 shadow-lg">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-white text-lg">💡</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-amber-900 text-base mb-2">Dica de Preview:</h5>
                                <p className="text-sm text-amber-800 leading-relaxed">
                                  Use imagens de alta qualidade (1200×630px) para melhor resultado nas redes sociais. 
                                  Imagens menores podem aparecer pixelizadas ou cortadas incorretamente.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="px-3 py-1 bg-amber-200/60 text-amber-800 rounded-lg text-xs font-medium">
                                    📏 1200×630px
                                  </span>
                                  <span className="px-3 py-1 bg-amber-200/60 text-amber-800 rounded-lg text-xs font-medium">
                                    🎨 JPG/PNG/WEBP
                                  </span>
                                  <span className="px-3 py-1 bg-amber-200/60 text-amber-800 rounded-lg text-xs font-medium">
                                    📦 Máx. 5MB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="metaTitle"
                            render={({ field }) => {
                              const titleLength = field.value?.length || 0;
                              const isOptimal = titleLength <= 60;
                              return (
                                <FormItem>
                                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-white text-xs sm:text-sm font-bold">T</span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <FormLabel className="font-bold text-blue-900 text-base sm:text-lg break-words mb-1">
                                          Título da Página (SEO)
                                        </FormLabel>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            isOptimal 
                                              ? 'bg-green-100 text-green-700' 
                                              : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                            {titleLength}/60
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <FormControl>
                                      <div className="relative">
                                        <Input 
                                          placeholder="Ex: Adrielle Benhossi - Psicóloga | Terapia Online e Presencial" 
                                          {...field} 
                                          className={`bg-white/80 border-blue-200 focus:border-blue-400 focus:bg-white transition-all pl-10 ${
                                            !isOptimal ? 'border-yellow-300 focus:border-yellow-500' : ''
                                          }`}
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                          <span className="text-blue-500 text-xs">🏷️</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    
                                    <div className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${
                                      isOptimal 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-yellow-50 border-yellow-200'
                                    }`}>
                                      <span className="text-sm flex-shrink-0 mt-0.5">
                                        {isOptimal ? '✅' : '⚠️'}
                                      </span>
                                      <div className={`text-xs break-words ${
                                        isOptimal ? 'text-green-800' : 'text-yellow-800'
                                      }`}>
                                        <span className="font-medium">Aparece na aba do navegador e resultados do Google</span>
                                        {!isOptimal && <span className="block mt-1 text-yellow-700 font-medium">(muito longo para SEO ideal)</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                          
                          <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => {
                              const descLength = field.value?.length || 0;
                              const isOptimal = descLength <= 160;
                              return (
                                <FormItem>
                                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-white text-xs sm:text-sm font-bold">D</span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <FormLabel className="font-bold text-purple-900 text-base sm:text-lg break-words mb-1">
                                          Descrição da Página (SEO)
                                        </FormLabel>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            isOptimal 
                                              ? 'bg-green-100 text-green-700' 
                                              : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                            {descLength}/160
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <FormControl>
                                      <div className="relative">
                                        <Textarea 
                                          placeholder="Ex: Psicóloga especialista em terapia. Atendimento presencial e online para seu bem-estar emocional." 
                                          rows={3} 
                                          {...field}
                                          className={`bg-white/80 border-purple-200 focus:border-purple-400 focus:bg-white transition-all resize-y pl-10 ${
                                            !isOptimal ? 'border-yellow-300 focus:border-yellow-500' : ''
                                          }`}
                                        />
                                        <div className="absolute left-3 top-3">
                                          <span className="text-purple-500 text-xs">📝</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    
                                    <div className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${
                                      isOptimal 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-yellow-50 border-yellow-200'
                                    }`}>
                                      <span className="text-sm flex-shrink-0 mt-0.5">
                                        {isOptimal ? '✅' : '⚠️'}
                                      </span>
                                      <div className={`text-xs break-words ${
                                        isOptimal ? 'text-green-800' : 'text-yellow-800'
                                      }`}>
                                        <span className="font-medium">Aparece nos resultados do Google abaixo do título</span>
                                        {!isOptimal && <span className="block mt-1 text-yellow-700 font-medium">(muito longo para SEO ideal)</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                          
                          <FormField
                            control={form.control}
                            name="metaKeywords"
                            render={({ field }) => (
                              <FormItem>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <FormLabel className="font-bold text-orange-900 text-base sm:text-lg break-words">
                                        Palavras-chave (SEO)
                                      </FormLabel>
                                    </div>
                                  </div>
                                  
                                  <FormControl>
                                    <div className="relative">
                                      <Textarea 
                                        placeholder="Ex: psicóloga, terapia, saúde mental, consulta psicológica, bem-estar" 
                                        rows={2}
                                        {...field} 
                                        className="bg-white/80 border-orange-200 focus:border-orange-400 focus:bg-white transition-all resize-y pl-10"
                                      />
                                      <div className="absolute left-3 top-3">
                                        <span className="text-orange-500 text-xs">🔍</span>
                                      </div>
                                    </div>
                                  </FormControl>
                                  
                                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
                                    Palavras separadas por vírgula que descrevem seu conteúdo
                                  </div>
                                  
                                  <div className="mt-4 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-200/60 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="flex flex-col gap-4">
                                      {/* Header */}
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                          <Search className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h6 className="font-bold text-base sm:text-lg text-violet-900 leading-tight">
                                            Por que usar palavras-chave?
                                          </h6>
                                          <p className="text-xs text-violet-600 mt-0.5">
                                            Conecte seu negócio aos seus clientes ideais
                                          </p>
                                        </div>
                                      </div>

                                      {/* Benefits Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-violet-100 hover:border-violet-200 hover:bg-white/80 transition-all duration-200">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
                                              <span className="text-white text-xs font-bold">G</span>
                                            </div>
                                            <span className="text-sm font-medium text-violet-800 group-hover:text-violet-900 transition-colors">
                                              Melhora posicionamento no Google
                                            </span>
                                          </div>
                                        </div>

                                        <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-violet-100 hover:border-violet-200 hover:bg-white/80 transition-all duration-200">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                                              <span className="text-white text-xs">📍</span>
                                            </div>
                                            <span className="text-sm font-medium text-violet-800 group-hover:text-violet-900 transition-colors">
                                              Atrai clientes da sua região
                                            </span>
                                          </div>
                                        </div>

                                        <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-violet-100 hover:border-violet-200 hover:bg-white/80 transition-all duration-200">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                                              <span className="text-white text-xs">👁️</span>
                                            </div>
                                            <span className="text-sm font-medium text-violet-800 group-hover:text-violet-900 transition-colors">
                                              Aumenta visibilidade online
                                            </span>
                                          </div>
                                        </div>

                                        <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-violet-100 hover:border-violet-200 hover:bg-white/80 transition-all duration-200">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg flex items-center justify-center shadow-sm">
                                              <span className="text-white text-xs">🤖</span>
                                            </div>
                                            <span className="text-sm font-medium text-violet-800 group-hover:text-violet-900 transition-colors">
                                              Ajuda Google entender seu site
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Example Section */}
                                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                            <span className="text-white text-sm font-bold">💡</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                              <span className="text-sm font-semibold text-amber-800">Exemplo:</span>
                                              <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
                                                <span className="text-sm font-medium text-amber-900">"psicóloga Campo Mourão"</span>
                                              </div>
                                            </div>
                                            <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                                              conecta você com pacientes locais buscando atendimento psicológico na sua cidade
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Open Graph Image - Versão Melhorada */}
                          <div className="space-y-3">
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                              <div className="flex items-start gap-2 sm:gap-3 mb-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-rose-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-0.5">
                                  <span className="text-white text-sm sm:text-base">📸</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <FormLabel className="font-bold text-rose-900 text-base sm:text-lg break-words leading-tight">
                                    Imagem para Redes Sociais (Open Graph)
                                  </FormLabel>
                                  <p className="text-xs text-rose-600 mt-0.5">
                                    Como seu site será exibido ao ser compartilhado
                                  </p>
                                </div>
                              </div>
                            
                              <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-rose-200/50 shadow-inner">
                                {previewImage ? (
                                  <div className="space-y-4">
                                    {/* Imagem atual com preview melhorado */}
                                    <div className="relative group">
                                      <div className="aspect-[1.91/1] max-w-lg mx-auto overflow-hidden rounded-xl border-2 border-white shadow-lg bg-white">
                                        <img 
                                          src={previewImage} 
                                          alt="Preview da imagem Open Graph" 
                                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                      </div>
                                      
                                      {/* Botão de remover apenas */}
                                      <div className="flex justify-center mt-4">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={handleRemoveImage}
                                          className="bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:border-red-300 text-red-600 shadow-md border-red-200 font-medium"
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Remover
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                              ) : (
                                /* Área de upload vazia melhorada */
                                <div className="border-2 border-dashed border-rose-300 rounded-2xl p-8 sm:p-12 bg-gradient-to-br from-white via-rose-50 to-pink-50 hover:from-rose-50 hover:to-pink-100 transition-all duration-300 group cursor-pointer">
                                  <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                      <Upload className="w-10 h-10 text-white" />
                                    </div>
                                    
                                    <label htmlFor="og-image-upload" className="cursor-pointer block">
                                      <div className="space-y-4">
                                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-rose-900 transition-colors">
                                          Adicionar imagem para redes sociais
                                        </h4>
                                        <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                                          Clique aqui ou arraste uma imagem para fazer upload
                                        </p>
                                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                                          📸 Escolher Arquivo
                                        </div>
                                      </div>
                                    </label>
                                    
                                    <input
                                      id="og-image-upload"
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      disabled={isUploading}
                                      key={Date.now()}
                                    />
                                    
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                      <span className="px-3 py-1.5 bg-white/80 text-rose-800 rounded-lg text-sm font-medium border border-rose-200">
                                        📏 1200×630px
                                      </span>
                                      <span className="px-3 py-1.5 bg-white/80 text-rose-800 rounded-lg text-sm font-medium border border-rose-200">
                                        🎨 PNG/JPG/WEBP
                                      </span>
                                      <span className="px-3 py-1.5 bg-white/80 text-rose-800 rounded-lg text-sm font-medium border border-rose-200">
                                        📦 Máx. 5MB
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Indicador de progresso */}
                              {isUploading && (
                                <div className="mt-6 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 border border-rose-200/60">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-base text-rose-800 font-semibold">
                                      Fazendo upload da imagem...
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-blue-200/60 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-white text-base sm:text-lg">💡</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5 className="font-bold text-blue-900 text-sm sm:text-base mb-2 sm:mb-3 leading-tight">Como funciona:</h5>
                                    <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                                      Esta imagem aparece automaticamente quando alguém compartilha seu site no WhatsApp, Facebook, Instagram, LinkedIn e outras redes sociais. O preview acima mostra exatamente como ficará!
                                    </p>
                                    
                                    <div className="mt-3 sm:mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                      <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-blue-200/50">
                                        <div className="w-7 h-7 sm:w-6 sm:h-6 bg-green-500 rounded-md flex items-center justify-center flex-shrink-0">
                                          <SiWhatsapp className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs sm:text-xs font-medium text-blue-800 leading-tight">WhatsApp</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-blue-200/50">
                                        <div className="w-7 h-7 sm:w-6 sm:h-6 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                                          <SiFacebook className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs sm:text-xs font-medium text-blue-800 leading-tight">Facebook</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-blue-200/50">
                                        <div className="w-7 h-7 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center flex-shrink-0">
                                          <SiInstagram className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs sm:text-xs font-medium text-blue-800 leading-tight">Instagram</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-blue-200/50">
                                        <div className="w-7 h-7 sm:w-6 sm:h-6 bg-blue-700 rounded-md flex items-center justify-center flex-shrink-0">
                                          <SiLinkedin className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs sm:text-xs font-medium text-blue-800 leading-tight">LinkedIn</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="ogTitle"
                            render={({ field }) => {
                              const ogTitleLength = field.value?.length || 0;
                              const isOptimal = ogTitleLength <= 70;
                              return (
                                <FormItem>
                                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                                    <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-0.5">
                                        <span className="text-white text-sm sm:text-base">📱</span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                          <FormLabel className="font-bold text-blue-900 text-base sm:text-lg break-words leading-tight">
                                            Título para Redes Sociais
                                          </FormLabel>
                                          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                            isOptimal 
                                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                                          }`}>
                                            {ogTitleLength}/70
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <FormControl>
                                      <div className="relative">
                                        <Input 
                                          placeholder="Adrielle Benhossi - Psicóloga" 
                                          {...field}
                                          className={`bg-white/80 border-blue-200 focus:border-blue-400 focus:bg-white transition-all pl-10 ${
                                            !isOptimal ? 'border-amber-300 focus:border-amber-500' : ''
                                          }`}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                          <span className="text-blue-500 text-xs">✏️</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    
                                    <div className={`mt-3 text-xs bg-gradient-to-r p-3 rounded-lg border flex items-center gap-2 ${
                                      isOptimal 
                                        ? 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700' 
                                        : 'from-amber-50 to-orange-50 border-amber-200 text-amber-700'
                                    }`}>
                                      <span className="text-sm">{isOptimal ? '✅' : '⚠️'}</span>
                                      <span>
                                        Título que aparece nas redes sociais
                                        {!isOptimal && ' (muito longo para algumas plataformas)'}
                                      </span>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          <FormField
                            control={form.control}
                            name="ogDescription"
                            render={({ field }) => {
                              const ogDescLength = field.value?.length || 0;
                              const isOptimal = ogDescLength <= 200;
                              return (
                                <FormItem>
                                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                                    <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-0.5">
                                        <span className="text-white text-sm sm:text-base">💬</span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                          <FormLabel className="font-bold text-purple-900 text-base sm:text-lg break-words leading-tight">
                                            Descrição para Redes Sociais
                                          </FormLabel>
                                          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                            isOptimal 
                                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                                          }`}>
                                            {ogDescLength}/200
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <FormControl>
                                      <div className="relative">
                                        <Textarea 
                                          placeholder="Psicóloga especialista em terapia. Atendimento presencial e online para seu bem-estar emocional." 
                                          rows={3} 
                                          {...field}
                                          className={`bg-white/80 border-purple-200 focus:border-purple-400 focus:bg-white transition-all resize-y pl-10 ${
                                            !isOptimal ? 'border-amber-300 focus:border-amber-500' : ''
                                          }`}
                                        />
                                        <div className="absolute left-3 top-3">
                                          <span className="text-purple-500 text-xs">📝</span>
                                        </div>
                                      </div>
                                    </FormControl>
                                    
                                    <div className={`mt-3 text-xs bg-gradient-to-r p-3 rounded-lg border flex items-center gap-2 ${
                                      isOptimal 
                                        ? 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700' 
                                        : 'from-amber-50 to-orange-50 border-amber-200 text-amber-700'
                                    }`}>
                                      <span className="text-sm">{isOptimal ? '✅' : '⚠️'}</span>
                                      <span>
                                        Descrição que aparece nas redes sociais
                                        {!isOptimal && ' (muito longo para algumas plataformas)'}
                                      </span>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          <FormField
                            control={form.control}
                            name="twitterCard"
                            render={({ field }) => (
                              <FormItem>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40 shadow-sm">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-900 to-black rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                      </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <FormLabel className="font-bold text-gray-900 text-base sm:text-lg break-words">
                                        X (Twitter)
                                      </FormLabel>
                                    </div>
                                  </div>
                                  
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/80 border-sky-200 focus:border-sky-400 focus:bg-white transition-all">
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="summary">
                                        <div>
                                          <div className="font-medium">Summary</div>
                                          <div className="text-xs text-gray-500">Card compacto</div>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="summary_large_image">
                                        <div>
                                          <div className="font-medium">Summary Large Image</div>
                                          <div className="text-xs text-gray-500">Card com imagem grande</div>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <div className="mt-3 text-xs bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-700 p-3 rounded-lg flex items-center gap-2">
                                    <span className="text-sm">ℹ️</span>
                                    <span>Como o link aparece quando compartilhado no X</span>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={saveMutation.isPending || isUploading}
                        className="min-w-[120px] btn-admin"
                      >
                        {saveMutation.isPending ? "Salvando..." : "Salvar configurações"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* Tab 2: Códigos Header */}
              <TabsContent value="header" className="mt-6">
                <CodesList codes={headerCodes} location="header" />
              </TabsContent>

              {/* Tab 3: Códigos Body */}
              <TabsContent value="body" className="mt-6">
                {bodyCodes.length === 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">📱 Templates Criativos para Body</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* WhatsApp Float Button */}
                      <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">📱</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-lg font-bold text-green-900 mb-2">WhatsApp Flutuante</h5>
                          <p className="text-sm text-green-700 leading-relaxed">
                            Botão flutuante do WhatsApp com animação e mensagem personalizada
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-100 rounded-lg px-3 py-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Substitua: SEU_NUMERO_WHATSAPP</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full btn-admin shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setEditingCode(null);
                            codeForm.reset({
                              name: "WhatsApp Flutuante",
                              location: "body",
                              isActive: false,
                              code: `<!-- WhatsApp Float Button -->
<div id="whatsapp-float" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
  <a href="https://wa.me/SEU_NUMERO_WHATSAPP?text=Olá! Gostaria de agendar uma consulta." 
     target="_blank" 
     style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #25d366, #128c7e); border-radius: 50%; box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); text-decoration: none; transition: all 0.3s ease; animation: whatsapp-pulse 2s infinite;">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.686"/>
    </svg>
  </a>
</div>

<style>
@keyframes whatsapp-pulse {
  0% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(37, 211, 102, 0.6); }
  100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); }
}

#whatsapp-float a:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(37, 211, 102, 0.5);
}

@media (max-width: 768px) {
  #whatsapp-float {
    bottom: 15px;
    right: 15px;
  }
  #whatsapp-float a {
    width: 55px;
    height: 55px;
  }
}
</style>`
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Template
                        </Button>
                      </div>

                      {/* Exit Intent Popup */}
                      <div className="group relative bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">💫</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-lg font-bold text-purple-900 mb-2">Pop-up de Saída</h5>
                          <p className="text-sm text-purple-700 leading-relaxed">
                            Modal que aparece quando o usuário tenta sair da página
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-100 rounded-lg px-3 py-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Personalize: mensagem e call-to-action</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setEditingCode(null);
                            codeForm.reset({
                              name: "Pop-up de Saída",
                              location: "body",
                              isActive: false,
                              code: `<!-- Exit Intent Popup -->
<div id="exit-popup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; justify-content: center; align-items: center;">
  <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;">
    <button id="close-popup" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
    
    <div style="margin-bottom: 20px;">
      <span style="font-size: 48px;">🤔</span>
    </div>
    
    <h3 style="font-size: 24px; color: #333; margin-bottom: 15px; font-weight: bold;">Espere! Não vá embora ainda...</h3>
    
    <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
      Que tal conversar comigo antes de sair? Posso esclarecer suas dúvidas sobre terapia e como posso ajudar você.
    </p>
    
    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
      <a href="https://wa.me/SEU_NUMERO_WHATSAPP?text=Olá! Tenho algumas dúvidas sobre terapia." 
         style="background: linear-gradient(135deg, #25d366, #128c7e); color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;">
        <span>💬</span> Conversar no WhatsApp
      </a>
      
      <button id="maybe-later" style="background: #f0f0f0; color: #666; padding: 12px 25px; border: none; border-radius: 25px; cursor: pointer; font-weight: bold;">
        Talvez depois
      </button>
    </div>
  </div>
</div>

<script>
let exitPopupShown = false;
let mouseLeaveTimeout;

document.addEventListener('mouseleave', function(e) {
  if (e.clientY <= 0 && !exitPopupShown) {
    clearTimeout(mouseLeaveTimeout);
    mouseLeaveTimeout = setTimeout(() => {
      document.getElementById('exit-popup').style.display = 'flex';
      exitPopupShown = true;
    }, 500);
  }
});

document.addEventListener('mouseenter', function() {
  clearTimeout(mouseLeaveTimeout);
});

document.getElementById('close-popup').addEventListener('click', function() {
  document.getElementById('exit-popup').style.display = 'none';
});

document.getElementById('maybe-later').addEventListener('click', function() {
  document.getElementById('exit-popup').style.display = 'none';
});

// Fechar ao clicar fora do popup
document.getElementById('exit-popup').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
  }
});
</script>`
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Template
                        </Button>
                      </div>

                      {/* Scroll Progress Bar */}
                      <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">📊</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-lg font-bold text-blue-900 mb-2">Barra de Progresso</h5>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            Mostra quanto do conteúdo o usuário já leu
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Aumenta engajamento e tempo na página</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setEditingCode(null);
                            codeForm.reset({
                              name: "Barra de Progresso de Leitura",
                              location: "body",
                              isActive: false,
                              code: `<!-- Reading Progress Bar -->
<div id="reading-progress" style="position: fixed; top: 0; left: 0; width: 0%; height: 4px; background: linear-gradient(90deg, #3b82f6, #06b6d4); z-index: 9999; transition: width 0.2s ease-out;"></div>

<script>
window.addEventListener('scroll', function() {
  const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('reading-progress').style.width = Math.min(scrolled, 100) + '%';
});
</script>`
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Template
                        </Button>
                      </div>

                      {/* Modal de Aviso Informativo */}
                      <div className="group relative bg-gradient-to-br from-indigo-50 to-violet-100 rounded-2xl p-6 border border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">📢</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-lg font-bold text-indigo-900 mb-2">Modal de Aviso</h5>
                          <p className="text-sm text-indigo-700 leading-relaxed">
                            Pop-up informativo para avisos importantes como férias, mudança de endereço, etc.
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-100 rounded-lg px-3 py-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span>Ideal para comunicações importantes</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setEditingCode(null);
                            codeForm.reset({
                              name: "Modal de Aviso Informativo",
                              location: "body",
                              isActive: false,
                              code: `<!-- Modal de Aviso Informativo -->
<div id="info-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 10000; display: none; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease-out;">
  <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px;">
    <div style="background: white; max-width: 500px; width: 100%; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: relative; animation: slideUp 0.4s ease-out; overflow: hidden;">
      
      <!-- Cabeçalho do Modal -->
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 25px; text-align: center; position: relative;">
        <button id="close-modal" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; width: 30px; height: 30px; border-radius: 50%; color: white; cursor: pointer; font-size: 18px; line-height: 1; transition: all 0.2s;">
          ×
        </button>
        <div style="font-size: 48px; margin-bottom: 10px;">📢</div>
        <h3 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">Aviso Importante</h3>
      </div>
      
      <!-- Conteúdo do Modal -->
      <div style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h4 style="color: #374151; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">
            Recesso de Final de Ano
          </h4>
          <p style="color: #6b7280; line-height: 1.6; margin: 0; font-size: 16px;">
            Informamos que estaremos em recesso do dia <strong>20/12/2024</strong> a <strong>08/01/2025</strong>. 
            Retornamos às atividades normais no dia <strong>09/01/2025</strong>.
          </p>
        </div>
        
        <!-- Informações adicionais -->
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="color: #059669; font-size: 18px;">📅</span>
            <strong style="color: #374151;">Período de Recesso:</strong>
          </div>
          <p style="margin: 0; color: #6b7280; padding-left: 28px;">
            20 de Dezembro de 2024 a 08 de Janeiro de 2025
          </p>
        </div>
        
        <!-- Botão de ação -->
        <div style="text-align: center;">
          <button id="got-it-btn" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
            Entendi, obrigado!
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

#close-modal:hover, #got-it-btn:hover {
  transform: scale(1.05);
}

#close-modal:hover {
  background: rgba(255,255,255,0.3);
}
</style>

<script>
// Configuração do modal
const MODAL_CONFIG = {
  showOnce: true, // Se true, mostra apenas uma vez por sessão
  autoShow: true,  // Se true, mostra automaticamente ao carregar a página
  delay: 2000     // Delay em ms antes de mostrar (apenas se autoShow for true)
};

// Função para mostrar o modal
function showInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Previne scroll da página
  }
}

// Função para fechar o modal
function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaura scroll da página
    
    if (MODAL_CONFIG.showOnce) {
      localStorage.setItem('infoModalSeen', 'true');
    }
  }
}

// Verificar se deve mostrar o modal
function shouldShowModal() {
  if (MODAL_CONFIG.showOnce) {
    return !localStorage.getItem('infoModalSeen');
  }
  return true;
}

// Inicializar modal quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  if (MODAL_CONFIG.autoShow && shouldShowModal()) {
    setTimeout(showInfoModal, MODAL_CONFIG.delay);
  }
  
  // Event listeners para fechar o modal
  const closeBtn = document.getElementById('close-modal');
  const gotItBtn = document.getElementById('got-it-btn');
  const modal = document.getElementById('info-modal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeInfoModal);
  }
  
  if (gotItBtn) {
    gotItBtn.addEventListener('click', closeInfoModal);
  }
  
  // Fechar ao clicar fora do modal
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeInfoModal();
      }
    });
  }
  
  // Fechar com tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeInfoModal();
    }
  });
});

// Função para mostrar o modal manualmente (pode ser chamada de outros scripts)
window.showInfoModal = showInfoModal;
</script>`
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Template
                        </Button>
                      </div>

                      {/* Back to Top Button */}
                      <div className="group relative bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">⬆️</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-lg font-bold text-gray-900 mb-2">Voltar ao Topo</h5>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Botão flutuante para voltar ao início da página
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-2">
                            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                            <span>Melhora UX em páginas longas</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setEditingCode(null);
                            codeForm.reset({
                              name: "Botão Voltar ao Topo",
                              location: "body",
                              isActive: false,
                              code: `<!-- Back to Top Button -->
<button id="back-to-top" style="position: fixed; bottom: 80px; right: 20px; width: 50px; height: 50px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border: none; border-radius: 50%; color: white; font-size: 20px; cursor: pointer; z-index: 9998; opacity: 0; visibility: hidden; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);">
  ⬆️
</button>

<script>
const backToTopButton = document.getElementById('back-to-top');

// Mostrar/esconder botão baseado no scroll
window.addEventListener('scroll', function() {
  if (window.scrollY > 300) {
    backToTopButton.style.opacity = '1';
    backToTopButton.style.visibility = 'visible';
  } else {
    backToTopButton.style.opacity = '0';
    backToTopButton.style.visibility = 'hidden';
  }
});

// Função de scroll suave para o topo
backToTopButton.addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Efeito hover
backToTopButton.addEventListener('mouseenter', function() {
  this.style.transform = 'scale(1.1)';
  this.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.5)';
});

backToTopButton.addEventListener('mouseleave', function() {
  this.style.transform = 'scale(1)';
  this.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.3)';
});

@media (max-width: 768px) {
  #back-to-top {
    bottom: 75px;
    right: 15px;
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}
</script>`
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Template
                        </Button>
                      </div>

                      {/* Social Share Buttons */}
                      <div className="group relative bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-6 border border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">📱</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-lg font-bold text-pink-900 mb-2">Botões de Compartilhar</h5>
                          <p className="text-sm text-pink-700 leading-relaxed">
                            Facilita compartilhamento nas redes sociais
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-pink-600 bg-pink-100 rounded-lg px-3 py-2">
                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                            <span>Aumenta alcance orgânico</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => {
                            setEditingCode(null);
                            codeForm.reset({
                              name: "Botões de Compartilhamento",
                              location: "body",
                              isActive: false,
                              code: `<!-- Social Share Buttons -->
<div id="social-share" style="position: fixed; left: 20px; top: 50%; transform: translateY(-50%); z-index: 9997; display: flex; flex-direction: column; gap: 10px;">
  
  <!-- WhatsApp -->
  <a href="#" id="share-whatsapp" style="width: 50px; height: 50px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); transition: all 0.3s ease;" title="Compartilhar no WhatsApp">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.686"/>
    </svg>
  </a>
  
  <!-- Facebook -->
  <a href="#" id="share-facebook" style="width: 50px; height: 50px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 4px 15px rgba(24, 119, 242, 0.3); transition: all 0.3s ease;" title="Compartilhar no Facebook">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  </a>
  
  <!-- Twitter -->
  <a href="#" id="share-twitter" style="width: 50px; height: 50px; background: #1da1f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 4px 15px rgba(29, 161, 242, 0.3); transition: all 0.3s ease;" title="Compartilhar no Twitter">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  </a>
  
  <!-- LinkedIn -->
  <a href="#" id="share-linkedin" style="width: 50px; height: 50px; background: #0077b5; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 4px 15px rgba(0, 119, 181, 0.3); transition: all 0.3s ease;" title="Compartilhar no LinkedIn">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </a>
</div>

<script>
// URLs de compartilhamento
const currentUrl = encodeURIComponent(window.location.href);
const currentTitle = encodeURIComponent(document.title);

// WhatsApp
document.getElementById('share-whatsapp').href = 
  \`https://wa.me/?text=\${currentTitle} - \${currentUrl}\`;

// Facebook
document.getElementById('share-facebook').href = 
  \`https://www.facebook.com/sharer/sharer.php?u=\${currentUrl}\`;

// Twitter
document.getElementById('share-twitter').href = 
  \`https://twitter.com/intent/tweet?text=\${currentTitle}&url=\${currentUrl}\`;

// LinkedIn
document.getElementById('share-linkedin').href = 
  \`https://www.linkedin.com/sharing/share-offsite/?url=\${currentUrl}\`;

// Efeitos hover para todos os botões
document.querySelectorAll('#social-share a').forEach(button => {
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});

// Esconder em telas muito pequenas
if (window.innerWidth < 768) {
  document.getElementById('social-share').style.display = 'none';
}
</script>

<style>
@media (max-width: 768px) {
  #social-share {
    display: none !important;
  }
}
</style>`
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Template
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <CodesList codes={bodyCodes} location="body" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>



        {/* Dialog para adicionar/editar código */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Editar código" : "Adicionar código"}
              </DialogTitle>
              <DialogDescription>
                {editingCode 
                  ? "Modifique as informações do código personalizado"
                  : "Adicione um novo código HTML, CSS ou JavaScript ao seu site"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-4">
                <FormField
                  control={codeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Descritivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Google Analytics, Facebook Pixel, Chat Widget..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={codeForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione onde inserir" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="header">Header (dentro do &lt;head&gt;)</SelectItem>
                          <SelectItem value="body">Body (antes do &lt;/body&gt;)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código HTML/CSS/JavaScript</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole aqui o código fornecido pelo serviço (Google, Facebook, etc.)"
                          rows={8}
                          className="font-mono text-sm w-full resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={codeForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Código Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Quando ativo, o código será inserido no site
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCodeMutation.isPending || updateCodeMutation.isPending}
                  >
                    {createCodeMutation.isPending || updateCodeMutation.isPending ? "Salvando..." : editingCode ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}