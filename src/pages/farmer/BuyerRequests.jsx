import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, push, ref, set } from 'firebase/database';
import { calculateTransportCost } from '../../utils/transport';
import { useNavigate } from 'react-router-dom';
import { snapshotToList } from '../../utils/database';

export default function BuyerRequests() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch open buyer requests
        const reqSnap = await get(ref(db, 'buyerRequests'));
        const fetchedReqs = snapshotToList(reqSnap).filter((request) => request.status === 'open');

        // Fetch farmer's own crops to match
        const cropSnap = await get(ref(db, 'crops'));
        const fetchedCrops = snapshotToList(cropSnap).filter((crop) => crop.farmerId === currentUser.uid);

        setFarmerCrops(fetchedCrops);

        // Pre-calculate transport costs for each request to show net value
        const enrichedReqs = await Promise.all(fetchedReqs.map(async (req) => {
          try {
            const transport = await calculateTransportCost(userData.location, req.deliveryLocation, req.quantity);
            const rawValue = req.quantity * req.pricePerUnit;
            const netValue = rawValue - transport.transportCharge;
            return { ...req, transport, netValue };
          } catch (e) {
            console.error("Error calculating transport for req", req.id, e);
            return { ...req, transport: null, netValue: null };
          }
        }));

        setRequests(enrichedReqs);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (userData?.location) {
      fetchData();
    }
  }, [currentUser.uid, userData?.location]);

  async function handleAddToDeal(req) {
    if (!confirm('Are you sure you want to offer to fulfill this request? The buyer will need to confirm.')) return;
    
    // Find a matching crop
    const matchingCrop = farmerCrops.find(c => c.cropName.toLowerCase() === req.cropName.toLowerCase());
    
    try {
      setProcessingId(req.id);
      
      const dealData = {
        cropId: matchingCrop ? matchingCrop.id : null,
        farmerId: currentUser.uid,
        buyerId: req.buyerId,
        quantity: req.quantity,
        pricePerUnit: req.pricePerUnit,
        transportMode: req.transport.mode,
        transportCharge: req.transport.transportCharge,
        netValue: req.netValue,
        deliveryDate: matchingCrop?.deliveryDate || new Date().toISOString().split('T')[0],
        status: 'PENDING_BUYER',
        initiatedBy: 'farmer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const dealRef = push(ref(db, 'deals'));
      await set(dealRef, dealData);
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
      <h2 className="text-2xl font-bold text-gray-900">Open Buyer Requests</h2>
      <p className="text-gray-600">Browse what buyers are looking for and initiate a deal.</p>
      
      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100 text-center">
          <p className="text-gray-500">No open buyer requests found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => {
            const hasMatchingCrop = farmerCrops.some(c => c.cropName.toLowerCase() === req.cropName.toLowerCase());
            
            return (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">{req.cropName}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                    {req.quantity} kg
                  </span>
                </div>
                
                <div className="space-y-2 flex-grow mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price Offered:</span>
                    <span className="font-medium">₹{req.pricePerUnit}/kg</span>
                  </div>
                  {req.transport && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transport ({req.transport.distanceKm}km {req.transport.mode}):</span>
                        <span className="text-red-500 font-medium">- ₹{req.transport.transportCharge}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                        <span className="text-gray-900">Net Value:</span>
                        <span className="text-green-600">₹{req.netValue}</span>
                      </div>
                    </>
                  )}
                  <div className="text-xs text-gray-500 mt-2 truncate">
                    📍 {req.deliveryLocation?.address}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToDeal(req)}
                  disabled={processingId === req.id || !hasMatchingCrop}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${hasMatchingCrop 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-300 cursor-not-allowed'
                    } focus:outline-none transition-colors`}
                  title={!hasMatchingCrop ? "You don't have this crop listed." : ""}
                >
                  {processingId === req.id ? 'Processing...' : (hasMatchingCrop ? 'Add to Deal' : 'No Matching Crop')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
