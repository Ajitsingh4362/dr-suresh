// index.js
// WhatsApp auto-notifier using Baileys — for task assigned/rejected style events,
// with a browser-friendly QR login (shown in the admin panel instead of terminal),
// PLUS an automatic daily follow-up reminder check (patients due in the next 2 days).
//
// FIRST TIME SETUP:
//   1. npm install
//   2. node index.js
//   3. Open the admin panel's WhatsApp tab — a QR image will appear there.
//      Scan it with WhatsApp (Settings -> Linked Devices -> Link a Device)
//      on the phone you're testing with (e.g. 7255049328).
//   4. Once connected, session is saved in ./auth folder — no need to
//      scan again unless you log out or delete that folder.
//
// Endpoints (default port 3001):
//   GET  /status          -> { connected: true/false }
//   GET  /qr               -> { qr: "data:image/png;base64,..." } or { qr: null } once connected
//   POST /notify           -> { "number": "917255049328", "message": "..." }
//   POST /logout           -> disconnects WhatsApp
//   POST /check-followups  -> manually trigger the follow-up reminder check (for testing)

const makeWASocket = require('@whiskeysockets/baileys').default
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const QRCode = require('qrcode')
const express = require('express')
const cors = require('cors')
const pino = require('pino')
const cron = require('node-cron')
const { createClient } = require('@supabase/supabase-js')

const PORT = process.env.PORT || 3001
let sock = null
let isReady = false
let currentQrDataUrl = null // base64 PNG data URL of the latest QR

// Same public Supabase project the website uses (anon key — already public in the frontend)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://scihrslohphuakyczrkv.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWhyc2xvaHBodWFreWN6cmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTY1NjAsImV4cCI6MjEwMDAzMjU2MH0.v3sAY8Gm6N94h1MdzQabHevm7Fy8COEKLgUsX74LKBs'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()
  console.log('Using WhatsApp Web version:', version.join('.'))

  sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'error' }), // shows real errors from inside Baileys itself
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 })
      console.log('New QR generated — open the admin panel WhatsApp tab to scan it.')
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
      console.log('WhatsApp connected and ready.')
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

// ─── Helper: send a message ─────────────────────────────
// number format: country code + number, no + or spaces. e.g. "917255049328"
async function sendWhatsAppMessage(number, message, mentionNumber) {
  if (!isReady) throw new Error('WhatsApp is not connected yet.')

  let jid
  if (number.includes('@g.us') || number.includes('@')) {
    // Already a full JID (group or otherwise) — use as-is
    jid = number
  } else {
    // Raw phone number — ask WhatsApp to resolve the actual ID first.
    // Sending straight to "<number>@s.whatsapp.net" without this can
    // silently fail to deliver for some accounts.
    const results = await sock.onWhatsApp(number)
    const match = results && results[0]
    if (!match || !match.exists) {
      throw new Error(`${number} does not appear to be a valid WhatsApp number`)
    }
    jid = match.jid
  }

  const payload = { text: message }
  if (mentionNumber) {
    const mentionJid = mentionNumber.includes('@') ? mentionNumber : `${mentionNumber}@s.whatsapp.net`
    payload.mentions = [mentionJid]
  }

  await sock.sendMessage(jid, payload)
}

function cleanPhone(phone) {
  let p = (phone || '').replace(/[^\d]/g, '')
  if (p.length === 10) p = '91' + p
  return p
}

