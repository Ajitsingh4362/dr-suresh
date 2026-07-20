import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0) }, [location])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/specializations', label: 'Services' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/faq', label: 'FAQ' },
    { to: '/social-service', label: 'Social Service' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001,
        background: 'var(--gold)', borderBottom: '1px solid rgba(15,39,68,0.15)',
        overflow: 'hidden', whiteSpace: 'nowrap', padding: '6px 0',
      }}>
        <div style={{ display: 'inline-flex', animation: 'marquee-scroll 26s linear infinite' }}>
          {[0, 1].map(g => (
            <div key={g} style={{ display: 'inline-flex', flexShrink: 0 }}>
              {new Array(4).fill(0).map((_, i) => (
                <span key={i} style={{
                  display: 'inline-block', color: '#000000', fontSize: '11px',
                  letterSpacing: '1px', fontFamily: 'var(--font-body)', fontWeight: 600,
                  padding: '0 28px',
                }}>
                  ✦ Usha Multi Speciality Dental Clinic — Book Your Appointment Today — Call +91 89873 67274
                </span>
              ))}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
      <nav style={{
        position: 'fixed', top: '28px', left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(7,15,28,0.97)' : 'rgba(7,15,28,0.5)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(199,166,106,0.12)',
        padding: scrolled ? '10px 0' : '14px 0',
        transition: 'all 0.4s ease',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo Only — No Text */}
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/usha-dental-logo.png"
              alt="Usha Multi Speciality Dental Clinic"
              style={{
                height: scrolled ? '62px' : '76px',
                width: 'auto',
                transition: 'height 0.4s ease',
                objectFit: 'contain',
              }}
            />
          </NavLink>

          {/* Desktop Links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}
                style={({ isActive }) => ({
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px', fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.75)',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  paddingBottom: '3px',
                  borderBottom: isActive ? '1px solid var(--gold)' : '1px solid transparent',
                  transition: 'all 0.25s',
                })}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/contact">
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '11px' }}>
                Book Consultation
              </button>
            </NavLink>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger"
            style={{ display: 'none', background: 'none', border: 'none', flexDirection: 'column', gap: '5px', padding: '4px', cursor: 'pointer' }}
            aria-label="Toggle menu">
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: '22px', height: '2px',
                background: 'var(--gold)', borderRadius: '2px', transition: 'var(--transition)',
                transform: menuOpen
                  ? (i===0 ? 'translateY(7px) rotate(45deg)' : i===2 ? 'translateY(-7px) rotate(-45deg)' : 'scaleX(0)')
                  : 'none',
                opacity: menuOpen && i===1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div style={{
        position: 'fixed', inset: 0, background: 'var(--navy-900)',
        zIndex: 999, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '28px',
        transition: 'opacity 0.3s, visibility 0.3s',
        opacity: menuOpen ? 1 : 0, visibility: menuOpen ? 'visible' : 'hidden',
      }}>
        {/* Mobile Logo */}
        <img
          src="/usha-dental-logo.png"
          alt="Usha Multi Speciality Dental Clinic"
          style={{ height: '80px', width: 'auto', marginBottom: '8px' }}
        />

        <div style={{ width: '40px', height: '1px', background: 'rgba(199,166,106,0.3)' }} />

        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'}
            style={({ isActive }) => ({
              fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600,
              color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.8)',
              letterSpacing: '1px',
            })}>
            {link.label}
          </NavLink>
        ))}

        <NavLink to="/contact" style={{ marginTop: '8px' }}>
          <button className="btn-primary">Book Consultation</button>
        </NavLink>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}