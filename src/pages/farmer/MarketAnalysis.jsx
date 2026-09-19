import { useEffect, useMemo, useState } from 'react';
import { Search, TrendingUp, Info, BarChart3, Grip, Sprout, IndianRupee, PackageCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { onValue, ref } from 'firebase/database';
import { snapshotToList } from '../../utils/database';
import commodityCsv from '../../../crop_prices_all_commodities.csv?raw';

const cropAliases = {
  bajra: 'bajra', 'pearl millet': 'bajra', cumbu: 'bajra', jowar: 'jowar', sorghum: 'jowar',
  ragi: 'ragi', 'finger millet': 'ragi', paddy: 'paddy', rice: 'paddy',
  sesamum: 'sesamum', sesame: 'sesamum', gingelly: 'sesamum', til: 'sesamum',
  'bengal gram': 'bengal gram', chickpea: 'bengal gram', gram: 'bengal gram',
  'black gram': 'black gram', urd: 'black gram', 'green gram': 'green gram', moong: 'green gram',
  'red gram': 'red gram', arhar: 'red gram', tur: 'red gram', tomato: 'tomato', tomatoes: 'tomato',
  potato: 'potato', potatoes: 'potato', onion: 'onion', onions: 'onion',
};

function parseCommodityPrices(csv) {
  return csv.trim().split(/\r?\n/).slice(1).map((line) => {
    const separator = line.lastIndexOf(',');
    if (separator === -1) return null;
    const crop = line.slice(0, separator).replace(/^"|"$/g, '').trim();
    const price = Number(line.slice(separator + 1).trim());
    return Number.isFinite(price) ? { crop, price } : null;
  }).filter(Boolean);
}

function normaliseCropName(name = '') {
  const cleaned = name.toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z\s/]/g, ' ').replace(/\s+/g, ' ').trim();
  const alias = Object.entries(cropAliases)
    .sort(([left], [right]) => right.length - left.length)
    .find(([term]) => cleaned === term || cleaned.includes(term));
  return alias ? alias[1] : cleaned.replace(/s$/, '');
}

function cropsMatch(listedCrop, commodity) {
  const listed = normaliseCropName(listedCrop);
  const market = normaliseCropName(commodity);
  return listed === market || listed.includes(market) || market.includes(listed);
}

function quantityInKg(crop) {
  const quantity = Number(crop.quantity) || 0;
  if (crop.unit === 'tonnes') return quantity * 1000;
  if (crop.unit === 'quintal') return quantity * 100;
  return quantity;
}

const allCommodityPrices = parseCommodityPrices(commodityCsv);

