import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface SimpleTestimonialUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export function SimpleTestimonialUpload({ value, onChange }: SimpleTestimonialUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Erro", 
        description: "Selecione apenas arquivos de imagem.", 
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

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/testimonials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.filename) {
        onChange(result.filename);
        toast({ 
          title: "Sucesso!", 
          description: "Imagem carregada com sucesso." 
        });
      } else {
        throw new Error(result.error || 'Erro no upload');
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ 
        title: "Erro", 
        description: "Falha ao fazer upload da imagem.", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
      // Limpar o input para permitir novo upload do mesmo arquivo
      event.target.value = '';
    }
  };

  const removeImage = () => {
    onChange("");
    toast({ 
      title: "Imagem removida", 
      description: "A foto foi removida do depoimento." 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="photo-upload"
        />
        <label 
          htmlFor="photo-upload"
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Carregando..." : "Selecionar foto"}
        </label>
        
        {value && !uploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Remover
          </Button>
        )}
      </div>

      {/* Preview da imagem */}
      {value && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-green-300">
            <img 
              src={value.startsWith('/') ? value : `/uploads/testimonials/${value}`}
              alt="Preview da foto" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Foto carregada</p>
            <p className="text-xs text-green-600">{value}</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Fazendo upload da imagem...</span>
        </div>
      )}
    </div>
  );
}