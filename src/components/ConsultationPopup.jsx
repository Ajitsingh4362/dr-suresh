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
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.55, pointerEvents: 'none' }}>
          <rect x="14" y="14" width="34" height="34" fill="none" stroke="var(--gold)" strokeWidth="1.5" transform="rotate(45 31 31)" />
          <rect x="56" y="-10" width="22" height="22" fill="var(--gold)" opacity="0.22" transform="rotate(45 67 1)" />
          <rect x="-10" y="56" width="22" height="22" fill="var(--gold)" opacity="0.22" transform="rotate(45 1 67)" />
          <rect x="40" y="40" width="12" height="12" fill="var(--gold)" opacity="0.6" transform="rotate(45 46 46)" />
          <rect x="72" y="8" width="10" height="10" fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.4" transform="rotate(45 77 13)" />
          <rect x="8" y="72" width="10" height="10" fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.4" transform="rotate(45 13 77)" />
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
