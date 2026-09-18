import { useState, useMemo } from 'react';
import { Search, TrendingUp, MapPin } from 'lucide-react';
import marketData from '../../data/marketPrices.json';

export default function MarketAnalysis() {
  const states = Object.keys(marketData).sort();
  const [selectedState, setSelectedState] = useState(states.includes('Maharashtra') ? 'Maharashtra' : states[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const stateData = marketData[selectedState] || {};
  const allCommodities = Object.keys(stateData).sort();

  const filteredCommodities = useMemo(() => {
    if (!searchQuery) return allCommodities;
    const lowerQ = searchQuery.toLowerCase();
    return allCommodities.filter(c => c.toLowerCase().includes(lowerQ));
  }, [searchQuery, allCommodities]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-headline-lg flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-[#3a674f]" />
          Market Analysis
        </h2>
        <p className="text-gray-600 mt-1">Check expected wholesale market prices per kg across different states.</p>
        
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 flex gap-3 items-start">
          <span className="text-xl">ℹ️</span>
          <p>
            <strong>Disclaimer:</strong> The prices shown are average expected wholesale amounts based on aggregated market data. 
            Actual local market prices may vary depending on crop quality, daily fluctuations, and specific district markets.
          </p>
        </div>
      </div>

      <div className="ledger-card p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Select State
          </label>
          <select 
            className="form-input px-3 py-2 w-full"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-2/3">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Search className="h-4 w-4" /> Search Crop
          </label>
          <input 
            type="text" 
            placeholder="E.g., Tomato, Apple, Onion..."
            className="form-input px-3 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div>
        {filteredCommodities.length === 0 ? (
          <div className="ledger-card p-12 text-center text-gray-500">
            No crops found matching "{searchQuery}" in {selectedState}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCommodities.map(commodity => (
              <div 
                key={commodity} 
                className="ledger-card p-5 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <h3 className="font-bold text-gray-900 text-lg capitalize truncate mb-2" title={commodity}>
                  {commodity}
                </h3>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Amount</p>
                  <p className="text-2xl font-bold text-[#033621]">
                    ₹{stateData[commodity].toFixed(1)} <span className="text-sm font-medium text-gray-500">/ kg</span>
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
