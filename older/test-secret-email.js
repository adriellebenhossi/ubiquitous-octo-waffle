// Teste específico para verificar envio de email do sistema secreto
const CHAT_RECIPIENT_EMAIL = process.env.CHAT_RECIPIENT_EMAIL;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

console.log('🔍 Testando configuração de email do sistema secreto...');
console.log('📧 CHAT_RECIPIENT_EMAIL:', CHAT_RECIPIENT_EMAIL ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('🔑 MAILGUN_API_KEY:', MAILGUN_API_KEY ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('🌐 MAILGUN_DOMAIN:', MAILGUN_DOMAIN ? 'Configurado' : 'NÃO CONFIGURADO');

if (CHAT_RECIPIENT_EMAIL) {
  console.log('📮 Email de destino (mascarado):', CHAT_RECIPIENT_EMAIL.replace(/(.{2}).*(@.*)/, '$1***$2'));
}

// Teste com curl
console.log('\n🧪 Para testar manualmente, execute:');
console.log('curl -X POST -H "Content-Type: application/json" \\');
console.log('  -d \'{"message": "Teste de email do sistema secreto"}\' \\');
console.log('  http://localhost:5000/api/secret/send');