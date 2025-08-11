/**
 * iconGenerator.ts
 * 
 * Gera ícones SVG profissionais para psicologia e converte para .ico
 */

import sharp from 'sharp';

// Biblioteca de ícones SVG para psicologia - usando símbolos mais simples e reconhecíveis
const iconSvgs = {
  brain: `<path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 2.9 1.3 4.1C6.5 13.1 6 14.5 6 16c0 3.5 2.5 6 6 6s6-2.5 6-6c0-1.5-.5-2.9-1.3-4.1C17.5 10.9 18 9.5 18 8c0-3.5-2.5-6-6-6zm-2 6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 8c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>`,
  
  heart: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  
  book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 0 4 5.5v14zM6.5 15A.5.5 0 0 0 6 15.5v1a.5.5 0 0 0 .5.5H19V15H6.5z"/>`,
  
  award: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`,
  
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill="white"/><circle cx="12" cy="12" r="2"/>`,
  
  compass: `<circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="white"/>`,
  
  sparkles: `<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>`
};

export function generateSVGIcon(iconId: string, color: string, size: number = 32): string {
  const iconPath = iconSvgs[iconId as keyof typeof iconSvgs] || iconSvgs.brain;
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="white" rx="3"/>
      <g fill="${color}" transform="translate(1, 1) scale(0.91)">
        ${iconPath}
      </g>
    </svg>
  `;
}

export async function generateFaviconFromSVG(iconId: string, color: string): Promise<Buffer> {
  const svgContent = generateSVGIcon(iconId, color, 32);
  const svgBuffer = Buffer.from(svgContent);
  
  // Converter SVG para PNG primeiro e depois para .ico
  const pngBuffer = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();
    
  return pngBuffer;
}

export async function generateMultipleSizes(iconId: string, color: string): Promise<{
  favicon: Buffer;
  favicon16: Buffer;
  favicon32: Buffer;
  appleTouchIcon: Buffer;
}> {
  const svg16 = generateSVGIcon(iconId, color, 16);
  const svg32 = generateSVGIcon(iconId, color, 32);
  const svg180 = generateSVGIcon(iconId, color, 180);
  
  const [favicon16, favicon32, appleTouchIcon] = await Promise.all([
    sharp(Buffer.from(svg16)).resize(16, 16).png().toBuffer(),
    sharp(Buffer.from(svg32)).resize(32, 32).png().toBuffer(),
    sharp(Buffer.from(svg180)).resize(180, 180).png().toBuffer()
  ]);
  
  return {
    favicon: favicon32, // usar 32x32 como favicon principal
    favicon16,
    favicon32,
    appleTouchIcon
  };
}