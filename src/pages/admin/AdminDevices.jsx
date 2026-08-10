import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function parseDevice(ua) {
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'

  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari'

  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  const isMobile = /Mobi|Android|iPhone/.test(ua)
  return { browser, os, deviceName: `${browser} on ${os}${isMobile ? ' (Mobile)' : ''}` }
}

// Records the current login as a session row. Call this right after a successful login.
export async function recordSession() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ua = navigator.userAgent
    const { browser, os, deviceName } = parseDevice(ua)

    let geo = {}
    try {
      const res = await fetch('https://ipapi.co/json/')
      if (res.ok) {
        const j = await res.json()
        geo = { ip: j.ip, city: j.city, region: j.region, country: j.country_name }
      }
    } catch { /* location lookup optional, ignore failures */ }

    const sessionId = crypto.randomUUID()
    localStorage.setItem('admin_session_id', sessionId)

    await supabase.from('admin_sessions').insert({
      id: sessionId,
      user_id: user.id,
      device_name: deviceName,
      browser, os,
      ip: geo.ip || null,
      city: geo.city || null,
      region: geo.region || null,
      country: geo.country || null,
    })
  } catch (e) {
    console.error('recordSession error:', e)
  }
}

// Poll to see if this session has been remotely revoked; if so, sign out.
export async function checkRevoked() {
  const sessionId = localStorage.getItem('admin_session_id')
  if (!sessionId) return false
  const { data } = await supabase.from('admin_sessions').select('revoked').eq('id', sessionId).single()
  if (data?.revoked) {
    await supabase.auth.signOut()
    localStorage.removeItem('admin_session_id')
    return true
  }
  return false
}

export default function AdminDevices() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const currentSessionId = localStorage.getItem('admin_session_id')

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 15000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSessions() {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('revoked', false)
      .order('last_seen_at', { ascending: false })
    if (!error) setSessions(data || [])
    setLoading(false)
  }

  async function revoke(id) {
    if (!confirm('Logout this device?')) return
    await supabase.from('admin_sessions').update({ revoked: true }).eq('id', id)
    fetchSessions()
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header" style={{ display: 'block' }}>
        <h1>🖥️ Logged-in Devices</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '6px 0 0' }}>See where your admin account is logged in, and log out any device remotely.</p>
      </div>

      {loading ? (
        <p className="admin-empty">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="admin-empty">No active sessions found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map(s => (
            <div key={s.id} className="admin-device-card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap',
              padding: '16px 20px', borderRadius: '8px',
              background: 'var(--navy-800, #10233d)', border: s.id === currentSessionId ? '1px solid var(--gold, #c7a66a)' : '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ minWidth: '200px', flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: 'var(--ivory, #FAF8F4)' }}>
                  {s.device_name || 'Unknown device'}
                  {s.id === currentSessionId && (
                    <span style={{ marginLeft: '10px', fontSize: '11px', color: 'var(--gold, #c7a66a)', fontWeight: 600 }}>THIS DEVICE</span>
                  )}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gold-pale, #f0ddb5)', opacity: 0.85 }}>
                  📍 {[s.city, s.region, s.country].filter(Boolean).join(', ') || 'Unknown location'}
                  {s.ip ? ` · ${s.ip}` : ''}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gold-pale, #f0ddb5)', opacity: 0.6 }}>
                  Logged in {timeAgo(s.created_at)} · Last active {timeAgo(s.last_seen_at)}
                </p>
              </div>
              <button onClick={() => revoke(s.id)} className="admin-device-logout-btn" style={{
                padding: '9px 18px', fontSize: '13px', borderRadius: '6px', border: 'none',
                background: '#b3332e', color: '#fff', cursor: 'pointer', fontWeight: 600, flexShrink: 0,
              }}>
                Logout
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .admin-device-logout-btn { width: 100%; padding: 12px !important; }
        }
      `}</style>
    </div>
  )
}
