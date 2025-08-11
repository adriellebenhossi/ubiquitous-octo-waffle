/**
 * DragAndDropContainer.tsx
 * 
 * Container padronizado para drag-and-drop
 * Gerencia contexto e lógica de reordenação
 * Interface uniforme para todos os managers
 */

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useState, useRef } from 'react';

interface DragAndDropContainerProps {
  items: Array<{ id: number | string; order: number }>;
  onReorder: (items: Array<{ id: number | string; order: number }>) => void;
  children: React.ReactNode;
}

export function DragAndDropContainer({ items, onReorder, children }: DragAndDropContainerProps) {
  const { sensors } = useDragAndDrop();
  const [isDragging, setIsDragging] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id.toString() === active.id);
      const newIndex = items.findIndex((item) => item.id.toString() === over.id);

      // Reordena o array
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);

      // Atualiza as ordens
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index
      }));

      // Implementar debounce para reduzir "piscadas" duplas
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onReorder(updatedItems);
      }, 50); // 50ms de delay para agrupar operações
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id.toString())} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 transition-opacity duration-150 w-full max-w-full overflow-hidden ${isDragging ? 'opacity-90' : 'opacity-100'}`}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}