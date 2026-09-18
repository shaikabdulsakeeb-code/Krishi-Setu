import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onValue, ref } from 'firebase/database';
import { ArrowRight, Handshake, Inbox, PlusCircle, Sprout } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { snapshotToList } from '../../utils/database';

export default function FarmerDashboard() {
  const { currentUser, userData } = useAuth();
  const [cropCount, setCropCount] = useState(0);
  const [pendingDeals, setPendingDeals] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const ownCrops = onValue(ref(db, 'crops'), (snapshot) => setCropCount(snapshotToList(snapshot).filter((crop) => crop.farmerId === currentUser.uid).length), () => setCropCount(0));
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
  </div>;
}
