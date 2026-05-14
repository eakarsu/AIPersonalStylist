import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SeasonalAnalysisPage() {
  const { token } = useAuth();
  const [season, setSeason] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleAnalyze = async () => {
    if (!season) { setError('Please select a season'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ai-advanced/seasonal-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({ current_season: season, upcoming_events: upcomingEvents }),
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

  const analysis = result?.analysis;
  const parsed = typeof analysis === 'object' ? analysis : null;

  const priorityColor = (p) => {
    if (p === 'high') return '#fef2f2';
    if (p === 'medium') return '#fffbeb';
    return '#f0fdf4';
  };
  const priorityTextColor = (p) => {
    if (p === 'high') return '#dc2626';
    if (p === 'medium') return '#d97706';
    return '#16a34a';
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{ color: '#06b6d4' }}>ac_unit</span>
          <div>
            <h1>Seasonal Analysis</h1>
            <p>Discover what's missing and what's perfect for the season</p>
          </div>
        </div>
      </div>

      <div className="data-table-container" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              Current Season *
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '14px' }}
            >
              <option value="">Select season...</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall / Autumn</option>
              <option value="Winter">Winter</option>
              <option value="Spring/Summer transition">Spring/Summer Transition</option>
              <option value="Fall/Winter transition">Fall/Winter Transition</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
              Upcoming Events (optional)
            </label>
            <input
              type="text"
              value={upcomingEvents}
              onChange={(e) => setUpcomingEvents(e.target.value)}
              placeholder="e.g., Wedding in June, Business conference, Beach holiday"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '14px' }}
            />
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="btn btn-ai"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <span className="material-icons-outlined">auto_awesome</span>
          {loading ? 'Analyzing Your Wardrobe...' : 'Analyze for Season'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', color: '#dc2626', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Score */}
          <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', color: 'white', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>{parsed.wardrobe_score}/10</div>
              <div style={{ opacity: 0.85, marginTop: '4px' }}>Season Readiness Score for {parsed.season}</div>
              <p style={{ marginTop: '8px', opacity: 0.9, fontSize: '14px' }}>{parsed.summary}</p>
            </div>
          </div>

          {/* Season readiness breakdown */}
          <div className="data-table-container" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Season Readiness Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {parsed.items_by_season_readiness?.perfect_for_season?.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', marginBottom: '8px', textTransform: 'uppercase' }}>
                    ✓ Perfect for {parsed.season} ({parsed.items_by_season_readiness.perfect_for_season.length})
                  </div>
                  {parsed.items_by_season_readiness.perfect_for_season.map((item, i) => (
                    <div key={i} style={{ padding: '8px', background: '#f0fdf4', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      {item.reason && <span style={{ color: '#15803d', fontSize: '12px' }}> — {item.reason}</span>}
                    </div>
                  ))}
                </div>
              )}
              {parsed.items_by_season_readiness?.works_with_layering?.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', marginBottom: '8px', textTransform: 'uppercase' }}>
                    ◑ Works with Layering ({parsed.items_by_season_readiness.works_with_layering.length})
                  </div>
                  {parsed.items_by_season_readiness.works_with_layering.map((item, i) => (
                    <div key={i} style={{ padding: '8px', background: '#fffbeb', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      {item.tip && <span style={{ color: '#92400e', fontSize: '12px' }}> — {item.tip}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Missing essentials */}
          {parsed.missing_essentials?.length > 0 && (
            <div className="data-table-container" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '16px', color: '#dc2626' }}>Missing Essentials — Shopping List</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {parsed.missing_essentials.map((item, i) => (
                  <div key={i} style={{
                    background: priorityColor(item.priority),
                    borderRadius: '10px',
                    padding: '14px',
                    borderLeft: `4px solid ${priorityTextColor(item.priority)}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.item}</div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: priorityTextColor(item.priority),
                        background: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                      }}>{item.priority}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{item.category}</div>
                    <div style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>{item.reason}</div>
                    {item.estimated_budget && (
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#059669', marginTop: '6px' }}>Budget: {item.estimated_budget}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outfit ideas */}
          {parsed.outfit_ideas_for_season?.length > 0 && (
            <div className="data-table-container" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Outfit Ideas for {parsed.season}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {parsed.outfit_ideas_for_season.map((outfit, i) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>{outfit.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>For: {outfit.occasion}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {outfit.items?.map((item, j) => (
                        <span key={j} style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px' }}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transition tips */}
          {parsed.transition_tips?.length > 0 && (
            <div className="data-table-container" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Transition Tips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parsed.transition_tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                    <span style={{ color: '#8b5cf6', fontWeight: 700, flexShrink: 0 }}>→</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result && !parsed && (
        <div className="data-table-container" style={{ padding: '20px' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{result.raw}</pre>
        </div>
      )}
    </div>
  );
}
