import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// AI Tools schema
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: text("rating").notNull(),
  pricing: text("pricing").notNull(),
  websiteUrl: text("website_url").notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
});

export const toolCategories = pgTable("tool_categories", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull().references(() => tools.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const toolTags = pgTable("tool_tags", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull().references(() => tools.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

// Insert schemas
export const insertToolSchema = createInsertSchema(tools).omit({ 
  id: true,
  createdAt: true 
});

export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true 
});

export const insertTagSchema = createInsertSchema(tags).omit({ 
  id: true 
});

export const insertToolCategorySchema = createInsertSchema(toolCategories).omit({ 
  id: true 
});

export const insertToolTagSchema = createInsertSchema(toolTags).omit({ 
  id: true 
});

// Types
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type ToolCategory = typeof toolCategories.$inferSelect;
export type ToolTag = typeof toolTags.$inferSelect;

// Search query schema
export const searchQuerySchema = z.object({
  query: z.string().min(1),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// OpenAI response schema (previously Perplexity)
export const perplexityResponseSchema = z.object({
  tools: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    companyName: z.string(),
    logoUrl: z.string(),
    imageUrl: z.string(),
    rating: z.string(),
    pricing: z.string(),
    websiteUrl: z.string(),
    featured: z.boolean().optional().nullable(),
    createdAt: z.date().nullable(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })),
  context: z.object({
    heading: z.string(),
    description: z.string(),
  }),
});

export type PerplexityResponse = z.infer<typeof perplexityResponseSchema>;
