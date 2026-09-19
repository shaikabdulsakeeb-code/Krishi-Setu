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
      <div className="ledger-card rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Edit Crop Details</h3>
          <button aria-label="Close edit crop dialog" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--cream)] text-2xl leading-none">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                className="form-input px-3 py-2 w-full border-gray-300 rounded-md"
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
                <span className="ml-2 text-sm text-gray-700">Pre-harvest</span>
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
                <span className="ml-2 text-sm text-gray-700">Harvested</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-[var(--line)] rounded-md text-sm font-medium text-[var(--cream)] bg-[var(--glass)] hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2 px-4 text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
