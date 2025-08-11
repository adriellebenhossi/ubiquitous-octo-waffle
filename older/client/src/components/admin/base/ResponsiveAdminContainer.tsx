/**
 * ResponsiveAdminContainer.tsx
 * 
 * Container base responsivo para componentes administrativos
 * Garante que formulários e controles nunca saiam da tela
 * Layout otimizado para mobile com overflow controlado
 */

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ResponsiveAdminContainerProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ResponsiveAdminContainer({
  title,
  icon,
  description,
  children,
  className = ""
}: ResponsiveAdminContainerProps) {
  return (
    <div className={`w-full max-w-full mobile-admin-wrapper ${className}`}>
      <Card className="
        w-full max-w-full overflow-hidden
        bg-white/90 backdrop-blur-sm border-0 shadow-lg 
        hover:shadow-xl transition-all duration-300
        mobile-admin-card
      ">
        {/* Header responsivo */}
        <div className="
          flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 
          p-4 sm:p-6 border-b border-gray-100
        ">
          {icon && (
            <div className="
              flex-shrink-0 p-2 bg-gradient-to-r from-purple-500 to-pink-500 
              rounded-lg w-fit
            ">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="
              text-base sm:text-lg font-semibold text-gray-900 
              break-words
            ">
              {title}
            </h3>
            {description && (
              <p className="
                text-xs sm:text-sm text-gray-600 mt-1 
                break-words
              ">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Conteúdo com overflow controlado */}
        <div className="
          p-4 sm:p-6 w-full max-w-full overflow-x-hidden
        ">
          <div className="w-full max-w-full overflow-hidden">
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
}