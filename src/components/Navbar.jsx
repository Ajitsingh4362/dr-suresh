import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { getPortalSession } from '../lib/patientPortal'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock page scroll while the drawer is open; Escape closes it.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    if (location.hash) {
      // Give the new page a moment to render before we look for the anchor.
      const id = location.hash.slice(1)
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo(0, 0)
      }, 80)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [location])

  // Patient dashboard: shows "My Dashboard" once logged in, else "Patient Login"
  const portalLink = getPortalSession()?.token
    ? { to: '/patient-dashboard', label: 'My Dashboard' }
    : { to: '/patient-login', label: 'Patient Login' }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/specializations', label: 'Services' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/blog', label: 'Blog' },
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
        background: scrolled ? 'rgba(92,26,37,0.97)' : 'rgba(122,35,49,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(199,166,106,0.3)',
        boxShadow: scrolled ? '0 4px 20px rgba(92,26,37,0.18)' : 'none',
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
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px', marginLeft: '16px' }}>
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}
                style={({ isActive }) => ({
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px', fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--gold-light)' : 'rgba(255,255,255,0.88)',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  paddingBottom: '3px',
                  borderBottom: isActive ? '1px solid var(--gold-light)' : '1px solid transparent',
                  transition: 'all 0.25s',
                })}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to={portalLink.to}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                color: isActive ? 'var(--gold-light)' : 'var(--white)',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '9px 14px', border: '1px solid rgba(227,192,121,0.55)', borderRadius: '2px',
                whiteSpace: 'nowrap',
              })}>
              {portalLink.label}
            </NavLink>
            <NavLink to="/contact">
              <button className="btn-primary cta-pulse" style={{ padding: "10px 20px", fontSize: "11px" }}>
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

      {/* Mobile Menu — side drawer from the right */}
      <div
        className={`mnav-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`mnav-drawer ${menuOpen ? 'open' : ''}`}
        aria-label="Menu"
        aria-hidden={!menuOpen}
        {...(!menuOpen ? { inert: '' } : {})}
      >
        <div className="mnav-top">
          <img src="/usha-dental-logo.png" alt="Usha Multi Speciality Dental Clinic" style={{ height: '52px', width: 'auto' }} />
          <button className="mnav-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <nav className="mnav-links">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              className={({ isActive }) => `mnav-link ${isActive ? 'active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mnav-bottom">
          <NavLink to={portalLink.to} className={({ isActive }) => `mnav-portal ${isActive ? 'active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            {portalLink.label}
          </NavLink>
          <NavLink to="/contact" style={{ display: 'block' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Book Consultation</button>
          </NavLink>
          <a href="tel:+918987367274" className="mnav-call">Call +91 89873 67274</a>
        </div>
      </aside>

      <style>{`
.desktop-nav a, .desktop-nav button { white-space: nowrap; }
        @media (max-width: 1400px) {
          .desktop-nav { gap: 20px !important; }
        }
        @media (max-width: 1240px) {
          .desktop-nav { gap: 14px !important; }
          .desktop-nav a { letter-spacing: 1px !important; }
          .desktop-nav .btn-primary { padding: 10px 14px !important; }
        }
        @media (max-width: 1100px) {
          .desktop-nav { gap: 10px !important; }
          .desktop-nav a { letter-spacing: 0.5px !important; font-size: 10.5px !important; }
        }
        .mnav-backdrop { position: fixed; inset: 0; background: rgba(5,12,23,0.5); z-index: 1100; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; }
        .mnav-backdrop.open { opacity: 1; visibility: visible; }
        .mnav-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 1101;
          width: min(84vw, 340px); background: var(--ivory);
          display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform 0.32s cubic-bezier(0.4,0,0.2,1), visibility 0.32s;
          visibility: hidden; box-shadow: -12px 0 40px rgba(5,12,23,0.25);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .mnav-drawer.open { transform: translateX(0); visibility: visible; }
        .mnav-top { display: flex; align-items: center; justify-content: space-between; padding: calc(14px + env(safe-area-inset-top, 0px)) 18px 14px 22px; background: var(--maroon-dark); flex-shrink: 0; }
        .mnav-close { background: none; border: none; color: var(--gold-light); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; margin-right: -8px; }
        .mnav-links { flex: 1; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 10px 0; }
        .mnav-link { display: block; padding: 13px 24px; font-family: var(--font-display); font-size: 19px; font-weight: 600; color: var(--navy-800); border-left: 3px solid transparent; }
        .mnav-link.active { color: var(--gold-deep); border-left-color: var(--gold); background: rgba(199,166,106,0.1); }
        .mnav-link:active { background: rgba(199,166,106,0.12); }
        .mnav-bottom { flex-shrink: 0; padding: 16px 20px 20px; border-top: 1px solid rgba(15,39,68,0.08); display: flex; flex-direction: column; gap: 12px; background: var(--white); }
        .mnav-portal { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid var(--maroon); color: var(--maroon); font-weight: 600; font-size: 14px; border-radius: 2px; }
        .mnav-portal.active { background: var(--maroon); color: var(--white); }
        .mnav-call { text-align: center; font-size: 13px; color: var(--text-muted); font-weight: 500; }
        @media (max-height: 680px) {
          .mnav-link { padding: 10px 24px; font-size: 17px; }
          .mnav-top { padding-top: calc(8px + env(safe-area-inset-top, 0px)); padding-bottom: 8px; }
          .mnav-top img { height: 42px !important; }
          .mnav-bottom { padding: 12px 20px 14px; gap: 8px; }
        }
        @media (prefers-reduced-motion: reduce) { .mnav-drawer, .mnav-backdrop { transition: none; } }
        @media (min-width: 901px) { .mnav-drawer, .mnav-backdrop { display: none; } }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}