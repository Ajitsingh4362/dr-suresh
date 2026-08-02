import { useState, useEffect, useRef } from 'react'

// The Baileys notifier runs locally on whichever computer opens this page
// (see the whatsapp-notifier folder in this repo). It must be running via
// start-hidden.vbs (or `node index.js`) on THIS computer for the tab to work.
const NOTIFIER_URL = 'http://localhost:3001'

export default function AdminWhatsApp() {
  const [connected, setConnected] = useState(false)
  const [qr, setQr] = useState(null)
  const [serverReachable, setServerReachable] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [checkedOnce, setCheckedOnce] = useState(false)
  const pollRef = useRef(null)

  // On load: just check status once (no QR fetch yet) so we know
  // whether it's already connected, without needing a click.
  useEffect(() => {
    checkStatus()
    return () => clearInterval(pollRef.current)
  }, [])

  async function checkStatus() {
    try {
      const res = await fetch(`${NOTIFIER_URL}/status`)
      const data = await res.json()
      setServerReachable(true)
      setConnected(data.connected)
    } catch (e) {
      setServerReachable(false)
    }
    setCheckedOnce(true)
  }

  // Called when the user clicks "Generate QR"
  function handleGenerateQr() {
    setGenerating(true)
    setQr(null)
    pollQr() // fetch immediately
    pollRef.current = setInterval(pollQr, 2000)
  }

  async function pollQr() {
    try {
      const res = await fetch(`${NOTIFIER_URL}/qr`)
      const data = await res.json()
      setServerReachable(true)
      setConnected(data.connected)
      setQr(data.qr)
      if (data.connected) {
        clearInterval(pollRef.current)
        setGenerating(false)
      }
    } catch (e) {
      setServerReachable(false)
      clearInterval(pollRef.current)
      setGenerating(false)
    }
  }

  async function handleLogout() {
    if (!confirm('Disconnect WhatsApp? You will need to scan the QR again to reconnect.')) return
    setLoggingOut(true)
    try {
      await fetch(`${NOTIFIER_URL}/logout`, { method: 'POST' })
    } catch (e) { /* ignore */ }
    setLoggingOut(false)
    setQr(null)
    setGenerating(false)
    clearInterval(pollRef.current)
    checkStatus()
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
            Couldn't reach the WhatsApp service on this computer. Make sure the notifier is running — double-click
            <code> start-hidden.vbs</code> in the <code>whatsapp-notifier</code> folder, then refresh this page. This
            only works when opened on the same computer the notifier is running on.
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

      {serverReachable && !connected && checkedOnce && (
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '28px', textAlign: 'center' }}>
          {!qr && !generating && (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 18px', fontFamily: 'var(--font-body)' }}>
                Not connected yet. Click below to generate a QR code.
              </p>
              <button className="admin-btn-primary admin-btn-sm" onClick={handleGenerateQr}>
                Generate QR
              </button>
            </>
          )}

          {generating && !qr && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Generating QR code...</p>
          )}

          {qr && (
            <>
              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--navy-800)', margin: '0 0 16px', fontFamily: 'var(--font-body)' }}>
                Scan with WhatsApp — Settings → Linked Devices → Link a Device
              </p>
              <img src={qr} alt="WhatsApp QR code" style={{ width: '260px', height: '260px', border: '8px solid white', borderRadius: '4px', boxShadow: '0 4px 16px rgba(15,39,68,0.12)' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px', fontFamily: 'var(--font-body)' }}>
                QR refreshes automatically — keep this page open while scanning.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
