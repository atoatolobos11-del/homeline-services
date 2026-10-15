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
    <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
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
          {/* Whole app requires login — logged-out visitors (including new
              users) are sent to /login first, then returned to where they headed. */}
          <Route path="/" element={currentUser ? <Home /> : loginRedirect} />
          <Route path="/login" element={<Login />} />
          <Route path="/catalog" element={currentUser ? <Catalog /> : loginRedirect} />
          <Route path="/shop" element={currentUser ? <Shop /> : loginRedirect} />
          <Route path="/bestsellers" element={currentUser ? <BestsellersPage /> : loginRedirect} />
          <Route path="/categories" element={currentUser ? <CategoriesPage /> : loginRedirect} />
          <Route path="/about" element={currentUser ? <AboutPage /> : loginRedirect} />
          <Route path="/sustainability" element={currentUser ? <SustainabilityPage /> : loginRedirect} />
          <Route path="/journal" element={currentUser ? <JournalPage /> : loginRedirect} />
          <Route path="/careers" element={currentUser ? <CareersPage /> : loginRedirect} />
          <Route path="/contact" element={currentUser ? <ContactPage /> : loginRedirect} />
          <Route path="/shipping" element={currentUser ? <ShippingPage /> : loginRedirect} />
          <Route path="/returns" element={currentUser ? <ReturnsPage /> : loginRedirect} />
          <Route path="/faq" element={currentUser ? <FaqPage /> : loginRedirect} />
          <Route path="/product/:slug" element={currentUser ? <ProductDetail /> : loginRedirect} />
          <Route path="/profile" element={currentUser ? <Profile /> : loginRedirect} />
          <Route
            path="/inventory"
            element={currentUser ? <AdminGate><Inventory /></AdminGate> : loginRedirect}
          />
          <Route path="/cart" element={currentUser ? <Cart /> : loginRedirect} />
          <Route path="/checkout" element={currentUser ? <Checkout /> : loginRedirect} />
          <Route path="/order" element={currentUser ? <OrderStatus /> : loginRedirect} />
          <Route path="/order/:orderNumber" element={currentUser ? <OrderStatus /> : loginRedirect} />
          <Route path="*" element={currentUser ? <Navigate to="/" replace /> : loginRedirect} />
        </Routes>
      </main>
      <ScrollToTop />
      <Footer />
      {currentUser ? <HelpChatbot /> : null}
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
