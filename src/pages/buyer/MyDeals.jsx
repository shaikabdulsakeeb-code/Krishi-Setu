import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, onValue, ref, update } from 'firebase/database';
import { snapshotToList } from '../../utils/database';

export default function MyDeals() {
  const { currentUser } = useAuth();
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerDetails, setFarmerDetails] = useState({});

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'deals'), async (snapshot) => {
      const fetchedDeals = snapshotToList(snapshot).filter((deal) => deal.buyerId === currentUser.uid);
      setDeals(fetchedDeals);
      
      // Fetch farmer details to show their name and contact info
      const newFarmerDetails = {};
      for (const deal of fetchedDeals) {
        if (!newFarmerDetails[deal.farmerId]) {
          const userSnap = await get(ref(db, `users/${deal.farmerId}`));
          if (userSnap.exists()) {
            newFarmerDetails[deal.farmerId] = userSnap.val();
          }
        }
      }
      setFarmerDetails(newFarmerDetails);
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
      <h2 className="text-2xl font-bold text-gray-900">My Deals & Offers</h2>
      
      {deals.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100 text-center">
          <p className="text-gray-500">You don't have any active deals or offers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map(deal => {
            const isPendingMe = deal.status === 'PENDING_BUYER';
            const isPendingOther = deal.status === 'PENDING_FARMER';
            const isConfirmed = deal.status === 'CONFIRMED';
            const isCompleted = deal.status === 'COMPLETED';
            const isDeclinedOrCancelled = deal.status === 'DECLINED' || deal.status === 'CANCELLED';
            
            const farmer = farmerDetails[deal.farmerId];
            const rawValue = deal.quantity * deal.pricePerUnit;
            const totalCost = rawValue + deal.transportCharge;

            return (
              <div key={deal.id} className={`bg-white rounded-xl shadow-sm border ${isConfirmed ? 'border-green-200 bg-green-50/10' : 'border-gray-200'} p-6 flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Deal: {deal.quantity} kg</h3>
                    <p className="text-sm text-gray-500">Total Cost: <span className="font-bold text-gray-900">₹{totalCost}</span></p>
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
                    <span className="text-gray-500">Crop Value (₹{deal.pricePerUnit}/kg):</span>
                    <span>₹{rawValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transport ({deal.transportMode}):</span>
                    <span className="text-red-500">+ ₹{deal.transportCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Date:</span>
                    <span>{deal.deliveryDate || 'N/A'}</span>
                  </div>
                  {farmer && (
                    <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                      <span className="text-gray-500">Farmer:</span>
                      <span className="font-medium">{farmer.name}</span>
                    </div>
                  )}
                </div>

                {isPendingMe && (
                  <div className="flex space-x-3 mt-auto">
                    <button
                      onClick={() => updateDealStatus(deal.id, 'CONFIRMED')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Accept Deal
                    </button>
                    <button
                      onClick={() => updateDealStatus(deal.id, 'CANCELLED')}
                      className="flex-1 bg-white text-red-600 border border-red-200 py-2 px-4 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {isPendingOther && (
                  <div className="mt-auto p-3 bg-blue-50 text-blue-800 text-sm rounded-md text-center">
                    Waiting for farmer to accept...
                  </div>
                )}

                {isConfirmed && (
                  <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Contact Farmer</p>
                        <p className="text-gray-500">{farmer?.phone}</p>
                      </div>
                      <a 
                        href={`tel:${farmer?.phone}`}
                        className="inline-flex items-center px-4 py-2 border border-green-200 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        Call
                      </a>
                    </div>
                    <button
                      onClick={() => updateDealStatus(deal.id, 'COMPLETED')}
                      className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Mark as Completed (Delivered)
                    </button>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-auto p-3 bg-gray-50 text-gray-600 text-sm rounded-md text-center font-medium border border-gray-200">
                    Deal Completed
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
