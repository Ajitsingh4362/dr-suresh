import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Blog() {
  const ref = useRef(null)
  const [posts, setPosts] = useState([])
  const [cats, setCats] = useState([])
  const [active, setActive] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ref.current) ref.current.classList.add('page-enter')
    Promise.all([
      supabase.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false }),
      supabase.from('blog_categories').select('*').order('name'),
    ]).then(([{ data: p }, { data: c }]) => {
      setPosts(p || [])
      setCats(c || [])
      setLoading(false)
    })
  }, [])

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const shown = active === 'all' ? posts : posts.filter(p => p.category === active)

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Insights</span>
          </div>
          <h1>Articles & Healing Wisdom</h1>
          <p>Tips on dental health, oral care, and updates from our clinic.</p>
        </div>
      </section>

      <section style={{ background: 'var(--ivory)' }}>
        <div className="container blog-page-inner">
          <div className="blog-cats">
            <button className={`cat-btn ${active === 'all' ? 'active' : ''}`} onClick={() => setActive('all')}>All</button>
            {cats.map(c => <button key={c.id} className={`cat-btn ${active === c.slug ? 'active' : ''}`} onClick={() => setActive(c.slug)}>{c.name}</button>)}
          </div>

          {loading ? <div className="blog-loading">Loading articles...</div> :
            shown.length === 0 ? <div className="blog-empty">No articles published yet. Check back soon.</div> :
              <div className="blog-grid">
                {shown.map(p => (
                  <Link to={`/blog/${p.slug}`} key={p.id} className="blog-card">
                    {p.cover_image && <div className="blog-card-img"><img src={p.cover_image} alt={p.title} /></div>}
                    <div className="blog-card-body">
                      <p className="blog-card-date">{fmt(p.published_at)}</p>
                      <h3>{p.title}</h3>
                      {p.excerpt && <p className="blog-card-excerpt">{p.excerpt}</p>}
                      <span className="read-more">Read More →</span>
                    </div>
                  </Link>
                ))}
              </div>
          }
        </div>
      </section>
    </div>
  )
}
