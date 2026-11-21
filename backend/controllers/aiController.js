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

export const CUTMATE_OFFICIAL_PRICING = [
  {
    name: "Men's Classic Haircut",
    category: 'Hair',
    price: '₹150 – ₹250',
    minPrice: 150,
    maxPrice: 250,
    duration: '30 mins',
    desc: 'Precision scissor/clipper cut, shampoo wash & blow styling',
  },
  {
    name: 'Fade / Taper Cut',
    category: 'Hair',
    price: '₹200 – ₹300',
    minPrice: 200,
    maxPrice: 300,
    duration: '35 mins',
    desc: 'Modern skin, low, mid, or high fade with razor line-up',
  },
  {
    name: "Women's Haircut & Styling",
    category: 'Hair',
    price: '₹400 – ₹600',
    minPrice: 400,
    maxPrice: 600,
    duration: '45 mins',
    desc: 'Layered cut, bangs, feathering, wash & professional blow-dry',
  },
  {
    name: "Kids' Haircut (Under 12)",
    category: 'Hair',
    price: '₹100 – ₹150',
    minPrice: 100,
    maxPrice: 150,
    duration: '20 mins',
    desc: 'Gentle, patient haircut customized for kids',
  },
  {
    name: "Men's Beard Trim & Shaping",
    category: 'Beard',
    price: '₹100 – ₹150',
    minPrice: 100,
    maxPrice: 150,
    duration: '20 mins',
    desc: 'Beard outline, length trimming, razor edging & herbal beard oil',
  },
  {
    name: 'Haircut + Beard Styling Combo',
    category: 'Combo',
    price: '₹250 – ₹350',
    minPrice: 250,
    maxPrice: 350,
    duration: '45 mins',
    desc: 'Full precision haircut with complete beard shaping & grooming',
  },
  {
    name: 'Royal Shave & Hot Towel',
    category: 'Beard',
    price: '₹120 – ₹180',
    minPrice: 120,
    maxPrice: 180,
    duration: '25 mins',
    desc: 'Classic straight-razor shave with warm herbal hot towel relaxation',
  },
  {
    name: 'Nourishing Hair Spa',
    category: 'Spa',
    price: '₹600 – ₹900',
    minPrice: 600,
    maxPrice: 900,
    duration: '60 mins',
    desc: 'Deep conditioning cream massage, steam therapy & serum rinse',
  },
  {
    name: 'Global Hair Color / Highlights',
    category: 'Color',
    price: '₹1,200 – ₹1,800',
    minPrice: 1200,
    maxPrice: 1800,
    duration: '90 mins',
    desc: 'Ammonia-free permanent rich hair color or trendy highlights',
  },
  {
    name: 'Herbal Scalp & Head Massage',
    category: 'Spa',
    price: '₹150 – ₹250',
    minPrice: 150,
    maxPrice: 250,
    duration: '30 mins',
    desc: 'Relaxing hot oil Ayurvedic scalp, neck, and shoulder massage',
  },
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

const formatSalons = (rawSalons) => {
  const list = (!rawSalons || rawSalons.length === 0) ? FALLBACK_SALONS : rawSalons;
  return list.map((salon, idx) => {
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
};

export const isPricingRequest = (text) => {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase().trim();

  // Price & service cost keywords
  const pricingWords = /\b(price|prices|pricing|rate|rates|cost|costs|fee|fees|charge|charges|how much|menu|package|packages|rupee|rupees|inr)\b/i;
  if (pricingWords.test(t)) {
    return true;
  }

  // Common pricing query patterns
  if (/how\s+much/i.test(t)) return true;
  if (/what\s+(?:are\s+)?(?:the\s+)?(?:haircut\s+)?prices?/i.test(t)) return true;
  if (/service\s+(?:price|rate|cost)/i.test(t)) return true;
  if (/real\s+price/i.test(t)) return true;

  return false;
};

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

export const sanitizeRupeePrices = (text) => {
  if (!text || typeof text !== 'string') return text;

  let s = text;
  // Convert $ amounts to reasonable Indian Rupee amounts
  s = s.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, (match, p1) => {
    const val = parseFloat(p1);
    if (val === 0) return '₹0';
    if (val <= 5) return '₹50';
    if (val <= 10) return '₹100';
    if (val <= 15) return '₹150';
    if (val <= 20) return '₹200';
    if (val <= 25) return '₹200';
    if (val <= 30) return '₹250';
    if (val <= 40) return '₹350';
    if (val <= 50) return '₹500';
    return `₹${Math.round(val * 10)}`;
  });

  // Replace any leftover dollar signs with rupee symbol
  s = s.replace(/\$/g, '₹');
  s = s.replace(/\bUSD\b/gi, 'INR (₹)');
  s = s.replace(/\bdollars?\b/gi, 'Rupees (₹)');
  s = s.replace(/\bbucks?\b/gi, 'Rupees');

  return s;
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

    // Fetch salons if needed
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
    const formattedSalons = formatSalons(rawSalons);

    // 1. Check if user asks for PRICING / RATES / HOW MUCH / MENU
    if (isPricingRequest(lowerInput)) {
      reply = `Here is our official pricing rundown for CutMate partner salons (all prices in Indian Rupees ₹):

| Service | Real Price (₹) | Duration |
|:---|:---:|:---:|
| ✂️ Men's Classic Haircut | ₹150 – ₹250 | 30 mins |
| ⚡ Modern Fade / Taper Cut | ₹200 – ₹300 | 35 mins |
| 💇 Women's Haircut & Styling | ₹400 – ₹600 | 45 mins |
| 🧒 Kids' Cut (under 12) | ₹100 – ₹150 | 20 mins |
| 🧔 Men's Beard Trim & Shaping | ₹100 – ₹150 | 20 mins |
| ✂️+🧔 Haircut + Beard Combo | ₹250 – ₹350 | 45 mins |
| 🪒 Royal Shave & Hot Towel | ₹120 – ₹180 | 25 mins |
| 💆 Nourishing Hair Spa | ₹600 – ₹900 | 60 mins |
| 🎨 Global Hair Color / Highlights | ₹1,200 – ₹1,800 | 90 mins |
| 💆‍♂️ Herbal Head Massage | ₹150 – ₹250 | 30 mins |

💡 All prices are in real Indian Rupees (₹). Prices may vary slightly by salon location and stylist level. You can check our partner salons below to view their exact menu and book your appointment directly!`;

      return res.json({
        success: true,
        reply,
        pricing: CUTMATE_OFFICIAL_PRICING,
        salons: formattedSalons.slice(0, 4),
        type: 'pricing',
      });
    }

    // 2. Check if user wants to watch / see all salons or salon pictures
    if (isSalonImagesRequest(lowerInput)) {
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

    // 3. Check if user wants a generated hairstyle photo (e.g., "photo of fade haircut")
    const photoMatch = lowerInput.match(/(?:photo|image|picture|pic)(?:s)?(?:\s+(?:of|for))?\s*(?:a\s+|an\s+)?(.*)/i);
    if (photoMatch) {
      const subject = photoMatch[1] ? photoMatch[1].trim() : 'haircut';
      const query = encodeURIComponent(subject);
      reply = `Here is an inspiration photo of ${subject}!`;
      imageUrl = `https://image.pollinations.ai/prompt/${query}?width=500&height=380&nologo=true`;
      return res.json({ success: true, reply, imageUrl });
    }

    // 4. Try to use real Gemini AI if API key is provided
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const geminiSysPrompt = `You are a helpful salon AI assistant for CutMate, an Indian hair salon platform located in Pune, Maharashtra.
CRITICAL INSTRUCTION:
- CutMate is in India. All prices MUST ALWAYS be stated in real Indian Rupees (₹ / INR).
- NEVER use US dollars ($) or any currency other than ₹ (Rupees).
- Standard pricing guide: Men's haircut ₹150–₹250, Women's haircut ₹400–₹600, Beard trim ₹100–₹150, Combos ₹250–₹350, Hair Spa ₹600–₹900, Hair Color ₹1,200–₹1,800.
User says: ${prompt}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiSysPrompt }] }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          reply = sanitizeRupeePrices(data.candidates[0].content.parts[0].text);
          return res.json({ success: true, reply, imageUrl });
        }
      } catch (err) {
        console.error('Gemini API Error:', err);
      }
    }

    // 5. Fallback to free real-time AI (Pollinations Text API)
    try {
      const sysPrompt = "You are a helpful AI assistant for CutMate hair salon platform in Pune, India. RULE: All prices MUST be in Indian Rupees (₹ / INR). NEVER use dollars ($). Men haircut ₹150-₹250, Women haircut ₹400-₹600, Beard trim ₹100-₹150, Spa ₹600-₹900. Keep responses friendly, short, and helpful.";
      const encodedPrompt = encodeURIComponent(`${sysPrompt} User says: ${prompt}`);
      const textResponse = await fetch(`https://text.pollinations.ai/prompt/${encodedPrompt}`);
      if (textResponse.ok) {
        const rawText = await textResponse.text();
        reply = sanitizeRupeePrices(rawText);
        return res.json({ success: true, reply, imageUrl });
      }
    } catch (err) {
      console.error('Free AI API Error:', err);
    }

    // Return the response
    res.json({ success: true, reply: sanitizeRupeePrices(reply), imageUrl });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
