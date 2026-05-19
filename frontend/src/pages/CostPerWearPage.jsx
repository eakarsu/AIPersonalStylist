import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CostPerWearPage() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async (p=1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-advanced/cost-per-wear?page=${p}&limit=20`, { headers });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data || []);
      setPagination(json.pagination);
      if (json.insights) setInsights(typeof json.insights==='object'?json.insights:null);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchData(page); }, [page]);

  const cpwColor = (cpw) => {
    if (cpw <= 5) return '#dcfce7';
    if (cpw <= 20) return '#fef9c3';
    if (cpw <= 50) return '#ffedd5';
    return '#fee2e2';
  };

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{color:'#22c55e'}}>account_balance_wallet</span>
          <div><h1>Cost Per Wear</h1><p>Track the true value of your wardrobe investments</p></div>
        </div>
      </div>

      {loading && <div style={{padding:'40px',textAlign:'center',color:'#9ca3af'}}>Loading...</div>}

      {!loading && data.length === 0 && (
        <div className="data-table-container" style={{padding:'40px',textAlign:'center'}}>
          <span className="material-icons-outlined" style={{fontSize:'48px',color:'#d1d5db'}}>price_tag</span>
          <p style={{color:'#6b7280',marginTop:'12px'}}>No wardrobe items with purchase prices yet.</p>
          <p style={{color:'#9ca3af',fontSize:'13px',marginTop:'4px'}}>Add purchase_price and times_worn to wardrobe items to track value.</p>
        </div>
      )}

      {insights && (
        <div style={{background:'linear-gradient(135deg,#059669,#0ea5e9)',color:'white',borderRadius:'16px',padding:'24px',marginBottom:'20px'}}>
          <h3 style={{fontWeight:700,marginBottom:'8px'}}>AI Value Insights</h3>
          <p style={{opacity:.9,fontSize:'14px',lineHeight:1.6,marginBottom:'12px'}}>{insights.summary}</p>
          {insights.key_insights?.length>0 && (
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {insights.key_insights.map((ins,i)=>(
                <div key={i} style={{display:'flex',gap:'8px',fontSize:'13px',opacity:.9}}>
                  <span style={{flexShrink:0}}>→</span>{ins}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          <div className="data-table-container">
            <div style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr',gap:'12px',fontSize:'12px',fontWeight:600,color:'#6b7280',textTransform:'uppercase'}}>
              <span>Item</span><span>Category</span><span>Brand</span><span>Purchase Price</span><span>Times Worn</span><span>Cost Per Wear</span>
            </div>
            {data.map(item=>(
              <div key={item.id} style={{padding:'12px 16px',borderBottom:'1px solid #f9fafb',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr',gap:'12px',alignItems:'center'}}>
                <span style={{fontWeight:500,fontSize:'14px'}}>{item.name}</span>
                <span style={{fontSize:'13px',color:'#6b7280'}}>{item.category||'-'}</span>
                <span style={{fontSize:'13px',color:'#6b7280'}}>{item.brand||'-'}</span>
                <span style={{fontSize:'13px'}}>${Number(item.purchase_price).toFixed(2)}</span>
                <span style={{fontSize:'13px'}}>{item.times_worn||0}x</span>
                <span style={{fontWeight:700,fontSize:'14px',background:cpwColor(Number(item.cost_per_wear)),borderRadius:'6px',padding:'4px 10px',textAlign:'center'}}>
                  ${Number(item.cost_per_wear).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'16px'}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn btn-ghost">Prev</button>
              <span style={{padding:'8px 16px',fontSize:'14px',color:'#6b7280'}}>Page {page} of {pagination.totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(pagination.totalPages,p+1))} disabled={page===pagination.totalPages} className="btn btn-ghost">Next</button>
            </div>
          )}

          <div style={{display:'flex',gap:'12px',marginTop:'16px'}}>
            <div style={{flex:1,background:'#f0fdf4',borderRadius:'12px',padding:'16px',textAlign:'center',border:'1px solid #bbf7d0'}}>
              <div style={{fontSize:'11px',color:'#15803d',fontWeight:600,textTransform:'uppercase'}}>Best Value</div>
              <div style={{fontWeight:700,fontSize:'15px',marginTop:'4px'}}>{data[0]?.name}</div>
              <div style={{color:'#16a34a',fontSize:'13px'}}>${Number(data[0]?.cost_per_wear||0).toFixed(2)}/wear</div>
            </div>
            <div style={{flex:1,background:'#fef2f2',borderRadius:'12px',padding:'16px',textAlign:'center',border:'1px solid #fecaca'}}>
              <div style={{fontSize:'11px',color:'#dc2626',fontWeight:600,textTransform:'uppercase'}}>Needs More Wear</div>
              <div style={{fontWeight:700,fontSize:'15px',marginTop:'4px'}}>{data[data.length-1]?.name}</div>
              <div style={{color:'#dc2626',fontSize:'13px'}}>${Number(data[data.length-1]?.cost_per_wear||0).toFixed(2)}/wear</div>
            </div>
            <div style={{flex:1,background:'#eff6ff',borderRadius:'12px',padding:'16px',textAlign:'center',border:'1px solid #bfdbfe'}}>
              <div style={{fontSize:'11px',color:'#1d4ed8',fontWeight:600,textTransform:'uppercase'}}>Total Items Tracked</div>
              <div style={{fontWeight:700,fontSize:'28px',marginTop:'4px',color:'#1d4ed8'}}>{pagination?.total||data.length}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
