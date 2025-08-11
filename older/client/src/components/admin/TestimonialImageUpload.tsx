
import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface TestimonialImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export interface TestimonialImageUploadRef {
  applyPendingChanges: () => void;
  getCurrentValue: () => string;
  resetPendingChanges: () => void;
}

export const TestimonialImageUpload = forwardRef<TestimonialImageUploadRef, TestimonialImageUploadProps>(
  ({ value, onChange, onUploadStart, onUploadEnd }, ref) => {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [pendingRemoval, setPendingRemoval] = useState(false);

    // Expose function to apply pending changes
    useImperativeHandle(ref, () => ({
      applyPendingChanges: () => {
        if (pendingRemoval) {
          console.log('🔄 Aplicando remoção pendente antes do submit - removendo foto');
          onChange("");
          setPendingRemoval(false);
          return true; // Indica que houve mudança
        } else {
          console.log('🔄 Nenhuma mudança pendente para aplicar');
          return false; // Indica que não houve mudança
        }
      },
      getCurrentValue: () => {
        const currentValue = pendingRemoval ? "" : value || "";
        console.log('📄 getCurrentValue:', { pendingRemoval, value, currentValue });
        return currentValue;
      },
      resetPendingChanges: () => {
        console.log('🔄 Resetando mudanças pendentes - voltando ao estado original');
        setPendingRemoval(false);
      },
      hasPendingChanges: () => {
        return pendingRemoval;
      }
    }));

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Erro", 
        description: "Por favor, selecione apenas arquivos de imagem.", 
        variant: "destructive" 
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Erro", 
        description: "A imagem deve ter no máximo 5MB.", 
        variant: "destructive" 
      });
      return;
    }

    console.log('🔄 Iniciando upload de imagem...');
    setUploading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('📤 Enviando para API...');
      const response = await fetch('/api/admin/upload/testimonials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      console.log('🎯 Resposta da API:', result);
      
      // A API retorna imagePath diretamente
      if (result.imagePath) {
        console.log('✅ Upload bem-sucedido, atualizando valor...');
        onChange(result.imagePath);
        setPendingRemoval(false); // Reset pending removal on new upload
        // Não mostrar toast para evitar interferência no modal
        console.log('✅ Foto do depoimento enviada com sucesso!');
      } else {
        throw new Error('Resposta da API não contém imagePath');
      }
      
      // Reset do input para permitir novo upload do mesmo arquivo
      event.target.value = '';
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast({ 
        title: "Erro", 
        description: `Erro ao fazer upload da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 
        variant: "destructive" 
      });
    } finally {
      console.log('🏁 Finalizando upload...');
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const removeImage = (event: React.MouseEvent) => {
    // Prevenir qualquer comportamento que possa fechar o modal
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🗑️ Removendo imagem imediatamente e atualizando formulário');
    
    // Remover imediatamente e atualizar o formulário
    onChange("");
    setPendingRemoval(false); // Não precisamos de estado pendente
    
    console.log('✅ Foto removida do campo do formulário');
  };

  return (
    <div className="space-y-4">
      {/* Área de upload principal */}
      <div className="space-y-3">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          data-testid="input-photo-upload"
        />
        
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">
            {value 
              ? "✅ Foto carregada - selecione outra para substituir ou clique em Remover" 
              : "📷 Adicione uma foto personalizada"
            }
          </p>
          <p>Formatos: JPG, PNG, WebP (máx. 5MB) • Será otimizada automaticamente</p>
          {uploading && (
            <div className="flex items-center gap-2 text-blue-600 font-medium bg-blue-50 p-2 rounded">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Otimizando imagem para WebP...
            </div>
          )}
        </div>
      </div>

      {/* Botão para remover foto se existir */}
      {value && !uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={removeImage}
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          data-testid="button-remove-photo"
        >
          <X className="w-4 h-4 mr-2" />
          Remover foto atual
        </Button>
      )}
    </div>
  );
});

TestimonialImageUpload.displayName = "TestimonialImageUpload";
