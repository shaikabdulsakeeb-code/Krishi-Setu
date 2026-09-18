import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';
import { MapPin, Loader2 } from 'lucide-react';

export default function CompleteProfile() {
  const { currentUser } = useAuth();
  
  const [name, setName] = useState(() => currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null); // { lat, lng, address }
  const [addressInput, setAddressInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  async function handleGetLocation() {
    setLocating(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Captured via GPS'
        });
        setAddressInput('Captured via GPS');
        setLocating(false);
      },
      () => {
        setError('Unable to retrieve your location. Please enter it manually or grant permission.');
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !phone || !location) {
      return setError('Please fill in all fields and provide your location.');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const updatedLocation = { ...location, address: addressInput };
      const userRef = ref(db, `users/${currentUser.uid}`);
      
      await update(userRef, {
        name,
        phone,
        location: updatedLocation,
        profileCompleted: true,
        profilePic: currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      });

      // Force reload to get fresh userData from context or simply navigate
      window.location.href = '/'; 
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">
            Welcome to Krishi Setu! Please provide a few more details before we get started.
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  placeholder="Street Address, City, State"
                  className="flex-1 appearance-none rounded-lg block px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    if (!location) setLocation({ lat: 0, lng: 0, address: e.target.value }); // rough fallback if they just type
                  }}
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {locating ? <Loader2 className="h-5 w-5 animate-spin text-green-600" /> : <MapPin className="h-5 w-5 text-green-600" />}
                  <span className="ml-2 hidden sm:inline">Use GPS</span>
                </button>
              </div>
              {location && location.lat !== 0 && (
                <p className="mt-1 text-xs text-green-600 font-medium">Location captured successfully via GPS.</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
