import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const PROGRAMS = [
  {
    name: 'Fertility Revival & Parenthood Preparation Program',
    tag: 'Signature Program',
    price: '₹2,50,000',
    duration: 'Comprehensive 12-Month',
    icon: '🌸',
    desc: 'Designed for individuals and couples facing fertility challenges. Fertility is not merely a reproductive challenge — it is a reflection of hormonal, emotional, nutritional, lifestyle, and energetic balance.',
    for: ['Unexplained Infertility', 'PCOS & Hormonal Imbalances', 'Recurrent Pregnancy Loss', 'Failed IVF/IUI Cycles', 'Low AMH', 'Male Fertility Challenges', 'Emotional Stress Associated with Conception'],
    includes: ['Detailed Case Evaluation', 'Monthly Consultations', 'Homeopathic Medicines for One Year', 'Fertility Lifestyle Guidance', 'Emotional Wellness Sessions', 'Mindfulness & Stress Reduction Tools', 'WhatsApp Support', 'Progress Tracking & Monitoring', 'Supportive Holistic Healing Practices'],
    highlight: true,
  },
  {
    name: 'Cancer Recovery & Integrative Support Program',
    tag: 'Signature Program',
    price: '₹2,50,000',
    duration: 'Comprehensive 12-Month',
    icon: '🎗️',
    desc: 'Designed for individuals seeking supportive care during or after cancer treatment. While conventional oncology remains the primary treatment pathway, this program offers complementary support to improve overall well-being.',
    for: ['Improving Quality of Life', 'Managing Treatment-Related Challenges', 'Emotional Resilience', 'Fatigue & Energy Restoration', 'Sleep Improvement', 'Stress & Anxiety Management', 'Immune System Support', 'Recovery Enhancement'],
    includes: ['Comprehensive Health Assessment', 'Individualised Homeopathic Support', 'Monthly Reviews', 'Emotional Wellness Coaching', 'Mind-Body Healing Practices', 'Lifestyle & Nutrition Guidance', 'Family Support Sessions', 'WhatsApp Access', 'One-Year Homeopathic Medicines', 'Recovery Progress Tracking'],
    highlight: true,
  },
  {
    name: 'Chronic Illness Reversal & Wellness Restoration Program',
    tag: 'Premium Program',
    price: '₹1,50,000',
    duration: 'Comprehensive 12-Month',
    icon: '🔬',
    desc: 'For individuals living with long-standing health conditions that continue to impact daily life and vitality. Chronic illnesses are rarely isolated events — they often involve physical, emotional, environmental, and lifestyle factors.',
    for: ['Autoimmune Conditions', 'Thyroid Disorders', 'Diabetes Support', 'Digestive Disorders', 'Chronic Fatigue', 'Migraines', 'Skin Disorders', 'Allergies', 'Stress-Related Disorders', 'Hormonal Dysfunctions'],
    includes: ['Individualised Case Analysis', 'Homeopathic Medicines', 'Emotional Health Assessment', 'Lifestyle Modification Guidance', 'Mind-Body Wellness Practices', 'Regular Follow-Up Sessions', 'Unlimited Support Between Consultations', 'Comprehensive Health Monitoring'],
    highlight: false,
  },
  {
    name: 'Allied Healing Sciences',
    tag: 'Integrative Modalities',
    price: 'On Consultation',
    duration: 'As Required',
    icon: '🌿',
    desc: 'Healing is multidimensional. Alongside homeopathy and psychotherapy, supportive healing modalities may be incorporated based on individual needs to complement your overall wellness journey.',
    for: ['Sound Healing', 'Crystal Healing', 'Mindfulness Practices', 'Guided Relaxation Techniques', 'Positive Psychology Interventions', 'Neuro-Linguistic Programming (NLP)', 'Somato-Psychic Awareness Practices', 'Breath-Based Relaxation Methods', 'Emotional Release Techniques'],
    includes: ['Personalised Modality Selection', 'Integration with Homeopathic Care', 'Emotional Balance Support', 'Relaxation & Recovery Tools', 'Personal Growth Practices'],
    highlight: false,
  },
]

const WHY = [
  '15+ Years of Clinical Experience',
  '1000+ Lives Impacted',
  'Expertise in Homeopathy & Psychotherapy',
  'Fertility & Women\'s Health Specialist',
  'Emotional Wellness & Resilience Coach',
  'Chronic Disease Recovery Consultant',
  'Personalised One-on-One Care',
  'Long-Term Health Transformation Approach',
  'Compassionate and Confidential Support',
]

