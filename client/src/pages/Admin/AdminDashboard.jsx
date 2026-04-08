import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

// ─── SVG Icon Library ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16, stroke = 'currentColor', strokeWidth = 2, className = '' }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    chart: <><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    leaf: <><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    trendDown: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
    trendFlat: <><line x1="5" y1="12" x2="19" y2="12"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    chevronUp: <><polyline points="18 15 12 9 6 15"/></>,
    chevronDown: <><polyline points="6 9 12 15 18 9"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {paths[name]}
    </svg>
  )
}

// ─── Reusable Components ─────────────────────────────────────────────────────
const StatCard = ({ label, value, iconName, accent }) => (
  <div className="glass-card p-4 text-center">
    <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${accent.bg}`}>
      <Icon name={iconName} size={18} stroke={accent.color} strokeWidth={2} />
    </div>
    <div className="text-2xl font-bold text-zinc-900">{value}</div>
    <div className="text-zinc-600 text-xs mt-0.5 font-bold uppercase tracking-tight">{label}</div>
  </div>
)

const TrendBadge = ({ trend }) => {
  const cfg = {
    up:     { icon: 'trendUp',   label: 'Up',     cls: 'text-emerald-700 bg-emerald-500/20' },
    down:   { icon: 'trendDown', label: 'Down',   cls: 'text-red-700 bg-red-500/20' },
    stable: { icon: 'trendFlat', label: 'Stable', cls: 'text-amber-700 bg-amber-500/20' },
  }[trend] || { icon: 'trendFlat', label: 'Stable', cls: 'text-amber-700 bg-amber-500/20' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon name={cfg.icon} size={10} strokeWidth={3} />
      {cfg.label}
    </span>
  )
}

// ─── Form field helpers ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  crop: '', market: '', state: '',
  currentPrice: '', minPrice: '', maxPrice: '',
  unit: 'quintal', bestSellTime: '', trend: 'stable',
}

const FORM_FIELDS = [
  { key: 'crop',         label: 'Crop *',             placeholder: 'e.g. Wheat',         span: 1 },
  { key: 'market',       label: 'Market *',            placeholder: 'e.g. Pune Mandi',    span: 1 },
  { key: 'state',        label: 'State',               placeholder: 'e.g. Maharashtra',   span: 1 },
  { key: 'currentPrice', label: 'Current price (₹) *', placeholder: '2500', type: 'number', span: 1 },
  { key: 'minPrice',     label: 'Min price (₹)',        placeholder: '2000', type: 'number', span: 1 },
  { key: 'maxPrice',     label: 'Max price (₹)',        placeholder: '3000', type: 'number', span: 1 },
  { key: 'bestSellTime', label: 'Best sell time',       placeholder: 'e.g. Sell Oct–Nov when demand peaks', span: 2 },
]

// ─── Main Component ──────────────────────────────────────────────────────────
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'grid'  },
  { id: 'market',   label: 'Market',   icon: 'chart' },
  { id: 'farmers',  label: 'Farmers',  icon: 'users' },
]

export default function AdminDashboard() {
  const { logout } = useAuthStore()
  const navigate   = useNavigate()

  const [tab,         setTab]        = useState('overview')
  const [stats,       setStats]      = useState({})
  const [markets,     setMarkets]    = useState([])
  const [farmers,     setFarmers]    = useState([])
  const [loading,     setLoading]    = useState(true)
  const [marketForm, setMarketForm] = useState(EMPTY_FORM)
  const [editingId,  setEditingId]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [s, m, f] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/market'),
        api.get('/admin/farmers'),
      ])
      setStats(s.data); setMarkets(m.data); setFarmers(f.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, val) => setMarketForm(prev => ({ ...prev, [key]: val }))

  const handleMarketSubmit = async () => {
    if (!marketForm.crop || !marketForm.market || !marketForm.currentPrice)
      return toast.error('Please fill in all required fields')
    setSubmitting(true)
    try {
      if (editingId) {
        const { data } = await api.put(`/market/${editingId}`, marketForm)
        setMarkets(prev => prev.map(m => m._id === editingId ? data : m))
        toast.success('Price updated successfully')
      } else {
        const { data } = await api.post('/market', marketForm)
        setMarkets(prev => [data, ...prev])
        toast.success('Market entry added')
      }
      setMarketForm(EMPTY_FORM)
      setEditingId(null)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (m) => {
    setMarketForm({
      crop: m.crop, market: m.market, state: m.state,
      currentPrice: m.currentPrice, minPrice: m.minPrice, maxPrice: m.maxPrice,
      unit: m.unit, bestSellTime: m.bestSellTime || '', trend: m.trend,
    })
    setEditingId(m._id)
    setTab('market')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteMarket = async (id) => {
    if (!window.confirm('Delete this market entry?')) return
    try {
      await api.delete(`/market/${id}`)
      setMarkets(prev => prev.filter(m => m._id !== id))
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const handleDeleteFarmer = async (id) => {
    if (!window.confirm('Remove this farmer account?')) return
    try {
      await api.delete(`/admin/farmers/${id}`)
      setFarmers(prev => prev.filter(f => f._id !== id))
      toast.success('Farmer removed')
    } catch {
      toast.error('Failed to remove farmer')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen gap-3">
      <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      <span className="text-zinc-900 text-sm font-black">Loading dashboard…</span>
    </div>
  )

  return (
    <div className="min-h-screen p-4 pb-12 max-w-lg mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Icon name="shield" size={18} stroke="#4ade80" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 leading-none">Admin Panel</h1>
            <p className="text-zinc-600 text-xs mt-0.5 font-bold">AgriSmart management</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-1.5 text-red-700 text-sm font-black glass px-3 py-2 rounded-xl border border-red-500/40 hover:bg-red-500/20 transition-colors"
        >
          <Icon name="logout" size={14} stroke="currentColor" strokeWidth={3} />
          Sign out
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 glass-card p-1 rounded-2xl mb-6 border border-zinc-900/20 bg-zinc-900/5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              tab === t.id
                ? 'bg-zinc-900 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Icon name={t.icon} size={13} strokeWidth={2.5} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
        {tab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total farmers" value={stats.totalFarmers ?? 0}  iconName="users" accent={{ bg: 'bg-zinc-900/10',  color: '#000' }} />
              <StatCard label="Total posts"   value={stats.totalPosts   ?? 0}  iconName="file"  accent={{ bg: 'bg-zinc-900/10',  color: '#000' }} />
              <StatCard label="Markets"       value={stats.totalMarkets ?? 0}  iconName="chart" accent={{ bg: 'bg-zinc-900/10',   color: '#000' }} />
            </div>

            <div className="glass-card p-4 border border-zinc-900/10">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="clock" size={14} stroke="#18181b" strokeWidth={2.5} />
                <h3 className="text-zinc-900 text-xs font-black uppercase tracking-widest">Recent farmers</h3>
              </div>
              <div className="space-y-0.5">
                {(stats.recentFarmers || []).length === 0 && (
                  <p className="text-zinc-500 text-sm text-center py-4 font-bold">No farmers yet</p>
                )}
                {(stats.recentFarmers || []).map((f, i) => (
                  <div
                    key={f._id}
                    className={`flex items-center gap-3 py-3 ${
                      i < (stats.recentFarmers.length - 1) ? 'border-b border-zinc-900/10' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-900/10 border border-zinc-900/20 flex items-center justify-center shrink-0">
                      <Icon name="user" size={16} stroke="#000" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-900 text-sm font-black truncate">{f.name}</p>
                      <p className="text-zinc-600 text-xs truncate font-bold">{f.phone} · {f.location || 'India'}</p>
                    </div>
                    <span className="text-zinc-500 text-xs shrink-0 font-black">
                      {new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════ MARKET TAB ══════════════════ */}
        {tab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="glass-card p-4 border-2 border-zinc-900/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                  <Icon name={editingId ? 'edit' : 'plus'} size={14} stroke="#fff" />
                </div>
                <h3 className="text-zinc-900 font-black text-sm">
                  {editingId ? 'Update market price' : 'Add market price'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FORM_FIELDS.map(f => (
                  <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                    <label className="text-zinc-800 text-xs mb-1.5 block font-black">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={marketForm[f.key]}
                      onChange={e => field(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="input-field py-2.5 text-sm font-black text-zinc-900 border-zinc-900/30 placeholder:text-zinc-400"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <label className="text-zinc-800 text-xs block mb-2 font-black">Price trend</label>
                <div className="flex gap-2">
                  {[
                    { val: 'up',     icon: 'trendUp',   label: 'Rising',  active: 'bg-emerald-600 text-white border-emerald-700' },
                    { val: 'stable', icon: 'trendFlat',  label: 'Stable',  active: 'bg-amber-600   text-white   border-amber-700'   },
                    { val: 'down',   icon: 'trendDown',  label: 'Falling', active: 'bg-red-600     text-white     border-red-700'     },
                  ].map(tr => (
                    <button
                      key={tr.val}
                      onClick={() => field('trend', tr.val)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black border transition-all ${
                        marketForm.trend === tr.val
                          ? tr.active
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:text-zinc-800'
                      }`}
                    >
                      <Icon name={tr.icon} size={11} strokeWidth={3} />
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleMarketSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-sm font-black transition-colors"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Icon name={editingId ? 'check' : 'plus'} size={14} stroke="#fff" strokeWidth={3} />
                  }
                  {editingId ? 'Update price' : 'Add to market'}
                </button>
                {editingId && (
                  <button
                    onClick={() => { setEditingId(null); setMarketForm(EMPTY_FORM) }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-black text-zinc-700 border-2 border-zinc-200 rounded-xl"
                  >
                    <Icon name="x" size={13} strokeWidth={3} />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {markets.length === 0 && (
                <div className="glass-card p-8 text-center text-zinc-500 text-sm font-bold">
                  No market entries yet
                </div>
              )}
              {markets.map(m => (
                <div key={m._id} className="glass-card p-3.5 flex items-center gap-3 border border-zinc-900/10">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
                    <Icon name="leaf" size={16} stroke="#4ade80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-900 font-black text-sm">{m.crop}</p>
                    <p className="text-zinc-600 text-xs truncate font-bold">{m.market}{m.state ? `, ${m.state}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-zinc-900 font-black text-sm">₹{Number(m.currentPrice).toLocaleString('en-IN')}</p>
                    <p className="text-zinc-600 text-[10px] font-black">/{m.unit || 'quintal'}</p>
                    <TrendBadge trend={m.trend} />
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEdit(m)}
                      className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <Icon name="edit" size={13} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleDeleteMarket(m._id)}
                      className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Icon name="trash" size={13} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════ FARMERS TAB ══════════════════ */}
        {tab === 'farmers' && (
          <motion.div
            key="farmers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="users" size={14} stroke="#18181b" strokeWidth={3} />
                <span className="text-zinc-900 text-xs font-black uppercase tracking-widest">All farmers</span>
              </div>
              <span className="text-zinc-900 text-xs font-black bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                {farmers.length} registered
              </span>
            </div>

            {farmers.length === 0 && (
              <div className="glass-card p-8 text-center text-zinc-500 text-sm font-bold">
                No farmers registered yet
              </div>
            )}
            {farmers.map(f => (
              <div key={f._id} className="glass-card p-3.5 flex items-center gap-3 border border-zinc-900/10">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                  <Icon name="user" size={18} stroke="#4ade80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-900 font-black text-sm">{f.name}</p>
                  <p className="text-zinc-600 text-xs truncate font-bold">
                    {f.phone}
                    {f.location ? ` · ${f.location}` : ''}
                    {f.language && (
                      <span className="ml-1.5 bg-zinc-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                        {f.language}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteFarmer(f._id)}
                  className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-700 hover:bg-red-100 transition-colors shrink-0"
                >
                  <Icon name="trash" size={13} strokeWidth={3} />
                </button>
              </div>
            ))}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}