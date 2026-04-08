import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
    tag: 'AI POWERED',
    title: 'Instant Disease\nDetection',
    subtitle: 'Take a photo of your crop — AI identifies 400+ diseases within seconds with full treatment plans.',
    color: '#1b5e20',
  },
  {
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80',
    tag: 'LIVE DATA',
    title: 'Smart Weather\nIntelligence',
    subtitle: 'Real-time rain, drought and frost alerts. Plan your farm activities with AI-powered forecasts.',
    color: '#0d47a1',
  },
  {
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
    tag: 'COMMUNITY',
    title: 'Farmer\nCommunity',
    subtitle: 'Connect with 50,000+ farmers across India. Share knowledge, ask experts and grow together.',
    color: '#4a148c',
  },
  {
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80',
    tag: 'REAL-TIME',
    title: 'Live Mandi\nPrices',
    subtitle: 'Check real-time prices from 500+ mandis. Compare markets and sell at the best time.',
    color: '#e65100',
  },
  {
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=80',
    tag: 'SMART SCAN',
    title: 'Fertilizer\nAdvisor',
    subtitle: 'Scan any fertilizer bag — AI gives exact dosage, application method and crop benefits.',
    color: '#1a237e',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [current, setCurrent] = useState(0)
  const [imgLoaded, setImgLoaded] = useState({})

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  // preload all images
  useEffect(() => {
    slides.forEach((s, i) => {
      const img = new Image()
      img.src = s.image
      img.onload = () => setImgLoaded(p => ({ ...p, [i]: true }))
    })
  }, [])

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1)
    else navigate('/signup')
  }

  const s = slides[current]

  return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',-apple-system,sans-serif", overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(1.06)} to{opacity:1;transform:scale(1)} }
        .bg-img { animation: scaleIn 0.6s ease both; }
        .slide-text { animation: slideUp 0.5s ease 0.1s both; }
        .dot { transition: all 0.35s ease; cursor: pointer; }
        .next-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .next-btn:active { transform: scale(0.96) !important; }
      `}</style>

      {/* Full background image */}
      <div key={current} className="bg-img" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${s.image})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: imgLoaded[current] ? 'none' : 'blur(0px)',
      }} />

      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.96) 100%)'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '52px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌱</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px', letterSpacing: '0.3px' }}>AgriSmart</span>
          </div>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '7px 16px', borderRadius: '20px', fontFamily: 'inherit' }}>
            Login
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom content */}
        <div className="slide-text" key={`t${current}`} style={{ padding: '0 28px 0' }}>

          {/* Tag */}
          <div style={{ display: 'inline-block', background: s.color, color: '#fff', fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', padding: '5px 12px', borderRadius: '20px', marginBottom: '14px' }}>
            {s.tag}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', lineHeight: '1.15', marginBottom: '14px', letterSpacing: '-0.5px', whiteSpace: 'pre-line' }}>
            {s.title}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', lineHeight: '1.6', marginBottom: '28px', maxWidth: '340px' }}>
            {s.subtitle}
          </p>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            {slides.map((_, i) => (
              <div key={i} className="dot" onClick={() => setCurrent(i)} style={{
                width: i === current ? '28px' : '8px', height: '8px', borderRadius: '4px',
                background: i === current ? '#fff' : 'rgba(255,255,255,0.3)',
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
            <button className="next-btn" onClick={next} style={{
              flex: 1, background: '#fff', color: '#111',
              border: 'none', borderRadius: '16px', padding: '17px 24px',
              fontSize: '16px', fontWeight: '800', cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              letterSpacing: '0.2px'
            }}>
              {current === slides.length - 1 ? '🌾 Get Started Free' : 'Next →'}
            </button>
            {current < slides.length - 1 && (
              <button onClick={() => navigate('/signup')} style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                borderRadius: '16px', padding: '17px 20px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap'
              }}>
                Skip
              </button>
            )}
          </div>

          {/* Bottom auth */}
          <div style={{ textAlign: 'center', paddingBottom: '36px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              Have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color: '#81c784', fontWeight: '700', cursor: 'pointer' }}>Sign In</span>
              {'  ·  '}
              <span onClick={() => navigate('/admin-login')} style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px' }}>Admin</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
