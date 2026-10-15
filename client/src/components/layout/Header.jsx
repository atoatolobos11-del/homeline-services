import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import CartSidebar from './CartSidebar';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useShopData } from '../../context/DataContext';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPeso } from '../../utils/stock';
import { ADMIN_EMAIL, hasAdminToken } from '../../utils/api';
import {
  AUTH_EVENT,
  signOutUser,
  getCurrentUser,
} from '../../utils/auth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await signOutUser();
    navigate('/');
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
                  onClick={() => setShowLogoutConfirm(true)}
                  className="hidden md:inline-flex items-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                className="hidden md:block p-2 hover:bg-beige rounded-full transition-colors"
                aria-label="Account"
                onClick={() => navigate('/login')}
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
                    onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }}
                    className="border-l-4 border-transparent py-2 pl-3 text-left text-charcoal hover:text-primary"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="border-l-4 border-transparent py-2 pl-3 text-left font-semibold text-primary"
                >
                  Log in / Register
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <ConfirmDialog
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
};

export default Header;
