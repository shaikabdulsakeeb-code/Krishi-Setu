import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import verifiedPrices from '../data/verifiedPrices.json';

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    // Force voice loading early for TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.getVoices();
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'te-IN'; // Telugu by default
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setError('Voice recognition failed. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        await processVoiceCommand(transcript);
      };
    } else {
      setError('Voice recognition is not supported in this browser.');
    }
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a Telugu voice if available
      let voices = window.speechSynthesis.getVoices();
      let teluguVoice = voices.find(v => v.lang.includes('te') || v.lang.includes('te-IN'));
      
      if (teluguVoice) {
        utterance.voice = teluguVoice;
      }
      utterance.lang = 'te-IN';
      utterance.rate = 0.9; // Slightly slower for clarity
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = async (transcript) => {
    setIsProcessing(true);
    
    // Gather context based on current page
    let context = {
      currentPage: location.pathname,
      availableTabs: ['Dashboard', 'Add Crop', 'Buyer Requests', 'My Deals', 'Market', 'Profile'],
      marketDataPreview: verifiedPrices.slice(0, 5), // Send top 5 crops to save tokens, or all if needed
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript, context })
      });
      
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      speak(data.reply);
      
    } catch (err) {
      console.error(err);
      speak('క్షమించండి, సర్వర్ సమస్య ఉంది. తర్వాత మళ్ళీ ప్రయత్నించండి.'); // Sorry, server issue. Try again later.
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Initialize TTS engine on user click to bypass strict mobile browser auto-play restrictions
      if ('speechSynthesis' in window) {
         window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
      }
      
      // Ensure voices are loaded
      window.speechSynthesis.getVoices();
      recognitionRef.current?.start();
    }
  };

  if (!recognitionRef.current && !error) return null;

  return (
    <div className="relative flex items-center">
      <button
        onClick={toggleListen}
        disabled={isProcessing}
        className={`p-2 rounded-full flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-red-100 text-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : isProcessing
              ? 'bg-blue-100 text-blue-600'
              : 'bg-[#e4efe7] text-[#1F4D36] hover:bg-[#c9e2d1]'
        }`}
        title="Voice Assistant (Telugu)"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-50 text-red-600 text-xs p-2 rounded border border-red-200 whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}
