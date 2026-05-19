import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OutfitGeneratorPage() {
  const { token } = useAuth();
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const occasions = [
    'Business Meeting', 'Casual Weekend', 'Date Night', 'Formal Dinner', 'Garden Party',
    'Job Interview', 'Beach/Resort', 'Gym/Athletic', 'Travel', 'Concert', 'Wedding Guest',
    'Smart Casual Office', 'Holiday Party', 'Outdoor Adventure', 'Art Gallery',
  ];

  const weatherOptions = [
    'Hot and sunny', 'Warm and clear', 'Mild and pleasant', 'Cool and breezy',
    'Cold and dry', 'Rainy', 'Snowy/Freezing',
  ];

  const handleGenerate = async () => {
    if (!occasion) { setError('Please select an occasion'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ai-advanced/generate-outfit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ occasion, weather }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const outfits = result?.outfits;
  const parsedOutfits = typeof outfits === 'object' ? outfits : null;

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{ color: '#ec4899' }}>style</span>
          <div>
            <h1>Outfit Generator</h1>
            <p>AI-powered outfit combinations from your wardrobe</p>
          </div>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Generate an Outfit</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              Occasion *
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '14px' }}
            >
              <option value="">Select occasion...</option>
              {occasions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              Weather
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '14px' }}
            >
              <option value="">Any weather</option>
              {weatherOptions.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-ai"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <span className="material-icons-outlined">auto_awesome</span>
          {loading ? 'Creating Outfit Combinations...' : 'Generate Outfits from My Wardrobe'}
        </button>
        {result && <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>Based on {result.wardrobe_count} wardrobe items</div>}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', color: '#dc2626', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {parsedOutfits?.outfits?.map((outfit, i) => (
        <div key={i} className="data-table-container" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{outfit.outfit_name}</h3>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{outfit.vibe}</p>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: 600 }}>
              {outfit.confidence_score}/10
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Top', data: outfit.top, icon: '👕' },
              { label: 'Bottom', data: outfit.bottom, icon: '👖' },
              { label: 'Shoes', data: outfit.shoes, icon: '👟' },
              { label: 'Outerwear', data: outfit.outerwear, icon: '🧥' },
            ].map((piece) => piece.data && piece.data.item_name && (
              <div key={piece.label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{piece.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>{piece.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>{piece.data.item_name}</div>
                {piece.data.reason && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{piece.data.reason}</div>}
              </div>
            ))}
          </div>

          {outfit.accessories?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>ACCESSORIES: </span>
              <span style={{ fontSize: '13px', color: '#374151' }}>{outfit.accessories.join(', ')}</span>
            </div>
          )}

          {outfit.styling_tips && (
            <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#1d4ed8' }}>
              💡 {outfit.styling_tips}
            </div>
          )}
        </div>
      ))}

      {parsedOutfits?.shopping_suggestions?.length > 0 && (
        <div className="data-table-container" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Shopping Suggestions (Wardrobe Gaps)</h3>
          {parsedOutfits.shopping_suggestions.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '16px' }}>🛍️</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>{s.item}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {result && !parsedOutfits && (
        <div className="data-table-container" style={{ padding: '20px' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{result.raw}</pre>
        </div>
      )}
    </div>
  );
}
