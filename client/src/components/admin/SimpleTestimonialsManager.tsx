import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Star, Edit, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Testimonial } from "@shared/schema";
import { SimpleTestimonialUpload } from "./SimpleTestimonialUpload";

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

interface SimpleTestimonialsManagerProps {
  testimonials: Testimonial[];
}

export function SimpleTestimonialsManager({ testimonials }: SimpleTestimonialsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTestimonials, setLocalTestimonials] = useState<Testimonial[]>([]);

  // Inicializar testimonials locais
  useEffect(() => {
    if (testimonials && Array.isArray(testimonials)) {
      setLocalTestimonials([...testimonials].sort((a, b) => a.order - b.order));
    }
  }, [testimonials]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create testimonial');
      return response.json();
    },
    onSuccess: (newTestimonial) => {
      queryClient.setQueryData(['/api/admin/testimonials'], (old: any[] = []) => [...old, newTestimonial]);
      if (newTestimonial.isActive) {
        queryClient.setQueryData(['/api/testimonials'], (old: any[] = []) => [...old, newTestimonial]);
      }
      toast({ title: "Sucesso!", description: "Depoimento criado com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update testimonial');
      return response.json();
    },
    onSuccess: (updatedTestimonial, { id }) => {
      queryClient.setQueryData(['/api/admin/testimonials'], (old: any[] = []) => 
        old.map(item => item.id === id ? updatedTestimonial : item)
      );
      queryClient.setQueryData(['/api/testimonials'], (old: any[] = []) => {
        if (updatedTestimonial.isActive) {
          const exists = old.some(item => item.id === id);
          if (exists) {
            return old.map(item => item.id === id ? updatedTestimonial : item);
          } else {
            return [...old, updatedTestimonial];
          }
        } else {
          return old.filter(item => item.id !== id);
        }
      });
      toast({ title: "Sucesso!", description: "Depoimento atualizado com sucesso!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete testimonial');
      return response.json();
    },
    onSuccess: (response, deletedId) => {
      queryClient.setQueryData(['/api/admin/testimonials'], (old: any[] = []) => 
        old.filter(item => item.id !== deletedId)
      );
      queryClient.setQueryData(['/api/testimonials'], (old: any[] = []) => 
        old.filter(item => item.id !== deletedId)
      );
      toast({ title: "Sucesso!", description: "Depoimento removido com sucesso!" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: Array<{ id: number; order: number }>) => {
      console.log('🔄 SimpleTestimonialsManager - Enviando reordenação:', items);
      const response = await fetch('/api/admin/testimonials/reorder', {
        method: 'PUT', // Corrigido de POST para PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items), // Enviando array direto, não encapsulado
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erro na reordenação:', error);
        throw new Error(`Failed to reorder testimonials: ${error}`);
      }
      const result = await response.json();
      console.log('✅ Reordenação bem-sucedida:', result);
      return result;
    },
    onSuccess: (reorderedItems) => {
      // Atualizar estado local primeiro
      setLocalTestimonials(reorderedItems.sort((a: any, b: any) => a.order - b.order));
      
      // Atualizar cache
      queryClient.setQueryData(['/api/admin/testimonials'], reorderedItems);
      queryClient.setQueryData(['/api/testimonials'], reorderedItems.filter((item: any) => item.isActive));
      
      toast({ title: "Sucesso!", description: "Ordem atualizada com sucesso!" });
    },
    onError: (error) => {
      console.error('❌ Erro na reordenação:', error);
      toast({ 
        title: "Erro", 
        description: "Falha ao reordenar depoimentos. Tente novamente.",
        variant: "destructive"
      });
    },
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

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
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
    } else {
      setEditingTestimonial(null);
      form.reset({
        name: "",
        service: "",
        testimonial: "",
        rating: 5,
        photo: "",
        isActive: true,
        order: localTestimonials.length,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    form.reset();
  };

  const onSubmit = (data: TestimonialForm) => {
    const mutationData = {
      ...data,
      photo: data.photo || "",
    };

    if (editingTestimonial) {
      updateMutation.mutate({
        id: editingTestimonial.id,
        data: mutationData
      }, {
        onSuccess: () => closeModal(),
        onError: () => {
          toast({
            title: "Erro",
            description: "Falha ao atualizar o depoimento.",
            variant: "destructive",
          });
        }
      });
    } else {
      createMutation.mutate(mutationData as any, {
        onSuccess: () => closeModal(),
        onError: () => {
          toast({
            title: "Erro",
            description: "Falha ao criar o depoimento.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive }
    });
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = localTestimonials.findIndex(t => t.id === id);
    if (currentIndex > 0) {
      const newOrder = [...localTestimonials];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = localTestimonials.findIndex(t => t.id === id);
    if (currentIndex < localTestimonials.length - 1) {
      const newOrder = [...localTestimonials];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
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
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Depoimento
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {localTestimonials.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum depoimento cadastrado ainda.
            </p>
          ) : (
            localTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{testimonial.name}</h3>
                      <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                        {testimonial.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <div className="flex">
                        {Array.from({ length: testimonial.rating }, (_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{testimonial.service}</p>
                    <p className="text-sm">{testimonial.testimonial}</p>
                    {testimonial.photo && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                          <img 
                            src={testimonial.photo.startsWith('/') ? testimonial.photo : `/uploads/testimonials/${testimonial.photo}`}
                            alt="Foto do cliente" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">Com foto personalizada</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(testimonial.id)}
                      disabled={localTestimonials.findIndex(t => t.id === testimonial.id) === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(testimonial.id)}
                      disabled={localTestimonials.findIndex(t => t.id === testimonial.id) === localTestimonials.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <div className="px-2">
                      <Switch 
                        checked={testimonial.isActive} 
                        onCheckedChange={(checked) => handleToggleActive(testimonial.id, checked)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Modal personalizado sem uso do Radix Dialog */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Só fecha se clicar no backdrop
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Cliente</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
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
                          <FormLabel>Serviço</FormLabel>
                          <FormControl>
                            <Input placeholder="Tipo de atendimento" {...field} />
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
                        <FormLabel>Depoimento</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Depoimento do cliente..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avaliação</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
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
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Visível no site</FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto do Cliente (Opcional)</FormLabel>
                        <FormControl>
                          <SimpleTestimonialUpload
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
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
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}