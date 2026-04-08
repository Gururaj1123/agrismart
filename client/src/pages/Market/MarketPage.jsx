import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import api from '../../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function MarketPage() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('prices')

  useEffect(() => {
    fetchMarkets()
    const socket = io(import.meta.env.VITE_SOCKET_URL||'http://localhost:5000')
    socket.on('marketUpdate', updated => {
      setMarkets(prev => prev.find(m => m._id===updated._id) ? prev.map(m => m._id===updated._id?updated:m) : [updated,...prev])
      toast.success(`📊 ${updated.crop} price updated!`, { icon:'📈' })
    })
    return () => socket.disconnect()
  }, [])

  const fetchMarkets = async () => {
    try { const { data } = await api.get('/market'); setMarkets(data) }
    catch { toast.error('Failed to load market data') }
    finally { setLoading(false) }
  }

  const filtered = markets.filter(m => {
    const s = search.toLowerCase()
    return (!s || m.crop?.toLowerCase().includes(s) || m.market?.toLowerCase().includes(s)) && (!selectedState || m.state===selectedState)
  })

  const states = [...new Set(markets.map(m => m.state).filter(Boolean))]
  const trendIcon = { up:'📈', down:'📉', stable:'➡️' }
  const trendColor = { up:'#2e7d32', down:'#c62828', stable:'#f57f17' }
  const trendBg = { up:'#e8f5e9', down:'#fce4ec', stable:'#fff8e1' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f9fff6,#edf7e5,#f4fbee)', paddingBottom:'90px' }}>
      <div style={{ position:'relative', zIndex:1, padding:'16px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', paddingTop:'8px' }}>
          <div>
            <span className="section-tag">📊 Live Prices</span>
            <h1 className="page-title">Market Insights</h1>
            <p className="page-subtitle">Real-time mandi prices & trends</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.8)', padding:'6px 12px', borderRadius:'50px', border:'1.5px solid rgba(74,163,40,0.2)' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4caf50', animation:'pulse 2s infinite', display:'inline-block' }} />
            <span style={{ fontSize:'11px', fontWeight:'700', color:'#2e7d32' }}>LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'8px', background:'rgba(255,255,255,0.8)', padding:'6px', borderRadius:'18px', marginBottom:'20px', border:'1.5px solid rgba(74,163,40,0.12)' }}>
          {[{k:'prices',l:'💰 Live Prices'},{k:'compare',l:'📊 Compare'},{k:'besttime',l:'⏰ Best Time'}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ flex:1, padding:'10px 6px', borderRadius:'12px', border:'none', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.3s', background:tab===t.k?'linear-gradient(135deg,#4caf50,#2e7d32)':'transparent', color:tab===t.k?'#fff':'#6a9f6a', boxShadow:tab===t.k?'0 4px 14px rgba(74,163,40,0.3)':'none' }}>
              {t.l}
            </button>
          ))}
        </div>

        {tab==='prices' && (
          <>
            <div style={{ display:'flex', gap:'10px', marginBottom:'14px' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop or market..." className="input-nature" style={{ flex:1, padding:'11px 14px', fontSize:'13px' }} />
            </div>
            {states.length>0 && (
              <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'8px', marginBottom:'14px', scrollbarWidth:'none' }}>
                <button onClick={() => setSelectedState('')}
                  style={{ flexShrink:0, padding:'7px 14px', borderRadius:'50px', border:`1.5px solid ${!selectedState?'#4caf50':'rgba(74,163,40,0.2)'}`, background:!selectedState?'linear-gradient(135deg,#4caf50,#2e7d32)':'rgba(255,255,255,0.8)', color:!selectedState?'#fff':'#6a9f6a', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' }}>
                  All States
                </button>
                {states.map(s => (
                  <button key={s} onClick={() => setSelectedState(s)}
                    style={{ flexShrink:0, padding:'7px 14px', borderRadius:'50px', border:`1.5px solid ${selectedState===s?'#4caf50':'rgba(74,163,40,0.2)'}`, background:selectedState===s?'linear-gradient(135deg,#4caf50,#2e7d32)':'rgba(255,255,255,0.8)', color:selectedState===s?'#fff':'#6a9f6a', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'60px 0', flexDirection:'column', alignItems:'center', gap:'12px' }}>
                <div className="spinner-nature" />
                <p style={{ color:'#81c784', fontSize:'13px' }}>Loading market prices...</p>
              </div>
            ) : filtered.length===0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <div style={{ fontSize:'52px', marginBottom:'14px', animation:'float 4s ease-in-out infinite' }}>📊</div>
                <p style={{ color:'#2e7d32', fontWeight:'700', fontSize:'16px', marginBottom:'6px' }}>No market data yet</p>
                <p style={{ color:'#aaa', fontSize:'13px' }}>Admin will update prices soon</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {filtered.map((market,i) => (
                  <div key={market._id} onClick={() => setSelected(selected?._id===market._id?null:market)}
                    style={{ background:'#fff', borderRadius:'20px', padding:'18px', border:`1.5px solid ${selected?._id===market._id?'#4caf50':'rgba(74,163,40,0.1)'}`, boxShadow:'0 4px 18px rgba(74,163,40,0.07)', cursor:'pointer', transition:'all 0.3s', animation:`fadeUp 0.5s ease ${i*0.05}s both` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div>
                        <h3 style={{ fontWeight:'800', color:'#1b5e20', fontSize:'17px', marginBottom:'3px' }}>{market.crop}</h3>
                        <p style={{ fontSize:'12px', color:'#aaa' }}>📍 {market.market}, {market.state}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'24px', fontWeight:'800', background:'linear-gradient(135deg,#2e7d32,#66bb6a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>₹{market.currentPrice?.toLocaleString()}</p>
                        <p style={{ fontSize:'10px', color:'#aaa' }}>per quintal</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', gap:'12px' }}>
                        <span style={{ fontSize:'11px', color:'#aaa' }}>Min: <b style={{ color:'#555' }}>₹{market.minPrice}</b></span>
                        <span style={{ fontSize:'11px', color:'#aaa' }}>Max: <b style={{ color:'#555' }}>₹{market.maxPrice}</b></span>
                      </div>
                      <span style={{ background:trendBg[market.trend]||'#f5f5f5', color:trendColor[market.trend]||'#888', padding:'4px 12px', borderRadius:'50px', fontSize:'12px', fontWeight:'700' }}>
                        {trendIcon[market.trend]} {market.trend}
                      </span>
                    </div>
                    {selected?._id===market._id && market.bestSellTime && (
                      <div style={{ marginTop:'12px', background:'linear-gradient(135deg,#f1f8e9,#e8f5e9)', border:'1.5px solid rgba(74,163,40,0.2)', borderRadius:'14px', padding:'12px 14px' }}>
                        <p style={{ fontSize:'11px', color:'#81c784', fontWeight:'700', marginBottom:'4px' }}>⏰ BEST SELLING TIME</p>
                        <p style={{ fontSize:'13px', color:'#2e7d32', fontWeight:'600' }}>{market.bestSellTime}</p>
                      </div>
                    )}
                    <p style={{ fontSize:'10px', color:'#ddd', marginTop:'8px' }}>Updated: {new Date(market.updatedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab==='compare' && (
          <div>
            {filtered.length===0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}><div style={{ fontSize:'52px', marginBottom:'14px' }}>📊</div><p style={{ color:'#aaa' }}>No data to compare yet</p></div>
            ) : (
              <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 4px 18px rgba(74,163,40,0.07)' }}>
                <p style={{ fontWeight:'700', color:'#1b5e20', marginBottom:'16px', fontSize:'14px' }}>Price Range Comparison (₹/quintal)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={filtered.slice(0,6).map(m => ({ name:m.crop, Min:m.minPrice, Current:m.currentPrice, Max:m.maxPrice }))} margin={{ left:-20 }}>
                    <XAxis dataKey="name" tick={{ fill:'#aaa', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#aaa', fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background:'#fff', border:'1px solid rgba(74,163,40,0.2)', borderRadius:'12px', fontSize:'12px' }} />
                    <Bar dataKey="Min" fill="rgba(239,68,68,0.5)" radius={[6,6,0,0]} />
                    <Bar dataKey="Current" fill="rgba(76,175,80,0.8)" radius={[6,6,0,0]} />
                    <Bar dataKey="Max" fill="rgba(59,130,246,0.5)" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', gap:'16px', justifyContent:'center', marginTop:'12px' }}>
                  {[{c:'rgba(239,68,68,0.5)',l:'Min'},{c:'rgba(76,175,80,0.8)',l:'Current'},{c:'rgba(59,130,246,0.5)',l:'Max'}].map(s => (
                    <span key={s.l} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#888' }}>
                      <span style={{ width:'12px', height:'12px', borderRadius:'3px', background:s.c, display:'inline-block' }} />{s.l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==='besttime' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {markets.filter(m => m.bestSellTime).length===0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}><div style={{ fontSize:'52px', marginBottom:'14px' }}>⏰</div><p style={{ color:'#aaa' }}>Best sell time data will be updated by admin</p></div>
            ) : markets.filter(m => m.bestSellTime).map((m,i) => (
              <div key={m._id} style={{ background:'#fff', borderRadius:'18px', padding:'18px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 3px 14px rgba(74,163,40,0.06)', animation:`fadeUp 0.5s ease ${i*0.07}s both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'14px', background:'linear-gradient(135deg,#e8f5e9,#c8e6c9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>🌾</div>
                  <div><h3 style={{ fontWeight:'700', color:'#1b5e20', fontSize:'15px' }}>{m.crop}</h3><p style={{ fontSize:'12px', color:'#aaa' }}>{m.market}, {m.state}</p></div>
                </div>
                <div style={{ background:'linear-gradient(135deg,#f1f8e9,#e8f5e9)', border:'1.5px solid rgba(74,163,40,0.2)', borderRadius:'12px', padding:'12px 14px' }}>
                  <p style={{ fontSize:'11px', color:'#81c784', fontWeight:'700', marginBottom:'4px' }}>⏰ BEST TIME TO SELL</p>
                  <p style={{ fontSize:'13px', color:'#2e7d32', fontWeight:'600', lineHeight:1.5 }}>{m.bestSellTime}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}} @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.5)}50%{box-shadow:0 0 0 6px rgba(76,175,80,0)}}`}</style>
    </div>
  )
}
