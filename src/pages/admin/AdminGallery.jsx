import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newCat, setNewCat] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: g }, { data: c }] = await Promise.all([
      supabase.from('gallery').select('*').order('sort_order'),
      supabase.from('gallery_categories').select('*').order('sort_order'),
    ])
    setItems(g || [])
    setCats(c || [])
    setLoading(false)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('gallery-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('gallery-images').getPublicUrl(path)
        await supabase.from('gallery').insert({
          image_url: data.publicUrl,
          title: file.name.replace(/\.[^.]+$/, ''),
          category: cats[0]?.slug || 'general',
          sort_order: items.length,
          visible: true,
        })
      }
    }
    setUploading(false)
    fetchAll()
  }

  async function updateItem(id, patch) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
    await supabase.from('gallery').update(patch).eq('id', id)
  }

  async function deleteItem(id) {
    if (!confirm('Delete this image?')) return
    await supabase.from('gallery').delete().eq('id', id)
    fetchAll()
  }

  async function addCategory() {
    if (!newCat.trim()) return
    const slug = newCat.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    await supabase.from('gallery_categories').insert({ name: newCat.trim(), slug, sort_order: cats.length })
    setNewCat('')
    fetchAll()
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Gallery</h1>
        <label className="admin-btn-primary admin-upload-label">
          {uploading ? 'Uploading...' : '+ Upload Images'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} hidden />
        </label>
      </div>

      <div className="admin-cat-manager">
        <span>Categories:</span>
        {cats.map(c => <span key={c.id} className="admin-tag">{c.name}</span>)}
        <input placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} />
        <button className="admin-btn-outline admin-btn-sm" onClick={addCategory}>Add</button>
      </div>

      {loading ? <p className="admin-empty">Loading...</p> : items.length === 0 ? (
        <p className="admin-empty">No images yet. Upload your first batch!</p>
      ) : (
        <div className="admin-gallery-grid">
          {items.map(item => (
            <div key={item.id} className="admin-gallery-item">
              <img src={item.image_url} alt={item.title || ''} />
              <div className="admin-gallery-controls">
                <input
                  className="admin-gallery-title"
                  value={item.title || ''}
                  placeholder="Title / caption"
                  onChange={e => updateItem(item.id, { title: e.target.value })}
                />
                <select value={item.category || ''} onChange={e => updateItem(item.id, { category: e.target.value })}>
                  {cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <div className="admin-gallery-row2">
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={item.visible} onChange={e => updateItem(item.id, { visible: e.target.checked })} />
                    Visible
                  </label>
                  <button className="admin-btn-danger admin-btn-sm" onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
