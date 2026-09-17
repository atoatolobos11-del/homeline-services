import { useState } from 'react';
import Button from '../ui/Button';
import { Mail } from 'lucide-react';
import Toast from '../ui/Toast';

const SustainabilityCTA = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setToastMessage('Successfully subscribed to our newsletter!');
      setShowToast(true);
      setEmail('');
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setToastMessage('Please enter a valid email address');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              A greener kitchen starts with{' '}
              <span className="font-serif italic">everyday choices</span>
            </h2>
            <p className="text-cream/90 text-lg leading-relaxed">
              Join our community and get tips, recipes, and exclusive offers 
              delivered to your inbox. Together, we're building a more sustainable future.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-cream"
                  required
                />
              </div>
              <Button type="submit" className="bg-cream text-primary hover:bg-white whitespace-nowrap">
                Get Started
              </Button>
            </form>
          </div>

          {/* Right Image */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/30 to-accent/30 aspect-[4/3]">
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&h=750&fit=crop&q=80" 
              alt="Sustainable kitchen essentials"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {showToast && (
        <Toast 
          message={toastMessage} 
          type={email.includes('@') ? 'success' : 'error'}
          onClose={() => setShowToast(false)} 
        />
      )}
    </section>
  );
};

export default SustainabilityCTA;
