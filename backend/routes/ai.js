const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const FEATURE_PROMPTS = {
  wardrobe: {
    system: 'You are an expert fashion stylist and wardrobe consultant.',
    prompt: (data) => `Analyze this wardrobe and provide personalized recommendations. Current wardrobe items: ${JSON.stringify(data)}. Provide: 1) Wardrobe gaps analysis 2) Must-have items to add 3) Items that can be versatile 4) Color coordination tips 5) Seasonal readiness assessment. Format your response with clear sections and bullet points.`
  },
  outfits: {
    system: 'You are an expert outfit coordinator and fashion stylist.',
    prompt: (data) => `Based on these outfit combinations: ${JSON.stringify(data)}. Provide: 1) Best outfit combinations 2) New outfit ideas 3) Style improvement tips 4) Occasion-appropriate suggestions 5) Accessory pairing recommendations. Format with clear sections.`
  },
  'style-profile': {
    system: 'You are a personal style analyst and fashion psychologist.',
    prompt: (data) => `Analyze this style profile: ${JSON.stringify(data)}. Provide: 1) Style personality summary 2) Best fashion brands for this profile 3) Key pieces to invest in 4) Style evolution suggestions 5) Celebrity style matches. Format with clear sections.`
  },
  occasions: {
    system: 'You are an event fashion specialist and dress code expert.',
    prompt: (data) => `Review these upcoming occasions: ${JSON.stringify(data)}. Provide: 1) Outfit recommendations for each event 2) Dress code interpretations 3) Budget-friendly options 4) Last-minute styling tips 5) Weather-appropriate modifications. Format with clear sections.`
  },
  'color-analysis': {
    system: 'You are a color theory expert specializing in personal color analysis.',
    prompt: (data) => `Analyze this color palette: ${JSON.stringify(data)}. Provide: 1) Seasonal color type assessment 2) Best colors for skin tone 3) Color combination suggestions 4) Colors to avoid 5) How to incorporate new colors gradually. Format with clear sections.`
  },
  trends: {
    system: 'You are a fashion trend forecaster and style analyst.',
    prompt: (data) => `Review these fashion trends: ${JSON.stringify(data)}. Provide: 1) Which trends suit the user 2) How to incorporate trends affordably 3) Trend longevity predictions 4) Mix classic with trendy tips 5) Upcoming micro-trends to watch. Format with clear sections.`
  },
  shopping: {
    system: 'You are a personal shopping advisor and fashion deal expert.',
    prompt: (data) => `Review this shopping list: ${JSON.stringify(data)}. Provide: 1) Priority ranking of items 2) Best time to buy each item 3) Alternative budget options 4) Quality vs price analysis 5) Capsule wardrobe integration tips. Format with clear sections.`
  },
  'outfit-calendar': {
    system: 'You are a weekly outfit planner and style organizer.',
    prompt: (data) => `Review this outfit calendar: ${JSON.stringify(data)}. Provide: 1) Weekly outfit optimization 2) Weather-based adjustments 3) Outfit repetition strategies 4) Mix and match suggestions 5) Preparation tips for the week ahead. Format with clear sections.`
  },
  'style-boards': {
    system: 'You are a fashion mood board curator and style inspiration expert.',
    prompt: (data) => `Analyze these style boards: ${JSON.stringify(data)}. Provide: 1) Theme cohesion analysis 2) Missing elements 3) Achievable looks from the boards 4) Shopping list to recreate looks 5) Style board evolution suggestions. Format with clear sections.`
  },
  'clothing-care': {
    system: 'You are a garment care specialist and textile expert.',
    prompt: (data) => `Review these clothing care entries: ${JSON.stringify(data)}. Provide: 1) Care routine optimization 2) Common care mistakes to avoid 3) Product recommendations 4) Storage tips by fabric type 5) Longevity tips for expensive pieces. Format with clear sections.`
  },
  budget: {
    system: 'You are a fashion budget advisor and smart shopping expert.',
    prompt: (data) => `Analyze this fashion budget: ${JSON.stringify(data)}. Provide: 1) Spending pattern analysis 2) Cost-per-wear calculations 3) Budget optimization tips 4) Investment pieces vs fast fashion 5) Monthly budget recommendations. Format with clear sections.`
  },
  seasonal: {
    system: 'You are a seasonal wardrobe transition specialist.',
    prompt: (data) => `Review these seasonal items: ${JSON.stringify(data)}. Provide: 1) Seasonal transition plan 2) Items that work across seasons 3) Storage recommendations 4) Gap analysis per season 5) Seasonal capsule wardrobe suggestions. Format with clear sections.`
  },
  'mix-match': {
    system: 'You are an expert in creating versatile outfit combinations.',
    prompt: (data) => `Analyze these mix & match combinations: ${JSON.stringify(data)}. Provide: 1) Best combination rankings 2) Unexplored combinations 3) Versatility scores 4) Style consistency analysis 5) New pieces that maximize combinations. Format with clear sections.`
  },
  'style-quiz': {
    system: 'You are a style personality analyst and fashion psychologist.',
    prompt: (data) => `Analyze these style quiz responses: ${JSON.stringify(data)}. Provide: 1) Overall style personality type 2) Detailed style breakdown 3) Shopping recommendations 4) Brands that match your style 5) Style evolution path. Format with clear sections.`
  },
  'fashion-feed': {
    system: 'You are a fashion content curator and style journalist.',
    prompt: (data) => `Based on these fashion feed preferences: ${JSON.stringify(data)}. Provide: 1) Personalized style tips 2) Trending topics analysis 3) Must-read fashion resources 4) Upcoming fashion events 5) Influencer recommendations. Format with clear sections.`
  }
};

