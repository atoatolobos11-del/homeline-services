import { useState } from 'react';
import { X, Save, Loader, Image as ImageIcon } from 'lucide-react';
import { useShopData } from '../../context/DataContext';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const ProductFormModal = ({ product, onClose, onSaved }) => {
  const { categories } = useShopData();
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product ? String(product.price) : '',
    costPrice: product?.costPrice != null ? String(product.costPrice) : '',
    sku: product?.sku || '',
    reorderLevel: product?.reorderLevel != null ? String(product.reorderLevel) : '3',
    stock: product?.stock != null ? String(product.stock) : '0',
    image: product?.image || '',
    badge: product?.badge || '',
    description: product?.description || '',
    featured: product?.featured || false,
    bestSeller: product?.bestSeller || false,
    newArrival: product?.newArrival || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        costPrice: form.costPrice === '' ? null : Number(form.costPrice),
        sku: form.sku,
        reorderLevel: Number(form.reorderLevel || 3),
        image: form.image,
        badge: form.badge,
        description: form.description,
        featured: form.featured,
        bestSeller: form.bestSeller,
        newArrival: form.newArrival,
      };
      if (!isEdit) payload.stock = Number(form.stock || 0);

      const res = await fetch(`${apiBase}/products${isEdit ? `/${product.id}` : ''}`, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not save product');
      }
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleClass = (active) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-primary text-white' : 'border border-line text-muted hover:border-primary hover:text-primary'
    }`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-charcoal">
            {isEdit ? `Edit ${product.name}` : 'Add product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-beige transition-colors"
            aria-label="Close form"
          >
            <X className="h-5 w-5 text-charcoal" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-charcoal">Product name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Bamboo Tea Infuser"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Category *</label>
              <input
                type="text"
                list="category-options"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="e.g. Natural Materials"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Selling price (₱) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">
                Cost price (₱) <span className="font-normal text-muted">— what you pay</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) => set('costPrice', e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">
                SKU <span className="font-normal text-muted">— auto if empty</span>
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="HML-2001"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-charcoal">Reorder at</label>
                <input
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={(e) => set('reorderLevel', e.target.value)}
                  className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              {!isEdit && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">Starting stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => set('stock', e.target.value)}
                    className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-charcoal">
                Image URL <span className="font-normal text-muted">— leave empty for a default image</span>
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="https://images.pexels.com/... "
                  className="w-full rounded-xl border border-beige px-4 py-3 pl-11 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Badge (optional)</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => set('badge', e.target.value)}
                placeholder="e.g. New, Promotion"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-end gap-3 pb-1">
              <button type="button" onClick={() => set('featured', !form.featured)} className={toggleClass(form.featured)}>
                Featured
              </button>
              <button type="button" onClick={() => set('bestSeller', !form.bestSeller)} className={toggleClass(form.bestSeller)}>
                Best-seller
              </button>
              <button type="button" onClick={() => set('newArrival', !form.newArrival)} className={toggleClass(form.newArrival)}>
                New arrival
              </button>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-charcoal">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows="3"
                placeholder="Short description shown on the product page…"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-beige pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-5 py-2.5 font-medium text-charcoal transition hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-60"
            >
              {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;