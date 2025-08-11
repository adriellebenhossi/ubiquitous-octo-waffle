#!/usr/bin/env node

/**
 * Script automático para gerar HTML SEO estático
 * Executado toda vez que configurações SEO são salvas
 */

const fs = require('fs').promises;
const path = require('path');

// Função principal
async function generateSEOHTML() {
  try {
    console.log('🚀 Iniciando geração de HTML SEO estático...');
    
    // Importar função de geração HTML dinamicamente
    const { regenerateStaticHTML } = await import('../server/utils/htmlGenerator.js');
    
    // URL base (será detectada automaticamente pelo servidor)
    const baseUrl = process.env.REPLIT_URL || 'https://localhost:3000';
    
    // Gerar HTML SEO
    await regenerateStaticHTML(baseUrl);
    
    console.log('✅ HTML SEO estático gerado com sucesso!');
    console.log('🛡️ Arquivo index.html original preservado intacto');
    
  } catch (error) {
    console.error('❌ Erro ao gerar HTML SEO:', error);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  generateSEOHTML();
}

module.exports = { generateSEOHTML };