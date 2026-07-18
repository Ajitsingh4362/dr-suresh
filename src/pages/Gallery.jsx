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
      // NOTE: backend still connected above — hiding DB images for now
      // (shared DB still has old Dr. Kriti gallery images in it)
      setItems([])
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
          <h1>Our Clinic & Patient Smiles</h1>
          <p style={{ maxWidth: '640px', lineHeight: '1.9' }}>
            A look inside Usha Multi Speciality Dental Clinic — our facility, equipment, treatments in progress, and the smiles we've helped restore.
          </p>
          <p style={{ maxWidth: '600px', lineHeight: '1.9', marginTop: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
            From routine check-ups to complete smile makeovers, every image reflects our commitment to comfortable, high-quality dental care.
          </p>
        </div>
      </section>

      {/* Featured Banner */}
      <section style={{ padding: '0' }}>
        <img src="/clinic-banner-2.png" alt="Usha Multi Speciality Dental Clinic — Premium Care for Healthy Smiles" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </section>

      {/* Gallery thank you strip */}
      <section style={{ background: 'var(--gold)', padding: '28px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--navy-800)', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
            Every smile tells a story — thank you for trusting us with your dental care.
          </p>
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
