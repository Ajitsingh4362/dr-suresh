import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import {
  getPortalSession, portalFetchData, portalLogout, portalBookAppointment, portalDocumentUrl,
} from '../lib/patientPortal'
import { generatePatientPDF } from '../lib/generatePatientPDF'
import { generateInvoicePDF } from '../lib/generateInvoicePDF'

const WHATSAPP_API = 'https://dr-suresh-whatsapp.onrender.com'
const WHATSAPP_FOOTER = '\n\n*Book your appointment on www.ushadental.com*'

const ICON_PATHS = {
  overview: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  medicines: <><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" /><path d="M9.5 9.5l5 5" /></>,
  bills: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  reports: <><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4M9 13h6M9 17h4" /></>,
  appointments: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
}
function TabIcon({ id }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[id]}
    </svg>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview', short: 'Home' },
  { id: 'medicines', label: 'Medicines', short: 'Medicines' },
  { id: 'bills', label: 'Bills', short: 'Bills' },
  { id: 'reports', label: 'Reports', short: 'Reports' },
  { id: 'appointments', label: 'Appointments', short: 'Visits' },
]

const TREATMENTS = [
  'General Consultation',
  'Follow-up Visit',
  'Root Canal Treatment (RCT)',
  'Cosmetic Dentistry / Smile Makeover',
  'Dental Implants',
  'Orthodontics (Braces)',
  'Pediatric Dentistry',
  'Emergency Dental Care',
  'Teeth Cleaning & General Check-up',
]
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']

const STATUS_STYLE = {
  paid: { bg: '#e7f3ec', fg: '#2c5943', text: 'Paid' },
  partial: { bg: '#fbf3e3', fg: '#8a6420', text: 'Partly paid' },
  unpaid: { bg: '#fbeeee', fg: '#8f2d2d', text: 'Unpaid' },
  pending: { bg: '#fbf3e3', fg: '#8a6420', text: 'Waiting for confirmation' },
  confirmed: { bg: '#e7f3ec', fg: '#2c5943', text: 'Confirmed' },
  cancelled: { bg: '#f1f1f1', fg: '#666', text: 'Cancelled' },
  completed: { bg: '#e6eef7', fg: '#1c3d6a', text: 'Completed' },
}

const CENTER_CSS = `
  .pd-center { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px; text-align: center; background: var(--ivory); color: var(--text-muted); font-size: 15px; }
`

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN')
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const todayISO = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}
const cleanPhone = phone => {
  let p = (phone || '').replace(/[^\d]/g, '')
  if (p.length === 10) p = '91' + p
  return p
}

function Pill({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#f1f1f1', fg: '#555', text: status || '—' }
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
      {s.text}
    </span>
  )
}

