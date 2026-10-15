import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { AUTH_EVENT, getCurrentUser, isAuthReady } from './utils/auth'
import Home from './pages/Home'
import Login from './pages/Login'
import Shop from './pages/Shop'
import Catalog from './pages/Catalog'
import BestsellersPage from './pages/BestsellersPage'
import CategoriesPage from './pages/CategoriesPage'
import AboutPage from './pages/AboutPage'
import SustainabilityPage from './pages/SustainabilityPage'
import JournalPage from './pages/JournalPage'
import CareersPage from './pages/CareersPage'
import ContactPage from './pages/ContactPage'
import ShippingPage from './pages/ShippingPage'
import ReturnsPage from './pages/ReturnsPage'
import FaqPage from './pages/FaqPage'
import Profile from './pages/Profile'
import Inventory from './pages/Inventory'
import AdminGate from './components/inventory/AdminGate'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import ProductDetail from './pages/ProductDetail'
import HelpChatbot from './components/ui/HelpChatbot'

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Admin gate. The former check was `currentUser.email === 'admin@homeline.ph'`
// read from localStorage, which anyone could set from devtools. AdminGate now
// asks for a password and keeps the signed token the server issues; the server
// rejects admin API calls without it. The localStorage user still decides who
// gets past the outer route gate, but that is convenience, not security.

function AppLayout({ currentUser }) {
  const location = useLocation();
  const [authLoaded, setAuthLoaded] = useState(isAuthReady());
  // Remember where a logged-out visitor was headed so login can send them
  // back instead of dropping them on a fixed page.
  const loginRedirect = (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );

  useEffect(() => {
    const syncReady = () => setAuthLoaded(isAuthReady());
    window.addEventListener(AUTH_EVENT, syncReady);
    return () => window.removeEventListener(AUTH_EVENT, syncReady);
  }, []);

  // The persisted session loads asynchronously — hold the splash screen until
  // then so protected routes don't flash-redirect on refresh.
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-muted">Loading Homeline…</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route path="/login" element={<Login />} />
          {/* Storefront browsing is public — anyone can view products without an
              account. Login is only required for personal data (profile),
              checkout, and the admin dashboard. */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/bestsellers" element={<BestsellersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/profile" element={currentUser ? <Profile /> : loginRedirect} />
          <Route
            path="/inventory"
            element={currentUser ? <AdminGate><Inventory /></AdminGate> : loginRedirect}
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order" element={<OrderStatus />} />
          <Route path="/order/:orderNumber" element={<OrderStatus />} />
        </Routes>
      </main>
      <ScrollToTop />
      <Footer />
      <HelpChatbot />
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    const syncCurrentUser = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('storage', syncCurrentUser);
    window.addEventListener(AUTH_EVENT, syncCurrentUser);

    return () => {
      window.removeEventListener('storage', syncCurrentUser);
      window.removeEventListener(AUTH_EVENT, syncCurrentUser);
    };
  }, []);

  return (
    <Router>
      <AppLayout currentUser={currentUser} />
    </Router>
  )
}

export default App
