#!/usr/bin/env node

/**
 * Script de build de produção corrigido para Fly.io
 * 
 * Este script resolve o problema de dependências do Vite sendo
 * incluídas no bundle de produção que causava o erro:
 * "Cannot find package '@vitejs/plugin-react'"
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Iniciando build de produção corrigido...');

try {
  // 1. Build do frontend com Vite
  console.log('📦 Building frontend com Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // 2. Build do servidor com esbuild, excluindo dependências problemáticas
  console.log('⚙️ Building servidor com esbuild (sem dependências Vite)...');
  
  const esbuildCommand = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--packages=external',
    '--bundle',
    '--format=esm',
    '--outdir=dist',
    // Excluir dependências específicas do Vite que causam problemas
    '--external:../vite.config',
    '--external:vite',
    '--external:@vitejs/plugin-react',
    '--external:@replit/vite-plugin-cartographer',
    '--external:@replit/vite-plugin-runtime-error-modal'
  ].join(' ');
  
  execSync(esbuildCommand, { stdio: 'inherit' });
  
  // 3. Verificar se o arquivo de saída foi criado
  const outputFile = path.resolve(process.cwd(), 'dist', 'index.js');
  if (!fs.existsSync(outputFile)) {
    throw new Error('❌ Arquivo de saída não foi criado: ' + outputFile);
  }
  
  // 4. Verificar e corrigir o conteúdo do arquivo para dependências problemáticas
  let content = fs.readFileSync(outputFile, 'utf-8');
  
  console.log('🔍 Verificando e corrigindo imports problemáticos...');
  
  // Lista de todas as dependências e imports que causam problemas
  const problematicPatterns = [
    // Imports diretos
    'import.*from ["\']\\.\\.\/vite\\.config["\']',
    'import.*from ["\']vite["\']',
    'import.*from ["\']@vitejs\/plugin-react["\']',
    'import.*from ["\']@replit\/vite-plugin-cartographer["\']',
    'import.*from ["\']@replit\/vite-plugin-runtime-error-modal["\']',
    // Requires
    '__require\\(["\']vite["\']\\)',
    '__require\\(["\']@vitejs\/plugin-react["\']\\)',
    '__require\\(["\']@replit\/vite-plugin-cartographer["\']\\)',
    '__require\\(["\']@replit\/vite-plugin-runtime-error-modal["\']\\)',
    // Dynamic imports
    'import\\(["\']vite["\']\\)',
    'import\\(["\']@vitejs\/plugin-react["\']\\)',
    // Strings que podem causar problemas
    'vite\\.config',
    '\\.\\.\\/vite\\.config'
  ];
  
  let hasChanges = false;
  
  // Aplicar todas as correções
  problematicPatterns.forEach((pattern, index) => {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches) {
      console.log(`🔧 Corrigindo padrão ${index + 1}: encontradas ${matches.length} ocorrências`);
      content = content.replace(regex, `/* Removed problematic import/require for production */`);
      hasChanges = true;
    }
  });
  
  // Correções específicas para imports de vite.config
  if (content.includes('vite.config')) {
    console.log('🔧 Removendo referências ao vite.config...');
    // Substituir o spread do viteConfig por um objeto vazio ou configuração mínima
    content = content.replace(/\.\.\.viteConfig/g, '/* viteConfig removed for production */');
    content = content.replace(/viteConfig/g, '{}');
    hasChanges = true;
  }
  
  if (hasChanges) {
    fs.writeFileSync(outputFile, content);
    console.log('✅ Dependências problemáticas removidas do bundle');
  } else {
    console.log('✅ Nenhuma dependência problemática encontrada');
  }
  
  console.log('✅ Build de produção concluído com sucesso!');
  console.log('📄 Arquivo de saída:', outputFile);
  console.log('📊 Tamanho do arquivo:', (fs.statSync(outputFile).size / 1024).toFixed(2) + ' KB');
  
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}