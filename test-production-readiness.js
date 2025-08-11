/**
 * Teste completo de prontidão para produção
 * Simula cenários reais que podem falhar no Fly.io
 */

import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
let server;

console.log('🧪 Testando prontidão para produção Fly.io...\n');

// Simular variáveis de ambiente de produção
process.env.NODE_ENV = 'production';
process.env.PORT = '3001'; // Porta teste
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'; // URL fictícia para teste

async function runTests() {
  let allTestsPassed = true;
  
  // 1. Teste: Importação do servidor principal
  console.log('🔧 Teste 1: Importação do servidor...');
  try {
    // Simular importação dinâmica como seria no Fly.io
    const serverModule = await import('./dist/index.js');
    console.log('✅ Servidor importado com sucesso');
  } catch (error) {
    console.log('❌ Falha na importação do servidor:', error.message);
    allTestsPassed = false;
  }

  // 2. Teste: Verificar se Sharp está disponível
  console.log('🖼️ Teste 2: Disponibilidade do Sharp...');
  try {
    const sharp = await import('sharp');
    console.log('✅ Sharp importado com sucesso');
    
    // Teste básico do Sharp
    const testSvg = '<svg width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>';
    const pngBuffer = await sharp.default(Buffer.from(testSvg))
      .resize(32, 32)
      .png()
      .toBuffer();
    console.log('✅ Sharp funciona corretamente');
  } catch (error) {
    console.log('❌ Problema com Sharp:', error.message);
    console.log('⚠️ Aplicação funcionará, mas geração de ícones será desabilitada');
  }

  // 3. Teste: Verificar arquivos estáticos de produção
  console.log('📂 Teste 3: Arquivos estáticos...');
  const staticPaths = [
    './dist/public/index.html',
    './dist/public/assets', // Diretório de assets do Vite
  ];
  
  staticPaths.forEach(staticPath => {
    if (fs.existsSync(staticPath)) {
      console.log(`✅ ${staticPath} encontrado`);
    } else {
      console.log(`❌ ${staticPath} não encontrado`);
      allTestsPassed = false;
    }
  });

  // 4. Teste: Verificar se websocket funciona
  console.log('🌐 Teste 4: WebSocket...');
  try {
    const ws = await import('ws');
    console.log('✅ WebSocket disponível');
  } catch (error) {
    console.log('❌ Problema com WebSocket:', error.message);
    allTestsPassed = false;
  }

  // 5. Teste: Verificar Neon Database
  console.log('💾 Teste 5: Driver de banco...');
  try {
    const { Pool } = await import('@neondatabase/serverless');
    console.log('✅ Driver Neon disponível');
  } catch (error) {
    console.log('❌ Problema com driver Neon:', error.message);
    allTestsPassed = false;
  }

  // 6. Teste: Verificar se compression funciona
  console.log('🗜️ Teste 6: Compressão...');
  try {
    const compression = await import('compression');
    console.log('✅ Compressão disponível');
  } catch (error) {
    console.log('❌ Problema com compressão:', error.message);
    allTestsPassed = false;
  }

  // 7. Teste: Simular requisição HTTP básica
  console.log('🌍 Teste 7: Servidor HTTP básico...');
  try {
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', env: process.env.NODE_ENV });
    });
    
    server = app.listen(3001, () => {
      console.log('✅ Servidor teste iniciado na porta 3001');
    });
    
    // Fazer requisição teste
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ Requisição HTTP funcionando');
    } else {
      console.log('❌ Resposta HTTP incorreta');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Problema com servidor HTTP:', error.message);
    allTestsPassed = false;
  }

  // Finalizar
  if (server) {
    server.close();
  }

  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Aplicação está pronta para deploy no Fly.io');
    console.log('\nComandos para deploy:');
    console.log('1. flyctl auth login');
    console.log('2. flyctl secrets set DATABASE_URL="sua_url_real"');
    console.log('3. flyctl deploy');
  } else {
    console.log('🚨 ALGUNS TESTES FALHARAM');
    console.log('❌ Corrija os problemas antes do deploy');
    console.log('\nVerifique:');
    console.log('- Se npm run build foi executado');
    console.log('- Se todas as dependências estão instaladas');
    console.log('- Se o Dockerfile contém todas as dependências nativas');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

runTests().catch(console.error);