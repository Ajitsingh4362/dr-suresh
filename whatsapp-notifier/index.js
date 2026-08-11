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
//   GET  /status          -> { connected: true/false }                                    [public]
//   GET  /qr               -> { qr: "data:image/png;base64,..." } or { qr: null }          [admin session required]
//   POST /notify           -> { "number": "917255049328", "message": "..." }               [public, rate-limited]
//   POST /logout           -> disconnects WhatsApp                                         [admin session required]
//   POST /check-followups  -> manually trigger the follow-up reminder check (for testing)   [admin session required]
//   POST /check-birthdays  -> manually trigger the birthday-wish check (for testing)         [admin session required]
//   POST /check-festivals  -> manually trigger today's festival-wish check (for testing)      [admin session required]
//
// "admin session required" = the caller must send an Authorization: Bearer <token> header
// with a currently-valid Supabase auth token (the same token the admin panel already holds
// after logging in). /notify stays public on purpose — the public booking form on the
// website calls it directly (before anyone has logged in) to send the "we got your request"
// confirmation message — so it's protected by a rate limit instead of a login check.

const makeWASocket = require('@whiskeysockets/baileys').default
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const QRCode = require('qrcode')
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const pino = require('pino')
const cron = require('node-cron')
const { createClient } = require('@supabase/supabase-js')
const { useSupabaseAuthState } = require('./supabaseAuthState')

const PORT = process.env.PORT || 3001
// Appended to the two automatic cron-sent reminders below — matches the
// same footer the admin panel adds to every message it sends directly.
const WHATSAPP_FOOTER = '\n\n*Book your appointment on www.ushadental.com*'
let sock = null
let clearAuthState = null // set once useSupabaseAuthState() resolves
let isReady = false
let currentQrDataUrl = null // base64 PNG data URL of the latest QR
const contactsCache = {} // jid -> { id, name, notify }
const pendingSends = {} // messageId -> { resolve } — waiting for delivery ack
let sendQueue = Promise.resolve() // serializes all outgoing sends so they're spaced out, not bursty

// Same public Supabase project the website uses (anon key — already public in the frontend)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://scihrslohphuakyczrkv.supabase.co'
// This is a trusted backend-only service (never exposed to a browser), so it should use the
// service_role key to read patient data — the anon key can't see it under RLS (by design,
// so the public website can't read patient records). Get this from Supabase dashboard ->
// Settings -> API -> service_role key, and set it as SUPABASE_SERVICE_ROLE_KEY in Render's
// environment variables. Falls back to the anon key (which will only see public tables) if
// the service role key isn't set, so this still boots without it.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWhyc2xvaHBodWFreWN6cmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTY1NjAsImV4cCI6MjEwMDAzMjU2MH0.v3sAY8Gm6N94h1MdzQabHevm7Fy8COEKLgUsX74LKBs'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function startWhatsApp() {
  // Session is persisted in Supabase (not local disk) so it survives
  // Render free-tier restarts after the service spins down from inactivity.
  const { state, saveCreds, clearAll } = await useSupabaseAuthState(supabase)
  clearAuthState = clearAll
  const { version } = await fetchLatestBaileysVersion()
  console.log('Using WhatsApp Web version:', version.join('.'))

  sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'error' }), // shows real errors from inside Baileys itself
    markOnlineOnConnect: true,
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
      if (shouldReconnect) {
        console.log('Reconnecting...')
        setTimeout(startWhatsApp, 3000)
      } else {
        // Logged out (or bad/stale saved session) — clear it and start fresh
        // so a new QR is generated instead of getting stuck forever.
        console.log('Logged out — clearing saved session and generating a fresh QR...')
        if (clearAuthState) await clearAuthState().catch(() => {})
        setTimeout(startWhatsApp, 3000)
      }
    } else if (connection === 'open') {
      isReady = true
      currentQrDataUrl = null
      console.log('WhatsApp connected and ready.')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // Track delivery status for messages we send, so we know if WhatsApp's
  // server actually accepted/delivered them (status 2 = SERVER_ACK,
  // 3 = DELIVERY_ACK, 4 = READ) vs silently dropped them (stays at 1 = PENDING).
  sock.ev.on('messages.update', (updates) => {
    for (const u of updates) {
      const id = u.key?.id
      if (id && pendingSends[id]) {
        const status = u.update?.status
        if (status >= 2) {
          pendingSends[id].resolve(status)
          delete pendingSends[id]
        }
      }
    }
  })

  // Build up a contacts cache as WhatsApp syncs them to us
  sock.ev.on('contacts.upsert', (contacts) => {
    for (const c of contacts) {
      if (c.id && c.id.endsWith('@s.whatsapp.net')) {
        contactsCache[c.id] = { id: c.id, name: c.name || c.notify || null, notify: c.notify || null }
      }
    }
  })
  sock.ev.on('contacts.update', (updates) => {
    for (const c of updates) {
      if (c.id && c.id.endsWith('@s.whatsapp.net')) {
        contactsCache[c.id] = { ...(contactsCache[c.id] || {}), id: c.id, name: c.name || c.notify || contactsCache[c.id]?.name || null }
      }
    }
  })
}