function Empty({ children, action }) {
  return (
    <div style={{ padding: '36px 24px', textAlign: 'center', background: 'var(--white)', border: '1px dashed rgba(15,39,68,0.15)', borderRadius: '2px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: action ? '0 0 16px' : 0 }}>{children}</p>
      {action}
    </div>
  )
}

function Panel({ children, style }) {
  return <div className="pd-panel" style={style}>{children}</div>
}

function MedicineList({ text }) {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return null
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {lines.map((line, i) => {
        const [name, ...rest] = line.split(' — ')
        const parts = rest.join(' — ').split(',').map(x => x.trim()).filter(Boolean)
        return (
          <li key={i} className="pd-med">
            <span className="pd-med-dot" aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 600, color: 'var(--navy-800)', fontSize: '15px', lineHeight: 1.4 }}>{name}</span>
              {parts.length > 0 && (
                <span className="pd-chips">
                  {parts.map((part, k) => <span key={k} className={`pd-chip pd-chip-${k}`}>{part}</span>)}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const session = getPortalSession()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState('')

  const [showBook, setShowBook] = useState(false)
  const [book, setBook] = useState({ service: 'General Consultation', preferred_date: '', preferred_time: '', message: '' })
  const [bookMsg, setBookMsg] = useState(null)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!session?.token) { navigate('/patient-login', { replace: true }); return }
    load()
  }, [])

  async function load() {
    setLoading(true)
    const res = await portalFetchData()
    if (!res.ok) {
      if (res.error === 'session_expired') { navigate('/patient-login', { replace: true }); return }
      setLoadError('Could not load your details. Check your internet and try again.')
      setLoading(false)
      return
    }
    setLoadError('')
    setData(res)
    setLoading(false)
  }

  function goTab(id) {
    setTab(id)
    // Bring the start of the new section into view (below the phone app bar).
    const top = document.getElementById('pd-top')
    const bar = document.querySelector('.pd-appbar')
    const barH = bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0
    if (top) {
      const target = top.getBoundingClientRect().top + window.scrollY - barH - 12
      if (window.scrollY > target) window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  async function logout() {
    await portalLogout()
    navigate('/patient-login', { replace: true })
  }

  async function downloadReport() {
    setBusy('report')
    try {
      await generatePatientPDF({ patient: data.patient, medical: data.medical || {}, consultations: data.consultations })
    } catch (_) { alert('Could not create the report PDF. Please try again.') }
    setBusy('')
  }

  async function downloadInvoice(inv) {
    setBusy('inv-' + inv.id)
    try { await generateInvoicePDF({ patient: data.patient, invoice: inv }) } catch (_) { alert('Could not create the bill PDF. Please try again.') }
    setBusy('')
  }

  async function openDocument(doc) {
    // Open the tab right away (inside the click) so mobile browsers don't block it.
    const win = window.open('', '_blank')
    setBusy('doc-' + doc.id)
    const url = await portalDocumentUrl(doc)
    setBusy('')
    if (url && win) { win.opener = null; win.location.href = url; return }
    if (win) win.close()
    if (url) { window.location.href = url; return }
    alert('This file could not be opened. Please ask the clinic to share it on WhatsApp.')
  }

  async function submitBooking(e) {
    e.preventDefault()
    setBookMsg(null)
    if (!book.preferred_date) { setBookMsg({ ok: false, text: 'Please choose a date.' }); return }
    setBooking(true)
    const res = await portalBookAppointment(book)
    setBooking(false)
    if (!res.ok) {
      if (res.error === 'session_expired') { navigate('/patient-login', { replace: true }); return }
      setBookMsg({ ok: false, text: res.message })
      return
    }
    const p = data.patient
    if (p.phone) {
      const english = `Hi ${p.name}, we've received your appointment request${book.service ? ` for ${book.service}` : ''} on ${fmtDate(book.preferred_date)}${book.preferred_time ? ` at ${book.preferred_time}` : ''}. You'll get another WhatsApp message here as soon as it's confirmed. 🦷`
      const msg = `Namaste ${p.name}, humein aapki appointment request mil gayi hai — jald hi confirm karke bataayenge.\n➖➖➖➖➖➖➖➖➖➖\n${english}` + WHATSAPP_FOOTER
      fetch(`${WHATSAPP_API}/notify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: cleanPhone(p.phone), message: msg, type: 'booking_confirmation', name: p.name }),
      }).catch(() => {})
    }
    setBookMsg({ ok: true, text: 'Request sent. The clinic will confirm your appointment on WhatsApp.' })
    setBook({ service: 'General Consultation', preferred_date: '', preferred_time: '', message: '' })
    setShowBook(false)
    load()
  }

  if (loading && !data) {
    return (
      <div className="pd-center">
        <img src="/usha-dental-logo.png" alt="" style={{ height: '64px', width: 'auto' }} />
        <p>Loading your details…</p>
        <style>{CENTER_CSS}</style>
      </div>
    )
  }

  if (loadError && !data) {
    return (
      <div className="pd-center">
        <img src="/usha-dental-logo.png" alt="" style={{ height: '64px', width: 'auto' }} />
        <p>{loadError}</p>
        <button className="btn-primary" onClick={load}>Try again</button>
        <style>{CENTER_CSS}</style>
      </div>
    )
  }

  const { patient, consultations = [], invoices = [], documents = [], appointments = [] } = data
  const withMedicines = consultations.filter(c => (c.prescription || '').trim())
  const totalBilled = invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0)
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0)
  const due = Math.max(totalBilled - totalPaid, 0)
  const today = todayISO()
  const nextFollowUp = consultations
    .map(c => c.follow_up_date).filter(d => d && d >= today).sort()[0]
  const upcomingAppt = appointments
    .filter(a => a.status !== 'cancelled' && a.preferred_date && a.preferred_date >= today)
    .sort((a, b) => a.preferred_date.localeCompare(b.preferred_date))[0]
  const firstName = (patient.name || '').split(' ')[0]

  const bookForm = (
    <form onSubmit={submitBooking} className="pd-panel" style={{ marginBottom: '20px', borderTop: '3px solid var(--gold)' }}>
      <h3 className="pd-h3">Request an appointment</h3>
      <div className="pd-form-grid">
        <label className="pd-field">
          <span>Treatment</span>
          <select value={book.service} onChange={e => setBook(b => ({ ...b, service: e.target.value }))}>
            {TREATMENTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="pd-field">
          <span>Date</span>
          <input type="date" min={today} value={book.preferred_date} onChange={e => setBook(b => ({ ...b, preferred_date: e.target.value }))} required />
        </label>
        <label className="pd-field">
          <span>Time</span>
          <select value={book.preferred_time} onChange={e => setBook(b => ({ ...b, preferred_time: e.target.value }))}>
            <option value="">Any time</option>
            {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="pd-field" style={{ gridColumn: '1 / -1' }}>
          <span>Problem or note (optional)</span>
          <textarea rows={3} maxLength={1000} value={book.message} onChange={e => setBook(b => ({ ...b, message: e.target.value }))} placeholder="e.g. Pain in lower left tooth since 2 days" />
        </label>
      </div>
      {bookMsg && !bookMsg.ok && <p className="pd-alert">{bookMsg.text}</p>}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
        <button type="submit" className="btn-primary" disabled={booking} style={{ opacity: booking ? 0.7 : 1 }}>
          {booking ? 'Sending…' : 'Send request'}
        </button>
        <button type="button" className="btn-outline-dark" onClick={() => { setShowBook(false); setBookMsg(null) }}>Cancel</button>
      </div>
    </form>
  )

  const initial = (patient.name || 'P').trim()[0].toUpperCase()
  const waLink = `https://wa.me/918987367274?text=${encodeURIComponent(`Namaste, I am ${patient.name} (${patient.patient_code}).`)}`
  const currentTab = TABS.find(t => t.id === tab)
  const openBooking = () => { goTab('appointments'); setShowBook(true); setBookMsg(null) }

  return (
    <div className="pd-shell">
      <SEO title="My Dashboard" description="Your patient dashboard" path="/patient-dashboard" noindex />

      {/* Laptop: left sidebar */}
      <aside className="pd-side">
        <Link to="/" className="pd-brand" title="Clinic website">
          <img src="/usha-dental-logo.png" alt="" />
          <span>Usha Multi Speciality<br />Dental Clinic</span>
        </Link>
        <nav className="pd-sidenav" aria-label="Dashboard sections">
          {TABS.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)} className={tab === t.id ? 'active' : ''} aria-current={tab === t.id ? 'page' : undefined}>
              <TabIcon id={t.id} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="pd-side-foot">
          <a href="tel:+918987367274" className="pd-side-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" /></svg>
            Call clinic
          </a>
          <a href={waLink} target="_blank" rel="noreferrer" className="pd-side-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-3.9-1z" /></svg>
            WhatsApp
          </a>
          <Link to="/" className="pd-side-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            Clinic website
          </Link>
          <div className="pd-side-user">
            <div className="pd-avatar sm" aria-hidden="true">{initial}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="pd-side-name">{patient.name}</p>
              <button className="pd-side-logout" onClick={logout}>Log out</button>
            </div>
          </div>
        </div>
      </aside>

      <div className="pd-main">
        {/* Phone: top app bar */}
        <header className="pd-appbar">
          <Link to="/" className="pd-appbar-brand" aria-label="Clinic website">
            <img src="/usha-dental-logo.png" alt="" />
            <span>Usha Dental</span>
          </Link>
          <button className="pd-appbar-logout" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>
            Log out
          </button>
        </header>

        <section className={`pd-hero ${tab !== 'overview' ? 'pd-hero-inner-tab' : ''}`}>
          <div className="pd-hello">
            <div className="pd-avatar" aria-hidden="true">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <p className="pd-greet">Namaste,</p>
              <h1 className="pd-title">{patient.name}</h1>
              <p className="pd-sub">
                <span className="pd-idchip">{patient.patient_code}</span>
                {patient.created_at && <span className="pd-since">With us since {fmtDate(patient.created_at)}</span>}
              </p>
            </div>
          </div>
          <button className="btn-primary pd-book-btn" onClick={openBooking}>Book appointment</button>
        </section>

        <div id="pd-top" className="pd-content">
          {tab !== 'overview' && <h2 className="pd-section-title">{currentTab?.label}</h2>}
          {bookMsg?.ok && <p className="pd-success">{bookMsg.text}</p>}

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="pd-stats">
                <button className="pd-stat" onClick={() => goTab('bills')}>
                  <span className="pd-stat-label">Balance due</span>
                  <span className="pd-stat-value" style={{ color: due > 0 ? 'var(--maroon)' : 'var(--medical-green-dark)' }}>{money(due)}</span>
                  <span className="pd-stat-note">{due > 0 ? `of ${money(totalBilled)} billed` : 'All bills paid'}</span>
                </button>
                <button className="pd-stat" onClick={() => goTab('appointments')}>
                  <span className="pd-stat-label">Next visit</span>
                  <span className="pd-stat-value">{upcomingAppt ? fmtDate(upcomingAppt.preferred_date) : nextFollowUp ? fmtDate(nextFollowUp) : '—'}</span>
                  <span className="pd-stat-note">
                    {upcomingAppt ? (STATUS_STYLE[upcomingAppt.status]?.text || upcomingAppt.status) : nextFollowUp ? 'Follow-up advised by doctor' : 'No visit planned'}
                  </span>
                </button>
                <button className="pd-stat pd-stat-reports" onClick={() => goTab('reports')}>
                  <span className="pd-stat-label">Reports</span>
                  <span className="pd-stat-value">{documents.length + 1}</span>
                  <span className="pd-stat-note">Clinic report{documents.length ? ` + ${documents.length} file${documents.length > 1 ? 's' : ''}` : ''}</span>
                </button>
              </div>

              <div className="pd-help">
                <a href="tel:+918987367274">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" /></svg>
                  Call clinic
                </a>
                <a href={`https://wa.me/918987367274?text=${encodeURIComponent(`Namaste, I am ${patient.name} (${patient.patient_code}).`)}`} target="_blank" rel="noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-3.9-1z" /></svg>
                  WhatsApp
                </a>
              </div>

              <div className="pd-two">
                <Panel>
                  <h3 className="pd-h3">Latest medicines</h3>
                  {withMedicines[0] ? (
                    <>
                      <p className="pd-meta">Prescribed on {fmtDate(withMedicines[0].date)}{withMedicines[0].chief_complaint ? ` for ${withMedicines[0].chief_complaint}` : ''}</p>
                      <MedicineList text={withMedicines[0].prescription} />
                      <button className="pd-link" onClick={() => goTab('medicines')}>See all prescriptions</button>
                    </>
                  ) : <p className="pd-meta">No medicines prescribed yet.</p>}
                </Panel>
                <Panel>
                  <h3 className="pd-h3">My details</h3>
                  <dl className="pd-dl">
                    <dt>Name</dt><dd>{patient.name}</dd>
                    <dt>Mobile</dt><dd>{patient.phone || '—'}</dd>
                    {patient.age && <><dt>Age</dt><dd>{patient.age}{patient.gender ? ` / ${patient.gender}` : ''}</dd></>}
                    {patient.blood_group && <><dt>Blood group</dt><dd>{patient.blood_group}</dd></>}
                    {data.medical?.allergies && <><dt>Allergies</dt><dd>{data.medical.allergies}</dd></>}
                  </dl>
                  <p className="pd-meta" style={{ marginTop: '14px', marginBottom: 0 }}>
                    Something wrong? Call the clinic at <a href="tel:+918987367274" style={{ color: 'var(--gold-deep)', fontWeight: 600 }}>+91 89873 67274</a>.
                  </p>
                </Panel>
              </div>
            </>
          )}

          {/* MEDICINES */}
          {tab === 'medicines' && (
            withMedicines.length === 0
              ? <Empty>No prescriptions yet. Medicines the doctor writes for you will show here.</Empty>
              : withMedicines.map((c, i) => (
                <Panel key={c.id} style={{ marginBottom: '16px', borderLeft: `3px solid ${i === 0 ? 'var(--gold)' : 'rgba(15,39,68,0.12)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <h3 className="pd-h3" style={{ margin: 0 }}>{fmtDate(c.date)}</h3>
                    {i === 0 && <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-deep)' }}>Latest</span>}
                  </div>
                  {c.chief_complaint && <p className="pd-meta">Problem: {c.chief_complaint}</p>}
                  <MedicineList text={c.prescription} />
                  {c.follow_up_date && (
                    <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--teal)', fontWeight: 600 }}>
                      Follow-up on {fmtDate(c.follow_up_date)}{c.follow_up_notes ? ` — ${c.follow_up_notes}` : ''}
                    </p>
                  )}
                </Panel>
              ))
          )}

          {/* BILLS */}
          {tab === 'bills' && (
            <>
              <div className="pd-stats pd-bills-stats" style={{ marginBottom: '20px' }}>
                <div className="pd-stat static"><span className="pd-stat-label">Total billed</span><span className="pd-stat-value">{money(totalBilled)}</span></div>
                <div className="pd-stat static"><span className="pd-stat-label">Paid</span><span className="pd-stat-value" style={{ color: 'var(--medical-green-dark)' }}>{money(totalPaid)}</span></div>
                <div className="pd-stat static"><span className="pd-stat-label">Balance due</span><span className="pd-stat-value" style={{ color: due > 0 ? 'var(--maroon)' : 'var(--medical-green-dark)' }}>{money(due)}</span></div>
              </div>
              {invoices.length === 0 ? <Empty>No bills yet.</Empty> : invoices.map(inv => {
                const invDue = Math.max(Number(inv.total_amount || 0) - Number(inv.paid_amount || 0), 0)
                return (
                  <Panel key={inv.id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div>
                        <h3 className="pd-h3" style={{ margin: '0 0 4px' }}>{inv.invoice_number || 'Bill'}</h3>
                        <p className="pd-meta" style={{ margin: 0 }}>{fmtDate(inv.date)}</p>
                      </div>
                      <Pill status={inv.status} />
                    </div>
                    <table className="pd-table">
                      <tbody>
                        {(inv.items || []).map((it, k) => (
                          <tr key={k}><td>{it.description}</td><td>{money(it.amount)}</td></tr>
                        ))}
                        {Number(inv.discount_amount) > 0 && (
                          <tr><td>Discount{inv.discount_reason ? ` (${inv.discount_reason})` : ''}</td><td>− {money(inv.discount_amount)}</td></tr>
                        )}
                        <tr className="pd-total"><td>Total</td><td>{money(inv.total_amount)}</td></tr>
                        <tr><td>Paid</td><td style={{ color: 'var(--medical-green-dark)' }}>{money(inv.paid_amount)}</td></tr>
                        {invDue > 0 && <tr><td><strong>Remaining</strong></td><td style={{ color: 'var(--maroon)', fontWeight: 700 }}>{money(invDue)}</td></tr>}
                      </tbody>
                    </table>
                    {(inv.payments || []).length > 0 && (
                      <details className="pd-details">
                        <summary>Payment history ({inv.payments.length})</summary>
                        <ul>
                          {inv.payments.map(p => (
                            <li key={p.id}><span>{fmtDate(p.paid_on)}{p.note ? ` — ${p.note}` : ''}</span><span>{money(p.amount)}</span></li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <button className="pd-link" onClick={() => downloadInvoice(inv)} disabled={busy === 'inv-' + inv.id}>
                      {busy === 'inv-' + inv.id ? 'Preparing PDF…' : 'Download bill (PDF)'}
                    </button>
                  </Panel>
                )
              })}
            </>
          )}

          {/* REPORTS */}
          {tab === 'reports' && (
            <>
              <Panel style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 className="pd-h3" style={{ margin: '0 0 4px' }}>Clinic report</h3>
                  <p className="pd-meta" style={{ margin: 0 }}>Your details, medical history and all prescriptions in one PDF.</p>
                </div>
                <button className="btn-primary" onClick={downloadReport} disabled={busy === 'report'} style={{ opacity: busy === 'report' ? 0.7 : 1 }}>
                  {busy === 'report' ? 'Preparing…' : 'Download PDF'}
                </button>
              </Panel>
              {documents.length === 0
                ? <Empty>No X-rays or scans uploaded yet. Files the clinic adds to your record will show here.</Empty>
                : (
                  <Panel style={{ padding: 0 }}>
                    {documents.map((d, i) => (
                      <div key={d.id} className="pd-doc" style={{ borderTop: i ? '1px solid rgba(15,39,68,0.07)' : 'none' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--navy-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                          <p className="pd-meta" style={{ margin: '2px 0 0' }}>Added {fmtDate(d.created_at)}</p>
                        </div>
                        <button className="btn-outline-dark" style={{ padding: '9px 18px', fontSize: '12px' }} onClick={() => openDocument(d)} disabled={busy === 'doc-' + d.id}>
                          {busy === 'doc-' + d.id ? 'Opening…' : 'View'}
                        </button>
                      </div>
                    ))}
                  </Panel>
                )}
            </>
          )}

          {/* APPOINTMENTS */}
          {tab === 'appointments' && (
            <>
              {showBook ? bookForm : (
                <div style={{ marginBottom: '20px' }}>
                  <button className="btn-primary" onClick={() => { setShowBook(true); setBookMsg(null) }}>Request new appointment</button>
                </div>
              )}
              {appointments.length === 0
                ? <Empty>No appointments yet.</Empty>
                : (
                  <Panel style={{ padding: 0 }}>
                    {appointments.map((a, i) => (
                      <div key={a.id} className="pd-doc" style={{ borderTop: i ? '1px solid rgba(15,39,68,0.07)' : 'none', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--navy-800)' }}>
                            {a.preferred_date ? fmtDate(a.preferred_date) : 'Date to be fixed'}{a.preferred_time ? `, ${a.preferred_time}` : ''}
                          </p>
                          <p className="pd-meta" style={{ margin: '2px 0 0' }}>{a.service || 'Consultation'} · requested {fmtDate(a.created_at)}</p>
                        </div>
                        <Pill status={a.status} />
                      </div>
                    ))}
                  </Panel>
                )}
            </>
          )}

        </div>
      </div>

      {/* Phone: bottom tab bar (portal keeps position:fixed reliable) */}
      {createPortal(
        <nav className="pd-bottomnav" aria-label="Dashboard sections">
          {TABS.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)} className={tab === t.id ? 'active' : ''} aria-current={tab === t.id ? 'page' : undefined}>
              <TabIcon id={t.id} />
              <span>{t.short}</span>
            </button>
          ))}
        </nav>, document.body)}

      <style>{`
        /* ── App shell: no website header/footer ── */
        .pd-shell { min-height: 100vh; background: var(--ivory); display: grid; grid-template-columns: 264px 1fr; }
        .pd-side { position: sticky; top: 0; height: 100vh; background: var(--maroon-dark); color: var(--white); display: flex; flex-direction: column; padding: 22px 16px 18px; overflow-y: auto; }
        .pd-brand { display: flex; align-items: center; gap: 12px; padding: 4px 8px 22px; border-bottom: 1px solid rgba(240,221,181,0.15); margin-bottom: 18px; }
        .pd-brand img { width: 52px; height: 52px; object-fit: contain; flex-shrink: 0; }
        .pd-brand span { font-family: var(--font-display); font-size: 15px; line-height: 1.3; color: var(--gold-pale); font-weight: 600; }
        .pd-sidenav { display: flex; flex-direction: column; gap: 4px; }
        .pd-sidenav button { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; background: none; border: none; color: rgba(255,255,255,0.72); padding: 12px 14px; font-size: 15px; font-weight: 500; border-radius: 6px; transition: background 0.15s, color 0.15s; }
        .pd-sidenav button:hover { background: rgba(255,255,255,0.06); color: var(--white); }
        .pd-sidenav button.active { background: rgba(227,192,121,0.16); color: var(--gold-light); font-weight: 600; box-shadow: inset 3px 0 0 var(--gold); }
        .pd-side-foot { margin-top: auto; padding-top: 18px; display: flex; flex-direction: column; gap: 2px; }
        .pd-side-link { display: flex; align-items: center; gap: 10px; padding: 9px 14px; font-size: 14px; color: rgba(255,255,255,0.65); border-radius: 6px; }
        .pd-side-link:hover { color: var(--white); background: rgba(255,255,255,0.06); }
        .pd-side-user { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 14px 10px 0; border-top: 1px solid rgba(240,221,181,0.15); }
        .pd-side-name { margin: 0; font-size: 14px; font-weight: 600; color: var(--white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pd-side-logout { background: none; border: none; padding: 0; color: var(--gold-light); font-size: 13px; font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }
        .pd-sidenav button:focus-visible, .pd-side-link:focus-visible, .pd-side-logout:focus-visible, .pd-stat:focus-visible, .pd-link:focus-visible, .pd-bottomnav button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

        .pd-main { min-width: 0; }
        .pd-appbar { display: none; }
        .pd-hero { max-width: 1120px; margin: 0 auto; padding: 40px 44px 8px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .pd-hello { display: flex; align-items: center; gap: 18px; min-width: 0; }
        .pd-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--maroon); color: var(--gold-pale); font-family: var(--font-display); font-weight: 700; font-size: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pd-avatar.sm { width: 38px; height: 38px; font-size: 16px; background: var(--gold); color: var(--maroon-dark); }
        .pd-greet { margin: 0; font-size: 14px; color: var(--text-muted); }
        .pd-title { font-size: clamp(26px, 3.4vw, 38px); color: var(--navy-800); font-weight: 600; margin: 0 0 8px; line-height: 1.15; }
        .pd-sub { color: var(--text-muted); font-size: 13.5px; margin: 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .pd-idchip { background: rgba(122,35,49,0.08); color: var(--maroon); font-weight: 700; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 100px; font-size: 13px; }
        .pd-content { max-width: 1120px; margin: 0 auto; padding: 24px 44px 64px; }
        .pd-section-title { font-size: 24px; color: var(--navy-800); font-weight: 600; margin: 0 0 18px; }

        .pd-bottomnav { display: none; }
        .pd-help { display: none; }
        .pd-panel { background: var(--white); border: 1px solid rgba(15,39,68,0.07); border-radius: 10px; padding: 22px 24px; box-shadow: 0 1px 2px rgba(15,39,68,0.04); }
        .pd-h3 { font-size: 20px; color: var(--navy-800); font-weight: 600; margin: 0 0 12px; }
        .pd-meta { color: var(--text-muted); font-size: 14px; margin: 0 0 10px; }
        .pd-link { background: none; border: none; color: var(--gold-deep); font-weight: 600; font-size: 14px; padding: 0; margin-top: 14px; text-decoration: underline; text-underline-offset: 3px; }
        .pd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
        .pd-stat { text-align: left; background: var(--white); border: 1px solid rgba(15,39,68,0.07); border-radius: 10px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; transition: border-color 0.2s; box-shadow: 0 1px 2px rgba(15,39,68,0.04); }
        .pd-stat:not(.static):hover { border-color: var(--gold); }
        .pd-stat-label { font-size: 13px; color: var(--text-muted); }
        .pd-stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--navy-800); line-height: 1.2; }
        .pd-stat-note { font-size: 12.5px; color: var(--text-light); }
        .pd-two { display: grid; grid-template-columns: 1.3fr 1fr; gap: 16px; align-items: start; }
        .pd-dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 18px; margin: 0; font-size: 14px; }
        .pd-dl dt { color: var(--text-muted); }
        .pd-dl dd { margin: 0; color: var(--navy-800); font-weight: 500; }
        .pd-table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px; }
        .pd-table td { padding: 8px 0; border-bottom: 1px solid rgba(15,39,68,0.06); }
        .pd-table td:last-child { text-align: right; white-space: nowrap; padding-left: 12px; }
        .pd-table .pd-total td { font-weight: 700; color: var(--navy-800); border-top: 1px solid rgba(15,39,68,0.2); }
        .pd-details { margin-top: 12px; font-size: 14px; }
        .pd-details summary { cursor: pointer; color: var(--navy-700); font-weight: 600; }
        .pd-details ul { list-style: none; padding: 8px 0 0; margin: 0; }
        .pd-details li { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; color: var(--text-muted); }
        .pd-doc { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 22px; }
        .pd-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
        .pd-field span { display: block; font-size: 13px; font-weight: 600; color: var(--navy-800); margin-bottom: 6px; }
        .pd-field input, .pd-field select, .pd-field textarea { width: 100%; padding: 12px 14px; border: 1px solid rgba(15,39,68,0.18); border-radius: 6px; font-family: var(--font-body); font-size: 16px; color: var(--navy-800); background: var(--white); outline: none; color-scheme: light; }
        .pd-field input:focus, .pd-field select:focus, .pd-field textarea:focus { border-color: var(--gold); }
        .pd-alert { background: #fbeeee; color: #8f2d2d; font-size: 14px; padding: 10px 12px; border-radius: 6px; }
        .pd-success { background: #e7f3ec; color: #2c5943; font-size: 14px; padding: 12px 14px; border-radius: 6px; margin: 0 0 18px; font-weight: 500; }
        .pd-med { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid rgba(15,39,68,0.07); }
        .pd-med:first-child { border-top: none; }
        .pd-med-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); margin-top: 8px; flex-shrink: 0; }
        .pd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .pd-chip { font-size: 12.5px; padding: 3px 10px; border-radius: 100px; background: var(--ivory-dark); color: var(--navy-700); font-weight: 500; }
        .pd-chip-0 { background: var(--teal-pale); color: var(--teal); font-weight: 600; }

        @media (max-width: 1100px) {
          .pd-shell { grid-template-columns: 228px 1fr; }
          .pd-hero, .pd-content { padding-left: 28px; padding-right: 28px; }
          .pd-two { grid-template-columns: 1fr; }
          .pd-form-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Phones & small tablets: app bar on top, tab bar at bottom ── */
        @media (max-width: 860px) {
          .pd-shell { display: block; }
          .pd-side { display: none; }
          .pd-appbar {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            position: sticky; top: 0; z-index: 50;
            background: var(--maroon-dark); color: var(--white);
            padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 10px 12px;
            box-shadow: 0 2px 12px rgba(92,26,37,0.25);
          }
          .pd-appbar-brand { display: flex; align-items: center; gap: 10px; }
          .pd-appbar-brand img { width: 38px; height: 38px; object-fit: contain; }
          .pd-appbar-brand span { font-family: var(--font-display); font-weight: 600; font-size: 17px; color: var(--gold-pale); }
          .pd-appbar-logout { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500; padding: 8px 12px; border-radius: 100px; }
          .pd-hero { padding: 20px 16px 4px; gap: 16px; }
          .pd-avatar { width: 52px; height: 52px; font-size: 22px; }
          .pd-title { font-size: 24px; margin-bottom: 6px; }
          .pd-greet { font-size: 13px; }
          .pd-sub { font-size: 12.5px; gap: 8px; }
          .pd-idchip { font-size: 12px; }
          .pd-book-btn { width: 100%; justify-content: center; }
          .pd-content { padding: 16px 16px calc(96px + env(safe-area-inset-bottom, 0px)); }
          .pd-hero-inner-tab { display: none; }
          .pd-hero-inner-tab + .pd-content { padding-top: 20px; }
          .pd-section-title { font-size: 21px; margin-bottom: 14px; }
          .pd-form-grid { grid-template-columns: 1fr; }
          .pd-bottomnav {
            display: grid; grid-template-columns: repeat(5, 1fr);
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 900;
            background: var(--white); border-top: 1px solid rgba(15,39,68,0.1);
            box-shadow: 0 -6px 24px rgba(15,39,68,0.08);
            padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
          }
          .pd-bottomnav button { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 0; color: var(--text-light); font-size: 11px; font-weight: 600; font-family: var(--font-body); position: relative; }
          .pd-bottomnav button.active { color: var(--maroon); }
          .pd-bottomnav button.active::before { content: ''; position: absolute; top: -7px; left: 30%; right: 30%; height: 3px; border-radius: 0 0 3px 3px; background: var(--maroon); }
          .pd-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
          .pd-stat { padding: 14px; }
          .pd-stat-value { font-size: 22px; }
          .pd-stat-note { font-size: 11.5px; }
          .pd-stat-reports { display: none; }
          .pd-bills-stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .pd-bills-stats .pd-stat { padding: 12px 10px; }
          .pd-bills-stats .pd-stat-value { font-size: 18px; }
          .pd-bills-stats .pd-stat-label { font-size: 12px; }
          .pd-help { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
          .pd-help a { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: var(--white); border: 1px solid rgba(15,39,68,0.08); border-radius: 10px; font-size: 14px; font-weight: 600; color: var(--navy-800); }
          .pd-help a:last-child { color: #128c4a; }
          .pd-panel { padding: 18px 16px; }
          .pd-h3 { font-size: 18px; }
          .pd-doc { padding: 14px 16px; }
        }
      `}</style>
    </div>
  )
}
