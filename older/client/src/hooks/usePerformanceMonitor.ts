/**
 * usePerformanceMonitor.ts
 * 
 * Hook para monitoramento de performance em tempo real
 * Identifica gargalos e otimiza renderizações baseado na capacidade do device
 */

import { useEffect, useRef, useState } from 'react';
import { throttle, isSlowConnection } from '@/utils/performance';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  slowConnection: boolean;
  reducedMotion: boolean;
  devicePixelRatio: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    slowConnection: false,
    reducedMotion: false,
    devicePixelRatio: 1
  });

  const frameRef = useRef<number>();
  const framesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());

  // Monitorar FPS
  const measureFPS = throttle(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta > 0) {
      const fps = 1000 / delta;
      framesRef.current.push(fps);
      
      // Manter apenas últimas 60 medições
      if (framesRef.current.length > 60) {
        framesRef.current.shift();
      }
      
      // Calcular FPS médio
      const avgFPS = framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length;
      
      setMetrics(prev => ({ ...prev, fps: Math.round(avgFPS) }));
    }
    
    lastTimeRef.current = now;
    frameRef.current = requestAnimationFrame(measureFPS);
  }, 1000);

  // Monitorar performance geral
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: Partial<PerformanceMetrics> = {
        slowConnection: isSlowConnection(),
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        devicePixelRatio: window.devicePixelRatio || 1
      };

      // Verificar memória se disponível
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        newMetrics.memoryUsage = Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100);
      }

      setMetrics(prev => ({ ...prev, ...newMetrics }));
    };

    updateMetrics();
    
    // Iniciar monitoramento de FPS
    frameRef.current = requestAnimationFrame(measureFPS);

    // Atualizar métricas periodicamente
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      clearInterval(interval);
    };
  }, [measureFPS]);

  // Sugestões baseadas na performance
  const getPerformanceSuggestions = () => {
    const suggestions = {
      reduceAnimations: metrics.fps < 30 || metrics.reducedMotion,
      simplifyEffects: metrics.memoryUsage > 80,
      lowerImageQuality: metrics.slowConnection || metrics.fps < 45,
      reduceConcurrency: metrics.memoryUsage > 70 && metrics.fps < 40,
      enableGPUAcceleration: metrics.devicePixelRatio > 1 && metrics.fps > 50
    };

    return suggestions;
  };

  return { metrics, suggestions: getPerformanceSuggestions() };
}

// Hook específico para otimizar componentes baseado na performance
export function useAdaptivePerformance() {
  const { metrics, suggestions } = usePerformanceMonitor();

  return {
    shouldReduceAnimations: suggestions.reduceAnimations,
    shouldLowerQuality: suggestions.lowerImageQuality,
    shouldSimplifyEffects: suggestions.simplifyEffects,
    isHighPerformance: metrics.fps >= 50 && metrics.memoryUsage < 50,
    connectionSpeed: metrics.slowConnection ? 'slow' : 'fast'
  };
}