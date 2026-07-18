import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const QUALS = [
  { icon: '🎓', year: 'Foundation', title: 'BDS — Bachelor of Dental Surgery', sub: 'Core clinical training in dental medicine and surgery' },
  { icon: '🦷', year: 'Clinical', title: 'General & Family Dentistry', sub: 'Routine care, fillings, extractions, and preventive dentistry' },
  { icon: '😁', year: 'Advanced', title: 'Cosmetic & Restorative Dentistry', sub: 'Smile makeovers, veneers, crowns, and bridges' },
  { icon: '📐', year: 'Advanced', title: 'Orthodontics & Implantology', sub: 'Braces, aligners, and dental implant procedures' },
  { icon: '🧒', year: 'Specialised', title: 'Pediatric Dentistry', sub: 'Gentle, child-friendly dental care' },
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
            Dr. Suresh Kumar & Dr. Preeti Rajguru
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '16px' }}>
            Gentle, Modern Dental Care for the Whole Family.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: '580px', lineHeight: '1.8', fontWeight: 300 }}>
            Dr. Suresh Kumar and Dr. Preeti Rajguru (MDS) lead Usha Multi Speciality Dental Clinic, Sitamarhi.
          </p>
        </div>
      </section>

      {/* Meet Our Doctors */}
      <section style={{ padding: '90px 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag">Our Doctors</span>
            <div className="gold-line center" />
            <h2 className="section-title">Meet the Team</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', margin: '0 auto 18px', overflow: 'hidden', border: '3px solid var(--gold)' }}>
                <img src="/dr-suresh-kumar.jpg" alt="Dr. Suresh Kumar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--navy-800)', fontWeight: 600 }}>Dr. Suresh Kumar</div>
              <div style={{ fontSize: '12px', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Consultant Implantologist</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', margin: '0 auto 18px', overflow: 'hidden', border: '3px solid var(--gold)' }}>
                <img src="/dr-preeti-rajguru.jpg" alt="Dr. Preeti Rajguru" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--navy-800)', fontWeight: 600 }}>Dr. Preeti Rajguru</div>
              <div style={{ fontSize: '12px', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>MDS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section style={{ padding: '90px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '72px', alignItems: 'start' }} className="two-col-grid">

            {/* Card */}
            <div style={{ background: 'var(--navy-800)', borderRadius: '2px', padding: '40px', border: '1px solid rgba(199,166,106,0.15)', position: 'sticky', top: '100px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden', border: '2px solid rgba(199,166,106,0.3)' }}>
                <img src="/dr-suresh-kumar.jpg" alt="Dr. Suresh Kumar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold-pale)', fontWeight: 600 }}>Dr. Suresh Kumar</div>
                <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '6px' }}>Usha Multi Speciality Dental Clinic</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(199,166,106,0.15)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Qualification', value: 'Consultant Implantologist' },
                  { label: 'Established', value: '2010' },
                  { label: 'Clinic', value: 'Sitamarhi, Bihar' },
                  { label: 'Focus', value: 'Family & Cosmetic Dentistry' },
                  { label: 'Specialization', value: 'Multi-Speciality Dental Care' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--gold-pale)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '28px' }}>
                <Link to="/contact"><button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Book Appointment</button></Link>
              </div>
            </div>

            {/* Text */}
            <div>
              <span className="section-tag">His Story</span>
              <div className="gold-line" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--navy-800)', marginBottom: '24px', fontWeight: 600 }}>
                Dedicated to Your Dental Health
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.95', marginBottom: '20px' }}>
                Dr. Suresh Kumar leads Usha Multi Speciality Dental Clinic in Sitamarhi, offering complete dental care under one roof — from routine check-ups to advanced procedures — with a focus on painless treatment and patient comfort.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.95', marginBottom: '20px' }}>
                The clinic is equipped with modern technology to ensure precise diagnosis and effective treatment, covering general dentistry, cosmetic dentistry, orthodontics, implantology, and pediatric dentistry.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.95', marginBottom: '36px' }}>
                Dr. Suresh Kumar is committed to painless, patient-friendly dentistry — using modern equipment and techniques so every visit is as comfortable as possible.
              </p>

              <div style={{ background: 'var(--navy-800)', borderLeft: '3px solid var(--gold)', padding: '24px 28px', marginBottom: '36px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold-pale)', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "Our patients are our priority — we offer quality dental care with a focus on pain-free procedures and long-term oral health."
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px', letterSpacing: '1px' }}>— DR. SURESH KUMAR</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['General Dentistry', 'Cosmetic Dentistry', 'Orthodontics', 'Implantology', 'Pediatric Dentistry', 'Emergency Care', 'Root Canal Specialist', 'Family Dentistry'].map((tag, i) => (
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
