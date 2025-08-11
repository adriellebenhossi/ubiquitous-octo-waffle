
/**
 * performance.ts
 * 
 * Utilitários para otimização de performance
 */

// Debounce para eventos de scroll/resize
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle para eventos frequentes
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Preload de imagens críticas
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload de componentes lazy
export function preloadComponent(importFn: () => Promise<any>): void {
  const timer = setTimeout(() => {
    importFn().catch(() => {
      // Silenciar erro de preload
    });
  }, 2000); // Preload após 2 segundos

  // Limpar timer se componente for carregado antes
  return clearTimeout(timer);
}

// Detectar conexão lenta
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;
  
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.saveData === true;
}

// Cache para resultados de função pesadas
const memoCache = new Map<string, any>();

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    
    const result = fn(...args);
    memoCache.set(key, result);
    
    // Limpar cache se ficar muito grande
    if (memoCache.size > 100) {
      const firstKey = memoCache.keys().next().value;
      memoCache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Otimizar renderizações com requestAnimationFrame
export function optimizedRender(callback: () => void): void {
  requestAnimationFrame(callback);
}

// Pool de objetos para evitar garbage collection excessiva
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => T;

  constructor(createFn: () => T, resetFn: (obj: T) => T, initialSize = 5) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  get(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < 20) { // Limitar tamanho do pool
      this.pool.push(this.resetFn(obj));
    }
  }
}

export { ObjectPool };
