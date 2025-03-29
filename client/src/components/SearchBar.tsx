import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface SearchBarProps {
  initialQuery?: string;
  compact?: boolean;
}

export default function SearchBar({ initialQuery = '', compact = false }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Popular searches as suggestions
  const popularSearches = [
    "Generate realistic images from text prompts",
    "Transcribe audio to text",
    "Create professional email templates",
    "Summarize long articles"
  ];
  
  useEffect(() => {
    // Handle clicks outside of suggestions box to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setLocation(`/search?q=${encodeURIComponent(suggestion)}`);
  };
  
  return (
    <div className={`${compact ? 'max-w-2xl' : 'max-w-3xl'} mx-auto relative`}>
      <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all">
        <input 
          type="text" 
          id="search-input" 
          ref={searchInputRef}
          placeholder="What do you want to achieve with AI? (e.g., 'generate images from text')" 
          className="w-full px-5 py-4 text-gray-700 bg-transparent border-none focus:outline-none text-lg"
          value={searchQuery}
          onChange={handleSearchInput}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
        <button 
          id="search-button" 
          className="px-6 py-4 bg-primary-600 text-white font-medium rounded-r-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={handleSearch}
        >
          <i className="fas fa-search mr-2"></i>
          Search
        </button>
      </div>
      
      {/* Search suggestions dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-1">Popular searches</div>
            {popularSearches.map((search, index) => (
              <div 
                key={index}
                className="px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center"
                onClick={() => handleSuggestionClick(search)}
              >
                <i className="fas fa-search text-gray-400 mr-3"></i>
                <span>{search}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
