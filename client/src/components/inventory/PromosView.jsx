import { useCallback, useEffect, useState } from 'react';
import { Percent, Tag, Loader, Plus, Power, X } from 'lucide-react';
import { formatPeso } from '../../utils/stock';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const emptyForm = { code: '', discountType: 'percent', value: '', minSpend: '', expiresAt: '' };

const PromosView = () => {
  const [promos, setPromos] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const flash = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/promos`);
      if (!res.ok) throw new Error('Could not load promo codes');
      setPromos(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (promo) => {
    setBusyId(promo.id);
    try {
      const res = await fetch(`${apiBase}/promos/${encodeURIComponent(promo.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active }),
      });
      if (!res.ok) throw new Error('Update failed');
      await load();
      flash(`${promo.id} is now ${!promo.active ? 'active' : 'inactive'}`);
    } catch {
      flash('Could not update promo — try again');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`${apiBase}/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.code,
          discountType: form.discountType,
          value: Number(form.value),
          minSpend: form.minSpend === '' ? 0 : Number(form.minSpend),
          expiresAt: form.expiresAt || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not create promo');
      await load();
      setForm(emptyForm);
      setFormOpen(false);
      flash(`Promo ${body.id} created ✓`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <p className="rounded-2xl bg-red-50 px-5 py-8 text-center text-red-600">{error}</p>;
  }

  if (!promos) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-beige bg-white py-16 text-muted">
        <Loader className="h-5 w-5 animate-spin" /> Loading promos…
      </div>
    );
  }

  const activeCount = promos.filter((promo) => promo.active).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-charcoal">
            <Tag className="h-5 w-5 text-primary" /> Promo codes
          </h2>
          <p className="mt-1 text-sm text-muted">
            {activeCount} active of {promos.length} total — customers apply these at checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setFormError(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:scale-95"
        >
          <Plus className="h-4 w-4" /> New promo
        </button>
      </div>

      {message && (
        <p className="mt-4 inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => {
          const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
          const isPercent = promo.discount_type === 'percent';
          return (
            <div key={promo.id} className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg font-bold tracking-wide text-primary">{promo.id}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    !promo.active
                      ? 'bg-red-50 text-red-600'
                      : isExpired
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
                  }`}
                >
                  {!promo.active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold text-charcoal">
                {isPercent ? `${promo.value}% off` : `${formatPeso(promo.value)} off`}
              </p>
              <div className="mt-2 space-y-1 text-sm text-muted">
                <p>
                  Type: <span className="font-medium text-charcoal">{isPercent ? 'Percent' : 'Fixed ₱'}</span>
                </p>
                <p>
                  Min. spend:{' '}
                  <span className="font-medium text-charcoal">
                    {Number(promo.min_spend) > 0 ? formatPeso(promo.min_spend) : 'None'}
                  </span>
                </p>
                <p>
                  Expires:{' '}
                  <span className="font-medium text-charcoal">
                    {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('en-PH') : 'Never'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleActive(promo)}
                disabled={busyId === promo.id}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${
                  promo.active
                    ? 'border border-red-300 text-red-600 hover:bg-red-600 hover:text-white'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {busyId === promo.id ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {promo.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          );
        })}
        {promos.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-beige bg-white px-6 py-14 text-center text-muted">
            No promo codes yet — create one to start offering discounts.
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-charcoal">New promo code</h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full p-2 text-muted transition hover:bg-beige hover:text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FAMILY10"
                  required
                  className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-charcoal">Discount type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed amount (₱)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                    {form.discountType === 'percent' ? 'Percent off *' : 'Amount off (₱) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                    className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-charcoal">Min. spend (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.minSpend}
                    onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
                    placeholder="0 = none"
                    className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-charcoal">Expiry (optional)</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {formError && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 rounded-full border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromosView;