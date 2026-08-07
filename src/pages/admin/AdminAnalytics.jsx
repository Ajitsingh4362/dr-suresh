import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ─── Shared visual atoms ──────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div className="analytics-card" style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.06)', borderRadius: '10px', padding: '24px', boxShadow: 'var(--shadow-sm)', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', ...style }}>
      <span style={{ width: '14px', height: '2px', background: 'var(--gold)', display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>{children}</span>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '100px', padding: '4px', gap: '2px', flexWrap: 'wrap' }}>
      {options.map(([val, label]) => (
        <button
          key={val}
          data-active={value === val ? 'true' : 'false'}
          className="analytics-seg-btn"
          onClick={() => onChange(val)}
          style={{ padding: '7px 15px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', transition: 'all 0.2s', background: value === val ? 'var(--navy-800)' : 'transparent', color: value === val ? 'var(--gold-pale)' : 'var(--text-muted)' }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// Stat card — icon chip, big display number, optional trend pill
function StatCard({ icon, label, value, sub, color = 'var(--navy-800)', tint = 'rgba(13,35,64,0.06)', trend }) {
  return (
    <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{icon}</div>
        {trend !== undefined && (
          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', fontFamily: 'var(--font-body)', background: trend >= 0 ? 'rgba(30,111,106,0.1)' : 'rgba(192,57,43,0.1)', color: trend >= 0 ? '#1e6f6a' : '#c0392b', whiteSpace: 'nowrap' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color, margin: '0 0 3px', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '10.5px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, fontWeight: 600 }}>{label}</p>
      </div>
      {sub && <p style={{ fontSize: '11.5px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', margin: 0 }}>{sub}</p>}
    </Card>
  )
}

// SVG bar chart — gridlines, rounded bars, native tooltips, most-recent bar emphasized
function BarChart({ data, color = 'var(--gold)', height = 150, label }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const n = Math.max(data.length, 1)
  const W = 600, H = height
  const padTop = 28, padBottom = 24
  const chartH = H - padTop - padBottom
  const slot = W / n
  const gap = slot * 0.34
  const barW = slot - gap

  return (
    <div>
      {label && <SectionLabel style={{ marginBottom: '18px' }}>{label}</SectionLabel>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${H}px`, display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} x2={W} y1={padTop + chartH * (1 - f)} y2={padTop + chartH * (1 - f)} stroke="rgba(15,39,68,0.07)" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const x = i * slot + gap / 2
          const barH = d.value > 0 ? Math.max((d.value / max) * chartH, 4) : 0
          const y = padTop + chartH - barH
          const isLast = i === data.length - 1
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 0.5)} rx="3" fill={color} opacity={isLast ? 1 : 0.45} />
              <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }}>{d.value}</text>
              <text x={x + barW / 2} y={H - 7} textAnchor="middle" fontSize="10" style={{ fontFamily: 'var(--font-body)', fill: 'var(--text-light)' }}>{d.label}</text>
              <title>{d.label}: {d.value}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// SVG area chart — smooth line + soft gradient fill, used for the revenue trend
function AreaChart({ data, color = '#C9A45C', height = 160, label, money }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const n = data.length
  const W = 600, H = height
  const padTop = 22, padBottom = 24
  const chartH = H - padTop - padBottom
  const stepX = n > 1 ? W / (n - 1) : W

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: padTop + chartH - (d.value / max) * chartH,
    value: d.value,
    label: d.label,
  }))

  function smoothPath(pts) {
    if (pts.length < 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1]
      const midX = (p0.x + p1.x) / 2
      d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return d
  }

  const linePath = smoothPath(points)
  const floorY = padTop + chartH
  const areaPath = `${linePath} L ${points[n - 1].x} ${floorY} L ${points[0].x} ${floorY} Z`
  const fmt = money || (v => v)

  return (
    <div>
      {label && <SectionLabel style={{ marginBottom: '18px' }}>{label}</SectionLabel>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${H}px`, display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map(f => (
          <line key={f} x1={0} x2={W} y1={padTop + chartH * (1 - f)} y2={padTop + chartH * (1 - f)} stroke="rgba(15,39,68,0.06)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#analyticsAreaGrad)" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === n - 1 ? 4.5 : 3} fill="var(--white)" stroke={color} strokeWidth="2" />
            <title>{p.label}: {fmt(p.value)}</title>
          </g>
        ))}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" style={{ fontFamily: 'var(--font-body)', fill: 'var(--text-light)' }}>{p.label}</text>
        ))}
      </svg>
    </div>
  )
}

// Ring chart — rounded-cap stroke donut, replaces the old pie-wedge version
function RingChart({ segments, size = 148, strokeWidth = 18 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 0
  const safeTotal = total || 1
  const radius = (size - strokeWidth) / 2
  const cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * radius
  let acc = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(15,39,68,0.06)" strokeWidth={strokeWidth} />
      {segments.filter(seg => seg.value > 0).map((seg, i) => {
        const frac = seg.value / safeTotal
        const dash = Math.max(frac * circumference - 2, 0)
        const rotation = (acc / safeTotal) * 360 - 90
        acc += seg.value
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        )
      })}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="26" fontWeight="700" style={{ fontFamily: 'var(--font-display)', fill: 'var(--navy-800)' }}>{total}</text>
      <text x={cx} y={cy + 17} textAnchor="middle" fontSize="9.5" style={{ fontFamily: 'var(--font-body)', fill: 'var(--text-light)', letterSpacing: '1px', textTransform: 'uppercase' }}>Total</text>
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────

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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="admin-btn-primary" onClick={() => navigate('/admin/patients/new')}>+ Add Patient</button>
          <SegmentedControl value={range} onChange={setRange} options={[['7', '7 Days'], ['30', '30 Days'], ['90', '90 Days'], ['365', '1 Year']]} />
        </div>
      </div>

      {/* OVERVIEW */}
      <SectionLabel>Overview</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        <StatCard icon="📅" label="Total Bookings" value={rangeAppts.length} sub={`${prevAppts.length} in prev period`} trend={rangeAppts.length - prevAppts.length} color="var(--navy-800)" tint="rgba(199,166,106,0.16)" />
        <StatCard icon="✅" label="Confirmed" value={confirmed} sub={`${conversionRate}% conversion`} color="#1e6f6a" tint="rgba(30,111,106,0.1)" />
        <StatCard icon="⏳" label="Pending" value={pending} sub="Awaiting confirmation" color="#9c7a3c" tint="rgba(199,166,106,0.16)" />
        <StatCard icon="👥" label="New Patients" value={rangePatients.length} sub={`${prevPatients.length} in prev period`} trend={rangePatients.length - prevPatients.length} color="#4a3d8f" tint="rgba(74,61,143,0.1)" />
        <StatCard icon="📊" label="Total Patients" value={patients.length} sub="All time" color="var(--navy-800)" tint="rgba(13,35,64,0.07)" />
      </div>

      {/* REVENUE */}
      <SectionLabel>Revenue</SectionLabel>
      <Card style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>{revLabel}</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <SegmentedControl value={revFilter} onChange={setRevFilter} options={[['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['custom', 'Pick a Date']]} />
            {revFilter === 'custom' && (
              <input type="date" value={revDate} onChange={e => setRevDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-body)', outline: 'none' }} />
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <StatCard icon="🧾" label="Billed" value={money(revBilled)} sub={`${revInvoiceCount} invoice${revInvoiceCount !== 1 ? 's' : ''}`} color="var(--navy-800)" tint="rgba(13,35,64,0.07)" />
          <StatCard icon="✅" label="Collected" value={money(revCollected)} sub={revLabel} color="#1e6f6a" tint="rgba(30,111,106,0.1)" />
          <StatCard icon="⏳" label="Outstanding" value={money(revDue)} sub={revLabel} color="#c0392b" tint="rgba(192,57,43,0.08)" />
          <StatCard icon="📈" label="All-Time Collected" value={money(allTimeCollected)} sub={`${money(allTimeDue)} due overall`} color="var(--gold-deep)" tint="rgba(199,166,106,0.16)" />
        </div>

        <AreaChart data={revenueTrend} label="Collections — Last 7 Days" color="#C9A45C" height={160} money={money} />
      </Card>

      {/* TRENDS */}
      <SectionLabel>Trends</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>

        <Card>
          <BarChart data={chartData} label="Booking Trend" color="var(--gold)" height={150} />
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SectionLabel style={{ alignSelf: 'flex-start' }}>Booking Status</SectionLabel>
          <RingChart size={140} strokeWidth={17} segments={[
            { value: confirmed, color: '#1e6f6a' },
            { value: pending, color: '#C9A45C' },
            { value: cancelled, color: '#c0392b' },
          ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px', width: '100%' }}>
            {[['#1e6f6a', 'Confirmed', confirmed], ['#C9A45C', 'Pending', pending], ['#c0392b', 'Cancelled', cancelled]].map(([color, lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', flex: 1 }}>{lbl}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '36px' }}>

        <Card>
          <SectionLabel>Popular Programs</SectionLabel>
          {topPrograms.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>No data yet</p>
          ) : topPrograms.map(([prog, count], i) => {
            const pct = rangeAppts.length ? Math.round((count / rangeAppts.length) * 100) : 0
            return (
              <div key={prog} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'var(--gold)' : 'rgba(13,35,64,0.07)', color: i === 0 ? '#fff' : 'var(--navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11.5px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--navy-800)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{prog}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(15,39,68,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? 'var(--gold)' : i === 1 ? '#1e6f6a' : 'rgba(15,39,68,0.18)', borderRadius: '100px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </Card>

        <Card>
          <BarChart data={patientTrend} label="New Patients (6 Months)" color="#1e6f6a" height={150} />
        </Card>
      </div>

      {/* RECENT ACTIVITY */}
      <SectionLabel>Recent Activity</SectionLabel>
      <Card>
        {recentAppts.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: '13px', fontFamily: 'var(--font-body)' }}>No bookings yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentAppts.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i < recentAppts.length - 1 ? '1px solid rgba(15,39,68,0.06)' : 'none', flexWrap: 'wrap' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: a.status === 'confirmed' ? 'rgba(30,111,106,0.12)' : a.status === 'cancelled' ? 'rgba(192,57,43,0.1)' : 'rgba(199,166,106,0.18)', color: a.status === 'confirmed' ? '#1e6f6a' : a.status === 'cancelled' ? '#c0392b' : '#9c7a3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
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
      </Card>

      <style>{`
        .analytics-seg-btn:not([data-active="true"]):hover { background: rgba(15,39,68,0.07) !important; color: var(--navy-800) !important; }
        @media (max-width: 760px) {
          .admin-panel [style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
          .admin-panel [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
