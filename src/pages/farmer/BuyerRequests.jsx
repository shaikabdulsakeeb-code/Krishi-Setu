import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, onValue, push, ref, set, update } from 'firebase/database';
import { calculateTransportCost } from '../../utils/transport';
import { Link, useNavigate } from 'react-router-dom';
import { snapshotToList } from '../../utils/database';
import { useConfirm } from '../../contexts/ConfirmContext';

const CROP_MARKS = {
  onion: '🧅', tomato: '🍅', chilli: '🌶️', chili: '🌶️', potato: '🥔',
  rice: '🌾', paddy: '🌾', wheat: '🌾', maize: '🌽', corn: '🌽',
  banana: '🍌', mango: '🥭', coconut: '🥥', carrot: '🥕',
};

function cropMark(cropName = '') {
  const match = Object.keys(CROP_MARKS).find((crop) => cropName.toLowerCase().includes(crop));
  return match ? CROP_MARKS[match] : '🌿';
}

function locationLabel(location) {
  const address = location?.address?.trim();
  if (!address || address.toLowerCase() === 'captured via gps') return 'Location saved';
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length > 2 && /india$/i.test(parts.at(-1))) parts.pop();
  return parts.length > 1 ? parts.slice(-2).join(', ') : parts[0];
}

function locationDetail(location) {
  if (location?.lat && location?.lng) return `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`;
  return location?.address === 'Captured via GPS' ? 'Captured via GPS' : '';
}

