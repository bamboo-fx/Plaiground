import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function Categories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Browse by Category</h2>
          <p className="text-gray-600 text-center mb-10">Find AI tools specialized for your specific needs</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-gray-200 animate-pulse rounded-full mb-4"></div>
                <div className="h-5 w-24 mx-auto bg-gray-200 animate-pulse rounded mb-1"></div>
                <div className="h-4 w-32 mx-auto bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
          <p className="text-red-500">Failed to load categories. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Browse by Category</h2>
        <p className="text-gray-600 text-center mb-10">Find AI tools specialized for your specific needs</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((category) => (
            <a href="#" key={category.id} className="group">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group-hover:border-primary-500">
                <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <i className={`fas ${category.icon} text-primary-600 text-xl`}></i>
                </div>
                <h3 className="font-bold mb-1">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <a href="#" className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
            View All Categories
            <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
