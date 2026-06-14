import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BlogPreview() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    supabase.from('blog_posts').select('id,title,slug,excerpt,cover_image,published_at')
      .eq('published', true).order('published_at', { ascending: false }).limit(3)
      .then(({ data }) => setPosts(data || []))
  }, [])

  if (!posts.length) return null
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <section className="blog-preview">
      <div className="container">
        <div className="blog-preview-header">
          <div>
            <span className="section-tag">From the Blog</span>
            <div className="gold-line" />
            <h2 className="section-title" style={{ marginBottom: 0 }}>Insights & Healing Wisdom</h2>
          </div>
          <Link to="/blog" className="view-all-link">View All Articles →</Link>
        </div>
        <div className="blog-preview-grid">
          {posts.map((p, i) => (
            <Link to={`/blog/${p.slug}`} key={p.id} className={`blog-card ${i === 0 ? 'featured' : ''}`}>
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
      </div>
    </section>
  )
}
