/**
 * storage.ts
 * 
 * Interface de armazenamento de dados para a aplicação
 * Implementação atual: DatabaseStorage com PostgreSQL
 * Suporte completo ao espaço administrativo
 */

import { 
  users, 
  adminUsers, 
  siteConfig, 
  testimonials, 
  faqItems, 
  services, 
  photoCarousel, 
  specialties,
  customCodes,
  contactSettings,
  footerSettings,
  supportMessages,
  cookieSettings,
  privacyPolicy,
  termsOfUse,
  articles,
  userPreferences,
  chatMessages,
  type User, 
  type AdminUser, 
  type SiteConfig, 
  type Testimonial, 
  type FaqItem, 
  type Service, 
  type PhotoCarousel,
  type Specialty,
  type CookieSettings,
  type PrivacyPolicy,
  type TermsOfUse,
  type Article,
  type UserPreference,
  type ChatMessage,
  type InsertUser,
  type InsertAdminUser,
  type InsertSiteConfig,
  type InsertTestimonial,
  type InsertFaqItem,
  type InsertService,
  type InsertPhotoCarousel,
  type InsertSpecialty,
  type InsertSupportMessage,
  type InsertCookieSettings,
  type InsertPrivacyPolicy,
  type InsertTermsOfUse,
  type InsertArticle,
  type InsertUserPreference,
  type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, sql, and } from "drizzle-orm";

// Interface comum para operações de armazenamento
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admin methods
  getAdminUser(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;

  // Site config methods
  getSiteConfig(key: string): Promise<SiteConfig | undefined>;
  setSiteConfig(config: InsertSiteConfig): Promise<SiteConfig>;
  getAllSiteConfigs(): Promise<SiteConfig[]>;
  deleteSiteConfig(key: string): Promise<void>;

  // Testimonials methods
  getAllTestimonials(): Promise<Testimonial[]>;
  getActiveTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<void>;
  reorderTestimonials(reorderData: Array<{ id: number; order: number }>): Promise<void>;

  // FAQ methods
  getAllFaqItems(): Promise<FaqItem[]>;
  getActiveFaqItems(): Promise<FaqItem[]>;
  createFaqItem(faq: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, faq: Partial<InsertFaqItem>): Promise<FaqItem>;
  deleteFaqItem(id: number): Promise<void>;
  reorderFaqItems(reorderData: Array<{ id: number; order: number }>): Promise<void>;

  // Services methods
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;
  reorderServices(reorderData: Array<{ id: number; order: number }>): Promise<void>;

  // Photo Carousel methods
  getActivePhotoCarousel(): Promise<PhotoCarousel[]>;
  getAllPhotoCarousel(): Promise<PhotoCarousel[]>;
  createPhotoCarousel(data: InsertPhotoCarousel): Promise<PhotoCarousel>;
  updatePhotoCarousel(id: number, data: Partial<InsertPhotoCarousel>): Promise<PhotoCarousel>;
  deletePhotoCarousel(id: number): Promise<void>;
  reorderPhotoCarousel(reorderData: Array<{ id: number; order: number }>): Promise<void>;

    // Specialties methods
  getActiveSpecialties(): Promise<Specialty[]>;
  getAllSpecialties(): Promise<Specialty[]>;
  createSpecialty(data: InsertSpecialty): Promise<Specialty>;
  updateSpecialty(id: number, data: Partial<InsertSpecialty>): Promise<Specialty>;
  deleteSpecialty(id: number): Promise<void>;
  reorderSpecialties(reorderData: Array<{ id: number; order: number }>): Promise<void>;

  // Contact Settings methods
  getContactSettings(): Promise<any>;
  updateContactSettings(updates: any): Promise<any>;

  // Footer Settings methods
  getFooterSettings(): Promise<any>;
  updateFooterSettings(updates: any): Promise<any>;
  resetFooterSettings(): Promise<void>;

  // Support Messages methods
  getAllSupportMessages(): Promise<any>;
  createSupportMessage(data: InsertSupportMessage): Promise<any>;
  updateSupportMessage(id: number, data: Partial<InsertSupportMessage & { isRead?: boolean, adminResponse?: string }>): Promise<any>;
  deleteSupportMessage(id: number): Promise<void>;

  // Custom Codes methods
  getAllCustomCodes(): Promise<any[]>;
  getCustomCodesByLocation(location: 'header' | 'body'): Promise<any[]>;
  createCustomCode(data: any): Promise<any>;
  updateCustomCode(id: number, data: any): Promise<any>;
  deleteCustomCode(id: number): Promise<void>;
  reorderCustomCodes(reorderData: Array<{ id: number; order: number }>): Promise<void>;

  // Cookie Settings methods
  getCookieSettings(): Promise<CookieSettings>;
  updateCookieSettings(data: InsertCookieSettings): Promise<CookieSettings>;

  // Privacy Policy methods
  getPrivacyPolicy(): Promise<PrivacyPolicy>;
  updatePrivacyPolicy(data: InsertPrivacyPolicy): Promise<PrivacyPolicy>;

  // Terms of Use methods
  getTermsOfUse(): Promise<TermsOfUse>;
  updateTermsOfUse(data: InsertTermsOfUse): Promise<TermsOfUse>;

  // Articles methods
  getAllArticles(): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  getFeaturedArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;
  publishArticle(id: number): Promise<Article>;
  unpublishArticle(id: number): Promise<Article>;
  reorderArticles(reorderData: Array<{ id: number; order: number }>): Promise<Article[]>;

  // User Preferences methods
  getUserPreference(key: string): Promise<UserPreference | undefined>;
  setUserPreference(preference: InsertUserPreference): Promise<UserPreference>;
  getAllUserPreferences(): Promise<UserPreference[]>;

  // Chat Messages methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getAllChatMessages(): Promise<ChatMessage[]>;
  getUnreadChatMessages(): Promise<ChatMessage[]>;
  markChatMessageAsRead(id: number): Promise<ChatMessage>;
}

