import React, { useEffect, useState } from 'react';

export default function OutfitUsageChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/custom-views/outfit-usage', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#fca5a5' }}>Error: {err}</div>;
  if (!data) return <div style={{ color: '#9ca3af' }}>Loading outfit usage…</div>;

  const max = Math.max(1, ...data.buckets.map((b) => b.count));

  return (
    <div style={{ background: '#0f172a', padding: 18, borderRadius: 12, border: '1px solid #1f2937' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: '#e5e7eb' }}>Outfit Usage by Occasion</h3>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>
          {data.totals.total} outfits · avg ★ {data.totals.avgRating.toFixed(2)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
        {data.buckets.map((b) => {
          const h = Math.round((b.count / max) * 170) + 6;
          return (
            <div key={b.occasion} style={{ flex: 1, textAlign: 'center' }}>
              <div
                title={`${b.occasion}: ${b.count} outfits (avg ★ ${b.avgRating.toFixed(2)})`}
                style={{
                  height: h,
                  background: 'linear-gradient(180deg, #a855f7 0%, #6366f1 100%)',
                  borderRadius: '6px 6px 0 0',
                }}
              />
              <div style={{ color: '#cbd5e1', fontSize: 11, marginTop: 6 }}>{b.occasion}</div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>{b.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
