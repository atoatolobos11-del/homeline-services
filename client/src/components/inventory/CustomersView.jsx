import { useEffect, useMemo, useState } from 'react';
import { Users, ShoppingBag, Search, Loader, Coins } from 'lucide-react';
import { formatPeso, formatDateTime } from '../../utils/stock';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const CustomersView = () => {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/orders`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load orders');
        return res.json();
      })
      .then((result) => {
        if (!cancelled) setOrders(result.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const customers = useMemo(() => {
    if (!orders) return [];
    const map = new Map();
    for (const order of orders) {
      const key = (order.customerEmail || order.customerName || 'Guest').toLowerCase().trim();
      const current = map.get(key) || {
        name: order.customerName || 'Guest',
        email: order.customerEmail,
        orders: 0,
        spend: 0,
        lastOrder: null,
      };
      current.orders += 1;
      current.spend += Number(order.total) || 0;
      const created = new Date(order.createdAt);
      if (!current.lastOrder || created > current.lastOrder) current.lastOrder = created;
      map.set(key, current);
    }
    return [...map.values()]
      .sort((a, b) => b.spend - a.spend)
      .map((customer, index) => ({ ...customer, rank: index + 1 }));
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        (customer.name || '').toLowerCase().includes(q) ||
        (customer.email || '').toLowerCase().includes(q),
    );
  }, [customers, query]);

  if (error) {
    return <p className="rounded-2xl bg-red-50 px-5 py-8 text-center text-red-600">{error}</p>;
  }

  if (!orders) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-beige bg-white py-16 text-muted">
        <Loader className="h-5 w-5 animate-spin" /> Loading customers…
      </div>
    );
  }

  const totalSpend = customers.reduce((sum, customer) => sum + customer.spend, 0);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-bold text-charcoal">{customers.length}</p>
          <p className="mt-1 text-sm text-muted">Unique customers</p>
        </div>
        <div className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <Coins className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-bold text-charcoal">{formatPeso(totalSpend)}</p>
          <p className="mt-1 text-sm text-muted">Total customer spend</p>
        </div>
        <div className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-bold text-charcoal">
            {customers[0] ? formatPeso(customers[0].spend) : '—'}
          </p>
          <p className="mt-1 text-sm text-muted">Best customer spend</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <label className="sr-only" htmlFor="customer-search">Search customers</label>
        <div className="relative w-full max-w-sm">
          <input
            id="customer-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-full border border-line bg-white px-4 py-2.5 pl-11 text-sm focus:border-primary focus:outline-none"
          />
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-beige bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-beige text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-4 font-semibold">#</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Orders</th>
                <th className="px-5 py-4 font-semibold">Total spent</th>
                <th className="px-5 py-4 font-semibold">Last order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.email || customer.name} className="border-b border-beige/60 last:border-0">
                  <td className="px-5 py-4 text-sm font-bold text-primary">{customer.rank}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-charcoal">{customer.name}</p>
                    {customer.email && <p className="text-xs text-muted">{customer.email}</p>}
                  </td>
                  <td className="px-5 py-4 text-sm text-charcoal">{customer.orders}</td>
                  <td className="px-5 py-4 text-sm font-bold text-charcoal">{formatPeso(customer.spend)}</td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {customer.lastOrder ? formatDateTime(customer.lastOrder) : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center text-muted">
                    No orders yet — customers will appear here once orders are placed.
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

export default CustomersView;