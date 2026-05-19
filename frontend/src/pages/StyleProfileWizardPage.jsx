import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SKIN_TONES = ['Fair/Light','Light/Medium','Medium','Medium/Olive','Olive/Tan','Dark','Deep'];
const STYLES = ['Classic','Minimalist','Bohemian','Streetwear','Business Professional','Romantic','Edgy/Rock','Athleisure','Preppy','Vintage/Retro'];
const LIFESTYLES = ['Urban Professional','Creative Professional','Student','Entrepreneur','Remote worker','Travel enthusiast','Fitness-focused'];

export default function StyleProfileWizardPage() {
  const { token, user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ body_measurements:{}, skin_tone:'', preferred_styles:[], lifestyle:'' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  const toggleStyle = (s) => setForm(p => ({ ...p, preferred_styles: p.preferred_styles.includes(s) ? p.preferred_styles.filter(x=>x!==s) : [...p.preferred_styles, s] }));
  const setMeasure = (k,v) => setForm(p => ({ ...p, body_measurements: {...p.body_measurements, [k]:v} }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/ai-advanced/users/${user?.id}/style-profile`, { method:'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data); setStep(4);
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };

  const profile = result?.profile;
  const parsed = profile && typeof profile === 'object' ? profile : null;

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-page-title">
          <span className="material-icons-outlined feature-page-icon" style={{color:'#8b5cf6'}}>person</span>
          <div><h1>Style Profile Wizard</h1><p>AI-powered personal style analysis with color palette</p></div>
        </div>
      </div>

      {step < 4 && (
        <div className="data-table-container" style={{padding:'16px',marginBottom:'16px'}}>
          <div style={{display:'flex',gap:'16px'}}>
            {[1,2,3].map(s=>(
              <span key={s} style={{fontSize:'13px',fontWeight:step===s?700:400,color:step>=s?'#8b5cf6':'#9ca3af'}}>
                {step>s?'✓ ':''}{s===1?'Measurements':s===2?'Styles':'Lifestyle'}
              </span>
            ))}
          </div>
        </div>
      )}

      {step===1 && (
        <div className="data-table-container" style={{padding:'24px'}}>
          <h3 style={{fontWeight:600,marginBottom:'16px'}}>Body & Appearance</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
            {[['height','Height','5\'10\" or 178cm'],['chest','Chest/Bust','38\" or 96cm'],['waist','Waist','32\" or 81cm'],['hips','Hips','40\" or 102cm'],['body_shape','Body Shape','Hourglass/Athletic/Pear']].map(([k,l,p])=>(
              <div key={k}>
                <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>{l}</label>
                <input type="text" placeholder={p} value={form.body_measurements[k]||''} onChange={e=>setMeasure(k,e.target.value)}
                  style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'8px',padding:'8px 12px',fontSize:'14px'}} />
              </div>
            ))}
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'10px'}}>Skin Tone</label>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {SKIN_TONES.map(t=>(
                <button key={t} onClick={()=>setForm({...form,skin_tone:t})}
                  style={{padding:'6px 14px',borderRadius:'20px',border:form.skin_tone===t?'2px solid #8b5cf6':'2px solid #e5e7eb',
                    background:form.skin_tone===t?'#ede9fe':'white',color:form.skin_tone===t?'#7c3aed':'#374151',fontSize:'13px',cursor:'pointer'}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={()=>setStep(2)} className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Next →</button>
        </div>
      )}

      {step===2 && (
        <div className="data-table-container" style={{padding:'24px'}}>
          <h3 style={{fontWeight:600,marginBottom:'16px'}}>Preferred Styles (select all that apply)</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px',marginBottom:'20px'}}>
            {STYLES.map(s=>(
              <button key={s} onClick={()=>toggleStyle(s)}
                style={{padding:'12px',borderRadius:'10px',border:form.preferred_styles.includes(s)?'2px solid #8b5cf6':'2px solid #e5e7eb',
                  background:form.preferred_styles.includes(s)?'#ede9fe':'white',color:form.preferred_styles.includes(s)?'#7c3aed':'#374151',
                  fontSize:'12px',fontWeight:500,cursor:'pointer',textAlign:'center'}}>
                {form.preferred_styles.includes(s)?'✓ ':''}{s}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={()=>setStep(1)} className="btn btn-ghost" style={{flex:1,justifyContent:'center'}}>← Back</button>
            <button onClick={()=>setStep(3)} className="btn btn-primary" style={{flex:2,justifyContent:'center'}}>Next →</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="data-table-container" style={{padding:'24px'}}>
          <h3 style={{fontWeight:600,marginBottom:'16px'}}>Lifestyle</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
            {LIFESTYLES.map(l=>(
              <button key={l} onClick={()=>setForm({...form,lifestyle:l})}
                style={{padding:'12px 16px',borderRadius:'10px',border:form.lifestyle===l?'2px solid #8b5cf6':'2px solid #e5e7eb',
                  background:form.lifestyle===l?'#ede9fe':'white',color:form.lifestyle===l?'#7c3aed':'#374151',
                  fontSize:'13px',fontWeight:500,cursor:'pointer',textAlign:'left'}}>
                {form.lifestyle===l?'✓ ':''}{l}
              </button>
            ))}
          </div>
          {error && <div style={{color:'#dc2626',marginBottom:'12px',fontSize:'13px'}}>{error}</div>}
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={()=>setStep(2)} className="btn btn-ghost" style={{flex:1,justifyContent:'center'}}>← Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-ai" style={{flex:2,justifyContent:'center',padding:'12px'}}>
              <span className="material-icons-outlined">auto_awesome</span>
              {loading?'Building Profile...':'Generate My Style Profile'}
            </button>
          </div>
        </div>
      )}

      {step===4 && parsed && (
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div style={{background:'linear-gradient(135deg,#8b5cf6,#ec4899)',color:'white',borderRadius:'16px',padding:'28px'}}>
            <div style={{fontSize:'11px',opacity:.8,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Your Style Personality</div>
            <div style={{fontSize:'26px',fontWeight:800,marginBottom:'8px'}}>{parsed.style_personality}</div>
            <p style={{opacity:.9,lineHeight:1.6}}>{parsed.style_personality_description}</p>
          </div>

          {parsed.color_palette && (
            <div className="data-table-container" style={{padding:'20px'}}>
              <h3 style={{fontWeight:600,marginBottom:'12px'}}>Your Color Palette</h3>
              <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'12px'}}>{parsed.color_palette.rationale}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                {[['Best Colors',parsed.color_palette.best_colors,'#dcfce7','#15803d'],['Accent Colors',parsed.color_palette.accent_colors,'#fef9c3','#854d0e'],['Avoid',parsed.color_palette.colors_to_avoid,'#fee2e2','#dc2626']].map(([label,colors,bg,textCol])=>(
                  <div key={label}>
                    <div style={{fontSize:'12px',fontWeight:600,color:textCol,marginBottom:'8px'}}>{label}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                      {colors?.map((c,i)=><span key={i} style={{background:bg,color:textCol,padding:'4px 10px',borderRadius:'10px',fontSize:'12px'}}>{c}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.capsule_wardrobe_essentials?.length>0 && (
            <div className="data-table-container" style={{padding:'20px'}}>
              <h3 style={{fontWeight:600,marginBottom:'12px'}}>Capsule Wardrobe Essentials</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                {parsed.capsule_wardrobe_essentials.map((e,i)=>(
                  <span key={i} style={{background:'#ede9fe',color:'#7c3aed',padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:500}}>{e}</span>
                ))}
              </div>
            </div>
          )}

          {parsed.shopping_strategy && (
            <div className="data-table-container" style={{padding:'20px'}}>
              <h3 style={{fontWeight:600,marginBottom:'8px'}}>Shopping Strategy</h3>
              <p style={{fontSize:'13px',color:'#374151'}}>{parsed.shopping_strategy}</p>
            </div>
          )}

          <button onClick={()=>{setStep(1);setResult(null);}} className="btn btn-ghost" style={{alignSelf:'center'}}>Start Over</button>
        </div>
      )}
    </div>
  );
}
