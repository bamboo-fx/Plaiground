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

  // Initialize database with sample data if empty
  async initializeSampleData(): Promise<void> {
    // Check if we have any tools already
    const existingTools = await this.getTools();
    if (existingTools.length > 0) {
      console.log("Database already contains data, skipping initialization");
      return;
    }

    console.log("Initializing database with sample data...");

    try {
      // Create categories
      const imageGeneration = await this.createCategory({
        name: "Image Generation",
        icon: "fa-image",
        description: "Create images from text prompts"
      });

      const contentWriting = await this.createCategory({
        name: "Content Writing",
        icon: "fa-pen-fancy",
        description: "Generate blogs, articles, and copy"
      });

      const audioProcessing = await this.createCategory({
        name: "Audio Processing",
        icon: "fa-microphone",
        description: "Transcribe, translate, and enhance audio"
      });

      const codeGeneration = await this.createCategory({
        name: "Code Generation",
        icon: "fa-code",
        description: "Create and debug code with AI"
      });

      const chatbots = await this.createCategory({
        name: "Chatbots",
        icon: "fa-comments",
        description: "Customer service and assistance"
      });

      const dataAnalysis = await this.createCategory({
        name: "Data Analysis",
        icon: "fa-chart-pie",
        description: "Insights and visualization from data"
      });

      const videoEditing = await this.createCategory({
        name: "Video Editing",
        icon: "fa-film",
        description: "Auto-edit, enhance, and generate video"
      });

      const translation = await this.createCategory({
        name: "Translation",
        icon: "fa-language",
        description: "Translate content between languages"
      });

      // Create tags
      const artTag = await this.createTag({ name: "Art" });
      const designTag = await this.createTag({ name: "Design" });
      const creativeTag = await this.createTag({ name: "Creative" });
      const openSourceTag = await this.createTag({ name: "Open Source" });
      const customizableTag = await this.createTag({ name: "Customizable" });
      const productivityTag = await this.createTag({ name: "Productivity" });
      const automationTag = await this.createTag({ name: "Automation" });
      const writingTag = await this.createTag({ name: "Writing" });
      const marketingTag = await this.createTag({ name: "Marketing" });

      // Create tools
      const dalle = await this.createTool({
        name: "DALL-E",
        description: "Creates realistic images and art from a description in natural language. Offers variations, editing, and multiple styles.",
        companyName: "OpenAI",
        logoUrl: "https://brandpalettes.com/wp-content/uploads/2022/02/DALL-E-logo.png",
        imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1965&q=80",
        rating: "4.8",
        pricing: "Free trial, then $15/mo",
        websiteUrl: "https://openai.com/dall-e/",
        featured: true
      });

      const midjourney = await this.createTool({
        name: "Midjourney",
        description: "Discord-based AI image generation tool known for its artistic quality and stylized approach to creating visuals from text prompts.",
        companyName: "Midjourney, Inc.",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Midjourney_Emblem.png/600px-Midjourney_Emblem.png",
        imageUrl: "https://images.unsplash.com/photo-1696454690178-29fe99bd607b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        rating: "4.9",
        pricing: "$10-30/mo",
        websiteUrl: "https://www.midjourney.com/",
        featured: false
      });

      const stableDiffusion = await this.createTool({
        name: "Stable Diffusion",
        description: "Open-source AI image generator that can be run locally or used through various interfaces. Known for flexibility and customization.",
        companyName: "Stability AI",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Stability_AI_logo.svg/1024px-Stability_AI_logo.svg.png",
        imageUrl: "https://images.unsplash.com/photo-1684786075818-7ffba2bfdc98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        rating: "4.7",
        pricing: "Free, Cloud: $10/mo",
        websiteUrl: "https://stability.ai/",
        featured: false
      });

      const chatGPT = await this.createTool({
        name: "ChatGPT",
        description: "Conversational AI assistant for text generation, answering questions, and creative writing.",
        companyName: "OpenAI",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
        imageUrl: "https://images.unsplash.com/photo-1669570094762-828f3dfaf675?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        rating: "4.9",
        pricing: "Free / $20 mo",
        websiteUrl: "https://chat.openai.com/",
        featured: true
      });

      const jasper = await this.createTool({
        name: "Jasper",
        description: "AI content creation platform for marketing copy, blogs, social media posts and more.",
        companyName: "Jasper AI",
        logoUrl: "https://www.jasper.ai/images/new-jasper-logo.svg",
        imageUrl: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
        rating: "4.7",
        pricing: "From $49/mo",
        websiteUrl: "https://www.jasper.ai/",
        featured: true
      });

      const notionAI = await this.createTool({
        name: "Notion AI",
        description: "AI writing assistant integrated with Notion for drafting, editing, summarizing, and brainstorming.",
        companyName: "Notion",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        imageUrl: "https://images.unsplash.com/photo-1610986603166-f78428624e76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        rating: "4.6",
        pricing: "$10/mo add-on",
        websiteUrl: "https://www.notion.so/product/ai",
        featured: true
      });

      const descript = await this.createTool({
        name: "Descript",
        description: "AI-powered audio and video editing tool with transcription, voice cloning, and Studio Sound.",
        companyName: "Descript",
        logoUrl: "https://assets-global.website-files.com/61734ecee390bd3fe4fbfbb4/6347d1dc1099e74e06b1c46a_Frame%2016.svg",
        imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
        rating: "4.8",
        pricing: "Free / From $12/mo",
        websiteUrl: "https://www.descript.com/",
        featured: true
      });

      // Add tool-category relationships
      await this.addToolCategory(dalle.id, imageGeneration.id);
      await this.addToolCategory(midjourney.id, imageGeneration.id);
      await this.addToolCategory(stableDiffusion.id, imageGeneration.id);
      await this.addToolCategory(chatGPT.id, chatbots.id);
      await this.addToolCategory(jasper.id, contentWriting.id);
      await this.addToolCategory(notionAI.id, contentWriting.id);
      await this.addToolCategory(descript.id, audioProcessing.id);
      await this.addToolCategory(descript.id, videoEditing.id);

      // Add tool-tag relationships
      await this.addToolTag(dalle.id, artTag.id);
      await this.addToolTag(dalle.id, designTag.id);
      await this.addToolTag(midjourney.id, artTag.id);
      await this.addToolTag(midjourney.id, creativeTag.id);
      await this.addToolTag(stableDiffusion.id, openSourceTag.id);
      await this.addToolTag(stableDiffusion.id, customizableTag.id);
      await this.addToolTag(chatGPT.id, writingTag.id);
      await this.addToolTag(chatGPT.id, productivityTag.id);
      await this.addToolTag(jasper.id, marketingTag.id);
      await this.addToolTag(jasper.id, writingTag.id);
      await this.addToolTag(notionAI.id, productivityTag.id);
      await this.addToolTag(notionAI.id, automationTag.id);
      await this.addToolTag(descript.id, automationTag.id);

      console.log("Database initialization complete");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}

// Create database storage instance
export const dbStorage = new DatabaseStorage();