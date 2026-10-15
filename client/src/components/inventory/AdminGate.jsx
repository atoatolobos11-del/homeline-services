import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Lock, LogOut, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import { ADMIN_EMAIL, adminSignIn, adminSignInWithSupabase, adminSignOut, hasAdminToken } from '../../utils/api';
import { AUTH_EVENT, getCurrentUser } from '../../utils/auth';

/**
 * Gate for the Inventory dashboard — admin2026@gmail.com only.
 *
 * Primary entry is the admin's own login session: one click sends the
 * Supabase access token, which the server revalidates and only accepts for
 * ADMIN_EMAIL. No shared admin password to remember or forget. The old
 * email+password form stays as a fallback (server ADMIN_PASSWORD).
 */
const AdminGate = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ssoBusy, setSsoBusy] = useState(false);
  const [ssoError, setSsoError] = useState(null);
  const [signedIn, setSignedIn] = useState(hasAdminToken);

  useEffect(() => {
    const sync = () => setCurrentUser(getCurrentUser());
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);

  const isAdminAccount =
    String(currentUser?.email || '').toLowerCase() === String(ADMIN_EMAIL || '').toLowerCase();

  const handleEnterWithLogin = async () => {
    setSsoBusy(true);
    setSsoError(null);
    const result = await adminSignInWithSupabase();
    setSsoBusy(false);
    if (result.ok) {
      setSignedIn(true);
    } else {
      setSsoError(result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await adminSignIn(email.trim(), password);
    setBusy(false);
    if (result.ok) {
      setPassword('');
      setSignedIn(true);
    } else {
      setError(result.error);
    }
  };

  const handleSignOut = async () => {
    await adminSignOut();
    setSignedIn(false);
    navigate('/');
  };

  if (!signedIn) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Admin sign-in</h1>
              <p className="text-sm text-muted">Inventory dashboard — admins only</p>
            </div>
          </div>

          {isAdminAccount ? (
            <div className="mb-5 rounded-2xl bg-green-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <ShieldCheck className="h-4 w-4" /> Signed in as {currentUser.email}
              </p>
              <p className="mt-1 text-xs text-green-700">
                This is the admin account — enter the dashboard with one click, no extra password.
              </p>
              {ssoError && (
                <p role="alert" className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {ssoError}
                </p>
              )}
              <Button
                type="button"
                size="lg"
                className="mt-3 w-full"
                disabled={ssoBusy}
                onClick={handleEnterWithLogin}
              >
                {ssoBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" /> Verifying…
                  </span>
                ) : (
                  'Enter inventory dashboard'
                )}
              </Button>
              <div className="my-4 flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-beige" />
                or use the admin password
                <span className="h-px flex-1 bg-beige" />
              </div>
            </div>
          ) : (
            <p className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {currentUser?.email
                ? `You are signed in as ${currentUser.email} — switch to the ${ADMIN_EMAIL} account for one-click entry, or continue with the admin password below.`
                : `This area is for ${ADMIN_EMAIL} only. Log in with the admin account for one-click entry, or continue with the admin password below.`}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal" htmlFor="admin-password">
                Admin password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
              <p className="mt-2 text-xs text-muted">
                Set with <code className="font-mono">ADMIN_PASSWORD</code> in the server environment.
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" /> Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-4 pt-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-full border border-beige bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-cream"
        >
          <LogOut className="h-4 w-4" /> Sign out of admin
        </button>
      </div>
      {children}
    </div>
  );
};

export default AdminGate;