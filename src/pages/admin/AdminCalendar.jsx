import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']

const STATUS_COLORS = {
  confirmed: { bg: 'rgba(30,111,106,0.15)', border: '#1e6f6a', text: '#1e6f6a', dot: '#1e6f6a' },
  pending:   { bg: 'rgba(185,145,79,0.15)', border: '#b9914f', text: '#9c7a3c', dot: '#b9914f' },
  cancelled: { bg: 'rgba(192,57,43,0.08)',  border: '#c0392b', text: '#c0392b', dot: '#c0392b' },
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function ApptPill({ appt, onClick }) {
  const c = STATUS_COLORS[appt.status] || STATUS_COLORS.pending
  return (
    <div onClick={e => { e.stopPropagation(); onClick(appt) }} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '2px', padding: '3px 7px', marginBottom: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      <span style={{ fontSize: '10px', color: c.text, fontFamily: 'var(--font-body)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {appt.preferred_time ? `${appt.preferred_time.replace(':00', '')} · ` : ''}{appt.name}
      </span>
    </div>
  )
}

function ApptModal({ appt, onClose, onStatusChange }) {
  if (!appt) return null
  const c = STATUS_COLORS[appt.status] || STATUS_COLORS.pending
  const phone = (appt.phone || '').replace(/[^\d]/g, '')
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,15,28,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'var(--white)', borderRadius: '2px', padding: '0', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(7,15,28,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: 'var(--navy-800)', padding: '20px 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-pale)', margin: '0 0 4px', fontWeight: 600 }}>{appt.name}</p>
              <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '100px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontFamily: 'var(--font-body)', fontWeight: 600 }}>{appt.status}</span>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)', width: '28px', height: '28px', borderRadius: '2px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: '20px 24px' }}>
          {[
            ['📞', appt.phone],
            ['✉️', appt.email || '—'],
            ['🩺', appt.service || 'General Consultation'],
            ['📅', fmtDate(appt.preferred_date)],
            ['⏰', appt.preferred_time || '—'],
            ['💬', appt.message || '—'],
          ].map(([icon, val]) => (
            <div key={icon} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
              <span style={{ fontSize: '13px', color: 'var(--charcoal)', fontFamily: 'var(--font-body)', lineHeight: '1.5' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '14px 24px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(15,39,68,0.08)' }}>
          {appt.status !== 'confirmed' && (
            <button onClick={() => onStatusChange(appt.id, 'confirmed')} style={{ background: '#1e6f6a', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '2px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', letterSpacing: '0.5px' }}>
              ✅ Confirm & WhatsApp
            </button>
          )}
          {appt.status !== 'cancelled' && (
            <button onClick={() => onStatusChange(appt.id, 'cancelled')} style={{ background: 'transparent', color: '#c0392b', border: '1px solid rgba(192,57,43,0.3)', padding: '9px 16px', borderRadius: '2px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" style={{ background: '#25d366', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '2px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AdminCalendar() {
  const [appts, setAppts] = useState([])
  const [view, setView] = useState('month') // month | week
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppts()

    const channel = supabase.channel('cal-appts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAppts)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchAppts() {
    const { data } = await supabase.from('appointments').select('*').order('preferred_date', { ascending: true })
    setAppts(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (status === 'confirmed') {
      const appt = appts.find(a => a.id === id)
      if (appt) {
        const phone = (appt.phone || '').replace(/[^\d]/g, '')
        const msg = encodeURIComponent(`Hi ${appt.name}, your appointment with Dr. Suresh Kumar has been confirmed${appt.preferred_date ? ` for ${new Date(appt.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}` : ''}${appt.preferred_time ? ` at ${appt.preferred_time}` : ''}. Looking forward to seeing you! 🌿`)
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
      }
    }
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  // --- MONTH VIEW ---
  function getMonthDays() {
    const year = current.getFullYear()
    const month = current.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
    return days
  }

  function getApptsForDay(date) {
    if (!date) return []
    return appts.filter(a => a.preferred_date && isSameDay(new Date(a.preferred_date), date))
  }

  // --- WEEK VIEW ---
  function getWeekDays() {
    const start = new Date(current)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  function getApptsForSlot(date, time) {
    return appts.filter(a => a.preferred_date && isSameDay(new Date(a.preferred_date), date) && a.preferred_time === time)
  }

  // Unscheduled (no preferred_date)
  const unscheduled = appts.filter(a => !a.preferred_date && a.status === 'pending')

  const today = new Date()

  function prevPeriod() {
    const d = new Date(current)
    if (view === 'month') d.setMonth(d.getMonth() - 1)
    else d.setDate(d.getDate() - 7)
    setCurrent(d)
  }

  function nextPeriod() {
    const d = new Date(current)
    if (view === 'month') d.setMonth(d.getMonth() + 1)
    else d.setDate(d.getDate() + 7)
    setCurrent(d)
  }

  const weekDays = getWeekDays()

  return (
    <div className="admin-panel" style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0, flex: 1 }}>
          {view === 'month' ? `${MONTHS[current.getMonth()]} ${current.getFullYear()}` : `Week of ${weekDays[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
        </h1>

        <button onClick={() => setCurrent(new Date())} style={{ padding: '7px 14px', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: 'var(--white)', color: 'var(--text-muted)' }}>Today</button>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={prevPeriod} style={{ width: '32px', height: '32px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: 'var(--white)', fontSize: '14px' }}>‹</button>
          <button onClick={nextPeriod} style={{ width: '32px', height: '32px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: 'var(--white)', fontSize: '14px' }}>›</button>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {['month', 'week'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 16px', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: view === v ? 'var(--navy-800)' : 'var(--white)', color: view === v ? 'var(--gold-pale)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
              {v}
            </button>
          ))}
        </div>

        <button className="admin-btn-primary" onClick={() => navigate('/admin/patients/new')}>+ Add Patient</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([status, c]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{status}</span>
          </div>
        ))}
        {unscheduled.length > 0 && (
          <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#b9914f', fontFamily: 'var(--font-body)', fontWeight: 600, background: 'rgba(185,145,79,0.1)', padding: '3px 10px', borderRadius: '100px' }}>
            ⏳ {unscheduled.length} unscheduled pending
          </div>
        )}
      </div>

      {loading ? <p className="admin-empty">Loading...</p> : (
        <>
          {/* ===== MONTH VIEW ===== */}
          {view === 'month' && (
            <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(15,39,68,0.08)' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', borderRight: '1px solid rgba(15,39,68,0.06)' }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {getMonthDays().map((date, i) => {
                  const dayAppts = getApptsForDay(date)
                  const isToday = date && isSameDay(date, today)
                  const isOtherMonth = !date

                  return (
                    <div key={i} style={{ minHeight: '100px', padding: '8px', borderRight: '1px solid rgba(15,39,68,0.06)', borderBottom: '1px solid rgba(15,39,68,0.06)', background: isOtherMonth ? 'rgba(15,39,68,0.02)' : 'var(--white)', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (!isOtherMonth) e.currentTarget.style.background = 'rgba(199,166,106,0.03)' }}
                      onMouseLeave={e => { if (!isOtherMonth) e.currentTarget.style.background = 'var(--white)' }}>

                      {date && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: isToday ? 700 : 400, background: isToday ? 'var(--navy-800)' : 'transparent', color: isToday ? 'var(--gold-pale)' : 'var(--charcoal)' }}>
                              {date.getDate()}
                            </span>
                          </div>
                          {dayAppts.slice(0, 3).map(a => <ApptPill key={a.id} appt={a} onClick={setSelected} />)}
                          {dayAppts.length > 3 && <span style={{ fontSize: '10px', color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>+{dayAppts.length - 3} more</span>}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ===== WEEK VIEW ===== */}
          {view === 'week' && (
            <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', overflow: 'auto' }}>
              <div style={{ minWidth: '600px' }}>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '2px solid rgba(15,39,68,0.08)' }}>
                  <div style={{ padding: '12px 8px' }} />
                  {weekDays.map((d, i) => {
                    const isToday = isSameDay(d, today)
                    return (
                      <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: '1px solid rgba(15,39,68,0.06)', background: isToday ? 'rgba(199,166,106,0.05)' : 'transparent' }}>
                        <p style={{ fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>{DAYS[d.getDay()]}</p>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: isToday ? 700 : 400, background: isToday ? 'var(--navy-800)' : 'transparent', color: isToday ? 'var(--gold-pale)' : 'var(--charcoal)' }}>
                          {d.getDate()}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Time slots */}
                {TIME_SLOTS.map(slot => (
                  <div key={slot} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid rgba(15,39,68,0.06)', minHeight: '64px' }}>
                    <div style={{ padding: '8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: '12px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', marginTop: '2px' }}>{slot}</span>
                    </div>
                    {weekDays.map((d, i) => {
                      const slotAppts = getApptsForSlot(d, slot)
                      const isToday = isSameDay(d, today)
                      return (
                        <div key={i} style={{ padding: '4px 6px', borderLeft: '1px solid rgba(15,39,68,0.06)', background: isToday ? 'rgba(199,166,106,0.03)' : 'transparent', minHeight: '64px' }}>
                          {slotAppts.map(a => <ApptPill key={a.id} appt={a} onClick={setSelected} />)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unscheduled */}
          {unscheduled.length > 0 && (
            <div style={{ marginTop: '16px', background: 'var(--white)', border: '1px solid rgba(185,145,79,0.2)', borderRadius: '2px', padding: '16px 20px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9c7a3c', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '12px' }}>⏳ Pending — No Date Selected ({unscheduled.length})</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {unscheduled.map(a => (
                  <div key={a.id} onClick={() => setSelected(a)} style={{ background: 'rgba(185,145,79,0.1)', border: '1px solid rgba(185,145,79,0.25)', borderRadius: '2px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b9914f' }} />
                    <span style={{ fontSize: '12px', color: '#9c7a3c', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{a.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{a.service || 'General'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Appointment Modal */}
      <ApptModal appt={selected} onClose={() => setSelected(null)} onStatusChange={updateStatus} />

      <style>{`
        @media (max-width: 700px) {
          .admin-panel [style*="gridTemplateColumns: repeat(7"] { font-size: 9px !important; }
        }
      `}</style>
    </div>
  )
}