export default function Programs() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '168px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,166,106,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Signature Programs</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--white)', fontWeight: 600, lineHeight: 1.15, marginBottom: '24px', maxWidth: '700px' }}>
            Transforming Health Beyond Symptoms
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', maxWidth: '600px', lineHeight: '1.9', fontWeight: 300, fontFamily: 'var(--font-body)', marginBottom: '16px' }}>
            Where Science, Psychology & Holistic Healing Meet
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '640px', lineHeight: '1.9', fontWeight: 300, fontFamily: 'var(--font-body)' }}>
            With over 15 years of experience in Homeopathy, Psychotherapy, Emotional Wellness, and Integrative Healing Sciences, I work with individuals seeking deeper and sustainable healing beyond temporary symptom management.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY STRIP */}
      <section style={{ background: 'var(--gold)', padding: '32px 0' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 2vw, 22px)', color: 'var(--navy-800)', fontWeight: 600, margin: 0, letterSpacing: '0.3px' }}>
            "Restoring Health. Renewing Hope. Transforming Lives."
          </p>
        </div>
      </section>

      {/* PROGRAMS */}
      <section style={{ padding: '100px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <span className="section-tag">Our Programs</span>
            <div className="gold-line center" />
            <h2 className="section-title">Signature Healing Programs</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Each program is comprehensive, personalised, and designed for lasting transformation — not temporary relief.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {PROGRAMS.map((prog, i) => (
              <div key={i} style={{
                background: prog.highlight ? 'var(--navy-800)' : 'var(--white)',
                border: prog.highlight ? 'none' : '1px solid rgba(15,39,68,0.08)',
                position: 'relative', overflow: 'hidden',
              }}>
                {prog.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />}

                <div className="container" style={{ padding: '56px 24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', alignItems: 'start' }} className="program-grid">

                    {/* LEFT */}
                    <div style={{ gridColumn: '1 / 2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '32px' }}>{prog.icon}</span>
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(199,166,106,0.1)', padding: '4px 12px', borderRadius: '2px', border: '1px solid rgba(199,166,106,0.25)' }}>{prog.tag}</span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 600, color: prog.highlight ? 'var(--gold-pale)' : 'var(--navy-800)', marginBottom: '16px', lineHeight: 1.3 }}>{prog.name}</h3>
                      <p style={{ fontSize: '13px', color: prog.highlight ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)', lineHeight: '1.85', fontFamily: 'var(--font-body)', fontWeight: 300, marginBottom: '24px' }}>{prog.desc}</p>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <div>
                          <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: prog.highlight ? 'rgba(255,255,255,0.4)' : 'var(--text-light)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '4px' }}>Investment</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--gold)' }}>{prog.price}</div>
                          {prog.price !== 'On Consultation' && <div style={{ fontSize: '10px', color: prog.highlight ? 'rgba(255,255,255,0.35)' : 'var(--text-light)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>Inclusive of consultations & medicines</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: prog.highlight ? 'rgba(255,255,255,0.4)' : 'var(--text-light)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '4px' }}>Duration</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: prog.highlight ? 'var(--white)' : 'var(--navy-800)' }}>{prog.duration}</div>
                        </div>
                      </div>
                      <Link to="/contact">
                        <button className={prog.highlight ? 'btn-primary' : 'btn-outline-dark'} style={{ fontSize: '11px', padding: '12px 28px' }}>
                          Enquire About This Program
                        </button>
                      </Link>
                    </div>

                    {/* MIDDLE — designed for */}
                    <div>
                      <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '16px' }}>
                        {i === 3 ? 'Modalities Include' : 'Designed For'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {prog.for.map((item, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <span style={{ color: 'var(--gold)', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✔</span>
                            <span style={{ fontSize: '13px', color: prog.highlight ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT — includes */}
                    <div>
                      <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '16px' }}>Includes</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {prog.includes.map((item, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <span style={{ color: 'var(--teal)', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                            <span style={{ fontSize: '13px', color: prog.highlight ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section style={{ padding: '100px 0', background: 'var(--navy-900)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag">Why Clients Choose Us</span>
            <div className="gold-line center" />
            <h2 className="section-title light">A Truly Integrative Healing Experience</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px' }}>
            {WHY.map((w, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(199,166,106,0.08)', padding: '24px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(199,166,106,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                <span style={{ color: 'var(--gold)', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>✔</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT SUCCESS STORIES */}
      <section style={{ padding: '100px 0', background: 'var(--ivory)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-tag">Client Success Stories</span>
          <div className="gold-line center" />
          <h2 className="section-title">Real People. Real Transformations.</h2>
          <p className="section-desc" style={{ margin: '0 auto 48px', maxWidth: '600px' }}>
            Every healing journey is unique. The greatest reward is witnessing individuals rediscover hope, resilience, confidence, and renewed health — from couples who found their path towards parenthood, to individuals navigating cancer recovery, chronic illness, and emotional burnout.
          </p>
          <Link to="/contact">
            <button className="btn-primary" style={{ fontSize: '12px', padding: '14px 36px' }}>Begin Your Healing Journey</button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gold)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '16px' }}>
            Ready to Begin Your Transformation?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(15,39,68,0.65)', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px', lineHeight: '1.8', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
            Schedule a detailed assessment to discover the most suitable healing program for your unique health needs.
          </p>
          <Link to="/contact">
            <button style={{ background: 'var(--navy-800)', color: 'var(--white)', border: 'none', padding: '14px 36px', borderRadius: '2px', fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-800)'}>
              Apply for Consultation
            </button>
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .program-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  )
}
