/**
 * Script para verificar se a aplicação está pronta para produção no Fly.io
 * Identifica possíveis problemas antes do deploy
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verificando preparação para produção Fly.io...\n');

const checks = [];
let hasErrors = false;

// 1. Verificar se o build foi gerado
function checkBuildExists() {
  const distPath = path.join(process.cwd(), 'dist');
  const publicPath = path.join(distPath, 'public');
  const indexJs = path.join(distPath, 'index.js');
  const indexHtml = path.join(publicPath, 'index.html');
  
  if (fs.existsSync(distPath)) {
    checks.push('✅ Diretório dist/ existe');
    
    if (fs.existsSync(indexJs)) {
      checks.push('✅ arquivo dist/index.js existe');
    } else {
      checks.push('❌ arquivo dist/index.js não existe');
      hasErrors = true;
    }
    
    if (fs.existsSync(publicPath)) {
      checks.push('✅ Diretório dist/public/ existe');
      
      if (fs.existsSync(indexHtml)) {
        checks.push('✅ arquivo dist/public/index.html existe');
      } else {
        checks.push('❌ arquivo dist/public/index.html não existe');
        hasErrors = true;
      }
    } else {
      checks.push('❌ Diretório dist/public/ não existe');
      hasErrors = true;
    }
  } else {
    checks.push('❌ Diretório dist/ não existe - execute npm run build');
    hasErrors = true;
  }
}

// 2. Verificar configurações do Fly.io
function checkFlyConfig() {
  const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
  const flyTomlPath = path.join(process.cwd(), 'fly.toml');
  const dockerIgnorePath = path.join(process.cwd(), '.dockerignore');
  
  if (fs.existsSync(dockerfilePath)) {
    checks.push('✅ Dockerfile existe');
    
    // Verificar se contém dependências Sharp
    const dockerContent = fs.readFileSync(dockerfilePath, 'utf-8');
    if (dockerContent.includes('libjpeg-dev') && dockerContent.includes('libpng-dev')) {
      checks.push('✅ Dockerfile inclui dependências Sharp');
    } else {
      checks.push('⚠️ Dockerfile pode não incluir todas as dependências Sharp');
    }
  } else {
    checks.push('❌ Dockerfile não existe');
    hasErrors = true;
  }
  
  if (fs.existsSync(flyTomlPath)) {
    checks.push('✅ fly.toml existe');
  } else {
    checks.push('❌ fly.toml não existe');
    hasErrors = true;
  }
  
  if (fs.existsSync(dockerIgnorePath)) {
    checks.push('✅ .dockerignore existe');
  } else {
    checks.push('⚠️ .dockerignore não existe (recomendado)');
  }
}

// 3. Verificar dependências críticas
function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = packageJson.dependencies || {};
    
    // Verificar dependências críticas
    const criticalDeps = ['express', 'sharp', '@neondatabase/serverless', 'ws'];
    
    criticalDeps.forEach(dep => {
      if (deps[dep]) {
        checks.push(`✅ Dependência ${dep} presente`);
      } else {
        checks.push(`❌ Dependência crítica ${dep} não encontrada`);
        hasErrors = true;
      }
    });
    
    // Verificar se Sharp está em dependencies (não devDependencies)
    if (packageJson.devDependencies && packageJson.devDependencies.sharp) {
      checks.push('⚠️ Sharp está em devDependencies - pode causar problemas em produção');
    }
    
  } else {
    checks.push('❌ package.json não existe');
    hasErrors = true;
  }
}

// 4. Verificar variáveis de ambiente necessárias
function checkEnvironmentVars() {
  const requiredEnvVars = ['DATABASE_URL'];
  const optionalEnvVars = ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN'];
  
  checks.push('\n📋 Variáveis de ambiente necessárias para Fly.io:');
  
  requiredEnvVars.forEach(envVar => {
    checks.push(`  ${envVar} (obrigatória)`);
  });
  
  optionalEnvVars.forEach(envVar => {
    checks.push(`  ${envVar} (opcional)`);
  });
  
  checks.push('\nDefina com: flyctl secrets set NOME="valor"');
}

// 5. Verificar arquivos críticos do servidor
function checkServerFiles() {
  const criticalFiles = [
    'server/index.ts',
    'server/db.ts',
    'server/storage.ts',
    'server/routes.ts'
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      checks.push(`✅ ${file} existe`);
    } else {
      checks.push(`❌ ${file} não existe`);
      hasErrors = true;
    }
  });
}

// Executar todas as verificações
checkBuildExists();
checkFlyConfig();
checkDependencies();
checkServerFiles();
checkEnvironmentVars();

// Exibir resultados
console.log(checks.join('\n'));

if (hasErrors) {
  console.log('\n🚨 ERROS ENCONTRADOS - Corrija antes do deploy');
  console.log('\nSugestões:');
  console.log('1. Execute: npm run build');
  console.log('2. Verifique se todos os arquivos necessários existem');
  console.log('3. Configure as variáveis de ambiente no Fly.io');
  process.exit(1);
} else {
  console.log('\n✅ Aplicação parece estar pronta para deploy no Fly.io!');
  console.log('\nPara fazer o deploy:');
  console.log('1. flyctl auth login');
  console.log('2. flyctl secrets set DATABASE_URL="sua_url"');
  console.log('3. flyctl deploy');
  process.exit(0);
}