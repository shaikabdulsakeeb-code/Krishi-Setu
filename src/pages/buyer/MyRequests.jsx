import { useEffect, useState } from 'react';
import { ClipboardList, IndianRupee, MapPin, Package } from 'lucide-react';
import { onValue, ref } from 'firebase/database';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { snapshotToList } from '../../utils/database';

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function requestStatus(status = 'open') {
  if (status === 'deal_sent') return { label: 'Deal offer received', className: 'bg-blue-100 text-blue-800' };
  if (status === 'closed') return { label: 'Closed', className: 'bg-gray-100 text-gray-700' };
  return { label: 'Open', className: 'bg-green-100 text-green-800' };
}

export default function MyRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => onValue(ref(db, 'buyerRequests'), (snapshot) => {
    const postedRequests = snapshotToList(snapshot)
      .filter((request) => request.buyerId === currentUser.uid)
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
    setRequests(postedRequests);
    setLoading(false);
  }, () => {
    setRequests([]);
    setLoading(false);
  }), [currentUser.uid]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your requests...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg">My Requests</h2>
        <p className="mt-1 text-[var(--text-secondary)]">Requests you have posted for farmers to fulfil.</p>
      </div>

      {requests.length === 0 ? (
        <div className="ledger-card p-8 text-center">
          <ClipboardList className="mx-auto h-9 w-9 text-[var(--text-secondary)]" />
          <p className="mt-3 font-medium text-[var(--text-primary)]">You have not posted any requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => {
            const status = requestStatus(request.status);
            return (
              <article key={request.id} className="ledger-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold capitalize text-[var(--text-primary)]">{request.cropName || 'Crop request'}</h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Posted {formatDate(request.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-[var(--text-secondary)]"><Package className="h-4 w-4" />Quantity</span><span className="font-semibold text-[var(--text-primary)]">{request.quantity} kg</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-[var(--text-secondary)]"><IndianRupee className="h-4 w-4" />Target price</span><span className="font-semibold text-[var(--text-primary)]">₹{request.pricePerUnit} / kg</span></div>
                  <div className="flex items-start gap-2 border-t border-[var(--border)] pt-3 text-[var(--text-secondary)]"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{request.deliveryLocation?.address || 'Your saved delivery location'}</span></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
