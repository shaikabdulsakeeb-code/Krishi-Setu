import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { onValue, push, ref, remove, set } from 'firebase/database';
import { geocodeAddress } from '../../utils/transport';
import { snapshotToList } from '../../utils/database';
import EditCropModal from '../../components/EditCropModal';
import { useConfirm } from '../../contexts/ConfirmContext';
import { Edit2, Trash2 } from 'lucide-react';

export default function AddCrop() {
  const { currentUser, userData } = useAuth();
  const confirm = useConfirm();

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
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'crops'), (snapshot) => {
      setCrops(snapshotToList(snapshot).filter((crop) => crop.farmerId === currentUser.uid));
    }, () => setCrops([]));
    return () => unsubscribe();
  }, [currentUser.uid]);

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
      setCropName('');
      setQuantity('');
      setEstimatedHarvestDate('');
      setDeliveryDate('');
      
    } catch (err) {
      setError('Failed to add crop: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="ledger-card max-w-2xl mx-auto p-6 sm:p-8">
        <h2 className="text-headline-lg mb-2">List a New Crop</h2>
        <p className="mb-6 text-sm text-[var(--muted)]">Your listed crops appear below and can be updated or removed here.</p>
      
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

      <section className="max-w-5xl mx-auto">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-headline-md">Your listed crops</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{crops.length} crop{crops.length === 1 ? '' : 's'} listed</p>
          </div>
        </div>

        {crops.length === 0 ? (
          <div className="ledger-card p-8 text-center text-[var(--muted)]">
            You have not listed any crops yet. Add your first crop using the form above.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop) => (
              <article key={crop.id} className="ledger-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold capitalize text-[var(--cream)]">{crop.cropName}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{crop.quantity} {crop.unit}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${crop.status === 'harvested' ? 'bg-[var(--sun-2)] text-[var(--bg-1)]' : 'bg-amber-100 text-amber-900'}`}>
                    {crop.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-4 text-xs text-[var(--muted)]">
                  {crop.status === 'harvested' ? `Delivery: ${crop.deliveryDate || 'Not set'}` : `Estimated harvest: ${crop.estimatedHarvestDate || 'Not set'}`}
                </p>
                <div className="mt-4 flex gap-2 border-t border-[var(--line)] pt-4">
                  <button type="button" onClick={() => setEditingCrop(crop)} className="btn-success flex-1 px-3 py-2 text-sm">
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (await confirm(`Remove ${crop.cropName} from your crop listings?`)) {
                        await remove(ref(db, `crops/${crop.id}`));
                      }
                    }}
                    className="btn-danger flex-1 px-3 py-2 text-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <EditCropModal isOpen={Boolean(editingCrop)} crop={editingCrop} onClose={() => setEditingCrop(null)} />
    </div>
  );
}
