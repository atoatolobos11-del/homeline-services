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
  Pencil,
  Boxes,
  History,
  ShoppingBag,
  PlusCircle,
  Loader,
} from 'lucide-react';
import { useShopData } from '../context/DataContext';
import { getStockStatus, stockStatusLabel, formatPeso, DEFAULT_REORDER_LEVEL } from '../utils/stock';
import ProductFormModal from '../components/inventory/ProductFormModal';
import SalesView from '../components/inventory/SalesView';
import ActivityView from '../components/inventory/ActivityView';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const statusStyles = {
  in: 'bg-green-50 text-green-700',
  low: 'bg-amber-50 text-amber-700',
  out: 'bg-red-50 text-red-600',
};

const statusDot = {
  in: 'bg-green-500',
  low: 'bg-amber-500',
  out: 'bg-red-500',
};

const Inventory = () => {
  const { products, refresh } = useShopData();
  const [tab, setTab] = useState('products');
  const [query, setQuery] = useState('');
  const [edits, setEdits] = useState({}); // product id -> edited value (string)
  const [busyId, setBusyId] = useState(null); // product id currently saving/restocking
  const [message, setMessage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const flash = (text, ok = true) => {
    setMessage({ ok, text });
    window.setTimeout(() => setMessage(null), 3000);
  };

  const summary = useMemo(() => {
    const counts = { total: products.length, in: 0, low: 0, out: 0, value: 0 };
    for (const product of products) {
      counts[getStockStatus(product.stock, product.reorderLevel)] += 1;
      const unitCost = product.costPrice != null ? product.costPrice : 0;
      counts.value += product.stock * unitCost;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const haystack =
          `${product.name} ${product.sku || ''} ${product.category} ${product.slug}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
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

  const saveStock = async (product) => {
    const stock = Number(editValueFor(product));
    setBusyId(product.id);
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
      flash(`${product.name}: stock saved ✓`);
    } catch {
      flash('Could not save — try again', false);
    } finally {
      setBusyId(null);
    }
  };

  const restock = async (product) => {
    setBusyId(product.id);
    try {
      const res = await fetch(`${apiBase}/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, quantity: 10, reason: 'Restock +10' }),
      });
      if (!res.ok) throw new Error('Restock failed');
      await refresh();
      flash(`${product.name}: restocked +10 ✓`);
    } catch {
      flash('Could not restock — try again', false);
    } finally {
      setBusyId(null);
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const summaryCards = [
    { label: 'Total products', value: summary.total, icon: Package, style: 'bg-white text-charcoal' },
    {
      label: 'In stock',
      value: summary.in,
      icon: CheckCircle2,
      style: 'bg-green-50 text-green-700',
    },
    {
      label: 'Low / reorder',
      value: summary.low,
      icon: AlertTriangle,
      style: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Out of stock',
      value: summary.out,
      icon: XCircle,
      style: 'bg-red-50 text-red-600',
    },
    {
      label: 'Inventory value (cost)',
      value: formatPeso(summary.value),
      icon: Boxes,
      style: 'bg-primary/10 text-primary',
    },
  ];

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingBag },
    { id: 'activity', label: 'Activity', icon: History },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-charcoal">Inventory</h1>
          <p className="mt-3 max-w-xl text-muted">
            Track stock, sales, and costs. Every checkout reduces stock automatically and every
            change is logged in the Activity tab.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          Add product
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === item.id
                ? 'bg-primary text-white shadow-md'
                : 'border border-line bg-white text-charcoal hover:border-primary hover:text-primary'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {message && (
        <p
          className={`mt-6 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
            message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}

      {tab === 'products' && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.style}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-bold text-charcoal">{card.value}</p>
                <p className="mt-1 text-sm text-muted">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <label className="sr-only" htmlFor="inventory-search">
              Search inventory
            </label>
            <div className="relative w-full max-w-sm">
              <input
                id="inventory-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, SKU, or category"
                className="w-full rounded-full border border-line bg-white px-4 py-2.5 pl-11 text-sm focus:border-primary focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-beige bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left">
                <thead>
                  <tr className="border-b border-beige text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-4 font-semibold">SKU</th>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price / Cost</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const status = getStockStatus(product.stock, product.reorderLevel);
                    const editedValue = editValueFor(product);
                    const isDirty = editedValue !== String(product.stock);
                    const reorderLevel = product.reorderLevel || DEFAULT_REORDER_LEVEL;
                    return (
                      <tr key={product.id} className="border-b border-beige/60 last:border-0">
                        <td className="px-5 py-4 font-mono text-xs text-muted">
                          {product.sku || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-semibold text-charcoal">{product.name}</p>
                              <p className="text-xs text-muted">
                                Reorder at {reorderLevel}
                                {product.costPrice != null && (
                                  <span className="ml-2 text-primary">
                                    margin {formatPeso(product.price - product.costPrice)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-charcoal">{product.category}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-charcoal">
                            {formatPeso(product.price)}
                          </p>
                          {product.costPrice != null && (
                            <p className="text-xs text-muted">cost {formatPeso(product.costPrice)}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
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
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => restock(product)}
                              disabled={busyId === product.id}
                              title="Add 10 units (logged as a restock)"
                              className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                            >
                              Restock +10
                            </button>
                            <button
                              type="button"
                              onClick={() => saveStock(product)}
                              disabled={!isDirty || busyId === product.id}
                              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-primary-dark active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                            >
                              {busyId === product.id ? (
                                <Loader className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              title="Edit product details"
                              className="rounded-full p-2 text-muted transition hover:bg-beige hover:text-primary active:scale-95"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-14 text-center text-muted">
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'sales' && (
        <div className="mt-8">
          <SalesView />
        </div>
      )}

      {tab === 'activity' && (
        <div className="mt-8">
          <ActivityView />
        </div>
      )}

      {formOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setFormOpen(false);
            setEditingProduct(null);
          }}
          onSaved={async () => {
            await refresh();
            setFormOpen(false);
            setEditingProduct(null);
            flash(editingProduct ? 'Product updated ✓' : 'Product added ✓');
          }}
        />
      )}
    </div>
  );
};

export default Inventory;