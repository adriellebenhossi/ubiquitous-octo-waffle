/**
 * LazyImage.tsx
 * 
 * Componente de imagem otimizada com lazy loading
 * Melhora a performance carregando imagens apenas quando necessário
 */

import { useState, useRef, useEffect, ImgHTMLAttributes, FC, memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memoize } from '@/utils/performance';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  webpSrc?: string;
  priority?: boolean;
}

// Memoizar verificação de WebP para melhor performance
const checkWebPSupport = memoize(() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);
    const dataURL = canvas.toDataURL('image/webp');
    return dataURL.indexOf('data:image/webp') === 0;
  }
  return false;
});

const LazyImageComponent: FC<LazyImageProps> = ({
  src,
  alt,
  className,
  fallback,
  webpSrc,
  priority = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [supportsWebP, setSupportsWebP] = useState<boolean>(false);

  // Check WebP support usando cache memoizado
  useEffect(() => {
    setSupportsWebP(checkWebPSupport());
  }, []);

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [priority]);

  useEffect(() => {
    if (isInView && !imageSrc) {
      // Use WebP if supported and available
      const sourceToUse = (supportsWebP && webpSrc) ? webpSrc : src;
      setImageSrc(sourceToUse);
    }
  }, [isInView, src, webpSrc, supportsWebP, imageSrc]);

  const handleError = () => {
    if (webpSrc && !imageError && imageSrc === webpSrc) {
      // Fallback from WebP to original format
      setImageSrc(src);
      setImageError(true);
    } else if (!imageError && fallback) {
      setImageSrc(fallback);
      setImageError(true);
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-500',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'low'}
      {...props}
    />
  );
};

// Memoizar componente para evitar re-renders desnecessários
export const LazyImage = memo(LazyImageComponent);