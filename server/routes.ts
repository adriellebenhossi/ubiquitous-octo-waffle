/**
 * routes.ts
 * 
 * Definição das rotas da API do backend
 * Configura endpoints HTTP para comunicação frontend-backend
 * Utiliza interface de storage para operações de dados
 * Base para expansão de funcionalidades da API
 */

import type { Express, Request } from "express"; // Tipagem do Express
import { createServer, type Server } from "http"; // Servidor HTTP
import { storage } from "./storage"; // Interface de armazenamento
import { insertAdminUserSchema, insertSiteConfigSchema, insertTestimonialSchema, insertFaqItemSchema, insertServiceSchema, insertPhotoCarouselSchema, insertSpecialtySchema, insertSupportMessageSchema, insertCustomCodeSchema, insertCookieSettingsSchema, insertPrivacyPolicySchema, insertTermsOfUseSchema, insertArticleSchema, insertChatMessageSchema } from "@shared/schema";
import multer from "multer";

// Interface para requisições com arquivo
interface MulterRequest extends Request {
  file?: any;
}
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";
import { optimizeImage, createMultipleFormats, getOptimizedPath, cleanupOriginal } from "./utils/imageOptimizer";
import { sendSupportEmail, testMailgunConnection } from "./utils/emailService";
import { z } from "zod";
import AdminLogger from "./utils/logger";
import LogReporter from "./utils/logReporter";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Log de debug para verificar se as rotas estão sendo registradas
  console.log('🔧 Registrando rotas da API...');
  // Configuração do Multer para upload de imagens
  const storage_multer = multer.diskStorage({
    destination: (req: Request, file: any, cb: (error: Error | null, destination: string) => void) => {
      // Determinar o tipo de upload baseado na URL
      let uploadType = req.params.type || 'general'; // fallback para 'general'
      
      // Detectar tipo baseado na rota
      if (req.path.includes('/testimonials/')) {
        uploadType = 'testimonials';
      } else if (req.path.includes('/upload-image/support')) {
        uploadType = 'support';
      } else if (req.path.includes('/secret/')) {
        uploadType = 'secret';
      } else if (req.path.includes('/upload-image')) {
        // Para upload-image genérico, usar 'temp' temporariamente
        uploadType = 'temp';
      } else if (req.path.includes('/articles/')) {
        uploadType = 'articles';
      } else if (req.path.includes('/hero/') || req.path.includes('/avatar')) {
        uploadType = 'hero';
      } else if (req.path.includes('/gallery/')) {
        uploadType = 'gallery';
      }
      
      const uploadPath = path.join(process.cwd(), 'uploads', uploadType);

      // Cria diretório se não existir
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req: Request, file: any, cb: (error: Error | null, filename: string) => void) => {
      // Gera nome único mantendo a extensão original
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    fileFilter: (req: Request, file: any, cb: any) => {
      // Aceita apenas imagens
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
  });

  // Upload com memory storage para favicon (precisa de buffer)
  const uploadMemory = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req: Request, file: any, cb: any) => {
      // Aceita apenas imagens
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
  });

  // Serve static files with proper headers
  const express = await import('express');
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    maxAge: '7d',
    etag: true,
    setHeaders: (res, filePath) => {
      // Add cache headers for images
      if (filePath.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7 days
        res.setHeader('Vary', 'Accept-Encoding');
      }

      // Add WebP content type
      if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    }
  }));

  // Serve icons folder for favicons
  app.use('/icons', express.static(path.join(process.cwd(), 'client', 'public', 'icons'), {
    maxAge: '7d',
    etag: true,
    setHeaders: (res, filePath) => {
      // Add proper content types for favicon files
      if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      }
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }));

  // Authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminUser(username);

      if (!admin || admin.password !== password) {
        AdminLogger.logAccess(req, 'LOGIN', 'FAILED', `Failed login attempt for username: ${username}`);
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      AdminLogger.logAccess(req, 'LOGIN', 'SUCCESS', `Admin user ${username} logged in successfully`);
      // In a real app, you'd use JWT or sessions
      res.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      AdminLogger.logAccess(req, 'LOGIN', 'FAILED', `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Site config routes
  app.get("/api/admin/config", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota pública para configurações do site (sem autenticação)
  app.get("/api/config", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint público para verificar modo de manutenção (sem autenticação)
  app.get("/api/maintenance-check", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      const maintenanceConfig = configs.find((c: any) => c.key === 'maintenance_mode');
      const generalConfig = configs.find((c: any) => c.key === 'general_info');

      res.json({
        maintenance: {
          ...(maintenanceConfig?.value || {}),
          enabled: (maintenanceConfig?.value as any)?.isEnabled || false
        },
        general: generalConfig?.value || {}
      });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/config", async (req, res) => {
    try {
      console.log("🎯 SERVER - POST /api/admin/config chamado");
      console.log("📥 SERVER - Body recebido:", JSON.stringify(req.body, null, 2));
      console.log("📋 SERVER - Headers:", JSON.stringify(req.headers, null, 2));
      
      const validatedData = insertSiteConfigSchema.parse(req.body);
      console.log("✅ SERVER - Dados validados:", JSON.stringify(validatedData, null, 2));
      
      // Get old value for logging
      console.log("🔍 SERVER - Buscando configurações existentes...");
      const existingConfigs = await storage.getAllSiteConfigs();
      console.log("📊 SERVER - Total de configs existentes:", existingConfigs.length);
      
      const oldConfig = existingConfigs.find(c => c.key === validatedData.key);
      const oldValue = oldConfig ? oldConfig.value : null;
      console.log("🔍 SERVER - Config anterior encontrado:", !!oldConfig);
      console.log("📝 SERVER - Valor anterior:", JSON.stringify(oldValue, null, 2));
      
      console.log("💾 SERVER - Salvando nova configuração...");
      const config = await storage.setSiteConfig(validatedData);
      console.log("✅ SERVER - Configuração salva:", JSON.stringify(config, null, 2));
      
      // Log the change
      AdminLogger.logChange(req, 'site_config', validatedData.key, oldValue, validatedData.value);
      console.log("📝 SERVER - Log administrativo registrado");
      
      console.log("🎉 SERVER - Resposta enviada com sucesso");
      res.json(config);
    } catch (error) {
      console.error("💥 SERVER - ERRO no POST /api/admin/config:", error);
      console.error("💥 SERVER - Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to update config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/config/:key", async (req, res) => {
    try {
      const key = req.params.key;
      
      // Get current value before deletion for logging
      const existingConfigs = await storage.getAllSiteConfigs();
      const configToDelete = existingConfigs.find(c => c.key === key);
      const oldValue = configToDelete ? configToDelete.value : null;
      
      await storage.deleteSiteConfig(key);
      
      // Log the deletion
      AdminLogger.logDelete(req, 'site_config', key, oldValue);
      
      res.json({ success: true });
    } catch (error) {
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to delete config ${req.params.key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: "Erro ao remover configuração" });
    }
  });

  // Admin Logs routes
  app.get("/api/admin/logs/changes", async (req, res) => {
    try {
      AdminLogger.logAccess(req, 'ACCESS', 'SUCCESS', 'Viewed admin changes log');
      const monthYear = req.query.month as string;
      const logs = AdminLogger.readLogs('changes', monthYear);
      res.json({ logs, months: AdminLogger.getAvailableMonths() });
    } catch (error) {
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to view changes log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: "Erro ao carregar logs" });
    }
  });

  app.get("/api/admin/logs/access", async (req, res) => {
    try {
      AdminLogger.logAccess(req, 'ACCESS', 'SUCCESS', 'Viewed admin access log');
      const monthYear = req.query.month as string;
      const logs = AdminLogger.readLogs('access', monthYear);
      res.json({ logs, months: AdminLogger.getAvailableMonths() });
    } catch (error) {
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to view access log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: "Erro ao carregar logs" });
    }
  });

  // Upload de favicon
  app.post("/api/admin/upload/favicon", uploadMemory.single('image'), async (req: MulterRequest, res) => {
    try {
      console.log('📁 Iniciando upload de favicon...');
      
      if (!req.file) {
        console.log('❌ Nenhum arquivo enviado');
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log('📄 Arquivo recebido:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer ? req.file.buffer.length : 'N/A'
      });

      // Criar diretório de ícones se não existir
      const iconsDir = path.join(process.cwd(), 'client', 'public', 'icons');
      await fs.mkdir(iconsDir, { recursive: true });
      console.log('📁 Diretório criado/verificado:', iconsDir);

      // Converter e salvar diferentes tamanhos (usando buffer do memory storage)
      const inputBuffer = req.file.buffer;
      console.log('🔄 Processando imagem com Sharp...');

      // Favicon ICO (32x32)
      await sharp(inputBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(iconsDir, 'favicon.ico'));

      // Favicon 16x16 PNG
      await sharp(inputBuffer)
        .resize(16, 16)
        .png()
        .toFile(path.join(iconsDir, 'favicon-16x16.png'));

      // Favicon 32x32 PNG
      await sharp(inputBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(iconsDir, 'favicon-32x32.png'));

      // Apple Touch Icon 180x180
      await sharp(inputBuffer)
        .resize(180, 180)
        .png()
        .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

      res.json({ 
        success: true, 
        message: "Favicon atualizado com sucesso",
        files: ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png']
      });
    } catch (error) {
      console.error('Erro no upload do favicon:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Deletar favicon (restaurar padrão)
  app.delete("/api/admin/upload/favicon", async (req, res) => {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      const iconsDir = path.join(process.cwd(), 'client', 'public', 'icons');
      const iconFiles = ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'];

      // Remover ícones customizados se existirem
      for (const file of iconFiles) {
        try {
          await fs.unlink(path.join(iconsDir, file));
        } catch (error) {
          // Ignorar erro se arquivo não existir
        }
      }

      // Restaurar favicon padrão
      const defaultFaviconData = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A';

      // Criar favicon padrão simples
      const sharp = require('sharp');
      const defaultIcon = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x20, 0x08, 0x06, 0x00, 0x00, 0x00, 0x73, 0x7A, 0x7A,
        0xF4, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45, 0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61, 0x72,
        0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65, 0x61,
        0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00, 0x00, 0x03, 0x8D, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA
      ]);

      // Salvar favicon padrão
      await sharp({
        create: {
          width: 32,
          height: 32,
          channels: 4,
          background: { r: 236, g: 72, b: 153, alpha: 1 }
        }
      })
      .png()
      .toFile(path.join(iconsDir, 'favicon.ico'));

      res.json({ success: true, message: "Favicon restaurado para o padrão" });
    } catch (error) {
      console.error('Erro ao restaurar favicon:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Reset completo do ícone do site (remover completamente)
  app.delete("/api/admin/site-icon/reset", async (req, res) => {
    try {
      console.log('🗑️ ENDPOINT /api/admin/site-icon/reset chamado');
      
      let removedFiles = 0;
      let totalAttempts = 0;

      // Remover todos os arquivos de favicon
      const iconsDir = path.join(process.cwd(), 'client', 'public', 'icons');
      const iconFiles = ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'];

      console.log('📁 Verificando diretório de ícones:', iconsDir);

      // Criar diretório se não existir
      try {
        await fs.mkdir(iconsDir, { recursive: true });
        console.log('✅ Diretório de ícones garantido');
      } catch (error) {
        console.log('⚠️ Aviso ao criar diretório:', error instanceof Error ? error.message : String(error));
      }

      for (const file of iconFiles) {
        totalAttempts++;
        try {
          const filePath = path.join(iconsDir, file);
          await fs.unlink(filePath);
          removedFiles++;
          console.log(`🗑️ Arquivo removido: ${file}`);
        } catch (error) {
          console.log(`ℹ️ Arquivo não encontrado ou não removível: ${file}`);
        }
      }

      // Remover ícones personalizados se existirem
      const uploadsDir = path.join(process.cwd(), 'uploads', 'site-icon');
      console.log('📁 Verificando diretório de uploads:', uploadsDir);
      
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
        const files = await fs.readdir(uploadsDir);
        for (const file of files) {
          totalAttempts++;
          try {
            const filePath = path.join(uploadsDir, file);
            await fs.unlink(filePath);
            removedFiles++;
            console.log(`🗑️ Upload removido: ${file}`);
          } catch (error) {
            console.log(`⚠️ Erro ao remover upload ${file}:`, error instanceof Error ? error.message : String(error));
          }
        }
      } catch (error) {
        console.log('ℹ️ Diretório de uploads não encontrado ou vazio:', error instanceof Error ? error.message : String(error));
      }

      console.log(`✅ Reset concluído: ${removedFiles} de ${totalAttempts} arquivos processados`);
      res.json({ 
        success: true, 
        message: "Reset do ícone realizado com sucesso",
        details: {
          removedFiles,
          totalAttempts
        }
      });
    } catch (error) {
      console.error('❌ Erro CRÍTICO ao resetar ícone do site:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        error: "Erro no reset do ícone",
        details: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Sistema robusto de favicon - compatível com Render.com
  app.post("/api/admin/generate/preset-favicon", async (req, res) => {
    console.log('🎯 ENDPOINT /api/admin/generate/preset-favicon chamado');
    console.log('📥 Request body:', req.body);
    
    try {
      const { iconId } = req.body;
      console.log('🎨 Gerando favicon para ícone predefinido:', iconId);

      if (!iconId) {
        console.log('❌ iconId não fornecido');
        return res.status(400).json({ error: "iconId é obrigatório" });
      }

      // Importar gerador aprimorado de ícones
      const { getIconAsBase64 } = await import('./utils/presetIconGenerator.js');
      
      // Gerar ícone completo
      console.log('🎨 Gerando ícone completo para armazenamento...');
      const iconData = await getIconAsBase64(iconId);
      
      // Salvar no banco de dados (sempre funciona)
      await storage.setSiteConfig({
        key: 'preset_favicon_data',
        value: iconData
      });
      
      console.log('✅ Favicon gerado e salvo no banco de dados');

      // Tentar copiar ícones predefinidos para local público (se possível)
      try {
        const presetIconsDir = path.join(process.cwd(), 'client', 'public', 'icons', 'presets');
        const publicIconsDir = path.join(process.cwd(), 'client', 'public', 'icons');
        
        // Tentar copiar arquivos predefinidos
        const iconFiles = [
          { src: `${iconId}.ico`, dest: 'favicon.ico' },
          { src: `${iconId}-16x16.png`, dest: 'favicon-16x16.png' },
          { src: `${iconId}-32x32.png`, dest: 'favicon-32x32.png' },
          { src: `${iconId}-180x180.png`, dest: 'apple-touch-icon.png' }
        ];
        
        for (const { src, dest } of iconFiles) {
          try {
            const srcPath = path.join(presetIconsDir, src);
            const destPath = path.join(publicIconsDir, dest);
            await fs.copyFile(srcPath, destPath);
          } catch (copyError) {
            console.log(`⚠️ Não foi possível copiar ${src}: arquivo será servido do banco`);
          }
        }
        
        console.log('✅ Ícones copiados para pasta pública (quando possível)');
      } catch (fsError) {
        console.log('⚠️ Filesystem somente leitura - ícones serão servidos do banco');
      }

      console.log('✅ Sistema de favicon configurado com sucesso');

      res.json({ 
        success: true, 
        message: "Favicon gerado com sucesso",
        iconId: iconId,
        color: iconData.color
      });

    } catch (error) {
      console.error('❌ ERRO DETALHADO:', error);
      res.status(500).json({ 
        error: "Falha ao gerar favicon do ícone predefinido",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Endpoint para servir favicons do banco (compatibilidade Render.com)
  app.get("/api/favicon/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      console.log('🔄 Solicitação de favicon do banco:', filename);
      
      // Buscar dados do favicon no banco
      const faviconConfig = await storage.getSiteConfig('preset_favicon_data');
      
      if (!faviconConfig?.value) {
        console.log('❌ Nenhum favicon encontrado no banco');
        return res.status(404).json({ error: 'Favicon não encontrado' });
      }
      
      const iconData = faviconConfig.value as any;
      let base64Data: string;
      let contentType: string;
      
      // Mapear nome do arquivo para dados corretos
      switch (filename) {
        case 'favicon.ico':
          base64Data = iconData.favicon;
          contentType = 'image/x-icon';
          break;
        case 'favicon-16x16.png':
          base64Data = iconData.favicon16;
          contentType = 'image/png';
          break;
        case 'favicon-32x32.png':
          base64Data = iconData.favicon32;
          contentType = 'image/png';
          break;
        case 'apple-touch-icon.png':
          base64Data = iconData.appleTouchIcon;
          contentType = 'image/png';
          break;
        default:
          return res.status(404).json({ error: 'Arquivo não encontrado' });
      }
      
      if (!base64Data) {
        return res.status(404).json({ error: 'Dados do favicon não encontrados' });
      }
      
      // Converter base64 para buffer e enviar
      const buffer = Buffer.from(base64Data, 'base64');
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=86400', // 24 horas
        'ETag': `"${iconData.iconId}-${iconData.color}"`
      });
      
      console.log('✅ Favicon servido do banco:', filename);
      res.send(buffer);
      
    } catch (error) {
      console.error('❌ Erro ao servir favicon do banco:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Upload de ícone do site
  app.post("/api/admin/upload/site-icon", uploadMemory.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado" });
      }

      // Processa a imagem usando Sharp para criar favicon
      const iconBuffer = await sharp(req.file.buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();

      const iconPath = `uploads/site-icon/favicon.png`;
      const fullIconPath = path.join(process.cwd(), iconPath);

      // Cria o diretório se não existir
      await fs.mkdir(path.dirname(fullIconPath), { recursive: true });

      // Salva o arquivo
      await fs.writeFile(fullIconPath, iconBuffer);

      res.json({ 
        path: `/${iconPath}`,
        message: "Ícone do site enviado com sucesso" 
      });
    } catch (error) {
      console.error("Erro no upload do ícone:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Deletar ícone do site
  app.delete("/api/admin/upload/site-icon", async (req, res) => {
    try {
      const iconPath = path.join(process.cwd(), 'uploads/site-icon/favicon.png');

      try {
        await fs.access(iconPath);
        await fs.unlink(iconPath);
      } catch (error) {
        // File doesn't exist, that's fine
      }

      res.json({ message: "Ícone removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover ícone:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de imagens (hero, testimonials, carousel)
  app.post("/api/admin/upload/:type", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const uploadType = req.params.type; // 'hero', 'testimonials', 'carousel'
      console.log(`📸 Upload de ${uploadType} iniciado:`, req.file.filename);
      
      // Caminho completo do arquivo
      const originalPath = req.file.path;
      console.log(`📁 Arquivo salvo em:`, originalPath);
      
      // Otimizar a imagem (redimensionar e converter para WebP)
      const optimizedPath = await optimizeImage(originalPath, uploadType);
      console.log(`🔧 Imagem otimizada salva em:`, optimizedPath);
      
      // Remover arquivo original
      await cleanupOriginal(originalPath);
      console.log(`🗑️ Arquivo original removido:`, originalPath);
      
      // Retornar caminho relativo da imagem otimizada
      const relativePath = getOptimizedPath(req.file.filename, uploadType);
      console.log(`✅ Upload concluído. Caminho relativo:`, relativePath);

      // Se for upload de hero, atualiza a configuração
      if (uploadType === 'hero') {
        await storage.setSiteConfig({ key: 'hero_image', value: { path: relativePath } });
      }

      res.json({ 
        success: true, 
        imagePath: relativePath,
        filename: req.file.filename,
        message: "Imagem carregada e otimizada para WebP com sucesso!"
      });
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getActiveTestimonials();
      console.log('Depoimentos encontrados:', testimonials);
      res.json(testimonials);
    } catch (error) {
      console.error('Erro ao buscar testimonials:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error('Erro ao buscar testimonials (admin):', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });



  app.post("/api/admin/testimonials", async (req, res) => {
    try {
      console.log('📝 POST /api/admin/testimonials - Dados recebidos:', req.body);
      
      // Validar os dados usando o schema corrigido
      const testimonialData = insertTestimonialSchema.parse(req.body);
      console.log('✅ Validação do schema ok');
      
      // Criar o depoimento
      const testimonial = await storage.createTestimonial(testimonialData);
      console.log('✅ Depoimento criado:', testimonial.id);
      
      res.json(testimonial);
    } catch (error) {
      console.error('❌ Erro ao criar depoimento:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Erro desconhecido" });
      }
    }
  });

  // Rota de teste simples para verificar se está sendo atingida
  app.put("/api/admin/testimonials/test-reorder", async (req, res) => {
    console.log("🧪 TEST REORDER ENDPOINT HIT!");
    console.log("🧪 Body:", req.body);
    console.log("🧪 Path:", req.path);
    res.json({ message: "Test reorder endpoint working", body: req.body });
  });

  // Rota de reordenamento para Testimonials (DEVE vir antes da rota :id)
  app.put("/api/admin/testimonials/reorder", async (req, res) => {
    try {
      console.log("🔄 Testimonials REORDER ENDPOINT HIT!");
      console.log("🔄 Testimonials REORDER - Raw body:", req.body);
      console.log("🔄 Testimonials REORDER - Body type:", typeof req.body);
      
      // Verificar se os dados chegaram como array direto ou dentro de uma propriedade
      let reorderData;
      
      if (Array.isArray(req.body)) {
        console.log("✅ Testimonials REORDER - Dados são array direto");
        reorderData = req.body;
      } else if (req.body && Array.isArray(req.body.items)) {
        console.log("✅ Testimonials REORDER - Dados estão em req.body.items");
        reorderData = req.body.items;
      } else if (req.body && req.body.value && Array.isArray(req.body.value)) {
        console.log("✅ Testimonials REORDER - Dados estão em req.body.value");
        reorderData = req.body.value;
      } else {
        console.error("❌ Testimonials REORDER - Formato inválido:", req.body);
        return res.status(400).json({ 
          error: "Dados de reordenação devem ser um array",
          received: typeof req.body,
          body: req.body
        });
      }
      
      if (!Array.isArray(reorderData) || reorderData.length === 0) {
        console.error("❌ Testimonials REORDER - Array vazio ou inválido:", reorderData);
        return res.status(400).json({ error: "Array de reordenação vazio ou inválido" });
      }
      
      console.log("🔄 Testimonials REORDER - Processando array válido:", reorderData);
      await storage.reorderTestimonials(reorderData);
      
      const updatedTestimonials = await storage.getAllTestimonials();
      console.log("✅ Testimonials REORDER concluída:", updatedTestimonials.length, "itens");
      res.json(updatedTestimonials);
    } catch (error) {
      console.error("❌ Erro ao reordenar depoimentos:", error);
      res.status(500).json({ error: "Erro ao reordenar depoimentos" });
    }
  });

  app.put("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testimonialData = req.body;

      console.log("Atualizando depoimento:", { id, testimonialData });

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const testimonial = await storage.updateTestimonial(id, testimonialData);

      console.log("Depoimento atualizado:", testimonial);

      res.json(testimonial);
    } catch (error) {
      console.error("Erro ao atualizar depoimento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestimonial(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // FAQ routes
  app.get("/api/faq", async (req, res) => {
    try {
      const faqItems = await storage.getActiveFaqItems();
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // FAQ routes - Public route first
  app.get("/api/faq", async (req, res) => {
    try {
      const faqItems = await storage.getActiveFaqItems();
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/faq", async (req, res) => {
    try {
      const faqItems = await storage.getAllFaqItems();
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de reordenamento para FAQ (DEVE vir antes da rota :id)
  app.put("/api/admin/faq/reorder", async (req, res) => {
    try {
      console.log("🔄 Recebendo dados de reordenação FAQ:", req.body);
      const reorderData = req.body; // Array de { id: number, order: number }
      await storage.reorderFaqItems(reorderData);
      const updatedFaqItems = await storage.getAllFaqItems();
      console.log("✅ Reordenação FAQ concluída:", updatedFaqItems.length, "itens");
      res.json(updatedFaqItems);
    } catch (error) {
      console.error("❌ Erro ao reordenar FAQ:", error);
      res.status(500).json({ error: "Erro ao reordenar FAQ" });
    }
  });

  app.post("/api/admin/faq", async (req, res) => {
    try {
      const faqData = insertFaqItemSchema.parse(req.body);
      const faqItem = await storage.createFaqItem(faqData);
      
      // Log the creation
      AdminLogger.logCreate(req, 'faq', faqItem.id.toString(), { question: faqData.question, answer: faqData.answer });
      
      res.json(faqItem);
    } catch (error) {
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to create FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/faq/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faqData = req.body;
      
      // Get old value for logging
      const allFaqs = await storage.getAllFaqItems();
      const oldFaq = allFaqs.find(f => f.id === id);
      
      const faqItem = await storage.updateFaqItem(id, faqData);
      
      // Log the update
      AdminLogger.logChange(req, 'faq', id.toString(), oldFaq, faqData);
      
      res.json(faqItem);
    } catch (error) {
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to update FAQ ${req.params.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/faq/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get item before deletion for logging
      const allFaqs = await storage.getAllFaqItems();
      const faqToDelete = allFaqs.find(f => f.id === id);
      
      await storage.deleteFaqItem(id);
      
      // Log the deletion
      AdminLogger.logDelete(req, 'faq', id.toString(), faqToDelete);
      
      res.json({ success: true });
    } catch (error) {
      AdminLogger.logAccess(req, 'ACCESS', 'FAILED', `Failed to delete FAQ ${req.params.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de reordenamento para Services (DEVE vir antes da rota :id)
  app.put("/api/admin/services/reorder", async (req, res) => {
    try {
      console.log("🔄 Recebendo dados de reordenação Services:", req.body);
      const reorderData = req.body; // Array de { id: number, order: number }
      await storage.reorderServices(reorderData);
      const updatedServices = await storage.getAllServices();
      console.log("✅ Reordenação Services concluída:", updatedServices.length, "itens");
      res.json(updatedServices);
    } catch (error) {
      console.error("❌ Erro ao reordenar serviços:", error);
      res.status(500).json({ error: "Erro ao reordenar serviços" });
    }
  });

  app.post("/api/admin/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = req.body;
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Photo Carousel routes
  app.get("/api/photo-carousel", async (req, res) => {
    try {
      const photos = await storage.getActivePhotoCarousel();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/photo-carousel", async (req, res) => {
    try {
      const photos = await storage.getAllPhotoCarousel();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de reordenamento para Photo Carousel (DEVE vir antes da rota :id)
  app.put("/api/admin/photo-carousel/reorder", async (req, res) => {
    try {
      console.log("🔄 Recebendo dados de reordenação Photo Carousel:", req.body);
      const reorderData = req.body; // Array de { id: number, order: number }
      await storage.reorderPhotoCarousel(reorderData);
      const updatedPhotoCarousel = await storage.getAllPhotoCarousel();
      console.log("✅ Reordenação Photo Carousel concluída:", updatedPhotoCarousel.length, "itens");
      res.json(updatedPhotoCarousel);
    } catch (error) {
      console.error("❌ Erro ao reordenar fotos:", error);
      res.status(500).json({ error: "Erro ao reordenar fotos" });
    }
  });

  app.post("/api/admin/photo-carousel", async (req, res) => {
    try {
      const photoData = insertPhotoCarouselSchema.parse(req.body);
      const photo = await storage.createPhotoCarousel(photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/photo-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photoData = req.body;
      const photo = await storage.updatePhotoCarousel(id, photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/photo-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhotoCarousel(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Specialties routes
  app.get("/api/specialties", async (req, res) => {
    try {
      const specialties = await storage.getActiveSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/specialties", async (req, res) => {
    try {
      const specialties = await storage.getAllSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota de reordenamento para Specialties (DEVE vir antes da rota :id)
  app.put("/api/admin/specialties/reorder", async (req, res) => {
    try {
      console.log("🔄 Recebendo dados de reordenação Specialties:", req.body);
      const reorderData = req.body; // Array de { id: number, order: number }
      await storage.reorderSpecialties(reorderData);
      const updatedSpecialties = await storage.getAllSpecialties();
      console.log("✅ Reordenação Specialties concluída:", updatedSpecialties.length, "itens");
      res.json(updatedSpecialties);
    } catch (error) {
      console.error("❌ Erro ao reordenar especialidades:", error);
      res.status(500).json({ error: "Erro ao reordenar especialidades" });
    }
  });

  app.post("/api/admin/specialties", async (req, res) => {
    try {
      const specialtyData = insertSpecialtySchema.parse(req.body);
      const specialty = await storage.createSpecialty(specialtyData);
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const specialtyData = req.body;
      const specialty = await storage.updateSpecialty(id, specialtyData);
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSpecialty(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Contact settings routes - DIAGNÓSTICO
  app.get("/api/contact-settings/debug", async (req, res) => {
    try {
      console.log('🔧 ROTA DIAGNÓSTICO ATIVADA');
      
      // Query SQL direta para verificar dados no banco
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      
      const rawQuery = await db.execute(sql`
        SELECT id, contact_card, info_card, 
               contact_card->>'title' as contact_title,
               info_card->>'title' as info_title
        FROM contact_settings WHERE id = 1
      `);
      
      console.log('🔍 Dados diretos do PostgreSQL:', JSON.stringify(rawQuery.rows[0], null, 2));
      
      res.json({
        message: "Diagnóstico completo",
        rawData: rawQuery.rows[0],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
      res.status(500).json({ error: "Erro no diagnóstico", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/contact-settings", async (req, res) => {
    try {
      const contactSettings = await storage.getContactSettings();
      res.json(contactSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/contact-settings", async (req, res) => {
    try {
      console.log('🔄 GET /api/admin/contact-settings - SOLUÇÃO FINAL ATIVADA');
      
      // Query SQL direta e completamente nova para garantir que funcionará
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      
      console.log('🔧 Executando query SQL direta...');
      const result = await db.execute(sql`
        SELECT 
          id, 
          contact_items, 
          schedule_info, 
          location_info, 
          contact_card, 
          info_card, 
          updated_at
        FROM contact_settings 
        WHERE id = 1
        LIMIT 1
      `);
      
      console.log('🔍 Query SQL - Resultado bruto:', JSON.stringify(result.rows[0], null, 2));
      
      if (!result.rows || result.rows.length === 0) {
        console.log('⚠️ Nenhum resultado encontrado na query SQL');
        return res.status(404).json({ error: "Contact settings não encontrados" });
      }
      
      const rawData = result.rows[0];
      
      // Construir resposta garantindo que os campos card existam
      const responseData = {
        id: rawData.id,
        contact_items: rawData.contact_items || [],
        schedule_info: rawData.schedule_info || {},
        location_info: rawData.location_info || {},
        contact_card: rawData.contact_card || {
          title: "Entre em Contato",
          description: "Escolha a forma mais conveniente para você",
          icon: "Mail",
          iconColor: "#6366f1",
          backgroundColor: "#ffffff"
        },
        info_card: rawData.info_card || {
          title: "Informações de Atendimento",
          description: "Horários e localização",
          icon: "Info",
          iconColor: "#059669",
          backgroundColor: "#ffffff"
        },
        updatedAt: rawData.updated_at
      };
      
      console.log('📤 SOLUÇÃO FINAL - Dados a retornar:', JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } catch (error) {
      console.error('❌ Erro crítico na SOLUÇÃO FINAL:', error);
      res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/admin/contact-settings", async (req, res) => {
    try {
      console.log('🔄 PUT /api/admin/contact-settings - Iniciando atualização');
      console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
      
      const contactSettings = await storage.updateContactSettings(req.body);
      
      console.log('✅ Configurações de contato atualizadas com sucesso');
      console.log('📤 Response data:', JSON.stringify(contactSettings, null, 2));
      
      res.json(contactSettings);
    } catch (error) {
      console.error('❌ Erro ao atualizar contact settings:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Footer settings routes
  app.get("/api/footer-settings", async (req, res) => {
    try {
      const footerSettings = await storage.getFooterSettings();
      res.json(footerSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/footer-settings", async (req, res) => {
    try {
      const footerSettings = await storage.getFooterSettings();
      res.json(footerSettings);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/footer-settings", async (req, res) => {
    try {
      console.log('🔄 PUT /api/admin/footer-settings - Iniciando atualização');
      console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
      
      const footerSettings = await storage.updateFooterSettings(req.body);
      
      console.log('✅ Configurações atualizadas com sucesso');
      console.log('📤 Response data:', JSON.stringify(footerSettings, null, 2));
      
      res.json(footerSettings);
    } catch (error) {
      console.error('❌ Erro ao atualizar footer settings:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Endpoint temporário para reset dos badges
  app.post("/api/admin/reset-footer-badges", async (req, res) => {
    try {
      await storage.resetFooterSettings();
      const newSettings = await storage.getFooterSettings();
      res.json(newSettings);
    } catch (error) {
      console.error('Error resetting footer badges:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Support message routes
  app.get("/api/admin/support-messages", async (req, res) => {
    try {
      const messages = await storage.getAllSupportMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint de teste temporário
  app.post("/api/admin/test-support-message", async (req, res) => {
    try {
      console.log('🧪 TEST ENDPOINT CHAMADO - Dados recebidos:', req.body);
      console.log('🧪 TEST REQUEST PATH:', req.path);
      console.log('🧪 TEST REQUEST URL:', req.url);
      
      // Testar se o schema funciona
      try {
        const testResult = insertSupportMessageSchema.parse(req.body);
        console.log('✅ TEST - Schema válido:', testResult);
        res.json({ success: true, validData: testResult });
      } catch (schemaError: any) {
        console.error('❌ TEST - Erro de schema:', schemaError);
        res.status(400).json({ 
          success: false, 
          error: 'Schema validation failed',
          details: schemaError.errors || schemaError.message,
          received: req.body
        });
      }
    } catch (error) {
      console.error('❌ TEST - Erro geral:', error);
      res.status(500).json({ success: false, error: 'Internal error' });
    }
  });
  
  console.log('✅ Rota de teste registrada: /api/admin/test-support-message');

  // Endpoint simplificado sem validação complexa
  app.post("/api/admin/support-messages-simple", async (req, res) => {
    try {
      console.log('📥 SIMPLE - Dados recebidos:', req.body);
      
      const { name, email, message, type, attachments } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Campos obrigatórios em falta' });
      }
      
      console.log('📎 Anexos recebidos:', attachments);
      
      // Dados simples sem validação schema
      const simpleData = {
        name: name,
        email: email, 
        message: message,
        type: type || 'contact',
        attachments: Array.isArray(attachments) ? attachments : [],
        isRead: false
      };
      
      console.log('✅ SIMPLE - Dados preparados:', simpleData);
      
      // Tentar enviar email via Mailgun
      let emailSent = false;
      try {
        // Construir URL completa do servidor
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
        const serverUrl = `${protocol}://${host}`;
        
        const emailData = {
          ...simpleData,
          subject: `Contato ${type === 'support' ? 'Suporte' : type === 'feedback' ? 'Feedback' : type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'Geral'}`,
          serverUrl: serverUrl
        };
        
        console.log('📧 === DEBUG EMAIL DATA ===');
        console.log('📧 Dados completos do email:', {
          name: emailData.name,
          email: emailData.email,
          type: emailData.type,
          subject: emailData.subject,
          messageLength: emailData.message?.length,
          attachments: emailData.attachments,
          attachmentsType: typeof emailData.attachments,
          attachmentsLength: emailData.attachments?.length,
          hasAttachments: !!(emailData.attachments && emailData.attachments.length > 0),
          serverUrl: emailData.serverUrl
        });
        
        if (emailData.attachments && emailData.attachments.length > 0) {
          console.log('📎 === DETALHES DOS ANEXOS ===');
          emailData.attachments.forEach((att, index) => {
            console.log(`📎 Anexo ${index + 1}:`, {
              url: att,
              tipo: typeof att,
              valido: !!att && typeof att === 'string'
            });
          });
        }
        
        const emailResult = await sendSupportEmail(emailData);
        emailSent = emailResult.success;
        
        if (emailResult.success) {
          console.log('✅ Email enviado com sucesso via Mailgun');
        } else {
          console.warn('⚠️ Falha no envio do email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
      }
      
      res.json({ success: true, data: simpleData, emailSent });
      
    } catch (error) {
      console.error('❌ SIMPLE - Erro:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  });

  app.post("/api/admin/support-messages", async (req, res) => {
    try {
      console.log('📥 Dados recebidos no backend:', req.body);
      console.log('🔍 Validando com schema insertSupportMessageSchema...');
      
      const messageData = insertSupportMessageSchema.parse(req.body);
      console.log('✅ Dados válidos após parse:', messageData);

      // Valores padrão para nome e email
      const finalData = {
        ...messageData,
        name: messageData.name || "Sistema do Site",
        email: messageData.email || "noreply@sistema.local"
      };

      // Salvar mensagem no banco
      const message = await storage.createSupportMessage(finalData);

      // Gerar assunto automático baseado no tipo
      const getSubjectByType = (type: string) => {
        switch (type) {
          case "support": return "Solicitação de Suporte - Site";
          case "contact": return "Mensagem de Contato - Site";
          case "feedback": return "Sugestão/Feedback - Site";
          case "bug": return "Relatório de Problema - Site";
          case "feature": return "Solicitação de Funcionalidade - Site";
          default: return "Mensagem do Site";
        }
      };

      // Construir URL completa do servidor
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
      const serverUrl = `${protocol}://${host}`;

      // Enviar email
      const emailResult = await sendSupportEmail({
        name: finalData.name || "Anônimo",
        email: finalData.email || "nao-fornecido@exemplo.com",
        subject: getSubjectByType(finalData.type || "contact"),
        message: finalData.message || "Mensagem vazia",
        type: finalData.type || "contact",
        attachments: finalData.attachments || [],
        serverUrl: serverUrl
      });

      if (!emailResult.success) {
        console.error('Falha ao enviar email:', emailResult.error);
        // Mesmo se o email falhar, salvamos a mensagem no banco
      }

      res.json({ 
        ...message, 
        emailSent: emailResult.success,
        emailError: emailResult.error 
      });
    } catch (error) {
      console.error('❌ Erro detalhado ao criar mensagem de suporte:', error);
      if (error instanceof z.ZodError) {
        console.error('🔍 Erros de validação Zod:', error.errors);
        res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors,
          received: req.body 
        });
      } else {
        res.status(400).json({ error: "Dados inválidos" });
      }
    }
  });

  app.put("/api/admin/support-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const message = await storage.updateSupportMessage(id, updateData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/support-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupportMessage(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Email testing routes
  app.post("/api/admin/test-email-connection", async (req, res) => {
    try {
      console.log('🔍 Testing Mailgun connection via API...');
      const result = await testMailgunConnection();
      
      console.log('📊 Test result:', result);
      res.json(result);
    } catch (error) {
      console.error('❌ Error in test email connection endpoint:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/admin/send-test-email", async (req, res) => {
    try {
      console.log('📧 Sending test email via API...');
      console.log('Request body:', req.body);

      const { name, email, message, type } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: name, email, message' 
        });
      }

      const emailResult = await sendSupportEmail({
        name,
        email,
        subject: `Teste de Email - ${type || 'test'}`,
        message,
        type: type || 'test'
      });

      console.log('📊 Email send result:', emailResult);
      res.json(emailResult);
    } catch (error) {
      console.error('❌ Error in send test email endpoint:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Custom Codes routes (Marketing tab - Header/Body codes)
  app.get("/api/admin/custom-codes", async (req, res) => {
    try {
      const codes = await storage.getAllCustomCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/custom-codes/:location", async (req, res) => {
    try {
      const location = req.params.location as 'header' | 'body';
      const codes = await storage.getCustomCodesByLocation(location);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/custom-codes", async (req, res) => {
    try {
      const codeData = insertCustomCodeSchema.parse(req.body);
      const code = await storage.createCustomCode(codeData);
      res.json(code);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/custom-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCustomCodeSchema.partial().parse(req.body);
      const code = await storage.updateCustomCode(id, updateData);
      res.json(code);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/custom-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomCode(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/custom-codes/reorder", async (req, res) => {
    try {
      const reorderData = req.body;
      await storage.reorderCustomCodes(reorderData);
      const updatedCodes = await storage.getAllCustomCodes();
      res.json(updatedCodes);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ================================
  // SECRET CHAT ROUTES
  // ================================
  
  // Autenticação para o secret (usa mesmas credenciais do admin)
  app.post("/api/secret/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminUser(username);

      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Sessão simples para o chat
      res.json({ success: true, authenticated: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Envio de mensagem do secret
  app.post("/api/secret/send", upload.array('attachments'), async (req: MulterRequest, res) => {
    try {
      console.log('🤫 Secret - Recebendo mensagem...');
      console.log('🤫 Secret - Body:', req.body);
      console.log('🤫 Secret - Files:', req.files);

      const { message } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }

      // Processar anexos de imagem com backup em base64 para Render.com
      let attachments: string[] = [];
      const attachmentBackups: Array<{url: string, base64: string, filename: string}> = [];
      
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          try {
            console.log('📎 Secret - Processando anexo:', file.filename);
            const originalPath = file.path;
            
            // Otimizar imagem para o secret 
            const optimizedPath = await optimizeImage(originalPath, 'secret');
            await cleanupOriginal(originalPath);
            
            const imageUrl = `/uploads/secret/${path.basename(optimizedPath)}`;
            
            // NOVO: Criar backup em base64 para Render.com
            try {
              const { readFileSync } = await import('fs');
              const imageBuffer = readFileSync(optimizedPath);
              const base64Data = imageBuffer.toString('base64');
              const mimeType = optimizedPath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
              const base64WithMime = `data:${mimeType};base64,${base64Data}`;
              
              attachmentBackups.push({
                url: imageUrl,
                base64: base64WithMime,
                filename: path.basename(optimizedPath)
              });
              
              console.log('💾 Secret - Backup base64 criado para:', path.basename(optimizedPath));
            } catch (backupError) {
              console.warn('⚠️ Secret - Erro ao criar backup base64:', backupError);
            }
            
            attachments.push(imageUrl);
            console.log('✅ Secret - Anexo processado:', imageUrl);
          } catch (error) {
            console.error('❌ Secret - Erro ao processar anexo:', error);
          }
        }
      }

      // Capturar informações da requisição
      const senderIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Criar mensagem do chat
      const chatMessageData = {
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        attachmentBackups: attachmentBackups.length > 0 ? JSON.stringify(attachmentBackups) : undefined,
        senderIp,
        userAgent
      };

      // Salvar no banco
      const chatMessage = await storage.createChatMessage(chatMessageData);

      // Preparar dados para o email
      const CHAT_RECIPIENT_EMAIL = process.env.CHAT_RECIPIENT_EMAIL;
      
      if (!CHAT_RECIPIENT_EMAIL) {
        console.error('❌ CHAT_RECIPIENT_EMAIL não configurado');
        return res.status(500).json({ error: "Configuração de email não encontrada" });
      }

      // Construir URL completa do servidor (IGUAL ao painel admin)
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
      const serverUrl = `${protocol}://${host}`;
      
      console.log('🤫 === SECRET EMAIL DATA DEBUG ===');
      console.log('🤫 Mensagem:', message);
      console.log('🤫 Anexos processados:', attachments);
      console.log('🤫 Server URL:', serverUrl);
      console.log('🤫 Recipient:', CHAT_RECIPIENT_EMAIL);
      
      // Enviar email EXATAMENTE igual ao sistema de suporte
      const emailData = {
        name: "Secret Chat",
        email: "secret@sistema.local", 
        subject: "Mensagem do Secret Chat",
        message: message.trim(),
        type: "secret-message",
        attachments: attachments, // URLs diretas: ["/uploads/secret/image.webp"]
        recipientOverride: CHAT_RECIPIENT_EMAIL,
        serverUrl: serverUrl
      };

      console.log('📧 Secret - Debug emailData completo:', {
        ...emailData,
        attachments: emailData.attachments,
        attachmentsLength: emailData.attachments?.length,
        attachmentsType: typeof emailData.attachments
      });

      const emailResult = await sendSupportEmail(emailData);

      console.log('📧 Secret - Resultado do email:', emailResult);

      // Resposta de sucesso (sempre indica "talvez enviado")
      res.json({ 
        success: true,
        id: chatMessage.id,
        message: "Processando transmissão para o universo...",
        emailSent: emailResult.success
      });

    } catch (error) {
      console.error('❌ Secret - Erro ao processar mensagem:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rotas para servir ícones do banco quando filesystem não disponível (Render.com)
  app.get("/icons/favicon.ico", async (req, res) => {
    try {
      // Primeiro tentar servir do filesystem
      const { existsSync } = await import('fs');
      const filePath = path.join(process.cwd(), 'client', 'public', 'icons', 'favicon.ico');
      
      if (existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      
      // Se não encontrar, buscar no banco
      const iconConfig = await storage.getSiteConfig('preset_favicon_data');
      if (iconConfig?.value && (iconConfig.value as any).favicon) {
        const iconBuffer = Buffer.from((iconConfig.value as any).favicon, 'base64');
        res.setHeader('Content-Type', 'image/x-icon');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(iconBuffer);
      }
      
      res.status(404).send('Favicon not found');
    } catch (error) {
      console.error('Erro ao servir favicon:', error);
      res.status(500).send('Erro interno');
    }
  });

  app.get("/icons/favicon-16x16.png", async (req, res) => {
    try {
      const { existsSync } = await import('fs');
      const filePath = path.join(process.cwd(), 'client', 'public', 'icons', 'favicon-16x16.png');
      
      if (existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      
      const iconConfig = await storage.getSiteConfig('preset_favicon_data');
      if (iconConfig?.value && (iconConfig.value as any).favicon16) {
        const iconBuffer = Buffer.from((iconConfig.value as any).favicon16, 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(iconBuffer);
      }
      
      res.status(404).send('Icon not found');
    } catch (error) {
      console.error('Erro ao servir favicon-16x16:', error);
      res.status(500).send('Erro interno');
    }
  });

  app.get("/icons/favicon-32x32.png", async (req, res) => {
    try {
      const { existsSync } = await import('fs');
      const filePath = path.join(process.cwd(), 'client', 'public', 'icons', 'favicon-32x32.png');
      
      if (existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      
      const iconConfig = await storage.getSiteConfig('preset_favicon_data');
      if (iconConfig?.value && (iconConfig.value as any).favicon32) {
        const iconBuffer = Buffer.from((iconConfig.value as any).favicon32, 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(iconBuffer);
      }
      
      res.status(404).send('Icon not found');
    } catch (error) {
      console.error('Erro ao servir favicon-32x32:', error);
      res.status(500).send('Erro interno');
    }
  });

  app.get("/icons/apple-touch-icon.png", async (req, res) => {
    try {
      const { existsSync } = await import('fs');
      const filePath = path.join(process.cwd(), 'client', 'public', 'icons', 'apple-touch-icon.png');
      
      if (existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      
      const iconConfig = await storage.getSiteConfig('preset_favicon_data');
      if (iconConfig?.value && (iconConfig.value as any).appleTouchIcon) {
        const iconBuffer = Buffer.from((iconConfig.value as any).appleTouchIcon, 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(iconBuffer);
      }
      
      res.status(404).send('Icon not found');
    } catch (error) {
      console.error('Erro ao servir apple-touch-icon:', error);
      res.status(500).send('Erro interno');
    }
  });

  // Rota para servir imagens de backup do secret (fallback para Render.com)
  app.get("/api/secret/image/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      console.log('🖼️ Secret - Solicitação de imagem de backup:', filename);
      
      // Primeiro tentar servir o arquivo normal
      const { existsSync } = await import('fs');
      const filePath = path.join(process.cwd(), 'uploads', 'secret', filename);
      if (existsSync(filePath)) {
        console.log('✅ Secret - Arquivo encontrado no filesystem');
        return res.sendFile(filePath);
      }
      
      // Se não encontrar, buscar no backup base64 do banco
      console.log('🔍 Secret - Buscando backup no banco...');
      const messages = await storage.getAllChatMessages();
      
      for (const message of messages) {
        if (message.attachmentBackups) {
          try {
            const backups = JSON.parse(message.attachmentBackups);
            const backup = backups.find((b: any) => b.filename === filename);
            
            if (backup && backup.base64) {
              console.log('♻️ Secret - Servindo imagem do backup base64');
              
              // Extrair tipo MIME e dados base64
              const matches = backup.base64.match(/^data:([^;]+);base64,(.+)$/);
              if (matches) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                
                res.setHeader('Content-Type', mimeType);
                res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 dia
                return res.send(buffer);
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Secret - Erro ao analisar backup:', parseError);
          }
        }
      }
      
      // Se não encontrar em lugar nenhum, retornar 404
      console.log('❌ Secret - Imagem não encontrada:', filename);
      res.status(404).json({ error: 'Imagem não encontrada' });
      
    } catch (error) {
      console.error('❌ Secret - Erro ao servir imagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota dinâmica para robots.txt baseada na configuração de indexação
  app.get("/robots.txt", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      const marketingConfig = configs.find((c: any) => c.key === 'marketing_pixels');
      const marketingData = marketingConfig?.value as any || {};
      const enableGoogleIndexing = marketingData.enableGoogleIndexing ?? true;

      res.setHeader('Content-Type', 'text/plain');

      if (enableGoogleIndexing) {
        // Permitir indexação
        res.send(`User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
      } else {
        // Bloquear indexação
        res.send(`User-agent: *
Disallow: /`);
      }
    } catch (error) {
      // Fallback para permitir indexação em caso de erro
      res.setHeader('Content-Type', 'text/plain');
      res.send(`User-agent: *
Allow: /`);
    }
  });

  // Upload de imagem do hero
  app.post("/api/admin/hero/image", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      const originalPath = req.file.path;

      // Otimizar imagem para WebP
      const optimizedPath = await optimizeImage(originalPath, 'hero', {
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const imageUrl = `/uploads/hero/${path.basename(optimizedPath)}`;
      await storage.setSiteConfig({
        key: "hero_image_url",
        value: imageUrl
      });

      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de avatar
  app.post("/api/admin/avatar", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      const originalPath = req.file.path;

      // Otimizar avatar para WebP (tamanho menor)
      const optimizedPath = await optimizeImage(originalPath, 'hero', {
        quality: 90,
        maxWidth: 400,
        maxHeight: 400
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const avatarUrl = `/uploads/hero/${path.basename(optimizedPath)}`;
      await storage.setSiteConfig({
        key: "avatar_url",
        value: avatarUrl
      });

      res.json({ avatarUrl });
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de imagem para depoimento (rota genérica)
  app.post("/api/admin/upload/testimonials", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      console.log('📷 Iniciando upload de imagem de depoimento...');

      if (!req.file) {
        console.log('❌ Nenhuma imagem foi enviada');
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      console.log('📄 Arquivo recebido:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const originalPath = req.file.path;

      // Otimizar imagem do depoimento para WebP
      console.log('🔄 Otimizando imagem...');
      const optimizedPath = await optimizeImage(originalPath, 'testimonials', {
        quality: 85,
        maxWidth: 300,
        maxHeight: 300
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const imagePath = `/uploads/testimonials/${path.basename(optimizedPath)}`;
      console.log('✅ Upload concluído:', imagePath);

      res.json({ 
        imagePath,
        message: "Imagem do depoimento convertida para WebP com sucesso" 
      });
    } catch (error) {
      console.error("❌ Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Upload de imagem para depoimento específico (backward compatibility)
  app.post("/api/admin/testimonials/:id/image", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const testimonialId = parseInt(req.params.id);

      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }

      const originalPath = req.file.path;

      // Otimizar imagem do depoimento
      const optimizedPath = await optimizeImage(originalPath, 'testimonials', {
        quality: 85,
        maxWidth: 300,
        maxHeight: 300
      });

      // Remover arquivo original
      await cleanupOriginal(originalPath);

      const imageUrl = `/uploads/testimonials/${path.basename(optimizedPath)}`;

      await storage.updateTestimonial(testimonialId, {
        photo: imageUrl
      });

      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ==================== COOKIES E POLÍTICAS ====================

  // Rotas públicas para cookies e políticas
  app.get("/api/cookie-settings", async (req, res) => {
    try {
      console.log("GET /api/cookie-settings - Iniciando busca das configurações");
      const settings = await storage.getCookieSettings();
      console.log("GET /api/cookie-settings - Configurações obtidas:", settings);
      res.json(settings);
    } catch (error) {
      console.error("Erro na API de cookies:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/privacy-policy", async (req, res) => {
    try {
      const policy = await storage.getPrivacyPolicy();
      res.json(policy);
    } catch (error) {
      console.error("Erro ao buscar política de privacidade:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/terms-of-use", async (req, res) => {
    try {
      const terms = await storage.getTermsOfUse();
      res.json(terms);
    } catch (error) {
      console.error("Erro ao buscar termos de uso:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rotas administrativas para cookies e políticas
  app.put("/api/admin/cookie-settings", async (req, res) => {
    try {
      console.log("PUT /api/admin/cookie-settings called with body:", req.body);
      const validatedData = insertCookieSettingsSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const settings = await storage.updateCookieSettings(validatedData);
      console.log("Settings updated successfully:", settings);
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error("Erro ao atualizar configurações de cookies:", error);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/privacy-policy", async (req, res) => {
    try {
      const validatedData = insertPrivacyPolicySchema.parse(req.body);
      const policy = await storage.updatePrivacyPolicy(validatedData);
      res.json({ success: true, data: policy });
    } catch (error) {
      console.error("Erro ao atualizar política de privacidade:", error);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.put("/api/admin/terms-of-use", async (req, res) => {
    try {
      const validatedData = insertTermsOfUseSchema.parse(req.body);
      const terms = await storage.updateTermsOfUse(validatedData);
      res.json({ success: true, data: terms });
    } catch (error) {
      console.error("Erro ao atualizar termos de uso:", error);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  // ==================== ARTIGOS ====================

  // Rotas públicas para artigos
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/articles/featured", async (req, res) => {
    try {
      const articles = await storage.getFeaturedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Erro ao buscar artigos em destaque:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ error: "Artigo não encontrado" });
      }

      // Verificar se está publicado para usuários não admin
      if (!article.isPublished) {
        return res.status(404).json({ error: "Artigo não encontrado" });
      }

      res.json(article);
    } catch (error) {
      console.error("Erro ao buscar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rotas administrativas para artigos
  app.get("/api/admin/articles", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error) {
      console.error("Erro ao buscar todos os artigos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ error: "Artigo não encontrado" });
      }

      res.json(article);
    } catch (error) {
      console.error("Erro ao buscar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.json(article);
    } catch (error) {
      console.error("Erro ao criar artigo:", error);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  // REORDER deve vir ANTES das rotas :id para evitar conflito de rota
  app.put("/api/admin/articles/reorder", async (req, res) => {
    try {
      console.log("🔄 Articles REORDER - Raw body:", req.body);
      console.log("🔄 Articles REORDER - Body type:", typeof req.body);
      console.log("🔄 Articles REORDER - Body stringified:", JSON.stringify(req.body, null, 2));
      
      // Verificar se os dados chegaram como array direto ou dentro de uma propriedade
      let reorderData;
      
      if (Array.isArray(req.body)) {
        console.log("✅ Articles REORDER - Dados são array direto");
        reorderData = req.body;
      } else if (req.body && Array.isArray(req.body.items)) {
        console.log("✅ Articles REORDER - Dados estão em req.body.items");
        reorderData = req.body.items;
      } else if (req.body && req.body.value && Array.isArray(req.body.value)) {
        console.log("✅ Articles REORDER - Dados estão em req.body.value");
        reorderData = req.body.value;
      } else {
        console.error("❌ Articles REORDER - Formato inválido:", req.body);
        return res.status(400).json({ 
          error: "Dados de reordenação devem ser um array",
          received: typeof req.body,
          body: req.body
        });
      }
      
      if (!Array.isArray(reorderData) || reorderData.length === 0) {
        console.error("❌ Articles REORDER - Array vazio ou inválido:", reorderData);
        return res.status(400).json({ error: "Array de reordenação vazio ou inválido" });
      }
      
      console.log("🔄 Articles REORDER - Processando array válido:", reorderData);
      console.log("🔄 Articles REORDER - Chamando storage.reorderArticles...");
      const updatedArticles = await storage.reorderArticles(reorderData);
      console.log("✅ Articles REORDER - storage.reorderArticles concluída");
      console.log("✅ Articles REORDER - Artigos atualizados obtidos:", updatedArticles.length, "itens");
      
      // Log das ordens atuais no banco
      const orderCheck = updatedArticles.map(a => ({ id: a.id, title: a.title.substring(0, 30), order: a.order }));
      console.log("🔍 Articles REORDER - Ordens no banco após atualização:", JSON.stringify(orderCheck, null, 2));
      
      res.json(updatedArticles);
    } catch (error) {
      console.error("❌ Articles REORDER - Erro completo:", error);
      console.error("❌ Articles REORDER - Stack trace:", error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({ error: "Erro ao reordenar artigos" });
    }
  });

  app.put("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(id, validatedData);
      res.json(article);
    } catch (error) {
      console.error("Erro ao atualizar artigo:", error);
      res.status(400).json({ error: "Dados inválidos" });
    }
  });

  app.delete("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticle(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/articles/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.publishArticle(id);
      res.json(article);
    } catch (error) {
      console.error("Erro ao publicar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/articles/:id/unpublish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.unpublishArticle(id);
      res.json(article);
    } catch (error) {
      console.error("Erro ao despublicar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // General image upload for article content (new endpoint for content editor)
  app.post("/api/admin/upload-image", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log(`📸 Upload de imagem para conteúdo iniciado:`, req.file.filename);
      
      const originalPath = req.file.path;
      
      // Detectar tipo de upload baseado no body da request
      const folder = req.body.folder || 'articles';
      
      console.log('📂 Pasta detectada:', folder);
      console.log('🔍 Body da request:', req.body);
      
      let optimizedPath;
      let finalUrl;
      
      if (folder === 'seo') {
        // Criar diretório se não existir
        const seoDir = path.join(process.cwd(), 'uploads', 'seo');
        if (!existsSync(seoDir)) {
          mkdirSync(seoDir, { recursive: true });
        }
        
        // Para SEO Open Graph - otimizar para 1200x630
        const outputPath = path.join(seoDir, `seo-${Date.now()}.jpg`);
        await sharp(originalPath)
          .resize(1200, 630, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 85 })
          .toFile(outputPath);
        
        optimizedPath = outputPath;
        finalUrl = `/uploads/seo/${path.basename(outputPath)}`;
        console.log(`📸 Imagem SEO otimizada: ${finalUrl}`);
      } else {
        // Para outros tipos (articles, etc) - otimização padrão
        optimizedPath = await optimizeImage(originalPath, folder);
        finalUrl = `/uploads/${folder}/${path.basename(optimizedPath)}`;
      }
      
      await cleanupOriginal(originalPath);

      res.json({ 
        success: true, 
        url: finalUrl,
        imageUrl: finalUrl, // Mantém compatibilidade
        message: "Imagem carregada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });

  // Upload de imagem para mensagens de suporte
  app.post("/api/admin/upload-image/support", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      console.log('🔍 Iniciando upload de imagem para suporte...');
      console.log('Request details:', {
        path: req.path,
        method: req.method,
        hasFile: !!req.file,
        headers: req.headers['content-type']
      });

      if (!req.file) {
        console.error('❌ Nenhum arquivo enviado');
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log(`📸 Upload de imagem para suporte iniciado:`, {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
      
      const originalPath = req.file.path;
      
      // Verificar se o arquivo existe
      if (!existsSync(originalPath)) {
        console.error('❌ Arquivo não encontrado:', originalPath);
        return res.status(500).json({ error: "Arquivo não encontrado após upload" });
      }

      // Use 'support' type for support message images
      console.log('🔄 Otimizando imagem...');
      const optimizedPath = await optimizeImage(originalPath, 'support');
      
      console.log('🧹 Limpando arquivo original...');
      await cleanupOriginal(originalPath);
      
      const imageUrl = `/uploads/support/${path.basename(optimizedPath)}`;
      console.log('✅ Upload de suporte concluído:', imageUrl);

      res.json({ 
        success: true, 
        url: imageUrl,
        message: "Imagem anexada com sucesso!"
      });
    } catch (error) {
      console.error("❌ Erro ao fazer upload da imagem de suporte:", error);
      res.status(500).json({ 
        error: "Erro ao fazer upload da imagem",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Upload de imagem para artigos
  app.post("/api/admin/articles/:id/upload", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const articleId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      // Otimizar imagem
      const optimizedPath = await optimizeImage(req.file.path, 'articles');
      await cleanupOriginal(req.file.path);

      const imageUrl = `/uploads/articles/${path.basename(optimizedPath)}`;

      // Atualizar o artigo com a nova imagem
      await storage.updateArticle(articleId, {
        cardImage: imageUrl
      });

      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem do artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ==================== USER PREFERENCES ====================

  // Buscar preferência do usuário
  app.get("/api/user-preference/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const preference = await storage.getUserPreference(key);
      if (preference) {
        res.json(preference);
      } else {
        res.status(404).json({ error: "Preferência não encontrada" });
      }
    } catch (error) {
      console.error("Erro ao buscar preferência:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Definir/atualizar preferência do usuário
  app.post("/api/user-preference", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key e value são obrigatórios" });
      }
      
      const preference = await storage.setUserPreference({ key, value });
      res.json(preference);
    } catch (error) {
      console.error("Erro ao definir preferência:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ==================== RELATÓRIOS DE LOGS ====================

  // Middleware para autenticação dos logs
  const requireLogPassword = (req: any, res: any, next: any) => {
    console.log('🔐 Auth middleware - Password check:', req.query.password ? 'Provided' : 'Missing');
    console.log('🔐 Auth middleware - URL:', req.originalUrl);
    
    const password = req.query.password || req.headers['x-log-password'];
    
    if (password !== '24092002') {
      console.log('🚫 Auth failed - Wrong password:', password);
      res.status(401).json({ 
        error: "Acesso negado. Senha necessária para acessar logs.",
        message: "Use o parâmetro ?password=SENHA ou header X-Log-Password",
        provided: password ? 'Senha incorreta' : 'Senha não fornecida'
      });
      return;
    }
    
    console.log('✅ Auth success - Access granted');
    next();
  };

  // Endpoint de teste para verificar autenticação
  app.get("/api/admin/logs/test", requireLogPassword, (req, res) => {
    res.json({ 
      success: true, 
      message: "Autenticação funcionando corretamente!",
      timestamp: new Date().toISOString()
    });
  });

  // Gerar e baixar relatório de texto de um mês específico
  app.get("/api/admin/logs/report/:month?", requireLogPassword, async (req, res) => {
    try {
      const monthYear = req.params.month;
      const reportPath = LogReporter.saveTextReport(monthYear);
      const filename = path.basename(reportPath);
      
      res.download(reportPath, filename, (err) => {
        if (err) {
          console.error("Erro ao enviar arquivo:", err);
          res.status(500).json({ error: "Erro ao baixar relatório" });
        }
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Gerar e baixar resumo geral de todos os logs
  app.get("/api/admin/logs/summary", requireLogPassword, async (req, res) => {
    try {
      const summaryPath = LogReporter.saveSummaryReport();
      const filename = path.basename(summaryPath);
      
      res.download(summaryPath, filename, (err) => {
        if (err) {
          console.error("Erro ao enviar arquivo:", err);
          res.status(500).json({ error: "Erro ao baixar resumo" });
        }
      });
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Visualizar relatório de texto no navegador
  app.get("/api/admin/logs/view/:month?", requireLogPassword, async (req, res) => {
    try {
      const monthYear = req.params.month;
      const textReport = LogReporter.generateTextReport(monthYear);
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(textReport);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ==================== ROTAS SEO PARA TESTES ====================
  
  // Rota para testar as meta tags OpenGraph (útil para debug)
  app.get("/api/seo/preview", async (req, res) => {
    try {
      const url = req.query.url as string || `${req.protocol}://${req.get('host')}`;
      
      console.log('🧪 Testando SEO preview para URL:', url);
      
      // Importar função de SEO
      const { getSEOData, generateMetaTags } = await import("./utils/seoRenderer");
      
      const seoData = await getSEOData(url);
      const metaTags = generateMetaTags(seoData);
      
      res.json({
        success: true,
        url: url,
        seoData: seoData,
        metaTags: metaTags,
        message: "Preview das meta tags SEO geradas com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao gerar preview SEO:', error);
      res.status(500).json({ 
        error: "Erro ao gerar preview SEO",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  // Rota para verificar as configurações SEO atuais no banco
  app.get("/api/seo/config", async (req, res) => {
    try {
      console.log('🔍 Verificando configurações SEO no banco');
      
      const configs = await storage.getAllSiteConfigs();
      const seoConfig = configs.find(c => c.key === 'seo_meta')?.value as any || {};
      const generalConfig = configs.find(c => c.key === 'general_info')?.value as any || {};
      
      res.json({
        success: true,
        seoConfig,
        generalConfig,
        allConfigs: configs.map(c => ({ key: c.key, hasValue: !!c.value })),
        message: "Configurações SEO obtidas com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao buscar configurações SEO:', error);
      res.status(500).json({ 
        error: "Erro ao buscar configurações SEO",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Rota para regenerar HTML estático com meta tags atualizadas
  app.post("/api/seo/regenerate-html", async (req, res) => {
    try {
      console.log('🔄 Regenerando HTML estático com meta tags atualizadas');
      
      // Construir URL base da requisição
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
      const baseUrl = `${protocol}://${host}`;
      
      // Importar função de geração HTML
      const { regenerateStaticHTML, isHTMLStaticallyGenerated } = await import("./utils/htmlGenerator");
      
      // Verificar estado anterior
      const wasStatic = await isHTMLStaticallyGenerated();
      
      // Regenerar HTML
      await regenerateStaticHTML(baseUrl);
      
      res.json({
        success: true,
        baseUrl,
        wasStaticallyGenerated: wasStatic,
        message: "HTML estático regenerado com meta tags SEO atualizadas"
      });
    } catch (error) {
      console.error('❌ Erro ao regenerar HTML estático:', error);
      res.status(500).json({ 
        error: "Erro ao regenerar HTML estático",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  // Rota para forçar limpeza de cache de redes sociais (Facebook, WhatsApp, etc)
  app.post("/api/seo/refresh-cache", async (req, res) => {
    try {
      const url = req.body.url || req.headers.origin || 'https://example.com';
      
      console.log('🔄 Solicitação de limpeza de cache SEO para:', url);
      
      // Aqui podemos adicionar lógica para notificar serviços externos
      // Por enquanto, apenas logamos e confirmamos
      
      res.json({
        success: true,
        message: "Cache SEO atualizado. As redes sociais podem levar alguns minutos para atualizar.",
        url: url,
        instructions: [
          "Facebook/Instagram: Use o Facebook Sharing Debugger",
          "WhatsApp: Pode levar até 7 dias para atualizar automaticamente",
          "Twitter/X: Geralmente atualiza em poucos minutos",
          "LinkedIn: Use o Post Inspector do LinkedIn"
        ]
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar cache SEO:', error);
      res.status(500).json({ error: "Erro ao atualizar cache SEO" });
    }
  });

  const httpServer = createServer(app);
  
  console.log('✅ Todas as rotas da API registradas com sucesso');
  console.log('🔗 Rotas incluem: /api/admin/test-support-message, /api/admin/support-messages, /api/seo/preview');

  return httpServer;
}