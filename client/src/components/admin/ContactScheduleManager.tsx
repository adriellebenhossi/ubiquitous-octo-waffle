/**
 * ContactScheduleManager.tsx
 * 
 * Manager padronizado para gerenciar configurações de contato e horários
 * Sistema uniforme de drag-and-drop com setas e controles para contatos
 * Interface consistente com outros managers
 */

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Mail, MapPin, Clock, MessageCircle, ChevronUp, ChevronDown, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DragAndDropContainer } from "./base/DragAndDropContainer";
import { DragAndDropItem } from "./base/DragAndDropItem";
import { useManagerMutations } from "@/hooks/useManagerMutations";
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaFacebookF, FaTelegramPlane, FaDiscord, FaSkype, FaYoutube, FaTiktok, FaEnvelope, FaPinterest } from "react-icons/fa";
import { FaXTwitter, FaThreads, FaBluesky } from "react-icons/fa6";
import { SiOnlyfans } from "react-icons/si";
import { ModernIconSelector } from "./base/ModernIconSelector";

interface ContactScheduleManagerProps {
  contactSettings: any;
}

const contactSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  icon: z.string().min(1, "Ícone é obrigatório"),
  gradient: z.string().min(1, "Gradiente é obrigatório"),
  link: z.string().min(1, "Link é obrigatório"),
  isActive: z.boolean(),
  order: z.number().min(0),
});

const scheduleSchema = z.object({
  weekdays: z.string().min(1, "Horário dos dias úteis é obrigatório"),
  saturday: z.string().min(1, "Horário do sábado é obrigatório"),
  sunday: z.string().min(1, "Horário do domingo é obrigatório"),
  additional_info: z.string().optional(),
});

const locationSchema = z.object({
  city: z.string().min(1, "Cidade é obrigatória"),
  maps_link: z.string().min(1, "Link do Google Maps é obrigatório"),
});

const contactCardSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  iconColor: z.string().min(1, "Cor do ícone é obrigatória"),
  backgroundColor: z.string().min(1, "Cor de fundo é obrigatória"),
});

const infoCardSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  iconColor: z.string().min(1, "Cor do ícone é obrigatória"),
  backgroundColor: z.string().min(1, "Cor de fundo é obrigatória"),
});

type ContactForm = z.infer<typeof contactSchema>;
type ScheduleForm = z.infer<typeof scheduleSchema>;
type LocationForm = z.infer<typeof locationSchema>;
type ContactCardForm = z.infer<typeof contactCardSchema>;
type InfoCardForm = z.infer<typeof infoCardSchema>;

const iconMap: { [key: string]: any } = {
  FaWhatsapp: FaWhatsapp,
  FaInstagram: FaInstagram,
  FaLinkedinIn: FaLinkedinIn,
  FaXTwitter: FaXTwitter,
  FaFacebookF: FaFacebookF,
  FaTelegramPlane: FaTelegramPlane,
  FaDiscord: FaDiscord,
  FaSkype: FaSkype,
  FaYoutube: FaYoutube,
  FaTiktok: FaTiktok,
  FaThreads: FaThreads,
  FaBluesky: FaBluesky,
  FaPinterest: FaPinterest,
  SiOnlyfans: SiOnlyfans,
  FaEnvelope: FaEnvelope,
  Globe: Globe,
  Mail: Mail,
  MapPin: MapPin,
  Clock: Clock,
};

// Interface para opções de ícones
interface IconOption {
  value: string;
  label: string;
  gradient: string;
}

// Opções de ícones com gradientes predefinidos para cada rede social
const iconOptions: IconOption[] = [
  { value: "FaWhatsapp", label: "WhatsApp", gradient: "from-green-400 to-green-500" },
  { value: "FaInstagram", label: "Instagram", gradient: "from-purple-400 to-pink-500" },
  { value: "FaLinkedinIn", label: "LinkedIn", gradient: "from-blue-500 to-blue-600" },
  { value: "FaFacebookF", label: "Facebook", gradient: "from-blue-600 to-blue-700" },
  { value: "FaXTwitter", label: "X (Twitter)", gradient: "from-gray-800 to-gray-900" },
  { value: "FaTelegramPlane", label: "Telegram", gradient: "from-blue-400 to-blue-500" },
  { value: "FaYoutube", label: "YouTube", gradient: "from-red-500 to-red-600" },
  { value: "FaTiktok", label: "TikTok", gradient: "from-gray-900 to-black" },
  { value: "FaThreads", label: "Threads", gradient: "from-gray-700 to-gray-800" },
  { value: "FaDiscord", label: "Discord", gradient: "from-indigo-500 to-purple-600" },
  { value: "FaSkype", label: "Skype", gradient: "from-sky-400 to-blue-500" },
  { value: "FaBluesky", label: "Bluesky", gradient: "from-sky-300 to-blue-400" },
  { value: "FaPinterest", label: "Pinterest", gradient: "from-red-600 to-red-700" },
  { value: "Globe", label: "Link/Website", gradient: "from-gray-500 to-gray-600" },
  { value: "SiOnlyfans", label: "OnlyFans", gradient: "from-blue-500 to-cyan-400" },
  { value: "FaEnvelope", label: "Email", gradient: "from-red-500 to-red-600" },
];

