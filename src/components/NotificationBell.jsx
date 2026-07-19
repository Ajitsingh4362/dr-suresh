import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from '../hooks/useNotifications'

function cleanPhone(phone) {
  let p = (phone || '').replace(/[^\d]/g, '')
  if (p.length === 10) p = '91' + p
  return p
}

export default function NotificationBell() {
  const { permission, supported, requestPermission } = useNotifications()
  const [pendingAppts, setPendingAppts] = useState(0)
  const [followUps, setFollowUps] = useState([])
  const [showToast, setShowToast] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchPending()
    fetchFollowUps()

    const channel = supabase.channel('bell-notif')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        fetchPending()
        if (payload.eventType === 'INSERT') {
          const appt = payload.new
          setShowToast({ name: appt.name, service: appt.service || 'General' })
          setTimeout(() => setShowToast(null), 5000)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_consultations' }, () => {
        fetchFollowUps()
      })
      .subscribe()

    // Re-check follow-ups once a day is enough, but also refresh on focus
    const onFocus = () => fetchFollowUps()
    window.addEventListener('focus', onFocus)

    return () => { supabase.removeChannel(channel); window.removeEventListener('focus', onFocus) }
  }, [])

  async function fetchPending() {
    const { count } = await supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    setPendingAppts(count || 0)
  }

  async function fetchFollowUps() {
    const today = new Date()
    const in2Days = new Date(today)
    in2Days.setDate(in2Days.getDate() + 2)
    const todayStr = today.toISOString().split('T')[0]
    const in2DaysStr = in2Days.toISOString().split('T')[0]

    const { data } = await supabase
      .from('patient_consultations')
      .select('id, follow_up_date, follow_up_notes, patient_id, patients ( id, name, phone )')
      .not('follow_up_date', 'is', null)
      .gte('follow_up_date', todayStr)
      .lte('follow_up_date', in2DaysStr)
      .order('follow_up_date', { ascending: true })

    setFollowUps(data || [])
  }

  function sendFollowUpWhatsApp(f) {
    if (!f.patients?.phone) return
    const dateStr = new Date(f.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
    const msg = encodeURIComponent(
      `Hi ${f.patients.name}, this is Usha Multi Speciality Dental Clinic. This is a reminder that your follow-up with Dr. Suresh Kumar is scheduled on ${dateStr}. Please let us know if this works for you, or if you'd like to reschedule. 🦷`
    )
    window.open(`https://wa.me/${cleanPhone(f.patients.phone)}?text=${msg}`, '_blank')
  }

  const totalBadge = pendingAppts + followUps.length

  if (!supported) return null

  return (
    <>
      {/* Bell button in sidebar */}
      <div style={{ padding: '0 10px', marginBottom: '8px', position: 'relative' }}>
        {permission === 'granted' ? (
          <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={{ fontSize: '16px' }}>🔔</span>
              {totalBadge > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#c0392b', color: '#fff', fontSize: '9px', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
                  {totalBadge > 9 ? '9+' : totalBadge}
                </span>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>
              {totalBadge > 0 ? `${totalBadge} notification${totalBadge > 1 ? 's' : ''}` : 'Notifications on'}
            </span>
          </button>
        ) : (
          <button onClick={requestPermission} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '2px', padding: '9px 12px', color: '#fff', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}>
            🔔 Enable Notifications
          </button>
        )}

        {/* Dropdown panel */}
        {open && permission === 'granted' && (
          <div style={{ position: 'absolute', left: '0', top: '100%', marginTop: '6px', width: '300px', maxHeight: '360px', overflowY: 'auto', background: 'var(--white)', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '6px', boxShadow: '0 12px 36px rgba(0,0,0,0.25)', zIndex: 500 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,39,68,0.08)', fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--navy-800)' }}>
              Notifications
            </div>

            {pendingAppts > 0 && (
              <a href="/admin/appointments" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid rgba(15,39,68,0.06)', textDecoration: 'none', color: 'var(--navy-800)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>📋 {pendingAppts} pending appointment{pendingAppts > 1 ? 's' : ''}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Tap to review and confirm</p>
              </a>
            )}

            {followUps.length === 0 && pendingAppts === 0 && (
              <p style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>You're all caught up 🎉</p>
            )}

            {followUps.map(f => {
              const isToday = f.follow_up_date === new Date().toISOString().split('T')[0]
              const dateLabel = new Date(f.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              return (
                <div key={f.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(15,39,68,0.06)' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-800)', margin: '0 0 3px' }}>
                    🦷 Follow-up: {f.patients?.name || 'Patient'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                    {isToday ? 'Today' : `On ${dateLabel}`} — Your follow-up is on {dateLabel}
                  </p>
                  <button
                    onClick={() => sendFollowUpWhatsApp(f)}
                    disabled={!f.patients?.phone}
                    style={{ fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '2px', border: 'none', background: '#25D366', color: '#fff', cursor: f.patients?.phone ? 'pointer' : 'not-allowed', opacity: f.patients?.phone ? 1 : 0.5 }}>
                    💬 Send WhatsApp Reminder
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Toast popup — new appointment */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--navy-800)', border: '1px solid rgba(199,166,106,0.3)', borderRadius: '4px', padding: '16px 20px', zIndex: 9999, boxShadow: '0 8px 32px rgba(7,15,28,0.35)', maxWidth: '320px', animation: 'popIn 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)', borderRadius: '4px 4px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>🦷</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--gold-pale)', margin: '0 0 4px' }}>New Appointment!</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', margin: '0 0 10px', lineHeight: 1.5 }}>
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{showToast.name}</strong> requested {showToast.service}
              </p>
              <a href="/admin/appointments" style={{ fontSize: '11px', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px' }}>View Appointment →</a>
            </div>
            <button onClick={() => setShowToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', padding: '0', flexShrink: 0 }}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
