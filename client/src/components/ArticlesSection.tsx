/**
 * ArticlesSection.tsx
 * 
 * Seção de Artigos Científicos na página principal
 * Exibe cards dos últimos artigos publicados
 * Interface moderna e responsiva com badge, autor e data
 * Integração com API de artigos em destaque
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, ExternalLink, ChevronRight, BookOpen, Brain, Heart, Lightbulb, Zap, Target, Star, Award, Sparkles as SparklesIcon, Shield, Users, Clock, CheckCircle, TrendingUp, MessageSquare, Search, Book, Bookmark, Library, Archive, FolderOpen, Globe, Database, Settings, Cpu, Wifi, Phone, Mail, MapPin, Camera, Image, Video, Music, Headphones, Mic, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { processTextWithGradient, hexToRgba } from "@/utils/textGradient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSectionColors } from "@/hooks/useSectionColors";
import type { Article } from "@shared/schema";

interface ArticlesSectionProps {
  className?: string;
}

export function ArticlesSection({ className = "" }: ArticlesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Apply section colors
  useSectionColors();

  // Buscar artigos em destaque
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/articles/featured"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/articles/featured");
      return response.json() as Promise<Article[]>;
    },
    staleTime: 0, // Permitir refetch quando necessário
    gcTime: 5 * 60 * 1000, // 5 minutos para limpeza
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Buscar configurações da seção
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
  
  const articlesTitle = configs.find((c: any) => c.key === 'articles_title')?.value || 'Artigos Científicos';
  const articlesBadge = configs.find((c: any) => c.key === 'articles_badge')?.value || 'Publicações';
  const articlesDescription = configs.find((c: any) => c.key === 'articles_description')?.value || 'Explore nossas publicações científicas mais recentes, pesquisas e estudos na área da psicologia clínica e comportamental.';
  
  // Configurações do botão Biblioteca Completa
  const articlesButtonText = configs.find((c: any) => c.key === 'articles_button_text')?.value || 'Biblioteca Completa';
  const articlesButtonIcon = configs.find((c: any) => c.key === 'articles_button_icon')?.value || 'FileText';
  
  // Buscar gradiente configurado para badges (usado nos títulos com parênteses)
  const badgeGradient = configs.find((c: any) => c.key === 'badge_gradient')?.value?.gradient;
  
  // Buscar foto configurada no hero para usar no perfil dos artigos
  const heroImage = configs.find((c: any) => c.key === "hero_image");
  const profileImage = heroImage?.value?.path || null;
  
  // Mapeamento de cores Tailwind para hexadecimal (para extrair cor do badge)
  const TAILWIND_COLORS: { [key: string]: string } = {
    'yellow-400': '#facc15',
    'amber-500': '#f59e0b',
    'pink-500': '#ec4899',
    'purple-600': '#9333ea',
    'rose-500': '#f43f5e',
    'pink-600': '#db2777',
    'fuchsia-500': '#d946ef',
    'violet-500': '#8b5cf6',
    'blue-500': '#3b82f6',
    'green-500': '#22c55e',
    'orange-500': '#f97316',
    'red-600': '#dc2626',
    'teal-500': '#14b8a6',
    'cyan-600': '#0891b2',
    'indigo-500': '#6366f1',
    'emerald-500': '#10b981',
  };

  // Mapeamento de gradientes dos badges  
  const BADGE_GRADIENTS: { [key: string]: string } = {
    'gold-amber': 'from-yellow-400 to-amber-500',
    'pink-purple': 'from-pink-500 to-purple-600',
    'rose-pink': 'from-rose-500 to-pink-600',
    'fuchsia-pink': 'from-fuchsia-500 to-pink-600',
    'violet-purple': 'from-violet-500 to-purple-600',
    'blue-purple': 'from-blue-500 to-purple-600',
    'green-blue': 'from-green-500 to-blue-600',
    'orange-red': 'from-orange-500 to-red-600',
  };

  // Extrair cor principal do gradiente do badge para usar no hover
  const getBadgeHoverColor = (gradientKey: string) => {
    const gradientClass = BADGE_GRADIENTS[gradientKey] || 'from-pink-500 to-purple-600';
    const fromMatch = gradientClass.match(/from-(\w+-\d+)/);
    return fromMatch ? TAILWIND_COLORS[fromMatch[1]] : '#ec4899';
  };

  const badgeHoverColor = getBadgeHoverColor(badgeGradient || 'pink-purple');
  const badgeFirstColor = getBadgeHoverColor(badgeGradient || 'pink-purple'); // Mesma cor para consistência

  // Criar gradiente CSS para usar nos badges dos artigos
  const getGradientCSS = (gradientKey: string) => {
    const gradientClass = BADGE_GRADIENTS[gradientKey] || 'from-pink-500 to-purple-600';
    const fromMatch = gradientClass.match(/from-(\w+-\d+)/);
    const toMatch = gradientClass.match(/to-(\w+-\d+)/);
    
    const fromColor = fromMatch ? TAILWIND_COLORS[fromMatch[1]] : '#ec4899';
    const toColor = toMatch ? TAILWIND_COLORS[toMatch[1]] : '#9333ea';
    
    return `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`;
  };

  const decorativeLineGradient = getGradientCSS(badgeGradient || 'pink-purple');

  const displayedArticles = showAll ? articles : articles.slice(0, 6);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Removido para sempre mostrar a seção mesmo sem artigos
  // if (articles.length === 0 && !isLoading) {
  //   return null; // Não exibe a seção se não há artigos
  // }

  return (
    <section className={`py-20 px-4 ${className}`} id="artigos" data-section="articles">
      <div className="max-w-7xl mx-auto">
        {/* Header da Seção */}
        <SectionHeader
          badge={articlesBadge}
          title={articlesTitle}
          description={articlesDescription}
          badgeGradient={badgeGradient}
          animated={true}
          className="mb-8"
          sectionKey="articles"
        />

        {/* Botão Biblioteca Completa - Logo após a descrição */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <Link href="/artigos">
            <Button 
              variant="outline" 
              size="lg" 
              className="group border-2 border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300"
            >
              {(() => {
                // Mapeamento seguro de ícones
                const iconMap: { [key: string]: any } = {
                  FileText, Calendar, User, ExternalLink, ChevronRight, BookOpen, Brain, 
                  Heart, Lightbulb, Zap, Target, Star, Award, SparklesIcon, Shield, Users, 
                  Clock, CheckCircle, TrendingUp, MessageSquare, Search, Book, Bookmark, 
                  Library, Archive, FolderOpen, Globe, Database, Settings, Cpu, Wifi, 
                  Phone, Mail, MapPin, Camera, Image, Video, Music, Headphones, Mic, Volume2
                };
                const IconComponent = iconMap[articlesButtonIcon] || FileText;
                return <IconComponent className="mr-3 h-5 w-5" />;
              })()}
              {articlesButtonText}
              <ExternalLink className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State - Estilo Jornalístico */}
        {isLoading && (
          <div className="space-y-12">
            {/* Loading do Artigo Principal */}
            <div className="animate-pulse">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-80 bg-gray-200"></div>
                  <div className="p-8 lg:p-12 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="flex gap-6 pt-6 border-t border-gray-200">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading dos Artigos Secundários */}
            <div className="border-t border-gray-200 pt-12">
              <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="aspect-[16/10] bg-gray-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid de Artigos - Desktop: Grid | Mobile: Lista */}
        {!isLoading && displayedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Desktop: Grid Layout | Mobile: Lista Vertical */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {displayedArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link href={`/artigo/${article.id}`}>
                    <article className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                      {/* Imagem do Artigo */}
                      {article.cardImage && (
                        <div className="relative overflow-hidden">
                          <div className="aspect-[16/10]">
                            <img 
                              src={article.cardImage} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          {/* Badge minimalista sobreposto */}
                          {article.badge && (
                            <div className="absolute top-4 left-4">
                              <span 
                                className="backdrop-blur-md bg-white/90 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm border border-white/20"
                              >
                                {article.badge}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6 flex flex-col h-full">
                        {/* Badge minimalista no conteúdo */}
                        {article.badge && (
                          <div className="mb-4">
                            <span 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide border"
                              style={{
                                backgroundColor: hexToRgba(badgeFirstColor, 0.08),
                                color: badgeFirstColor,
                                borderColor: hexToRgba(badgeFirstColor, 0.15)
                              }}
                            >
                              {article.badge}
                            </span>
                          </div>
                        )}

                        {/* Título */}
                        <h4 
                          className="text-lg font-bold text-gray-900 mb-3 transition-colors line-clamp-2 leading-tight"
                          style={{
                            color: 'inherit'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = badgeHoverColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'inherit';
                          }}
                        >
                          {article.title}
                        </h4>

                        {/* Subtítulo */}
                        {article.subtitle && (
                          <p className="text-gray-600 mb-3 line-clamp-2 text-sm font-medium">
                            {article.subtitle}
                          </p>
                        )}

                        {/* Descrição */}
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-grow">
                          {article.description}
                        </p>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-100 mt-auto">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              {profileImage ? (
                                <img 
                                  src={profileImage} 
                                  alt="Foto de perfil" 
                                  className="w-4 h-4 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              <span className="font-medium text-gray-700">{article.author}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {article.publishedAt ? new Date(article.publishedAt.toString()).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                }) : 'Não publicado'}
                              </span>
                            </div>
                          </div>

                          {/* Tempo de leitura */}
                          {article.readingTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                              <BookOpen className="h-3 w-3" />
                              <span>{article.readingTime} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Botão Ver Mais (se aplicável) - Sem linha separadora */}
        {articles.length > 6 && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button 
              onClick={() => setShowAll(true)}
              size="lg"
              className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              Carregar Mais Artigos
              <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ArticlesSection;