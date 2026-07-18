import { useRef, useState } from 'react'

export default function Tilt3D({ image, alt = '', maxTilt = 14 }) {
  const ref = useRef(null)
  const [style, setStyle] = useState({})

  function handleMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * maxTilt * 2
    const rotateX = (0.5 - y) * maxTilt * 2
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`,
      '--glow-x': `${x * 100}%`,
      '--glow-y': `${y * 100}%`,
    })
  }

  function handleLeave() {
    setStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="tilt3d-wrap"
      style={{
        perspective: '1000px',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <div
        className="tilt3d-card"
        style={{
          ...style,
          transition: 'transform 0.15s ease-out',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '2px solid rgba(199,166,106,0.4)',
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(199,166,106,0.15)',
          position: 'relative',
        }}
      >
        <img src={image} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(199,166,106,0.12), transparent 50%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
