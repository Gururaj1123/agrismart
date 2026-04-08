import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const commonFertilizers = [
  { name:'DAP', full:'Di-Ammonium Phosphate', npk:'18-46-0', icon:'🟤', color:'#fff3e0', border:'#ff9800', use:'Best for base dose before sowing. Promotes root development.', dose:'50 kg/acre' },
  { name:'Urea', full:'Urea', npk:'46-0-0', icon:'⚪', color:'#e3f2fd', border:'#2196f3', use:'Top dressing for nitrogen boost. Apply after first irrigation.', dose:'25-50 kg/acre' },
  { name:'MOP', full:'Muriate of Potash', npk:'0-0-60', icon:'🔴', color:'#fce4ec', border:'#e91e63', use:'Improves fruit quality and disease resistance.', dose:'20-30 kg/acre' },
  { name:'SSP', full:'Single Super Phosphate', npk:'0-16-0', icon:'🟡', color:'#f9fbe7', border:'#cddc39', use:'Provides phosphorus and sulfur. Good for oilseed crops.', dose:'50-75 kg/acre' },
  { name:'NPK 12:32:16', full:'Complex Fertilizer', npk:'12-32-16', icon:'🟢', color:'#e8f5e9', border:'#4caf50', use:'Balanced nutrition. Ideal for vegetables and cash crops.', dose:'50 kg/acre' },
  { name:'Zinc Sulphate', full:'Zinc Sulphate', npk:'Zn 21%', icon:'🔵', color:'#e8eaf6', border:'#3f51b5', use:'Corrects zinc deficiency. Improves grain filling in wheat & rice.', dose:'5-10 kg/acre' },
]

const directions = [
  { icon:'📷', step:'1', text:'Point camera at fertilizer bag label or product', color:'#e3f2fd' },
  { icon:'🤖', step:'2', text:'AI reads the fertilizer name, NPK ratio and composition', color:'#f3e5f5' },
  { icon:'📊', step:'3', text:'Get exact dosage based on your crop and field size', color:'#e8f5e9' },
  { icon:'✅', step:'4', text:'Follow the application method and timing shown', color:'#fff8e1' },
]

