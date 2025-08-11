/**
 * PhotoCarouselManager.tsx
 * 
 * Manager padronizado para galeria de fotos do carrossel
 * Sistema uniforme de drag-and-drop com setas e controles
 * Corrige importação: PhotoCarousel (não CarouselPhoto)
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Image, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PhotoCarousel } from "@shared/schema";
import { PhotoCarouselImageUploadFixed } from "./PhotoCarouselImageUploadFixed";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { useManagerMutations } from "@/hooks/useManagerMutations";

const photoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Imagem é obrigatória"),
  showText: z.boolean(),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type PhotoForm = z.infer<typeof photoSchema>;

interface PhotoCarouselManagerProps {
  photoCarousel: PhotoCarousel[];
}

export function PhotoCarouselManager({ photoCarousel }: PhotoCarouselManagerProps) {
  const { toast } = useToast();
  const [editingPhoto, setEditingPhoto] = useState<PhotoCarousel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Usar hook simplificado para evitar duplas atualizações  
  const sortedPhotos = [...photoCarousel].sort((a, b) => a.order - b.order);
  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useManagerMutations({
    adminQueryKey: "/api/admin/photo-carousel",
    publicQueryKey: "/api/photo-carousel", 
    entityName: "Foto"
  });

  const form = useForm<PhotoForm>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      showText: true,
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = (data: PhotoForm) => {
    const finalData = {
      ...data,
      order: editingPhoto ? editingPhoto.order : sortedPhotos.length,
    };

    if (editingPhoto) {
      updateMutation.mutate({ id: editingPhoto.id, data: finalData });
    } else {
      createMutation.mutate(finalData);
    }

    setEditingPhoto(null);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEdit = (photo: PhotoCarousel) => {
    setEditingPhoto(photo);
    form.reset({
      title: photo.title,
      description: photo.description || "",
      imageUrl: photo.imageUrl,
      showText: photo.showText,
      isActive: photo.isActive,
      order: photo.order,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = sortedPhotos.findIndex((p: any) => p.id === id);
    if (currentIndex > 0) {
      const newOrder = [...sortedPhotos];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = sortedPhotos.findIndex((p: any) => p.id === id);
    if (currentIndex < sortedPhotos.length - 1) {
      const newOrder = [...sortedPhotos];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleReorder = (reorderedItems: Array<{ id: number | string; order: number }>) => {
    const items = reorderedItems.map(item => ({ id: Number(item.id), order: item.order }));
    reorderMutation.mutate(items);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Image className="w-5 h-5 text-blue-500" />
              Galeria de Fotos
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-1">
              Gerencie as fotos do carrossel principal da homepage
            </CardDescription>
          </div>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              console.log('🔄 Galeria Dialog onOpenChange chamado:', { open, isUploading });
              // Prevenir fechamento durante upload
              if (!open && isUploading) {
                console.log('🚫 IMPEDINDO fechamento do modal da galeria durante upload');
                return;
              }
              console.log('✅ Permitindo mudança de estado do dialog da galeria para:', open);
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingPhoto(null);
                  form.reset();
                }}
                className="w-full sm:w-auto whitespace-nowrap btn-admin"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Foto
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto"
              onInteractOutside={(e) => {
                if (isUploading) {
                  console.log('🚫 Bloqueando interação fora do modal da galeria durante upload');
                  e.preventDefault();
                }
              }}
              onEscapeKeyDown={(e) => {
                if (isUploading) {
                  console.log('🚫 Bloqueando tecla ESC da galeria durante upload');
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingPhoto ? "Editar Foto" : "Nova Foto"}
                </DialogTitle>
                <DialogDescription>
                  Configure uma foto para o carrossel da homepage
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da foto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Consultório acolhedor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição adicional da foto..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Descrição complementar que aparecerá junto com o título
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem do Carrossel</FormLabel>
                        <FormControl>
                          <PhotoCarouselImageUploadFixed
                            value={field.value}
                            onChange={field.onChange}
                            onUploadStart={() => {
                              console.log('🔄 Iniciando upload na galeria...');
                              setIsUploading(true);
                            }}
                            onUploadEnd={() => {
                              console.log('🏁 Finalizando upload na galeria...');
                              setIsUploading(false);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Faça upload de uma imagem (PNG, JPG, JPEG, etc.). Será convertida automaticamente para WebP.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="showText"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Mostrar Texto</FormLabel>
                            <FormDescription className="text-xs">
                              Exibir título e descrição sobre a imagem
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

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Ativo</FormLabel>
                            <FormDescription className="text-xs">
                              Foto visível no site
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

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isUploading}
                      className="w-full sm:w-auto"
                    >
                      {isUploading ? "Aguarde o upload..." : "Cancelar"}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                      className="w-full sm:w-auto btn-admin"
                    >
                      {isUploading ? "Aguarde o upload..." : editingPhoto ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {sortedPhotos.length === 0 ? (
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma foto</h3>
            <p className="text-gray-500 mb-4">Comece adicionando a primeira foto do carrossel</p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-admin">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira foto
            </Button>
          </div>
        ) : (
          <DragAndDropContainer
            items={sortedPhotos.map((p: any) => ({ id: p.id, order: p.order }))}
            onReorder={handleReorder}
          >
            {sortedPhotos.map((photo: any, index: number) => (
              <DragAndDropItem
                key={photo.id}
                id={photo.id}
                isActive={photo.isActive}
                isFirst={index === 0}
                isLast={index === sortedPhotos.length - 1}
                isPending={false}
                onToggleActive={() => handleToggleActive(photo.id, !photo.isActive)}
                onMoveUp={() => handleMoveUp(photo.id)}
                onMoveDown={() => handleMoveDown(photo.id)}
                onEdit={() => handleEdit(photo)}
                onDelete={() => handleDelete(photo.id)}
              >
                {/* Layout Desktop - horizontal */}
                <div className="hidden sm:flex items-start gap-4">
                  {/* Thumbnail da imagem */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {photo.imageUrl ? (
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{photo.title}</h4>
                      {photo.showText && (
                        <Badge variant="secondary" className="text-xs">
                          Com texto
                        </Badge>
                      )}
                    </div>
                    {photo.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Layout Mobile - imagem em cima */}
                <div className="sm:hidden">
                  {/* Thumbnail da imagem - maior e em cima */}
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                    {photo.imageUrl ? (
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo abaixo */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{photo.title}</h4>
                      {photo.showText && (
                        <Badge variant="secondary" className="text-xs">
                          Com texto
                        </Badge>
                      )}
                    </div>
                    {photo.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              </DragAndDropItem>
            ))}
          </DragAndDropContainer>
        )}
      </CardContent>
    </Card>
  );
}