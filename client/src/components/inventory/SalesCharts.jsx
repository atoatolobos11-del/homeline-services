import { useMemo, useState } from 'react';
import { BarChart3, Trophy } from 'lucide-react';
import { formatPeso } from '../../utils/stock';

const compactPeso = (value) => {
  const n = Number(value) || 0;
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₱${(n / 1000).toFixed(0)}k`;
  return `₱${Math.round(n)}`;
};

const Segmented = ({ options, value, onChange }) => (
  <div className="flex flex-wrap rounded-full bg-cream p-0.5 text-xs font-semibold">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`rounded-full px-3 py-1.5 transition ${
          value === option.value ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-charcoal'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

// Daily bars for the last N days — switch between Revenue and Gross Profit.
const SalesTrendChart = ({ orders }) => {
  const [period, setPeriod] = useState(14);
  const [metric, setMetric] = useState('revenue');

  const { daily, periodOrders, totalRevenue, totalProfit, largest, bestDayKey } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const days = new Map();
    for (let i = period - 1; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.set(date.toDateString(), {
        key: date.toDateString(),
        date,
        label: date.toLocaleDateString('en-PH', { month: 'numeric', day: 'numeric' }),
        weekday: date.toLocaleDateString('en-PH', { weekday: 'short' }),
        revenue: 0,
        profit: 0,
        orderCount: 0,
        isToday: i === 0,
      });
    }

    let totalRevenue = 0;
    let totalProfit = 0;
    let periodOrders = 0;
    for (const order of orders) {
      const created = new Date(order.createdAt);
      const slot = days.get(created.toDateString());
      if (slot) {
        const orderRevenue = Number(order.total) || 0;
        const orderProfit = (order.items || []).reduce((sum, item) => sum + (Number(item.profit) || 0), 0);
        slot.revenue += orderRevenue;
        slot.profit += orderProfit;
        slot.orderCount += 1;
        totalRevenue += orderRevenue;
        totalProfit += orderProfit;
        periodOrders += 1;
      }
    }

    const daily = [...days.values()];
    let best = null;
    for (const day of daily) {
      const value = metric === 'revenue' ? day.revenue : day.profit;
      if (!best || value > best.value) best = { key: day.key, value };
    }
    return {
      daily,
      periodOrders,
      totalRevenue,
      totalProfit,
      largest: best && best.value > 0 ? best.value : 0,
      bestDayKey: best && best.value > 0 ? best.key : null,
    };
  }, [orders, period, metric]);

  const maxValue = Math.max(1, ...daily.map((day) => (metric === 'revenue' ? day.revenue : day.profit)));
  const hasSales = totalRevenue > 0;
  const selectedValue = metric === 'revenue' ? totalRevenue : totalProfit;
  const metricLabel = metric === 'revenue' ? 'revenue' : 'gross profit';
  const labelStep = period <= 14 ? 1 : Math.max(1, Math.round(period / 12));
  const barColor = (day) => {
    if (day.value === 0) return 'bg-beige/60';
    if (day.key === bestDayKey) return metric === 'revenue' ? 'bg-primary-dark' : 'bg-amber-600';
    if (day.isToday) return metric === 'revenue' ? 'bg-primary' : 'bg-amber-500';
    return metric === 'revenue' ? 'bg-primary/45' : 'bg-amber-500/45';
  };

  return (
    <div className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-charcoal">
            <BarChart3 className="h-5 w-5 text-primary" />
            Sales trend
          </h3>
          <p className="mt-1 text-sm text-muted">Last {period} days · {metricLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { value: 'revenue', label: 'Revenue' },
              { value: 'profit', label: 'Profit' },
            ]}
            value={metric}
            onChange={setMetric}
          />
          <div className="flex rounded-full border border-beige bg-white p-0.5 text-xs font-semibold">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setPeriod(days)}
                className={`rounded-full px-2.5 py-1.5 transition ${
                  period === days ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-charcoal'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        {hasSales ? (
          <p className="font-semibold text-charcoal">
            {formatPeso(selectedValue)} <span className="font-normal text-muted">· {periodOrders} order{periodOrders === 1 ? '' : 's'}</span>
          </p>
        ) : (
          <p className="text-muted">No sales in this period yet.</p>
        )}
        {hasSales && largest > 0 && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Best: {formatPeso(largest)}
          </span>
        )}
      </div>

      {!hasSales ? (
        <p className="mt-6 rounded-2xl border border-dashed border-beige px-4 py-10 text-center text-sm text-muted">
          Bars will appear here once you have orders — try placing a test order from the storefront.
        </p>
      ) : (
        <div className="mt-4">
          <div className="flex h-44 items-end gap-1">
            {daily.map((day) => {
              const value = metric === 'revenue' ? day.revenue : day.profit;
              const barHeight = value > 0 ? Math.max(4, Math.round((value / maxValue) * 100)) : 3;
              return (
                <div
                  key={day.key}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                  title={
                    value !== 0
                      ? `${day.weekday}, ${day.label}: ${formatPeso(value)} ${metricLabel} (${day.orderCount} order${day.orderCount === 1 ? '' : 's'})`
                      : `${day.weekday}, ${day.label}: no ${metricLabel}`
                  }
                >
                  <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {value !== 0 ? compactPeso(value) : '—'}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-90 ${barColor({ value, key: day.key, isToday: day.isToday })}`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex border-t border-beige pt-2">
            {daily.map((day, index) => {
              const show = period <= 14 || index % labelStep === 0 || index === daily.length - 1;
              if (!show) return <span key={day.key} className="flex-1" />;
              return (
                <span
                  key={day.key}
                  className={`flex-1 truncate text-center text-[10px] ${day.isToday ? 'font-bold text-primary' : 'text-muted'}`}
                >
                  {day.isToday ? 'Today' : period <= 14 ? day.weekday : day.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Top selling products as horizontal bars — sort by Units, Revenue, or Profit.
const TopProductsChart = ({ orders }) => {
  const [metric, setMetric] = useState('units');

  const { topProducts, maxValue } = useMemo(() => {
    const agg = new Map();
    for (const order of orders) {
      for (const item of order.items || []) {
        const current = agg.get(item.productName) || { units: 0, revenue: 0, profit: 0 };
        const quantity = item.quantity || 1;
        current.units += quantity;
        current.revenue += (Number(item.unitPrice) || 0) * quantity;
        current.profit += Number(item.profit) || 0;
        agg.set(item.productName, current);
      }
    }
    const products = [...agg.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 5);
    const max = Math.max(1, ...products.map((product) => product[metric]));
    return { topProducts: products, maxValue: max };
  }, [orders, metric]);

  const metricLabel = metric === 'units' ? 'units sold' : metric === 'revenue' ? 'revenue' : 'gross profit';

  return (
    <div className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-charcoal">
            <Trophy className="h-5 w-5 text-primary" />
            Top products
          </h3>
          <p className="mt-1 text-sm text-muted">By {metricLabel}</p>
        </div>
        <Segmented
          options={[
            { value: 'units', label: 'Units' },
            { value: 'revenue', label: 'Revenue' },
            { value: 'profit', label: 'Profit' },
          ]}
          value={metric}
          onChange={setMetric}
        />
      </div>

      {topProducts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-beige px-4 py-10 text-center text-sm text-muted">
          No sold items yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {topProducts.map((product, index) => {
            const value = product[metric];
            const width = Math.max(4, Math.round((value / maxValue) * 100));
            const isCurrency = metric !== 'units';
            return (
              <div key={product.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-charcoal">
                    <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cream text-[11px] font-bold text-primary">
                      {index + 1}
                    </span>
                    {product.name}
                  </p>
                  <p className="shrink-0 text-xs text-muted">
                    {product.units} sold
                    {isCurrency ? ` · ${formatPeso(value)}` : ''}
                  </p>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cream">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCurrency
                        ? 'bg-gradient-to-r from-amber-500/60 to-amber-600'
                        : 'bg-gradient-to-r from-primary/60 to-primary'
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { SalesTrendChart, TopProductsChart };