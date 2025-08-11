/**
 * imageOptimizer.ts
 * 
 * Utility functions for image optimization
 * Handles image compression and format conversion
 */

import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export async function optimizeImage(inputPath: string, uploadType: string, options?: { quality?: number, maxWidth?: number, maxHeight?: number }): Promise<string> {
  try {
    // Diferentes configurações para cada tipo
    const typeSettings = {
      hero: { quality: 90, maxWidth: 1200, maxHeight: 800 },
      testimonials: { quality: 85, maxWidth: 400, maxHeight: 400 },
      carousel: { quality: 90, maxWidth: 1200, maxHeight: 800 },
      articles: { quality: 90, maxWidth: 1200, maxHeight: 800 },
      support: { quality: 85, maxWidth: 800, maxHeight: 600 },
      secret: { quality: 85, maxWidth: 800, maxHeight: 600 }
    };
    
    const settings = { ...typeSettings[uploadType as keyof typeof typeSettings], ...options };
    const parsedPath = path.parse(inputPath);
    const outputDir = path.join(process.cwd(), 'uploads', uploadType);
    const outputPath = path.join(outputDir, `${parsedPath.name}.webp`);
    
    // Criar diretório se não existir
    if (!existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    await sharp(inputPath)
      .resize(settings.maxWidth, settings.maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: settings.quality })
      .toFile(outputPath);
      
    return outputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}

export async function createMultipleFormats(inputPath: string, basePath: string): Promise<void> {
  try {
    const webpPath = basePath + '.webp';
    await sharp(inputPath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(webpPath);
  } catch (error) {
    console.error('Error creating multiple formats:', error);
    throw error;
  }
}

export function getOptimizedPath(filename: string, uploadType: string): string {
  const parsedPath = path.parse(filename);
  return `/uploads/${uploadType}/${parsedPath.name}.webp`;
}

export async function cleanupOriginal(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up original file:', error);
  }
}