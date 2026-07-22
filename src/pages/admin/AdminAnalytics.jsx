import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// Simple bar chart component (no external library needed)
function BarChart({ data, color = 'var(--gold)', height = 120, label }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div>
      {label && <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '12px' }}>{label}</p>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height}px` }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{d.value}</span>
            <div style={{ width: '100%', background: color, borderRadius: '2px 2px 0 0', height: `${(d.value / max) * (height - 24)}px`, minHeight: d.value > 0 ? '4px' : '0', transition: 'height 0.5s ease', opacity: i === data.length - 1 ? 1 : 0.65 }} />
            <span style={{ fontSize: '9px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Donut chart
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let cumulative = 0
  const radius = 40
  const cx = size / 2, cy = size / 2

  function polarToXY(pct) {
    const angle = (pct * 360 - 90) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  function segmentPath(start, end) {
    if (end - start >= 0.9999) end = 0.9998
    const s = polarToXY(start), e = polarToXY(end)
    const large = end - start > 0.5 ? 1 : 0
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y} Z`
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const start = cumulative / total
        cumulative += seg.value
        const end = cumulative / total
        return <path key={i} d={segmentPath(start, end)} fill={seg.color} opacity={0.85} />
      })}
      <circle cx={cx} cy={cy} r={24} fill="var(--white)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-800)" fontFamily="var(--font-display)">{total}</text>
    </svg>
  )
}

