/**
 * emailService.ts
 * 
 * Email service utility functions
 * Handles sending support and notification emails using Mailgun
 */

import Mailgun from 'mailgun.js';
import formData from 'form-data';
import fs from 'fs';
import path from 'path';

// Initialize Mailgun client - usando form-data minúsculo
const mailgun = new Mailgun(formData);

// Mailgun configuration from environment variables
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

let mg: any = null;

// Initialize Mailgun client
function initializeMailgun() {
  if (!mg && MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    try {
      mg = mailgun.client({
        username: 'api',
        key: MAILGUN_API_KEY,
      });
      console.log('✅ Mailgun client initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Mailgun client:', error);
    }
  }
  return mg;
}

export async function sendSupportEmail(messageData: any): Promise<{success: boolean, error?: string}> {
  try {
    console.log('📧 Attempting to send email via Mailgun...');
    console.log('Message data:', {
      subject: messageData.subject,
      type: messageData.type,
      senderEmail: messageData.email,
      senderName: messageData.name
    });

    // Validate environment variables
    if (!MAILGUN_API_KEY) {
      console.error('❌ MAILGUN_API_KEY not found in environment variables');
      return { success: false, error: 'MAILGUN_API_KEY not configured' };
    }

    if (!MAILGUN_DOMAIN) {
      console.error('❌ MAILGUN_DOMAIN not found in environment variables');
      return { success: false, error: 'MAILGUN_DOMAIN not configured' };
    }

    if (!RECIPIENT_EMAIL) {
      console.error('❌ RECIPIENT_EMAIL not found in environment variables');
      return { success: false, error: 'RECIPIENT_EMAIL not configured' };
    }

    // Initialize Mailgun client
    const client = initializeMailgun();
    if (!client) {
      console.error('❌ Failed to initialize Mailgun client');
      return { success: false, error: 'Failed to initialize Mailgun client' };
    }

    // Prepare email content - handle empty subject for secret messages
    const emailSubject = messageData.subject && messageData.subject.trim() !== '' 
      ? `[${messageData.type.toUpperCase()}] ${messageData.subject}`
      : messageData.type === 'secret-message' 
        ? messageData.message.substring(0, 50) + (messageData.message.length > 50 ? '...' : '')
        : `[${messageData.type.toUpperCase()}] Mensagem sem assunto`;
    
    // Determine recipient (allow override for chat)
    const finalRecipient = messageData.recipientOverride || RECIPIENT_EMAIL;
    
    // Sistema robusto de processamento de anexos
    let attachmentInfo = '';
    const emailAttachments: any[] = [];
    const webImageLinks: string[] = [];
    
    if (messageData.attachments && messageData.attachments.length > 0) {
      console.log('📎 === INICIANDO PROCESSAMENTO DE ANEXOS ===');
      console.log('📎 Anexos recebidos:', messageData.attachments);
      console.log('📎 Tipo:', typeof messageData.attachments, 'Array:', Array.isArray(messageData.attachments));
      console.log('📎 Server URL:', messageData.serverUrl);
      
      // Garantir que attachments seja um array
      const attachments = Array.isArray(messageData.attachments) 
        ? messageData.attachments 
        : [messageData.attachments];
      
      console.log('📎 Anexos normalizados:', attachments);
      
      // Criar informação inicial dos anexos
      attachmentInfo = `\n\n📎 ANEXOS (${attachments.length} imagem${attachments.length > 1 ? 's' : ''}):\n\n`;
      
      // Processar cada anexo individualmente
      for (let index = 0; index < attachments.length; index++) {
        const attachmentUrl = attachments[index];
        console.log(`📎 === PROCESSANDO ANEXO ${index + 1}/${attachments.length} ===`);
        console.log(`📎 URL original: ${attachmentUrl}`);
        
        if (!attachmentUrl || typeof attachmentUrl !== 'string') {
          console.warn(`⚠️ Anexo ${index + 1} inválido:`, attachmentUrl);
          attachmentInfo += `${index + 1}. (Anexo inválido)\n\n`;
          continue;
        }
        
        try {
          // Determinar caminho do arquivo no sistema
          let filePath: string = '';
          let webUrl: string = '';
          
          if (attachmentUrl.startsWith('/uploads/')) {
            // Formato: /uploads/support/image.jpg → uploads/support/image.jpg
            filePath = path.join(process.cwd(), attachmentUrl.substring(1));
            webUrl = attachmentUrl;
          } else if (attachmentUrl.startsWith('uploads/')) {
            // Formato: uploads/support/image.jpg
            filePath = path.join(process.cwd(), attachmentUrl);
            webUrl = '/' + attachmentUrl;
          } else if (path.isAbsolute(attachmentUrl)) {
            // Caminho absoluto completo
            filePath = attachmentUrl;
            const relativePath = attachmentUrl.replace(process.cwd(), '').replace(/\\/g, '/');
            webUrl = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
          } else {
            // Tentar interpretar como nome de arquivo apenas
            const fileName = path.basename(attachmentUrl);
            // Detectar o tipo de upload baseado no messageData.type
            const uploadDir = messageData.type === 'secret-message' ? 'secret' : 'support';
            filePath = path.join(process.cwd(), 'uploads', uploadDir, fileName);
            webUrl = `/uploads/${uploadDir}/${fileName}`;
            console.log(`🔄 Interpretando como nome de arquivo (${uploadDir}): ${attachmentUrl} → ${filePath}`);
          }
          
          console.log(`📂 Caminho do arquivo calculado: ${filePath}`);
          console.log(`🌐 URL web relativa: ${webUrl}`);
          console.log(`📂 Diretório de trabalho atual: ${process.cwd()}`);
          
          const fileName = path.basename(filePath);
          const fileExists = fs.existsSync(filePath);
          
          console.log(`📋 Arquivo existe: ${fileExists}`);
          
          // Se arquivo não existe, tentar caminhos alternativos
          if (!fileExists) {
            const uploadDir = messageData.type === 'secret-message' ? 'secret' : 'support';
            const alternativePaths = [
              path.join(process.cwd(), 'uploads', uploadDir, fileName),
              path.join(process.cwd(), 'uploads', 'support', fileName), // fallback para support
              path.join(process.cwd(), 'uploads', 'secret', fileName),  // fallback para secret
              path.join(process.cwd(), attachmentUrl),
              attachmentUrl
            ];
            
            console.log(`🔍 Arquivo não encontrado em ${filePath}, testando caminhos alternativos:`);
            
            for (const altPath of alternativePaths) {
              console.log(`   🔍 Testando: ${altPath}`);
              if (fs.existsSync(altPath)) {
                console.log(`   ✅ Encontrado em: ${altPath}`);
                filePath = altPath;
                break;
              }
            }
          }
          
          // ===== ANEXAR ARQUIVO AO EMAIL =====
          if (fileExists) {
            try {
              const fileBuffer = fs.readFileSync(filePath);
              const fileStats = fs.statSync(filePath);
              const sizeKB = Math.round(fileStats.size / 1024);
              
              // Determinar content-type correto
              const fileExtension = path.extname(fileName).toLowerCase();
              let contentType = 'application/octet-stream';
              
              switch (fileExtension) {
                case '.jpg':
                case '.jpeg':
                  contentType = 'image/jpeg';
                  break;
                case '.png':
                  contentType = 'image/png';
                  break;
                case '.gif':
                  contentType = 'image/gif';
                  break;
                case '.webp':
                  contentType = 'image/webp';
                  break;
                case '.svg':
                  contentType = 'image/svg+xml';
                  break;
                case '.bmp':
                  contentType = 'image/bmp';
                  break;
              }
              
              // Adicionar anexo ao email
              emailAttachments.push({
                filename: fileName,
                data: fileBuffer,
                contentType: contentType
              });
              
              console.log(`✅ Arquivo anexado: ${fileName} (${sizeKB}KB, ${contentType})`);
              
              // ===== GERAR LINK WEB =====
              if (webUrl && messageData.serverUrl) {
                // Corrigir URL do servidor se contém localhost
                let correctedServerUrl = messageData.serverUrl;
                if (correctedServerUrl.includes('localhost') || correctedServerUrl.includes('127.0.0.1') || correctedServerUrl.includes(':5001')) {
                  // Detectar URL real do ambiente Replit
                  if (process.env.REPLIT_DEV_DOMAIN) {
                    correctedServerUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
                  } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
                    correctedServerUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
                  } else {
                    correctedServerUrl = 'https://your-replit-app.replit.app';
                  }
                  console.log(`🔄 URL localhost detectada, corrigindo: ${messageData.serverUrl} → ${correctedServerUrl}`);
                }
                
                const fullWebUrl = `${correctedServerUrl}${webUrl}`;
                webImageLinks.push(fullWebUrl);
                console.log(`✅ Link web corrigido gerado: ${fullWebUrl}`);
                
                // Adicionar informação detalhada ao email (sem link individual)
                attachmentInfo += `${index + 1}. 📎 ${fileName} (${sizeKB}KB)\n`;
                attachmentInfo += `   ✅ Anexada ao email\n\n`;
              } else {
                attachmentInfo += `${index + 1}. 📎 ${fileName} (${sizeKB}KB)\n`;
                attachmentInfo += `   ✅ Anexada ao email\n`;
                attachmentInfo += `   ❌ Link não disponível\n\n`;
              }
              
            } catch (readError) {
              console.error(`❌ Erro ao ler arquivo ${filePath}:`, readError);
              attachmentInfo += `${index + 1}. ❌ ${fileName} (erro ao ler arquivo)\n\n`;
            }
          } else {
            console.warn(`⚠️ Arquivo não encontrado: ${filePath}`);
            
            // Mesmo sem o arquivo, tentar gerar link web corrigido
            if (webUrl && messageData.serverUrl) {
              // Corrigir URL do servidor se contém localhost
              let correctedServerUrl = messageData.serverUrl;
              if (correctedServerUrl.includes('localhost') || correctedServerUrl.includes('127.0.0.1') || correctedServerUrl.includes(':5001')) {
                if (process.env.REPLIT_DEV_DOMAIN) {
                  correctedServerUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
                } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
                  correctedServerUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
                } else {
                  correctedServerUrl = 'https://your-replit-app.replit.app';
                }
              }
              
              const fullWebUrl = `${correctedServerUrl}${webUrl}`;
              webImageLinks.push(fullWebUrl);
              attachmentInfo += `${index + 1}. ⚠️ ${fileName} (arquivo não encontrado no servidor)\n\n`;
            } else {
              attachmentInfo += `${index + 1}. ❌ ${fileName} (arquivo e link não disponíveis)\n\n`;
            }
          }
          
        } catch (error) {
          console.error(`❌ Erro ao processar anexo ${index + 1}:`, error);
          attachmentInfo += `${index + 1}. ❌ ${path.basename(attachmentUrl)} (erro ao processar)\n\n`;
        }
      }
      
      // ===== SEÇÃO DE LINKS (APENAS UMA VEZ) =====
      if (webImageLinks.length > 0) {
        const uniqueLinks = Array.from(new Set(webImageLinks));
        attachmentInfo += `\n🔗 LINKS PARA VISUALIZAÇÃO (clique para abrir):\n`;
        uniqueLinks.forEach((link, index) => {
          const fileName = path.basename(link);
          attachmentInfo += `• ${fileName}: ${link}\n`;
        });
        attachmentInfo += `\n💡 Dica: Clique nos links acima para visualizar as imagens no navegador\n`;
      }
      
      console.log(`📎 === RESUMO DO PROCESSAMENTO ===`);
      console.log(`📎 Arquivos anexados ao email: ${emailAttachments.length}/${attachments.length}`);
      console.log(`🔗 Links web gerados: ${webImageLinks.length}`);
      console.log(`📎 Anexos para email:`, emailAttachments.map(a => a.filename));
      console.log(`🔗 Links web:`, webImageLinks);
      
    } else {
      console.log('📎 Nenhum anexo para processar');
    }
    
    const emailBody = `
Nova mensagem recebida via sistema web:

📩 Tipo: ${messageData.type}
👤 Nome: ${messageData.name}
📧 Email: ${messageData.email}
📝 Assunto: ${messageData.subject || 'Contato via site'}

💬 Mensagem:
${messageData.message}${attachmentInfo}

---
Enviado em: ${new Date().toLocaleString('pt-BR')}
Sistema de Contato Web
    `.trim();

    // Send email via Mailgun
    console.log(`📤 Sending email to: ${finalRecipient}`);
    console.log(`📬 From domain: ${MAILGUN_DOMAIN}`);

    const mailData: any = {
      from: `Sistema de Contato <noreply@${MAILGUN_DOMAIN}>`,
      to: finalRecipient,
      subject: emailSubject,
      text: emailBody,
      'h:Reply-To': messageData.email
    };

    // Adicionar anexos - formato correto para Mailgun.js v12
    if (emailAttachments.length > 0) {
      console.log(`📎 Configurando ${emailAttachments.length} anexo(s) para Mailgun:`);
      
      if (emailAttachments.length === 1) {
        // Para um único anexo, usar objeto simples
        mailData.attachment = {
          filename: emailAttachments[0].filename,
          data: emailAttachments[0].data,
          contentType: emailAttachments[0].contentType
        };
        console.log(`   📎 Anexo único: ${emailAttachments[0].filename} (${emailAttachments[0].data.length} bytes, ${emailAttachments[0].contentType})`);
      } else {
        // Para múltiplos anexos, usar array
        mailData.attachment = emailAttachments.map(att => ({
          filename: att.filename,
          data: att.data,
          contentType: att.contentType
        }));
        console.log(`   📎 Múltiplos anexos:`);
        emailAttachments.forEach((att, index) => {
          console.log(`      ${index + 1}. ${att.filename} (${att.data.length} bytes, ${att.contentType})`);
        });
      }
    }

    console.log('📋 Email data prepared:', {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      replyTo: mailData['h:Reply-To'],
      attachments: emailAttachments.length,
      hasAttachmentField: 'attachment' in mailData,
      attachmentFormat: emailAttachments.length > 0 ? typeof mailData.attachment : 'none'
    });

    // Log specific details for secret messages
    if (messageData.type === 'secret-message') {
      console.log('🤫 SECRET EMAIL DEBUG:');
      console.log('🤫 Final recipient:', finalRecipient);
      console.log('🤫 Original RECIPIENT_EMAIL:', RECIPIENT_EMAIL);
      console.log('🤫 Override email:', messageData.recipientOverride);
      console.log('🤫 Message type:', messageData.type);
      console.log('🤫 Email body preview:', emailBody.substring(0, 100) + '...');
    }

    console.log('🚀 Enviando email para Mailgun...');
    console.log('📋 Dados finais do email:', JSON.stringify({
      ...mailData,
      attachment: mailData.attachment ? 
        (Array.isArray(mailData.attachment) ? `[${mailData.attachment.length} anexos]` : '[1 anexo]') 
        : 'nenhum'
    }, null, 2));
    
    try {
      // Log detalhado antes do envio
      console.log('📤 === DEBUGANDO DADOS PARA MAILGUN ===');
      console.log('📤 Dominio:', MAILGUN_DOMAIN);
      console.log('📤 From:', mailData.from);
      console.log('📤 To:', mailData.to);
      console.log('📤 Subject:', mailData.subject);
      console.log('📤 Has attachment:', !!mailData.attachment);
      
      if (mailData.attachment) {
        if (Array.isArray(mailData.attachment)) {
          console.log('📤 Anexos (array):', mailData.attachment.length);
          mailData.attachment.forEach((att: any, idx: number) => {
            console.log(`   📎 ${idx + 1}: ${att.filename} (${att.data?.length || 0} bytes)`);
          });
        } else {
          console.log('📤 Anexo único:', (mailData.attachment as any).filename, `(${(mailData.attachment as any).data?.length || 0} bytes)`);
        }
      }
      
      const response = await client.messages.create(MAILGUN_DOMAIN, mailData);
      console.log('✅ Resposta do Mailgun recebida:', response);
      
      console.log('✅ Email sent successfully via Mailgun!');
      console.log('📊 Mailgun response:', response);
      console.log('📬 Mailgun ID:', response.id);
      console.log('📤 Status message:', response.message);
      
      // Additional logging for secret messages
      if (messageData.type === 'secret-message') {
        console.log('🤫 SECRET EMAIL SENT - ID:', response.id);
        console.log('🤫 SECRET EMAIL SENT - Status:', response.status);
      }

      return { success: true };
      
    } catch (mailgunError: any) {
      console.error('❌ ERRO ESPECÍFICO DO MAILGUN:', mailgunError);
      console.error('❌ Detalhes do erro:', {
        message: mailgunError.message,
        status: mailgunError.status,
        details: mailgunError.details || 'N/A'
      });
      
      // Tentar envio sem anexos como fallback
      if (mailData.attachment) {
        console.log('🔄 Tentando reenviar sem anexos como fallback...');
        const mailDataWithoutAttachments = {
          from: mailData.from,
          to: mailData.to,
          subject: mailData.subject + ' [ANEXOS REMOVIDOS]',
          text: mailData.text + '\n\n⚠️ ATENÇÃO: Os anexos foram removidos devido a erro técnico.',
          'h:Reply-To': mailData['h:Reply-To']
        };
        
        try {
          const fallbackResponse = await client.messages.create(MAILGUN_DOMAIN, mailDataWithoutAttachments);
          console.log('✅ Email enviado sem anexos como fallback:', fallbackResponse);
          return { success: true, error: 'Email enviado sem anexos devido a erro técnico' };
        } catch (fallbackError) {
          console.error('❌ Falha também no fallback sem anexos:', fallbackError);
        }
      }
      
      throw mailgunError;
    }

  } catch (error) {
    console.error('❌ Error sending email via Mailgun:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Test function to verify Mailgun configuration
export async function testMailgunConnection(): Promise<{success: boolean, error?: string}> {
  try {
    console.log('🔍 Testing Mailgun connection...');
    
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !RECIPIENT_EMAIL) {
      const missing = [];
      if (!MAILGUN_API_KEY) missing.push('MAILGUN_API_KEY');
      if (!MAILGUN_DOMAIN) missing.push('MAILGUN_DOMAIN');
      if (!RECIPIENT_EMAIL) missing.push('RECIPIENT_EMAIL');
      
      console.error('❌ Missing environment variables:', missing.join(', '));
      return { success: false, error: `Missing environment variables: ${missing.join(', ')}` };
    }

    const client = initializeMailgun();
    if (!client) {
      return { success: false, error: 'Failed to initialize Mailgun client' };
    }

    // Send a test email
    const testData = {
      name: 'Sistema de Teste',
      email: 'test@system.local',
      subject: 'Teste de Configuração do Sistema',
      message: 'Este é um email de teste para verificar se a configuração do sistema de email está funcionando corretamente.',
      type: 'test'
    };

    const result = await sendSupportEmail(testData);
    
    if (result.success) {
      console.log('✅ Mailgun test completed successfully!');
    } else {
      console.error('❌ Mailgun test failed:', result.error);
    }

    return result;

  } catch (error) {
    console.error('❌ Error testing Mailgun connection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}