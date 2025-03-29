import OpenAI from "openai";
import { Tool } from "../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Process search query using OpenAI API to find relevant AI tools
 */
export async function processSearchQuery(
  query: string,
  availableTools: Tool[]
): Promise<{
  tools: Tool[];
  context: {
    heading: string;
    description: string;
  };
}> {
  try {
    // Prepare the tools data for the prompt
    const toolsData = availableTools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      companyName: tool.companyName,
      pricing: tool.pricing,
    }));
    
    // Build the prompt for OpenAI
    const prompt = `
I want you to act as an AI tool recommendation engine. 
Given a user query about what they want to achieve with AI, recommend the most relevant AI tools from the provided list.

USER QUERY: "${query}"

AVAILABLE TOOLS:
${JSON.stringify(toolsData, null, 2)}

Please analyze the user's query and provide a list of the most relevant tools from the available tools.
Return your response as a JSON object with the following structure:
{
  "tools": [Array of tool IDs that are most relevant, with the most relevant first],
  "context": {
    "heading": "A short, catchy heading summarizing the user's need",
    "description": "A 1-2 sentence description explaining what the user is looking for and how AI can help"
  }
}

Only include tools that are truly relevant to the user's query. If none of the tools match the query well, return an empty array for "tools".
Limit your response to at most 5 relevant tools.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    const parsedResponse = JSON.parse(content);
    
    // Map the tool IDs to the full tool objects
    const toolIdMap = new Map(availableTools.map(tool => [tool.id, tool]));
    const recommendedTools = parsedResponse.tools
      .map((id: number) => toolIdMap.get(id))
      .filter(Boolean); // Remove any undefined entries
    
    return {
      tools: recommendedTools,
      context: parsedResponse.context,
    };
  } catch (err) {
    const error = err as Error;
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to process search query: ${error.message || 'Unknown error'}`);
  }
}