// ─── Helper: send a message ─────────────────────────────
// number format: country code + number, no + or spaces. e.g. "917255049328"
// Wrapped in a queue so sends are spaced out (not fired in a burst), with a
// "typing" presence simulation before each one and one automatic retry if
// WhatsApp never acknowledges delivery — this is what actually improves
// delivery to numbers that have no prior chat history with this account.
function sendWhatsAppMessage(number, message, mentionNumber) {
  const task = sendQueue.then(() => sendOnce(number, message, mentionNumber))
  // Keep the queue alive even if this particular send fails, so later
  // messages don't get stuck behind a rejected promise.
  sendQueue = task.catch(() => {})
  return task
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

async function resolveJid(number) {
  if (number.includes('@g.us') || number.includes('@')) return number // already a full JID
  const results = await sock.onWhatsApp(number)
  const match = results && results[0]
  if (!match || !match.exists) {
    throw new Error(`${number} does not appear to be a valid WhatsApp number`)
  }
  // Known Baileys bug (WhiskeySockets/Baileys #1950, #1539, #43830 and others):
  // sending to the @lid-form JID that onWhatsApp() often returns can silently
  // fail to deliver — sendMessage resolves fine, no error, but the message
  // never arrives. Sending to the plain phone-number JID is what's actually
  // reliable, so we only use onWhatsApp() here to confirm the number exists,
  // and always send to the classic "<number>@s.whatsapp.net" form.
  return `${number}@s.whatsapp.net`
}

async function sendOnce(number, message, mentionNumber, isRetry = false) {
  if (!isReady) throw new Error('WhatsApp is not connected yet.')

  const jid = await resolveJid(number)

  const payload = { text: message }
  if (mentionNumber) {
    const mentionJid = mentionNumber.includes('@') ? mentionNumber : `${mentionNumber}@s.whatsapp.net`
    payload.mentions = [mentionJid]
  }

  // Simulate a human typing instead of blasting the message instantly —
  // cold-sends to unfamiliar numbers are far more likely to get silently
  // dropped by WhatsApp's spam heuristics without this.
  if (!jid.includes('@g.us')) {
    await sock.presenceSubscribe(jid).catch(() => {})
    await wait(300)
    await sock.sendPresenceUpdate('composing', jid).catch(() => {})
    await wait(1200 + Math.random() * 1500)
    await sock.sendPresenceUpdate('paused', jid).catch(() => {})
    await wait(200)
  }

  const sent = await sock.sendMessage(jid, payload)
  const msgId = sent?.key?.id

  // Wait up to 8s for WhatsApp's server to actually acknowledge the message
  // (status >= 2). If it never does, WhatsApp likely dropped it — retry
  // once, since a second attempt a few seconds later often goes through.
  if (msgId) {
    const status = await new Promise((resolve) => {
      pendingSends[msgId] = { resolve }
      setTimeout(() => {
        if (pendingSends[msgId]) {
          delete pendingSends[msgId]
          resolve(null) // timed out — no ack seen
        }
      }, 8000)
    })

    if (status === null && !isRetry) {
      console.log(`No delivery ack for message to ${jid}, retrying once...`)
      await wait(2000)
      return sendOnce(number, message, mentionNumber, true)
    }
    if (status === null) {
      console.log(`Still no delivery ack for ${jid} after retry — WhatsApp may be silently blocking this number.`)
    }
  }

  // Small gap before the next queued message goes out.
  await wait(800 + Math.random() * 700)
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

    const msg = `Hi ${patient.name}, this is Usha Multi Speciality Dental Clinic. ${line} Please let us know if this works for you, or if you'd like to reschedule.${WHATSAPP_FOOTER}`

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
    const msg = `Hi ${appt.name}, this is a reminder from Usha Multi Speciality Dental Clinic \u2014 your appointment with Dr. Suresh Kumar for ${appt.service || 'your consultation'} is tomorrow${timeStr}. See you soon!${WHATSAPP_FOOTER}`

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

// ─── Automatic birthday wishes ────────────────────────────
async function checkBirthdaysAndNotify() {
  console.log('Running birthday check...')
  if (!isReady) {
    console.log('  Skipped — WhatsApp not connected.')
    return { checked: 0, sent: 0, skipped: 'not_connected' }
  }

  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, name, phone, date_of_birth')
    .not('date_of_birth', 'is', null)

  if (error) {
    console.error('  Error fetching patients:', error.message)
    return { checked: 0, sent: 0, error: error.message }
  }

  // Match month+day only — the year in date_of_birth is irrelevant here.
  const birthdays = (patients || []).filter(p => {
    const d = new Date(p.date_of_birth)
    return String(d.getMonth() + 1).padStart(2, '0') === mm && String(d.getDate()).padStart(2, '0') === dd
  })

  if (birthdays.length === 0) {
    console.log('  No birthdays today.')
    return { checked: 0, sent: 0 }
  }

  let sentCount = 0
  for (const patient of birthdays) {
    if (!patient.phone) continue
    const msg = `Hi ${patient.name}, wishing you a very Happy Birthday from all of us at Usha Multi Speciality Dental Clinic! 🎂 May you have a wonderful year ahead filled with health and happy smiles. 🦷${WHATSAPP_FOOTER}`
    try {
      await sendWhatsAppMessage(cleanPhone(patient.phone), msg)
      sentCount++
      console.log(`  Sent birthday wish to ${patient.name} (${patient.phone})`)
      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.error(`  Failed to send to ${patient.name}:`, err.message)
    }
  }

  console.log(`Birthday check done. ${sentCount}/${birthdays.length} wishes sent.`)
  return { checked: birthdays.length, sent: sentCount }
}

// ─── Automatic festival wishes ─────────────────────────────
// IMPORTANT — most Indian festivals (Diwali, Holi, Eid, Raksha Bandhan, Chhath,
// etc.) follow the lunar/lunisolar calendar, so their Gregorian date changes
// every year. Entries below with a `year` are only valid for that exact year
// and will simply stop matching once the year passes — nothing wrong will be
// sent, but the wish for that festival will stop going out until someone adds
// next year's date. Entries WITHOUT a `year` (New Year, Republic Day,
// Independence Day, Makar Sankranti, Christmas) repeat safely every year.
// Dates below were checked in August 2026 against public panchang/calendar
// sources. When extending this list for a new year, verify dates against a
// current Hindu panchang / Islamic calendar site rather than guessing.
const FESTIVALS = [
  { month: 1, day: 1, name: 'New Year', message: (n) => `Hi ${n}, Usha Multi Speciality Dental Clinic wishes you a very Happy New Year! 🎉 May this year bring you good health and happy smiles.` },
  { month: 1, day: 14, name: 'Makar Sankranti', message: (n) => `Hi ${n}, wishing you and your family a very Happy Makar Sankranti! 🪁 From all of us at Usha Multi Speciality Dental Clinic.` },
  { month: 1, day: 26, name: 'Republic Day', message: (n) => `Hi ${n}, wishing you a very Happy Republic Day! 🇮🇳 From all of us at Usha Multi Speciality Dental Clinic.` },
  { month: 8, day: 15, name: 'Independence Day', message: (n) => `Hi ${n}, wishing you a very Happy Independence Day! 🇮🇳 From all of us at Usha Multi Speciality Dental Clinic.` },
  { month: 12, day: 25, name: 'Christmas', message: (n) => `Hi ${n}, wishing you and your family a very Merry Christmas! 🎄 From all of us at Usha Multi Speciality Dental Clinic.` },

  // 2026-specific (lunar/lunisolar) — will need next year's dates added for 2027
  { year: 2026, month: 8, day: 26, name: 'Eid-e-Milad', message: (n) => `Hi ${n}, wishing you and your family a blessed Eid-e-Milad! 🌙 From all of us at Usha Multi Speciality Dental Clinic.` },
  { year: 2026, month: 8, day: 28, name: 'Raksha Bandhan', message: (n) => `Hi ${n}, wishing you and your family a very Happy Raksha Bandhan! 🎀 From all of us at Usha Multi Speciality Dental Clinic.` },
  { year: 2026, month: 9, day: 4, name: 'Janmashtami', message: (n) => `Hi ${n}, wishing you and your family a very Happy Janmashtami! 🦚 From all of us at Usha Multi Speciality Dental Clinic.` },
  { year: 2026, month: 9, day: 14, name: 'Ganesh Chaturthi', message: (n) => `Hi ${n}, wishing you and your family a very Happy Ganesh Chaturthi! 🐘 From all of us at Usha Multi Speciality Dental Clinic.` },
  { year: 2026, month: 10, day: 20, name: 'Dussehra', message: (n) => `Hi ${n}, wishing you and your family a very Happy Dussehra! 🏹 From all of us at Usha Multi Speciality Dental Clinic.` },
  { year: 2026, month: 11, day: 8, name: 'Diwali', message: (n) => `Hi ${n}, wishing you and your family a very Happy Diwali! ✨🪔 May this festival of lights bring joy, prosperity, and good health to your home. From all of us at Usha Multi Speciality Dental Clinic.` },
  { year: 2026, month: 11, day: 15, name: 'Chhath Puja', message: (n) => `Hi ${n}, wishing you and your family a blessed Chhath Puja! 🙏 May Chhathi Maiya bless your family with health and happiness. From all of us at Usha Multi Speciality Dental Clinic.` },

  // 2027 — predicted/approximate for the Islamic-calendar ones; Holi date is solid
  { year: 2027, month: 3, day: 22, name: 'Holi', message: (n) => `Hi ${n}, wishing you and your family a very Happy Holi! 🌈 From all of us at Usha Multi Speciality Dental Clinic.` },
]

async function checkFestivalsAndNotify() {
  console.log('Running festival check...')
  if (!isReady) {
    console.log('  Skipped — WhatsApp not connected.')
    return { checked: 0, sent: 0, skipped: 'not_connected' }
  }

  const today = new Date()
  const y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate()
  const festival = FESTIVALS.find(f => f.month === m && f.day === d && (f.year === undefined || f.year === y))

  if (!festival) {
    console.log('  No festival today.')
    return { checked: 0, sent: 0 }
  }
  console.log(`  Today is ${festival.name} — sending wishes.`)

  // Only active patients, to keep the list smaller and more relevant.
  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, name, phone')
    .eq('status', 'active')
    .not('phone', 'is', null)

  if (error) {
    console.error('  Error fetching patients:', error.message)
    return { checked: 0, sent: 0, error: error.message }
  }

  let sentCount = 0
  for (const patient of patients || []) {
    if (!patient.phone) continue
    const msg = festival.message(patient.name) + WHATSAPP_FOOTER
    try {
      await sendWhatsAppMessage(cleanPhone(patient.phone), msg)
      sentCount++
      // Extra-slow pace for this one, on purpose — sending the same message
      // to potentially hundreds of numbers in one day looks a lot more like
      // spam to WhatsApp than the usual one-off sends elsewhere in this file,
      // so this trades speed for staying well clear of that pattern.
      await new Promise(r => setTimeout(r, 5000 + Math.random() * 4000))
    } catch (err) {
      console.error(`  Failed to send to ${patient.name}:`, err.message)
    }
  }

  console.log(`Festival check done (${festival.name}). ${sentCount}/${(patients || []).length} wishes sent.`)
  return { checked: (patients || []).length, sent: sentCount, festival: festival.name }
}

// Runs every day at 9:00 AM India time
cron.schedule('0 9 * * *', () => {
  checkAppointmentRemindersAndNotify()
}, { timezone: 'Asia/Kolkata' })

// Runs every day at 9:05 AM India time (a few minutes after, to avoid overlap)
cron.schedule('5 9 * * *', () => {
  checkFollowUpsAndNotify()
}, { timezone: 'Asia/Kolkata' })

// Runs every day at 9:10 AM India time
cron.schedule('10 9 * * *', () => {
  checkBirthdaysAndNotify()
}, { timezone: 'Asia/Kolkata' })

// Runs every day at 9:15 AM India time — last, since it can send to many
// patients and takes the longest to finish.
cron.schedule('15 9 * * *', () => {
  checkFestivalsAndNotify()
}, { timezone: 'Asia/Kolkata' })

// ─── Small HTTP server your app / admin panel can call ────
const app = express()
app.use(cors()) // allows the admin panel (different origin) to call this
app.use(express.json())

// Anyone who finds this server's URL could otherwise call /qr, /logout,
// /db-contacts, etc. directly (this repo is public on GitHub, so the list
// of endpoints is not a secret). This checks that the caller is sending a
// currently-valid Supabase login session — the same one the admin panel
// already has after logging in — before allowing those sensitive actions.
async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ ok: false, error: 'Missing admin session token.' })
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ ok: false, error: 'Invalid or expired admin session — please refresh the admin panel and log in again.' })
    next()
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Could not verify admin session.' })
  }
}

