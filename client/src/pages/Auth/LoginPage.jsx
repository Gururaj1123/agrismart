import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

export default function AppLoginPage() {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const quotes = [
    "Cultivating the future, one seed at a time.",
    "The heart of the nation beats in the field.",
    "Your hard work feeds the world.",
    "Nature is the best teacher."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.user, data.token)
      toast.success('Welcome back! 🌾')
      navigate(localStorage.getItem('lang') ? '/dashboard' : '/select-language')
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Login failed') 
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1b5e20', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* TOP SECTION: WELCOME & QUOTES */}
      <div style={{ height: '35vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        {/* Animated Background Circles */}
        <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        
        <div style={{ zIndex: 1, animation: 'fadeInDown 0.8s ease' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌾</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>Welcome, Farmer</h1>
          <p key={quoteIndex} style={{ fontSize: '15px', color: '#e8f5e9', fontStyle: 'italic', maxWidth: '80%', margin: '0 auto', animation: 'fadeIn 1s ease' }}>
            "{quotes[quoteIndex]}"
          </p>
        </div>
      </div>

      {/* BOTTOM SECTION: LOGIN FORM CARD */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#f9fff6', 
        borderTopLeftRadius: '40px', 
        borderTopRightRadius: '40px', 
        padding: '40px 24px',
        boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
        marginTop: '-20px', // Pulls card up over the green background
        zIndex: 2
      }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ color: '#1b5e20', fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>Login to continue</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#6a9f6a', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>📱 Phone Number</label>
              <input 
                type="tel" 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
                placeholder="00000 00000" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e0e0e0', fontSize: '16px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: '#6a9f6a', fontSize: '13px', fontWeight: '600', marginBottom: '8px', marginLeft: '4px' }}>🔒 Password</label>
              <input 
                type="password" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e0e0e0', fontSize: '16px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', background: 'linear-gradient(135deg,#4caf50,#1b5e20)', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 20px rgba(27,94,32,0.3)', cursor: 'pointer' }}
            >
              {loading ? 'Entering Farm...' : 'Login Now 🌾'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ color: '#888', fontSize: '14px' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#2e7d32', fontWeight: '700', textDecoration: 'none' }}>Register</Link>
            </p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
               <Link to="/admin-login" style={{ color: '#bbb', fontSize: '12px', textDecoration: 'none' }}>Admin</Link>
               <Link to="/" style={{ color: '#bbb', fontSize: '12px', textDecoration: 'none' }}>Home</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input:focus {
          border-color: #4caf50 !important;
          box-shadow: 0 0 0 3px rgba(76,175,80,0.1);
        }
      `}</style>
    </div>
  )
}