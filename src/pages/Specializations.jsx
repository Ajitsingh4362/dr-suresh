import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const SPECS = [
  {
    icon: '🦷',
    image: '/svc-rct.png',
    title: 'Root Canal Treatment (RCT)',
    tagline: 'Save the Tooth, Relieve the Pain',
    desc: 'When decay or infection reaches the inner pulp of a tooth, root canal treatment removes the damage and saves the natural tooth — done with modern, painless techniques.',
    points: ['Single-sitting RCT where possible', 'Advanced pain management', 'Digital diagnosis for precise treatment', 'Crown placement after treatment', 'Suitable for adults and teens', 'Long-term tooth preservation'],
    highlight: true,
    color: 'var(--gold-pale)',
  },
  {
    icon: '✨',
    image: '/svc-cosmetic.png',
    title: 'Cosmetic Dentistry',
    tagline: 'Smile Makeovers Designed Around You',
    desc: 'From teeth whitening to veneers and bonding, cosmetic dentistry is about giving you a smile you feel confident showing off — without compromising on tooth health.',
    points: ['Professional teeth whitening', 'Veneers and dental bonding', 'Smile design consultations', 'Stain and discoloration correction', 'Chipped or uneven tooth correction', 'Natural-looking results'],
    highlight: true,
    color: 'var(--teal-pale)',
  },
  {
    icon: '🦴',
    image: '/svc-implants.png',
    title: 'Dental Implants',
    tagline: 'A Permanent, Natural-Looking Replacement',
    desc: 'Missing teeth affect both function and confidence. Dental implants offer a long-term, natural-feeling replacement — planned and placed with precision.',
    points: ['Single and multiple tooth implants', 'Precise implant planning', 'Natural look and feel', 'Improved chewing and speech', 'Long-lasting, durable solution', 'Follow-up care included'],
    highlight: false,
  },
  {
    icon: '📐',
    image: '/svc-ortho.png',
    title: 'Orthodontics',
    tagline: 'Straighter Teeth, Better Bite',
    desc: 'Braces and aligners for children and adults — correcting crowding, gaps, and bite issues for a healthier, more confident smile.',
    points: ['Metal and ceramic braces', 'Bite correction', 'Suitable for kids and adults', 'Regular progress monitoring', 'Improved oral hygiene long-term', 'Confidence-boosting results'],
    highlight: false,
  },
  {
    icon: '🧒',
    image: '/svc-pediatric.png',
    title: 'Pediatric Dentistry',
    tagline: 'Gentle, Friendly Care for Kids',
    desc: 'Children need a dentist who understands them. Our approach to child dentistry focuses on comfort, patience, and building healthy habits early.',
    points: ['Child-friendly environment', 'Cavity prevention and fluoride care', 'Gentle handling of dental anxiety', 'Habit counselling for parents', 'Early orthodontic screening', 'Painless treatment approach'],
    highlight: false,
  },
  {
    icon: '🚨',
    title: 'Emergency Dental Care',
    tagline: 'Prompt Relief When You Need It Most',
    desc: 'Sudden tooth pain, breakage, or injury can\'t always wait. Emergency dental care is available for urgent situations that need immediate attention.',
    points: ['Severe toothache relief', 'Broken or chipped tooth repair', 'Knocked-out tooth management', 'Infection and swelling care', 'Same-day appointments where possible', 'Clear guidance on next steps'],
    highlight: false,
  },
]