// /notify has to stay reachable without login (the public booking form uses
// it), so it gets a generous rate limit instead — enough headroom for real
// bookings and admin actions, but not for someone scripting a spam flood.
const notifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests — please wait a minute and try again.' },
})

app.get('/status', (req, res) => {
  res.json({ connected: isReady })
})

app.get('/qr', requireAdminAuth, (req, res) => {
  res.json({ qr: currentQrDataUrl, connected: isReady })
})

app.post('/logout', requireAdminAuth, async (req, res) => {
  try {
    if (sock) await sock.logout().catch(() => {}) // ignore if already disconnected
    if (clearAuthState) await clearAuthState()
    isReady = false
    currentQrDataUrl = null
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/notify', notifyLimiter, async (req, res) => {
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

app.get('/groups', requireAdminAuth, async (req, res) => {
  if (!isReady) return res.status(400).json({ ok: false, error: 'WhatsApp is not connected yet.' })
  try {
    const groups = await sock.groupFetchAllParticipating()
    const list = Object.values(groups).map(g => ({ id: g.id, name: g.subject, participants: g.participants.length }))
    res.json({ ok: true, groups: list })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.get('/contacts', requireAdminAuth, (req, res) => {
  if (!isReady) return res.status(400).json({ ok: false, error: 'WhatsApp is not connected yet.' })
  const list = Object.values(contactsCache)
    .map(c => ({ ...c, number: c.id.replace('@s.whatsapp.net', '') }))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  res.json({ ok: true, count: list.length, contacts: list })
})

app.get('/db-contacts', requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, name, phone')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    const withPhone = (data || []).filter(p => p.phone)
    res.json({ ok: true, count: withPhone.length, total_patients: (data || []).length, patients: withPhone })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/check-followups', requireAdminAuth, async (req, res) => {
  try {
    const result = await checkFollowUpsAndNotify()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/check-appointment-reminders', requireAdminAuth, async (req, res) => {
  try {
    const result = await checkAppointmentRemindersAndNotify()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/check-birthdays', requireAdminAuth, async (req, res) => {
  try {
    const result = await checkBirthdaysAndNotify()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/check-festivals', requireAdminAuth, async (req, res) => {
  try {
    const result = await checkFestivalsAndNotify()
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
