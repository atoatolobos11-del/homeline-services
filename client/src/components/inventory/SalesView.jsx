import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, CalendarDays, PackageOpen, ChevronDown, Loader } from 'lucide-react';
import { formatPeso, formatDateTime } from '../../utils/stock';
import { SalesTrendChart, TopProductsChart } from './SalesCharts';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const SalesView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [openOrder, setOpenOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/orders`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load sales');
        return res.json();
      })
      .then((result) => {
        if (!cancelled) setData(result);
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

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-beige bg-white py-16 text-muted">
        <Loader className="h-5 w-5 animate-spin" /> Loading sales…
      </div>
    );
  }

  const { orders, summary } = data;

  const cards = [
    {
      label: 'Orders placed',
      value: summary.orders,
      icon: ShoppingBag,
      style: 'bg-white text-charcoal',
    },
    {
      label: 'Total revenue',
      value: formatPeso(summary.revenue),
      icon: TrendingUp,
      style: 'bg-green-50 text-green-700',
    },
    {
      label: 'This week',
      value: formatPeso(summary.weekRevenue),
      icon: CalendarDays,
      style: 'bg-primary/10 text-primary',
    },
    {
      label: 'Today',
      value: formatPeso(summary.todayRevenue),
      icon: CalendarDays,
      style: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Items sold',
      value: summary.itemsSold,
      icon: PackageOpen,
      style: 'bg-blue-50 text-blue-700',
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.style}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-charcoal">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Sales charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SalesTrendChart orders={orders} />
        <TopProductsChart orders={orders} />
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-beige bg-white shadow-sm">
        {orders.length === 0 ? (
          <p className="px-6 py-16 text-center text-muted">
            No sales yet. Place a test order from the storefront and it will appear here.
          </p>
        ) : (
          <div>
            {orders.map((order) => {
              const isOpen = openOrder === order.id;
              return (
                <div key={order.id} className="border-b border-beige/60 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenOrder(isOpen ? null : order.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-cream/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{order.orderNumber}</p>
                        <p className="text-xs text-muted">
                          {order.customerName}
                          {order.customerEmail ? ` · ${order.customerEmail}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-charcoal">{formatPeso(order.total)}</p>
                        <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="bg-cream/40 px-5 pb-5">
                      <div className="overflow-hidden rounded-2xl border border-beige bg-white">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-beige text-xs uppercase tracking-wider text-muted">
                              <th className="px-4 py-3 font-semibold">Item</th>
                              <th className="px-4 py-3 font-semibold">Price</th>
                              <th className="px-4 py-3 font-semibold">Qty</th>
                              <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id} className="border-b border-beige/60 last:border-0">
                                <td className="px-4 py-3 font-medium text-charcoal">{item.productName}</td>
                                <td className="px-4 py-3 text-charcoal">{formatPeso(item.unitPrice)}</td>
                                <td className="px-4 py-3 text-charcoal">{item.quantity}</td>
                                <td className="px-4 py-3 text-right font-semibold text-charcoal">
                                  {formatPeso(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesView;