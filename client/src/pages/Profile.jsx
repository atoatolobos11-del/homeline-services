import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('homelineCurrentUser') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('homelineCurrentUser');
    window.location.href = '/';
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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Profile</p>
            <h1 className="mt-2 text-4xl font-bold text-charcoal">{currentUser.name}</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-primary px-5 py-2.5 font-medium text-primary transition hover:bg-primary hover:text-white"
          >
            Log out
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-cream p-6">
            <p className="text-sm text-muted">Email</p>
            <p className="mt-2 text-xl font-semibold text-charcoal">{currentUser.email}</p>
          </div>

          <div className="rounded-2xl bg-cream p-6">
            <p className="text-sm text-muted">Member status</p>
            <p className="mt-2 text-xl font-semibold text-charcoal">Active</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="mt-8 w-full rounded-2xl bg-cream p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-beige hover:shadow-lg active:scale-[0.99]"
        >
          <p className="text-sm text-muted">Store management</p>
          <p className="mt-2 text-xl font-semibold text-charcoal">Manage inventory →</p>
          <p className="mt-1 text-sm text-muted">
            View and update product stock levels.
          </p>
        </button>
      </div>
    </div>
  );
};

export default Profile;
