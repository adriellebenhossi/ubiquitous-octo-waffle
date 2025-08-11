
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Image, Brain, Heart, BookOpen, Award, Shield, Target, Compass, Sparkles, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface SiteIconUploadProps {
  configs: SiteConfig[];
}

// Ícones padronizados para psicologia
const psychologyIcons = [
  { id: 'brain', icon: Brain, name: 'Cérebro', color: 'text-purple-600' },
  { id: 'heart', icon: Heart, name: 'Coração', color: 'text-red-500' },
  { id: 'book', icon: BookOpen, name: 'Conhecimento', color: 'text-blue-600' },
  { id: 'award', icon: Award, name: 'Conquista', color: 'text-yellow-600' },
  { id: 'shield', icon: Shield, name: 'Proteção', color: 'text-green-600' },
  { id: 'target', icon: Target, name: 'Objetivo', color: 'text-orange-600' },
  { id: 'compass', icon: Compass, name: 'Orientação', color: 'text-teal-600' },
  { id: 'sparkles', icon: Sparkles, name: 'Inspiração', color: 'text-pink-600' },
];

export function SiteIconUpload({ configs }: SiteIconUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const siteIconConfig = configs?.find(c => c.key === 'site_icon')?.value as any || {};
  const currentIcon = siteIconConfig.iconPath || "";
  const currentIconType = siteIconConfig.iconType || "upload";

  // Sistema robusto para atualizar favicon - compatível com Render.com
  const updateFavicon = async () => {
    const timestamp = Date.now();
    const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    
    if (faviconLink) {
      if (currentIconType === "preset") {
        // Sistema híbrido: tentar arquivo estático primeiro, fallback para API
        console.log('🔄 Atualizando favicon predefinido com sistema híbrido...');
        
        try {
          // Tentar arquivo estático primeiro
          const staticFaviconUrl = `/icons/favicon.ico?v=${timestamp}`;
          const testResponse = await fetch(staticFaviconUrl, { method: 'HEAD' });
          
          if (testResponse.ok) {
            // Arquivo estático disponível
            faviconLink.href = staticFaviconUrl;
            faviconLink.type = "image/x-icon";
            if (appleTouchIcon) {
              appleTouchIcon.href = `/icons/apple-touch-icon.png?v=${timestamp}`;
            }
            console.log('✅ Favicon carregado do arquivo estático');
          } else {
            throw new Error('Arquivo estático não disponível');
          }
        } catch (error) {
          // Fallback para API do banco de dados
          console.log('🔄 Fallback: carregando favicon da API do banco...');
          faviconLink.href = `/api/favicon/favicon.ico?v=${timestamp}`;
          faviconLink.type = "image/x-icon";
          if (appleTouchIcon) {
            appleTouchIcon.href = `/api/favicon/apple-touch-icon.png?v=${timestamp}`;
          }
          console.log('✅ Favicon carregado da API do banco');
        }
        
      } else if (currentIcon && currentIconType === "upload") {
        // Ícone uploadado - usar caminho direto
        faviconLink.href = `${currentIcon}?v=${timestamp}`;
        faviconLink.type = "image/png";
        if (appleTouchIcon) {
          appleTouchIcon.href = `${currentIcon}?v=${timestamp}`;
        }
        console.log('✅ Favicon carregado do upload');
      }
    }
  };

  // Atualizar favicon quando a configuração mudar
  useEffect(() => {
    if (currentIcon && currentIconType) {
      console.log('🔄 Atualizando favicon devido a mudança de configuração:', { currentIcon, currentIconType });
      setTimeout(() => {
        updateFavicon();
      }, 100);
    }
  }, [currentIcon, currentIconType]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload/site-icon', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Falha no upload');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Atualiza a configuração do ícone
      updateConfigMutation.mutate({
        iconPath: data.path,
        iconType: 'upload'
      });
    },
    onError: () => {
      toast({
        title: "Erro no upload",
        description: "Falha ao fazer upload do ícone",
        variant: "destructive",
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (iconData: any) => {
      return apiRequest("POST", "/api/admin/config", {
        key: "site_icon",
        value: iconData
      });
    },
    onSuccess: (response, iconData) => {
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const existingIndex = oldData.findIndex((config: any) => config.key === "site_icon");
        if (existingIndex >= 0) {
          return oldData.map((config, index) => 
            index === existingIndex 
              ? { ...config, value: iconData }
              : config
          );
        } else {
          return [...oldData, { key: "site_icon", value: iconData }];
        }
      });
      
      toast({
        title: "Ícone atualizado!",
        description: "O ícone do site foi atualizado com sucesso",
      });
      // Atualizar favicon no navegador após salvar configuração
      setTimeout(() => {
        updateFavicon();
      }, 500);
      setSelectedPreset(null);
    },
  });

  const selectPresetIcon = async (iconId: string) => {
    console.log('🎯 Iniciando seleção de ícone predefinido:', iconId);
    console.log('📊 Estado atual:', { currentIconType, currentIcon });
    
    setSelectedPreset(iconId);
    
    try {
      // Se havia um ícone personalizado, removê-lo primeiro
      if (currentIconType === "upload" && currentIcon) {
        console.log('🗑️ Removendo ícone personalizado anterior...');
        await fetch('/api/admin/upload/site-icon', { method: 'DELETE' });
      }
      
      // Gerar o favicon no servidor
      console.log('🎨 Gerando favicon para ícone predefinido...');
      const response = await fetch('/api/admin/generate/preset-favicon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconId })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao gerar favicon');
      }
      
      const result = await response.json();
      console.log('✅ Favicon gerado:', result);
      
      // Salvar configuração do ícone predefinido
      console.log('💾 Salvando configuração...');
      updateConfigMutation.mutate({
        iconPath: iconId,
        iconType: "preset"
      });
      
    } catch (error) {
      console.error('❌ Erro ao selecionar ícone predefinido:', error);
      toast({
        title: "Erro",
        description: "Falha ao aplicar ícone predefinido",
        variant: "destructive",
      });
      setSelectedPreset(null);
    }
  };

  const resetIconMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/admin/upload/site-icon");
    },
    onSuccess: () => {
      updateConfigMutation.mutate({
        iconPath: "",
        iconType: "upload"
      });
    },
  });

  // Nova mutação para reset completo do ícone
  const completeResetMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Iniciando reset completo do ícone do site');
      
      // Chamar endpoint para reset completo
      const response = await fetch('/api/admin/site-icon/reset', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        // Tentar obter detalhes do erro da resposta
        let errorDetails = 'Erro desconhecido';
        try {
          const errorData = await response.json();
          errorDetails = errorData.details || errorData.error || errorData.message || 'Erro interno';
          console.error('❌ Detalhes do erro do servidor:', errorData);
        } catch (e) {
          console.error('❌ Erro ao analisar resposta de erro:', e);
        }
        
        throw new Error(`Erro ${response.status}: ${errorDetails}`);
      }
      
      const result = await response.json();
      console.log('✅ Resposta do servidor:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Reset completo realizado com sucesso:', data);
      
      // Limpar configuração do ícone
      updateConfigMutation.mutate({
        iconPath: "",
        iconType: "upload"
      });
      
      // Atualizar favicon no navegador removendo o ícone
      const timestamp = Date.now();
      const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = `data:image/x-icon;base64,?v=${timestamp}`;
      }
      
      toast({
        title: "Ícone removido!",
        description: data.message || "O ícone do site foi removido completamente",
      });
    },
    onError: (error) => {
      console.error('❌ Erro no reset completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro no reset",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };



  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Verifica se há algum ícone ativo
  const hasActiveIcon = (currentIconType === "preset" && currentIcon) || (currentIconType === "upload" && currentIcon);

  // Ref para o input de arquivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm text-muted-foreground flex-1">
          <p><strong>Ícone do Site (Favicon):</strong></p>
          <p className="mt-1">Este ícone aparecerá na aba do navegador e nos favoritos. Escolha um ícone predefinido ou faça upload de uma imagem personalizada.</p>
        </div>
        
        {/* Botão de reset universal - só aparece quando há ícone ativo */}
        {hasActiveIcon && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => completeResetMutation.mutate()}
            disabled={completeResetMutation.isPending}
            className="ml-2 sm:ml-4 text-destructive hover:text-destructive shrink-0"
            title="Remover ícone do site completamente"
          >
            {completeResetMutation.isPending ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Resetar ícone</span>
              <span className="sm:hidden">Reset</span>
            </span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 text-xs sm:text-sm">
          <TabsTrigger value="presets" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Ícones predefinidos</span>
            <span className="sm:hidden">Predefinidos</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Upload personalizado</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            <p>Escolha um ícone relacionado à psicologia:</p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {psychologyIcons.map((iconData) => {
              const IconComponent = iconData.icon;
              const isSelected = currentIconType === "preset" && currentIcon === iconData.id;
              
              return (
                <Card 
                  key={iconData.id}
                  className={`p-2 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  } ${updateConfigMutation.isPending && selectedPreset === iconData.id ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (!updateConfigMutation.isPending) {
                      console.log('Selecionando ícone predefinido:', iconData.id);
                      selectPresetIcon(iconData.id);
                    }
                  }}
                >
                  <div className="text-center space-y-1 sm:space-y-2">
                    <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                      {updateConfigMutation.isPending && selectedPreset === iconData.id ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${iconData.color}`} />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{iconData.name}</p>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {currentIconType === "preset" && currentIcon && (
            <Card className="p-3 sm:p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                  {(() => {
                    const selectedIcon = psychologyIcons.find(icon => icon.id === currentIcon);
                    if (selectedIcon) {
                      const IconComponent = selectedIcon.icon;
                      return <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedIcon.color}`} />;
                    }
                    return <Image className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-green-800">Ícone ativo</p>
                  <p className="text-xs text-green-600 truncate">
                    {psychologyIcons.find(icon => icon.id === currentIcon)?.name || 'Ícone selecionado'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            <p>Faça upload de uma imagem personalizada (PNG, JPG ou ICO):</p>
          </div>

          {currentIconType === "upload" && currentIcon ? (
            <Card className="p-3 sm:p-4 bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border rounded-lg flex items-center justify-center bg-muted">
                    <img 
                      src={currentIcon} 
                      alt="Ícone atual" 
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                      }}
                    />
                    <Image className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground hidden" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">Ícone personalizado</p>
                    <p className="text-xs text-muted-foreground">Ícone ativo</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita ativação do clique do card
                    resetIconMutation.mutate();
                  }}
                  disabled={resetIconMutation.isPending}
                  title="Remover ícone"
                  className="shrink-0"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Card 
                className={`p-4 sm:p-8 border-2 border-dashed transition-colors cursor-pointer hover:border-primary hover:bg-primary/5 ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileSelector}
              >
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Adicionar ícone personalizado</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Arraste uma imagem aqui ou clique para selecionar</span>
                      <span className="sm:hidden">Toque para adicionar</span>
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>


    </div>
  );
}