const gradientOptions = [
  { name: "Verde WhatsApp", value: "from-green-400 to-green-500", id: "whatsapp" },
  { name: "Rosa Instagram", value: "from-purple-400 to-pink-500", id: "instagram" },
  { name: "Azul LinkedIn", value: "from-blue-500 to-blue-600", id: "linkedin" },
  { name: "Azul Facebook", value: "from-blue-600 to-blue-700", id: "facebook" },
  { name: "Preto X (Twitter)", value: "from-gray-800 to-gray-900", id: "twitter" },
  { name: "Azul Telegram", value: "from-blue-400 to-blue-500", id: "telegram" },
  { name: "Vermelho YouTube", value: "from-red-500 to-red-600", id: "youtube" },
  { name: "Preto TikTok", value: "from-gray-900 to-black", id: "tiktok" },
  { name: "Preto Threads", value: "from-gray-700 to-gray-800", id: "threads" },
  { name: "Roxo Discord", value: "from-indigo-500 to-purple-600", id: "discord" },
  { name: "Azul Skype", value: "from-sky-400 to-blue-500", id: "skype" },
  { name: "Azul Bluesky", value: "from-sky-300 to-blue-400", id: "bluesky" },
  { name: "Cinza Website", value: "from-gray-500 to-gray-600", id: "website" },
  { name: "Azul OnlyFans", value: "from-blue-500 to-cyan-400", id: "onlyfans" },
  { name: "Vermelho Email", value: "from-red-400 to-red-500", id: "email" },
  { name: "Vermelho Pinterest", value: "from-red-600 to-red-700", id: "pinterest" },
  { name: "Roxo Personalizado", value: "from-purple-500 to-purple-600", id: "purple-custom" },
  { name: "Rosa Personalizado", value: "from-pink-500 to-pink-600", id: "pink-custom" },
  { name: "Azul Personalizado", value: "from-blue-300 to-blue-500", id: "blue-custom" },
  { name: "Verde Personalizado", value: "from-green-500 to-green-600", id: "green-custom" },
];

