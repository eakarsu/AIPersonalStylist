import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AIOutput from '../components/AIOutput';

export default function FeaturePage({ config }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(config.apiPath, { headers });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setSelectedItem(null);
    setShowForm(false);
    setEditItem(null);
    setAiData(null);
    setSearchQuery('');
    setLoading(true);
    fetchItems();
  }, [config.key]);

  const handleCreate = () => {
    const initial = {};
    config.fields.forEach((f) => (initial[f.key] = ''));
    setFormData(initial);
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    const data = {};
    config.fields.forEach((f) => (data[f.key] = item[f.key] || ''));
    setFormData(data);
    setEditItem(item);
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleSave = async () => {
    try {
      const url = editItem ? `${config.apiPath}/${editItem.id}` : config.apiPath;
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setEditItem(null);
        fetchItems();
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${config.apiPath}/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setSelectedItem(null);
        fetchItems();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAI = async () => {
    setAiLoading(true);
    setAiData(null);
    try {
      const res = await fetch(`/api/ai/${config.aiFeature}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.error) {
        setAiData({ response: `Error: ${data.error}`, timestamp: new Date().toISOString() });
      } else {
        setAiData(data);
      }
    } catch (err) {
      setAiData({ response: `Error: ${err.message}`, timestamp: new Date().toISOString() });
    } finally {
      setAiLoading(false);
    }
  };

  const formatCellValue = (value, key) => {
    if (value === null || value === undefined) return '-';
    if (key === 'amount' || key === 'price' || key === 'budget') {
      return `$${Number(value).toFixed(2)}`;
    }
    if (key === 'rating') {
      return '★'.repeat(Number(value)) + '☆'.repeat(5 - Number(value));
    }
    if (key === 'hex_code' && value) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: value,
              border: '1px solid #ddd',
              display: 'inline-block',
            }}
          ></span>
          {value}
        </span>
      );
    }
    if (key.includes('date') || key === 'published_date' || key === 'event_date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }
    if (key === 'status') {
      const statusClass = value === 'purchased' ? 'status-success' : value === 'wishlist' ? 'status-info' : value === 'Active' ? 'status-success' : 'status-pending';
      return <span className={`status-badge ${statusClass}`}>{value}</span>;
    }
    if (key === 'priority' || key === 'importance' || key === 'popularity') {
      const prioClass = value === 'High' ? 'status-danger' : value === 'Medium' ? 'status-warning' : 'status-info';
      return <span className={`status-badge ${prioClass}`}>{value}</span>;
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return config.columns.some((col) => {
      const val = item[col.key];
      return val && String(val).toLowerCase().includes(q);
    });
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span
            className="material-icons-outlined feature-page-icon"
            style={{ color: config.color }}
          >
            {config.icon}
          </span>
          <div>
            <h1>{config.title}</h1>
            <p>{config.description}</p>
          </div>
        </div>
        <div className="feature-page-actions">
          <button className="btn btn-ai" onClick={handleAI}>
            <span className="material-icons-outlined">auto_awesome</span>
            AI Analysis
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <span className="material-icons-outlined">add</span>
            New Item
          </button>
        </div>
      </div>

      <div className="feature-page-toolbar">
        <div className="search-box">
          <span className="material-icons-outlined">search</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="item-count">{filteredItems.length} items</span>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {config.columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={selectedItem?.id === item.id ? 'row-selected' : ''}
                onClick={() => setSelectedItem(item)}
              >
                {config.columns.map((col) => (
                  <td key={col.key}>{formatCellValue(item[col.key], col.key)}</td>
                ))}
                <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleEdit(item)} title="Edit">
                    <span className="material-icons-outlined">edit</span>
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                  >
                    <span className="material-icons-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={config.columns.length + 1} className="empty-table">
                  <span className="material-icons-outlined">inbox</span>
                  <p>No items found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <div className="detail-overlay" onClick={() => setSelectedItem(null)}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h2>Item Details</h2>
              <button className="btn-close" onClick={() => setSelectedItem(null)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="detail-body">
              {config.fields.map((field) => (
                <div key={field.key} className="detail-field">
                  <label>{field.label}</label>
                  <div className="detail-value">
                    {field.key === 'hex_code' && selectedItem[field.key] ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: selectedItem[field.key],
                            border: '1px solid #ddd',
                            display: 'inline-block',
                          }}
                        ></span>
                        {selectedItem[field.key]}
                      </span>
                    ) : field.key === 'rating' && selectedItem[field.key] ? (
                      '★'.repeat(Number(selectedItem[field.key])) +
                      '☆'.repeat(5 - Number(selectedItem[field.key]))
                    ) : (
                      selectedItem[field.key] || '-'
                    )}
                  </div>
                </div>
              ))}
              <div className="detail-field">
                <label>Created</label>
                <div className="detail-value">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => handleEdit(selectedItem)}>
                <span className="material-icons-outlined">edit</span>
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(selectedItem.id)}
              >
                <span className="material-icons-outlined">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="detail-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h2>{editItem ? 'Edit Item' : 'New Item'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="form-body">
              {config.fields.map((field) => (
                <div key={field.key} className="form-group">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                <span className="material-icons-outlined">save</span>
                {editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Output */}
      {(aiLoading || aiData) && (
        <AIOutput data={aiData} loading={aiLoading} onClose={() => { setAiData(null); setAiLoading(false); }} />
      )}
    </div>
  );
}
