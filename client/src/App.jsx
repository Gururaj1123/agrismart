import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import i18n from './i18n/i18n.js'
const savedLang = localStorage.getItem('lang')
if (savedLang) i18n.changeLanguage(savedLang)
import LandingPage from './pages/Auth/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import AdminLoginPage from './pages/Auth/AdminLoginPage'
import LanguageSelect from './pages/Auth/LanguageSelect'
import Dashboard from './pages/Dashboard'
import WeatherPage from './pages/Weather/WeatherPage'
import SoilPage from './pages/Soil/SoilPage'
import DiseasePage from './pages/Disease/DiseasePage'
import FertilizerPage from './pages/Fertilizer/FertilizerPage'
import CommunityPage from './pages/Community/CommunityPage'
import MarketPage from './pages/Market/MarketPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import BottomNav from './components/layout/BottomNav'
import ParticlesBackground from './components/common/ParticlesBackground'

const ProtectedRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const AppLayout = ({ children }) => {
  const { user } = useAuthStore()
  return (
    <div className="relative min-h-screen">
      <ParticlesBackground />
      <div className="relative z-10">{children}</div>
      {user?.role !== 'admin' && <BottomNav />}
    </div>
  )
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore()
  const langSelected = localStorage.getItem('lang')

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1a2942', color: '#fff', border: '1px solid rgba(34,197,94,0.3)' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }
      }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/select-language" element={
          <ProtectedRoute><LanguageSelect /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/weather" element={
          <ProtectedRoute>
            <AppLayout><WeatherPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/soil" element={
          <ProtectedRoute>
            <AppLayout><SoilPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/disease" element={
          <ProtectedRoute>
            <AppLayout><DiseasePage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/fertilizer" element={
          <ProtectedRoute>
            <AppLayout><FertilizerPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <AppLayout><CommunityPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/market" element={
          <ProtectedRoute>
            <AppLayout><MarketPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AppLayout><AdminDashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
