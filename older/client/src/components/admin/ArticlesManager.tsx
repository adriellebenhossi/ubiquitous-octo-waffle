/**
 * ArticlesManager.tsx
 * 
 * Painel administrativo para gerenciar artigos científicos
 * Funcionalidades: criar, editar, publicar, deletar, reordenar
 * Interface moderna com drag-and-drop e preview
 * Upload de imagens e editor de conteúdo rich text
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Image, 
  Calendar,
  User,
  ExternalLink,
  Settings,
  GripVertical,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  ImagePlus,
  Move
} from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useManagerMutations } from "@/hooks/useManagerMutations";
import { DragAndDropContainer } from "@/components/admin/base/DragAndDropContainer";
import { DragAndDropItem } from "@/components/admin/base/DragAndDropItem";
import { ResponsiveAdminContainer } from "./base/ResponsiveAdminContainer";
import { ResponsiveGrid, ResponsiveButtonGroup } from "./base/ResponsiveFormFields";
import { RichTextEditor } from "./RichTextEditor";
import { AIInstructions } from "./base/AIInstructions";
import type { Article, InsertArticle } from "@shared/schema";

// Schema de validação para artigos (removido subtitle)
const articleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  badge: z.string().optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  author: z.string().min(1, "Autor é obrigatório"),
  coAuthors: z.string().optional(),
  institution: z.string().optional(),
  articleReferences: z.string().optional(),
  doi: z.string().optional(),
  keywords: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  readingTime: z.number().optional(),
  showContactButton: z.boolean().default(false),
  contactButtonText: z.string().optional(),
  contactButtonUrl: z.string().optional(),
  showBackToSiteButton: z.boolean().default(true),
  backToSiteButtonText: z.string().optional(),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0)
});

type ArticleFormData = z.infer<typeof articleSchema>;

export function ArticlesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [articleImages, setArticleImages] = useState<string[]>([]);

  // Usar o hook de mutações padronizado
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
  } = useManagerMutations({
    adminQueryKey: "/api/admin/articles",
    publicQueryKey: "/api/articles/featured",
    entityName: "Artigo",
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      badge: "",
      description: "",
      content: "",
      author: "",
      coAuthors: "",
      institution: "",
      articleReferences: "",
      doi: "",
      keywords: "",
      category: "Psicologia",
      readingTime: undefined,
      showContactButton: false,
      contactButtonText: "Entrar em Contato",
      contactButtonUrl: "",
      showBackToSiteButton: true,
      backToSiteButtonText: "Voltar ao Site",
      isFeatured: false,
      order: 0
    }
  });

  // Query para buscar artigos
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/admin/articles"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/articles");
      return response.json() as Promise<Article[]>;
    }
  });

  // Mutation para publicar/despublicar artigo com atualização otimista
  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: number; publish: boolean }) => {
      const endpoint = publish ? `/api/admin/articles/${id}/publish` : `/api/admin/articles/${id}/unpublish`;
      const response = await apiRequest("POST", endpoint);
      if (!response.ok) throw new Error(`Erro ao ${publish ? 'publicar' : 'despublicar'} artigo`);
      return response.json();
    },
    onMutate: async ({ id, publish }) => {
      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: ["/api/admin/articles"] });
      
      // Snapshot do estado anterior
      const previousArticles = queryClient.getQueryData(["/api/admin/articles"]);
      
      // Atualização otimista - mudar o estado imediatamente
      queryClient.setQueryData(["/api/admin/articles"], (old: Article[] = []) => {
        return old.map(article => 
          article.id === id 
            ? { ...article, isPublished: publish }
            : article
        );
      });
      
      console.log(`🔄 OPTIMISTIC: Artigo ${id} ${publish ? 'publicado' : 'despublicado'} visualmente`);
      
      // Retornar contexto para rollback se necessário
      return { previousArticles };
    },
    onSuccess: (_, { publish }) => {
      toast({
        title: "Sucesso",
        description: `Artigo ${publish ? 'publicado' : 'despublicado'} com sucesso!`,
      });
    },
    onError: (err, { publish }, context) => {
      // Reverter a atualização otimista em caso de erro
      if (context?.previousArticles) {
        queryClient.setQueryData(["/api/admin/articles"], context.previousArticles);
      }
      
      toast({
        title: "Erro",
        description: `Erro ao ${publish ? 'publicar' : 'despublicar'} artigo. Tente novamente.`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // NÃO invalidar queries para evitar reversão da atualização otimista
      // A atualização otimista já reflete o estado correto
      console.log("🎯 Switch do artigo concluído - mantendo estado otimista");
    }
  });

  // Upload de imagem
  const uploadImage = async (file: File, articleId: number) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/admin/articles/${articleId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (data: ArticleFormData) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingArticle(null);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      badge: article.badge || "",
      description: article.description,
      content: article.content,
      author: article.author,
      coAuthors: article.coAuthors || "",
      institution: article.institution || "",
      articleReferences: article.articleReferences || "",
      doi: article.doi || "",
      keywords: article.keywords || "",
      category: article.category,
      readingTime: article.readingTime || undefined,
      showContactButton: article.showContactButton,
      contactButtonText: article.contactButtonText || "Entrar em Contato",
      contactButtonUrl: article.contactButtonUrl || "",
      isFeatured: article.isFeatured,
      order: article.order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este artigo? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate(id);
    }
  };

  // Funções para reordenação com setas
  const handleMoveUp = (article: Article) => {
    const currentIndex = articles.findIndex(a => a.id === article.id);
    if (currentIndex <= 0) return;

    const newArticles = [...articles];
    const temp = newArticles[currentIndex];
    newArticles[currentIndex] = newArticles[currentIndex - 1];
    newArticles[currentIndex - 1] = temp;

    // Atualizar as ordens
    const updatedItems = newArticles.map((article, index) => ({
      id: article.id,
      order: index
    }));

    reorderMutation.mutate(updatedItems);
  };

  const handleMoveDown = (article: Article) => {
    const currentIndex = articles.findIndex(a => a.id === article.id);
    if (currentIndex >= articles.length - 1) return;

    const newArticles = [...articles];
    const temp = newArticles[currentIndex];
    newArticles[currentIndex] = newArticles[currentIndex + 1];
    newArticles[currentIndex + 1] = temp;

    // Atualizar as ordens
    const updatedItems = newArticles.map((article, index) => ({
      id: article.id,
      order: index
    }));

    reorderMutation.mutate(updatedItems);
  };

  // Função para drag-and-drop
  const handleReorder = (reorderedItems: Array<{ id: number | string; order: number }>) => {
    const updatedItems = reorderedItems.map(item => ({
      id: Number(item.id),
      order: item.order
    }));
    reorderMutation.mutate(updatedItems);
  };

  // Funções para imagens no conteúdo
  const insertImageIntoContent = (imageUrl: string) => {
    const currentContent = form.getValues("content");
    const imageHtml = `<img src="${imageUrl}" alt="Imagem do artigo" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
    form.setValue("content", currentContent + "\n\n" + imageHtml + "\n\n");
    toast({
      title: "✅ Imagem inserida com sucesso!",
      description: "Imagem convertida para WebP e inserida no artigo. Você pode mover o código para qualquer posição.",
    });
  };

  const uploadImageForContent = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const result = await response.json();
      insertImageIntoContent(result.imageUrl);
      setArticleImages(prev => [...prev, result.imageUrl]);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const resetForm = () => {
    form.reset();
    setEditingArticle(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Gerenciar artigos
          </h3>
          <p className="text-gray-600 mt-1">
            Crie e gerencie artigos científicos para o site
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-admin w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Artigo
            </Button>
          </DialogTrigger>
          
          <DialogContent className="
            w-[95vw] max-w-[95vw] 
            sm:max-w-2xl md:max-w-4xl lg:max-w-6xl 
            h-[90vh] max-h-[90vh] 
            p-0 overflow-hidden
            flex flex-col
          ">
            <div className="h-full flex flex-col">
              <DialogHeader className="px-3 py-2 sm:px-6 sm:py-4 border-b shrink-0 z-10 bg-white">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingArticle ? "Editar Artigo" : "Novo Artigo"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {editingArticle ? 
                    "Edite as informações do artigo científico" :
                    "Crie um novo artigo científico para o site"
                  }
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col min-h-0">
                  <div className="flex-1 modal-scroll-area px-3 py-3 sm:px-6 sm:py-4">
                    <div className="space-y-6 pb-4">
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input placeholder="Título do artigo..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="badge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Badge/Categoria</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Pesquisa, Estudo de Caso..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria Principal *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px] overflow-y-auto">
                                {/* Psicologia clínica */}
                                <SelectItem value="Psicologia">Psicologia</SelectItem>
                                <SelectItem value="Psicologia clínica">Psicologia clínica</SelectItem>
                                <SelectItem value="Psicologia comportamental">Psicologia comportamental</SelectItem>
                                <SelectItem value="Neuropsicologia">Neuropsicologia</SelectItem>
                                <SelectItem value="Psicoterapia">Psicoterapia</SelectItem>
                                <SelectItem value="Terapia cognitiva">Terapia cognitiva</SelectItem>
                                <SelectItem value="Terapia sistêmica">Terapia sistêmica</SelectItem>
                                <SelectItem value="Psicanálise">Psicanálise</SelectItem>
                                <SelectItem value="Gestalt">Gestalt</SelectItem>
                                <SelectItem value="Hipnoterapia">Hipnoterapia</SelectItem>
                                <SelectItem value="EMDR">EMDR</SelectItem>
                                <SelectItem value="TCC">TCC</SelectItem>
                                
                                {/* Saúde mental */}
                                <SelectItem value="Saúde mental">Saúde mental</SelectItem>
                                <SelectItem value="Ansiedade">Ansiedade</SelectItem>
                                <SelectItem value="Depressão">Depressão</SelectItem>
                                <SelectItem value="Transtornos alimentares">Transtornos alimentares</SelectItem>
                                <SelectItem value="TOC">TOC</SelectItem>
                                <SelectItem value="TDAH">TDAH</SelectItem>
                                <SelectItem value="Bipolaridade">Bipolaridade</SelectItem>
                                <SelectItem value="Trauma">Trauma</SelectItem>
                                <SelectItem value="TEPT">TEPT</SelectItem>
                                <SelectItem value="Burnout">Burnout</SelectItem>
                                <SelectItem value="Fobias">Fobias</SelectItem>
                                <SelectItem value="Pânico">Pânico</SelectItem>
                                <SelectItem value="Estresse">Estresse</SelectItem>
                                
                                {/* Relacionamentos */}
                                <SelectItem value="Relacionamentos">Relacionamentos</SelectItem>
                                <SelectItem value="Terapia de casal">Terapia de casal</SelectItem>
                                <SelectItem value="Família">Família</SelectItem>
                                <SelectItem value="Maternidade">Maternidade</SelectItem>
                                <SelectItem value="Paternidade">Paternidade</SelectItem>
                                <SelectItem value="Divórcio">Divórcio</SelectItem>
                                <SelectItem value="Luto">Luto</SelectItem>
                                <SelectItem value="Comunicação">Comunicação</SelectItem>
                                
                                {/* Desenvolvimento pessoal */}
                                <SelectItem value="Autoestima">Autoestima</SelectItem>
                                <SelectItem value="Autoconhecimento">Autoconhecimento</SelectItem>
                                <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                                <SelectItem value="Meditação">Meditação</SelectItem>
                                <SelectItem value="Inteligência emocional">Inteligência emocional</SelectItem>
                                <SelectItem value="Resiliência">Resiliência</SelectItem>
                                <SelectItem value="Produtividade">Produtividade</SelectItem>
                                <SelectItem value="Hábitos">Hábitos</SelectItem>
                                <SelectItem value="Motivação">Motivação</SelectItem>
                                <SelectItem value="Propósito">Propósito</SelectItem>
                                
                                {/* Psicologia específica */}
                                <SelectItem value="Psicologia do esporte">Psicologia do esporte</SelectItem>
                                <SelectItem value="Psicologia organizacional">Psicologia organizacional</SelectItem>
                                <SelectItem value="Psicologia educacional">Psicologia educacional</SelectItem>
                                <SelectItem value="Psicologia social">Psicologia social</SelectItem>
                                <SelectItem value="Psicologia positiva">Psicologia positiva</SelectItem>
                                <SelectItem value="Psicologia infantil">Psicologia infantil</SelectItem>
                                <SelectItem value="Psicologia do idoso">Psicologia do idoso</SelectItem>
                                <SelectItem value="Psicologia hospitalar">Psicologia hospitalar</SelectItem>
                                <SelectItem value="Psicologia jurídica">Psicologia jurídica</SelectItem>
                                
                                {/* Tecnologia */}
                                <SelectItem value="Psicologia digital">Psicologia digital</SelectItem>
                                <SelectItem value="Tecnologia e comportamento">Tecnologia e comportamento</SelectItem>
                                <SelectItem value="Mídias sociais">Mídias sociais</SelectItem>
                                <SelectItem value="Inteligência artificial">Inteligência artificial</SelectItem>
                                <SelectItem value="Telemedicina">Telemedicina</SelectItem>
                                <SelectItem value="Apps terapêuticos">Apps terapêuticos</SelectItem>
                                <SelectItem value="Realidade virtual">Realidade virtual</SelectItem>
                                <SelectItem value="Dependência digital">Dependência digital</SelectItem>
                                <SelectItem value="Cyberbullying">Cyberbullying</SelectItem>
                                
                                {/* Temas contemporâneos */}
                                <SelectItem value="Gênero">Gênero</SelectItem>
                                <SelectItem value="Diversidade">Diversidade</SelectItem>
                                <SelectItem value="LGBTQIA+">LGBTQIA+</SelectItem>
                                <SelectItem value="Feminismo">Feminismo</SelectItem>
                                <SelectItem value="Racismo">Racismo</SelectItem>
                                <SelectItem value="Preconceito">Preconceito</SelectItem>
                                <SelectItem value="Inclusão">Inclusão</SelectItem>
                                <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                                <SelectItem value="Mudanças climáticas">Mudanças climáticas</SelectItem>
                                
                                {/* Tipos de conteúdo */}
                                <SelectItem value="Opinião">Opinião</SelectItem>
                                <SelectItem value="Reflexão">Reflexão</SelectItem>
                                <SelectItem value="Análise crítica">Análise crítica</SelectItem>
                                <SelectItem value="Tendências">Tendências</SelectItem>
                                <SelectItem value="Discussão">Discussão</SelectItem>
                                <SelectItem value="Perspectivas">Perspectivas</SelectItem>
                                <SelectItem value="Debate">Debate</SelectItem>
                                <SelectItem value="Resenha">Resenha</SelectItem>
                                <SelectItem value="Editorial">Editorial</SelectItem>
                                
                                {/* Acadêmico */}
                                <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                                <SelectItem value="Estudo de caso">Estudo de caso</SelectItem>
                                <SelectItem value="Metodologia">Metodologia</SelectItem>
                                <SelectItem value="Revisão sistemática">Revisão sistemática</SelectItem>
                                <SelectItem value="Meta-análise">Meta-análise</SelectItem>
                                <SelectItem value="Artigo científico">Artigo científico</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição/Resumo *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrição resumida do artigo que aparecerá nos cards..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Autor e Dados Científicos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Autor e Dados Científicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autor Principal *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do autor principal..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coAuthors"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Co-autores</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome dos co-autores separados por vírgula..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instituição</FormLabel>
                            <FormControl>
                              <Input placeholder="Instituição de pesquisa..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="readingTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo de Leitura (minutos)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 15"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="doi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DOI</FormLabel>
                            <FormControl>
                              <Input placeholder="10.1000/182" {...field} />
                            </FormControl>
                            <FormDescription>
                              Digital Object Identifier (se disponível)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Palavras-chave</FormLabel>
                            <FormControl>
                              <Input placeholder="psicologia, comportamento, terapia..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Separadas por vírgula
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Conteúdo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conteúdo do Artigo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo Completo *</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Digite o conteúdo do artigo aqui..."
                              rows={12}
                              uploadingImage={uploadingImage}
                              onImageUpload={uploadImageForContent}
                            />
                          </FormControl>
                          <FormDescription>
                            Use os botões de formatação para criar conteúdo profissional. Imagens são convertidas automaticamente para WebP.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="articleReferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referências</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Referencias bibliográficas do artigo..."
                              rows={6}
                            />
                          </FormControl>
                          <FormDescription>
                            Use formatação para organizar as referências de forma profissional
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Configurações de Botões */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações de Navegação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Botão de Contato */}
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="showContactButton"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Botão de Contato</FormLabel>
                                <FormDescription>
                                  Exibir botão de contato no artigo
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

                        {form.watch("showContactButton") && (
                          <>
                            <FormField
                              control={form.control}
                              name="contactButtonText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Texto do Botão</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Entrar em Contato" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="contactButtonUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL de Contato</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Publicação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações de Publicação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Artigo em Destaque</FormLabel>
                              <FormDescription>
                                Aparecerá na seção de artigos da página principal
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
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ordem de Exibição</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Menor número aparece primeiro
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex items-center gap-3 px-3 py-3 sm:px-6 sm:py-4 border-t shrink-0">
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="btn-admin"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {editingArticle ? "Atualizar" : "Criar"} Artigo
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={resetForm}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Instruções de IA para Artigos */}
      <AIInstructions type="articles" />

      {/* Lista de Artigos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Artigos Cadastrados ({articles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando artigos...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum artigo cadastrado ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Novo Artigo" para começar.</p>
            </div>
          ) : (
            <DragAndDropContainer 
              items={articles.map(article => ({ id: article.id, order: article.order }))}
              onReorder={handleReorder}
            >
              {articles.map((article, index) => (
                <DragAndDropItem
                  key={article.id}
                  id={article.id}
                  isActive={article.isPublished}
                  isFirst={index === 0}
                  isLast={index === articles.length - 1}
                  onToggleActive={() => publishMutation.mutate({ 
                    id: article.id, 
                    publish: !article.isPublished 
                  })}
                  onMoveUp={() => handleMoveUp(article)}
                  onMoveDown={() => handleMoveDown(article)}
                  onEdit={() => handleEdit(article)}
                  onDelete={() => handleDelete(article.id)}
                  isPending={publishMutation.isPending}
                >
                  <div className="flex-1 min-w-0">
                    {/* Título e badges principais - desktop */}
                    <div className="hidden sm:flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(article.createdAt.toString())}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {article.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {article.isFeatured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs">
                            ⭐ Destaque
                          </Badge>
                        )}
                        <Badge 
                          variant={article.isPublished ? "default" : "secondary"}
                          className={`text-xs ${article.isPublished ? "bg-green-600" : ""}`}
                        >
                          {article.isPublished ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                    </div>

                    {/* Layout mobile - elementos empilhados */}
                    <div className="sm:hidden space-y-3">
                      {/* Título e status na primeira linha */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        <Badge 
                          variant={article.isPublished ? "default" : "secondary"}
                          className={`text-xs shrink-0 ${article.isPublished ? "bg-green-600" : ""}`}
                        >
                          {article.isPublished ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>

                      {/* Informações secundárias empilhadas */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <User className="h-3 w-3" />
                            <span className="truncate">{article.author}</span>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {article.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{formatDate(article.createdAt.toString())}</span>
                          </div>
                          {article.isFeatured && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs shrink-0">
                              ⭐ Destaque
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Descrição no final */}
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </DragAndDropItem>
              ))}
            </DragAndDropContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}