export default function Specializations() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      <SEO
        title="Dental Treatments in Sitamarhi — RCT, Implants, Braces & More"
        description="Explore our dental specializations in Sitamarhi: root canal treatment, dental implants, orthodontics/braces, cosmetic dentistry, pediatric dentistry & emergency dental care. Advanced, painless treatments for the whole family."
        path="/specializations"
        keywords="root canal treatment Sitamarhi, dental implants Sitamarhi, braces Sitamarhi, orthodontist Sitamarhi, cosmetic dentistry Sitamarhi, pediatric dentist Sitamarhi, tooth extraction Sitamarhi, emergency dental care Sitamarhi, teeth whitening Sitamarhi"
      />
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--maroon-dark) 0%, var(--navy-800) 55%, var(--navy-900) 100%)', padding: '168px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/hero-pattern.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }} className="hero-corner-pattern" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--white)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Services</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 58px)', color: 'var(--white)', fontWeight: 600, marginBottom: '20px' }}>
                Complete Dental Care, Under One Roof
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--white)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '20px' }}>
                Multi-Speciality Dental Care in Sitamarhi
              </p>
              <p style={{ fontSize: '14px', color: 'var(--white)', maxWidth: '560px', lineHeight: '1.9', fontWeight: 300, fontFamily: 'var(--font-body)', marginBottom: '16px' }}>
                Usha Multi Speciality Dental Clinic offers a wide range of dental treatments — general dentistry, cosmetic dentistry, orthodontics, implantology, and pediatric dentistry — all under one roof.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--white)', maxWidth: '560px', lineHeight: '1.9', fontWeight: 300, fontFamily: 'var(--font-body)' }}>
                The clinic is equipped with advanced technology and modern facilities to ensure precise diagnosis and effective, comfortable treatment for every patient.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--white)', maxWidth: '560px', lineHeight: '1.9', fontWeight: 300, fontFamily: 'var(--font-body)', marginTop: '16px' }}>
                Whether it's a routine check-up, a painful tooth, or a smile makeover you've been putting off — the goal is pain-free procedures and long-term oral health.
              </p>
            </div>

            {/* Service photo collage — real clinic photos */}
            <div className="specs-hero-visual" style={{ position: 'relative', height: '400px' }}>
              <div style={{ position: 'absolute', top: '10%', left: '10%', width: '75%', height: '75%', background: 'radial-gradient(circle, rgba(199,166,106,0.22) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
              {[
                { img: '/svc-rct.png', top: '0%', left: '6%', w: '46%', rot: '-3deg', z: 2 },
                { img: '/svc-cosmetic.png', top: '4%', left: '52%', w: '44%', rot: '2deg', z: 1 },
                { img: '/svc-implants.png', top: '52%', left: '0%', w: '42%', rot: '2deg', z: 1 },
                { img: '/svc-ortho.png', top: '48%', left: '46%', w: '48%', rot: '-2deg', z: 3 },
              ].map((it, i) => (
                <div key={i} style={{ position: 'absolute', top: it.top, left: it.left, width: it.w, transform: `rotate(${it.rot})`, zIndex: it.z }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '3px solid var(--white)', boxShadow: '0 16px 32px -10px rgba(15,39,68,0.28)' }}>
                    <img src={it.img} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .specs-hero-visual { display: none; }
          }
        `}</style>
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
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(199,166,106,0.1)' }} />
                {s.image && (
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(199,166,106,0.35)' }} />
                )}
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{s.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--gold-deep)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Core Specialty</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.5vw, 30px)', color: 'var(--navy-800)', fontWeight: 600, marginBottom: '12px', lineHeight: 1.2 }}>{s.title}</h2>
                <p style={{ fontSize: '13px', color: 'var(--gold-deep)', fontStyle: 'italic', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>{s.tagline}</p>
                <p style={{ fontSize: '14px', color: 'var(--charcoal)', lineHeight: '1.85', marginBottom: '24px' }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {s.points.map((p, j) => (
                    <li key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--charcoal)' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--white)', border: '1px solid rgba(199,166,106,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
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
                {s.image && (
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px', marginBottom: '16px' }} />
                )}
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

      {/* WHY CLIENTS CHOOSE US */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(160deg, var(--white), var(--teal-pale))' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag">Why Clients Choose Us</span>
            <div className="gold-line center" />
            <h2 className="section-title">Dental Care You Can Trust</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px' }}>
            {[
              'Multi-Speciality Dental Care Under One Roof',
              'Modern Technology & Equipment',
              'Painless, Comfort-Focused Procedures',
              'Cosmetic & Restorative Dentistry',
              'Child-Friendly Dental Care',
              'Emergency Appointments Available',
              'Personalised Treatment Plans',
              'Hygienic, Well-Equipped Clinic',
              'Trusted Care in Sitamarhi',
            ].map((w, i) => (
              <div key={i} style={{ background: 'var(--white)', border: '1px solid rgba(199,166,106,0.2)', padding: '24px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-pale)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}>
                <span style={{ color: 'var(--gold-deep)', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>✔</span>
                <span style={{ fontSize: '13px', color: 'var(--charcoal)', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT SUCCESS STORIES */}
      <section style={{ padding: '80px 0', background: 'var(--ivory)' }}>
        <div className="container" style={{ maxWidth: '720px', textAlign: 'center' }}>
          <span className="section-tag">Patient Stories</span>
          <div className="gold-line center" />
          <h2 className="section-title">Real Patients. Real Smiles.</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.9', fontFamily: 'var(--font-body)', fontWeight: 300, marginBottom: '12px' }}>
            Every patient's journey is different. The greatest reward is seeing people walk out pain-free and confident in their smile again.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.9', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
            From routine check-ups to complete smile makeovers — patient comfort and satisfaction guide every treatment at Usha Multi Speciality Dental Clinic.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gold)', padding: '70px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 42px)', color: 'var(--navy-800)', marginBottom: '16px' }}>Ready to Book Your Visit?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(15,39,68,0.7)', marginBottom: '28px' }}>Get in touch and let us find the right treatment for you.</p>
          <Link to="/contact">
            <button style={{ background: 'var(--navy-800)', color: 'var(--white)', border: 'none', padding: '14px 32px', borderRadius: '2px', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Book an Appointment
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