export function ContactScheduleManager({ contactSettings }: ContactScheduleManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactItems, setContactItems] = useState<any[]>([]);

  // Usar hook de mutações padronizado para contatos que têm ordem
  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useManagerMutations({
    adminQueryKey: "/api/admin/contact-settings",
    publicQueryKey: "/api/contact-settings",
    entityName: "Contato"
  });

  // Funções para reordenação de contatos (sistema padronizado)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newItems = [...contactItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    
    // Atualizar as ordens
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    setContactItems(updatedItems);
    // Usar sistema padronizado em vez de updateContactSettings diretamente
    const reorderData = updatedItems.map(item => ({ id: item.id, order: item.order }));
    updateContactSettings.mutate({
      contact_items: updatedItems
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === contactItems.length - 1) return;
    
    const newItems = [...contactItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    
    // Atualizar as ordens
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    setContactItems(updatedItems);
    // Usar sistema padronizado em vez de updateContactSettings diretamente
    updateContactSettings.mutate({
      contact_items: updatedItems
    });
  };

  const handleDragEnd = (updatedItems: any[]) => {
    setContactItems(updatedItems);
    // Usar sistema padronizado em vez de updateContactSettings diretamente
    updateContactSettings.mutate({
      contact_items: updatedItems
    });
  };

  // Usar ref para evitar loops desnecessários
  const contactSettingsRef = useRef(contactSettings);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Apenas inicializa uma vez ou quando os dados realmente mudam
    if (contactSettings && (!hasInitialized.current || JSON.stringify(contactSettings) !== JSON.stringify(contactSettingsRef.current))) {
      setContactItems(contactSettings.contact_items || []);
      contactSettingsRef.current = contactSettings;
      hasInitialized.current = true;
    }
  }, [contactSettings]);

  // Ref para debounce de atualizações
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mutação para atualizar configurações de contato - ULTRA OTIMIZADA 
  const updateContactSettings = useMutation({
    mutationFn: async (data: any) => {
      // Cancela requisições anteriores pendentes
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce para evitar múltiplas requisições simultâneas
      return new Promise((resolve, reject) => {
        updateTimeoutRef.current = setTimeout(async () => {
          try {
            const response = await apiRequest("PUT", "/api/admin/contact-settings", data);
            const result = await response.json();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, 300); // 300ms de debounce
      });
    },
    onSuccess: (updatedData) => {
      // ÚNICA atualização de cache otimizada - SEM invalidation 
      queryClient.setQueryData(["/api/admin/contact-settings"], updatedData);
      queryClient.setQueryData(["/api/contact-settings"], updatedData);
      
      // Evita toasts excessivos com debounce 
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Sucesso",
          description: "Configurações de contato atualizadas!"
        });
      }, 500);
    },
    onError: (error) => {
      console.error("❌ Erro na mutação:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar configurações de contato",
        variant: "destructive"
      });
    }
  });

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "FaWhatsapp",
      gradient: "from-green-400 to-green-500",
      link: "",
      isActive: true,
      order: 0,
    },
  });

  // Função para abrir o diálogo de edição de contato
  const openEditContact = (contact: any) => {
    setEditingContact(contact);
    contactForm.reset({
      title: contact.title,
      description: contact.description,
      icon: contact.icon,
      gradient: contact.gradient || contact.color ? getGradientFromColor(contact.color) : "from-green-400 to-green-500",
      link: contact.link,
      isActive: contact.isActive,
      order: contact.order,
    });
    setIsContactDialogOpen(true);
  };

  // Função auxiliar para converter cor sólida em gradiente (compatibilidade com dados antigos)
  const getGradientFromColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      "#25D366": "from-green-400 to-green-500", // WhatsApp
      "#E4405F": "from-purple-400 to-pink-500", // Instagram
      "#0077B5": "from-blue-500 to-blue-600", // LinkedIn
      "#1877F2": "from-blue-600 to-blue-700", // Facebook
      "#000000": "from-gray-800 to-gray-900", // X/Twitter
      "#0088CC": "from-blue-400 to-blue-500", // Telegram
      "#FF0000": "from-red-500 to-red-600", // YouTube
      "#010101": "from-gray-900 to-black", // TikTok
      "#5865F2": "from-indigo-500 to-purple-600", // Discord
      "#00AFF0": "from-sky-400 to-blue-500", // Skype
    };
    return colorMap[color] || "from-blue-500 to-blue-600";
  };

  // Função para obter gradiente automático baseado no ícone selecionado
  const getGradientForIcon = (iconValue: string) => {
    const gradientMap: { [key: string]: string } = {
      "FaWhatsapp": "from-green-400 to-green-500",
      "FaInstagram": "from-purple-400 to-pink-500",
      "FaLinkedinIn": "from-blue-500 to-blue-600",
      "FaFacebookF": "from-blue-600 to-blue-700",
      "FaXTwitter": "from-gray-800 to-gray-900",
      "FaTelegramPlane": "from-blue-400 to-blue-500",
      "FaYoutube": "from-red-500 to-red-600",
      "FaTiktok": "from-gray-900 to-black",
      "FaThreads": "from-gray-700 to-gray-800",
      "FaDiscord": "from-indigo-500 to-purple-600",
      "FaSkype": "from-sky-400 to-blue-500",
      "FaBluesky": "from-sky-300 to-blue-400",
      "FaPinterest": "from-red-600 to-red-700",
      "Globe": "from-gray-500 to-gray-600",
      "SiOnlyfans": "from-blue-500 to-cyan-400",
      "FaEnvelope": "from-red-500 to-red-600",
    };
    return gradientMap[iconValue] || "from-blue-500 to-blue-600";
  };

  // Função para detectar quando o ícone muda e aplicar gradiente automático
  const handleIconChange = (iconValue: string) => {
    contactForm.setValue("icon", iconValue);
    const autoGradient = getGradientForIcon(iconValue);
    contactForm.setValue("gradient", autoGradient);
  };

  // Função para criar/atualizar contato
  const onSubmitContact = async (data: ContactForm) => {
    try {
      let updatedItems;
      
      if (editingContact) {
        // Atualizar contato existente
        updatedItems = contactItems.map(item => 
          item.id === editingContact.id ? { ...item, ...data } : item
        );
      } else {
        // Criar novo contato
        const newContact = {
          ...data,
          id: Date.now(), // ID temporário
          order: contactItems.length
        };
        updatedItems = [...contactItems, newContact];
      }

      setContactItems(updatedItems);
      updateContactSettings.mutate({
        contact_items: updatedItems
      });

      setIsContactDialogOpen(false);
      setEditingContact(null);
      contactForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar contato",
        variant: "destructive"
      });
    }
  };

  // Função para excluir contato
  const deleteContact = (contactId: number) => {
    const updatedItems = contactItems
      .filter(item => item.id !== contactId)
      .map((item, index) => ({ ...item, order: index }));
    
    setContactItems(updatedItems);
    updateContactSettings.mutate({
      contact_items: updatedItems
    });
  };

  // Função para salvar horários
  const onSubmitSchedule = async (data: ScheduleForm) => {
    updateContactSettings.mutate({
      schedule_info: {
        ...contactSettings?.schedule_info,
        ...data
      }
    });
  };

  // Função para salvar localização
  const onSubmitLocation = async (data: LocationForm) => {
    updateContactSettings.mutate({
      location_info: {
        ...contactSettings?.location_info,
        ...data
      }
    });
  };

  const scheduleForm = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      weekdays: contactSettings?.schedule_info?.weekdays || "Segunda à Sexta: 8h às 18h",
      saturday: contactSettings?.schedule_info?.saturday || "Sábado: 8h às 12h",
      sunday: contactSettings?.schedule_info?.sunday || "Domingo: Fechado",
      additional_info: contactSettings?.schedule_info?.additional_info || "",
    },
  });

  const locationForm = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      city: contactSettings?.location_info?.city || "Campo Mourão, Paraná",
      maps_link: contactSettings?.location_info?.maps_link || "https://maps.google.com/search/Campo+Mourão+Paraná",
    },
  });

  const contactCardForm = useForm<ContactCardForm>({
    resolver: zodResolver(contactCardSchema),
    defaultValues: {
      title: contactSettings?.contact_card?.title || "Entre em contato",
      description: contactSettings?.contact_card?.description || "Escolha a forma mais conveniente para você",
      icon: contactSettings?.contact_card?.icon || "Mail",
      iconColor: contactSettings?.contact_card?.iconColor || "#6366f1",
      backgroundColor: contactSettings?.contact_card?.backgroundColor || "#ffffff",
    },
  });

  const infoCardForm = useForm<InfoCardForm>({
    resolver: zodResolver(infoCardSchema),
    defaultValues: {
      title: contactSettings?.info_card?.title || "Horários & Localização",
      description: contactSettings?.info_card?.description || "Informações práticas para seu atendimento",
      icon: contactSettings?.info_card?.icon || "Clock",
      iconColor: contactSettings?.info_card?.iconColor || "#10b981",
      backgroundColor: contactSettings?.info_card?.backgroundColor || "#ffffff",
    },
  });

  // Ref para controlar inicialização dos formulários
  const formsInitialized = useRef(false);
  const lastFormDataRef = useRef<string>("");

  useEffect(() => {
    if (contactSettings) {
      // Serializa os dados para comparação
      const currentFormData = JSON.stringify({
        schedule: contactSettings.schedule_info,
        location: contactSettings.location_info,
        contactCard: contactSettings.contact_card,
        infoCard: contactSettings.info_card
      });

      // Só atualiza se os dados realmente mudaram
      if (!formsInitialized.current || currentFormData !== lastFormDataRef.current) {
        // Atualizar formulários silenciosamente apenas se necessário
        scheduleForm.reset({
          weekdays: contactSettings.schedule_info?.weekdays || "Segunda à Sexta: 8h às 18h",
          saturday: contactSettings.schedule_info?.saturday || "Sábado: 8h às 12h",
          sunday: contactSettings.schedule_info?.sunday || "Domingo: Fechado",
          additional_info: contactSettings.schedule_info?.additional_info || "",
        });
        
        locationForm.reset({
          city: contactSettings.location_info?.city || "Campo Mourão, Paraná",
          maps_link: contactSettings.location_info?.maps_link || "https://maps.google.com/search/Campo+Mourão+Paraná",
        });
        
        // Atualizar cards com fallback se necessário
        const contactCardData = contactSettings.contact_card || {
          title: "Entre em contato",
          description: "Escolha a forma mais conveniente para você",
          icon: "Mail",
          iconColor: "#6366f1",
          backgroundColor: "#ffffff"
        };
        
        const infoCardData = contactSettings.info_card || {
          title: "Horários & Localização",
          description: "Informações práticas para seu atendimento",
          icon: "Clock",
          iconColor: "#10b981",
          backgroundColor: "#ffffff"
        };
        
        contactCardForm.reset(contactCardData);
        infoCardForm.reset(infoCardData);
        
        // Marca como inicializado e salva os dados atuais
        formsInitialized.current = true;
        lastFormDataRef.current = currentFormData;
      }
    }
  }, [contactSettings]);

  // Cleanup na desmontagem do componente
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Funções para cards de informação
  const onSubmitContactCard = (data: ContactCardForm) => {
    updateContactSettings.mutate({ contact_card: data });
  };

  const onSubmitInfoCard = (data: InfoCardForm) => {
    updateContactSettings.mutate({ info_card: data });
  };

  const iconOptions = [
    { value: "FaWhatsapp", label: "WhatsApp", icon: "💬" },
    { value: "FaInstagram", label: "Instagram", icon: "📷" },
    { value: "Mail", label: "Email", icon: "📧" },
    { value: "FaLinkedinIn", label: "LinkedIn", icon: "💼" },
    { value: "FaFacebookF", label: "Facebook", icon: "👥" },
    { value: "FaXTwitter", label: "X (Twitter)", icon: "✖️" },
    { value: "FaTelegramPlane", label: "Telegram", icon: "✈️" },
    { value: "FaYoutube", label: "YouTube", icon: "📺" },
    { value: "FaTiktok", label: "TikTok", icon: "🎵" },
    { value: "FaThreads", label: "Threads", icon: "🧵" },
    { value: "FaDiscord", label: "Discord", icon: "🎮" },
    { value: "FaSkype", label: "Skype", icon: "📞" },
    { value: "Phone", label: "Telefone", icon: "📞" },
    { value: "MapPin", label: "Localização", icon: "📍" },
    { value: "Globe", label: "Website", icon: "🌐" }
  ];

  return (
    <div className="space-y-6">
      {/* Configurações dos Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuração do Card de Contato */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-lg">📞</span>
              Card de Contato
            </CardTitle>
            <CardDescription className="text-sm">
              Configure aparência e textos do card principal de contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...contactCardForm}>
              <form onSubmit={contactCardForm.handleSubmit(onSubmitContactCard)} className="space-y-4">
                <FormField
                  control={contactCardForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Entre em contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactCardForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Escolha a forma mais conveniente para você" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={contactCardForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone</FormLabel>
                        <ModernIconSelector
                          options={[
                            { value: "Mail", label: "Email", component: Mail, category: "Comunicação" },
                            { value: "FaWhatsapp", label: "WhatsApp", component: FaWhatsapp, category: "Comunicação" },
                            { value: "MessageCircle", label: "Mensagem", component: MessageCircle, category: "Comunicação" }
                          ]}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um ícone"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactCardForm.control}
                    name="iconColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Ícone</FormLabel>
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
                </div>
                <FormField
                  control={contactCardForm.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de Fundo</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input type="color" className="w-12 h-10" {...field} />
                        </FormControl>
                        <FormControl>
                          <Input placeholder="#ffffff" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="btn-admin w-full">
                  Salvar Card de Contato
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Configuração do Card de Informações */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-lg">ℹ️</span>
              Card de Informações
            </CardTitle>
            <CardDescription className="text-sm">
              Configure aparência e textos do card de horários e localização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...infoCardForm}>
              <form onSubmit={infoCardForm.handleSubmit(onSubmitInfoCard)} className="space-y-4">
                <FormField
                  control={infoCardForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Horários & Localização" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={infoCardForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Informações práticas para seu atendimento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={infoCardForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Clock">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Relógio
                                </div>
                              </SelectItem>
                              <SelectItem value="MapPin">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Localização
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={infoCardForm.control}
                    name="iconColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Ícone</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input type="color" className="w-12 h-10" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input placeholder="#10b981" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={infoCardForm.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de Fundo</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input type="color" className="w-12 h-10" {...field} />
                        </FormControl>
                        <FormControl>
                          <Input placeholder="#ffffff" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="btn-admin w-full">
                  Salvar Card de Informações
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <div className="space-y-4 w-full">
              <div className="w-full">
                <CardTitle className="text-lg sm:text-xl mb-2">Botões de Contato</CardTitle>
                <CardDescription className="text-sm">
                  Configure os botões de contato exibidos na seção de agendamento
                </CardDescription>
              </div>
              <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="btn-admin w-full sm:w-auto sm:self-start"
                    onClick={() => {
                      setEditingContact(null);
                      contactForm.reset();
                      setIsContactDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contato
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="contact-form-description">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? "Editar Contato" : "Novo Contato"}
                    </DialogTitle>
                    <p id="contact-form-description" className="text-sm text-muted-foreground">
                      Configure as informações do botão de contato
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ícone</FormLabel>
                              <FormControl>
                                <Select onValueChange={handleIconChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>

                              <SelectItem value="FaWhatsapp">
                                <div className="flex items-center gap-2">
                                  <FaWhatsapp className="text-green-500" />
                                  WhatsApp
                                </div>
                              </SelectItem>
                              <SelectItem value="FaInstagram">
                                <div className="flex items-center gap-2">
                                  <FaInstagram className="text-pink-500" />
                                  Instagram
                                </div>
                              </SelectItem>
                              <SelectItem value="FaLinkedinIn">
                                <div className="flex items-center gap-2">
                                  <FaLinkedinIn className="text-blue-500" />
                                  LinkedIn
                                </div>
                              </SelectItem>
                              <SelectItem value="FaXTwitter">
                                <div className="flex items-center gap-2">
                                  <FaXTwitter className="text-gray-900" />
                                  X (Twitter)
                                </div>
                              </SelectItem>
                              <SelectItem value="FaFacebookF">
                                <div className="flex items-center gap-2">
                                  <FaFacebookF className="text-blue-600" />
                                  Facebook
                                </div>
                              </SelectItem>
                              <SelectItem value="FaTelegramPlane">
                                <div className="flex items-center gap-2">
                                  <FaTelegramPlane className="text-blue-500" />
                                  Telegram
                                </div>
                              </SelectItem>
                              <SelectItem value="FaDiscord">
                                <div className="flex items-center gap-2">
                                  <FaDiscord className="text-indigo-500" />
                                  Discord
                                </div>
                              </SelectItem>
                              <SelectItem value="FaSkype">
                                <div className="flex items-center gap-2">
                                  <FaSkype className="text-blue-500" />
                                  Skype
                                </div>
                              </SelectItem>
                              <SelectItem value="FaYoutube">
                                <div className="flex items-center gap-2">
                                  <FaYoutube className="text-red-500" />
                                  YouTube
                                </div>
                              </SelectItem>
                              <SelectItem value="FaTiktok">
                                <div className="flex items-center gap-2">
                                  <FaTiktok className="text-gray-900" />
                                  TikTok
                                </div>
                              </SelectItem>
                              <SelectItem value="FaThreads">
                                <div className="flex items-center gap-2">
                                  <FaThreads className="text-gray-900" />
                                  Threads
                                </div>
                              </SelectItem>
                              <SelectItem value="SiOnlyfans">
                                <div className="flex items-center gap-2">
                                  <SiOnlyfans className="text-blue-500" />
                                  OnlyFans
                                </div>
                              </SelectItem>
                              <SelectItem value="FaPinterest">
                                <div className="flex items-center gap-2">
                                  <FaPinterest className="text-red-600" />
                                  Pinterest
                                </div>
                              </SelectItem>
                              <SelectItem value="FaEnvelope">
                                <div className="flex items-center gap-2">
                                  <FaEnvelope className="text-red-500" />
                                  Email
                                </div>
                              </SelectItem>
                              <SelectItem value="FaBluesky">
                                <div className="flex items-center gap-2">
                                  <FaBluesky className="text-sky-500" />
                                  Bluesky
                                </div>
                              </SelectItem>

                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um gradiente" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {gradientOptions.map((option) => (
                                      <SelectItem key={option.id} value={option.value}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className={`w-4 h-4 rounded bg-gradient-to-r ${option.value}`}
                                          />
                                          {option.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-500">
                                💡 Gradiente será aplicado automaticamente quando você selecionar um ícone
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={contactForm.control}
                        name="link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://wa.me/5544998362704" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ordem</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Ativo</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsContactDialogOpen(false)} className="w-full sm:w-auto">
                          Cancelar
                        </Button>
                        <Button type="submit" className="btn-admin w-full sm:w-auto">
                          {editingContact ? "Atualizar" : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Dica:</strong> Use as setas para reordenar os botões por importância.
              </p>
            </div>

            <DragAndDropContainer
              items={contactItems}
              onReorder={handleDragEnd}
            >
              {contactItems
                .sort((a, b) => a.order - b.order)
                .map((contact, index) => (
                  <DragAndDropItem
                    key={contact.id}
                    id={contact.id}
                    isActive={contact.isActive}
                    isFirst={index === 0}
                    isLast={index === contactItems.length - 1}
                    onToggleActive={() => {
                      const updatedItems = contactItems.map(item => 
                        item.id === contact.id ? { ...item, isActive: !item.isActive } : item
                      );
                      setContactItems(updatedItems);
                      updateContactSettings.mutate({ contact_items: updatedItems });
                    }}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onEdit={() => openEditContact(contact)}
                    onDelete={() => deleteContact(contact.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${contact.gradient || getGradientFromColor(contact.color)}`}>
                        {iconMap[contact.icon] ? (
                          React.createElement(iconMap[contact.icon], { 
                            className: "w-5 h-5 text-white" 
                          })
                        ) : (
                          <span className="text-white text-xs">📧</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{contact.title}</div>
                        <div className="text-sm text-gray-500">{contact.description}</div>
                        <div className="text-xs text-gray-400">{contact.link}</div>
                      </div>
                    </div>
                  </DragAndDropItem>
                ))}
            </DragAndDropContainer>

            {contactItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum botão de contato cadastrado ainda.</p>
                <p className="text-sm">Clique em "Novo botão" para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <span className="text-lg">🕒</span>
                    Card de Horários
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configure os horários de atendimento e controle a visibilidade do card
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={contactSettings?.schedule_info?.isActive !== false}
                    onCheckedChange={(checked) => {
                      const newScheduleInfo = { 
                        ...contactSettings?.schedule_info, 
                        isActive: checked 
                      };
                      updateContactSettings.mutate({
                        schedule_info: newScheduleInfo
                      });
                    }}
                  />
                  <Badge variant={contactSettings?.schedule_info?.isActive !== false ? "default" : "secondary"}>
                    {contactSettings?.schedule_info?.isActive !== false ? "Visível" : "Oculto"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...scheduleForm}>
                <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-4">
                  <FormField
                    control={scheduleForm.control}
                    name="weekdays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segunda à Sexta</FormLabel>
                        <FormControl>
                          <Input placeholder="8h às 18h" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={scheduleForm.control}
                    name="saturday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sábado</FormLabel>
                        <FormControl>
                          <Input placeholder="8h às 12h" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={scheduleForm.control}
                    name="sunday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domingo</FormLabel>
                        <FormControl>
                          <Input placeholder="Fechado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={scheduleForm.control}
                    name="additional_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informações Adicionais</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Horários flexíveis disponíveis" rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="btn-admin w-full">
                    Salvar Horários
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <span className="text-lg">📍</span>
                    Card de Localização
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configure cidade e link do Google Maps, ideal para atendimentos presenciais
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={contactSettings?.location_info?.isActive !== false}
                    onCheckedChange={(checked) => {
                      const newLocationInfo = { 
                        ...contactSettings?.location_info, 
                        isActive: checked 
                      };
                      updateContactSettings.mutate({
                        location_info: newLocationInfo
                      });
                    }}
                  />
                  <Badge variant={contactSettings?.location_info?.isActive !== false ? "default" : "secondary"}>
                    {contactSettings?.location_info?.isActive !== false ? "Visível" : "Oculto"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...locationForm}>
                <form onSubmit={locationForm.handleSubmit(onSubmitLocation)} className="space-y-4">
                  <FormField
                    control={locationForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Campo Mourão, Paraná" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={locationForm.control}
                    name="maps_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do Google Maps</FormLabel>
                        <FormControl>
                          <Input placeholder="https://maps.google.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="btn-admin w-full">
                    Salvar Localização
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

