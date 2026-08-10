import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['General', 'Homeopathy', 'Consultation', 'Programs', 'Lifestyle', 'Other']

const EMPTY = { question: '', answer: '', category: 'General', visible: true }

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [msg, setMsg] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchFaqs() }, [])

  async function fetchFaqs() {
    const { data } = await supabase.from('faqs').select('*').order('sort_order').order('created_at')
    setFaqs(data || [])
    setLoading(false)
  }

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function openNew() { setForm(EMPTY); setEditing('new'); setMsg('') }
  function openEdit(faq) { setForm({ ...faq }); setEditing(faq.id); setMsg('') }
  function closeForm() { setEditing(null); setForm(EMPTY); setMsg('') }

  async function save() {
    if (!form.question.trim() || !form.answer.trim()) { setMsg('Question and answer required'); return }
    setSaving(true)
    if (editing === 'new') {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order || 0)) + 1 : 0
      await supabase.from('faqs').insert({ ...form, sort_order: maxOrder })
    } else {
      await supabase.from('faqs').update(form).eq('id', editing)
    }
    setSaving(false)
    closeForm()
    fetchFaqs()
  }

  async function remove(id) {
    if (!confirm('Delete this FAQ?')) return
    await supabase.from('faqs').delete().eq('id', id)
    fetchFaqs()
  }

  async function toggle(id, visible) {
    await supabase.from('faqs').update({ visible }).eq('id', id)
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, visible } : f))
  }

  async function moveUp(i) {
    if (i === 0) return
    const updated = [...filtered]
    ;[updated[i - 1], updated[i]] = [updated[i], updated[i - 1]]
    await Promise.all(updated.map((f, idx) => supabase.from('faqs').update({ sort_order: idx }).eq('id', f.id)))
    fetchFaqs()
  }

  async function moveDown(i) {
    if (i === filtered.length - 1) return
    const updated = [...filtered]
    ;[updated[i], updated[i + 1]] = [updated[i + 1], updated[i]]
    await Promise.all(updated.map((f, idx) => supabase.from('faqs').update({ sort_order: idx }).eq('id', f.id)))
    fetchFaqs()
  }

  const filtered = faqs.filter(f => filterCat === 'all' || f.category === filterCat)

  const catColors = { General: '#1e6f6a', Homeopathy: '#4a3d8f', Consultation: '#b9914f', Programs: '#8f3d3d', Lifestyle: '#6b8f3d', Other: '#666' }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>FAQ Manager</h1>
        <button className="admin-btn-primary" onClick={openNew}>+ Add FAQ</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total FAQs', value: faqs.length, icon: '❓' },
          { label: 'Visible', value: faqs.filter(f => f.visible).length, icon: '👁' },
          { label: 'Hidden', value: faqs.filter(f => !f.visible).length, icon: '🚫' },
          { label: 'Categories', value: [...new Set(faqs.map(f => f.category))].length, icon: '🏷️' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '14px 16px' }}>
            <p style={{ fontSize: '18px', margin: '0 0 4px' }}>{s.icon}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--navy-800)', margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ADD/EDIT FORM */}
      {editing && (
        <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.1)', borderRadius: '4px', padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>{editing === 'new' ? 'Add New FAQ' : 'Edit FAQ'}</p>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Category</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setF('category', cat)} style={{ padding: '5px 14px', borderRadius: '100px', border: '1px solid', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', background: form.category === cat ? catColors[cat] : 'var(--white)', color: form.category === cat ? '#fff' : 'var(--text-muted)', borderColor: form.category === cat ? catColors[cat] : 'rgba(15,39,68,0.12)', transition: 'all 0.15s' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Question *</label>
            <input value={form.question} onChange={e => setF('question', e.target.value)} placeholder="e.g. How long does treatment take?" style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.92rem', fontFamily: 'var(--font-body)', outline: 'none', fontWeight: 500 }} />
          </div>

          {/* Answer */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Answer *</label>
            <textarea value={form.answer} onChange={e => setF('answer', e.target.value)} placeholder="Write a clear, helpful answer..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', lineHeight: 1.7 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--navy-800)' }}>
              <input type="checkbox" checked={form.visible} onChange={e => setF('visible', e.target.checked)} />
              Visible on website
            </label>
            <div style={{ flex: 1 }} />
            {msg && <span style={{ fontSize: '12px', color: '#c0392b', fontFamily: 'var(--font-body)' }}>{msg}</span>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="admin-btn-outline admin-btn-sm" onClick={closeForm}>Cancel</button>
              <button className="admin-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing === 'new' ? 'Add FAQ' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className={`cat-btn ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>All ({faqs.length})</button>
        {CATEGORIES.filter(c => faqs.some(f => f.category === c)).map(c => (
          <button key={c} className={`cat-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c} ({faqs.filter(f => f.category === c).length})</button>
        ))}
      </div>

      {/* FAQ List */}
      {loading ? <p className="admin-empty">Loading...</p> : filtered.length === 0 ? (
        <p className="admin-empty">No FAQs yet. Add your first one!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((faq, i) => (
            <div key={faq.id} style={{ background: 'var(--white)', border: `1px solid ${expandedId === faq.id ? 'rgba(185,145,79,0.3)' : 'rgba(15,39,68,0.08)'}`, borderRadius: '4px', overflow: 'hidden', opacity: faq.visible ? 1 : 0.6, transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                {/* Category dot */}
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: catColors[faq.category] || '#666', flexShrink: 0 }} />

                {/* Question */}
                <p style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem', color: 'var(--navy-800)', fontFamily: 'var(--font-body)', margin: 0 }}>{faq.question}</p>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: catColors[faq.category] ? `${catColors[faq.category]}20` : 'rgba(15,39,68,0.06)', color: catColors[faq.category] || 'var(--navy-800)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{faq.category}</span>
                  {!faq.visible && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: 'rgba(15,39,68,0.06)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Hidden</span>}
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedId === faq.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>

              {/* Expanded answer */}
              {expandedId === faq.id && (
                <div style={{ padding: '0 16px 14px 32px', borderTop: '1px solid rgba(15,39,68,0.06)' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.8, margin: '12px 0 14px' }}>{faq.answer}</p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => moveUp(i)} disabled={i === 0} style={{ width: '28px', height: '28px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: i === 0 ? 'default' : 'pointer', background: 'var(--white)', fontSize: '12px', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === filtered.length - 1} style={{ width: '28px', height: '28px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: i === filtered.length - 1 ? 'default' : 'pointer', background: 'var(--white)', fontSize: '12px', opacity: i === filtered.length - 1 ? 0.3 : 1 }}>↓</button>
                    <button onClick={() => toggle(faq.id, !faq.visible)} style={{ padding: '5px 12px', fontSize: '11px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', cursor: 'pointer', background: 'var(--white)', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>{faq.visible ? '👁 Hide' : '👁 Show'}</button>
                    <button onClick={() => openEdit(faq)} className="admin-btn-outline admin-btn-sm">Edit</button>
                    <button onClick={() => remove(faq.id)} className="admin-btn-danger admin-btn-sm">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
