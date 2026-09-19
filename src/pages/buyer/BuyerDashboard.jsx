import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onValue, ref } from 'firebase/database';
import { ArrowRight, Handshake, Search, Send, Sprout } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { snapshotToList } from '../../utils/database';

export default function BuyerDashboard() {
  const { currentUser, userData } = useAuth();
  const [cropCount, setCropCount] = useState(0);
  const [activeDeals, setActiveDeals] = useState(0);

  useEffect(() => {
    const crops = onValue(ref(db, 'crops'), (snapshot) => setCropCount(snapshotToList(snapshot).length), () => setCropCount(0));
    const deals = onValue(ref(db, 'deals'), (snapshot) => setActiveDeals(snapshotToList(snapshot).filter((deal) => deal.buyerId === currentUser.uid && !['COMPLETED', 'CANCELLED', 'DECLINED'].includes(deal.status)).length), () => setActiveDeals(0));
    return () => { crops(); deals(); };
  }, [currentUser.uid]);

  return <div className="space-y-8">
    <section className="rounded-2xl bg-gradient-to-br from-[var(--bg-1)] to-[var(--bg-2)] px-6 py-8 text-[var(--cream)] shadow-sm sm:px-8 border border-[var(--line)]"><p className="text-sm font-semibold tracking-wide text-[var(--sun-2)]">BUYER DASHBOARD</p><h1 className="text-headline-lg mt-2 text-[var(--cream)]">Welcome, {userData?.name || 'buyer'}.</h1><p className="mt-2 max-w-2xl text-[var(--muted)]">Buy directly from farmers with clear quantities, delivery dates, and transport estimates.</p><Link to="/buyer/browse" className="mt-6 inline-flex items-center gap-2 rounded-full btn-primary px-5 py-2.5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"><Search className="h-5 w-5" /> Browse crop market</Link></section>
    <section className="grid gap-4 sm:grid-cols-2"><div className="ledger-card p-5"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sun-2)] text-[var(--bg-1)]"><Sprout className="h-5 w-5" /></div><p className="text-headline-lg mt-4 text-[var(--cream)]">{cropCount}</p><p className="mt-1 text-sm text-[var(--muted)]">Crops in the market</p></div><div className="ledger-card p-5"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sun-2)] text-[var(--bg-1)]"><Handshake className="h-5 w-5" /></div><p className="text-headline-lg mt-4 text-[var(--cream)]">{activeDeals}</p><p className="mt-1 text-sm text-[var(--muted)]">Active offers and deals</p></div></section>
    <section className="grid gap-5 md:grid-cols-2"><Link to="/buyer/browse" className="group ledger-card p-6 transition hover:-translate-y-0.5 hover:border-[var(--sun-2)] hover:shadow-md"><Search className="h-6 w-6 text-[var(--sun-2)]" /><h2 className="mt-4 text-lg font-bold text-[var(--cream)]">Browse farmer crops</h2><p className="mt-1 text-sm text-[var(--muted)]">Compare available harvests and send a deal offer with transport included.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--sun-2)]">Explore the market <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link><Link to="/buyer/deals" className="group ledger-card p-6 transition hover:-translate-y-0.5 hover:border-[var(--sun-2)] hover:shadow-md"><Send className="h-6 w-6 text-[var(--sun-2)]" /><h2 className="mt-4 text-lg font-bold text-[var(--cream)]">Track offers and delivery</h2><p className="mt-1 text-sm text-[var(--muted)]">Accept farmer offers, call confirmed sellers, and mark a delivered order complete.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--sun-2)]">Open my deals <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link></section>
  </div>;
}
