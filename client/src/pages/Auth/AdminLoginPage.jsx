import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/admin-login', form)
      setAuth(data.user, data.token)
      toast.success('Admin logged in!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-green-900/70 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm border border-white/30 rounded-2xl p-6 backdrop-blur-md bg-white/10 shadow-lg">

        <h1 className="text-2xl text-white font-semibold text-center mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="text-white/80 text-sm">Email</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your email"
              className="w-full bg-transparent border-b border-white/50 text-white py-2 focus:outline-none focus:border-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-white/80 text-sm">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              className="w-full bg-transparent border-b border-white/50 text-white py-2 focus:outline-none focus:border-white"
            />
          </div>

          {/* Options */}
          <div className="flex justify-between text-xs text-white/70">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-green-500" />
              Remember
            </label>
            <span className="cursor-pointer hover:underline">
              Forgot Password
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-green-900 py-2 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Register */}
          <p className="text-center text-white/70 text-sm mt-2">
            Don’t have an account?{' '}
            <span className="font-semibold cursor-pointer hover:underline">
              Register
            </span>
          </p>
        </form>

        {/* Back */}
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-white/60 text-xs hover:text-white"
          >
            ← Farmer Login
          </Link>
        </div>

      </div>
    </div>
  )
}