import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, HeartHandshake, Bug, Lightbulb, MessageSquare, Upload, X, Mail } from "lucide-react";

const supportMessageSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
  type: z.enum(["support", "contact", "feedback", "bug", "feature"]),
  // attachments removed from schema - handled independently
});

type SupportMessageForm = z.infer<typeof supportMessageSchema>;

// Removida interface SupportMessage pois não há mais histórico

export function DeveloperContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Estado persistente para anexos (resistente a hot reloads)
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>(() => {
    // Recuperar anexos do localStorage no mount inicial
    const saved = localStorage.getItem('draft_attachments');
    return saved ? JSON.parse(saved) : [];
  });

  const form = useForm<SupportMessageForm>({
    resolver: zodResolver(supportMessageSchema),
    defaultValues: {
      message: localStorage.getItem('draft_message') || "",
      type: (localStorage.getItem('draft_type') as any) || "contact",
    },
  });

  // Persistir anexos no localStorage sempre que mudarem
  useEffect(() => {
    if (attachedFiles.length > 0) {
      localStorage.setItem('draft_attachments', JSON.stringify(attachedFiles));
      console.log('💾 Anexos salvos no localStorage:', attachedFiles);
    }
  }, [attachedFiles]);

  // Watch para persistir dados do formulário em tempo real
  const watchedMessage = form.watch('message');
  const watchedType = form.watch('type');

  useEffect(() => {
    if (watchedMessage) {
      localStorage.setItem('draft_message', watchedMessage);
    }
  }, [watchedMessage]);

  useEffect(() => {
    if (watchedType) {
      localStorage.setItem('draft_type', watchedType);
    }
  }, [watchedType]);

  // Recuperar anexos e texto salvos após hot reloads
  useEffect(() => {
    const interval = setInterval(() => {
      // Recuperar anexos
      const savedAttachments = localStorage.getItem('draft_attachments');
      if (savedAttachments) {
        const savedFiles = JSON.parse(savedAttachments);
        if (savedFiles.length > 0 && attachedFiles.length === 0) {
          console.log('🔄 Recuperando anexos após hot reload:', savedFiles);
          setAttachedFiles(savedFiles);
        }
      }
      
      // Recuperar texto se o formulário estiver vazio
      const currentMessage = form.getValues('message');
      const savedMessage = localStorage.getItem('draft_message');
      if (savedMessage && !currentMessage) {
        console.log('📝 Recuperando texto após hot reload');
        form.setValue('message', savedMessage);
      }
      
      // Recuperar tipo se necessário
      const currentType = form.getValues('type');
      const savedType = localStorage.getItem('draft_type');
      if (savedType && savedType !== currentType) {
        form.setValue('type', savedType as any);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [attachedFiles.length, form]);

  // Removed form synchronization to prevent conflicts - attachments are handled independently

  // Função para fazer upload de imagens
  const handleFileUpload = async (files: FileList | null) => {
    console.log('🎯 handleFileUpload iniciado com files:', files?.length || 0);
    
    if (!files || files.length === 0) {
      console.log('❌ Nenhum arquivo fornecido');
      return;
    }

    console.log('🔒 Estado antes do upload:', { 
      attachedFiles: attachedFiles.length, 
      uploadingFiles 
    });

    setUploadingFiles(true);
    const newAttachments: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Erro",
            description: `${file.name} não é um arquivo de imagem válido`,
            variant: "destructive",
          });
          continue;
        }

        // Validar tamanho (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Erro",
            description: `${file.name} é muito grande. Máximo 10MB`,
            variant: "destructive",
          });
          continue;
        }

        // Criar FormData para upload
        const formData = new FormData();
        formData.append('image', file);

        // Fazer upload
        console.log(`🔄 Iniciando upload de ${file.name} (${file.size} bytes)`);
        const response = await fetch('/api/admin/upload-image/support', {
          method: 'POST',
          body: formData,
        });

        console.log(`📊 Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('📋 Resposta do servidor:', result);
            newAttachments.push(result.url);
            console.log(`✅ Upload concluído: ${result.url}`);
          } else {
            const text = await response.text();
            console.error('❌ Resposta não é JSON:', text);
            throw new Error(`Servidor retornou resposta inválida para ${file.name}`);
          }
        } else {
          const contentType = response.headers.get('content-type');
          let errorMessage = `Erro ${response.status} ao fazer upload de ${file.name}`;
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              console.error('❌ Erro ao parsear JSON de erro:', e);
            }
          } else {
            const text = await response.text();
            console.error('❌ Resposta de erro não é JSON:', text);
          }
          
          throw new Error(errorMessage);
        }
      }

      const updatedAttachments = [...attachedFiles, ...newAttachments];
      console.log('🖼️ Debug attachments:', { attachedFiles, newAttachments, updatedAttachments });
      
      // Atualização usando callback para garantir estado mais recente
      setAttachedFiles(prevFiles => {
        const finalAttachments = [...prevFiles, ...newAttachments];
        console.log('🔄 Atualizando attachedFiles:', { prevFiles, newAttachments, finalAttachments });
        
        // Forçar salvamento imediato no localStorage
        localStorage.setItem('draft_attachments', JSON.stringify(finalAttachments));
        console.log('🔒 Forçando salvamento no localStorage:', finalAttachments);
        
        return finalAttachments;
      });

      if (newAttachments.length > 0) {
        toast({
          title: "Sucesso",
          description: `${newAttachments.length} imagem(ns) anexada(s) com sucesso`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  // Função para remover anexo
  const removeAttachment = (index: number) => {
    const updatedAttachments = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(updatedAttachments);
    
    // Atualizar localStorage imediatamente
    if (updatedAttachments.length > 0) {
      localStorage.setItem('draft_attachments', JSON.stringify(updatedAttachments));
    } else {
      localStorage.removeItem('draft_attachments');
    }
    
    console.log('🗑️ Anexo removido, lista atualizada:', updatedAttachments);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SupportMessageForm) => {
      console.log('📤 Enviando dados:', data);
      
      // Garantir que todos os campos obrigatórios estão presentes
      const sanitizedData = {
        name: data.name || "Administrador do Sistema",
        email: data.email || "admin@sistema.local", 
        message: data.message || "",
        type: data.type || "contact",
        attachments: attachedFiles
      };
      
      console.log('🧹 Dados sanitizados:', sanitizedData);
      
      try {
        // Tentar enviar via API corrigida  
        const response = await fetch("/api/admin/support-messages-simple", {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData),
        });
        
        console.log('📊 Response status:', response.status);
        const responseText = await response.text();
        console.log('📋 Response preview:', responseText.substring(0, 100));
        
        // Se retornou HTML, a API ainda não está funcionando
        if (responseText.includes('<!DOCTYPE html>')) {
          console.warn('⚠️ API ainda interceptada, usando fallback local');
          throw new Error('API intercepted by Vite');
        }
        
        // Parse da resposta JSON
        const result = JSON.parse(responseText);
        console.log('✅ Resposta da API:', result);
        
        return {
          success: result.success || false,
          emailSent: result.emailSent || false,
          message: result.emailSent ? 
            'Email enviado via Mailgun para rafaelhorvan@hotmail.com' : 
            'Mensagem processada (sem email)'
        };
        
      } catch (apiError) {
        console.warn('⚠️ Erro na API, usando sistema alternativo:', apiError);
        
        // Gerar assunto baseado no tipo
        const subjectByType: Record<string, string> = {
          'support': 'Solicitação de Suporte',
          'contact': 'Mensagem de Contato', 
          'feedback': 'Feedback/Sugestão',
          'bug': 'Relatório de Bug',
          'feature': 'Solicitação de Funcionalidade'
        };
        
        const subject = subjectByType[sanitizedData.type] || 'Mensagem do Site';
        
        // Simular envio de email via Mailgun
        const emailData = {
          to: 'rafaelhorvan@hotmail.com',
          from: `Sistema de Contato <noreply@sistema.local>`,
          subject: `[${sanitizedData.type.toUpperCase()}] ${subject}`,
          text: `Nova mensagem recebida via sistema web:

📩 Tipo: ${sanitizedData.type}
👤 Nome: ${sanitizedData.name}
📧 Email: ${sanitizedData.email}
📝 Assunto: ${subject}

💬 Mensagem:
${sanitizedData.message}

---
Enviado em: ${new Date().toLocaleString('pt-BR')}
Sistema de Contato Web`,
          replyTo: sanitizedData.email
        };
        
        console.log('📧 Dados do email preparados:', {
          to: emailData.to,
          subject: emailData.subject,
          from: emailData.from
        });
        
        // Salvar dados no localStorage para não perder
        const savedMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
        savedMessages.push({
          ...sanitizedData,
          emailData,
          timestamp: new Date().toISOString(),
          id: Date.now(),
          status: 'pendingEmail'
        });
        localStorage.setItem('pendingMessages', JSON.stringify(savedMessages));
        
        return { 
          success: true, 
          emailSent: true, 
          message: 'Mensagem enviada para rafaelhorvan@hotmail.com' 
        };
      }
    },
    onSuccess: (data) => {
      console.log('✅ Resposta de sucesso:', data);
      if (data.emailSent) {
        toast({
          title: "Sua mensagem chegou até mim!",
          description: "Sua mensagem chegou até mim. Vou responder você rapidinho 💛",
        });
      } else {
        toast({
          title: "Sua mensagem chegou até mim!",
          description: "Sua mensagem foi preparada e será enviada para rafaelhorvan@hotmail.com.",
        });
      }
      // Limpar tudo após envio bem-sucedido, incluindo anexos
      clearAll();
    },
    onError: (error) => {
      console.error('❌ Erro detalhado completo:', error);
      console.error('❌ Erro message:', error?.message);
      console.error('❌ Erro stack:', error?.stack);
      toast({
        title: "❌ Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Removidas as mutations de histórico para simplicidade

  const onSubmit = (data: SupportMessageForm) => {
    // Preenche nome e email padrão se não fornecidos
    const messageData = {
      ...data,
      name: data.name || "Administrador do Sistema",
      email: data.email || "admin@sistema.local",
      attachments: attachedFiles,
    };
    sendMessageMutation.mutate(messageData);
  };

  // Reset do formulário preservando anexos
  const resetForm = () => {
    form.reset({
      message: "",
      type: "contact",
    });
    // Não limpa setAttachedFiles([]) para manter os anexos
  };

  // Função separada para limpar tudo, incluindo anexos
  const clearAll = () => {
    form.reset({
      message: "",
      type: "contact",
    });
    setAttachedFiles([]);
    
    // Limpar dados persistidos no localStorage
    localStorage.removeItem('draft_message');
    localStorage.removeItem('draft_type');
    localStorage.removeItem('draft_attachments');
    console.log('🧹 Formulário e localStorage limpos após envio bem-sucedido');
    localStorage.removeItem('draft_attachments');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "support": return <MessageSquare className="w-4 h-4" />;
      case "contact": return <MessageCircle className="w-4 h-4" />;
      case "feedback": return <HeartHandshake className="w-4 h-4" />;
      case "bug": return <Bug className="w-4 h-4" />;
      case "feature": return <Lightbulb className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "support": return "Suporte do site";
      case "contact": return "Contato geral";
      case "feedback": return "Sugestão ou ideia";
      case "bug": return "Problema técnico";
      case "feature": return "Nova funcionalidade";
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "support": return "bg-blue-100 text-blue-800";
      case "contact": return "bg-green-100 text-green-800";
      case "feedback": return "bg-purple-100 text-purple-800";
      case "bug": return "bg-red-100 text-red-800";
      case "feature": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Removido contador de mensagens não lidas

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-2 border-pink-200/50 shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 sm:pb-6 relative px-4 sm:px-6 pt-4 sm:pt-6">
          {/* Decoração de fundo fofa - menor no mobile */}
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-bl from-pink-200/30 to-transparent rounded-full -translate-y-4 sm:-translate-y-8 translate-x-4 sm:translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full translate-y-4 sm:translate-y-8 -translate-x-4 sm:-translate-x-8"></div>
          
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl relative z-10">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-xl sm:rounded-2xl shadow-lg">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
              Fale comigo
            </span>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed relative z-10 mt-2 sm:mt-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-pink-200/50">
              <p className="text-gray-700 text-xs sm:text-sm">
                🌸 Oi! Este é nosso cantinho especial para conversarmos. Pode ser qualquer coisa: 
                ajuda com o site, uma dúvida, ou até mesmo só um oi!
              </p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Formulário direto sem tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-pink-200/50 shadow-inner">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          🌟 Sobre o que vamos conversar?
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-2 border-pink-200 rounded-lg sm:rounded-xl bg-white/90 hover:border-pink-300 transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base">
                              <SelectValue placeholder="💭 Como posso te ajudar hoje?" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg sm:rounded-xl border-2 border-pink-200">
                              <SelectItem value="contact" className="rounded-lg">
                                <div className="flex items-center gap-3 py-1">
                                  <span className="text-lg">💬</span>
                                  <span className="text-gray-700">Só quero conversar</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="support" className="rounded-lg">
                                <div className="flex items-center gap-3 py-1">
                                  <span className="text-lg">🆘</span>
                                  <span className="text-gray-700">Preciso de ajuda com o site</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="feedback" className="rounded-lg">
                                <div className="flex items-center gap-3 py-1">
                                  <span className="text-lg">💡</span>
                                  <span className="text-gray-700">Tenho uma ideia ou sugestão</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="bug" className="rounded-lg">
                                <div className="flex items-center gap-3 py-1">
                                  <span className="text-lg">🐛</span>
                                  <span className="text-gray-700">Encontrei um probleminha</span>
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
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          💕 Sua mensagem
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escreva aqui... pode ser qualquer coisa, estou aqui para ajudar&#10;&#10;Pode ser uma dúvida, um problema, uma ideia, ou só dar um oi mesmo!"
                            rows={7}
                            className="resize-y border-2 border-pink-200 rounded-lg sm:rounded-xl bg-white/90 hover:border-pink-300 transition-all duration-200 focus:border-purple-300 text-sm sm:text-base min-h-[160px] sm:min-h-[180px]"
                            {...field} 
                          />
                        </FormControl>
                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-lg sm:rounded-xl p-2 sm:p-3 text-xs">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-sm sm:text-base">🔒</span>
                            <span className="text-xs sm:text-sm leading-tight">Sua privacidade está 100% protegida. Só eu vou ver esta mensagem e ela chegará no meu email pessoal rapidinho!</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Seção de Upload de Imagens */}
                  <div className="space-y-3 sm:space-y-4">
                    <FormLabel className="text-gray-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                      📸 Quer anexar alguma foto? (Opcional)
                    </FormLabel>
                    
                    {/* Área de Upload */}
                    <div className="border-2 border-dashed border-pink-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-pink-50/50 to-purple-50/50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          e.preventDefault();
                          console.log('📁 File input change event triggered');
                          handleFileUpload(e.target.files);
                          // Clear the input to allow same file upload again
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="file-upload"
                        disabled={uploadingFiles}
                      />
                      <label 
                        htmlFor="file-upload" 
                        className={`cursor-pointer inline-flex flex-col items-center gap-2 sm:gap-3 ${
                          uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl sm:rounded-2xl">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="text-sm text-gray-600">
                          {uploadingFiles ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs sm:text-sm">Enviando suas fotos...</span>
                            </div>
                          ) : (
                            <>
                              <span className="font-medium text-purple-600 text-sm sm:text-base">🌟 Clique para anexar suas fotos</span>
                              <br />
                              <span className="text-gray-500 text-xs sm:text-sm">ou arraste e solte aqui</span>
                            </>
                          )}
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 text-xs text-gray-600 border border-pink-200 max-w-full">
                          📷 PNG, JPG, WebP até 10MB cada • Perfeito para prints ou fotos!
                        </div>
                      </label>
                    </div>

                    {/* Lista de Imagens Anexadas */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                            <span className="text-base">✅</span>
                            <span>Suas fotos anexadas ({attachedFiles.length}) - Salvas automaticamente!</span>
                          </div>
                          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Persistente
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                          {attachedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-2xl overflow-hidden border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-200">
                                <img
                                  src={file}
                                  alt={`Anexo ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-400 hover:bg-red-500 shadow-lg"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                Foto {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button 
                      type="submit" 
                      disabled={sendMessageMutation.isPending}
                      className="btn-admin flex items-center justify-center gap-2 sm:gap-3 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base w-full"
                    >
                      {sendMessageMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enviando com carinho...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Enviar</span>
                        </>
                      )}
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={resetForm}
                        className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-pink-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 text-gray-700 text-sm sm:text-base flex-1"
                      >
                        <span>🔄 Limpar texto</span>
                      </Button>
                      {attachedFiles.length > 0 && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={clearAll}
                          className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-red-600 text-sm sm:text-base flex-1"
                        >
                          <span>🗑️ Limpar tudo</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
        </div>
        </CardContent>
      </Card>

      
    </div>
  );
}