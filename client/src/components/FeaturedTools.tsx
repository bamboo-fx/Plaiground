import { useQuery } from "@tanstack/react-query";
import { Tool } from "@shared/schema";
import ToolCard from "./ToolCard";

export default function FeaturedTools() {
  const { data: featuredTools, isLoading, error } = useQuery<Tool[]>({
    queryKey: ['/api/tools/featured'],
  });

  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Featured AI Tools</h2>
          <p className="text-gray-600 text-center mb-10">Discover top-rated AI tools for various tasks</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-md mr-2"></div>
                    <div>
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Featured AI Tools</h2>
          <p className="text-red-500">Failed to load featured tools. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Featured AI Tools</h2>
        <p className="text-gray-600 text-center mb-10">Discover top-rated AI tools for various tasks</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTools?.map((tool) => (
            <div key={tool.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="relative h-40 bg-gray-100">
                <img 
                  src={tool.imageUrl} 
                  alt={`${tool.name} example`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-accent-500 bg-opacity-90 rounded-lg px-2 py-1 text-xs font-medium text-white">
                  Featured
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden mr-2 flex-shrink-0">
                    <img 
                      src={tool.logoUrl} 
                      alt={`${tool.name} logo`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{tool.name}</h3>
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-1">{tool.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const rating = parseFloat(tool.rating);
                          if (i < Math.floor(rating)) {
                            return <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>;
                          } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                            return <i key={i} className="fas fa-star-half-alt text-yellow-400 text-xs"></i>;
                          } else {
                            return <i key={i} className="far fa-star text-yellow-400 text-xs"></i>;
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {tool.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{tool.pricing}</span>
                  <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors">
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
