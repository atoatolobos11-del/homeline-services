import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import {
  checkCredentials,
  factoryResetLocalData,
  getCurrentUser,
  normalizeEmail,
  onPasswordRecovery,
  registerUser,
  requestPasswordReset,
  updatePassword,
} from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // After login, return to the page that required it (App.jsx passes it via
  // state). Falls back to the shop.
  const redirectTo = location.state?.from || '/shop';
  const [signedIn, setSignedIn] = useState(() => Boolean(getCurrentUser()));

  const [authMode, setAuthMode] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formNotice, setFormNotice] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [resetPasswords, setResetPasswords] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(
    () => new URLSearchParams(window.location.search).get('recovery') === '1',
  );

  useEffect(() => {
    if (getCurrentUser()) setSignedIn(true);
  }, [location.key]);

  // A Supabase recovery link lands on /login?recovery=1 and establishes a
  // recovery session — show the new-password form immediately.
  useEffect(() => {
    const off = onPasswordRecovery(() => setRecoveryMode(true));
    return off;
  }, []);

  // One-click factory reset link: opening /login?fresh=1 wipes every local
  // account + session on this device, then reloads to a clean /login.
  useEffect(() => {
    if (new URLSearchParams(location.search).get('fresh') === '1') {
      factoryResetLocalData().finally(() => window.location.replace('/login'));
    }
  }, [location.search]);

  if (signedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  const switchMode = (mode) => {
    setAuthMode(mode);
    setFormError(null);
    setFormNotice(null);
    setRecoveryMode(false);
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);
    const name = registerForm.name.trim();
    const email = normalizeEmail(registerForm.email);
    if (!name || !email || !registerForm.password) {
      setFormError('Fill in your name, email, and password.');
      return;
    }
    if (registerForm.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      const result = await registerUser({ name, email, password: registerForm.password });
      if (result.error) {
        // An existing account surfaces here — send them to log in instead.
        if (/already exists|log in instead/i.test(result.error)) {
          setAuthMode('login');
          setLoginForm({ email, password: '' });
        }
        setFormError(result.error);
        return;
      }
      if (result.needsConfirmation) {
        setAuthMode('login');
        setLoginForm({ email, password: '' });
        setFormNotice('Account created — check your inbox for a confirmation link, then log in.');
        return;
      }
      navigate(redirectTo, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);
    if (!loginForm.email || !loginForm.password) {
      setFormError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const result = await checkCredentials(loginForm.email, loginForm.password);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      navigate(redirectTo, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);
    const email = normalizeEmail(resetEmail);
    if (!email) {
      setFormError('Enter the email you registered with.');
      return;
    }
    setBusy(true);
    try {
      const result = await requestPasswordReset(email);
      if (result?.error) {
        setFormError(result.error);
        return;
      }
      // Supabase never reveals whether the email exists, so always show this.
      setFormNotice('If an account uses that email, a reset link is on its way — open it to set a new password.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);
    if (resetPasswords.password.length < 6) {
      setFormError('New password must be at least 6 characters.');
      return;
    }
    if (resetPasswords.password !== resetPasswords.confirm) {
      setFormError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await updatePassword(resetPasswords.password);
      if (result?.error) {
        setFormError(result.error);
        return;
      }
      setResetPasswords({ password: '', confirm: '' });
      setRecoveryMode(false);
      setAuthMode('login');
      setFormNotice('Password updated — log in with the new one.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Welcome</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">
            {recoveryMode ? 'Set a new password' : authMode === 'register' ? 'Create account' : authMode === 'forgot' ? 'Reset password' : 'Log in'}
          </h1>
        </div>

        {formError && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </p>
        )}
        {formNotice && (
          <p role="status" className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {formNotice}
          </p>
        )}

        {recoveryMode ? (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-sm text-muted">
              You opened a password-reset link — set a new password below.
            </p>
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">New password</label>
              <input
                type="password"
                value={resetPasswords.password}
                onChange={(e) => setResetPasswords((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Confirm new password</label>
              <input
                type="password"
                value={resetPasswords.confirm}
                onChange={(e) => setResetPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                placeholder="Repeat the new password"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Saving…' : 'Save new password'}
            </Button>
            <p className="text-center text-sm text-muted">
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary-dark"
                onClick={() => switchMode('login')}
              >
                Back to log in
              </button>
            </p>
          </form>
        ) : authMode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-sm text-muted">
              Enter the email you registered with. If it matches an account, we&apos;ll send a reset link.
            </p>
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Email address</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
            <p className="text-center text-sm text-muted">
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary-dark"
                onClick={() => switchMode('login')}
              >
                Back to log in
              </button>
            </p>
          </form>
        ) : authMode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Full name</label>
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterInputChange}
                placeholder="Your full name"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Email address</label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterInputChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterInputChange}
                  placeholder="Create a password (min. 6 characters)"
                  className="w-full rounded-xl border border-beige px-4 py-3 pr-11 focus:border-primary focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Creating…' : 'Register'}
            </Button>

            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary-dark"
                onClick={() => switchMode('login')}
              >
                Log in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Email address</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginInputChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-beige px-4 py-3 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-beige px-4 py-3 pr-11 focus:border-primary focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-beige"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="font-medium text-primary hover:text-primary-dark hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Logging in…' : 'Log In'}
            </Button>

            <p className="text-center text-sm text-muted">
              New here?{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary-dark"
                onClick={() => switchMode('register')}
              >
                Create account
              </button>
            </p>
            <p className="text-center text-xs text-muted">
              <button
                type="button"
                onClick={() => { factoryResetLocalData().finally(() => window.location.reload()); }}
                className="font-medium text-red-600 hover:underline"
              >
                Start fresh — remove all accounts on this device
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
