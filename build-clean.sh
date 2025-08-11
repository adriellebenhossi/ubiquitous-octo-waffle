#!/bin/bash

# build-clean.sh - Script de build limpo para produção
# Resolve o problema de importações Vite no bundle de produção

echo "🧹 Limpando builds anteriores..."
rm -rf dist/

echo "📦 Buildando frontend com Vite..."
npm run build

echo "🔧 Buildando backend com esbuild (sem Vite)..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-cartographer \
  --external:@replit/vite-plugin-runtime-error-modal \
  --define:process.env.NODE_ENV='"production"'

echo "✅ Verificando se o build está limpo..."
if grep -q "vite" dist/index.js; then
  echo "❌ ERRO: Ainda há importações Vite no bundle!"
  echo "O deploy vai falhar no Fly.io"
  exit 1
else
  echo "✅ Build limpo - sem importações Vite"
fi

echo "🎉 Build de produção concluído!"
echo "📁 Arquivos criados:"
ls -la dist/