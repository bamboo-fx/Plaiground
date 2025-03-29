import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SearchLoading from "@/components/SearchLoading";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { searchWithOpenAI } from "@/lib/openai";
import { PerplexityResponse } from "@shared/schema";

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const query = params.get("q") || "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PerplexityResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!query) {
      setLocation("/");
      return;
    }

    const performSearch = async () => {
      try {
        setIsLoading(true);
        
        const data = await searchWithOpenAI(query);
        setSearchResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        toast({
          title: "Search Error",
          description: "Failed to search for AI tools. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, setLocation, toast]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      
      {/* Search Bar Section (smaller than home) */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <SearchBar initialQuery={query} compact={true} />
        </div>
      </section>
      
      {isLoading ? (
        <SearchLoading />
      ) : searchResults ? (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Search context */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{searchResults.context.heading}</h2>
              <p className="text-gray-600">{searchResults.context.description}</p>
            </div>

            {/* Results grid */}
            {searchResults.tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No AI tools found</h3>
                <p className="text-gray-600">Try a different search term or browse our categories.</p>
              </div>
            )}
            
            {searchResults.tools.length > 0 && (
              <div className="mt-8 text-center">
                <button 
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "This feature is under development.",
                    });
                  }}
                >
                  Load More Results
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Enter a search term to find AI tools.</p>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
