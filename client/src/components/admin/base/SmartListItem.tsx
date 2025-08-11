import React, { memo } from 'react';

interface SmartListItemProps {
  id: number;
  children: React.ReactNode;
  data: any;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  index: number;
}

// Componente otimizado que só re-renderiza quando seus dados específicos mudam
export const SmartListItem = memo(({ 
  id, 
  children, 
  data, 
  onEdit, 
  onDelete, 
  onReorder, 
  index 
}: SmartListItemProps) => {
  console.log(`🔄 Renderizando item ID: ${id} - somente este item`);
  
  return (
    <div 
      data-item-id={id}
      className="smart-list-item"
      style={{ 
        transition: 'all 0.2s ease-in-out',
        transformOrigin: 'center'
      }}
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - só re-renderiza se os dados deste item específico mudaram
  const dataChanged = JSON.stringify(prevProps.data) !== JSON.stringify(nextProps.data);
  const indexChanged = prevProps.index !== nextProps.index;
  
  if (dataChanged) {
    console.log(`📝 Item ${prevProps.id} teve dados alterados - re-renderizando APENAS este item`);
  }
  
  if (indexChanged) {
    console.log(`🔄 Item ${prevProps.id} mudou de posição - re-renderizando APENAS este item`);
  }
  
  // Retorna true se NÃO deve re-renderizar (React.memo comportamento)
  return !dataChanged && !indexChanged;
});

SmartListItem.displayName = 'SmartListItem';