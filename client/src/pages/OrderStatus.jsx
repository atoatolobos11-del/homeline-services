import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PackageSearch, Search, Loader, CheckCircle2, XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatPeso, formatDateTime } from '../utils/stock';
import { fetchOrder, cancelOrder } from '../utils/orders';

const statusStyles = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const OrderStatus = () => {
  const { orderNumber: routeOrderNumber } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const loadOrder = async (number) => {
    const value = String(number || '').trim().toUpperCase();
    if (!value) {
      setError('Enter your order number first.');
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const result = await fetchOrder(value);
      setOrder(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeOrderNumber) loadOrder(routeOrderNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeOrderNumber]);

  const handleLookup = (e) => {
    e.preventDefault();
    loadOrder(input);
  };

  const handleCancel = async () => {
    setBusy(true);
    setCancelError(null);
    try {
      await cancelOrder(order.orderNumber);
      const freshOrder = await fetchOrder(order.orderNumber);
      setOrder(freshOrder);
      setShowConfirm(false);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary transition hover:text-primary-dark"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
            <PackageSearch className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal">Track / Cancel Order</h1>
          <p className="mt-2 text-muted">
            Enter your order number (e.g. HML-20260928-1234) to see its details.
          </p>
        </div>

        {/* Lookup form — always available */}
        <form onSubmit={handleLookup} className="mb-8 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={routeOrderNumber || 'Order number, e.g. HML-20260928-1234'}
            className="w-full rounded-2xl border border-beige bg-white px-5 py-3.5 text-sm focus:border-primary focus:outline-none"
          />
          <Button type="submit" variant="primary">
            <Search className="mr-2 h-4 w-4" /> Find
          </Button>
        </form>

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-beige bg-white py-16 text-muted">
            <Loader className="h-5 w-5 animate-spin" /> Loading order…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-600">
            {error}
          </div>
        )}

        {order && !loading && (
          <div className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-beige pb-4">
              <div>
                <p className="text-sm text-muted">Order number</p>
                <p className="text-lg font-bold tracking-wide text-charcoal">{order.orderNumber}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isCancelled ? statusStyles.cancelled : statusStyles.completed
                }`}
              >
                {isCancelled ? 'Cancelled' : 'Completed'}
              </span>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-2 py-4 text-sm">
              <div>
                <dt className="text-muted">Placed on</dt>
                <dd className="font-semibold text-charcoal">{formatDateTime(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Customer</dt>
                <dd className="font-semibold text-charcoal">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-muted">Total paid</dt>
                <dd className="font-semibold text-primary">{formatPeso(order.total)}</dd>
              </div>
            </dl>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-beige bg-cream p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{item.productName}</p>
                      <p className="text-xs text-muted">Qty {item.quantity} · {formatPeso(item.unitPrice)} each</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-charcoal">{formatPeso(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {/* Cancel area */}
            {!isCancelled ? (
              <div className="mt-6 border-t border-beige pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Changed your mind?</p>
                    <p className="text-xs text-muted">
                      You can cancel within 24 hours of placing the order — stock will be returned automatically.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCancelError(null);
                      setShowConfirm(true);
                    }}
                  >
                    Cancel this order
                  </Button>
                </div>
                {cancelError && <p className="mt-3 text-sm text-red-600">{cancelError}</p>}
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                This order has been cancelled and its stock was returned to inventory.
              </div>
            )}
          </div>
        )}

        {/* Confirmation modal */}
        {showConfirm && order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-charcoal">Cancel this order?</h2>
              <p className="mt-2 text-sm text-muted">
                Order <span className="font-semibold text-charcoal">{order.orderNumber}</span> will be
                cancelled and the items will go back to stock. This cannot be undone.
              </p>
              {cancelError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{cancelError}</p>}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                  Keep order
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleCancel}
                  disabled={busy}
                >
                  {busy ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Yes, cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Cancelled orders are automatically reflected in your inventory.
        </p>
      </div>
    </div>
  );
};

export default OrderStatus;