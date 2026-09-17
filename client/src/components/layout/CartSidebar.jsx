import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../ui/Button';

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-beige">
          <h2 className="text-2xl font-bold text-charcoal">
            Shopping Cart ({cartCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-charcoal" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-280px)]">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg mb-4">Your cart is empty</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-cream rounded-xl">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted">₱{item.price.toFixed(2)}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-beige rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-beige rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-beige p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-charcoal">Total:</span>
              <span className="font-bold text-primary text-2xl">
                ₱{cartTotal.toFixed(2)}
              </span>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
