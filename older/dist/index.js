var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  articles: () => articles,
  chatMessages: () => chatMessages,
  contactSettings: () => contactSettings,
  cookieSettings: () => cookieSettings,
  customCodes: () => customCodes,
  faqItems: () => faqItems,
  footerSettings: () => footerSettings,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertArticleSchema: () => insertArticleSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertCookieSettingsSchema: () => insertCookieSettingsSchema,
  insertCustomCodeSchema: () => insertCustomCodeSchema,
  insertFaqItemSchema: () => insertFaqItemSchema,
  insertPhotoCarouselSchema: () => insertPhotoCarouselSchema,
  insertPrivacyPolicySchema: () => insertPrivacyPolicySchema,
  insertServiceSchema: () => insertServiceSchema,
  insertSiteConfigSchema: () => insertSiteConfigSchema,
  insertSpecialtySchema: () => insertSpecialtySchema,
  insertSupportMessageSchema: () => insertSupportMessageSchema,
  insertTermsOfUseSchema: () => insertTermsOfUseSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  insertUserPreferenceSchema: () => insertUserPreferenceSchema,
  insertUserSchema: () => insertUserSchema,
  photoCarousel: () => photoCarousel,
  privacyPolicy: () => privacyPolicy,
  services: () => services,
  siteConfig: () => siteConfig,
  specialties: () => specialties,
  supportMessages: () => supportMessages,
  termsOfUse: () => termsOfUse,
  testimonials: () => testimonials,
  userPreferences: () => userPreferences,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, adminUsers, siteConfig, testimonials, faqItems, services, customCodes, photoCarousel, specialties, contactSettings, footerSettings, supportMessages, cookieSettings, privacyPolicy, termsOfUse, articles, userPreferences, chatMessages, insertUserSchema, insertAdminUserSchema, insertCookieSettingsSchema, insertPrivacyPolicySchema, insertTermsOfUseSchema, insertArticleSchema, insertUserPreferenceSchema, insertChatMessageSchema, insertCustomCodeSchema, insertSiteConfigSchema, insertTestimonialSchema, insertFaqItemSchema, insertServiceSchema, insertPhotoCarouselSchema, insertSpecialtySchema, insertSupportMessageSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull()
    });
    adminUsers = pgTable("admin_users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    siteConfig = pgTable("site_config", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      value: jsonb("value").notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    testimonials = pgTable("testimonials", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      service: text("service").notNull(),
      testimonial: text("testimonial").notNull(),
      rating: integer("rating").notNull().default(5),
      photo: text("photo"),
      // Caminho para a foto do cliente
      isActive: boolean("is_active").notNull().default(true),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    faqItems = pgTable("faq_items", {
      id: serial("id").primaryKey(),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    services = pgTable("services", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      icon: text("icon").notNull(),
      gradient: text("gradient").notNull(),
      price: text("price"),
      duration: text("duration"),
      showPrice: boolean("show_price").notNull().default(false),
      showDuration: boolean("show_duration").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    customCodes = pgTable("custom_codes", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      // Nome descritivo do código
      code: text("code").notNull(),
      // O código HTML/JS
      location: text("location").notNull(),
      // 'header' ou 'body'
      isActive: boolean("is_active").notNull().default(true),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    photoCarousel = pgTable("photo_carousel", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      imageUrl: text("image_url").notNull(),
      showText: boolean("show_text").notNull().default(true),
      isActive: boolean("is_active").notNull().default(true),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    specialties = pgTable("specialties", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      icon: text("icon").notNull().default("Brain"),
      iconColor: text("icon_color").notNull().default("#ec4899"),
      isActive: boolean("is_active").notNull().default(true),
      order: integer("order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    contactSettings = pgTable("contact_settings", {
      id: serial("id").primaryKey(),
      contact_items: jsonb("contact_items").notNull().default([]),
      schedule_info: jsonb("schedule_info").notNull().default({}),
      location_info: jsonb("location_info").notNull().default({}),
      contact_card: jsonb("contact_card").notNull().default({}),
      info_card: jsonb("info_card").notNull().default({}),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    footerSettings = pgTable("footer_settings", {
      id: serial("id").primaryKey(),
      general_info: jsonb("general_info").notNull().default({}),
      contact_buttons: jsonb("contact_buttons").notNull().default([]),
      certification_items: jsonb("certification_items").notNull().default([]),
      trust_seals: jsonb("trust_seals").notNull().default([]),
      bottom_info: jsonb("bottom_info").notNull().default({}),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    supportMessages = pgTable("support_messages", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      message: text("message").notNull(),
      type: text("type").notNull().default("support"),
      // support, contact, feedback
      attachments: text("attachments").array(),
      // Array de URLs das imagens anexadas
      isRead: boolean("is_read").notNull().default(false),
      adminResponse: text("admin_response"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      respondedAt: timestamp("responded_at")
    });
    cookieSettings = pgTable("cookie_settings", {
      id: serial("id").primaryKey(),
      isEnabled: boolean("is_enabled").notNull().default(true),
      title: text("title").notNull().default("Cookies & Privacidade"),
      message: text("message").notNull().default("Utilizamos cookies para melhorar sua experi\xEAncia no site e personalizar conte\xFAdo. Ao continuar navegando, voc\xEA concorda com nossa pol\xEDtica de privacidade."),
      acceptButtonText: text("accept_button_text").notNull().default("Aceitar Cookies"),
      declineButtonText: text("decline_button_text").notNull().default("N\xE3o Aceitar"),
      privacyLinkText: text("privacy_link_text").notNull().default("Pol\xEDtica de Privacidade"),
      termsLinkText: text("terms_link_text").notNull().default("Termos de Uso"),
      position: text("position").notNull().default("top"),
      // 'top' para desktop, 'bottom' para mobile
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    privacyPolicy = pgTable("privacy_policy", {
      id: serial("id").primaryKey(),
      title: text("title").notNull().default("Pol\xEDtica de Privacidade"),
      content: text("content").notNull(),
      lastUpdated: timestamp("last_updated").defaultNow().notNull(),
      isActive: boolean("is_active").notNull().default(true),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    termsOfUse = pgTable("terms_of_use", {
      id: serial("id").primaryKey(),
      title: text("title").notNull().default("Termos de Uso"),
      content: text("content").notNull(),
      lastUpdated: timestamp("last_updated").defaultNow().notNull(),
      isActive: boolean("is_active").notNull().default(true),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    articles = pgTable("articles", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      subtitle: text("subtitle"),
      badge: text("badge"),
      // Badge/categoria do artigo
      description: text("description").notNull(),
      content: text("content").notNull(),
      // Conteúdo completo do artigo em HTML
      cardImage: text("card_image"),
      // Imagem que aparece no card
      author: text("author").notNull(),
      coAuthors: text("co_authors"),
      // Co-autores separados por vírgula
      institution: text("institution"),
      articleReferences: text("article_references"),
      // Referências em texto formatado
      doi: text("doi"),
      // Digital Object Identifier
      keywords: text("keywords"),
      // Palavras-chave separadas por vírgula
      category: text("category").notNull().default("Psicologia"),
      // Categoria científica
      readingTime: integer("reading_time"),
      // Tempo estimado de leitura em minutos
      // Configurações de display
      showContactButton: boolean("show_contact_button").notNull().default(false),
      contactButtonText: text("contact_button_text").default("Entrar em Contato"),
      contactButtonUrl: text("contact_button_url"),
      // Configurações de publicação
      isPublished: boolean("is_published").notNull().default(false),
      isFeatured: boolean("is_featured").notNull().default(false),
      // Destaque na página principal
      publishedAt: timestamp("published_at"),
      order: integer("order").notNull().default(0),
      // Metadados
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    userPreferences = pgTable("user_preferences", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    chatMessages = pgTable("chat_messages", {
      id: serial("id").primaryKey(),
      message: text("message").notNull(),
      attachments: text("attachments").array(),
      // Array de URLs das imagens anexadas
      attachmentBackups: text("attachment_backups"),
      // JSON com backups base64 das imagens para Render.com
      senderIp: text("sender_ip"),
      // IP para tracking anônimo
      userAgent: text("user_agent"),
      // User agent para analytics
      isRead: boolean("is_read").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true
    });
    insertAdminUserSchema = createInsertSchema(adminUsers).omit({
      id: true,
      createdAt: true
    });
    insertCookieSettingsSchema = createInsertSchema(cookieSettings).omit({
      id: true,
      updatedAt: true
    });
    insertPrivacyPolicySchema = createInsertSchema(privacyPolicy).omit({
      id: true,
      updatedAt: true,
      lastUpdated: true
    });
    insertTermsOfUseSchema = createInsertSchema(termsOfUse).omit({
      id: true,
      updatedAt: true,
      lastUpdated: true
    });
    insertArticleSchema = createInsertSchema(articles).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true
    });
    insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
      id: true,
      updatedAt: true
    });
    insertChatMessageSchema = createInsertSchema(chatMessages).omit({
      id: true,
      createdAt: true,
      isRead: true
    });
    insertCustomCodeSchema = createInsertSchema(customCodes).omit({
      id: true,
      createdAt: true
    });
    insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
      id: true,
      updatedAt: true
    });
    insertTestimonialSchema = createInsertSchema(testimonials).omit({
      id: true,
      createdAt: true
    });
    insertFaqItemSchema = createInsertSchema(faqItems).omit({
      id: true,
      createdAt: true
    });
    insertServiceSchema = createInsertSchema(services).omit({
      id: true,
      createdAt: true
    });
    insertPhotoCarouselSchema = createInsertSchema(photoCarousel).omit({
      id: true,
      createdAt: true
    });
    insertSpecialtySchema = createInsertSchema(specialties).omit({
      id: true,
      createdAt: true
    });
    insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
      id: true,
      createdAt: true,
      respondedAt: true
    }).extend({
      attachments: z.array(z.string()).optional().default([])
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool,
  setupConnectionCleanup: () => setupConnectionCleanup,
  testDatabaseConnection: () => testDatabaseConnection
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("\u2705 Teste de conectividade PostgreSQL bem-sucedido");
    return true;
  } catch (error) {
    console.error("\u274C Teste de conectividade PostgreSQL falhou:", error);
    return false;
  }
}
function setupConnectionCleanup() {
  setInterval(async () => {
    try {
      console.log("\u{1F9F9} Executando limpeza de conex\xF5es idle");
      await pool.query("SELECT 1").catch(() => {
      });
    } catch (error) {
      console.warn("\u26A0\uFE0F Erro na limpeza peri\xF3dica de conex\xF5es:", error);
    }
  }, 6e4);
}
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    neonConfig.useSecureWebSocket = true;
    neonConfig.pipelineConnect = false;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Configurações para prevenir timeouts e crashes
      max: 20,
      // Aumentar pool máximo
      idleTimeoutMillis: 3e4,
      // 30 segundos antes de fechar conexão idle
      connectionTimeoutMillis: 1e4,
      // 10 segundos para timeout de conexão
      maxUses: 7500,
      // Reutilizar conexões mais vezes antes de fechar
      allowExitOnIdle: false,
      // Não permitir exit quando idle
      // Configurações específicas para Neon/Serverless
      keepAlive: true,
      keepAliveInitialDelayMillis: 1e4
    });
    pool.on("error", (err) => {
      console.error("\u274C Erro no pool de conex\xF5es PostgreSQL:", err);
      console.error("\u{1F504} Pool ser\xE1 recriado automaticamente na pr\xF3xima requisi\xE7\xE3o");
    });
    pool.on("connect", (client) => {
      console.log("\u2705 Nova conex\xE3o estabelecida com PostgreSQL");
      client.query("SET statement_timeout = '30s'").catch((err) => {
        console.warn("\u26A0\uFE0F Erro ao configurar statement_timeout:", err.message);
      });
    });
    pool.on("remove", (client) => {
      console.log("\u{1F504} Conex\xE3o PostgreSQL removida do pool");
    });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, asc, desc, and } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      db;
      constructor() {
        this.db = db;
      }
      // User methods
      async getUser(id) {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await this.db.select().from(users).where(eq(users.username, username));
        return user || void 0;
      }
      async createUser(insertUser) {
        const [user] = await this.db.insert(users).values(insertUser).returning();
        return user;
      }
      // Admin methods
      async getAdminUser(username) {
        const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
        return admin || void 0;
      }
      async createAdminUser(insertAdminUser) {
        const [admin] = await this.db.insert(adminUsers).values(insertAdminUser).returning();
        return admin;
      }
      // Site config methods
      async getSiteConfig(key) {
        const [config] = await this.db.select().from(siteConfig).where(eq(siteConfig.key, key));
        return config || void 0;
      }
      async setSiteConfig(config) {
        const existing = await this.getSiteConfig(config.key);
        if (existing) {
          const [updated] = await this.db.update(siteConfig).set({ value: config.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteConfig.key, config.key)).returning();
          return updated;
        } else {
          const [created] = await this.db.insert(siteConfig).values(config).returning();
          return created;
        }
      }
      async getAllSiteConfigs() {
        return await this.db.select().from(siteConfig);
      }
      async deleteSiteConfig(key) {
        await this.db.delete(siteConfig).where(eq(siteConfig.key, key));
      }
      // Testimonials methods
      async getAllTestimonials() {
        return await this.db.select().from(testimonials).orderBy(asc(testimonials.order));
      }
      async getActiveTestimonials() {
        try {
          const result = await this.db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.order));
          console.log("Depoimentos ativos encontrados no storage:", result.length);
          console.log("Depoimentos:", result);
          return result;
        } catch (error) {
          console.error("Erro ao buscar depoimentos ativos:", error);
          return [];
        }
      }
      async createTestimonial(testimonial) {
        try {
          console.log("\u{1F535} Inserindo depoimento no banco");
          const [created] = await this.db.insert(testimonials).values(testimonial).returning();
          console.log("\u2705 Depoimento inserido com ID:", created.id);
          return created;
        } catch (error) {
          console.error("\u274C Erro na inser\xE7\xE3o do depoimento:", error);
          throw error;
        }
      }
      async updateTestimonial(id, testimonial) {
        const [updated] = await this.db.update(testimonials).set(testimonial).where(eq(testimonials.id, id)).returning();
        return updated;
      }
      async deleteTestimonial(id) {
        await this.db.delete(testimonials).where(eq(testimonials.id, id));
      }
      async reorderTestimonials(reorderData) {
        for (const item of reorderData) {
          await this.db.update(testimonials).set({ order: item.order }).where(eq(testimonials.id, item.id));
        }
      }
      // FAQ methods
      async getAllFaqItems() {
        return await this.db.select().from(faqItems).orderBy(asc(faqItems.order));
      }
      async getActiveFaqItems() {
        return await this.db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.order));
      }
      async createFaqItem(faq) {
        const [created] = await this.db.insert(faqItems).values(faq).returning();
        return created;
      }
      async updateFaqItem(id, faq) {
        const [updated] = await this.db.update(faqItems).set(faq).where(eq(faqItems.id, id)).returning();
        return updated;
      }
      async deleteFaqItem(id) {
        await this.db.delete(faqItems).where(eq(faqItems.id, id));
      }
      async reorderFaqItems(reorderData) {
        for (const item of reorderData) {
          await this.db.update(faqItems).set({ order: item.order }).where(eq(faqItems.id, item.id));
        }
      }
      // Services methods
      async getAllServices() {
        return await this.db.select().from(services).orderBy(asc(services.order));
      }
      async getActiveServices() {
        return await this.db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.order));
      }
      async createService(service) {
        const [created] = await this.db.insert(services).values(service).returning();
        return created;
      }
      async updateService(id, service) {
        const [updated] = await this.db.update(services).set(service).where(eq(services.id, id)).returning();
        return updated;
      }
      async deleteService(id) {
        await this.db.delete(services).where(eq(services.id, id));
      }
      async reorderServices(reorderData) {
        for (const item of reorderData) {
          await this.db.update(services).set({ order: item.order }).where(eq(services.id, item.id));
        }
      }
      // Photo Carousel methods
      async getActivePhotoCarousel() {
        return await this.db.select().from(photoCarousel).where(eq(photoCarousel.isActive, true)).orderBy(asc(photoCarousel.order));
      }
      async getAllPhotoCarousel() {
        return await this.db.select().from(photoCarousel).orderBy(asc(photoCarousel.order));
      }
      async createPhotoCarousel(data) {
        const [result] = await this.db.insert(photoCarousel).values(data).returning();
        return result;
      }
      async updatePhotoCarousel(id, data) {
        const [result] = await this.db.update(photoCarousel).set(data).where(eq(photoCarousel.id, id)).returning();
        return result;
      }
      async deletePhotoCarousel(id) {
        await this.db.delete(photoCarousel).where(eq(photoCarousel.id, id));
      }
      async reorderPhotoCarousel(reorderData) {
        for (const item of reorderData) {
          await this.db.update(photoCarousel).set({ order: item.order }).where(eq(photoCarousel.id, item.id));
        }
      }
      // Specialties methods
      async getActiveSpecialties() {
        return await this.db.select().from(specialties).where(eq(specialties.isActive, true)).orderBy(asc(specialties.order));
      }
      async getAllSpecialties() {
        return await this.db.select().from(specialties).orderBy(asc(specialties.order));
      }
      async createSpecialty(data) {
        const [created] = await this.db.insert(specialties).values(data).returning();
        return created;
      }
      async updateSpecialty(id, data) {
        const [updated] = await this.db.update(specialties).set(data).where(eq(specialties.id, id)).returning();
        return updated;
      }
      async deleteSpecialty(id) {
        await this.db.delete(specialties).where(eq(specialties.id, id));
      }
      async reorderSpecialties(reorderData) {
        for (const item of reorderData) {
          await this.db.update(specialties).set({ order: item.order }).where(eq(specialties.id, item.id));
        }
      }
      async getContactSettings() {
        try {
          console.log("\u{1F504} getContactSettings: Iniciando busca...");
          const result = await this.db.select({
            id: contactSettings.id,
            contact_items: contactSettings.contact_items,
            schedule_info: contactSettings.schedule_info,
            location_info: contactSettings.location_info,
            contact_card: contactSettings.contact_card,
            info_card: contactSettings.info_card,
            updatedAt: contactSettings.updatedAt
          }).from(contactSettings).where(eq(contactSettings.id, 1)).limit(1);
          console.log("\u{1F50D} getContactSettings: Raw result:", JSON.stringify(result, null, 2));
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
                weekdays: "Segunda \xE0 Sexta: 8h \xE0s 18h",
                saturday: "S\xE1bado: 8h \xE0s 12h",
                sunday: "Domingo: Fechado",
                additional_info: "Hor\xE1rios flex\xEDveis dispon\xEDveis",
                isActive: true
              },
              location_info: {
                city: "Campo Mour\xE3o, Paran\xE1",
                maps_link: "https://maps.google.com/search/Campo+Mour\xE3o+Paran\xE1",
                isActive: true
              },
              contact_card: {
                title: "Entre em contato",
                description: "Escolha a forma mais conveniente para voc\xEA",
                icon: "Mail",
                iconColor: "#6366f1",
                backgroundColor: "#ffffff"
              },
              info_card: {
                title: "Hor\xE1rios & Localiza\xE7\xE3o",
                description: "Informa\xE7\xF5es pr\xE1ticas para seu atendimento",
                icon: "Clock",
                iconColor: "#10b981",
                backgroundColor: "#ffffff"
              }
            };
            const [created] = await this.db.insert(contactSettings).values(defaultSettings).returning();
            return created;
          }
          const existingData = result[0];
          console.log("\u{1F50D} getContactSettings: Dados encontrados:", JSON.stringify(existingData, null, 2));
          if (!existingData.contact_card || !existingData.info_card) {
            console.log("\u{1F527} Dados de card ausentes, adicionando valores padr\xE3o...");
            const updatedData = {
              ...existingData,
              contact_card: existingData.contact_card || {
                title: "Entre em contato",
                description: "Escolha a forma mais conveniente para voc\xEA",
                icon: "Mail",
                iconColor: "#6366f1",
                backgroundColor: "#ffffff"
              },
              info_card: existingData.info_card || {
                title: "Hor\xE1rios & Localiza\xE7\xE3o",
                description: "Informa\xE7\xF5es pr\xE1ticas para seu atendimento",
                icon: "Clock",
                iconColor: "#10b981",
                backgroundColor: "#ffffff"
              }
            };
            await this.db.update(contactSettings).set({
              contact_card: updatedData.contact_card,
              info_card: updatedData.info_card
            }).where(eq(contactSettings.id, existingData.id));
            return updatedData;
          }
          return existingData;
        } catch (error) {
          console.error("Error getting contact settings:", error);
          throw error;
        }
      }
      async updateContactSettings(updates) {
        try {
          console.log("\u{1F504} Storage: updateContactSettings iniciado");
          console.log("\u{1F4E5} Storage: Updates recebidos:", JSON.stringify(updates, null, 2));
          const existing = await this.getContactSettings();
          console.log("\u{1F4C4} Storage: Dados existentes:", JSON.stringify(existing, null, 2));
          const updatedData = {
            ...existing,
            ...updates
          };
          console.log("\u{1F504} Storage: Dados para atualiza\xE7\xE3o:", JSON.stringify(updatedData, null, 2));
          const [updated] = await this.db.update(contactSettings).set(updatedData).where(eq(contactSettings.id, existing.id)).returning();
          console.log("\u2705 Storage: Atualiza\xE7\xE3o conclu\xEDda:", JSON.stringify(updated, null, 2));
          return updated;
        } catch (error) {
          console.error("\u274C Storage: Error updating contact settings:", error);
          throw error;
        }
      }
      async getFooterSettings() {
        try {
          const result = await this.db.select().from(footerSettings).limit(1);
          if (result.length === 0) {
            const defaultSettings = {
              general_info: {
                description: "Cuidando da sua sa\xFAde mental com carinho e dedica\xE7\xE3o",
                showCnpj: true,
                cnpj: "12.345.678/0001-90"
              },
              contact_buttons: [
                {
                  id: 1,
                  type: "whatsapp",
                  title: "WhatsApp",
                  description: "(44) 998-362-704",
                  label: "WhatsApp",
                  // Mantém compatibilidade
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
                  label: "Instagram",
                  // Mantém compatibilidade
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
                  label: "LinkedIn",
                  // Mantém compatibilidade
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
                  items: ["Presencial e Online", "Campo Mour\xE3o - PR", "Segunda \xE0 S\xE1bado"],
                  additionalInfo: "Atendimento particular<br/>Hor\xE1rios flex\xEDveis",
                  isActive: true,
                  order: 0
                },
                {
                  id: 2,
                  title: "Certifica\xE7\xF5es",
                  items: ["Registrada no Conselho", "Federal de Psicologia", "Sigilo e \xE9tica profissional"],
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
                  label: "\u{1F512}",
                  icon: "lock",
                  color: "#10b981",
                  backgroundColor: "#10b981",
                  gradientFrom: "#10b981",
                  gradientTo: "#059669",
                  useGradient: true,
                  textColor: "#ffffff",
                  description: "Seguran\xE7a e privacidade",
                  isActive: true,
                  order: 1
                },
                {
                  id: 3,
                  label: "\u2696\uFE0F",
                  icon: "scale",
                  color: "#8b5cf6",
                  backgroundColor: "#8b5cf6",
                  gradientFrom: "#8b5cf6",
                  gradientTo: "#ec4899",
                  useGradient: true,
                  textColor: "#ffffff",
                  description: "\xC9tica profissional",
                  isActive: true,
                  order: 2
                }
              ],
              bottom_info: {
                copyright: "\xA9 2024 Dra. Adrielle Benhossi \u2022 Todos os direitos reservados",
                certificationText: "Registrada no Conselho Federal de Psicologia<br/>Sigilo e \xE9tica profissional",
                madeWith: "Made with \u2665 and \u2615 by \u221E"
              }
            };
            const [created] = await this.db.insert(footerSettings).values(defaultSettings).returning();
            return created;
          }
          return result[0];
        } catch (error) {
          console.error("Error getting footer settings:", error);
          throw error;
        }
      }
      async updateFooterSettings(updates) {
        try {
          console.log("\u{1F504} Storage: updateFooterSettings iniciado");
          console.log("\u{1F4E5} Updates recebidos:", JSON.stringify(updates, null, 2));
          const existing = await this.getFooterSettings();
          console.log("\u{1F4CB} Configura\xE7\xF5es existentes encontradas:", existing ? "SIM" : "N\xC3O");
          const updatedData = {
            ...existing,
            ...updates
          };
          console.log("\u{1F527} Dados mesclados para atualiza\xE7\xE3o:", JSON.stringify(updatedData, null, 2));
          const [updated] = await this.db.update(footerSettings).set(updatedData).where(eq(footerSettings.id, existing.id)).returning();
          console.log("\u2705 Storage: Atualiza\xE7\xE3o realizada com sucesso");
          console.log("\u{1F4E4} Dados atualizados:", JSON.stringify(updated, null, 2));
          return updated;
        } catch (error) {
          console.error("\u274C Storage: Erro ao atualizar footer settings:", error);
          console.error("Stack trace completo:", error instanceof Error ? error.stack : "No stack trace");
          throw error;
        }
      }
      async resetFooterSettings() {
        try {
          await this.db.delete(footerSettings);
        } catch (error) {
          console.error("Error resetting footer settings:", error);
          throw error;
        }
      }
      // Support Messages
      async getAllSupportMessages() {
        return await this.db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt));
      }
      async createSupportMessage(data) {
        const [message] = await this.db.insert(supportMessages).values(data).returning();
        return message;
      }
      async updateSupportMessage(id, data) {
        const updateData = { ...data };
        if (data.adminResponse) {
          updateData.respondedAt = /* @__PURE__ */ new Date();
        }
        const [updated] = await this.db.update(supportMessages).set(updateData).where(eq(supportMessages.id, id)).returning();
        return updated;
      }
      async deleteSupportMessage(id) {
        await this.db.delete(supportMessages).where(eq(supportMessages.id, id));
      }
      // Custom Codes methods
      async getAllCustomCodes() {
        return await this.db.select().from(customCodes).orderBy(asc(customCodes.order), asc(customCodes.id));
      }
      async getCustomCodesByLocation(location) {
        return await this.db.select().from(customCodes).where(eq(customCodes.location, location)).orderBy(asc(customCodes.order), asc(customCodes.id));
      }
      async createCustomCode(data) {
        const [code] = await this.db.insert(customCodes).values(data).returning();
        return code;
      }
      async updateCustomCode(id, data) {
        const [updated] = await this.db.update(customCodes).set(data).where(eq(customCodes.id, id)).returning();
        return updated;
      }
      async deleteCustomCode(id) {
        await this.db.delete(customCodes).where(eq(customCodes.id, id));
      }
      async reorderCustomCodes(reorderData) {
        for (const { id, order } of reorderData) {
          await this.db.update(customCodes).set({ order }).where(eq(customCodes.id, id));
        }
      }
      // Cookie Settings methods
      async getCookieSettings() {
        try {
          console.log("\u{1F50D} [STORAGE] Buscando configura\xE7\xF5es de cookies no banco de dados...");
          const result = await this.db.select().from(cookieSettings).limit(1);
          console.log("\u{1F50D} [STORAGE] Resultado da busca:", result);
          if (result.length === 0) {
            console.log("\u26A0\uFE0F [STORAGE] Nenhuma configura\xE7\xE3o encontrada, criando configura\xE7\xE3o padr\xE3o...");
            const defaultSettings = {
              isEnabled: true,
              title: "Cookies & Privacidade",
              message: "Utilizamos cookies para melhorar sua experi\xEAncia no site e personalizar conte\xFAdo. Ao continuar navegando, voc\xEA concorda com nossa pol\xEDtica de privacidade.",
              acceptButtonText: "Aceitar Cookies",
              declineButtonText: "N\xE3o Aceitar",
              privacyLinkText: "Pol\xEDtica de Privacidade",
              termsLinkText: "Termos de Uso",
              position: "top"
            };
            const [created] = await this.db.insert(cookieSettings).values(defaultSettings).returning();
            console.log("\u2705 [STORAGE] Configura\xE7\xE3o padr\xE3o criada:", created);
            return created;
          }
          console.log("\u2705 [STORAGE] Configura\xE7\xE3o encontrada no banco:", result[0]);
          return result[0];
        } catch (error) {
          console.error("\u274C [STORAGE] Erro ao buscar configura\xE7\xF5es de cookies:", error);
          throw error;
        }
      }
      async updateCookieSettings(data) {
        try {
          console.log("\u{1F504} [STORAGE] Atualizando configura\xE7\xF5es de cookies...");
          console.log("\u{1F504} [STORAGE] Dados recebidos:", data);
          const existing = await this.getCookieSettings();
          console.log("\u{1F504} [STORAGE] Configura\xE7\xE3o existente:", existing);
          const [updated] = await this.db.update(cookieSettings).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(cookieSettings.id, existing.id)).returning();
          console.log("\u2705 [STORAGE] Configura\xE7\xE3o atualizada no banco:", updated);
          return updated;
        } catch (error) {
          console.error("\u274C [STORAGE] Erro ao atualizar configura\xE7\xF5es de cookies:", error);
          throw error;
        }
      }
      // Privacy Policy methods
      async getPrivacyPolicy() {
        try {
          const result = await this.db.select().from(privacyPolicy).where(eq(privacyPolicy.isActive, true)).limit(1);
          if (result.length === 0) {
            const defaultPolicy = {
              title: "Pol\xEDtica de Privacidade",
              content: `<h2>1. Informa\xE7\xF5es que Coletamos</h2>
<p>Coletamos informa\xE7\xF5es que voc\xEA nos fornece diretamente, como quando voc\xEA preenche formul\xE1rios de contato ou agenda consultas.</p>

<h2>2. Como Usamos suas Informa\xE7\xF5es</h2>
<p>Utilizamos suas informa\xE7\xF5es para fornecer e melhorar nossos servi\xE7os, responder \xE0s suas solicita\xE7\xF5es e manter contato profissional.</p>

<h2>3. Compartilhamento de Informa\xE7\xF5es</h2>
<p>N\xE3o compartilhamos suas informa\xE7\xF5es pessoais com terceiros, exceto quando necess\xE1rio para fornecer nossos servi\xE7os ou quando exigido por lei.</p>

<h2>4. Seguran\xE7a</h2>
<p>Implementamos medidas de seguran\xE7a adequadas para proteger suas informa\xE7\xF5es pessoais contra acesso n\xE3o autorizado, altera\xE7\xE3o, divulga\xE7\xE3o ou destrui\xE7\xE3o.</p>

<h2>5. Seus Direitos</h2>
<p>Voc\xEA tem o direito de acessar, corrigir ou excluir suas informa\xE7\xF5es pessoais. Entre em contato conosco para exercer esses direitos.</p>

<h2>6. Contato</h2>
<p>Se voc\xEA tiver d\xFAvidas sobre esta pol\xEDtica de privacidade, entre em contato conosco atrav\xE9s dos meios dispon\xEDveis no site.</p>`,
              isActive: true
            };
            const [created] = await this.db.insert(privacyPolicy).values(defaultPolicy).returning();
            return created;
          }
          return result[0];
        } catch (error) {
          console.error("Error getting privacy policy:", error);
          throw error;
        }
      }
      async updatePrivacyPolicy(data) {
        try {
          const existing = await this.getPrivacyPolicy();
          const [updated] = await this.db.update(privacyPolicy).set({ ...data, updatedAt: /* @__PURE__ */ new Date(), lastUpdated: /* @__PURE__ */ new Date() }).where(eq(privacyPolicy.id, existing.id)).returning();
          return updated;
        } catch (error) {
          console.error("Error updating privacy policy:", error);
          throw error;
        }
      }
      // Terms of Use methods
      async getTermsOfUse() {
        try {
          const result = await this.db.select().from(termsOfUse).where(eq(termsOfUse.isActive, true)).limit(1);
          if (result.length === 0) {
            const defaultTerms = {
              title: "Termos de Uso",
              content: `<h2>1. Aceita\xE7\xE3o dos Termos</h2>
<p>Ao acessar e usar este site, voc\xEA aceita e concorda em ficar vinculado aos termos e condi\xE7\xF5es desta pol\xEDtica.</p>

<h2>2. Uso do Site</h2>
<p>Este site destina-se a fornecer informa\xE7\xF5es sobre nossos servi\xE7os de psicologia. Voc\xEA concorda em usar o site apenas para fins leg\xEDtimos.</p>

<h2>3. Propriedade Intelectual</h2>
<p>Todo o conte\xFAdo deste site, incluindo textos, imagens e design, \xE9 de nossa propriedade e est\xE1 protegido por leis de direitos autorais.</p>

<h2>4. Limita\xE7\xE3o de Responsabilidade</h2>
<p>N\xE3o nos responsabilizamos por danos diretos ou indiretos decorrentes do uso deste site ou dos servi\xE7os oferecidos.</p>

<h2>5. Modifica\xE7\xF5es</h2>
<p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As altera\xE7\xF5es entrar\xE3o em vigor imediatamente ap\xF3s a publica\xE7\xE3o.</p>

<h2>6. Lei Aplic\xE1vel</h2>
<p>Estes termos s\xE3o regidos pelas leis brasileiras. Qualquer disputa ser\xE1 resolvida nos tribunais competentes do Brasil.</p>`,
              isActive: true
            };
            const [created] = await this.db.insert(termsOfUse).values(defaultTerms).returning();
            return created;
          }
          return result[0];
        } catch (error) {
          console.error("Error getting terms of use:", error);
          throw error;
        }
      }
      async updateTermsOfUse(data) {
        try {
          const existing = await this.getTermsOfUse();
          const [updated] = await this.db.update(termsOfUse).set({ ...data, updatedAt: /* @__PURE__ */ new Date(), lastUpdated: /* @__PURE__ */ new Date() }).where(eq(termsOfUse.id, existing.id)).returning();
          return updated;
        } catch (error) {
          console.error("Error updating terms of use:", error);
          throw error;
        }
      }
      // Articles methods
      async getAllArticles() {
        try {
          return await this.db.select().from(articles).orderBy(asc(articles.order), desc(articles.createdAt));
        } catch (error) {
          console.error("Error getting all articles:", error);
          throw error;
        }
      }
      async getPublishedArticles() {
        try {
          return await this.db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(asc(articles.order), desc(articles.publishedAt));
        } catch (error) {
          console.error("Error getting published articles:", error);
          throw error;
        }
      }
      async getFeaturedArticles() {
        try {
          return await this.db.select().from(articles).where(and(eq(articles.isFeatured, true), eq(articles.isPublished, true))).orderBy(asc(articles.order), desc(articles.publishedAt)).limit(6);
        } catch (error) {
          console.error("Error getting featured articles:", error);
          throw error;
        }
      }
      async getArticleById(id) {
        try {
          const [article] = await this.db.select().from(articles).where(eq(articles.id, id));
          return article || void 0;
        } catch (error) {
          console.error("Error getting article by id:", error);
          throw error;
        }
      }
      async createArticle(article) {
        try {
          const [created] = await this.db.insert(articles).values({
            ...article,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return created;
        } catch (error) {
          console.error("Error creating article:", error);
          throw error;
        }
      }
      async updateArticle(id, article) {
        try {
          const [updated] = await this.db.update(articles).set({ ...article, updatedAt: /* @__PURE__ */ new Date() }).where(eq(articles.id, id)).returning();
          return updated;
        } catch (error) {
          console.error("Error updating article:", error);
          throw error;
        }
      }
      async deleteArticle(id) {
        try {
          await this.db.delete(articles).where(eq(articles.id, id));
        } catch (error) {
          console.error("Error deleting article:", error);
          throw error;
        }
      }
      async publishArticle(id) {
        try {
          const [published] = await this.db.update(articles).set({
            isPublished: true,
            publishedAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(articles.id, id)).returning();
          return published;
        } catch (error) {
          console.error("Error publishing article:", error);
          throw error;
        }
      }
      async unpublishArticle(id) {
        try {
          const [unpublished] = await this.db.update(articles).set({
            isPublished: false,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(articles.id, id)).returning();
          return unpublished;
        } catch (error) {
          console.error("Error unpublishing article:", error);
          throw error;
        }
      }
      async reorderArticles(reorderData) {
        try {
          console.log("\u{1F504} STORAGE - reorderArticles chamada com:", JSON.stringify(reorderData, null, 2));
          const currentArticles = await this.db.select({ id: articles.id, order: articles.order }).from(articles);
          console.log("\u{1F50D} STORAGE - Estado atual antes da atualiza\xE7\xE3o:", currentArticles);
          await this.db.transaction(async (tx) => {
            for (const { id, order } of reorderData) {
              console.log(`\u{1F504} STORAGE - Atualizando artigo ID ${id} para ordem ${order}`);
              const result = await tx.update(articles).set({ order, updatedAt: /* @__PURE__ */ new Date() }).where(eq(articles.id, id)).returning();
              console.log(`\u2705 STORAGE - Artigo ${id} atualizado:`, result.length > 0 ? "sucesso" : "nenhum registro encontrado");
            }
          });
          const updatedArticles = await this.getAllArticles();
          console.log("\u{1F50D} STORAGE - Artigos finais retornados:", updatedArticles.length, "itens ordenados por 'order'");
          console.log("\u2705 STORAGE - reorderArticles conclu\xEDda com sucesso");
          return updatedArticles;
        } catch (error) {
          console.error("\u274C STORAGE - Error reordering articles:", error);
          console.error("\u274C STORAGE - Stack trace:", error instanceof Error ? error.stack : "No stack");
          throw error;
        }
      }
      // User Preferences methods
      async getUserPreference(key) {
        try {
          const [preference] = await this.db.select().from(userPreferences).where(eq(userPreferences.key, key));
          return preference || void 0;
        } catch (error) {
          console.error("Error getting user preference:", error);
          throw error;
        }
      }
      async setUserPreference(preference) {
        try {
          const existing = await this.getUserPreference(preference.key);
          if (existing) {
            const [updated] = await this.db.update(userPreferences).set({ value: preference.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userPreferences.key, preference.key)).returning();
            return updated;
          } else {
            const [created] = await this.db.insert(userPreferences).values(preference).returning();
            return created;
          }
        } catch (error) {
          console.error("Error setting user preference:", error);
          throw error;
        }
      }
      async getAllUserPreferences() {
        try {
          return await this.db.select().from(userPreferences);
        } catch (error) {
          console.error("Error getting all user preferences:", error);
          throw error;
        }
      }
      // Chat Messages methods
      async createChatMessage(message) {
        try {
          const [chatMessage] = await this.db.insert(chatMessages).values(message).returning();
          return chatMessage;
        } catch (error) {
          console.error("Error creating chat message:", error);
          throw error;
        }
      }
      async getAllChatMessages() {
        try {
          return await this.db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
        } catch (error) {
          console.error("Error getting all chat messages:", error);
          throw error;
        }
      }
      async getUnreadChatMessages() {
        try {
          return await this.db.select().from(chatMessages).where(eq(chatMessages.isRead, false)).orderBy(desc(chatMessages.createdAt));
        } catch (error) {
          console.error("Error getting unread chat messages:", error);
          throw error;
        }
      }
      async markChatMessageAsRead(id) {
        try {
          const [updated] = await this.db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.id, id)).returning();
          return updated;
        } catch (error) {
          console.error("Error marking chat message as read:", error);
          throw error;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/utils/presetIconGenerator.ts
var presetIconGenerator_exports = {};
__export(presetIconGenerator_exports, {
  generateAllPresetIcons: () => generateAllPresetIcons,
  getIconAsBase64: () => getIconAsBase64
});
import { promises as fs5 } from "fs";
import path5 from "path";
import sharp2 from "sharp";
function generateSVGIcon(iconId, size = 32) {
  const iconPath = iconSvgs[iconId] || iconSvgs.brain;
  const color = iconColors[iconId] || "#9333ea";
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="white" rx="3"/>
      <g fill="${color}" transform="translate(1, 1) scale(0.91)">
        ${iconPath}
      </g>
    </svg>
  `;
}
async function generateAllPresetIcons() {
  console.log("\u{1F3A8} Gerando \xEDcones predefinidos como arquivos PNG...");
  try {
    const possibleIconsDirs = [
      path5.join(process.cwd(), "dist", "public", "icons", "presets"),
      // Produção
      path5.join(process.cwd(), "client", "public", "icons", "presets")
      // Desenvolvimento
    ];
    let iconsDir = possibleIconsDirs[0];
    if (process.env.NODE_ENV !== "production") {
      iconsDir = possibleIconsDirs[1];
    }
    await fs5.mkdir(iconsDir, { recursive: true });
    const iconIds = Object.keys(iconSvgs);
    for (const iconId of iconIds) {
      console.log(`\u{1F3A8} Gerando \xEDcone: ${iconId}`);
      const svg16 = generateSVGIcon(iconId, 16);
      const svg32 = generateSVGIcon(iconId, 32);
      const svg180 = generateSVGIcon(iconId, 180);
      const [favicon16, favicon32, appleTouchIcon] = await Promise.all([
        sharp2(Buffer.from(svg16)).resize(16, 16).png().toBuffer(),
        sharp2(Buffer.from(svg32)).resize(32, 32).png().toBuffer(),
        sharp2(Buffer.from(svg180)).resize(180, 180).png().toBuffer()
      ]);
      await Promise.all([
        fs5.writeFile(path5.join(iconsDir, `${iconId}-16x16.png`), favicon16),
        fs5.writeFile(path5.join(iconsDir, `${iconId}-32x32.png`), favicon32),
        fs5.writeFile(path5.join(iconsDir, `${iconId}-180x180.png`), appleTouchIcon),
        fs5.writeFile(path5.join(iconsDir, `${iconId}.ico`), favicon32)
        // usar 32x32 como .ico
      ]);
      console.log(`\u2705 \xCDcone ${iconId} gerado com sucesso`);
    }
    console.log("\u2705 Todos os \xEDcones predefinidos foram gerados!");
  } catch (error) {
    console.error("\u274C Erro na gera\xE7\xE3o de \xEDcones:", error);
    console.warn("\u26A0\uFE0F Continuando sem \xEDcones predefinidos");
  }
}
async function getIconAsBase64(iconId) {
  try {
    const svg16 = generateSVGIcon(iconId, 16);
    const svg32 = generateSVGIcon(iconId, 32);
    const svg180 = generateSVGIcon(iconId, 180);
    const [favicon16, favicon32, appleTouchIcon] = await Promise.all([
      sharp2(Buffer.from(svg16)).resize(16, 16).png().toBuffer(),
      sharp2(Buffer.from(svg32)).resize(32, 32).png().toBuffer(),
      sharp2(Buffer.from(svg180)).resize(180, 180).png().toBuffer()
    ]);
    return {
      favicon: favicon32.toString("base64"),
      favicon16: favicon16.toString("base64"),
      favicon32: favicon32.toString("base64"),
      appleTouchIcon: appleTouchIcon.toString("base64"),
      iconId,
      color: iconColors[iconId] || "#9333ea"
    };
  } catch (error) {
    console.error("\u274C Erro na gera\xE7\xE3o de \xEDcone base64:", error);
    throw error;
  }
}
var iconSvgs, iconColors;
var init_presetIconGenerator = __esm({
  "server/utils/presetIconGenerator.ts"() {
    "use strict";
    iconSvgs = {
      brain: `<path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 2.9 1.3 4.1C6.5 13.1 6 14.5 6 16c0 3.5 2.5 6 6 6s6-2.5 6-6c0-1.5-.5-2.9-1.3-4.1C17.5 10.9 18 9.5 18 8c0-3.5-2.5-6-6-6zm-2 6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 8c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>`,
      heart: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
      book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 0 4 5.5v14zM6.5 15A.5.5 0 0 0 6 15.5v1a.5.5 0 0 0 .5.5H19V15H6.5z"/>`,
      award: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`,
      shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
      target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" fill="white"/><circle cx="12" cy="12" r="2"/>`,
      compass: `<circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="white"/>`,
      sparkles: `<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>`
    };
    iconColors = {
      "brain": "#9333ea",
      // Roxo
      "heart": "#ef4444",
      // Vermelho
      "book": "#2563eb",
      // Azul
      "award": "#ca8a04",
      // Amarelo/dourado
      "shield": "#16a34a",
      // Verde
      "target": "#ea580c",
      // Laranja
      "compass": "#0d9488",
      // Verde-azulado
      "sparkles": "#db2777"
      // Rosa
    };
  }
});

// server/utils/seoRenderer.ts
var seoRenderer_exports = {};
__export(seoRenderer_exports, {
  escapeHtml: () => escapeHtml,
  generateMetaTags: () => generateMetaTags,
  getBaseHTML: () => getBaseHTML,
  getSEOData: () => getSEOData,
  injectSEOIntoHTML: () => injectSEOIntoHTML
});
import path6 from "path";
import fs6 from "fs/promises";
async function getSEOData(url) {
  try {
    const configs = await storage.getAllSiteConfigs();
    const seoConfig = configs.find((c) => c.key === "seo_meta")?.value || {};
    const marketingConfig = configs.find((c) => c.key === "marketing_pixels")?.value || {};
    const generalConfig = configs.find((c) => c.key === "general_info")?.value || {};
    const siteName = generalConfig.siteName || "Adrielle Benhossi - Psic\xF3loga";
    const defaultTitle = generalConfig.headerName || siteName;
    const defaultDescription = "Psic\xF3loga especialista em terapia. Atendimento presencial e online. Agende sua consulta.";
    const defaultAuthor = generalConfig.headerName || "Adrielle Benhossi";
    let ogImageUrl = marketingConfig.ogImage || seoConfig.ogImage || "";
    if (ogImageUrl && !ogImageUrl.startsWith("http")) {
      const baseUrl = getBaseUrl(url);
      ogImageUrl = `${baseUrl}${ogImageUrl}`;
    }
    return {
      title: seoConfig.metaTitle || defaultTitle,
      description: seoConfig.metaDescription || defaultDescription,
      keywords: seoConfig.metaKeywords || "psic\xF3loga, terapia, sa\xFAde mental, psicologia, consult\xF3rio",
      author: defaultAuthor,
      ogTitle: marketingConfig.ogTitle || seoConfig.ogTitle || seoConfig.metaTitle || defaultTitle,
      ogDescription: marketingConfig.ogDescription || seoConfig.ogDescription || seoConfig.metaDescription || defaultDescription,
      ogImage: ogImageUrl,
      ogUrl: url,
      siteName,
      twitterCard: seoConfig.twitterCard || "summary_large_image"
    };
  } catch (error) {
    console.error("\u274C Erro ao buscar dados SEO:", error);
    return {
      title: "Adrielle Benhossi - Psic\xF3loga",
      description: "Psic\xF3loga especialista em terapia. Atendimento presencial e online.",
      keywords: "psic\xF3loga, terapia, sa\xFAde mental",
      author: "Adrielle Benhossi",
      ogTitle: "Adrielle Benhossi - Psic\xF3loga",
      ogDescription: "Psic\xF3loga especialista em terapia. Atendimento presencial e online.",
      ogImage: "",
      ogUrl: url,
      siteName: "Adrielle Benhossi",
      twitterCard: "summary_large_image"
    };
  }
}
function getBaseUrl(fullUrl) {
  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}
function generateMetaTags(seoData) {
  const escapedTitle = escapeHtml(seoData.title);
  const escapedDescription = escapeHtml(seoData.description);
  const escapedKeywords = escapeHtml(seoData.keywords);
  const escapedAuthor = escapeHtml(seoData.author);
  const escapedOgTitle = escapeHtml(seoData.ogTitle);
  const escapedOgDescription = escapeHtml(seoData.ogDescription);
  const escapedSiteName = escapeHtml(seoData.siteName);
  return `
    <!-- Meta tags SEO din\xE2micas injetadas pelo servidor -->
    <meta name="x-seo-injected" content="server-side">
    <meta name="description" content="${escapedDescription}">
    <meta name="keywords" content="${escapedKeywords}">
    <meta name="author" content="${escapedAuthor}">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(seoData.ogUrl)}">
    <meta property="og:title" content="${escapedOgTitle}">
    <meta property="og:description" content="${escapedOgDescription}">
    <meta property="og:site_name" content="${escapedSiteName}">
    ${seoData.ogImage ? `<meta property="og:image" content="${escapeHtml(seoData.ogImage)}">` : ""}
    ${seoData.ogImage ? `<meta property="og:image:width" content="1200">` : ""}
    ${seoData.ogImage ? `<meta property="og:image:height" content="630">` : ""}
    ${seoData.ogImage ? `<meta property="og:image:alt" content="${escapedOgTitle}">` : ""}
    
    <!-- Twitter -->
    <meta property="twitter:card" content="${escapeHtml(seoData.twitterCard)}">
    <meta property="twitter:url" content="${escapeHtml(seoData.ogUrl)}">
    <meta property="twitter:title" content="${escapedOgTitle}">
    <meta property="twitter:description" content="${escapedOgDescription}">
    ${seoData.ogImage ? `<meta property="twitter:image" content="${escapeHtml(seoData.ogImage)}">` : ""}
    
    <!-- Meta tags adicionais para melhor SEO -->
    <meta name="theme-color" content="#ec4899">
    <meta name="msapplication-navbutton-color" content="#ec4899">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="canonical" href="${escapeHtml(seoData.ogUrl)}">
  `;
}
async function injectSEOIntoHTML(htmlContent, seoData) {
  const titleRegex = /<title>.*?<\/title>/i;
  const newTitle = `<title>${escapeHtml(seoData.title)}</title>`;
  let modifiedHtml = htmlContent.replace(titleRegex, newTitle);
  const metaTags = generateMetaTags(seoData);
  const headCloseRegex = /<\/head>/i;
  if (headCloseRegex.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(headCloseRegex, `${metaTags}
  </head>`);
  } else {
    console.warn("\u26A0\uFE0F  Tag </head> n\xE3o encontrada no HTML");
  }
  return modifiedHtml;
}
function escapeHtml(text2) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text2.replace(/[&<>"']/g, (m) => map[m]);
}
async function getBaseHTML() {
  try {
    const possiblePaths = [
      path6.join(process.cwd(), "dist", "public", "index.html"),
      // Produção
      path6.join(process.cwd(), "client", "index.html")
      // Desenvolvimento
    ];
    for (const htmlPath of possiblePaths) {
      try {
        const content = await fs6.readFile(htmlPath, "utf-8");
        console.log(`\u2705 HTML base encontrado em: ${htmlPath}`);
        return content;
      } catch (err) {
        console.log(`\u26A0\uFE0F  HTML n\xE3o encontrado em: ${htmlPath}`);
        continue;
      }
    }
    throw new Error("Nenhum arquivo HTML base encontrado");
  } catch (error) {
    console.error("\u274C Erro ao ler arquivo HTML base:", error);
    throw new Error("Arquivo HTML base n\xE3o encontrado");
  }
}
var init_seoRenderer = __esm({
  "server/utils/seoRenderer.ts"() {
    "use strict";
    init_storage();
  }
});

// server/utils/htmlGenerator.ts
var htmlGenerator_exports = {};
__export(htmlGenerator_exports, {
  forceHTMLRegeneration: () => forceHTMLRegeneration,
  generateCompleteMetaTags: () => generateCompleteMetaTags,
  isHTMLStaticallyGenerated: () => isHTMLStaticallyGenerated,
  regenerateStaticHTML: () => regenerateStaticHTML
});
import fs7 from "fs/promises";
import path7 from "path";
function generateCompleteMetaTags(seoData) {
  const tags = [];
  tags.push(`<meta name="x-seo-generated" content="static-html">`);
  tags.push(`<title>${escapeHtml(seoData.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(seoData.description)}">`);
  tags.push(`<meta name="keywords" content="${escapeHtml(seoData.keywords)}">`);
  tags.push(`<meta name="author" content="${escapeHtml(seoData.author)}">`);
  tags.push(`<meta name="robots" content="index, follow">`);
  tags.push(`<meta name="googlebot" content="index, follow">`);
  tags.push(`<meta property="og:type" content="website">`);
  tags.push(`<meta property="og:url" content="${escapeHtml(seoData.ogUrl)}">`);
  tags.push(`<meta property="og:title" content="${escapeHtml(seoData.ogTitle)}">`);
  tags.push(`<meta property="og:description" content="${escapeHtml(seoData.ogDescription)}">`);
  tags.push(`<meta property="og:site_name" content="${escapeHtml(seoData.siteName)}">`);
  if (seoData.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(seoData.ogImage)}">`);
    tags.push(`<meta property="og:image:width" content="1200">`);
    tags.push(`<meta property="og:image:height" content="630">`);
    tags.push(`<meta property="og:image:alt" content="${escapeHtml(seoData.ogTitle)}">`);
  }
  tags.push(`<meta property="twitter:card" content="${escapeHtml(seoData.twitterCard)}">`);
  tags.push(`<meta property="twitter:url" content="${escapeHtml(seoData.ogUrl)}">`);
  tags.push(`<meta property="twitter:title" content="${escapeHtml(seoData.ogTitle)}">`);
  tags.push(`<meta property="twitter:description" content="${escapeHtml(seoData.ogDescription)}">`);
  if (seoData.ogImage) {
    tags.push(`<meta property="twitter:image" content="${escapeHtml(seoData.ogImage)}">`);
  }
  tags.push(`<meta name="theme-color" content="#ec4899">`);
  tags.push(`<meta name="msapplication-navbutton-color" content="#ec4899">`);
  tags.push(`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`);
  tags.push(`<link rel="canonical" href="${escapeHtml(seoData.ogUrl)}">`);
  return tags.join("\n    ");
}
async function regenerateStaticHTML(baseUrl = "https://example.com") {
  try {
    console.log("\u{1F504} Criando arquivo HTML SEO est\xE1tico separado...");
    const originalHtmlPath = path7.resolve(process.cwd(), "client", "index.html");
    const seoHtmlPath = path7.resolve(process.cwd(), "client", "index-seo.html");
    const originalHTML = await fs7.readFile(originalHtmlPath, "utf8");
    console.log("\u{1F4D6} HTML original lido (ser\xE1 preservado intacto)");
    const seoData = await getSEOData(baseUrl);
    console.log("\u{1F4CA} Dados SEO obtidos:", {
      title: seoData.title,
      hasImage: !!seoData.ogImage
    });
    const metaTags = generateCompleteMetaTags(seoData);
    let seoHTML = originalHTML;
    const titleRegex = /<title>.*?<\/title>/i;
    const newTitle = `<title>${escapeHtml(seoData.title)}</title>`;
    if (titleRegex.test(seoHTML)) {
      seoHTML = seoHTML.replace(titleRegex, newTitle);
    }
    seoHTML = seoHTML.replace(/\s*<meta name="x-seo-generated"[^>]*>\s*/gi, "");
    seoHTML = seoHTML.replace(/\s*<!-- META TAGS SEO DINÂMICAS[\s\S]*?<!-- FIM META TAGS SEO -->\s*/gi, "");
    const viewportRegex = /(<meta name="viewport"[^>]*>)/i;
    if (viewportRegex.test(seoHTML)) {
      seoHTML = seoHTML.replace(viewportRegex, `$1
    
    <!-- META TAGS SEO EST\xC1TICAS - HARDCODED PARA BOTS -->
    ${metaTags}
    <!-- FIM META TAGS SEO -->`);
    }
    await fs7.writeFile(seoHtmlPath, seoHTML, "utf8");
    console.log("\u2705 Arquivo HTML SEO est\xE1tico criado separadamente!");
    console.log("\u{1F4C1} Original preservado:", originalHtmlPath);
    console.log("\u{1F4C1} SEO criado:", seoHtmlPath);
    console.log("\u{1F6E1}\uFE0F Scripts customizados e c\xF3digos do painel admin est\xE3o seguros no original");
  } catch (error) {
    console.error("\u274C Erro ao criar HTML SEO est\xE1tico:", error);
    throw error;
  }
}
async function isHTMLStaticallyGenerated() {
  try {
    const seoHtmlPath = path7.resolve(process.cwd(), "client", "index-seo.html");
    try {
      await fs7.access(seoHtmlPath);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error("\u274C Erro ao verificar HTML SEO est\xE1tico:", error);
    return false;
  }
}
async function forceHTMLRegeneration(baseUrl) {
  try {
    await regenerateStaticHTML(baseUrl);
    return {
      success: true,
      message: "HTML est\xE1tico regenerado com sucesso"
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao regenerar HTML: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
}
var init_htmlGenerator = __esm({
  "server/utils/htmlGenerator.ts"() {
    "use strict";
    init_seoRenderer();
  }
});

// server/utils/botDetector.ts
var botDetector_exports = {};
__export(botDetector_exports, {
  handleBotRequest: () => handleBotRequest,
  isSocialMediaBot: () => isSocialMediaBot2,
  simulateBotRequest: () => simulateBotRequest
});
function isSocialMediaBot2(userAgent) {
  if (!userAgent) return false;
  const lowerUserAgent = userAgent.toLowerCase();
  return SOCIAL_MEDIA_BOTS2.some(
    (bot) => lowerUserAgent.includes(bot.toLowerCase())
  );
}
async function handleBotRequest(req, res) {
  try {
    const userAgent = req.get("User-Agent") || "";
    const isBot = isSocialMediaBot2(userAgent);
    console.log(`\u{1F916} Bot Detector - User Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`\u{1F916} Bot Detector - Is Bot: ${isBot}`);
    if (!isBot) {
      return false;
    }
    console.log("\u{1F50D} Bot de rede social detectado - servindo HTML com SEO server-side");
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;
    console.log("\u{1F310} URL da requisi\xE7\xE3o:", fullUrl);
    const seoData = await getSEOData(fullUrl);
    console.log("\u{1F4CA} Dados SEO obtidos:", {
      title: seoData.title,
      hasImage: !!seoData.ogImage,
      imageUrl: seoData.ogImage?.substring(0, 50) + "..."
    });
    const baseHTML = await getBaseHTML();
    const htmlWithSEO = await injectSEOIntoHTML(baseHTML, seoData);
    console.log("\u2705 HTML com SEO gerado para bot - enviando resposta");
    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      // Cache por 1 hora para bots
      "Vary": "User-Agent, Accept-Encoding",
      "X-Bot-Detected": "true",
      "X-SEO-Injected": "server-side"
    });
    res.send(htmlWithSEO);
    return true;
  } catch (error) {
    console.error("\u274C Erro no detector de bot:", error);
    return false;
  }
}
async function simulateBotRequest(req, res) {
  try {
    const testUserAgent = req.query.userAgent || "facebookexternalhit/1.1";
    const testUrl = req.query.url || `${req.protocol}://${req.get("host")}`;
    console.log(`\u{1F9EA} Simulando bot - User Agent: ${testUserAgent}`);
    console.log(`\u{1F9EA} Simulando bot - URL: ${testUrl}`);
    if (req.query.format === "json") {
      const seoData = await getSEOData(testUrl);
      return res.json({
        success: true,
        testUserAgent,
        testUrl,
        isBot: isSocialMediaBot2(testUserAgent),
        seoData,
        message: "Simula\xE7\xE3o de bot executada com sucesso"
      });
    }
    const originalUserAgent = req.get("User-Agent");
    req.headers["user-agent"] = testUserAgent;
    const botHandled = await handleBotRequest(req, res);
    if (originalUserAgent) {
      req.headers["user-agent"] = originalUserAgent;
    }
    if (!botHandled) {
      res.json({
        success: false,
        message: "User-Agent n\xE3o foi reconhecido como bot de rede social",
        testUserAgent,
        isBot: isSocialMediaBot2(testUserAgent)
      });
    }
  } catch (error) {
    console.error("\u274C Erro na simula\xE7\xE3o de bot:", error);
    res.status(500).json({
      error: "Erro na simula\xE7\xE3o de bot",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
}
var SOCIAL_MEDIA_BOTS2;
var init_botDetector = __esm({
  "server/utils/botDetector.ts"() {
    "use strict";
    init_seoRenderer();
    SOCIAL_MEDIA_BOTS2 = [
      "facebookexternalhit",
      "Facebot",
      "Twitterbot",
      "LinkedInBot",
      "WhatsApp",
      "TelegramBot",
      "SkypeUriPreview",
      "AppleBot",
      "Google-StructuredDataTestingTool",
      "FacebookBot",
      "LinkedInBot",
      "SlackBot",
      "DiscordBot",
      "facebookcatalog",
      "facebookplatform",
      "Applebot",
      "vkShare",
      "Googlebot"
    ];
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path9 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react(),
        runtimeErrorOverlay(),
        ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
          await import("@replit/vite-plugin-cartographer").then(
            (m) => m.cartographer()
          )
        ] : []
      ],
      resolve: {
        alias: {
          "@": path9.resolve(import.meta.dirname, "client", "src"),
          "@shared": path9.resolve(import.meta.dirname, "shared"),
          "@assets": path9.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path9.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path9.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs9 from "fs";
import path10 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path10.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs9.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path10.resolve(import.meta.dirname, "public");
  if (!fs9.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path10.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  async "server/vite.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/index.ts
import express2 from "express";
import compression from "compression";
import path11 from "path";

// server/routes.ts
init_storage();
init_schema();
import { createServer } from "http";
import multer from "multer";
import path8 from "path";
import fs8 from "fs/promises";
import { existsSync as existsSync2, mkdirSync } from "fs";
import sharp3 from "sharp";

// server/utils/imageOptimizer.ts
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
async function optimizeImage(inputPath, uploadType, options) {
  try {
    const typeSettings = {
      hero: { quality: 90, maxWidth: 1200, maxHeight: 800 },
      testimonials: { quality: 85, maxWidth: 400, maxHeight: 400 },
      carousel: { quality: 90, maxWidth: 1200, maxHeight: 800 },
      articles: { quality: 90, maxWidth: 1200, maxHeight: 800 },
      support: { quality: 85, maxWidth: 800, maxHeight: 600 },
      secret: { quality: 85, maxWidth: 800, maxHeight: 600 }
    };
    const settings = { ...typeSettings[uploadType], ...options };
    const parsedPath = path.parse(inputPath);
    const outputDir = path.join(process.cwd(), "uploads", uploadType);
    const outputPath = path.join(outputDir, `${parsedPath.name}.webp`);
    if (!existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }
    await sharp(inputPath).resize(settings.maxWidth, settings.maxHeight, { fit: "inside", withoutEnlargement: true }).webp({ quality: settings.quality }).toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw error;
  }
}
function getOptimizedPath(filename, uploadType) {
  const parsedPath = path.parse(filename);
  return `/uploads/${uploadType}/${parsedPath.name}.webp`;
}
async function cleanupOriginal(filePath) {
  try {
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up original file:", error);
  }
}

// server/utils/emailService.ts
import Mailgun from "mailgun.js";
import formData from "form-data";
import fs2 from "fs";
import path2 from "path";
var mailgun = new Mailgun(formData);
var MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
var MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
var RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;
var mg = null;
function initializeMailgun() {
  if (!mg && MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    try {
      mg = mailgun.client({
        username: "api",
        key: MAILGUN_API_KEY
      });
      console.log("\u2705 Mailgun client initialized successfully");
    } catch (error) {
      console.error("\u274C Error initializing Mailgun client:", error);
    }
  }
  return mg;
}
async function sendSupportEmail(messageData) {
  try {
    console.log("\u{1F4E7} Attempting to send email via Mailgun...");
    console.log("Message data:", {
      subject: messageData.subject,
      type: messageData.type,
      senderEmail: messageData.email,
      senderName: messageData.name
    });
    if (!MAILGUN_API_KEY) {
      console.error("\u274C MAILGUN_API_KEY not found in environment variables");
      return { success: false, error: "MAILGUN_API_KEY not configured" };
    }
    if (!MAILGUN_DOMAIN) {
      console.error("\u274C MAILGUN_DOMAIN not found in environment variables");
      return { success: false, error: "MAILGUN_DOMAIN not configured" };
    }
    if (!RECIPIENT_EMAIL) {
      console.error("\u274C RECIPIENT_EMAIL not found in environment variables");
      return { success: false, error: "RECIPIENT_EMAIL not configured" };
    }
    const client = initializeMailgun();
    if (!client) {
      console.error("\u274C Failed to initialize Mailgun client");
      return { success: false, error: "Failed to initialize Mailgun client" };
    }
    const emailSubject = messageData.subject && messageData.subject.trim() !== "" ? `[${messageData.type.toUpperCase()}] ${messageData.subject}` : messageData.type === "secret-message" ? messageData.message.substring(0, 50) + (messageData.message.length > 50 ? "..." : "") : `[${messageData.type.toUpperCase()}] Mensagem sem assunto`;
    const finalRecipient = messageData.recipientOverride || RECIPIENT_EMAIL;
    let attachmentInfo = "";
    const emailAttachments = [];
    const webImageLinks = [];
    if (messageData.attachments && messageData.attachments.length > 0) {
      console.log("\u{1F4CE} === INICIANDO PROCESSAMENTO DE ANEXOS ===");
      console.log("\u{1F4CE} Anexos recebidos:", messageData.attachments);
      console.log("\u{1F4CE} Tipo:", typeof messageData.attachments, "Array:", Array.isArray(messageData.attachments));
      console.log("\u{1F4CE} Server URL:", messageData.serverUrl);
      const attachments = Array.isArray(messageData.attachments) ? messageData.attachments : [messageData.attachments];
      console.log("\u{1F4CE} Anexos normalizados:", attachments);
      attachmentInfo = `

\u{1F4CE} ANEXOS (${attachments.length} imagem${attachments.length > 1 ? "s" : ""}):

`;
      for (let index = 0; index < attachments.length; index++) {
        const attachmentUrl = attachments[index];
        console.log(`\u{1F4CE} === PROCESSANDO ANEXO ${index + 1}/${attachments.length} ===`);
        console.log(`\u{1F4CE} URL original: ${attachmentUrl}`);
        if (!attachmentUrl || typeof attachmentUrl !== "string") {
          console.warn(`\u26A0\uFE0F Anexo ${index + 1} inv\xE1lido:`, attachmentUrl);
          attachmentInfo += `${index + 1}. (Anexo inv\xE1lido)

`;
          continue;
        }
        try {
          let filePath = "";
          let webUrl = "";
          if (attachmentUrl.startsWith("/uploads/")) {
            filePath = path2.join(process.cwd(), attachmentUrl.substring(1));
            webUrl = attachmentUrl;
          } else if (attachmentUrl.startsWith("uploads/")) {
            filePath = path2.join(process.cwd(), attachmentUrl);
            webUrl = "/" + attachmentUrl;
          } else if (path2.isAbsolute(attachmentUrl)) {
            filePath = attachmentUrl;
            const relativePath = attachmentUrl.replace(process.cwd(), "").replace(/\\/g, "/");
            webUrl = relativePath.startsWith("/") ? relativePath : "/" + relativePath;
          } else {
            const fileName2 = path2.basename(attachmentUrl);
            const uploadDir = messageData.type === "secret-message" ? "secret" : "support";
            filePath = path2.join(process.cwd(), "uploads", uploadDir, fileName2);
            webUrl = `/uploads/${uploadDir}/${fileName2}`;
            console.log(`\u{1F504} Interpretando como nome de arquivo (${uploadDir}): ${attachmentUrl} \u2192 ${filePath}`);
          }
          console.log(`\u{1F4C2} Caminho do arquivo calculado: ${filePath}`);
          console.log(`\u{1F310} URL web relativa: ${webUrl}`);
          console.log(`\u{1F4C2} Diret\xF3rio de trabalho atual: ${process.cwd()}`);
          const fileName = path2.basename(filePath);
          const fileExists = fs2.existsSync(filePath);
          console.log(`\u{1F4CB} Arquivo existe: ${fileExists}`);
          if (!fileExists) {
            const uploadDir = messageData.type === "secret-message" ? "secret" : "support";
            const alternativePaths = [
              path2.join(process.cwd(), "uploads", uploadDir, fileName),
              path2.join(process.cwd(), "uploads", "support", fileName),
              // fallback para support
              path2.join(process.cwd(), "uploads", "secret", fileName),
              // fallback para secret
              path2.join(process.cwd(), attachmentUrl),
              attachmentUrl
            ];
            console.log(`\u{1F50D} Arquivo n\xE3o encontrado em ${filePath}, testando caminhos alternativos:`);
            for (const altPath of alternativePaths) {
              console.log(`   \u{1F50D} Testando: ${altPath}`);
              if (fs2.existsSync(altPath)) {
                console.log(`   \u2705 Encontrado em: ${altPath}`);
                filePath = altPath;
                break;
              }
            }
          }
          if (fileExists) {
            try {
              const fileBuffer = fs2.readFileSync(filePath);
              const fileStats = fs2.statSync(filePath);
              const sizeKB = Math.round(fileStats.size / 1024);
              const fileExtension = path2.extname(fileName).toLowerCase();
              let contentType = "application/octet-stream";
              switch (fileExtension) {
                case ".jpg":
                case ".jpeg":
                  contentType = "image/jpeg";
                  break;
                case ".png":
                  contentType = "image/png";
                  break;
                case ".gif":
                  contentType = "image/gif";
                  break;
                case ".webp":
                  contentType = "image/webp";
                  break;
                case ".svg":
                  contentType = "image/svg+xml";
                  break;
                case ".bmp":
                  contentType = "image/bmp";
                  break;
              }
              emailAttachments.push({
                filename: fileName,
                data: fileBuffer,
                contentType
              });
              console.log(`\u2705 Arquivo anexado: ${fileName} (${sizeKB}KB, ${contentType})`);
              if (webUrl && messageData.serverUrl) {
                let correctedServerUrl = messageData.serverUrl;
                if (correctedServerUrl.includes("localhost") || correctedServerUrl.includes("127.0.0.1") || correctedServerUrl.includes(":5001")) {
                  if (process.env.REPLIT_DEV_DOMAIN) {
                    correctedServerUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
                  } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
                    correctedServerUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
                  } else {
                    correctedServerUrl = "https://your-replit-app.replit.app";
                  }
                  console.log(`\u{1F504} URL localhost detectada, corrigindo: ${messageData.serverUrl} \u2192 ${correctedServerUrl}`);
                }
                const fullWebUrl = `${correctedServerUrl}${webUrl}`;
                webImageLinks.push(fullWebUrl);
                console.log(`\u2705 Link web corrigido gerado: ${fullWebUrl}`);
                attachmentInfo += `${index + 1}. \u{1F4CE} ${fileName} (${sizeKB}KB)
`;
                attachmentInfo += `   \u2705 Anexada ao email

`;
              } else {
                attachmentInfo += `${index + 1}. \u{1F4CE} ${fileName} (${sizeKB}KB)
`;
                attachmentInfo += `   \u2705 Anexada ao email
`;
                attachmentInfo += `   \u274C Link n\xE3o dispon\xEDvel

`;
              }
            } catch (readError) {
              console.error(`\u274C Erro ao ler arquivo ${filePath}:`, readError);
              attachmentInfo += `${index + 1}. \u274C ${fileName} (erro ao ler arquivo)

`;
            }
          } else {
            console.warn(`\u26A0\uFE0F Arquivo n\xE3o encontrado: ${filePath}`);
            if (webUrl && messageData.serverUrl) {
              let correctedServerUrl = messageData.serverUrl;
              if (correctedServerUrl.includes("localhost") || correctedServerUrl.includes("127.0.0.1") || correctedServerUrl.includes(":5001")) {
                if (process.env.REPLIT_DEV_DOMAIN) {
                  correctedServerUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
                } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
                  correctedServerUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
                } else {
                  correctedServerUrl = "https://your-replit-app.replit.app";
                }
              }
              const fullWebUrl = `${correctedServerUrl}${webUrl}`;
              webImageLinks.push(fullWebUrl);
              attachmentInfo += `${index + 1}. \u26A0\uFE0F ${fileName} (arquivo n\xE3o encontrado no servidor)

`;
            } else {
              attachmentInfo += `${index + 1}. \u274C ${fileName} (arquivo e link n\xE3o dispon\xEDveis)

`;
            }
          }
        } catch (error) {
          console.error(`\u274C Erro ao processar anexo ${index + 1}:`, error);
          attachmentInfo += `${index + 1}. \u274C ${path2.basename(attachmentUrl)} (erro ao processar)

`;
        }
      }
      if (webImageLinks.length > 0) {
        const uniqueLinks = Array.from(new Set(webImageLinks));
        attachmentInfo += `
\u{1F517} LINKS PARA VISUALIZA\xC7\xC3O (clique para abrir):
`;
        uniqueLinks.forEach((link, index) => {
          const fileName = path2.basename(link);
          attachmentInfo += `\u2022 ${fileName}: ${link}
`;
        });
        attachmentInfo += `
\u{1F4A1} Dica: Clique nos links acima para visualizar as imagens no navegador
`;
      }
      console.log(`\u{1F4CE} === RESUMO DO PROCESSAMENTO ===`);
      console.log(`\u{1F4CE} Arquivos anexados ao email: ${emailAttachments.length}/${attachments.length}`);
      console.log(`\u{1F517} Links web gerados: ${webImageLinks.length}`);
      console.log(`\u{1F4CE} Anexos para email:`, emailAttachments.map((a) => a.filename));
      console.log(`\u{1F517} Links web:`, webImageLinks);
    } else {
      console.log("\u{1F4CE} Nenhum anexo para processar");
    }
    const emailBody = `
Nova mensagem recebida via sistema web:

\u{1F4E9} Tipo: ${messageData.type}
\u{1F464} Nome: ${messageData.name}
\u{1F4E7} Email: ${messageData.email}
\u{1F4DD} Assunto: ${messageData.subject || "Contato via site"}

\u{1F4AC} Mensagem:
${messageData.message}${attachmentInfo}

---
Enviado em: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}
Sistema de Contato Web
    `.trim();
    console.log(`\u{1F4E4} Sending email to: ${finalRecipient}`);
    console.log(`\u{1F4EC} From domain: ${MAILGUN_DOMAIN}`);
    const mailData = {
      from: `Sistema de Contato <noreply@${MAILGUN_DOMAIN}>`,
      to: finalRecipient,
      subject: emailSubject,
      text: emailBody,
      "h:Reply-To": messageData.email
    };
    if (emailAttachments.length > 0) {
      console.log(`\u{1F4CE} Configurando ${emailAttachments.length} anexo(s) para Mailgun:`);
      if (emailAttachments.length === 1) {
        mailData.attachment = {
          filename: emailAttachments[0].filename,
          data: emailAttachments[0].data,
          contentType: emailAttachments[0].contentType
        };
        console.log(`   \u{1F4CE} Anexo \xFAnico: ${emailAttachments[0].filename} (${emailAttachments[0].data.length} bytes, ${emailAttachments[0].contentType})`);
      } else {
        mailData.attachment = emailAttachments.map((att) => ({
          filename: att.filename,
          data: att.data,
          contentType: att.contentType
        }));
        console.log(`   \u{1F4CE} M\xFAltiplos anexos:`);
        emailAttachments.forEach((att, index) => {
          console.log(`      ${index + 1}. ${att.filename} (${att.data.length} bytes, ${att.contentType})`);
        });
      }
    }
    console.log("\u{1F4CB} Email data prepared:", {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      replyTo: mailData["h:Reply-To"],
      attachments: emailAttachments.length,
      hasAttachmentField: "attachment" in mailData,
      attachmentFormat: emailAttachments.length > 0 ? typeof mailData.attachment : "none"
    });
    if (messageData.type === "secret-message") {
      console.log("\u{1F92B} SECRET EMAIL DEBUG:");
      console.log("\u{1F92B} Final recipient:", finalRecipient);
      console.log("\u{1F92B} Original RECIPIENT_EMAIL:", RECIPIENT_EMAIL);
      console.log("\u{1F92B} Override email:", messageData.recipientOverride);
      console.log("\u{1F92B} Message type:", messageData.type);
      console.log("\u{1F92B} Email body preview:", emailBody.substring(0, 100) + "...");
    }
    console.log("\u{1F680} Enviando email para Mailgun...");
    console.log("\u{1F4CB} Dados finais do email:", JSON.stringify({
      ...mailData,
      attachment: mailData.attachment ? Array.isArray(mailData.attachment) ? `[${mailData.attachment.length} anexos]` : "[1 anexo]" : "nenhum"
    }, null, 2));
    try {
      console.log("\u{1F4E4} === DEBUGANDO DADOS PARA MAILGUN ===");
      console.log("\u{1F4E4} Dominio:", MAILGUN_DOMAIN);
      console.log("\u{1F4E4} From:", mailData.from);
      console.log("\u{1F4E4} To:", mailData.to);
      console.log("\u{1F4E4} Subject:", mailData.subject);
      console.log("\u{1F4E4} Has attachment:", !!mailData.attachment);
      if (mailData.attachment) {
        if (Array.isArray(mailData.attachment)) {
          console.log("\u{1F4E4} Anexos (array):", mailData.attachment.length);
          mailData.attachment.forEach((att, idx) => {
            console.log(`   \u{1F4CE} ${idx + 1}: ${att.filename} (${att.data?.length || 0} bytes)`);
          });
        } else {
          console.log("\u{1F4E4} Anexo \xFAnico:", mailData.attachment.filename, `(${mailData.attachment.data?.length || 0} bytes)`);
        }
      }
      const response = await client.messages.create(MAILGUN_DOMAIN, mailData);
      console.log("\u2705 Resposta do Mailgun recebida:", response);
      console.log("\u2705 Email sent successfully via Mailgun!");
      console.log("\u{1F4CA} Mailgun response:", response);
      console.log("\u{1F4EC} Mailgun ID:", response.id);
      console.log("\u{1F4E4} Status message:", response.message);
      if (messageData.type === "secret-message") {
        console.log("\u{1F92B} SECRET EMAIL SENT - ID:", response.id);
        console.log("\u{1F92B} SECRET EMAIL SENT - Status:", response.status);
      }
      return { success: true };
    } catch (mailgunError) {
      console.error("\u274C ERRO ESPEC\xCDFICO DO MAILGUN:", mailgunError);
      console.error("\u274C Detalhes do erro:", {
        message: mailgunError.message,
        status: mailgunError.status,
        details: mailgunError.details || "N/A"
      });
      if (mailData.attachment) {
        console.log("\u{1F504} Tentando reenviar sem anexos como fallback...");
        const mailDataWithoutAttachments = {
          from: mailData.from,
          to: mailData.to,
          subject: mailData.subject + " [ANEXOS REMOVIDOS]",
          text: mailData.text + "\n\n\u26A0\uFE0F ATEN\xC7\xC3O: Os anexos foram removidos devido a erro t\xE9cnico.",
          "h:Reply-To": mailData["h:Reply-To"]
        };
        try {
          const fallbackResponse = await client.messages.create(MAILGUN_DOMAIN, mailDataWithoutAttachments);
          console.log("\u2705 Email enviado sem anexos como fallback:", fallbackResponse);
          return { success: true, error: "Email enviado sem anexos devido a erro t\xE9cnico" };
        } catch (fallbackError) {
          console.error("\u274C Falha tamb\xE9m no fallback sem anexos:", fallbackError);
        }
      }
      throw mailgunError;
    }
  } catch (error) {
    console.error("\u274C Error sending email via Mailgun:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
async function testMailgunConnection() {
  try {
    console.log("\u{1F50D} Testing Mailgun connection...");
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !RECIPIENT_EMAIL) {
      const missing = [];
      if (!MAILGUN_API_KEY) missing.push("MAILGUN_API_KEY");
      if (!MAILGUN_DOMAIN) missing.push("MAILGUN_DOMAIN");
      if (!RECIPIENT_EMAIL) missing.push("RECIPIENT_EMAIL");
      console.error("\u274C Missing environment variables:", missing.join(", "));
      return { success: false, error: `Missing environment variables: ${missing.join(", ")}` };
    }
    const client = initializeMailgun();
    if (!client) {
      return { success: false, error: "Failed to initialize Mailgun client" };
    }
    const testData = {
      name: "Sistema de Teste",
      email: "test@system.local",
      subject: "Teste de Configura\xE7\xE3o do Sistema",
      message: "Este \xE9 um email de teste para verificar se a configura\xE7\xE3o do sistema de email est\xE1 funcionando corretamente.",
      type: "test"
    };
    const result = await sendSupportEmail(testData);
    if (result.success) {
      console.log("\u2705 Mailgun test completed successfully!");
    } else {
      console.error("\u274C Mailgun test failed:", result.error);
    }
    return result;
  } catch (error) {
    console.error("\u274C Error testing Mailgun connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// server/routes.ts
import { z as z2 } from "zod";

// server/utils/logger.ts
import fs3 from "fs";
import path3 from "path";
var logsDir = path3.join(process.cwd(), "logs");
var adminLogsDir = path3.join(logsDir, "admin");
if (!fs3.existsSync(logsDir)) {
  fs3.mkdirSync(logsDir, { recursive: true });
}
if (!fs3.existsSync(adminLogsDir)) {
  fs3.mkdirSync(adminLogsDir, { recursive: true });
}
var AdminLogger = class {
  static formatTimestamp() {
    return (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
  }
  static getMonthYear() {
    const now = /* @__PURE__ */ new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  static writeLog(filename, entry) {
    const logPath = path3.join(adminLogsDir, filename);
    const logEntry = `${entry}
`;
    fs3.appendFileSync(logPath, logEntry, "utf8");
  }
  // Log de alterações no espaço administrativo
  static logAdminChange(data) {
    const monthYear = this.getMonthYear();
    const filename = `admin-changes-${monthYear}.log`;
    let logEntry = `[${data.timestamp}]`;
    logEntry += ` [IP: ${data.ip}]`;
    logEntry += ` [Action: ${data.action}]`;
    if (data.section) logEntry += ` [Section: ${data.section}]`;
    if (data.field) logEntry += ` [Field: ${data.field}]`;
    if (data.oldValue !== void 0) logEntry += ` [Old: "${data.oldValue}"]`;
    if (data.newValue !== void 0) logEntry += ` [New: "${data.newValue}"]`;
    if (data.details) logEntry += ` [Details: ${data.details}]`;
    this.writeLog(filename, logEntry);
  }
  // Log de acessos ao espaço administrativo
  static logAdminAccess(data) {
    const monthYear = this.getMonthYear();
    const filename = `admin-access-${monthYear}.log`;
    let logEntry = `[${data.timestamp}]`;
    logEntry += ` [IP: ${data.ip}]`;
    if (data.userAgent) logEntry += ` [User-Agent: ${data.userAgent}]`;
    logEntry += ` [Action: ${data.action}]`;
    if (data.status) logEntry += ` [Status: ${data.status}]`;
    if (data.details) logEntry += ` [Details: ${data.details}]`;
    this.writeLog(filename, logEntry);
  }
  // Método helper para extrair IP da requisição
  static getClientIP(req) {
    return req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || "unknown";
  }
  // Método helper para registrar alteração com detalhes automáticos
  static logChange(req, section, field, oldValue, newValue) {
    this.logAdminChange({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      action: "UPDATE",
      section,
      field,
      oldValue: typeof oldValue === "object" ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === "object" ? JSON.stringify(newValue) : String(newValue)
    });
  }
  // Método helper para registrar acesso
  static logAccess(req, action, status, details) {
    this.logAdminAccess({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      userAgent: req.headers["user-agent"] || "unknown",
      action,
      status,
      details
    });
  }
  // Método para criar log de criação de item
  static logCreate(req, section, itemId, data) {
    this.logAdminChange({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      action: "CREATE",
      section,
      field: itemId,
      newValue: typeof data === "object" ? JSON.stringify(data) : String(data),
      details: `Created new ${section} item`
    });
  }
  // Método para criar log de exclusão de item
  static logDelete(req, section, itemId, data) {
    this.logAdminChange({
      timestamp: this.formatTimestamp(),
      ip: this.getClientIP(req),
      action: "DELETE",
      section,
      field: itemId,
      oldValue: typeof data === "object" ? JSON.stringify(data) : String(data),
      details: `Deleted ${section} item`
    });
  }
  // Método para ler logs (para exibição no painel admin)
  static readLogs(type, monthYear) {
    const targetMonth = monthYear || this.getMonthYear();
    const filename = `admin-${type}-${targetMonth}.log`;
    const logPath = path3.join(adminLogsDir, filename);
    try {
      if (fs3.existsSync(logPath)) {
        const content = fs3.readFileSync(logPath, "utf8");
        return content.split("\n").filter((line) => line.trim() !== "").reverse();
      }
    } catch (error) {
      console.error(`Erro ao ler log ${filename}:`, error);
    }
    return [];
  }
  // Método para listar meses disponíveis
  static getAvailableMonths() {
    try {
      const files = fs3.readdirSync(adminLogsDir);
      const months = /* @__PURE__ */ new Set();
      files.forEach((file) => {
        const match = file.match(/admin-(?:changes|access)-(\d{4}-\d{2})\.log/);
        if (match) {
          months.add(match[1]);
        }
      });
      return Array.from(months).sort().reverse();
    } catch (error) {
      console.error("Erro ao listar meses dispon\xEDveis:", error);
      return [];
    }
  }
};
var logger_default = AdminLogger;

// server/utils/logReporter.ts
import fs4 from "fs";
import path4 from "path";
var LogReporter = class _LogReporter {
  // Método para gerar relatório mensal com resultado estruturado
  async generateMonthlyReport(monthYear) {
    try {
      const targetMonth = monthYear || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const availableMonths = logger_default.getAvailableMonths();
      if (!availableMonths.includes(targetMonth)) {
        return {
          success: false,
          error: `Nenhum log encontrado para o m\xEAs ${targetMonth}`,
          availableMonths
        };
      }
      const content = _LogReporter.generateTextReport(targetMonth);
      return {
        success: true,
        month: targetMonth,
        content
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao gerar relat\xF3rio: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      };
    }
  }
  // Método para gerar resumo dos logs
  async generateSummary() {
    try {
      const availableMonths = logger_default.getAvailableMonths();
      const monthsData = availableMonths.map((month) => {
        const report = _LogReporter.generateReport(month);
        const monthName = (/* @__PURE__ */ new Date(month + "-01")).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "long"
        });
        return {
          month,
          monthName,
          totalChanges: report.totalChanges,
          totalAccess: report.totalAccess,
          total: report.totalChanges + report.totalAccess
        };
      });
      return {
        success: true,
        totalMonths: availableMonths.length,
        availableMonths,
        summary: _LogReporter.generateSummaryReport(),
        monthsData
      };
    } catch (error) {
      return {
        success: false,
        totalMonths: 0,
        availableMonths: [],
        summary: "",
        monthsData: []
      };
    }
  }
  static parseLogLine(line) {
    const timestampMatch = line.match(/\[([\d-\s:]+)\]/);
    const ipMatch = line.match(/\[IP: ([^\]]+)\]/);
    const actionMatch = line.match(/\[Action: ([^\]]+)\]/);
    const sectionMatch = line.match(/\[Section: ([^\]]+)\]/);
    const fieldMatch = line.match(/\[Field: ([^\]]+)\]/);
    const statusMatch = line.match(/\[Status: ([^\]]+)\]/);
    const userAgentMatch = line.match(/\[User-Agent: ([^\]]+)\]/);
    const oldMatch = line.match(/\[Old: "([^"]*)"\]/);
    const newMatch = line.match(/\[New: "([^"]*)"\]/);
    const detailsMatch = line.match(/\[Details: ([^\]]+)\]/);
    return {
      timestamp: timestampMatch?.[1] || "",
      ip: ipMatch?.[1] || "",
      action: actionMatch?.[1] || "",
      section: sectionMatch?.[1] || "",
      field: fieldMatch?.[1] || "",
      status: statusMatch?.[1] || "",
      userAgent: userAgentMatch?.[1] || "",
      oldValue: oldMatch?.[1] || "",
      newValue: newMatch?.[1] || "",
      details: detailsMatch?.[1] || ""
    };
  }
  static generateReport(monthYear) {
    const targetMonth = monthYear || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const changesLogs = logger_default.readLogs("changes", targetMonth);
    const accessLogs = logger_default.readLogs("access", targetMonth);
    const changes = changesLogs.map((line) => {
      const parsed = this.parseLogLine(line);
      return {
        timestamp: parsed.timestamp,
        ip: parsed.ip,
        action: parsed.action,
        section: parsed.section,
        field: parsed.field,
        details: `${parsed.oldValue ? `De: "${parsed.oldValue}" ` : ""}${parsed.newValue ? `Para: "${parsed.newValue}" ` : ""}${parsed.details}`
      };
    });
    const access = accessLogs.map((line) => {
      const parsed = this.parseLogLine(line);
      return {
        timestamp: parsed.timestamp,
        ip: parsed.ip,
        action: parsed.action,
        status: parsed.status,
        userAgent: parsed.userAgent,
        details: parsed.details
      };
    });
    return {
      month: targetMonth,
      generatedAt: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
      totalChanges: changes.length,
      totalAccess: access.length,
      changes,
      access
    };
  }
  static generateTextReport(monthYear) {
    const report = this.generateReport(monthYear);
    let textReport = "";
    textReport += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n";
    textReport += "                    RELAT\xD3RIO DE LOGS DO SISTEMA\n";
    textReport += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n";
    textReport += `Per\xEDodo: ${(/* @__PURE__ */ new Date(report.month + "-01")).toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
`;
    textReport += `Gerado em: ${report.generatedAt}
`;
    textReport += `Total de Altera\xE7\xF5es: ${report.totalChanges}
`;
    textReport += `Total de Acessos: ${report.totalAccess}
`;
    textReport += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n";
    textReport += "\u{1F4DD} LOGS DE ALTERA\xC7\xD5ES\n";
    textReport += "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";
    if (report.changes.length === 0) {
      textReport += "Nenhuma altera\xE7\xE3o registrada neste per\xEDodo.\n\n";
    } else {
      report.changes.forEach((change, index) => {
        textReport += `${index + 1}. ${change.timestamp}
`;
        textReport += `   IP: ${change.ip}
`;
        textReport += `   A\xE7\xE3o: ${change.action}
`;
        textReport += `   Se\xE7\xE3o: ${change.section}
`;
        textReport += `   Campo: ${change.field}
`;
        if (change.details.trim()) {
          textReport += `   Detalhes: ${change.details}
`;
        }
        textReport += "\n";
      });
    }
    textReport += "\u{1F510} LOGS DE ACESSO\n";
    textReport += "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";
    if (report.access.length === 0) {
      textReport += "Nenhum acesso registrado neste per\xEDodo.\n\n";
    } else {
      report.access.forEach((access, index) => {
        textReport += `${index + 1}. ${access.timestamp}
`;
        textReport += `   IP: ${access.ip}
`;
        textReport += `   A\xE7\xE3o: ${access.action}
`;
        textReport += `   Status: ${access.status}
`;
        if (access.userAgent && access.userAgent !== "unknown") {
          textReport += `   Navegador: ${access.userAgent.substring(0, 80)}${access.userAgent.length > 80 ? "..." : ""}
`;
        }
        if (access.details.trim()) {
          textReport += `   Detalhes: ${access.details}
`;
        }
        textReport += "\n";
      });
    }
    textReport += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n";
    textReport += "                         FIM DO RELAT\xD3RIO\n";
    textReport += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n";
    return textReport;
  }
  static saveTextReport(monthYear) {
    const report = this.generateTextReport(monthYear);
    const targetMonth = monthYear || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const reportsDir = path4.join(process.cwd(), "logs", "reports");
    if (!fs4.existsSync(reportsDir)) {
      fs4.mkdirSync(reportsDir, { recursive: true });
    }
    const filename = `relatorio-logs-${targetMonth}.txt`;
    const filepath = path4.join(reportsDir, filename);
    fs4.writeFileSync(filepath, report, "utf8");
    return filepath;
  }
  static generateSummaryReport() {
    const availableMonths = logger_default.getAvailableMonths();
    let summary = "";
    summary += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n";
    summary += "                    RESUMO GERAL DOS LOGS\n";
    summary += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n";
    summary += `Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}
`;
    summary += `Meses com logs: ${availableMonths.length}
`;
    summary += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n";
    availableMonths.forEach((month) => {
      const report = this.generateReport(month);
      const monthName = (/* @__PURE__ */ new Date(month + "-01")).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long"
      });
      summary += `\u{1F4C5} ${monthName}
`;
      summary += `   Altera\xE7\xF5es: ${report.totalChanges}
`;
      summary += `   Acessos: ${report.totalAccess}
`;
      summary += `   Total: ${report.totalChanges + report.totalAccess}

`;
    });
    return summary;
  }
  static saveSummaryReport() {
    const summary = this.generateSummaryReport();
    const reportsDir = path4.join(process.cwd(), "logs", "reports");
    if (!fs4.existsSync(reportsDir)) {
      fs4.mkdirSync(reportsDir, { recursive: true });
    }
    const filename = "resumo-geral-logs.txt";
    const filepath = path4.join(reportsDir, filename);
    fs4.writeFileSync(filepath, summary, "utf8");
    return filepath;
  }
};
var logReporter_default = LogReporter;

// server/routes.ts
async function registerRoutes(app2) {
  console.log("\u{1F527} Registrando rotas da API...");
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadType = req.params.type || "general";
      if (req.path.includes("/testimonials/")) {
        uploadType = "testimonials";
      } else if (req.path.includes("/upload-image/support")) {
        uploadType = "support";
      } else if (req.path.includes("/secret/")) {
        uploadType = "secret";
      } else if (req.path.includes("/upload-image")) {
        uploadType = "temp";
      } else if (req.path.includes("/articles/")) {
        uploadType = "articles";
      } else if (req.path.includes("/hero/") || req.path.includes("/avatar")) {
        uploadType = "hero";
      } else if (req.path.includes("/gallery/")) {
        uploadType = "gallery";
      }
      const uploadPath = path8.join(process.cwd(), "uploads", uploadType);
      if (!existsSync2(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = path8.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + extension);
    }
  });
  const upload = multer({
    storage: storage_multer,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Apenas arquivos de imagem s\xE3o permitidos!"));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024
      // 10MB máximo
    }
  });
  const uploadMemory = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Apenas arquivos de imagem s\xE3o permitidos!"));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024
      // 5MB máximo
    }
  });
  const express3 = await import("express");
  app2.use("/uploads", express3.static(path8.join(process.cwd(), "uploads"), {
    maxAge: "7d",
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Vary", "Accept-Encoding");
      }
      if (filePath.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      }
    }
  }));
  app2.use("/icons", express3.static(path8.join(process.cwd(), "client", "public", "icons"), {
    maxAge: "7d",
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".ico")) {
        res.setHeader("Content-Type", "image/x-icon");
      } else if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      }
      res.setHeader("Cache-Control", "public, max-age=604800");
    }
  }));
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminUser(username);
      if (!admin || admin.password !== password) {
        logger_default.logAccess(req, "LOGIN", "FAILED", `Failed login attempt for username: ${username}`);
        return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
      }
      logger_default.logAccess(req, "LOGIN", "SUCCESS", `Admin user ${username} logged in successfully`);
      res.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      logger_default.logAccess(req, "LOGIN", "FAILED", `Login error: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/config", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/config", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/maintenance-check", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      const maintenanceConfig = configs.find((c) => c.key === "maintenance_mode");
      const generalConfig = configs.find((c) => c.key === "general_info");
      res.json({
        maintenance: {
          ...maintenanceConfig?.value || {},
          enabled: maintenanceConfig?.value?.isEnabled || false
        },
        general: generalConfig?.value || {}
      });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/config", async (req, res) => {
    try {
      const validatedData = insertSiteConfigSchema.parse(req.body);
      const existingConfigs = await storage.getAllSiteConfigs();
      const oldConfig = existingConfigs.find((c) => c.key === validatedData.key);
      const oldValue = oldConfig ? oldConfig.value : null;
      const config = await storage.setSiteConfig(validatedData);
      logger_default.logChange(req, "site_config", validatedData.key, oldValue, validatedData.value);
      res.json(config);
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to update config: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/config/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const existingConfigs = await storage.getAllSiteConfigs();
      const configToDelete = existingConfigs.find((c) => c.key === key);
      const oldValue = configToDelete ? configToDelete.value : null;
      await storage.deleteSiteConfig(key);
      logger_default.logDelete(req, "site_config", key, oldValue);
      res.json({ success: true });
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to delete config ${req.params.key}: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: "Erro ao remover configura\xE7\xE3o" });
    }
  });
  app2.get("/api/admin/logs/changes", async (req, res) => {
    try {
      logger_default.logAccess(req, "ACCESS", "SUCCESS", "Viewed admin changes log");
      const monthYear = req.query.month;
      const logs = logger_default.readLogs("changes", monthYear);
      res.json({ logs, months: logger_default.getAvailableMonths() });
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to view changes log: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: "Erro ao carregar logs" });
    }
  });
  app2.get("/api/admin/logs/access", async (req, res) => {
    try {
      logger_default.logAccess(req, "ACCESS", "SUCCESS", "Viewed admin access log");
      const monthYear = req.query.month;
      const logs = logger_default.readLogs("access", monthYear);
      res.json({ logs, months: logger_default.getAvailableMonths() });
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to view access log: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: "Erro ao carregar logs" });
    }
  });
  app2.post("/api/admin/upload/favicon", uploadMemory.single("image"), async (req, res) => {
    try {
      console.log("\u{1F4C1} Iniciando upload de favicon...");
      if (!req.file) {
        console.log("\u274C Nenhum arquivo enviado");
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      console.log("\u{1F4C4} Arquivo recebido:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer ? req.file.buffer.length : "N/A"
      });
      const iconsDir = path8.join(process.cwd(), "client", "public", "icons");
      await fs8.mkdir(iconsDir, { recursive: true });
      console.log("\u{1F4C1} Diret\xF3rio criado/verificado:", iconsDir);
      const inputBuffer = req.file.buffer;
      console.log("\u{1F504} Processando imagem com Sharp...");
      await sharp3(inputBuffer).resize(32, 32).png().toFile(path8.join(iconsDir, "favicon.ico"));
      await sharp3(inputBuffer).resize(16, 16).png().toFile(path8.join(iconsDir, "favicon-16x16.png"));
      await sharp3(inputBuffer).resize(32, 32).png().toFile(path8.join(iconsDir, "favicon-32x32.png"));
      await sharp3(inputBuffer).resize(180, 180).png().toFile(path8.join(iconsDir, "apple-touch-icon.png"));
      res.json({
        success: true,
        message: "Favicon atualizado com sucesso",
        files: ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"]
      });
    } catch (error) {
      console.error("Erro no upload do favicon:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/admin/upload/favicon", async (req, res) => {
    try {
      const fs10 = __require("fs").promises;
      const path12 = __require("path");
      const iconsDir = path12.join(process.cwd(), "client", "public", "icons");
      const iconFiles = ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"];
      for (const file of iconFiles) {
        try {
          await fs10.unlink(path12.join(iconsDir, file));
        } catch (error) {
        }
      }
      const defaultFaviconData = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A";
      const sharp4 = __require("sharp");
      const defaultIcon = Buffer.from([
        137,
        80,
        78,
        71,
        13,
        10,
        26,
        10,
        0,
        0,
        0,
        13,
        73,
        72,
        68,
        82,
        0,
        0,
        0,
        32,
        0,
        0,
        0,
        32,
        8,
        6,
        0,
        0,
        0,
        115,
        122,
        122,
        244,
        0,
        0,
        0,
        25,
        116,
        69,
        88,
        116,
        83,
        111,
        102,
        116,
        119,
        97,
        114,
        101,
        0,
        65,
        100,
        111,
        98,
        101,
        32,
        73,
        109,
        97,
        103,
        101,
        82,
        101,
        97,
        100,
        121,
        113,
        201,
        101,
        60,
        0,
        0,
        3,
        141,
        73,
        68,
        65,
        84,
        120,
        218
      ]);
      await sharp4({
        create: {
          width: 32,
          height: 32,
          channels: 4,
          background: { r: 236, g: 72, b: 153, alpha: 1 }
        }
      }).png().toFile(path12.join(iconsDir, "favicon.ico"));
      res.json({ success: true, message: "Favicon restaurado para o padr\xE3o" });
    } catch (error) {
      console.error("Erro ao restaurar favicon:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/admin/site-icon/reset", async (req, res) => {
    try {
      console.log("\u{1F5D1}\uFE0F ENDPOINT /api/admin/site-icon/reset chamado");
      let removedFiles = 0;
      let totalAttempts = 0;
      const iconsDir = path8.join(process.cwd(), "client", "public", "icons");
      const iconFiles = ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"];
      console.log("\u{1F4C1} Verificando diret\xF3rio de \xEDcones:", iconsDir);
      try {
        await fs8.mkdir(iconsDir, { recursive: true });
        console.log("\u2705 Diret\xF3rio de \xEDcones garantido");
      } catch (error) {
        console.log("\u26A0\uFE0F Aviso ao criar diret\xF3rio:", error instanceof Error ? error.message : String(error));
      }
      for (const file of iconFiles) {
        totalAttempts++;
        try {
          const filePath = path8.join(iconsDir, file);
          await fs8.unlink(filePath);
          removedFiles++;
          console.log(`\u{1F5D1}\uFE0F Arquivo removido: ${file}`);
        } catch (error) {
          console.log(`\u2139\uFE0F Arquivo n\xE3o encontrado ou n\xE3o remov\xEDvel: ${file}`);
        }
      }
      const uploadsDir = path8.join(process.cwd(), "uploads", "site-icon");
      console.log("\u{1F4C1} Verificando diret\xF3rio de uploads:", uploadsDir);
      try {
        await fs8.mkdir(uploadsDir, { recursive: true });
        const files = await fs8.readdir(uploadsDir);
        for (const file of files) {
          totalAttempts++;
          try {
            const filePath = path8.join(uploadsDir, file);
            await fs8.unlink(filePath);
            removedFiles++;
            console.log(`\u{1F5D1}\uFE0F Upload removido: ${file}`);
          } catch (error) {
            console.log(`\u26A0\uFE0F Erro ao remover upload ${file}:`, error instanceof Error ? error.message : String(error));
          }
        }
      } catch (error) {
        console.log("\u2139\uFE0F Diret\xF3rio de uploads n\xE3o encontrado ou vazio:", error instanceof Error ? error.message : String(error));
      }
      console.log(`\u2705 Reset conclu\xEDdo: ${removedFiles} de ${totalAttempts} arquivos processados`);
      res.json({
        success: true,
        message: "Reset do \xEDcone realizado com sucesso",
        details: {
          removedFiles,
          totalAttempts
        }
      });
    } catch (error) {
      console.error("\u274C Erro CR\xCDTICO ao resetar \xEDcone do site:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: "Erro no reset do \xEDcone",
        details: errorMessage,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.post("/api/admin/generate/preset-favicon", async (req, res) => {
    console.log("\u{1F3AF} ENDPOINT /api/admin/generate/preset-favicon chamado");
    console.log("\u{1F4E5} Request body:", req.body);
    try {
      const { iconId } = req.body;
      console.log("\u{1F3A8} Gerando favicon para \xEDcone predefinido:", iconId);
      if (!iconId) {
        console.log("\u274C iconId n\xE3o fornecido");
        return res.status(400).json({ error: "iconId \xE9 obrigat\xF3rio" });
      }
      const { getIconAsBase64: getIconAsBase642 } = await Promise.resolve().then(() => (init_presetIconGenerator(), presetIconGenerator_exports));
      console.log("\u{1F3A8} Gerando \xEDcone completo para armazenamento...");
      const iconData = await getIconAsBase642(iconId);
      await storage.setSiteConfig({
        key: "preset_favicon_data",
        value: iconData
      });
      console.log("\u2705 Favicon gerado e salvo no banco de dados");
      try {
        const presetIconsDir = path8.join(process.cwd(), "client", "public", "icons", "presets");
        const publicIconsDir = path8.join(process.cwd(), "client", "public", "icons");
        const iconFiles = [
          { src: `${iconId}.ico`, dest: "favicon.ico" },
          { src: `${iconId}-16x16.png`, dest: "favicon-16x16.png" },
          { src: `${iconId}-32x32.png`, dest: "favicon-32x32.png" },
          { src: `${iconId}-180x180.png`, dest: "apple-touch-icon.png" }
        ];
        for (const { src, dest } of iconFiles) {
          try {
            const srcPath = path8.join(presetIconsDir, src);
            const destPath = path8.join(publicIconsDir, dest);
            await fs8.copyFile(srcPath, destPath);
          } catch (copyError) {
            console.log(`\u26A0\uFE0F N\xE3o foi poss\xEDvel copiar ${src}: arquivo ser\xE1 servido do banco`);
          }
        }
        console.log("\u2705 \xCDcones copiados para pasta p\xFAblica (quando poss\xEDvel)");
      } catch (fsError) {
        console.log("\u26A0\uFE0F Filesystem somente leitura - \xEDcones ser\xE3o servidos do banco");
      }
      console.log("\u2705 Sistema de favicon configurado com sucesso");
      res.json({
        success: true,
        message: "Favicon gerado com sucesso",
        iconId,
        color: iconData.color
      });
    } catch (error) {
      console.error("\u274C ERRO DETALHADO:", error);
      res.status(500).json({
        error: "Falha ao gerar favicon do \xEDcone predefinido",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/favicon/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      console.log("\u{1F504} Solicita\xE7\xE3o de favicon do banco:", filename);
      const faviconConfig = await storage.getSiteConfig("preset_favicon_data");
      if (!faviconConfig?.value) {
        console.log("\u274C Nenhum favicon encontrado no banco");
        return res.status(404).json({ error: "Favicon n\xE3o encontrado" });
      }
      const iconData = faviconConfig.value;
      let base64Data;
      let contentType;
      switch (filename) {
        case "favicon.ico":
          base64Data = iconData.favicon;
          contentType = "image/x-icon";
          break;
        case "favicon-16x16.png":
          base64Data = iconData.favicon16;
          contentType = "image/png";
          break;
        case "favicon-32x32.png":
          base64Data = iconData.favicon32;
          contentType = "image/png";
          break;
        case "apple-touch-icon.png":
          base64Data = iconData.appleTouchIcon;
          contentType = "image/png";
          break;
        default:
          return res.status(404).json({ error: "Arquivo n\xE3o encontrado" });
      }
      if (!base64Data) {
        return res.status(404).json({ error: "Dados do favicon n\xE3o encontrados" });
      }
      const buffer = Buffer.from(base64Data, "base64");
      res.set({
        "Content-Type": contentType,
        "Content-Length": buffer.length,
        "Cache-Control": "public, max-age=86400",
        // 24 horas
        "ETag": `"${iconData.iconId}-${iconData.color}"`
      });
      console.log("\u2705 Favicon servido do banco:", filename);
      res.send(buffer);
    } catch (error) {
      console.error("\u274C Erro ao servir favicon do banco:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/upload/site-icon", uploadMemory.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Tipo de arquivo n\xE3o suportado" });
      }
      const iconBuffer = await sharp3(req.file.buffer).resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
      const iconPath = `uploads/site-icon/favicon.png`;
      const fullIconPath = path8.join(process.cwd(), iconPath);
      await fs8.mkdir(path8.dirname(fullIconPath), { recursive: true });
      await fs8.writeFile(fullIconPath, iconBuffer);
      res.json({
        path: `/${iconPath}`,
        message: "\xCDcone do site enviado com sucesso"
      });
    } catch (error) {
      console.error("Erro no upload do \xEDcone:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/admin/upload/site-icon", async (req, res) => {
    try {
      const iconPath = path8.join(process.cwd(), "uploads/site-icon/favicon.png");
      try {
        await fs8.access(iconPath);
        await fs8.unlink(iconPath);
      } catch (error) {
      }
      res.json({ message: "\xCDcone removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover \xEDcone:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/upload/:type", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      const uploadType = req.params.type;
      console.log(`\u{1F4F8} Upload de ${uploadType} iniciado:`, req.file.filename);
      const originalPath = req.file.path;
      console.log(`\u{1F4C1} Arquivo salvo em:`, originalPath);
      const optimizedPath = await optimizeImage(originalPath, uploadType);
      console.log(`\u{1F527} Imagem otimizada salva em:`, optimizedPath);
      await cleanupOriginal(originalPath);
      console.log(`\u{1F5D1}\uFE0F Arquivo original removido:`, originalPath);
      const relativePath = getOptimizedPath(req.file.filename, uploadType);
      console.log(`\u2705 Upload conclu\xEDdo. Caminho relativo:`, relativePath);
      if (uploadType === "hero") {
        await storage.setSiteConfig({ key: "hero_image", value: { path: relativePath } });
      }
      res.json({
        success: true,
        imagePath: relativePath,
        filename: req.file.filename,
        message: "Imagem carregada e otimizada para WebP com sucesso!"
      });
    } catch (error) {
      console.error("\u274C Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });
  app2.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials2 = await storage.getActiveTestimonials();
      console.log("Depoimentos encontrados:", testimonials2);
      res.json(testimonials2);
    } catch (error) {
      console.error("Erro ao buscar testimonials:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/testimonials", async (req, res) => {
    try {
      const testimonials2 = await storage.getAllTestimonials();
      res.json(testimonials2);
    } catch (error) {
      console.error("Erro ao buscar testimonials (admin):", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/testimonials", async (req, res) => {
    try {
      console.log("\u{1F4DD} POST /api/admin/testimonials - Dados recebidos:", req.body);
      const testimonialData = insertTestimonialSchema.parse(req.body);
      console.log("\u2705 Valida\xE7\xE3o do schema ok");
      const testimonial = await storage.createTestimonial(testimonialData);
      console.log("\u2705 Depoimento criado:", testimonial.id);
      res.json(testimonial);
    } catch (error) {
      console.error("\u274C Erro ao criar depoimento:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Erro desconhecido" });
      }
    }
  });
  app2.put("/api/admin/testimonials/test-reorder", async (req, res) => {
    console.log("\u{1F9EA} TEST REORDER ENDPOINT HIT!");
    console.log("\u{1F9EA} Body:", req.body);
    console.log("\u{1F9EA} Path:", req.path);
    res.json({ message: "Test reorder endpoint working", body: req.body });
  });
  app2.put("/api/admin/testimonials/reorder", async (req, res) => {
    try {
      console.log("\u{1F504} Testimonials REORDER ENDPOINT HIT!");
      console.log("\u{1F504} Testimonials REORDER - Raw body:", req.body);
      console.log("\u{1F504} Testimonials REORDER - Body type:", typeof req.body);
      let reorderData;
      if (Array.isArray(req.body)) {
        console.log("\u2705 Testimonials REORDER - Dados s\xE3o array direto");
        reorderData = req.body;
      } else if (req.body && Array.isArray(req.body.items)) {
        console.log("\u2705 Testimonials REORDER - Dados est\xE3o em req.body.items");
        reorderData = req.body.items;
      } else if (req.body && req.body.value && Array.isArray(req.body.value)) {
        console.log("\u2705 Testimonials REORDER - Dados est\xE3o em req.body.value");
        reorderData = req.body.value;
      } else {
        console.error("\u274C Testimonials REORDER - Formato inv\xE1lido:", req.body);
        return res.status(400).json({
          error: "Dados de reordena\xE7\xE3o devem ser um array",
          received: typeof req.body,
          body: req.body
        });
      }
      if (!Array.isArray(reorderData) || reorderData.length === 0) {
        console.error("\u274C Testimonials REORDER - Array vazio ou inv\xE1lido:", reorderData);
        return res.status(400).json({ error: "Array de reordena\xE7\xE3o vazio ou inv\xE1lido" });
      }
      console.log("\u{1F504} Testimonials REORDER - Processando array v\xE1lido:", reorderData);
      await storage.reorderTestimonials(reorderData);
      const updatedTestimonials = await storage.getAllTestimonials();
      console.log("\u2705 Testimonials REORDER conclu\xEDda:", updatedTestimonials.length, "itens");
      res.json(updatedTestimonials);
    } catch (error) {
      console.error("\u274C Erro ao reordenar depoimentos:", error);
      res.status(500).json({ error: "Erro ao reordenar depoimentos" });
    }
  });
  app2.put("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testimonialData = req.body;
      console.log("Atualizando depoimento:", { id, testimonialData });
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inv\xE1lido" });
      }
      const testimonial = await storage.updateTestimonial(id, testimonialData);
      console.log("Depoimento atualizado:", testimonial);
      res.json(testimonial);
    } catch (error) {
      console.error("Erro ao atualizar depoimento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestimonial(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/faq", async (req, res) => {
    try {
      const faqItems2 = await storage.getActiveFaqItems();
      res.json(faqItems2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/faq", async (req, res) => {
    try {
      const faqItems2 = await storage.getActiveFaqItems();
      res.json(faqItems2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/faq", async (req, res) => {
    try {
      const faqItems2 = await storage.getAllFaqItems();
      res.json(faqItems2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/faq/reorder", async (req, res) => {
    try {
      console.log("\u{1F504} Recebendo dados de reordena\xE7\xE3o FAQ:", req.body);
      const reorderData = req.body;
      await storage.reorderFaqItems(reorderData);
      const updatedFaqItems = await storage.getAllFaqItems();
      console.log("\u2705 Reordena\xE7\xE3o FAQ conclu\xEDda:", updatedFaqItems.length, "itens");
      res.json(updatedFaqItems);
    } catch (error) {
      console.error("\u274C Erro ao reordenar FAQ:", error);
      res.status(500).json({ error: "Erro ao reordenar FAQ" });
    }
  });
  app2.post("/api/admin/faq", async (req, res) => {
    try {
      const faqData = insertFaqItemSchema.parse(req.body);
      const faqItem = await storage.createFaqItem(faqData);
      logger_default.logCreate(req, "faq", faqItem.id.toString(), { question: faqData.question, answer: faqData.answer });
      res.json(faqItem);
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to create FAQ: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/faq/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faqData = req.body;
      const allFaqs = await storage.getAllFaqItems();
      const oldFaq = allFaqs.find((f) => f.id === id);
      const faqItem = await storage.updateFaqItem(id, faqData);
      logger_default.logChange(req, "faq", id.toString(), oldFaq, faqData);
      res.json(faqItem);
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to update FAQ ${req.params.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/faq/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allFaqs = await storage.getAllFaqItems();
      const faqToDelete = allFaqs.find((f) => f.id === id);
      await storage.deleteFaqItem(id);
      logger_default.logDelete(req, "faq", id.toString(), faqToDelete);
      res.json({ success: true });
    } catch (error) {
      logger_default.logAccess(req, "ACCESS", "FAILED", `Failed to delete FAQ ${req.params.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      const services2 = await storage.getActiveServices();
      res.json(services2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/services", async (req, res) => {
    try {
      const services2 = await storage.getAllServices();
      res.json(services2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/services/reorder", async (req, res) => {
    try {
      console.log("\u{1F504} Recebendo dados de reordena\xE7\xE3o Services:", req.body);
      const reorderData = req.body;
      await storage.reorderServices(reorderData);
      const updatedServices = await storage.getAllServices();
      console.log("\u2705 Reordena\xE7\xE3o Services conclu\xEDda:", updatedServices.length, "itens");
      res.json(updatedServices);
    } catch (error) {
      console.error("\u274C Erro ao reordenar servi\xE7os:", error);
      res.status(500).json({ error: "Erro ao reordenar servi\xE7os" });
    }
  });
  app2.post("/api/admin/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = req.body;
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/photo-carousel", async (req, res) => {
    try {
      const photos = await storage.getActivePhotoCarousel();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/photo-carousel", async (req, res) => {
    try {
      const photos = await storage.getAllPhotoCarousel();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/photo-carousel/reorder", async (req, res) => {
    try {
      console.log("\u{1F504} Recebendo dados de reordena\xE7\xE3o Photo Carousel:", req.body);
      const reorderData = req.body;
      await storage.reorderPhotoCarousel(reorderData);
      const updatedPhotoCarousel = await storage.getAllPhotoCarousel();
      console.log("\u2705 Reordena\xE7\xE3o Photo Carousel conclu\xEDda:", updatedPhotoCarousel.length, "itens");
      res.json(updatedPhotoCarousel);
    } catch (error) {
      console.error("\u274C Erro ao reordenar fotos:", error);
      res.status(500).json({ error: "Erro ao reordenar fotos" });
    }
  });
  app2.post("/api/admin/photo-carousel", async (req, res) => {
    try {
      const photoData = insertPhotoCarouselSchema.parse(req.body);
      const photo = await storage.createPhotoCarousel(photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/photo-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photoData = req.body;
      const photo = await storage.updatePhotoCarousel(id, photoData);
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/photo-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhotoCarousel(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/specialties", async (req, res) => {
    try {
      const specialties2 = await storage.getActiveSpecialties();
      res.json(specialties2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/specialties", async (req, res) => {
    try {
      const specialties2 = await storage.getAllSpecialties();
      res.json(specialties2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/specialties/reorder", async (req, res) => {
    try {
      console.log("\u{1F504} Recebendo dados de reordena\xE7\xE3o Specialties:", req.body);
      const reorderData = req.body;
      await storage.reorderSpecialties(reorderData);
      const updatedSpecialties = await storage.getAllSpecialties();
      console.log("\u2705 Reordena\xE7\xE3o Specialties conclu\xEDda:", updatedSpecialties.length, "itens");
      res.json(updatedSpecialties);
    } catch (error) {
      console.error("\u274C Erro ao reordenar especialidades:", error);
      res.status(500).json({ error: "Erro ao reordenar especialidades" });
    }
  });
  app2.post("/api/admin/specialties", async (req, res) => {
    try {
      const specialtyData = insertSpecialtySchema.parse(req.body);
      const specialty = await storage.createSpecialty(specialtyData);
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const specialtyData = req.body;
      const specialty = await storage.updateSpecialty(id, specialtyData);
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSpecialty(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/contact-settings/debug", async (req, res) => {
    try {
      console.log("\u{1F527} ROTA DIAGN\xD3STICO ATIVADA");
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql2 } = await import("drizzle-orm");
      const rawQuery = await db2.execute(sql2`
        SELECT id, contact_card, info_card, 
               contact_card->>'title' as contact_title,
               info_card->>'title' as info_title
        FROM contact_settings WHERE id = 1
      `);
      console.log("\u{1F50D} Dados diretos do PostgreSQL:", JSON.stringify(rawQuery.rows[0], null, 2));
      res.json({
        message: "Diagn\xF3stico completo",
        rawData: rawQuery.rows[0],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("\u274C Erro no diagn\xF3stico:", error);
      res.status(500).json({ error: "Erro no diagn\xF3stico", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/contact-settings", async (req, res) => {
    try {
      const contactSettings2 = await storage.getContactSettings();
      res.json(contactSettings2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/contact-settings", async (req, res) => {
    try {
      console.log("\u{1F504} GET /api/admin/contact-settings - SOLU\xC7\xC3O FINAL ATIVADA");
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql2 } = await import("drizzle-orm");
      console.log("\u{1F527} Executando query SQL direta...");
      const result = await db2.execute(sql2`
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
      console.log("\u{1F50D} Query SQL - Resultado bruto:", JSON.stringify(result.rows[0], null, 2));
      if (!result.rows || result.rows.length === 0) {
        console.log("\u26A0\uFE0F Nenhum resultado encontrado na query SQL");
        return res.status(404).json({ error: "Contact settings n\xE3o encontrados" });
      }
      const rawData = result.rows[0];
      const responseData = {
        id: rawData.id,
        contact_items: rawData.contact_items || [],
        schedule_info: rawData.schedule_info || {},
        location_info: rawData.location_info || {},
        contact_card: rawData.contact_card || {
          title: "Entre em Contato",
          description: "Escolha a forma mais conveniente para voc\xEA",
          icon: "Mail",
          iconColor: "#6366f1",
          backgroundColor: "#ffffff"
        },
        info_card: rawData.info_card || {
          title: "Informa\xE7\xF5es de Atendimento",
          description: "Hor\xE1rios e localiza\xE7\xE3o",
          icon: "Info",
          iconColor: "#059669",
          backgroundColor: "#ffffff"
        },
        updatedAt: rawData.updated_at
      };
      console.log("\u{1F4E4} SOLU\xC7\xC3O FINAL - Dados a retornar:", JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } catch (error) {
      console.error("\u274C Erro cr\xEDtico na SOLU\xC7\xC3O FINAL:", error);
      res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.put("/api/admin/contact-settings", async (req, res) => {
    try {
      console.log("\u{1F504} PUT /api/admin/contact-settings - Iniciando atualiza\xE7\xE3o");
      console.log("\u{1F4E5} Request body:", JSON.stringify(req.body, null, 2));
      const contactSettings2 = await storage.updateContactSettings(req.body);
      console.log("\u2705 Configura\xE7\xF5es de contato atualizadas com sucesso");
      console.log("\u{1F4E4} Response data:", JSON.stringify(contactSettings2, null, 2));
      res.json(contactSettings2);
    } catch (error) {
      console.error("\u274C Erro ao atualizar contact settings:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/footer-settings", async (req, res) => {
    try {
      const footerSettings2 = await storage.getFooterSettings();
      res.json(footerSettings2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/footer-settings", async (req, res) => {
    try {
      const footerSettings2 = await storage.getFooterSettings();
      res.json(footerSettings2);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/footer-settings", async (req, res) => {
    try {
      console.log("\u{1F504} PUT /api/admin/footer-settings - Iniciando atualiza\xE7\xE3o");
      console.log("\u{1F4E5} Request body:", JSON.stringify(req.body, null, 2));
      const footerSettings2 = await storage.updateFooterSettings(req.body);
      console.log("\u2705 Configura\xE7\xF5es atualizadas com sucesso");
      console.log("\u{1F4E4} Response data:", JSON.stringify(footerSettings2, null, 2));
      res.json(footerSettings2);
    } catch (error) {
      console.error("\u274C Erro ao atualizar footer settings:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/admin/reset-footer-badges", async (req, res) => {
    try {
      await storage.resetFooterSettings();
      const newSettings = await storage.getFooterSettings();
      res.json(newSettings);
    } catch (error) {
      console.error("Error resetting footer badges:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/support-messages", async (req, res) => {
    try {
      const messages = await storage.getAllSupportMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/test-support-message", async (req, res) => {
    try {
      console.log("\u{1F9EA} TEST ENDPOINT CHAMADO - Dados recebidos:", req.body);
      console.log("\u{1F9EA} TEST REQUEST PATH:", req.path);
      console.log("\u{1F9EA} TEST REQUEST URL:", req.url);
      try {
        const testResult = insertSupportMessageSchema.parse(req.body);
        console.log("\u2705 TEST - Schema v\xE1lido:", testResult);
        res.json({ success: true, validData: testResult });
      } catch (schemaError) {
        console.error("\u274C TEST - Erro de schema:", schemaError);
        res.status(400).json({
          success: false,
          error: "Schema validation failed",
          details: schemaError.errors || schemaError.message,
          received: req.body
        });
      }
    } catch (error) {
      console.error("\u274C TEST - Erro geral:", error);
      res.status(500).json({ success: false, error: "Internal error" });
    }
  });
  console.log("\u2705 Rota de teste registrada: /api/admin/test-support-message");
  app2.post("/api/admin/support-messages-simple", async (req, res) => {
    try {
      console.log("\u{1F4E5} SIMPLE - Dados recebidos:", req.body);
      const { name, email, message, type, attachments } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Campos obrigat\xF3rios em falta" });
      }
      console.log("\u{1F4CE} Anexos recebidos:", attachments);
      const simpleData = {
        name,
        email,
        message,
        type: type || "contact",
        attachments: Array.isArray(attachments) ? attachments : [],
        isRead: false
      };
      console.log("\u2705 SIMPLE - Dados preparados:", simpleData);
      let emailSent = false;
      try {
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
        const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
        const serverUrl = `${protocol}://${host}`;
        const emailData = {
          ...simpleData,
          subject: `Contato ${type === "support" ? "Suporte" : type === "feedback" ? "Feedback" : type === "bug" ? "Bug Report" : type === "feature" ? "Feature Request" : "Geral"}`,
          serverUrl
        };
        console.log("\u{1F4E7} === DEBUG EMAIL DATA ===");
        console.log("\u{1F4E7} Dados completos do email:", {
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
          console.log("\u{1F4CE} === DETALHES DOS ANEXOS ===");
          emailData.attachments.forEach((att, index) => {
            console.log(`\u{1F4CE} Anexo ${index + 1}:`, {
              url: att,
              tipo: typeof att,
              valido: !!att && typeof att === "string"
            });
          });
        }
        const emailResult = await sendSupportEmail(emailData);
        emailSent = emailResult.success;
        if (emailResult.success) {
          console.log("\u2705 Email enviado com sucesso via Mailgun");
        } else {
          console.warn("\u26A0\uFE0F Falha no envio do email:", emailResult.error);
        }
      } catch (emailError) {
        console.error("\u274C Erro ao enviar email:", emailError);
      }
      res.json({ success: true, data: simpleData, emailSent });
    } catch (error) {
      console.error("\u274C SIMPLE - Erro:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });
  app2.post("/api/admin/support-messages", async (req, res) => {
    try {
      console.log("\u{1F4E5} Dados recebidos no backend:", req.body);
      console.log("\u{1F50D} Validando com schema insertSupportMessageSchema...");
      const messageData = insertSupportMessageSchema.parse(req.body);
      console.log("\u2705 Dados v\xE1lidos ap\xF3s parse:", messageData);
      const finalData = {
        ...messageData,
        name: messageData.name || "Sistema do Site",
        email: messageData.email || "noreply@sistema.local"
      };
      const message = await storage.createSupportMessage(finalData);
      const getSubjectByType = (type) => {
        switch (type) {
          case "support":
            return "Solicita\xE7\xE3o de Suporte - Site";
          case "contact":
            return "Mensagem de Contato - Site";
          case "feedback":
            return "Sugest\xE3o/Feedback - Site";
          case "bug":
            return "Relat\xF3rio de Problema - Site";
          case "feature":
            return "Solicita\xE7\xE3o de Funcionalidade - Site";
          default:
            return "Mensagem do Site";
        }
      };
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
      const serverUrl = `${protocol}://${host}`;
      const emailResult = await sendSupportEmail({
        name: finalData.name || "An\xF4nimo",
        email: finalData.email || "nao-fornecido@exemplo.com",
        subject: getSubjectByType(finalData.type || "contact"),
        message: finalData.message || "Mensagem vazia",
        type: finalData.type || "contact",
        attachments: finalData.attachments || [],
        serverUrl
      });
      if (!emailResult.success) {
        console.error("Falha ao enviar email:", emailResult.error);
      }
      res.json({
        ...message,
        emailSent: emailResult.success,
        emailError: emailResult.error
      });
    } catch (error) {
      console.error("\u274C Erro detalhado ao criar mensagem de suporte:", error);
      if (error instanceof z2.ZodError) {
        console.error("\u{1F50D} Erros de valida\xE7\xE3o Zod:", error.errors);
        res.status(400).json({
          error: "Dados inv\xE1lidos",
          details: error.errors,
          received: req.body
        });
      } else {
        res.status(400).json({ error: "Dados inv\xE1lidos" });
      }
    }
  });
  app2.put("/api/admin/support-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const message = await storage.updateSupportMessage(id, updateData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/support-messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupportMessage(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/test-email-connection", async (req, res) => {
    try {
      console.log("\u{1F50D} Testing Mailgun connection via API...");
      const result = await testMailgunConnection();
      console.log("\u{1F4CA} Test result:", result);
      res.json(result);
    } catch (error) {
      console.error("\u274C Error in test email connection endpoint:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/admin/send-test-email", async (req, res) => {
    try {
      console.log("\u{1F4E7} Sending test email via API...");
      console.log("Request body:", req.body);
      const { name, email, message, type } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: name, email, message"
        });
      }
      const emailResult = await sendSupportEmail({
        name,
        email,
        subject: `Teste de Email - ${type || "test"}`,
        message,
        type: type || "test"
      });
      console.log("\u{1F4CA} Email send result:", emailResult);
      res.json(emailResult);
    } catch (error) {
      console.error("\u274C Error in send test email endpoint:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/custom-codes", async (req, res) => {
    try {
      const codes = await storage.getAllCustomCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/custom-codes/:location", async (req, res) => {
    try {
      const location = req.params.location;
      const codes = await storage.getCustomCodesByLocation(location);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/custom-codes", async (req, res) => {
    try {
      const codeData = insertCustomCodeSchema.parse(req.body);
      const code = await storage.createCustomCode(codeData);
      res.json(code);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/custom-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCustomCodeSchema.partial().parse(req.body);
      const code = await storage.updateCustomCode(id, updateData);
      res.json(code);
    } catch (error) {
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/custom-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomCode(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/custom-codes/reorder", async (req, res) => {
    try {
      const reorderData = req.body;
      await storage.reorderCustomCodes(reorderData);
      const updatedCodes = await storage.getAllCustomCodes();
      res.json(updatedCodes);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/secret/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminUser(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
      }
      res.json({ success: true, authenticated: true });
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/secret/send", upload.array("attachments"), async (req, res) => {
    try {
      console.log("\u{1F92B} Secret - Recebendo mensagem...");
      console.log("\u{1F92B} Secret - Body:", req.body);
      console.log("\u{1F92B} Secret - Files:", req.files);
      const { message } = req.body;
      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Mensagem \xE9 obrigat\xF3ria" });
      }
      let attachments = [];
      const attachmentBackups = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          try {
            console.log("\u{1F4CE} Secret - Processando anexo:", file.filename);
            const originalPath = file.path;
            const optimizedPath = await optimizeImage(originalPath, "secret");
            await cleanupOriginal(originalPath);
            const imageUrl = `/uploads/secret/${path8.basename(optimizedPath)}`;
            try {
              const { readFileSync } = await import("fs");
              const imageBuffer = readFileSync(optimizedPath);
              const base64Data = imageBuffer.toString("base64");
              const mimeType = optimizedPath.endsWith(".webp") ? "image/webp" : "image/jpeg";
              const base64WithMime = `data:${mimeType};base64,${base64Data}`;
              attachmentBackups.push({
                url: imageUrl,
                base64: base64WithMime,
                filename: path8.basename(optimizedPath)
              });
              console.log("\u{1F4BE} Secret - Backup base64 criado para:", path8.basename(optimizedPath));
            } catch (backupError) {
              console.warn("\u26A0\uFE0F Secret - Erro ao criar backup base64:", backupError);
            }
            attachments.push(imageUrl);
            console.log("\u2705 Secret - Anexo processado:", imageUrl);
          } catch (error) {
            console.error("\u274C Secret - Erro ao processar anexo:", error);
          }
        }
      }
      const senderIp = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.get("User-Agent") || "unknown";
      const chatMessageData = {
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : void 0,
        attachmentBackups: attachmentBackups.length > 0 ? JSON.stringify(attachmentBackups) : void 0,
        senderIp,
        userAgent
      };
      const chatMessage = await storage.createChatMessage(chatMessageData);
      const CHAT_RECIPIENT_EMAIL = process.env.CHAT_RECIPIENT_EMAIL;
      if (!CHAT_RECIPIENT_EMAIL) {
        console.error("\u274C CHAT_RECIPIENT_EMAIL n\xE3o configurado");
        return res.status(500).json({ error: "Configura\xE7\xE3o de email n\xE3o encontrada" });
      }
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
      const serverUrl = `${protocol}://${host}`;
      console.log("\u{1F92B} === SECRET EMAIL DATA DEBUG ===");
      console.log("\u{1F92B} Mensagem:", message);
      console.log("\u{1F92B} Anexos processados:", attachments);
      console.log("\u{1F92B} Server URL:", serverUrl);
      console.log("\u{1F92B} Recipient:", CHAT_RECIPIENT_EMAIL);
      const emailData = {
        name: "Secret Chat",
        email: "secret@sistema.local",
        subject: "Mensagem do Secret Chat",
        message: message.trim(),
        type: "secret-message",
        attachments,
        // URLs diretas: ["/uploads/secret/image.webp"]
        recipientOverride: CHAT_RECIPIENT_EMAIL,
        serverUrl
      };
      console.log("\u{1F4E7} Secret - Debug emailData completo:", {
        ...emailData,
        attachments: emailData.attachments,
        attachmentsLength: emailData.attachments?.length,
        attachmentsType: typeof emailData.attachments
      });
      const emailResult = await sendSupportEmail(emailData);
      console.log("\u{1F4E7} Secret - Resultado do email:", emailResult);
      res.json({
        success: true,
        id: chatMessage.id,
        message: "Processando transmiss\xE3o para o universo...",
        emailSent: emailResult.success
      });
    } catch (error) {
      console.error("\u274C Secret - Erro ao processar mensagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/icons/favicon.ico", async (req, res) => {
    try {
      const { existsSync: existsSync3 } = await import("fs");
      const filePath = path8.join(process.cwd(), "client", "public", "icons", "favicon.ico");
      if (existsSync3(filePath)) {
        return res.sendFile(filePath);
      }
      const iconConfig = await storage.getSiteConfig("preset_favicon_data");
      if (iconConfig?.value && iconConfig.value.favicon) {
        const iconBuffer = Buffer.from(iconConfig.value.favicon, "base64");
        res.setHeader("Content-Type", "image/x-icon");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(iconBuffer);
      }
      res.status(404).send("Favicon not found");
    } catch (error) {
      console.error("Erro ao servir favicon:", error);
      res.status(500).send("Erro interno");
    }
  });
  app2.get("/icons/favicon-16x16.png", async (req, res) => {
    try {
      const { existsSync: existsSync3 } = await import("fs");
      const filePath = path8.join(process.cwd(), "client", "public", "icons", "favicon-16x16.png");
      if (existsSync3(filePath)) {
        return res.sendFile(filePath);
      }
      const iconConfig = await storage.getSiteConfig("preset_favicon_data");
      if (iconConfig?.value && iconConfig.value.favicon16) {
        const iconBuffer = Buffer.from(iconConfig.value.favicon16, "base64");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(iconBuffer);
      }
      res.status(404).send("Icon not found");
    } catch (error) {
      console.error("Erro ao servir favicon-16x16:", error);
      res.status(500).send("Erro interno");
    }
  });
  app2.get("/icons/favicon-32x32.png", async (req, res) => {
    try {
      const { existsSync: existsSync3 } = await import("fs");
      const filePath = path8.join(process.cwd(), "client", "public", "icons", "favicon-32x32.png");
      if (existsSync3(filePath)) {
        return res.sendFile(filePath);
      }
      const iconConfig = await storage.getSiteConfig("preset_favicon_data");
      if (iconConfig?.value && iconConfig.value.favicon32) {
        const iconBuffer = Buffer.from(iconConfig.value.favicon32, "base64");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(iconBuffer);
      }
      res.status(404).send("Icon not found");
    } catch (error) {
      console.error("Erro ao servir favicon-32x32:", error);
      res.status(500).send("Erro interno");
    }
  });
  app2.get("/icons/apple-touch-icon.png", async (req, res) => {
    try {
      const { existsSync: existsSync3 } = await import("fs");
      const filePath = path8.join(process.cwd(), "client", "public", "icons", "apple-touch-icon.png");
      if (existsSync3(filePath)) {
        return res.sendFile(filePath);
      }
      const iconConfig = await storage.getSiteConfig("preset_favicon_data");
      if (iconConfig?.value && iconConfig.value.appleTouchIcon) {
        const iconBuffer = Buffer.from(iconConfig.value.appleTouchIcon, "base64");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(iconBuffer);
      }
      res.status(404).send("Icon not found");
    } catch (error) {
      console.error("Erro ao servir apple-touch-icon:", error);
      res.status(500).send("Erro interno");
    }
  });
  app2.get("/api/secret/image/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      console.log("\u{1F5BC}\uFE0F Secret - Solicita\xE7\xE3o de imagem de backup:", filename);
      const { existsSync: existsSync3 } = await import("fs");
      const filePath = path8.join(process.cwd(), "uploads", "secret", filename);
      if (existsSync3(filePath)) {
        console.log("\u2705 Secret - Arquivo encontrado no filesystem");
        return res.sendFile(filePath);
      }
      console.log("\u{1F50D} Secret - Buscando backup no banco...");
      const messages = await storage.getAllChatMessages();
      for (const message of messages) {
        if (message.attachmentBackups) {
          try {
            const backups = JSON.parse(message.attachmentBackups);
            const backup = backups.find((b) => b.filename === filename);
            if (backup && backup.base64) {
              console.log("\u267B\uFE0F Secret - Servindo imagem do backup base64");
              const matches = backup.base64.match(/^data:([^;]+);base64,(.+)$/);
              if (matches) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, "base64");
                res.setHeader("Content-Type", mimeType);
                res.setHeader("Cache-Control", "public, max-age=86400");
                return res.send(buffer);
              }
            }
          } catch (parseError) {
            console.warn("\u26A0\uFE0F Secret - Erro ao analisar backup:", parseError);
          }
        }
      }
      console.log("\u274C Secret - Imagem n\xE3o encontrada:", filename);
      res.status(404).json({ error: "Imagem n\xE3o encontrada" });
    } catch (error) {
      console.error("\u274C Secret - Erro ao servir imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/robots.txt", async (req, res) => {
    try {
      const configs = await storage.getAllSiteConfigs();
      const marketingConfig = configs.find((c) => c.key === "marketing_pixels");
      const marketingData = marketingConfig?.value || {};
      const enableGoogleIndexing = marketingData.enableGoogleIndexing ?? true;
      res.setHeader("Content-Type", "text/plain");
      if (enableGoogleIndexing) {
        res.send(`User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`);
      } else {
        res.send(`User-agent: *
Disallow: /`);
      }
    } catch (error) {
      res.setHeader("Content-Type", "text/plain");
      res.send(`User-agent: *
Allow: /`);
    }
  });
  app2.post("/api/admin/hero/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }
      const originalPath = req.file.path;
      const optimizedPath = await optimizeImage(originalPath, "hero", {
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080
      });
      await cleanupOriginal(originalPath);
      const imageUrl = `/uploads/hero/${path8.basename(optimizedPath)}`;
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
  app2.post("/api/admin/avatar", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }
      const originalPath = req.file.path;
      const optimizedPath = await optimizeImage(originalPath, "hero", {
        quality: 90,
        maxWidth: 400,
        maxHeight: 400
      });
      await cleanupOriginal(originalPath);
      const avatarUrl = `/uploads/hero/${path8.basename(optimizedPath)}`;
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
  app2.post("/api/admin/upload/testimonials", upload.single("image"), async (req, res) => {
    try {
      console.log("\u{1F4F7} Iniciando upload de imagem de depoimento...");
      if (!req.file) {
        console.log("\u274C Nenhuma imagem foi enviada");
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }
      console.log("\u{1F4C4} Arquivo recebido:", {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
      const originalPath = req.file.path;
      console.log("\u{1F504} Otimizando imagem...");
      const optimizedPath = await optimizeImage(originalPath, "testimonials", {
        quality: 85,
        maxWidth: 300,
        maxHeight: 300
      });
      await cleanupOriginal(originalPath);
      const imagePath = `/uploads/testimonials/${path8.basename(optimizedPath)}`;
      console.log("\u2705 Upload conclu\xEDdo:", imagePath);
      res.json({
        imagePath,
        message: "Imagem do depoimento convertida para WebP com sucesso"
      });
    } catch (error) {
      console.error("\u274C Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/testimonials/:id/image", upload.single("image"), async (req, res) => {
    try {
      const testimonialId = parseInt(req.params.id);
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }
      const originalPath = req.file.path;
      const optimizedPath = await optimizeImage(originalPath, "testimonials", {
        quality: 85,
        maxWidth: 300,
        maxHeight: 300
      });
      await cleanupOriginal(originalPath);
      const imageUrl = `/uploads/testimonials/${path8.basename(optimizedPath)}`;
      await storage.updateTestimonial(testimonialId, {
        photo: imageUrl
      });
      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/cookie-settings", async (req, res) => {
    try {
      console.log("GET /api/cookie-settings - Iniciando busca das configura\xE7\xF5es");
      const settings = await storage.getCookieSettings();
      console.log("GET /api/cookie-settings - Configura\xE7\xF5es obtidas:", settings);
      res.json(settings);
    } catch (error) {
      console.error("Erro na API de cookies:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/privacy-policy", async (req, res) => {
    try {
      const policy = await storage.getPrivacyPolicy();
      res.json(policy);
    } catch (error) {
      console.error("Erro ao buscar pol\xEDtica de privacidade:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/terms-of-use", async (req, res) => {
    try {
      const terms = await storage.getTermsOfUse();
      res.json(terms);
    } catch (error) {
      console.error("Erro ao buscar termos de uso:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/admin/cookie-settings", async (req, res) => {
    try {
      console.log("PUT /api/admin/cookie-settings called with body:", req.body);
      const validatedData = insertCookieSettingsSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const settings = await storage.updateCookieSettings(validatedData);
      console.log("Settings updated successfully:", settings);
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error("Erro ao atualizar configura\xE7\xF5es de cookies:", error);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/privacy-policy", async (req, res) => {
    try {
      const validatedData = insertPrivacyPolicySchema.parse(req.body);
      const policy = await storage.updatePrivacyPolicy(validatedData);
      res.json({ success: true, data: policy });
    } catch (error) {
      console.error("Erro ao atualizar pol\xEDtica de privacidade:", error);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/terms-of-use", async (req, res) => {
    try {
      const validatedData = insertTermsOfUseSchema.parse(req.body);
      const terms = await storage.updateTermsOfUse(validatedData);
      res.json({ success: true, data: terms });
    } catch (error) {
      console.error("Erro ao atualizar termos de uso:", error);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.get("/api/articles", async (req, res) => {
    try {
      const articles2 = await storage.getPublishedArticles();
      res.json(articles2);
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/articles/featured", async (req, res) => {
    try {
      const articles2 = await storage.getFeaturedArticles();
      res.json(articles2);
    } catch (error) {
      console.error("Erro ao buscar artigos em destaque:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ error: "Artigo n\xE3o encontrado" });
      }
      if (!article.isPublished) {
        return res.status(404).json({ error: "Artigo n\xE3o encontrado" });
      }
      res.json(article);
    } catch (error) {
      console.error("Erro ao buscar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/articles", async (req, res) => {
    try {
      const articles2 = await storage.getAllArticles();
      res.json(articles2);
    } catch (error) {
      console.error("Erro ao buscar todos os artigos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ error: "Artigo n\xE3o encontrado" });
      }
      res.json(article);
    } catch (error) {
      console.error("Erro ao buscar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.json(article);
    } catch (error) {
      console.error("Erro ao criar artigo:", error);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.put("/api/admin/articles/reorder", async (req, res) => {
    try {
      console.log("\u{1F504} Articles REORDER - Raw body:", req.body);
      console.log("\u{1F504} Articles REORDER - Body type:", typeof req.body);
      console.log("\u{1F504} Articles REORDER - Body stringified:", JSON.stringify(req.body, null, 2));
      let reorderData;
      if (Array.isArray(req.body)) {
        console.log("\u2705 Articles REORDER - Dados s\xE3o array direto");
        reorderData = req.body;
      } else if (req.body && Array.isArray(req.body.items)) {
        console.log("\u2705 Articles REORDER - Dados est\xE3o em req.body.items");
        reorderData = req.body.items;
      } else if (req.body && req.body.value && Array.isArray(req.body.value)) {
        console.log("\u2705 Articles REORDER - Dados est\xE3o em req.body.value");
        reorderData = req.body.value;
      } else {
        console.error("\u274C Articles REORDER - Formato inv\xE1lido:", req.body);
        return res.status(400).json({
          error: "Dados de reordena\xE7\xE3o devem ser um array",
          received: typeof req.body,
          body: req.body
        });
      }
      if (!Array.isArray(reorderData) || reorderData.length === 0) {
        console.error("\u274C Articles REORDER - Array vazio ou inv\xE1lido:", reorderData);
        return res.status(400).json({ error: "Array de reordena\xE7\xE3o vazio ou inv\xE1lido" });
      }
      console.log("\u{1F504} Articles REORDER - Processando array v\xE1lido:", reorderData);
      console.log("\u{1F504} Articles REORDER - Chamando storage.reorderArticles...");
      const updatedArticles = await storage.reorderArticles(reorderData);
      console.log("\u2705 Articles REORDER - storage.reorderArticles conclu\xEDda");
      console.log("\u2705 Articles REORDER - Artigos atualizados obtidos:", updatedArticles.length, "itens");
      const orderCheck = updatedArticles.map((a) => ({ id: a.id, title: a.title.substring(0, 30), order: a.order }));
      console.log("\u{1F50D} Articles REORDER - Ordens no banco ap\xF3s atualiza\xE7\xE3o:", JSON.stringify(orderCheck, null, 2));
      res.json(updatedArticles);
    } catch (error) {
      console.error("\u274C Articles REORDER - Erro completo:", error);
      console.error("\u274C Articles REORDER - Stack trace:", error instanceof Error ? error.stack : "No stack");
      res.status(500).json({ error: "Erro ao reordenar artigos" });
    }
  });
  app2.put("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(id, validatedData);
      res.json(article);
    } catch (error) {
      console.error("Erro ao atualizar artigo:", error);
      res.status(400).json({ error: "Dados inv\xE1lidos" });
    }
  });
  app2.delete("/api/admin/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticle(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/articles/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.publishArticle(id);
      res.json(article);
    } catch (error) {
      console.error("Erro ao publicar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/articles/:id/unpublish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.unpublishArticle(id);
      res.json(article);
    } catch (error) {
      console.error("Erro ao despublicar artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/admin/upload-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      console.log(`\u{1F4F8} Upload de imagem para conte\xFAdo iniciado:`, req.file.filename);
      const originalPath = req.file.path;
      const folder = req.body.folder || "articles";
      console.log("\u{1F4C2} Pasta detectada:", folder);
      console.log("\u{1F50D} Body da request:", req.body);
      let optimizedPath;
      let finalUrl;
      if (folder === "seo") {
        const seoDir = path8.join(process.cwd(), "uploads", "seo");
        if (!existsSync2(seoDir)) {
          mkdirSync(seoDir, { recursive: true });
        }
        const outputPath = path8.join(seoDir, `seo-${Date.now()}.jpg`);
        await sharp3(originalPath).resize(1200, 630, { fit: "cover", position: "center" }).jpeg({ quality: 85 }).toFile(outputPath);
        optimizedPath = outputPath;
        finalUrl = `/uploads/seo/${path8.basename(outputPath)}`;
        console.log(`\u{1F4F8} Imagem SEO otimizada: ${finalUrl}`);
      } else {
        optimizedPath = await optimizeImage(originalPath, folder);
        finalUrl = `/uploads/${folder}/${path8.basename(optimizedPath)}`;
      }
      await cleanupOriginal(originalPath);
      res.json({
        success: true,
        url: finalUrl,
        imageUrl: finalUrl,
        // Mantém compatibilidade
        message: "Imagem carregada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });
  app2.post("/api/admin/upload-image/support", upload.single("image"), async (req, res) => {
    try {
      console.log("\u{1F50D} Iniciando upload de imagem para suporte...");
      console.log("Request details:", {
        path: req.path,
        method: req.method,
        hasFile: !!req.file,
        headers: req.headers["content-type"]
      });
      if (!req.file) {
        console.error("\u274C Nenhum arquivo enviado");
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      console.log(`\u{1F4F8} Upload de imagem para suporte iniciado:`, {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
      const originalPath = req.file.path;
      if (!existsSync2(originalPath)) {
        console.error("\u274C Arquivo n\xE3o encontrado:", originalPath);
        return res.status(500).json({ error: "Arquivo n\xE3o encontrado ap\xF3s upload" });
      }
      console.log("\u{1F504} Otimizando imagem...");
      const optimizedPath = await optimizeImage(originalPath, "support");
      console.log("\u{1F9F9} Limpando arquivo original...");
      await cleanupOriginal(originalPath);
      const imageUrl = `/uploads/support/${path8.basename(optimizedPath)}`;
      console.log("\u2705 Upload de suporte conclu\xEDdo:", imageUrl);
      res.json({
        success: true,
        url: imageUrl,
        message: "Imagem anexada com sucesso!"
      });
    } catch (error) {
      console.error("\u274C Erro ao fazer upload da imagem de suporte:", error);
      res.status(500).json({
        error: "Erro ao fazer upload da imagem",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.post("/api/admin/articles/:id/upload", upload.single("image"), async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      const optimizedPath = await optimizeImage(req.file.path, "articles");
      await cleanupOriginal(req.file.path);
      const imageUrl = `/uploads/articles/${path8.basename(optimizedPath)}`;
      await storage.updateArticle(articleId, {
        cardImage: imageUrl
      });
      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem do artigo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/user-preference/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const preference = await storage.getUserPreference(key);
      if (preference) {
        res.json(preference);
      } else {
        res.status(404).json({ error: "Prefer\xEAncia n\xE3o encontrada" });
      }
    } catch (error) {
      console.error("Erro ao buscar prefer\xEAncia:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/user-preference", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === void 0) {
        return res.status(400).json({ error: "Key e value s\xE3o obrigat\xF3rios" });
      }
      const preference = await storage.setUserPreference({ key, value });
      res.json(preference);
    } catch (error) {
      console.error("Erro ao definir prefer\xEAncia:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  const requireLogPassword = (req, res, next) => {
    console.log("\u{1F510} Auth middleware - Password check:", req.query.password ? "Provided" : "Missing");
    console.log("\u{1F510} Auth middleware - URL:", req.originalUrl);
    const password = req.query.password || req.headers["x-log-password"];
    if (password !== "24092002") {
      console.log("\u{1F6AB} Auth failed - Wrong password:", password);
      res.status(401).json({
        error: "Acesso negado. Senha necess\xE1ria para acessar logs.",
        message: "Use o par\xE2metro ?password=SENHA ou header X-Log-Password",
        provided: password ? "Senha incorreta" : "Senha n\xE3o fornecida"
      });
      return;
    }
    console.log("\u2705 Auth success - Access granted");
    next();
  };
  app2.get("/api/admin/logs/test", requireLogPassword, (req, res) => {
    res.json({
      success: true,
      message: "Autentica\xE7\xE3o funcionando corretamente!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/api/admin/logs/report/:month?", requireLogPassword, async (req, res) => {
    try {
      const monthYear = req.params.month;
      const reportPath = logReporter_default.saveTextReport(monthYear);
      const filename = path8.basename(reportPath);
      res.download(reportPath, filename, (err) => {
        if (err) {
          console.error("Erro ao enviar arquivo:", err);
          res.status(500).json({ error: "Erro ao baixar relat\xF3rio" });
        }
      });
    } catch (error) {
      console.error("Erro ao gerar relat\xF3rio:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/admin/logs/summary", requireLogPassword, async (req, res) => {
    try {
      const summaryPath = logReporter_default.saveSummaryReport();
      const filename = path8.basename(summaryPath);
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
  app2.get("/api/admin/logs/view/:month?", requireLogPassword, async (req, res) => {
    try {
      const monthYear = req.params.month;
      const textReport = logReporter_default.generateTextReport(monthYear);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(textReport);
    } catch (error) {
      console.error("Erro ao gerar relat\xF3rio:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/seo/preview", async (req, res) => {
    try {
      const url = req.query.url || `${req.protocol}://${req.get("host")}`;
      console.log("\u{1F9EA} Testando SEO preview para URL:", url);
      const { getSEOData: getSEOData2, generateMetaTags: generateMetaTags3 } = await Promise.resolve().then(() => (init_seoRenderer(), seoRenderer_exports));
      const seoData = await getSEOData2(url);
      const metaTags = generateMetaTags3(seoData);
      res.json({
        success: true,
        url,
        seoData,
        metaTags,
        message: "Preview das meta tags SEO geradas com sucesso"
      });
    } catch (error) {
      console.error("\u274C Erro ao gerar preview SEO:", error);
      res.status(500).json({
        error: "Erro ao gerar preview SEO",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.get("/api/seo/config", async (req, res) => {
    try {
      console.log("\u{1F50D} Verificando configura\xE7\xF5es SEO no banco");
      const configs = await storage.getAllSiteConfigs();
      const seoConfig = configs.find((c) => c.key === "seo_meta")?.value || {};
      const generalConfig = configs.find((c) => c.key === "general_info")?.value || {};
      res.json({
        success: true,
        seoConfig,
        generalConfig,
        allConfigs: configs.map((c) => ({ key: c.key, hasValue: !!c.value })),
        message: "Configura\xE7\xF5es SEO obtidas com sucesso"
      });
    } catch (error) {
      console.error("\u274C Erro ao buscar configura\xE7\xF5es SEO:", error);
      res.status(500).json({
        error: "Erro ao buscar configura\xE7\xF5es SEO",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.post("/api/seo/regenerate-html", async (req, res) => {
    try {
      console.log("\u{1F504} Regenerando HTML est\xE1tico com meta tags atualizadas");
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
      const baseUrl = `${protocol}://${host}`;
      const { regenerateStaticHTML: regenerateStaticHTML2, isHTMLStaticallyGenerated: isHTMLStaticallyGenerated2 } = await Promise.resolve().then(() => (init_htmlGenerator(), htmlGenerator_exports));
      const wasStatic = await isHTMLStaticallyGenerated2();
      await regenerateStaticHTML2(baseUrl);
      res.json({
        success: true,
        baseUrl,
        wasStaticallyGenerated: wasStatic,
        message: "HTML est\xE1tico regenerado com meta tags SEO atualizadas"
      });
    } catch (error) {
      console.error("\u274C Erro ao regenerar HTML est\xE1tico:", error);
      res.status(500).json({
        error: "Erro ao regenerar HTML est\xE1tico",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.post("/api/seo/refresh-cache", async (req, res) => {
    try {
      const url = req.body.url || req.headers.origin || "https://example.com";
      console.log("\u{1F504} Solicita\xE7\xE3o de limpeza de cache SEO para:", url);
      res.json({
        success: true,
        message: "Cache SEO atualizado. As redes sociais podem levar alguns minutos para atualizar.",
        url,
        instructions: [
          "Facebook/Instagram: Use o Facebook Sharing Debugger",
          "WhatsApp: Pode levar at\xE9 7 dias para atualizar automaticamente",
          "Twitter/X: Geralmente atualiza em poucos minutos",
          "LinkedIn: Use o Post Inspector do LinkedIn"
        ]
      });
    } catch (error) {
      console.error("\u274C Erro ao atualizar cache SEO:", error);
      res.status(500).json({ error: "Erro ao atualizar cache SEO" });
    }
  });
  const httpServer = createServer(app2);
  console.log("\u2705 Todas as rotas da API registradas com sucesso");
  console.log("\u{1F517} Rotas incluem: /api/admin/test-support-message, /api/admin/support-messages, /api/seo/preview");
  return httpServer;
}

// server/index.ts
init_seoRenderer();

// server/utils/seoMiddleware.ts
init_seoRenderer();
var SOCIAL_MEDIA_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "TelegramBot",
  "SkypeUriPreview",
  "AppleBot",
  "Google-StructuredDataTestingTool",
  "FacebookBot",
  "LinkedInBot",
  "SlackBot",
  "DiscordBot"
];
function isSocialMediaBot(userAgent) {
  if (!userAgent) return false;
  const lowerUserAgent = userAgent.toLowerCase();
  return SOCIAL_MEDIA_BOTS.some(
    (bot) => lowerUserAgent.includes(bot.toLowerCase())
  );
}
async function seoTestRoute(req, res) {
  try {
    const testUserAgent = req.query.userAgent || "facebookexternalhit/1.1";
    const testUrl = req.query.url || `${req.protocol}://${req.get("host")}`;
    console.log(`\u{1F9EA} Testando SEO com User Agent: ${testUserAgent}`);
    console.log(`\u{1F9EA} Testando SEO para URL: ${testUrl}`);
    const seoData = await getSEOData(testUrl);
    if (req.query.format === "json") {
      return res.json({
        success: true,
        testUserAgent,
        testUrl,
        isBot: isSocialMediaBot(testUserAgent),
        seoData,
        message: "Dados SEO obtidos com sucesso"
      });
    }
    const baseHTML = await getBaseHTML();
    const htmlWithSEO = await injectSEOIntoHTML(baseHTML, seoData);
    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "X-SEO-Test": "true"
    });
    res.send(htmlWithSEO);
  } catch (error) {
    console.error("\u274C Erro no teste SEO:", error);
    res.status(500).json({
      error: "Erro no teste SEO",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
}

// server/index.ts
init_botDetector();
init_presetIconGenerator();
function formatLogsAsHTML(report, month) {
  const monthName = month ? (/* @__PURE__ */ new Date(month + "-01")).toLocaleDateString("pt-BR", { year: "numeric", month: "long" }) : "M\xEAs Atual";
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logs do Sistema - ${monthName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .summary { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .log-entry { background: #f8f9fa; margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
    .timestamp { font-weight: bold; color: #007bff; }
    .ip { color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <h1>\u{1F4CA} Logs do Sistema - ${monthName}</h1>
    <div class="summary">
      <strong>Total de Altera\xE7\xF5es:</strong> ${report.totalChanges}<br>
      <strong>Total de Acessos:</strong> ${report.totalAccess}<br>
      <strong>Gerado em:</strong> ${report.generatedAt}
    </div>
    
    <h2>\u{1F4DD} Altera\xE7\xF5es</h2>
    ${report.changes.length > 0 ? report.changes.map((change, index) => `
        <div class="log-entry">
          <div class="timestamp">${index + 1}. ${change.timestamp}</div>
          <div>IP: <span class="ip">${change.ip}</span></div>
          <div>A\xE7\xE3o: ${change.action}</div>
          <div>Se\xE7\xE3o: ${change.section}</div>
          <div>Campo: ${change.field}</div>
          ${change.details ? `<div>Detalhes: ${change.details}</div>` : ""}
        </div>
      `).join("") : "<p>Nenhuma altera\xE7\xE3o registrada.</p>"}
    
    <h2>\u{1F510} Acessos</h2>
    ${report.access.length > 0 ? report.access.map((access, index) => `
        <div class="log-entry">
          <div class="timestamp">${index + 1}. ${access.timestamp}</div>
          <div>IP: <span class="ip">${access.ip}</span></div>
          <div>A\xE7\xE3o: ${access.action}</div>
          <div>Status: ${access.status}</div>
          ${access.userAgent && access.userAgent !== "unknown" ? `<div>Navegador: ${access.userAgent.substring(0, 100)}...</div>` : ""}
          ${access.details ? `<div>Detalhes: ${access.details}</div>` : ""}
        </div>
      `).join("") : "<p>Nenhum acesso registrado.</p>"}
  </div>
</body>
</html>`;
}
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express2();
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use((req, res, next) => {
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Expires", new Date(Date.now() + 31536e6).toUTCString());
  } else if (req.url.match(/\.(html)$/) || req.url === "/") {
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.setHeader("Expires", new Date(Date.now() + 3e5).toUTCString());
  } else if (req.url.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use(async (req, res, next) => {
  if (req.path === "/" && req.method === "GET") {
    try {
      const botHandled = await handleBotRequest(req, res);
      if (botHandled) {
        return;
      }
    } catch (error) {
      console.error("\u274C Erro no middleware de detec\xE7\xE3o de bot:", error);
    }
  }
  next();
});
app.use("/uploads", express2.static("uploads", {
  maxAge: "30d",
  etag: true,
  lastModified: true
}));
app.use("/api/*", (req, res, next) => {
  console.log(`\u{1F50D} API route intercepted: ${req.method} ${req.originalUrl} | Path: ${req.path}`);
  console.log(`\u{1F50D} API headers:`, req.headers["content-type"]);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`\u{1F50D} API body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path12 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path12.startsWith("/api")) {
      let logLine = `${req.method} ${path12} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log2(logLine);
    }
  });
  next();
});
(async () => {
  let setupVite2, serveStatic2;
  if (process.env.NODE_ENV === "development") {
    const viteUtils = await init_vite().then(() => vite_exports);
    setupVite2 = viteUtils.setupVite;
    serveStatic2 = viteUtils.serveStatic;
  } else {
    const fs10 = await import("fs");
    const path12 = await import("path");
    serveStatic2 = (app2) => {
      const distPath = path12.resolve(process.cwd(), "dist", "public");
      if (!fs10.existsSync(distPath)) {
        throw new Error(
          `Could not find the build directory: ${distPath}, make sure to build the client first`
        );
      }
      app2.use(express2.static(distPath));
      app2.use("*", (_req, res) => {
        res.sendFile(path12.resolve(distPath, "index.html"));
      });
    };
  }
  let dbConnected = false;
  try {
    const { testDatabaseConnection: testDatabaseConnection2, setupConnectionCleanup: setupConnectionCleanup2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    console.log("\u{1F527} Testando conectividade do banco de dados...");
    dbConnected = await testDatabaseConnection2();
    if (dbConnected) {
      console.log("\u2705 Banco de dados conectado com sucesso");
      console.log("\u{1F527} Configurando limpeza autom\xE1tica de conex\xF5es...");
      setupConnectionCleanup2();
    } else {
      console.warn("\u26A0\uFE0F Falha na conectividade inicial do banco - aplica\xE7\xE3o continuar\xE1 sem funcionalidades de banco");
    }
  } catch (error) {
    console.error("\u274C Erro cr\xEDtico na inicializa\xE7\xE3o do banco de dados:", error);
    console.log("\u{1F527} Aplica\xE7\xE3o continuar\xE1 sem funcionalidades de banco de dados");
  }
  app.get("/api/health", (req, res) => {
    const healthCheck = {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: dbConnected ? "connected" : "disconnected",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
      }
    };
    res.status(200).json(healthCheck);
  });
  console.log("\u{1F527} Setting up API routes...");
  const server = await registerRoutes(app);
  console.log("\u2705 API routes registered successfully");
  console.log("\u{1F527} Integrando rotas de logs administrativos...");
  const requireLogPassword = (req, res, next) => {
    const password = req.query.password || req.headers["x-log-password"];
    if (password !== "24092002") {
      res.status(401).json({
        error: "Acesso negado. Senha necess\xE1ria para acessar logs.",
        message: "Use o par\xE2metro ?password=SENHA ou header X-Log-Password"
      });
      return;
    }
    next();
  };
  app.get("/logs/test", requireLogPassword, (req, res) => {
    res.json({
      success: true,
      message: "Servidor de logs funcionando no servidor principal!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      server: "Integrado - Porta 3000"
    });
  });
  app.get("/logs/view/:month?", requireLogPassword, async (req, res) => {
    try {
      const month = req.params.month;
      console.log(`\u{1F4CA} Visualizando logs${month ? ` do m\xEAs ${month}` : " do m\xEAs atual"}`);
      const report = month ? LogReporter.generateReport(month) : LogReporter.generateReport();
      const html = formatLogsAsHTML(report, month);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error) {
      console.error("\u274C Erro ao visualizar logs:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app.get("/logs/report/:month?", requireLogPassword, async (req, res) => {
    try {
      const month = req.params.month;
      console.log(`\u{1F4C4} Gerando relat\xF3rio${month ? ` do m\xEAs ${month}` : " do m\xEAs atual"}`);
      const report = month ? LogReporter.generateTextReport(month) : LogReporter.generateTextReport();
      const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const filename = `logs-${month || currentMonth}.txt`;
      res.set({
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      });
      res.send(report);
    } catch (error) {
      console.error("\u274C Erro ao gerar relat\xF3rio:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app.get("/logs/summary", requireLogPassword, async (req, res) => {
    try {
      console.log("\u{1F4C8} Gerando resumo de logs...");
      const logReporter = new LogReporter();
      const summary = await logReporter.generateSummary();
      res.json(summary);
    } catch (error) {
      console.error("\u274C Erro ao gerar resumo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  console.log("\u2705 Rotas de logs integradas ao servidor principal");
  app.get("/seo-test", seoTestRoute);
  app.get("/bot-test", simulateBotRequest);
  app.get("/", async (req, res, next) => {
    try {
      const { isSocialMediaBot: isSocialMediaBot3 } = await Promise.resolve().then(() => (init_botDetector(), botDetector_exports));
      const botDetected = isSocialMediaBot3(req.headers["user-agent"] || "");
      if (botDetected) {
        console.log("\u{1F916} Bot detectado - servindo HTML SEO est\xE1tico");
        const { isHTMLStaticallyGenerated: isHTMLStaticallyGenerated2 } = await Promise.resolve().then(() => (init_htmlGenerator(), htmlGenerator_exports));
        const hasSEOFile = await isHTMLStaticallyGenerated2();
        if (hasSEOFile) {
          const path12 = await import("path");
          const seoHtmlPath = path12.resolve(process.cwd(), "client", "index-seo.html");
          console.log("\u{1F4C1} Servindo arquivo SEO:", seoHtmlPath);
          return res.sendFile(seoHtmlPath);
        } else {
          console.log("\u26A0\uFE0F Arquivo SEO n\xE3o existe - usando middleware din\xE2mico");
        }
      }
      next();
    } catch (error) {
      console.error("\u274C Erro no middleware SEO:", error);
      next();
    }
  });
  app.use((err, req, res, _next) => {
    let status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    console.error("\u{1F6A8} ERRO CAPTURADO:", {
      url: req.url,
      method: req.method,
      status,
      error: err.message,
      stack: err.stack?.substring(0, 500),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (err.message?.includes("connect") || err.message?.includes("connection") || err.message?.includes("ENOTFOUND") || err.message?.includes("timeout") || err.code === "ECONNRESET" || err.code === "ECONNREFUSED") {
      console.error("\u{1F4A5} ERRO DE CONECTIVIDADE DE BANCO DETECTADO");
      message = "Erro tempor\xE1rio de conectividade. Tente novamente em alguns segundos.";
      status = 503;
      setTimeout(async () => {
        try {
          const { testDatabaseConnection: testDatabaseConnection2 } = await Promise.resolve().then(() => (init_db(), db_exports));
          await testDatabaseConnection2();
        } catch (reconnectError) {
          console.error("\u274C Falha na tentativa de reconex\xE3o:", reconnectError);
        }
      }, 1e3);
    }
    if (!res.headersSent) {
      res.status(status).json({
        message,
        error: process.env.NODE_ENV === "development" ? err.stack : void 0
      });
    }
    console.error(`\u274C Erro ${status} processado sem crash da aplica\xE7\xE3o`);
  });
  if (app.get("env") === "development") {
    console.log("\u{1F527} Setting up Vite middleware...");
    try {
      if (typeof setupVite2 !== "function") {
        throw new Error("setupVite is not a function - check vite import");
      }
      await setupVite2(app, server);
      console.log("\u2705 Vite middleware configured");
    } catch (viteError) {
      console.error("\u274C Failed to setup Vite middleware:", viteError);
      console.log("\u{1F504} Continuing without Vite middleware - serving static fallback");
      app.use(express2.static("client/dist", { fallthrough: true }));
      app.get("*", (req, res) => {
        res.sendFile(path11.resolve(process.cwd(), "client", "dist", "index.html"));
      });
    }
  } else {
    app.get("/", async (req, res, next) => {
      try {
        console.log("\u{1F50D} [PROD] Interceptando requisi\xE7\xE3o para p\xE1gina principal - aplicando SEO din\xE2mico");
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
        const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
        const fullUrl = `${protocol}://${host}${req.originalUrl}`;
        console.log("\u{1F310} [PROD] URL da requisi\xE7\xE3o:", fullUrl);
        const seoData = await getSEOData(fullUrl);
        console.log("\u{1F4CA} [PROD] Dados SEO obtidos:", {
          title: seoData.title,
          hasImage: !!seoData.ogImage,
          imageUrl: seoData.ogImage?.substring(0, 50) + "..."
        });
        const baseHTML = await getBaseHTML();
        const htmlWithSEO = await injectSEOIntoHTML(baseHTML, seoData);
        console.log("\u2705 [PROD] SEO injetado com sucesso - enviando HTML customizado");
        res.set({
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          // Cache por 5 minutos
          "Vary": "Accept-Encoding"
        });
        return res.send(htmlWithSEO);
      } catch (error) {
        console.error("\u274C [PROD] Erro na inje\xE7\xE3o de SEO:", error);
        next();
      }
    });
    serveStatic2(app);
  }
  const defaultPort = process.env.NODE_ENV === "production" ? "3000" : "5001";
  const port = parseInt(process.env.PORT || defaultPort, 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log2(`serving on port ${port}`);
  });
})();
export {
  generateAllPresetIcons
};
