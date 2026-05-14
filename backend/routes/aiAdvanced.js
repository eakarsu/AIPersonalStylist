const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Rate limiter: 20 requests per hour per user
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req.userId ? `user_${req.userId}` : req.ip),
  message: { error: 'Too many AI requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3-strategy JSON parser
function parseAIJson(text) {
  try { return JSON.parse(text); } catch {}
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) { try { return JSON.parse(codeBlock[1].trim()); } catch {} }
  const firstBrace = text.search(/[{[]/);
  if (firstBrace >= 0) {
    let depth = 0; let inStr = false; let escape = false;
    for (let i = firstBrace; i < text.length; i++) {
      const c = text[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') {
        depth--;
        if (depth === 0) { try { return JSON.parse(text.slice(firstBrace, i + 1)); } catch {} break; }
      }
    }
  }
  return null;
}

async function callOpenRouter(systemPrompt, userMessage) {
  if (!process.env.OPENROUTER_API_KEY) {
    const e = new Error('OPENROUTER_API_KEY is not configured');
    e.code = 'NO_API_KEY';
    e.status = 503;
    throw e;
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'AI Personal Stylist',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'AI request failed');
  return data.choices?.[0]?.message?.content || '';
}

async function saveAiResult(userId, endpoint, result, metadata) {
  try {
    await pool.query(
      'INSERT INTO ai_results (user_id, endpoint, result, metadata) VALUES ($1, $2, $3, $4)',
      [userId, endpoint, result, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Failed to save AI result:', err.message);
  }
}

// POST /api/ai-advanced/generate-outfit
router.post('/generate-outfit', authMiddleware, aiRateLimiter,
  body('occasion').notEmpty().withMessage('occasion is required'),
  body('weather').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { occasion, weather } = req.body;

      const [wardrobeResult, styleResult] = await Promise.all([
        pool.query('SELECT id, name, category, color, brand, size, season, style, occasions, notes FROM wardrobe_items WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]),
        pool.query('SELECT attribute, value, category FROM style_profiles WHERE user_id = $1 ORDER BY importance DESC LIMIT 20', [req.userId]),
      ]);

      const systemPrompt = 'You are an expert personal stylist creating outfit combinations from a specific wardrobe. Respond ONLY with valid JSON.';
      const userMessage = `Create outfit combinations for the given occasion from this wardrobe. Return JSON:
{
  "occasion": "${occasion}",
  "weather": "${weather || 'not specified'}",
  "outfits": [
    {
      "outfit_name": "<name>",
      "vibe": "<description>",
      "top": {"item_name": "<name>", "item_id": <id or null>, "reason": "<why>"},
      "bottom": {"item_name": "<name>", "item_id": <id or null>, "reason": "<why>"},
      "shoes": {"item_name": "<name>", "item_id": <id or null>, "reason": "<why>"},
      "outerwear": {"item_name": "<name or null>", "item_id": <id or null>},
      "accessories": ["<accessory 1>", "<accessory 2>"],
      "styling_tips": "<tip>",
      "confidence_score": <1-10>
    }
  ],
  "shopping_suggestions": [{"item": "<item>", "reason": "<gap in wardrobe>"}],
  "styling_notes": "<overall advice>"
}

Wardrobe (${wardrobeResult.rows.length} items): ${JSON.stringify(wardrobeResult.rows)}
Style Profile: ${JSON.stringify(styleResult.rows)}
Occasion: ${occasion}
Weather: ${weather || 'not specified'}

Create 2-3 outfit options. Reference actual wardrobe item IDs where possible.`;

      const aiText = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiText);

      await saveAiResult(req.userId, 'generate-outfit', aiText, { occasion, weather, wardrobe_items: wardrobeResult.rows.length });
      try {
        await pool.query('INSERT INTO ai_history (user_id, feature, result) VALUES ($1, $2, $3)', [req.userId, 'generate-outfit', aiText]);
      } catch {}

      res.json({ outfits: parsed || aiText, raw: aiText, wardrobe_count: wardrobeResult.rows.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/ai-advanced/seasonal-analysis
router.post('/seasonal-analysis', authMiddleware, aiRateLimiter,
  body('current_season').notEmpty().withMessage('current_season is required'),
  body('upcoming_events').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { current_season, upcoming_events } = req.body;

      const wardrobeResult = await pool.query(
        'SELECT id, name, category, color, brand, season, style, occasions FROM wardrobe_items WHERE user_id = $1',
        [req.userId]
      );

      const systemPrompt = 'You are a seasonal wardrobe consultant. Respond ONLY with valid JSON.';
      const userMessage = `Analyze this wardrobe for the ${current_season} season. Return JSON:
{
  "season": "${current_season}",
  "wardrobe_score": <1-10>,
  "summary": "<paragraph>",
  "items_by_season_readiness": {
    "perfect_for_season": [{"id": <id>, "name": "<name>", "reason": "<why>"}],
    "works_with_layering": [{"id": <id>, "name": "<name>", "tip": "<how>"}],
    "not_suitable": [{"id": <id>, "name": "<name>", "reason": "<why>"}]
  },
  "missing_essentials": [
    {"item": "<item>", "category": "<category>", "priority": "high|medium|low", "reason": "<why needed>", "estimated_budget": "<$XX-XX>"}
  ],
  "outfit_ideas_for_season": [
    {"name": "<outfit name>", "items": ["<item 1>", "<item 2>"], "occasion": "<when to wear>"}
  ],
  "transition_tips": ["<tip 1>", "<tip 2>"],
  "events_readiness": ${upcoming_events ? `{"events": "${upcoming_events}", "assessment": "<assessment>", "gaps": ["<gap>"]}` : 'null'}
}

Wardrobe (${wardrobeResult.rows.length} items): ${JSON.stringify(wardrobeResult.rows)}
Season: ${current_season}
Upcoming events: ${upcoming_events || 'none specified'}`;

      const aiText = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiText);

      await saveAiResult(req.userId, 'seasonal-analysis', aiText, { current_season, upcoming_events, wardrobe_items: wardrobeResult.rows.length });
      try {
        await pool.query('INSERT INTO ai_history (user_id, feature, result) VALUES ($1, $2, $3)', [req.userId, 'seasonal-analysis', aiText]);
      } catch {}

      res.json({ analysis: parsed || aiText, raw: aiText });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/users/:id/style-profile
router.post('/users/:id/style-profile', authMiddleware, aiRateLimiter,
  body('body_measurements').optional().isObject(),
  body('skin_tone').optional().isString(),
  body('preferred_styles').optional().isArray(),
  body('lifestyle').optional().isString(),
  async (req, res) => {
    try {
      if (parseInt(req.params.id) !== req.userId) return res.status(403).json({ error: 'Forbidden' });

      const { body_measurements, skin_tone, preferred_styles, lifestyle } = req.body;

      const wardrobeResult = await pool.query('SELECT category, color, brand, season FROM wardrobe_items WHERE user_id = $1', [req.userId]);
      const existingProfile = await pool.query('SELECT attribute, value, category FROM style_profiles WHERE user_id = $1', [req.userId]);

      const systemPrompt = 'You are a professional personal stylist and image consultant. Create a comprehensive style profile. Respond ONLY with valid JSON.';
      const userMessage = `Create a comprehensive style profile based on this information. Return JSON:
{
  "style_personality": "<primary style type name>",
  "style_personality_description": "<paragraph>",
  "secondary_styles": ["<style 1>", "<style 2>"],
  "color_palette": {
    "best_colors": ["<hex or color name>"],
    "accent_colors": ["<hex or color name>"],
    "colors_to_avoid": ["<color>"],
    "rationale": "<why these colors>"
  },
  "key_wardrobe_pieces": [
    {"item": "<piece>", "why": "<reason>", "investment_level": "low|medium|high"}
  ],
  "style_rules": ["<rule 1>", "<rule 2>", "<rule 3>"],
  "brands_to_explore": [{"brand": "<brand>", "why": "<reason>", "price_range": "<$XX-XXX>"}],
  "body_shape_tips": "<styling tips for body type>",
  "lifestyle_recommendations": "<how to dress for this lifestyle>",
  "seasonal_focus": {"spring": "<tip>", "summer": "<tip>", "fall": "<tip>", "winter": "<tip>"},
  "capsule_wardrobe_essentials": ["<item 1>", "<item 2>", "<item 3>", "<item 4>", "<item 5>"],
  "shopping_strategy": "<how to shop smarter>"
}

Input:
- Body measurements: ${JSON.stringify(body_measurements || {})}
- Skin tone: ${skin_tone || 'not specified'}
- Preferred styles: ${JSON.stringify(preferred_styles || [])}
- Lifestyle: ${lifestyle || 'not specified'}
- Current wardrobe snapshot: ${JSON.stringify(wardrobeResult.rows.slice(0, 20))}
- Existing profile attributes: ${JSON.stringify(existingProfile.rows)}`;

      const aiText = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiText);

      await saveAiResult(req.userId, 'style-profile-builder', aiText, { skin_tone, lifestyle, preferred_styles });
      try {
        await pool.query('INSERT INTO ai_history (user_id, feature, result) VALUES ($1, $2, $3)', [req.userId, 'style-profile-builder', aiText]);
      } catch {}

      res.json({ profile: parsed || aiText, raw: aiText });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/ai-advanced/cost-per-wear
router.get('/cost-per-wear', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM wardrobe_items WHERE user_id = $1 AND purchase_price IS NOT NULL AND purchase_price > 0',
      [req.userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const wardrobeResult = await pool.query(
      `SELECT id, name, category, brand, color, purchase_price, times_worn,
              CASE WHEN times_worn > 0 THEN ROUND(purchase_price::numeric / times_worn, 2) ELSE purchase_price END AS cost_per_wear
       FROM wardrobe_items
       WHERE user_id = $1 AND purchase_price IS NOT NULL AND purchase_price > 0
       ORDER BY cost_per_wear ASC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    // Get AI insights on the data
    let aiInsights = null;
    if (wardrobeResult.rows.length > 0) {
      try {
        const systemPrompt = 'You are a fashion investment analyst. Respond ONLY with valid JSON.';
        const userMessage = `Analyze these wardrobe items by cost-per-wear and return insights:
{
  "summary": "<1-2 sentence overview>",
  "best_value_items": [{"name": "<name>", "insight": "<why it's great value>"}],
  "poor_value_items": [{"name": "<name>", "advice": "<what to do>"}],
  "average_cost_per_wear": <number>,
  "total_wardrobe_value": <number>,
  "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}

Items: ${JSON.stringify(wardrobeResult.rows)}`;

        const aiText = await callOpenRouter(systemPrompt, userMessage);
        aiInsights = parseAIJson(aiText) || aiText;
        await saveAiResult(req.userId, 'cost-per-wear', aiText, { items_count: wardrobeResult.rows.length });
      } catch (aiErr) {
        console.error('AI cost-per-wear error:', aiErr.message);
      }
    }

    res.json({
      data: wardrobeResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      insights: aiInsights,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-advanced/shopping-recommend
router.post('/shopping-recommend', authMiddleware, aiRateLimiter,
  body('budget').optional().isNumeric(),
  body('focus').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { budget, focus, season } = req.body || {};
      const wardrobe = await pool.query('SELECT id, name, category, color, brand, season FROM wardrobe_items WHERE user_id = $1', [req.userId]);
      const style = await pool.query('SELECT attribute, value FROM style_profiles WHERE user_id = $1 LIMIT 30', [req.userId]);
      const systemPrompt = `You are a personal-shopping advisor. Identify wardrobe gaps and suggest specific purchases that maximize outfit combinations within budget. Return ONLY JSON:
{ "gap_analysis": [string], "recommended_purchases": [{"category": string, "description": string, "priority": "must|should|nice", "estimated_price_usd": number, "rationale": string, "outfits_unlocked_estimate": number}], "monthly_plan": [{"month": string, "items": [string], "estimated_spend_usd": number}], "total_budget_usd": number }`;
      const userMessage = `Budget USD: ${budget || 'flexible'}\nFocus: ${focus || 'general gaps'}\nSeason: ${season || 'current'}\nWardrobe: ${JSON.stringify(wardrobe.rows).slice(0, 4500)}\nStyle profile: ${JSON.stringify(style.rows).slice(0, 1500)}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);
      await saveAiResult(req.userId, 'shopping-recommend', aiResponse, { budget, focus });
      res.json({ recommendation: parsed || aiResponse, raw: aiResponse });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

// POST /api/ai-advanced/trend-forecast
router.post('/trend-forecast', authMiddleware, aiRateLimiter,
  body('horizon_months').optional().isInt({ min: 1, max: 24 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { horizon_months, niche } = req.body || {};
      const trendsRes = await pool.query('SELECT * FROM trends WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30', [req.userId]).catch(() => ({ rows: [] }));
      const styleRes = await pool.query('SELECT attribute, value FROM style_profiles WHERE user_id = $1 LIMIT 30', [req.userId]).catch(() => ({ rows: [] }));
      const systemPrompt = `You forecast personal-fashion trends for the next ${horizon_months || 6} months and assess fit with the user's style. Return ONLY JSON:
{ "macro_trends": [{"trend": string, "rising_or_declining": "rising|peaking|declining", "fit_with_user": "strong|moderate|weak", "adopt_recommendation": string, "longevity_months": number}], "micro_trends_to_watch": [string], "trends_to_skip": [string], "key_purchases_if_adopting": [string] }`;
      const userMessage = `Horizon (months): ${horizon_months || 6}\nNiche / aesthetic: ${niche || 'general'}\nUser-tracked trends: ${JSON.stringify(trendsRes.rows).slice(0, 3500)}\nStyle profile: ${JSON.stringify(styleRes.rows).slice(0, 1500)}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);
      await saveAiResult(req.userId, 'trend-forecast', aiResponse, { horizon_months, niche });
      res.json({ forecast: parsed || aiResponse, raw: aiResponse });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

// POST /api/ai-advanced/occasion-outfit-suggest
router.post('/occasion-outfit-suggest', authMiddleware, aiRateLimiter,
  body('event_name').notEmpty().withMessage('event_name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { event_name, dress_code, weather, location, time_of_day } = req.body || {};
      const wardrobe = await pool.query('SELECT id, name, category, color, brand, size, season, style, occasions FROM wardrobe_items WHERE user_id = $1', [req.userId]);
      const systemPrompt = `You design event-appropriate outfits using only the user's available wardrobe. Return ONLY JSON:
{ "primary_outfit": {"top": string, "bottom": string, "shoes": string, "outerwear": string, "accessories": [string], "wardrobe_item_ids": [any]}, "alternative_outfits": [{"summary": string, "wardrobe_item_ids": [any]}], "shopping_gaps": [string], "weather_layers": [string], "etiquette_notes": [string] }`;
      const userMessage = `Event: ${event_name}\nDress code: ${dress_code || 'unspecified'}\nWeather: ${weather || 'unknown'}\nLocation: ${location || ''}\nTime of day: ${time_of_day || ''}\nWardrobe: ${JSON.stringify(wardrobe.rows).slice(0, 5000)}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);
      await saveAiResult(req.userId, 'occasion-outfit-suggest', aiResponse, { event_name, dress_code });
      res.json({ outfit: parsed || aiResponse, raw: aiResponse });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

// Helper: turn missing-key errors into 503 responses
function handleAiError(err, res) {
  if (err && (err.code === 'NO_API_KEY' || err.status === 503)) {
    return res.status(503).json({ error: 'AI service unavailable: missing OPENROUTER_API_KEY' });
  }
  return res.status(500).json({ error: err.message });
}

// POST /api/ai-advanced/sustainability-score
// Body: { item_id?, item_overrides? } — analyze a wardrobe item for sustainability + cost-per-wear projection
router.post('/sustainability-score', authMiddleware, aiRateLimiter,
  async (req, res) => {
    try {
      const { item_id, item_overrides, expected_uses_per_year, expected_lifetime_years } = req.body || {};
      let item = item_overrides || null;
      if (!item && item_id) {
        const r = await pool.query('SELECT * FROM wardrobe_items WHERE id = $1 AND user_id = $2', [item_id, req.userId]);
        item = r.rows[0] || null;
      }
      if (!item) return res.status(400).json({ error: 'item_id (existing) or item_overrides is required' });

      const systemPrompt = `You are a fashion-sustainability analyst. Score the supplied garment for sustainability and project its cost-per-wear over its expected lifetime. Return ONLY JSON:
{ "sustainability_score": number (0-100), "score_breakdown": { "material": number, "production": number, "longevity": number, "end_of_life": number }, "concerns": [string], "praises": [string], "cost_per_wear_estimate_usd": number, "wears_to_break_even_at_5_per_wear": number, "care_tips_for_longevity": [string], "alternative_swaps": [string] }`;
      const userMessage = `Item: ${JSON.stringify(item)}\nExpected uses/year: ${expected_uses_per_year || 24}\nExpected lifetime years: ${expected_lifetime_years || 3}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);
      await saveAiResult(req.userId, 'sustainability-score', aiResponse, { item_id });
      res.json({ analysis: parsed || aiResponse, raw: aiResponse });
    } catch (err) { return handleAiError(err, res); }
  }
);

// POST /api/ai-advanced/capsule-wardrobe
// Body: { season, lifestyle, max_pieces?, color_palette? }
router.post('/capsule-wardrobe', authMiddleware, aiRateLimiter,
  body('season').notEmpty().withMessage('season is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { season, lifestyle, max_pieces, color_palette } = req.body || {};
      const wardrobe = await pool.query('SELECT id, name, category, color, brand, season, style FROM wardrobe_items WHERE user_id = $1', [req.userId]);
      const style = await pool.query('SELECT attribute, value FROM style_profiles WHERE user_id = $1 LIMIT 30', [req.userId]);
      const systemPrompt = `You are an expert wardrobe curator. Build a capsule wardrobe (cohesive set of mix-and-match pieces) tailored to the user's season and lifestyle. Return ONLY JSON:
{ "capsule_name": string, "core_pieces": [{"category": string, "description": string, "color": string, "wardrobe_item_id_if_any": any}], "missing_pieces_to_buy": [{"category": string, "description": string, "estimated_price_usd": number, "priority": "high|medium|low"}], "outfits_count_estimate": number, "color_palette": [string], "styling_principles": [string] }`;
      const userMessage = `Season: ${season}\nLifestyle: ${lifestyle || 'general'}\nMax pieces: ${max_pieces || 30}\nDesired palette: ${color_palette || 'neutral'}\nWardrobe: ${JSON.stringify(wardrobe.rows).slice(0, 4500)}\nStyle profile: ${JSON.stringify(style.rows).slice(0, 1500)}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);
      await saveAiResult(req.userId, 'capsule-wardrobe', aiResponse, { season, lifestyle, max_pieces });
      res.json({ capsule: parsed || aiResponse, raw: aiResponse });
    } catch (err) { return handleAiError(err, res); }
  }
);

// POST /api/ai-advanced/packing-list
// Body: { destination, days, weather_summary, activities[], dress_codes[] }
router.post('/packing-list', authMiddleware, aiRateLimiter,
  body('destination').notEmpty().withMessage('destination is required'),
  body('days').isInt({ min: 1, max: 60 }).withMessage('days 1-60 required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { destination, days, weather_summary, activities, dress_codes } = req.body || {};
      const wardrobe = await pool.query('SELECT id, name, category, color, brand, season FROM wardrobe_items WHERE user_id = $1', [req.userId]);
      const systemPrompt = `You are a travel-styling expert. Build a minimal but versatile packing list using the user's existing wardrobe where possible. Return ONLY JSON:
{ "trip_summary": string, "carry_on_only_feasible": boolean, "items_from_wardrobe": [{"wardrobe_item_id": any, "name": string, "purpose": string}], "items_to_buy_or_borrow": [{"category": string, "description": string}], "outfit_combinations": [{"day": number, "context": string, "outfit": string}], "packing_tips": [string], "do_not_forget": [string] }`;
      const userMessage = `Destination: ${destination}\nDays: ${days}\nWeather: ${weather_summary || 'unspecified'}\nActivities: ${JSON.stringify(activities || [])}\nDress codes: ${JSON.stringify(dress_codes || [])}\nWardrobe: ${JSON.stringify(wardrobe.rows).slice(0, 5000)}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);
      await saveAiResult(req.userId, 'packing-list', aiResponse, { destination, days });
      res.json({ packing_list: parsed || aiResponse, raw: aiResponse });
    } catch (err) { return handleAiError(err, res); }
  }
);

// ============================================================
// APPLY PASS 5 — backlog endpoints
// ============================================================

// Ensure additive (TOO-RISKY mitigated) tables exist
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS body_measurements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        height_cm NUMERIC,
        weight_kg NUMERIC,
        chest_cm NUMERIC,
        waist_cm NUMERIC,
        hip_cm NUMERIC,
        inseam_cm NUMERIC,
        body_type VARCHAR(50),
        size_top VARCHAR(20),
        size_bottom VARCHAR(20),
        size_shoe VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS style_collab_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255),
        body TEXT,
        outfit_id INTEGER,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
  } catch (e) { console.error('Body/social table init:', e.message); }
})();

// POST /api/ai-advanced/body-type-analyze (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: We let users self-report measurements (no vision pipeline);
// AI infers body type (rectangle/pear/apple/hourglass/inverted-triangle) and
// returns flattering style guidance. We persist measurements server-side so
// downstream features (capsule wardrobe, packing list) can read them.
router.post('/body-type-analyze', authMiddleware, aiRateLimiter,
  body('height_cm').isFloat({ min: 100, max: 250 }).withMessage('height_cm 100-250 required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { height_cm, weight_kg, chest_cm, waist_cm, hip_cm, inseam_cm, size_top, size_bottom, size_shoe, save = true } = req.body || {};

      const systemPrompt = `You are a fashion stylist with body-type expertise. Classify the person's body type based on measurements and propose flattering silhouettes/colors. Return ONLY JSON:
{ "body_type": "rectangle|pear|apple|hourglass|inverted_triangle|athletic", "confidence": number (0-1), "key_proportions": [string], "flattering_silhouettes": [string], "colors_to_emphasize": [string], "fit_tips": [string], "items_to_avoid": [string] }`;
      const userMessage = `Measurements (cm): height=${height_cm}, weight=${weight_kg || '?'}kg, chest=${chest_cm || '?'}, waist=${waist_cm || '?'}, hip=${hip_cm || '?'}, inseam=${inseam_cm || '?'}\nSizes: top=${size_top || '?'}, bottom=${size_bottom || '?'}, shoe=${size_shoe || '?'}`;
      const aiResponse = await callOpenRouter(systemPrompt, userMessage);
      const parsed = parseAIJson(aiResponse);

      if (save) {
        try {
          await pool.query(
            `INSERT INTO body_measurements (user_id, height_cm, weight_kg, chest_cm, waist_cm, hip_cm, inseam_cm, body_type, size_top, size_bottom, size_shoe)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [req.userId, height_cm, weight_kg, chest_cm, waist_cm, hip_cm, inseam_cm, parsed?.body_type || null, size_top, size_bottom, size_shoe]
          );
        } catch (_) {}
      }
      await saveAiResult(req.userId, 'body-type-analyze', aiResponse, { height_cm, weight_kg });
      res.json({ analysis: parsed || aiResponse, raw: aiResponse });
    } catch (err) { return handleAiError(err, res); }
  }
);

// GET /api/ai-advanced/body-measurements
router.get('/body-measurements', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM body_measurements WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10`,
      [req.userId]
    );
    res.json({ measurements: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai-advanced/photo-outfit-analyze (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: Vision-based selfie analysis requires multimodal model + image hosting.
// We accept a public image URL or base64 data URL and forward to OpenRouter
// using a vision-capable model name (overridable via OPENROUTER_VISION_MODEL).
// Default model: anthropic/claude-3-5-sonnet-20241022 (handles vision in OpenRouter).
router.post('/photo-outfit-analyze', authMiddleware, aiRateLimiter,
  body('image_url').notEmpty().withMessage('image_url is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: missing OPENROUTER_API_KEY' });
    }
    try {
      const { image_url, occasion } = req.body || {};
      const visionModel = process.env.OPENROUTER_VISION_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'AI Personal Stylist',
        },
        body: JSON.stringify({
          model: visionModel,
          messages: [
            { role: 'system', content: 'You are a fashion stylist analyzing outfit photos. Return ONLY JSON: { "items_detected":[{"category":string,"color":string,"description":string}], "style_label":string, "occasion_fit":string, "score":number(0-100), "improvements":[string], "matching_pieces_to_add":[string] }' },
            { role: 'user', content: [
              { type: 'text', text: `Analyze this outfit. Occasion: ${occasion || 'casual'}.` },
              { type: 'image_url', image_url: { url: image_url } }
            ]}
          ],
          max_tokens: 2000,
          temperature: 0.4
        }),
      });
      const data = await response.json();
      if (data.error) return res.status(502).json({ error: data.error.message || 'Vision API failed' });
      const aiText = data.choices?.[0]?.message?.content || '';
      const parsed = parseAIJson(aiText);
      await saveAiResult(req.userId, 'photo-outfit-analyze', aiText, { occasion });
      res.json({ analysis: parsed || aiText, raw: aiText });
    } catch (err) { return handleAiError(err, res); }
  }
);

// POST /api/ai-advanced/ar-tryon-prepare (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: Real AR try-on requires a 3D garment-fitting service
// (Wanna, Zeekit, Vue.ai). We provide a "AR scaffold" endpoint that returns
// the JSON config the client SDK would consume, plus a placeholder asset list
// the client can render in 2D until a 3D backend is wired in.
router.post('/ar-tryon-prepare', authMiddleware, aiRateLimiter,
  body('item_id').isInt().withMessage('item_id is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { item_id } = req.body;
      const r = await pool.query('SELECT * FROM wardrobe_items WHERE id=$1 AND user_id=$2', [item_id, req.userId]);
      if (!r.rowCount) return res.status(404).json({ error: 'Wardrobe item not found' });
      const item = r.rows[0];
      const m = await pool.query('SELECT * FROM body_measurements WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1', [req.userId]);
      const measurements = m.rows[0] || null;
      // PRODUCT-DECISION: 2D fallback when no 3D backend creds are configured
      const config = {
        sdk: process.env.AR_TRYON_PROVIDER || 'placeholder',
        item: { id: item.id, name: item.name, category: item.category, color: item.color },
        measurements: measurements ? { height_cm: measurements.height_cm, body_type: measurements.body_type, size_top: measurements.size_top } : null,
        rendering_mode: process.env.AR_TRYON_PROVIDER ? '3d' : '2d_overlay',
        notes: process.env.AR_TRYON_PROVIDER
          ? 'Provider configured.'
          : 'No AR_TRYON_PROVIDER env var; client should fall back to 2D overlay using item.image_url.'
      };
      res.json({ ar_config: config });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }
);

// POST /api/ai-advanced/style-collab-post (NEEDS-PRODUCT-DECISION)
// PRODUCT-DECISION: Social features can spiral; we implement a single
// "share to feed" endpoint that creates a post visible to the user
// themselves only (private feed). A future moderation pipeline gates
// public sharing.
router.post('/style-collab-post', authMiddleware, aiRateLimiter,
  body('title').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { title, body: postBody, outfit_id } = req.body;
      const r = await pool.query(
        `INSERT INTO style_collab_posts (user_id, title, body, outfit_id) VALUES ($1,$2,$3,$4) RETURNING *`,
        [req.userId, title, postBody || null, outfit_id || null]
      );
      res.json({ post: r.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

router.get('/style-collab-feed', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM style_collab_posts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.userId]
    );
    res.json({ posts: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai-advanced/retailer-price-track (NEEDS-CREDS)
// Env: SHOPSTYLE_API_KEY (or RAINFOREST_API_KEY for Amazon)
router.post('/retailer-price-track', authMiddleware, aiRateLimiter, async (req, res) => {
  const missing = ['SHOPSTYLE_API_KEY'].filter(k => !process.env[k]);
  if (missing.length) return res.status(503).json({ error: 'Retailer integration unavailable', missing: missing.join(', ') });
  // Implementation pending: when SHOPSTYLE_API_KEY is set, this endpoint
  // would query the price feed and persist tracked prices.
  res.json({ success: false, error: 'Retailer price-tracking pending implementation; creds detected.' });
});

module.exports = router;
