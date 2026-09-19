import { useState, useMemo } from 'react';
import { Search, TrendingUp, Info, BarChart3, Grip } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getMarketPrices } from '../../utils/geminiApi';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { onValue, ref } from 'firebase/database';
import { snapshotToList } from '../../utils/database';

export default function MarketAnalysis() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'grid'
  const [showOnlyMyCrops, setShowOnlyMyCrops] = useState(false);
  
  const [verifiedPrices, setVerifiedPrices] = useState([]);
  const [myCrops, setMyCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const prices = await getMarketPrices();
      setVerifiedPrices(prices);
      setLoading(false);
    }
    fetchData();

    if (currentUser) {
      const unsubscribe = onValue(ref(db, 'crops'), (snapshot) => {
        const crops = snapshotToList(snapshot).filter(c => c.farmerId === currentUser.uid);
        setMyCrops(crops.map(c => c.cropName.toLowerCase()));
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Sort by price descending for the chart/default view
  const sortedData = useMemo(() => {
    return [...verifiedPrices].sort((a, b) => b.modal_price_rs_per_kg - a.modal_price_rs_per_kg);
  }, [verifiedPrices]);

  const filteredData = useMemo(() => {
    let data = sortedData;
    
    if (showOnlyMyCrops && myCrops.length > 0) {
      data = data.filter(item => myCrops.includes(item.crop.toLowerCase()));
    }

    if (!searchQuery) return data;
    const lowerQ = searchQuery.toLowerCase();
    return data.filter(item => 
      item.crop.toLowerCase().includes(lowerQ) ||
      (item.telugu_name && item.telugu_name.includes(lowerQ)) ||
      (item.hindi_name && item.hindi_name.includes(lowerQ))
    );
  }, [searchQuery, sortedData, showOnlyMyCrops, myCrops]);

  // Take top 15 for the chart if no search query, else show filtered
  const chartData = searchQuery || showOnlyMyCrops ? filteredData : sortedData.slice(0, 15);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#c0c9c1] p-3 rounded-lg shadow-xl animate-fade-in">
          <p className="font-bold text-[#033621] text-lg capitalize">{data.crop}</p>
          <div className="flex gap-2 text-sm text-gray-500 mb-2">
            <span>{data.telugu_name}</span> &bull; <span>{data.hindi_name}</span>
          </div>
          <p className="font-bold text-[#3a674f]">₹{data.modal_price_rs_per_kg} / kg</p>
          <p className="text-xs text-gray-400 mt-1">{data.price_status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#3a674f]" />
              Market Analysis
            </h2>
            <p className="text-gray-600 mt-1">Real-time indicative wholesale prices across India (Powered by Gemini).</p>
          </div>
          
          <div className="flex items-center gap-4">
            {myCrops.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded text-[#033621] focus:ring-[#033621]"
                  checked={showOnlyMyCrops}
                  onChange={(e) => setShowOnlyMyCrops(e.target.checked)}
                />
                Show only my crops
              </label>
            )}
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button 
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'chart' ? 'bg-[#e4efe7] text-[#033621]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <BarChart3 className="w-4 h-4" /> Visual
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-[#e4efe7] text-[#033621]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Grip className="w-4 h-4" /> Grid
            </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-amber-50 text-amber-900 text-sm rounded-lg border border-amber-200 flex gap-3 items-start">
          <Info className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <p>
            <strong>Verified India Median:</strong> The prices shown are current indicative wholesale values per kg. 
            Prices are meant as a national benchmark; always verify with your local APMC or state market before confirming a deal.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="ledger-card p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search crop in English, Telugu (టమాటా), or Hindi..."
            className="form-input pl-10 pr-3 py-3 w-full border-gray-300 rounded-xl focus:ring-[#033621] focus:border-[#033621]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
           <div className="ledger-card p-12 text-center text-gray-500">
             Analyzing market data...
           </div>
        ) : filteredData.length === 0 ? (
          <div className="ledger-card p-12 text-center text-gray-500">
            No crops found matching your filters.
          </div>
        ) : viewMode === 'chart' ? (
          <div className="ledger-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {searchQuery ? 'Search Results Analysis' : 'Top 15 Most Valuable Crops (₹/kg)'}
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1D2" />
                  <XAxis 
                    dataKey="crop" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6355', fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6355', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F3E6' }} />
                  <Bar dataKey="modal_price_rs_per_kg" radius={[4, 4, 0, 0]} animationDuration={1500}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1F4D36' : '#a0d2b3'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredData.map((item, index) => (
              <div 
                key={item.crop} 
                className="ledger-card p-5 flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                style={{ animationDelay: `${(index % 15) * 50}ms` }}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#E4EFE7] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 -z-10" />
                
                <h3 className="font-bold text-gray-900 text-xl capitalize truncate z-10">
                  {item.crop}
                </h3>
                <div className="flex gap-3 text-sm text-[#6B6355] mt-1 font-medium z-10">
                  <span className="bg-white/50 px-2 py-0.5 rounded shadow-sm">{item.telugu_name}</span>
                  <span className="bg-white/50 px-2 py-0.5 rounded shadow-sm">{item.hindi_name}</span>
                </div>
                
                <div className="mt-6 border-t border-gray-100 pt-4 z-10">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Indicative Value</p>
                  <p className="text-3xl font-bold text-[#033621] drop-shadow-sm">
                    ₹{item.modal_price_rs_per_kg} <span className="text-sm font-medium text-gray-500">/ kg</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
