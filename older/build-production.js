#!/usr/bin/env node

/**
 * build-production.js
 * 
 * Script personalizado para build de produção que resolve problemas de importação Vite
 * Executa vite build e esbuild com configurações específicas para produção
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Executando: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function main() {
  try {
    // 1. Build frontend com Vite
    console.log('📦 Buildando frontend...');
    await runCommand('npm', ['run', 'build:client']);
    
    // 2. Build backend com esbuild excluindo Vite
    console.log('🔧 Buildando backend...');
    const esbuildArgs = [
      'server/index.ts',
      '--platform=node',
      '--packages=external',
      '--bundle',
      '--format=esm',
      '--outdir=dist',
      '--external:vite',
      '--external:@vitejs/plugin-react',
      '--external:@replit/vite-plugin-cartographer',
      '--external:@replit/vite-plugin-runtime-error-modal',
      '--define:process.env.NODE_ENV="production"'
    ];
    
    await runCommand('npx', ['esbuild', ...esbuildArgs]);
    
    // 3. Verificar se o build foi bem-sucedido
    const distIndexPath = path.join(process.cwd(), 'dist', 'index.js');
    if (!fs.existsSync(distIndexPath)) {
      throw new Error('Arquivo dist/index.js não foi criado');
    }
    
    // 4. Verificar se não há importações Vite no bundle
    const bundleContent = fs.readFileSync(distIndexPath, 'utf8');
    const hasViteImports = bundleContent.includes('from "vite"') || 
                          bundleContent.includes('import("vite")') ||
                          bundleContent.includes('require("vite")');
    
    if (hasViteImports) {
      console.warn('⚠️ AVISO: Ainda há importações Vite no bundle de produção');
      console.log('Isso pode causar erros no Fly.io');
    } else {
      console.log('✅ Build de produção limpo - sem importações Vite');
    }
    
    console.log('🎉 Build de produção concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}