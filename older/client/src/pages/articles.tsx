/**
 * articles.tsx
 * 
 * Página de listagem de todos os artigos científicos
 * Interface limpa com filtros e paginação
 * Cards responsivos com preview dos artigos
 * Navegação fácil entre artigos
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Calendar, 
  User, 
  Search, 
  Filter,
  ArrowLeft,
  Clock,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { processTextWithGradient } from "@/utils/textGradient";

import type { Article } from "@shared/schema";

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/articles");
      return response.json() as Promise<Article[]>;
    },
    staleTime: 0, // Permitir refetch quando necessário
    gcTime: 5 * 60 * 1000, // 5 minutos para limpeza
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Buscar configurações dinâmicas da seção
  const { data: sectionConfig } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const configs = Array.isArray(sectionConfig) ? sectionConfig : [];
  
  // Usar os mesmos textos da página pública
  const articlesTitle = configs.find((c: any) => c.key === 'articles_title')?.value || 'Artigos Científicos';
  const articlesDescription = configs.find((c: any) => c.key === 'articles_description')?.value || 'Explore nossa coleção de pesquisas e estudos em psicologia clínica e comportamental';
  const articlesBadge = configs.find((c: any) => c.key === 'articles_badge')?.value || 'Biblioteca Completa';
  
  // Buscar gradiente configurado para badges (usado nos títulos com parênteses)
  const badgeGradient = configs.find((c: any) => c.key === 'badge_gradient')?.value?.gradient;
  
  // Buscar foto configurada no hero para usar no perfil dos artigos (mesma da página pública)
  const heroImage = configs.find((c: any) => c.key === "hero_image");
  const profileImage = heroImage?.value?.path || null;
  


  // Filtrar e ordenar artigos
  const filteredArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Ordenação
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime());
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        filtered.sort((a, b) => a.author.localeCompare(b.author));
        break;
    }

    return filtered;
  }, [articles, searchTerm, selectedCategory, sortBy]);

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(articles.map(article => article.category)));
    return uniqueCategories.sort();
  }, [articles]);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/30 via-white to-indigo-50/20 relative">
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-100/20 to-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-full blur-2xl" />
      </div>

      {/* Header Ultra Moderno */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/40 shadow-sm/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Navegação */}
          <div className="flex items-center justify-between mb-12">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all duration-300 font-medium rounded-xl backdrop-blur-sm border border-transparent hover:border-indigo-200/50 shadow-sm hover:shadow-md">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao Site</span>
                <span className="sm:hidden">Voltar</span>
              </Button>
            </Link>
            
            <div className="text-sm text-slate-500/80 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60">
              Biblioteca Completa
            </div>
          </div>

          {/* Centro Aesthetic - Mobile Optimizado */}
          <div className="text-center max-w-5xl mx-auto relative px-4 sm:px-6">
            {/* Elemento decorativo de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/30 to-transparent rounded-3xl blur-xl scale-150 opacity-60" />
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-indigo-200/40 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-sm sm:text-base font-bold text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text tracking-wide uppercase">
                  {articlesBadge}
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative z-10"
            >
              <p className="text-base sm:text-xl lg:text-2xl text-slate-600/90 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed sm:leading-relaxed font-light tracking-wide px-2 sm:px-0">
                {articlesDescription}
              </p>
              
              {/* Linha decorativa */}
              <div className="mt-6 sm:mt-8 flex justify-center">
                <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 rounded-full opacity-60" />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 relative z-10">
        {/* Filtros e Busca Ultra Aesthetic */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative"
        >
          {/* Background decorativo para os filtros */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-indigo-50/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-50/20 to-transparent rounded-3xl" />
          
          <div className="relative p-8 sm:p-10">
            {/* Campo de Busca Principal Ultra Aesthetic */}
            <div className="mb-8">
              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2 p-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <Input
                    placeholder="Buscar artigos por título, autor ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 pr-6 py-4 text-lg bg-white/90 backdrop-blur-sm border-indigo-200/60 rounded-2xl focus:border-indigo-400 focus:ring-indigo-300/30 focus:ring-4 placeholder:text-slate-400/80 shadow-lg hover:shadow-xl transition-all duration-300 font-light"
                  />
                  
                  {/* Efeito de borda animada */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/0 via-indigo-400/30 to-purple-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filtros Ultra Aesthetic */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center items-stretch lg:items-end">
              {/* Filtro de Categoria */}
              <div className="flex-1 lg:max-w-xs group">
                <label className="block text-sm font-semibold text-slate-700/90 mb-3 tracking-wide">
                  Categoria
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="relative bg-white/90 backdrop-blur-sm border-indigo-200/60 rounded-xl h-12 hover:shadow-lg transition-all duration-300 hover:border-indigo-300/80">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                          <Filter className="h-3 w-3 text-white" />
                        </div>
                        <SelectValue placeholder="Todas as categorias" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg border-indigo-200/60 rounded-xl shadow-2xl">
                      <SelectItem value="all" className="rounded-lg">Todas as Categorias</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="rounded-lg">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ordenação */}
              <div className="flex-1 lg:max-w-xs group">
                <label className="block text-sm font-semibold text-slate-700/90 mb-3 tracking-wide">
                  Ordenar por
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="relative bg-white/90 backdrop-blur-sm border-indigo-200/60 rounded-xl h-12 hover:shadow-lg transition-all duration-300 hover:border-indigo-300/80">
                      <SelectValue placeholder="Ordenar por..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg border-indigo-200/60 rounded-xl shadow-2xl">
                      <SelectItem value="newest" className="rounded-lg">Mais Recentes</SelectItem>
                      <SelectItem value="oldest" className="rounded-lg">Mais Antigos</SelectItem>
                      <SelectItem value="title" className="rounded-lg">Título (A-Z)</SelectItem>
                      <SelectItem value="author" className="rounded-lg">Autor (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão Limpar Filtros (mobile) */}
              {(searchTerm || selectedCategory !== "all") && (
                <div className="flex-shrink-0 lg:hidden">
                  <label className="block text-sm font-semibold text-slate-700/90 mb-3 tracking-wide">
                    &nbsp;
                  </label>
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>

            {/* Barra de Resultados Ultra Aesthetic */}
            <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-indigo-200/50 to-transparent flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-base text-slate-700 font-medium">
                  <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                    {filteredArticles.length}
                  </span>
                  <span className="ml-2 text-slate-600">
                    {filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
                  </span>
                </div>
                
                {/* Indicadores de Filtros Ativos Ultra Aesthetic */}
                <div className="flex items-center gap-3">
                  {searchTerm && (
                    <Badge className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 border-indigo-200/60 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium shadow-sm">
                      <Search className="h-3 w-3 mr-1.5" />
                      {searchTerm.length > 15 ? `${searchTerm.slice(0, 15)}...` : searchTerm}
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border-purple-200/60 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium shadow-sm">
                      <Filter className="h-3 w-3 mr-1.5" />
                      {selectedCategory}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Botão Limpar Ultra Aesthetic (desktop) */}
              {(searchTerm || selectedCategory !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="hidden lg:flex bg-gradient-to-r from-slate-100 to-slate-200 hover:from-indigo-50 hover:to-purple-50 text-slate-700 hover:text-indigo-700 border border-slate-200/60 hover:border-indigo-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Loading State Moderno */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse bg-white/60 border-slate-200/60 rounded-2xl overflow-hidden">
                <CardHeader className="p-0">
                  <div className="aspect-[16/10] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded-full w-16" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-full" />
                    <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-3/4" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-full" />
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-5/6" />
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-4/6" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-20" />
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Grid de Artigos Ultra Aesthetic */}
        {!isLoading && filteredArticles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10"
          >
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                className="group relative"
              >
                {/* Background decorativo para cada card */}
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <Link href={`/artigo/${article.id}`}>
                  <Card className="relative hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer h-full bg-white/90 backdrop-blur-lg border-white/60 rounded-3xl overflow-hidden group-hover:border-indigo-200/60">
                    {/* Imagem Ultra Aesthetic */}
                    {article.cardImage && (
                      <CardHeader className="p-0 relative overflow-hidden">
                        <div className="aspect-[16/9] overflow-hidden relative">
                          {/* Background decorativo */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 z-0" />
                          
                          <img 
                            src={article.cardImage} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 relative z-10"
                          />
                          
                          {/* Overlays sofisticados */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-all duration-700 z-20" />
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20" />
                          
                          {/* Efeito de brilho */}
                          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 z-30" />
                        </div>
                        
                        {/* Badge Ultra Aesthetic */}
                        {article.badge && (
                          <div className="absolute top-5 left-5 z-40">
                            <Badge className="bg-white/95 backdrop-blur-lg text-slate-700 border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-full hover:scale-105 hover:bg-white">
                              {article.badge}
                            </Badge>
                          </div>
                        )}
                      </CardHeader>
                    )}

                    <CardContent className="p-8 sm:p-10 flex flex-col h-full relative">
                      {/* Badge quando não há imagem - Ultra Aesthetic */}
                      {!article.cardImage && article.badge && (
                        <div className="mb-6">
                          <Badge className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/60 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300/80 transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-full shadow-sm hover:shadow-md">
                            {article.badge}
                          </Badge>
                        </div>
                      )}

                      {/* Título Ultra Aesthetic */}
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500 leading-tight tracking-tight">
                        {article.title}
                      </h3>

                      {/* Subtítulo Elegante */}
                      {article.subtitle && (
                        <p className="text-slate-600/90 mb-6 font-medium leading-relaxed text-lg">
                          {article.subtitle}
                        </p>
                      )}

                      {/* Descrição com Typography Melhorada */}
                      <p className="text-slate-600/80 mb-10 leading-relaxed flex-grow text-base line-clamp-3 font-light">
                        {article.description}
                      </p>

                      {/* Footer Elegante e Ultra Responsivo */}
                      <div className="mt-auto pt-4">
                        {/* Divisor com gradiente sutil */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent mb-3" />
                        
                        {/* Container com background sutil */}
                        <div className="bg-slate-50/30 rounded-xl p-3 space-y-2.5">
                          {/* Linha 1: Autor com foto estilizada */}
                          <div className="flex items-center gap-2.5">
                            {profileImage ? (
                              <div className="relative">
                                <img 
                                  src={profileImage} 
                                  alt="Foto de perfil"
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div className="absolute inset-0 rounded-full ring-1 ring-slate-200/50" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 ring-1 ring-slate-200/50">
                                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                              </div>
                            )}
                            <span className="font-semibold text-slate-800 text-sm sm:text-base tracking-tight">{article.author}</span>
                          </div>
                          
                          {/* Linha 2: Metadados com ícones */}
                          <div className="flex items-center justify-between gap-3 pl-9 sm:pl-10">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span className="text-xs sm:text-sm font-medium">
                                {article.publishedAt ? formatDate(article.publishedAt) : 'Rascunho'}
                              </span>
                            </div>
                            {article.readingTime && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs sm:text-sm font-medium">
                                  {article.readingTime} min
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Ring Effect Ultra Aesthetic */}
                      <div className="absolute inset-0 rounded-3xl ring-1 ring-indigo-500/30 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Estado Vazio Elegante */}
        {!isLoading && filteredArticles.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center py-16 sm:py-24"
          >
            <div className="max-w-lg mx-auto">
              {/* Ícone e Background Decorativo */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl scale-150 opacity-50" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center border border-indigo-200/60 shadow-sm">
                  <FileText className="h-10 w-10 text-indigo-400" />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                {searchTerm || selectedCategory !== "all" ? 
                  "Nenhum resultado encontrado" : 
                  "Biblioteca em construção"
                }
              </h3>
              
              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
                {searchTerm || selectedCategory !== "all" ? 
                  "Não encontramos artigos que correspondam aos seus critérios de busca. Tente ajustar os filtros." :
                  "Novos artigos científicos e estudos serão publicados em breve. Acompanhe nossas atualizações."
                }
              </p>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {(searchTerm || selectedCategory !== "all") ? (
                  <>
                    <Button 
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                    >
                      Limpar filtros
                    </Button>
                    <Link href="/">
                      <Button variant="outline" className="border-slate-200 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium">
                        Voltar ao site
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/">
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium">
                      Explorar o site
                    </Button>
                  </Link>
                )}
              </div>

              {/* Decorações sutis */}
              <div className="mt-12 opacity-30">
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}