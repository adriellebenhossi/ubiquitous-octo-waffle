/**
 * SectionIconSelector.tsx
 * 
 * Componente para seleção de ícones por seção no painel administrativo
 * Interface intuitiva com categorização e preview visual
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label'; // Removido - não usado
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Comentado temporariamente
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SECTION_ICONS, getIconByName, DEFAULT_SECTION_ICONS } from '@/utils/sectionIcons';
import { Search, ChevronDown } from 'lucide-react';

interface SectionIconSelectorProps {
  sectionKey: string;
  sectionName: string;
  currentIcon?: string;
}

export function SectionIconSelector({ 
  sectionKey, 
  sectionName, 
  currentIcon 
}: SectionIconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  // Buscar configuração atual do ícone
  const { data: configs } = useQuery({
    queryKey: ["/api/config"],
    staleTime: 0, // Permitir atualizações em tempo real
    gcTime: Infinity,
    refetchOnMount: true, // Permitir refetch para pegar atualizações
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const iconConfigKey = `${sectionKey}_icon`;
  const currentIconValue = Array.isArray(configs) 
    ? configs.find((c: any) => c.key === iconConfigKey)?.value?.replace(/"/g, '') 
    : currentIcon || DEFAULT_SECTION_ICONS[sectionKey as keyof typeof DEFAULT_SECTION_ICONS];

  // Mutação para salvar ícone
  const saveIconMutation = useMutation({
    mutationFn: async (iconName: string) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: iconConfigKey,
        value: iconName
      });
      return response;
    },
    onSuccess: (newConfig) => {
      // Atualizar o cache local
      queryClient.setQueryData(["/api/config"], (old: any[] = []) => {
        const filtered = old.filter(config => config.key !== iconConfigKey);
        return [...filtered, newConfig];
      });
      
      // Invalidar todas as queries que dependem da configuração para forçar re-render
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      
      toast({
        title: "Ícone atualizado!",
        description: `Ícone da seção ${sectionName} foi alterado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar ícone:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o ícone.",
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

  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Card Principal - Design Moderno e Minimalista */}
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Container Principal com Espaçamento Adequado */}
        <div className="p-8 space-y-6">
          
          {/* Header Horizontal - Layout Flexível */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Lado Esquerdo: Ícone + Info */}
            <div className="flex items-center gap-5">
              {/* Display do Ícone Atual */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center group hover:from-gray-100 hover:to-gray-150 transition-all duration-300">
                  {CurrentIcon ? (
                    <CurrentIcon className="w-8 h-8 text-gray-700 group-hover:text-gray-900 transition-colors duration-300" />
                  ) : (
                    <Search className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Informações da Seção */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{sectionName}</h3>
                <p className="text-gray-500 text-sm">Escolha um ícone para esta seção</p>
              </div>
            </div>

            {/* Lado Direito: Preview + Botão */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Preview Atual - Só no Desktop */}
              <div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                {CurrentIcon && <CurrentIcon className="w-5 h-5 text-gray-600" />}
                <span className="text-sm font-medium text-gray-700">Atual</span>
              </div>
              
              {/* Botão Principal */}
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                disabled={saveIconMutation.isPending}
                data-testid="button-toggle-icon-selector"
              >
                <span>{showSelector ? 'Fechar' : 'Alterar ícone'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${showSelector ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Painel Expansível com Modal Original */}
          {showSelector && (
            <div className="border-t border-gray-200 pt-6 animate-in slide-in-from-top-2 duration-200">
              
              {/* Controles de Filtro */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Busca */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar ícones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all duration-200 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                {/* Contador */}
                <div className="flex items-center justify-between lg:justify-end">
                  <span className="text-sm text-gray-500">
                    {getFilteredIcons().length} ícones
                  </span>
                  {saveIconMutation.isPending && (
                    <span className="text-sm text-blue-600">Salvando...</span>
                  )}
                </div>
              </div>

              {/* Categorias Horizontais */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category.key;
                    return (
                      <button
                        key={category.key}
                        onClick={() => setSelectedCategory(category.key)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                          isSelected
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grade de Ícones Responsiva */}
              <div className="max-h-64 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2">
                  {getFilteredIcons().map(({ name, component: IconComponent, category }, index) => {
                    const isSelected = currentIconValue === name;
                    return (
                      <button
                        key={`${category}-${name}-${index}`}
                        onClick={() => {
                          saveIconMutation.mutate(name);
                          setShowSelector(false);
                        }}
                        className={`group relative aspect-square flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 ${
                          isSelected 
                            ? 'bg-gray-900 text-white ring-2 ring-gray-300' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={name.replace(/([A-Z])/g, ' $1').trim()}
                        disabled={saveIconMutation.isPending}
                      >
                        <IconComponent className="h-4 w-4 transition-transform group-hover:scale-110" />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {getFilteredIcons().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum ícone encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}