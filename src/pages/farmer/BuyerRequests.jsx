import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, onValue, push, ref, set, update } from 'firebase/database';
import { calculateTransportCost } from '../../utils/transport';
import { useNavigate } from 'react-router-dom';
import { snapshotToList } from '../../utils/database';
import { useConfirm } from '../../contexts/ConfirmContext';

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
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="p-6 border-b border-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 capitalize flex items-center gap-2">
                      <span className="text-2xl">🌾</span> {req.cropName}
                    </h3>
                    <span className="bg-[#e4efe7] text-[#033621] text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
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
                
                <div className="p-6 space-y-4 flex-grow bg-gray-50/30">
                  <div className="flex justify-between items-center text-sm bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <span className="text-gray-500 font-medium">Offered Price</span>
                    <span className="font-bold text-lg text-[#033621]">₹{req.pricePerUnit}<span className="text-xs text-gray-500 font-normal">/kg</span></span>
                  </div>

                  {req.transport && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Transport ({req.transport.distanceKm}km {req.transport.mode})</span>
                        <span className="text-red-500 font-medium">- ₹{req.transport.transportCharge}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Your Net Value</span>
                        <span className="text-[#3a674f] text-lg">₹{req.netValue}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 text-xs text-gray-500 mt-2 bg-blue-50/50 p-2 rounded-md">
                    <span className="text-blue-500 mt-0.5">📍</span> 
                    <span className="line-clamp-2">{req.deliveryLocation?.address || 'Delivery location not available'}</span>
                  </div>

                  {!req.transport && (
                    <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-100">
                      Transport charge will appear after both buyer and farmer locations are saved.
                    </p>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-gray-50">
                  <button
                    onClick={() => handleAddToDeal(req)}
                    disabled={processingId === req.id || !canOffer}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold shadow-sm transition-all duration-200
                      ${canOffer 
                        ? 'bg-[#033621] text-white hover:bg-[#1a4a36] hover:shadow-md' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } focus:outline-none`}
                    title={!hasMatchingCrop ? "You don't have this crop listed." : (!req.transport ? 'A saved farmer and buyer location is required.' : '')}
                  >
                    {processingId === req.id ? 'Processing...' : (canOffer ? 'Offer Deal' : (!hasMatchingCrop ? 'No Matching Crop' : 'Location Required'))}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
