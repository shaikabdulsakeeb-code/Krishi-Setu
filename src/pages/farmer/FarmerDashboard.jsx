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
    { label: 'Listed crops', value: cropCount, icon: Sprout, colour: 'bg-[var(--sun-2)] text-[var(--bg-1)]' },
    { label: 'Offers to review', value: pendingDeals, icon: Handshake, colour: 'bg-[var(--sun-2)] text-[var(--bg-1)]' },
    { label: 'Open buyer requests', value: requestCount, icon: Inbox, colour: 'bg-[var(--sun-2)] text-[var(--bg-1)]' },
  ];

  return <div className="space-y-8">
    <section className="rounded-2xl bg-gradient-to-br from-[var(--bg-1)] to-[var(--bg-2)] px-6 py-8 text-[var(--cream)] shadow-sm sm:px-8 border border-[var(--line)]">
      <p className="text-sm font-semibold tracking-wide text-[var(--sun-2)]">FARMER DASHBOARD</p>
      <h1 className="text-headline-lg mt-2 text-[var(--cream)]">Namaste, {userData?.name || 'farmer'}.</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">List your harvest, respond to buyers, and keep every deal in one clear place.</p>
      <Link to="/farmer/add-crop" className="mt-6 inline-flex items-center gap-2 rounded-full btn-primary px-5 py-2.5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"><PlusCircle className="h-5 w-5" /> List a crop</Link>
    </section>
    <section className="grid gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, colour }) => <div key={label} className="ledger-card p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colour}`}><Icon className="h-5 w-5" /></div><p className="text-headline-lg mt-4 text-[var(--cream)]">{value}</p><p className="mt-1 text-sm text-[var(--muted)]">{label}</p></div>)}
    </section>
    <section className="grid gap-5 md:grid-cols-2">
      <Link to="/farmer/requests" className="group ledger-card p-6 transition hover:-translate-y-0.5 hover:border-[var(--sun-2)] hover:shadow-md"><Inbox className="h-6 w-6 text-[var(--sun-2)]" /><h2 className="mt-4 text-lg font-bold text-[var(--cream)]">Find buyer demand</h2><p className="mt-1 text-sm text-[var(--muted)]">Match your listed crops to buyers who are ready to purchase.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--sun-2)]">Browse requests <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
      <Link to="/farmer/deals" className="group ledger-card p-6 transition hover:-translate-y-0.5 hover:border-[var(--sun-2)] hover:shadow-md"><Handshake className="h-6 w-6 text-[var(--sun-2)]" /><h2 className="mt-4 text-lg font-bold text-[var(--cream)]">Manage your deals</h2><p className="mt-1 text-sm text-[var(--muted)]">Accept offers, share contact details after confirmation, and track delivery.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--sun-2)]">View deals <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
    </section>

    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--cream)]">Your Cultivated Crops</h2>
      </div>
      {crops.length === 0 ? (
        <div className="ledger-card p-8 text-center text-[var(--muted)]">
          You haven't listed any crops yet. Click 'List a crop' to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <div key={crop.id} className="ledger-card p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-[var(--cream)] capitalize">{crop.cropName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${crop.status === 'harvested' ? 'bg-[var(--sun-2)] text-[var(--bg-1)]' : 'bg-amber-100 text-amber-900'}`}>
                  {crop.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">{crop.quantity} {crop.unit}</p>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--line)]">
                <button
                  onClick={() => setEditingCrop(crop)}
                  className="flex-1 btn-success text-sm py-1.5 px-3 rounded-md transition"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={async () => {
                    if (await confirm('Are you sure you want to delete this crop?')) {
                      remove(ref(db, `crops/${crop.id}`));
                    }
                  }}
                  className="flex-1 btn-danger text-sm py-1.5 px-3 rounded-md transition"
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
