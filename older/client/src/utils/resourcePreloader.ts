/**
 * resourcePreloader.ts
 * 
 * Sistema inteligente de preload de recursos críticos
 * Melhora performance fazendo preload baseado em prioridade e conexão
 */

import { isSlowConnection } from './performance';

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  type: 'image' | 'script' | 'style' | 'font';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

class ResourcePreloader {
  private preloadQueue: Map<string, PreloadConfig> = new Map();
  private preloadedResources: Set<string> = new Set();
  private isPreloading = false;

  constructor() {
    // Preload automático quando idle
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => this.processQueue());
    } else {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  addToQueue(url: string, config: PreloadConfig): void {
    if (this.preloadedResources.has(url)) return;
    
    this.preloadQueue.set(url, config);
    
    // Processar imediatamente se alta prioridade
    if (config.priority === 'high') {
      this.preloadResource(url, config);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.size === 0) return;
    
    this.isPreloading = true;
    const slowConnection = isSlowConnection();
    
    // Ordenar por prioridade
    const sortedEntries = Array.from(this.preloadQueue.entries()).sort(([, a], [, b]) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    for (const [url, config] of sortedEntries) {
      // Em conexões lentas, só preload de alta prioridade
      if (slowConnection && config.priority !== 'high') continue;
      
      await this.preloadResource(url, config);
      this.preloadQueue.delete(url);
      
      // Dar uma pausa entre preloads para não bloquear
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.isPreloading = false;
  }

  private preloadResource(url: string, config: PreloadConfig): Promise<void> {
    return new Promise((resolve) => {
      if (this.preloadedResources.has(url)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = config.type === 'script' ? 'script' : 
                 config.type === 'style' ? 'style' :
                 config.type === 'font' ? 'font' : 'image';
      
      if (config.crossOrigin) {
        link.crossOrigin = config.crossOrigin;
      }
      
      if (config.type === 'font') {
        link.type = 'font/woff2';
      }

      link.onload = () => {
        this.preloadedResources.add(url);
        resolve();
      };
      
      link.onerror = () => {
        console.warn(`Failed to preload resource: ${url}`);
        resolve();
      };

      document.head.appendChild(link);
    });
  }

  // Preload de imagens críticas
  preloadCriticalImages(urls: string[]): void {
    urls.forEach(url => {
      this.addToQueue(url, { priority: 'high', type: 'image' });
    });
  }

  // Preload de fontes
  preloadFonts(urls: string[]): void {
    urls.forEach(url => {
      this.addToQueue(url, { priority: 'medium', type: 'font', crossOrigin: 'anonymous' });
    });
  }

  // Preload de scripts não críticos
  preloadScripts(urls: string[]): void {
    urls.forEach(url => {
      this.addToQueue(url, { priority: 'low', type: 'script' });
    });
  }
}

// Instância global do preloader
export const resourcePreloader = new ResourcePreloader();

// Hook para usar o preloader
export function useResourcePreloader() {
  return {
    preloadImages: (urls: string[]) => resourcePreloader.preloadCriticalImages(urls),
    preloadFonts: (urls: string[]) => resourcePreloader.preloadFonts(urls),
    preloadScripts: (urls: string[]) => resourcePreloader.preloadScripts(urls),
  };
}