/**
 * virtualizer.ts
 * 
 * Sistema de virtualização para listas grandes
 * Renderiza apenas itens visíveis para melhor performance
 */

import { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizerOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export function useVirtualizer<T>(
  items: T[],
  options: VirtualizerOptions
) {
  const { itemHeight, containerHeight, overscan = 3, threshold = 50 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement>(null);

  // Calcular itens visíveis
  const visibleRange = useMemo(() => {
    if (items.length <= threshold) {
      // Se poucos itens, renderizar todos
      return { start: 0, end: items.length };
    }

    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan, threshold]);

  // Itens virtualizados
  const virtualItems = useMemo(() => {
    if (items.length <= threshold) {
      return items.map((item, index) => ({
        item,
        index,
        offsetTop: index * itemHeight
      }));
    }

    return items.slice(visibleRange.start, visibleRange.end).map((item, i) => ({
      item,
      index: visibleRange.start + i,
      offsetTop: (visibleRange.start + i) * itemHeight
    }));
  }, [items, visibleRange, itemHeight, threshold]);

  // Handler de scroll otimizado
  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement || items.length <= threshold) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollTop(scrollElement.scrollTop);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [items.length, threshold]);

  const totalHeight = items.length * itemHeight;
  const offsetY = items.length > threshold ? visibleRange.start * itemHeight : 0;

  return {
    virtualItems,
    totalHeight,
    offsetY,
    scrollElementRef
  };
}

// Hook para lazy loading baseado em scroll
export function useScrollBasedLazyLoading(
  callback: () => void,
  threshold = 0.8
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let ticking = false;

    const checkScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = element;
          const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
          
          if (scrollPercentage >= threshold) {
            callback();
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    element.addEventListener('scroll', checkScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', checkScroll);
    };
  }, [callback, threshold]);

  return elementRef;
}