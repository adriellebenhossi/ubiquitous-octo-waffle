#!/bin/bash

# Script para iniciar o servidor de logs dedicado
# Porta: 5001 | Senha: 24092002

echo "🚀 Iniciando servidor de logs administrativos..."

# Verificar se já está rodando
if pgrep -f "logServer" > /dev/null; then
    echo "⚠️  Servidor de logs já está rodando na porta 5001"
    echo "🔗 Acesse: http://localhost:5001?password=24092002"
    exit 0
fi

# Iniciar servidor em background
npx tsx server/logServer.ts &
LOG_PID=$!

# Aguardar inicialização
sleep 2

# Verificar se iniciou corretamente
if kill -0 $LOG_PID 2>/dev/null; then
    echo "✅ Servidor de logs iniciado com sucesso!"
    echo "🔗 URL: http://localhost:5001"
    echo "🔒 Senha: 24092002"
    echo "📋 PID: $LOG_PID"
    echo ""
    echo "Endpoints disponíveis:"
    echo "  - /test?password=24092002           (teste)"
    echo "  - /view?password=24092002           (visualizar logs)"
    echo "  - /report?password=24092002         (baixar relatório)"
    echo "  - /summary?password=24092002        (resumo)"
else
    echo "❌ Falha ao iniciar servidor de logs"
    exit 1
fi