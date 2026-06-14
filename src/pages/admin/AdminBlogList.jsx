import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminBlogList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data } = await supabase.from('blog_posts').select('id,title,slug,published,published_at,created_at').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function remove(id) {
    if (!confirm('Delete this post permanently?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    fetchPosts()
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Blog Posts</h1>
        <Link to="/admin/posts/new" className="admin-btn-primary">+ New Post</Link>
      </div>

      {loading ? <p className="admin-empty">Loading...</p> : posts.length === 0 ? (
        <p className="admin-empty">No posts yet. Create your first one!</p>
      ) : (
        <div className="admin-list">
          {posts.map(p => (
            <div key={p.id} className="admin-list-row">
              <div className="admin-list-info">
                <p className="admin-list-title">{p.title || '(Untitled)'}</p>
                <div className="admin-list-meta">
                  <span className={`admin-badge ${p.published ? 'admin-badge-success' : 'admin-badge-muted'}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                  <span>{new Date(p.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="admin-list-actions">
                <Link to={`/admin/posts/${p.id}`} className="admin-btn-outline admin-btn-sm">Edit</Link>
                <button className="admin-btn-danger admin-btn-sm" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
