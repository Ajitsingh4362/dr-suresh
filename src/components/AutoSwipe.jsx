import { useEffect, useState } from 'react'

export default function AutoSwipe({ images, interval = 2000, height }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % images.length)
    }, interval)
    return () => clearInterval(id)
  }, [images.length, interval])

  return (
    <div style={{
      position: 'relative', width: '100%',
      borderRadius: '14px', overflow: 'hidden',
      border: '2px solid rgba(199,166,106,0.35)',
      boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)',
    }}>
      {images.map((img, i) => (
        <img key={img} src={img} alt="" style={{
          width: '100%',
          height: height || 'auto',
          objectFit: height ? 'cover' : undefined,
          display: i === index ? 'block' : 'none',
        }} />
      ))}
      <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
        {images.map((_, i) => (
          <div key={i} style={{
            width: i === index ? '18px' : '6px', height: '6px', borderRadius: '3px',
            background: i === index ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}
