import { useState, useEffect, useRef } from 'react'

// The Baileys notifier runs locally on whichever computer opens this page
// (see the whatsapp-task-notifier project). It's not deployed on the internet,
// so this always talks to localhost — this page only works when opened on
// the same machine that has `node index.js` running.
const NOTIFIER_URL = 'http://localhost:3001'

export default function AdminWhatsApp() {
  const [connected, setConnected] = useState(false)
  const [qr, setQr] = useState(null)
  const [serverReachable, setServerReachable] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    poll()
    pollRef.current = setInterval(poll, 2500)
    return () => clearInterval(pollRef.current)
  }, [])

  async function poll() {
    try {
      const res = await fetch(`${NOTIFIER_URL}/qr`)
      const data = await res.json()
      setServerReachable(true)
      setConnected(data.connected)
      setQr(data.qr)
    } catch (e) {
      setServerReachable(false)
    }
  }

  async function handleLogout() {
    if (!confirm('Disconnect WhatsApp? You will need to scan the QR again to reconnect.')) return
    setLoggingOut(true)
    try {
      await fetch(`${NOTIFIER_URL}/logout`, { method: 'POST' })
    } catch (e) { /* ignore */ }
    setLoggingOut(false)
    poll()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>WhatsApp Notifications</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
            Link a WhatsApp number to send automatic task / follow-up messages.
          </p>
        </div>
      </div>

      {!serverReachable && (
        <div style={{ background: '#fdf1ef', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '2px', padding: '18px 20px', marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#c0392b', margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>Notifier not running</p>
          <p style={{ fontSize: '12.5px', color: '#8a4a42', margin: 0, fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            Couldn't reach <code>localhost:3001</code>. Open a terminal on <strong>this computer</strong>, go to the
            <code> whatsapp-task-notifier</code> folder, and run <code>node index.js</code> — then this page will pick it up automatically.
          </p>
        </div>
      )}

      {serverReachable && connected && (
        <div style={{ background: '#eefaf3', border: '1px solid rgba(30,143,90,0.25)', borderRadius: '2px', padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
          <p style={{ fontWeight: 600, fontSize: '15px', color: '#1e8f5a', margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>WhatsApp Connected</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 18px', fontFamily: 'var(--font-body)' }}>
            Notifications will be sent from the linked number.
          </p>
          <button className="admin-btn-outline admin-btn-sm" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      )}

      {serverReachable && !connected && (
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '28px', textAlign: 'center' }}>
          {qr ? (
            <>
              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--navy-800)', margin: '0 0 16px', fontFamily: 'var(--font-body)' }}>
                Scan with WhatsApp — Settings → Linked Devices → Link a Device
              </p>
              <img src={qr} alt="WhatsApp QR code" style={{ width: '260px', height: '260px', border: '8px solid white', borderRadius: '4px', boxShadow: '0 4px 16px rgba(15,39,68,0.12)' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px', fontFamily: 'var(--font-body)' }}>
                QR refreshes automatically — keep this page open while scanning.
              </p>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Waiting for QR code from the notifier...</p>
          )}
        </div>
      )}
    </div>
  )
}
