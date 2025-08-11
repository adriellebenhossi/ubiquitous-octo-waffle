
import { useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, MessageSquare, HelpCircle, Briefcase, Users, Eye, EyeOff, Edit, Trash2, Plus, LogOut, Home, Palette, Star, GripVertical, Upload, Camera, Image, TrendingUp, Globe, Search, Ban, Target, Brain, Heart, BookOpen, Award, Shield, Sun, Moon, Sparkles, Handshake, MessageCircle, Leaf, Flower, Compass, ChevronUp, ChevronDown, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Waves, Mountain, Timer, Clock, Activity, Zap, MapPin, X, FileText, Mail, GraduationCap, Cookie } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeroColorSettings } from "@/components/admin/HeroColorSettings";
import { ModernSectionColorManager } from "@/components/admin/ModernSectionColorManager";
import type { SiteConfig, Testimonial, FaqItem, Service, PhotoCarousel, Specialty } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Imports dos componentes que existem
import { TestimonialImageUpload } from "@/components/admin/TestimonialImageUpload";
import { PhotoCarouselImageUpload } from "@/components/admin/PhotoCarouselImageUpload";
import { BasicInfoForm } from "@/components/admin/BasicInfoForm";
import { HeaderInfoForm } from "@/components/admin/HeaderInfoForm";
import { NavigationForm } from "@/components/admin/NavigationForm";
import { HeroSectionForm } from "@/components/admin/HeroSectionForm";
import { AboutSectionTextsForm } from "@/components/admin/AboutSectionTextsForm";
import { AboutCredentialsManager } from "@/components/admin/AboutCredentialsManager";
import { PhotoCarouselTextsForm } from "@/components/admin/PhotoCarouselTextsForm";
import { PhotoCarouselManager } from "@/components/admin/PhotoCarouselManager";
import { InspirationalSectionForm } from "@/components/admin/InspirationalSectionForm";

import { TestimonialsSectionTextsForm } from "@/components/admin/TestimonialsSectionTextsForm";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { ServicesSectionTextsForm } from "@/components/admin/ServicesSectionTextsForm";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { FaqSectionTextsForm } from "@/components/admin/FaqSectionTextsForm";
import { FaqManager } from "@/components/admin/FaqManager";
import { SchedulingCardForm } from "@/components/admin/SchedulingCardForm";
import { ContactScheduleManager } from "@/components/admin/ContactScheduleManager";
import { FooterManager } from "@/components/admin/FooterManager";

import { SectionVisibilitySettings } from "@/components/admin/SectionVisibilitySettings";
import { MarketingSettings } from "@/components/admin/MarketingSettings";
import { AppearanceSettings } from "@/components/admin/AppearanceSettings";
import { MaintenanceForm } from "@/components/admin/MaintenanceForm";
import { SpecialtiesManager } from "@/components/admin/SpecialtiesManager";
import { SpecialtiesSectionTextsForm } from "@/components/admin/SpecialtiesSectionTextsForm";

import { BadgeGradientManager } from "@/components/admin/BadgeGradientManager";
import { BadgeVisibilitySettings } from "@/components/admin/BadgeVisibilitySettings";
import { BadgeIconSelector } from "@/components/admin/BadgeIconSelector";
import { InstructionsManager } from "@/components/admin/InstructionsManager";
import { DeveloperContactForm } from "@/components/admin/DeveloperContactForm";
import { ContactSectionForm } from "@/components/admin/ContactSectionForm";
import { CookieSettingsForm } from "@/components/admin/CookieSettingsForm";
import { PrivacyPolicyManager } from "@/components/admin/PrivacyPolicyManager";
import { TermsOfUseManager } from "@/components/admin/TermsOfUseManager";
import { ArticlesManager } from "@/components/admin/ArticlesManager";
import { ArticlesSectionTextsForm } from "@/components/admin/ArticlesSectionTextsForm";

import { ResponsiveAdminContainer } from "@/components/admin/base/ResponsiveAdminContainer";
import { ResponsiveGrid } from "@/components/admin/base/ResponsiveFormFields";
import { AdminTip, TIP_GRADIENTS } from "@/components/admin/base/AdminTip";



