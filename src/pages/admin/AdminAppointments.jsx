import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TABS = ['all', 'pending', 'confirmed', 'cancelled']

function cleanPhone(phone) {
  let p = (phone || '').replace(/[^\d]/g, '')
  if (p.length === 10) p = '91' + p
  return p
}

export default function AdminAppointments() {
  const [appts, setAppts] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
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
    const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false })
    setAppts(data || [])
    setLoading(false)
  }

  async function updateStatus(appt, status) {
    await supabase.from('appointments').update({ status }).eq('id', appt.id)
    setAppts(prev => prev.map(a => a.id === appt.id ? { ...a, status } : a))

    if (status === 'confirmed') {
      const dateStr = appt.preferred_date ? new Date(appt.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'a date our team will confirm'
      const timeStr = appt.preferred_time ? ` at ${appt.preferred_time}` : ''
      const msg = encodeURIComponent(
        `Hi ${appt.name}, this is Usha Multi Speciality Dental Clinic confirming your appointment with Dr. Suresh Kumar for ${appt.service || 'consultation'} on ${dateStr}${timeStr}. Looking forward to seeing you! 🌿`
      )
      window.open(`https://wa.me/${cleanPhone(appt.phone)}?text=${msg}`, '_blank')
    }
  }

  async function updateNotes(id, notes) {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, admin_notes: notes } : a))
    await supabase.from('appointments').update({ admin_notes: notes }).eq('id', id)
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
          {shown.map(a => (
            <div key={a.id} className="admin-appt-card">
              <div className="admin-appt-main">
                <div className="admin-appt-top">
                  <p className="admin-appt-name">{a.name}</p>
                  <span className={`admin-badge admin-badge-${a.status}`}>{a.status}</span>
                </div>
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
                <button className="admin-btn-primary admin-btn-sm" onClick={() => {
                  const params = new URLSearchParams({
                    name: a.name || '',
                    phone: a.phone || '',
                    email: a.email || '',
                    service: a.service || '',
                    message: a.message || '',
                  })
                  navigate(`/admin/patients/new?${params.toString()}`)
                }}>
                  + Add as Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
