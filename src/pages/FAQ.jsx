import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const CAT_COLORS = {
  General: '#1e6f6a', Treatments: '#4a3d8f', Appointments: '#b9914f',
  Emergency: '#8f3d3d', Children: '#6b8f3d', Other: '#666'
}

const DEFAULT_FAQS = [
  { id: 'd1', category: 'General', question: 'What services does Usha Multi Speciality Dental Clinic offer?', answer: 'We offer general dentistry, cosmetic dentistry, orthodontics (braces), dental implants, root canal treatment, pediatric dentistry, and emergency dental care — all under one roof.', visible: true },
  { id: 'd2', category: 'Treatments', question: 'Is root canal treatment painful?', answer: 'Not with modern techniques. We use proper anaesthesia and pain management, so most patients feel little to no discomfort during the procedure.', visible: true },
  { id: 'd3', category: 'Treatments', question: 'How long does a dental implant last?', answer: 'With good oral hygiene and regular check-ups, dental implants can last many years — often decades — making them a reliable long-term solution for missing teeth.', visible: true },
  { id: 'd4', category: 'Appointments', question: 'How do I book an appointment?', answer: 'You can call or WhatsApp us at +91 89873 67274, or fill out the appointment form on our Contact page. Our team will confirm your slot within 24 hours.', visible: true },
  { id: 'd5', category: 'Appointments', question: 'What are your clinic timings?', answer: 'We are open Monday to Saturday, with morning and evening slots. Sundays are for emergencies only. Exact timings are listed on our Contact page.', visible: true },
  { id: 'd6', category: 'Children', question: 'Do you treat children?', answer: 'Yes, we offer gentle, child-friendly dental care — from routine check-ups and cavity prevention to early orthodontic screening.', visible: true },
  { id: 'd7', category: 'Emergency', question: 'What should I do for a dental emergency?', answer: 'Call us right away at +91 89873 67274. We accommodate emergency appointments for severe pain, broken teeth, or injuries whenever possible.', visible: true },
  { id: 'd8', category: 'Treatments', question: 'Do you offer teeth whitening and smile makeovers?', answer: 'Yes, our cosmetic dentistry services include professional teeth whitening, veneers, bonding, and complete smile makeovers tailored to your goals.', visible: true },
]

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  const answerRef = useRef(null)

  return (
    <div style={{ borderBottom: '1px solid rgba(15,39,68,0.08)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', padding: '22px 0', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left' }}>
        {/* Number */}
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: open ? 'var(--gold)' : 'rgba(15,39,68,0.2)', minWidth: '28px', transition: 'color 0.2s' }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Question */}
        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 600, color: 'var(--navy-800)', lineHeight: 1.4 }}>
          {faq.question}
        </span>

        {/* Toggle icon */}
        <span style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${open ? 'var(--gold)' : 'rgba(15,39,68,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: open ? 'var(--gold)' : 'rgba(15,39,68,0.35)', fontSize: '18px', flexShrink: 0, transition: 'all 0.25s', transform: open ? 'rotate(45deg)' : 'none' }}>
          +
        </span>
      </button>

      {/* Answer */}
      <div style={{ maxHeight: open ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ paddingLeft: '44px', paddingBottom: '22px', paddingRight: '48px' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.9, fontFamily: 'var(--font-body)', fontWeight: 300, margin: 0 }}>
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    supabase.from('faqs').select('*').eq('visible', true).order('sort_order').order('created_at')
      .then(({ data }) => {
        const list = (data && data.length > 0) ? data : DEFAULT_FAQS
        setFaqs(list)
        const cats = ['All', ...new Set(list.map(f => f.category))]
        setCategories(cats)
        setLoading(false)
      })

    // Inject FAQ Schema for Google SEO
    return () => {
      const existing = document.getElementById('faq-schema')
      if (existing) existing.remove()
    }
  }, [])

  useEffect(() => {
    if (!faqs.length) return
    const existing = document.getElementById('faq-schema')
    if (existing) existing.remove()
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.filter(f => f.visible).map(f => ({
        '@type': 'Question',
        'name': f.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.answer }
      }))
    }
    const script = document.createElement('script')
    script.id = 'faq-schema'
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)
  }, [faqs])

  const shown = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory)

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '148px 0 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(199,166,106,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>FAQ</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--white)', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.15 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '520px', lineHeight: 1.85, fontFamily: 'var(--font-body)', fontWeight: 300, margin: '0 0 32px' }}>
            Everything you need to know about our treatments, appointments, and clinic policies.
          </p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'var(--gold)', color: 'var(--navy-800)', borderRadius: '2px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Still have questions? Book a consultation →
          </Link>
        </div>
      </section>

      {/* FAQ Content */}
      <section style={{ padding: '80px 0 100px', background: 'var(--ivory)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>

          {/* Category filter */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '48px' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '8px 20px', borderRadius: '100px', border: '1px solid', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: activeCategory === cat ? 'var(--navy-800)' : 'var(--white)', color: activeCategory === cat ? 'var(--gold-pale)' : 'var(--text-muted)', borderColor: activeCategory === cat ? 'var(--navy-800)' : 'rgba(15,39,68,0.12)' }}>
                  {cat} {cat !== 'All' && `(${faqs.filter(f => f.category === cat).length})`}
                </button>
              ))}
            </div>
          )}

          {/* FAQ accordion */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Loading...</div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>No FAQs in this category.</div>
          ) : (
            <div style={{ background: 'var(--white)', borderRadius: '4px', padding: '8px 32px', border: '1px solid rgba(15,39,68,0.08)', boxShadow: '0 4px 24px rgba(15,39,68,0.04)' }}>
              {shown.map((faq, i) => <FAQItem key={faq.id} faq={faq} index={i} />)}
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{ marginTop: '64px', textAlign: 'center', padding: '48px 40px', background: 'var(--navy-800)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', color: 'var(--gold-pale)', fontWeight: 600, margin: '0 0 12px' }}>
              Didn't find your answer?
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontWeight: 300, margin: '0 0 28px' }}>
              Call us to schedule your appointment.
            </p>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', background: 'var(--gold)', color: 'var(--navy-800)', borderRadius: '2px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Book a Consultation →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