export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Banner de boas-vindas (apenas para a sessão atual)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  const handleCloseWelcomeBanner = () => {
    setShowWelcomeBanner(false);
  };
  
  const [showTips, setShowTips] = useState(() => {
    const saved = localStorage.getItem('admin_show_tips');
    return saved ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('admin_active_tab');
    return saved || "general";
  });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('admin_show_tips', JSON.stringify(showTips));
  }, [showTips]);

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  // Configuração otimizada de sensores para mobile e desktop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      setLocation("/09806446909");
    }
  }, [setLocation]);

  const logout = () => {
    localStorage.removeItem("admin_logged_in");
    setLocation("/09806446909");
  };

  // Queries com configurações anti-refetch para prevenir atualizações em cascata
  const { data: siteConfigs = [], isLoading, isError, error, dataUpdatedAt, isFetching } = useQuery<SiteConfig[]>({
    queryKey: ["/api/admin/config"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
  
  // Logs detalhados da query
  console.log("🔥🔥🔥 QUERY STATE ADMIN DASHBOARD 🔥🔥🔥");
  console.log("🔥 isLoading:", isLoading);
  console.log("🔥 isError:", isError);
  console.log("🔥 error:", error);
  console.log("🔥 isFetching:", isFetching);
  console.log("🔥 dataUpdatedAt:", dataUpdatedAt);
  console.log("🔥 siteConfigs:", siteConfigs);
  console.log("🔥 siteConfigs length:", siteConfigs?.length);
  console.log("🔥 Timestamp render:", Date.now());
  
  // Log específico para about_credentials
  if (siteConfigs && siteConfigs.length > 0) {
    const aboutCreds = siteConfigs.find((c: any) => c.key === 'about_credentials');
    console.log("🔥 About credentials encontrados:", aboutCreds);
    console.log("🔥 About credentials value:", aboutCreds?.value);
  }

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const { data: faqItems = [], isLoading: faqLoading, error: faqError } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });



  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const { data: photoCarousel = [] } = useQuery<PhotoCarousel[]>({
    queryKey: ["/api/admin/photo-carousel"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ["/api/admin/specialties"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const { data: contactSettings } = useQuery({
    queryKey: ["/api/admin/contact-settings"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const { data: footerSettings } = useQuery({
    queryKey: ["/api/admin/footer-settings"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
  };

  // Componente de Tab Trigger móvel otimizado
  const MobileTabTrigger = ({ value, children, icon }: { value: string; children: ReactNode; icon: ReactNode }) => (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation
        ${activeTab === value 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
          : 'bg-white/70 hover:bg-white/90 text-gray-700 hover:text-gray-900'
        }
      `}
      onClick={() => setActiveTab(value)}
    >
      <div className={`p-2 rounded-lg ${activeTab === value ? 'bg-white/20' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">{children}</div>
      </div>
      {activeTab === value && (
        <div className="w-2 h-2 bg-white rounded-full"></div>
      )}
    </div>
  );

  // Componente de Card responsivo
  const ResponsiveCard = ({ children, className = "", ...props }: any) => (
    <Card className={`
      bg-white/90 backdrop-blur-sm border-0 shadow-lg 
      hover:shadow-xl transition-all duration-300
      ${className}
    `} {...props}>
      {children}
    </Card>
  );

  return (
    <div className="min-h-screen admin-panel" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Ultra Minimalist Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Left - Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#0a0a0a' }} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-gray-900">Espaço administrativo</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Dra. Adrielle Benhossi</p>
              </div>
            </div>

            {/* Right - Status & Actions */}
            <div className="flex items-center gap-2">
              {/* Status */}
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1">
                {(() => {
                  const maintenanceConfig = siteConfigs.find(config => config.key === 'maintenance_mode')?.value as any;
                  const isMaintenanceEnabled = maintenanceConfig?.isEnabled === true;
                  
                  return isMaintenanceEnabled ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span className="text-xs font-medium text-amber-700">manutenção</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">Online</span>
                    </>
                  );
                })()}
              </div>
              
              {/* Actions */}
              <Link to="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-xs hover:bg-gray-100"
                >
                  <Home className="w-3 h-3 mr-1.5" />
                  <span className="hidden sm:inline">Site</span>
                </Button>
              </Link>
              
              <Button 
                onClick={logout} 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-3 h-3 mr-1.5" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-8 pb-16 sm:pb-20">
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-6"
          >
            <div className="bg-gradient-to-br from-amber-50/60 via-yellow-50/70 to-orange-50/60 backdrop-blur-md border border-amber-200/50 rounded-[24px] p-8 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.005]">
              {/* Multi-layered background decorations */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 via-transparent to-amber-100/30 rounded-[24px]"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-orange-200/15 to-yellow-200/15 rounded-full blur-xl"></div>
              
              <button
                onClick={handleCloseWelcomeBanner}
                className="absolute top-5 right-5 text-amber-600/70 hover:text-amber-700 transition-all duration-300 bg-white/90 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-amber-200/30 hover:shadow-lg hover:scale-110 z-20 backdrop-blur-sm hover:rotate-90"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="pr-14 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 text-lg sm:text-xl tracking-wide bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-600 bg-clip-text text-transparent">
                      Bem vinda, Adrielle.
                    </h3>
                    <div className="w-16 h-[2px] bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mt-1 opacity-70"></div>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-amber-800/95 leading-relaxed font-light max-w-2xl mb-1">
                  Seu <span className="font-medium text-amber-700 bg-yellow-100/50 px-1 rounded">espaço criativo</span> para personalizar cada detalhe. 
                </p>
                <p className="text-sm sm:text-base text-amber-800/90 leading-relaxed font-light max-w-2xl">
                  <span className="text-amber-700 font-medium bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Textos, cores, imagens</span> e configurações em <span className="italic text-amber-700">tempo real</span>.
                </p>
                

              </div>
            </div>
          </motion.div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              {/* Ultra-Modern Navigation Header */}
              <div className="relative">

                
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="group relative w-full overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 sm:p-7 md:p-8 min-h-[100px] sm:min-h-[120px] shadow-xl hover:shadow-2xl transition-all duration-500 ease-out">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    
                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-slate-300/8 via-gray-400/8 to-slate-500/8 opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
                    
                    <SelectValue placeholder="Selecione uma seção para configurar">
                      <div className="relative z-10 flex items-center gap-4 w-full">
                        {/* Modern icon container */}
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-gray-100 dark:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors duration-300 border border-gray-200/60">
                            {/* Inner glow */}
                            <div className="absolute inset-1 bg-gradient-to-br from-white/40 to-white/10 rounded-xl" />
                            
                            {/* Icon */}
                            <div className="relative z-10">
                              {activeTab === "header" && <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "general" && <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "hero" && <Home className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "about" && <Users className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "gallery" && <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "specialties" && <Target className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "inspirational" && <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "testimonials" && <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "services" && <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "faq" && <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "contact-schedule" && <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "footer" && <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "visibility" && <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "marketing" && <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "appearance" && <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "instructions" && <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "developer-contact" && <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                              {activeTab === "articles" && <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" />}
                            </div>
                          </div>
                        </div>
                        
                        {/* Content area */}
                        <div className="flex-1 min-w-0 text-left space-y-1 sm:space-y-2">
                          {/* Title with gradient */}
                          <div className="font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight break-words">
                            {activeTab === "header" && "Cabeçalho"}
                            {activeTab === "general" && "Informações básicas"}
                            {activeTab === "hero" && "Página inicial"}
                            {activeTab === "about" && "Sobre mim"}
                            {activeTab === "gallery" && "Galeria de fotos"}
                            {activeTab === "specialties" && "Especialidades"}
                            {activeTab === "inspirational" && "Citação inspiracional"}
                            {activeTab === "testimonials" && "Depoimentos"}
                            {activeTab === "services" && "Serviços"}
                            {activeTab === "faq" && "Perguntas frequentes"}
                            {activeTab === "contact-schedule" && "Contato e horários"}
                            {activeTab === "footer" && "Rodapé e políticas"}
                            {activeTab === "visibility" && "Visibilidade das seções"}
                            {activeTab === "marketing" && "Marketing digital"}
                            {activeTab === "appearance" && "Aparência e cores"}
                            {activeTab === "instructions" && "Instruções internas"}
                            {activeTab === "developer-contact" && "Suporte técnico"}
                            {activeTab === "articles" && "Artigos científicos"}
                          </div>
                          
                          {/* Description */}
                          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-snug break-words opacity-90">
                            {activeTab === "header" && "Configure nome profissional, CFP, títulos e menu de navegação"}
                            {activeTab === "general" && "Configure ícone do site, navegação e cookies"}
                            {activeTab === "hero" && "Personalize a primeira impressão do seu site"}
                            {activeTab === "about" && "Apresente-se profissionalmente aos visitantes"}
                            {activeTab === "gallery" && "Mostre seu consultório através de fotos"}
                            {activeTab === "specialties" && "Destaque suas áreas de atuação"}
                            {activeTab === "inspirational" && "Inspire com uma citação motivacional"}
                            {activeTab === "testimonials" && "Compartilhe experiências dos seus pacientes"}
                            {activeTab === "services" && "Descreva os tipos de atendimento oferecidos"}
                            {activeTab === "faq" && "Esclareça dúvidas comuns dos visitantes"}
                            {activeTab === "contact-schedule" && "Configure formas de contato e disponibilidade"}
                            {activeTab === "footer" && "Gerencie rodapé, políticas e links importantes"}
                            {activeTab === "visibility" && "Controle quais seções aparecem no site"}
                            {activeTab === "marketing" && "Configure análises e pixels de rastreamento"}
                            {activeTab === "appearance" && "Personalize cores e visual do site"}
                            {activeTab === "instructions" && "Documentação e configurações da equipe"}
                            {activeTab === "developer-contact" && "Reporte problemas ou solicite melhorias"}
                            {activeTab === "articles" && "Gerencie artigos científicos e publicações"}
                          </div>
                        </div>

                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  
                  <SelectContent className="bg-white/95 backdrop-blur-md border-gray-200 rounded-2xl shadow-xl">
                      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                        {/* Essencial */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Essencial</span>
                          </div>
                          <div className="space-y-2">
                            <SelectItem value="articles" className="rounded-xl hover:bg-purple-50 transition-colors duration-200 border-2 border-purple-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                  <FileText className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Artigos</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Artigos científicos e publicações</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="header" className="rounded-xl hover:bg-purple-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                  <Globe className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Cabeçalho</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Nome, CFP e títulos</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="general" className="rounded-xl hover:bg-purple-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                  <Settings className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Informações básicas</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Ícone do site, navegação e cookies</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="hero" className="rounded-xl hover:bg-purple-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                  <Home className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Página inicial</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Primeira impressão do site</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="about" className="rounded-xl hover:bg-purple-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                  <Users className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Sobre mim</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Apresentação profissional</div>
                                </div>
                              </div>
                            </SelectItem>
                          </div>
                        </div>

                        {/* Conteúdo Visual */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Conteúdo Visual</span>
                          </div>
                          <div className="space-y-2">
                            <SelectItem value="gallery" className="rounded-xl hover:bg-blue-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <Camera className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Galeria de fotos</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Fotos do consultório</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="specialties" className="rounded-xl hover:bg-blue-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <Target className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Especialidades</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Áreas de atuação</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="inspirational" className="rounded-xl hover:bg-blue-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <Heart className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Citação inspiracional</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Citação motivacional</div>
                                </div>
                              </div>
                            </SelectItem>
                          </div>
                        </div>

                        {/* Interação e Conteúdo */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Interação</span>
                          </div>
                          <div className="space-y-2">
                            <SelectItem value="testimonials" className="rounded-xl hover:bg-green-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                  <MessageSquare className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Depoimentos</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Experiências dos pacientes</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="services" className="rounded-xl hover:bg-green-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                  <Briefcase className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Serviços</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Tipos de atendimento</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="faq" className="rounded-xl hover:bg-green-50 transition-colors duration-200 !items-start">
                              <div className="flex items-center gap-3 py-1 w-full">
                                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                  <HelpCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-left text-sm sm:text-base break-words">Perguntas frequentes</div>
                                  <div className="text-xs text-gray-500 text-left leading-tight break-words">Esclareça dúvidas comuns</div>
                                </div>
                              </div>
                            </SelectItem>
                          </div>
                        </div>

                        {/* Contato e Comunicação */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Contato</span>
                          </div>
                          <div className="space-y-2">
                            <SelectItem value="contact-schedule" className="rounded-xl hover:bg-emerald-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Contato e horários</div>
                                  <div className="text-xs text-gray-500 text-left">Formas de contato</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="footer" className="rounded-xl hover:bg-emerald-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                  <MapPin className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Rodapé e Políticas</div>
                                  <div className="text-xs text-gray-500 text-left">Footer e políticas legais</div>
                                </div>
                              </div>
                            </SelectItem>
                          </div>
                        </div>

                        {/* Configurações Avançadas */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Avançado</span>
                          </div>
                          <div className="space-y-2">
                            <SelectItem value="visibility" className="rounded-xl hover:bg-amber-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <Eye className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Visibilidade</div>
                                  <div className="text-xs text-gray-500 text-left">Mostrar/ocultar seções</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="marketing" className="rounded-xl hover:bg-amber-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Marketing digital</div>
                                  <div className="text-xs text-gray-500 text-left">Analytics e pixels</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="appearance" className="rounded-xl hover:bg-amber-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <Palette className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Aparência</div>
                                  <div className="text-xs text-gray-500 text-left">Cores e visual</div>
                                </div>
                              </div>
                            </SelectItem>
                          </div>
                        </div>

                        {/* Administração */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Administração</span>
                          </div>
                          <div className="space-y-2">
                            <SelectItem value="instructions" className="rounded-xl hover:bg-gray-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <BookOpen className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Instruções internas</div>
                                  <div className="text-xs text-gray-500 text-left">Documentação da equipe</div>
                                </div>
                              </div>
                            </SelectItem>

                            <SelectItem value="developer-contact" className="rounded-xl hover:bg-gray-50 transition-colors duration-200">
                              <div className="flex items-center gap-3 py-1">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <MessageSquare className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">Suporte técnico</div>
                                  <div className="text-xs text-gray-500 text-left">Reporte problemas</div>
                                </div>
                              </div>
                            </SelectItem>
                          </div>
                        </div>
                      </div>
                    </SelectContent>
                  </Select>
              </div>

              {/* Header Tab - New */}
              <TabsContent value="header" className="space-y-8">
                {showTips && (
                  <AdminTip
                    title="Configure seu cabeçalho"
                    content="Defina as informações principais que aparecem no topo do site: nome profissional, CFP, títulos e menu de navegação. Essas informações são essenciais para a credibilidade profissional."
                    icon={Globe}
                    gradient={TIP_GRADIENTS.header}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <div className="grid gap-8">
                  {/* Informações Profissionais - Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-sm">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Informações profissionais</h3>
                            <p className="text-gray-600 text-sm mt-1">Configure nome, CFP, títulos e descrição profissional</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs font-medium text-purple-700">Essencial</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-6">
                        <HeaderInfoForm configs={siteConfigs} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Menu de Navegação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-sm">
                            <Compass className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Menu de navegação</h3>
                            <p className="text-gray-600 text-sm mt-1">Personalize os nomes dos botões do menu principal</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-xs font-medium text-orange-700">Personalização</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-6">
                        <NavigationForm configs={siteConfigs} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>

              {/* General Tab - Redesigned */}
              <TabsContent value="general" className="space-y-8">
                {showTips && (
                  <AdminTip
                    title="Dicas para usar o painel"
                    content="Todos os campos de texto podem ser redimensionados! Arraste o canto inferior direito dos campos para expandi-los. Suas alterações são salvas automaticamente ao clicar em 'Salvar'."
                    icon={Sparkles}
                    gradient={TIP_GRADIENTS.general}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <div className="space-y-4 sm:space-y-8">
                  {/* 1. Ícone do Site / Favicon - Primeira posição */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full max-w-full overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-4 sm:p-8">
                      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Ícone do site</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Configure o favicon e informações básicas do site</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-medium text-blue-700">Essencial</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <BasicInfoForm configs={siteConfigs} />
                      </div>
                    </div>
                  </motion.div>

                  {/* 2. Controle de Badges - Segunda posição */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-full overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-4 sm:p-8">
                      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0">
                            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Controle de badges</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Configure a exibição de subtítulos nas seções para um design minimalista</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full flex-shrink-0">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-xs font-medium text-indigo-700">Visual</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <BadgeVisibilitySettings configs={siteConfigs} />
                      </div>
                    </div>
                  </motion.div>

                  {/* 3. Modo de manutenção - Terceira posição */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-full overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-4 sm:p-8">
                      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Modo de manutenção</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Ative uma página especial enquanto trabalha no site</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full flex-shrink-0">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs font-medium text-yellow-700">Sistema</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <MaintenanceForm configs={siteConfigs} />
                      </div>
                    </div>
                  </motion.div>

                  {/* 3. Configurações de Cookies - Última posição */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-full overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-4 sm:p-8">
                      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0">
                            <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Configurações de cookies</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Configure o pop-up de consentimento LGPD e mensagens de privacidade</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full flex-shrink-0">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-xs font-medium text-amber-700">Legal</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <CookieSettingsForm />
                      </div>
                    </div>
                  </motion.div>

                  {/* 5. Informações sobre Cookies - Design profissional e neutro */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-4 sm:p-6 lg:p-8">
                      {/* Header limpo e profissional */}
                      <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8">
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-2 sm:p-2.5 bg-gray-100 rounded-lg flex-shrink-0">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                              Cookies & Privacidade
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 break-words">
                              Conformidade LGPD e melhores práticas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 rounded-md flex-shrink-0">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">Legal</span>
                        </div>
                      </div>

                      {/* Seção LGPD neutra */}
                      <div className="p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-lg mb-6 sm:mb-8">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-1.5 bg-gray-200 rounded-md flex-shrink-0">
                            <Shield className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
                              Lei Geral de Proteção de Dados (LGPD)
                            </h4>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                              A Lei 13.709/2018 estabelece diretrizes para tratamento de dados pessoais. 
                              O consentimento explícito para cookies é obrigatório, com penalidades de até 2% do faturamento anual.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Grid de informações clean */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Funcionalidades */}
                        <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 bg-gray-100 rounded-md">
                              <div className="w-4 h-4 flex items-center justify-center text-gray-600 text-xs font-medium">
                                ⚙️
                              </div>
                            </div>
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">Funcionalidades</h5>
                          </div>
                          <ul className="space-y-2.5">
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Análise de comportamento e métricas</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Personalização de experiência</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Persistência de configurações</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Gerenciamento de sessões</span>
                            </li>
                          </ul>
                        </div>

                        {/* Compliance */}
                        <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 bg-gray-100 rounded-md">
                              <div className="w-4 h-4 flex items-center justify-center text-gray-600 text-xs font-medium">
                                📋
                              </div>
                            </div>
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">Compliance</h5>
                          </div>
                          <ul className="space-y-2.5">
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Documentação de consentimento</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Transparência no processamento</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Direito de revogação</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Proteção contra multas</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Configuração - design clean */}
                      <div className="p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-1.5 bg-white border border-gray-200 rounded-md flex-shrink-0">
                            <FileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
                              Configuração recomendada
                            </h4>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                              Configure os cookies na seção <span className="font-medium">"Configurações de Cookies"</span> acima 
                              para garantir conformidade legal e otimizar a experiência dos usuários.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </TabsContent>

              {/* Hero Tab - Redesigned */}
              <TabsContent value="hero" className="space-y-8">
                {showTips && (
                  <AdminTip
                    title="Seção principal do site"
                    content="Esta é a primeira impressão dos visitantes! Configure textos impactantes e uma imagem de fundo que transmita profissionalismo e confiança."
                    icon={Home}
                    gradient={TIP_GRADIENTS.hero}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <div className="grid gap-8">
                  {/* Seção Hero - Redesigned */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-sm">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Textos da seção principal</h3>
                            <p className="text-gray-600 text-sm mt-1">Configure títulos, subtítulos e chamadas para ação impactantes</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs font-medium text-emerald-700">Primeira Impressão</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-2xl p-6">
                        <HeroSectionForm configs={siteConfigs} />
                      </div>
                    </div>
                  </motion.div>


                </div>
              </TabsContent>

              {/* About Tab - Simplified and Centered Layout */}
              <TabsContent value="about" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Sua apresentação profissional"
                    content="Configure sua apresentação profissional, credenciais e qualificações. Esta seção constrói confiança ao mostrar sua expertise e personalidade única."
                    icon={Users}
                    gradient={TIP_GRADIENTS.about}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <div className="grid gap-6">
                  {/* Textos de apresentação */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                          <Edit className="w-4 h-4 text-white" />
                        </div>
                        Textos de apresentação
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure títulos, subtítulos e descrição profissional para a seção sobre
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AboutSectionTextsForm configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Credenciais profissionais */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        Credenciais profissionais
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Adicione qualificações, especializações e conquistas acadêmicas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AboutCredentialsManager configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Ícone do Badge da Seção Sobre - Sempre por último */}
                  <div className="w-full max-w-full">
                    <BadgeIconSelector 
                      sectionKey="about" 
                      sectionName="Sobre" 
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Galeria de fotos"
                    content="Gerencie sua galeria de fotos do consultório. Adicione, edite e organize imagens para mostrar o ambiente acolhedor aos visitantes."
                    icon={Camera}
                    gradient={TIP_GRADIENTS.gallery}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                {/* Configurações de Texto da Galeria */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da seção galeria
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da galeria de fotos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoCarouselTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Fotos */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar fotos do carrossel
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Adicione, edite e organize as fotos do consultório. O carrossel avança automaticamente a cada 6 segundos.
                      Arraste e solte para reordenar as fotos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoCarouselManager photoCarousel={photoCarousel} />
                  </CardContent>
                </ResponsiveCard>

                {/* Ícone do Badge da Seção Galeria - Sempre por último */}
                <div className="w-full max-w-full">
                  <BadgeIconSelector 
                    sectionKey="gallery" 
                    sectionName="Galeria" 
                  />
                </div>
              </TabsContent>

              {/* Specialties Tab */}
              <TabsContent value="specialties" className="space-y-4 sm:space-y-6">
                <div className="w-full max-w-full admin-panel space-y-4 sm:space-y-6">
                  {showTips && (
                    <AdminTip
                      title="Configure suas especialidades"
                      content="Configure os serviços psicológicos que você oferece. Organize suas áreas de atuação para que os clientes encontrem facilmente o que precisam."
                      icon={Target}
                      gradient={TIP_GRADIENTS.specialties}
                      onClose={() => setShowTips(false)}
                      delay={0}
                    />
                  )}
                  

                  
                  {/* Textos da Seção de Especialidades */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full max-w-full admin-mobile-container specialties-admin-container bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4 sm:p-8 w-full max-w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-sm flex-shrink-0">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Configurar seção</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Personalize os textos da seção de especialidades na página principal</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full max-w-full overflow-hidden">
                        <SpecialtiesSectionTextsForm configs={siteConfigs || []} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Gerenciador de Especialidades */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.125 }}
                    className="w-full max-w-full admin-mobile-container specialties-admin-container bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4 sm:p-8 w-full max-w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-sm flex-shrink-0">
                            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Gerenciar especialidades</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Adicione, edite e organize suas áreas de atuação profissional</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full max-w-full overflow-hidden">
                        <SpecialtiesManager specialties={specialties} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Ícone do Badge da Seção Especialidades - Sempre por último */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="w-full max-w-full"
                  >
                    <BadgeIconSelector 
                      sectionKey="specialties" 
                      sectionName="Especialidades" 
                    />
                  </motion.div>
                </div>
              </TabsContent>

              {/* Inspirational Tab */}
              <TabsContent value="inspirational" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Citação inspiracional"
                    content="Configure uma citação motivacional e inspiradora que conecta com seus clientes. Use uma frase que reflita sua abordagem terapêutica."
                    icon={Heart}
                    gradient={TIP_GRADIENTS.inspirational}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}


                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      Citação Inspiracional
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure a frase motivacional que aparece na seção inspiracional do seu site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InspirationalSectionForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Ícone do Badge da Seção Inspiracional - Sempre por último */}
                <div className="w-full max-w-full">
                  <BadgeIconSelector 
                    sectionKey="inspirational" 
                    sectionName="Inspiracional" 
                  />
                </div>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Depoimentos de clientes"
                    content="Configure depoimentos autênticos de seus pacientes. Use avatares diversos e reorganize por arrastar e soltar. Depoimentos geram confiança e credibilidade."
                    icon={MessageSquare}
                    gradient={TIP_GRADIENTS.testimonials}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}


                {/* Configurações de Texto da Seção Depoimentos */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da seção depoimentos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção de depoimentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestimonialsSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Depoimentos */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar depoimentos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Aqui você adiciona, edita ou remove depoimentos dos seus pacientes. 
                      Use avatares variados para representar diferentes perfis de clientes. 
                      Arraste e solte para reordenar a sequência de exibição no site.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestimonialsManager testimonials={testimonials} />
                  </CardContent>
                </ResponsiveCard>

                {/* Ícone do Badge da Seção Depoimentos - Sempre por último */}
                <div className="w-full max-w-full">
                  <BadgeIconSelector 
                    sectionKey="testimonials" 
                    sectionName="Depoimentos" 
                  />
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Serviços psicológicos"
                    content="Configure os serviços que você oferece: título, descrição, ícones profissionais e preços. Organize suas áreas de atuação com mais de 40 ícones disponíveis."
                    icon={Briefcase}
                    gradient={TIP_GRADIENTS.services}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}


                {/* Configurações de Texto da Seção Serviços */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da seção serviços
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção de serviços
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ServicesSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Serviços */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar serviços
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os serviços que você oferece: título, descrição, ícone e preços. 
                      Escolha entre 40+ ícones profissionais organizados por categorias.
                      Ative/desative serviços e reordene usando arrastar e soltar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ServicesManager services={services} />
                  </CardContent>
                </ResponsiveCard>

                {/* Ícone do Badge da Seção Serviços - Sempre por último */}
                <div className="w-full max-w-full">
                  <BadgeIconSelector 
                    sectionKey="services" 
                    sectionName="Serviços" 
                  />
                </div>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Perguntas frequentes"
                    content="Crie perguntas e respostas sobre seus serviços. Esclareça dúvidas comuns dos pacientes e organize por ordem de importância através de arrastar e soltar."
                    icon={HelpCircle}
                    gradient={TIP_GRADIENTS.faq}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}


                {/* Configurações de Texto da Seção FAQ */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da seção FAQ
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção de FAQ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FaqSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de FAQ */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar FAQ
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Crie perguntas e respostas frequentes sobre seus serviços. 
                      Ajude seus futuros pacientes esclarecendo dúvidas comuns. 
                      Organize as perguntas arrastando para reordenar por importância.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FaqManager faqItems={faqItems} />
                  </CardContent>
                </ResponsiveCard>

                {/* Ícone do Badge da Seção FAQ - Sempre por último */}
                <div className="w-full max-w-full">
                  <BadgeIconSelector 
                    sectionKey="faq" 
                    sectionName="FAQ" 
                  />
                </div>
              </TabsContent>

              {/* Visibility Tab */}
              <TabsContent value="visibility" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Controle de visibilidade"
                    content="Controle quais seções aparecem no site. Desative temporariamente seções durante atualizações ou quando não quiser exibi-las aos visitantes."
                    icon={Eye}
                    gradient={TIP_GRADIENTS.visibility}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <SectionVisibilitySettings configs={siteConfigs} />
              </TabsContent>

              {/* Marketing Tab */}
              <TabsContent value="marketing" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Marketing digital"
                    content="Configure pixels de rastreamento e códigos do Google Analytics. Acompanhe visitas, analise comportamento dos usuários e otimize campanhas publicitárias."
                    icon={TrendingUp}
                    gradient={TIP_GRADIENTS.marketing}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Configurações de marketing
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure códigos de acompanhamento para medir visitas e resultados. 
                      Google Analytics mostra estatísticas detalhadas. Facebook Pixel permite criar anúncios direcionados. 
                      Cole os códigos fornecidos por essas plataformas aqui.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MarketingSettings configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Instructions Tab */}
              <TabsContent value="instructions" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Instruções internas"
                    content="Gerencie documentação da equipe, senhas de acesso, configurações especiais e orientações internas. Área exclusiva para informações administrativas."
                    icon={BookOpen}
                    gradient={TIP_GRADIENTS.instructions}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      Instruções internas
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Documentação interna, senhas e configurações para a equipe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InstructionsManager configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Contact Schedule Tab */}
              <TabsContent value="contact-schedule" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Informações de contato"
                    content="Configure botões de contato, horários e localização. Personalize para atendimento online (desative localização) ou presencial (mantenha tudo ativo)."
                    icon={MessageCircle}
                    gradient={TIP_GRADIENTS.contact}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                {/* Configurações do Card de Agendamento */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Card de agendamento
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos do card "Vamos conversar?" que aparece na seção de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ContactSectionForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Contato */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar botões e horários
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure botões de contato, horários de funcionamento e localização. 
                      Personalize botões de contato, reordene por prioridade e defina links personalizados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactScheduleManager contactSettings={contactSettings} />
                  </CardContent>
                </ResponsiveCard>

                {/* Ícone do Badge da Seção Contato - Sempre por último */}
                <div className="w-full max-w-full">
                  <BadgeIconSelector 
                    sectionKey="contact" 
                    sectionName="Contato" 
                  />
                </div>
              </TabsContent>

              {/* Footer Tab */}
              <TabsContent value="footer" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="🦶 Rodapé e políticas"
                    content="Configure o rodapé do site, badges de certificação, política de privacidade e termos de uso. Essenciais para credibilidade e conformidade legal."
                    icon={MapPin}
                    gradient={TIP_GRADIENTS.footer}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar rodapé
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure todos os elementos do rodapé: textos, botões de contato, certificações, 
                      selos de confiança, informações de copyright e CNPJ. Personalize cores, ícones e ordenação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FooterManager footerSettings={footerSettings} />
                  </CardContent>
                </ResponsiveCard>



                <PrivacyPolicyManager />
                <TermsOfUseManager />
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                {showTips && (
                  <AdminTip
                    title="Aparência e cores"
                    content="Personalize as cores do site, gradientes das seções, cores globais do sistema e gradientes dos badges. Crie uma identidade visual única."
                    icon={Palette}
                    gradient={TIP_GRADIENTS.appearance}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <div className="grid gap-6">
                  {/* Personalizar Cores por Seção - PRIORITÁRIO */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                          <Palette className="w-4 h-4 text-white" />
                        </div>
                        Personalizar cores por seção
                      </CardTitle>
                    <CardDescription className="text-sm">
                        Configure cores individuais para cada seção do site: fundo, gradientes e sobreposições.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ModernSectionColorManager configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Cores Globais do Sistema - Simplificado */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                          <Palette className="w-4 h-4 text-white" />
                        </div>
                        Cores globais do sistema
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure as cores principais que afetam botões, links e elementos interativos em todo o site.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AppearanceSettings configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Gradientes dos Badges */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Gradientes dos Badges
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure o gradiente aplicado em todas as palavras entre parênteses nos títulos das seções.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BadgeGradientManager configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>
                </div>
              </TabsContent>

              {/* Articles Tab */}
              <TabsContent value="articles" className="space-y-8">
                {showTips && (
                  <AdminTip
                    title="Gerencie seus artigos científicos"
                    content="Crie, edite e publique artigos científicos com informações de autor, referências, DOI e botões dinâmicos. Configure também os textos da seção de artigos na página principal."
                    icon={GraduationCap}
                    gradient={TIP_GRADIENTS.articles}
                    onClose={() => setShowTips(false)}
                    delay={0}
                  />
                )}

                <div className="grid gap-8">
                  {/* Textos da Seção de Artigos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full max-w-full admin-mobile-container articles-admin-container bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4 sm:p-8 w-full max-w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-sm flex-shrink-0">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Configurar seção</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Personalize os textos da seção de artigos na página principal</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full max-w-full overflow-hidden">
                        <ArticlesSectionTextsForm />
                      </div>
                    </div>
                  </motion.div>

                  {/* Gerenciador de Artigos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="w-full max-w-full admin-mobile-container articles-admin-container bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4 sm:p-8 w-full max-w-full">
                      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">Gerenciar artigos</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">Crie, edite e publique artigos científicos</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full flex-shrink-0">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs font-medium text-purple-700">Conteúdo</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <ArticlesManager />
                      </div>
                    </div>
                  </motion.div>

                  {/* Ícone do Badge da Seção Artigos - Sempre por último */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-full"
                  >
                    <BadgeIconSelector 
                      sectionKey="articles" 
                      sectionName="Artigos" 
                    />
                  </motion.div>
                </div>
              </TabsContent>

              {/* Developer Contact Tab */}
              <TabsContent value="developer-contact" className="space-y-6">
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-600 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      Contato desenvolvedor
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Reporte um problema, sugira melhorias ou entre em contato com o desenvolvedor.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DeveloperContactForm />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>
            </Tabs>
          </motion.div>

          <DragOverlay>
            {activeDragId ? (
              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 transform rotate-2">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Movendo item...</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="text-center text-xs text-gray-400">
            Made with <span className="text-yellow-500">♥</span> by <span className="font-mono">∞</span>
          </div>
        </div>
      </div>
    </div>
  );
}
