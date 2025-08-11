
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Globe, Search, Ban, Code, Upload, Image, Share2, Eye, AlertCircle } from "lucide-react";
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

  const marketingSchema = z.object({
    facebookPixel1: z.string().optional(),
    facebookPixel2: z.string().optional(),
    googlePixel: z.string().optional(),
    enableGoogleIndexing: z.boolean().default(true),
    metaTitle: z.string().min(1, "Título SEO é obrigatório"),
    metaDescription: z.string().min(1, "Descrição SEO é obrigatória"),
    metaKeywords: z.string().optional(),
    ogImage: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    twitterCard: z.string().default("summary_large_image"),
  });

  type MarketingForm = z.infer<typeof marketingSchema>;

  // Estado específico para Open Graph image upload com persistência
  const [imageUploadState, setImageUploadState] = useState(() => {
    console.log('🔄 Inicializando estado da imagem...');
    return {
      isUploading: false,
      selectedFile: null as File | null,
      previewUrl: "",
      uploadedImageUrl: "",
      hasChanges: false
    };
  });

  // Extrair valores das configurações de forma segura
  const getMarketingData = () => {
    console.log('📥 CARREGANDO DADOS - Extraindo configurações do banco');
    console.log('📥 Configs recebidas:', configs?.length || 0, 'itens');
    
    const marketingInfo = configs?.find(c => c.key === 'marketing_pixels')?.value as any || {};
    const seoInfo = configs?.find(c => c.key === 'seo_meta')?.value as any || {};
    
    console.log('📊 Dados de marketing encontrados:', marketingInfo);
    console.log('🔍 Dados de SEO encontrados:', seoInfo);
    
    const data = {
      facebookPixel1: marketingInfo.facebookPixel1 || "",
      facebookPixel2: marketingInfo.facebookPixel2 || "",
      googlePixel: marketingInfo.googlePixel || "",
      enableGoogleIndexing: marketingInfo.enableGoogleIndexing ?? true,
      metaTitle: seoInfo.metaTitle || "Adrielle Benhossi - Psicóloga",
      metaDescription: seoInfo.metaDescription || "Psicóloga especialista em terapia. Atendimento presencial e online.",
      metaKeywords: seoInfo.metaKeywords || "psicóloga, terapia, saúde mental",
      ogImage: seoInfo.ogImage || "",
      ogTitle: seoInfo.ogTitle || "",
      ogDescription: seoInfo.ogDescription || "",
      twitterCard: seoInfo.twitterCard || "summary_large_image",
    };
    
    console.log('📋 Dados processados e prontos para uso:', data);
    return data;
  };

  // Função para selecionar arquivo e fazer upload automaticamente
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Arquivo selecionado:', file.name, file.size);

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho do arquivo (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Criar URL de preview local temporário
    const previewUrl = URL.createObjectURL(file);
    console.log('🖼️ URL de preview criada:', previewUrl);
    
    setImageUploadState(prev => {
      console.log('🔄 Estado anterior:', prev);
      const newState = {
        ...prev,
        isUploading: true,
        selectedFile: file,
        previewUrl: previewUrl,
        uploadedImageUrl: "",
        hasChanges: true
      };
      console.log('🔄 Novo estado:', newState);
      return newState;
    });

    // Fazer upload automaticamente
    try {
      const imageUrl = await handleUploadImage(file);
      if (imageUrl) {
        console.log('✅ Upload concluído, URL:', imageUrl);
        toast({
          title: "Imagem carregada com sucesso!",
          description: "Agora você pode salvar as configurações.",
        });
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      // O tratamento de erro já é feito na função handleUploadImage
    }

    // Limpar input
    event.target.value = '';
  };

  // Função para fazer upload da imagem selecionada
  const handleUploadImage = async (fileToUpload?: File) => {
    const file = fileToUpload || imageUploadState.selectedFile;
    if (!file) return;

    console.log('🚀 Iniciando upload da imagem:', file.name);
    setImageUploadState(prev => ({ ...prev, isUploading: true }));

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'seo');

      console.log('📤 Enviando para API...');
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha no upload');

      const result = await response.json();
      const imageUrl = result.url || result.imageUrl;
      console.log('📥 Resposta da API:', result);
      
      if (imageUrl) {
        // Limpar preview local e usar URL do servidor
        if (imageUploadState.previewUrl.startsWith('blob:')) {
          console.log('🧹 Limpando URL blob local');
          URL.revokeObjectURL(imageUploadState.previewUrl);
        }

        console.log('💾 Atualizando estado com URL do servidor:', imageUrl);
        setImageUploadState(prev => {
          const newState = {
            ...prev,
            isUploading: false,
            selectedFile: null,
            previewUrl: imageUrl,
            uploadedImageUrl: imageUrl,
            hasChanges: true
          };
          console.log('💾 Estado atualizado:', newState);
          
          // Persistir no localStorage para evitar perda durante rerenders
          localStorage.setItem('marketing-uploaded-image', JSON.stringify({
            url: imageUrl,
            timestamp: Date.now()
          }));
          console.log('💿 Estado persistido no localStorage');
          
          return newState;
        });
        
        // Marcar como inicializado para evitar sobrescrita
        setHasInitialized(true);

        // Atualizar também o valor do form diretamente
        form.setValue('ogImage', imageUrl);
        
        // Forçar que o form não seja resetado novamente
        setFormInitialized(true);
        console.log('📝 Form atualizado com URL:', imageUrl);
        
        return imageUrl;
        
      } else {
        throw new Error('URL da imagem não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      setImageUploadState(prev => ({ ...prev, isUploading: false }));
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Função para remover a imagem
  const handleRemoveImage = () => {
    console.log('🗑️ REMOVER IMAGEM - Iniciando remoção da imagem');
    console.log('🗑️ Estado atual antes da remoção:', imageUploadState);
    
    // Limpar preview local se existir
    if (imageUploadState.previewUrl && imageUploadState.previewUrl.startsWith('blob:')) {
      console.log('🧹 Limpando URL blob local:', imageUploadState.previewUrl);
      URL.revokeObjectURL(imageUploadState.previewUrl);
    } else {
      console.log('🗑️ Preview não é blob, não precisa limpar URL');
    }

    // Limpar dados do localStorage e marcar remoção
    console.log('🧹 Removendo dados do localStorage');
    localStorage.removeItem('marketing-uploaded-image');
    
    // Marcar que a imagem foi removida recentemente
    console.log('🗑️ Marcando remoção no localStorage');
    localStorage.setItem('marketing-image-removed', JSON.stringify({
      timestamp: Date.now(),
      removed: true
    }));

    // Atualizar o formulário para remover a imagem
    console.log('📝 Limpando campo ogImage do formulário');
    form.setValue('ogImage', '');

    console.log('🗑️ Resetando estado da imagem...');
    setImageUploadState(prev => {
      const newState = {
        ...prev,
        isUploading: false,
        selectedFile: null,
        previewUrl: "",
        uploadedImageUrl: "",
        hasChanges: true
      };
      console.log('🗑️ Novo estado após remoção:', newState);
      return newState;
    });
    
    // Salvar automaticamente a remoção no servidor
    console.log('💾 Salvando remoção da imagem no servidor...');
    const currentData = form.getValues();
    console.log('📋 Dados atuais do formulário antes da remoção:', currentData);
    currentData.ogImage = ''; // Garantir que está vazio
    console.log('📋 Dados que serão enviados para salvar (ogImage vazia):', currentData);
    console.log('🔄 Chamando updateMutation.mutate...');
    updateMutation.mutate(currentData);
    
    console.log('✅ Imagem removida e será salva no servidor automaticamente');
  };

  const form = useForm<MarketingForm>({
    resolver: zodResolver(marketingSchema),
    defaultValues: getMarketingData(),
  });

  // Memoizar os dados iniciais para evitar rerenders desnecessários
  const initialData = React.useMemo(() => {
    console.log('🧠 MEMO - Recalculando dados iniciais');
    console.log('🧠 Configs disponíveis:', configs?.length || 0);
    
    if (configs && configs.length > 0) {
      const data = getMarketingData();
      console.log('🧠 Dados memoizados calculados:', data);
      return data;
    }
    
    console.log('🧠 Nenhuma config disponível, retornando null');
    return null;
  }, [configs?.find(c => c.key === 'marketing_pixels')?.value, configs?.find(c => c.key === 'seo_meta')?.value]);

  // Inicializar estado do upload com a imagem atual se existir (apenas na primeira vez)
  const [hasInitialized, setHasInitialized] = React.useState(false);
  
  React.useEffect(() => {
    console.log('🔄 UseEffect executado:', {
      hasInitialData: !!initialData?.ogImage,
      currentPreview: imageUploadState.previewUrl,
      hasChanges: imageUploadState.hasChanges,
      hasInitialized: hasInitialized,
      ogImage: initialData?.ogImage
    });
    
    // Verificar se há uma remoção recente marcada PRIMEIRO
    const recentRemoval = localStorage.getItem('marketing-image-removed');
    if (recentRemoval && !hasInitialized) {
      try {
        const removalData = JSON.parse(recentRemoval);
        const ageInMinutes = (Date.now() - removalData.timestamp) / (1000 * 60);
        
        // Se a remoção foi feita nos últimos 5 minutos, manter removido
        if (ageInMinutes < 5 && removalData.removed) {
          console.log('🗑️ Imagem foi removida recentemente, mantendo estado vazio');
          setImageUploadState(prev => ({
            ...prev,
            previewUrl: "",
            uploadedImageUrl: "",
            hasChanges: false
          }));
          
          setHasInitialized(true);
          return;
        } else {
          // Limpar dados antigos de remoção
          localStorage.removeItem('marketing-image-removed');
        }
      } catch (e) {
        console.log('⚠️ Erro ao processar remoção recente');
        localStorage.removeItem('marketing-image-removed');
      }
    }

    // Verificar se há uma imagem recém-carregada no localStorage
    const recentUpload = localStorage.getItem('marketing-uploaded-image');
    if (recentUpload && !hasInitialized) {
      try {
        const uploadData = JSON.parse(recentUpload);
        const ageInMinutes = (Date.now() - uploadData.timestamp) / (1000 * 60);
        
        // Se o upload foi feito nos últimos 5 minutos, usar essa imagem
        if (ageInMinutes < 5 && uploadData.url) {
          console.log('🔄 Recuperando imagem recém-carregada do localStorage:', uploadData.url);
          setImageUploadState(prev => ({
            ...prev,
            previewUrl: uploadData.url,
            uploadedImageUrl: uploadData.url,
            hasChanges: true
          }));
          
          // Atualizar o formulário com a nova imagem
          form.setValue('ogImage', uploadData.url);
          console.log('📝 Formulário atualizado com imagem recuperada:', uploadData.url);
          
          // Marcar ambos como inicializados para evitar sobrescrita
          setHasInitialized(true);
          setFormInitialized(true);
          return;
        } else {
          // Limpar dados antigos
          localStorage.removeItem('marketing-uploaded-image');
        }
      } catch (e) {
        console.log('⚠️ Erro ao processar upload recente');
        localStorage.removeItem('marketing-uploaded-image');
      }
    }
    
    // Só inicializar se não foi ainda inicializado E tem dados do banco E não há upload recente
    if (initialData?.ogImage && !hasInitialized && !imageUploadState.previewUrl) {
      console.log('🎯 Inicializando estado com imagem do banco (primeira vez):', initialData.ogImage);
      setImageUploadState(prev => ({
        ...prev,
        previewUrl: initialData.ogImage,
        uploadedImageUrl: initialData.ogImage,
        hasChanges: false
      }));
      setHasInitialized(true);
    }
  }, [initialData?.ogImage, hasInitialized]);

  // Resetar form com dados iniciais quando disponíveis (apenas na primeira vez)
  const [formInitialized, setFormInitialized] = React.useState(false);
  React.useEffect(() => {
    console.log('📝 FORM RESET - Verificando se precisa resetar o formulário');
    console.log('📝 Dados iniciais disponíveis:', !!initialData);
    console.log('📝 Formulário já inicializado:', formInitialized);
    
    if (initialData && !formInitialized) {
      console.log('📝 Resetando formulário com dados iniciais:', initialData);
      
      // Verificar se há uma remoção recente primeiro
      const recentRemoval = localStorage.getItem('marketing-image-removed');
      if (recentRemoval) {
        try {
          const removalData = JSON.parse(recentRemoval);
          const ageInMinutes = (Date.now() - removalData.timestamp) / (1000 * 60);
          
          if (ageInMinutes < 5 && removalData.removed) {
            console.log('📝 FORM RESET - Aplicando remoção recente ao formulário');
            initialData.ogImage = '';
          }
        } catch (e) {
          console.log('⚠️ Erro ao verificar remoção recente durante reset');
        }
      } 
      // Se não há remoção, verificar se há upload recente
      else {
        const recentUpload = localStorage.getItem('marketing-uploaded-image');
        if (recentUpload) {
          try {
            const uploadData = JSON.parse(recentUpload);
            const ageInMinutes = (Date.now() - uploadData.timestamp) / (1000 * 60);
            
            if (ageInMinutes < 5 && uploadData.url) {
              console.log('📝 Preservando imagem recém-carregada durante reset do form:', uploadData.url);
              initialData.ogImage = uploadData.url;
            }
          } catch (e) {
            console.log('⚠️ Erro ao verificar upload recente durante reset');
          }
        }
      }
      
      form.reset(initialData);
      setFormInitialized(true);
      console.log('✅ Formulário resetado e marcado como inicializado');
    } else if (formInitialized) {
      console.log('⏭️ Formulário já foi inicializado, pulando reset');
    } else {
      console.log('⏭️ Dados iniciais não disponíveis ainda, aguardando...');
    }
  }, [initialData, form, formInitialized]);

  const updateMutation = useMutation({
    mutationFn: async (data: MarketingForm) => {
      console.log('💾 INICIANDO salvamento das configurações de marketing:', data);
      
      const marketingConfig = {
        facebookPixel1: data.facebookPixel1,
        facebookPixel2: data.facebookPixel2,
        googlePixel: data.googlePixel,
        enableGoogleIndexing: data.enableGoogleIndexing,
      };
      
      const seoConfig = {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogImage: data.ogImage,
        ogTitle: data.ogTitle || data.metaTitle,
        ogDescription: data.ogDescription || data.metaDescription,
        twitterCard: data.twitterCard,
      };
      
      console.log('📊 Configurações de pixels/marketing:', marketingConfig);
      console.log('🔍 Configurações de SEO/Open Graph:', seoConfig);
      
      const promises = [
        // Atualiza as configurações de marketing
        apiRequest("POST", "/api/admin/config", {
          key: 'marketing_pixels',
          value: marketingConfig
        }),
        // Atualiza as configurações de SEO
        apiRequest("POST", "/api/admin/config", {
          key: 'seo_meta',
          value: seoConfig
        })
      ];
      
      console.log('🚀 Enviando requisições para API...');
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      console.log('✅ SUCESSO - Resposta das APIs recebida:', results);
      
      // Atualizar cache diretamente sem invalidar (evita refetch que reseta o form)
      if (results && Array.isArray(results)) {
        console.log('🔄 Atualizando cache com', results.length, 'configurações');
        results.forEach((config: any, index: number) => {
          console.log(`📋 Cache - Atualizando config ${index + 1}:`, config.key, config.value);
          
          queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
            const filtered = old.filter(c => c.key !== config.key);
            const newData = [...filtered, config];
            console.log(`💾 Cache admin atualizado para ${config.key}:`, newData.length, 'itens');
            return newData;
          });
          
          // Atualizar cache público também
          queryClient.setQueryData(["/api/config"], (old: any[] = []) => {
            const filtered = old.filter(c => c.key !== config.key);
            const newData = [...filtered, config];
            console.log(`🌐 Cache público atualizado para ${config.key}:`, newData.length, 'itens');
            return newData;
          });
          
          // Se é uma configuração SEO, sincronizar o estado da imagem
          if (config.key === 'seo_meta') {
            if (config.value?.ogImage && imageUploadState.uploadedImageUrl) {
              console.log('🖼️ Garantindo que imagem seja mantida no estado após salvamento');
              setImageUploadState(prev => ({
                ...prev,
                previewUrl: config.value.ogImage,
                uploadedImageUrl: config.value.ogImage,
                hasChanges: false
              }));
            } else if (!config.value?.ogImage) {
              console.log('🗑️ Imagem foi removida do servidor, limpando estado local');
              setImageUploadState(prev => ({
                ...prev,
                previewUrl: "",
                uploadedImageUrl: "",
                hasChanges: false
              }));
              localStorage.removeItem('marketing-uploaded-image');
            }
          }
        });
      }
      
      // Manter a imagem no estado após salvar e NÃO limpar dados temporários ainda
      console.log('🖼️ SUCESSO MUTATION - Mantendo estado da imagem após salvamento');
      console.log('🖼️ SUCESSO MUTATION - Resultados recebidos:', results);
      setImageUploadState(prev => {
        const newState = {
          ...prev,
          hasChanges: false
        };
        console.log('🖼️ SUCESSO MUTATION - Estado da imagem atualizado:', newState);
        return newState;
      });
      
      // NÃO limpar localStorage imediatamente para evitar perda durante recarregamentos
      console.log('💾 SUCESSO MUTATION - Mantendo dados no localStorage por segurança');
      
      console.log('🎉 SALVAMENTO COMPLETO - Todas as configurações foram salvas com sucesso');
      toast({ 
        title: "✅ Configurações salvas!",
        description: "SEO e Open Graph atualizados com sucesso"
      });
    },
    onError: (error) => {
      console.error('❌ ERRO MUTATION - Falha ao salvar configurações:', error);
      console.error('❌ ERRO MUTATION - Stack trace:', error.stack);
      console.error('❌ ERRO MUTATION - Detalhes do erro:', {
        message: error.message,
        name: error.name,
        cause: error.cause,
        response: error.response,
        status: error.status
      });
      
      // Resetar estado da mutação
      setImageUploadState(prev => ({
        ...prev,
        hasChanges: true // Manter como "tem mudanças" para indicar que não foi salvo
      }));
      
      toast({ 
        title: "❌ Erro ao salvar configurações", 
        description: `Erro: ${error.message}`,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: MarketingForm) => {
    console.log('🚀 SUBMIT - Formulário submetido com dados:', data);
    console.log('🖼️ Estado atual da imagem:', imageUploadState);
    
    // Priorizar imagem do estado sobre a do formulário
    if (imageUploadState.uploadedImageUrl) {
      console.log('📷 Usando imagem uploaded do estado:', imageUploadState.uploadedImageUrl);
      data.ogImage = imageUploadState.uploadedImageUrl;
    } else if (imageUploadState.previewUrl && !imageUploadState.previewUrl.startsWith('blob:')) {
      console.log('📷 Usando imagem de preview do estado:', imageUploadState.previewUrl);
      data.ogImage = imageUploadState.previewUrl;
    } else if (data.ogImage) {
      console.log('📷 Usando imagem do formulário:', data.ogImage);
    } else {
      console.log('📷 Nenhuma imagem disponível');
    }
    
    console.log('📋 Dados finais que serão enviados:', data);
    console.log('🔄 Iniciando mutação...');
    
    updateMutation.mutate(data);
    
    // Marcar como salvo
    console.log('✅ Marcando estado da imagem como salvo');
    setImageUploadState(prev => ({ ...prev, hasChanges: false }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Configurações de Marketing
          </CardTitle>
          <CardDescription>
            Configure os pixels de rastreamento para Facebook e Google Ads
          </CardDescription>
        </CardHeader>
      <CardContent>
        {/* Informações sobre pixels */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📊 O que são Pixels de Rastreamento?</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              Os pixels são códigos que permitem rastrear visitantes do seu site para criar campanhas publicitárias mais eficazes.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="bg-white p-3 rounded border border-blue-100">
                <h5 className="font-medium text-blue-900">🔵 Facebook Pixel</h5>
                <p className="text-xs mt-1">
                  Rastreia visitantes para criar públicos personalizados e anúncios direcionados no Facebook e Instagram.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <h5 className="font-medium text-blue-900">🟢 Google Pixel</h5>
                <p className="text-xs mt-1">
                  Coleta dados para otimizar campanhas no Google Ads usando inteligência artificial para encontrar clientes ideais.
                </p>
              </div>
            </div>
            <p className="text-xs mt-3 font-medium">
              💡 <strong>Dica:</strong> Com estes pixels configurados, seu gestor de tráfego pode usar IA para otimizar anúncios automaticamente e encontrar pessoas similares aos seus melhores clientes.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Facebook Pixels */}
            <div className="space-y-4">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                Facebook Pixels (até 2)
              </h4>
              
              <FormField
                control={form.control}
                name="facebookPixel1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Pixel #1 (Principal)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 1234567890123456" 
                        {...field} 
                        className="font-mono"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Encontre seu Pixel ID no Facebook Business Manager → Eventos → Pixels
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
                    <FormLabel>Facebook Pixel #2 (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 9876543210987654" 
                        {...field} 
                        className="font-mono"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Segundo pixel para campanhas específicas ou backup
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="googlePixel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    Google Analytics / Google Ads ID
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXX" 
                      {...field} 
                      className="font-mono"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Use G-XXXXXXXXXX para Google Analytics ou AW-XXXXXXXXX para Google Ads
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Controle de Indexação Google */}
            <FormField
              control={form.control}
              name="enableGoogleIndexing"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-2">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Permitir Indexação no Google
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Controla se o site aparece nos resultados de busca do Google
                      </div>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                  </div>
                  
                  {!field.value && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-red-900">⚠️ Indexação Desabilitada</h5>
                          <p className="text-sm text-red-800 mt-1">
                            Com esta opção desativada, o arquivo robots.txt impedirá que o Google e outros mecanismos de busca indexem seu site. 
                            Isso significa que seu site <strong>NÃO aparecerá</strong> nos resultados de pesquisa orgânica.
                          </p>
                          <p className="text-xs text-red-700 mt-2">
                            💡 Use apenas durante desenvolvimento ou se desejar manter o site privado para buscadores.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {field.value && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Search className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-green-900">✅ Indexação Habilitada</h5>
                          <p className="text-sm text-green-800 mt-1">
                            Seu site será indexado pelo Google e aparecerá nos resultados de busca. 
                            Isso é essencial para SEO e visibilidade online.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seção de SEO */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🔍 SEO e Meta Informações
              </h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da página (SEO)</FormLabel>
                      <FormControl>
                        <Input placeholder="Dra. Adrielle Benhossi - Psicóloga em Campo Mourão | Terapia Online e Presencial" {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Aparece na aba do navegador e nos resultados do Google (recomendado: até 60 caracteres)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Página (SEO)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Psicóloga CFP 08/123456 em Campo Mourão. Atendimento presencial e online. Especialista em terapia cognitivo-comportamental para seu bem-estar emocional." rows={3} {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Aparece nos resultados do Google abaixo do título (recomendado: até 160 caracteres)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavras-chave (SEO)</FormLabel>
                      <FormControl>
                        <Input placeholder="psicóloga, Campo Mourão, terapia online, consulta psicológica, saúde mental, CFP" {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Palavras separadas por vírgula que descrevem seu conteúdo
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção Open Graph / Redes Sociais */}
            <div className="border-t pt-6 mt-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  Compartilhamento em Redes Sociais
                </h4>
                <Alert className="bg-blue-50 border-blue-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>📱 O que são Open Graph Tags?</strong><br/>
                    Quando você compartilha seu link no WhatsApp, Facebook, Instagram, Twitter ou qualquer rede social, 
                    essas informações controlam como seu site aparece na prévia:
                    <br/>• <strong>Imagem:</strong> A foto que aparece no card de prévia
                    <br/>• <strong>Título:</strong> O título que aparece no card
                    <br/>• <strong>Descrição:</strong> O texto que aparece abaixo do título
                    <br/><br/>
                    <strong>💡 Por que definir uma imagem personalizada?</strong><br/>
                    Sem uma imagem definida, as redes sociais podem escolher qualquer imagem do seu site (logo, foto aleatória, etc).
                    Com uma imagem personalizada, você garante que sempre aparecerá a imagem que representa melhor seu trabalho.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-6">
                {/* Upload de Imagem Open Graph */}
                <div>
                  <FormLabel className="text-base font-medium mb-3 block">
                    Imagem para Compartilhamento
                    <span className="text-sm font-normal text-gray-500 ml-2">(1200x630px recomendado)</span>
                  </FormLabel>
                  
                  <div className="space-y-4">
                    {/* Prévia da imagem Open Graph */}
                    {imageUploadState.previewUrl && (
                      <div className="relative">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-4">
                            <Eye className="w-5 h-5 text-gray-500 mt-1 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 mb-3">Prévia do Compartilhamento nas Redes Sociais</h5>
                              <div className="max-w-md bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="relative">
                                  <img 
                                    src={imageUploadState.previewUrl} 
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
                                        console.log('🗑️ Event target:', e.target);
                                        console.log('🗑️ Estado atual antes da remoção:', imageUploadState);
                                        console.log('🗑️ Valor atual do form ogImage:', form.getValues('ogImage'));
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
                                    {form.watch('ogTitle') || form.watch('metaTitle') || 'Adrielle Benhossi - Psicóloga'}
                                  </h6>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {form.watch('ogDescription') || form.watch('metaDescription') || 'Psicóloga especialista em terapia. Atendimento presencial e online.'}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">seusite.com</p>
                                </div>
                              </div>
                              
                              {/* Indicador de mudanças não salvas */}
                              {imageUploadState.hasChanges && (
                                <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Clique em "Salvar Configurações" para aplicar a nova imagem</span>
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
                            onChange={(e) => {
                              console.log('📁 INPUT - Arquivo selecionado:', e.target.files?.[0]?.name);
                              console.log('📁 Detalhes do arquivo:', {
                                name: e.target.files?.[0]?.name,
                                size: e.target.files?.[0]?.size,
                                type: e.target.files?.[0]?.type
                              });
                              handleFileSelect(e);
                            }}
                            disabled={imageUploadState.isUploading}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                          />
                        </div>
                        
                        {/* Indicador de upload automático */}
                        {imageUploadState.isUploading && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm">Enviando...</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Status do upload */}
                      {!imageUploadState.previewUrl && (
                        <p className="text-xs text-gray-500 italic">
                          Nenhuma imagem selecionada. Upload será feito automaticamente após escolher o arquivo. (Recomendado: 1200x630 pixels)
                        </p>
                      )}
                    </div>
                    
                    {/* Campo para URL manual */}
                    <FormField
                      control={form.control}
                      name="ogImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">URL da Imagem (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Cole uma URL de imagem aqui se preferir"
                              className="bg-white"
                              onChange={(e) => {
                                field.onChange(e);
                                // Se inserir URL manualmente, atualizar preview
                                if (e.target.value && e.target.value !== imageUploadState.uploadedImageUrl) {
                                  setImageUploadState(prev => ({
                                    ...prev,
                                    previewUrl: e.target.value,
                                    uploadedImageUrl: e.target.value,
                                    hasChanges: true
                                  }));
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Alternativa ao upload: cole a URL de uma imagem já hospedada.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Título e Descrição Personalizados */}
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ogTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título para Redes Sociais</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Deixe vazio para usar o título SEO"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Título que aparece quando compartilhado. Se vazio, usa o título SEO.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitterCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Card Twitter/X</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="summary_large_image">Imagem Grande (Recomendado)</option>
                            <option value="summary">Imagem Pequena</option>
                          </select>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Como seu link aparece no Twitter/X
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ogDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição para Redes Sociais</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deixe vazio para usar a descrição SEO"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Descrição que aparece quando compartilhado. Se vazio, usa a descrição SEO.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                onClick={() => console.log('🖱️ CLIQUE - Botão "Salvar Configurações" clicado')}
              >
                {updateMutation.isPending ? (
                  <>
                    {console.log('⏳ ESTADO - Botão em estado de carregamento (Salvando...)')}
                    Salvando...
                  </>
                ) : (
                  <>
                    {console.log('✅ ESTADO - Botão em estado normal (Salvar Configurações)')}
                    Salvar Configurações
                  </>
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
