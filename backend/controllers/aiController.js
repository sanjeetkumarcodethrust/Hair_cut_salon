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
    const photoMatch = currentInput.match(/(?:photo|image|picture|pic)(?:s)?(?:\s+(?:of|for))?\s*(?:a\s+|an\s+)?(.*)/i);
    if (photoMatch) {
      const subject = photoMatch[1] ? photoMatch[1].trim() : 'hair salon';
      const query = encodeURIComponent(subject);
      reply = `Here is a real-world generated image of ${subject}!`;
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
      }
    }

    // 3. Fallback to free real-time AI (Pollinations Text API)
    try {
      const sysPrompt = "You are a helpful AI assistant for a hair salon called CutMate. Keep responses short, friendly, and helpful.";
      const encodedPrompt = encodeURIComponent(`${sysPrompt} User says: ${prompt}`);
      const textResponse = await fetch(`https://text.pollinations.ai/prompt/${encodedPrompt}`);
      if (textResponse.ok) {
        reply = await textResponse.text();
        return res.json({ success: true, reply, imageUrl });
      }
    } catch (err) {
      console.error('Free AI API Error:', err);
    }

    // Return the response
    res.json({ success: true, reply, imageUrl });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

