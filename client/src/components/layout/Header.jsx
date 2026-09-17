import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Eye, EyeOff } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import Button from '../ui/Button';
import CartSidebar from './CartSidebar';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const { cartCount } = useCart();
  const currentUser = JSON.parse(localStorage.getItem('homelineCurrentUser') || 'null');

  const navLinks = [
    { name: 'Shop', href: '/catalog' },
    { name: 'Bestsellers', href: '/bestsellers' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate(href);
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('homelineUsers') || '[]');
    const existingUser = users.some((user) => user.email === registerForm.email);

    if (existingUser) {
      alert('An account with this email already exists. Please log in instead.');
      setAuthMode('login');
      return;
    }

    users.push({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password
    });

    localStorage.setItem('homelineUsers', JSON.stringify(users));
    setAuthMode('login');
    setLoginForm({ email: registerForm.email, password: '' });
    setRegisterForm({ name: '', email: '', password: '' });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('homelineUsers') || '[]');
    const matchedUser = users.find(
      (user) => user.email === loginForm.email && user.password === loginForm.password
    );

    if (!matchedUser) {
      alert('No account found. Please register first.');
      setAuthMode('register');
      return;
    }

    localStorage.setItem('homelineCurrentUser', JSON.stringify({
      name: matchedUser.name,
      email: matchedUser.email
    }));

    setLoginOpen(false);
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '' });
    navigate('/shop');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <a href="/" className="text-2xl font-serif font-bold text-primary">
              Homeline
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex shrink-0 items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-charcoal hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-2.5 rounded-full border border-beige bg-white focus:outline-none focus:border-primary transition-colors"
                onFocus={() => setSearchOpen(true)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button 
              className="lg:hidden p-2 hover:bg-beige rounded-full transition-colors"
              aria-label="Search"
              onClick={() => alert('Search functionality coming soon!')}
            >
              <Search className="w-5 h-5 text-charcoal" />
            </button>

            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="hidden md:inline-flex items-center gap-2 rounded-full border border-beige bg-white px-3 py-2 text-sm font-medium text-charcoal transition hover:border-primary hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  {currentUser.name.split(' ')[0]}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('homelineCurrentUser');
                    window.location.href = '/';
                  }}
                  className="hidden md:inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <button 
                className="hidden md:block p-2 hover:bg-beige rounded-full transition-colors"
                aria-label="Account"
                onClick={() => setLoginOpen(true)}
              >
                <User className="w-5 h-5 text-charcoal" />
              </button>
            )}

            {/* Cart Icon */}
            <button 
              className="relative p-2 hover:bg-beige rounded-full transition-colors"
              aria-label="Shopping bag"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="w-5 h-5 text-charcoal" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-beige rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-charcoal" />
              ) : (
                <Menu className="w-6 h-6 text-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-beige">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-charcoal hover:text-primary transition-colors duration-200 py-2 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {loginOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLoginOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl mx-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">
                {authMode === 'register' ? 'Create account' : 'Log in'}
              </h2>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="rounded-full p-2 hover:bg-beige transition-colors"
                aria-label="Close login form"
              >
                <X className="h-5 w-5 text-charcoal" />
              </button>
            </div>

            {authMode === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterInputChange}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterInputChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterInputChange}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-beige px-4 py-3 pr-11 focus:border-primary focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Register
                </Button>

                <p className="text-center text-sm text-muted">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:text-primary-dark"
                    onClick={() => setAuthMode('login')}
                  >
                    Log in
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginInputChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginInputChange}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-beige px-4 py-3 pr-11 focus:border-primary focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-beige" />
                    Remember me
                  </label>
                  <button type="button" className="text-primary hover:text-primary-dark">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Log In
                </Button>

                <p className="text-center text-sm text-muted">
                  New here?{' '}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:text-primary-dark"
                    onClick={() => setAuthMode('register')}
                  >
                    Create account
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Header;
