/**
 * ResponsiveFormFields.tsx
 * 
 * Componentes de formulário responsivos padrão
 * Layout inteligente que se adapta ao mobile sem sair da tela
 */

import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ResponsiveGrid({ children, cols = 2, className = "" }: ResponsiveGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`
      grid ${colsClass[cols]} gap-3 sm:gap-4 w-full
      ${className}
    `}>
      {children}
    </div>
  );
}

interface ResponsiveButtonGroupProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function ResponsiveButtonGroup({ 
  children, 
  className = "", 
  align = 'left' 
}: ResponsiveButtonGroupProps) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`
      flex flex-col sm:flex-row gap-2 sm:gap-3 w-full
      ${alignClass[align]}
      ${className}
    `}>
      {children}
    </div>
  );
}

interface ResponsiveFieldsetProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ResponsiveFieldset({ 
  title, 
  description, 
  children, 
  className = "" 
}: ResponsiveFieldsetProps) {
  return (
    <fieldset className={`
      w-full border border-gray-200 rounded-lg p-3 sm:p-4
      ${className}
    `}>
      <legend className="px-2 text-sm font-medium text-gray-900">
        {title}
      </legend>
      {description && (
        <p className="text-xs text-gray-600 mb-3">
          {description}
        </p>
      )}
      <div className="w-full space-y-3">
        {children}
      </div>
    </fieldset>
  );
}