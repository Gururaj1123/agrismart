import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const languages = [
  { code:'en', native:'English', flag:'🇬🇧', desc:'Continue in English' },
  { code:'hi', native:'हिंदी', flag:'🇮🇳', desc:'हिंदी में जारी रखें' },
  { code:'mr', native:'मराठी', flag:'🇮🇳', desc:'मराठीत सुरू ठेवा' },
  { code:'kn', native:'ಕನ್ನಡ', flag:'🇮🇳', desc:'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ' },
  { code:'ta', native:'தமிழ்', flag:'🇮🇳', desc:'தமிழில் தொடரவும்' },
]

export default function LanguageSelect() {
  const [selected, setSelected] = useState(localStorage.getItem('lang') || 'en')
  const [loading, setLoading] = useState(false)
  const { i18n } = useTranslation()

  const handleContinue = async () => {
    setLoading(true)
    localStorage.setItem('lang', selected)
    try { await api.put('/auth/language', { language: selected }) } catch {}
    i18n.changeLanguage(selected)
    toast.success('Language set!')
    // Force full reload so every component re-renders in new language
    setTimeout(() => { window.location.href = '/dashboard' }, 400)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#F0FDF4,#DCFCE7,#F0FDF4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ width:'100%', maxWidth:'420px', animation:'fadeUp 0.5s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{ width:'70px', height:'70px', borderRadius:'22px', background:'linear-gradient(135deg,#16A34A,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 18px', boxShadow:'0 10px 30px rgba(22,163,74,0.35)' }}>🌐</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:'800', color:'#14532D', marginBottom:'8px' }}>Choose Language</h1>
          <p style={{ color:'#6B7280', fontSize:'14px' }}>Select your preferred language to continue</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
          {languages.map(lang => (
            <button key={lang.code} onClick={() => setSelected(lang.code)}
              style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 18px', borderRadius:'16px', cursor:'pointer', border: selected===lang.code ? '2px solid #16A34A' : '1.5px solid #E5E7EB', background: selected===lang.code ? '#F0FDF4' : '#fff', transition:'all 0.25s', textAlign:'left', width:'100%', boxShadow: selected===lang.code ? '0 4px 16px rgba(22,163,74,0.15)' : '0 1px 4px rgba(0,0,0,0.04)', fontFamily:'inherit' }}>
              <span style={{ fontSize:'28px', flexShrink:0 }}>{lang.flag}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:'700', color:'#111', fontSize:'16px', marginBottom:'2px' }}>{lang.native}</p>
                <p style={{ fontSize:'12px', color:'#9CA3AF' }}>{lang.desc}</p>
              </div>
              <div style={{ width:'22px', height:'22px', borderRadius:'50%', border: selected===lang.code ? '2px solid #16A34A' : '2px solid #E5E7EB', background: selected===lang.code ? '#16A34A' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'12px', flexShrink:0, transition:'all 0.25s' }}>
                {selected===lang.code && '✓'}
              </div>
            </button>
          ))}
        </div>

        <button onClick={handleContinue} disabled={loading}
          style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none', background:'linear-gradient(135deg,#16A34A,#15803D)', color:'#fff', fontSize:'16px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 6px 20px rgba(22,163,74,0.4)', transition:'all 0.25s' }}>
          {loading
            ? <><div style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Applying...</>
            : `Continue in ${languages.find(l=>l.code===selected)?.native} →`
          }
        </button>
        <p style={{ textAlign:'center', color:'#9CA3AF', fontSize:'12px', marginTop:'14px' }}>You can change this anytime in settings</p>
      </div>
    </div>
  )
}
