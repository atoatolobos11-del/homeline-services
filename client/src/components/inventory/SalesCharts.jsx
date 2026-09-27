import { useMemo } from 'react';
import { BarChart3, Trophy } from 'lucide-react';
import { formatPeso } from '../../utils/stock';

const compactPeso = (value) => {
  const n = Number(value) || 0;
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₱${(n / 1000).toFixed(0)}k`;
  return `₱${Math.round(n)}`;
};

// Daily revenue for the last 14 days, as vertical bars.
const RevenueBarChart = ({ orders }) => {
  const { daily, totalPeriod, periodOrders, bestDayKey } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const days = new Map();
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.set(date.toDateString(), {
        key: date.toDateString(),
        date,
        label: date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        weekday: date.toLocaleDateString('en-PH', { weekday: 'short' }),
        revenue: 0,
        orderCount: 0,
        isToday: i === 0,
      });
    }

    for (const order of orders) {
      const created = new Date(order.createdAt);
      const slot = days.get(created.toDateString());
      if (slot) {
        slot.revenue += Number(order.total) || 0;
        slot.orderCount += 1;
      }
    }

    const daily = [...days.values()];
    const totalPeriod = daily.reduce((sum, day) => sum + day.revenue, 0);
    let best = null;
    for (const day of daily) {
      if (!best || day.revenue > best.revenue) best = day;
    }
    return {
      daily,
      totalPeriod,
      periodOrders: orders.length,
      bestDay: best,
      bestDayKey: best && best.revenue > 0 ? best.key : null,
    };
  }, [orders]);

  const maxRevenue = Math.max(1, ...daily.map((day) => day.revenue));
  const hasSales = totalPeriod > 0;

  return (
    <div className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-charcoal">
            <BarChart3 className="h-5 w-5 text-primary" />
            Sales last 14 days
          </h3>
          <p className="mt-1 text-sm text-muted">
            {hasSales
              ? `${formatPeso(totalPeriod)} revenue · ${periodOrders} order${periodOrders === 1 ? '' : 's'}`
              : 'No sales in this period yet.'}
          </p>
        </div>
        {hasSales && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Best: {formatPeso(bestDayKey ? daily.find((d) => d.key === bestDayKey)?.revenue : 0)}
          </span>
        )}
      </div>

      {!hasSales ? (
        <p className="mt-8 rounded-2xl border border-dashed border-beige px-4 py-10 text-center text-sm text-muted">
          Bars will appear here once you have orders — try placing a test order from the storefront.
        </p>
      ) : (
        <div className="mt-6">
          <div className="flex h-44 items-end gap-1.5">
            {daily.map((day) => {
              const barHeight = day.revenue > 0 ? Math.max(4, Math.round((day.revenue / maxRevenue) * 100)) : 3;
              const isBest = day.key === bestDayKey;
              return (
                <div
                  key={day.key}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                  title={
                    day.revenue > 0
                      ? `${day.weekday}, ${day.label}: ${formatPeso(day.revenue)} (${day.orderCount} order${day.orderCount === 1 ? '' : 's'})`
                      : `${day.weekday}, ${day.label}: no sales`
                  }
                >
                  <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {day.revenue > 0 ? compactPeso(day.revenue) : '—'}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-90 ${
                      day.revenue === 0
                        ? 'bg-beige/60'
                        : isBest
                          ? 'bg-primary-dark'
                          : day.isToday
                            ? 'bg-primary'
                            : 'bg-primary/45'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5">
            {daily.map((day) => (
              <span
                key={day.key}
                className={`flex-1 truncate text-center text-[10px] ${day.isToday ? 'font-bold text-primary' : 'text-muted'}`}
              >
                {day.isToday ? 'Today' : day.weekday}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Top selling products, as horizontal bars.
const TopProductsChart = ({ orders }) => {
  const { topProducts, maxUnits } = useMemo(() => {
    const agg = new Map();
    for (const order of orders) {
      for (const item of order.items || []) {
        const current = agg.get(item.productName) || { units: 0, revenue: 0 };
        const quantity = item.quantity || 1;
        current.units += quantity;
        current.revenue += (Number(item.unitPrice) || 0) * quantity;
        agg.set(item.productName, current);
      }
    }
    const products = [...agg.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
    const maxUnits = Math.max(1, ...products.map((p) => p.units));
    return { topProducts: products, maxUnits };
  }, [orders]);

  return (
    <div className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-charcoal">
        <Trophy className="h-5 w-5 text-primary" />
        Top products by units sold
      </h3>
      <p className="mt-1 text-sm text-muted">Which items fly off the shelves during this period.</p>

      {topProducts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-beige px-4 py-10 text-center text-sm text-muted">
          No sold items yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.name}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-semibold text-charcoal">
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cream text-[11px] font-bold text-primary">
                    {index + 1}
                  </span>
                  {product.name}
                </p>
                <p className="shrink-0 text-xs text-muted">
                  {product.units} sold · {formatPeso(product.revenue)}
                </p>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.round((product.units / maxUnits) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { RevenueBarChart, TopProductsChart };