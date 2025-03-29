import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FeaturedTools from "@/components/FeaturedTools";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function Home() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const popularCategories = categories?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Find the Perfect AI Tool for Any Task
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Discover AI-powered solutions that automate your workflow and boost productivity, all in one intelligent search platform.
          </p>
          
          <SearchBar />
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <span className="text-gray-500">Popular categories:</span>
            {popularCategories.map((category) => (
              <a 
                key={category.id}
                href="#" 
                className="text-primary-600 hover:text-primary-800 hover:underline"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </section>
      
      <FeaturedTools />
      <Categories />
      <HowItWorks />
      <Newsletter />
      <Footer />
    </div>
  );
}