export default function MarketAnalysis() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('chart');
  const [showOnlyMyCrops, setShowOnlyMyCrops] = useState(false);
  const [myCrops, setMyCrops] = useState([]);

  useEffect(() => {
    if (!currentUser) { setMyCrops([]); return undefined; }
    return onValue(ref(db, 'crops'), (snapshot) => {
      setMyCrops(snapshotToList(snapshot).filter((crop) => crop.farmerId === currentUser.uid));
    }, () => setMyCrops([]));
  }, [currentUser]);

  const marketPrices = useMemo(() => [...allCommodityPrices].sort((a, b) => b.price - a.price), []);
  const matchedCrops = useMemo(() => myCrops.map((crop) => {
    const commodity = marketPrices.find((item) => cropsMatch(crop.cropName, item.crop)) || null;
    return { ...crop, commodity, estimatedValue: commodity ? quantityInKg(crop) * commodity.price : null };
  }), [myCrops, marketPrices]);
  const myMarketPrices = useMemo(() => marketPrices.filter((commodity) => myCrops.some((crop) => cropsMatch(crop.cropName, commodity.crop))), [marketPrices, myCrops]);
  const filteredData = useMemo(() => {
    const source = showOnlyMyCrops ? myMarketPrices : marketPrices;
    const query = searchQuery.trim().toLowerCase();
    return query ? source.filter((commodity) => commodity.crop.toLowerCase().includes(query)) : source;
  }, [marketPrices, myMarketPrices, searchQuery, showOnlyMyCrops]);

  const matchingValue = matchedCrops.reduce((total, crop) => total + (crop.estimatedValue || 0), 0);
  const chartHeight = Math.max(340, Math.min(1040, filteredData.length * 42 + 70));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const commodity = payload[0].payload;
    const listedCrops = myCrops.filter((crop) => cropsMatch(crop.cropName, commodity.crop));
    return <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 rounded-lg shadow-xl text-[var(--text-primary)]">
      <p className="font-bold text-base">{commodity.crop}</p>
      <p className="mt-1 font-bold text-[var(--primary)]">₹{commodity.price.toFixed(2)} / kg</p>
      {listedCrops.length > 0 && <p className="mt-2 text-xs text-[var(--text-secondary)]">Matches your listing: {listedCrops.map((crop) => crop.cropName).join(', ')}</p>}
    </div>;
  };

  return <div className="space-y-6">
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-headline-lg flex items-center gap-3"><TrendingUp className="h-8 w-8 text-[var(--primary)]" />Market Analysis</h2><p className="text-[var(--text-secondary)] mt-1">Commodity prices from your uploaded market-price file.</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-card)] px-3 py-2 rounded-lg border border-[var(--border)] cursor-pointer"><input type="checkbox" className="rounded text-[var(--primary)] focus:ring-[var(--primary)]" checked={showOnlyMyCrops} onChange={(event) => setShowOnlyMyCrops(event.target.checked)} />Show only my crops</label>
          <div className="flex bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border)]"><button onClick={() => setViewMode('chart')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'chart' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><BarChart3 className="w-4 h-4" />Visual</button><button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Grip className="w-4 h-4" />Cards</button></div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-amber-50 text-amber-900 text-sm rounded-lg border border-amber-200 flex gap-3 items-start"><Info className="h-5 w-5 flex-shrink-0 text-amber-600" /><p><strong>Market reference:</strong> Prices are the uploaded indicative values in ₹/kg. Confirm local APMC prices before making a deal.</p></div>
    </div>

    {myCrops.length > 0 && <section className="animate-fade-in-up" aria-label="Your crop market matches">
      <div className="mb-3 flex items-center gap-2"><Sprout className="h-5 w-5 text-[var(--primary)]" /><h3 className="text-headline-md">Your crop market matches</h3></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <article className="ledger-card p-5"><div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm"><PackageCheck className="h-4 w-4" />Matched listings</div><p className="mt-2 text-metric-large text-[var(--primary)]">{matchedCrops.filter((crop) => crop.commodity).length}<span className="text-base font-medium"> / {myCrops.length}</span></p><p className="mt-1 text-sm text-[var(--text-secondary)]">of your listed crops appear in the market file</p></article>
        <article className="ledger-card p-5"><div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm"><IndianRupee className="h-4 w-4" />Indicative listing value</div><p className="mt-2 text-metric-large text-[var(--primary)]">₹{matchingValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p><p className="mt-1 text-sm text-[var(--text-secondary)]">based on listed quantities and matching ₹/kg prices</p></article>
        <article className="ledger-card p-5"><div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm"><TrendingUp className="h-4 w-4" />Highest matched price</div>{myMarketPrices[0] ? <><p className="mt-2 text-metric-large text-[var(--primary)]">₹{myMarketPrices[0].price.toFixed(2)}</p><p className="mt-1 text-sm text-[var(--text-secondary)]">per kg for {myMarketPrices[0].crop}</p></> : <p className="mt-3 text-sm text-[var(--text-secondary)]">Add a crop with a name matching a commodity to see its price.</p>}</article>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{matchedCrops.map((crop) => <div key={crop.id} className={`rounded-xl border p-4 ${crop.commodity ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-start justify-between gap-2"><p className="font-bold capitalize text-[var(--text-primary)]">{crop.cropName}</p><span className={`text-xs font-bold ${crop.commodity ? 'text-green-700' : 'text-amber-800'}`}>{crop.commodity ? 'Matched' : 'No match'}</span></div>{crop.commodity ? <><p className="mt-2 text-lg font-bold text-[var(--primary)]">₹{crop.commodity.price.toFixed(2)} <span className="text-sm font-medium">/ kg</span></p><p className="mt-1 text-xs text-[var(--text-secondary)]">{crop.commodity.crop} • Estimated value ₹{crop.estimatedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></> : <p className="mt-2 text-sm text-[var(--text-secondary)]">No similar commodity was found in the uploaded data.</p>}</div>)}</div>
    </section>}

    <div className="ledger-card p-4 animate-fade-in-up"><div className="relative max-w-xl mx-auto"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div><input type="text" placeholder="Search a commodity, e.g. Tomato, Moong, Cotton..." className="form-input pl-10 pr-3 py-3 w-full" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div></div>

    {showOnlyMyCrops && myCrops.length === 0 ? <div className="ledger-card p-12 text-center text-[var(--text-secondary)]">Add crops to your listings first, then select “Show only my crops”.</div> : filteredData.length === 0 ? <div className="ledger-card p-12 text-center text-[var(--text-secondary)]">No commodities found for the selected filters.</div> : viewMode === 'chart' ? <div className="ledger-card p-5 sm:p-6 animate-fade-in-up"><div className="mb-5"><h3 className="text-headline-md">{showOnlyMyCrops ? 'Prices for your matching crops' : 'All uploaded commodity prices'}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{filteredData.length} commodity price{filteredData.length === 1 ? '' : 's'} • ₹ per kg</p></div><div className="w-full" style={{ height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredData} layout="vertical" margin={{ top: 8, right: 36, left: 30, bottom: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} /><YAxis type="category" dataKey="crop" width={155} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-primary)', fontSize: 12 }} /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'color-mix(in srgb, var(--primary) 8%, transparent)' }} /><Bar dataKey="price" radius={[0, 5, 5, 0]} animationDuration={700}>{filteredData.map((commodity) => <Cell key={commodity.crop} fill={myMarketPrices.some((item) => item.crop === commodity.crop) ? 'var(--accent-gold)' : 'var(--primary)'} />)}</Bar></BarChart></ResponsiveContainer></div></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredData.map((commodity) => { const isMyCrop = myMarketPrices.some((item) => item.crop === commodity.crop); return <article key={commodity.crop} className={`ledger-card p-5 relative overflow-hidden ${isMyCrop ? 'ring-2 ring-[var(--accent-gold)]' : ''}`}>{isMyCrop && <span className="absolute right-3 top-3 text-xs font-bold bg-[var(--accent-gold)] text-white px-2 py-1 rounded-full">Your crop</span>}<h3 className="font-bold text-lg text-[var(--text-primary)] pr-16">{commodity.crop}</h3><p className="mt-6 text-3xl font-bold text-[var(--primary)]">₹{commodity.price.toFixed(2)} <span className="text-sm font-medium text-[var(--text-secondary)]">/ kg</span></p></article>; })}</div>}
  </div>;
}
