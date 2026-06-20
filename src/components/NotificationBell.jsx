import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationBell() {
  const { permission, supported, requestPermission } = useNotifications()
  const [pending, setPending] = useState(0)
  const [showToast, setShowToast] = useState(null)

  useEffect(() => {
    fetchPending()

    const channel = supabase.channel('bell-notif')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        fetchPending()
        if (payload.eventType === 'INSERT') {
          const appt = payload.new
          setShowToast({ name: appt.name, service: appt.service || 'General' })
          setTimeout(() => setShowToast(null), 5000)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchPending() {
    const { count } = await supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    setPending(count || 0)
  }

  if (!supported) return null

  return (
    <>
      {/* Bell button in sidebar */}
      <div style={{ padding: '0 10px', marginBottom: '8px' }}>
        {permission === 'granted' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px' }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={{ fontSize: '16px' }}>🔔</span>
              {pending > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#c0392b', color: '#fff', fontSize: '9px', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
                  {pending > 9 ? '9+' : pending}
                </span>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}>
              {pending > 0 ? `${pending} pending` : 'Notifications on'}
            </span>
          </div>
        ) : (
          <button onClick={requestPermission} style={{ width: '100%', background: 'rgba(199,166,106,0.12)', border: '1px solid rgba(199,166,106,0.25)', borderRadius: '2px', padding: '9px 12px', color: 'var(--gold-pale)', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(199,166,106,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(199,166,106,0.12)'}>
            🔔 Enable Notifications
          </button>
        )}
      </div>

      {/* Toast popup — new appointment */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--navy-800)', border: '1px solid rgba(199,166,106,0.3)', borderRadius: '4px', padding: '16px 20px', zIndex: 9999, boxShadow: '0 8px 32px rgba(7,15,28,0.35)', maxWidth: '320px', animation: 'popIn 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)', borderRadius: '4px 4px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>🌿</span>
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
