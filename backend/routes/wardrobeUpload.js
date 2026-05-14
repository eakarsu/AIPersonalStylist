const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const pool = require('../db');
const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/wardrobe');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `wardrobe_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
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

// POST /api/wardrobe/:id/upload-photo
router.post('/:id/upload-photo', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const itemId = req.params.id;

    // Verify item belongs to user
    const itemCheck = await pool.query('SELECT * FROM wardrobe_items WHERE id = $1 AND user_id = $2', [itemId, req.userId]);
    if (itemCheck.rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Wardrobe item not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `/uploads/wardrobe/${req.file.filename}`;

    // Update item with photo path
    await pool.query(
      'UPDATE wardrobe_items SET photo_path = $1, image_url = $2 WHERE id = $3 AND user_id = $4',
      [req.file.path, imageUrl, itemId, req.userId]
    );

    res.json({
      success: true,
      image_url: imageUrl,
      photo_path: req.file.path,
      item_id: itemId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wardrobe/:id/analyze-photo
router.post('/:id/analyze-photo', authMiddleware, async (req, res) => {
  try {
    const itemId = req.params.id;

    const itemResult = await pool.query('SELECT * FROM wardrobe_items WHERE id = $1 AND user_id = $2', [itemId, req.userId]);
    if (itemResult.rows.length === 0) return res.status(404).json({ error: 'Wardrobe item not found' });
    const item = itemResult.rows[0];

    const photoPath = item.photo_path || (item.image_url ? path.join(__dirname, '..', item.image_url) : null);
    if (!photoPath || !fs.existsSync(photoPath)) {
      return res.status(400).json({ error: 'No photo uploaded for this item. Use upload-photo first.' });
    }

    const fileBuffer = fs.readFileSync(photoPath);
    const base64Image = fileBuffer.toString('base64');
    const ext = path.extname(photoPath).toLowerCase();
    const mimeTypeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
    const mimeType = mimeTypeMap[ext] || 'image/jpeg';
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    const visionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageDataUrl } },
              {
                type: 'text',
                text: `Analyze this clothing item photo in detail. Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "color": "<primary color>",
  "color_secondary": "<secondary color if any, null otherwise>",
  "style": "<casual|formal|athletic|business|evening|smart_casual>",
  "category": "<Tops|Bottoms|Dresses|Outerwear|Shoes|Accessories|Basics|Swimwear|Sleepwear>",
  "occasions": "<comma-separated list of suitable occasions>",
  "season": "<All Season|Spring/Summer|Fall/Winter|Winter|Summer>",
  "care_instructions": "<brief washing/care guidance>",
  "pattern": "<solid|striped|plaid|floral|geometric|printed|other>",
  "material_estimate": "<estimated fabric type>",
  "condition": "<new|good|fair|worn>",
  "styling_tips": "<1-2 sentence styling suggestion>",
  "suggested_tags": ["<tag1>", "<tag2>"]
}`,
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    const visionData = await visionResponse.json();
    if (visionData.error) return res.status(500).json({ error: visionData.error.message || 'Vision AI error' });

    const visionContent = visionData.choices?.[0]?.message?.content || '';
    const extracted = parseAIJson(visionContent) || {};

    // Update wardrobe item with extracted data
    await pool.query(
      `UPDATE wardrobe_items SET
        color = COALESCE($1, color),
        style = COALESCE($2, style),
        category = COALESCE($3, category),
        occasions = COALESCE($4, occasions),
        season = COALESCE($5, season),
        care_instructions = COALESCE($6, care_instructions),
        notes = COALESCE($7, notes)
       WHERE id = $8 AND user_id = $9`,
      [
        extracted.color || null,
        extracted.style || null,
        extracted.category || null,
        extracted.occasions || null,
        extracted.season || null,
        extracted.care_instructions || null,
        extracted.suggested_tags?.length ? `Tags: ${extracted.suggested_tags.join(', ')}` : null,
        itemId,
        req.userId,
      ]
    );

    // Save to ai_results
    try {
      await pool.query(
        'INSERT INTO ai_results (user_id, endpoint, result, metadata) VALUES ($1, $2, $3, $4)',
        [req.userId, 'wardrobe-vision-analysis', visionContent, JSON.stringify({ item_id: itemId })]
      );
    } catch {}

    const updatedItem = await pool.query('SELECT * FROM wardrobe_items WHERE id = $1', [itemId]);

    res.json({
      success: true,
      analysis: extracted,
      raw: visionContent,
      item: updatedItem.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Original: POST /api/wardrobe-items/upload-photo (kept for backward compat)
router.post('/upload-photo', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Image = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
    const imageUrl = `/uploads/wardrobe/${req.file.filename}`;

    let extractedTags = { category: null, color: null, material: null, pattern: null, season: null, formality: null, condition: null, suggested_tags: [] };

    try {
      const visionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: imageDataUrl } },
                { type: 'text', text: 'Analyze this clothing item. Return ONLY valid JSON: {"category": string, "color": string, "material": string, "pattern": string, "season": string, "formality": "casual|smart_casual|business|formal", "condition": "good|fair|poor", "suggested_tags": []}' },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.2,
        }),
      });

      const visionData = await visionResponse.json();
      const visionContent = visionData.choices?.[0]?.message?.content;
      if (visionContent) {
        const parsed = parseAIJson(visionContent);
        if (parsed) extractedTags = parsed;
      }
    } catch (visionErr) {
      console.error('Vision AI error:', visionErr.message);
    }

    const itemName = req.body.name || extractedTags.category || 'Uploaded Item';
    const result = await pool.query(
      `INSERT INTO wardrobe_items (user_id, name, category, color, season, image_url, photo_path, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, itemName, extractedTags.category || null, extractedTags.color || null, extractedTags.season || null, imageUrl, req.file.path, extractedTags.suggested_tags?.length ? `Tags: ${extractedTags.suggested_tags.join(', ')}` : null]
    );

    res.status(201).json({ item: result.rows[0], extracted_tags: extractedTags, image_url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
