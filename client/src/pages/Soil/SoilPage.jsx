import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const soilTypes = ['Sandy','Clay','Loamy','Silt','Peaty','Red','Black Cotton']
const seasons = ['Kharif (Jun-Sep)','Rabi (Oct-Mar)','Zaid (Mar-Jun)']

export default function SoilPage() {
  const [form, setForm] = useState({ soilType:'Loamy', ph:'6.5', nitrogen:'40', phosphorus:'30', potassium:'20', organicMatter:'2', location:'', season:'Kharif (Jun-Sep)' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('analyze')
  const [crops, setCrops] = useState([])
  const [cLoading, setCLoading] = useState(false)
  const [cForm, setCForm] = useState({ season:'Kharif', location:'Maharashtra' })

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/soil/analyze', form)
      setResult(data)
    } catch { toast.error('Analysis failed') }
    finally { setLoading(false) }
  }

  const fetchCrops = async () => {
    setCLoading(true)
    try {
      const { data } = await api.get(`/soil/crops-by-season?season=${cForm.season}&location=${cForm.location}`)
      setCrops(Array.isArray(data) ? data : [])
    } catch { toast.error('Failed') }
    finally { setCLoading(false) }
  }

  const profitColor = { high:'#2e7d32', medium:'#f57f17', low:'#c62828' }
  const profitBg = { high:'#e8f5e9', medium:'#fff8e1', low:'#fce4ec' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f9fff6,#edf7e5,#f4fbee)', paddingBottom:'90px' }}>
      <div style={{ position:'relative', zIndex:1, padding:'16px' }}>
        <div style={{ marginBottom:'20px', paddingTop:'8px' }}>
          <span className="section-tag">🌱 AI Analysis</span>
          <h1 className="page-title">Soil Analysis</h1>
          <p className="page-subtitle">Nutrients, composition & crop recommendations</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'8px', background:'rgba(255,255,255,0.8)', padding:'6px', borderRadius:'18px', marginBottom:'20px', border:'1.5px solid rgba(74,163,40,0.12)' }}>
          {[{key:'analyze',label:'🔬 Soil Analysis'},{key:'seasons',label:'🌾 Season Crops'}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex:1, padding:'10px', borderRadius:'12px', border:'none', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.3s', background:tab===t.key?'linear-gradient(135deg,#4caf50,#2e7d32)':'transparent', color:tab===t.key?'#fff':'#6a9f6a', boxShadow:tab===t.key?'0 4px 14px rgba(74,163,40,0.3)':'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'analyze' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', marginBottom:'16px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 4px 18px rgba(74,163,40,0.07)' }}>
              <div style={{ marginBottom:'14px' }}>
                <label className="label-nature">Soil Type</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {soilTypes.map(s => (
                    <button key={s} onClick={() => setForm({...form, soilType:s})}
                      style={{ padding:'7px 14px', borderRadius:'50px', border:`1.5px solid ${form.soilType===s?'#4caf50':'rgba(74,163,40,0.2)'}`, background:form.soilType===s?'linear-gradient(135deg,#4caf50,#2e7d32)':'#fff', color:form.soilType===s?'#fff':'#2e7d32', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.3s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                {[
                  { key:'ph', label:'pH Level', placeholder:'6.5' },
                  { key:'nitrogen', label:'Nitrogen (kg/ha)', placeholder:'40' },
                  { key:'phosphorus', label:'Phosphorus (kg/ha)', placeholder:'30' },
                  { key:'potassium', label:'Potassium (kg/ha)', placeholder:'20' },
                  { key:'organicMatter', label:'Organic Matter (%)', placeholder:'2' },
                  { key:'location', label:'Location', placeholder:'e.g. Pune' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label-nature" style={{ fontSize:'11px' }}>{f.label}</label>
                    <input type={f.key==='location'?'text':'number'} value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} placeholder={f.placeholder} className="input-nature" style={{ padding:'10px 12px', fontSize:'13px' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label className="label-nature">Season</label>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {seasons.map(s => (
                    <button key={s} onClick={() => setForm({...form, season:s})}
                      style={{ padding:'10px 16px', borderRadius:'12px', border:`1.5px solid ${form.season===s?'#4caf50':'rgba(74,163,40,0.2)'}`, background:form.season===s?'linear-gradient(135deg,rgba(76,175,80,0.1),rgba(46,125,50,0.08))':'#fff', color:form.season===s?'#2e7d32':'#888', fontSize:'13px', fontWeight:form.season===s?'700':'400', cursor:'pointer', transition:'all 0.3s', textAlign:'left' }}>
                      {form.season===s?'✅ ':''}{s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAnalyze} disabled={loading} className="btn-nature" style={{ width:'100%', padding:'15px', borderRadius:'14px', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                {loading ? <><div className="spinner-nature" style={{ width:'18px', height:'18px', borderWidth:'2px', borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Analyzing...</> : '🔬 Analyze Soil'}
              </button>
            </div>

            {result && (
              <div style={{ animation:'fadeUp 0.5s ease' }}>
                <div style={{ background:'linear-gradient(135deg,#e8f5e9,#f1f8e9)', border:'1.5px solid rgba(74,163,40,0.2)', borderRadius:'18px', padding:'18px', marginBottom:'12px' }}>
                  <p style={{ fontWeight:'700', color:'#1b5e20', marginBottom:'8px', fontSize:'14px' }}>📋 Soil Assessment</p>
                  <p style={{ fontSize:'13px', color:'#2e7d32', lineHeight:1.7 }}>{result.assessment}</p>
                </div>
                {result.recommendedCrops?.length > 0 && (
                  <div style={{ background:'#fff', borderRadius:'18px', padding:'18px', marginBottom:'12px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 3px 14px rgba(74,163,40,0.06)' }}>
                    <p style={{ fontWeight:'700', color:'#1b5e20', marginBottom:'12px', fontSize:'14px' }}>🌾 Recommended Crops</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {result.recommendedCrops.map((c,i) => (
                        <span key={i} style={{ background:'linear-gradient(135deg,rgba(76,175,80,0.12),rgba(46,125,50,0.08))', border:'1.5px solid rgba(74,163,40,0.25)', color:'#2e7d32', padding:'7px 16px', borderRadius:'50px', fontSize:'13px', fontWeight:'600' }}>
                          {typeof c==='object'?c.name:c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.improvements?.length > 0 && (
                  <div style={{ background:'#fff', borderRadius:'18px', padding:'18px', marginBottom:'12px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 3px 14px rgba(74,163,40,0.06)' }}>
                    <p style={{ fontWeight:'700', color:'#1b5e20', marginBottom:'10px', fontSize:'14px' }}>💡 Improvement Tips</p>
                    {result.improvements.map((tip,i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'8px', alignItems:'flex-start' }}>
                        <span style={{ color:'#4caf50', fontSize:'14px', flexShrink:0 }}>✓</span>
                        <p style={{ fontSize:'13px', color:'#444', lineHeight:1.6 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.warnings?.length > 0 && (
                  <div style={{ background:'linear-gradient(135deg,#fff8e1,#fff3e0)', borderRadius:'18px', padding:'18px', border:'1.5px solid rgba(255,152,0,0.25)' }}>
                    <p style={{ fontWeight:'700', color:'#e65100', marginBottom:'10px', fontSize:'14px' }}>⚠️ Warnings</p>
                    {result.warnings.map((w,i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'6px' }}>
                        <span style={{ color:'#ff9800' }}>!</span>
                        <p style={{ fontSize:'13px', color:'#bf360c', lineHeight:1.6 }}>{w}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'seasons' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', marginBottom:'16px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 4px 18px rgba(74,163,40,0.07)' }}>
              <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
                {['Kharif','Rabi','Zaid'].map(s => (
                  <button key={s} onClick={() => setCForm({...cForm, season:s})}
                    style={{ flex:1, padding:'10px', borderRadius:'12px', border:'none', fontSize:'13px', fontWeight:'600', cursor:'pointer', background:cForm.season===s?'linear-gradient(135deg,#4caf50,#2e7d32)':'#f5f5f5', color:cForm.season===s?'#fff':'#888', transition:'all 0.3s' }}>
                    {s}
                  </button>
                ))}
              </div>
              <input value={cForm.location} onChange={e => setCForm({...cForm, location:e.target.value})} placeholder="State / Location" className="input-nature" style={{ padding:'11px 14px', fontSize:'13px', marginBottom:'14px' }} />
              <button onClick={fetchCrops} disabled={cLoading} className="btn-nature" style={{ width:'100%', padding:'14px', borderRadius:'14px', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                {cLoading ? <><div className="spinner-nature" style={{ width:'18px', height:'18px', borderWidth:'2px', borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Loading...</> : '🌾 Find Best Crops'}
              </button>
            </div>
            {crops.map((c,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'16px', padding:'16px', marginBottom:'10px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 3px 12px rgba(74,163,40,0.06)', display:'flex', alignItems:'center', gap:'14px', animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'14px', background:'linear-gradient(135deg,#e8f5e9,#c8e6c9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>🌿</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:'700', color:'#1b5e20', fontSize:'14px', marginBottom:'2px' }}>{c.name||c}</p>
                  {c.duration && <p style={{ fontSize:'11px', color:'#aaa' }}>{c.duration} days • {c.waterNeeds||''}</p>}
                </div>
                {c.profitability && (
                  <span style={{ background:profitBg[c.profitability]||'#f5f5f5', color:profitColor[c.profitability]||'#888', padding:'5px 12px', borderRadius:'50px', fontSize:'11px', fontWeight:'700', textTransform:'uppercase' }}>
                    {c.profitability}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
