import { Tool } from "@shared/schema";

interface ToolCardProps {
  tool: Tool & {
    categories?: string[];
    tags?: string[];
  };
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={tool.imageUrl} 
          alt={`${tool.name} example image`} 
          className="w-full h-full object-cover"
        />
        {tool.featured && (
          <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 border border-primary-100">
            Popular
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
              <img 
                src={tool.logoUrl} 
                alt={`${tool.name} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{tool.name}</h3>
              <p className="text-sm text-gray-500">by {tool.companyName}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium text-sm mr-1">{tool.rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const rating = parseFloat(tool.rating);
                if (i < Math.floor(rating)) {
                  return <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>;
                } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                  return <i key={i} className="fas fa-star-half-alt text-yellow-400 text-sm"></i>;
                } else {
                  return <i key={i} className="far fa-star text-yellow-400 text-sm"></i>;
                }
              })}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {tool.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tool.categories?.map((category, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
              {category}
            </span>
          ))}
          {tool.tags?.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500">Pricing</span>
            <p className="text-sm font-medium">{tool.pricing}</p>
          </div>
          <a 
            href={tool.websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Tool
          </a>
        </div>
      </div>
    </div>
  );
}
