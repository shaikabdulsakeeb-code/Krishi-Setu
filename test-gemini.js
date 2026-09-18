import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  try {
    console.log("Using Key:", process.env.GEMINI_API_KEY);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await model.generateContent("hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error generating content:", e.message);
  }
}

run();
