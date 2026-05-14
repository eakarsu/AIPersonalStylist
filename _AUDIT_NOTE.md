# Audit Apply Note — AIPersonalStylist

Source: `_AUDIT/reports/batch_06.md` section 18.

## Discrepancy with Audit
The audit reported "only 2 stub AI endpoints (`/history`, `/:feature`)". Both routes are real:
- `/api/ai/:feature` is a generic dispatcher backed by a `FEATURE_PROMPTS` map covering 15 features (wardrobe, outfits, style-profile, occasions, color-analysis, trends, shopping, outfit-calendar, style-boards, clothing-care, budget, seasonal, mix-match, style-quiz, fashion-feed).
- `routes/aiAdvanced.js` already exposes specific endpoints: `/generate-outfit`, `/seasonal-analysis`, `/users/:id/style-profile`, `/cost-per-wear`.

So `outfit-suggest`, `color-analysis`, several others recommended by the audit are partly already covered.

## Original Recommendations
### Missing AI counterparts
- `/outfit-suggest` (≈ exists via `/generate-outfit` and `/:feature/outfits`)
- `/shopping-recommend`
- `/color-analysis-run` (≈ exists via `/:feature/color-analysis`)
- `/trend-forecast`
- `/occasion-outfit-suggest`

### Missing non-AI
- Body type/size tracking; shopping integrations & price tracking; AR virtual try-on; social features

## Implemented
Added three endpoints in `backend/routes/aiAdvanced.js`:
- `POST /api/ai-advanced/shopping-recommend`
- `POST /api/ai-advanced/trend-forecast`
- `POST /api/ai-advanced/occasion-outfit-suggest`

Reused `callOpenRouter`, `parseAIJson`, `saveAiResult`, `authMiddleware`, `aiRateLimiter`, `body()/validationResult()` style.

## Backlog
| Item | Tag |
|---|---|
| Body type/size tracking | NEEDS-PRODUCT-DECISION |
| Shopping/retailer price-tracking integration | NEEDS-CREDS |
| AR virtual try-on | NEEDS-PRODUCT-DECISION |
| Social style-collab features | NEEDS-PRODUCT-DECISION |
| Photo-based outfit generation (selfie analysis) | NEEDS-PRODUCT-DECISION (vision pipeline) |
| Sustainability cost-per-wear advisor | MECHANICAL (cost-per-wear endpoint exists; needs sustainability extension) |

## Apply pass 3 (frontend)

FE already wired. `frontend/src/pages/AIRecommendationsPage.jsx` is a tabbed UI surfacing all 3 advanced endpoints from pass 2 (`/api/ai-advanced/shopping-recommend`, `/trend-forecast`, `/occasion-outfit-suggest`) with form-per-tool, Bearer token via `useAuth()`, visible error/result display. App.jsx routes it at `/ai-recommendations`. Dedicated pages exist for outfit-generator, seasonal-analysis, style-profile-wizard, cost-per-wear, wardrobe-photo. No FE changes needed in pass 3. Action: LEFT-AS-IS.

## Apply pass 4 (mechanical backlog)

| # | Endpoint | BE | FE tab |
|---|----------|----|--------|
| 1 | `POST /api/ai-advanced/sustainability-score` | `backend/routes/aiAdvanced.js` | "Sustainability Score" tab in `AIRecommendationsPage.jsx` (covers MECHANICAL backlog item "Sustainability cost-per-wear advisor") |
| 2 | `POST /api/ai-advanced/capsule-wardrobe` | `backend/routes/aiAdvanced.js` | "Capsule Wardrobe" tab |
| 3 | `POST /api/ai-advanced/packing-list` | `backend/routes/aiAdvanced.js` | "Packing List" tab |

`callOpenRouter` now throws `{code:'NO_API_KEY', status:503}` when `OPENROUTER_API_KEY` is unset. New `handleAiError` helper short-circuits to 503; FE tab `run()` surfaces 503 message inline. All endpoints reuse `authMiddleware` + `aiRateLimiter` + `parseAIJson` + `saveAiResult`. `body()/validationResult()` validation matches existing style. `node --check` OK; FE Babel parse OK.
