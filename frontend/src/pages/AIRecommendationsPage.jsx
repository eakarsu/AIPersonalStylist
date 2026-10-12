import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FullFieldPresets from '../components/FullFieldPresets';
import AIReport from '../components/AIReport';

const TOOLS = [
  { id: 'shopping', label: 'Shopping Recommend', icon: 'shopping_bag', endpoint: '/api/ai-advanced/shopping-recommend' },
  { id: 'trend', label: 'Trend Forecast', icon: 'trending_up', endpoint: '/api/ai-advanced/trend-forecast' },
  { id: 'occasion', label: 'Occasion Outfit Suggest', icon: 'celebration', endpoint: '/api/ai-advanced/occasion-outfit-suggest' },
  { id: 'sustain', label: 'Sustainability Score', icon: 'eco', endpoint: '/api/ai-advanced/sustainability-score' },
  { id: 'capsule', label: 'Capsule Wardrobe', icon: 'checkroom', endpoint: '/api/ai-advanced/capsule-wardrobe' },
  { id: 'packing', label: 'Packing List', icon: 'luggage', endpoint: '/api/ai-advanced/packing-list' },
  { id: 'bodytype', label: 'Body Type Analyze', icon: 'accessibility_new', endpoint: '/api/ai-advanced/body-type-analyze' },
  { id: 'photo', label: 'Photo Outfit Analyze', icon: 'photo_camera', endpoint: '/api/ai-advanced/photo-outfit-analyze' },
  { id: 'artryon', label: 'AR Try-On Prepare', icon: 'view_in_ar', endpoint: '/api/ai-advanced/ar-tryon-prepare' },
  { id: 'social', label: 'Style Collab Post', icon: 'forum', endpoint: '/api/ai-advanced/style-collab-post' },
  { id: 'retailer', label: 'Retailer Price Track', icon: 'price_change', endpoint: '/api/ai-advanced/retailer-price-track' },
];

