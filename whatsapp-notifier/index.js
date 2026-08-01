// index.js
// WhatsApp auto-notifier using Baileys — for task assigned/rejected style events,
// with a browser-friendly QR login (shown in the admin panel instead of terminal).
//
// FIRST TIME SETUP:
//   1. npm install
//   2. node index.js
//   3. Open the admin panel's WhatsApp tab — a QR image will appear there.
//      Scan it with WhatsApp (Settings → Linked Devices → Link a Device)
//      on the phone you're testing with (e.g. 7255049328).
//   4. Once connected, session is saved in ./auth folder — no need to
//      scan again unless you log out or delete that folder.
//
// Endpoints (default port 3001):
//   GET  /status   -> { connected: true/false }
//   GET  /qr       -> { qr: "data:image/png;base64,..." } or { qr: null } once connected
//   POST /notify   -> { "number": "917255049328", "message": "..." }

const makeWASocket = require('@whiskeysockets/baileys').default
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const QRCode = require('qrcode')
const express = require('express')
const cors = require('cors')
const pino = require('pino')

const PORT = process.env.PORT || 3001
let sock = null
let isReady = false
let currentQrDataUrl = null // base64 PNG data URL of the latest QR

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'error' }), // shows real errors from inside Baileys itself
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 })
      console.log('📱 New QR generated — open the admin panel WhatsApp tab to scan it.')
    }

    if (connection === 'close') {
      isReady = false
      currentQrDataUrl = null
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log('Disconnect reason:', lastDisconnect?.error?.message || lastDisconnect?.error, '| statusCode:', statusCode)
      console.log(shouldReconnect ? 'Reconnecting...' : 'Logged out — delete ./auth folder and restart to re-link.')
      if (shouldReconnect) setTimeout(startWhatsApp, 3000)
    } else if (connection === 'open') {
      isReady = true
      currentQrDataUrl = null
      console.log('✅ WhatsApp connected and ready.')
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

// ─── Helper: send a message ─────────────────────────────
// number format: country code + number, no + or spaces. e.g. "917255049328"
async function sendWhatsAppMessage(number, message) {
  if (!isReady) throw new Error('WhatsApp is not connected yet.')
  const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`
  await sock.sendMessage(jid, { text: message })
}

// ─── Small HTTP server your app / admin panel can call ────
const app = express()
app.use(cors()) // allows the admin panel (different origin) to call this
app.use(express.json())

app.get('/status', (req, res) => {
  res.json({ connected: isReady })
})

app.get('/qr', (req, res) => {
  res.json({ qr: currentQrDataUrl, connected: isReady })
})

app.post('/logout', async (req, res) => {
  try {
    if (sock) await sock.logout()
    isReady = false
    currentQrDataUrl = null
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/notify', async (req, res) => {
  const { number, message } = req.body
  if (!number || !message) {
    return res.status(400).json({ ok: false, error: 'number and message are required' })
  }
  try {
    await sendWhatsAppMessage(number, message)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`\n🚀 Notifier server running on http://localhost:${PORT}`)
  console.log(`   Open the admin panel's WhatsApp tab to see the QR and connect.\n`)
})

startWhatsApp()
