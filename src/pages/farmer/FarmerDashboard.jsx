import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onValue, ref, remove } from 'firebase/database';
import { ArrowRight, Handshake, Inbox, PlusCircle, Sprout, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { snapshotToList } from '../../utils/database';
import EditCropModal from '../../components/EditCropModal';
import { useConfirm } from '../../contexts/ConfirmContext';

export default function FarmerDashboard() {
  const { currentUser, userData } = useAuth();
  const [cropCount, setCropCount] = useState(0);
  const [crops, setCrops] = useState([]);
  const [pendingDeals, setPendingDeals] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [editingCrop, setEditingCrop] = useState(null);
  const confirm = useConfirm();

  useEffect(() => {
    const ownCrops = onValue(ref(db, 'crops'), (snapshot) => {
      const allCrops = snapshotToList(snapshot).filter((crop) => crop.farmerId === currentUser.uid);
      setCrops(allCrops);
      setCropCount(allCrops.length);
    }, () => { setCropCount(0); setCrops([]); });
    const ownDeals = onValue(ref(db, 'deals'), (snapshot) => setPendingDeals(snapshotToList(snapshot).filter((deal) => deal.farmerId === currentUser.uid && deal.status === 'PENDING_FARMER').length), () => setPendingDeals(0));
    const openRequests = onValue(ref(db, 'buyerRequests'), (snapshot) => setRequestCount(snapshotToList(snapshot).filter((request) => request.status === 'open').length), () => setRequestCount(0));
    return () => { ownCrops(); ownDeals(); openRequests(); };
  }, [currentUser.uid]);

  const stats = [
    { label: 'Listed crops', value: cropCount, icon: Sprout, colour: 'bg-green-100 text-green-700' },
    { label: 'Offers to review', value: pendingDeals, icon: Handshake, colour: 'bg-amber-100 text-amber-700' },
    { label: 'Open buyer requests', value: requestCount, icon: Inbox, colour: 'bg-blue-100 text-blue-700' },
  ];

  return <div className="space-y-8">
    <section className="rounded-2xl bg-gradient-to-br from-green-800 to-green-600 px-6 py-8 text-white shadow-sm sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-green-100">FARMER DASHBOARD</p>
      <h1 className="text-headline-lg mt-2">Namaste, {userData?.name || 'farmer'}.</h1>
      <p className="mt-2 max-w-2xl text-green-50">List your harvest, respond to buyers, and keep every deal in one clear place.</p>
      <Link to="/farmer/add-crop" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-green-800 shadow-sm transition hover:bg-green-50"><PlusCircle className="h-4 w-4" /> List a crop</Link>
    </section>
    <section className="grid gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, colour }) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colour}`}><Icon className="h-5 w-5" /></div><p className="text-headline-lg mt-4">{value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></div>)}
    </section>
    <section className="grid gap-5 md:grid-cols-2">
      <Link to="/farmer/requests" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"><Inbox className="h-6 w-6 text-green-600" /><h2 className="mt-4 text-lg font-bold text-gray-900">Find buyer demand</h2><p className="mt-1 text-sm text-gray-500">Match your listed crops to buyers who are ready to purchase.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-700">Browse requests <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
      <Link to="/farmer/deals" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"><Handshake className="h-6 w-6 text-green-600" /><h2 className="mt-4 text-lg font-bold text-gray-900">Manage your deals</h2><p className="mt-1 text-sm text-gray-500">Accept offers, share contact details after confirmation, and track delivery.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-700">View deals <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
    </section>

    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Cultivated Crops</h2>
      </div>
      {crops.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          You haven't listed any crops yet. Click 'List a crop' to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <div key={crop.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 capitalize">{crop.cropName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${crop.status === 'harvested' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {crop.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{crop.quantity} {crop.unit}</p>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setEditingCrop(crop)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md bg-[#e4efe7] text-[#033621] text-sm font-medium hover:bg-[#c9e0d1] transition"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={async () => {
                    if (await confirm('Are you sure you want to delete this crop?')) {
                      remove(ref(db, `crops/${crop.id}`));
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <EditCropModal 
      isOpen={!!editingCrop} 
      crop={editingCrop} 
      onClose={() => setEditingCrop(null)} 
    />
  </div>;
}