export default function AIRecommendationsPage() {
  const { token } = useAuth();
  const [activeTool, setActiveTool] = useState('shopping');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [shopForm, setShopForm] = useState({ budget: '', priorities: '', missing_pieces: '', preferred_brands: '' });
  const [trendForm, setTrendForm] = useState({ season: '', style_preference: '', region: '', budget_tier: 'mid' });
  const [occForm, setOccForm] = useState({ occasion: '', dress_code: '', weather: '', body_concerns: '' });
  const [sustainForm, setSustainForm] = useState({ item_id: '', name: '', category: '', material: '', brand: '', expected_uses_per_year: 24, expected_lifetime_years: 3 });
  const [capsuleForm, setCapsuleForm] = useState({ season: 'Fall', lifestyle: 'business casual', max_pieces: 30, color_palette: 'neutral' });
  const [packForm, setPackForm] = useState({ destination: '', days: 7, weather_summary: '', activities: '', dress_codes: '' });
  const [bodyForm, setBodyForm] = useState({ height_cm: 170, weight_kg: 70, chest_cm: '', waist_cm: '', hip_cm: '', inseam_cm: '', size_top: 'M', size_bottom: 'M', size_shoe: '' });
  const [photoForm, setPhotoForm] = useState({ image_url: '', occasion: 'casual' });
  const [arForm, setArForm] = useState({ item_id: '' });
  const [socialForm, setSocialForm] = useState({ title: '', body: '', outfit_id: '' });

  const presetFields = {
    shopping: [shopForm, setShopForm, [
      { label: 'Workwear capsule', values: { budget: '450', priorities: 'Versatile office layers, comfort, durable natural fibers', missing_pieces: 'navy blazer, ivory knit top, tailored trousers', preferred_brands: 'Fictional Atelier, Northline Studio' } },
      { label: 'Weekend essentials', values: { budget: '220', priorities: 'Easy care, relaxed fit, repeat wear', missing_pieces: 'dark straight-leg jeans, lightweight overshirt', preferred_brands: 'Harbor & Field, Common Thread' } },
      { label: 'Travel edit', values: { budget: '600', priorities: 'Packable, wrinkle-resistant, mix-and-match', missing_pieces: 'neutral walking shoes, versatile dress', preferred_brands: 'Waypoint Goods, Fictional Atelier' } },
    ]],
    trend: [trendForm, setTrendForm, [
      { label: 'Spring city', values: { season: 'Spring', style_preference: 'Modern minimalist with relaxed tailoring', region: 'New York City', budget_tier: 'mid' } },
      { label: 'Summer coastal', values: { season: 'Summer', style_preference: 'Polished coastal casual', region: 'Boston', budget_tier: 'budget' } },
      { label: 'Winter evening', values: { season: 'Winter', style_preference: 'Refined monochrome layers', region: 'Chicago', budget_tier: 'premium' } },
    ]],
    occasion: [occForm, setOccForm, [
      { label: 'Garden wedding', values: { occasion: 'Outdoor garden wedding', dress_code: 'Cocktail attire', weather: 'Mild, partly cloudy, 68°F', body_concerns: 'Fictional example: prioritize breathable fabric and comfortable block heels; no real personal preferences supplied.' } },
      { label: 'Client dinner', values: { occasion: 'Client dinner', dress_code: 'Business smart', weather: 'Cool evening, light rain possible', body_concerns: 'Fictional example: suggest adaptable layers and walkable shoes.' } },
      { label: 'Gallery opening', values: { occasion: 'Gallery opening', dress_code: 'Creative smart casual', weather: 'Warm indoor venue', body_concerns: 'Fictional example: keep the outfit comfortable for standing.' } },
    ]],
    sustain: [sustainForm, setSustainForm, [
      { label: 'Wool coat', values: { item_id: '', name: 'Fictional wool blend coat', category: 'Outerwear', material: 'Recycled wool blend', brand: 'Example label', expected_uses_per_year: 40, expected_lifetime_years: 6 } },
      { label: 'Canvas tote', values: { item_id: '', name: 'Fictional organic cotton tote', category: 'Bag', material: 'Organic cotton canvas', brand: 'Example label', expected_uses_per_year: 90, expected_lifetime_years: 4 } },
      { label: 'Leather shoes', values: { item_id: '', name: 'Fictional leather loafers', category: 'Shoes', material: 'Leather', brand: 'Example label', expected_uses_per_year: 55, expected_lifetime_years: 5 } },
    ]],
    capsule: [capsuleForm, setCapsuleForm, [
      { label: 'Spring office', values: { season: 'Spring', lifestyle: 'Business casual with a bike commute', max_pieces: 24, color_palette: 'navy, ivory, sage, tan' } },
      { label: 'Summer weekend', values: { season: 'Summer', lifestyle: 'Relaxed city weekends', max_pieces: 18, color_palette: 'white, denim blue, warm neutrals' } },
      { label: 'Winter travel', values: { season: 'Winter', lifestyle: 'Frequent travel and smart casual meetings', max_pieces: 28, color_palette: 'charcoal, camel, cream, burgundy' } },
    ]],
    packing: [packForm, setPackForm, [
      { label: 'Lisbon week', values: { destination: 'Lisbon, Portugal (fictional itinerary)', days: 7, weather_summary: 'Mild days, cool evenings, occasional showers (illustrative)', activities: 'walking tour, museum visits, casual dinners', dress_codes: 'smart casual, comfortable sightseeing' } },
      { label: 'Boston work trip', values: { destination: 'Boston, Massachusetts (fictional itinerary)', days: 3, weather_summary: 'Cool and breezy (illustrative)', activities: 'client meetings, restaurant dinner', dress_codes: 'business casual, polished evening' } },
      { label: 'Lake weekend', values: { destination: 'Lake region (fictional itinerary)', days: 4, weather_summary: 'Warm days, cooler evenings (illustrative)', activities: 'hiking, lakeside lunch, outdoor dinner', dress_codes: 'active casual, relaxed casual' } },
    ]],
    bodytype: [bodyForm, setBodyForm, [
      { label: 'Fictional profile A', values: { height_cm: 168, weight_kg: 64, chest_cm: 90, waist_cm: 74, hip_cm: 98, inseam_cm: 78, size_top: 'M', size_bottom: 'M', size_shoe: 'EU 39' } },
      { label: 'Fictional profile B', values: { height_cm: 178, weight_kg: 76, chest_cm: 98, waist_cm: 82, hip_cm: 100, inseam_cm: 82, size_top: 'L', size_bottom: '32', size_shoe: 'EU 43' } },
      { label: 'Fictional profile C', values: { height_cm: 160, weight_kg: 55, chest_cm: 84, waist_cm: 68, hip_cm: 92, inseam_cm: 72, size_top: 'S', size_bottom: 'S', size_shoe: 'EU 37' } },
    ]],
    photo: [photoForm, setPhotoForm, [
      { label: 'Casual styling brief', values: { image_url: '', occasion: 'Casual daytime outfit; no image attached (example only)' } },
      { label: 'Office styling brief', values: { image_url: '', occasion: 'Business casual outfit; no image attached (example only)' } },
      { label: 'Event styling brief', values: { image_url: '', occasion: 'Evening event outfit; no image attached (example only)' } },
    ]],
    artryon: [arForm, setArForm, [
      { label: 'Select a real wardrobe item', values: { item_id: '' } },
      { label: 'Select a real wardrobe item', values: { item_id: '' } },
      { label: 'Select a real wardrobe item', values: { item_id: '' } },
    ]],
    social: [socialForm, setSocialForm, [
      { label: 'Style poll', values: { title: 'Which layer works best?', body: 'Fictional styling example: comparing a relaxed blazer with a lightweight trench for a spring commute.', outfit_id: '' } },
      { label: 'Color pairing', values: { title: 'Color pairing idea', body: 'Fictional styling example: would you pair a soft blue shirt with warm tan accessories?', outfit_id: '' } },
      { label: 'Travel edit', values: { title: 'One piece, three looks', body: 'Fictional styling example: sharing three ways to rewear a neutral overshirt on a weekend trip.', outfit_id: '' } },
    ]],
  };

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const tool = TOOLS.find(t => t.id === activeTool);
      let body;
      if (activeTool === 'shopping') {
        body = {
          budget: shopForm.budget ? parseFloat(shopForm.budget) : undefined,
          priorities: shopForm.priorities,
          missing_pieces: shopForm.missing_pieces.split(',').map(s => s.trim()).filter(Boolean),
          preferred_brands: shopForm.preferred_brands.split(',').map(s => s.trim()).filter(Boolean),
        };
      } else if (activeTool === 'trend') {
        body = { ...trendForm };
      } else if (activeTool === 'occasion') {
        body = { ...occForm };
      } else if (activeTool === 'sustain') {
        body = {
          item_id: sustainForm.item_id ? Number(sustainForm.item_id) : undefined,
          item_overrides: sustainForm.item_id ? undefined : {
            name: sustainForm.name,
            category: sustainForm.category,
            material: sustainForm.material,
            brand: sustainForm.brand,
          },
          expected_uses_per_year: Number(sustainForm.expected_uses_per_year),
          expected_lifetime_years: Number(sustainForm.expected_lifetime_years),
        };
      } else if (activeTool === 'capsule') {
        body = {
          season: capsuleForm.season,
          lifestyle: capsuleForm.lifestyle,
          max_pieces: Number(capsuleForm.max_pieces),
          color_palette: capsuleForm.color_palette,
        };
      } else if (activeTool === 'packing') {
        body = {
          destination: packForm.destination,
          days: Number(packForm.days),
          weather_summary: packForm.weather_summary,
          activities: packForm.activities.split(',').map(s => s.trim()).filter(Boolean),
          dress_codes: packForm.dress_codes.split(',').map(s => s.trim()).filter(Boolean),
        };
      } else if (activeTool === 'bodytype') {
        body = {
          height_cm: Number(bodyForm.height_cm),
          weight_kg: bodyForm.weight_kg ? Number(bodyForm.weight_kg) : undefined,
          chest_cm: bodyForm.chest_cm ? Number(bodyForm.chest_cm) : undefined,
          waist_cm: bodyForm.waist_cm ? Number(bodyForm.waist_cm) : undefined,
          hip_cm: bodyForm.hip_cm ? Number(bodyForm.hip_cm) : undefined,
          inseam_cm: bodyForm.inseam_cm ? Number(bodyForm.inseam_cm) : undefined,
          size_top: bodyForm.size_top, size_bottom: bodyForm.size_bottom, size_shoe: bodyForm.size_shoe,
        };
      } else if (activeTool === 'photo') {
        body = { image_url: photoForm.image_url, occasion: photoForm.occasion };
      } else if (activeTool === 'artryon') {
        body = { item_id: Number(arForm.item_id) };
      } else if (activeTool === 'social') {
        body = { title: socialForm.title, body: socialForm.body, outfit_id: socialForm.outfit_id ? Number(socialForm.outfit_id) : undefined };
      } else if (activeTool === 'retailer') {
        body = {};
      }
      const res = await fetch(tool.endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'AI service unavailable: missing OPENROUTER_API_KEY');
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{ color: '#f59e0b' }}>recommend</span>
          <div>
            <h1>AI Recommendations</h1>
            <p>Shopping, trend forecasts, and occasion-specific outfit suggestions</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setResult(null); setError(null); }}
            className={`btn ${activeTool === t.id ? 'btn-primary' : 'btn-ghost'}`}
          >
            <span className="material-icons-outlined">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="data-table-container" style={{ padding: 24, marginBottom: 16 }}>
        {activeTool === 'shopping' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Shopping Recommend</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Budget ($)</label>
                <input type="number" value={shopForm.budget} onChange={(e) => setShopForm({ ...shopForm, budget: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Priorities</label>
                <input value={shopForm.priorities} onChange={(e) => setShopForm({ ...shopForm, priorities: e.target.value })} placeholder="Workwear, sustainability..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Missing Pieces (comma-separated)</label>
              <input value={shopForm.missing_pieces} onChange={(e) => setShopForm({ ...shopForm, missing_pieces: e.target.value })} placeholder="navy blazer, white sneakers" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Preferred Brands (comma-separated)</label>
              <input value={shopForm.preferred_brands} onChange={(e) => setShopForm({ ...shopForm, preferred_brands: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
          </>
        )}

        {activeTool === 'trend' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Trend Forecast</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Season</label>
                <select value={trendForm.season} onChange={(e) => setTrendForm({ ...trendForm, season: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }}>
                  <option value="">Select...</option>
                  <option>Spring</option><option>Summer</option><option>Fall</option><option>Winter</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Style Preference</label>
                <input value={trendForm.style_preference} onChange={(e) => setTrendForm({ ...trendForm, style_preference: e.target.value })} placeholder="Minimalist, edgy..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Region</label>
                <input value={trendForm.region} onChange={(e) => setTrendForm({ ...trendForm, region: e.target.value })} placeholder="NYC, EU, Tokyo..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Budget Tier</label>
                <select value={trendForm.budget_tier} onChange={(e) => setTrendForm({ ...trendForm, budget_tier: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }}>
                  <option value="budget">Budget</option>
                  <option value="mid">Mid</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTool === 'occasion' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Occasion Outfit Suggest</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Occasion</label>
                <input value={occForm.occasion} onChange={(e) => setOccForm({ ...occForm, occasion: e.target.value })} placeholder="Wedding, gala, retreat..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Dress Code</label>
                <input value={occForm.dress_code} onChange={(e) => setOccForm({ ...occForm, dress_code: e.target.value })} placeholder="Black tie, smart casual..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Weather</label>
              <input value={occForm.weather} onChange={(e) => setOccForm({ ...occForm, weather: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Body Concerns / Comfort Notes</label>
              <textarea rows={3} value={occForm.body_concerns} onChange={(e) => setOccForm({ ...occForm, body_concerns: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
          </>
        )}

        {activeTool === 'sustain' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Sustainability & Cost-per-Wear</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Existing Item ID (optional)</label>
                <input type="number" value={sustainForm.item_id} onChange={(e) => setSustainForm({ ...sustainForm, item_id: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Or Item Name</label>
                <input value={sustainForm.name} onChange={(e) => setSustainForm({ ...sustainForm, name: e.target.value })} placeholder="Wool blend coat" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Category</label>
                <input value={sustainForm.category} onChange={(e) => setSustainForm({ ...sustainForm, category: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Material</label>
                <input value={sustainForm.material} onChange={(e) => setSustainForm({ ...sustainForm, material: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Brand</label>
                <input value={sustainForm.brand} onChange={(e) => setSustainForm({ ...sustainForm, brand: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Expected Uses/Year</label>
                <input type="number" min="1" value={sustainForm.expected_uses_per_year} onChange={(e) => setSustainForm({ ...sustainForm, expected_uses_per_year: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Expected Lifetime (years)</label>
                <input type="number" min="1" value={sustainForm.expected_lifetime_years} onChange={(e) => setSustainForm({ ...sustainForm, expected_lifetime_years: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
            </div>
          </>
        )}

        {activeTool === 'capsule' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Capsule Wardrobe Builder</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Season</label>
                <select value={capsuleForm.season} onChange={(e) => setCapsuleForm({ ...capsuleForm, season: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }}>
                  <option>Spring</option><option>Summer</option><option>Fall</option><option>Winter</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Lifestyle</label>
                <input value={capsuleForm.lifestyle} onChange={(e) => setCapsuleForm({ ...capsuleForm, lifestyle: e.target.value })} placeholder="business casual, urban active..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Max Pieces</label>
                <input type="number" min="10" max="60" value={capsuleForm.max_pieces} onChange={(e) => setCapsuleForm({ ...capsuleForm, max_pieces: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Color Palette</label>
                <input value={capsuleForm.color_palette} onChange={(e) => setCapsuleForm({ ...capsuleForm, color_palette: e.target.value })} placeholder="neutral, jewel tones..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
            </div>
          </>
        )}

        {activeTool === 'packing' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Packing List Generator</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Destination</label>
                <input value={packForm.destination} onChange={(e) => setPackForm({ ...packForm, destination: e.target.value })} placeholder="Tokyo, Lisbon, NYC..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Days</label>
                <input type="number" min="1" max="60" value={packForm.days} onChange={(e) => setPackForm({ ...packForm, days: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Weather Summary</label>
              <input value={packForm.weather_summary} onChange={(e) => setPackForm({ ...packForm, weather_summary: e.target.value })} placeholder="60-75F, light rain expected" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Activities (comma-separated)</label>
              <input value={packForm.activities} onChange={(e) => setPackForm({ ...packForm, activities: e.target.value })} placeholder="hiking, business meetings, fine dining" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Dress Codes (comma-separated)</label>
              <input value={packForm.dress_codes} onChange={(e) => setPackForm({ ...packForm, dress_codes: e.target.value })} placeholder="business, smart casual, beach" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
          </>
        )}

        {activeTool === 'bodytype' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Body Type Analyze</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Height (cm)</label>
                <input type="number" value={bodyForm.height_cm} onChange={(e) => setBodyForm({ ...bodyForm, height_cm: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Weight (kg)</label>
                <input type="number" value={bodyForm.weight_kg} onChange={(e) => setBodyForm({ ...bodyForm, weight_kg: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Chest (cm)</label>
                <input type="number" value={bodyForm.chest_cm} onChange={(e) => setBodyForm({ ...bodyForm, chest_cm: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Waist (cm)</label>
                <input type="number" value={bodyForm.waist_cm} onChange={(e) => setBodyForm({ ...bodyForm, waist_cm: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Hip (cm)</label>
                <input type="number" value={bodyForm.hip_cm} onChange={(e) => setBodyForm({ ...bodyForm, hip_cm: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Inseam (cm)</label>
                <input type="number" value={bodyForm.inseam_cm} onChange={(e) => setBodyForm({ ...bodyForm, inseam_cm: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Top Size</label>
                <input value={bodyForm.size_top} onChange={(e) => setBodyForm({ ...bodyForm, size_top: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Bottom Size</label>
                <input value={bodyForm.size_bottom} onChange={(e) => setBodyForm({ ...bodyForm, size_bottom: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Shoe Size</label>
                <input value={bodyForm.size_shoe} onChange={(e) => setBodyForm({ ...bodyForm, size_shoe: e.target.value })} placeholder="US 8 / EU 39" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} /></div>
            </div>
          </>
        )}

        {activeTool === 'photo' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Photo Outfit Analyze</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Public Image URL</label>
              <input value={photoForm.image_url} onChange={(e) => setPhotoForm({ ...photoForm, image_url: e.target.value })} placeholder="https://..." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Occasion</label>
              <input value={photoForm.occasion} onChange={(e) => setPhotoForm({ ...photoForm, occasion: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
          </>
        )}

        {activeTool === 'artryon' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>AR Try-On Prepare</h3>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Wardrobe Item ID</label>
              <input type="number" value={arForm.item_id} onChange={(e) => setArForm({ item_id: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Returns AR config; falls back to 2D overlay when AR_TRYON_PROVIDER env var not set.</p>
          </>
        )}

        {activeTool === 'social' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Style Collab Post (private feed)</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
              <input value={socialForm.title} onChange={(e) => setSocialForm({ ...socialForm, title: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Body</label>
              <textarea rows={3} value={socialForm.body} onChange={(e) => setSocialForm({ ...socialForm, body: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Outfit ID (optional)</label>
              <input type="number" value={socialForm.outfit_id} onChange={(e) => setSocialForm({ ...socialForm, outfit_id: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px' }} />
            </div>
          </>
        )}

        {activeTool === 'retailer' && (
          <>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Retailer Price Track</h3>
            <p style={{ fontSize: 13, color: '#666' }}>Requires <code>SHOPSTYLE_API_KEY</code> env var. Returns 503 with `missing` when unset.</p>
          </>
        )}

        {presetFields[activeTool] && <FullFieldPresets value={presetFields[activeTool][0]} onChange={(next) => { presetFields[activeTool][1](next); setResult(null); setError(null); }} presets={presetFields[activeTool][2]} disabled={loading} />}
        {['photo', 'artryon'].includes(activeTool) && <p className="ai-muted">Examples never invent image URLs or wardrobe item IDs; attach an image or select a real item before using these tools.</p>}

        <button onClick={run} disabled={loading} className="btn btn-ai" style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 16 }}>
          <span className="material-icons-outlined">auto_awesome</span>
          {loading ? 'Running AI...' : 'Run AI'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#dc2626', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {result && <AIReport response={result} title={TOOLS.find((tool) => tool.id === activeTool)?.label || 'AI recommendation'} />}
    </div>
  );
}
