import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, onValue, push, ref, set, update } from 'firebase/database';
import { calculateTransportCost } from '../../utils/transport';
import { useNavigate } from 'react-router-dom';
import { snapshotToList } from '../../utils/database';
import { geocodeAddress } from '../../utils/transport';

export default function BrowseCrops({ initialTab = 'browse' }) {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'browse' | 'request' | 'myRequests'
  const [crops, setCrops] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Browse state
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [calculatedTransport, setCalculatedTransport] = useState(null);
  
  // General request state
  const [reqCropName, setReqCropName] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqPrice, setReqPrice] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
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

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'buyerRequests'), (snapshot) => {
      const requests = snapshotToList(snapshot)
        .filter((request) => request.buyerId === currentUser.uid)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMyRequests(requests);
      setRequestsLoading(false);
    }, (err) => {
      console.error('Error fetching buyer requests', err);
      setMyRequests([]);
      setRequestsLoading(false);
    });

    return () => unsubscribe();
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
        selectedCrop.cropLocation || selectedCrop.farmer.location, 
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
        transportDistanceKm: calculatedTransport.distanceKm,
        transportSource: calculatedTransport.source,
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
    if (!userData?.location) {
      alert('Please complete your profile location before posting a request. Farmers need it to calculate transport.');
      navigate('/buyer/profile');
      return;
    }
    if (Number(reqQuantity) <= 0 || Number(reqPrice) <= 0) {
      alert('Enter a quantity and target price greater than zero.');
      return;
    }

    try {
      setProcessing(true);
      const typedDeliveryAddress = deliveryAddress.trim();
      const requestLocation = typedDeliveryAddress
        ? await geocodeAddress(typedDeliveryAddress)
        : userData.location;
      const requestData = {
        buyerId: currentUser.uid,
        cropName: reqCropName.trim(),
        quantity: Number(reqQuantity),
        pricePerUnit: Number(reqPrice),
        deliveryLocation: requestLocation,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const requestRef = push(ref(db, 'buyerRequests'));
      await set(requestRef, requestData);
      alert('General request posted! Farmers will be able to see it and offer deals.');
      
      setReqCropName('');
      setReqQuantity('');
      setReqPrice('');
      setDeliveryAddress('');
      setActiveTab('myRequests');
      navigate('/buyer/requests');
    } catch (err) {
      alert("Error posting request: " + err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancelRequest(requestId) {
    if (!confirm('Cancel this crop request? Farmers will no longer see it as open.')) return;
    try {
      await update(ref(db, `buyerRequests/${requestId}`), {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      alert('Unable to cancel request: ' + err.message);
    }
  }

  const availableCropNames = [...new Set(crops.map((crop) => crop.cropName).filter(Boolean))];

  return (
    <div className="space-y-6">
      <h2 className="text-headline-lg ">Crop Market</h2>
      
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
          <button
            onClick={() => setActiveTab('myRequests')}
            className={`${activeTab === 'myRequests' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Requests
          </button>
        </nav>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading crops...</div>
            ) : crops.length === 0 ? (
              <div className="ledger-card p-8 text-center text-gray-500">
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
                      <span className="status-pill status-pill-success ">
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
              <div className="ledger-card p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Offer Deal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedCrop.unit === 'kg' ? selectedCrop.quantity : undefined}
                      className="form-input px-3 py-2 w-full w-full"
                      value={offerQuantity}
                      onChange={(e) => { setOfferQuantity(e.target.value); setCalculatedTransport(null); }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price per kg (₹)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input px-3 py-2 w-full w-full"
                      value={offerPrice}
                      onChange={(e) => { setOfferPrice(e.target.value); setCalculatedTransport(null); }}
                    />
                  </div>

                  {!calculatedTransport ? (
                    <button
                      onClick={handleCalculateDeal}
                      disabled={!offerQuantity || !offerPrice}
                      className="w-full text-sm font-medium disabled:bg-gray-300 btn-primary"
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
                      <p className="text-xs text-gray-400">Distance source: {calculatedTransport.source}</p>
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span className="text-gray-900">Total You Pay:</span>
                        <span className="text-green-600">₹{(Number(offerQuantity) * Number(offerPrice)) + calculatedTransport.transportCharge}</span>
                      </div>
                      <button
                        onClick={handleConfirmDeal}
                        disabled={processing}
                        className="w-full mt-4 text-sm font-medium btn-primary"
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
      ) : activeTab === 'request' ? (
        <div className="ledger-card max-w-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Post a General Request</h3>
          <p className="text-sm text-gray-500 mb-6">Can't find what you're looking for? Post a request and let farmers come to you.</p>
          
          <form onSubmit={handlePostRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <input
                type="text"
                required
                list="available-crops"
                className="form-input px-3 py-2 w-full w-full"
                value={reqCropName}
                onChange={(e) => setReqCropName(e.target.value)}
              />
              <datalist id="available-crops">
                {availableCropNames.map((name) => <option key={name} value={name} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  required
                  className="form-input px-3 py-2 w-full w-full"
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  className="form-input px-3 py-2 w-full w-full"
                  value={reqPrice}
                  onChange={(e) => setReqPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <input
                type="text"
                className="form-input px-3 py-2 w-full w-full"
                placeholder={userData?.location?.address || 'Uses your saved profile location'}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Leave blank to use your profile location.</p>
            </div>
            
            <button
              type="submit"
              disabled={processing}
              className="w-full mt-4 text-sm font-medium btn-primary"
            >
              {processing ? 'Posting...' : 'Post Request'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">My Crop Requests</h3>
            <p className="text-sm text-gray-500">Track the requests you posted for farmers to respond to.</p>
          </div>

          {requestsLoading ? (
            <div className="p-8 text-center text-gray-500">Loading your requests...</div>
          ) : myRequests.length === 0 ? (
            <div className="ledger-card p-8 text-center text-gray-500">
              You have not posted any crop requests yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold capitalize text-gray-900">{request.cropName}</h4>
                      <p className="mt-1 text-sm text-gray-500">{request.quantity} kg at ₹{request.pricePerUnit}/kg</p>
                    </div>
                    <span className={`rounded px-2 py-1 text-xs font-medium ${request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {request.status || 'open'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>Delivery: {request.deliveryLocation?.address || 'Profile location'}</p>
                    <p>Posted: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {request.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(request.id)}
                      className="mt-4 w-full border border-red-200 bg-white text-sm font-medium transition btn-destructive"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
