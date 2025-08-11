/**
 * AboutCredentialsManager.tsx
 * 
 * Manager padronizado para gerenciar credenciais profissionais
 * Sistema uniforme de drag-and-drop com setas e controles
 * Interface consistente com outros managers
 */

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GraduationCap, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";

const credentialSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string().min(1, "Subtítulo é obrigatório"),
  gradient: z.string().min(1, "Gradiente é obrigatório"),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type CredentialForm = z.infer<typeof credentialSchema>;

// Gradientes disponíveis
const GRADIENT_OPTIONS = [
  { value: "from-pink-50 to-purple-50", label: "Rosa Suave" },
  { value: "from-blue-50 to-cyan-50", label: "Azul Suave" },
  { value: "from-green-50 to-teal-50", label: "Verde Suave" },
  { value: "from-yellow-50 to-orange-50", label: "Amarelo Suave" },
  { value: "from-purple-50 to-indigo-50", label: "Roxo Suave" },
  { value: "from-red-50 to-pink-50", label: "Vermelho Suave" },
  { value: "from-gray-50 to-gray-100", label: "Cinza Suave" },
  { value: "from-indigo-50 to-purple-50", label: "Índigo Suave" },
];

interface AboutCredentialsManagerProps {
  configs: SiteConfig[];
}

