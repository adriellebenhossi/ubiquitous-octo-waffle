/**
 * ModernIconSelector.tsx
 * 
 * Componente moderno, minimalista e responsivo para seleção de ícones
 * Design limpo e intuitivo para uso em todos os formulários do painel admin
 */

import React, { useState } from 'react';
import { FormControl } from '@/components/ui/form';
import { ChevronDown, Search } from 'lucide-react';

interface IconOption {
  value: string;
  label: string;
  component: React.ComponentType<any>;
  category?: string;
}

interface ModernIconSelectorProps {
  options: IconOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ModernIconSelector({ 
  options, 
  value, 
  onValueChange, 
  placeholder = "Selecione um ícone",
  disabled = false,
  className = ""
}: ModernIconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOption = options.find(option => option.value === value);
  const SelectedIcon = selectedOption?.component;

  // Filtrar opções com base na busca
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por categoria se disponível
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, IconOption[]>);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <FormControl>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2 
            text-sm border border-gray-300 rounded-md bg-white
            hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4 text-gray-600" />
                <span className="text-gray-900">{selectedOption?.label}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </FormControl>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ícones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                Nenhum ícone encontrado
              </div>
            ) : (
              Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category}>
                  {Object.keys(groupedOptions).length > 1 && (
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                      {category}
                    </div>
                  )}
                  <div className="grid grid-cols-1">
                    {categoryOptions.map((option) => {
                      const IconComponent = option.component;
                      const isSelected = value === option.value;
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`
                            flex items-center gap-3 px-3 py-2 text-sm text-left
                            hover:bg-blue-50 hover:text-blue-700 transition-colors
                            ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                          `}
                        >
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{option.label}</span>
                          {isSelected && (
                            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}