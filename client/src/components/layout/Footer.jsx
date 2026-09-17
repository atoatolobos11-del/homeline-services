import { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import Toast from '../ui/Toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleNewsletterSubmit = (e) => {
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
  const footerLinks = {
    shop: [
      { name: 'All Products', href: '#products' },
      { name: 'Bestsellers', href: '#bestsellers' },
      { name: 'New Arrivals', href: '#products' },
      { name: 'Collections', href: '#categories' }
    ],
    company: [
      { name: 'About Us', href: '#sustainability' },
      { name: 'Sustainability', href: '#sustainability' },
      { name: 'Journal', href: '#' },
      { name: 'Careers', href: '#' }
    ],
    help: [
      { name: 'Contact', href: '#' },
      { name: 'Shipping', href: '#' },
      { name: 'Returns', href: '#' },
      { name: 'FAQ', href: '#' }
    ]
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    if (href === '#') {
      alert('This page is coming soon!');
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-primary text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">Homeline</h3>
            <p className="text-cream/80 text-sm leading-relaxed">
              Thoughtfully designed, eco-friendly kitchenware for a sustainable home and a greener future.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-cream/80 hover:text-cream text-sm transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-cream/80 hover:text-cream text-sm transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-cream/80 hover:text-cream text-sm transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-cream/20 pt-8 mb-8">
          <div className="max-w-md">
            <h4 className="font-semibold mb-3">Stay Connected</h4>
            <p className="text-cream/80 text-sm mb-4">
              Subscribe for sustainable living tips and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full bg-cream/10 border border-cream/20 text-cream placeholder-cream/50 focus:outline-none focus:border-cream/40"
                required
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-cream text-primary rounded-full hover:bg-cream/90 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/60 text-sm">
            © 2026 Homeline. All rights reserved.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://facebook.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/60 hover:text-cream transition-colors cursor-pointer"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/60 hover:text-cream transition-colors cursor-pointer"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/60 hover:text-cream transition-colors cursor-pointer"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="mailto:contact@homeline.com" 
              className="text-cream/60 hover:text-cream transition-colors cursor-pointer"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
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
    </footer>
  );
};

export default Footer;
