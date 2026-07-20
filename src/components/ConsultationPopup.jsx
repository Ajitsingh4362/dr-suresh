import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ConsultationPopup({ onClose }) {
  const [settings, setSettings] = useState({ title: 'Book Your Consultation', subtitle: 'Take the first step towards holistic healing' })

  useEffect(() => {
    supabase.from('popup_settings').select('*').single().then(({ data }) => {
      if (data) setSettings(data)
    })
  }, [])

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={e => e.stopPropagation()}>
        {/* Top-left diamond pattern */}
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.55, pointerEvents: 'none' }}>
          <rect x="8" y="8" width="22" height="22" fill="none" stroke="var(--gold)" strokeWidth="1.5" transform="rotate(45 19 19)" />
          <rect x="34" y="-6" width="14" height="14" fill="var(--gold)" opacity="0.25" transform="rotate(45 41 1)" />
          <rect x="-6" y="34" width="14" height="14" fill="var(--gold)" opacity="0.25" transform="rotate(45 1 41)" />
          <rect x="24" y="24" width="8" height="8" fill="var(--gold)" opacity="0.6" transform="rotate(45 28 28)" />
        </svg>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="popup-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/usha-dental-logo.png" alt="Usha Multi Speciality Dental Clinic" style={{ height: '130px', width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
        </div>
        <h2 className="popup-title">{settings.title}</h2>
        <p className="popup-sub">{settings.subtitle}</p>
        <Link to="/contact" onClick={onClose} className="btn-primary popup-btn">Book Now</Link>
        <button className="popup-skip" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  )
}
