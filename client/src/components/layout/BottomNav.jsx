import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const navItems = [
  { path: '/dashboard', icon: '🏡', key: 'dashboard', label: 'Home' },
  { path: '/weather', icon: '🌦', key: 'weather', label: 'Weather' },
  { path: '/soil', icon: '🌱', key: 'soil', label: 'Soil' },
  { path: '/disease', icon: '🔬', key: 'disease', label: 'Disease' },
  { path: '/fertilizer', icon: '💊', key: 'fertilizer', label: 'Fertilizer' },
  { path: '/community', icon: '👥', key: 'community', label: 'Community' },
  { path: '/market', icon: '📊', key: 'market', label: 'Market' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav-nature">
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 4px' }}>
        {navItems.map(({ path, icon, label }) => {
          const active = location.pathname === path
          return (
            <button key={path} onClick={() => navigate(path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '6px 8px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: active ? 'rgba(76,175,80,0.12)' : 'transparent',
                transition: 'all 0.3s ease', minWidth: '44px',
              }}>
              <span style={{
                fontSize: '20px', lineHeight: 1,
                filter: active ? 'none' : 'grayscale(0.3)',
                transform: active ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.3s ease',
              }}>{icon}</span>
              <span style={{
                fontSize: '9px', fontWeight: active ? '700' : '400',
                color: active ? '#2e7d32' : '#aaa',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.3s ease',
              }}>{label}</span>
              {active && (
                <span style={{
                  position: 'absolute', bottom: '6px',
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: '#4caf50',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