// ─── Automatic follow-up reminder check ──────────────────
// Mirrors the logic that used to be a manual button in the admin panel:
// finds patients with a follow-up date within the next 2 days that haven't
// been reminded today yet, and sends them a WhatsApp message automatically.
async function checkFollowUpsAndNotify() {
  console.log('Running follow-up reminder check...')
  if (!isReady) {
    console.log('  Skipped — WhatsApp not connected.')
    return { checked: 0, sent: 0, skipped: 'not_connected' }
  }

  const today = new Date()
  const in2Days = new Date(today)
  in2Days.setDate(in2Days.getDate() + 2)
  const todayStr = today.toISOString().split('T')[0]
  const in2DaysStr = in2Days.toISOString().split('T')[0]

  const { data: rows, error: err1 } = await supabase
    .from('patient_consultations')
    .select('id, follow_up_date, patient_id, last_reminder_sent_date')
    .not('follow_up_date', 'is', null)
    .gte('follow_up_date', todayStr)
    .lte('follow_up_date', in2DaysStr)

  if (err1) {
    console.error('  Error fetching consultations:', err1.message)
    return { checked: 0, sent: 0, error: err1.message }
  }

  const due = (rows || []).filter(r => r.last_reminder_sent_date !== todayStr)
  if (due.length === 0) {
    console.log('  No follow-ups due today.')
    return { checked: 0, sent: 0 }
  }

  const patientIds = [...new Set(due.map(r => r.patient_id))]
  const { data: patients, error: err2 } = await supabase
    .from('patients')
    .select('id, name, phone')
    .in('id', patientIds)

  if (err2) {
    console.error('  Error fetching patients:', err2.message)
    return { checked: due.length, sent: 0, error: err2.message }
  }

  const ptMap = {}
  ;(patients || []).forEach(p => { ptMap[p.id] = p })

  let sentCount = 0
  for (const row of due) {
    const patient = ptMap[row.patient_id]
    if (!patient?.phone) continue

    const daysAway = Math.round((new Date(row.follow_up_date) - new Date(todayStr)) / 86400000)
    const dateStr = new Date(row.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

    let line
    if (daysAway <= 0) line = `Today is your follow-up date with Dr. Suresh Kumar at Usha Multi Speciality Dental Clinic.`
    else if (daysAway === 1) line = `This is a reminder that your follow-up with Dr. Suresh Kumar is tomorrow, ${dateStr}.`
    else line = `This is a reminder that your follow-up with Dr. Suresh Kumar is scheduled on ${dateStr}.`

    const msg = `Hi ${patient.name}, this is Usha Multi Speciality Dental Clinic. ${line} Please let us know if this works for you, or if you'd like to reschedule.`

    try {
      await sendWhatsAppMessage(cleanPhone(patient.phone), msg)
      await supabase.from('patient_consultations').update({ last_reminder_sent_date: todayStr }).eq('id', row.id)
      sentCount++
      console.log(`  Sent reminder to ${patient.name} (${patient.phone})`)
      await new Promise(r => setTimeout(r, 2000)) // small gap between messages
    } catch (err) {
      console.error(`  Failed to send to ${patient.name}:`, err.message)
    }
  }

  console.log(`Follow-up check done. ${sentCount}/${due.length} reminders sent.`)
  return { checked: due.length, sent: sentCount }
}

// ─── Automatic appointment reminders (1 day before) ──────
// Finds confirmed appointments whose preferred_date is tomorrow, and sends
// a reminder. Runs once daily — since each appointment date only matches
// "tomorrow" on exactly one day, no separate dedup tracking is needed.
async function checkAppointmentRemindersAndNotify() {
  console.log('Running appointment reminder check...')
  if (!isReady) {
    console.log('  Skipped — WhatsApp not connected.')
    return { checked: 0, sent: 0, skipped: 'not_connected' }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: appts, error } = await supabase
    .from('appointments')
    .select('id, name, phone, service, preferred_date, preferred_time, status')
    .eq('status', 'confirmed')
    .eq('preferred_date', tomorrowStr)

  if (error) {
    console.error('  Error fetching appointments:', error.message)
    return { checked: 0, sent: 0, error: error.message }
  }

  if (!appts || appts.length === 0) {
    console.log('  No appointments tomorrow.')
    return { checked: 0, sent: 0 }
  }

  let sentCount = 0
  for (const appt of appts) {
    if (!appt.phone) continue
    const timeStr = appt.preferred_time ? ` at ${appt.preferred_time}` : ''
    const msg = `Hi ${appt.name}, this is a reminder from Usha Multi Speciality Dental Clinic \u2014 your appointment with Dr. Suresh Kumar for ${appt.service || 'your consultation'} is tomorrow${timeStr}. See you soon!`

    try {
      await sendWhatsAppMessage(cleanPhone(appt.phone), msg)
      sentCount++
      console.log(`  Sent reminder to ${appt.name} (${appt.phone})`)
      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.error(`  Failed to send to ${appt.name}:`, err.message)
    }
  }

  console.log(`Appointment reminder check done. ${sentCount}/${appts.length} reminders sent.`)
  return { checked: appts.length, sent: sentCount }
}

// Runs every day at 9:00 AM India time
cron.schedule('0 9 * * *', () => {
  checkAppointmentRemindersAndNotify()
}, { timezone: 'Asia/Kolkata' })

// Runs every day at 9:05 AM India time (a few minutes after, to avoid overlap)
cron.schedule('5 9 * * *', () => {
  checkFollowUpsAndNotify()
}, { timezone: 'Asia/Kolkata' })

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
  const { number, message, mentionNumber } = req.body
  if (!number || !message) {
    return res.status(400).json({ ok: false, error: 'number and message are required' })
  }
  try {
    await sendWhatsAppMessage(number, message, mentionNumber)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.get('/groups', async (req, res) => {
  if (!isReady) return res.status(400).json({ ok: false, error: 'WhatsApp is not connected yet.' })
  try {
    const groups = await sock.groupFetchAllParticipating()
    const list = Object.values(groups).map(g => ({ id: g.id, name: g.subject, participants: g.participants.length }))
    res.json({ ok: true, groups: list })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/check-followups', async (req, res) => {
  try {
    const result = await checkFollowUpsAndNotify()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/check-appointment-reminders', async (req, res) => {
  try {
    const result = await checkAppointmentRemindersAndNotify()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Notifier server running on port ${PORT}`)
  console.log(`Open the admin panel's WhatsApp tab to see the QR and connect.`)
})

startWhatsApp()
