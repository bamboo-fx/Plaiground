import {
  users, type User, type InsertUser,
  userPreferences, type UserPreferences, type InsertUserPreferences,
  tools, type Tool, type InsertTool,
  categories, type Category, 
  tags, type Tag, 
  toolCategories, type ToolCategory, 
  toolTags, type ToolTag
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user;
  }
  
  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    
    return prefs || undefined;
  }

  async createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const [userPrefs] = await db
      .insert(userPreferences)
      .values(prefs)
      .returning();
    
    return userPrefs;
  }

  async updateUserPreferences(userId: number, prefs: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updatedPrefs] = await db
      .update(userPreferences)
      .set({ ...prefs, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    
    if (!updatedPrefs) {
      throw new Error(`User preferences for user ID ${userId} not found`);
    }
    
    return updatedPrefs;
  }

  async addToSearchHistory(userId: number, query?: string): Promise<string[]> {
    const userPrefs = await this.getUserPreferences(userId);
    
    if (!userPrefs) {
      throw new Error(`User preferences for user ID ${userId} not found`);
    }

    // If a query is provided, add it to history
    if (query) {
      const searchHistory = userPrefs.searchHistory || [];
      const updatedHistory = [...searchHistory, query];
      
      const [updatedPrefs] = await db
        .update(userPreferences)
        .set({ 
          searchHistory: updatedHistory,
          updatedAt: new Date() 
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
      
      return updatedPrefs.searchHistory || [];
    }

    return userPrefs.searchHistory || [];
  }

  async saveToolToFavorites(userId: number, toolId: number): Promise<number[]> {
    const userPrefs = await this.getUserPreferences(userId);
    
    if (!userPrefs) {
      throw new Error(`User preferences for user ID ${userId} not found`);
    }

    // Add tool to favorites if not already present
    const savedTools = userPrefs.savedTools || [];
    if (!savedTools.includes(toolId)) {
      const updatedTools = [...savedTools, toolId];
      
      const [updatedPrefs] = await db
        .update(userPreferences)
        .set({ 
          savedTools: updatedTools,
          updatedAt: new Date() 
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
      
      return updatedPrefs.savedTools || [];
    }

    return savedTools;
  }

  async removeToolFromFavorites(userId: number, toolId: number): Promise<number[]> {
    const userPrefs = await this.getUserPreferences(userId);
    
    if (!userPrefs) {
      throw new Error(`User preferences for user ID ${userId} not found`);
    }

    // Remove tool from favorites if present
    const savedTools = userPrefs.savedTools || [];
    const updatedTools = savedTools.filter(id => id !== toolId);
    
    const [updatedPrefs] = await db
      .update(userPreferences)
      .set({ 
        savedTools: updatedTools,
        updatedAt: new Date() 
      })
      .where(eq(userPreferences.userId, userId))
      .returning();
    
    return updatedPrefs.savedTools || [];
  }

  // Tool methods
  async getTool(id: number): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool || undefined;
  }

  async getTools(): Promise<Tool[]> {
    return db.select().from(tools);
  }

  async getFeaturedTools(limit = 4): Promise<Tool[]> {
    return db
      .select()
      .from(tools)
      .where(eq(tools.featured, true))
      .limit(limit);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const [tool] = await db
      .insert(tools)
      .values(insertTool)
      .returning();
    
    return tool;
  }

  async searchTools(query: string): Promise<Tool[]> {
    // Simple search implementation - in a production app we would use full-text search capabilities
    const searchTerms = query.toLowerCase().split(' ');
    const allTools = await this.getTools();
    
    return allTools.filter(tool => {
      const searchText = `${tool.name} ${tool.description} ${tool.companyName}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });
  }

  async getToolsByCategory(categoryId: number): Promise<Tool[]> {
    const toolCategoriesResult = await db
      .select({ toolId: toolCategories.toolId })
      .from(toolCategories)
      .where(eq(toolCategories.categoryId, categoryId));
    
    const toolIds = toolCategoriesResult.map(tc => tc.toolId);
    
    if (toolIds.length === 0) {
      return [];
    }
    
    return await Promise.all(
      toolIds.map(async (id) => {
        const tool = await this.getTool(id);
        if (!tool) {
          throw new Error(`Tool with ID ${id} not found`);
        }
        return tool;
      })
    );
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    // Case-insensitive search would be better, but for simplicity we'll use exact match
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category || undefined;
  }

  async createCategory(category: { name: string; icon: string; description: string }): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    
    return newCategory;
  }

  // Tag methods
  async getTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    // Case-insensitive search would be better, but for simplicity we'll use exact match
    const [tag] = await db.select().from(tags).where(eq(tags.name, name));
    return tag || undefined;
  }

  async createTag(tag: { name: string }): Promise<Tag> {
    const [newTag] = await db
      .insert(tags)
      .values(tag)
      .returning();
    
    return newTag;
  }

  // Relationship methods
  async addToolCategory(toolId: number, categoryId: number): Promise<ToolCategory> {
    const [toolCategory] = await db
      .insert(toolCategories)
      .values({ toolId, categoryId })
      .returning();
    
    return toolCategory;
  }

  async addToolTag(toolId: number, tagId: number): Promise<ToolTag> {
    const [toolTag] = await db
      .insert(toolTags)
      .values({ toolId, tagId })
      .returning();
    
    return toolTag;
  }

  async getToolCategories(toolId: number): Promise<Category[]> {
    const toolCategoriesResult = await db
      .select({ categoryId: toolCategories.categoryId })
      .from(toolCategories)
      .where(eq(toolCategories.toolId, toolId));
    
    const categoryIds = toolCategoriesResult.map(tc => tc.categoryId);
    
    if (categoryIds.length === 0) {
      return [];
    }
    
    return await Promise.all(
      categoryIds.map(async (id) => {
        const category = await this.getCategory(id);
        if (!category) {
          throw new Error(`Category with ID ${id} not found`);
        }
        return category;
      })
    );
  }

  async getToolTags(toolId: number): Promise<Tag[]> {
    const toolTagsResult = await db
      .select({ tagId: toolTags.tagId })
      .from(toolTags)
      .where(eq(toolTags.toolId, toolId));
    
    const tagIds = toolTagsResult.map(tt => tt.tagId);
    
    if (tagIds.length === 0) {
      return [];
    }
    
    return await Promise.all(
      tagIds.map(async (id) => {
        const tag = await this.getTag(id);
        if (!tag) {
          throw new Error(`Tag with ID ${id} not found`);
        }
        return tag;
      })
    );
  }
}

// Create database storage instance
export const dbStorage = new DatabaseStorage();