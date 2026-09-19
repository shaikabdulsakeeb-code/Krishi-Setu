import { useState } from 'react';
import { Globe } from 'lucide-react';

function getSavedLanguage() {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
  return match && ['hi', 'te'].includes(match[1]) ? match[1] : 'en';
}

function clearTranslationCookies() {
  const expiredCookie = 'googtrans=; path=/; max-age=0; SameSite=Lax';
  document.cookie = expiredCookie;
  const host = window.location.hostname;
  if (host && host !== 'localhost') {
    document.cookie = `${expiredCookie}; domain=${host}`;
    document.cookie = `${expiredCookie}; domain=.${host}`;
  }
}

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState(getSavedLanguage);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);

    // Reloading ensures Google Translate restores the original page when English
    // is selected; changing only the hidden widget leaves translated DOM in place.
    clearTranslationCookies();
    if (lang !== 'en') {
      document.cookie = `googtrans=/en/${lang}; path=/; SameSite=Lax`;
      const host = window.location.hostname;
      if (host && host !== 'localhost') {
        document.cookie = `googtrans=/en/${lang}; path=/; domain=${host}; SameSite=Lax`;
      }
    }
    window.location.reload();
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
