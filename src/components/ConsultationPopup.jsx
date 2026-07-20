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
        {/* Top-left ornamental corner */}
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.5, pointerEvents: 'none' }}>
          <path d="M0,40 Q0,0 40,0" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
          <path d="M0,60 Q0,0 60,0" stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="40" cy="0" r="2.5" fill="var(--gold)" />
          <circle cx="0" cy="40" r="2.5" fill="var(--gold)" />
          <circle cx="16" cy="16" r="1.8" fill="var(--gold)" opacity="0.7" />
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
