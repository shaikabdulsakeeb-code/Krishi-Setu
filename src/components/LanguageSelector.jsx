import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en');

  // Listen for language changes if needed or just handle the select change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    
    // Find the Google Translate select element and trigger change
    const gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
      gtSelect.value = lang;
      gtSelect.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select 
        value={currentLang} 
        onChange={handleLanguageChange}
        className="form-input text-sm border-gray-300 rounded-md py-1 pl-2 pr-6 bg-white focus:ring-[#033621] focus:border-[#033621]"
      >
        <option value="en">English</option>
        <option value="te">తెలుగు</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>
  );
}
