import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const commonDiseases = [
  { name:'Leaf Blight', crop:'Wheat, Rice', icon:'🍂', color:'#fff3e0', border:'#ff9800', symptoms:'Brown spots on leaves, yellowing edges, wilting', cause:'Fungal — high humidity & poor drainage', treatment:'Spray Mancozeb 2g/L or Copper oxychloride. Remove affected leaves.', prevention:'Avoid overhead irrigation. Maintain plant spacing.', severity:'moderate' },
  { name:'Powdery Mildew', crop:'Wheat, Vegetables', icon:'⬜', color:'#f3e5f5', border:'#9c27b0', symptoms:'White powdery coating on leaves and stems', cause:'Fungal — dry weather with cool nights', treatment:'Spray Sulfur 2g/L or Carbendazim 1g/L water. Repeat after 10 days.', prevention:'Use resistant varieties. Avoid dense planting.', severity:'mild' },
  { name:'Bacterial Wilt', crop:'Tomato, Brinjal', icon:'🥀', color:'#fce4ec', border:'#e91e63', symptoms:'Sudden wilting of leaves, brown stems inside', cause:'Bacterial — contaminated soil & water', treatment:'No cure. Remove and destroy infected plants immediately.', prevention:'Crop rotation. Use disease-free seeds. Proper drainage.', severity:'severe' },
  { name:'Yellow Mosaic Virus', crop:'Soybean, Moong', icon:'🟡', color:'#fffde7', border:'#ffc107', symptoms:'Yellow and green mottled pattern on leaves', cause:'Viral — spread by whiteflies', treatment:'Control whiteflies with Imidacloprid 0.5ml/L. Remove infected plants.', prevention:'Use virus-resistant varieties. Control insect vectors early.', severity:'severe' },
  { name:'Root Rot', crop:'Cotton, Groundnut', icon:'🌿', color:'#e8f5e9', border:'#4caf50', symptoms:'Yellowing leaves, stunted growth, roots turn brown', cause:'Fungal — waterlogged soil, overwatering', treatment:'Drench soil with Carbendazim 1g/L. Improve drainage.', prevention:'Avoid waterlogging. Treat seeds before sowing.', severity:'moderate' },
  { name:'Aphid Attack', crop:'All crops', icon:'🐛', color:'#e3f2fd', border:'#2196f3', symptoms:'Curling leaves, sticky honeydew, stunted growth', cause:'Insect pest — spreads in dry weather', treatment:'Spray Dimethoate 2ml/L or Neem oil 5ml/L water.', prevention:'Encourage natural predators. Avoid excess nitrogen fertilizer.', severity:'mild' },
]

const directions = [
  { icon:'🎯', step:'1', text:'Go close to the affected plant leaf or stem', color:'#e8f5e9' },
  { icon:'📷', step:'2', text:'Tap the big green camera button below', color:'#e3f2fd' },
  { icon:'☀️', step:'3', text:'Ensure good lighting — avoid shadows on the leaf', color:'#fff8e1' },
  { icon:'🤖', step:'4', text:'AI identifies disease and suggests treatment instantly', color:'#f3e5f5' },
]

const sevColor = { mild:'#4caf50', moderate:'#ff9800', severe:'#f44336' }
const sevBg = { mild:'#e8f5e9', moderate:'#fff3e0', severe:'#fce4ec' }

