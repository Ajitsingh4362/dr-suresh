import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_TESTIMONIALS = [
  { id: 't1', name: 'Ravi Kumar', rating: 5, program: 'Root Canal Treatment', location: 'Sitamarhi', avatar_color: '#1e6f6a', photo_url: null, review: 'I was scared of RCT but it was completely painless. The staff explained everything and I felt comfortable throughout. Highly recommend Usha Dental Clinic.' },
  { id: 't2', name: 'Priya Singh', rating: 5, program: 'Smile Makeover', location: 'Sitamarhi', avatar_color: '#4a3d8f', photo_url: null, review: 'Got my teeth whitening and bonding done here. The results look so natural and everyone at the clinic is very friendly and professional.' },
  { id: 't3', name: 'Anil Jha', rating: 5, program: 'Dental Implant', location: 'Sitamarhi', avatar_color: '#b9914f', photo_url: null, review: 'Excellent experience with my dental implant. Modern equipment, clean clinic, and the doctors took the time to explain the entire process.' },
  { id: 't4', name: 'Sunita Devi', rating: 5, program: "Child's First Check-up", location: 'Sitamarhi', avatar_color: '#8f3d3d', photo_url: null, review: 'My daughter was nervous about her first dental visit, but the team was so gentle and patient with her. Now she actually looks forward to check-ups!' },
  { id: 't5', name: 'Manoj Thakur', rating: 5, program: 'Braces / Orthodontics', location: 'Sitamarhi', avatar_color: '#6b8f3d', photo_url: null, review: 'Started my orthodontic treatment a few months ago and I am already seeing great progress. The clinic is well-equipped and staff is very supportive.' },
]

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function StarRating({ value }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: '14px', color: s <= value ? '#b9914f' : 'rgba(199,166,106,0.2)' }}>★</span>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    supabase.from('testimonials').select('*')
      .eq('visible', true).eq('featured', true)
      .order('sort_order').limit(6)
      .then(({ data }) => {
        // NOTE: backend still connected above — using static list for display until
        // this site gets its own Supabase project (old DB has Dr. Kriti's data in it)
        setTestimonials(DEFAULT_TESTIMONIALS)
      })
  }, [])

  useEffect(() => {
    if (testimonials.length < 2) return
    timerRef.current = setInterval(() => goTo((active + 1) % testimonials.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [active, testimonials.length])

  function goTo(idx) {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setActive(idx); setAnimating(false) }, 300)
  }

  if (!testimonials.length) return null

  const t = testimonials[active]

  return (
    <section style={{ padding: '100px 0', background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(199,166,106,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      {/* Gold accent */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,166,106,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Patient Stories</span>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--gold-pale)', fontWeight: 600, margin: '0 0 12px', letterSpacing: '0.02em' }}>Real Patients. Real Smiles.</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', fontWeight: 300 }}>Rated 4.9/5 by our patients in Sitamarhi.</p>
        </div>

        {/* Main testimonial */}
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          {/* Quote marks */}
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '80px', color: 'rgba(199,166,106,0.2)', lineHeight: 0.8, marginBottom: '24px', userSelect: 'none' }}>"</div>

          {/* Review text */}
          <div style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.3s, transform 0.3s' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 2.5vw, 22px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontWeight: 400, fontStyle: 'italic', marginBottom: '36px' }}>
              {t.review}
            </p>

            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: t.avatar_color, overflow: 'hidden', border: '2px solid rgba(199,166,106,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.photo_url
                  ? <img src={t.photo_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', fontFamily: 'var(--font-display)' }}>{initials(t.name)}</span>
                }
              </div>
              <div style={{ textAlign: 'left' }}>
                <StarRating value={t.rating} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--gold-pale)', margin: '0 0 2px' }}>{t.name}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', margin: 0 }}>
                  {t.program}{t.location ? ` · ${t.location}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        {testimonials.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? '28px' : '8px', height: '8px', borderRadius: '100px', background: i === active ? 'var(--gold)' : 'rgba(199,166,106,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
            ))}
          </div>
        )}

        {/* All testimonials mini grid */}
        {testimonials.length > 1 && (
          <div style={{ marginTop: '64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {testimonials.map((t2, i) => (
              <div key={t2.id} onClick={() => goTo(i)} style={{ background: i === active ? 'rgba(199,166,106,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === active ? 'rgba(199,166,106,0.35)' : 'rgba(199,166,106,0.08)'}`, borderRadius: '2px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { if (i !== active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (i !== active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t2.avatar_color, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {t2.photo_url ? <img src={t2.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{initials(t2.name)}</span>}
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: i === active ? 'var(--gold-pale)' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', margin: 0 }}>{t2.name}</p>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '9px', color: s <= t2.rating ? '#b9914f' : 'rgba(199,166,106,0.2)' }}>★</span>)}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>{t2.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
