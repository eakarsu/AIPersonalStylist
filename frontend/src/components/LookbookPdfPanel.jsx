import React, { useState } from 'react';

export default function LookbookPdfPanel() {
  const [title, setTitle] = useState('My Spring Lookbook');
  const [author, setAuthor] = useState('AI Personal Stylist');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    setStatus('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/custom-views/lookbook-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, author }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed (${res.status}): ${txt.slice(0, 160)}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(title || 'lookbook').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(`PDF generated (${blob.size} bytes)`);
    } catch (e) {
      setStatus(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: '#0f172a', padding: 18, borderRadius: 12, border: '1px solid #1f2937' }}>
      <h3 style={{ margin: 0, marginBottom: 12, color: '#e5e7eb' }}>Lookbook PDF Export</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ color: '#cbd5e1', fontSize: 12 }}>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6 }}
          />
        </label>
        <label style={{ color: '#cbd5e1', fontSize: 12 }}>
          Curated by
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6 }}
          />
        </label>
        <button
          onClick={generate}
          disabled={busy}
          style={{
            marginTop: 4, padding: '10px 14px', background: '#7c3aed', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
          }}
        >
          {busy ? 'Generating…' : 'Generate & Download PDF'}
        </button>
        {status && <div style={{ color: '#a7f3d0', fontSize: 12 }}>{status}</div>}
      </div>
    </div>
  );
}
