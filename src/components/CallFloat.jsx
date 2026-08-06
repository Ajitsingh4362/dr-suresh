import React, { useState } from 'react'

export default function CallFloat() {
  const [hovered, setHovered] = useState(false)
  const phone = '918987367274'
  return (
    <a href={`tel:+${phone}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: 'fixed', bottom: '92px', right: '28px', zIndex: 998, display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
      aria-label="Call the clinic">
      {hovered && (
        <span style={{ background: 'var(--navy-800)', color: 'var(--gold-pale)', fontSize: '12px', fontFamily: 'var(--font-body)', padding: '6px 14px', borderRadius: '2px', whiteSpace: 'nowrap', border: '1px solid rgba(199,166,106,0.3)', boxShadow: 'var(--shadow-md)' }}>
          Call +91 89873 67274
        </span>
      )}
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%', background: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(199,166,106,0.5)',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'var(--transition)',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--navy-900)">
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.49a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"/>
        </svg>
      </div>
    </a>
  )
}
