import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useCart } from '../hooks/useCart';
import { products } from '../data/products';

const sizeOptions = ['Small', 'Medium', 'Large'];

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find((item) => item.slug === slug);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Natural');
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-charcoal">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-medium text-white">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const customizedProduct = {
      ...product,
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      baseProductId: product.id,
      selectedColor,
      selectedSize
    };

    for (let index = 0; index < quantity; index += 1) {
      addToCart(customizedProduct);
    }
    setShowToast(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-[2rem] border border-beige bg-cream shadow-lg">
          <img src={product.image} alt={product.name} className="aspect-square h-full w-full object-cover" />
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{product.category}</p>
          <h1 className="mt-3 text-4xl font-bold text-charcoal">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-primary">₱{product.price.toFixed(2)}</p>
          <p className="mt-5 leading-7 text-muted">{product.description}</p>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-charcoal">Choose a color</p>
            <div className="flex flex-wrap gap-2">
              {(product.colors?.length ? product.colors : ['Natural']).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full border px-4 py-2 text-sm capitalize transition ${selectedColor === color ? 'border-primary bg-primary text-white' : 'border-beige bg-cream text-charcoal hover:border-primary'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-charcoal">Choose a size</p>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-beige bg-white text-charcoal hover:border-primary'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-beige px-4 py-2">
            <span className="text-sm font-semibold text-charcoal">Quantity</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity" className="rounded-full p-2 text-primary transition hover:bg-cream">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-5 text-center font-semibold">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity" className="rounded-full p-2 text-primary transition hover:bg-cream">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button type="button" size="lg" className="mt-8 w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add customized item
          </Button>
        </div>
      </div>

      {showToast && (
        <Toast message={`${product.name} added with ${selectedColor} / ${selectedSize}`} type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
