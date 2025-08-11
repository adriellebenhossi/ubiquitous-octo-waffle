/**
 * TestimonialsManager.tsx
 * 
 * Manager padronizado para gerenciar depoimentos
 * Sistema uniforme de drag-and-drop com setas e controles
 * Corrige mapeamento: photo (não avatar), testimonial (não text)
 */

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Star, Upload, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial } from "@shared/schema";
import { TestimonialImageUpload, TestimonialImageUploadRef } from "./TestimonialImageUpload";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { ResponsiveAdminContainer } from "./base/ResponsiveAdminContainer";
import { ResponsiveGrid, ResponsiveButtonGroup } from "./base/ResponsiveFormFields";
import { useOptimizedTestimonials } from "@/hooks/useOptimizedTestimonials";

const testimonialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  service: z.string().min(1, "Serviço é obrigatório"),
  testimonial: z.string().min(1, "Depoimento é obrigatório"),
  rating: z.number().min(1).max(5),
  photo: z.string().optional(),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

// Opções de avatares organizadas
const AVATAR_OPTIONS = [
  { category: "👶 Bebês e Crianças", options: [
    { value: "baby-boy", label: "👶 Bebê menino" },
    { value: "baby-girl", label: "👶 Bebê menina" },
    { value: "child-happy", label: "😊 Criança feliz" },
    { value: "child-student", label: "🎒 Criança estudante" },
  ]},
  { category: "👦 Adolescentes", options: [
    { value: "teen-boy", label: "👦 Adolescente menino" },
    { value: "teen-girl", label: "👧 Adolescente menina" },
    { value: "teen-student", label: "🎓 Estudante" },
  ]},
  { category: "👩 Adultos", options: [
    { value: "woman-professional", label: "👩‍💼 Mulher profissional" },
    { value: "man-professional", label: "👨‍💼 Homem profissional" },
    { value: "woman-casual", label: "👩 Mulher casual" },
    { value: "man-casual", label: "👨 Homem casual" },
    { value: "woman-happy", label: "😊 Mulher sorrindo" },
    { value: "man-happy", label: "😊 Homem sorrindo" },
  ]},
  { category: "👴 Idosos", options: [
    { value: "elderly-woman", label: "👵 Mulher idosa" },
    { value: "elderly-man", label: "👴 Homem idoso" },
    { value: "grandma", label: "👵 Vovó carinhosa" },
    { value: "grandpa", label: "👴 Vovô carinhoso" },
  ]},
  { category: "👫 Casais e Famílias", options: [
    { value: "couple-young", label: "👫 Casal jovem" },
    { value: "couple-middle", label: "👫 Casal adulto" },
    { value: "family-nuclear", label: "👨‍👩‍👧‍👦 Família nuclear" },
    { value: "single-mother", label: "👩‍👧‍👦 Mãe solo" },
    { value: "single-father", label: "👨‍👧‍👦 Pai solo" },
  ]},
  { category: "🌈 Diversidade", options: [
    { value: "person-disability", label: "♿ Pessoa com deficiência" },
    { value: "lgbtq-person", label: "🏳️‍🌈 Pessoa LGBTQ+" },
    { value: "ethnic-diverse", label: "🌍 Diversidade étnica" },
  ]},
];

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
}

