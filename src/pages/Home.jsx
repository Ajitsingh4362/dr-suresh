import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Tilt3D from '../components/Tilt3D'
import AutoSwipe from '../components/AutoSwipe'
import Typewriter from '../components/Typewriter'
import BlogPreview from '../components/BlogPreview'
import ConsultationPopup from '../components/ConsultationPopup'
import TestimonialsSection from '../components/TestimonialsSection'

const HIGHLIGHTS = [
  { icon: '🦷', title: 'Root Canal Treatment', desc: 'Painless, precise RCT using modern techniques — relieving pain while saving your natural tooth.', highlight: true },
  { icon: '✨', title: 'Cosmetic Dentistry', desc: 'Smile makeovers, teeth whitening, veneers, and bonding — designed around how you want to look and feel.', highlight: true },
  { icon: '🦴', title: 'Dental Implants', desc: 'Permanent, natural-looking replacements for missing teeth, planned and placed with precision.' },
  { icon: '📐', title: 'Orthodontics', desc: 'Braces and aligners for children and adults — straighter teeth, better bite, and more confident smiles.' },
  { icon: '🧒', title: 'Child Dentistry', desc: 'Gentle, friendly dental care for kids — building healthy habits and easing dental anxiety early.' },
  { icon: '🚨', title: 'Emergency Dental Care', desc: 'Sudden tooth pain, breakage, or injury — prompt attention when you need it most.' },
]

