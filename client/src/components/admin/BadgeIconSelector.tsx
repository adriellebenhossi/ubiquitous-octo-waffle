/**
 * BadgeIconSelector.tsx
 * 
 * Componente moderno e minimalista para seleção de ícones de badge
 * Design elegante com preview em tempo real
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SECTION_ICONS, getIconByName } from '@/utils/sectionIcons';
import { Search, Sparkles, ChevronDown, Palette } from 'lucide-react';

interface BadgeIconSelectorProps {
  sectionKey: string;
  sectionName: string;
}

export function BadgeIconSelector({ 
  sectionKey, 
  sectionName 
}: BadgeIconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSelector, setShowSelector] = useState(false);
  const [optimisticIcon, setOptimisticIcon] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Buscar configuração atual do ícone do badge
  const { data: configs } = useQuery({
    queryKey: ["/api/config"],
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const iconConfigKey = `${sectionKey}_badge_icon`;
  const serverIconValue = Array.isArray(configs) 
    ? configs.find((c: any) => c.key === iconConfigKey)?.value?.replace(/"/g, '') 
    : 'Sparkles';

  // Usar estado otimista ou valor do servidor
  const currentIconValue = optimisticIcon || serverIconValue;

  // Resetar estado otimista quando dados do servidor mudarem
  useEffect(() => {
    if (serverIconValue && optimisticIcon && serverIconValue === optimisticIcon) {
      // Delay para garantir que a interface tenha tempo de atualizar
      const timer = setTimeout(() => {
        setOptimisticIcon(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [serverIconValue, optimisticIcon]);

  // Mutação para salvar ícone do badge
  const saveIconMutation = useMutation({
    mutationFn: async (iconName: string) => {
      // Atualização otimista imediata
      setOptimisticIcon(iconName);
      
      const response = await apiRequest("POST", "/api/admin/config", {
        key: iconConfigKey,
        value: iconName
      });
      return response;
    },
    onSuccess: (newConfig) => {
      // Atualizar cache de forma precisa
      queryClient.setQueryData(["/api/config"], (old: any[] = []) => {
        const filtered = old.filter(config => config.key !== iconConfigKey);
        return [...filtered, newConfig];
      });
      
      // Atualizar também o cache do admin para garantir consistência
      queryClient.setQueryData(["/api/admin/config"], (old: any[] = []) => {
        if (!old) return [newConfig];
        const filtered = old.filter(config => config.key !== iconConfigKey);
        return [...filtered, newConfig];
      });
      
      // Não limpar estado otimista imediatamente - deixar o useEffect fazer isso
      
      toast({
        title: "Ícone do badge atualizado!",
        description: `Ícone do badge da seção ${sectionName} foi alterado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar ícone do badge:', error);
      // Reverter estado otimista em caso de erro
      setOptimisticIcon(null);
      
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o ícone do badge.",
        variant: "destructive",
      });
    },
  });

  // Filtrar ícones
  const getFilteredIcons = () => {
    let iconsToShow: typeof SECTION_ICONS | Record<string, any> = SECTION_ICONS;
    
    if (selectedCategory !== 'all') {
      const categoryKey = selectedCategory as keyof typeof SECTION_ICONS;
      if (SECTION_ICONS[categoryKey]) {
        iconsToShow = { [selectedCategory]: SECTION_ICONS[categoryKey] };
      }
    }

    const filtered: Array<{ name: string; component: React.ComponentType<any>; category: string }> = [];
    
    Object.entries(iconsToShow).forEach(([categoryName, categoryIcons]) => {
      Object.entries(categoryIcons).forEach(([iconName, IconComponent]) => {
        if (iconName.toLowerCase().includes(searchTerm.toLowerCase())) {
          filtered.push({
            name: iconName,
            component: IconComponent as React.ComponentType<any>,
            category: categoryName
          });
        }
      });
    });

    return filtered;
  };

  const categories = [
    { key: 'all', name: 'Todos' },
    { key: 'communication', name: 'Comunicação' },
    { key: 'psychology', name: 'Psicologia' },
    { key: 'professional', name: 'Profissional' },
    { key: 'education', name: 'Educação' },
    { key: 'emotions', name: 'Emoções' },
    { key: 'health', name: 'Saúde' },
    { key: 'creative', name: 'Criativo' },
    { key: 'social', name: 'Social' },
    { key: 'objects', name: 'Objetos' }
  ];

  const CurrentIcon = getIconByName(currentIconValue);

  return (
    <div className="w-full">
      {/* Card Principal - Design Elegante */}
      <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        
        {/* Header Minimalista */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            
            {/* Lado Esquerdo: Ícone + Título */}
            <div className="flex items-center gap-4">
              {/* Preview do Ícone Atual */}
              <div className="relative">
                <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center group hover:bg-primary/20 transition-all duration-300">
                  {CurrentIcon ? (
                    <CurrentIcon className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-primary" />
                  )}
                </div>
              </div>
              
              {/* Informações */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ícone do Badge</h3>
                <p className="text-sm text-gray-600">{sectionName}</p>
              </div>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="group flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed btn-primary transform hover:scale-105"
              disabled={saveIconMutation.isPending}
              data-testid="button-toggle-badge-icon-selector"
            >
              <span className="text-sm">
                {showSelector ? 'Fechar' : 'Alterar'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${showSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Painel Expansível */}
        {showSelector && (
          <div className="p-6 bg-gray-50/30 animate-in slide-in-from-top-2 duration-300">
            
            {/* Controles */}
            <div className="space-y-4 mb-6">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ícones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:border-primary transition-all duration-300 placeholder:text-gray-400 shadow-sm"
                  data-testid="input-search-badge-icons"
                />
              </div>

              {/* Categorias */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.key;
                  return (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'text-white shadow-md btn-primary'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      data-testid={`filter-badge-category-${category.key}`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grade de Ícones */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-64 overflow-y-auto shadow-sm">
              {getFilteredIcons().length > 0 ? (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
                  {getFilteredIcons().map(({ name, component: IconComponent, category }, index) => {
                    const isSelected = currentIconValue === name;
                    return (
                      <button
                        key={`${category}-${name}-${index}`}
                        onClick={() => {
                          saveIconMutation.mutate(name);
                          setShowSelector(false);
                        }}
                        className={`group relative aspect-square flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                          isSelected 
                            ? 'text-white shadow-lg btn-primary' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200/60 hover:border-gray-300'
                        }`}
                        title={name.replace(/([A-Z])/g, ' $1').trim()}
                        disabled={saveIconMutation.isPending}
                        data-testid={`badge-icon-option-${name}`}
                      >
                        <IconComponent className="h-4 w-4 transition-all duration-300 group-hover:scale-125" />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium">Nenhum ícone encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">Tente ajustar sua busca</p>
                </div>
              )}
            </div>

            {/* Contador e Status */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <span>{getFilteredIcons().length} ícones disponíveis</span>
              {saveIconMutation.isPending && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-3 h-3 border border-gray-300 border-t-primary rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}