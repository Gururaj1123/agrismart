import { useEffect, useRef } from 'react'

export default function ParticlesBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const particles = []
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.style.left = Math.random() * 100 + '%'
      p.style.animationDuration = (Math.random() * 15 + 10) + 's'
      p.style.animationDelay = (Math.random() * 10) + 's'
      p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px'
      p.style.opacity = Math.random() * 0.5 + 0.1
      container.appendChild(p)
      particles.push(p)
    }
    return () => particles.forEach(p => p.remove())
  }, [])

  return <div ref={containerRef} className="particles-bg" />
}
