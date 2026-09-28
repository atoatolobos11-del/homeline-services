import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, CalendarDays, PackageOpen, ChevronDown, Loader, Download, Printer } from 'lucide-react';
import { formatPeso, formatDateTime } from '../../utils/stock';
import { SalesTrendChart, TopProductsChart } from './SalesCharts';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const SalesView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [openOrder, setOpenOrder] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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

  const filteredOrders = orders.filter((order) => {
    const created = new Date(order.createdAt);
    const day = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`;
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
  const filteredRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  const formatPesoPlain = (value) =>
    `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const downloadCSV = () => {
    const rows = [
      ['Order Number', 'Date', 'Customer', 'Email', 'Items', 'Total (₱)', 'Status'],
      ...filteredOrders.map((order) => [
        order.orderNumber,
        formatDateTime(order.createdAt),
        order.customerName,
        order.customerEmail || '',
        order.items.map((item) => `${item.productName} x${item.quantity}`).join('; '),
        order.total,
        order.status,
      ]),
      [],
      ['TOTAL', '', '', '', '', filteredRevenue.toFixed(2), ''],
    ];
    const csv =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map((cell) => {
              const s = String(cell ?? '');
              return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            })
            .join(','),
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homeline-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    const rangeLabel = fromDate || toDate
      ? `${fromDate ? new Date(fromDate).toLocaleDateString('en-PH') : 'Start'} → ${toDate ? new Date(toDate).toLocaleDateString('en-PH') : 'Today'}`
      : 'All time';
    const rowsHtml = filteredOrders
      .map(
        (order) => `
        <tr>
          <td>${order.orderNumber}</td>
          <td>${formatDateTime(order.createdAt)}</td>
          <td>${order.customerName}${order.customerEmail ? `<br><small>${order.customerEmail}</small>` : ''}</td>
          <td>${order.items.map((item) => `${item.productName} x${item.quantity}`).join('<br>')}</td>
          <td style="text-align:right">${formatPesoPlain(order.total)}</td>
          <td>${order.status}</td>
        </tr>`,
      )
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Homeline Sales Report</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;margin:32px;color:#2c2c2c}
  h1{margin:0;font-size:22px;color:#1a4d2e}
  .sub{color:#6b7669;margin:6px 0 20px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#1a4d2e;color:#fff}
  .total{font-weight:700;background:#f5f1e8}
  small{color:#6b7669}
</style></head><body>
  <h1>🏡 Homeline — Sales Report</h1>
  <p class="sub">${rangeLabel} · ${filteredOrders.length} order${filteredOrders.length === 1 ? '' : 's'} · Revenue ${formatPesoPlain(filteredRevenue)}</p>
  <table>
    <thead><tr><th>Order #</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>
      ${rowsHtml}
      <tr class="total"><td colspan="4">TOTAL</td><td style="text-align:right">${formatPesoPlain(filteredRevenue)}</td><td></td></tr>
    </tbody>
  </table>
  <script>window.onload=function(){window.print()};<\/script>
</body></html>`;
    win.document.write(html);
    win.document.close();
  };

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

      {/* Daily sales report — filter, CSV, print */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-beige bg-white p-5 shadow-sm">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-charcoal">
            <Download className="h-5 w-5 text-primary" /> Daily sales report
          </h3>
          <p className="mt-1 text-sm text-muted">
            {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'} in range ·{' '}
            {formatPeso(filteredRevenue)}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-charcoal">
            <span className="mb-1 block text-muted">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-beige bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-charcoal">
            <span className="mb-1 block text-muted">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-beige bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-95"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            type="button"
            onClick={printReport}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
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