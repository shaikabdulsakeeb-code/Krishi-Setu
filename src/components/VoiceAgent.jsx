import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import verifiedPrices from '../data/verifiedPrices.json';

export default function VoiceAgent({ showLabel = false }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(null);
  const location = useLocation();
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.getVoices();
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Voice recognition is not supported in this browser.');
      return undefined;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'te-IN';
    recognition.onstart = () => { setIsListening(true); setError(''); };
    recognition.onerror = (event) => { setIsListening(false); setError(`Voice recognition failed: ${event.error}`); };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: transcript,
            context: {
              currentPage: location.pathname,
              availableTabs: ['Dashboard', 'Add Crop', 'Buyer Requests', 'My Deals', 'Market', 'Profile'],
              marketDataPreview: verifiedPrices.slice(0, 5),
            },
          }),
        });
        if (!response.ok) throw new Error('The assistant could not respond.');
        const data = await response.json();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.reply);
          utterance.lang = 'te-IN';
          utterance.rate = 0.9;
          const teluguVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('te'));
          if (teluguVoice) utterance.voice = teluguVoice;
          window.speechSynthesis.speak(utterance);
        }
      } catch (requestError) {
        setError(requestError.message || 'Voice assistant is unavailable.');
      } finally {
        setIsProcessing(false);
      }
    };
    setIsSupported(true);

    return () => recognition.abort();
  }, [location.pathname]);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  if (isSupported === null) return null;
  const buttonLabel = isListening ? 'Listening…' : isProcessing ? 'Working…' : 'Touch to speak';

  return (
    <div className="relative flex items-center">
      <button type="button" onClick={toggleListen} disabled={isProcessing || !isSupported} aria-label={`Voice assistant: ${buttonLabel}`} className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 transition-all disabled:cursor-not-allowed disabled:opacity-60 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : isProcessing ? 'bg-blue-100 text-blue-600' : 'bg-[var(--bg-card-alt)] text-[var(--primary)] hover:bg-[var(--border)]'}`} title="Voice Assistant (Telugu)">
        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
        {showLabel && <span className="hidden whitespace-nowrap text-sm font-semibold sm:inline">{buttonLabel}</span>}
      </button>
      {error && <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}
