import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TAGS = ['Root Canal', 'Orthodontics', 'Implant', 'Cosmetic', 'Pediatric', 'VIP', 'Follow-up Due']
const AVATAR_COLORS = ['#b9914f', '#1e6f6a', '#4a3d8f', '#8f3d3d', '#3d6b8f', '#6b8f3d', '#8f6b3d']

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTag, setFilterTag] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, new_this_month: 0 })
  const navigate = useNavigate()

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
    const list = data || []
    setPatients(list)
    const now = new Date()
    const thisMonth = list.filter(p => new Date(p.created_at).getMonth() === now.getMonth())
    setStats({ total: list.length, active: list.filter(p => p.status === 'active').length, new_this_month: thisMonth.length })
    setLoading(false)
  }

  const filtered = patients.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || (p.email || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    const matchTag = !filterTag || (p.tags || []).includes(filterTag)
    return matchSearch && matchStatus && matchTag
  })

  async function deletePatient(id) {
    if (!confirm('Delete this patient? All their data will be permanently removed.')) return
    await supabase.from('patients').delete().eq('id', id)
    fetchPatients()
  }

  return (
    <div className="admin-panel">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total Patients', value: stats.total, icon: '👥' },
          { label: 'Active', value: stats.active, icon: '✅' },
          { label: 'New This Month', value: stats.new_this_month, icon: '🆕' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '18px 20px' }}>
            <p style={{ fontSize: '22px', margin: '0 0 4px' }}>{s.icon}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--navy-800)', margin: '0 0 4px' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="admin-panel-header">
        <h1>Patient Profiles</h1>
        <button className="admin-btn-primary" onClick={() => navigate('/admin/patients/new')}>+ Add Patient</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search name, phone, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', flex: '1', minWidth: '200px' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '9px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ padding: '9px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }}>
          <option value="">All Tags</option>
          {TAGS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {loading ? <p className="admin-empty">Loading...</p> : filtered.length === 0 ? (
        <p className="admin-empty">No patients found.</p>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          {filtered.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(15,39,68,0.06)' : 'none', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: p.avatar_color || '#b9914f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
                {initials(p.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--navy-800)', margin: 0, fontFamily: 'var(--font-body)' }}>{p.name}</p>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.5px', background: p.status === 'active' ? 'rgba(30,111,106,0.12)' : 'rgba(199,166,106,0.15)', color: p.status === 'active' ? '#1e6f6a' : '#9c7a3c' }}>
                    {p.status}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'var(--font-body)' }}>
                  📞 {p.phone} {p.email ? `· ✉️ ${p.email}` : ''} {p.age ? `· ${p.age}y` : ''} {p.gender ? `· ${p.gender}` : ''}
                </p>
                {(p.tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
                    {p.tags.map(t => (
                      <span key={t} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: 'rgba(15,39,68,0.06)', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <p style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Since {new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to={`/admin/patients/${p.id}`} className="admin-btn-outline admin-btn-sm">View Profile</Link>
                <button className="admin-btn-danger admin-btn-sm" onClick={() => deletePatient(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
