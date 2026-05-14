const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting database seed...');

  // Create tables
  await pool.query(`
    DROP TABLE IF EXISTS ai_history CASCADE;
    DROP TABLE IF EXISTS fashion_feed CASCADE;
    DROP TABLE IF EXISTS style_quiz CASCADE;
    DROP TABLE IF EXISTS mix_match CASCADE;
    DROP TABLE IF EXISTS seasonal_items CASCADE;
    DROP TABLE IF EXISTS budget_entries CASCADE;
    DROP TABLE IF EXISTS clothing_care CASCADE;
    DROP TABLE IF EXISTS style_boards CASCADE;
    DROP TABLE IF EXISTS outfit_calendar CASCADE;
    DROP TABLE IF EXISTS shopping_items CASCADE;
    DROP TABLE IF EXISTS trends CASCADE;
    DROP TABLE IF EXISTS color_palettes CASCADE;
    DROP TABLE IF EXISTS occasions CASCADE;
    DROP TABLE IF EXISTS style_profiles CASCADE;
    DROP TABLE IF EXISTS outfits CASCADE;
    DROP TABLE IF EXISTS wardrobe_items CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE ai_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      feature VARCHAR(100),
      result TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      endpoint VARCHAR(100),
      result TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE wardrobe_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      color VARCHAR(100),
      brand VARCHAR(100),
      size VARCHAR(50),
      season VARCHAR(50),
      image_url TEXT,
      photo_path TEXT,
      purchase_price DECIMAL(10,2) DEFAULT 0,
      times_worn INTEGER DEFAULT 0,
      style VARCHAR(100),
      occasions TEXT,
      care_instructions TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE outfits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      occasion VARCHAR(100),
      top VARCHAR(255),
      bottom VARCHAR(255),
      shoes VARCHAR(255),
      accessories TEXT,
      rating INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE style_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      attribute VARCHAR(255) NOT NULL,
      value VARCHAR(255),
      category VARCHAR(100),
      importance VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE occasions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      event_date DATE,
      dress_code VARCHAR(100),
      location VARCHAR(255),
      outfit_plan TEXT,
      budget DECIMAL(10,2),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE color_palettes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      color_name VARCHAR(100) NOT NULL,
      hex_code VARCHAR(7),
      season_type VARCHAR(50),
      category VARCHAR(100),
      complements VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE trends (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      season VARCHAR(50),
      year INTEGER,
      description TEXT,
      popularity VARCHAR(50),
      source VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE shopping_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      brand VARCHAR(100),
      price DECIMAL(10,2),
      priority VARCHAR(50),
      store VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE outfit_calendar (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      occasion VARCHAR(100),
      outfit_name VARCHAR(255),
      top VARCHAR(255),
      bottom VARCHAR(255),
      shoes VARCHAR(255),
      weather VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE style_boards (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      theme VARCHAR(100),
      description TEXT,
      mood VARCHAR(100),
      colors VARCHAR(255),
      inspiration TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE clothing_care (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      garment_type VARCHAR(100) NOT NULL,
      material VARCHAR(100),
      wash_method VARCHAR(100),
      dry_method VARCHAR(100),
      iron_temp VARCHAR(50),
      storage VARCHAR(255),
      special_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE budget_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      amount DECIMAL(10,2),
      purchase_date DATE,
      store VARCHAR(255),
      payment_method VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE seasonal_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      season VARCHAR(50),
      status VARCHAR(50),
      storage_location VARCHAR(255),
      condition VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE mix_match (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      top VARCHAR(255),
      bottom VARCHAR(255),
      shoes VARCHAR(255),
      accessories TEXT,
      style VARCHAR(100),
      occasion VARCHAR(100),
      rating INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE style_quiz (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT,
      category VARCHAR(100),
      score INTEGER,
      result_type VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE fashion_feed (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      content TEXT,
      source VARCHAR(255),
      author VARCHAR(100),
      tags VARCHAR(255),
      published_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tables created successfully');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const userResult = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
    ['demo@stylist.com', hashedPassword, 'Demo User']
  );
  const userId = userResult.rows[0].id;
  console.log('Demo user created (demo@stylist.com / demo123)');

  // Seed Wardrobe Items (15+)
  const wardrobeItems = [
    ['Classic White Oxford Shirt', 'Tops', 'White', 'Ralph Lauren', 'M', 'All Season', '', 'Perfect for layering'],
    ['Navy Blue Blazer', 'Outerwear', 'Navy', 'Hugo Boss', 'M', 'Fall/Winter', '', 'Versatile dressy piece'],
    ['Black Slim Fit Jeans', 'Bottoms', 'Black', 'Levis', '32', 'All Season', '', 'Goes with everything'],
    ['Floral Summer Dress', 'Dresses', 'Multi', 'Zara', 'S', 'Spring/Summer', '', 'Great for brunch'],
    ['Cashmere V-Neck Sweater', 'Tops', 'Burgundy', 'J.Crew', 'M', 'Fall/Winter', '', 'Super soft and warm'],
    ['Khaki Chinos', 'Bottoms', 'Khaki', 'Dockers', '32', 'All Season', '', 'Business casual staple'],
    ['Leather Chelsea Boots', 'Shoes', 'Brown', 'Cole Haan', '10', 'Fall/Winter', '', 'Dress up or down'],
    ['White Sneakers', 'Shoes', 'White', 'Common Projects', '10', 'Spring/Summer', '', 'Minimalist classic'],
    ['Silk Scarf', 'Accessories', 'Red/Gold', 'Hermes', 'One Size', 'All Season', '', 'Statement accessory'],
    ['Trench Coat', 'Outerwear', 'Beige', 'Burberry', 'M', 'Spring/Fall', '', 'Timeless outerwear'],
    ['Little Black Dress', 'Dresses', 'Black', 'Theory', 'S', 'All Season', '', 'Every wardrobe needs one'],
    ['Denim Jacket', 'Outerwear', 'Blue', 'Levis', 'M', 'Spring/Fall', '', 'Casual layering piece'],
    ['Wool Dress Pants', 'Bottoms', 'Charcoal', 'Brooks Brothers', '32', 'Fall/Winter', '', 'Professional look'],
    ['Striped Breton Top', 'Tops', 'Navy/White', 'Saint James', 'M', 'Spring/Summer', '', 'French chic'],
    ['Suede Loafers', 'Shoes', 'Tan', 'Tod\'s', '10', 'Spring/Summer', '', 'Effortlessly elegant'],
    ['Cashmere Overcoat', 'Outerwear', 'Camel', 'Max Mara', 'M', 'Winter', '', 'Investment piece']
  ];
  for (const item of wardrobeItems) {
    await pool.query(
      'INSERT INTO wardrobe_items (user_id, name, category, color, brand, size, season, image_url, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, ...item]
    );
  }
  console.log('Wardrobe items seeded');

  // Seed Outfits (15+)
  const outfits = [
    ['Business Meeting Look', 'Business', 'White Oxford Shirt', 'Wool Dress Pants', 'Leather Chelsea Boots', 'Silk Scarf', 5, 'Power outfit'],
    ['Weekend Brunch', 'Casual', 'Striped Breton Top', 'Black Slim Jeans', 'White Sneakers', 'Sunglasses', 4, 'Relaxed chic'],
    ['Date Night', 'Evening', 'Little Black Dress', '', 'Suede Loafers', 'Gold Necklace', 5, 'Classic and elegant'],
    ['Friday Casual', 'Smart Casual', 'Cashmere Sweater', 'Khaki Chinos', 'White Sneakers', 'Watch', 4, 'Comfortable yet put together'],
    ['Garden Party', 'Semi-Formal', 'Floral Summer Dress', '', 'Suede Loafers', 'Straw Hat', 4, 'Perfect for outdoors'],
    ['Winter Layered', 'Casual', 'Cashmere Sweater', 'Black Slim Jeans', 'Chelsea Boots', 'Cashmere Overcoat', 5, 'Warm and stylish'],
    ['Spring Walk', 'Casual', 'Breton Top', 'Khaki Chinos', 'White Sneakers', 'Denim Jacket', 4, 'Easy breezy'],
    ['Formal Dinner', 'Formal', 'Navy Blazer', 'Wool Dress Pants', 'Chelsea Boots', 'Pocket Square', 5, 'Sophisticated'],
    ['Art Gallery Visit', 'Smart Casual', 'Black Turtleneck', 'Black Slim Jeans', 'Suede Loafers', 'Statement Ring', 4, 'Arty chic'],
    ['Beach Resort', 'Resort', 'Linen Shirt', 'Shorts', 'Sandals', 'Straw Bag', 3, 'Vacation vibes'],
    ['Job Interview', 'Professional', 'White Oxford Shirt', 'Wool Dress Pants', 'Chelsea Boots', 'Leather Belt', 5, 'First impression'],
    ['Concert Night', 'Casual', 'Denim Jacket', 'Black Slim Jeans', 'White Sneakers', 'Bandana', 4, 'Cool and edgy'],
    ['Thanksgiving Dinner', 'Smart Casual', 'Cashmere Sweater', 'Khaki Chinos', 'Suede Loafers', 'Watch', 4, 'Festive comfort'],
    ['Morning Jog Style', 'Athletic', 'Running Top', 'Joggers', 'Running Shoes', 'Headband', 3, 'Active wear'],
    ['Rainy Day Outfit', 'Casual', 'Trench Coat', 'Black Slim Jeans', 'Chelsea Boots', 'Umbrella', 4, 'Weather ready']
  ];
  for (const o of outfits) {
    await pool.query(
      'INSERT INTO outfits (user_id, name, occasion, top, bottom, shoes, accessories, rating, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, ...o]
    );
  }
  console.log('Outfits seeded');

  // Seed Style Profile (15+)
  const styleProfiles = [
    ['Preferred Style', 'Classic with modern edge', 'General', 'High', 'Core aesthetic direction'],
    ['Favorite Colors', 'Navy, White, Black, Burgundy', 'Colors', 'High', 'Go-to color palette'],
    ['Avoid Colors', 'Neon, Orange', 'Colors', 'Medium', 'Not flattering'],
    ['Body Type', 'Athletic', 'Physical', 'High', 'Guides fit selection'],
    ['Lifestyle', 'Urban professional', 'General', 'High', 'Influences daily style needs'],
    ['Budget Range', '$100-500 per piece', 'Budget', 'Medium', 'Investment pieces preferred'],
    ['Fabric Preference', 'Natural fibers', 'Materials', 'High', 'Cotton, wool, silk, cashmere'],
    ['Pattern Preference', 'Minimal patterns', 'Patterns', 'Medium', 'Stripes and solids mainly'],
    ['Shoe Style', 'Minimalist leather', 'Footwear', 'High', 'Quality over quantity'],
    ['Accessory Style', 'Understated elegance', 'Accessories', 'Medium', 'Less is more approach'],
    ['Work Dress Code', 'Business casual', 'Work', 'High', 'Smart but not stuffy'],
    ['Weekend Style', 'Relaxed sophistication', 'Casual', 'Medium', 'Elevated basics'],
    ['Climate', 'Four seasons', 'Environment', 'High', 'Need versatile wardrobe'],
    ['Fashion Icons', 'Audrey Hepburn, David Beckham', 'Inspiration', 'Low', 'Timeless style references'],
    ['Shopping Preference', 'Quality over quantity', 'Habits', 'High', 'Capsule wardrobe mindset']
  ];
  for (const sp of styleProfiles) {
    await pool.query(
      'INSERT INTO style_profiles (user_id, attribute, value, category, importance, notes) VALUES ($1,$2,$3,$4,$5,$6)',
      [userId, ...sp]
    );
  }
  console.log('Style profiles seeded');

  // Seed Occasions (15+)
  const occasionsData = [
    ['Annual Company Gala', '2026-04-15', 'Black Tie', 'Grand Hotel', 'Navy tuxedo with bow tie', 500.00, 'Need to rent or buy tux'],
    ['Best Friend Wedding', '2026-05-20', 'Formal', 'Country Club', 'Charcoal suit with pastel tie', 350.00, 'Already have the suit'],
    ['Job Interview at Tech Co', '2026-03-25', 'Business Professional', 'Downtown Office', 'Navy blazer with dress pants', 0.00, 'Use existing wardrobe'],
    ['Beach Vacation', '2026-06-10', 'Resort Casual', 'Hawaii', 'Linen shirts and shorts', 200.00, 'Need new swim trunks'],
    ['Holiday Office Party', '2026-12-20', 'Festive Cocktail', 'Office Rooftop', 'Velvet blazer option', 150.00, 'Fun and festive'],
    ['First Date', '2026-03-28', 'Smart Casual', 'Italian Restaurant', 'Cashmere sweater with chinos', 0.00, 'Confident and approachable'],
    ['Graduation Ceremony', '2026-06-01', 'Semi-Formal', 'University Hall', 'Classic suit', 0.00, 'Under the gown'],
    ['Art Exhibition Opening', '2026-04-05', 'Creative Chic', 'Modern Art Museum', 'All black with statement piece', 75.00, 'Artsy vibe'],
    ['Family Reunion BBQ', '2026-07-04', 'Casual', 'Park', 'Polo and chinos', 0.00, 'Comfortable for outdoors'],
    ['Business Conference', '2026-04-22', 'Business Casual', 'Convention Center', 'Blazer with dark jeans', 0.00, 'Day-long comfort needed'],
    ['New Years Eve Party', '2026-12-31', 'Cocktail', 'Rooftop Bar', 'Sequin detail outfit', 200.00, 'Sparkle and shine'],
    ['Charity Run', '2026-05-15', 'Athletic', 'City Park', 'Running gear', 50.00, 'Need new running shoes'],
    ['Wine Tasting', '2026-04-18', 'Smart Casual', 'Napa Valley', 'Earth tone outfit', 0.00, 'Comfortable shoes for walking'],
    ['Theater Night', '2026-03-30', 'Semi-Formal', 'Broadway Theater', 'Dark suit no tie', 0.00, 'Dressy but not stiff'],
    ['Weekend Hiking', '2026-04-12', 'Outdoor', 'Mountain Trail', 'Performance wear', 100.00, 'Need hiking boots']
  ];
  for (const o of occasionsData) {
    await pool.query(
      'INSERT INTO occasions (user_id, name, event_date, dress_code, location, outfit_plan, budget, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...o]
    );
  }
  console.log('Occasions seeded');

  // Seed Color Palettes (15+)
  const colorPalettes = [
    ['Navy Blue', '#000080', 'Winter', 'Core', 'White, Cream, Burgundy', 'Foundation color'],
    ['Crisp White', '#FFFFFF', 'All Season', 'Core', 'Everything', 'Universal neutral'],
    ['Charcoal Gray', '#36454F', 'All Season', 'Core', 'White, Navy, Burgundy', 'Professional base'],
    ['Burgundy', '#800020', 'Autumn', 'Accent', 'Navy, Cream, Gray', 'Rich and sophisticated'],
    ['Camel', '#C19A6B', 'Autumn', 'Neutral', 'Navy, White, Brown', 'Warm neutral'],
    ['Forest Green', '#228B22', 'Winter', 'Accent', 'Cream, Brown, Navy', 'Nature inspired'],
    ['Blush Pink', '#FFB6C1', 'Spring', 'Accent', 'Navy, Gray, White', 'Soft and feminine'],
    ['Black', '#000000', 'All Season', 'Core', 'Everything', 'Timeless essential'],
    ['Olive', '#808000', 'Autumn', 'Neutral', 'White, Cream, Brown', 'Earth tone staple'],
    ['Powder Blue', '#B0E0E6', 'Spring', 'Accent', 'White, Navy, Gray', 'Fresh spring color'],
    ['Terracotta', '#E2725B', 'Autumn', 'Accent', 'Cream, Olive, Brown', 'Warm earth tone'],
    ['Ivory', '#FFFFF0', 'Spring', 'Neutral', 'Navy, Blush, Camel', 'Softer than white'],
    ['Slate Blue', '#6A5ACD', 'Winter', 'Accent', 'Gray, White, Black', 'Cool and calming'],
    ['Cognac Brown', '#834A2E', 'Autumn', 'Neutral', 'Navy, Cream, Olive', 'Leather goods color'],
    ['Dusty Rose', '#DCAE96', 'Spring', 'Accent', 'Gray, Navy, Cream', 'Muted romantic']
  ];
  for (const cp of colorPalettes) {
    await pool.query(
      'INSERT INTO color_palettes (user_id, color_name, hex_code, season_type, category, complements, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [userId, ...cp]
    );
  }
  console.log('Color palettes seeded');

  // Seed Trends (15+)
  const trendsData = [
    ['Quiet Luxury', 'Style Movement', 'All Season', 2026, 'Understated elegance with quality materials', 'High', 'Vogue'],
    ['Wide Leg Trousers', 'Bottoms', 'Spring/Summer', 2026, 'Relaxed fit replacing skinny styles', 'High', 'Elle'],
    ['Butter Yellow', 'Color', 'Spring', 2026, 'Soft warm yellow across all categories', 'Medium', 'Pantone'],
    ['Oversized Blazers', 'Outerwear', 'Fall', 2026, 'Borrowed-from-the-boys oversized fits', 'High', 'GQ'],
    ['Crochet & Knit', 'Texture', 'Summer', 2026, 'Handmade aesthetic in modern silhouettes', 'Medium', 'Harper\'s Bazaar'],
    ['Cherry Red', 'Color', 'Fall/Winter', 2026, 'Bold red as a statement neutral', 'High', 'Pantone'],
    ['Sheer Fabrics', 'Material', 'Spring/Summer', 2026, 'Transparent layers and peek-a-boo details', 'Medium', 'Vogue'],
    ['Minimalist Jewelry', 'Accessories', 'All Season', 2026, 'Delicate chains and simple studs', 'High', 'Town & Country'],
    ['Sustainable Fashion', 'Movement', 'All Season', 2026, 'Eco-conscious brands and upcycling', 'High', 'WWD'],
    ['Platform Shoes', 'Footwear', 'Spring/Summer', 2026, 'Chunky soles making a comeback', 'Medium', 'Footwear News'],
    ['Leather Everything', 'Material', 'Fall/Winter', 2026, 'Head to toe leather looks', 'Medium', 'Elle'],
    ['Dopamine Dressing', 'Style Movement', 'Spring', 2026, 'Bright colors that boost mood', 'Medium', 'Psychology Today'],
    ['Barrel Leg Jeans', 'Denim', 'All Season', 2026, 'Curved, voluminous denim silhouette', 'High', 'Denim Daily'],
    ['Sculptural Bags', 'Accessories', 'Fall', 2026, 'Architectural and artistic handbags', 'Medium', 'Bag Snob'],
    ['Coastal Grandmother', 'Style Movement', 'Summer', 2026, 'Nancy Meyers-inspired seaside elegance', 'Medium', 'TikTok']
  ];
  for (const t of trendsData) {
    await pool.query(
      'INSERT INTO trends (user_id, name, category, season, year, description, popularity, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...t]
    );
  }
  console.log('Trends seeded');

  // Seed Shopping Items (15+)
  const shoppingItems = [
    ['Cashmere Turtleneck', 'Tops', 'Everlane', 120.00, 'High', 'Everlane.com', 'pending', 'Need in black and cream'],
    ['Tailored Wool Trousers', 'Bottoms', 'Reiss', 225.00, 'High', 'Reiss', 'pending', 'For office wear'],
    ['Leather Belt', 'Accessories', 'Anderson\'s', 85.00, 'Medium', 'Mr Porter', 'purchased', 'Brown braided'],
    ['Running Shoes', 'Shoes', 'Nike', 150.00, 'High', 'Nike.com', 'pending', 'For morning runs'],
    ['Silk Pajamas', 'Sleepwear', 'Olivia von Halle', 350.00, 'Low', 'Net-a-Porter', 'wishlist', 'Luxury treat'],
    ['Weekender Bag', 'Bags', 'Away', 195.00, 'Medium', 'Away Travel', 'pending', 'For short trips'],
    ['Sunglasses', 'Accessories', 'Ray-Ban', 175.00, 'Medium', 'Sunglass Hut', 'purchased', 'Wayfare classic'],
    ['Linen Shirt', 'Tops', 'Uniqlo', 40.00, 'High', 'Uniqlo', 'purchased', 'Summer essential'],
    ['Swim Trunks', 'Swimwear', 'Orlebar Brown', 175.00, 'Medium', 'Orlebar Brown', 'pending', 'Hawaii trip'],
    ['Wool Scarf', 'Accessories', 'Acne Studios', 200.00, 'Low', 'Acne Studios', 'wishlist', 'Winter luxury'],
    ['Dress Watch', 'Accessories', 'Tissot', 375.00, 'Medium', 'Watch Shop', 'wishlist', 'For formal occasions'],
    ['White T-Shirt Pack', 'Basics', 'Uniqlo', 30.00, 'High', 'Uniqlo', 'purchased', 'Stock up basics'],
    ['Rain Jacket', 'Outerwear', 'Rains', 110.00, 'Medium', 'Nordstrom', 'pending', 'Waterproof minimal'],
    ['Ankle Boots', 'Shoes', 'Blundstone', 200.00, 'High', 'REI', 'pending', 'Versatile boots'],
    ['Pocket Square Set', 'Accessories', 'Tie Bar', 45.00, 'Low', 'Tie Bar', 'wishlist', 'For blazer looks']
  ];
  for (const s of shoppingItems) {
    await pool.query(
      'INSERT INTO shopping_items (user_id, item_name, category, brand, price, priority, store, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, ...s]
    );
  }
  console.log('Shopping items seeded');

  // Seed Outfit Calendar (15+)
  const calendarData = [
    ['2026-03-16', 'Work', 'Business Meeting', 'White Oxford', 'Wool Dress Pants', 'Chelsea Boots', 'Sunny', 'Client presentation'],
    ['2026-03-17', 'Casual', 'Weekend Brunch', 'Breton Top', 'Black Jeans', 'White Sneakers', 'Partly Cloudy', 'Brunch with friends'],
    ['2026-03-18', 'Work', 'Office Day', 'Cashmere Sweater', 'Khaki Chinos', 'Suede Loafers', 'Rainy', 'Bring umbrella'],
    ['2026-03-19', 'Date', 'Dinner Date', 'Navy Blazer', 'Black Jeans', 'Chelsea Boots', 'Clear', 'Italian restaurant'],
    ['2026-03-20', 'Work', 'Casual Friday', 'Denim Jacket', 'Chinos', 'White Sneakers', 'Sunny', 'Team lunch'],
    ['2026-03-21', 'Exercise', 'Morning Run', 'Running Top', 'Joggers', 'Running Shoes', 'Cool', 'Park run'],
    ['2026-03-22', 'Social', 'Gallery Opening', 'All Black', 'Black Jeans', 'Suede Loafers', 'Clear', 'Art district'],
    ['2026-03-23', 'Work', 'Team Meeting', 'Oxford Shirt', 'Chinos', 'Loafers', 'Sunny', 'Quarterly review'],
    ['2026-03-24', 'Casual', 'Shopping Day', 'T-Shirt', 'Jeans', 'Sneakers', 'Warm', 'New season items'],
    ['2026-03-25', 'Work', 'Conference', 'Blazer', 'Dress Pants', 'Chelsea Boots', 'Cloudy', 'Full day event'],
    ['2026-03-26', 'Social', 'Happy Hour', 'Cashmere Sweater', 'Dark Jeans', 'Loafers', 'Cool', 'After work drinks'],
    ['2026-03-27', 'Travel', 'Weekend Trip', 'Layers', 'Comfortable Pants', 'Walking Shoes', 'Variable', 'Pack light'],
    ['2026-03-28', 'Formal', 'Gala Prep', 'Suit', 'Dress Pants', 'Dress Shoes', 'Clear', 'Formal event'],
    ['2026-03-29', 'Casual', 'Farmers Market', 'Linen Shirt', 'Shorts', 'Sandals', 'Sunny', 'Morning outing'],
    ['2026-03-30', 'Social', 'Theater Night', 'Dark Suit', 'Dress Pants', 'Chelsea Boots', 'Cool', 'Evening show']
  ];
  for (const c of calendarData) {
    await pool.query(
      'INSERT INTO outfit_calendar (user_id, date, occasion, outfit_name, top, bottom, shoes, weather, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, ...c]
    );
  }
  console.log('Outfit calendar seeded');

  // Seed Style Boards (15+)
  const styleBoardsData = [
    ['Parisian Chic', 'European Style', 'Effortless French elegance', 'Sophisticated', 'Navy, Cream, Red', 'Breton stripes and berets', 'Classic French wardrobe'],
    ['Minimalist Capsule', 'Minimalism', 'Pared-down essentials only', 'Clean', 'Black, White, Gray', 'Japanese minimalism', '33 items max'],
    ['Bohemian Summer', 'Boho', 'Free-spirited warm weather looks', 'Relaxed', 'Earth tones, Turquoise', 'Festival and beach vibes', 'Flowing fabrics'],
    ['Power Dressing', 'Professional', 'Commanding business looks', 'Authoritative', 'Black, Navy, Red', 'Corporate runway looks', 'Structured silhouettes'],
    ['Coastal Living', 'Coastal', 'Seaside-inspired casual', 'Breezy', 'Blue, White, Sand', 'Mediterranean lifestyle', 'Natural fabrics'],
    ['Streetwear Edge', 'Urban', 'City-inspired casual cool', 'Edgy', 'Black, Gray, Neon', 'Sneaker culture', 'Mix high and low'],
    ['Vintage Revival', 'Retro', 'Classic decades reimagined', 'Nostalgic', 'Pastels, Plaid', '60s and 70s inspiration', 'Thrift store finds'],
    ['Scandinavian Simple', 'Nordic', 'Clean Scandinavian design', 'Minimal', 'Muted Tones', 'Hygge lifestyle', 'Functional beauty'],
    ['Date Night Looks', 'Romance', 'Impressive evening outfits', 'Alluring', 'Black, Deep Red', 'Candlelit dinner vibes', 'Confidence boosting'],
    ['Travel Wardrobe', 'Travel', 'Versatile packing capsule', 'Practical', 'Neutrals', 'One bag travel', 'Wrinkle-free fabrics'],
    ['Autumn Layers', 'Seasonal', 'Fall layering combinations', 'Cozy', 'Rust, Olive, Cream', 'Leaf peeping season', 'Texture mixing'],
    ['Black Tie Ready', 'Formal', 'Gala and formal event looks', 'Glamorous', 'Black, Gold, Silver', 'Red carpet inspiration', 'Statement pieces'],
    ['Weekend Warrior', 'Casual', 'Effortless weekend style', 'Easygoing', 'Denim, White, Olive', 'Farmers market to dinner', 'Comfortable luxe'],
    ['Workout Chic', 'Athletic', 'Stylish fitness wear', 'Energetic', 'Black, Neon', 'Gym to street', 'Performance meets fashion'],
    ['Garden Party', 'Event', 'Outdoor celebration looks', 'Elegant', 'Florals, Pastels', 'English garden vibes', 'Hats and fascinators']
  ];
  for (const sb of styleBoardsData) {
    await pool.query(
      'INSERT INTO style_boards (user_id, name, theme, description, mood, colors, inspiration, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...sb]
    );
  }
  console.log('Style boards seeded');

  // Seed Clothing Care (15+)
  const clothingCareData = [
    ['Cashmere Sweater', 'Cashmere', 'Hand wash cold', 'Lay flat to dry', 'Do not iron', 'Folded with cedar balls', 'Use cashmere comb for pilling'],
    ['Silk Blouse', 'Silk', 'Dry clean or hand wash', 'Hang dry in shade', 'Low heat with cloth', 'Padded hanger', 'Avoid perfume contact'],
    ['Leather Jacket', 'Leather', 'Professional clean only', 'Air dry naturally', 'Never iron', 'Padded hanger, cool place', 'Condition every 6 months'],
    ['Wool Suit', 'Wool', 'Dry clean sparingly', 'Air out between wears', 'Steam preferred', 'Suit bag on wide hanger', 'Brush after each wear'],
    ['Denim Jeans', 'Cotton Denim', 'Wash inside out, cold', 'Hang dry', 'Not needed', 'Folded or hung', 'Wash every 5-6 wears'],
    ['Linen Shirt', 'Linen', 'Machine wash gentle', 'Line dry', 'While slightly damp', 'Rolled to prevent creases', 'Wrinkles add character'],
    ['Down Jacket', 'Down/Nylon', 'Machine wash gentle', 'Tumble dry low with tennis balls', 'Never iron', 'Hung, not compressed', 'Use down-specific detergent'],
    ['Cotton T-Shirt', 'Cotton', 'Machine wash cold', 'Tumble dry low', 'Medium heat if needed', 'Folded in drawer', 'Avoid bleach on colors'],
    ['Suede Shoes', 'Suede', 'Never machine wash', 'Air dry naturally', 'Never iron', 'Shoe trees, dust bag', 'Use suede protector spray'],
    ['Velvet Blazer', 'Velvet', 'Dry clean only', 'Hang to air', 'Steam from back side', 'Padded hanger in garment bag', 'Brush with velvet brush'],
    ['Merino Wool Sweater', 'Merino Wool', 'Machine wash wool cycle', 'Lay flat to dry', 'Low steam', 'Folded with lavender', 'Superwash merino is easier'],
    ['Polyester Athletic Wear', 'Polyester', 'Cold wash with sport detergent', 'Hang dry', 'Low heat if needed', 'Drawer', 'Avoid fabric softener'],
    ['Trench Coat', 'Cotton Gabardine', 'Dry clean seasonally', 'Hang to air dry', 'Medium heat', 'Wide hanger', 'Reproof water resistance yearly'],
    ['Knit Dress', 'Viscose Blend', 'Hand wash or gentle cycle', 'Lay flat to dry', 'Low heat inside out', 'Folded', 'Reshape while damp'],
    ['Patent Leather Shoes', 'Patent Leather', 'Wipe with damp cloth', 'Air dry', 'Never iron', 'Dust bags separate', 'Use petroleum jelly for shine']
  ];
  for (const cc of clothingCareData) {
    await pool.query(
      'INSERT INTO clothing_care (user_id, garment_type, material, wash_method, dry_method, iron_temp, storage, special_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...cc]
    );
  }
  console.log('Clothing care seeded');

  // Seed Budget Entries (15+)
  const budgetData = [
    ['Navy Blazer', 'Outerwear', 450.00, '2026-01-15', 'Nordstrom', 'Credit Card', 'Investment piece on sale'],
    ['White Sneakers', 'Shoes', 375.00, '2026-01-20', 'Common Projects', 'Debit Card', 'Classic minimalist'],
    ['Cashmere Sweater', 'Tops', 185.00, '2026-02-01', 'J.Crew', 'Credit Card', 'Winter staple'],
    ['Silk Scarf', 'Accessories', 280.00, '2026-02-14', 'Hermes', 'Credit Card', 'Valentine gift to self'],
    ['Black Jeans', 'Bottoms', 98.00, '2026-02-20', 'Levis', 'Cash', 'Basic essential'],
    ['Chelsea Boots', 'Shoes', 320.00, '2026-01-10', 'Cole Haan', 'Credit Card', 'Versatile footwear'],
    ['Linen Shirt', 'Tops', 40.00, '2026-03-01', 'Uniqlo', 'Debit Card', 'Budget-friendly quality'],
    ['Wool Scarf', 'Accessories', 65.00, '2026-01-25', 'COS', 'Cash', 'Winter accessory'],
    ['Dress Pants', 'Bottoms', 165.00, '2026-02-10', 'Brooks Brothers', 'Credit Card', 'Work wardrobe'],
    ['Sunglasses', 'Accessories', 175.00, '2026-03-05', 'Ray-Ban', 'Credit Card', 'Spring essential'],
    ['Running Shoes', 'Shoes', 130.00, '2026-02-28', 'Nike', 'Debit Card', 'Fitness investment'],
    ['Trench Coat', 'Outerwear', 520.00, '2026-03-10', 'Burberry Outlet', 'Credit Card', 'Classic outerwear'],
    ['Cotton T-Shirts', 'Basics', 45.00, '2026-01-05', 'Uniqlo', 'Cash', 'Pack of 3'],
    ['Leather Belt', 'Accessories', 85.00, '2026-02-15', 'Mr Porter', 'Credit Card', 'Brown braided'],
    ['Pocket Squares', 'Accessories', 45.00, '2026-03-08', 'Tie Bar', 'Debit Card', 'Set of 5']
  ];
  for (const b of budgetData) {
    await pool.query(
      'INSERT INTO budget_entries (user_id, item_name, category, amount, purchase_date, store, payment_method, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...b]
    );
  }
  console.log('Budget entries seeded');

  // Seed Seasonal Items (15+)
  const seasonalData = [
    ['Down Puffer Jacket', 'Outerwear', 'Winter', 'In Storage', 'Hall Closet', 'Excellent', 'Clean before storing'],
    ['Wool Peacoat', 'Outerwear', 'Winter', 'Active', 'Main Closet', 'Good', 'Button needs tightening'],
    ['Linen Pants', 'Bottoms', 'Summer', 'In Storage', 'Bedroom Drawer', 'Excellent', 'Press before wearing'],
    ['Sandals', 'Shoes', 'Summer', 'In Storage', 'Shoe Rack', 'Good', 'Need new insoles'],
    ['Fleece Jacket', 'Outerwear', 'Fall', 'Active', 'Main Closet', 'Excellent', 'Great for layering'],
    ['Swimsuit', 'Swimwear', 'Summer', 'In Storage', 'Dresser', 'Good', 'May need replacement'],
    ['Heavy Wool Scarf', 'Accessories', 'Winter', 'Active', 'Coat Hook', 'Excellent', 'Hand knit gift'],
    ['Rain Boots', 'Shoes', 'Spring', 'Active', 'Entry Way', 'Good', 'Hunter brand'],
    ['Straw Hat', 'Accessories', 'Summer', 'In Storage', 'Hat Box', 'Fair', 'Slightly bent brim'],
    ['Thermal Base Layers', 'Basics', 'Winter', 'Active', 'Drawer', 'Excellent', 'Merino wool set'],
    ['Cotton Shorts', 'Bottoms', 'Summer', 'In Storage', 'Dresser', 'Good', '3 pairs assorted'],
    ['Light Cardigan', 'Tops', 'Spring', 'Active', 'Main Closet', 'Excellent', 'Perfect transition piece'],
    ['Ski Jacket', 'Outerwear', 'Winter', 'In Storage', 'Garage', 'Good', 'Reproof before season'],
    ['Floral Dress', 'Dresses', 'Spring', 'Active', 'Main Closet', 'Excellent', 'New purchase'],
    ['Corduroy Pants', 'Bottoms', 'Fall', 'Active', 'Main Closet', 'Good', 'Rust colored']
  ];
  for (const s of seasonalData) {
    await pool.query(
      'INSERT INTO seasonal_items (user_id, item_name, category, season, status, storage_location, condition, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...s]
    );
  }
  console.log('Seasonal items seeded');

  // Seed Mix & Match (15+)
  const mixMatchData = [
    ['Classic Business', 'White Oxford', 'Wool Dress Pants', 'Chelsea Boots', 'Leather Belt, Watch', 'Professional', 'Business Meeting', 5],
    ['Smart Casual Friday', 'Cashmere Sweater', 'Khaki Chinos', 'Suede Loafers', 'Watch', 'Smart Casual', 'Office', 4],
    ['Weekend Warrior', 'Breton Top', 'Black Jeans', 'White Sneakers', 'Sunglasses', 'Casual', 'Brunch', 4],
    ['Date Night Classic', 'Navy Blazer', 'Dark Jeans', 'Chelsea Boots', 'Pocket Square', 'Smart', 'Dinner', 5],
    ['Summer Breeze', 'Linen Shirt', 'Chino Shorts', 'Sandals', 'Straw Hat', 'Casual', 'Beach', 3],
    ['Fall Layers', 'Turtleneck', 'Corduroy Pants', 'Chelsea Boots', 'Trench Coat', 'Layered', 'Autumn Walk', 5],
    ['All Black Everything', 'Black Turtleneck', 'Black Jeans', 'Black Chelsea Boots', 'Silver Watch', 'Monochrome', 'Gallery', 4],
    ['Preppy Classic', 'Oxford Shirt', 'Khaki Chinos', 'Loafers', 'Braided Belt', 'Preppy', 'Country Club', 4],
    ['Relaxed Sunday', 'Cashmere Hoodie', 'Joggers', 'White Sneakers', 'Baseball Cap', 'Athleisure', 'Coffee Run', 3],
    ['Spring Fresh', 'Chambray Shirt', 'White Jeans', 'Canvas Sneakers', 'Denim Jacket', 'Casual', 'Farmers Market', 4],
    ['Evening Elegance', 'Silk Blouse', 'Tailored Trousers', 'Heels', 'Statement Earrings', 'Elegant', 'Cocktail Party', 5],
    ['Travel Ready', 'Polo Shirt', 'Stretch Chinos', 'Slip-on Sneakers', 'Crossbody Bag', 'Travel', 'Airport', 3],
    ['Rainy Day Chic', 'Trench Coat', 'Dark Jeans', 'Rain Boots', 'Umbrella', 'Weather-ready', 'Commute', 4],
    ['Gym to Street', 'Tech Tee', 'Joggers', 'Running Shoes', 'Gym Bag', 'Athletic', 'Post-workout', 3],
    ['Holiday Festive', 'Velvet Blazer', 'Black Trousers', 'Dress Shoes', 'Bow Tie', 'Festive', 'Holiday Party', 5]
  ];
  for (const mm of mixMatchData) {
    await pool.query(
      'INSERT INTO mix_match (user_id, name, top, bottom, shoes, accessories, style, occasion, rating) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, ...mm]
    );
  }
  console.log('Mix & Match seeded');

  // Seed Style Quiz (15+)
  const quizData = [
    ['What is your go-to weekend outfit?', 'Jeans and a nice sweater', 'Casual Style', 8, 'Classic Casual', 'Prefers comfort with style'],
    ['Pick your ideal vacation destination', 'Paris, France', 'Lifestyle', 9, 'European Chic', 'Drawn to sophisticated aesthetics'],
    ['What color dominates your wardrobe?', 'Navy and neutrals', 'Color Preference', 7, 'Classic Palette', 'Conservative but refined'],
    ['How do you feel about trends?', 'I adapt selectively', 'Style Approach', 8, 'Selective Trendsetter', 'Quality over trendiness'],
    ['What is your shoe collection like?', 'Mix of formal and casual', 'Footwear', 7, 'Versatile', 'Practical with style'],
    ['Describe your ideal wardrobe', 'Capsule with quality pieces', 'Philosophy', 9, 'Minimalist', 'Less is more approach'],
    ['Favorite fashion decade?', '1960s', 'Inspiration', 8, 'Retro Modern', 'Clean lines and structure'],
    ['How important are brands?', 'Quality matters more than logos', 'Values', 8, 'Quiet Luxury', 'Substance over showing off'],
    ['What is your biggest fashion splurge?', 'A well-made coat', 'Spending', 7, 'Investment Dresser', 'Believes in cost-per-wear'],
    ['Pattern preference?', 'Subtle stripes and solids', 'Patterns', 6, 'Understated', 'Clean and minimal patterns'],
    ['How long to get ready?', '20-30 minutes', 'Routine', 7, 'Efficient', 'Prepared but not fussy'],
    ['Favorite accessory?', 'A quality watch', 'Accessories', 8, 'Classic', 'Timeless over trendy'],
    ['Gym or yoga?', 'Both, regularly', 'Fitness', 7, 'Active', 'Needs athletic wardrobe too'],
    ['Comfort vs style?', 'Both equally important', 'Priority', 8, 'Balanced', 'Will not sacrifice either'],
    ['Fashion icon?', 'Steve McQueen meets modern', 'Inspiration', 9, 'Cool Classic', 'Effortless masculine elegance']
  ];
  for (const q of quizData) {
    await pool.query(
      'INSERT INTO style_quiz (user_id, question, answer, category, score, result_type, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [userId, ...q]
    );
  }
  console.log('Style quiz seeded');

  // Seed Fashion Feed (15+)
  const feedData = [
    ['10 Wardrobe Essentials Every Adult Needs', 'Essentials', 'A curated guide to building the perfect foundation wardrobe with timeless pieces that work across seasons and occasions.', 'GQ Magazine', 'Sarah Chen', 'basics, essentials, capsule', '2026-03-01'],
    ['The Rise of Quiet Luxury in 2026', 'Trends', 'How understated elegance and quality craftsmanship are replacing logo-heavy fashion in mainstream culture.', 'Vogue', 'James Miller', 'trends, luxury, quiet luxury', '2026-03-05'],
    ['Color Theory: Dressing for Your Skin Tone', 'Education', 'Understanding warm, cool, and neutral undertones to choose the most flattering colors for your complexion.', 'Elle', 'Maria Rodriguez', 'color, education, styling', '2026-02-28'],
    ['Sustainable Fashion: A Complete Guide', 'Sustainability', 'From fabric choices to brand ethics, everything you need to know about building an eco-conscious wardrobe.', 'WWD', 'Alex Park', 'sustainable, eco, ethical', '2026-03-08'],
    ['How to Build a Capsule Wardrobe', 'Lifestyle', 'Step-by-step guide to curating a minimalist wardrobe that maximizes outfit combinations with fewer pieces.', 'Minimalist Blog', 'Tom Wright', 'capsule, minimalist, guide', '2026-02-15'],
    ['Spring 2026 Runway Highlights', 'Runway', 'Key trends and standout looks from the major fashion weeks that will influence street style this season.', 'Harper Bazaar', 'Nina Patel', 'runway, spring, 2026', '2026-03-10'],
    ['The Art of Layering', 'Technique', 'Master the technique of layering clothes for both warmth and style with proportions that work.', 'Esquire', 'David Kim', 'layering, technique, winter', '2026-02-20'],
    ['Investment Pieces Worth the Splurge', 'Shopping', 'Which wardrobe items are worth spending more on, and how to calculate true cost-per-wear value.', 'Forbes Style', 'Rachel Green', 'investment, shopping, value', '2026-03-03'],
    ['Mastering Business Casual', 'Professional', 'Navigate the ambiguous dress code with confidence using these foolproof combinations and rules.', 'LinkedIn Style', 'Mark Johnson', 'business, casual, work', '2026-02-25'],
    ['Accessorizing Like a Pro', 'Accessories', 'The dos and donts of accessorizing, from watches to scarves, and how to elevate any outfit.', 'Town & Country', 'Lisa Chang', 'accessories, styling, tips', '2026-03-07'],
    ['Denim Guide: Finding Your Perfect Fit', 'Denim', 'Navigate the world of denim cuts, washes, and brands to find jeans that fit your body and style.', 'Denim Daily', 'Chris Evans', 'denim, jeans, fit', '2026-02-18'],
    ['Fashion Tech: AI Styling Revolution', 'Technology', 'How artificial intelligence is transforming personal styling and making fashion advice accessible to everyone.', 'Wired', 'Sam Taylor', 'AI, technology, future', '2026-03-12'],
    ['Seasonal Wardrobe Transitions', 'Seasonal', 'How to smoothly transition your wardrobe between seasons without buying an entirely new set of clothes.', 'Real Simple', 'Amy Wilson', 'seasonal, transition, tips', '2026-03-02'],
    ['The Psychology of Color in Fashion', 'Psychology', 'What your color choices say about you and how to use color strategically in your outfits.', 'Psychology Today', 'Dr. Kate Lee', 'color, psychology, style', '2026-02-22'],
    ['Tailoring Basics: What to Alter', 'Technique', 'Which garments benefit most from tailoring and how small alterations can transform off-the-rack into custom-fit.', 'GQ', 'Marco Rossi', 'tailoring, fit, guide', '2026-03-06']
  ];
  for (const f of feedData) {
    await pool.query(
      'INSERT INTO fashion_feed (user_id, title, category, content, source, author, tags, published_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, ...f]
    );
  }
  console.log('Fashion feed seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('📧 Login: demo@stylist.com');
  console.log('🔑 Password: demo123');

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
