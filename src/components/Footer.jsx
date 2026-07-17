import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy-900)', borderTop: '1px solid rgba(199,166,106,0.12)', padding: '60px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          
          {/* Brand */}
          <div>
            <img
              src="/usha-dental-logo.png"
              alt="Usha Multi Speciality Dental Clinic"
              style={{ height: '80px', width: 'auto', marginBottom: '16px', objectFit: 'contain' }}
            />
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', maxWidth: '240px' }}>
              Complete dental care in Sitamarhi — painless procedures, modern technology, care for the whole family.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <a href="https://wa.me/918987367274" target="_blank" rel="noopener noreferrer"
                style={{ width: '36px', height: '36px', borderRadius: '2px', background: 'rgba(199,166,106,0.1)', border: '1px solid rgba(199,166,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(199,166,106,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(199,166,106,0.1)'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#C7A66A"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '18px' }}>Navigation</div>
            {[
              {to:'/',l:'Home'},
              {to:'/about',l:'About Dr. Suresh Kumar'},
              {to:'/specializations',l:'Services'},
              {to:'/gallery',l:'Gallery'},
              {to:'/faq',l:'FAQ'},
              {to:'/contact',l:'Book Appointment'}
            ].map(link => (
              <NavLink key={link.to} to={link.to}
                style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '10px', transition: 'color 0.25s' }}
                onMouseEnter={e => e.target.style.color = 'var(--gold-pale)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
                {link.l}
              </NavLink>
            ))}
          </div>

          {/* Specializations */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '18px' }}>Services</div>
            {[
              'Root Canal Treatment',
              'Cosmetic Dentistry',
              'Dental Implants',
              'Orthodontics (Braces)',
              'Child Dentistry',
              'Emergency Dental Care'
            ].map(s => (
              <div key={s} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '10px' }}>{s}</div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '18px' }}>Contact</div>
            {[
              { icon: '📍', text: 'Near Bhawdepur Chowk, Shiv Mandir,\nMata Vaishno Mandir Road, Bhavdepur,\nSitamarhi – 843302, Bihar' },
              { icon: '📞', text: '+91 89873 67274' },
              { icon: '✉️', text: 'info@ushamultispecialitydentalclinic.com' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(199,166,106,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Usha Multi Speciality Dental Clinic. Dr. Suresh Kumar. All rights reserved.</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Sitamarhi, Bihar</p>
        </div>
      </div>
    </footer>
  )
}