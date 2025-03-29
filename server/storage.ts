import {
  users, type User, type InsertUser,
  tools, type Tool, type InsertTool,
  categories, type Category, type InsertCategory,
  tags, type Tag, type InsertTag,
  toolCategories, type ToolCategory, type InsertToolCategory,
  toolTags, type ToolTag, type InsertToolTag
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tool methods
  getTool(id: number): Promise<Tool | undefined>;
  getTools(): Promise<Tool[]>;
  getFeaturedTools(limit?: number): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  searchTools(query: string): Promise<Tool[]>;
  getToolsByCategory(categoryId: number): Promise<Tool[]>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Tag methods
  getTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;

  // Relationship methods
  addToolCategory(toolId: number, categoryId: number): Promise<ToolCategory>;
  addToolTag(toolId: number, tagId: number): Promise<ToolTag>;
  getToolCategories(toolId: number): Promise<Category[]>;
  getToolTags(toolId: number): Promise<Tag[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tools: Map<number, Tool>;
  private categories: Map<number, Category>;
  private tags: Map<number, Tag>;
  private toolCategories: Map<number, ToolCategory>;
  private toolTags: Map<number, ToolTag>;
  currentId: { users: number; tools: number; categories: number; tags: number; toolCategories: number; toolTags: number };

  constructor() {
    this.users = new Map();
    this.tools = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.toolCategories = new Map();
    this.toolTags = new Map();
    this.currentId = {
      users: 1,
      tools: 1,
      categories: 1,
      tags: 1,
      toolCategories: 1,
      toolTags: 1
    };

    // Initialize with some sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tool methods
  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async getTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async getFeaturedTools(limit = 4): Promise<Tool[]> {
    return Array.from(this.tools.values())
      .filter(tool => tool.featured)
      .slice(0, limit);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = this.currentId.tools++;
    const createdAt = new Date();
    const tool: Tool = { ...insertTool, id, createdAt };
    this.tools.set(id, tool);
    return tool;
  }

  async searchTools(query: string): Promise<Tool[]> {
    const searchTerms = query.toLowerCase().split(' ');
    return Array.from(this.tools.values()).filter(tool => {
      const searchText = `${tool.name} ${tool.description} ${tool.companyName}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });
  }

  async getToolsByCategory(categoryId: number): Promise<Tool[]> {
    const toolCategoriesArray = Array.from(this.toolCategories.values());
    const toolIds = toolCategoriesArray
      .filter(tc => tc.categoryId === categoryId)
      .map(tc => tc.toolId);
    
    return Array.from(this.tools.values())
      .filter(tool => toolIds.includes(tool.id));
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      category => category.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Tag methods
  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      tag => tag.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.currentId.tags++;
    const newTag: Tag = { ...tag, id };
    this.tags.set(id, newTag);
    return newTag;
  }

  // Relationship methods
  async addToolCategory(toolId: number, categoryId: number): Promise<ToolCategory> {
    const id = this.currentId.toolCategories++;
    const toolCategory: ToolCategory = { id, toolId, categoryId };
    this.toolCategories.set(id, toolCategory);
    return toolCategory;
  }

  async addToolTag(toolId: number, tagId: number): Promise<ToolTag> {
    const id = this.currentId.toolTags++;
    const toolTag: ToolTag = { id, toolId, tagId };
    this.toolTags.set(id, toolTag);
    return toolTag;
  }

  async getToolCategories(toolId: number): Promise<Category[]> {
    const toolCategoriesArray = Array.from(this.toolCategories.values());
    const categoryIds = toolCategoriesArray
      .filter(tc => tc.toolId === toolId)
      .map(tc => tc.categoryId);
    
    return Array.from(this.categories.values())
      .filter(category => categoryIds.includes(category.id));
  }

  async getToolTags(toolId: number): Promise<Tag[]> {
    const toolTagsArray = Array.from(this.toolTags.values());
    const tagIds = toolTagsArray
      .filter(tt => tt.toolId === toolId)
      .map(tt => tt.tagId);
    
    return Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
  }

  // Initialize with sample data
  private async initializeData() {
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
  }
}

export const storage = new MemStorage();
