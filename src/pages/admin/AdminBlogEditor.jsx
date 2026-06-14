import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import RichEditor from '../../components/RichEditor'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function AdminBlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    supabase.from('blog_categories').select('*').order('name').then(({ data }) => setCategories(data || []))
    if (!isNew) {
      supabase.from('blog_posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setTitle(data.title)
          setSlug(data.slug)
          setExcerpt(data.excerpt || '')
          setContent(data.content || '')
          setCoverImage(data.cover_image || '')
          setCategory(data.category || '')
          setPublished(data.published)
        }
        setLoading(false)
      })
    }
  }, [id])

  function handleTitle(v) {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  async function uploadToStorage(file, prefix) {
    const ext = file.name.split('.').pop()
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(path, file)
    if (error) return null
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const url = await uploadToStorage(file, 'covers')
    if (url) setCoverImage(url)
    setUploading(false)
  }

  async function save(publishState) {
    if (!title.trim()) { setMsg('Title is required'); return }
    setSaving(true)
    setMsg('')

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      cover_image: coverImage || null,
      category: category || null,
      published: publishState,
      published_at: publishState ? new Date().toISOString() : null,
    }

    let error
    if (isNew) {
      const res = await supabase.from('blog_posts').insert(payload).select().single()
      error = res.error
      if (!error) navigate(`/admin/posts/${res.data.id}`, { replace: true })
    } else {
      const res = await supabase.from('blog_posts').update(payload).eq('id', id)
      error = res.error
    }

    setSaving(false)
    setMsg(error ? `Error: ${error.message}` : (publishState ? 'Published ✓' : 'Saved ✓'))
    setTimeout(() => setMsg(''), 2500)
  }

  if (loading) return <div className="admin-panel"><p className="admin-empty">Loading...</p></div>

  return (
    <div className="admin-panel admin-editor-panel">
      <div className="admin-editor-topbar">
        <button className="admin-back-link" onClick={() => navigate('/admin/posts')}>← Back to posts</button>
        <div className="admin-editor-actions">
          {msg && <span className="admin-save-msg">{msg}</span>}
          <button className="admin-btn-outline admin-btn-sm" onClick={() => save(false)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="admin-btn-primary admin-btn-sm" onClick={() => save(true)} disabled={saving}>
            {saving ? 'Publishing...' : published ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="admin-editor-body">
        <input className="admin-title-input" placeholder="Post title..." value={title} onChange={e => handleTitle(e.target.value)} />

        <div className="admin-form-grid">
          <div className="admin-field">
            <label>URL Slug</label>
            <input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true) }} placeholder="post-url-slug" />
          </div>
          <div className="admin-field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-field">
          <label>Excerpt (short summary shown in cards)</label>
          <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="One or two lines about this post..." />
        </div>

        <div className="admin-field">
          <label>Cover Image</label>
          <div className="admin-cover-row">
            <label className="admin-file-btn">
              {uploading ? 'Uploading...' : 'Choose Image'}
              <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
            </label>
            {coverImage && (
              <div className="admin-cover-preview-wrap">
                <img src={coverImage} alt="cover" />
                <button onClick={() => setCoverImage('')}>✕</button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-field">
          <label>Content</label>
          <RichEditor value={content} onChange={setContent} onImageUpload={(f) => uploadToStorage(f, 'content')} placeholder="Write your article..." />
        </div>
      </div>
    </div>
  )
}