const TABLE_MAP = {
  wardrobe: 'wardrobe_items',
  outfits: 'outfits',
  'style-profile': 'style_profiles',
  occasions: 'occasions',
  'color-analysis': 'color_palettes',
  trends: 'trends',
  shopping: 'shopping_items',
  'outfit-calendar': 'outfit_calendar',
  'style-boards': 'style_boards',
  'clothing-care': 'clothing_care',
  budget: 'budget_entries',
  seasonal: 'seasonal_items',
  'mix-match': 'mix_match',
  'style-quiz': 'style_quiz',
  'fashion-feed': 'fashion_feed'
};

// Rate limiter: 20 requests per hour per user or IP
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req.userId ? `user_${req.userId}` : req.ip),
  message: { error: 'Too many AI requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/ai/history — paginated ai_history for logged-in user, optionally filtered by feature
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const feature = req.query.feature || null;

    let countQuery = 'SELECT COUNT(*) FROM ai_history WHERE user_id = $1';
    let dataQuery = 'SELECT id, feature, result, created_at FROM ai_history WHERE user_id = $1';
    const params = [req.userId];

    if (feature) {
      countQuery += ' AND feature = $2';
      dataQuery += ' AND feature = $2';
      params.push(feature);
      dataQuery += ` ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      params.push(limit, offset);
    } else {
      dataQuery += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    }

    const countResult = await pool.query(countQuery, feature ? [req.userId, feature] : [req.userId]);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(dataQuery, params);

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/:feature
router.post('/:feature', authMiddleware, aiRateLimiter, async (req, res) => {
  const { feature } = req.params;
  const { customPrompt } = req.body;

  if (!FEATURE_PROMPTS[feature]) {
    return res.status(400).json({ error: 'Invalid feature' });
  }

  try {
    const tableName = TABLE_MAP[feature];
    const dataResult = await pool.query(
      `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.userId]
    );

    const featureConfig = FEATURE_PROMPTS[feature];
    const userPrompt = customPrompt || featureConfig.prompt(dataResult.rows);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Personal Stylist'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: featureConfig.system },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'AI request failed' });
    }

    const aiContent = data.choices?.[0]?.message?.content || 'No response generated';

    // Persist AI result
    try {
      await pool.query(
        'INSERT INTO ai_history (user_id, feature, result) VALUES ($1, $2, $3)',
        [req.userId, feature, aiContent]
      );
    } catch (saveErr) {
      console.error('Failed to save AI history:', saveErr.message);
    }

    res.json({
      feature,
      response: aiContent,
      model: data.model || process.env.OPENROUTER_MODEL,
      usage: data.usage || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
