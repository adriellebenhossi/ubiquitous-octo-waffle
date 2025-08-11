/**
 * FaqManager.tsx
 * 
 * Manager padronizado para gerenciar perguntas frequentes
 * Sistema uniforme de drag-and-drop com setas e controles
 * Interface consistente com outros managers
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FaqItem } from "@shared/schema";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { ResponsiveAdminContainer } from "./base/ResponsiveAdminContainer";
import { ResponsiveGrid, ResponsiveButtonGroup } from "./base/ResponsiveFormFields";
import { useManagerMutations } from "@/hooks/useManagerMutations";

const faqSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  answer: z.string().min(1, "Resposta é obrigatória"),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type FaqForm = z.infer<typeof faqSchema>;

interface FaqManagerProps {
  faqItems: FaqItem[];
}

export function FaqManager({ faqItems }: FaqManagerProps) {
  const { toast } = useToast();
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Usar hook de mutações padronizado
  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useManagerMutations({
    adminQueryKey: "/api/admin/faq",
    publicQueryKey: "/api/faq",
    entityName: "Pergunta"
  });

  // Usar dados diretamente dos props, sem estado local desnecessário
  const localFaqItems = [...faqItems].sort((a, b) => a.order - b.order);

  const form = useForm<FaqForm>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = (data: FaqForm) => {
    const finalData = {
      ...data,
      order: editingFaq ? editingFaq.order : localFaqItems.length,
    };

    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: finalData });
    } else {
      createMutation.mutate(finalData);
    }

    setEditingFaq(null);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEdit = (faqItem: FaqItem) => {
    setEditingFaq(faqItem);
    form.reset({
      question: faqItem.question,
      answer: faqItem.answer,
      isActive: faqItem.isActive,
      order: faqItem.order,
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
    if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = localFaqItems.findIndex(f => f.id === id);
    if (currentIndex > 0) {
      const newOrder = [...localFaqItems];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedItems = newOrder.map((item, index) => ({ id: item.id, order: index }));
      reorderMutation.mutate(reorderedItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = localFaqItems.findIndex(f => f.id === id);
    if (currentIndex < localFaqItems.length - 1) {
      const newOrder = [...localFaqItems];
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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription className="text-sm">
              Gerencie as perguntas e respostas mais comuns
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingFaq(null);
                  form.reset();
                }}
                className="w-full sm:w-auto btn-admin"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFaq ? "Editar pergunta" : "Nova pergunta"}
                </DialogTitle>
                <DialogDescription>
                  Configure uma pergunta frequente e sua resposta
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pergunta</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Quanto tempo dura uma sessão?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resposta</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Resposta completa e detalhada..."
                            className="min-h-[120px] resizable-textarea"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormLabel>Visível no site</FormLabel>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="btn-admin"
                    >
                      {editingFaq ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {localFaqItems.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pergunta</h3>
            <p className="text-gray-500 mb-4">Comece adicionando a primeira pergunta frequente</p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-admin">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Pergunta
            </Button>
          </div>
        ) : (
          <DragAndDropContainer
            items={localFaqItems.map(f => ({ id: f.id, order: f.order }))}
            onReorder={handleReorder}
          >
            {localFaqItems.map((faqItem, index) => (
              <DragAndDropItem
                key={faqItem.id}
                id={faqItem.id}
                isActive={faqItem.isActive}
                isFirst={index === 0}
                isLast={index === localFaqItems.length - 1}
                onToggleActive={() => handleToggleActive(faqItem.id, !faqItem.isActive)}
                onMoveUp={() => handleMoveUp(faqItem.id)}
                onMoveDown={() => handleMoveDown(faqItem.id)}
                onEdit={() => handleEdit(faqItem)}
                onDelete={() => handleDelete(faqItem.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone de pergunta */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {faqItem.question}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {faqItem.answer}
                    </p>
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