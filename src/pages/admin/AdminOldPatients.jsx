import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const emptyForm = { name: '', address: '', age: '', phone: '' }

export default function AdminOldPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    setLoading(true)
    const { data } = await supabase.from('old_patients').select('*').order('created_at', { ascending: false })
    setPatients(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(p) {
    setEditId(p.id)
    setForm({ name: p.name || '', address: p.address || '', age: p.age || '', phone: p.phone || '' })
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Name and WhatsApp/Mobile number are required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || null,
      age: form.age ? parseInt(form.age, 10) : null,
      phone: form.phone.trim(),
    }
    if (editId) {
      await supabase.from('old_patients').update(payload).eq('id', editId)
    } else {
      await supabase.from('old_patients').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    fetchPatients()
  }

  async function deletePatient(id) {
    if (!confirm('Delete this patient record?')) return
    await supabase.from('old_patients').delete().eq('id', id)
    fetchPatients()
  }

  function exportCSV() {
    const rows = filtered.length ? filtered : patients
    if (!rows.length) { alert('No patients to export'); return }
    const headers = ['Name', 'Address', 'Age', 'Phone', 'Added On']
    const csvRows = rows.map(p => [
      p.name, p.address || '', p.age || '', p.phone,
      new Date(p.created_at).toLocaleDateString('en-IN'),
    ])
    const csv = [headers, ...csvRows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `old_patients_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || (p.phone || '').includes(search) || (p.address || '').toLowerCase().includes(q)
  })

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Old Patients</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="admin-btn-outline" onClick={exportCSV}>⬇️ Export CSV</button>
          <button className="admin-btn-primary" onClick={openAdd}>+ Add Old Patient</button>
        </div>
      </div>

      <input
        placeholder="Search name, phone, address..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '9px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', width: '100%', marginBottom: '20px' }}
      />

      {loading ? <p className="admin-empty">Loading...</p> : filtered.length === 0 ? (
        <p className="admin-empty">No old patients found.</p>
      ) : (
        <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          {filtered.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(15,39,68,0.06)' : 'none', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--navy-800)', margin: 0, fontFamily: 'var(--font-body)' }}>
                  {p.name} {p.age ? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>· {p.age}y</span> : ''}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'var(--font-body)' }}>
                  📱 {p.phone} {p.address ? `· 📍 ${p.address}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="admin-btn-outline admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="admin-btn-danger admin-btn-sm" onClick={() => deletePatient(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,12,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--white)', borderRadius: '4px', padding: '28px', width: '100%', maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy-800)', marginBottom: '18px' }}>{editId ? 'Edit Patient' : 'Add Old Patient'}</h2>

            <label style={labelStyle}>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Patient name" />

            <label style={labelStyle}>Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="Address" />

            <label style={labelStyle}>Age</label>
            <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} style={inputStyle} placeholder="Age" />

            <label style={labelStyle}>WhatsApp / Mobile Number</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="10-digit number" />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="admin-btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="admin-btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', margin: '12px 0 5px', fontFamily: 'var(--font-body)' }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid rgba(15,39,68,0.15)', borderRadius: '2px', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }
