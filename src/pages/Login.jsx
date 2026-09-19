import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const { profile } = await login(email, password);
      if (profile.role === 'admin') navigate('/admin/dashboard');
      else if (profile.role === 'farmer') navigate('/farmer/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'The email address or password is incorrect.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      };
      setError(messages[err.code] || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      const { profile } = await loginWithGoogle();
      if (profile.role === 'admin') navigate('/admin/dashboard');
      else if (profile.role === 'farmer') navigate('/farmer/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      const messages = {
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/account-exists-with-different-credential': 'This email already uses password sign-in. Please sign in with your password.',
      };
      setError(messages[err.code] || 'Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-1)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="ledger-card max-w-md w-full space-y-8 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--sun)] to-transparent rounded-bl-full -z-10 opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="mx-auto h-16 w-16 bg-[var(--bg-2)] rounded-full flex items-center justify-center border border-[var(--line)] shadow-lg">
            <Sprout className="h-8 w-8 text-[var(--sun-2)]" />
          </div>
          <h2 className="text-3xl font-serif font-bold mt-6 text-[var(--cream)]">Sign in to Krishi Setu</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Or <Link to="/register" className="font-medium text-[var(--sun-2)] hover:text-[var(--sun)] transition-colors">create a new account</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-md text-sm text-center font-medium">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--cream)] mb-1" htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--cream)] mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--line)]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[var(--bg-1)] px-2 text-[var(--muted)]">or</span></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--glass)] px-4 py-3 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--bg-card-alt)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
