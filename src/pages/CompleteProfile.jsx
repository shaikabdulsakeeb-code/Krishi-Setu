import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';
import { MapPin, Loader2, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress } from '../utils/transport';

export default function CompleteProfile() {
  const { currentUser, userData, updateProfileData } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(() => userData?.name || currentUser?.displayName || '');
  const [phone, setPhone] = useState(() => userData?.phone || '');
  const [location, setLocation] = useState(() => userData?.location || null); // { lat, lng, address }
  const [addressInput, setAddressInput] = useState(() => userData?.location?.address || '');
  const [governmentFarmerId, setGovernmentFarmerId] = useState(() => userData?.governmentFarmerId || '');
  const [traderId, setTraderId] = useState(() => userData?.traderId || '');
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(() => userData?.businessLicenseNumber || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locating, setLocating] = useState(false);
  const isFarmer = userData?.role === 'farmer';
  const isBuyer = userData?.role === 'buyer';
  const isProfileComplete = Boolean(
    userData?.phone &&
    userData?.name &&
    userData?.location &&
    (!isFarmer || userData?.governmentFarmerId) &&
    (!isBuyer || (userData?.traderId && userData?.businessLicenseNumber))
  );

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
    if (!name || !phone || !location || !addressInput.trim()) {
      return setError('Please fill in all fields and provide your location.');
    }
    if (isFarmer && !governmentFarmerId.trim()) {
      return setError('Please enter your government Farmer ID.');
    }
    if (isBuyer && (!traderId.trim() || !businessLicenseNumber.trim())) {
      return setError('Please enter your Trader ID and Business License Number.');
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const address = addressInput.trim();
      const needsGeocode = !location?.lat || !location?.lng || location.address !== address;
      const updatedLocation = needsGeocode
        ? await geocodeAddress(address)
        : { ...location, address };
      const userRef = ref(db, `users/${currentUser.uid}`);
      
      const profileUpdates = {
        name: name.trim(),
        phone: phone.trim(),
        location: updatedLocation,
        governmentFarmerId: isFarmer ? governmentFarmerId.trim() : null,
        traderId: isBuyer ? traderId.trim() : null,
        businessLicenseNumber: isBuyer ? businessLicenseNumber.trim() : null,
        profileCompleted: true,
        profilePic: currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      };

      await update(userRef, profileUpdates);
      updateProfileData({ ...userData, ...profileUpdates });

      setSuccess('Profile saved successfully.');
      const dashboardPath = userData?.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
      setTimeout(() => navigate(dashboardPath), 700);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-4 sm:py-8">
      <div className="ledger-card max-w-2xl mx-auto space-y-8 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <UserCircle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">{isProfileComplete ? 'Profile' : 'Complete profile'}</p>
            <h2 className="text-headline-lg mt-1 sm:">{isProfileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}</h2>
            <p className="mt-2 text-gray-600">
              Save your ID details, phone number, and location so transport, buyer requests, and deal contact details work correctly.
            </p>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">{success}</div>}
          
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p><span className="font-medium text-gray-800">Email:</span> {currentUser?.email}</p>
              <p className="mt-1 capitalize"><span className="font-medium text-gray-800">Account type:</span> {userData?.role || 'buyer'}</p>
            </div>

            {isFarmer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Government Farmer ID</label>
                <input
                  type="text"
                  required
                  className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                  placeholder="Enter your government-issued farmer ID"
                  value={governmentFarmerId}
                  onChange={(e) => setGovernmentFarmerId(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {isBuyer && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trader ID</label>
                  <input
                    type="text"
                    required
                    className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                    placeholder="Enter trader ID"
                    value={traderId}
                    onChange={(e) => setTraderId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business License Number</label>
                  <input
                    type="text"
                    required
                    className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                    placeholder="Enter license number"
                    value={businessLicenseNumber}
                    onChange={(e) => setBusinessLicenseNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="form-input px-3 py-2 w-full relative block w-full focus:z-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="flex space-x-2">
                <textarea
                  required
                  rows="3"
                  placeholder="Street Address, City, State"
                  className="form-input px-3 py-2 w-full flex-1 block resize-none rounded-lg"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setLocation((currentLocation) => ({
                      lat: currentLocation?.address === e.target.value ? currentLocation?.lat || 0 : 0,
                      lng: currentLocation?.address === e.target.value ? currentLocation?.lng || 0 : 0,
                      address: e.target.value,
                    }));
                  }}
                ></textarea>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="form-input px-3 py-2 w-full inline-flex items-center shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
                >
                  {locating ? <Loader2 className="h-5 w-5 animate-spin text-green-600" /> : <MapPin className="h-5 w-5 text-green-600" />}
                  <span className="ml-2 hidden sm:inline">Use GPS</span>
                </button>
              </div>
              {location && location.lat !== 0 && (
                <p className="mt-1 text-xs text-green-600 font-medium">Location coordinates saved successfully.</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#033621] hover:bg-[#1f4d36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033621] transition-colors"
            >
              {loading ? 'Saving...' : (isProfileComplete ? 'Save Profile' : 'Complete Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
