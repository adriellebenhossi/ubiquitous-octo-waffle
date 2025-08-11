/**
 * useDragAndDrop.ts
 * 
 * Hook padronizado para funcionalidade de drag-and-drop
 * Gerencia sensores otimizados para mobile e desktop
 * Sistema uniforme de reordenação com setas e arrastar
 */

import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useDragAndDrop() {
  // Sensores otimizados APENAS para desktop (sem TouchSensor para mobile)
  // No mobile, drag-and-drop é desabilitado - apenas setas funcionam
  const sensors = useSensors(
    // TouchSensor removido para evitar processamento no mobile
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px distance para pointer (desktop apenas)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return { sensors };
}