const express = require('express');
const cors = require('cors');
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

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