const WHY = [
  'Multi-Speciality Dental Care',
  'Painless, Modern Procedures',
  'Family & Cosmetic Dentistry',
  'Advanced Dental Technology',
  'Child-Friendly Treatment',
  'Emergency Care Available',
  'Experienced Dental Team',
  'Comfortable, Hygienic Clinic',
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
        paddingTop: '128px', paddingBottom: '80px',
      }}>
        {/* Background decorative blobs */}
        <div style={{ position: 'absolute', top: '-5%', right: '-8%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,111,106,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,166,106,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top-right dot pattern */}
        <div className="hero-corner-pattern" style={{
          position: 'absolute', top: '24px', right: '24px', width: '350px', height: '350px',
          backgroundImage: 'radial-gradient(rgba(240,221,181,0.9) 2px, transparent 2px)',
          backgroundSize: '18px 18px',
          maskImage: 'radial-gradient(circle at top right, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at top right, black 40%, transparent 90%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom-right dot pattern */}
        <div className="hero-corner-pattern" style={{
          position: 'absolute', bottom: '24px', right: '24px', width: '350px', height: '350px',
          backgroundImage: 'radial-gradient(rgba(240,221,181,0.9) 2px, transparent 2px)',
          backgroundSize: '18px 18px',
          maskImage: 'radial-gradient(circle at bottom right, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at bottom right, black 40%, transparent 90%)',
          pointerEvents: 'none',
        }} />

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
                marginTop: '28px', marginBottom: '32px',
                background: 'rgba(199,166,106,0.08)',
                border: '1px solid rgba(199,166,106,0.25)',
                borderLeft: '3px solid var(--gold)',
                borderRadius: '2px',
                padding: '14px 22px',
                width: '300px',
                boxSizing: 'border-box',
              }}>
                <div style={{ width: '100%' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px', fontWeight: 700,
                    color: 'var(--gold)',
                    letterSpacing: '0.5px',
                    lineHeight: 1.2,
                  }}>
                    <Typewriter text="Dr. Suresh Kumar" speed={70} loop pauseAfter={5000} />
                  </div>
                  <div style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    marginTop: '4px', fontFamily: 'var(--font-body)',
                  }}>
                    <Typewriter text="Multi-Speciality Dental Care" speed={40} startDelay={1400} cursor={false} loop pauseAfter={5000} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--gold-pale)',
                    fontWeight: 600, marginTop: '10px',
                  }}>
                    <Typewriter text="Dr. Preeti Rajguru" speed={70} startDelay={800} loop pauseAfter={5000} />
                  </div>
                  <div style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    marginTop: '4px', fontFamily: 'var(--font-body)',
                  }}>
                    <Typewriter text="MDS" speed={70} startDelay={2200} cursor={false} loop pauseAfter={5000} />
                  </div>
                </div>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4.5vw, 68px)',
                fontWeight: 600, color: 'var(--white)',
                lineHeight: 1.1, marginBottom: '24px',
              }}>
                Gentle Care<br />for a{' '}
                <span style={{ color: 'var(--gold)', fontStyle: 'italic', display: 'block' }}>
                  Healthy, Confident<br />Smile
                </span>
              </h1>

              <p style={{
                fontSize: '15px', color: 'rgba(255,255,255,0.6)',
                lineHeight: '1.85', maxWidth: '520px', marginBottom: '14px',
                fontFamily: 'var(--font-body)', fontWeight: 300,
              }}>
                Complete dental care in Sitamarhi — from routine check-ups and fillings to
                root canals, implants, and smile makeovers — delivered with a gentle, patient-first
                approach.
              </p>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.38)',
                lineHeight: '1.7', maxWidth: '480px', marginBottom: '36px',
                fontFamily: 'var(--font-body)',
              }}>
                From children's first check-ups to advanced cosmetic and emergency care —
                every treatment plan is built around your comfort.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <Link to="/contact"><button className="btn-primary">Book an Appointment</button></Link>
                <Link to="/specializations"><button className="btn-outline">Our Services</button></Link>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex', gap: '44px', flexWrap: 'wrap',
                paddingTop: '36px', borderTop: '1px solid rgba(199,166,106,0.15)',
              }}>
                {[
                  { num: '2010', label: 'Established' },
                  { num: 'RCT', label: 'Painless Root Canal' },
                  { num: 'Braces', label: 'Orthodontics' },
                  { num: 'Implants', label: 'Tooth Replacement' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — hero image */}
            <div className="hero-visual-wrapper" style={{ position: 'relative' }}>
              {/* Glow backdrop */}
              <div style={{
                position: 'absolute', top: '-30px', right: '-30px',
                width: '90%', height: '90%',
                background: 'radial-gradient(circle, rgba(199,166,106,0.18) 0%, transparent 70%)',
                filter: 'blur(20px)', pointerEvents: 'none', zIndex: 0,
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <AutoSwipe images={['/smile-closeup.png', '/natures-care.png']} interval={2000} />
              </div>
              {/* Floating trust badge */}
              <div style={{
                position: 'absolute', left: '-24px', bottom: '-24px', zIndex: 2,
                background: 'var(--navy-800)', border: '1px solid rgba(199,166,106,0.35)',
                borderRadius: '10px', padding: '16px 20px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <span style={{ fontSize: '24px' }}>⭐</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--gold-pale)', fontWeight: 700, lineHeight: 1 }}>4.9 / 5</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Patient Rated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: 'float 2.5s ease-in-out infinite' }}>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, var(--gold), transparent)' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* TAGLINE STRIP */}
      <section style={{ background: 'var(--navy-700, #0f2744)', padding: '20px 0', borderBottom: '1px solid rgba(199,166,106,0.15)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 2vw, 22px)', color: 'var(--gold-pale)', fontWeight: 600, margin: 0, fontStyle: 'italic', letterSpacing: '0.3px' }}>
            "Healthy Smiles. Gentle Care. For the Whole Family."
          </p>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section style={{ background: 'var(--white)', padding: '0' }}>
        <img src="/clinic-banner.png" alt="Usha Multi Speciality Dental Clinic — Premium Care for Healthy Smiles" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </section>

      {/* INTRO STRIP */}
      <section style={{ background: 'var(--gold)', padding: '28px 0' }}>
        <div className="container">
          <div className="intro-strip-inner" style={{ display: 'flex', gap: '0', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', textAlign: 'center' }}>
            {['General Dentistry', 'Cosmetic Dentistry', 'Orthodontics', 'Pediatric Dentistry', 'Emergency Care'].map((t, i) => (
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

      {/* Shape divider: navy (hero-style blue) -> ivory, into Our Doctors section */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-800) 100%)', lineHeight: 0 }}>
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '64px' }}>
          <path d="M0,38 C300,95 900,5 1200,48 L1200,100 L0,100 Z" fill="#FAF8F4" />
          <path d="M0,38 C300,95 900,5 1200,48" fill="none" stroke="#6f93c2" strokeWidth="2.5" opacity="0.55" />
        </svg>
      </div>

      {/* MEET THE DOCTORS — swipeable */}
      <section className="doctors-section" style={{
        padding: '90px 0',
        background: 'var(--ivory)',
        backgroundImage: `
          radial-gradient(rgba(30,70,190,0.35) 1.5px, transparent 1.5px),
          radial-gradient(rgba(200,40,40,0.3) 1.5px, transparent 1.5px)
        `,
        backgroundSize: '30px 30px, 30px 30px',
        backgroundPosition: '0 0, 15px 15px',
        position: 'relative',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">Our Doctors</span>
            <div className="gold-line center" />
            <h2 className="section-title">Meet the Team</h2>
          </div>
          <div className="doctor-swipe" style={{
            display: 'flex', gap: '24px', overflowX: 'auto',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
            padding: '4px 4px 16px', maxWidth: '640px', margin: '0 auto',
          }}>
            {[
              { photo: '/dr-suresh-kumar.jpg', name: 'Dr. Suresh Kumar', qual: 'Consultant Implantologist' },
              { photo: '/dr-preeti-rajguru.jpg', name: 'Dr. Preeti Rajguru', qual: 'MDS' },
            ].map((d, i) => (
              <div key={i} style={{
                flex: '0 0 260px', scrollSnapAlign: 'center', textAlign: 'center',
                background: 'var(--white)', borderRadius: '8px', padding: '28px 20px', boxShadow: '0 8px 24px rgba(15,39,68,0.08)',
                border: '1px solid rgba(199,166,106,0.2)',
              }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden', border: '3px solid var(--gold)' }}>
                  <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--navy-800)', fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{d.qual}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>← Swipe to see both doctors →</p>
        </div>
      </section>

      {/* Mobile/Tablet-only CTA, just above Healing Areas */}
      <div className="mobile-book-cta-wrap" style={{ padding: '32px 0', background: 'var(--ivory)', textAlign: 'center' }}>
        <Link to="/contact"><button className="btn-primary">Book an Appointment</button></Link>
      </div>

      {/* SPECIALIZATIONS PREVIEW */}
      <section className="healing-areas-section" style={{ padding: '100px 0', background: 'var(--ivory)', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-tag">Healing Areas</span>
            <div className="gold-line center" />
            <h2 className="section-title">Our Dental Services</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              From routine care to advanced procedures, every treatment is delivered with modern technology and a gentle, patient-first approach.
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
                {h.highlight && (
                  <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.4, pointerEvents: 'none' }}>
                    <rect x="34" y="8" width="22" height="22" fill="none" stroke="var(--gold)" strokeWidth="1.5" transform="rotate(45 45 19)" />
                    <rect x="12" y="-6" width="14" height="14" fill="var(--gold)" opacity="0.25" transform="rotate(45 19 1)" />
                    <rect x="56" y="34" width="14" height="14" fill="var(--gold)" opacity="0.25" transform="rotate(45 63 41)" />
                    <rect x="40" y="34" width="8" height="8" fill="var(--gold)" opacity="0.6" transform="rotate(45 44 38)" />
                  </svg>
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

          <div style={{ textAlign: 'center', marginTop: '48px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/specializations"><button className="btn-outline-dark">Explore All Specializations</button></Link>
            <Link to="/contact"><button className="btn-primary">Book an Appointment</button></Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(160deg, var(--navy-800), var(--navy-900))' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="two-col-grid">
            <div>
              <span className="section-tag">Why Usha Dental Clinic</span>
              <div className="gold-line" />
              <h2 className="section-title light">Dental Care You Can Trust</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.85', marginBottom: '32px', fontWeight: 300 }}>
                A multi-speciality clinic in Sitamarhi focused on painless procedures, modern technology, and care for every member of the family.
              </p>
              <Link to="/contact"><button className="btn-primary">Book an Appointment</button></Link>
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
              { num: '01', title: 'Initial Consultation', desc: 'A thorough check-up and discussion of your dental concerns and goals.' },
              { num: '02', title: 'Diagnosis', desc: 'Careful examination, and X-rays where needed, to pinpoint the exact issue.' },
              { num: '03', title: 'Treatment Plan', desc: 'A clear, personalised plan — procedures, timeline, and what to expect.' },
              { num: '04', title: 'Treatment', desc: 'Painless, precise procedures using modern equipment and techniques.' },
              { num: '05', title: 'Follow-Up Care', desc: 'Check-ins and guidance to keep your smile healthy long after treatment.' },
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
            Don't Wait to Achieve the Smile You Deserve
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(15,39,68,0.7)', marginBottom: '36px', maxWidth: '520px', margin: '0 auto 36px', lineHeight: '1.8' }}>
            Book a check-up today and let our team find the right treatment plan for you.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact">
              <button style={{ background: 'var(--navy-800)', color: 'var(--white)', border: 'none', padding: '14px 32px', borderRadius: '2px', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-800)'}>
                Book an Appointment
              </button>
            </Link>
            <Link to="/specializations">
              <button className="btn-outline-dark">View Services</button>
            </Link>
          </div>
        </div>
      </section>

      {/* PREMIUM 3D SHOWCASE */}
      <section className="healing-map-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag" style={{ color: 'var(--gold)' }}>Step Inside</span>
            <div className="gold-line center" />
            <h2 className="section-title light">Our Clinic, Up Close</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.85', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
              Move your cursor over the image for a closer look at Usha Multi Speciality Dental Clinic.
            </p>
          </div>
          <Tilt3D image="/clinic-banner-2.png" alt="Usha Multi Speciality Dental Clinic" />
          <div className="mobile-book-cta-wrap" style={{ padding: '32px 0 0', background: 'transparent', textAlign: 'center' }}>
            <Link to="/contact"><button className="btn-primary">Book an Appointment</button></Link>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <BlogPreview />

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-corner-pattern {
            display: none !important;
          }
        }
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