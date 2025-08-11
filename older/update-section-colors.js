#!/usr/bin/env node

/**
 * Script para aplicar o esquema de cores rosa-pink-purple do login
 * em todas as seções do site automaticamente
 */

// Using built-in fetch (Node.js 18+)

// Configuração das cores do gradiente rose-pink
const colorConfig = {
  backgroundColor: "#fff7ed", // warm rose background
  backgroundType: "gradient",
  gradientDirection: "to-br",
  gradientColors: ["#ec4899", "#8b5cf6"], // pink-500 to purple-500
  opacity: 0.8,
  overlayColor: "#000000",
  overlayOpacity: 0,
  schedulingButtonColor: "#6366f1", // indigo-500
  quoteIconColor: "#ec4899" // pink-500
};

// Seções para atualizar
const sections = [
  "hero", "about", "services", "testimonials", 
  "articles", "gallery", "faq", "contact", "inspirational"
];

async function updateSectionColors() {
  console.log('🎨 Iniciando atualização automática das cores...');
  
  for (const section of sections) {
    try {
      console.log(`📝 Atualizando seção: ${section}`);
      
      const response = await fetch('http://localhost:5000/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: `${section}_colors`,
          value: colorConfig
        })
      });

      if (response.ok) {
        console.log(`✅ ${section} atualizada com sucesso`);
      } else {
        console.log(`❌ Erro ao atualizar ${section}: ${response.status}`);
      }
      
      // Pequena pausa para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Erro ao atualizar ${section}:`, error.message);
    }
  }
  
  console.log('🎉 Atualização concluída! O site agora usa o esquema de cores rosa-pink-purple em todas as seções.');
  console.log('💡 Você ainda pode ajustar cores individuais pelo painel administrativo se necessário.');
}

updateSectionColors().catch(console.error);