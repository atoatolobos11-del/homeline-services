import { useMemo, useState } from 'react';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Save,
  Minus,
  Plus,
} from 'lucide-react';
import { useShopData } from '../context/DataContext';
import { getStockStatus, stockStatusLabel, LOW_STOCK_THRESHOLD } from '../utils/stock';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const statusStyles = {
  in: 'bg-green-50 text-green-700',
  low: 'bg-amber-50 text-amber-700',
  out: 'bg-red-50 text-red-600',
};

const Inventory = () => {
  const { products, refresh } = useShopData();
  const [query, setQuery] = useState('');
  const [edits, setEdits] = useState({}); // product id -> edited value (string)
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState(null);

  const summary = useMemo(() => {
    const counts = { total: products.length, in: 0, low: 0, out: 0 };
    for (const product of products) {
      counts[getStockStatus(product.stock)] += 1;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query],
  );

  const editValueFor = (product) =>
    edits[product.id] !== undefined ? edits[product.id] : String(product.stock);

  const handleEditChange = (id, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    setEdits((prev) => ({ ...prev, [id]: value }));
  };

  const adjust = (product, delta) => {
    const current = Number(editValueFor(product));
    const next = Math.max(0, current + delta);
    setEdits((prev) => ({ ...prev, [product.id]: String(next) }));
  };

  const save = async (product) => {
    const stock = Number(editValueFor(product));
    setSavingId(product.id);
    setMessage(null);
    try {
      const res = await fetch(`${apiBase}/inventory/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      });
      if (!res.ok) throw new Error('Save failed');
      setEdits((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      await refresh();
      setMessage({ type: 'ok', text: 'Stock saved ✓' });
    } catch {
      setMessage({ type: 'error', text: 'Could not save — try again' });
    } finally {
      setSavingId(null);
      window.setTimeout(() => setMessage(null), 3000);
    }
  };

  const summaryCards = [
    { label: 'Total products', value: summary.total, icon: Package, style: 'bg-white' },
    { label: 'In stock', value: summary.in, icon: CheckCircle2, style: 'bg-green-50 text-green-700' },
    { label: 'Low stock (≤ ' + LOW_STOCK_THRESHOLD + ')', value: summary.low, icon: AlertTriangle, style: 'bg-amber-50 text-amber-700' },
    { label: 'Out of stock', value: summary.out, icon: XCircle, style: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-charcoal">Inventory</h1>
          <p className="mt-3 max-w-xl text-muted">
            Track and update the stock of every product. Stock also decreases
            automatically every time a customer places an order.
          </p>
        </div>
        <label className="sr-only" htmlFor="inventory-search">
          Search inventory
        </label>
        <div className="relative w-full max-w-xs">
          <input
            id="inventory-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-line bg-white px-4 py-2.5 pl-11 text-sm focus:border-primary focus:outline-none"
          />
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {message && (
        <p
          className={`mt-6 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
            message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.style}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-bold text-charcoal">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-beige bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-beige text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Stock</th>
                <th className="px-5 py-4 text-right font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const status = getStockStatus(product.stock);
                const editedValue = editValueFor(product);
                const isDirty = editedValue !== String(product.stock);
                return (
                  <tr key={product.id} className="border-b border-beige/60 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-semibold text-charcoal">{product.name}</p>
                          <p className="text-xs text-muted">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-charcoal">{product.category}</td>
                    <td className="px-5 py-4 text-sm font-medium text-charcoal">
                      ₱{product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
                        {stockStatusLabel(status)}
                        {status === 'low' && ` · ${product.stock} left`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1 rounded-full border border-line bg-cream/60 p-1">
                        <button
                          type="button"
                          onClick={() => adjust(product, -1)}
                          aria-label={`Decrease stock of ${product.name}`}
                          className="rounded-full p-1.5 text-charcoal transition hover:bg-beige active:scale-95"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editedValue}
                          onChange={(event) => handleEditChange(product.id, event.target.value)}
                          aria-label={`Stock of ${product.name}`}
                          className="w-14 rounded-full border border-transparent bg-white py-1.5 text-center text-sm font-semibold text-charcoal focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => adjust(product, 1)}
                          aria-label={`Increase stock of ${product.name}`}
                          className="rounded-full p-1.5 text-charcoal transition hover:bg-beige active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => save(product)}
                        disabled={!isDirty || savingId === product.id}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Save className="h-4 w-4" />
                        {savingId === product.id ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center text-muted">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;