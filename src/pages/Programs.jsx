import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const PROGRAMS = [
  {
    name: '90-Day Health Reset',
    tag: 'Most Popular',
    price: '₹50,000 – ₹75,000',
    duration: '90 Days',
    icon: '🔄',
    desc: 'A structured 90-day program for individuals dealing with recurring health issues, fatigue, digestive imbalance, and long-term health instability.',
    for: ['Professionals & corporate employees', 'Entrepreneurs and founders', 'High-pressure, long-hour workers', 'Individuals tired of temporary fixes'],
    focus: ['Energy and recovery', 'Digestion and immunity', 'Physical resilience', 'Overall health stability'],
    highlight: true,
  },
  {
    name: 'Chronic Condition Support',
    tag: 'Long-Term',
    price: 'On Consultation',
    duration: 'Ongoing',
    icon: '🔬',
    desc: 'For individuals managing long-term health concerns requiring continuous support, monitoring, and a personalised care approach.',
    for: ['Autoimmune condition patients', 'Metabolic disorder management', 'Thyroid and hormonal concerns', 'Recurring health disruptions'],
    focus: ['Symptom management support', 'Physical recovery', 'Stability and resilience', 'Reducing recurring disruptions'],
    highlight: false,
  },
  {
    name: 'Cancer Support & Recovery',
    tag: 'Specialized',
    price: '₹90,000 – ₹1,50,000',
    duration: 'As Required',
    icon: '🎗️',
    desc: 'Complementary support for individuals undergoing treatment or in recovery. Focused on physical recovery, fatigue management, and overall well-being.',
    for: ['Active cancer treatment patients', 'Post-treatment recovery', 'Caregivers needing support', 'Long-term survivorship'],
    focus: ['Physical recovery support', 'Digestion and nutrition', 'Fatigue management', 'Resilience and well-being'],
    highlight: true,
  },
  {
    name: 'Liver & Digestive Restoration',
    tag: 'Focused',
    price: 'On Consultation',
    duration: '60–90 Days',
    icon: '🌿',
    desc: 'A focused program for individuals struggling with digestive issues, bloating, gut imbalance, metabolic stress, and liver-related concerns.',
    for: ['Chronic acidity and bloating', 'Gut microbiome imbalance', 'Metabolic and liver concerns', 'Nutrient absorption issues'],
    focus: ['Digestion support', 'Nutrient absorption', 'Metabolic balance', 'Physical well-being'],
    highlight: false,
  },
  {
    name: 'High-Performance Health',
    tag: 'Executive',
    price: '₹75,000 – ₹1,20,000',
    duration: '90 Days',
    icon: '⚡',
    desc: 'Designed for corporate professionals, founders, and high-functioning individuals managing peak performance while maintaining health.',
    for: ['C-Suite executives', 'Entrepreneurs & founders', 'Night-shift and high-pressure workers', 'High-functioning professionals'],
    focus: ['Energy and recovery', 'Sleep and digestion', 'Stress-related physical health', 'Overall performance stability'],
    highlight: false,
  },
  {
    name: 'Fertility & Women\'s Wellness',
    tag: "Women's Health",
    price: 'On Consultation',
    duration: '3–6 Months',
    icon: '🌸',
    desc: 'A comprehensive, personalised program for women navigating fertility challenges, hormonal health, PCOS, and the journey to motherhood.',
    for: ['Women facing fertility challenges', 'PCOS and hormonal concerns', 'Pre-conception planning', 'Menstrual health support'],
    focus: ['Hormonal balance', 'Mind-body fertility optimization', 'Emotional well-being', 'Pre-conception wellness'],
    highlight: false,
  },
]

export default function Programs() {
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
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Programs</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 64px)', color: 'var(--white)', fontWeight: 600, marginBottom: '20px' }}>
            Structured Healing Programs
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', lineHeight: '1.85', fontWeight: 300 }}>
            Each program is designed based on the individual's condition, recovery requirements, lifestyle, and long-term health needs.
          </p>
        </div>
      </section>

      {/* Investment Note */}
      <section style={{ background: 'var(--gold)', padding: '22px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--navy-800)', fontWeight: 500, letterSpacing: '0.5px' }}>
            All programs are personalised. Final recommendations are made after the initial consultation and assessment.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section style={{ padding: '90px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2px', background: 'rgba(15,39,68,0.06)' }}>
            {PROGRAMS.map((p, i) => (
              <div key={i} style={{
                background: p.highlight ? 'var(--navy-800)' : 'var(--white)',
                padding: '40px 36px',
                position: 'relative', overflow: 'hidden',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = p.highlight ? 'var(--navy-700)' : 'var(--ivory-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = p.highlight ? 'var(--navy-800)' : 'var(--white)'}>
                {p.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px' }}>{p.icon}</span>
                  <span style={{ fontSize: '10px', background: p.highlight ? 'rgba(199,166,106,0.2)' : 'rgba(15,39,68,0.08)', color: p.highlight ? 'var(--gold)' : 'var(--navy-800)', padding: '4px 12px', borderRadius: '2px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{p.tag}</span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: p.highlight ? 'var(--gold-pale)' : 'var(--navy-800)', marginBottom: '10px' }}>{p.name}</h3>
                <p style={{ fontSize: '13px', color: p.highlight ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>{p.desc}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: p.highlight ? 'var(--gold)' : 'var(--gold)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Best For</div>
                    {p.for.map((f, j) => (
                      <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: p.highlight ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', marginBottom: '6px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: '6px' }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: p.highlight ? 'var(--gold)' : 'var(--gold)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Focus Areas</div>
                    {p.focus.map((f, j) => (
                      <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: p.highlight ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', marginBottom: '6px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--teal)', flexShrink: 0, marginTop: '6px' }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${p.highlight ? 'rgba(199,166,106,0.2)' : 'rgba(15,39,68,0.08)'}`, paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: p.highlight ? 'rgba(255,255,255,0.4)' : 'var(--text-light)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Investment</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: p.highlight ? 'var(--gold)' : 'var(--navy-800)' }}>{p.price}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: p.highlight ? 'rgba(255,255,255,0.4)' : 'var(--text-light)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Duration</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: p.highlight ? 'var(--gold-pale)' : 'var(--navy-800)' }}>{p.duration}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link to="/contact"><button className="btn-primary" style={{ fontSize: '14px', padding: '16px 36px' }}>Apply for Consultation</button></Link>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '14px' }}>Final program recommendations are made after a detailed health assessment.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
