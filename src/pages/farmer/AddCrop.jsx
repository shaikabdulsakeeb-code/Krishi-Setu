import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { push, ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress } from '../../utils/transport';

export default function AddCrop() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [status, setStatus] = useState('pre_harvest'); // 'pre_harvest' | 'harvested'
  const [estimatedHarvestDate, setEstimatedHarvestDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cropLocationInput, setCropLocationInput] = useState(() => userData?.location?.address || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const trimmedCropLocation = cropLocationInput.trim();
      const shouldGeocodeCropLocation = trimmedCropLocation && (
        trimmedCropLocation !== userData?.location?.address ||
        !userData?.location?.lat ||
        !userData?.location?.lng
      );
      const cropLocation = shouldGeocodeCropLocation
        ? await geocodeAddress(trimmedCropLocation)
        : userData?.location;

      if (!cropLocation?.lat || !cropLocation?.lng) {
        throw new Error('Please enter a crop pickup location or complete your profile location.');
      }
      
      const cropData = {
        farmerId: currentUser.uid,
        cropName: cropName.trim(),
        quantity: Number(quantity),
        unit,
        status,
        estimatedHarvestDate: status === 'pre_harvest' ? estimatedHarvestDate : null,
        deliveryDate: status === 'harvested' ? deliveryDate : null,
        cropLocation,
        createdAt: new Date().toISOString()
      };

      const cropRef = push(ref(db, 'crops'));
      await set(cropRef, cropData);
      setSuccess('Crop listed successfully!');
      setTimeout(() => navigate('/farmer/dashboard'), 2000);
      
    } catch (err) {
      setError('Failed to add crop: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ledger-card max-w-2xl mx-auto p-6 sm:p-8">
      <h2 className="text-headline-lg mb-6">List a New Crop</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--cream)] mb-1">Crop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomato, Wheat, Onion"
              className="form-input px-3 py-2 w-full relative block w-full"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--cream)] mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              className="form-input px-3 py-2 w-full relative block w-full"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--cream)] mb-1">Unit</label>
            <select
              className="form-input px-3 py-2 w-full relative block w-full"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="tonnes">Tonnes</option>
              <option value="quintal">Quintal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--cream)] mb-1">Harvest Status</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[var(--sun-2)] focus:ring-[var(--sun-2)]"
                  name="status"
                  value="pre_harvest"
                  checked={status === 'pre_harvest'}
                  onChange={() => setStatus('pre_harvest')}
                />
                <span className="ml-2 text-sm text-[var(--cream)]">Pre-harvest</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[var(--sun-2)] focus:ring-[var(--sun-2)]"
                  name="status"
                  value="harvested"
                  checked={status === 'harvested'}
                  onChange={() => setStatus('harvested')}
                />
                <span className="ml-2 text-sm text-[var(--cream)]">Already Harvested</span>
              </label>
            </div>
          </div>

          {status === 'pre_harvest' ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--cream)] mb-1">Estimated Harvest Date</label>
              <input
                type="date"
                required
                className="form-input px-3 py-2 w-full relative block w-full"
                value={estimatedHarvestDate}
                onChange={(e) => setEstimatedHarvestDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--cream)] mb-1">Available Delivery Date</label>
              <input
                type="date"
                required
                className="form-input px-3 py-2 w-full relative block w-full"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--cream)] mb-1">Crop Pickup Location</label>
            <input
              type="text"
              required
              placeholder="Farm, village, city, state"
              className="form-input px-3 py-2 w-full relative block w-full"
              value={cropLocationInput}
              onChange={(e) => setCropLocationInput(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">Used to calculate transport charges. Leave as your profile location or enter another farm/pickup address.</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 px-4 text-sm"
          >
            {loading ? 'Submitting...' : 'List Crop'}
          </button>
        </div>
      </form>
    </div>
  );
}
