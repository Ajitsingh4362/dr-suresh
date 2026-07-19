import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Homeopathy', 'Psychotherapy', 'Lifestyle', 'Nutrition', 'Integrative', 'Other']
const POTENCIES = ['Q (Mother Tincture)', '3C', '6C', '12C', '30C', '200C', '1M', '10M', '50M', 'CM', 'LM1', 'LM2', 'LM3', 'Tablet', 'Drops', 'Other']
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Once weekly', 'Twice weekly', 'Bedtime', 'Morning only', 'As needed (acute)', 'Every 15 mins (acute)', 'Other']
const FOLLOW_UPS = ['1 week', '2 weeks', '3 weeks', '4 weeks', '6 weeks', '8 weeks', '3 months', '6 months']
const COMMON_TAGS = ['Root Canal', 'Cavity', 'Gum Disease', 'Tooth Pain', 'Orthodontics', 'Implant', 'Cosmetic', 'Whitening', 'Pediatric', 'Emergency', 'Extraction', 'Sensitivity', 'Wisdom Tooth', 'Bad Breath', 'Bleeding Gums', 'Bruxism', 'Post-Surgery', 'Denture', 'Braces', 'Follow-up']

const EMPTY_MED = { name: '', potency: '30C', dose: '2 pills', frequency: 'Twice daily', duration: '4 weeks', notes: '' }
const EMPTY_TEMPLATE = { name: '', category: 'Homeopathy', condition_tags: [], medicines: [{ ...EMPTY_MED }], instructions: '', diet_guidelines: '', lifestyle_notes: '', follow_up_duration: '4 weeks' }

