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
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ProductDetail from './pages/ProductDetail'
import HelpChatbot from './components/ui/HelpChatbot'

function AppLayout({ currentUser }) {
  const location = useLocation();

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
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/cart" element={currentUser ? <Cart /> : <Navigate to="/login" replace />} />
          <Route path="/checkout" element={currentUser ? <Checkout /> : <Navigate to="/login" replace />} />
          <Route path="/product/:slug" element={currentUser ? <ProductDetail /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      {location.pathname === '/about' && <Footer />}
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
