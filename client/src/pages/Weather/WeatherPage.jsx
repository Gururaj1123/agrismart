import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const weatherIcons = { Clear:'☀️', Clouds:'⛅', Rain:'🌧', Drizzle:'🌦', Thunderstorm:'⛈', Snow:'❄️', Mist:'🌫', Haze:'🌫', default:'🌤' }
const weatherBgs = { Clear:'linear-gradient(135deg,#fff9c4,#fff3e0)', Clouds:'linear-gradient(135deg,#e3f2fd,#f5f5f5)', Rain:'linear-gradient(135deg,#e3f2fd,#e8eaf6)', default:'linear-gradient(135deg,#e8f5e9,#f1f8e9)' }

export default function WeatherPage() {
  const { t } = useTranslation()
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [adviceLoading, setAdviceLoading] = useState(false)
  const [cropType, setCropType] = useState('wheat')

  const fetchWeather = async (cityName) => {
    if (!cityName) return
    setLoading(true)
    try {
      const [curr, fore] = await Promise.all([
        api.get(`/weather/current?city=${cityName}`),
        api.get(`/weather/forecast?city=${cityName}`)
      ])
      setWeather(curr.data)
      const daily = fore.data.list.filter((_,i) => i % 8 === 0).slice(0,5).map(d => ({
        day: new Date(d.dt*1000).toLocaleDateString('en',{weekday:'short'}),
        temp: Math.round(d.main.temp), humidity: d.main.humidity
      }))
      setForecast(daily)
    } catch { toast.error('City not found') }
    finally { setLoading(false) }
  }

  const getGeoWeather = () => {
    navigator.geolocation?.getCurrentPosition(async pos => {
      setLoading(true)
      try {
        const [curr, fore] = await Promise.all([
          api.get(`/weather/current?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
          api.get(`/weather/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
        ])
        setWeather(curr.data); setCity(curr.data.name)
        const daily = fore.data.list.filter((_,i) => i%8===0).slice(0,5).map(d => ({
          day: new Date(d.dt*1000).toLocaleDateString('en',{weekday:'short'}),
          temp: Math.round(d.main.temp), humidity: d.main.humidity
        }))
        setForecast(daily)
      } catch { toast.error('Location error') }
      finally { setLoading(false) }
    }, () => toast.error('Location denied'))
  }

  const getAIAdvice = async () => {
    if (!weather) return
    setAdviceLoading(true)
    try {
      const { data } = await api.post('/weather/ai-advice', {
        weatherData: { temp: weather.main.temp, humidity: weather.main.humidity, condition: weather.weather[0].main, windSpeed: weather.wind.speed },
        cropType, location: weather.name
      })
      setAdvice(data.advice)
    } catch { toast.error('AI advice failed') }
    finally { setAdviceLoading(false) }
  }

  useEffect(() => { getGeoWeather() }, [])

  const wIcon = weather ? (weatherIcons[weather.weather[0].main] || weatherIcons.default) : '🌤'
  const wBg = weather ? (weatherBgs[weather.weather[0].main] || weatherBgs.default) : weatherBgs.default

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f9fff6,#edf7e5,#f4fbee)', paddingBottom:'90px' }}>
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'250px', height:'250px', borderRadius:'50%', background:'radial-gradient(circle,rgba(165,214,167,0.25),transparent)' }} />
      </div>
      <div style={{ position:'relative', zIndex:1, padding:'16px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', paddingTop:'8px' }}>
          <div>
            <span className="section-tag">🌦 Live Weather</span>
            <h1 className="page-title">Weather Intelligence</h1>
            <p className="page-subtitle">AI-powered farming forecasts</p>
          </div>
          <button onClick={getGeoWeather} style={{ width:'42px', height:'42px', borderRadius:'14px', border:'1.5px solid rgba(74,163,40,0.2)', background:'#fff', fontSize:'20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 12px rgba(74,163,40,0.1)' }}>📍</button>
        </div>

        {/* Search */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
          <input value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key==='Enter' && fetchWeather(city)}
            placeholder="Search city, village..." className="input-nature" style={{ flex:1 }} />
          <button onClick={() => fetchWeather(city)} className="btn-nature" style={{ padding:'12px 18px', borderRadius:'14px' }}>🔍</button>
        </div>

        {loading && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'60px 0', flexDirection:'column', gap:'12px' }}>
            <div className="spinner-nature" />
            <p style={{ color:'#81c784', fontSize:'13px' }}>Fetching weather data...</p>
          </div>
        )}

        {weather && !loading && (
          <div style={{ animation:'fadeUp 0.5s ease both' }}>
            {/* Main weather card */}
            <div style={{ borderRadius:'24px', padding:'24px', marginBottom:'16px', background:wBg, border:'1.5px solid rgba(74,163,40,0.15)', boxShadow:'0 8px 32px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-20px', right:'-20px', fontSize:'100px', opacity:0.08 }}>{wIcon}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                <div>
                  <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#1b5e20' }}>{weather.name}, {weather.sys.country}</h2>
                  <p style={{ fontSize:'13px', color:'#6a9f6a', textTransform:'capitalize', marginTop:'2px' }}>{weather.weather[0].description}</p>
                </div>
                <span style={{ fontSize:'52px', animation:'float 4s ease-in-out infinite' }}>{wIcon}</span>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'56px', fontWeight:'900', background:'linear-gradient(135deg,#2e7d32,#66bb6a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'16px', lineHeight:1 }}>
                {Math.round(weather.main.temp)}°C
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                {[
                  { label:'Humidity', val:weather.main.humidity+'%', icon:'💧' },
                  { label:'Wind', val:Math.round(weather.wind.speed*3.6)+' km/h', icon:'💨' },
                  { label:'Feels Like', val:Math.round(weather.main.feels_like)+'°C', icon:'🌡' },
                ].map(s => (
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.7)', borderRadius:'14px', padding:'12px 8px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                    <div style={{ fontSize:'20px', marginBottom:'4px' }}>{s.icon}</div>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'#1b5e20' }}>{s.val}</div>
                    <div style={{ fontSize:'10px', color:'#999', marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            {weather.main.humidity > 80 && (
              <div style={{ background:'linear-gradient(135deg,#e3f2fd,#bbdefb)', border:'1.5px solid rgba(25,118,210,0.25)', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'22px' }}>🌧</span>
                <div><p style={{ fontWeight:'700', color:'#1565c0', fontSize:'13px' }}>High Rain Risk</p><p style={{ fontSize:'12px', color:'#1976d2', marginTop:'2px' }}>Humidity is very high. Delay irrigation and protect harvested crops.</p></div>
              </div>
            )}
            {weather.main.temp > 38 && (
              <div style={{ background:'linear-gradient(135deg,#fce4ec,#f8bbd0)', border:'1.5px solid rgba(198,40,40,0.25)', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'22px' }}>🌡</span>
                <div><p style={{ fontWeight:'700', color:'#b71c1c', fontSize:'13px' }}>Heat Alert</p><p style={{ fontSize:'12px', color:'#c62828', marginTop:'2px' }}>Extreme heat. Increase irrigation and provide shade for sensitive crops.</p></div>
              </div>
            )}

            {/* 5-day forecast */}
            {forecast.length > 0 && (
              <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', marginBottom:'16px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 4px 18px rgba(74,163,40,0.07)' }}>
                <p style={{ fontWeight:'700', color:'#1b5e20', marginBottom:'14px', fontSize:'14px' }}>📅 5-Day Forecast</p>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                  {forecast.map(d => (
                    <div key={d.day} style={{ textAlign:'center' }}>
                      <p style={{ fontSize:'11px', color:'#999', marginBottom:'4px' }}>{d.day}</p>
                      <p style={{ fontSize:'16px', fontWeight:'700', color:'#1b5e20' }}>{d.temp}°</p>
                      <p style={{ fontSize:'10px', color:'#64b5f6', marginTop:'2px' }}>{d.humidity}%</p>
                    </div>
                  ))}
                </div>
                <div style={{ height:'80px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast}>
                      <XAxis dataKey="day" tick={{ fill:'#aaa', fontSize:9 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background:'#fff', border:'1px solid rgba(74,163,40,0.2)', borderRadius:'10px', fontSize:'12px' }} />
                      <Line type="monotone" dataKey="temp" stroke="#4caf50" strokeWidth={2.5} dot={{ fill:'#4caf50', r:3, strokeWidth:0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* AI Advice */}
            <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', border:'1.5px solid rgba(74,163,40,0.12)', boxShadow:'0 4px 18px rgba(74,163,40,0.07)' }}>
              <p style={{ fontWeight:'700', color:'#1b5e20', marginBottom:'12px', fontSize:'14px' }}>🤖 AI Farming Advice</p>
              <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
                <input value={cropType} onChange={e => setCropType(e.target.value)}
                  placeholder="Your crop type" className="input-nature" style={{ flex:1, padding:'10px 14px', fontSize:'13px' }} />
                <button onClick={getAIAdvice} disabled={adviceLoading} className="btn-nature" style={{ padding:'10px 16px', borderRadius:'12px', fontSize:'13px', whiteSpace:'nowrap' }}>
                  {adviceLoading ? '...' : 'Get Advice'}
                </button>
              </div>
              {adviceLoading && (
                <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px', background:'rgba(74,163,40,0.05)', borderRadius:'12px' }}>
                  <div className="spinner-nature" style={{ width:'20px', height:'20px', borderWidth:'2px' }} />
                  <span style={{ fontSize:'13px', color:'#6a9f6a' }}>AI is analyzing...</span>
                </div>
              )}
              {advice && (
                <div style={{ background:'linear-gradient(135deg,#f1f8e9,#e8f5e9)', border:'1.5px solid rgba(74,163,40,0.2)', borderRadius:'14px', padding:'14px', animation:'fadeUp 0.4s ease' }}>
                  <p style={{ fontSize:'13px', color:'#2e7d32', lineHeight:1.8, whiteSpace:'pre-line' }}>{advice}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px', animation:'float 4s ease-in-out infinite' }}>🌦</div>
            <p style={{ color:'#6a9f6a', fontWeight:'600', fontSize:'16px', marginBottom:'8px' }}>Weather Intelligence</p>
            <p style={{ color:'#aaa', fontSize:'13px' }}>Allow location access or search your city above</p>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  )
}
