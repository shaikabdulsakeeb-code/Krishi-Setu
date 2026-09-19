import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';

export default function EditCropModal({ isOpen, onClose, crop }) {
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [status, setStatus] = useState('pre_harvest');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crop) {
      setCropName(crop.cropName || '');
      setQuantity(crop.quantity || '');
      setUnit(crop.unit || 'kg');
      setStatus(crop.status || 'pre_harvest');
    }
  }, [crop]);

  if (!isOpen || !crop) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await update(ref(db, `crops/${crop.id}`), {
        cropName,
        quantity: Number(quantity),
        unit,
        status,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      alert('Failed to update crop: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Edit Crop Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
            <input
              type="text"
              required
              className="form-input px-3 py-2 w-full border-gray-300 rounded-md"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                className="form-input px-3 py-2 w-full border-gray-300 rounded-md"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                className="form-input px-3 py-2 w-full border-gray-300 rounded-md bg-white"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tonnes">Tonnes</option>
                <option value="quintal">Quintal</option>
              </select>
            </div>
          </div>

          <div>
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
                <span className="ml-2 text-sm text-gray-700">Harvested</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
