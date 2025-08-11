/**
 * Script para gerar todos os ícones predefinidos como arquivos PNG
 * Execução: node generate-preset-icons.js
 */

import { generateAllPresetIcons } from './dist/index.js';

async function main() {
  try {
    console.log('🚀 Iniciando geração de ícones predefinidos...');
    await generateAllPresetIcons();
    console.log('✅ Processo concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

main();