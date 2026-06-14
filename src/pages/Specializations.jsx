import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const SPECS = [
  {
    icon: '🎗️',
    title: 'Cancer Revival & Integrative Support',
    tagline: 'Supporting Strength, Resilience & Quality of Life',
    desc: 'A cancer diagnosis impacts far more than the physical body. Our Cancer Revival & Support approach focuses on complementary wellness alongside your existing medical care — rebuilding strength, managing fatigue, and restoring hope.',
    points: ['Emotional resilience and stress management', 'Support during chemotherapy and radiation recovery', 'Fatigue management and vitality enhancement', 'Mind-body healing strategies', 'Lifestyle and nutritional guidance', 'Restoring hope, confidence, and quality of life'],
    highlight: true,
    color: 'var(--navy-800)',
  },
  {
    icon: '🧠',
    title: 'Mind-Body Medicine',
    tagline: 'Understanding the Hidden Conversation Between Thoughts, Emotions & Health',
    desc: 'Research increasingly highlights the profound relationship between emotional states and physical health. Our Mind-Body programs help clients understand not only what they are experiencing — but why.',
    points: ['Emotional patterns impacting physical health', 'Psychosomatic influences and stress physiology', 'Behavioral health optimization', 'Resilience development', 'Personal transformation and growth', 'Emotional awareness and self-healing'],
    highlight: true,
    color: 'var(--teal)',
  },
  {
    icon: '🌸',
    title: 'Fertility & Women\'s Wellness',
    tagline: 'Nurturing the Journey to Motherhood with Compassion and Science',
    desc: 'Infertility is rarely a physical issue alone. Emotional stress, hormonal imbalances, and mind-body interactions play significant roles. Each journey is personalised to the individual woman.',
    points: ['Hormonal balance and PCOS support', 'Emotional well-being during conception journeys', 'Mind-body fertility optimization', 'Pregnancy preparedness and pre-conception wellness', 'Menstrual health and cycle support', 'Stress and anxiety management'],
    highlight: false,
  },
  {
    icon: '💆',
    title: 'Emotional Well-being & Mental Resilience',
    tagline: 'Helping You Thrive Beyond Stress, Anxiety & Exhaustion',
    desc: 'Modern professionals experience chronic stress, burnout, and emotional overwhelm. Our goal is not merely symptom management — but creating sustainable emotional strength that lasts.',
    points: ['Stress and burnout management', 'Emotional resilience coaching', 'Anxiety and emotional regulation', 'Self-esteem and confidence enhancement', 'Life transitions and personal growth', 'Executive mental wellness programs'],
    highlight: false,
  },
  {
    icon: '🔬',
    title: 'Chronic Systemic Disorders',
    tagline: 'Addressing Root Patterns Behind Long-Term Health Challenges',
    desc: 'Chronic conditions develop through complex interactions between genetics, lifestyle, environment, and emotional health. Each case is evaluated comprehensively to understand the unique factors at play.',
    points: ['Autoimmune conditions', 'Metabolic and thyroid disorders', 'Digestive health and gut imbalance', 'Chronic fatigue and low vitality', 'Sleep disturbances', 'Stress-related and lifestyle-related illnesses'],
    highlight: false,
  },
  {
    icon: '🌿',
    title: 'Allied Healing Sciences',
    tagline: 'Integrative Approaches for Whole-Person Wellness',
    desc: 'Healing is enhanced when multiple evidence-informed disciplines work together. A truly integrative approach designed around the individual rather than a diagnosis.',
    points: ['Homeopathy', 'Counseling & Psychotherapy', 'Acupuncture Principles', 'Positive Psychology', 'Mindfulness Practices', 'NLP-Based Coaching & Lifestyle Optimization'],
    highlight: false,
  },
]

export default function Specializations() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '140px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(199,166,106,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Healing Areas</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 64px)', color: 'var(--white)', fontWeight: 600, marginBottom: '20px' }}>
            Specialized Healing Pathways
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', lineHeight: '1.85', fontWeight: 300 }}>
            Each specialization addresses the complete individual — physical, emotional, and psychological — with evidence-informed integrative approaches.
          </p>
        </div>
      </section>

      {/* Highlighted — Cancer + Mind Body */}
      <section style={{ padding: '90px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">Core Specialties</span>
            <div className="gold-line center" />
            <h2 className="section-title">Signature Areas of Expertise</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '2px' }} className="two-col-grid">
            {SPECS.filter(s => s.highlight).map((s, i) => (
              <div key={i} style={{ background: s.color, padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(199,166,106,0.06)' }} />
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{s.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Core Specialty</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.5vw, 30px)', color: 'var(--white)', fontWeight: 600, marginBottom: '12px', lineHeight: 1.2 }}>{s.title}</h2>
                <p style={{ fontSize: '13px', color: 'var(--gold)', fontStyle: 'italic', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>{s.tagline}</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.85', marginBottom: '24px' }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {s.points.map((p, j) => (
                    <li key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(199,166,106,0.2)', border: '1px solid rgba(199,166,106,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)' }} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Other 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>
            {SPECS.filter(s => !s.highlight).map((s, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: '36px 32px', borderBottom: '3px solid transparent', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.borderBottom = '3px solid var(--gold)'; e.currentTarget.style.background = 'var(--ivory)' }}
                onMouseLeave={e => { e.currentTarget.style.borderBottom = '3px solid transparent'; e.currentTarget.style.background = 'var(--white)' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--gold)', fontStyle: 'italic', marginBottom: '12px' }}>{s.tagline}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px' }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {s.points.map((p, j) => (
                    <li key={j} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: '6px' }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gold)', padding: '70px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 42px)', color: 'var(--navy-800)', marginBottom: '16px' }}>Ready to Begin?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(15,39,68,0.7)', marginBottom: '28px' }}>A personalised consultation helps identify the right healing pathway for you.</p>
          <Link to="/contact">
            <button style={{ background: 'var(--navy-800)', color: 'var(--white)', border: 'none', padding: '14px 32px', borderRadius: '2px', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Book Consultation
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
