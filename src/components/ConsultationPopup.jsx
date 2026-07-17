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
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="popup-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/mind_motion_matrix_navbar_logo.png" alt="Usha Multi Speciality Dental Clinic" style={{ height: '80px', width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
        </div>
        <h2 className="popup-title">{settings.title}</h2>
        <p className="popup-sub">{settings.subtitle}</p>
        <Link to="/contact" onClick={onClose} className="btn-primary popup-btn">Book Now</Link>
        <button className="popup-skip" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  )
}
