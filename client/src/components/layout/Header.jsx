import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Eye, EyeOff } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import Button from '../ui/Button';
import CartSidebar from './CartSidebar';
import { useShopData } from '../../context/DataContext';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPeso } from '../../utils/stock';
import { ADMIN_EMAIL, hasAdminToken } from '../../utils/api';
import {
  AUTH_EVENT,
  checkCredentials,
  signOutUser,
  normalizeEmail,
  registerUser,
  requestPasswordReset,
  factoryResetLocalData,
  getCurrentUser,
} from '../../utils/auth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalNotice, setModalNotice] = useState(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  // Forgot password sends a Supabase recovery email — the link returns to
  // /login?recovery=1, where the new password is set.
  const [resetEmail, setResetEmail] = useState('');
  const { cartCount } = useCart();
  const { products = [] } = useShopData();
  // Reactive auth state: the old direct localStorage read never re-rendered
  // on login/logout, so the header showed the wrong account until refresh.
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());

  useEffect(() => {
    const sync = () => setCurrentUserState(getCurrentUser());
    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setModalError(null);
    setModalNotice(null);
    setLoginOpen(true);
  };

  // Shows the Inventory link only to the admin: either the signed-in admin
  // account or a browser holding a valid admin session token. Shoppers never
  // see it. This is navigation convenience only — the server rejects admin
  // API calls without the token, so hiding this link protects nothing on its
  // own (see AdminGate + /api/admin/session).
  const currentUserIsAdmin =
    hasAdminToken() ||
    String(currentUser?.email || '').toLowerCase() === String(ADMIN_EMAIL || '').toLowerCase();

  // --- Debounced product search -------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(searchQuery.trim(), 300);

  const matchesSearch = (product, q) =>
    product.name.toLowerCase().includes(q) ||
    (product.category || '').toLowerCase().includes(q) ||
    (product.sku || '').toLowerCase().includes(q);

  const searchResults = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return [];
    return products.filter((p) => matchesSearch(p, q)).slice(0, 6);
  }, [products, debouncedQuery]);

  const searchTotal = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return 0;
    return products.filter((p) => matchesSearch(p, q)).length;
  }, [products, debouncedQuery]);

  const isSearching = searchQuery.trim() !== debouncedQuery;

  // Close the dropdown when clicking anywhere outside the search box.
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocus(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSearch = (q) => {
    setSearchQuery('');
    setSearchFocus(false);
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const navLinks = [
    { name: 'Shop', href: '/catalog' },
    { name: 'Bestsellers', href: '/bestsellers' },
    { name: 'Categories', href: '/categories' },
    ...(currentUserIsAdmin ? [{ name: 'Inventory', href: '/inventory' }] : []),
    { name: 'About', href: '/about' }
  ];

  // Which nav section are we currently in? Shop covers /catalog, /shop and
  // product pages; the others match their own route.
  const getActiveSection = (href) => {
    const path = location.pathname;
    if (href === '/catalog') {
      return path === '/catalog' || path.startsWith('/shop') || path.startsWith('/product/');
    }
    return path.startsWith(href);
  };

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalNotice(null);
    const name = registerForm.name.trim();
    const email = normalizeEmail(registerForm.email);
    if (!name || !email || !registerForm.password) {
      setModalError('Fill in your name, email, and password.');
      return;
    }
    if (registerForm.password.length < 6) {
      setModalError('Password must be at least 6 characters.');
      return;
    }
    setModalBusy(true);
    const result = await registerUser({ name, email, password: registerForm.password });
    setModalBusy(false);
    if (result.error) {
      // "Already exists" arrives as an error — bounce to login instead.
      if (/already exists/i.test(result.error)) {
        setAuthMode('login');
        setLoginForm({ email, password: '' });
      }
      setModalError(result.error);
      return;
    }
    setRegisterForm({ name: '', email: '', password: '' });
    if (result.needsConfirmation) {
      // Supabase "Confirm email" is ON: no session until the inbox link is clicked.
      setAuthMode('login');
      setLoginForm({ email, password: '' });
      setModalNotice('Account created — click the confirmation link in your inbox, then log in.');
      return;
    }
    // Session started immediately; the AUTH_EVENT listener updates the header.
    setLoginOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalNotice(null);
    if (!loginForm.email || !loginForm.password) {
      setModalError('Enter your email and password.');
      return;
    }
    setModalBusy(true);
    const result = await checkCredentials(loginForm.email, loginForm.password);
    setModalBusy(false);
    if (result.error) {
      setModalError(result.error);
      return;
    }
    setLoginOpen(false);
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '' });
    // Stay where the shopper already is — the old code always dumped them on
    // /shop, even mid-checkout.
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalNotice(null);
    const email = normalizeEmail(resetEmail);
    if (!email) {
      setModalError('Enter the email you registered with.');
      return;
    }
    setModalBusy(true);
    const result = await requestPasswordReset(email);
    setModalBusy(false);
    if (result.error) {
      setModalError(result.error);
      return;
    }
    // Supabase never reveals whether the address exists — same message either way.
    setModalNotice('If that email has an account, a reset link is on its way. It opens here so you can set a new password.');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo-mark-circle.svg"
                alt="Homeline logo"
                width={36}
                height={36}
                className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-serif font-bold text-primary">Homeline</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex shrink-0 items-center gap-8">
            {navLinks.map((link) => {
              const isActive = getActiveSection(link.href);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`border-b-2 pb-0.5 transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'border-primary font-semibold text-primary'
                      : 'border-transparent text-charcoal hover:text-primary'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocus(true);
                }}
                onFocus={() => setSearchFocus(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && debouncedQuery) {
                    goToSearch(debouncedQuery);
                  }
                  if (e.key === 'Escape') {
                    setSearchFocus(false);
                    setSearchQuery('');
                  }
                }}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full pl-12 pr-10 py-2.5 rounded-full border border-beige bg-white focus:outline-none focus:border-primary transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:bg-beige"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Live results dropdown */}
              {searchFocus && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-beige bg-white shadow-xl">
                  <div className="max-h-96 overflow-y-auto py-2">
                    {isSearching ? (
                      <p className="px-4 py-3 text-sm text-muted">Searching…</p>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((product) => (
                          <button
                            key={product.id || product.slug}
                            type="button"
                            onClick={() => {
                              navigate(`/product/${product.slug}`);
                              setSearchQuery('');
                              setSearchFocus(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-primary/5"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-11 w-11 shrink-0 rounded-lg object-cover"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-charcoal">
                                {product.name}
                              </span>
                              <span className="block text-xs text-muted">{product.category}</span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-primary">
                              {formatPeso(product.price)}
                            </span>
                          </button>
                        ))}
                        {searchTotal > searchResults.length && (
                          <button
                            type="button"
                            onClick={() => goToSearch(debouncedQuery)}
                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                          >
                            See all {searchTotal} results
                            <span aria-hidden>→</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="px-4 py-3 text-sm text-muted">
                        No products match “{debouncedQuery}”.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button 
              className="lg:hidden p-2 hover:bg-beige rounded-full transition-colors"
              aria-label="Search"
              onClick={() => navigate('/shop')}
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
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <button 
                className="hidden md:block p-2 hover:bg-beige rounded-full transition-colors"
                aria-label="Account"
                onClick={() => openAuth('login')}
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
              {navLinks.map((link) => {
                const isActive = getActiveSection(link.href);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`border-l-4 py-2 pl-3 transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? 'border-primary font-semibold text-primary'
                        : 'border-transparent text-charcoal hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
              {/* Account actions: the desktop icon buttons are hidden on mobile,
                  so without these there is no way to sign in from a phone. */}
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                    className="border-l-4 border-transparent py-2 pl-3 text-left text-charcoal hover:text-primary"
                  >
                    Profile ({currentUser.name.split(' ')[0]})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="border-l-4 border-transparent py-2 pl-3 text-left text-charcoal hover:text-primary"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); openAuth('login'); }}
                  className="border-l-4 border-transparent py-2 pl-3 text-left font-semibold text-primary"
                >
                  Log in / Register
                </button>
              )}
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
                {authMode === 'register' ? 'Create account' : authMode === 'forgot' ? 'Reset password' : 'Log in'}
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

            {modalError && (
              <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {modalError}
              </p>
            )}
            {modalNotice && (
              <p role="status" className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {modalNotice}
              </p>
            )}

            {authMode === 'forgot' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-sm text-muted">
                  Enter the email you registered with. If it has an account, a reset link is on its way — it opens here so you can set a new password.
                </p>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={modalBusy}>
                  {modalBusy ? 'Sending…' : 'Send reset link'}
                </Button>
                <p className="text-center text-sm text-muted">
                  <button
                    type="button"
                    className="font-semibold text-primary hover:text-primary-dark"
                    onClick={() => { setAuthMode('login'); setModalError(null); }}
                  >
                    Back to log in
                  </button>
                </p>
              </form>
            ) : authMode === 'register' ? (
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

                <Button type="submit" size="lg" className="w-full" disabled={modalBusy}>
                  {modalBusy ? 'Creating…' : 'Register'}
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

                <div className="flex items-center justify-end text-sm text-muted">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setModalError(null); setModalNotice(null); }}
                    className="font-medium text-primary hover:text-primary-dark hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={modalBusy}>
                  {modalBusy ? 'Logging in…' : 'Log In'}
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
                <p className="text-center text-xs text-muted">
                  <button
                    type="button"
                    onClick={async () => { await factoryResetLocalData(); window.location.reload(); }}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Start fresh — remove all accounts on this device
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
