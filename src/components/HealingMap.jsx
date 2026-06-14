import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ORGANS = [
  { id: 'mind', icon: '🧠', label: 'Mind-Body Medicine', x: 50, y: 9, r: 6, desc: 'Understanding the deep connection between emotional states and physical health — addressing the root, not just the symptom.' },
  { id: 'emotion', icon: '💆', label: 'Emotional Well-being', x: 45, y: 27, r: 6, desc: 'Sustainable resilience for modern professionals — moving beyond stress management to lasting emotional strength.' },
  { id: 'cancer', icon: '🎗️', label: 'Cancer Revival & Support', x: 51, y: 38, r: 10, desc: 'Integrative complementary support during treatment — rebuilding strength, resilience, and hope alongside your medical care.' },
  { id: 'chronic', icon: '🔬', label: 'Chronic Systemic Disorders', x: 60, y: 46, r: 6, desc: 'Comprehensive root-cause evaluation of long-term health challenges — autoimmune, metabolic, thyroid, digestive, and more.' },
  { id: 'fertility', icon: '🌸', label: "Fertility & Women's Wellness", x: 50, y: 56, r: 6, desc: 'Holistic, personalised support for the journey to motherhood — hormonal balance, emotional well-being, and mind-body fertility optimization.' },
  { id: 'allied', icon: '🌿', label: 'Allied Healing Sciences', x: 67, y: 42, r: 6, desc: 'Homeopathy, Psychotherapy, Acupuncture, NLP, Mindfulness — multiple evidence-informed disciplines working together.' },
]

export { ORGANS }