export function TestimonialsManager({ testimonials }: TestimonialsManagerProps) {
  const { toast } = useToast();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageUploadRef = useRef<TestimonialImageUploadRef>(null);

  // Usar hook simplificado para evitar duplas atualizações
  const { 
    testimonials: sortedTestimonials,
    createMutation, 
    updateMutation, 
    deleteMutation, 
    reorderMutation 
  } = useOptimizedTestimonials({
    testimonials,
    adminQueryKey: "/api/admin/testimonials",
    publicQueryKey: "/api/testimonials",
    entityName: "Depoimento"
  });

  const form = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      service: "",
      testimonial: "",
      rating: 5,
      photo: "",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = (data: TestimonialForm) => {
    console.log('📝 Submetendo dados do depoimento:', data);
    
    // Check if there are pending changes and apply them
    const hadPendingChanges = imageUploadRef.current?.applyPendingChanges() || false;
    
    // Get the current photo value after applying changes
    const currentPhotoValue = imageUploadRef.current?.getCurrentValue() || data.photo;
    
    // If we had pending changes, update the form value to ensure sync
    if (hadPendingChanges) {
      form.setValue('photo', currentPhotoValue);
    }
    
    console.log('🔍 Valores antes do submit:', {
      dataPhoto: data.photo,
      currentPhotoValue,
      formPhoto: form.getValues('photo'),
      hadPendingChanges
    });
    
    const finalData = {
      ...data,
      photo: currentPhotoValue,
      order: editingTestimonial ? editingTestimonial.order : sortedTestimonials.length,
    };

    console.log('📤 Dados finais que serão enviados:', finalData);

    const mutation = editingTestimonial ? updateMutation : createMutation;
    const mutationData = editingTestimonial 
      ? { id: editingTestimonial.id, data: finalData }
      : finalData;

    if (editingTestimonial) {
      updateMutation.mutate(mutationData as { id: number; data: any }, {
        onSuccess: () => {
          console.log('✅ Depoimento atualizado com sucesso');
          setEditingTestimonial(null);
          setIsDialogOpen(false);
          form.reset();
          toast({
            title: "Sucesso!",
            description: "Depoimento atualizado com sucesso!",
          });
        },
        onError: (error: any) => {
          console.error('❌ Erro ao atualizar depoimento:', error);
          toast({
            title: "Erro",
            description: "Falha ao atualizar o depoimento. Tente novamente.",
            variant: "destructive",
          });
        }
      });
    } else {
      createMutation.mutate(mutationData as any, {
        onSuccess: () => {
          console.log('✅ Depoimento criado com sucesso');
          setEditingTestimonial(null);
          setIsDialogOpen(false);
          form.reset();
          toast({
            title: "Sucesso!",
            description: "Depoimento criado com sucesso!",
          });
        },
        onError: (error: any) => {
          console.error('❌ Erro ao criar depoimento:', error);
          toast({
            title: "Erro",
            description: "Falha ao criar o depoimento. Tente novamente.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset({
      name: testimonial.name,
      service: testimonial.service,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      photo: testimonial.photo || "",
      isActive: testimonial.isActive,
      order: testimonial.order,
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
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = sortedTestimonials.findIndex((t: Testimonial) => t.id === id);
    if (currentIndex > 0) {
      const newOrder = [...sortedTestimonials];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = sortedTestimonials.findIndex((t: Testimonial) => t.id === id);
    if (currentIndex < sortedTestimonials.length - 1) {
      const newOrder = [...sortedTestimonials];
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
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Gerenciar depoimentos
            </CardTitle>
            <CardDescription>
              Adicione, edite e organize os depoimentos dos clientes
            </CardDescription>
          </div>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              console.log('🔄 Dialog onOpenChange chamado:', { open, isUploading });
              // Prevenir fechamento durante upload
              if (!open && isUploading) {
                console.log('🚫 IMPEDINDO fechamento do modal durante upload');
                return;
              }
              
              // Reset pending changes when closing modal
              if (!open) {
                imageUploadRef.current?.resetPendingChanges();
                setEditingTestimonial(null);
                form.reset();
              }
              
              console.log('✅ Permitindo mudança de estado do dialog para:', open);
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingTestimonial(null);
                  form.reset();
                }}
                className="w-full sm:w-auto btn-admin"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Depoimento
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto"
              onInteractOutside={(e) => {
                if (isUploading) {
                  console.log('🚫 Bloqueando interação fora do modal durante upload');
                  e.preventDefault();
                }
              }}
              onEscapeKeyDown={(e) => {
                if (isUploading) {
                  console.log('🚫 Bloqueando tecla ESC durante upload');
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do depoimento do cliente
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Cliente</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Maria Silva" 
                              {...field} 
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serviço/Especialidade</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Terapia Cognitiva" 
                              {...field} 
                              data-testid="input-service"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="testimonial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depoimento Completo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Depoimento completo do cliente (pode conter HTML)..."
                            className="min-h-[100px] resizable-textarea"
                            {...field} 
                            data-testid="textarea-testimonial"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avaliação</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger data-testid="select-rating">
                                <SelectValue placeholder="Selecione a avaliação" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: rating }, (_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    {Array.from({ length: 5 - rating }, (_, i) => (
                                      <Star key={i + rating} className="w-3 h-3 text-gray-300" />
                                    ))}
                                    <span className="ml-1 text-sm">({rating} estrela{rating > 1 ? 's' : ''})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-end">
                          <div className="flex items-center space-x-2 space-y-0 h-10">
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                data-testid="switch-active" 
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Visível no site</FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Upload de imagem personalizada */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <label className="text-sm font-medium text-gray-700">Foto do Cliente (Opcional)</label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Prévia da imagem atual */}
                      <div className="space-y-3">
                        <span className="text-xs text-gray-500 font-medium">Prévia atual</span>
                        <div className="flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                            {form.watch("photo") && form.watch("photo")?.trim() !== '' ? (
                              <img 
                                src={form.watch("photo")?.startsWith('/') ? form.watch("photo") : `/uploads/testimonials/${form.watch("photo")}`}
                                alt="Prévia da foto" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log("Erro ao carregar preview da imagem:", form.watch("photo"));
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#f3f4f6"/><path d="M24 14c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm0 16c6 0 11 5 11 11v2H13v-2c0-6 5-11 11-11z" fill="#9ca3af"/></svg>';
                                  }
                                }}
                              />
                            ) : (
                              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#f3f4f6"/>
                                <path d="M24 14c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm0 16c6 0 11 5 11 11v2H13v-2c0-6 5-11 11-11z" fill="#9ca3af"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          {form.watch("photo") ? "Foto personalizada" : "Sem foto"}
                        </p>
                      </div>
                      
                      {/* Upload de imagem */}
                      <div className="space-y-3">
                        <span className="text-xs text-gray-500 font-medium">Upload nova foto</span>
                        <TestimonialImageUpload
                          ref={imageUploadRef}
                          value={form.watch("photo")}
                          onChange={(value) => {
                            console.log('📝 Atualizando campo photo para:', value);
                            form.setValue("photo", value);
                          }}
                          onUploadStart={() => {
                            console.log('🔄 Iniciando upload no depoimento...');
                            setIsUploading(true);
                          }}
                          onUploadEnd={() => {
                            console.log('🏁 Finalizando upload no depoimento...');
                            setIsUploading(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        if (isUploading) {
                          toast({
                            title: "Aguarde",
                            description: "Aguarde o upload terminar antes de fechar.",
                            variant: "destructive"
                          });
                          return;
                        }
                        // Reset pending changes when canceling
                        imageUploadRef.current?.resetPendingChanges();
                        setIsDialogOpen(false);
                        setEditingTestimonial(null);
                        form.reset();
                      }}
                      disabled={isUploading}
                      className="w-full sm:w-auto order-2 sm:order-1"
                      data-testid="button-cancel"
                    >
                      {isUploading ? "Aguarde o upload..." : "Cancelar"}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                      className="w-full sm:flex-1 order-1 sm:order-2 btn-admin"
                      data-testid="button-save"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Aguarde o upload...
                        </div>
                      ) : createMutation.isPending || updateMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </div>
                      ) : (
                        editingTestimonial ? "Atualizar Depoimento" : "Criar Depoimento"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {sortedTestimonials.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum depoimento</h3>
            <p className="text-gray-500 mb-4">Comece adicionando o primeiro depoimento dos seus clientes</p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-admin">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro depoimento
            </Button>
          </div>
        ) : (
          <DragAndDropContainer
            items={sortedTestimonials.map((t: Testimonial) => ({ id: t.id, order: t.order }))}
            onReorder={handleReorder}
          >
            {sortedTestimonials.map((testimonial: Testimonial, index: number) => (
              <DragAndDropItem
                key={testimonial.id}
                id={testimonial.id}
                isActive={testimonial.isActive}
                isFirst={index === 0}
                isLast={index === sortedTestimonials.length - 1}
                isPending={false}
                onToggleActive={() => handleToggleActive(testimonial.id, !testimonial.isActive)}
                onMoveUp={() => handleMoveUp(testimonial.id)}
                onMoveDown={() => handleMoveDown(testimonial.id)}
                onEdit={() => handleEdit(testimonial)}
                onDelete={() => handleDelete(testimonial.id)}
              >
                <div className="w-full max-w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {testimonial.photo && testimonial.photo.trim() !== '' ? (
                        <img 
                          src={testimonial.photo.startsWith('/') ? testimonial.photo : `/uploads/testimonials/${testimonial.photo}`}
                          alt={`Foto de ${testimonial.name}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log("Erro ao carregar foto do depoimento:", testimonial.photo);
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#f3f4f6"/><path d="M12 7c2.5 0 4.5 2 4.5 4.5S14.5 16 12 16s-4.5-2-4.5-4.5S9.5 7 12 7zm0 7.5c3 0 5.5 2.5 5.5 5.5v1.5H6.5V20c0-3 2.5-5.5 5.5-5.5z" fill="#9ca3af"/></svg>';
                            }
                          }}
                        />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#f3f4f6"/>
                          <path d="M12 7c2.5 0 4.5 2 4.5 4.5S14.5 16 12 16s-4.5-2-4.5-4.5S9.5 7 12 7zm0 7.5c3 0 5.5 2.5 5.5 5.5v1.5H6.5V20c0-3 2.5-5.5 5.5-5.5z" fill="#9ca3af"/>
                        </svg>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 max-w-full w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {testimonial.name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {testimonial.service}
                          </Badge>
                          <div className="flex">
                            {Array.from({ length: testimonial.rating }, (_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 break-words">
                        "{testimonial.testimonial}"
                      </p>
                    </div>
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