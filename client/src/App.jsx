import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
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

// Admin check helper — only this email gets Inventory access
const isAdmin = (user) => user?.email === 'admin@homeline.ph';

function AppLayout({ currentUser }) {
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
          <Route path="/catalog" element={currentUser ? <Catalog /> : <Navigate to="/login" replace />} />
          <Route path="/shop" element={currentUser ? <Shop /> : <Navigate to="/login" replace />} />
          <Route path="/bestsellers" element={currentUser ? <BestsellersPage /> : <Navigate to="/login" replace />} />
          <Route path="/categories" element={currentUser ? <CategoriesPage /> : <Navigate to="/login" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/inventory" element={currentUser && isAdmin(currentUser) ? <Inventory /> : <Navigate to="/" replace />} />
          <Route path="/cart" element={currentUser ? <Cart /> : <Navigate to="/login" replace />} />
          <Route path="/checkout" element={currentUser ? <Checkout /> : <Navigate to="/login" replace />} />
          <Route path="/order" element={currentUser ? <OrderStatus /> : <Navigate to="/login" replace />} />
          <Route path="/order/:orderNumber" element={currentUser ? <OrderStatus /> : <Navigate to="/login" replace />} />
          <Route path="/product/:slug" element={currentUser ? <ProductDetail /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      <ScrollToTop />
      <Footer />
      <HelpChatbot />
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem('homelineCurrentUser') || 'null')
  );

  useEffect(() => {
    const syncCurrentUser = () => {
      setCurrentUser(JSON.parse(localStorage.getItem('homelineCurrentUser') || 'null'));
    };

    window.addEventListener('storage', syncCurrentUser);
    window.addEventListener('homeline-auth-changed', syncCurrentUser);

    return () => {
      window.removeEventListener('storage', syncCurrentUser);
      window.removeEventListener('homeline-auth-changed', syncCurrentUser);
    };
  }, []);

  return (
    <Router>
      <AppLayout currentUser={currentUser} />
    </Router>
  )
}

export default App
