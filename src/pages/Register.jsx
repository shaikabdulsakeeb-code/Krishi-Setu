import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      return setError('Password must contain at least 6 characters.');
    }
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await register(email, password, role);
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegistration() {
    try {
      setError('');
      setLoading(true);
      const { profile } = await loginWithGoogle(role);
      navigate(profile.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (err) {
      const messages = {
        'auth/popup-closed-by-user': 'Google sign-up was cancelled.',
        'auth/account-exists-with-different-credential': 'This email already uses password sign-in. Please sign in with your password.',
      };
      setError(messages[err.code] || 'Unable to continue with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="ledger-card max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <Sprout className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-headline-lg mt-6">Join Krishi Setu</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">Sign in</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center font-medium">{error}</div>}
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'farmer' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('farmer')}
            >
              I am a Farmer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'buyer' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('buyer')}
            >
              I am a Buyer
            </button>
          </div>

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength="6"
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">or</span></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleRegistration}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-base font-bold text-blue-600">G</span>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
