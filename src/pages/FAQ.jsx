import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import SEO, { faqSchema, breadcrumbSchema } from '../components/SEO'

const CAT_COLORS = {
  General: '#1e6f6a', Treatments: '#4a3d8f', Appointments: '#b9914f',
  Emergency: '#8f3d3d', Children: '#6b8f3d', Other: '#666'
}

const DEFAULT_FAQS = [
  // General
  { id: 'd1', category: 'General', question: 'What services does Usha Multi Speciality Dental Clinic offer?', answer: 'We offer general dentistry, cosmetic dentistry, orthodontics (braces), dental implants, root canal treatment, pediatric dentistry, and emergency dental care — all under one roof.', visible: true },
  { id: 'd9', category: 'General', question: 'Where is Usha Multi Speciality Dental Clinic located?', answer: 'We\u2019re located near Bhawdepur Chowk, Shiv Mandir, Mata Vaishno Mandir Road, Bhavdepur, Sitamarhi \u2013 843302, Bihar. See our Contact page for directions and a map.', visible: true },
  { id: 'd10', category: 'General', question: 'Is Usha Multi Speciality Dental Clinic good for a first-time dental visit?', answer: 'Yes \u2014 many of our patients are visiting a dentist for the first time. We start with a relaxed consultation and explain every step before any treatment.', visible: true },
  { id: 'd11', category: 'General', question: 'What hygiene and safety standards does the clinic follow?', answer: 'We follow standard sterilisation protocols for all instruments, use single-use disposables where applicable, and maintain a clean, well-equipped clinic environment for every patient.', visible: true },
  // Treatments
  { id: 'd2', category: 'Treatments', question: 'Is root canal treatment painful?', answer: 'Not with modern techniques. We use proper anaesthesia and pain management, so most patients feel little to no discomfort during the procedure.', visible: true },
  { id: 'd12', category: 'Treatments', question: 'How many sittings does root canal treatment usually need?', answer: 'Many root canal cases can be completed in a single sitting, though some need two visits depending on the infection and tooth condition. We\u2019ll advise you after examination and X-rays.', visible: true },
  { id: 'd13', category: 'Treatments', question: 'Do I need a crown after a root canal?', answer: 'In most cases, yes \u2014 a crown protects the treated tooth from cracking and restores its full chewing strength. We\u2019ll recommend one based on the tooth\u2019s condition.', visible: true },
  { id: 'd3', category: 'Treatments', question: 'How long does a dental implant last?', answer: 'With good oral hygiene and regular check-ups, dental implants can last many years — often decades — making them a reliable long-term solution for missing teeth.', visible: true },
  { id: 'd14', category: 'Treatments', question: 'Am I a good candidate for dental implants?', answer: 'Most adults with healthy gums and adequate jawbone are good candidates. We assess this with a clinical exam and X-rays before recommending implants over other options.', visible: true },
  { id: 'd15', category: 'Treatments', question: 'At what age should a child start orthodontic treatment?', answer: 'An orthodontic screening around age 7 is a good idea, though active treatment with braces or aligners usually starts around ages 11\u201313, once enough permanent teeth have come in.', visible: true },
  { id: 'd16', category: 'Treatments', question: 'Are clear aligners or metal braces better for adults?', answer: 'Both work well \u2014 metal braces suit more complex bite corrections, while clear aligners are more discreet for milder cases. We\u2019ll recommend the right option after your consultation.', visible: true },
  { id: 'd8', category: 'Treatments', question: 'Do you offer teeth whitening and smile makeovers?', answer: 'Yes, our cosmetic dentistry services include professional teeth whitening, veneers, bonding, and complete smile makeovers tailored to your goals.', visible: true },
  { id: 'd17', category: 'Treatments', question: 'How long do teeth whitening results last?', answer: 'With good oral hygiene and limited staining foods and drinks like tea, coffee, and tobacco, professional whitening results typically last 1\u20132 years before a touch-up is needed.', visible: true },
  { id: 'd18', category: 'Treatments', question: 'How often should I visit the dentist for a check-up?', answer: 'A check-up every 6 months is recommended for most people, so small issues like cavities or gum problems can be caught early \u2014 before they turn into bigger, more painful treatments.', visible: true },
  { id: 'd19', category: 'Treatments', question: 'Why do my gums bleed when I brush?', answer: 'Bleeding gums are often an early sign of gum inflammation (gingivitis), usually from plaque build-up. It\u2019s rarely serious on its own, but should be checked so it doesn\u2019t progress into gum disease.', visible: true },
  { id: 'd20', category: 'Treatments', question: 'Do you treat wisdom tooth pain and extraction?', answer: 'Yes, we evaluate wisdom teeth with an X-ray and can perform extractions when a tooth is impacted, infected, or causing crowding and pain.', visible: true },
  // Appointments
  { id: 'd4', category: 'Appointments', question: 'How do I book an appointment?', answer: 'You can call or WhatsApp us at +91 89873 67274, or fill out the appointment form on our Contact page. Our team will confirm your slot within 24 hours.', visible: true },
  { id: 'd5', category: 'Appointments', question: 'What are your clinic timings?', answer: 'We are open Monday to Saturday, with morning and evening slots. Sundays are for emergencies only. Exact timings are listed on our Contact page.', visible: true },
  { id: 'd21', category: 'Appointments', question: 'What payment methods do you accept?', answer: 'We accept multiple convenient payment options at the clinic. Please confirm your preferred method with our team when booking or at your visit.', visible: true },
  { id: 'd22', category: 'Appointments', question: 'What should I bring for my first appointment?', answer: 'Just bring any previous dental records or X-rays if you have them, and a list of any medications you\u2019re taking. Our team will take care of the rest during your visit.', visible: true },
  // Children
  { id: 'd6', category: 'Children', question: 'Do you treat children?', answer: 'Yes, we offer gentle, child-friendly dental care — from routine check-ups and cavity prevention to early orthodontic screening.', visible: true },
  { id: 'd23', category: 'Children', question: 'At what age should a child have their first dental visit?', answer: 'Ideally by their first birthday, or within 6 months of their first tooth appearing. Early visits help catch problems sooner and get children comfortable with the dentist.', visible: true },
  { id: 'd24', category: 'Children', question: 'How do you help nervous or scared children during treatment?', answer: 'We take a slow, gentle approach \u2014 explaining each step in simple terms, using child-friendly language, and pausing whenever a child needs a break, so visits feel safe rather than scary.', visible: true },
  // Emergency
  { id: 'd7', category: 'Emergency', question: 'What should I do for a dental emergency?', answer: 'Call us right away at +91 89873 67274. We accommodate emergency appointments for severe pain, broken teeth, or injuries whenever possible.', visible: true },
  { id: 'd25', category: 'Emergency', question: 'What should I do if a tooth gets knocked out?', answer: 'Handle the tooth by the crown (not the root), rinse it gently if it\u2019s dirty, and try to place it back in the socket or keep it in milk. Call us immediately at +91 89873 67274 \u2014 quick action improves the chance of saving the tooth.', visible: true },
  { id: 'd26', category: 'Emergency', question: 'Is sudden, severe tooth pain at night an emergency?', answer: 'Severe, throbbing tooth pain \u2014 especially with swelling or fever \u2014 usually needs prompt attention rather than waiting. Call us and we\u2019ll advise whether you need to be seen right away.', visible: true },
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
  }, [])

  const shown = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory)

  return (
    <div style={{ overflowX: 'hidden' }}>
      <SEO
        title="FAQs — Dentist in Sitamarhi"
        description="Common questions about root canal treatment, dental implants, braces, appointments, and emergency dental care at Usha Multi Speciality Dental Clinic, Sitamarhi."
        path="/faq"
        keywords="dentist Sitamarhi FAQ, root canal painful, dental implant cost Sitamarhi, dental clinic timings Sitamarhi, emergency dentist Sitamarhi"
        jsonLd={[
          ...(faqs.length ? [faqSchema(faqs)] : []),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ]}
      />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--ivory), var(--white) 60%, var(--teal-pale))', padding: '148px 0 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(15,39,68,0.035) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold-deep)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>FAQ</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', color: 'var(--navy-800)', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.15 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: 1.85, fontFamily: 'var(--font-body)', fontWeight: 300, margin: '0 0 32px' }}>
            Everything you need to know about our treatments, appointments, and clinic policies.
          </p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg, var(--gold-light), var(--gold) 60%, var(--gold-deep))', color: 'var(--navy-900)', borderRadius: '2px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '8px 20px', borderRadius: '100px', border: '1px solid', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: activeCategory === cat ? 'var(--gold-pale)' : 'var(--white)', color: activeCategory === cat ? 'var(--gold-deep)' : 'var(--text-muted)', borderColor: activeCategory === cat ? 'var(--gold)' : 'rgba(15,39,68,0.12)' }}>
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
          <div style={{ marginTop: '64px', textAlign: 'center', padding: '48px 40px', background: 'var(--teal-pale)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', color: 'var(--navy-800)', fontWeight: 600, margin: '0 0 12px' }}>
              Didn't find your answer?
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 300, margin: '0 0 28px' }}>
              Call us to schedule your appointment.
            </p>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', background: 'linear-gradient(135deg, var(--gold-light), var(--gold) 60%, var(--gold-deep))', color: 'var(--navy-900)', borderRadius: '2px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Book a Consultation →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
