const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const pool = require('./db');

const authRoutes = require('./routes/auth');
const wardrobeRoutes = require('./routes/wardrobe');
const outfitsRoutes = require('./routes/outfits');
const styleProfileRoutes = require('./routes/styleProfile');
const occasionsRoutes = require('./routes/occasions');
const colorAnalysisRoutes = require('./routes/colorAnalysis');
const trendsRoutes = require('./routes/trends');
const shoppingRoutes = require('./routes/shopping');
const outfitCalendarRoutes = require('./routes/outfitCalendar');
const styleBoardsRoutes = require('./routes/styleBoards');
const clothingCareRoutes = require('./routes/clothingCare');
const budgetRoutes = require('./routes/budget');
const seasonalRoutes = require('./routes/seasonal');
const mixMatchRoutes = require('./routes/mixMatch');
const styleQuizRoutes = require('./routes/styleQuiz');
const fashionFeedRoutes = require('./routes/fashionFeed');
const aiRoutes = require('./routes/ai');
const aiAdvancedRoutes = require('./routes/aiAdvanced');
const wardrobeUploadRoutes = require('./routes/wardrobeUpload');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/style-profile', styleProfileRoutes);
app.use('/api/occasions', occasionsRoutes);
app.use('/api/color-analysis', colorAnalysisRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/outfit-calendar', outfitCalendarRoutes);
app.use('/api/style-boards', styleBoardsRoutes);
app.use('/api/clothing-care', clothingCareRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/seasonal', seasonalRoutes);
app.use('/api/mix-match', mixMatchRoutes);
app.use('/api/style-quiz', styleQuizRoutes);
app.use('/api/fashion-feed', fashionFeedRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-advanced', aiAdvancedRoutes);
app.use('/api/wardrobe', wardrobeUploadRoutes);
app.use('/api/wardrobe-items', wardrobeUploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// === Custom Feature Mounts (batch_06) ===
app.use('/api/cf-photo-based-outfit-generation', require('./routes/customFeat01_PhotoBasedOutfitGeneration'));
app.use('/api/cf-shopping-advisor', require('./routes/customFeat02_ShoppingAdvisor'));
app.use('/api/cf-sustainability-tracking', require('./routes/customFeat03_SustainabilityTracking'));
app.use('/api/cf-occasion-specific-styling', require('./routes/customFeat04_OccasionSpecificStyling'));
app.use('/api/cf-social-style-collab', require('./routes/customFeat05_SocialStyleCollab'));


// === Batch 06 Gaps & Frontend Mounts ===
app.use('/api/gap-the-aiadvanced-js-and-ai-js-stubs-need-real-implem', require('./routes/gapFeat_the_aiadvanced_js_and_ai_js_stubs_need_real_implem'));
app.use('/api/gap-trends-without-trend', require('./routes/gapFeat_trends_without_trend'));
app.use('/api/gap-occasions-without-occasion', require('./routes/gapFeat_occasions_without_occasion'));
app.use('/api/gap-color-analysis-without-skin', require('./routes/gapFeat_color_analysis_without_skin'));
app.use('/api/gap-no-body-type-size-tracking-for-better-fit-recommen', require('./routes/gapFeat_no_body_type_size_tracking_for_better_fit_recommen'));
app.use('/api/gap-no-shopping-integration-link-to-retailer-apis-pric', require('./routes/gapFeat_no_shopping_integration_link_to_retailer_apis_pric'));
app.use('/api/gap-no-virtual-try', require('./routes/gapFeat_no_virtual_try'));
app.use('/api/gap-limited-social-features-sharing-outfits-style-insp', require('./routes/gapFeat_limited_social_features_sharing_outfits_style_insp'));
app.use('/api/gap-no-notifications-layer-grep-0', require('./routes/gapFeat_no_notifications_layer_grep_0'));
app.use('/api/gap-no-audit-logging-grep-0', require('./routes/gapFeat_no_audit_logging_grep_0'));
app.use('/api/gap-no-webhooks', require('./routes/gapFeat_no_webhooks'));
app.use('/api/gap-only-9-frontend-pages-despite-20-routes', require('./routes/gapFeat_only_9_frontend_pages_despite_20_routes'));

// === Custom Views (Stylist Views) — mount BEFORE 404 ===
app.use('/api/custom-views', require('./routes/customViews'));

// 404 fallback for unmatched API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
