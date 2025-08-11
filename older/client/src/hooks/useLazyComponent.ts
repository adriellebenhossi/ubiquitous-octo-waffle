/**
 * useLazyComponent.ts
 * 
 * Hook para carregamento lazy otimizado de componentes
 * Melhora performance carregando componentes apenas quando necessário
 */

import { useState, useEffect, useRef } from 'react';
import { isSlowConnection } from '@/utils/performance';

interface UseLazyComponentOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  priority?: boolean;
}

export function useLazyComponent(options: UseLazyComponentOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '200px',
    delay = isSlowConnection() ? 1000 : 100,
    priority = false
  } = options;

  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isIntersecting) {
          setIsIntersecting(true);
          
          // Delay para melhor UX em conexões lentas
          const timer = setTimeout(() => {
            setShouldLoad(true);
            observer.disconnect();
          }, delay);

          return () => clearTimeout(timer);
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad, threshold, rootMargin, delay, isIntersecting]);

  return { shouldLoad, elementRef };
}