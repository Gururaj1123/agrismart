import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { T } from '../utils/lang'

const getModules = () => [
  { path:'/weather', icon:'🌦', label:T('weather'), desc:T('weatherDesc'), bg:'#F0F9FF', accent:'#0EA5E9' },
  { path:'/soil', icon:'🌱', label:T('soil'), desc:T('soilDesc'), bg:'#F0FDF4', accent:'#22C55E' },
  { path:'/fertilizer', icon:'💊', label:T('fertilizer'), desc:T('fertilizerDesc'), bg:'#FFFBEB', accent:'#F59E0B' },
  { path:'/community', icon:'👥', label:T('community'), desc:T('communityDesc'), bg:'#FAF5FF', accent:'#A855F7' },
  { path:'/market', icon:'📊', label:T('market'), desc:T('marketDesc'), bg:'#F0FDFA', accent:'#14B8A6' },
]

const getSchemes = () => [
  { name:'PM-KISAN', emoji:'🏦', desc:'₹6,000/year to your bank', color:'#F0FDF4', accent:'#16A34A', link:'https://pmkisan.gov.in' },
  { name:'Fasal Bima', emoji:'🛡️', desc:'Free crop insurance', color:'#EFF6FF', accent:'#2563EB', link:'https://pmfby.gov.in' },
  { name:'Kisan Credit', emoji:'💳', desc:'Low interest farm loans', color:'#FFFBEB', accent:'#D97706', link:'https://www.nabard.org' },
  { name:'e-NAM Portal', emoji:'🏪', desc:'Sell crops at best price', color:'#F0FDFA', accent:'#0D9488', link:'https://www.enam.gov.in' },
]

