/**
 * article.tsx
 * 
 * Página individual de artigo científico
 * Layout jornalístico moderno inspirado em portais como G1 e NYT
 * Design profissional e elegante para melhor experiência de leitura
 * Foco na credibilidade e apresentação visual atrativa
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  ExternalLink, 
  Mail, 
  Phone,
  FileText,
  Quote,
  Award,
  BookOpen,
  Hash,
  Share2,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import type { Article } from "@shared/schema";
import { Footer } from "@/components/Footer";

export default function ArticlePage() {
  const [match, params] = useRoute("/artigo/:id");
  const articleId = params?.id;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["/api/articles", articleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Artigo não encontrado');
      }
      return response.json() as Promise<Article>;
    },
    enabled: !!articleId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Query para buscar configurações do site (incluindo foto do hero)
  const { data: configs = [] } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const response = await fetch("/api/config");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Extrair a imagem personalizada do hero se disponível
  const heroImage = configs.find((c: any) => c.key === 'hero_image');
  const profileImage = heroImage?.value?.path || null;

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Artigos Científicos`;
    }
  }, [article]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    if (!article) return;

    const shareData = {
      title: article.title,
      text: article.subtitle || article.description || `Confira este artigo: ${article.title}`,
      url: window.location.href
    };

    try {
      // Verifica se o navegador suporta Web Share API (principalmente mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback para desktop: copia URL para clipboard
        await navigator.clipboard.writeText(window.location.href);
        
        // Feedback visual simples
        const button = document.activeElement as HTMLElement;
        const originalText = button.textContent;
        button.textContent = 'Link copiado!';
        setTimeout(() => {
          if (button && originalText) {
            button.textContent = originalText;
          }
        }, 2000);
      }
    } catch (error) {
      // Fallback final: abre share do WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${article.title}\n\n${window.location.href}`)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-gray-900">Artigo não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Cabeçalho de Navegação Aesthetic - Responsivo */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3">
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100/50 transition-all duration-300 rounded-full px-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Site
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              {article.badge && (
                <Badge className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 font-medium px-3 py-1 rounded-full text-xs tracking-wider uppercase shadow-lg">
                  {article.badge}
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-all duration-300 rounded-full px-4"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          {/* Mobile Layout - Categoria na esquerda, compartilhar na direita */}
          <div className="sm:hidden flex items-center justify-between">
            <div className="flex-1 flex justify-start">
              {article.badge && (
                <Badge className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium px-3 py-1 rounded-full text-xs uppercase shadow-lg">
                  {article.badge}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-all duration-300 rounded-full px-3"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Aesthetic Modern */}
      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto px-6 py-12"
      >
        {/* Categoria e Meta Info */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="outline" className="border-gray-300 text-gray-700 font-medium uppercase tracking-widest text-xs px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm">
              {article.category}
            </Badge>
            {article.publishedAt && (
              <time className="text-sm text-gray-500 font-light tracking-wide">
                {formatDate(article.publishedAt)}
              </time>
            )}
          </div>
        </div>

        {/* Título Principal - Modern Aesthetic */}
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-[1.1] mb-8 tracking-tight"
            style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
          >
            {article.title}
          </motion.h1>
          
          {article.subtitle && (
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-8 max-w-4xl"
            >
              {article.subtitle}
            </motion.h2>
          )}

          {/* Linha de Descrição Aesthetic */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative pl-8 mb-10"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gray-400 to-gray-200 rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light italic max-w-4xl">
              {article.description}
            </p>
          </motion.div>

          {/* Byline - Modern Author Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center gap-6 py-6 border-t border-gray-200/60 border-b border-gray-200/60 bg-white/30 rounded-lg px-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Foto do autor" 
                  className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm tracking-wide">
                  {article.author}
                  {article.coAuthors && ` e ${article.coAuthors}`}
                </p>
                {article.institution && (
                  <p className="text-xs text-gray-500 font-light tracking-wide">{article.institution}</p>
                )}
              </div>
            </div>
            
            {article.readingTime && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-full">
                <Clock className="h-3 w-3" />
                <span className="font-light tracking-wide">{article.readingTime} min de leitura</span>
              </div>
            )}
          </motion.div>
        </header>

        {/* Imagem Principal - Aesthetic Style */}
        {article.cardImage && (
          <motion.figure 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-16 group"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              <img 
                src={article.cardImage} 
                alt={article.title}
                className="w-full h-[450px] md:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <figcaption className="text-sm text-gray-500 mt-4 italic text-center font-light tracking-wide">
              Imagem ilustrativa do artigo
            </figcaption>
          </motion.figure>
        )}

        {/* Conteúdo Principal - Layout Centralizado */}
        <main className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="prose prose-xl max-w-none"
          >
            {/* Conteúdo HTML com Tipografia Modern */}
            <div 
              className="article-content-modern text-gray-800 leading-relaxed"
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: '1.125rem',
                lineHeight: '1.9',
                letterSpacing: '0.01em'
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </motion.div>

            {/* Seção de Referências Aesthetic */}
            {article.articleReferences && (
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="mt-20 pt-12"
              >
                <div className="relative mb-8">
                  <h3 className="text-2xl sm:text-xl font-light text-gray-900 text-center tracking-wide flex items-center justify-center gap-3 mb-4">
                    <BookOpen className="h-6 w-6 sm:h-5 sm:w-5 text-gray-600" />
                    Referências Bibliográficas
                  </h3>
                  <div className="w-24 h-px bg-gradient-to-r from-gray-400 to-gray-600 mx-auto"></div>
                </div>
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                  <div 
                    className="text-sm text-gray-700 leading-relaxed space-y-3 font-light"
                    style={{ fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '0.01em' }}
                    dangerouslySetInnerHTML={{ __html: article.articleReferences }}
                  />
                </div>
              </motion.section>
            )}

            {/* DOI Aesthetic */}
            {article.doi && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="mt-10 p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-lg rounded-3xl border border-gray-200/50 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-widest">Identificador Digital</p>
                    <a 
                      href={`https://doi.org/${article.doi}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-800 hover:text-gray-900 font-mono text-sm flex items-center gap-2 bg-gray-100/60 p-3 rounded-xl transition-all duration-300 hover:bg-gray-200/60 font-light tracking-wide group"
                    >
                      DOI: {article.doi}
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
        </main>

        {/* Card Consolidado de Informações e Ações */}
        <div className="max-w-4xl mx-auto mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl"
          >
            <h4 className="font-light text-gray-900 mb-6 text-xl tracking-wide flex items-center gap-3">
              <Eye className="h-5 w-5 text-gray-600" />
              Informações de Publicação
            </h4>
            
            {/* Informações em layout único */}
            <div className="space-y-6 text-sm">
                <div className="group">
                  <span className="font-medium text-gray-600 uppercase tracking-widest text-xs">Categoria</span>
                  <div className="mt-2">
                    <Badge variant="outline" className="border-gray-300 text-gray-700 font-light px-4 py-1.5 rounded-full bg-gray-50/50">
                      {article.category}
                    </Badge>
                  </div>
                </div>

                {article.keywords && (
                  <div className="group">
                    <span className="font-medium text-gray-600 uppercase tracking-widest text-xs flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      Palavras-chave
                    </span>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.keywords.split(',').map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100/60 border border-gray-200/50 text-gray-700 font-light px-3 py-1 rounded-full hover:bg-gray-200/60 transition-colors">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {article.publishedAt && (
                  <div className="group">
                    <span className="font-medium text-gray-600 uppercase tracking-widest text-xs">Data de Publicação</span>
                    <div className="flex items-center gap-3 mt-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800 font-light">{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                )}
                
                {article.readingTime && (
                  <div className="group">
                    <span className="font-medium text-gray-600 uppercase tracking-widest text-xs">Tempo de Leitura</span>
                    <div className="flex items-center gap-3 mt-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800 font-light">{article.readingTime} minutos</span>
                    </div>
                  </div>
                )}
                
                {article.institution && (
                  <div className="group">
                    <span className="font-medium text-gray-600 uppercase tracking-widest text-xs">Instituição</span>
                    <div className="flex items-center gap-3 mt-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-800 font-light">{article.institution}</span>
                    </div>
                  </div>
                )}
            </div>

            {/* Botão Voltar na parte inferior */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <Link href="/" className="block">
                <Button variant="outline" className="w-full md:w-auto border-gray-300 hover:bg-gray-100/60 font-light tracking-wide py-3 rounded-2xl transition-all duration-300">
                  <ArrowLeft className="mr-3 h-4 w-4" />
                  Voltar ao Site
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.article>

      {/* Footer da página pública */}
      <Footer />
    </div>
  );
}