import React, { useEffect, useState } from 'react';

const KINDS = ['color', 'fit', 'occasion'];

export default function PreferenceRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({ kind: 'color', value: '', weight: 5, note: '' });

  const token = () => localStorage.getItem('token') || '';

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom-views/preference-rules', {
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      const d = await res.json();
      setRules(d.rules || []);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const send = async (body) => {
    const res = await fetch('/api/custom-views/preference-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (d.rules) setRules(d.rules);
    return d;
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.value.trim()) return;
    await send(form);
    setForm({ kind: 'color', value: '', weight: 5, note: '' });
  };

  const onUpdate = async (rule, patch) => {
    await send({ id: rule.id, ...patch });
  };

  const onDelete = async (rule) => {
    await send({ id: rule.id, action: 'delete' });
  };

  return (
    <div style={{ background: '#0f172a', padding: 18, borderRadius: 12, border: '1px solid #1f2937' }}>
      <h3 style={{ margin: 0, marginBottom: 12, color: '#e5e7eb' }}>Style Preference Rules</h3>

      <form onSubmit={onCreate} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 1fr auto', gap: 8, marginBottom: 14 }}>
        <select
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value })}
          style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 6 }}
        >
          {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input
          placeholder="value (e.g. navy, slim-fit, brunch)"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 6 }}
        />
        <input
          type="number" min="0" max="10"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
          style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 6 }}
        />
        <input
          placeholder="note (optional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 6 }}
        />
        <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
          Add
        </button>
      </form>

      {err && <div style={{ color: '#fca5a5', marginBottom: 8 }}>Error: {err}</div>}
      {loading && <div style={{ color: '#9ca3af' }}>Loading rules…</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>
            <th style={{ padding: 8 }}>Kind</th>
            <th style={{ padding: 8 }}>Value</th>
            <th style={{ padding: 8, width: 80 }}>Weight</th>
            <th style={{ padding: 8 }}>Note</th>
            <th style={{ padding: 8, width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: 8 }}>
                <select
                  value={r.kind}
                  onChange={(e) => onUpdate(r, { kind: e.target.value })}
                  style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 4 }}
                >
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </td>
              <td style={{ padding: 8 }}>
                <input
                  defaultValue={r.value}
                  onBlur={(e) => e.target.value !== r.value && onUpdate(r, { value: e.target.value })}
                  style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 4, width: '100%' }}
                />
              </td>
              <td style={{ padding: 8 }}>
                <input
                  type="number" min="0" max="10" defaultValue={r.weight}
                  onBlur={(e) => Number(e.target.value) !== r.weight && onUpdate(r, { weight: Number(e.target.value) })}
                  style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 4, width: 70 }}
                />
              </td>
              <td style={{ padding: 8 }}>
                <input
                  defaultValue={r.note}
                  onBlur={(e) => e.target.value !== r.note && onUpdate(r, { note: e.target.value })}
                  style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6, padding: 4, width: '100%' }}
                />
              </td>
              <td style={{ padding: 8 }}>
                <button
                  onClick={() => onDelete(r)}
                  style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
