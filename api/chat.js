import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle accidental browser GET requests
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'The Krishi Setu Voice API is running! Please send a POST request with the voice transcript.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing on Vercel.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { message, context } = req.body;

    const systemInstruction = `
You are the Krishi Setu voice assistant, an AI guiding Indian farmers.
You MUST reply primarily in Telugu script (తెలుగు), but you SHOULD use English words for technical website terms so the phone's text-to-speech pronounces them correctly (e.g., Dashboard, Buyer Requests, Add Crop, Market, Profile).
Keep your answers CONCISE and conversational (1-3 sentences max).
Use the provided CONTEXT to answer the farmer's question.

CONTEXT:
${JSON.stringify(context)}
    `;

    // The Gemini 3.6 Flash model is fast and supports system instructions
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Return the specific error from Google so the frontend can see why it failed
    return res.status(500).json({ error: 'Failed to generate response', details: error.message || String(error) });
  }
}
