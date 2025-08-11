/**
 * schema.ts
 * 
 * Schemas do banco de dados compartilhados entre frontend e backend
 * Define tabelas PostgreSQL usando Drizzle ORM
 * Schemas de validação com Zod para type safety
 * Base para expansão do sistema de dados da aplicação
 */

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core"; // Tipos do PostgreSQL
import { createInsertSchema } from "drizzle-zod"; // Bridge Drizzle-Zod  
import { z } from "zod"; // Validação de esquemas

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  service: text("service").notNull(),
  testimonial: text("testimonial").notNull(),
  rating: integer("rating").notNull().default(5),
  photo: text("photo"), // Caminho para a foto do cliente
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para códigos customizados no header e body
export const customCodes = pgTable("custom_codes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nome descritivo do código
  code: text("code").notNull(), // O código HTML/JS
  location: text("location").notNull(), // 'header' ou 'body'
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoCarousel = pgTable("photo_carousel", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  showText: boolean("show_text").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Brain"),
  iconColor: text("icon_color").notNull().default("#ec4899"),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSettings = pgTable("contact_settings", {
  id: serial("id").primaryKey(),
  contact_items: jsonb("contact_items").notNull().default([]),
  schedule_info: jsonb("schedule_info").notNull().default({}),
  location_info: jsonb("location_info").notNull().default({}),
  contact_card: jsonb("contact_card").notNull().default({}),
  info_card: jsonb("info_card").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const footerSettings = pgTable("footer_settings", {
  id: serial("id").primaryKey(),
  general_info: jsonb("general_info").notNull().default({}),
  contact_buttons: jsonb("contact_buttons").notNull().default([]),
  certification_items: jsonb("certification_items").notNull().default([]),
  trust_seals: jsonb("trust_seals").notNull().default([]),
  bottom_info: jsonb("bottom_info").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("support"), // support, contact, feedback
  attachments: text("attachments").array(), // Array de URLs das imagens anexadas
  isRead: boolean("is_read").notNull().default(false),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

// Tabela para configurações de cookies e LGPD
export const cookieSettings = pgTable("cookie_settings", {
  id: serial("id").primaryKey(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  title: text("title").notNull().default("Cookies & Privacidade"),
  message: text("message").notNull().default("Utilizamos cookies para melhorar sua experiência no site e personalizar conteúdo. Ao continuar navegando, você concorda com nossa política de privacidade."),
  acceptButtonText: text("accept_button_text").notNull().default("Aceitar Cookies"),
  declineButtonText: text("decline_button_text").notNull().default("Não Aceitar"),
  privacyLinkText: text("privacy_link_text").notNull().default("Política de Privacidade"),
  termsLinkText: text("terms_link_text").notNull().default("Termos de Uso"),
  position: text("position").notNull().default("top"), // 'top' para desktop, 'bottom' para mobile
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela para política de privacidade
export const privacyPolicy = pgTable("privacy_policy", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Política de Privacidade"),
  content: text("content").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela para termos de uso
export const termsOfUse = pgTable("terms_of_use", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Termos de Uso"),
  content: text("content").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela para artigos científicos
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  badge: text("badge"), // Badge/categoria do artigo
  description: text("description").notNull(),
  content: text("content").notNull(), // Conteúdo completo do artigo em HTML
  cardImage: text("card_image"), // Imagem que aparece no card
  author: text("author").notNull(),
  coAuthors: text("co_authors"), // Co-autores separados por vírgula
  institution: text("institution"),
  articleReferences: text("article_references"), // Referências em texto formatado
  doi: text("doi"), // Digital Object Identifier
  keywords: text("keywords"), // Palavras-chave separadas por vírgula
  category: text("category").notNull().default("Psicologia"), // Categoria científica
  readingTime: integer("reading_time"), // Tempo estimado de leitura em minutos
  
  // Configurações de display
  showContactButton: boolean("show_contact_button").notNull().default(false),
  contactButtonText: text("contact_button_text").default("Entrar em Contato"),
  contactButtonUrl: text("contact_button_url"),
  
  // Configurações de publicação
  isPublished: boolean("is_published").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false), // Destaque na página principal
  publishedAt: timestamp("published_at"),
  order: integer("order").notNull().default(0),
  
  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela para preferências do usuário
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela para mensagens do chat secreto
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  attachments: text("attachments").array(), // Array de URLs das imagens anexadas
  attachmentBackups: text("attachment_backups"), // JSON com backups base64 das imagens para Render.com
  senderIp: text("sender_ip"), // IP para tracking anônimo
  userAgent: text("user_agent"), // User agent para analytics
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

// Schemas de inserção para cookies e políticas
export const insertCookieSettingsSchema = createInsertSchema(cookieSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertPrivacyPolicySchema = createInsertSchema(privacyPolicy).omit({
  id: true,
  updatedAt: true,
  lastUpdated: true,
});

export const insertTermsOfUseSchema = createInsertSchema(termsOfUse).omit({
  id: true,
  updatedAt: true,
  lastUpdated: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

// Schema para mensagens do chat
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Tipos para TypeScript
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type CookieSettings = typeof cookieSettings.$inferSelect;
export type PrivacyPolicy = typeof privacyPolicy.$inferSelect;
export type TermsOfUse = typeof termsOfUse.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type InsertCookieSettings = z.infer<typeof insertCookieSettingsSchema>;
export type InsertPrivacyPolicy = z.infer<typeof insertPrivacyPolicySchema>;
export type InsertTermsOfUse = z.infer<typeof insertTermsOfUseSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;

export const insertCustomCodeSchema = createInsertSchema(customCodes).omit({
  id: true,
  createdAt: true,
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});



export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoCarouselSchema = createInsertSchema(photoCarousel).omit({
  id: true,
  createdAt: true,
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true,
  createdAt: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
}).extend({
  attachments: z.array(z.string()).optional().default([])
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type FaqItem = typeof faqItems.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertPhotoCarousel = z.infer<typeof insertPhotoCarouselSchema>;
export type PhotoCarousel = typeof photoCarousel.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;
export type Specialty = typeof specialties.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;