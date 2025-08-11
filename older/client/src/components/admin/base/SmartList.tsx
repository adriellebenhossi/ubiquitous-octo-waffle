import React, { memo, useMemo } from 'react';
import { SmartListItem } from './SmartListItem';

interface SmartListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor: (item: any) => string | number;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

// Lista inteligente que só re-renderiza itens específicos que mudaram
export const SmartList = memo(({ 
  items, 
  renderItem, 
  keyExtractor, 
  onEdit, 
  onDelete, 
  onReorder 
}: SmartListProps) => {
  console.log(`📋 SmartList renderizando ${items.length} itens`);
  
  // Memoiza os itens para evitar re-criação desnecessária
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => {
      const key = keyExtractor(item);
      
      return (
        <SmartListItem
          key={key}
          id={item.id || key}
          data={item}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
        >
          {renderItem(item, index)}
        </SmartListItem>
      );
    });
  }, [items, renderItem, keyExtractor, onEdit, onDelete, onReorder]);
  
  return (
    <div className="smart-list">
      {memoizedItems}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação inteligente - só re-renderiza se a estrutura da lista mudou
  if (prevProps.items.length !== nextProps.items.length) {
    console.log(`📋 Lista mudou de tamanho: ${prevProps.items.length} → ${nextProps.items.length}`);
    return false; // Re-renderizar
  }
  
  // Verifica se algum item mudou (comparação superficial por ID e ordem)
  for (let i = 0; i < prevProps.items.length; i++) {
    const prevItem = prevProps.items[i];
    const nextItem = nextProps.items[i];
    
    if (prevItem.id !== nextItem.id || prevItem.order !== nextItem.order) {
      console.log(`📋 Item ${prevItem.id} mudou de posição ou foi substituído`);
      return false; // Re-renderizar
    }
  }
  
  console.log(`✅ Lista não mudou - evitando re-render completo`);
  return true; // Não re-renderizar
});

SmartList.displayName = 'SmartList';