import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback logic from JSON (to keep it dynamic even without API key)
const aiResponsesPath = path.join(__dirname, '../../frontend/src/data/aiResponses.json');

export const generateAiResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const currentInput = prompt.trim().toLowerCase();
    let reply = "I'm still learning! For now, I can help you with styling advice, pricing, and booking information.";
    let imageUrl = null;

    // 1. Check if user wants a photo
    const photoMatch = currentInput.match(/(?:generate|show|make|create)?\s*(?:a\s+)?(?:photo|image|picture)\s+(?:of|for)?\s*(?:a\s+|an\s+)?(.*)/i);
    if (photoMatch && photoMatch[1]) {
      const query = encodeURIComponent(photoMatch[1].trim());
      reply = `Here is a real-world generated image of ${photoMatch[1]}!`;
      imageUrl = `https://image.pollinations.ai/prompt/${query}?width=400&height=300&nologo=true`;
      return res.json({ success: true, reply, imageUrl });
    }

    // 2. Try to use real Gemini AI if API key is provided
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are a helpful salon AI assistant. User says: ${prompt}` }] }]
          })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          reply = data.candidates[0].content.parts[0].text;
          return res.json({ success: true, reply, imageUrl });
        }
      } catch (err) {
        console.error('Gemini API Error:', err);
        // Fallback to JSON if Gemini fails
      }
    }

    // 3. Fallback to Dynamic JSON responses
    try {
      if (fs.existsSync(aiResponsesPath)) {
        const rawData = fs.readFileSync(aiResponsesPath, 'utf8');
        const aiData = JSON.parse(rawData);
        reply = aiData.default;

        for (const intent of aiData.intents) {
          const matched = intent.keywords.some(keyword => currentInput.includes(keyword) || currentInput.match(new RegExp(`\\b${keyword}\\b`)));
          if (matched) {
            reply = intent.reply;
            break;
          }
        }
      }
    } catch (err) {
      console.error('Error reading JSON:', err);
    }

    res.json({ success: true, reply, imageUrl });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
