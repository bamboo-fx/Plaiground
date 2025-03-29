import { useState } from 'react';
import { Link } from 'wouter';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 flex items-center justify-center">
            <i className="fas fa-robot text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">AIToolFinder</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium">Home</Link>
          <Link href="#" className="text-gray-600 hover:text-primary-600 font-medium">Browse</Link>
          <Link href="#" className="text-gray-600 hover:text-primary-600 font-medium">Categories</Link>
          <Link href="#" className="text-gray-600 hover:text-primary-600 font-medium">About</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="hidden md:block px-4 py-2 text-primary-600 font-medium border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">Sign In</button>
          <button className="hidden md:block px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">Sign Up</button>
          <button 
            className="md:hidden text-gray-600" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-3 space-y-3 bg-white border-t border-gray-200">
            <Link href="/" className="block text-gray-600 font-medium">Home</Link>
            <Link href="#" className="block text-gray-600 font-medium">Browse</Link>
            <Link href="#" className="block text-gray-600 font-medium">Categories</Link>
            <Link href="#" className="block text-gray-600 font-medium">About</Link>
            <div className="flex space-x-2 pt-2">
              <button className="flex-1 px-4 py-2 text-primary-600 font-medium border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">Sign In</button>
              <button className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">Sign Up</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
