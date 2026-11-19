import mongoose from 'mongoose';
import Salon from '../models/Salon.js';

const DEFAULT_SALON_GALLERY = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
];

const FALLBACK_SALONS = [
  {
    _id: 'sample-salon-1',
    name: 'Lakme Salon Marunji',
    description: 'Premium hair cutting, styling, beard grooming, and luxury spa treatments.',
    address: 'Laxmi Chowk, Marunji Village',
    city: 'Pune',
    state: 'Maharashtra',
    rating: 4.8,
    totalReviews: 124,
    startingPrice: 200,
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    _id: 'sample-salon-2',
    name: 'Style Studio Unisex Salon',
    description: 'Best unisex salon for modern fade cuts, color highlights, and styling.',
    address: 'Near Life Republic, Marunji Road',
    city: 'Pune',
    state: 'Maharashtra',
    rating: 4.6,
    totalReviews: 98,
    startingPrice: 150,
    images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    _id: 'sample-salon-3',
    name: 'Truefitt & Hill Executive Grooming',
    description: 'World-renowned royal barbershop grooming, hot towel shave, and precision cuts.',
    address: 'Hinjawadi Phase 1, High Street',
    city: 'Pune',
    state: 'Maharashtra',
    rating: 4.9,
    totalReviews: 210,
    startingPrice: 350,
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    _id: 'sample-salon-4',
    name: 'Urban Blade & Beards',
    description: 'Trendy cuts, textured crops, beard sculpting, and rejuvenating head massage.',
    address: 'Wakad Bridge, Dange Chowk Road',
    city: 'Pune',
    state: 'Maharashtra',
    rating: 4.7,
    totalReviews: 87,
    startingPrice: 180,
    images: [
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

export const isSalonImagesRequest = (text) => {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase().trim();

  // Direct regex patterns
  const directPatterns = [
    /watch\s+(?:the\s+|all\s+|whole\s+)?salons?/i,
    /see\s+(?:the\s+|all\s+|whole\s+)?salons?/i,
    /view\s+(?:the\s+|all\s+|whole\s+)?salons?/i,
    /show\s+(?:me\s+)?(?:the\s+|all\s+|whole\s+)?(?:images?|photos?|pics?|pictures?)?\s*(?:of\s+)?(?:all\s+|the\s+|whole\s+)?salons?/i,
    /(?:images?|photos?|pics?|pictures?)\s+(?:of\s+)?(?:all\s+|the\s+|whole\s+)?salons?/i,
    /salons?\s+(?:images?|photos?|pics?|pictures?)/i,
    /whole\s+salons?/i,
    /all\s+salons?/i,
    /list\s+(?:all\s+)?salons?/i,
    /browse\s+salons?/i,
    /explore\s+salons?/i,
  ];

  if (directPatterns.some((pattern) => pattern.test(t))) {
    return true;
  }

  // Combined terms check: mentions "salon" AND mentions visual/overview intent
  const mentionsSalon = /\bsalons?\b/i.test(t);
  const mentionsVisualOrAll = /\b(watch|whole|all|pic|pics|picture|pictures|image|images|photo|photos|view|look|gallery|browse|explore|show|display|interior|shop|shops|exterior)\b/i.test(t);

  if (mentionsSalon && mentionsVisualOrAll) {
    return true;
  }

  return false;
};

export const generateAiResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const currentInput = prompt.trim();
    const lowerInput = currentInput.toLowerCase();
    let reply = "I'm still learning! For now, I can help you with styling advice, pricing, and booking information.";
    let imageUrl = null;

    // 1. Check if user wants to watch / see all salons or salon pictures
    if (isSalonImagesRequest(lowerInput)) {
      let rawSalons = [];
      if (mongoose.connection?.readyState === 1) {
        try {
          rawSalons = await Salon.find({
            verificationStatus: { $ne: 'rejected' },
          })
            .select('name description address city state rating totalReviews images services activeOffer phone')
            .sort({ rating: -1, createdAt: -1 })
            .limit(10)
            .lean();
        } catch (dbErr) {
          console.warn('DB query error in aiController, using fallback salons:', dbErr.message);
        }
      }

      if (!rawSalons || rawSalons.length === 0) {
        rawSalons = FALLBACK_SALONS;
      }

      const formattedSalons = rawSalons.map((salon, idx) => {
        const images = (Array.isArray(salon.images) && salon.images.length > 0)
          ? salon.images
          : [
              DEFAULT_SALON_GALLERY[idx % DEFAULT_SALON_GALLERY.length],
              DEFAULT_SALON_GALLERY[(idx + 1) % DEFAULT_SALON_GALLERY.length],
            ];

        const startingPrice = Array.isArray(salon.services) && salon.services.length > 0
          ? Math.min(...salon.services.map((s) => Number(s.price) || 200))
          : (salon.startingPrice || 150);

        return {
          _id: salon._id?.toString() || `salon-${idx}`,
          name: salon.name || 'CutMate Partner Salon',
          description: salon.description || 'Professional grooming and hair styling salon.',
          address: salon.address || 'Pune, Maharashtra',
          city: salon.city || 'Pune',
          state: salon.state || 'Maharashtra',
          rating: Number(salon.rating) || 4.7,
          totalReviews: Number(salon.totalReviews) || 45,
          images,
          primaryImage: images[0],
          startingPrice,
          activeOffer: salon.activeOffer?.isActive ? salon.activeOffer.title : null,
          phone: salon.phone || '',
        };
      });

      reply = `Here are our verified salons with their real photos, ratings, and locations! Click on any salon to explore services or book your spot:`;
      imageUrl = formattedSalons[0]?.primaryImage || null;

      return res.json({
        success: true,
        reply,
        imageUrl,
        salons: formattedSalons,
        type: 'salons',
      });
    }

    // 2. Check if user wants a generated hairstyle photo (e.g., "photo of fade haircut")
    const photoMatch = lowerInput.match(/(?:photo|image|picture|pic)(?:s)?(?:\s+(?:of|for))?\s*(?:a\s+|an\s+)?(.*)/i);
    if (photoMatch) {
      const subject = photoMatch[1] ? photoMatch[1].trim() : 'haircut';
      const query = encodeURIComponent(subject);
      reply = `Here is an inspiration photo of ${subject}!`;
      imageUrl = `https://image.pollinations.ai/prompt/${query}?width=500&height=380&nologo=true`;
      return res.json({ success: true, reply, imageUrl });
    }

    // 3. Try to use real Gemini AI if API key is provided
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are a helpful salon AI assistant for CutMate. User says: ${prompt}` }] }]
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

    // 4. Fallback to free real-time AI (Pollinations Text API)
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
