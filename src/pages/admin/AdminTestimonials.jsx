import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const PROGRAMS = [
  'Root Canal Treatment',
  'Cosmetic Dentistry / Smile Makeover',
  'Dental Implant',
  'Orthodontics (Braces)',
  'Pediatric Dentistry',
  'Emergency Dental Care',
  'General Consultation',
  'Other',
]

const AVATAR_COLORS = ['#b9914f', '#1e6f6a', '#4a3d8f', '#8f3d3d', '#3d6b8f', '#6b8f3d', '#8f6b3d']

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} onClick={() => onChange?.(s)} style={{ fontSize: '20px', cursor: onChange ? 'pointer' : 'default', color: s <= value ? '#b9914f' : 'rgba(15,39,68,0.15)', transition: 'color 0.15s' }}>★</span>
      ))}
    </div>
  )
}

const EMPTY = { name: '', location: '', program: '', rating: 5, review: '', avatar_color: '#b9914f', photo_url: '', visible: true, featured: false }

export default function AdminTestimonials() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | {id}
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order').order('created_at')
    setList(data || [])
    setLoading(false)
  }

  function openNew() { setForm(EMPTY); setEditing('new') }
  function openEdit(t) { setForm({ ...t }); setEditing(t.id) }
  function closeForm() { setEditing(null); setForm(EMPTY) }

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function save() {
    if (!form.name || !form.review) { setMsg('Name and review required'); return }
    setSaving(true)
    if (editing === 'new') {
      await supabase.from('testimonials').insert({ ...form, sort_order: list.length })
    } else {
      await supabase.from('testimonials').update(form).eq('id', editing)
    }
    setSaving(false)
    closeForm()
    fetchList()
  }

  async function remove(id) {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    fetchList()
  }

  async function toggle(id, key, val) {
    await supabase.from('testimonials').update({ [key]: val }).eq('id', id)
    setList(prev => prev.map(t => t.id === id ? { ...t, [key]: val } : t))
  }

  async function moveUp(i) {
    if (i === 0) return
    const updated = [...list]
    ;[updated[i - 1], updated[i]] = [updated[i], updated[i - 1]]
    setList(updated)
    await Promise.all(updated.map((t, idx) => supabase.from('testimonials').update({ sort_order: idx }).eq('id', t.id)))
  }

  async function moveDown(i) {
    if (i === list.length - 1) return
    const updated = [...list]
    ;[updated[i], updated[i + 1]] = [updated[i + 1], updated[i]]
    setList(updated)
    await Promise.all(updated.map((t, idx) => supabase.from('testimonials').update({ sort_order: idx }).eq('id', t.id)))
  }

  async function uploadPhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `testimonials/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('gallery-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('gallery-images').getPublicUrl(path)
      setF('photo_url', data.publicUrl)
    }
    setUploading(false)
  }

  const featured = list.filter(t => t.featured && t.visible)
  const all = list

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Testimonials</h1>
        <button className="admin-btn-primary" onClick={openNew}>+ Add Testimonial</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: list.length },
          { label: 'Visible', value: list.filter(t => t.visible).length },
          { label: 'Featured', value: featured.length },
          { label: 'Avg Rating', value: list.length ? (list.reduce((s, t) => s + t.rating, 0) / list.length).toFixed(1) + ' ★' : '—' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '14px 20px', minWidth: '100px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--navy-800)', margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '16px' }}>
        ⬆⬇ arrows to reorder · ⭐ = featured on home page · 👁 = visible on website
      </p>

      {/* ADD / EDIT FORM */}
      {editing && (
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.1)', borderRadius: '2px', padding: '24px', marginBottom: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>
              {editing === 'new' ? 'Add New Testimonial' : 'Edit Testimonial'}
            </p>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
          </div>

          {/* Preview */}
          <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '16px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: form.avatar_color, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-display)' }}>{initials(form.name || 'P')}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <StarRating value={form.rating} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--navy-800)', margin: '6px 0 2px' }}>{form.name || 'Patient Name'}</p>
              <p style={{ fontSize: '11px', color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>{form.program}{form.location ? ` · ${form.location}` : ''}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic', lineHeight: '1.7', margin: 0 }}>"{form.review || 'Review text will appear here...'}"</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Patient Name *</label>
              <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Priya Sharma" style={{ width: '100%', padding: '9px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
            </div>
            {/* Location */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Location</label>
              <input value={form.location} onChange={e => setF('location', e.target.value)} placeholder="Bangalore" style={{ width: '100%', padding: '9px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
            </div>
            {/* Program */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Program</label>
              <select value={form.program} onChange={e => setF('program', e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }}>
                <option value="">Select program</option>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            {/* Rating */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Rating</label>
              <StarRating value={form.rating} onChange={v => setF('rating', v)} />
            </div>
          </div>

          {/* Review */}
          <div style={{ marginTop: '14px' }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Review / Testimonial *</label>
            <textarea value={form.review} onChange={e => setF('review', e.target.value)} rows={4} placeholder="Patient's experience in their own words..." style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical' }} />
          </div>

          {/* Avatar color + photo */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Avatar Color</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {AVATAR_COLORS.map(c => (
                  <div key={c} onClick={() => setF('avatar_color', c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer', border: form.avatar_color === c ? '2px solid var(--navy-800)' : '2px solid transparent', transition: 'border 0.15s' }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Photo (optional)</label>
              <label className="admin-file-btn" style={{ fontSize: '12px', padding: '7px 14px' }}>
                {uploading ? 'Uploading...' : form.photo_url ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={uploadPhoto} hidden />
              </label>
              {form.photo_url && <button onClick={() => setF('photo_url', '')} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#c0392b', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Remove</button>}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--navy-800)' }}>
              <input type="checkbox" checked={form.visible} onChange={e => setF('visible', e.target.checked)} />
              Visible on website
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--navy-800)' }}>
              <input type="checkbox" checked={form.featured} onChange={e => setF('featured', e.target.checked)} />
              ⭐ Featured on home page
            </label>
          </div>

          {msg && <p style={{ color: '#c0392b', fontSize: '12px', fontFamily: 'var(--font-body)', marginTop: '10px' }}>{msg}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="admin-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing === 'new' ? 'Add Testimonial' : 'Save Changes'}</button>
            <button className="admin-btn-outline" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? <p className="admin-empty">Loading...</p> : list.length === 0 ? (
        <p className="admin-empty">No testimonials yet. Add your first one!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {all.map((t, i) => (
            <div key={t.id} style={{ background: 'var(--white)', border: `1px solid ${t.featured ? 'rgba(199,166,106,0.3)' : 'rgba(15,39,68,0.08)'}`, borderRadius: '2px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start', opacity: t.visible ? 1 : 0.55 }}>
              {/* Avatar */}
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: t.avatar_color, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.photo_url ? <img src={t.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)' }}>{initials(t.name)}</span>}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{t.name}</span>
                  {t.location && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{t.location}</span>}
                  <StarRating value={t.rating} />
                  {t.featured && <span style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '100px', background: 'rgba(199,166,106,0.15)', color: '#9c7a3c', fontFamily: 'var(--font-body)', fontWeight: 600 }}>⭐ Featured</span>}
                  {!t.visible && <span style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '100px', background: 'rgba(15,39,68,0.06)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Hidden</span>}
                </div>
                {t.program && <p style={{ fontSize: '11px', color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', margin: '0 0 6px', fontWeight: 600 }}>{t.program}</p>}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic', lineHeight: '1.6', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{t.review}"</p>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => moveUp(i)} disabled={i === 0} style={{ width: '28px', height: '28px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: i === 0 ? 'default' : 'pointer', background: 'var(--white)', fontSize: '12px', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                  <button onClick={() => moveDown(i)} disabled={i === list.length - 1} style={{ width: '28px', height: '28px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: i === list.length - 1 ? 'default' : 'pointer', background: 'var(--white)', fontSize: '12px', opacity: i === list.length - 1 ? 0.3 : 1 }}>↓</button>
                </div>
                <button onClick={() => toggle(t.id, 'featured', !t.featured)} style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: t.featured ? 'rgba(199,166,106,0.15)' : 'var(--white)', color: t.featured ? '#9c7a3c' : 'var(--text-muted)', fontFamily: 'var(--font-body)' }} title="Toggle featured">⭐</button>
                <button onClick={() => toggle(t.id, 'visible', !t.visible)} style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: 'var(--white)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} title="Toggle visibility">{t.visible ? '👁' : '🚫'}</button>
                <button onClick={() => openEdit(t)} className="admin-btn-outline admin-btn-sm">Edit</button>
                <button onClick={() => remove(t.id)} className="admin-btn-danger admin-btn-sm">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