const testimonials = [
  { name:'Ramesh Patil', loc:'Pune, Maharashtra', crop:'Wheat & Onion', text:'Detected leaf blight early — saved ₹2.5L harvest!', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' },
  { name:'Suresh Kumar', loc:'Ludhiana, Punjab', crop:'Rice & Cotton', text:'Sold cotton at right time — got ₹800 more per quintal.', avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&q=80' },
  { name:'Lakshmi Devi', loc:'Warangal, Telangana', crop:'Paddy & Chili', text:'Weather alerts saved paddy crop during unexpected rains.', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
]

const quotes = [
  { text:'The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale.', author:'John F. Kennedy' },
  { text:'Agriculture is the foundation of all civilization and any stable economy.', author:'Allan Savory' },
  { text:'To forget how to dig the earth and to tend the soil is to forget ourselves.', author:'Mahatma Gandhi' },
]

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [time, setTime] = useState('')
  const [showSplash, setShowSplash] = useState(!sessionStorage.getItem('splashSeen'))
  const [splashOut, setSplashOut] = useState(false)
  const [tip, setTip] = useState(0)
  const [quickPreview, setQuickPreview] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickResult, setQuickResult] = useState(null)
  const cameraRef = useRef()
  const quote = quotes[0]

  const tips = [T('tip1'), T('tip2'), T('tip3'), T('tip4'), T('tip5')]
  const modules = getModules()
  const schemes = getSchemes()

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})), 1000)
    const t2 = setInterval(() => setTip(p => (p+1) % 5), 5000)
    if (showSplash) {
      setTimeout(() => setSplashOut(true), 2800)
      setTimeout(() => { setShowSplash(false); sessionStorage.setItem('splashSeen','1') }, 3400)
    }
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? T('goodMorning') : hour < 17 ? T('goodAfternoon') : T('goodEvening')
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'
  const firstName = user?.name?.split(' ')[0] || T('farmer')

  const handleQuickScan = async (file) => {
    if (!file) return
    setQuickPreview(URL.createObjectURL(file)); setQuickResult(null); setQuickLoading(true)
    try {
      const fd = new FormData(); fd.append('image', file)
      const { data } = await api.post('/disease/detect', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setQuickResult(data)
      toast.success(data.isHealthy ? T('healthyCrop') : T('diseaseDetected'))
    } catch { toast.error(T('error')) }
    finally { setQuickLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.04)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:0.7}100%{transform:scale(1.6);opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes tipSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* SPLASH */}
      {showSplash && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'linear-gradient(160deg,#F0FDF4,#DCFCE7,#F0FDF4)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px', animation: splashOut?'fadeOut 0.6s ease forwards':'fadeIn 0.5s ease' }}>
          <div style={{ animation:'float 3s ease-in-out infinite', marginBottom:'28px' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:'linear-gradient(135deg,#16A34A,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'38px', boxShadow:'0 12px 40px rgba(22,163,74,0.35)' }}>🌱</div>
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'#86EFAC', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'8px', animation:'fadeUp 0.6s ease 0.3s both' }}>WELCOME TO</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'40px', fontWeight:'800', color:'#14532D', marginBottom:'32px', animation:'fadeUp 0.6s ease 0.5s both' }}>AgriSmart</h1>
          <div style={{ maxWidth:'300px', textAlign:'center', animation:'fadeUp 0.6s ease 0.7s both' }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'15px', color:'#166534', lineHeight:1.8, fontStyle:'italic', marginBottom:'10px' }}>"{quote.text}"</p>
            <p style={{ fontSize:'12px', color:'#4ADE80', fontWeight:'600' }}>— {quote.author}</p>
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'48px', animation:'fadeUp 0.6s ease 1s both' }}>
            {[0,1,2].map(i => <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#22C55E', animation:`pulseRing 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
        </div>
      )}

      <div style={{ minHeight:'100vh', background:'#FAFAFA', paddingBottom:'90px', fontFamily:"'DM Sans',-apple-system,sans-serif", opacity:showSplash?0:1, transition:'opacity 0.4s ease' }}>

        {/* TOP BAR */}
        <div style={{ background:'#fff', borderBottom:'1px solid #F3F4F6', padding:'52px 20px 16px', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <button onClick={() => { logout(); navigate('/') }} style={{ display:'flex', alignItems:'center', gap:'6px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', padding:'7px 12px', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#FEE2E2'} onMouseLeave={e=>e.currentTarget.style.background='#FEF2F2'}>
              <span style={{ fontSize:'14px' }}>↩</span>
              <span style={{ fontSize:'12px', fontWeight:'600', color:'#DC2626' }}>{T('signOut')}</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'linear-gradient(135deg,#16A34A,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🌱</div>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:'800', color:'#14532D' }}>AgriSmart</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:'14px', fontWeight:'700', color:'#111', lineHeight:1 }}>{time}</p>
              <p style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'2px' }}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</p>
            </div>
          </div>
        </div>

        <div style={{ padding:'20px 16px 0' }}>

          {/* GREETING CARD */}
          <div style={{ borderRadius:'24px', overflow:'hidden', marginBottom:'20px', position:'relative', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', animation:'fadeUp 0.5s ease 0.1s both' }}>
            <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&q=80" alt="Farm" style={{ width:'100%', height:'170px', objectFit:'cover', display:'block' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(10,30,15,0.82) 0%,rgba(10,30,15,0.35) 60%,transparent 100%)' }} />
            <div style={{ position:'absolute', inset:0, padding:'22px 20px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:'500', marginBottom:'4px' }}>{greetEmoji} {greeting}</p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontSize:'24px', fontWeight:'800', lineHeight:1.2 }}>
                  {firstName} 👋
                </h2>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'12px', marginTop:'4px' }}>📍 {user?.location || 'India'}</p>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {[{v:'6',l:T('allFeatures')},{v:'5',l:T('language')},{v:'24/7',l:'Live'}].map((s,i)=>(
                  <div key={i} style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', padding:'6px 12px', textAlign:'center' }}>
                    <p style={{ color:'#fff', fontWeight:'800', fontSize:'14px', lineHeight:1 }}>{s.v}</p>
                    <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'9px', marginTop:'2px' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI TIP */}
          <div style={{ background:'#fff', borderRadius:'16px', padding:'14px 16px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'flex-start', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:'1px solid #F3F4F6', animation:'fadeUp 0.5s ease 0.15s both' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#FEF9C3,#FEF08A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>💡</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'9px', color:'#16A34A', fontWeight:'800', letterSpacing:'1px', marginBottom:'4px' }}>{T('todaysTip')}</p>
              <p key={tip} style={{ fontSize:'13px', color:'#374151', lineHeight:1.55, fontWeight:'500', animation:'tipSlide 0.4s ease' }}>{tips[tip]}</p>
            </div>
          </div>

          {/* QUICK DISEASE SCAN */}
          <div style={{ background:'#fff', borderRadius:'20px', marginBottom:'20px', overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.07)', border:'1px solid #F3F4F6', animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ background:'linear-gradient(90deg,#14532D,#16A34A)', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'10px', fontWeight:'700', letterSpacing:'1px', marginBottom:'2px' }}>⚡ {T('quickScan').toUpperCase()}</p>
                <p style={{ color:'#fff', fontWeight:'800', fontSize:'15px' }}>{T('disease')}</p>
              </div>
              <span style={{ fontSize:'28px' }}>🔬</span>
            </div>
            <div style={{ padding:'16px' }}>
              {/* 3 steps */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'16px' }}>
                {[T('step1'), T('step2'), T('step3')].map((s,i) => (
                  <div key={i} style={{ background:'#F9FAFB', borderRadius:'14px', padding:'12px 8px', textAlign:'center', border:'1px solid #F3F4F6' }}>
                    <div style={{ width:'22px', height:'22px', borderRadius:'7px', background:'#14532D', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'900', margin:'0 auto 6px' }}>{i+1}</div>
                    <div style={{ fontSize:'18px', marginBottom:'4px' }}>{['📷','🤖','💊'][i]}</div>
                    <p style={{ fontSize:'10px', color:'#6B7280', fontWeight:'600', lineHeight:1.35 }}>{s}</p>
                  </div>
                ))}
              </div>

              {!quickPreview ? (
                <button onClick={() => cameraRef.current?.click()} style={{ width:'100%', background:'#F0FDF4', border:'2px dashed #86EFAC', borderRadius:'16px', padding:'18px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', fontFamily:'inherit', transition:'all 0.25s', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#DCFCE7';e.currentTarget.style.borderColor='#22C55E'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#F0FDF4';e.currentTarget.style.borderColor='#86EFAC'}}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ position:'absolute', inset:'-8px', borderRadius:'50%', background:'rgba(34,197,94,0.2)', animation:'pulseRing 1.8s ease-out infinite' }} />
                    <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'linear-gradient(135deg,#16A34A,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', position:'relative', boxShadow:'0 6px 20px rgba(22,163,74,0.4)' }}>📷</div>
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontWeight:'800', color:'#14532D', fontSize:'15px', marginBottom:'2px' }}>{T('openCamera')}</p>
                    <p style={{ fontSize:'12px', color:'#6B7280' }}>{T('openCameraDesc')}</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:'20px', color:'#86EFAC' }}>›</span>
                </button>
              ) : (
                <div>
                  <div style={{ position:'relative', borderRadius:'14px', overflow:'hidden', marginBottom:'10px' }}>
                    <img src={quickPreview} alt="Scan" style={{ width:'100%', height:'160px', objectFit:'cover', display:'block' }} />
                    {quickLoading && (
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', border:'3px solid rgba(255,255,255,0.2)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                        <p style={{ color:'#fff', fontSize:'13px', fontWeight:'700' }}>{T('aiAnalyzing')}</p>
                      </div>
                    )}
                    <button onClick={()=>{setQuickPreview('');setQuickResult(null)}} style={{ position:'absolute', top:'8px', right:'8px', width:'28px', height:'28px', borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'none', color:'#fff', fontSize:'13px', cursor:'pointer' }}>✕</button>
                  </div>
                  {quickResult && (
                    <div style={{ background:quickResult.isHealthy?'#F0FDF4':'#FEF2F2', borderRadius:'14px', padding:'14px', border:`1.5px solid ${quickResult.isHealthy?'#86EFAC':'#FECACA'}`, marginBottom:'10px', animation:'fadeUp 0.4s ease' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                        <span style={{ fontSize:'22px' }}>{quickResult.isHealthy?'✅':'🦠'}</span>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:'800', color:'#111', fontSize:'14px' }}>{quickResult.diseaseName}</p>
                          <p style={{ fontSize:'11px', color:quickResult.isHealthy?'#16A34A':'#DC2626', fontWeight:'600', marginTop:'1px' }}>{quickResult.isHealthy?T('healthyCrop'):T('diseaseDetected')}</p>
                        </div>
                        <div style={{ background:'#fff', borderRadius:'8px', padding:'4px 10px', border:'1px solid #E5E7EB' }}>
                          <p style={{ fontSize:'13px', fontWeight:'800', color:'#16A34A' }}>{quickResult.confidence||85}%</p>
                        </div>
                      </div>
                      {quickResult.treatment?.[0] && (
                        <p style={{ fontSize:'12px', color:'#374151', lineHeight:1.5, background:'rgba(255,255,255,0.7)', padding:'8px 10px', borderRadius:'10px' }}>
                          💊 <strong>{T('firstAction')}:</strong> {quickResult.treatment[0]}
                        </p>
                      )}
                      <button onClick={()=>navigate('/disease')} style={{ width:'100%', marginTop:'10px', padding:'10px', borderRadius:'11px', border:'none', background:'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>
                        {T('seeFullReport')}
                      </button>
                    </div>
                  )}
                  {!quickLoading && !quickResult && (
                    <button onClick={()=>cameraRef.current?.click()} style={{ width:'100%', padding:'11px', borderRadius:'12px', border:'1px solid #E5E7EB', background:'#F9FAFB', color:'#6B7280', fontWeight:'600', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>{T('retake')}</button>
                  )}
                </div>
              )}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e=>handleQuickScan(e.target.files[0])} />
            </div>
          </div>

          {/* MODULE GRID */}
          <p style={{ fontSize:'11px', color:'#9CA3AF', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'12px' }}>{T('allFeatures')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px', marginBottom:'24px' }}>
            <button onClick={()=>navigate('/disease')} style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,#14532D,#16A34A)', border:'none', borderRadius:'18px', padding:'16px 20px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 4px 20px rgba(22,163,74,0.3)', fontFamily:'inherit', transition:'transform 0.2s', animation:'fadeUp 0.5s ease 0.25s both' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>🔬</div>
              <div style={{ flex:1 }}>
                <p style={{ color:'#fff', fontWeight:'800', fontSize:'16px', marginBottom:'2px' }}>{T('disease')}</p>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'12px' }}>{T('diseaseDesc')} • {T('openCamera')}</p>
              </div>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'18px', flexShrink:0 }}>›</div>
            </button>
            {modules.map((mod,i) => (
              <button key={mod.path} onClick={()=>navigate(mod.path)} style={{ background:'#fff', border:'1.5px solid #F3F4F6', borderRadius:'18px', padding:'16px', textAlign:'left', cursor:'pointer', transition:'all 0.25s', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', animation:`fadeUp 0.5s ease ${0.3+i*0.05}s both`, fontFamily:'inherit' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.09)';e.currentTarget.style.borderColor=mod.accent}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 8px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor='#F3F4F6'}}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:mod.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', marginBottom:'10px', border:`1px solid ${mod.accent}30` }}>{mod.icon}</div>
                <p style={{ fontWeight:'700', color:'#111', fontSize:'14px', marginBottom:'2px' }}>{mod.label}</p>
                <p style={{ fontSize:'11px', color:'#9CA3AF' }}>{mod.desc}</p>
              </button>
            ))}
          </div>

          {/* FARMER BANNER */}
          <div style={{ borderRadius:'20px', overflow:'hidden', marginBottom:'24px', position:'relative', height:'140px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', animation:'fadeUp 0.5s ease 0.5s both' }}>
            <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80" alt="Farm" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(10,30,15,0.88) 0%,rgba(10,30,15,0.4) 60%,transparent 100%)' }} />
            <div style={{ position:'absolute', inset:0, padding:'18px 20px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'10px', fontWeight:'700', letterSpacing:'1px', marginBottom:'5px' }}>TRUSTED PLATFORM</p>
              <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontSize:'18px', fontWeight:'800', lineHeight:1.3 }}>{T('trustedBy')} 🌾</p>
            </div>
          </div>

          {/* LANGUAGE CHANGE */}
          <div style={{ background:'#fff', borderRadius:'16px', padding:'14px 16px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:'1px solid #F3F4F6', animation:'fadeUp 0.5s ease 0.52s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🌐</div>
              <div>
                <p style={{ fontSize:'13px', fontWeight:'700', color:'#111' }}>{T('language')}</p>
                <p style={{ fontSize:'11px', color:'#9CA3AF' }}>Current: {(localStorage.getItem('lang')||'en').toUpperCase()}</p>
              </div>
            </div>
            <button onClick={() => navigate('/select-language')} style={{ background:'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', border:'none', borderRadius:'10px', padding:'7px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit' }}>
              {T('change')}
            </button>
          </div>

          {/* GOVT SCHEMES */}
          <div style={{ marginBottom:'24px', animation:'fadeUp 0.5s ease 0.55s both' }}>
            <p style={{ fontSize:'11px', color:'#9CA3AF', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'5px' }}>{T('govtSchemes')}</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'19px', fontWeight:'800', color:'#111', marginBottom:'14px' }}>{T('benefitsForYou')} 🏛️</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {schemes.map((sc,i) => (
                <a key={i} href={sc.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                  <div style={{ background:'#fff', border:'1.5px solid #F3F4F6', borderRadius:'16px', padding:'14px', transition:'all 0.25s', boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.borderColor=sc.accent}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#F3F4F6'}}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:sc.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', marginBottom:'8px' }}>{sc.emoji}</div>
                    <p style={{ fontWeight:'800', color:'#111', fontSize:'13px', marginBottom:'3px' }}>{sc.name}</p>
                    <p style={{ fontSize:'11px', color:'#6B7280', lineHeight:1.4, marginBottom:'6px' }}>{sc.desc}</p>
                    <p style={{ fontSize:'10px', color:sc.accent, fontWeight:'700' }}>{T('applyNow')}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* TESTIMONIALS */}
          <div style={{ marginBottom:'24px', animation:'fadeUp 0.5s ease 0.6s both' }}>
            <p style={{ fontSize:'11px', color:'#9CA3AF', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'5px' }}>{T('testimonials')}</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'19px', fontWeight:'800', color:'#111', marginBottom:'14px' }}>{T('whatFarmersSay')} 🗣️</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {testimonials.map((tm,i) => (
                <div key={i} style={{ background:'#fff', borderRadius:'18px', padding:'16px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:'1px solid #F3F4F6' }}>
                  <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'12px' }}>
                    <img src={tm.avatar} alt={tm.name} style={{ width:'44px', height:'44px', borderRadius:'12px', objectFit:'cover', flexShrink:0, border:'2px solid #F0FDF4' }} onError={e=>e.target.style.display='none'} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:'700', color:'#111', fontSize:'14px' }}>{tm.name}</p>
                      <p style={{ fontSize:'11px', color:'#9CA3AF' }}>📍 {tm.loc}</p>
                      <p style={{ fontSize:'11px', color:'#16A34A', fontWeight:'600' }}>🌾 {tm.crop}</p>
                    </div>
                    <p style={{ color:'#F59E0B', fontSize:'13px', flexShrink:0 }}>★★★★★</p>
                  </div>
                  <p style={{ fontSize:'13px', color:'#4B5563', lineHeight:1.65, fontStyle:'italic', borderLeft:'3px solid #DCFCE7', paddingLeft:'12px' }}>"{tm.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* TIPS */}
          <div style={{ marginBottom:'16px', animation:'fadeUp 0.5s ease 0.65s both' }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'19px', fontWeight:'800', color:'#111', marginBottom:'14px' }}>{T('farmingTips')} 🌿</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                { img:'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80', title:T('irrigationGuide'), tag:'Water' },
                { img:'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80', title:T('organicFarming'), tag:'Soil' },
              ].map((tip,i) => (
                <div key={i} style={{ borderRadius:'16px', overflow:'hidden', height:'110px', position:'relative', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
                  <img src={tip.img} alt={tip.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 25%,rgba(0,0,0,0.65) 100%)' }} />
                  <div style={{ position:'absolute', bottom:'8px', left:'10px', right:'10px' }}>
                    <span style={{ background:'rgba(22,163,74,0.9)', color:'#fff', fontSize:'8px', fontWeight:'800', letterSpacing:'0.5px', padding:'2px 8px', borderRadius:'8px', display:'inline-block', marginBottom:'3px' }}>{tip.tag}</span>
                    <p style={{ color:'#fff', fontSize:'12px', fontWeight:'700' }}>{tip.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
