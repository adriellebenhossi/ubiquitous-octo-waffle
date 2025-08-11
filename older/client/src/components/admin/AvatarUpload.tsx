/**
 * AvatarUpload.tsx
 * 
 * Componente para upload de avatar padrão que será usado nos artigos
 * Permite fazer upload de uma foto de perfil que substitui os placeholders
 */

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Upload, RotateCcw, Camera, X, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AvatarUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Busca o avatar atual
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
    const avatarConfig = configs?.find((c: any) => c.key === 'avatar_url');
    setCurrentAvatar(avatarConfig?.value || null);
  }, [configs]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Arquivo inválido", 
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).", 
        variant: "destructive" 
      });
      return;
    }

    // Verifica o tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Arquivo muito grande", 
        description: "A imagem deve ter no máximo 5MB.", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setCurrentAvatar(data.avatarUrl);

      // Invalidar cache para atualizar componentes
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });

      toast({
        title: "Avatar atualizado!",
        description: "O avatar foi carregado e será usado nos artigos.",
      });

      // Reset do input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);

    try {
      await apiRequest("DELETE", "/api/admin/config/avatar_url");
      
      setCurrentAvatar(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });

      toast({
        title: "Avatar removido",
        description: "O placeholder padrão será usado nos artigos.",
      });
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover avatar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setResetting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Avatar para Artigos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Carregue uma foto de perfil que será usada nos artigos da Biblioteca Completa
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Preview do Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {currentAvatar ? (
                <div className="relative group">
                  <img 
                    src={currentAvatar} 
                    alt="Avatar atual"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                  />
                  {/* Overlay de preview */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {currentAvatar ? "Avatar atual" : "Nenhum avatar carregado"}
              </p>
              <p className="text-xs text-gray-500">
                {currentAvatar ? "Sendo usado nos artigos" : "Usando placeholder padrão"}
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={triggerFileInput}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Carregando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {currentAvatar ? "Trocar Avatar" : "Carregar Avatar"}
                </>
              )}
            </Button>

            {currentAvatar && (
              <Button
                onClick={handleReset}
                disabled={resetting}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                {resetting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remover
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Input de arquivo (oculto) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Dicas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Dicas para o avatar:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use uma foto quadrada (400x400px recomendado)</li>
              <li>• Formatos aceitos: JPG, PNG, GIF</li>
              <li>• Tamanho máximo: 5MB</li>
              <li>• A imagem será otimizada automaticamente</li>
              <li>• Será exibida nos artigos da Biblioteca Completa</li>
            </ul>
          </div>
        </div>

        {/* Modal de Preview */}
        {previewMode && currentAvatar && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative">
              <img 
                src={currentAvatar} 
                alt="Preview do avatar"
                className="max-w-md max-h-[80vh] rounded-lg shadow-2xl"
              />
              <Button
                onClick={() => setPreviewMode(false)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}