import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, RotateCcw, User, X, Eye, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function HeroImageUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [resetting, setResetting] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Busca a imagem atual do hero
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  useEffect(() => {
    const heroImage = configs?.find((c: any) => c.key === 'hero_image');
    const imagePath = heroImage?.value?.path || heroImage?.value;
    // Reseta a imagem quando não há configuração ou está vazia
    setCurrentImage(imagePath && imagePath.trim() !== '' ? imagePath : null);
  }, [configs]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "❌ Arquivo inválido", 
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).", 
        variant: "destructive" 
      });
      return;
    }

    // Verifica o tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "❌ Arquivo muito grande", 
        description: "A imagem deve ter no máximo 5MB.", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/hero', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const result = await response.json();
      setCurrentImage(result.imagePath);
      
      // Atualiza cache manualmente SEM invalidação para evitar recarregamentos
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        const updated = [...old];
        const index = updated.findIndex(item => item.key === 'hero_image');
        
        const newConfig = {
          key: 'hero_image',
          value: { path: result.imagePath }
        };
        
        if (index >= 0) {
          updated[index] = newConfig;
        } else {
          updated.push(newConfig);
        }
        
        return updated;
      });
      
      toast({ 
        title: "✅ Sucesso!", 
        description: "Foto de perfil atualizada com sucesso!" 
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ 
        title: "❌ Erro no upload", 
        description: "Erro ao fazer upload da imagem. Tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      // Limpa o input
      if (event.target) {
        event.target.value = '';
      }
    }
  };



  const handleResetToDefault = async () => {
    setResetting(true);
    
    try {
      const response = await fetch('/api/admin/config/hero_image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Atualiza o estado local
      setCurrentImage(null);
      
      // Atualiza cache silenciosamente sem recarregamento
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        return old.filter(config => config.key !== 'hero_image');
      });
      
      toast({ 
        title: "✅ Avatar restaurado", 
        description: "Avatar original restaurado! Header e Footer voltaram aos placeholders." 
      });
    } catch (error) {
      console.error('Erro ao restaurar avatar:', error);
      toast({ 
        title: "❌ Erro", 
        description: "Erro ao restaurar avatar. Tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setResetting(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      {previewMode && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden">
            <button
              onClick={() => setPreviewMode(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={currentImage}
              alt="Preview da foto de perfil"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Área de Upload e Controles */}
      <Card className="p-6 border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex flex-col items-center space-y-4">
          {/* Preview da Imagem Atual */}
          {currentImage ? (
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={currentImage} 
                  alt="Foto de perfil atual" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreviewMode(true)}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-gray-200">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Status */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900">
              {currentImage ? "Foto de Perfil Carregada" : "Nenhuma Foto Carregada"}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {currentImage 
                ? "Esta foto aparece no Header, Hero, Footer e seção Sobre" 
                : "Clique para adicionar uma foto profissional"
              }
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="w-full max-w-md space-y-3">
            {/* Upload Button */}
            <Button
              onClick={triggerFileSelect}
              disabled={uploading}
              className="btn-admin w-full"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {currentImage ? "Trocar foto" : "Adicionar foto"}
                </>
              )}
            </Button>

            {currentImage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Preview Button */}
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(true)}
                  className="border-gray-300 w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  onClick={handleResetToDefault}
                  disabled={resetting}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full"
                >
                  {resetting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Resetar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="text-center text-xs text-gray-500 max-w-md">
            <p>
              <strong>Formatos aceitos:</strong> JPG, PNG, GIF
            </p>
            <p>
              <strong>Tamanho máximo:</strong> 5MB
            </p>
            {currentImage && (
              <p className="mt-2 text-amber-600">
                <strong>Resetar:</strong> Remove a foto e restaura o avatar original + placeholders de silhueta
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}