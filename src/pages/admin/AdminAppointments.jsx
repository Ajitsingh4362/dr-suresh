import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TABS = ['all', 'pending', 'confirmed', 'cancelled']
const WHATSAPP_API = 'https://dr-suresh-whatsapp.onrender.com'
const WHATSAPP_FOOTER = '\n\n*Book your appointment on www.ushadental.com*'

// Last 10 digits — so "+91 98765 43210", "098765 43210" and "9876543210" all match.
function phoneKey(phone) {
  const d = (phone || '').replace(/[^\d]/g, '')
  return d.length >= 10 ? d.slice(-10) : ''
}

function cleanPhone(phone) {
  let p = (phone || '').replace(/[^\d]/g, '')
  if (p.length === 10) p = '91' + p
  return p
}

// Short Hindi line on top, a divider, then the English message below — keeps
// every WhatsApp message bilingual without doubling its length.
function bilingual(hindiLine, englishBody) {
  return `${hindiLine}\n➖➖➖➖➖➖➖➖➖➖\n${englishBody}`
}

export default function AdminAppointments() {
  const [appts, setAppts] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppts()

    // Real-time — naya appointment aate hi turant dikh jaye
    const channel = supabase
      .channel('appointments-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, () => {
        fetchAppts()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchAppts() {
    const [{ data }, { data: pts }] = await Promise.all([
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('patients').select('id, name, phone, patient_code'),
    ])
    setAppts(data || [])
    setPatients(pts || [])
    setLoading(false)
  }

  async function updateStatus(appt, status) {
    await supabase.from('appointments').update({ status }).eq('id', appt.id)
    setAppts(prev => prev.map(a => a.id === appt.id ? { ...a, status } : a))

    if (status === 'confirmed') {
      const dateStr = appt.preferred_date ? new Date(appt.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'a date our team will confirm'
      const timeStr = appt.preferred_time ? ` at ${appt.preferred_time}` : ''
      const englishMsg = `Hi ${appt.name}, this is Usha Multi Speciality Dental Clinic confirming your appointment with Dr. Suresh Kumar for ${appt.service || 'consultation'} on ${dateStr}${timeStr}. Looking forward to seeing you!`
      const msg = bilingual(`Namaste ${appt.name}, aapki appointment confirm ho gayi hai — ${dateStr}${timeStr} ko milte hain.`, englishMsg) + WHATSAPP_FOOTER

      try {
        const res = await fetch(`${WHATSAPP_API}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: cleanPhone(appt.phone), message: msg, type: 'appointment_confirmation', name: appt.name }),
        })
        const data = await res.json()
        if (!data.ok) throw new Error(data.error || ('HTTP ' + res.status))
      } catch (err) {
        alert('Appointment confirmed, but the automatic WhatsApp message failed:\n\n' + err.message)
      }
    }
  }

  async function updateNotes(id, notes) {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, admin_notes: notes } : a))
    await supabase.from('appointments').update({ admin_notes: notes }).eq('id', id)
  }

  // Which existing patient(s) does this appointment belong to? Linked
  // appointments (booked from the Patient Dashboard, or already added) use
  // patient_id; website-form bookings are matched by mobile number.
  const patientsById = Object.fromEntries(patients.map(p => [p.id, p]))
  const patientsByPhone = {}
  patients.forEach(p => {
    const k = phoneKey(p.phone)
    if (k) (patientsByPhone[k] = patientsByPhone[k] || []).push(p)
  })
  function matchesFor(a) {
    if (a.patient_id && patientsById[a.patient_id]) return [patientsById[a.patient_id]]
    return patientsByPhone[phoneKey(a.phone)] || []
  }
  const isPortal = a => (a.message || '').startsWith('Booked from Patient Dashboard')

  async function openProfile(a, p) {
    // Link this appointment to the patient so it shows in their profile too.
    if (!a.patient_id) {
      await supabase.from('appointments').update({ patient_id: p.id }).eq('id', a.id)
    }
    navigate(`/admin/patients/${p.id}`)
  }

  const shown = tab === 'all' ? appts : appts.filter(a => a.status === tab)
  const counts = { all: appts.length, pending: appts.filter(a => a.status === 'pending').length, confirmed: appts.filter(a => a.status === 'confirmed').length, cancelled: appts.filter(a => a.status === 'cancelled').length }
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Appointments</h1>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} <span className="admin-tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {loading ? <p className="admin-empty">Loading...</p> : shown.length === 0 ? (
        <p className="admin-empty">No appointments here.</p>
      ) : (
        <div className="admin-appt-list">
          {shown.map(a => {
            const matches = matchesFor(a)
            return (
            <div key={a.id} className="admin-appt-card">
              <div className="admin-appt-main">
                <div className="admin-appt-top">
                  <p className="admin-appt-name">{a.name}</p>
                  <span className={`admin-badge admin-badge-${a.status}`}>{a.status}</span>
                  {isPortal(a) && (
                    <span className="admin-badge" style={{ background: 'rgba(122,35,49,0.1)', color: 'var(--maroon)' }}>Patient Dashboard</span>
                  )}
                </div>
                {matches.length > 0 ? (
                  <p className="admin-appt-line" style={{ color: '#2563a8', fontWeight: 600 }}>
                    ✅ Existing patient: {matches.map(p => `${p.name} (${p.patient_code})`).join(', ')}
                  </p>
                ) : (
                  <p className="admin-appt-line" style={{ color: '#9c7a3c', fontWeight: 600 }}>🆕 New patient — not in records yet</p>
                )}
                <p className="admin-appt-line">📞 {a.phone}{a.email ? ` · ✉️ ${a.email}` : ''}</p>
                <p className="admin-appt-line">🩺 {a.service || 'General consultation'}</p>
                <p className="admin-appt-line">📅 {fmt(a.preferred_date)} {a.preferred_time ? `· ${a.preferred_time}` : ''}</p>
                {a.message && <p className="admin-appt-message">"{a.message}"</p>}
                <p className="admin-appt-line admin-appt-created">Requested {new Date(a.created_at).toLocaleString('en-IN')}</p>

                <textarea
                  className="admin-appt-notes"
                  placeholder="Internal notes for this patient..."
                  defaultValue={a.admin_notes || ''}
                  onBlur={e => updateNotes(a.id, e.target.value)}
                />
              </div>
              <div className="admin-appt-actions">
                {a.status !== 'confirmed' && (
                  <button className="admin-btn-primary admin-btn-sm" onClick={() => updateStatus(a, 'confirmed')}>
                    Confirm & WhatsApp
                  </button>
                )}
                {a.status !== 'cancelled' && (
                  <button className="admin-btn-outline admin-btn-sm" onClick={() => updateStatus(a, 'cancelled')}>
                    Cancel
                  </button>
                )}
                {a.status !== 'pending' && (
                  <button className="admin-btn-outline admin-btn-sm" onClick={() => updateStatus(a, 'pending')}>
                    Mark Pending
                  </button>
                )}
                <a className="admin-btn-outline admin-btn-sm" href={`https://wa.me/${cleanPhone(a.phone)}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                {matches.map(p => (
                  <button key={p.id} className="admin-btn-primary admin-btn-sm" onClick={() => openProfile(a, p)}>
                    Open {matches.length > 1 ? p.name.split(' ')[0] + "'s" : ''} Profile
                  </button>
                ))}
                {!a.patient_id && (
                  <button className={matches.length ? 'admin-btn-outline admin-btn-sm' : 'admin-btn-primary admin-btn-sm'} onClick={() => {
                    if (matches.length && !window.confirm(
                      `This mobile number already belongs to: ${matches.map(p => `${p.name} (${p.patient_code})`).join(', ')}.\n\nOnly create a NEW patient if this is a different person (e.g. a family member). Continue?`
                    )) return
                    const params = new URLSearchParams({
                      name: a.name || '',
                      phone: a.phone || '',
                      email: a.email || '',
                      service: a.service || '',
                      message: a.message || '',
                      appointment_id: a.id,
                    })
                    navigate(`/admin/patients/new?${params.toString()}`)
                  }}>
                    {matches.length ? '+ New (family member)' : '+ Add as Patient'}
                  </button>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
