import React, { useEffect, useState } from 'react';

function color(v, max) {
  const t = Math.max(0, Math.min(1, v / Math.max(1, max)));
  // Lerp deep blue -> magenta -> warm pink
  const r = Math.round(40 + t * 200);
  const g = Math.round(30 + t * 60);
  const b = Math.round(120 + (1 - t) * 100);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function StyleHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/custom-views/style-heatmap', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#fca5a5' }}>Error: {err}</div>;
  if (!data) return <div style={{ color: '#9ca3af' }}>Loading heatmap…</div>;

  return (
    <div style={{ background: '#0f172a', padding: 18, borderRadius: 12, border: '1px solid #1f2937' }}>
      <h3 style={{ margin: 0, marginBottom: 12, color: '#e5e7eb' }}>Style × Occasion Affinity</h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ color: '#94a3b8', fontSize: 11, padding: 4 }}></th>
              {data.occasions.map((o) => (
                <th key={o} style={{ color: '#cbd5e1', fontSize: 11, padding: 4, textTransform: 'capitalize' }}>{o}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.styles.map((s, i) => (
              <tr key={s}>
                <td style={{ color: '#cbd5e1', fontSize: 11, padding: 4, textTransform: 'capitalize' }}>{s}</td>
                {data.matrix[i].map((v, j) => (
                  <td
                    key={j}
                    title={`${s} × ${data.occasions[j]} = ${v}`}
                    style={{
                      width: 48, height: 36,
                      background: color(v, data.legend.max),
                      color: '#fff', fontSize: 12, fontWeight: 600,
                      textAlign: 'center', borderRadius: 6,
                    }}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>
        Scale {data.legend.min}–{data.legend.max} {data.legend.unit}
      </div>
    </div>
  );
}