// Stat card
function StatCard({ icon, label, value, sub, color = 'var(--navy-800)', trend }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: color }} />
      <div style={{ paddingLeft: '8px' }}>
        <p style={{ fontSize: '22px', margin: '0 0 8px' }}>{icon}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color, margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', margin: 0 }}>{sub}</p>}
        {trend !== undefined && (
          <p style={{ fontSize: '11px', color: trend >= 0 ? '#1e6f6a' : '#c0392b', fontFamily: 'var(--font-body)', margin: '4px 0 0', fontWeight: 600 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} vs last month
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [appts, setAppts] = useState([])
  const [patients, setPatients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [range, setRange] = useState('30') // days
  const [revFilter, setRevFilter] = useState('month') // today | week | month | custom
  const [revDate, setRevDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    async function fetchAll() {
      const [{ data: a }, { data: p }, { data: inv }] = await Promise.all([
        supabase.from('appointments').select('*').order('created_at', { ascending: true }),
        supabase.from('patients').select('*').order('created_at', { ascending: true }),
        supabase.from('patient_invoices').select('*').order('date', { ascending: true }),
      ])
      setAppts(a || [])
      setPatients(p || [])
      setInvoices(inv || [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <div className="admin-panel"><p className="admin-empty">Loading analytics...</p></div>

  const now = new Date()
  const daysAgo = (n) => new Date(now - n * 86400000)
  const inRange = (date) => new Date(date) >= daysAgo(parseInt(range))

  const rangeAppts = appts.filter(a => inRange(a.created_at))
  const prevAppts = appts.filter(a => new Date(a.created_at) >= daysAgo(parseInt(range) * 2) && new Date(a.created_at) < daysAgo(parseInt(range)))

  const rangePatients = patients.filter(p => inRange(p.created_at))
  const prevPatients = patients.filter(p => new Date(p.created_at) >= daysAgo(parseInt(range) * 2) && new Date(p.created_at) < daysAgo(parseInt(range)))

  const confirmed = rangeAppts.filter(a => a.status === 'confirmed').length
  const pending = rangeAppts.filter(a => a.status === 'pending').length
  const cancelled = rangeAppts.filter(a => a.status === 'cancelled').length
  const conversionRate = rangeAppts.length > 0 ? Math.round((confirmed / rangeAppts.length) * 100) : 0

  // Popular programs
  const programCounts = {}
  rangeAppts.forEach(a => {
    const prog = a.service || 'General'
    programCounts[prog] = (programCounts[prog] || 0) + 1
  })
  const topPrograms = Object.entries(programCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Daily bookings for chart (last N days)
  const days = parseInt(range) <= 30 ? 7 : parseInt(range) <= 90 ? 12 : 6
  const chartData = Array.from({ length: days }, (_, i) => {
    const date = daysAgo(days - 1 - i)
    const next = daysAgo(days - 2 - i)
    const count = rangeAppts.filter(a => {
      const d = new Date(a.created_at)
      return d >= date && d < next
    }).length
    const label = parseInt(range) <= 30
      ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : date.toLocaleDateString('en-IN', { month: 'short' })
    return { label, value: count }
  })

  // Monthly patients trend (last 6 months)
  const patientTrend = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - 5 + i + 1, 1)
    const count = patients.filter(p => new Date(p.created_at) >= month && new Date(p.created_at) < nextMonth).length
    return { label: month.toLocaleDateString('en-IN', { month: 'short' }), value: count }
  })

  // Recent activity
  const recentAppts = [...appts].reverse().slice(0, 6)

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  // ─── Revenue ─────────────────────────────────────
  const todayStr = now.toISOString().split('T')[0]

  function startOfWeek(d) {
    const dt = new Date(d)
    const day = dt.getDay() // 0=Sun
    const diff = (day === 0 ? -6 : 1) - day // move to Monday
    dt.setDate(dt.getDate() + diff)
    dt.setHours(0, 0, 0, 0)
    return dt
  }

  let revStart, revEnd, revLabel
  if (revFilter === 'today') {
    revStart = new Date(todayStr); revEnd = new Date(todayStr); revEnd.setHours(23, 59, 59, 999)
    revLabel = 'Today'
  } else if (revFilter === 'week') {
    revStart = startOfWeek(now)
    revEnd = new Date(revStart); revEnd.setDate(revEnd.getDate() + 6); revEnd.setHours(23, 59, 59, 999)
    revLabel = 'This Week'
  } else if (revFilter === 'month') {
    revStart = new Date(now.getFullYear(), now.getMonth(), 1)
    revEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    revLabel = 'This Month'
  } else {
    revStart = new Date(revDate); revEnd = new Date(revDate); revEnd.setHours(23, 59, 59, 999)
    revLabel = new Date(revDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const revInvoices = invoices.filter(inv => {
    const d = new Date(inv.date)
    return d >= revStart && d <= revEnd
  })
  const revBilled = revInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0)
  const revCollected = revInvoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0)
  const revDue = Math.max(revBilled - revCollected, 0)
  const revInvoiceCount = revInvoices.length

  // All-time collected (paid across all invoices, regardless of filter)
  const allTimeCollected = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0)
  const allTimeDue = invoices.reduce((s, i) => s + Math.max(Number(i.total_amount || 0) - Number(i.paid_amount || 0), 0), 0)

  // Last 7 days revenue trend (amount collected, by invoice date)
  const revenueTrend = Array.from({ length: 7 }, (_, i) => {
    const date = daysAgo(6 - i)
    const dateStr = date.toISOString().split('T')[0]
    const value = invoices
      .filter(inv => inv.date === dateStr)
      .reduce((s, inv) => s + Number(inv.paid_amount || 0), 0)
    return { label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), value }
  })

  const money = n => '\u20B9' + Number(n || 0).toLocaleString('en-IN')

  return (
    <div className="admin-panel" style={{ maxWidth: '1100px' }}>
      <div className="admin-panel-header">
        <h1>Analytics Dashboard</h1>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button className="admin-btn-primary" onClick={() => navigate('/admin/patients/new')} style={{ marginRight: '4px' }}>+ Add Patient</button>
          {[['7', '7 Days'], ['30', '30 Days'], ['90', '90 Days'], ['365', '1 Year']].map(([val, label]) => (
            <button key={val} onClick={() => setRange(val)} style={{ padding: '7px 14px', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: '2px', border: '1px solid rgba(15,39,68,0.12)', cursor: 'pointer', background: range === val ? 'var(--navy-800)' : 'var(--white)', color: range === val ? 'var(--gold-pale)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <StatCard icon="📅" label="Total Bookings" value={rangeAppts.length} sub={`${prevAppts.length} in prev period`} trend={rangeAppts.length - prevAppts.length} color="var(--gold)" />
        <StatCard icon="✅" label="Confirmed" value={confirmed} sub={`${conversionRate}% conversion`} color="#1e6f6a" />
        <StatCard icon="⏳" label="Pending" value={pending} sub="Awaiting confirmation" color="#b9914f" />
        <StatCard icon="👥" label="New Patients" value={rangePatients.length} sub={`${prevPatients.length} in prev period`} trend={rangePatients.length - prevPatients.length} color="#4a3d8f" />
        <StatCard icon="📊" label="Total Patients" value={patients.length} sub="All time" color="var(--navy-800)" />
      </div>

      {/* REVENUE */}
      <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>💰 Revenue — {revLabel}</p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {[['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['custom', 'Pick a Date']].map(([val, label]) => (
              <button key={val} onClick={() => setRevFilter(val)} style={{ padding: '7px 14px', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: '2px', border: '1px solid rgba(15,39,68,0.12)', cursor: 'pointer', background: revFilter === val ? 'var(--navy-800)' : 'var(--white)', color: revFilter === val ? 'var(--gold-pale)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
            {revFilter === 'custom' && (
              <input type="date" value={revDate} onChange={e => setRevDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '11px', fontFamily: 'var(--font-body)' }} />
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <StatCard icon="🧾" label="Billed" value={money(revBilled)} sub={`${revInvoiceCount} invoice${revInvoiceCount !== 1 ? 's' : ''}`} color="var(--navy-800)" />
          <StatCard icon="✅" label="Collected" value={money(revCollected)} sub={revLabel} color="#1e6f6a" />
          <StatCard icon="⏳" label="Outstanding" value={money(revDue)} sub={revLabel} color="#c0392b" />
          <StatCard icon="📈" label="All-Time Collected" value={money(allTimeCollected)} sub={`${money(allTimeDue)} due overall`} color="var(--gold)" />
        </div>

        <BarChart data={revenueTrend} label="Collections — Last 7 Days" color="#1e6f6a" height={110} />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Bookings trend chart */}
        <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '24px' }}>
          <BarChart data={chartData} label="Booking Trend" color="var(--gold)" height={140} />
        </div>

        {/* Status donut */}
        <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '16px', alignSelf: 'flex-start' }}>Booking Status</p>
          <DonutChart size={130} segments={[
            { value: confirmed, color: '#1e6f6a' },
            { value: pending, color: '#b9914f' },
            { value: cancelled, color: '#c0392b' },
          ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', width: '100%' }}>
            {[['#1e6f6a', 'Confirmed', confirmed], ['#b9914f', 'Pending', pending], ['#c0392b', 'Cancelled', cancelled]].map(([color, label, val]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', flex: 1 }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECOND ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Top Programs */}
        <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '16px' }}>Popular Programs</p>
          {topPrograms.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>No data yet</p>
          ) : topPrograms.map(([prog, count], i) => {
            const pct = Math.round((count / rangeAppts.length) * 100)
            return (
              <div key={prog} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--navy-800)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{prog}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(15,39,68,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? 'var(--gold)' : i === 1 ? '#1e6f6a' : 'rgba(15,39,68,0.2)', borderRadius: '100px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Patient Growth */}
        <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '24px' }}>
          <BarChart data={patientTrend} label="New Patients (6 Months)" color="#1e6f6a" height={140} />
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '24px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '16px' }}>Recent Bookings</p>
        {recentAppts.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>No bookings yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentAppts.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: i < recentAppts.length - 1 ? '1px solid rgba(15,39,68,0.06)' : 'none', flexWrap: 'wrap' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: a.status === 'confirmed' ? '#1e6f6a' : a.status === 'cancelled' ? '#c0392b' : '#b9914f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                  {(a.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-800)', margin: '0 0 2px', fontFamily: 'var(--font-body)' }}>{a.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-body)' }}>{a.service || 'General'} · {a.phone}</p>
                </div>
                <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '100px', fontFamily: 'var(--font-body)', fontWeight: 600, background: a.status === 'confirmed' ? 'rgba(30,111,106,0.12)' : a.status === 'cancelled' ? 'rgba(192,57,43,0.1)' : 'rgba(199,166,106,0.15)', color: a.status === 'confirmed' ? '#1e6f6a' : a.status === 'cancelled' ? '#c0392b' : '#9c7a3c' }}>{a.status}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{fmtDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .admin-panel [style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
          .admin-panel [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