// Implementação com banco de dados PostgreSQL
export class DatabaseStorage implements IStorage {
  db: any;
  constructor() {
      this.db = db;
  }
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  // Admin methods
  async getAdminUser(username: string): Promise<AdminUser | undefined> {
    const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await this.db.insert(adminUsers).values(insertAdminUser).returning();
    return admin;
  }

  // Site config methods
  async getSiteConfig(key: string): Promise<SiteConfig | undefined> {
    const [config] = await this.db.select().from(siteConfig).where(eq(siteConfig.key, key));
    return config || undefined;
  }

  async setSiteConfig(config: InsertSiteConfig): Promise<SiteConfig> {
    const existing = await this.getSiteConfig(config.key);
    if (existing) {
      const [updated] = await this.db
        .update(siteConfig)
        .set({ value: config.value, updatedAt: new Date() })
        .where(eq(siteConfig.key, config.key))
        .returning();
      return updated;
    } else {
      const [created] = await this.db.insert(siteConfig).values(config).returning();
      return created;
    }
  }

  async getAllSiteConfigs(): Promise<SiteConfig[]> {
    return await this.db.select().from(siteConfig);
  }

  async deleteSiteConfig(key: string): Promise<void> {
    await this.db.delete(siteConfig).where(eq(siteConfig.key, key));
  }