export function AboutCredentialsManager({ configs }: AboutCredentialsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCredential, setEditingCredential] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Usar credenciais diretamente do cache sem estado local para evitar problemas de sincronização
  const aboutCredentials = configs?.find(c => c.key === 'about_credentials')?.value as any[] || [];
  const sortedCredentials = [...aboutCredentials].sort((a, b) => a.order - b.order);

  const form = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      gradient: "from-pink-50 to-purple-50",
      isActive: true,
      order: 0,
    },
  });

  const updateCredentials = async (newCredentials: any[]) => {
    try {
      console.log("🔄 AboutCredentials - Atualizando credenciais:", newCredentials);
      
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "about_credentials",
          value: newCredentials
        })
      });

      if (response.ok) {
        console.log("✅ AboutCredentials - Credenciais atualizadas com sucesso");
        toast({ title: "Credenciais atualizadas com sucesso!" });
      } else {
        throw new Error("Erro ao atualizar credenciais");
      }
    } catch (error) {
      console.error("❌ AboutCredentials - Erro ao atualizar:", error);
      toast({ 
        title: "Erro ao atualizar credenciais",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const onSubmit = (data: CredentialForm) => {
    const finalData = {
      ...data,
      id: editingCredential ? editingCredential.id : Date.now(),
      order: editingCredential ? editingCredential.order : sortedCredentials.length,
    };

    let newCredentials;
    if (editingCredential) {
      newCredentials = sortedCredentials.map((cred: any) => 
        cred.id === editingCredential.id ? finalData : cred
      );
    } else {
      newCredentials = [...sortedCredentials, finalData];
    }

    updateCredentials(newCredentials);
    setEditingCredential(null);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEdit = (credential: any) => {
    setEditingCredential(credential);
    form.reset({
      title: credential.title,
      subtitle: credential.subtitle,
      gradient: credential.gradient,
      isActive: credential.isActive,
      order: credential.order,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: number) => async (isActive: boolean) => {
    // Criar credenciais atualizadas
    const updatedCredentials = sortedCredentials.map((cred: any) => 
      cred.id === id ? { ...cred, isActive } : cred
    );
    
    try {
      // Salvar no servidor
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "about_credentials",
          value: updatedCredentials
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const responseData = await response.json();

      // Invalidar cache APENAS se necessário
      queryClient.setQueryData(["/api/admin/config"], (oldData: any[] = []) => {
        const configIndex = oldData.findIndex((config: any) => config.key === "about_credentials");
        if (configIndex >= 0) {
          const newData = [...oldData];
          newData[configIndex] = {
            ...newData[configIndex],
            value: updatedCredentials,
            updatedAt: new Date().toISOString()
          };
          return newData;
        }
        return oldData;
      });

      // Atualizar cache público também
      queryClient.setQueryData(["/api/config"], (oldData: any[] = []) => {
        const configIndex = oldData.findIndex((config: any) => config.key === "about_credentials");
        if (configIndex >= 0) {
          const newData = [...oldData];
          newData[configIndex] = {
            ...newData[configIndex],
            value: updatedCredentials,
            updatedAt: new Date().toISOString()
          };
          return newData;
        }
        return oldData;
      });

      // Mostrar notificação de sucesso
      const credentialName = updatedCredentials.find(c => c.id === id)?.title || "Credencial";
      
      toast({ 
        title: `${credentialName} ${isActive ? 'visível' : 'oculta'}`,
        description: isActive ? "Esta credencial aparecerá no site" : "Esta credencial está oculta do site"
      });
      
    } catch (error) {
      // Em caso de erro, invalidar cache para recarregar do servidor
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      
      toast({ 
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta credencial?")) {
      const newCredentials = sortedCredentials.filter((cred: any) => cred.id !== id);
      updateCredentials(newCredentials);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = sortedCredentials.findIndex((c: any) => c.id === id);
    if (currentIndex > 0) {
      const newOrder = [...sortedCredentials];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const reorderedCredentials = newOrder.map((item, index) => ({ ...item, order: index }));
      updateCredentials(reorderedCredentials);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = sortedCredentials.findIndex((c: any) => c.id === id);
    if (currentIndex < sortedCredentials.length - 1) {
      const newOrder = [...sortedCredentials];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      const reorderedCredentials = newOrder.map((item, index) => ({ ...item, order: index }));
      updateCredentials(reorderedCredentials);
    }
  };

  const handleReorder = (reorderedItems: Array<{ id: number | string; order: number }>) => {
    const reorderedCredentials = reorderedItems.map(item => {
      const credential = sortedCredentials.find((c: any) => c.id === Number(item.id));
      return { ...credential, order: item.order };
    });
    updateCredentials(reorderedCredentials);
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      {/* Header da seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Credenciais profissionais
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Formações, especializações e certificações
              </p>
            </div>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingCredential(null);
                form.reset();
              }}
              className="btn-admin w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova credencial
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCredential ? "Editar credencial" : "Nova credencial"}
                </DialogTitle>
                <DialogDescription>
                  Configure uma formação ou certificação profissional
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-semibold text-gray-800">
                            Título principal
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Psicóloga Clínica" 
                              className="h-11 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-xl transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-semibold text-gray-800">
                            Subtítulo/Instituição
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: CFP 08/123456 - Universidade ABC" 
                              className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gradient"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-gray-800">
                          Estilo visual
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-xl transition-all duration-200">
                              <SelectValue placeholder="Selecione um gradiente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GRADIENT_OPTIONS.map((gradient) => (
                              <SelectItem key={gradient.value} value={gradient.value}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient.value} border border-gray-200 shadow-sm`}></div>
                                  <span>{gradient.label}</span>
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
                      <FormItem className="flex items-center justify-between space-y-0 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <FormLabel className="text-sm font-medium text-gray-800">
                            Mostrar no site
                          </FormLabel>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Esta credencial será visível na seção sobre mim
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="btn-admin w-full sm:w-auto"
                    >
                      {editingCredential ? "Salvar alterações" : "Criar credencial"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      
      {/* Lista de credenciais */}
      <div className="mt-4 sm:mt-6">
        {sortedCredentials.length === 0 ? (
          <div className="text-center py-6 sm:py-8 bg-gray-50/50 rounded-xl">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma credencial</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Comece adicionando a primeira credencial profissional</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              size="sm"
              className="btn-admin"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Adicionar primeira credencial
            </Button>
          </div>
        ) : (
          <DragAndDropContainer
            items={sortedCredentials.map((c: any) => ({ id: c.id, order: c.order }))}
            onReorder={handleReorder}
          >
            {sortedCredentials.map((credential: any, index: number) => (
              <DragAndDropItem
                key={credential.id}
                id={credential.id}
                isActive={credential.isActive}
                isFirst={index === 0}
                isLast={index === sortedCredentials.length - 1}
                onToggleActive={() => handleToggleActive(credential.id)(!credential.isActive)}
                onMoveUp={() => handleMoveUp(credential.id)}
                onMoveDown={() => handleMoveDown(credential.id)}
                onEdit={() => handleEdit(credential)}
                onDelete={() => handleDelete(credential.id)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Ícone */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${credential.gradient} flex items-center justify-center flex-shrink-0 border border-gray-200`}>
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 break-words">
                      {credential.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {credential.subtitle}
                    </p>
                  </div>
                </div>
              </DragAndDropItem>
            ))}
          </DragAndDropContainer>
        )}
      </div>
    </div>
  );
}