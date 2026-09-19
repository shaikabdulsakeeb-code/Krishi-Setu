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
    const ownCrops = onValue(ref(db, 'crops'), (snapshot) => {
      const allCrops = snapshotToList(snapshot).filter((crop) => crop.farmerId === currentUser.uid);
      setCropCount(allCrops.length);
    }, () => setCropCount(0));
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

  </div>;
}
