import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import HealingMap from '../components/HealingMap'
import BlogPreview from '../components/BlogPreview'
import ConsultationPopup from '../components/ConsultationPopup'

const HIGHLIGHTS = [
  { icon: '🎗️', title: 'Cancer Revival & Support', desc: 'Integrative complementary support during treatment — rebuilding strength, resilience, and hope alongside your medical care.', highlight: true },
  { icon: '🧠', title: 'Mind-Body Medicine', desc: 'Understanding the deep connection between emotional states and physical health — addressing the root, not just the symptom.', highlight: true },
  { icon: '🌸', title: 'Fertility & Women\'s Wellness', desc: 'Holistic, personalised support for the journey to motherhood — hormonal balance, emotional well-being, and mind-body fertility optimization.' },
  { icon: '💆', title: 'Emotional Well-being', desc: 'Sustainable resilience for modern professionals — moving beyond stress management to lasting emotional strength.' },
  { icon: '🔬', title: 'Chronic Systemic Disorders', desc: 'Comprehensive root-cause evaluation of long-term health challenges — autoimmune, metabolic, thyroid, digestive, and more.' },
  { icon: '🌿', title: 'Allied Healing Sciences', desc: 'Homeopathy, Psychotherapy, Acupuncture, NLP, Mindfulness — multiple evidence-informed disciplines working together.' },
]

const WHY = [
  '15+ Years Clinical Experience',
  'International Training — India & Australia',
  'Homeopathy + Psychotherapy Integration',
  'Personalised Healing Roadmaps',
  'Cancer Support Specialist',
  'Mind-Body Health Expert',
  'Women\'s Health & Fertility Focus',
  'Compassionate, Confidential Care',
]

