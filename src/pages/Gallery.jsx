import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Reveal from '../components/Reveal'

export default function Gallery() {
  const ref = useRef(null)
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [active, setActive] = useState('all')
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (ref.current) ref.current.classList.add('page-enter')
    Promise.all([
      supabase.from('gallery').select('*').eq('visible', true).order('sort_order'),
      supabase.from('gallery_categories').select('*').order('sort_order'),
    ]).then(([{ data: g }, { data: c }]) => {
      setItems(g || [])
      setCats(c || [])
      setLoading(false)
    })
  }, [])

  const shown = active === 'all' ? items : items.filter(i => i.category === active)

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Gallery</span>
          </div>
          <h1>Moments of Healing</h1>
          <p>A glimpse into the clinic, events, and the community we've built together.</p>
        </div>
      </section>

      <section style={{ background: 'var(--ivory)' }}>
        <div className="container gallery-inner">
          <div className="blog-cats">
            <button className={`cat-btn ${active === 'all' ? 'active' : ''}`} onClick={() => setActive('all')}>All</button>
            {cats.map(c => <button key={c.id} className={`cat-btn ${active === c.slug ? 'active' : ''}`} onClick={() => setActive(c.slug)}>{c.name}</button>)}
          </div>

          {loading ? <div className="blog-loading">Loading...</div> :
            shown.length === 0 ? <div className="blog-empty">No images yet.</div> :
              <div className="gallery-grid">
                {shown.map((item, i) => (
                  <Reveal key={item.id} delay={(i % 8) * 50} className="gallery-item">
                    <div onClick={() => setLightbox(item)} style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                      <img src={item.image_url} alt={item.title || ''} loading="lazy" />
                      {item.title && <div className="gallery-item-overlay"><p>{item.title}</p></div>}
                    </div>
                  </Reveal>
                ))}
              </div>
          }
        </div>
      </section>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.image_url} alt={lightbox.title || ''} onClick={e => e.stopPropagation()} />
          {lightbox.title && <p className="lightbox-caption">{lightbox.title}</p>}
        </div>
      )}
    </div>
  )
}
