import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

const cats = ['all','general','weather','soil','disease','fertilizer','market','tips']
const catIcons = { all:'📋', general:'💬', weather:'🌦', soil:'🌱', disease:'🔬', fertilizer:'💊', market:'📊', tips:'💡' }
const catColors = { all:'#e8f5e9', general:'#e3f2fd', weather:'#e1f5fe', soil:'#f1f8e9', disease:'#fce4ec', fertilizer:'#f3e5f5', market:'#e0f2f1', tips:'#fff8e1' }

export default function CommunityPage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', category:'general' })
  const [creating, setCreating] = useState(false)
  const [commentText, setCommentText] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState('')
  const [mediaType, setMediaType] = useState('')
  const imageRef = useRef()
  const videoRef = useRef()

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/community/posts?category=${cat}`)
      setPosts(data.posts)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { setLoading(true); fetchPosts() }, [cat])

  const handleMedia = (file) => {
    if (!file) return
    if (file.type.startsWith('video/')) {
      if (file.size > 50*1024*1024) return toast.error('Video must be under 50MB')
      setMediaType('video')
    } else if (file.type.startsWith('image/')) {
      setMediaType('image')
    } else return toast.error('Please select image or video')
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  const handleCreate = async () => {
    if (!form.title || !form.content) return toast.error('Fill title and content')
    setCreating(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('content', form.content)
      fd.append('category', form.category)
      if (mediaFile) fd.append('image', mediaFile)
      const { data } = await api.post('/community/posts', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setPosts(p => [data,...p])
      setForm({ title:'', content:'', category:'general' })
      setMediaFile(null); setMediaPreview(''); setMediaType('')
      setShowCreate(false)
      toast.success('Post shared! 🌾')
    } catch { toast.error('Failed to post') }
    finally { setCreating(false) }
  }

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/community/posts/${postId}/like`)
      setPosts(p => p.map(post => post._id===postId ? { ...post, likes: data.liked ? [...(post.likes||[]), user?.id] : (post.likes||[]).filter(id=>id!==user?.id) } : post))
    } catch {}
  }

  const handleComment = async (postId) => {
    const text = commentText[postId]
    if (!text?.trim()) return
    try {
      const { data } = await api.post(`/community/posts/${postId}/comment`, { text })
      setPosts(p => p.map(post => post._id===postId ? { ...post, comments:data } : post))
      setCommentText(prev => ({ ...prev, [postId]:'' }))
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try { await api.delete(`/community/posts/${postId}`); setPosts(p => p.filter(post => post._id!==postId)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const timeAgo = (date) => {
    const diff = (Date.now()-new Date(date))/1000
    if (diff<60) return 'just now'
    if (diff<3600) return Math.floor(diff/60)+'m ago'
    if (diff<86400) return Math.floor(diff/3600)+'h ago'
    return Math.floor(diff/86400)+'d ago'
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7fa', paddingBottom:'90px', fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#1565c0,#1976d2,#1e88e5)', padding:'52px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'10px', fontWeight:'800', letterSpacing:'1.5px', padding:'4px 12px', borderRadius:'20px', display:'inline-block', marginBottom:'10px' }}>👥 COMMUNITY</span>
          <h1 style={{ color:'#fff', fontSize:'26px', fontWeight:'900', marginBottom:'4px', lineHeight:1.2 }}>Farmer Community</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>Share, learn and grow together</p>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* CREATE POST BUTTON */}
        {!showCreate ? (
          <button onClick={()=>setShowCreate(true)} style={{ width:'100%', background:'#fff', border:'2px dashed #90caf9', borderRadius:'18px', padding:'16px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px', boxShadow:'0 2px 10px rgba(0,0,0,0.04)', transition:'all 0.3s', fontFamily:'inherit' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#1976d2';e.currentTarget.style.background='#f3f8ff'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#90caf9';e.currentTarget.style.background='#fff'}}>
            <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#1976d2,#1565c0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>✍️</div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontWeight:'700', color:'#1565c0', fontSize:'14px' }}>Share with farmers...</p>
              <p style={{ fontSize:'12px', color:'#999', marginTop:'2px' }}>Post photo, video or question</p>
            </div>
            <span style={{ marginLeft:'auto', fontSize:'18px', color:'#90caf9' }}>+</span>
          </button>
        ) : (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'18px', marginBottom:'16px', boxShadow:'0 4px 20px rgba(25,118,210,0.12)', border:'2px solid #90caf940', animation:'fadeUp 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p style={{ fontWeight:'800', color:'#1565c0', fontSize:'15px' }}>📝 Create Post</p>
              <button onClick={()=>{setShowCreate(false);setMediaFile(null);setMediaPreview('');setMediaType('')}} style={{ background:'none', border:'none', color:'#999', fontSize:'20px', cursor:'pointer' }}>✕</button>
            </div>

            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Post title (required)" style={{ width:'100%', padding:'12px 14px', borderRadius:'12px', border:'1.5px solid #eee', fontSize:'14px', outline:'none', fontFamily:'inherit', marginBottom:'10px', background:'#fafafa' }} onFocus={e=>e.target.style.borderColor='#1976d2'} onBlur={e=>e.target.style.borderColor='#eee'} />

            <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Share your experience, question or farming tip..." rows={3} style={{ width:'100%', padding:'12px 14px', borderRadius:'12px', border:'1.5px solid #eee', fontSize:'14px', outline:'none', fontFamily:'inherit', marginBottom:'12px', resize:'none', background:'#fafafa', lineHeight:1.6 }} onFocus={e=>e.target.style.borderColor='#1976d2'} onBlur={e=>e.target.style.borderColor='#eee'} />

            {/* MEDIA OPTIONS */}
            <div style={{ background:'#f8f9fa', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
              <p style={{ fontSize:'12px', color:'#666', fontWeight:'700', marginBottom:'10px' }}>📎 Add Photo or Video</p>
              <div style={{ display:'flex', gap:'10px' }}>
                {/* Photo button */}
                <button onClick={()=>imageRef.current?.click()} style={{ flex:1, background:'#e3f2fd', border:'1.5px solid #90caf9', borderRadius:'12px', padding:'12px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', fontFamily:'inherit', transition:'all 0.3s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#bbdefb'}
                  onMouseLeave={e=>e.currentTarget.style.background='#e3f2fd'}>
                  <span style={{ fontSize:'24px' }}>📷</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:'#1565c0' }}>Photo</span>
                </button>
                <input ref={imageRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleMedia(e.target.files[0])} />

                {/* Video/Reel button */}
                <button onClick={()=>videoRef.current?.click()} style={{ flex:1, background:'#f3e5f5', border:'1.5px solid #ce93d8', borderRadius:'12px', padding:'12px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', fontFamily:'inherit', transition:'all 0.3s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#e1bee7'}
                  onMouseLeave={e=>e.currentTarget.style.background='#f3e5f5'}>
                  <span style={{ fontSize:'24px' }}>🎬</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:'#7b1fa2' }}>Video/Reel</span>
                </button>
                <input ref={videoRef} type="file" accept="video/*" style={{ display:'none' }} onChange={e=>handleMedia(e.target.files[0])} />

                {/* Camera */}
                <button onClick={()=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.capture='environment';i.onchange=e=>handleMedia(e.target.files[0]);i.click()}} style={{ flex:1, background:'#e8f5e9', border:'1.5px solid #a5d6a7', borderRadius:'12px', padding:'12px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', fontFamily:'inherit', transition:'all 0.3s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#c8e6c9'}
                  onMouseLeave={e=>e.currentTarget.style.background='#e8f5e9'}>
                  <span style={{ fontSize:'24px' }}>📸</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:'#2e7d32' }}>Camera</span>
                </button>
              </div>

              {/* Media preview */}
              {mediaPreview && (
                <div style={{ marginTop:'12px', position:'relative' }}>
                  {mediaType==='video' ? (
                    <video src={mediaPreview} controls style={{ width:'100%', maxHeight:'200px', borderRadius:'12px', objectFit:'cover' }} />
                  ) : (
                    <img src={mediaPreview} alt="Preview" style={{ width:'100%', maxHeight:'200px', borderRadius:'12px', objectFit:'cover' }} />
                  )}
                  <button onClick={()=>{setMediaFile(null);setMediaPreview('');setMediaType('')}} style={{ position:'absolute', top:'8px', right:'8px', width:'28px', height:'28px', borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', color:'#fff', cursor:'pointer', fontSize:'13px' }}>✕</button>
                  <div style={{ position:'absolute', bottom:'8px', left:'8px', background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px' }}>
                    {mediaType==='video'?'🎬 VIDEO':'📷 PHOTO'}
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom:'14px' }}>
              <p style={{ fontSize:'12px', color:'#666', fontWeight:'700', marginBottom:'8px' }}>Category</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {cats.slice(1).map(c=>(
                  <button key={c} onClick={()=>setForm({...form,category:c})} style={{ padding:'5px 12px', borderRadius:'50px', border:'none', background:form.category===c?'linear-gradient(135deg,#1976d2,#1565c0)':'#f5f5f5', color:form.category===c?'#fff':'#666', fontSize:'11px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', transition:'all 0.3s' }}>
                    {catIcons[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} disabled={creating} style={{ width:'100%', padding:'14px', borderRadius:'14px', border:'none', background:'linear-gradient(135deg,#1976d2,#1565c0)', color:'#fff', fontSize:'15px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 4px 16px rgba(25,118,210,0.4)' }}>
              {creating?<><div style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Posting...</>:'🌾 Share with Farmers'}
            </button>
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'8px', marginBottom:'16px' }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:'50px', border:'none', background:cat===c?'linear-gradient(135deg,#1976d2,#1565c0)':'#fff', color:cat===c?'#fff':'#666', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'all 0.3s', fontFamily:'inherit', whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              {catIcons[c]} {c}
            </button>
          ))}
        </div>

        {/* POSTS */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0', flexDirection:'column', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'36px', height:'36px', border:'3px solid #e3f2fd', borderTopColor:'#1976d2', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <p style={{ color:'#90caf9', fontSize:'13px' }}>Loading posts...</p>
          </div>
        ) : posts.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'52px', marginBottom:'14px' }}>🌾</div>
            <p style={{ color:'#1976d2', fontWeight:'700', fontSize:'16px', marginBottom:'6px' }}>No posts yet</p>
            <p style={{ color:'#aaa', fontSize:'13px' }}>Be the first to share with farmers!</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {posts.map((post,idx)=>(
              <div key={post._id} style={{ background:'#fff', borderRadius:'20px', overflow:'hidden', boxShadow:'0 2px 14px rgba(0,0,0,0.07)', border:'1px solid #f0f0f0', animation:`fadeUp 0.5s ease ${idx*0.05}s both` }}>
                {/* Post header */}
                <div style={{ padding:'16px 16px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'14px', background:'linear-gradient(135deg,#1976d2,#1565c0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🧑‍🌾</div>
                      <div>
                        <p style={{ fontWeight:'700', color:'#1a1a1a', fontSize:'14px' }}>{post.user?.name||'Farmer'}</p>
                        <p style={{ fontSize:'10px', color:'#bbb' }}>{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <span style={{ background:catColors[post.category]||'#f5f5f5', padding:'4px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:'700', color:'#555' }}>{catIcons[post.category]} {post.category}</span>
                      {(user?.id===post.user?._id||user?.role==='admin') && (
                        <button onClick={()=>handleDelete(post._id)} style={{ background:'none', border:'none', color:'#ffcdd2', fontSize:'14px', cursor:'pointer' }}>✕</button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontWeight:'800', color:'#1a1a1a', fontSize:'15px', marginBottom:'6px' }}>{post.title}</h3>
                  <p style={{ fontSize:'13px', color:'#666', lineHeight:1.7, marginBottom:'6px' }}>
                    {expanded===post._id ? post.content : post.content.slice(0,140)+(post.content.length>140?'...':'')}
                  </p>
                  {post.content.length>140 && (
                    <button onClick={()=>setExpanded(expanded===post._id?null:post._id)} style={{ background:'none', border:'none', color:'#1976d2', fontSize:'12px', fontWeight:'700', cursor:'pointer', padding:0 }}>
                      {expanded===post._id?'Show less ▲':'Read more ▼'}
                    </button>
                  )}
                </div>

                {/* Media (image or video) */}
                {post.image && (
                  <div style={{ position:'relative' }}>
                    {post.image.includes('.mp4')||post.image.includes('video') ? (
                      <video src={post.image} controls style={{ width:'100%', maxHeight:'300px', objectFit:'cover', display:'block' }} />
                    ) : (
                      <img src={post.image} alt="" style={{ width:'100%', maxHeight:'280px', objectFit:'cover', display:'block' }} />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding:'12px 16px', borderTop:'1px solid #f5f5f5' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'10px' }}>
                    <button onClick={()=>handleLike(post._id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', color:post.likes?.includes(user?.id)?'#e57373':'#bbb', fontWeight:'700', fontFamily:'inherit' }}>
                      {post.likes?.includes(user?.id)?'❤️':'🤍'} {post.likes?.length||0}
                    </button>
                    <span style={{ fontSize:'13px', color:'#bbb', display:'flex', alignItems:'center', gap:'5px' }}>💬 {post.comments?.length||0}</span>
                  </div>

                  {/* Comments */}
                  {post.comments?.slice(-2).map((c,i)=>(
                    <div key={i} style={{ background:'#f8f9fa', borderRadius:'12px', padding:'10px 12px', marginBottom:'6px' }}>
                      <p style={{ fontSize:'11px', fontWeight:'700', color:'#1976d2', marginBottom:'3px' }}>{c.user?.name||'Farmer'}</p>
                      <p style={{ fontSize:'12px', color:'#555' }}>{c.text}</p>
                    </div>
                  ))}

                  <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                    <input value={commentText[post._id]||''} onChange={e=>setCommentText({...commentText,[post._id]:e.target.value})}
                      onKeyDown={e=>e.key==='Enter'&&handleComment(post._id)}
                      placeholder="Write a comment..." style={{ flex:1, padding:'9px 13px', borderRadius:'50px', border:'1.5px solid #eee', fontSize:'12px', outline:'none', fontFamily:'inherit', background:'#fafafa' }} onFocus={e=>e.target.style.borderColor='#1976d2'} onBlur={e=>e.target.style.borderColor='#eee'} />
                    <button onClick={()=>handleComment(post._id)} style={{ background:'linear-gradient(135deg,#1976d2,#1565c0)', border:'none', color:'#fff', borderRadius:'50px', padding:'9px 16px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit' }}>Send</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
