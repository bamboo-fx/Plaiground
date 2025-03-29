import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';

export default function Footer() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const categoryLinks = categories?.slice(0, 6) || [];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and about */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 flex items-center justify-center">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">AIToolFinder</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Finding the perfect AI tool for any task, powered by AI.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
          
          {/* Column 2: Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {categoryLinks.map(category => (
                <li key={category.id}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {category.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  View All Categories
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">For Developers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Add Your Tool</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Column 4: Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Data Processing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Accessibility</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AIToolFinder. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">English</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Español</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Français</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Deutsch</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
