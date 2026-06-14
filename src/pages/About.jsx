import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const QUALS = [
  { icon: '🎓', year: 'Foundation', title: 'Homeopathic Medicine', sub: 'BHMS — Core clinical training in Homeopathic Medicine' },
  { icon: '🧠', year: 'Advanced', title: 'Counseling & Psychotherapy', sub: 'Certified Psychotherapist and Counsellor' },
  { icon: '🌏', year: 'International', title: 'Australia — Newcastle', sub: 'International clinical exposure and practice in Australia' },
  { icon: '🔬', year: 'Integrative', title: 'Acupuncture & Allied Sciences', sub: 'Acupuncture principles, Positive Psychology, NLP' },
  { icon: '🧘', year: 'Holistic', title: 'Mindfulness & Wellness Education', sub: 'Mindfulness practitioner and Integrative Health Educator' },
]

export default function About() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '140px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(199,166,106,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'absolute', top: '100px', right: '80px', width: '250px', height: '250px', border: '1px solid rgba(199,166,106,0.08)', transform: 'rotate(45deg)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>About</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 68px)', color: 'var(--white)', fontWeight: 600, marginBottom: '20px' }}>
            Dr. Kirthi Jawalkar
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '16px' }}>
            Healing Beyond Symptoms. Transforming Lives Beyond Diagnosis.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: '580px', lineHeight: '1.8', fontWeight: 300 }}>
            Internationally trained Homeopathic Physician, Psychotherapist, and Mind-Body Wellness Specialist with 15+ years of experience.
          </p>
        </div>
      </section>

      {/* Bio */}
      <section style={{ padding: '90px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '72px', alignItems: 'start' }} className="two-col-grid">

            {/* Card */}
            <div style={{ background: 'var(--navy-800)', borderRadius: '2px', padding: '40px', border: '1px solid rgba(199,166,106,0.15)', position: 'sticky', top: '100px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--navy-600))', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', border: '2px solid rgba(199,166,106,0.3)' }}>👩‍⚕️</div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold-pale)', fontWeight: 600 }}>Dr. Kirthi Jawalkar</div>
                <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '6px' }}>Mind Motion Matrix</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(199,166,106,0.15)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Experience', value: '15+ Years' },
                  { label: 'Training', value: 'India & Australia' },
                  { label: 'Disciplines', value: '6+ Healing Sciences' },
                  { label: 'Specialization', value: 'Mind-Body Medicine' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--gold-pale)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '28px' }}>
                <Link to="/contact"><button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Book Consultation</button></Link>
              </div>
            </div>

            {/* Text */}
            <div>
              <span className="section-tag">Her Story</span>
              <div className="gold-line" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--navy-800)', marginBottom: '24px', fontWeight: 600 }}>
                A Trusted Health Strategist
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.95', marginBottom: '20px' }}>
                Dr. Kirthi Jawalkar is not just another practitioner — she is a health strategist who bridges medicine, psychology, and holistic healing. With over 15 years of clinical experience across India and Australia, she has helped individuals navigate some of the most challenging health journeys with compassion and precision.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.95', marginBottom: '20px' }}>
                Her academic foundation spans Homeopathy, Counseling and Psychotherapy, Acupuncture, Positive Psychology, Mindfulness, NLP, and Integrative Healing Sciences — bringing together evidence-informed approaches that address not only disease but the person behind the diagnosis.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.95', marginBottom: '36px' }}>
                Having worked across clinical, educational, and wellness settings — including international exposure in Newcastle, Australia — Dr. Kirthi believes that true healing begins when physical health, emotional resilience, and personal awareness are nurtured together.
              </p>

              <div style={{ background: 'var(--navy-800)', borderLeft: '3px solid var(--gold)', padding: '24px 28px', marginBottom: '36px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold-pale)', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "True healing involves more than the physical body. It begins when we understand the deeper conversation between mind, emotion, and health."
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px', letterSpacing: '1px' }}>— DR. KIRTHI JAWALKAR</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Homeopathic Physician', 'Psychotherapist', 'Counsellor', 'Mind-Body Specialist', 'NLP Practitioner', 'Mindfulness Expert', 'Women\'s Health', 'Australia Trained'].map((tag, i) => (
                  <span key={i} style={{ background: 'rgba(15,39,68,0.06)', border: '1px solid rgba(15,39,68,0.12)', color: 'var(--navy-800)', fontSize: '11px', padding: '5px 14px', borderRadius: '2px', fontWeight: 500, letterSpacing: '0.5px' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section style={{ padding: '90px 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-tag">Credentials</span>
            <div className="gold-line center" />
            <h2 className="section-title">Academic & Clinical Qualifications</h2>
          </div>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {QUALS.map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '2px', background: 'var(--navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid rgba(199,166,106,0.2)' }}>{q.icon}</div>
                  {i < QUALS.length - 1 && <div style={{ width: '1px', flex: 1, background: 'rgba(15,39,68,0.1)', margin: '4px 0' }} />}
                </div>
                <div style={{ background: 'var(--ivory)', padding: '20px 24px', flex: 1, marginBottom: i < QUALS.length - 1 ? '4px' : 0, borderBottom: '2px solid transparent', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.borderBottom = '2px solid var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderBottom = '2px solid transparent'}>
                  <div style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{q.year}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy-800)', fontWeight: 600, marginBottom: '4px' }}>{q.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{q.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--navy-800)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--white)', marginBottom: '16px' }}>Ready to Begin Your Healing Journey?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>A personalised consultation is the first step toward lasting transformation.</p>
          <Link to="/contact"><button className="btn-primary">Book a Consultation</button></Link>
        </div>
      </section>
    </div>
  )
}
