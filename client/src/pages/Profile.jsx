import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Loader,
  RefreshCw,
  Package,
  LogOut,
  Pencil,
  KeyRound,
  Mail,
  ShieldCheck,
  Wallet,
  ChevronRight,
  X,
  Check,
  Home,
  ShoppingCart,
} from 'lucide-react';
import { useShopData } from '../context/DataContext';
import { useCart } from '../hooks/useCart';
import { signOutUser, getCurrentUser, updatePassword, AUTH_EVENT } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';
import { formatPeso, formatDateTime } from '../utils/stock';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const statusBadge = (status) => {
  switch (status) {
    case 'cancelled':
      return 'bg-red-50 text-red-600';
    case 'delivered':
      return 'bg-green-50 text-green-700';
    case 'shipped':
      return 'bg-purple-50 text-purple-700';
    case 'confirmed':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-amber-50 text-amber-700';
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const { products } = useShopData();
  const { addToCart, cartCount } = useCart();
  const [orders, setOrders] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [reordering, setReordering] = useState(false);

  // ---- Account hero / manage-account state ----
  const [managing, setManaging] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);
  const [pwDraft, setPwDraft] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // Keep the hero in sync when auth changes (e.g. after a display-name save).
  useEffect(() => {
    const sync = () => setCurrentUser(getCurrentUser());
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);

  useEffect(() => {
    if (currentUser) setNameDraft(currentUser.name || '');
  }, [currentUser?.name]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    // /api/orders is admin-only now, so a shopper's history comes from the
    // per-customer endpoint, which only ever returns orders matching that email.
    // NOTE: this must be POST — the old code sent GET with a body, which the
    // server ignores, so history never loaded.
    fetch(`${apiBase}/orders/by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, name: currentUser.name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load your orders');
        return res.json();
      })
      .then((result) => {
        if (!cancelled) setOrders(result.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setOrderError(err.message);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  const myOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };

  const handleBuyAgain = async (order) => {
    setReordering(true);
    try {
      for (const item of order.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (product) addToCart(product, item.quantity);
      }
    } finally {
      setReordering(false);
      navigate('/cart');
    }
  };

  const stats = useMemo(() => {
    const list = orders || [];
    const totalSpent = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalItems = list.reduce(
      (sum, o) => sum + (o.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0),
      0,
    );
    return { totalOrders: list.length, totalSpent, totalItems };
  }, [orders]);

  const initials = useMemo(() => {
    const name = String(currentUser?.name || currentUser?.email || 'S').trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [currentUser?.name, currentUser?.email]);

  const scrollToOrders = () => {
    document.querySelector('#orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Dedicated entry point for the password form: opens the manage panel,
  // then scrolls straight to the Security card.
  const openPasswordManager = () => {
    setManaging(true);
    // Wait a tick so the collapsible panel renders before scrolling.
    setTimeout(() => {
      document.querySelector('#account-security')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleSaveName = async (e) => {
    e?.preventDefault?.();
    const next = String(nameDraft || '').trim();
    if (!next) {
      setNameMsg({ type: 'error', text: 'Please enter a display name.' });
      return;
    }
    if (!supabase) {
      setNameMsg({ type: 'error', text: 'Account editing is not configured yet.' });
      return;
    }
    setSavingName(true);
    setNameMsg(null);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { name: next } });
      if (error) throw error;
      if (data?.user) setCurrentUser(getCurrentUser());
      // The auth listener fires async — refresh once more so the hero updates instantly.
      setTimeout(() => setCurrentUser(getCurrentUser()), 300);
      setNameMsg({ type: 'ok', text: 'Display name updated.' });
    } catch (err) {
      setNameMsg({ type: 'error', text: err?.message || 'Could not update your name.' });
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (e) => {
    e?.preventDefault?.();
    setPwMsg(null);
    if (pwDraft.length < 6) {
      setPwMsg({ type: 'error', text: 'Use at least 6 characters for the new password.' });
      return;
    }
    if (pwDraft !== pwConfirm) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSavingPw(true);
    try {
      const result = await updatePassword(pwDraft);
      if (result?.error) {
        setPwMsg({ type: 'error', text: result.error });
      } else {
        setPwMsg({ type: 'ok', text: 'Password updated.' });
        setPwDraft('');
        setPwConfirm('');
      }
    } finally {
      setSavingPw(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-charcoal">Please sign in</h1>
          <p className="mt-3 text-muted">You need an account before viewing your profile.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-dark"
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Account hero — identity, stats, and account management in one place */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl">
        {/* decorative shapes */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute right-24 top-10 hidden h-24 w-24 rounded-full border border-white/15 sm:block" />
        </div>

        <div className="relative p-6 sm:p-8">
          {/* breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-cream/70">
            <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-1 transition hover:text-white">
              <Home className="h-3.5 w-3.5" /> Home
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-white">My Account</span>
          </nav>

          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-xl font-bold text-primary ring-4 ring-white/20 sm:h-20 sm:w-20 sm:text-2xl">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-primary bg-green-400" title="Signed in" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-cream/70">My Account</p>
                <h1 className="mt-1 truncate text-2xl font-bold sm:text-4xl">{currentUser.name}</h1>
                {currentUser.email && (
                  <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-cream/85">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {currentUser.email}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cream">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified shopper
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openPasswordManager}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-cream active:scale-95"
              >
                <KeyRound className="h-4 w-4" /> Change password
              </button>
              <button
                type="button"
                onClick={() => setManaging((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${
                  managing
                    ? 'border border-white/40 text-white hover:bg-white/10'
                    : 'border border-white/40 text-white hover:bg-white hover:text-primary'
                }`}
              >
                {managing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {managing ? 'Close settings' : 'Manage account'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-primary active:scale-95"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>

          {/* stats */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: ShoppingBag, label: 'Orders', value: orders ? stats.totalOrders : '…', action: scrollToOrders },
              { icon: Wallet, label: 'Total spent', value: orders ? formatPeso(stats.totalSpent) : '…', action: scrollToOrders },
              { icon: Package, label: 'Items bought', value: orders ? stats.totalItems : '…', action: scrollToOrders },
            ].map(({ icon: Icon, label, value, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="rounded-2xl bg-white/10 px-3 py-3 text-left backdrop-blur transition hover:bg-white/20 active:scale-[0.98] sm:px-4"
              >
                <Icon className="h-4 w-4 text-cream/80" />
                <p className="mt-1.5 truncate text-base font-bold sm:text-xl">{value}</p>
                <p className="text-[11px] text-cream/75 sm:text-xs">{label}</p>
              </button>
            ))}
          </div>

          {/* quick links */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={scrollToOrders}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/25"
            >
              <ShoppingBag className="h-4 w-4" /> My orders
            </button>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/25"
            >
              Continue shopping <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/25"
            >
              <ShoppingCart className="h-4 w-4" /> Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
          </div>
        </div>
      </section>

      {/* Manage-account panel (collapsible) */}
      {managing && (
        <div className="mt-4 grid gap-4 rounded-3xl border border-beige bg-white p-6 shadow-sm md:grid-cols-2">
          <form id="account-profile" onSubmit={handleSaveName} className="scroll-mt-24 rounded-2xl bg-cream/60 p-5">
            <h3 className="flex items-center gap-2 font-bold text-charcoal">
              <Pencil className="h-4 w-4 text-primary" /> Profile details
            </h3>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted">
              Display name
            </label>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Your name"
            />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
              Email
            </label>
            <input
              value={currentUser.email || ''}
              disabled
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-beige bg-beige/40 px-4 py-2.5 text-sm text-muted"
            />
            <p className="mt-1.5 text-xs text-muted">Email is tied to your login and order history — it can&apos;t be changed here.</p>
            {nameMsg && (
              <p className={`mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${nameMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {nameMsg.type === 'ok' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {nameMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={savingName}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95 disabled:opacity-50"
            >
              {savingName && <Loader className="h-4 w-4 animate-spin" />} Save name
            </button>
          </form>

          <form id="account-security" onSubmit={handleSavePassword} className="scroll-mt-24 rounded-2xl bg-cream/60 p-5">
            <h3 className="flex items-center gap-2 font-bold text-charcoal">
              <KeyRound className="h-4 w-4 text-primary" /> Security
            </h3>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted">
              New password
            </label>
            <input
              type="password"
              value={pwDraft}
              onChange={(e) => setPwDraft(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
              Confirm password
            </label>
            <input
              type="password"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm text-charcoal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            {pwMsg && (
              <p className={`mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {pwMsg.type === 'ok' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {pwMsg.text}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={savingPw}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95 disabled:opacity-50"
              >
                {savingPw && <Loader className="h-4 w-4 animate-spin" />} Update password
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-95"
              >
                <LogOut className="h-4 w-4" /> Sign out everywhere
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Orders */}
      <div className="mt-10 scroll-mt-24" id="orders">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-charcoal">My Orders</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Below are the orders you placed with the email {currentUser.email || 'you used to sign up'}.
        </p>

        {orderError && (
          <p className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {orderError} — remember: use the same email at checkout and login so they appear here.
          </p>
        )}

        {!orders && !orderError && (
          <div className="mt-5 flex items-center gap-3 rounded-3xl border border-beige bg-white px-6 py-12 text-muted">
            <Loader className="h-5 w-5 animate-spin" /> Loading your orders…
          </div>
        )}

        {orders && myOrders.length === 0 && (
          <div className="mt-5 rounded-3xl border border-dashed border-beige bg-white px-6 py-14 text-center">
            <Package className="mx-auto h-10 w-10 text-beige" />
            <p className="mt-4 font-semibold text-charcoal">No orders yet</p>
            <p className="mt-1 text-sm text-muted">
              Once you place an order with this email, your order history will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary-dark"
            >
              Start shopping
            </button>
          </div>
        )}

        {orders && myOrders.length > 0 && (
          <div className="mt-5 space-y-5">
            {myOrders.map((order) => (
              <div key={order.orderNumber} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-primary">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-charcoal">{formatPeso(order.total)}</span>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-beige/60">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-charcoal">{item.productName}</p>
                        <p className="text-xs text-muted">
                          ₱{Number(item.unitPrice).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-charcoal">
                        ₱{Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyAgain(order)}
                  disabled={reordering}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-95 disabled:opacity-50"
                >
                  {reordering ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Buy again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;