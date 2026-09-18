import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, push, ref, set } from 'firebase/database';
import { calculateTransportCost } from '../../utils/transport';
import { useNavigate } from 'react-router-dom';
import { snapshotToList } from '../../utils/database';

export default function BrowseCrops() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'request'
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Browse state
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [calculatedTransport, setCalculatedTransport] = useState(null);
  
  // General request state
  const [reqCropName, setReqCropName] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqPrice, setReqPrice] = useState('');
  
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const cropSnap = await get(ref(db, 'crops'));
        const fetchedCrops = snapshotToList(cropSnap)
          .filter((crop) => crop.farmerId !== currentUser.uid && crop.status !== 'sold');
        
        // Fetch farmer details for each crop to get their location for transport calculation
        const enrichedCrops = await Promise.all(fetchedCrops.map(async (crop) => {
          const farmerSnap = await get(ref(db, `users/${crop.farmerId}`));
          if (farmerSnap.exists()) {
            return { ...crop, farmer: farmerSnap.val() };
          }
          return crop;
        }));
        
        setCrops(enrichedCrops);
      } catch (err) {
        console.error("Error fetching crops", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCrops();
  }, [currentUser.uid]);

  // Path 1: Request specific crop
  async function handleCalculateDeal() {
    if (!selectedCrop || !offerPrice || !offerQuantity) return;
    if (Number(offerQuantity) <= 0 || Number(offerPrice) <= 0) {
      alert('Enter a quantity and price greater than zero.');
      return;
    }
    if (selectedCrop.unit === 'kg' && Number(offerQuantity) > selectedCrop.quantity) {
      alert(`Only ${selectedCrop.quantity} kg is available for this crop.`);
      return;
    }
    if (!selectedCrop.farmer?.location || !userData?.location) {
      alert('Both buyer and farmer need a saved location before transport can be calculated.');
      return;
    }
    
    try {
      const transport = await calculateTransportCost(
        selectedCrop.farmer.location, 
        userData.location, 
        Number(offerQuantity)
      );
      setCalculatedTransport(transport);
    } catch (err) {
      alert("Error calculating transport: " + err.message);
    }
  }

  async function handleConfirmDeal() {
    try {
      setProcessing(true);
      const rawValue = Number(offerQuantity) * Number(offerPrice);
      const netValue = rawValue; // Transport is added to the buyer's total, not deducted from the farmer's crop payment.

      const dealData = {
        cropId: selectedCrop.id,
        farmerId: selectedCrop.farmerId,
        buyerId: currentUser.uid,
        quantity: Number(offerQuantity),
        pricePerUnit: Number(offerPrice),
        transportMode: calculatedTransport.mode,
        transportCharge: calculatedTransport.transportCharge,
        netValue: netValue, // Farmer receives this
        deliveryDate: selectedCrop.deliveryDate || selectedCrop.estimatedHarvestDate || new Date().toISOString().split('T')[0],
        status: 'PENDING_FARMER',
        initiatedBy: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const dealRef = push(ref(db, 'deals'));
      await set(dealRef, dealData);
      alert('Deal offer sent to farmer! Waiting for their approval.');
      navigate('/buyer/deals');
    } catch (err) {
      alert("Error sending deal offer: " + err.message);
    } finally {
      setProcessing(false);
    }
  }

  // Path 2: Post general request
  async function handlePostRequest(e) {
    e.preventDefault();
    try {
      setProcessing(true);
      const requestData = {
        buyerId: currentUser.uid,
        cropName: reqCropName,
        quantity: Number(reqQuantity),
        pricePerUnit: Number(reqPrice),
        deliveryLocation: userData.location,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const requestRef = push(ref(db, 'buyerRequests'));
      await set(requestRef, requestData);
      alert('General request posted! Farmers will be able to see it and offer deals.');
      
      setReqCropName('');
      setReqQuantity('');
      setReqPrice('');
    } catch (err) {
      alert("Error posting request: " + err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Crop Market</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`${activeTab === 'browse' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Browse Farmers' Crops
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`${activeTab === 'request' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Post a General Request
          </button>
        </nav>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading crops...</div>
            ) : crops.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow border border-gray-100 text-center text-gray-500">
                No crops listed currently.
              </div>
            ) : (
              crops.map(crop => (
                <div 
                  key={crop.id} 
                  onClick={() => { setSelectedCrop(crop); setCalculatedTransport(null); }}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-colors ${selectedCrop?.id === crop.id ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 capitalize">{crop.cropName}</h3>
                      <p className="text-sm text-gray-500">Farmer: {crop.farmer?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-xs mt-1">📍 {crop.farmer?.location?.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                        {crop.quantity} {crop.unit} available
                      </span>
                      <p className="text-xs text-gray-500 mt-2 capitalize">{crop.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            {selectedCrop ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Offer Deal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedCrop.unit === 'kg' ? selectedCrop.quantity : undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      value={offerQuantity}
                      onChange={(e) => { setOfferQuantity(e.target.value); setCalculatedTransport(null); }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price per kg (₹)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      value={offerPrice}
                      onChange={(e) => { setOfferPrice(e.target.value); setCalculatedTransport(null); }}
                    />
                  </div>

                  {!calculatedTransport ? (
                    <button
                      onClick={handleCalculateDeal}
                      disabled={!offerQuantity || !offerPrice}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      Calculate Transport & Total
                    </button>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Crop Value:</span>
                        <span>₹{Number(offerQuantity) * Number(offerPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transport ({calculatedTransport.distanceKm}km {calculatedTransport.mode}):</span>
                        <span className="text-red-500">+ ₹{calculatedTransport.transportCharge}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span className="text-gray-900">Total You Pay:</span>
                        <span className="text-green-600">₹{(Number(offerQuantity) * Number(offerPrice)) + calculatedTransport.transportCharge}</span>
                      </div>
                      <button
                        onClick={handleConfirmDeal}
                        disabled={processing}
                        className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        {processing ? 'Sending...' : 'Send Deal Offer to Farmer'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                Select a crop from the list to initiate a deal.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl bg-white rounded-xl shadow border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Post a General Request</h3>
          <p className="text-sm text-gray-500 mb-6">Can't find what you're looking for? Post a request and let farmers come to you.</p>
          
          <form onSubmit={handlePostRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={reqCropName}
                onChange={(e) => setReqCropName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={reqPrice}
                  onChange={(e) => setReqPrice(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={processing}
              className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
            >
              {processing ? 'Posting...' : 'Post Request'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