export default function BuyerRequests() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  
  const [requests, setRequests] = useState([]);
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'buyerRequests'), async (snapshot) => {
      try {
        const fetchedReqs = snapshotToList(snapshot).filter((request) => request.status === 'open');

        // Fetch farmer's own crops to match
        const cropSnap = await get(ref(db, 'crops'));
        const fetchedCrops = snapshotToList(cropSnap).filter((crop) => crop.farmerId === currentUser.uid);

        setFarmerCrops(fetchedCrops);

        const enrichedReqs = await Promise.all(fetchedReqs.map(async (req) => {
          const buyerSnap = await get(ref(db, `users/${req.buyerId}`));
          const buyer = buyerSnap.exists() ? buyerSnap.val() : null;
          const matchingCrop = fetchedCrops.find(c => c.cropName.toLowerCase() === req.cropName.toLowerCase());
          const farmerLocation = matchingCrop?.cropLocation || userData?.location;

          if (!farmerLocation || !req.deliveryLocation) {
            return { ...req, buyer, transport: null, netValue: null };
          }

          try {
            const transport = await calculateTransportCost(farmerLocation, req.deliveryLocation, req.quantity);
            const rawValue = req.quantity * req.pricePerUnit;
            const netValue = rawValue - transport.transportCharge;
            return { ...req, buyer, transport, netValue };
          } catch (e) {
            console.error("Error calculating transport for req", req.id, e);
            return { ...req, buyer, transport: null, netValue: null };
          }
        }));

        // Sort by netValue descending
        enrichedReqs.sort((a, b) => (b.netValue || 0) - (a.netValue || 0));
        
        setRequests(enrichedReqs);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser.uid, userData?.location]);

  async function handleAddToDeal(req) {
    if (!userData?.location) {
      alert('Please complete your profile location before offering on buyer requests. It is needed to calculate transport.');
      navigate('/farmer/profile');
      return;
    }
    if (!req.transport) {
      alert('This request is missing a delivery location, so transport cannot be calculated yet.');
      return;
    }
    if (!(await confirm('Are you sure you want to offer to fulfill this request? The buyer will need to confirm.'))) return;
    
    // Find a matching crop
    const matchingCrop = farmerCrops.find(c => c.cropName.toLowerCase() === req.cropName.toLowerCase());
    
    try {
      setProcessingId(req.id);
      
      const dealData = {
        cropId: matchingCrop ? matchingCrop.id : null,
        cropName: req.cropName,
        farmerId: currentUser.uid,
        buyerId: req.buyerId,
        quantity: req.quantity,
        pricePerUnit: req.pricePerUnit,
        transportMode: req.transport.mode,
        transportCharge: req.transport.transportCharge,
        transportDistanceKm: req.transport.distanceKm,
        transportSource: req.transport.source,
        netValue: req.netValue,
        deliveryDate: matchingCrop?.deliveryDate || new Date().toISOString().split('T')[0],
        status: 'PENDING_BUYER',
        initiatedBy: 'farmer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const dealRef = push(ref(db, 'deals'));
      await set(dealRef, dealData);
      try {
        await update(ref(db, `buyerRequests/${req.id}`), {
          status: 'deal_sent',
          dealId: dealRef.key,
          updatedAt: new Date().toISOString(),
        });
      } catch (requestError) {
        console.warn('Deal was created, but request status could not be updated.', requestError);
      }
      alert('Deal initiated! Waiting for buyer to confirm.');
      navigate('/farmer/deals');
    } catch (err) {
      alert('Error initiating deal: ' + err.message);
      setProcessingId(null);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-headline-lg ">Open Buyer Requests</h2>
      <p className="text-gray-600">Browse what buyers are looking for and initiate a deal.</p>
      
      {requests.length === 0 ? (
        <div className="ledger-card p-8 text-center">
          <p className="text-gray-500">No open buyer requests found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => {
            const hasMatchingCrop = farmerCrops.some(c => c.cropName.toLowerCase() === req.cropName.toLowerCase());
            const canOffer = hasMatchingCrop && Boolean(req.transport);
            
            return (
              <article key={req.id} className="ledger-card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                <div className="border-b border-[var(--border)] bg-[var(--bg-card-alt)] p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--bg-card)] text-3xl shadow-sm" aria-hidden="true">{cropMark(req.cropName)}</span>
                      <h3 className="min-w-0 text-lg font-semibold text-[var(--primary-dark)] capitalize leading-tight">{req.cropName}</h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-[var(--primary-dark)]">
                      {req.quantity} kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {req.buyer?.name?.charAt(0) || 'B'}
                    </div>
                    <span className="font-medium text-gray-900">{req.buyer?.name || 'Buyer'}</span>
                  </div>
                </div>
                
                <div className="flex-grow space-y-4 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--text-secondary)]">Offered Price</span>
                    <span className="text-lg font-bold text-[var(--accent-gold)]">₹{req.pricePerUnit}<span className="text-xs font-normal text-[var(--text-secondary)]">/kg</span></span>
                  </div>

                  {req.transport && (
                    <div className="space-y-2">
                      <div className="flex justify-between gap-3 text-sm text-[var(--text-secondary)]">
                        <span>Expected Transport ({req.transport.distanceKm}km {req.transport.mode})</span>
                        <span className="shrink-0 font-medium text-[var(--danger)]">- ₹{req.transport.transportCharge}</span>
                      </div>
                      <div className={`flex items-end justify-between gap-3 rounded-xl px-4 py-3 ${Number(req.netValue) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div>
                          <span className="block text-sm font-semibold text-[var(--text-primary)]">Expected Net Value</span>
                          <span className="mt-1 block text-xs text-[var(--text-secondary)]">{Number(req.netValue) >= 0 ? '✓ Good deal estimate' : '⚠ Low margin estimate'}</span>
                        </div>
                        <span className={`shrink-0 text-[22px] leading-none font-bold ${Number(req.netValue) >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{req.netValue}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 border-t border-[var(--border)] pt-3 text-sm text-[var(--text-secondary)]" title={locationDetail(req.deliveryLocation)}>
                    <span className="mt-0.5" aria-hidden="true">📍</span>
                    <div className="min-w-0">
                      <span className="block truncate font-medium text-[var(--text-primary)]">{locationLabel(req.deliveryLocation)}</span>
                      {locationDetail(req.deliveryLocation) && <span className="mt-0.5 block text-xs">{locationDetail(req.deliveryLocation) === 'Captured via GPS' ? 'Captured via GPS' : 'GPS location available'}</span>}
                    </div>
                  </div>

                  {!req.transport && (
                    <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-100">
                      Expected transport cost will appear after both buyer and farmer locations are saved.
                    </p>
                  )}
                </div>

                <div className="border-t border-[var(--border)] bg-[var(--bg-card-alt)] p-4">
                  {!hasMatchingCrop ? (
                    <Link to="/farmer/add-crop" className="btn-secondary w-full px-4 py-2.5 text-sm">No matching crop — Add this crop</Link>
                  ) : (
                  <button
                    onClick={() => handleAddToDeal(req)}
                    disabled={processingId === req.id || !canOffer}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm transition-all duration-200
                      ${canOffer 
                        ? 'btn-primary' 
                        : 'border border-[var(--text-secondary)] bg-transparent text-[var(--text-secondary)] cursor-not-allowed font-semibold'
                      } focus:outline-none`}
                    title={!req.transport ? 'A saved farmer and buyer location is required.' : ''}
                  >
                    {processingId === req.id ? 'Processing...' : (canOffer ? 'Offer Deal' : 'Location Required')}
                  </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
