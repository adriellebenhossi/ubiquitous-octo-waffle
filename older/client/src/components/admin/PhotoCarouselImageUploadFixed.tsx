/**
 * PhotoCarouselImageUploadFixed.tsx
 * 
 * Componente de upload de imagens para galeria de fotos
 * Conversão automática para WebP para otimização
 * Suporte a múltiplas extensões (PNG, JPG, JPEG, etc.)
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoCarouselImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export function PhotoCarouselImageUploadFixed({ 
  value, 
  onChange, 
  onUploadStart, 
  onUploadEnd 
}: PhotoCarouselImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml'
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    console.log('🔄 Iniciando upload de imagem da galeria...');

    // Validar tipo de arquivo
    if (!acceptedTypes.includes(file.type)) {
      toast({ 
        title: "Tipo de arquivo não suportado", 
        description: "Por favor, selecione uma imagem (PNG, JPG, JPEG, GIF, BMP, TIFF, SVG).", 
        variant: "destructive" 
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: "Arquivo muito grande", 
        description: "A imagem deve ter no máximo 10MB.", 
        variant: "destructive" 
      });
      return;
    }

    console.log('🔄 Definindo estado uploading=true na galeria...');
    setUploading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('📤 Enviando para API da galeria...');
      const response = await fetch('/api/admin/upload/carousel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      console.log('🎯 Resposta da API da galeria:', result);
      
      // A API retorna imagePath diretamente
      if (result.imagePath) {
        console.log('✅ Upload da galeria bem-sucedido, atualizando valor...');
        onChange(result.imagePath);
        // Não mostrar toast para evitar interferência no modal
        console.log('✅ Foto da galeria enviada com sucesso!');
      } else {
        throw new Error('Resposta da API não contém imagePath');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ 
        title: "Erro no upload", 
        description: error instanceof Error ? error.message : "Erro inesperado durante o upload.",
        variant: "destructive" 
      });
    } finally {
      console.log('🏁 Finalizando upload da galeria...');
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onChange("");
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Preview da imagem atual */}
      {value && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative">
              <img 
                src={value} 
                alt="Preview da galeria" 
                className="w-full max-h-64 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Erro ao carregar preview da imagem:', value);
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Imagem otimizada em formato WebP
            </p>
          </CardContent>
        </Card>
      )}

      {/* Área de upload */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
      >
        <CardContent className="p-8">
          <div className="text-center">
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500">
                  Convertendo para WebP e otimizando...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {value ? 'Substituir imagem' : 'Adicionar imagem'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Arraste e solte uma imagem ou clique para selecionar
                  </p>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Formatos aceitos: PNG, JPG, JPEG, GIF, BMP, TIFF, SVG</p>
                  <p>Tamanho máximo: 10MB</p>
                  <p>A imagem será automaticamente convertida para WebP</p>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input oculto para seleção de arquivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}