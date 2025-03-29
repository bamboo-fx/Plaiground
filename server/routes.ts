import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dbStorage } from "./db-storage"; // Import the database storage
import { searchQuerySchema, perplexityResponseSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { processSearchQuery } from "./openai";

// Use database storage instead of memory storage when DATABASE_URL is present
const dataStorage = process.env.DATABASE_URL ? dbStorage : storage;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with sample data if needed
  if (process.env.DATABASE_URL) {
    try {
      await dbStorage.initializeSampleData();
      console.log("Database initialization complete or skipped");
    } catch (error) {
      console.error("Error initializing database with sample data:", error);
    }
  }
  // API routes
  app.get("/api/tools", async (req: Request, res: Response) => {
    try {
      const tools = await dataStorage.getTools();
      
      // If we need categories and tags with each tool
      const toolsWithDetails = await Promise.all(
        tools.map(async (tool) => {
          const categories = await dataStorage.getToolCategories(tool.id);
          const tags = await dataStorage.getToolTags(tool.id);
          return {
            ...tool,
            categories: categories.map(c => c.name),
            tags: tags.map(t => t.name)
          };
        })
      );
      
      res.json(toolsWithDetails);
    } catch (error) {
      console.error("Error getting tools:", error);
      res.status(500).json({ message: "Failed to retrieve tools" });
    }
  });

  app.get("/api/tools/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const featuredTools = await dataStorage.getFeaturedTools(limit);
      
      // Get categories and tags for each tool
      const toolsWithDetails = await Promise.all(
        featuredTools.map(async (tool) => {
          const categories = await dataStorage.getToolCategories(tool.id);
          const tags = await dataStorage.getToolTags(tool.id);
          return {
            ...tool,
            categories: categories.map(c => c.name),
            tags: tags.map(t => t.name)
          };
        })
      );
      
      res.json(toolsWithDetails);
    } catch (error) {
      console.error("Error getting featured tools:", error);
      res.status(500).json({ message: "Failed to retrieve featured tools" });
    }
  });

  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await dataStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });

  app.get("/api/tools/category/:id", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const tools = await dataStorage.getToolsByCategory(categoryId);
      
      // Get categories and tags for each tool
      const toolsWithDetails = await Promise.all(
        tools.map(async (tool) => {
          const categories = await dataStorage.getToolCategories(tool.id);
          const tags = await dataStorage.getToolTags(tool.id);
          return {
            ...tool,
            categories: categories.map(c => c.name),
            tags: tags.map(t => t.name)
          };
        })
      );
      
      res.json(toolsWithDetails);
    } catch (error) {
      console.error("Error getting tools by category:", error);
      res.status(500).json({ message: "Failed to retrieve tools by category" });
    }
  });

  app.post("/api/search", async (req: Request, res: Response) => {
    try {
      // Validate the search query
      const { query } = searchQuerySchema.parse(req.body);
      
      // Get the API key from environment variables
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OpenAI API key is not configured" });
      }

      // Get all tools with their categories and tags
      const allTools = await dataStorage.getTools();
      const toolsWithDetails = await Promise.all(
        allTools.map(async (tool) => {
          const categories = await dataStorage.getToolCategories(tool.id);
          const tags = await dataStorage.getToolTags(tool.id);
          return {
            ...tool,
            categories: categories.map(c => c.name),
            tags: tags.map(t => t.name)
          };
        })
      );

      try {
        // Use OpenAI to process the search query
        const searchResult = await processSearchQuery(query, allTools);
        
        // Add categories and tags to the matched tools
        const searchResultWithDetails = {
          ...searchResult,
          tools: await Promise.all(
            searchResult.tools.map(async (tool) => {
              const categories = await dataStorage.getToolCategories(tool.id);
              const tags = await dataStorage.getToolTags(tool.id);
              return {
                ...tool,
                categories: categories.map(c => c.name),
                tags: tags.map(t => t.name)
              };
            })
          )
        };
        
        // Validate the response against our schema
        const validatedResponse = perplexityResponseSchema.parse(searchResultWithDetails);
        
        res.json(validatedResponse);
      } catch (apiError) {
        console.error("Error calling OpenAI API:", apiError);
        
        // Fallback to basic search if API call fails
        // More sophisticated fallback search
        const searchTerms = query.toLowerCase().split(' ');
        
        // Score tools based on search term matches
        const scoredTools = toolsWithDetails.map(tool => {
          const searchText = `${tool.name} ${tool.description} ${tool.categories?.join(' ')} ${tool.tags?.join(' ')}`.toLowerCase();
          
          // Calculate a score based on how many terms match
          let score = 0;
          for (const term of searchTerms) {
            if (searchText.includes(term)) {
              // Prioritize matches in name and categories
              if (tool.name.toLowerCase().includes(term)) score += 3;
              if (tool.categories?.some(c => c.toLowerCase().includes(term))) score += 2;
              score += 1;
            }
          }
          
          return { tool, score };
        });
        
        // Sort by score and get top results
        const matchedTools = scoredTools
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(item => item.tool);
        
        const fallbackResponse = {
          tools: matchedTools,
          context: {
            heading: `AI Tools for "${query}"`,
            description: `Here are some AI tools that might help you with ${query}. (Using local search - OpenAI API limit reached)`
          }
        };
        
        res.json(fallbackResponse);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error in search endpoint:", error);
        res.status(500).json({ message: "Failed to search for tools" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
