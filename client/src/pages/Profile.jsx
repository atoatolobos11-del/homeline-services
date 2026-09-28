import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader, RefreshCw, Package } from 'lucide-react';
import { useShopData } from '../context/DataContext';
import { useCart } from '../hooks/useCart';
import { formatPeso, formatDateTime } from '../utils/stock';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const statusBadge = (status) => {
  switch (status) {
    case 'cancelled':
      return 'bg-red-50 text-red-600';
    case 'delivered':
      return 'bg-green-50 text-green-700';
    case 'shipped':
      return 'bg-purple-50 text-purple-700';
    case 'confirmed':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-amber-50 text-amber-700';
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('homelineCurrentUser') || 'null');
  const { products } = useShopData();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    fetch(`${apiBase}/orders`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load your orders');
        return res.json();
      })
      .then((result) => {
        if (!cancelled) setOrders(result.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setOrderError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const myOrders = useMemo(() => {
    if (!orders || !currentUser) return [];
    const email = (currentUser.email || '').toLowerCase().trim();
    const name = (currentUser.name || '').toLowerCase().trim();
    return orders
      .filter((order) => {
        const orderEmail = (order.customerEmail || '').toLowerCase().trim();
        const orderName = (order.customerName || '').toLowerCase().trim();
        return (
          (email && orderEmail === email) || (!email && orderName === name)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('homelineCurrentUser');
    window.location.href = '/';
  };

  const handleBuyAgain = async (order) => {
    setReordering(true);
    try {
      for (const item of order.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (product) addToCart(product, item.quantity);
      }
    } finally {
      setReordering(false);
      navigate('/cart');
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-charcoal">Please sign in</h1>
          <p className="mt-3 text-muted">You need an account before viewing your profile.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-dark"
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Profile</p>
            <h1 className="mt-2 text-4xl font-bold text-charcoal">{currentUser.name}</h1>
            {currentUser.email && <p className="mt-1 text-sm text-muted">{currentUser.email}</p>}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-primary px-5 py-2.5 font-medium text-primary transition hover:bg-primary hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>

      {/* My Orders */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-charcoal">My Orders</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Below are the orders you placed with the email {currentUser.email || 'you used to sign up'}.
        </p>

        {orderError && (
          <p className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {orderError} — remember: use the same email at checkout and login so they appear here.
          </p>
        )}

        {!orders && !orderError && (
          <div className="mt-5 flex items-center gap-3 rounded-3xl border border-beige bg-white px-6 py-12 text-muted">
            <Loader className="h-5 w-5 animate-spin" /> Loading your orders…
          </div>
        )}

        {orders && myOrders.length === 0 && (
          <div className="mt-5 rounded-3xl border border-dashed border-beige bg-white px-6 py-14 text-center">
            <Package className="mx-auto h-10 w-10 text-beige" />
            <p className="mt-4 font-semibold text-charcoal">No orders yet</p>
            <p className="mt-1 text-sm text-muted">
              Once you place an order with this email, your order history will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary-dark"
            >
              Start shopping
            </button>
          </div>
        )}

        {orders && myOrders.length > 0 && (
          <div className="mt-5 space-y-5">
            {myOrders.map((order) => (
              <div key={order.orderNumber} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-primary">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-charcoal">{formatPeso(order.total)}</span>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-beige/60">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-charcoal">{item.productName}</p>
                        <p className="text-xs text-muted">
                          ₱{Number(item.unitPrice).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-charcoal">
                        ₱{Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyAgain(order)}
                  disabled={reordering}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-95 disabled:opacity-50"
                >
                  {reordering ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Buy again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;