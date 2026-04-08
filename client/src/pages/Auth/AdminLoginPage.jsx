import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) navigate('/admin')
  }, [navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    if (!form.username || !form.password) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post('/auth/admin-login', form)

      setAuth(data.user, data.token)
      localStorage.setItem('token', data.token)

      toast.success('Admin logged in!')
      navigate('/admin')
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message)
      } else if (err.request) {
        toast.error('Server not responding')
      } else {
        toast.error('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Soft Background Circles */}
      <div className="absolute w-96 h-96 bg-blue-200/40 blur-3xl rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-96 h-96 bg-purple-200/40 blur-3xl rounded-full bottom-[-120px] right-[-120px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛡️</div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Panel
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Secure login access
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-200">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="text-gray-600 text-sm mb-1 block">
                Username
              </label>
              <input
                type="text"
                name="username"
                autoFocus
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-600 text-sm mb-1 block">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 hover:shadow-lg transition-all duration-300 flex justify-center items-center"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Login as Admin'
              )}
            </button>

          </form>

          {/* Footer */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-center text-gray-400 text-xs mt-5">
              Default: admin / admin123
            </p>
          )}
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-gray-500 text-sm hover:text-blue-600 transition"
          >
            ← Farmer Login
          </Link>
        </div>

      </motion.div>
    </div>
  )
}