export default function DiseasePage() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('detect')
  const [selected, setSelected] = useState(null)
  const cameraRef = useRef()
  const galleryRef = useRef()

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please select an image')
    setImage(file); setPreview(URL.createObjectURL(file)); setResult(null)
  }

  const handleDetect = async () => {
    if (!image) return toast.error('Please take a photo first')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', image)
      const { data } = await api.post('/disease/detect', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data)
      toast.success(data.isHealthy ? 'Crop looks healthy! ✅' : 'Disease identified! 🔬')
    } catch { toast.error('Detection failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7fa', paddingBottom:'90px', fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        *{box-sizing:border-box}
      `}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)', padding:'52px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', fontWeight:'800', letterSpacing:'1.5px', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'10px' }}>🔬 AI DETECTION</span>
          <h1 style={{ color:'#fff', fontSize:'26px', fontWeight:'900', marginBottom:'4px', lineHeight:1.2 }}>Crop Disease Doctor</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>Click photo → AI diagnoses instantly</p>
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* TABS */}
        <div style={{ display:'flex', gap:'8px', background:'#fff', padding:'6px', borderRadius:'16px', marginBottom:'16px', border:'1px solid #f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          {[{k:'detect',l:'📷 Detect Disease'},{k:'guide',l:'📚 Common Diseases'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{ flex:1, padding:'10px 8px', borderRadius:'12px', border:'none', cursor:'pointer', background:tab===t.k?'linear-gradient(135deg,#2e7d32,#1b5e20)':'transparent', color:tab===t.k?'#fff':'#999', fontWeight:'700', fontSize:'13px', transition:'all 0.3s', fontFamily:'inherit' }}>
              {t.l}
            </button>
          ))}
        </div>

        {tab==='detect' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            {/* DIRECTIONS */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0' }}>
              <p style={{ fontSize:'12px', color:'#2e7d32', fontWeight:'800', letterSpacing:'0.8px', marginBottom:'12px' }}>📖 FOLLOW THESE STEPS</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {directions.map((d,i)=>(
                  <div key={i} style={{ background:d.color, borderRadius:'12px', padding:'12px 10px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'6px' }}>
                    <span style={{ fontSize:'22px' }}>{d.icon}</span>
                    <span style={{ background:'#2e7d32', color:'#fff', width:'18px', height:'18px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800' }}>{d.step}</span>
                    <p style={{ fontSize:'11px', color:'#444', fontWeight:'500', lineHeight:1.4 }}>{d.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CAMERA SECTION */}
            {!preview ? (
              <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0' }}>
                {/* Big camera button */}
                <button onClick={()=>cameraRef.current?.click()} style={{ width:'100%', background:'linear-gradient(135deg,#2e7d32,#1b5e20)', border:'none', borderRadius:'20px', padding:'36px 20px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', boxShadow:'0 8px 28px rgba(46,125,50,0.45)', transition:'transform 0.2s', marginBottom:'12px', animation:'pulse 3s ease-in-out infinite', fontFamily:'inherit' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px' }}>📷</div>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ color:'#fff', fontWeight:'900', fontSize:'20px', marginBottom:'6px' }}>Click to Take Photo</p>
                    <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px' }}>Point camera at infected leaf or crop</p>
                  </div>
                </button>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />

                <button onClick={()=>galleryRef.current?.click()} style={{ width:'100%', background:'#f5f5f5', border:'2px dashed #ddd', borderRadius:'14px', padding:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontFamily:'inherit', transition:'all 0.3s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#4caf50';e.currentTarget.style.background='#f1f8e9'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#ddd';e.currentTarget.style.background='#f5f5f5'}}>
                  <span style={{ fontSize:'20px' }}>🖼️</span>
                  <span style={{ fontSize:'13px', fontWeight:'600', color:'#888' }}>Or upload from gallery</span>
                </button>
                <input ref={galleryRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div style={{ background:'#fff', borderRadius:'20px', overflow:'hidden', marginBottom:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
                <div style={{ position:'relative' }}>
                  <img src={preview} alt="Crop" style={{ width:'100%', maxHeight:'260px', objectFit:'cover', display:'block' }} />
                  <button onClick={()=>{setImage(null);setPreview('');setResult(null)}} style={{ position:'absolute', top:'12px', right:'12px', width:'32px', height:'32px', borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', color:'#fff', fontSize:'15px', cursor:'pointer' }}>✕</button>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,0.6))', padding:'20px 16px 12px' }}>
                    <p style={{ color:'#fff', fontSize:'12px', fontWeight:'700' }}>✅ Photo captured — tap Detect Disease below</p>
                  </div>
                </div>
                <div style={{ padding:'14px 16px', display:'flex', gap:'10px' }}>
                  <button onClick={()=>cameraRef.current?.click()} style={{ flex:1, background:'#f5f5f5', border:'none', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:'600', color:'#666', cursor:'pointer', fontFamily:'inherit' }}>📷 Retake</button>
                  <button onClick={()=>galleryRef.current?.click()} style={{ flex:1, background:'#f5f5f5', border:'none', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:'600', color:'#666', cursor:'pointer', fontFamily:'inherit' }}>🖼️ Gallery</button>
                </div>
              </div>
            )}

            {preview && (
              <button onClick={handleDetect} disabled={loading} style={{ width:'100%', padding:'17px', borderRadius:'16px', border:'none', background:'linear-gradient(135deg,#2e7d32,#1b5e20)', color:'#fff', fontSize:'16px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 6px 20px rgba(46,125,50,0.4)', marginBottom:'16px' }}>
                {loading ? <><div style={{ width:'20px', height:'20px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> AI Analyzing Crop...</> : '🔬 Detect Disease Now'}
              </button>
            )}

            {/* RESULT */}
            {result && (
              <div style={{ animation:'fadeUp 0.5s ease' }}>
                {/* Status card */}
                <div style={{ borderRadius:'20px', padding:'20px', marginBottom:'14px', background:result.isHealthy?'linear-gradient(135deg,#e8f5e9,#f1f8e9)':'linear-gradient(135deg,#fce4ec,#fff3e0)', border:`2px solid ${result.isHealthy?'#4caf5040':'#e91e6340'}`, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'14px' }}>
                    <div style={{ width:'56px', height:'56px', borderRadius:'18px', background:result.isHealthy?'linear-gradient(135deg,#4caf50,#2e7d32)':'linear-gradient(135deg,#f44336,#c62828)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', boxShadow:`0 4px 14px ${result.isHealthy?'rgba(76,175,80,0.5)':'rgba(244,67,54,0.5)'}` }}>
                      {result.isHealthy?'✅':'🦠'}
                    </div>
                    <div style={{ flex:1 }}>
                      <h2 style={{ fontSize:'18px', fontWeight:'900', color:'#1a1a1a', marginBottom:'3px' }}>{result.diseaseName}</h2>
                      <p style={{ fontSize:'13px', color:result.isHealthy?'#2e7d32':'#c62828', fontWeight:'700' }}>
                        {result.isHealthy?'🎉 Your crop is healthy!':'⚠️ Disease detected — act now'}
                      </p>
                    </div>
                  </div>
                  {/* Confidence bar */}
                  <div style={{ marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'12px', color:'#888', fontWeight:'600' }}>AI Confidence</span>
                      <span style={{ fontSize:'13px', fontWeight:'800', color:'#2e7d32' }}>{result.confidence||85}%</span>
                    </div>
                    <div style={{ background:'rgba(0,0,0,0.08)', borderRadius:'10px', height:'8px', overflow:'hidden' }}>
                      <div style={{ width:`${result.confidence||85}%`, height:'100%', background:'linear-gradient(90deg,#4caf50,#81c784)', borderRadius:'10px', transition:'width 1.2s ease' }} />
                    </div>
                  </div>
                  {result.severity && !result.isHealthy && (
                    <span style={{ background:sevBg[result.severity]||'#fff', color:sevColor[result.severity]||'#666', padding:'5px 14px', borderRadius:'50px', fontSize:'12px', fontWeight:'800', border:`1px solid ${sevColor[result.severity]||'#ddd'}40` }}>
                      🔴 {result.severity?.toUpperCase()} SEVERITY
                    </span>
                  )}
                </div>

                {/* Symptoms */}
                {result.symptoms && (
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', marginBottom:'10px', border:'1px solid #f0f0f0', boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontWeight:'800', color:'#1a1a1a', marginBottom:'8px', fontSize:'14px' }}>🔍 Symptoms Observed</p>
                    <p style={{ fontSize:'13px', color:'#555', lineHeight:1.7 }}>{result.symptoms}</p>
                  </div>
                )}

                {/* Treatment */}
                {result.treatment?.length>0 && (
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', marginBottom:'10px', border:'1px solid #f0f0f0', boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontWeight:'800', color:'#1a1a1a', marginBottom:'12px', fontSize:'14px' }}>💊 Treatment Plan — Follow in Order</p>
                    {result.treatment.map((step,i)=>(
                      <div key={i} style={{ display:'flex', gap:'12px', marginBottom:'10px', alignItems:'flex-start' }}>
                        <div style={{ width:'26px', height:'26px', borderRadius:'8px', background:'linear-gradient(135deg,#2e7d32,#1b5e20)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', flexShrink:0, boxShadow:'0 2px 8px rgba(46,125,50,0.4)' }}>{i+1}</div>
                        <p style={{ fontSize:'13px', color:'#333', lineHeight:1.6, paddingTop:'4px' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prevention */}
                {result.prevention?.length>0 && (
                  <div style={{ background:'linear-gradient(135deg,#e8f5e9,#f1f8e9)', borderRadius:'16px', padding:'16px', marginBottom:'16px', border:'1px solid #a5d6a740' }}>
                    <p style={{ fontWeight:'800', color:'#1b5e20', marginBottom:'10px', fontSize:'14px' }}>🛡️ Prevention for Next Season</p>
                    {result.prevention.map((tip,i)=>(
                      <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'8px', alignItems:'flex-start' }}>
                        <span style={{ color:'#4caf50', fontSize:'16px', flexShrink:0 }}>✓</span>
                        <p style={{ fontSize:'13px', color:'#2e7d32', lineHeight:1.6 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={()=>{setImage(null);setPreview('');setResult(null)}} style={{ width:'100%', padding:'14px', borderRadius:'14px', border:'2px solid #4caf5040', background:'#fff', color:'#2e7d32', fontWeight:'700', fontSize:'14px', cursor:'pointer', fontFamily:'inherit' }}>
                  📷 Analyze Another Crop
                </button>
              </div>
            )}
          </div>
        )}

        {tab==='guide' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ background:'#e8f5e9', borderRadius:'14px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #a5d6a740' }}>
              <p style={{ fontSize:'13px', color:'#2e7d32', fontWeight:'700' }}>💡 Tap any disease to see symptoms, treatment and prevention</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {commonDiseases.map((d,i)=>(
                <div key={i}>
                  <button onClick={()=>setSelected(selected===i?null:i)} style={{ width:'100%', background:d.color, border:`1.5px solid ${d.border}40`, borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all 0.3s', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{d.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                        <p style={{ fontWeight:'800', color:'#1a1a1a', fontSize:'14px' }}>{d.name}</p>
                        <span style={{ background:sevBg[d.severity], color:sevColor[d.severity], fontSize:'9px', fontWeight:'800', padding:'2px 8px', borderRadius:'20px' }}>{d.severity.toUpperCase()}</span>
                      </div>
                      <p style={{ fontSize:'11px', color:'#888' }}>Affects: {d.crop}</p>
                    </div>
                    <span style={{ fontSize:'18px', color:'#bbb', transform:selected===i?'rotate(90deg)':'', transition:'transform 0.3s' }}>›</span>
                  </button>
                  {selected===i && (
                    <div style={{ background:'#fff', border:`1.5px solid ${d.border}30`, borderRadius:'0 0 16px 16px', padding:'16px', marginTop:'-6px', animation:'fadeUp 0.3s ease' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        <div style={{ background:d.color, borderRadius:'12px', padding:'12px' }}>
                          <p style={{ fontSize:'11px', color:'#666', fontWeight:'700', marginBottom:'4px' }}>🔍 SYMPTOMS</p>
                          <p style={{ fontSize:'13px', color:'#333', lineHeight:1.6 }}>{d.symptoms}</p>
                        </div>
                        <div style={{ background:'#fff3e0', borderRadius:'12px', padding:'12px' }}>
                          <p style={{ fontSize:'11px', color:'#e65100', fontWeight:'700', marginBottom:'4px' }}>⚠️ CAUSE</p>
                          <p style={{ fontSize:'13px', color:'#333', lineHeight:1.6 }}>{d.cause}</p>
                        </div>
                        <div style={{ background:'#e8f5e9', borderRadius:'12px', padding:'12px' }}>
                          <p style={{ fontSize:'11px', color:'#2e7d32', fontWeight:'700', marginBottom:'4px' }}>💊 TREATMENT</p>
                          <p style={{ fontSize:'13px', color:'#333', lineHeight:1.6 }}>{d.treatment}</p>
                        </div>
                        <div style={{ background:'#e3f2fd', borderRadius:'12px', padding:'12px' }}>
                          <p style={{ fontSize:'11px', color:'#1565c0', fontWeight:'700', marginBottom:'4px' }}>🛡️ PREVENTION</p>
                          <p style={{ fontSize:'13px', color:'#333', lineHeight:1.6 }}>{d.prevention}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