function MedicineRow({ med, idx, onChange, onDelete, isOnly }) {
  const s = (key, val) => onChange(idx, { ...med, [key]: val })
  return (
    <div style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.1)', borderRadius: '4px', padding: '14px 16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{idx + 1}</div>
        <input value={med.name} onChange={e => s('name', e.target.value)} placeholder="Medicine name (e.g. Pulsatilla)" style={{ flex: 1, padding: '8px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.92rem', fontFamily: 'var(--font-body)', fontWeight: 600, outline: 'none', color: 'var(--navy-800)' }} />
        {!isOnly && <button onClick={() => onDelete(idx)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}>×</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Potency</label>
          <select value={med.potency} onChange={e => s('potency', e.target.value)} style={{ width: '100%', padding: '7px 8px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.8rem', fontFamily: 'var(--font-body)', outline: 'none' }}>
            {POTENCIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Dose</label>
          <input value={med.dose} onChange={e => s('dose', e.target.value)} placeholder="e.g. 2 pills" style={{ width: '100%', padding: '7px 8px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.8rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Frequency</label>
          <select value={med.frequency} onChange={e => s('frequency', e.target.value)} style={{ width: '100%', padding: '7px 8px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.8rem', fontFamily: 'var(--font-body)', outline: 'none' }}>
            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Duration</label>
          <input value={med.duration} onChange={e => s('duration', e.target.value)} placeholder="e.g. 4 weeks" style={{ width: '100%', padding: '7px 8px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.8rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
        </div>
      </div>
      <div style={{ marginTop: '8px' }}>
        <input value={med.notes} onChange={e => s('notes', e.target.value)} placeholder="Special notes for this medicine (optional)" style={{ width: '100%', padding: '7px 10px', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', fontSize: '0.8rem', fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}

export default function AdminPrescriptionTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_TEMPLATE)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchTemplates() }, [])

  async function fetchTemplates() {
    const { data } = await supabase.from('prescription_templates').select('*').order('use_count', { ascending: false }).order('created_at')
    setTemplates(data || [])
    setLoading(false)
  }

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function updateMed(idx, med) {
    const meds = [...form.medicines]
    meds[idx] = med
    setF('medicines', meds)
  }

  function addMed() { setF('medicines', [...form.medicines, { ...EMPTY_MED }]) }

  function deleteMed(idx) {
    if (form.medicines.length === 1) return
    setF('medicines', form.medicines.filter((_, i) => i !== idx))
  }

  function toggleTag(tag) {
    const tags = form.condition_tags || []
    setF('condition_tags', tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])
  }

  function openNew() { setForm({ ...EMPTY_TEMPLATE, medicines: [{ ...EMPTY_MED }] }); setEditing('new') }

  function openEdit(t) {
    setForm({
      ...t,
      medicines: Array.isArray(t.medicines) ? t.medicines : JSON.parse(t.medicines || '[]')
    })
    setEditing(t.id)
  }

  async function duplicate(t) {
    const { data } = await supabase.from('prescription_templates').insert({
      ...t, id: undefined, name: t.name + ' (Copy)', use_count: 0, created_at: undefined, updated_at: undefined
    }).select().single()
    if (data) { fetchTemplates(); openEdit(data) }
  }

  function closeForm() { setEditing(null); setForm(EMPTY_TEMPLATE); setMsg('') }

  async function save() {
    if (!form.name.trim()) { setMsg('Template name required'); return }
    if (form.medicines.some(m => !m.name.trim())) { setMsg('All medicine names required'); return }
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    if (editing === 'new') {
      delete payload.id; delete payload.created_at
      await supabase.from('prescription_templates').insert(payload)
    } else {
      await supabase.from('prescription_templates').update(payload).eq('id', editing)
    }
    setSaving(false)
    closeForm()
    fetchTemplates()
  }

  async function remove(id) {
    if (!confirm('Delete this template permanently?')) return
    await supabase.from('prescription_templates').delete().eq('id', id)
    fetchTemplates()
  }

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.condition_tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filterCat === 'all' || t.category === filterCat
    return matchSearch && matchCat
  })

  const catColors = { Homeopathy: '#1e6f6a', Psychotherapy: '#4a3d8f', Lifestyle: '#6b8f3d', Nutrition: '#8f6b3d', Integrative: '#b9914f', Other: '#666' }

  // ─── EDITOR ────────────────────────────────────────────────
  if (editing) return (
    <div className="admin-panel" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className="admin-back-link" onClick={closeForm}>← Back to templates</button>
        <div style={{ flex: 1 }} />
        {msg && <span style={{ fontSize: '12px', color: '#c0392b', fontFamily: 'var(--font-body)' }}>{msg}</span>}
        <button className="admin-btn-outline admin-btn-sm" onClick={closeForm}>Cancel</button>
        <button className="admin-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing === 'new' ? 'Create Template' : 'Save Changes'}</button>
      </div>

      {/* Template name + category */}
      <div style={{ background: 'var(--navy-800)', borderRadius: '4px', padding: '20px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
        <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Template Name (e.g. PCOS Protocol, Anxiety Support...)" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--gold-pale)', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Category:</span>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setF('category', cat)} style={{ padding: '4px 12px', borderRadius: '100px', border: '1px solid', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', background: form.category === cat ? catColors[cat] || '#666' : 'transparent', color: form.category === cat ? '#fff' : 'rgba(255,255,255,0.5)', borderColor: form.category === cat ? catColors[cat] || '#666' : 'rgba(255,255,255,0.15)', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Condition tags */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '10px' }}>Condition Tags (click to select)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {COMMON_TAGS.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: '5px 12px', borderRadius: '100px', border: '1px solid', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer', background: (form.condition_tags || []).includes(tag) ? 'var(--navy-800)' : 'var(--white)', color: (form.condition_tags || []).includes(tag) ? 'var(--gold-pale)' : 'var(--text-muted)', borderColor: (form.condition_tags || []).includes(tag) ? 'var(--navy-800)' : 'rgba(15,39,68,0.12)', transition: 'all 0.15s' }}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, margin: 0 }}>💊 Medicines ({form.medicines.length})</p>
          <button onClick={addMed} style={{ background: 'var(--navy-800)', color: 'var(--gold-pale)', border: 'none', borderRadius: '2px', padding: '6px 14px', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px' }}>+ Add Medicine</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.medicines.map((med, idx) => (
            <MedicineRow key={idx} med={med} idx={idx} onChange={updateMed} onDelete={deleteMed} isOnly={form.medicines.length === 1} />
          ))}
        </div>
      </div>

      {/* Instructions, Diet, Lifestyle */}
      {[
        ['📋 General Instructions', 'instructions', 'e.g. Take medicines 30 mins before food. Avoid coffee, camphor, strong perfumes...'],
        ['🥗 Diet Guidelines', 'diet_guidelines', 'e.g. No dairy for 2 weeks. Include leafy greens. Avoid sugar...'],
        ['🧘 Lifestyle Notes', 'lifestyle_notes', 'e.g. 30 mins walk daily. Avoid stress. Sleep by 10pm...'],
      ].map(([label, key, placeholder]) => (
        <div key={key} style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
          <textarea value={form[key] || ''} onChange={e => setF(key, e.target.value)} placeholder={placeholder} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        </div>
      ))}

      {/* Follow-up */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>📅 Follow-up Duration</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FOLLOW_UPS.map(f => (
            <button key={f} onClick={() => setF('follow_up_duration', f)} style={{ padding: '7px 16px', borderRadius: '2px', border: '1px solid', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer', background: form.follow_up_duration === f ? 'var(--navy-800)' : 'var(--white)', color: form.follow_up_duration === f ? 'var(--gold-pale)' : 'var(--text-muted)', borderColor: form.follow_up_duration === f ? 'var(--navy-800)' : 'rgba(15,39,68,0.12)', transition: 'all 0.15s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="admin-btn-primary" onClick={save} disabled={saving} style={{ minWidth: '160px' }}>{saving ? 'Saving...' : editing === 'new' ? 'Create Template' : 'Save Changes'}</button>
        <button className="admin-btn-outline" onClick={closeForm}>Cancel</button>
      </div>
    </div>
  )

  // ─── LIST ──────────────────────────────────────────────────
  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Prescription Templates</h1>
        <button className="admin-btn-primary" onClick={openNew}>+ New Template</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Templates', value: templates.length, icon: '📋' },
          { label: 'Most Used', value: templates[0]?.name?.split(' ').slice(0, 2).join(' ') || '—', icon: '🔥', small: true },
          { label: 'Categories', value: [...new Set(templates.map(t => t.category))].length, icon: '🏷️' },
          { label: 'Total Uses', value: templates.reduce((s, t) => s + (t.use_count || 0), 0), icon: '✅' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '14px 16px' }}>
            <p style={{ fontSize: '18px', margin: '0 0 4px' }}>{s.icon}</p>
            <p style={{ fontFamily: s.small ? 'var(--font-body)' : 'var(--font-display)', fontSize: s.small ? '14px' : '22px', fontWeight: 700, color: 'var(--navy-800)', margin: '0 0 2px', lineHeight: 1.2 }}>{s.value}</p>
            <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input placeholder="Search templates or conditions..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '9px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '9px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <p className="admin-empty">Loading...</p> : filtered.length === 0 ? (
        <p className="admin-empty">No templates found. Create your first one!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map(t => {
            const meds = Array.isArray(t.medicines) ? t.medicines : JSON.parse(t.medicines || '[]')
            return (
              <div key={t.id} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '4px', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,39,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                {/* Card header */}
                <div style={{ background: catColors[t.category] || 'var(--navy-800)', padding: '14px 16px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--gold)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{t.name}</p>
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: '100px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{t.category}</span>
                    </div>
                    {t.use_count > 0 && (
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 10px', borderRadius: '100px', fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap' }}>Used {t.use_count}×</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {(t.condition_tags || []).length > 0 && (
                  <div style={{ padding: '10px 16px 6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(t.condition_tags || []).map(tag => (
                      <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: 'rgba(15,39,68,0.06)', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{tag}</span>
                    ))}
                  </div>
                )}

                {/* Medicines list */}
                <div style={{ padding: '10px 16px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, margin: '0 0 8px' }}>💊 {meds.length} Medicine{meds.length !== 1 ? 's' : ''}</p>
                  {meds.slice(0, 3).map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: '12px', color: 'var(--navy-800)', fontFamily: 'var(--font-body)', fontWeight: 600, margin: 0 }}>{m.name} <span style={{ color: 'var(--gold-deep)', fontWeight: 400 }}>{m.potency}</span></p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{m.frequency}</span>
                    </div>
                  ))}
                  {meds.length > 3 && <p style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', margin: '4px 0 0' }}>+{meds.length - 3} more medicines</p>}
                </div>

                {/* Follow-up */}
                {t.follow_up_duration && (
                  <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px' }}>📅</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Follow-up in {t.follow_up_duration}</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: '10px 16px 14px', borderTop: '1px solid rgba(15,39,68,0.06)', display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEdit(t)} className="admin-btn-primary admin-btn-sm" style={{ flex: 1 }}>Edit</button>
                  <button onClick={() => duplicate(t)} className="admin-btn-outline admin-btn-sm" title="Duplicate">⧉ Copy</button>
                  <button onClick={() => remove(t.id)} className="admin-btn-danger admin-btn-sm">Del</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