/* ---------- animated right-side visual ---------- */
function HeroVisual() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', flexShrink: 0 }}>
      <style>{`
        @keyframes orbitA {
          from { transform: rotate(0deg) translateX(130px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(130px) rotate(-360deg); }
        }
        @keyframes orbitB {
          from { transform: rotate(120deg) translateX(180px) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(180px) rotate(-480deg); }
        }
        @keyframes orbitC {
          from { transform: rotate(240deg) translateX(220px) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(220px) rotate(-600deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 0.25; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes float-tag {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          33%       { transform: translate(12px,-18px) rotate(12deg); }
          66%       { transform: translate(-8px,10px) rotate(-8deg); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50%       { transform: translate(-14px,16px) rotate(-15deg); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.3; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* Centre glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,166,106,0.18) 0%, transparent 70%)',
        animation: 'pulse-ring 4s ease-in-out infinite',
      }} />

      {/* Outer ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '440px', height: '440px', borderRadius: '50%',
        border: '1px solid rgba(199,166,106,0.12)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '320px', height: '320px', borderRadius: '50%',
        border: '1px solid rgba(199,166,106,0.08)',
      }} />

      {/* Centre card */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '170px', height: '170px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(199,166,106,0.22) 0%, rgba(30,111,106,0.15) 100%)',
        border: '1px solid rgba(199,166,106,0.3)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '20px',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '6px' }}>⚕️</div>
        <div style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Integrative</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Healing</div>
      </div>

      {/* Orbit dot A */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        animation: 'orbitA 8s linear infinite',
        marginTop: '-8px', marginLeft: '-8px',
      }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.9, boxShadow: '0 0 12px rgba(199,166,106,0.6)' }} />
      </div>

      {/* Orbit dot B */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        animation: 'orbitB 12s linear infinite',
        marginTop: '-6px', marginLeft: '-6px',
      }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1E6F6A', opacity: 0.85, boxShadow: '0 0 10px rgba(30,111,106,0.5)' }} />
      </div>

      {/* Orbit dot C */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        animation: 'orbitC 16s linear infinite',
        marginTop: '-5px', marginLeft: '-5px',
      }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(199,166,106,0.5)', boxShadow: '0 0 8px rgba(199,166,106,0.4)' }} />
      </div>

      {/* Floating tag 1 — top left */}
      <div style={{
        position: 'absolute', top: '60px', left: '20px',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(199,166,106,0.2)',
        borderRadius: '8px', padding: '12px 16px',
        animation: 'float-tag 3.5s ease-in-out infinite',
        minWidth: '140px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '1px' }}>🎗️ Cancer Support</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>Core Specialty</div>
      </div>

      {/* Floating tag 2 — bottom right */}
      <div style={{
        position: 'absolute', bottom: '70px', right: '10px',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(30,111,106,0.3)',
        borderRadius: '8px', padding: '12px 16px',
        animation: 'float-tag 4.2s ease-in-out infinite 0.8s',
        minWidth: '145px',
      }}>
        <div style={{ fontSize: '11px', color: '#4ecdc4', fontWeight: 600, letterSpacing: '1px' }}>🧠 Mind-Body</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>Medicine</div>
      </div>

      {/* Floating tag 3 — mid right */}
      <div style={{
        position: 'absolute', top: '50%', right: '0px',
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(199,166,106,0.15)',
        borderRadius: '8px', padding: '12px 16px',
        animation: 'float-tag 5s ease-in-out infinite 1.5s',
        minWidth: '130px',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '1px' }}>🌸 Women\'s</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>Wellness</div>
      </div>

      {/* Drifting geometric shapes */}
      <div style={{
        position: 'absolute', top: '30px', right: '60px',
        width: '60px', height: '60px',
        border: '1px solid rgba(199,166,106,0.15)',
        transform: 'rotate(45deg)',
        animation: 'drift1 7s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '40px', left: '30px',
        width: '40px', height: '40px',
        border: '1px solid rgba(30,111,106,0.2)',
        borderRadius: '50%',
        animation: 'drift2 5s ease-in-out infinite',
      }} />

      {/* Shimmer dots scattered */}
      {[
        { top: '15%', left: '10%', size: 3, delay: '0s' },
        { top: '80%', left: '25%', size: 2, delay: '0.7s' },
        { top: '25%', right: '15%', size: 4, delay: '1.2s' },
        { top: '70%', right: '30%', size: 2, delay: '0.4s' },
        { top: '45%', left: '5%', size: 3, delay: '1.8s' },
      ].map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: d.top, left: d.left, right: d.right,
          width: `${d.size}px`, height: `${d.size}px`,
          borderRadius: '50%',
          background: 'var(--gold)',
          animation: `shimmer 3s ease-in-out infinite ${d.delay}`,
        }} />
      ))}
    </div>
  )
}

export default function Home() {
  const ref = useRef(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (ref.current) ref.current.classList.add('page-enter')
    const timer = setTimeout(() => setShowPopup(true), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showPopup && <ConsultationPopup onClose={() => setShowPopup(false)} />}
      <div ref={ref} style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-800) 60%, #122040 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        paddingTop: '100px', paddingBottom: '80px',
      }}>
        {/* Background decorative blobs */}
        <div style={{ position: 'absolute', top: '-5%', right: '-8%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,111,106,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,166,106,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ width: '100%' }}>
          {/* Two-column hero layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 480px',
            gap: '60px',
            alignItems: 'center',
          }} className="hero-grid">

            {/* LEFT — text content */}
            <div style={{ paddingLeft: '0' }}>

              {/* Doctor name box — top of hero */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '16px',
                marginBottom: '32px',
                background: 'rgba(199,166,106,0.08)',
                border: '1px solid rgba(199,166,106,0.25)',
                borderLeft: '3px solid var(--gold)',
                borderRadius: '2px',
                padding: '14px 22px',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px', fontWeight: 700,
                    color: 'var(--gold)',
                    letterSpacing: '0.5px',
                    lineHeight: 1.2,
                  }}>
                    Dr. Kirthi
                  </div>
                  <div style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    marginTop: '4px', fontFamily: 'var(--font-body)',
                  }}>
                    C-Suite Mind Body Specialist
                  </div>
                </div>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4.5vw, 68px)',
                fontWeight: 600, color: 'var(--white)',
                lineHeight: 1.1, marginBottom: '24px',
              }}>
                Where Medicine<br />Meets Mindset,{' '}
                <span style={{ color: 'var(--gold)', fontStyle: 'italic', display: 'block' }}>
                  and Healing Becomes<br />Transformation
                </span>
              </h1>

              <p style={{
                fontSize: '15px', color: 'rgba(255,255,255,0.6)',
                lineHeight: '1.85', maxWidth: '520px', marginBottom: '14px',
                fontFamily: 'var(--font-body)', fontWeight: 300,
              }}>
                Combining 15+ years of expertise in Homeopathy, Psychotherapy, Women's Health,
                and Integrative Healing Sciences — helping individuals reclaim health and vitality
                even when conventional pathways seem exhausted.
              </p>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.38)',
                lineHeight: '1.7', maxWidth: '480px', marginBottom: '36px',
                fontFamily: 'var(--font-body)',
              }}>
                From cancer support and chronic disorders to emotional resilience and fertility —
                each healing pathway is deeply personalised.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <Link to="/contact"><button className="btn-primary">Book a Consultation</button></Link>
                <Link to="/programs"><button className="btn-outline">Explore Programs</button></Link>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex', gap: '44px', flexWrap: 'wrap',
                paddingTop: '36px', borderTop: '1px solid rgba(199,166,106,0.15)',
              }}>
                {[
                  { num: '15+', label: 'Years Experience' },
                  { num: '2', label: 'Countries Trained' },
                  { num: '6', label: 'Healing Disciplines' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — animated visual */}
            <div className="hero-visual-wrapper">
              <HeroVisual />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: 'float 2.5s ease-in-out infinite' }}>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, var(--gold), transparent)' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* --- everything below unchanged --- */}

      {/* INTRO STRIP */}
      <section style={{ background: 'var(--gold)', padding: '28px 0' }}>
        <div className="container">
          <div className="intro-strip-inner" style={{ display: 'flex', gap: '0', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', textAlign: 'center' }}>
            {['Homeopathic Physician', 'Psychotherapist', 'Mind-Body Specialist', 'Women\'s Health Expert', 'Holistic Health Educator'].map((t, i) => (
              <span key={t} style={{
                fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600,
                color: 'var(--navy-800)', letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '6px 20px',
                borderRight: i < 4 ? '1px solid rgba(15,39,68,0.3)' : 'none',
                lineHeight: '1.4',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZATIONS PREVIEW */}
      <section style={{ padding: '100px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag">Healing Areas</span>
            <div className="gold-line center" />
            <h2 className="section-title">Specialized Healing Pathways</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Each specialization addresses the complete individual — physical, emotional, and psychological — with evidence-informed integrative approaches.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2px', background: 'rgba(15,39,68,0.06)' }}>
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} style={{
                background: h.highlight ? 'var(--navy-800)' : 'var(--white)',
                padding: '36px 32px',
                position: 'relative', overflow: 'hidden',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = h.highlight ? 'var(--navy-700)' : 'var(--ivory-dark)' }}
              onMouseLeave={e => { e.currentTarget.style.background = h.highlight ? 'var(--navy-800)' : 'var(--white)' }}>
                {h.highlight && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--gold)' }} />
                )}
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{h.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px', fontWeight: 600,
                  color: h.highlight ? 'var(--gold-pale)' : 'var(--navy-800)',
                  marginBottom: '12px',
                }}>{h.title}</h3>
                <p style={{ fontSize: '13px', color: h.highlight ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', lineHeight: '1.8' }}>{h.desc}</p>
                {h.highlight && (
                  <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Core Specialty →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/specializations"><button className="btn-outline-dark">Explore All Specializations</button></Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(160deg, var(--navy-800), var(--navy-900))' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="two-col-grid">
            <div>
              <span className="section-tag">Why Dr. Kirthi</span>
              <div className="gold-line" />
              <h2 className="section-title light">A Different Kind of Healthcare Experience</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.85', marginBottom: '32px', fontWeight: 300 }}>
                Not just a practitioner — a trusted health strategist who bridges medicine, psychology, and holistic healing for complete transformation.
              </p>
              <Link to="/contact"><button className="btn-primary">Begin Your Journey</button></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
              {WHY.map((w, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(199,166,106,0.1)',
                  padding: '20px 18px',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: '5px' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ padding: '100px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag">The Process</span>
            <div className="gold-line center" />
            <h2 className="section-title">A Structured, Personalised Approach</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0' }}>
            {[
              { num: '01', title: 'Initial Consultation', desc: 'Deep understanding of your health condition, history, lifestyle, and recovery goals.' },
              { num: '02', title: 'Health Assessment', desc: 'Comprehensive review of physical patterns, emotional load, and recurring challenges.' },
              { num: '03', title: 'Personalised Plan', desc: 'A structured, multi-disciplinary healing roadmap tailored to your unique needs.' },
              { num: '04', title: 'Guided Support', desc: 'Ongoing therapies, monitoring, and adjustments through your healing journey.' },
              { num: '05', title: 'Long-Term Stability', desc: 'Sustainable health management — stronger, more resilient, more in control.' },
            ].map((step, i) => (
              <div key={i} style={{
                padding: '36px 28px',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(15,39,68,0.08)',
                borderBottom: '3px solid transparent',
                transition: 'var(--transition)',
                background: 'var(--white)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderBottom = '3px solid var(--gold)'; e.currentTarget.style.background = 'var(--ivory)' }}
              onMouseLeave={e => { e.currentTarget.style.borderBottom = '3px solid transparent'; e.currentTarget.style.background = 'var(--white)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 700, color: 'rgb(7, 5, 14)', lineHeight: 1, marginBottom: '16px' }}>{step.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.8' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gold)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '16px' }}>
            Long-Term Health Requires More Than Temporary Relief
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(15,39,68,0.7)', marginBottom: '36px', maxWidth: '520px', margin: '0 auto 36px', lineHeight: '1.8' }}>
            Begin with a detailed assessment to understand the most suitable healing path forward for your health needs.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact">
              <button style={{ background: 'var(--navy-800)', color: 'var(--white)', border: 'none', padding: '14px 32px', borderRadius: '2px', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-800)'}>
                Apply for Consultation
              </button>
            </Link>
            <Link to="/programs">
              <button className="btn-outline-dark">View Programs</button>
            </Link>
          </div>
        </div>
      </section>

      {/* HEALING MAP — 3D interactive body */}
      <section className="healing-map-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag" style={{ color: 'var(--gold)' }}>Explore Healing Areas</span>
            <div className="gold-line center" />
            <h2 className="section-title light">Interactive Healing Map</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.85', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
              Tap any glowing point to explore how Dr. Kirthi's integrative approach addresses each area of health.
            </p>
          </div>
          <HealingMap />
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <BlogPreview />

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-visual-wrapper {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .intro-strip-inner span {
            border-right: none !important;
            border-bottom: 1px solid rgba(15,39,68,0.15) !important;
            width: 100% !important;
            text-align: center !important;
            padding: 10px 16px !important;
          }
          .intro-strip-inner span:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>
    </div>
    </>
  )
}