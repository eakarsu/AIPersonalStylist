import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function WardrobePhotoPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/wardrobe', { headers })
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadResult(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !selectedItem) { setError('Please select both a wardrobe item and a photo'); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`/api/wardrobe/${selectedItem}/upload-photo`, { method:'POST', headers, body:fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      setUploadResult(data);
    } catch(err) { setError(err.message); } finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    if (!selectedItem) { setError('Please select a wardrobe item'); return; }
    setAnalyzing(true); setError(null);
    try {
      const res = await fetch(`/api/wardrobe/${selectedItem}/analyze-photo`, { method:'POST', headers: {...headers, 'Content-Type':'application/json'}, body:'{}' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysisResult(data);
    } catch(err) { setError(err.message); } finally { setAnalyzing(false); }
  };

  const analysis = analysisResult?.analysis;

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{color:'#6366f1'}}>photo_camera</span>
          <div><h1>Wardrobe Photo & Vision Analysis</h1><p>Upload photos and get AI-powered clothing analysis</p></div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        {/* Upload panel */}
        <div className="data-table-container" style={{padding:'24px'}}>
          <h3 style={{fontWeight:600,marginBottom:'16px'}}>Upload Photo</h3>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Select Wardrobe Item *</label>
            <select value={selectedItem} onChange={e=>{setSelectedItem(e.target.value);setAnalysisResult(null);setUploadResult(null);}}
              style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'8px 12px',fontSize:'14px'}}>
              <option value="">Choose item...</option>
              {items.map(item=><option key={item.id} value={item.id}>{item.name} ({item.category||'?'})</option>)}
            </select>
          </div>

          <div
            onClick={()=>fileRef.current?.click()}
            style={{border:'2px dashed #c7d2fe',borderRadius:'12px',padding:'32px',textAlign:'center',cursor:'pointer',background:'#f5f3ff',marginBottom:'16px',transition:'all .2s'}}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{maxHeight:'200px',maxWidth:'100%',borderRadius:'8px',objectFit:'cover'}} />
            ) : (
              <>
                <span className="material-icons-outlined" style={{fontSize:'48px',color:'#a5b4fc',display:'block',marginBottom:'8px'}}>cloud_upload</span>
                <p style={{fontSize:'14px',color:'#6366f1',fontWeight:500}}>Click to upload a photo</p>
                <p style={{fontSize:'12px',color:'#9ca3af',marginTop:'4px'}}>JPEG, PNG, WebP up to 10MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />

          {error && <div style={{color:'#dc2626',fontSize:'13px',marginBottom:'12px'}}>{error}</div>}

          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={handleUpload} disabled={!file||!selectedItem||uploading} className="btn btn-primary" style={{flex:1,justifyContent:'center'}}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button onClick={handleAnalyze} disabled={!selectedItem||analyzing} className="btn btn-ai" style={{flex:1,justifyContent:'center'}}>
              <span className="material-icons-outlined">auto_awesome</span>
              {analyzing ? 'Analyzing...' : 'Vision Analyze'}
            </button>
          </div>

          {uploadResult && (
            <div style={{marginTop:'12px',background:'#f0fdf4',borderRadius:'8px',padding:'12px',fontSize:'13px',color:'#15803d'}}>
              ✓ Photo uploaded successfully. Click "Vision Analyze" to analyze it.
            </div>
          )}
        </div>

        {/* Analysis results */}
        <div>
          {analysis ? (
            <div className="data-table-container" style={{padding:'24px'}}>
              <h3 style={{fontWeight:600,marginBottom:'16px'}}>Vision Analysis Results</h3>

              {analysisResult?.item?.image_url && (
                <div style={{marginBottom:'16px',textAlign:'center'}}>
                  <img src={analysisResult.item.image_url} alt="Item" style={{maxHeight:'160px',borderRadius:'10px',objectFit:'cover'}} />
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {[
                  ['Category', analysis.category],
                  ['Color', analysis.color],
                  ['Style', analysis.style],
                  ['Season', analysis.season],
                  ['Pattern', analysis.pattern],
                  ['Material', analysis.material_estimate],
                  ['Condition', analysis.condition],
                  ['Formality', analysis.formality],
                ].map(([label, value]) => value && (
                  <div key={label} style={{background:'#f9fafb',borderRadius:'8px',padding:'10px',border:'1px solid #e5e7eb'}}>
                    <div style={{fontSize:'11px',fontWeight:600,color:'#6b7280',textTransform:'uppercase',marginBottom:'2px'}}>{label}</div>
                    <div style={{fontSize:'14px',fontWeight:500,color:'#111827',textTransform:'capitalize'}}>{value}</div>
                  </div>
                ))}
              </div>

              {analysis.occasions && (
                <div style={{marginTop:'12px',background:'#eff6ff',borderRadius:'8px',padding:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#1d4ed8',marginBottom:'4px'}}>OCCASIONS</div>
                  <div style={{fontSize:'13px',color:'#374151'}}>{analysis.occasions}</div>
                </div>
              )}

              {analysis.care_instructions && (
                <div style={{marginTop:'10px',background:'#f0fdf4',borderRadius:'8px',padding:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#15803d',marginBottom:'4px'}}>CARE INSTRUCTIONS</div>
                  <div style={{fontSize:'13px',color:'#374151'}}>{analysis.care_instructions}</div>
                </div>
              )}

              {analysis.styling_tips && (
                <div style={{marginTop:'10px',background:'#fdf4ff',borderRadius:'8px',padding:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#7c3aed',marginBottom:'4px'}}>💡 STYLING TIP</div>
                  <div style={{fontSize:'13px',color:'#374151'}}>{analysis.styling_tips}</div>
                </div>
              )}

              {analysis.suggested_tags?.length>0 && (
                <div style={{marginTop:'12px',display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {analysis.suggested_tags.map((tag,i)=>(
                    <span key={i} style={{background:'#e0e7ff',color:'#4338ca',padding:'4px 10px',borderRadius:'12px',fontSize:'12px'}}>{tag}</span>
                  ))}
                </div>
              )}

              <div style={{marginTop:'12px',fontSize:'12px',color:'#16a34a',fontWeight:500}}>✓ Item automatically updated with detected attributes</div>
            </div>
          ) : (
            <div className="data-table-container" style={{padding:'24px',textAlign:'center',color:'#9ca3af'}}>
              <span className="material-icons-outlined" style={{fontSize:'64px',display:'block',marginBottom:'12px',color:'#e5e7eb'}}>image_search</span>
              <p style={{fontWeight:500}}>Upload a photo and click Vision Analyze</p>
              <p style={{fontSize:'13px',marginTop:'4px'}}>AI will detect color, style, category, occasions, and care instructions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
