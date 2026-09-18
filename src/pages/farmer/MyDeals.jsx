import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, onValue, ref, update } from 'firebase/database';
import { snapshotToList } from '../../utils/database';

export default function MyDeals() {
  const { currentUser } = useAuth();
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerDetails, setBuyerDetails] = useState({});

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'deals'), async (snapshot) => {
      const fetchedDeals = snapshotToList(snapshot).filter((deal) => deal.farmerId === currentUser.uid);
      setDeals(fetchedDeals);
      
      // Fetch buyer details for CONFIRMED/COMPLETED deals to show the call button
      const newBuyerDetails = {};
      for (const deal of fetchedDeals) {
        if ((deal.status === 'CONFIRMED' || deal.status === 'COMPLETED') && !newBuyerDetails[deal.buyerId]) {
          const userSnap = await get(ref(db, `users/${deal.buyerId}`));
          if (userSnap.exists()) {
            newBuyerDetails[deal.buyerId] = userSnap.val();
          }
        }
      }
      setBuyerDetails(newBuyerDetails);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  async function updateDealStatus(dealId, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this deal?`)) return;
    try {
      await update(ref(db, `deals/${dealId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      alert('Failed to update deal: ' + err.message);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading deals...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-headline-lg ">My Deals</h2>
      
      {deals.length === 0 ? (
        <div className="ledger-card p-8 text-center">
          <p className="text-gray-500">You don't have any deals yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map(deal => {
            const isPendingMe = deal.status === 'PENDING_FARMER';
            const isPendingOther = deal.status === 'PENDING_BUYER';
            const isConfirmed = deal.status === 'CONFIRMED';
            const isCompleted = deal.status === 'COMPLETED';
            const isDeclinedOrCancelled = deal.status === 'DECLINED' || deal.status === 'CANCELLED';
            
            const buyer = buyerDetails[deal.buyerId];
            const cropValue = Number(deal.quantity || 0) * Number(deal.pricePerUnit || 0);
            const transportCharge = Number(deal.transportCharge || 0);
            const farmerReceives = deal.netValue ?? cropValue;
            const buyerPays = cropValue + transportCharge;

            return (
              <div key={deal.id} className={`bg-white rounded-xl shadow-sm border ${isConfirmed ? 'border-green-200 bg-green-50/10' : 'border-gray-200'} p-6 flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Deal: {deal.quantity} kg</h3>
                    <p className="text-sm text-gray-500">Farmer receives: <span className="font-medium text-green-600">₹{farmerReceives}</span></p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium 
                    ${isPendingMe ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${isPendingOther ? 'bg-blue-100 text-blue-800' : ''}
                    ${isConfirmed ? 'bg-green-100 text-green-800' : ''}
                    ${isCompleted ? 'bg-gray-100 text-gray-800' : ''}
                    ${isDeclinedOrCancelled ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {deal.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-6 flex-grow">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per kg:</span>
                    <span>₹{deal.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crop value:</span>
                    <span>₹{cropValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transport charge:</span>
                    <span className="font-medium text-red-500">₹{transportCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Distance and mode:</span>
                    <span className="capitalize">{deal.transportDistanceKm || 'N/A'} km, {deal.transportMode || 'road'}</span>
                  </div>
                  {deal.transportSource && <p className="text-xs text-gray-400">Distance source: {deal.transportSource}</p>}
                  <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
                    <span className="text-gray-900">Buyer total:</span>
                    <span>₹{buyerPays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Date:</span>
                    <span>{deal.deliveryDate || 'N/A'}</span>
                  </div>
                </div>

                {isPendingMe && (
                  <div className="flex space-x-3 mt-auto">
                    <button
                      onClick={() => updateDealStatus(deal.id, 'CONFIRMED')}
                      className="flex-1 text-sm font-medium btn-primary"
                    >
                      Accept Deal
                    </button>
                    <button
                      onClick={() => updateDealStatus(deal.id, 'DECLINED')}
                      className="flex-1 bg-white border border-red-200 text-sm font-medium transition-colors btn-destructive"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {isPendingOther && (
                  <div className="mt-auto p-3 bg-blue-50 text-blue-800 text-sm rounded-md text-center">
                    Waiting for buyer to accept...
                  </div>
                )}

                {(isConfirmed || isCompleted) && buyer && (
                  <div className="mt-auto border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{buyer.name}</p>
                        <p className="text-xs text-gray-500">{buyer.phone}</p>
                      </div>
                      <a 
                        href={`tel:${buyer.phone}`}
                        className="inline-flex items-center px-4 py-2 border border-green-200 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        Call Buyer
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
