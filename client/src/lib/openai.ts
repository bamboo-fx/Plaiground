import { PerplexityResponse } from '@shared/schema';
import { apiRequest } from './queryClient';

export async function searchWithOpenAI(query: string): Promise<PerplexityResponse> {
  if (!query.trim()) {
    throw new Error('Search query cannot be empty');
  }
  
  try {
    const response = await apiRequest('POST', '/api/search', { query });
    return await response.json();
  } catch (error) {
    console.error('OpenAI search failed:', error);
    throw new Error('Failed to search for AI tools. Please try again.');
  }
}