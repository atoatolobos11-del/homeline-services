import { useEffect, useState } from 'react';
import { History, Loader, ShoppingBag, PackagePlus, SlidersHorizontal } from 'lucide-react';
import { formatDateTime } from '../../utils/stock';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const typeStyles = {
  sale: { label: 'Sale', icon: ShoppingBag, style: 'bg-red-50 text-red-600' },
  restock: { label: 'Restock', icon: PackagePlus, style: 'bg-green-50 text-green-700' },
  adjustment: { label: 'Adjustment', icon: SlidersHorizontal, style: 'bg-amber-50 text-amber-700' },
};

const ActivityView = () => {
  const [movements, setMovements] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/inventory/movements`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load activity');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setMovements(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="rounded-2xl bg-red-50 px-5 py-8 text-center text-red-600">{error}</p>;
  }

  if (!movements) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-beige bg-white py-16 text-muted">
        <Loader className="h-5 w-5 animate-spin" /> Loading activity…
      </div>
    );
  }

  const quantityClass = (quantity) =>
    quantity > 0 ? 'text-green-600' : quantity < 0 ? 'text-red-600' : 'text-muted';

  return (
    <div className="overflow-hidden rounded-3xl border border-beige bg-white shadow-sm">
      {movements.length === 0 ? (
        <div className="px-6 py-16 text-center text-muted">
          <History className="mx-auto mb-4 h-10 w-10 opacity-40" />
          No activity yet. Every sale, restock, or adjustment will be logged here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-beige text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-4 font-semibold">Date & time</th>
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Change</th>
                <th className="px-5 py-4 font-semibold">Reason</th>
                <th className="px-5 py-4 font-semibold">Stock after</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((move) => {
                const badge = typeStyles[move.change_type] || typeStyles.adjustment;
                return (
                  <tr key={move.id} className="border-b border-beige/60 last:border-0">
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                      {formatDateTime(move.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={move.product?.image}
                          alt={move.product?.name}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <span className="font-medium text-charcoal">{move.product?.name || move.product_id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.style}`}
                      >
                        <badge.icon className="h-3.5 w-3.5" />
                        {badge.label}
                      </span>
                    </td>
                    <td className={`px-5 py-4 font-semibold ${quantityClass(move.quantity)}`}>
                      {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                    </td>
                    <td className="px-5 py-4 text-sm text-charcoal">{move.reason || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-charcoal">
                        {move.stock_after}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityView;