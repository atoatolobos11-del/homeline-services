import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('homeline-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('homeline-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => {
          if (item.id !== product.id) return item;
          const max = Math.max(1, Number(item.stock) || 1);
          return { ...item, quantity: Math.min(max, item.quantity + quantity) };
        });
      }
      const withDefaults = {
        ...product,
        quantity,
        baseProductId: product.baseProductId || product.id,
      };
      return [...prev, withDefaults];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.id !== productId) return item;
        const max = Math.max(1, Number(item.stock) || 1);
        return { ...item, quantity: Math.min(max, quantity) };
      })
    );
  };

  // Shopee-style: swap the color/size of an item already in the cart.
  // If a line with the new color/size already exists, the quantities merge.
  const updateItemVariant = (itemId, next) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;

      const baseId = item.baseProductId || item.id;
      const color = next.color || item.selectedColor || 'Natural';
      const size = next.size || item.selectedSize || 'Medium';
      const newId = `${baseId}-${color}-${size}`;

      let lines = prev.filter(i => i.id !== itemId);
      const existing = lines.find(i => i.id === newId);
      if (existing) {
        lines = lines.map(i =>
          i.id === newId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        lines.push({ ...item, id: newId, selectedColor: color, selectedSize: size });
      }
      return lines;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemVariant,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
