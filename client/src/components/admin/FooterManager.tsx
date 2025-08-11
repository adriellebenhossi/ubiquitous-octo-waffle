
/**
 * FooterManager.tsx
 * 
 * Manager padronizado para gerenciar configurações do rodapé
 * Sistema uniforme de drag-and-drop com setas e controles para botões de contato
 * Interface consistente com outros managers
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, ChevronUp, ChevronDown, Globe } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaFacebookF, FaTelegramPlane, FaDiscord, FaSkype, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
import { FaXTwitter, FaThreads, FaBluesky } from "react-icons/fa6";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { useManagerMutations } from "@/hooks/useManagerMutations";
import { FooterBadgesManager } from "./FooterBadgesManager";

interface FooterManagerProps {
  footerSettings: any;
}

const generalSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  showCnpj: z.boolean(),
  copyright: z.string().min(1, "Copyright é obrigatório"),
  certificationText: z.string().optional(),
});

const contactButtonSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  link: z.string().min(1, "Link é obrigatório"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
  gradient: z.string().min(1, "Gradiente é obrigatório"),
  isActive: z.boolean(),
});

type ContactButtonForm = z.infer<typeof contactButtonSchema>;

export function FooterManager({ footerSettings }: FooterManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const footerData = footerSettings || {};
  const generalInfo = footerData.general_info || {};
  const contactButtons = footerData.contact_buttons || [];
  const bottomInfo = footerData.bottom_info || {};

  const updateFooterSettings = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/admin/footer-settings", data);
      return response.json();
    },
    onSuccess: (updatedData) => {
      console.log("🎯 FOOTER UPDATE: Atualizando cache após mudança:", updatedData);
      
      // Atualizar cache admin
      queryClient.setQueryData(["/api/admin/footer-settings"], updatedData);
      
      // Atualizar cache público
      queryClient.setQueryData(["/api/footer-settings"], updatedData);
      
      toast({ title: "Configurações do rodapé atualizadas com sucesso!" });
    },
  });

  const generalForm = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      description: generalInfo.description || "Cuidando da sua saúde mental com carinho e dedicação",
      cnpj: generalInfo.cnpj || "12.345.678/0001-90",
      showCnpj: generalInfo.showCnpj ?? true,
      copyright: bottomInfo.copyright || "© 2024 Dra. Adrielle Benhossi • Todos os direitos reservados",
      certificationText: bottomInfo.certificationText || "",
    },
  });

  const contactForm = useForm<ContactButtonForm>({
    resolver: zodResolver(contactButtonSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      icon: "",
      color: "#6366f1",
      gradient: "",
      isActive: true,
    },
  });

  const onSubmitGeneral = (data: any) => {
    const updates = {
      general_info: {
        description: data.description,
        cnpj: data.cnpj,
        showCnpj: data.showCnpj,
      },
      bottom_info: {
        copyright: data.copyright,
        certificationText: data.certificationText,
      }
    };
    updateFooterSettings.mutate(updates);
  };

  const onSubmitContact = (data: ContactButtonForm) => {
    let updatedButtons;
    
    if (editingContact) {
      // Editando botão existente
      updatedButtons = contactButtons.map((button: any) => 
        button.id === editingContact.id 
          ? { ...button, ...data }
          : button
      );
    } else {
      // Criando novo botão
      const newButton = {
        id: Date.now(), // ID temporário
        type: data.title.toLowerCase().replace(/\s+/g, '_'),
        ...data,
        order: contactButtons.length,
      };
      updatedButtons = [...contactButtons, newButton];
    }

    updateFooterSettings.mutate({ contact_buttons: updatedButtons });
    setIsContactDialogOpen(false);
    setEditingContact(null);
    contactForm.reset();
  };

  const handleDragEnd = (reorderedItems: any[]) => {
    console.log("🔄 FooterManager - Reordenando botões:", reorderedItems);
    const updatedButtons = reorderedItems.map((button: any, index: number) => ({
      ...button,
      order: index
    }));
    // Atualizar footer settings diretamente
    updateFooterSettings.mutate({ contact_buttons: updatedButtons });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newButtons = [...contactButtons];
      [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
      handleDragEnd(newButtons);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < contactButtons.length - 1) {
      const newButtons = [...contactButtons];
      [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
      handleDragEnd(newButtons);
    }
  };

  const openEditDialog = (button: any) => {
    setEditingContact(button);
    
    // Resetar e preencher o formulário
    setTimeout(() => {
      contactForm.setValue("title", button.title || button.label || "");
      contactForm.setValue("description", button.description || "");
      contactForm.setValue("link", button.link || "");
      contactForm.setValue("icon", button.icon || "");
      contactForm.setValue("color", button.color || "#6366f1");
      contactForm.setValue("gradient", button.gradient || "");
      contactForm.setValue("isActive", button.isActive ?? true);
    }, 100);
    
    setIsContactDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingContact(null);
    contactForm.reset();
    setIsContactDialogOpen(true);
  };

  const deleteButton = (buttonId: number) => {
    const updatedButtons = contactButtons.filter((button: any) => button.id !== buttonId);
    updateFooterSettings.mutate({ contact_buttons: updatedButtons });
  };

  // Mapeamento de ícones para renderização
  const iconMap: { [key: string]: any } = {
    FaWhatsapp: FaWhatsapp,
    FaInstagram: FaInstagram,
    FaLinkedinIn: FaLinkedinIn,
    FaFacebookF: FaFacebookF,
    FaXTwitter: FaXTwitter,
    FaTelegramPlane: FaTelegramPlane,
    FaYoutube: FaYoutube,
    FaTiktok: FaTiktok,
    FaThreads: FaThreads,
    FaDiscord: FaDiscord,
    FaSkype: FaSkype,
    FaBluesky: FaBluesky,
    FaPinterest: FaPinterest,
    Globe: Globe,
  };

  const iconOptions = [
    { value: "FaWhatsapp", label: "WhatsApp", icon: "💬" },
    { value: "FaInstagram", label: "Instagram", icon: "📷" },
    { value: "FaLinkedinIn", label: "LinkedIn", icon: "💼" },
    { value: "FaFacebookF", label: "Facebook", icon: "👥" },
    { value: "FaXTwitter", label: "X (Twitter)", icon: "✖️" },
    { value: "FaTelegramPlane", label: "Telegram", icon: "✈️" },
    { value: "FaYoutube", label: "YouTube", icon: "📺" },
    { value: "FaTiktok", label: "TikTok", icon: "🎵" },
    { value: "FaThreads", label: "Threads", icon: "🧵" },
    { value: "FaDiscord", label: "Discord", icon: "🎮" },
    { value: "FaSkype", label: "Skype", icon: "📞" },
    { value: "FaBluesky", label: "Bluesky", icon: "🦋" },
    { value: "FaPinterest", label: "Pinterest", icon: "📌" },
    { value: "Globe", label: "Link/Website", icon: "🌐" },
  ];

  const gradientOptions = [
    { name: "Verde WhatsApp", value: "from-green-400 to-green-500" },
    { name: "Rosa Instagram", value: "from-purple-400 to-pink-500" },
    { name: "Azul LinkedIn", value: "from-blue-500 to-blue-600" },
    { name: "Azul Facebook", value: "from-blue-600 to-blue-700" },
    { name: "Preto X (Twitter)", value: "from-gray-800 to-gray-900" },
    { name: "Azul Telegram", value: "from-blue-400 to-blue-500" },
    { name: "Vermelho YouTube", value: "from-red-500 to-red-600" },
    { name: "Preto TikTok", value: "from-gray-900 to-black" },
    { name: "Preto Threads", value: "from-gray-700 to-gray-800" },
    { name: "Roxo Discord", value: "from-indigo-500 to-purple-600" },
    { name: "Azul Skype", value: "from-sky-400 to-blue-500" },
    { name: "Azul Bluesky", value: "from-sky-300 to-blue-400" },
    { name: "Vermelho Pinterest", value: "from-red-600 to-red-700" },
    { name: "Cinza Website", value: "from-gray-500 to-gray-600" },
    { name: "Roxo Personalizado", value: "from-purple-500 to-purple-600" },
    { name: "Rosa Personalizado", value: "from-pink-500 to-pink-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações gerais do rodapé</CardTitle>
          <CardDescription>
            Configure os textos principais, CNPJ e informações de copyright
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4">
              <FormField
                control={generalForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição principal</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição que aparece abaixo do nome da psicóloga" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={generalForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="12.345.678/0001-90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="showCnpj"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exibir CNPJ</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mostrar CNPJ no rodapé
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={generalForm.control}
                name="copyright"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de copyright</FormLabel>
                    <FormControl>
                      <Input placeholder="© 2024 Dra. Adrielle Benhossi..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={generalForm.control}
                name="certificationText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de certificações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Registrada no Conselho Federal de Psicologia..." 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Use &lt;br/&gt; para quebrar linhas. Aparece abaixo dos ícones de certificação.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button type="submit" className="btn-admin w-full sm:w-auto">Salvar informações</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Botões de Contato */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="space-y-4 w-full">
            <div className="w-full">
              <CardTitle className="text-lg sm:text-xl mb-2">Botões de contato</CardTitle>
              <CardDescription className="text-sm">
                Configure os botões de redes sociais e contato do rodapé
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="btn-admin w-full sm:w-auto sm:self-start">
              <Plus className="w-4 h-4 mr-2" />
              Novo botão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700">
              💡 <strong>Dica:</strong> Arraste e solte os botões para reordenar por importância.
            </p>
          </div>

          <DragAndDropContainer
            items={contactButtons}
            onReorder={handleDragEnd}
          >
            {contactButtons
              .sort((a: any, b: any) => a.order - b.order)
              .map((button: any, index: number) => (
                <DragAndDropItem
                  key={button.id}
                  id={button.id}
                  isActive={button.isActive}
                  isFirst={index === 0}
                  isLast={index === contactButtons.length - 1}
                  onToggleActive={() => {
                    const updatedButtons = contactButtons.map((item: any) => 
                      item.id === button.id ? { ...item, isActive: !item.isActive } : item
                    );
                    updateFooterSettings.mutate({ contact_buttons: updatedButtons });
                  }}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onEdit={() => openEditDialog(button)}
                  onDelete={() => deleteButton(button.id)}
                >
                  <div className="flex items-start gap-3 w-full max-w-full">
                    <div 
                      className={`
                        flex items-center justify-center 
                        w-12 h-12 
                        rounded-lg bg-gradient-to-r ${button.gradient} 
                        text-white shrink-0 shadow-sm
                        contact-button-icon
                      `}
                      style={{ minWidth: '48px', minHeight: '48px' }}
                    >
                      {iconMap[button.icon] ? (
                        React.createElement(iconMap[button.icon], { 
                          className: "w-5 h-5 text-white",
                          style: { 
                            fontSize: '20px', 
                            display: 'block',
                            minWidth: '20px',
                            minHeight: '20px',
                            opacity: '1'
                          }
                        })
                      ) : (
                        <span 
                          className="text-lg text-white block" 
                          style={{ 
                            fontSize: '20px',
                            minWidth: '20px',
                            minHeight: '20px',
                            display: 'block',
                            opacity: '1'
                          }}
                        >
                          {iconOptions.find(opt => opt.value === button.icon)?.icon || "📧"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="font-medium text-sm sm:text-base truncate">{button.title || button.label}</div>
                      {(button.description || button.link) && (
                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                          {button.description || button.link}
                        </div>
                      )}
                    </div>
                  </div>
                </DragAndDropItem>
              ))}
          </DragAndDropContainer>

          {contactButtons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum botão de contato cadastrado ainda.</p>
              <p className="text-sm">Clique em "Novo Botão" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar botões de contato */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="footer-contact-form-description">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar Botão de Contato" : "Novo Botão de Contato"}
            </DialogTitle>
            <p id="footer-contact-form-description" className="text-sm text-muted-foreground">
              Configure as informações do botão de contato do rodapé
            </p>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-4 px-1">
              <FormField
                control={contactForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="WhatsApp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(44) 998-362-704" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://wa.me/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {iconMap[option.value] ? (
                                React.createElement(iconMap[option.value], { 
                                  className: "w-4 h-4" 
                                })
                              ) : (
                                <span>{option.icon}</span>
                              )}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={contactForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input type="color" className="w-12 h-10" {...field} />
                        </FormControl>
                        <FormControl>
                          <Input placeholder="#6366f1" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactForm.control}
                  name="gradient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gradiente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um gradiente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradientOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={contactForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Exibir este botão no rodapé
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsContactDialogOpen(false);
                  setEditingContact(null);
                  contactForm.reset();
                }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingContact ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Seção de Badges */}
      <FooterBadgesManager />
    </div>
  );
}


