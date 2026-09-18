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
    <section className="rounded-2xl bg-gradient-to-br from-emerald-800 to-green-600 px-6 py-8 text-white shadow-sm sm:px-8"><p className="text-sm font-semibold tracking-wide text-green-100">BUYER DASHBOARD</p><h1 className="text-headline-lg mt-2">Welcome, {userData?.name || 'buyer'}.</h1><p className="mt-2 max-w-2xl text-green-50">Buy directly from farmers with clear quantities, delivery dates, and transport estimates.</p><Link to="/buyer/browse" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-green-800 shadow-sm transition hover:bg-green-50"><Search className="h-4 w-4" /> Browse crop market</Link></section>
    <section className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700"><Sprout className="h-5 w-5" /></div><p className="text-headline-lg mt-4">{cropCount}</p><p className="mt-1 text-sm text-gray-500">Crops in the market</p></div><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Handshake className="h-5 w-5" /></div><p className="text-headline-lg mt-4">{activeDeals}</p><p className="mt-1 text-sm text-gray-500">Active offers and deals</p></div></section>
    <section className="grid gap-5 md:grid-cols-2"><Link to="/buyer/browse" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"><Search className="h-6 w-6 text-green-600" /><h2 className="mt-4 text-lg font-bold text-gray-900">Browse farmer crops</h2><p className="mt-1 text-sm text-gray-500">Compare available harvests and send a deal offer with transport included.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-700">Explore the market <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link><Link to="/buyer/deals" className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"><Send className="h-6 w-6 text-green-600" /><h2 className="mt-4 text-lg font-bold text-gray-900">Track offers and delivery</h2><p className="mt-1 text-sm text-gray-500">Accept farmer offers, call confirmed sellers, and mark a delivered order complete.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-700">Open my deals <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link></section>
  </div>;
}
