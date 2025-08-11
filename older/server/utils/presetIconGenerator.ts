/**
 * presetIconGenerator.ts
 * 
 * Gera arquivos PNG para todos os ícones predefinidos
 * Solução para compatibilidade com Render.com
 */

import { promises as fs } from 'fs';
import path from 'path';

// Importação do Sharp
import sharp from 'sharp';

// Ícones SVG profissionais para psicologia
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

// Cores específicas para cada ícone
const iconColors = {
  'brain': '#9333ea',    // Roxo
  'heart': '#ef4444',    // Vermelho
  'book': '#2563eb',     // Azul
  'award': '#ca8a04',    // Amarelo/dourado
  'shield': '#16a34a',   // Verde
  'target': '#ea580c',   // Laranja
  'compass': '#0d9488',  // Verde-azulado
  'sparkles': '#db2777'  // Rosa
};

function generateSVGIcon(iconId: string, size: number = 32): string {
  const iconPath = iconSvgs[iconId as keyof typeof iconSvgs] || iconSvgs.brain;
  const color = iconColors[iconId as keyof typeof iconColors] || '#9333ea';
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="white" rx="3"/>
      <g fill="${color}" transform="translate(1, 1) scale(0.91)">
        ${iconPath}
      </g>
    </svg>
  `;
}

// Gerar todos os ícones predefinidos como arquivos PNG
export async function generateAllPresetIcons(): Promise<void> {
  console.log('🎨 Gerando ícones predefinidos como arquivos PNG...');
  
  try {
    // Tentar primeiro o caminho de produção, depois desenvolvimento
    const possibleIconsDirs = [
      path.join(process.cwd(), 'dist', 'public', 'icons', 'presets'), // Produção
      path.join(process.cwd(), 'client', 'public', 'icons', 'presets'), // Desenvolvimento
    ];
    
    // Usar o primeiro caminho que conseguir criar/acessar
    let iconsDir = possibleIconsDirs[0];
    if (process.env.NODE_ENV !== 'production') {
      iconsDir = possibleIconsDirs[1];
    }
    
    await fs.mkdir(iconsDir, { recursive: true });

  const iconIds = Object.keys(iconSvgs);
  
  for (const iconId of iconIds) {
    console.log(`🎨 Gerando ícone: ${iconId}`);
    
    // Gerar SVGs em diferentes tamanhos
    const svg16 = generateSVGIcon(iconId, 16);
    const svg32 = generateSVGIcon(iconId, 32);
    const svg180 = generateSVGIcon(iconId, 180);
    
    // Converter para PNG
    const [favicon16, favicon32, appleTouchIcon] = await Promise.all([
      sharp(Buffer.from(svg16)).resize(16, 16).png().toBuffer(),
      sharp(Buffer.from(svg32)).resize(32, 32).png().toBuffer(),
      sharp(Buffer.from(svg180)).resize(180, 180).png().toBuffer()
    ]);
    
    // Salvar arquivos
    await Promise.all([
      fs.writeFile(path.join(iconsDir, `${iconId}-16x16.png`), favicon16),
      fs.writeFile(path.join(iconsDir, `${iconId}-32x32.png`), favicon32),
      fs.writeFile(path.join(iconsDir, `${iconId}-180x180.png`), appleTouchIcon),
      fs.writeFile(path.join(iconsDir, `${iconId}.ico`), favicon32), // usar 32x32 como .ico
    ]);
    
    console.log(`✅ Ícone ${iconId} gerado com sucesso`);
  }
  
  console.log('✅ Todos os ícones predefinidos foram gerados!');
  } catch (error) {
    console.error('❌ Erro na geração de ícones:', error);
    console.warn('⚠️ Continuando sem ícones predefinidos');
  }
}

// Obter dados do ícone como base64 (para banco de dados)
export async function getIconAsBase64(iconId: string): Promise<{
  favicon: string;
  favicon16: string;
  favicon32: string;
  appleTouchIcon: string;
  iconId: string;
  color: string;
}> {
  try {
    const svg16 = generateSVGIcon(iconId, 16);
    const svg32 = generateSVGIcon(iconId, 32);
    const svg180 = generateSVGIcon(iconId, 180);
    
    const [favicon16, favicon32, appleTouchIcon] = await Promise.all([
      sharp(Buffer.from(svg16)).resize(16, 16).png().toBuffer(),
      sharp(Buffer.from(svg32)).resize(32, 32).png().toBuffer(),
      sharp(Buffer.from(svg180)).resize(180, 180).png().toBuffer()
    ]);
    
    return {
      favicon: favicon32.toString('base64'),
      favicon16: favicon16.toString('base64'),
      favicon32: favicon32.toString('base64'),
      appleTouchIcon: appleTouchIcon.toString('base64'),
      iconId,
      color: iconColors[iconId as keyof typeof iconColors] || '#9333ea'
    };
  } catch (error) {
    console.error('❌ Erro na geração de ícone base64:', error);
    throw error;
  }
}