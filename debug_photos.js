// Script para debug das fotos do carrossel
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function debugPhotos() {
  try {
    console.log('🔍 Verificando fotos do carrossel...');
    
    const photos = await sql`SELECT * FROM photo_carousel ORDER BY "order"`;
    console.log('📊 Total de fotos encontradas:', photos.length);
    
    if (photos.length > 0) {
      console.log('📸 Detalhes das fotos:');
      photos.forEach((photo, index) => {
        console.log(`${index + 1}. ID: ${photo.id}`);
        console.log(`   Título: ${photo.title || 'Sem título'}`);
        console.log(`   URL: ${photo.imageUrl || 'Sem URL'}`);
        console.log(`   Ativa: ${photo.isActive ? 'Sim' : 'Não'}`);
        console.log(`   Ordem: ${photo.order}`);
        console.log('   ---');
      });
      
      const activePhotos = photos.filter(p => p.isActive);
      console.log('✅ Fotos ativas:', activePhotos.length);
    } else {
      console.log('⚠️ Nenhuma foto encontrada no banco de dados');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar fotos:', error);
  }
}

debugPhotos();