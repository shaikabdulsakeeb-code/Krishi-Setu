import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en');

  // Listen for language changes if needed or just handle the select change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    
    const gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
      gtSelect.value = lang;
      gtSelect.dispatchEvent(new Event('change'));
    } else {
      // Fallback: Set cookie and reload
      const transCookie = lang === 'en' ? '/en/en' : `/en/${lang}`;
      document.cookie = `googtrans=${transCookie}; path=/`;
      document.cookie = `googtrans=${transCookie}; path=/; domain=${window.location.hostname}`;
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-[var(--muted)]" />
      <select 
        value={currentLang} 
        onChange={handleLanguageChange}
        className="form-input text-sm border-[var(--line)] rounded-md py-1 pl-2 pr-6 bg-[var(--glass)] text-[var(--cream)] focus:ring-[var(--sun-2)] focus:border-[var(--sun-2)]"
      >
        <option value="en" className="bg-[var(--bg-1)]">English</option>
        <option value="te" className="bg-[var(--bg-1)]">తెలుగు</option>
        <option value="hi" className="bg-[var(--bg-1)]">हिन्दी</option>
      </select>
    </div>
  );
}