export default function FertilizerPage() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [form, setForm] = useState({ cropType:'', fieldSize:'1', soilType:'Loamy' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('camera')
  const [selected, setSelected] = useState(null)
  const cameraRef = useRef()
  const galleryRef = useRef()

  // VOICE ASSISTANT FUNCTION
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Natural pace
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please select an image')
    setImage(file); setPreview(URL.createObjectURL(file)); setResult(null)
  }

  const handleAnalyze = async () => {
    if (!image) return toast.error('Please take or upload a photo first')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', image)
      fd.append('cropType', form.cropType)
      fd.append('fieldSize', form.fieldSize)
      fd.append('soilType', form.soilType)
      const { data } = await api.post('/fertilizer/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data)
      toast.success('Analysis complete! 🌱')

      // Trigger Voice Voice Response
      const intro = `Analysis complete. This is ${data.fertilizerName}. `;
      const dosage = data.quantityPerAcre ? `The recommended dosage for your ${form.fieldSize} acre ${form.cropType || 'field'} is ${data.quantityPerAcre}. ` : "";
      const method = data.applicationMethod ? `Application method: ${data.applicationMethod}` : "";
      speak(intro + dosage + method);

    } catch { toast.error('Analysis failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7fa', paddingBottom:'90px', fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
      `}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#e65100,#f57c00,#ff9800)', padding:'52px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
        <div style={{ position:'absolute', bottom:'-20px', left:'20%', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', fontWeight:'800', letterSpacing:'1.5px', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'10px' }}>💊 SMART SCAN</span>
          <h1 style={{ color:'#fff', fontSize:'26px', fontWeight:'900', marginBottom:'4px', lineHeight:1.2 }}>Fertilizer Advisor</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>Scan bag → Get exact dosage for your crop</p>
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* HOW TO USE directions */}
        <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0' }}>
          <p style={{ fontSize:'12px', color:'#ff9800', fontWeight:'800', letterSpacing:'0.8px', marginBottom:'12px' }}>📖 HOW TO USE</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {directions.map((d,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', background:d.color, borderRadius:'12px', padding:'10px 14px' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(0,0,0,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>{d.icon}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flex:1 }}>
                  <span style={{ background:'#ff9800', color:'#fff', width:'18px', height:'18px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800', flexShrink:0 }}>{d.step}</span>
                  <p style={{ fontSize:'13px', color:'#333', fontWeight:'500' }}>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:'8px', background:'#fff', padding:'6px', borderRadius:'16px', marginBottom:'16px', border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          {[{k:'camera',l:'📷 Take Photo',sub:'Use Camera'},{k:'info',l:'📚 Common Types',sub:'Quick Reference'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{ flex:1, padding:'10px 8px', borderRadius:'12px', border:'none', cursor:'pointer', background:tab===t.k?'linear-gradient(135deg,#ff9800,#e65100)':'transparent', color:tab===t.k?'#fff':'#999', fontWeight:'700', fontSize:'13px', transition:'all 0.3s', fontFamily:'inherit' }}>
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'camera' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            {/* CAMERA CAPTURE */}
            <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0' }}>
              <p style={{ fontSize:'13px', color:'#ff9800', fontWeight:'800', letterSpacing:'0.8px', marginBottom:'14px' }}>📷 CAPTURE FERTILIZER BAG</p>

              {!preview ? (
                <div>
                  <button onClick={()=>cameraRef.current?.click()} style={{ width:'100%', background:'linear-gradient(135deg,#ff9800,#e65100)', border:'none', borderRadius:'16px', padding:'28px 20px', cursor:'pointer', marginBottom:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', boxShadow:'0 6px 20px rgba(255,152,0,0.4)', transition:'transform 0.2s' }}>
                    <span style={{ fontSize:'48px' }}>📷</span>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ color:'#fff', fontWeight:'800', fontSize:'18px', marginBottom:'4px' }}>Take Photo</p>
                      <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'12px' }}>Point camera at fertilizer bag label</p>
                    </div>
                  </button>
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />

                  <button onClick={()=>galleryRef.current?.click()} style={{ width:'100%', background:'#f5f5f5', border:'2px dashed #ddd', borderRadius:'14px', padding:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontFamily:'inherit' }}>
                    <span style={{ fontSize:'20px' }}>🖼️</span>
                    <span style={{ fontSize:'13px', fontWeight:'600', color:'#888' }}>Or choose from gallery</span>
                  </button>
                  <input ref={galleryRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div>
                  <div style={{ position:'relative', borderRadius:'14px', overflow:'hidden', marginBottom:'12px' }}>
                    <img src={preview} alt="Fertilizer" style={{ width:'100%', maxHeight:'220px', objectFit:'cover', display:'block' }} />
                    <button onClick={()=>{setImage(null);setPreview('');setResult(null)}} style={{ position:'absolute', top:'10px', right:'10px', width:'30px', height:'30px', borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', color:'#fff', fontSize:'14px', cursor:'pointer' }}>✕</button>
                  </div>
                  <button onClick={()=>cameraRef.current?.click()} style={{ width:'100%', background:'#f5f5f5', border:'none', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:'600', color:'#888', cursor:'pointer' }}>📷 Retake Photo</button>
                </div>
              )}
            </div>

            {/* CROP DETAILS */}
            <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0' }}>
              <p style={{ fontSize:'13px', color:'#ff9800', fontWeight:'800', letterSpacing:'0.8px', marginBottom:'14px' }}>🌾 YOUR FIELD DETAILS</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div>
                  <label style={{ fontSize:'12px', color:'#666', fontWeight:'600', display:'block', marginBottom:'6px' }}>Crop Type</label>
                  <input value={form.cropType} onChange={e=>setForm({...form,cropType:e.target.value})} placeholder="e.g. Wheat, Rice" style={{ width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid #eee', fontSize:'13px', outline:'none', background:'#fafafa' }} />
                </div>
                <div>
                  <label style={{ fontSize:'12px', color:'#666', fontWeight:'600', display:'block', marginBottom:'6px' }}>Field Size (acres)</label>
                  <input type="number" value={form.fieldSize} onChange={e=>setForm({...form,fieldSize:e.target.value})} placeholder="1" style={{ width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid #eee', fontSize:'13px', outline:'none', background:'#fafafa' }} />
                </div>
              </div>
            </div>

            {/* ANALYZE BUTTON */}
            <button onClick={handleAnalyze} disabled={loading||!image} style={{ width:'100%', padding:'17px', borderRadius:'16px', border:'none', background: !image?'#eee':'linear-gradient(135deg,#ff9800,#e65100)', color:!image?'#aaa':'#fff', fontSize:'16px', fontWeight:'800', cursor:!image?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:!image?'none':'0 6px 20px rgba(255,152,0,0.4)', marginBottom:'16px' }}>
              {loading ? <div style={{ width:'20px', height:'20px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> : '🔬 Analyze Fertilizer with AI'}
            </button>

            {/* RESULT */}
            {result && (
              <div style={{ animation:'fadeUp 0.5s ease' }}>
                <div style={{ background:'linear-gradient(135deg,#fff3e0,#fff8f0)', border:'2px solid #ff980040', borderRadius:'20px', padding:'20px', marginBottom:'14px', boxShadow:'0 4px 20px rgba(255,152,0,0.12)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                       <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'linear-gradient(135deg,#ff9800,#e65100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>💊</div>
                       <div>
                         <h2 style={{ fontSize:'18px', fontWeight:'900', color:'#1a1a1a', marginBottom:'2px' }}>{result.fertilizerName}</h2>
                         {result.npkComposition && <p style={{ fontSize:'13px', color:'#ff9800', fontWeight:'700' }}>NPK: {result.npkComposition}</p>}
                       </div>
                    </div>
                    {/* Manual Voice Button */}
                    <button 
                      onClick={() => speak(`${result.fertilizerName}. Recommended dosage is ${result.quantityPerAcre}`)}
                      style={{ background:'#fff', border:'none', borderRadius:'50%', width:'44px', height:'44px', fontSize:'20px', cursor:'pointer', boxShadow:'0 3px 10px rgba(0,0,0,0.1)' }}
                    >🔊</button>
                  </div>
                  {result.quantityPerAcre && (
                    <div style={{ background:'#fff', borderRadius:'14px', padding:'14px 16px', border:'1px solid #ff980030' }}>
                      <p style={{ fontSize:'10px', color:'#999', fontWeight:'700', letterSpacing:'0.8px', marginBottom:'4px' }}>RECOMMENDED DOSAGE</p>
                      <p style={{ fontSize:'28px', fontWeight:'900', color:'#e65100', marginBottom:'2px' }}>{result.quantityPerAcre}</p>
                      <p style={{ fontSize:'11px', color:'#aaa' }}>for {form.fieldSize} acre — {form.cropType || 'your crop'}</p>
                    </div>
                  )}
                </div>

                {[
                  { icon:'📋', label:'How to Apply', content:result.applicationMethod },
                  { icon:'⏰', label:'Best Time to Apply', content:result.applicationTiming },
                ].filter(s=>s.content).map((s,i)=>(
                  <div key={i} style={{ background:'#fff', borderRadius:'16px', padding:'16px', marginBottom:'10px', border:'1px solid #f0f0f0' }}>
                    <p style={{ fontWeight:'800', color:'#1a1a1a', marginBottom:'8px', fontSize:'14px' }}>{s.icon} {s.label}</p>
                    <p style={{ fontSize:'13px', color:'#555', lineHeight:1.7 }}>{s.content}</p>
                  </div>
                ))}

                <button onClick={()=>{setImage(null);setPreview('');setResult(null)}} style={{ width:'100%', padding:'14px', borderRadius:'14px', border:'2px solid #ff980040', background:'#fff', color:'#ff9800', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
                  📷 Scan Another Fertilizer
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'info' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
             {/* Same commonFertilizers map logic as before... */}
             {commonFertilizers.map((f,i)=>(
                <div key={i} style={{ marginBottom: '10px' }}>
                  <button onClick={()=>setSelected(selected===i?null:i)} style={{ width:'100%', background:f.color, border:`1.5px solid ${f.border}40`, borderRadius:'16px', padding:'16px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{f.icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:'800', color:'#1a1a1a', fontSize:'15px' }}>{f.name}</p>
                      <p style={{ fontSize:'12px', color:'#555' }}>📦 {f.dose}</p>
                    </div>
                    {/* Speak info button */}
                    <span onClick={(e) => { e.stopPropagation(); speak(`${f.name}. ${f.use}`); }} style={{ padding: '8px', fontSize: '18px' }}>🔊</span>
                  </button>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}