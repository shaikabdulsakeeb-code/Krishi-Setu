import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { push, ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

export default function AddCrop() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [status, setStatus] = useState('pre_harvest'); // 'pre_harvest' | 'harvested'
  const [estimatedHarvestDate, setEstimatedHarvestDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const cropData = {
        farmerId: currentUser.uid,
        cropName,
        quantity: Number(quantity),
        unit,
        status,
        estimatedHarvestDate: status === 'pre_harvest' ? estimatedHarvestDate : null,
        deliveryDate: status === 'harvested' ? deliveryDate : null,
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
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">List a New Crop</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomato, Wheat, Onion"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="tonnes">Tonnes</option>
              <option value="quintal">Quintal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Status</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-green-600 focus:ring-green-500"
                  name="status"
                  value="pre_harvest"
                  checked={status === 'pre_harvest'}
                  onChange={() => setStatus('pre_harvest')}
                />
                <span className="ml-2 text-sm text-gray-700">Pre-harvest</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-green-600 focus:ring-green-500"
                  name="status"
                  value="harvested"
                  checked={status === 'harvested'}
                  onChange={() => setStatus('harvested')}
                />
                <span className="ml-2 text-sm text-gray-700">Already Harvested</span>
              </label>
            </div>
          </div>

          {status === 'pre_harvest' ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Harvest Date</label>
              <input
                type="date"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={estimatedHarvestDate}
                onChange={(e) => setEstimatedHarvestDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Delivery Date</label>
              <input
                type="date"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {loading ? 'Submitting...' : 'List Crop'}
          </button>
        </div>
      </form>
    </div>
  );
}