export default function HealingMap() {
  const [active, setActive] = useState(null)
  const [hovered, setHovered] = useState(null)
  const canvasRef = useRef(null)
  const rotRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const animRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    function draw(t, rotX, rotY) {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2 + rotY * 10
      const cy = H * 0.06

      // Ambient aura
      const aura = ctx.createRadialGradient(cx, H * 0.42, 20, cx, H * 0.42, H * 0.45)
      aura.addColorStop(0, 'rgba(199,166,106,0.10)')
      aura.addColorStop(1, 'rgba(199,166,106,0)')
      ctx.fillStyle = aura
      ctx.fillRect(0, 0, W, H)

      // Outer concentric rings
      ;[0.42, 0.30].forEach((rf, i) => {
        ctx.beginPath()
        ctx.arc(cx, H * 0.42, H * rf, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(199,166,106,${0.08 - i * 0.02})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Shimmer particles
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + t * 0.002
        const r = H * 0.34 + Math.sin(t * 0.01 + i) * 8
        const px = cx + Math.cos(angle) * r * 0.42
        const py = H * 0.4 + Math.sin(angle) * r * 0.16
        const alpha = 0.12 + 0.1 * Math.sin(t * 0.02 + i)
        ctx.beginPath()
        ctx.arc(px, py, 1.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(199,166,106,${alpha})`
        ctx.fill()
      }

      ctx.save()
      ctx.shadowColor = 'rgba(199,166,106,0.35)'
      ctx.shadowBlur = 18

      // Head
      const headR = W * 0.095
      const headY = cy + headR
      ctx.beginPath()
      ctx.ellipse(cx, headY, headR * 0.82, headR, 0, 0, Math.PI * 2)
      const headGrad = ctx.createRadialGradient(cx - headR * 0.2, headY - headR * 0.2, 2, cx, headY, headR)
      headGrad.addColorStop(0, 'rgba(223,192,138,0.18)')
      headGrad.addColorStop(1, 'rgba(199,166,106,0.05)')
      ctx.fillStyle = headGrad
      ctx.strokeStyle = 'rgba(199,166,106,0.45)'
      ctx.lineWidth = 1.2
      ctx.fill(); ctx.stroke()
      ctx.restore()

      // Neck
      ctx.beginPath()
      ctx.moveTo(cx - W * 0.032, headY + headR * 0.82)
      ctx.lineTo(cx + W * 0.032, headY + headR * 0.82)
      ctx.lineTo(cx + W * 0.038, headY + headR * 1.4)
      ctx.lineTo(cx - W * 0.038, headY + headR * 1.4)
      ctx.closePath()
      ctx.fillStyle = 'rgba(199,166,106,0.06)'
      ctx.strokeStyle = 'rgba(199,166,106,0.25)'
      ctx.lineWidth = 1
      ctx.fill(); ctx.stroke()

      // Torso
      const torsoTop = headY + headR * 1.4
      const torsoH = H * 0.42
      const shoulderW = W * 0.21
      const waistW = W * 0.135
      const hipW = W * 0.165

      ctx.beginPath()
      ctx.moveTo(cx - shoulderW, torsoTop)
      ctx.bezierCurveTo(cx - shoulderW * 1.08, torsoTop + torsoH * 0.15, cx - waistW, torsoTop + torsoH * 0.55, cx - hipW, torsoTop + torsoH)
      ctx.lineTo(cx + hipW, torsoTop + torsoH)
      ctx.bezierCurveTo(cx + waistW, torsoTop + torsoH * 0.55, cx + shoulderW * 1.08, torsoTop + torsoH * 0.15, cx + shoulderW, torsoTop)
      ctx.closePath()
      const torsoGrad = ctx.createLinearGradient(cx - shoulderW, torsoTop, cx + shoulderW, torsoTop + torsoH)
      torsoGrad.addColorStop(0, 'rgba(199,166,106,0.10)')
      torsoGrad.addColorStop(0.5, 'rgba(30,111,106,0.06)')
      torsoGrad.addColorStop(1, 'rgba(199,166,106,0.05)')
      ctx.fillStyle = torsoGrad
      ctx.strokeStyle = 'rgba(199,166,106,0.35)'
      ctx.lineWidth = 1.4
      ctx.fill(); ctx.stroke()

      // Rib guide lines
      for (let r = 0; r < 5; r++) {
        const ry = torsoTop + torsoH * 0.08 + r * torsoH * 0.09
        const rw = (shoulderW * (1 - r * 0.06)) - (r > 2 ? (r - 2) * 9 : 0)
        ctx.beginPath()
        ctx.ellipse(cx, ry, rw * 0.85, torsoH * 0.035, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(199,166,106,${0.1 - r * 0.012})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // Spine guide
      ctx.beginPath()
      ctx.moveTo(cx, headY + headR)
      ctx.lineTo(cx, torsoTop + torsoH)
      ctx.strokeStyle = 'rgba(199,166,106,0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 6])
      ctx.stroke()
      ctx.setLineDash([])

      // Arms
      ;[-1, 1].forEach(side => {
        ctx.beginPath()
        ctx.moveTo(cx + side * shoulderW * 0.9, torsoTop + torsoH * 0.05)
        ctx.bezierCurveTo(
          cx + side * (shoulderW + W * 0.07), torsoTop + torsoH * 0.3,
          cx + side * (shoulderW + W * 0.05), torsoTop + torsoH * 0.65,
          cx + side * (shoulderW + W * 0.035), torsoTop + torsoH * 0.9
        )
        ctx.strokeStyle = 'rgba(199,166,106,0.18)'
        ctx.lineWidth = W * 0.04
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      // Legs
      ;[-1, 1].forEach(side => {
        ctx.beginPath()
        ctx.moveTo(cx + side * hipW * 0.55, torsoTop + torsoH)
        ctx.bezierCurveTo(
          cx + side * (hipW * 0.55 + W * 0.015), torsoTop + torsoH + H * 0.1,
          cx + side * hipW * 0.55, torsoTop + torsoH + H * 0.2,
          cx + side * hipW * 0.5, torsoTop + torsoH + H * 0.3
        )
        ctx.strokeStyle = 'rgba(199,166,106,0.15)'
        ctx.lineWidth = W * 0.055
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      // Organ hotspots
      ORGANS.forEach(o => {
        const ox = (o.x / 100) * W
        const oy = (o.y / 100) * H
        const isActive = active === o.id || hovered === o.id
        const pulse = 0.65 + 0.25 * Math.sin(t * 0.05 + o.x)

        if (isActive) {
          ctx.beginPath()
          ctx.arc(ox, oy, o.r + 12, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(199,166,106,0.12)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(ox, oy, o.r + 6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(199,166,106,0.22)'
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(ox, oy, isActive ? o.r * 0.6 : o.r * 0.45 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? 'rgba(240,221,181,0.95)' : `rgba(199,166,106,${0.55 * pulse})`
        ctx.fill()
        ctx.strokeStyle = isActive ? 'rgba(240,221,181,1)' : 'rgba(199,166,106,0.7)'
        ctx.lineWidth = 1.4
        ctx.stroke()
      })

      frame = t + 1
    }

    function animate() {
      rotRef.current.x += (targetRef.current.x - rotRef.current.x) * 0.06
      rotRef.current.y += (targetRef.current.y - rotRef.current.y) * 0.06
      draw(frame, rotRef.current.x, rotRef.current.y)
      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [active, hovered])

  function findHotspot(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width, H = rect.height
    let found = null
    ORGANS.forEach(o => {
      const ox = (o.x / 100) * W, oy = (o.y / 100) * H
      if (Math.hypot(mx - ox, my - oy) < o.r + 10) found = o
    })
    return { found, mx, my, W, H }
  }

  function handleMouseMove(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    targetRef.current = { x: (my / rect.height - 0.5) * 8, y: (mx / rect.width - 0.5) * 12 }
    const { found } = findHotspot(e)
    setHovered(found?.id || null)
  }

  function handleClick(e) {
    const { found } = findHotspot(e)
    if (found) setActive(found.id)
  }

  const activeOrgan = ORGANS.find(o => o.id === active)

  return (
    <div className="healing-map-grid">
      <div className="body3d-wrapper">
        <canvas
          ref={canvasRef}
          className="body3d-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHovered(null); targetRef.current = { x: 0, y: 0 } }}
          onClick={handleClick}
          style={{ cursor: hovered ? 'pointer' : 'default' }}
        />
        {activeOrgan && (
          <div className="body3d-tooltip">
            <p className="tooltip-label">{activeOrgan.icon} {activeOrgan.label}</p>
            <p className="tooltip-desc">{activeOrgan.desc}</p>
            <button className="tooltip-btn" onClick={() => navigate('/contact')}>Book Consultation →</button>
          </div>
        )}
        <p className="body3d-hint">Tap a glowing point to explore</p>
      </div>

      <div className="healing-map-list">
        {ORGANS.map(o => (
          <div
            key={o.id}
            className={`healing-map-item ${active === o.id ? 'active' : ''}`}
            onMouseEnter={() => setHovered(o.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setActive(o.id)}
          >
            <span className="healing-map-item-dot" />
            <span className="healing-map-item-text">{o.icon} {o.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
