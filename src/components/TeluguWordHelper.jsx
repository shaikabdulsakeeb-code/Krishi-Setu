import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const TELUGU_WORDS = {
  accept: 'అంగీకరించు',
  account: 'ఖాతా',
  add: 'జోడించు',
  address: 'చిరునామా',
  available: 'అందుబాటులో ఉంది',
  buyer: 'కొనుగోలుదారు',
  buyers: 'కొనుగోలుదారులు',
  business: 'వ్యాపారం',
  call: 'కాల్',
  cancel: 'రద్దు',
  complete: 'పూర్తి',
  completed: 'పూర్తయింది',
  crop: 'పంట',
  crops: 'పంటలు',
  dashboard: 'డాష్‌బోర్డ్',
  deal: 'ఒప్పందం',
  deals: 'ఒప్పందాలు',
  decline: 'తిరస్కరించు',
  delivery: 'డెలివరీ',
  distance: 'దూరం',
  farmer: 'రైతు',
  farmers: 'రైతులు',
  harvest: 'పంట కోత',
  harvested: 'కోత పూర్తయింది',
  license: 'లైసెన్స్',
  location: 'స్థానం',
  market: 'మార్కెట్',
  name: 'పేరు',
  offer: 'ఆఫర్',
  open: 'తెరిచి ఉంది',
  password: 'పాస్‌వర్డ్',
  phone: 'ఫోన్',
  price: 'ధర',
  profile: 'ప్రొఫైల్',
  quantity: 'పరిమాణం',
  request: 'అభ్యర్థన',
  requests: 'అభ్యర్థనలు',
  save: 'సేవ్',
  sign: 'సైన్',
  status: 'స్థితి',
  trader: 'వ్యాపారి',
  transport: 'రవాణా',
  transportation: 'రవాణా',
  value: 'విలువ',
};

function getWordAtPoint(event) {
  const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
  const position = document.caretPositionFromPoint?.(event.clientX, event.clientY);
  const node = range?.startContainer || position?.offsetNode;
  const offset = range?.startOffset ?? position?.offset;

  if (!node || node.nodeType !== Node.TEXT_NODE) return '';

  const text = node.textContent || '';
  let start = offset;
  let end = offset;

  while (start > 0 && /[A-Za-z]/.test(text[start - 1])) start -= 1;
  while (end < text.length && /[A-Za-z]/.test(text[end])) end += 1;

  return text.slice(start, end).toLowerCase();
}

function speakTelugu(word) {
  const translation = TELUGU_WORDS[word] || word;
  if (!translation || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(translation);
  utterance.lang = 'te-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function TeluguWordHelper() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('harvie-telugu-word-help') === 'on');

  useEffect(() => {
    localStorage.setItem('harvie-telugu-word-help', enabled ? 'on' : 'off');
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    function handleClick(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('button, a, input, textarea, select, [data-speech-ignore]')) return;

      const word = getWordAtPoint(event);
      if (word) speakTelugu(word);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [enabled]);

  return (
    <button
      type="button"
      data-speech-ignore
      onClick={() => setEnabled((current) => !current)}
      className={`mr-2 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${enabled ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
      title="Toggle Telugu word help"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span className="hidden lg:inline">{enabled ? 'Telugu help on' : 'Telugu help'}</span>
    </button>
  );
}
