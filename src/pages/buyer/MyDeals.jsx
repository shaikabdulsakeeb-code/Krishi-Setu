import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { get, onValue, ref, update, push, set, remove } from 'firebase/database';
import { snapshotToList } from '../../utils/database';
import { useConfirm } from '../../contexts/ConfirmContext';
import ReviewModal from '../../components/ReviewModal';

export default function MyDeals() {
  const { currentUser } = useAuth();
  const confirm = useConfirm();
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerDetails, setFarmerDetails] = useState({});
  const [reviewingDeal, setReviewingDeal] = useState(null);

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
    if (!(await confirm(`Are you sure you want to ${newStatus.toLowerCase()} this deal?`))) return;
    try {
      await update(ref(db, `deals/${dealId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      alert('Failed to update deal: ' + err.message);
    }
  }

  async function deleteDeal(dealId) {
    if (!(await confirm('Are you sure you want to delete this completed deal?'))) return;
    try {
      await remove(ref(db, `deals/${dealId}`));
    } catch (err) {
      alert('Failed to delete deal: ' + err.message);
    }
  }

  async function handleReviewSubmit({ rating, review }) {
    if (!reviewingDeal) return;
    try {
      // Create review
      const reviewRef = push(ref(db, 'reviews'));
      await set(reviewRef, {
        dealId: reviewingDeal.id,
        farmerId: reviewingDeal.farmerId,
        buyerId: currentUser.uid,
        rating,
        reviewText: review.trim(),
        createdAt: new Date().toISOString()
      });

      // Mark deal as completed
      await update(ref(db, `deals/${reviewingDeal.id}`), {
        status: 'COMPLETED',
        updatedAt: new Date().toISOString()
      });
      
      setReviewingDeal(null);
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading deals...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-headline-lg ">My Deals & Offers</h2>
      
      {deals.length === 0 ? (
        <div className="ledger-card p-8 text-center">
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
            const rawValue = Number(deal.quantity) * Number(deal.pricePerUnit);
            const totalCost = rawValue + Number(deal.transportCharge);

            return (
              <div key={deal.id} className={`bg-white rounded-xl shadow-sm border ${isConfirmed ? 'border-green-200 bg-green-50/10' : 'border-gray-200'} p-6 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{deal.cropName || 'Crop Deal'}</h3>
                    <p className="text-sm font-medium text-gray-700">{deal.quantity} kg</p>
                    <p className="text-sm text-gray-500 mt-1">Total Cost: <span className="font-bold text-[#033621]">₹{totalCost}</span></p>
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
                    <span className="text-gray-500">Transport ({deal.transportDistanceKm || 'N/A'}km {deal.transportMode || 'road'}):</span>
                    <span className="text-red-500">+ ₹{deal.transportCharge}</span>
                  </div>
                  {deal.transportSource && <p className="text-xs text-gray-400">Distance source: {deal.transportSource}</p>}
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
                      className="flex-1 text-sm font-medium btn-primary"
                    >
                      Accept Deal
                    </button>
                    <button
                      onClick={() => updateDealStatus(deal.id, 'CANCELLED')}
                      className="flex-1 bg-white border border-red-200 text-sm font-medium transition-colors btn-destructive"
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
                      onClick={() => setReviewingDeal(deal)}
                      className="w-full btn-success py-2 mt-2"
                    >
                      Mark as Completed (Delivered)
                    </button>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                    <div className="p-3 bg-gray-50 text-gray-600 text-sm rounded-md text-center font-medium border border-gray-200">
                      Deal Completed
                    </div>
                    <button
                      onClick={() => deleteDeal(deal.id)}
                      className="w-full btn-danger py-2 mt-2"
                    >
                      Delete Record
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {reviewingDeal && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewingDeal(null)}
          onSubmit={handleReviewSubmit}
          farmerName={farmerDetails[reviewingDeal.farmerId]?.name || 'the farmer'}
        />
      )}
    </div>
  );
}