  // Testimonials methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await this.db.select().from(testimonials).orderBy(asc(testimonials.order));
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    try {
      const result = await this.db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.order));
      console.log('Depoimentos ativos encontrados no storage:', result.length);
      console.log('Depoimentos:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar depoimentos ativos:', error);
      return [];
    }
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    try {
      console.log('🔵 Inserindo depoimento no banco');
      const [created] = await this.db.insert(testimonials).values(testimonial).returning();
      console.log('✅ Depoimento inserido com ID:', created.id);
      return created;
    } catch (error) {
      console.error('❌ Erro na inserção do depoimento:', error);
      throw error;
    }
  }

  async updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial> {
    const [updated] = await this.db
      .update(testimonials)
      .set(testimonial)
      .where(eq(testimonials.id, id))
      .returning();
    return updated;
  }

  async deleteTestimonial(id: number): Promise<void> {
    await this.db.delete(testimonials).where(eq(testimonials.id, id));
  }

  async reorderTestimonials(reorderData: Array<{ id: number; order: number }>): Promise<void> {
    for (const item of reorderData) {
      await this.db
        .update(testimonials)
        .set({ order: item.order })
        .where(eq(testimonials.id, item.id));
    }
  }

  // FAQ methods
  async getAllFaqItems(): Promise<FaqItem[]> {
    return await this.db.select().from(faqItems).orderBy(asc(faqItems.order));
  }

  async getActiveFaqItems(): Promise<FaqItem[]> {
    return await this.db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.order));
  }

  async createFaqItem(faq: InsertFaqItem): Promise<FaqItem> {
    const [created] = await this.db.insert(faqItems).values(faq).returning();
    return created;
  }

  async updateFaqItem(id: number, faq: Partial<InsertFaqItem>): Promise<FaqItem> {
    const [updated] = await this.db
      .update(faqItems)
      .set(faq)
      .where(eq(faqItems.id, id))
      .returning();
    return updated;
  }

  async deleteFaqItem(id: number): Promise<void> {
    await this.db.delete(faqItems).where(eq(faqItems.id, id));
  }

  async reorderFaqItems(reorderData: Array<{ id: number; order: number }>): Promise<void> {
    for (const item of reorderData) {
      await this.db
        .update(faqItems)
        .set({ order: item.order })
        .where(eq(faqItems.id, item.id));
    }
  }

  // Services methods
  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services).orderBy(asc(services.order));
  }

  async getActiveServices(): Promise<Service[]> {
    return await this.db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.order));
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await this.db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await this.db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await this.db.delete(services).where(eq(services.id, id));
  }

  async reorderServices(reorderData: Array<{ id: number; order: number }>): Promise<void> {
    for (const item of reorderData) {
      await this.db
        .update(services)
        .set({ order: item.order })
        .where(eq(services.id, item.id));
    }
  }

  // Photo Carousel methods
  async getActivePhotoCarousel(): Promise<PhotoCarousel[]> {
    return await this.db.select().from(photoCarousel).where(eq(photoCarousel.isActive, true)).orderBy(asc(photoCarousel.order));
  }

  async getAllPhotoCarousel(): Promise<PhotoCarousel[]> {
    return await this.db.select().from(photoCarousel).orderBy(asc(photoCarousel.order));
  }

  async createPhotoCarousel(data: InsertPhotoCarousel): Promise<PhotoCarousel> {
    const [result] = await this.db.insert(photoCarousel).values(data).returning();
    return result;
  }

  async updatePhotoCarousel(id: number, data: Partial<InsertPhotoCarousel>): Promise<PhotoCarousel> {
    const [result] = await this.db.update(photoCarousel).set(data).where(eq(photoCarousel.id, id)).returning();
    return result;
  }

  async deletePhotoCarousel(id: number): Promise<void> {
    await this.db.delete(photoCarousel).where(eq(photoCarousel.id, id));
  }

  async reorderPhotoCarousel(reorderData: Array<{ id: number; order: number }>): Promise<void> {
    for (const item of reorderData) {
      await this.db
        .update(photoCarousel)
        .set({ order: item.order })
        .where(eq(photoCarousel.id, item.id));
    }
  }

  // Specialties methods
  async getActiveSpecialties(): Promise<Specialty[]> {
    return await this.db.select().from(specialties).where(eq(specialties.isActive, true)).orderBy(asc(specialties.order));
  }

  async getAllSpecialties(): Promise<Specialty[]> {
    return await this.db.select().from(specialties).orderBy(asc(specialties.order));
  }

  async createSpecialty(data: InsertSpecialty): Promise<Specialty> {
    const [created] = await this.db.insert(specialties).values(data).returning();
    return created;
  }

  async updateSpecialty(id: number, data: Partial<InsertSpecialty>): Promise<Specialty> {
    const [updated] = await this.db
      .update(specialties)
      .set(data)
      .where(eq(specialties.id, id))
      .returning();
    return updated;
  }

  async deleteSpecialty(id: number): Promise<void> {
    await this.db.delete(specialties).where(eq(specialties.id, id));
  }

  async reorderSpecialties(reorderData: Array<{ id: number; order: number }>): Promise<void> {
    for (const item of reorderData) {
      await this.db
        .update(specialties)
        .set({ order: item.order })
        .where(eq(specialties.id, item.id));
    }
  }

  async getContactSettings(): Promise<any> {
    try {
      console.log('🔄 getContactSettings: Iniciando busca...');
      
      // Buscar usando select normal do Drizzle
      const result = await this.db.select({
        id: contactSettings.id,
        contact_items: contactSettings.contact_items,
        schedule_info: contactSettings.schedule_info,
        location_info: contactSettings.location_info,
        contact_card: contactSettings.contact_card,
        info_card: contactSettings.info_card,
        updatedAt: contactSettings.updatedAt,
      }).from(contactSettings).where(eq(contactSettings.id, 1)).limit(1);
      
      console.log('🔍 getContactSettings: Raw result:', JSON.stringify(result, null, 2));
      
      if (result.length === 0) {
        const defaultSettings = {
          contact_items: [
            {
              id: 1,
              type: "whatsapp",
              title: "WhatsApp",
              description: "(44) 998-362-704",
              icon: "FaWhatsapp",
              color: "#25D366",
              link: "https://wa.me/5544998362704",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              type: "instagram",
              title: "Instagram",
              description: "@adriellebenhossi",
              icon: "FaInstagram",
              color: "#E4405F",
              link: "https://instagram.com/adriellebenhossi",
              isActive: true,
              order: 1
            },
            {
              id: 3,
              type: "email",
              title: "Email",
              description: "escutapsi@adrielle.com.br",
              icon: "Mail",
              color: "#EA4335",
              link: "mailto:escutapsi@adrielle.com.br",
              isActive: true,
              order: 2
            }
          ],
          schedule_info: {
            weekdays: "Segunda à Sexta: 8h às 18h",
            saturday: "Sábado: 8h às 12h",
            sunday: "Domingo: Fechado",
            additional_info: "Horários flexíveis disponíveis",
            isActive: true
          },
          location_info: {
            city: "Campo Mourão, Paraná",
            maps_link: "https://maps.google.com/search/Campo+Mourão+Paraná",
            isActive: true
          },
          contact_card: {
            title: "Entre em contato",
            description: "Escolha a forma mais conveniente para você",
            icon: "Mail",
            iconColor: "#6366f1",
            backgroundColor: "#ffffff"
          },
          info_card: {
            title: "Horários & Localização",
            description: "Informações práticas para seu atendimento",
            icon: "Clock",
            iconColor: "#10b981",
            backgroundColor: "#ffffff"
          }
        };

        const [created] = await this.db.insert(contactSettings).values(defaultSettings).returning();
        return created;
      }
      
      // Usar o primeiro resultado do select
      const existingData = result[0];
      console.log('🔍 getContactSettings: Dados encontrados:', JSON.stringify(existingData, null, 2));
      
      // Se não temos contact_card ou info_card, adicionar valores padrão
      if (!existingData.contact_card || !existingData.info_card) {
        console.log('🔧 Dados de card ausentes, adicionando valores padrão...');
        const updatedData = {
          ...existingData,
          contact_card: existingData.contact_card || {
            title: "Entre em contato",
            description: "Escolha a forma mais conveniente para você",
            icon: "Mail",
            iconColor: "#6366f1",
            backgroundColor: "#ffffff"
          },
          info_card: existingData.info_card || {
            title: "Horários & Localização",
            description: "Informações práticas para seu atendimento",
            icon: "Clock",
            iconColor: "#10b981",
            backgroundColor: "#ffffff"
          }
        };
        
        // Atualizar no banco com os campos ausentes
        await this.db
          .update(contactSettings)
          .set({
            contact_card: updatedData.contact_card,
            info_card: updatedData.info_card
          })
          .where(eq(contactSettings.id, existingData.id));
          
        return updatedData;
      }
      
      return existingData;
    } catch (error) {
      console.error('Error getting contact settings:', error);
      throw error;
    }
  }

  async updateContactSettings(updates: any): Promise<any> {
    try {
      console.log('🔄 Storage: updateContactSettings iniciado');
      console.log('📥 Storage: Updates recebidos:', JSON.stringify(updates, null, 2));
      
      const existing = await this.getContactSettings();
      console.log('📄 Storage: Dados existentes:', JSON.stringify(existing, null, 2));
      
      const updatedData = {
        ...existing,
        ...updates,
      };
      
      console.log('🔄 Storage: Dados para atualização:', JSON.stringify(updatedData, null, 2));

      const [updated] = await this.db
        .update(contactSettings)
        .set(updatedData)
        .where(eq(contactSettings.id, existing.id))
        .returning();

      console.log('✅ Storage: Atualização concluída:', JSON.stringify(updated, null, 2));
      return updated;
    } catch (error) {
      console.error('❌ Storage: Error updating contact settings:', error);
      throw error;
    }
  }

  async getFooterSettings(): Promise<any> {
    try {
      const result = await this.db.select().from(footerSettings).limit(1);
      if (result.length === 0) {
        const defaultSettings = {
          general_info: {
            description: "Cuidando da sua saúde mental com carinho e dedicação",
            showCnpj: true,
            cnpj: "12.345.678/0001-90"
          },
          contact_buttons: [
            {
              id: 1,
              type: "whatsapp",
              title: "WhatsApp",
              description: "(44) 998-362-704",
              label: "WhatsApp", // Mantém compatibilidade
              icon: "FaWhatsapp",
              color: "#25d366",
              gradient: "from-green-400 to-green-500",
              link: "https://wa.me/5544998362704",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              type: "instagram", 
              title: "Instagram",
              description: "@adriellebenhossi",
              label: "Instagram", // Mantém compatibilidade
              icon: "FaInstagram",
              color: "#e4405f",
              gradient: "from-purple-400 to-pink-500",
              link: "https://instagram.com/adriellebenhossi",
              isActive: true,
              order: 1
            },
            {
              id: 3,
              type: "linkedin",
              title: "LinkedIn", 
              description: "Perfil Profissional",
              label: "LinkedIn", // Mantém compatibilidade
              icon: "FaLinkedinIn",
              color: "#0077b5",
              gradient: "from-blue-500 to-blue-600",
              link: "https://linkedin.com/in/adrielle-benhossi-75510034a",
              isActive: true,
              order: 2
            }
          ],
          certification_items: [
            {
              id: 1,
              title: "Atendimento",
              items: ["Presencial e Online", "Campo Mourão - PR", "Segunda à Sábado"],
              additionalInfo: "Atendimento particular<br/>Horários flexíveis",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              title: "Certificações",
              items: ["Registrada no Conselho", "Federal de Psicologia", "Sigilo e ética profissional"],
              additionalInfo: "",
              isActive: true,
              order: 1
            }
          ],
          trust_seals: [
            {
              id: 1,
              label: "CFP",
              icon: "shield",
              color: "#3b82f6",
              backgroundColor: "#3b82f6",
              gradientFrom: "#3b82f6",
              gradientTo: "#1d4ed8",
              useGradient: true,
              textColor: "#ffffff",
              description: "Conselho Federal de Psicologia",
              isActive: true,
              order: 0
            },
            {
              id: 2,
              label: "🔒",
              icon: "lock",
              color: "#10b981",
              backgroundColor: "#10b981",
              gradientFrom: "#10b981",
              gradientTo: "#059669",
              useGradient: true,
              textColor: "#ffffff",
              description: "Segurança e privacidade",
              isActive: true,
              order: 1
            },
            {
              id: 3,
              label: "⚖️",
              icon: "scale",
              color: "#8b5cf6",
              backgroundColor: "#8b5cf6",
              gradientFrom: "#8b5cf6",
              gradientTo: "#ec4899",
              useGradient: true,
              textColor: "#ffffff",
              description: "Ética profissional",
              isActive: true,
              order: 2
            }
          ],
          bottom_info: {
            copyright: "© 2024 Dra. Adrielle Benhossi • Todos os direitos reservados",
            certificationText: "Registrada no Conselho Federal de Psicologia<br/>Sigilo e ética profissional",
            madeWith: "Made with ♥ and ☕ by ∞"
          }
        };

        const [created] = await this.db.insert(footerSettings).values(defaultSettings).returning();
        return created;
      }
      return result[0];
    } catch (error) {
      console.error('Error getting footer settings:', error);
      throw error;
    }
  }

  async updateFooterSettings(updates: any): Promise<any> {
    try {
      console.log('🔄 Storage: updateFooterSettings iniciado');
      console.log('📥 Updates recebidos:', JSON.stringify(updates, null, 2));
      
      const existing = await this.getFooterSettings();
      console.log('📋 Configurações existentes encontradas:', existing ? 'SIM' : 'NÃO');
      
      const updatedData = {
        ...existing,
        ...updates,
      };
      
      console.log('🔧 Dados mesclados para atualização:', JSON.stringify(updatedData, null, 2));

      const [updated] = await this.db
        .update(footerSettings)
        .set(updatedData)
        .where(eq(footerSettings.id, existing.id))
        .returning();

      console.log('✅ Storage: Atualização realizada com sucesso');
      console.log('📤 Dados atualizados:', JSON.stringify(updated, null, 2));
      
      return updated;
    } catch (error) {
      console.error('❌ Storage: Erro ao atualizar footer settings:', error);
      console.error('Stack trace completo:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  async resetFooterSettings(): Promise<void> {
    try {
      await this.db.delete(footerSettings);
    } catch (error) {
      console.error('Error resetting footer settings:', error);
      throw error;
    }
  }

  // Support Messages
  async getAllSupportMessages() {
    return await this.db
      .select()
      .from(supportMessages)
      .orderBy(desc(supportMessages.createdAt));
  }

  async createSupportMessage(data: InsertSupportMessage) {
    const [message] = await this.db
      .insert(supportMessages)
      .values(data)
      .returning();
    return message;
  }

  async updateSupportMessage(id: number, data: Partial<InsertSupportMessage & { isRead?: boolean, adminResponse?: string }>) {
    const updateData: any = { ...data };

    if (data.adminResponse) {
      updateData.respondedAt = new Date();
    }

    const [updated] = await this.db
      .update(supportMessages)
      .set(updateData)
      .where(eq(supportMessages.id, id))
      .returning();

    return updated;
  }

  async deleteSupportMessage(id: number) {
    await this.db
      .delete(supportMessages)
      .where(eq(supportMessages.id, id));
  }

  // Custom Codes methods
  async getAllCustomCodes() {
    return await this.db
      .select()
      .from(customCodes)
      .orderBy(asc(customCodes.order), asc(customCodes.id));
  }

  async getCustomCodesByLocation(location: 'header' | 'body') {
    return await this.db
      .select()
      .from(customCodes)
      .where(eq(customCodes.location, location))
      .orderBy(asc(customCodes.order), asc(customCodes.id));
  }

  async createCustomCode(data: any) {
    const [code] = await this.db
      .insert(customCodes)
      .values(data)
      .returning();
    return code;
  }

  async updateCustomCode(id: number, data: any) {
    const [updated] = await this.db
      .update(customCodes)
      .set(data)
      .where(eq(customCodes.id, id))
      .returning();
    return updated;
  }

  async deleteCustomCode(id: number) {
    await this.db
      .delete(customCodes)
      .where(eq(customCodes.id, id));
  }

  async reorderCustomCodes(reorderData: Array<{ id: number; order: number }>) {
    for (const { id, order } of reorderData) {
      await this.db
        .update(customCodes)
        .set({ order })
        .where(eq(customCodes.id, id));
    }
  }

  // Cookie Settings methods
  async getCookieSettings(): Promise<CookieSettings> {
    try {
      console.log("🔍 [STORAGE] Buscando configurações de cookies no banco de dados...");
      const result = await this.db.select().from(cookieSettings).limit(1);
      console.log("🔍 [STORAGE] Resultado da busca:", result);
      
      if (result.length === 0) {
        console.log("⚠️ [STORAGE] Nenhuma configuração encontrada, criando configuração padrão...");
        // Criar configuração padrão se não existir
        const defaultSettings: InsertCookieSettings = {
          isEnabled: true,
          title: "Cookies & Privacidade",
          message: "Utilizamos cookies para melhorar sua experiência no site e personalizar conteúdo. Ao continuar navegando, você concorda com nossa política de privacidade.",
          acceptButtonText: "Aceitar Cookies",
          declineButtonText: "Não Aceitar",
          privacyLinkText: "Política de Privacidade",
          termsLinkText: "Termos de Uso",
          position: "top"
        };

        const [created] = await this.db.insert(cookieSettings).values(defaultSettings).returning();
        console.log("✅ [STORAGE] Configuração padrão criada:", created);
        return created;
      }
      
      console.log("✅ [STORAGE] Configuração encontrada no banco:", result[0]);
      return result[0];
    } catch (error) {
      console.error("❌ [STORAGE] Erro ao buscar configurações de cookies:", error);
      throw error;
    }
  }

  async updateCookieSettings(data: Partial<InsertCookieSettings>): Promise<CookieSettings> {
    try {
      console.log("🔄 [STORAGE] Atualizando configurações de cookies...");
      console.log("🔄 [STORAGE] Dados recebidos:", data);
      
      const existing = await this.getCookieSettings();
      console.log("🔄 [STORAGE] Configuração existente:", existing);
      
      const [updated] = await this.db
        .update(cookieSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(cookieSettings.id, existing.id))
        .returning();
      
      console.log("✅ [STORAGE] Configuração atualizada no banco:", updated);
      return updated;
    } catch (error) {
      console.error("❌ [STORAGE] Erro ao atualizar configurações de cookies:", error);
      throw error;
    }
  }

  // Privacy Policy methods
  async getPrivacyPolicy(): Promise<PrivacyPolicy> {
    try {
      const result = await this.db.select().from(privacyPolicy).where(eq(privacyPolicy.isActive, true)).limit(1);
      if (result.length === 0) {
        // Criar política padrão se não existir
        const defaultPolicy: InsertPrivacyPolicy = {
          title: "Política de Privacidade",
          content: `<h2>1. Informações que Coletamos</h2>
<p>Coletamos informações que você nos fornece diretamente, como quando você preenche formulários de contato ou agenda consultas.</p>

<h2>2. Como Usamos suas Informações</h2>
<p>Utilizamos suas informações para fornecer e melhorar nossos serviços, responder às suas solicitações e manter contato profissional.</p>

<h2>3. Compartilhamento de Informações</h2>
<p>Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.</p>

<h2>4. Segurança</h2>
<p>Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>

<h2>5. Seus Direitos</h2>
<p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Entre em contato conosco para exercer esses direitos.</p>

<h2>6. Contato</h2>
<p>Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco através dos meios disponíveis no site.</p>`,
          isActive: true
        };

        const [created] = await this.db.insert(privacyPolicy).values(defaultPolicy).returning();
        return created;
      }
      return result[0];
    } catch (error) {
      console.error('Error getting privacy policy:', error);
      throw error;
    }
  }

  async updatePrivacyPolicy(data: InsertPrivacyPolicy): Promise<PrivacyPolicy> {
    try {
      const existing = await this.getPrivacyPolicy();
      const [updated] = await this.db
        .update(privacyPolicy)
        .set({ ...data, updatedAt: new Date(), lastUpdated: new Date() })
        .where(eq(privacyPolicy.id, existing.id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating privacy policy:', error);
      throw error;
    }
  }

  // Terms of Use methods
  async getTermsOfUse(): Promise<TermsOfUse> {
    try {
      const result = await this.db.select().from(termsOfUse).where(eq(termsOfUse.isActive, true)).limit(1);
      if (result.length === 0) {
        // Criar termos padrão se não existir
        const defaultTerms: InsertTermsOfUse = {
          title: "Termos de Uso",
          content: `<h2>1. Aceitação dos Termos</h2>
<p>Ao acessar e usar este site, você aceita e concorda em ficar vinculado aos termos e condições desta política.</p>

<h2>2. Uso do Site</h2>
<p>Este site destina-se a fornecer informações sobre nossos serviços de psicologia. Você concorda em usar o site apenas para fins legítimos.</p>

<h2>3. Propriedade Intelectual</h2>
<p>Todo o conteúdo deste site, incluindo textos, imagens e design, é de nossa propriedade e está protegido por leis de direitos autorais.</p>

<h2>4. Limitação de Responsabilidade</h2>
<p>Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso deste site ou dos serviços oferecidos.</p>

<h2>5. Modificações</h2>
<p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.</p>

<h2>6. Lei Aplicável</h2>
<p>Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.</p>`,
          isActive: true
        };

        const [created] = await this.db.insert(termsOfUse).values(defaultTerms).returning();
        return created;
      }
      return result[0];
    } catch (error) {
      console.error('Error getting terms of use:', error);
      throw error;
    }
  }

  async updateTermsOfUse(data: InsertTermsOfUse): Promise<TermsOfUse> {
    try {
      const existing = await this.getTermsOfUse();
      const [updated] = await this.db
        .update(termsOfUse)
        .set({ ...data, updatedAt: new Date(), lastUpdated: new Date() })
        .where(eq(termsOfUse.id, existing.id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating terms of use:', error);
      throw error;
    }
  }

  // Articles methods
  async getAllArticles(): Promise<Article[]> {
    try {
      return await this.db
        .select()
        .from(articles)
        .orderBy(asc(articles.order), desc(articles.createdAt));
    } catch (error) {
      console.error('Error getting all articles:', error);
      throw error;
    }
  }

  async getPublishedArticles(): Promise<Article[]> {
    try {
      return await this.db
        .select()
        .from(articles)
        .where(eq(articles.isPublished, true))
        .orderBy(asc(articles.order), desc(articles.publishedAt));
    } catch (error) {
      console.error('Error getting published articles:', error);
      throw error;
    }
  }

  async getFeaturedArticles(): Promise<Article[]> {
    try {
      return await this.db
        .select()
        .from(articles)
        .where(and(eq(articles.isFeatured, true), eq(articles.isPublished, true)))
        .orderBy(asc(articles.order), desc(articles.publishedAt))
        .limit(6);
    } catch (error) {
      console.error('Error getting featured articles:', error);
      throw error;
    }
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    try {
      const [article] = await this.db
        .select()
        .from(articles)
        .where(eq(articles.id, id));
      return article || undefined;
    } catch (error) {
      console.error('Error getting article by id:', error);
      throw error;
    }
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    try {
      const [created] = await this.db
        .insert(articles)
        .values({
          ...article,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article> {
    try {
      const [updated] = await this.db
        .update(articles)
        .set({ ...article, updatedAt: new Date() })
        .where(eq(articles.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  async deleteArticle(id: number): Promise<void> {
    try {
      await this.db
        .delete(articles)
        .where(eq(articles.id, id));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  async publishArticle(id: number): Promise<Article> {
    try {
      const [published] = await this.db
        .update(articles)
        .set({ 
          isPublished: true, 
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(articles.id, id))
        .returning();
      return published;
    } catch (error) {
      console.error('Error publishing article:', error);
      throw error;
    }
  }

  async unpublishArticle(id: number): Promise<Article> {
    try {
      const [unpublished] = await this.db
        .update(articles)
        .set({ 
          isPublished: false,
          updatedAt: new Date()
        })
        .where(eq(articles.id, id))
        .returning();
      return unpublished;
    } catch (error) {
      console.error('Error unpublishing article:', error);
      throw error;
    }
  }

  async reorderArticles(reorderData: Array<{ id: number; order: number }>): Promise<Article[]> {
    try {
      console.log("🔄 STORAGE - reorderArticles chamada com:", JSON.stringify(reorderData, null, 2));
      
      // Verificar estado atual antes da atualização
      const currentArticles = await this.db.select({ id: articles.id, order: articles.order }).from(articles);
      console.log("🔍 STORAGE - Estado atual antes da atualização:", currentArticles);
      
      // Usar uma transação para garantir atomicidade
      await this.db.transaction(async (tx: any) => {
        for (const { id, order } of reorderData) {
          console.log(`🔄 STORAGE - Atualizando artigo ID ${id} para ordem ${order}`);
          const result = await tx
            .update(articles)
            .set({ order, updatedAt: new Date() })
            .where(eq(articles.id, id))
            .returning();
          console.log(`✅ STORAGE - Artigo ${id} atualizado:`, result.length > 0 ? "sucesso" : "nenhum registro encontrado");
        }
      });
      
      // Retornar todos os artigos atualizados e ordenados corretamente
      const updatedArticles = await this.getAllArticles();
      console.log("🔍 STORAGE - Artigos finais retornados:", updatedArticles.length, "itens ordenados por 'order'");
      
      console.log("✅ STORAGE - reorderArticles concluída com sucesso");
      return updatedArticles;
    } catch (error) {
      console.error('❌ STORAGE - Error reordering articles:', error);
      console.error('❌ STORAGE - Stack trace:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }

  // User Preferences methods
  async getUserPreference(key: string): Promise<UserPreference | undefined> {
    try {
      const [preference] = await this.db.select().from(userPreferences).where(eq(userPreferences.key, key));
      return preference || undefined;
    } catch (error) {
      console.error('Error getting user preference:', error);
      throw error;
    }
  }

  async setUserPreference(preference: InsertUserPreference): Promise<UserPreference> {
    try {
      const existing = await this.getUserPreference(preference.key);
      if (existing) {
        const [updated] = await this.db
          .update(userPreferences)
          .set({ value: preference.value, updatedAt: new Date() })
          .where(eq(userPreferences.key, preference.key))
          .returning();
        return updated;
      } else {
        const [created] = await this.db.insert(userPreferences).values(preference).returning();
        return created;
      }
    } catch (error) {
      console.error('Error setting user preference:', error);
      throw error;
    }
  }

  async getAllUserPreferences(): Promise<UserPreference[]> {
    try {
      return await this.db.select().from(userPreferences);
    } catch (error) {
      console.error('Error getting all user preferences:', error);
      throw error;
    }
  }

  // Chat Messages methods
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const [chatMessage] = await this.db.insert(chatMessages).values(message).returning();
      return chatMessage;
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  async getAllChatMessages(): Promise<ChatMessage[]> {
    try {
      return await this.db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
    } catch (error) {
      console.error('Error getting all chat messages:', error);
      throw error;
    }
  }

  async getUnreadChatMessages(): Promise<ChatMessage[]> {
    try {
      return await this.db.select().from(chatMessages).where(eq(chatMessages.isRead, false)).orderBy(desc(chatMessages.createdAt));
    } catch (error) {
      console.error('Error getting unread chat messages:', error);
      throw error;
    }
  }

  async markChatMessageAsRead(id: number): Promise<ChatMessage> {
    try {
      const [updated] = await this.db
        .update(chatMessages)
        .set({ isRead: true })
        .where(eq(chatMessages.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error marking chat message as read:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();