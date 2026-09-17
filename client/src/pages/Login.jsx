import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('homelineCurrentUser') || 'null');

  const [authMode, setAuthMode] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('homelineUsers') || '[]');
    const existingUser = users.some((user) => user.email === registerForm.email);

    if (existingUser) {
      alert('An account with this email already exists. Please log in instead.');
      setAuthMode('login');
      return;
    }

    users.push({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password
    });

    localStorage.setItem('homelineUsers', JSON.stringify(users));
    setAuthMode('login');
    setLoginForm({ email: registerForm.email, password: '' });
    setRegisterForm({ name: '', email: '', password: '' });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('homelineUsers') || '[]');
    const matchedUser = users.find(
      (user) => user.email === loginForm.email && user.password === loginForm.password
    );

    if (!matchedUser) {
      alert('No account found. Please register first.');
      setAuthMode('register');
      return;
    }

    localStorage.setItem('homelineCurrentUser', JSON.stringify({
      name: matchedUser.name,
      email: matchedUser.email
    }));

    window.dispatchEvent(new Event('homeline-auth-changed'));
    navigate('/shop');
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Welcome</p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal">
            {authMode === 'register' ? 'Create account' : 'Log in'}
          </h1>
        </div>

        {authMode === 'register' ? (
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
                  placeholder="Create a password"
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

            <Button type="submit" size="lg" className="w-full">
              Register
            </Button>

            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary-dark"
                onClick={() => setAuthMode('login')}
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

            <Button type="submit" size="lg" className="w-full">
              Log In
            </Button>

            <p className="text-center text-sm text-muted">
              New here?{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary-dark"
                onClick={() => setAuthMode('register')}
              >
                Create account
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
