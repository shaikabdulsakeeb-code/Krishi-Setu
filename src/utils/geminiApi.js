import defaultPrices from '../data/verifiedPrices.json';

const CACHE_KEY = 'krishi_setu_market_prices';
const CACHE_TIME_KEY = 'krishi_setu_market_prices_time';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getMarketPrices() {
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedTime && cachedData) {
    const isExpired = Date.now() - Number(cachedTime) > CACHE_EXPIRY_MS;
    if (!isExpired) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.warn('Failed to parse cached market prices', e);
      }
    }
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No Gemini API Key found. Falling back to default verified prices.");
    return defaultPrices;
  }

  try {
    const prompt = `You are an agriculture pricing API. 
Provide the current indicative wholesale price in INR per kg for the following common Indian crops:
Tomato, Onion, Potato, Brinjal, Cabbage, Cauliflower, Lady Finger, Green Chilli, Lemon, Garlic, Ginger, Apple, Banana, Mango, Grapes.
Also provide the names in Telugu and Hindi.

Return ONLY a valid JSON array of objects with this EXACT schema, no markdown blocks:
[
  {
    "crop": "English Name",
    "telugu_name": "Telugu Name",
    "hindi_name": "Hindi Name",
    "modal_price_rs_per_kg": 25.50,
    "price_basis": "India median",
    "price_status": "Current indicative wholesale price; verify state/APMC before trading",
    "unit": "INR/kg"
  }
]
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (textResponse) {
      // Remove markdown formatting if present
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedPrices = JSON.parse(textResponse);
      
      if (Array.isArray(parsedPrices) && parsedPrices.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsedPrices));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        return parsedPrices;
      }
    }
    
    throw new Error('Invalid response from Gemini');
  } catch (error) {
    console.error("Error fetching from Gemini API, falling back to default:", error);
    return defaultPrices;
  }
}
