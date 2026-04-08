import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

export default function SignupPage() {
  const [form, setForm] = useState({ name:'', phone:'', password:'', location:'' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.password) return toast.error('Fill all required fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', form)
      setAuth(data.user, data.token)
      toast.success('Welcome to AgriSmart! 🌱')
      navigate('/select-language')
    } catch (err) { toast.error(err.response?.data?.message || 'Signup failed') }
    finally { setLoading(false) }
  }

  const fields = [
    { key:'name', label:'👤 Full Name', placeholder:'Your full name', type:'text', required:true },
    { key:'phone', label:'📱 Phone Number', placeholder:'10-digit phone number', type:'tel', required:true },
    { key:'password', label:'🔒 Password', placeholder:'Minimum 6 characters', type:'password', required:true },
    { key:'location', label:'📍 Village / City', placeholder:'e.g. Pune, Maharashtra', type:'text', required:false },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f9fff6,#edf7e5,#f4fbee)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(165,214,167,0.3),transparent)', pointerEvents:'none' }} />
      <div style={{ width:'100%', maxWidth:'400px', animation:'fadeUp 0.6s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'22px', background:'linear-gradient(135deg,#66bb6a,#2e7d32)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', margin:'0 auto 16px', boxShadow:'0 8px 28px rgba(74,163,40,0.4)', animation:'float 4s ease-in-out infinite' }}>🌱</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:'800', color:'#1b5e20', marginBottom:'6px' }}>Join AgriSmart</h1>
          <p style={{ color:'#6a9f6a', fontSize:'14px' }}>Free account for Indian farmers</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', border:'1.5px solid rgba(74,163,40,0.15)', borderRadius:'24px', padding:'28px', boxShadow:'0 8px 40px rgba(74,163,40,0.1)' }}>
          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom:'14px' }}>
                <label className="label-nature">{f.label} {f.required && <span style={{ color:'#e57373' }}>*</span>}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} placeholder={f.placeholder} className="input-nature" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-nature" style={{ width:'100%', padding:'15px', borderRadius:'14px', fontSize:'15px', marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
              {loading ? <><div className="spinner-nature" style={{ width:'18px', height:'18px', borderWidth:'2px', borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Creating...</> : '🌱 Create Free Account'}
            </button>
          </form>
          <p style={{ textAlign:'center', color:'#aaa', fontSize:'13px', marginTop:'20px' }}>
            Already registered? <Link to="/login" style={{ color:'#2e7d32', fontWeight:'700', textDecoration:'none' }}>Login</Link>
          </p>
        </div>
        <div style={{ textAlign:'center', marginTop:'16px' }}>
          <Link to="/" style={{ color:'#bbb', fontSize:'12px', textDecoration:'none' }}>← Back to Home</Link>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
