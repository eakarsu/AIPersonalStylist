import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FEATURES } from '../config/features';

export default function AIHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [featureFilter, setFeatureFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchHistory = async (p = 1, feature = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (feature) params.append('feature', feature);
      const res = await fetch(`/api/ai/history?${params}`, { headers });
      const data = await res.json();
      setHistory(data.data || []);
      setPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSelected(null);
    fetchHistory(1, featureFilter);
  }, [featureFilter]);

  useEffect(() => {
    fetchHistory(page, featureFilter);
  }, [page]);

  const featureLabel = (key) => {
    const f = FEATURES.find((f) => f.key === key || f.aiFeature === key);
    return f ? f.title : key;
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{ color: '#8b5cf6' }}>history</span>
          <div>
            <h1>AI History</h1>
            <p>Past AI analysis results for your account</p>
          </div>
        </div>
      </div>

      {/* Feature filter */}
      <div className="feature-page-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Filter by feature:</label>
          <select
            value={featureFilter}
            onChange={(e) => setFeatureFilter(e.target.value)}
            style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px', fontSize: '13px' }}
          >
            <option value="">All Features</option>
            {FEATURES.map((f) => (
              <option key={f.key} value={f.aiFeature || f.key}>{f.title}</option>
            ))}
          </select>
        </div>
        <span className="item-count">{pagination.total} results</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* History list */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
          {loading ? (
            <div className="page-loading"><div className="loading-spinner"></div></div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <span className="material-icons-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px', opacity: 0.4 }}>history</span>
              <p style={{ fontSize: '13px' }}>No AI history yet{featureFilter ? ' for this feature' : ''}.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '10px 12px', borderRadius: '8px', border: selected?.id === item.id ? '1.5px solid #8b5cf6' : '1px solid #f3f4f6',
                      background: selected?.id === item.id ? '#f5f3ff' : 'white',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <span className="material-icons-outlined" style={{ fontSize: '20px', color: '#8b5cf6', marginTop: '2px', flexShrink: 0 }}>auto_awesome</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {featureLabel(item.feature)}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
                  <span className="material-icons-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
                </button>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Page {page} of {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
                  <span className="material-icons-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Selected result detail */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
          {selected ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-icons-outlined" style={{ color: '#8b5cf6', fontSize: '20px' }}>auto_awesome</span>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{featureLabel(selected.feature)}</h2>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <pre style={{
                whiteSpace: 'pre-wrap', fontSize: '12px', color: '#374151',
                background: '#f9fafb', borderRadius: '8px', padding: '16px',
                maxHeight: '600px', overflowY: 'auto', fontFamily: 'inherit', lineHeight: '1.6',
              }}>
                {selected.result}
              </pre>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9ca3af' }}>
              <span className="material-icons-outlined" style={{ fontSize: '40px', opacity: 0.3, marginBottom: '8px' }}>history</span>
              <p style={{ fontSize: '13px' }}>Select an AI result to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
