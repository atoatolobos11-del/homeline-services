import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShoppingCart } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Toast from '../ui/Toast';
import { useCart } from '../../hooks/useCart';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);

  const getBadgeVariant = (badge) => {
    if (!badge) return 'default';
    const lowerBadge = badge.toLowerCase();
    if (lowerBadge.includes('promo')) return 'promotion';
    if (lowerBadge.includes('new')) return 'new';
    if (lowerBadge.includes('favorite')) return 'favorite';
    return 'default';
  };

  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <div className="group min-w-0 overflow-hidden rounded-[28px] border border-[#d9d1c4] bg-[#f8f3ee] shadow-[0_14px_30px_rgba(19,33,29,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-[#7a9b7e] hover:shadow-[0_20px_40px_rgba(19,33,29,0.14)]">
        <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-[#efe4d7] via-[#f5efe8] to-[#e4e5dd]" aria-label={`Customize ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f3d35]/25 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#1a4d2e] shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" title="Eco-friendly pick">
            <Leaf className="h-4 w-4" aria-hidden="true" />
          </div>

          {product.badge && (
            <div className="absolute left-4 top-4">
              <Badge variant={getBadgeVariant(product.badge)}>
                {product.badge}
              </Badge>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="absolute bottom-4 left-4 flex gap-2 rounded-full bg-white/70 px-2 py-1.5 backdrop-blur-sm">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                  style={{
                    backgroundColor:
                      color === 'sage' ? '#7a9b7e' :
                      color === 'cream' ? '#f5f1e8' :
                      color === 'charcoal' ? '#2c2c2c' :
                      color === 'forest' ? '#1a4d2e' :
                      color === 'olive' ? '#697756' :
                      color === 'natural' ? '#d4c4a8' :
                      '#7a9b7e'
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </Link>

        <div className="space-y-3 p-4">
          <div>
            <Link to={`/product/${product.slug}`} className="text-[1.05rem] font-semibold leading-tight text-[#1d2a27] transition-colors hover:text-[#0f3d35]">
              {product.name}
            </Link>
            <p className="mt-1 text-sm text-[#5f6561]">{product.category}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[1.4rem] font-bold text-[#0f3d35]">
              ₱{product.price.toFixed(2)}
            </p>

            <Button
              size="sm"
              onClick={handleAddToCart}
              className="rounded-full bg-[#0f3d35] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d312c]"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast 
          message={`${product.name} added to cart!`}
          type="success"
          onClose={() => setShowToast(false)} 
        />
      )}
    </>
  );
};

export default ProductCard;
