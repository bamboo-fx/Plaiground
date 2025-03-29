import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    // Simulate subscription process
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      toast({
        title: "Subscription Successful",
        description: "Thank you for subscribing to our newsletter!",
      });
    }, 1000);
  };

  return (
    <section className="bg-primary-900 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
        <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
          Subscribe to get notified about new AI tools, features, and exclusive content. Be the first to know about the latest in AI.
        </p>
        
        <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-4 py-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500 border-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="px-5 py-3 bg-accent-500 text-white font-medium rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          <p className="text-primary-300 text-sm mt-3">We respect your privacy. Unsubscribe at any time.</p>
        </form>
      </div>
    </section>
  );
}
