import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminBlogList from './admin/AdminBlogList'
import AdminBlogEditor from './admin/AdminBlogEditor'
import AdminGallery from './admin/AdminGallery'
import AdminAppointments from './admin/AdminAppointments'
import AdminSettings from './admin/AdminSettings'
import AdminNotes from './admin/AdminNotes'
import AdminPatients from './admin/AdminPatients'
import AdminPatientProfile from './admin/AdminPatientProfile'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminCalendar from './admin/AdminCalendar'
import AdminTestimonials from './admin/AdminTestimonials'
import AdminPrescriptionTemplates from './admin/AdminPrescriptionTemplates'
import AdminFAQ from './admin/AdminFAQ'
import NotificationBell from '../components/NotificationBell'

function AdminHeader() {
  const [pending, setPending] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showToast, setShowToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPending()
    const channel = supabase
      .channel('admin-header-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        fetchPending()
        setShowToast({ name: payload.new.name, service: payload.new.service || 'General Consultation' })
        setTimeout(() => setShowToast(null), 6000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, () => {
        fetchPending()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchPending() {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)
    setPending(data || [])
  }

  async function confirm(appt) {
    // Turant UI se hatao
    setPending(prev => prev.filter(a => a.id !== appt.id))
    
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', appt.id)
    const phone = (appt.phone || '').replace(/[^\d]/g, '')
    const msg = encodeURIComponent(`Hi ${appt.name}, your appointment with Dr. Suresh Kumar has been confirmed${appt.preferred_date ? ` for ${new Date(appt.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}` : ''}${appt.preferred_time ? ` at ${appt.preferred_time}` : ''}. Looking forward to seeing you! 🌿`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''

  return (
    <>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid rgba(15,39,68,0.08)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginRight: 'auto' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>

        {/* Bell with dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(p => !p)}
            style={{ position: 'relative', background: pending.length > 0 ? 'rgba(192,57,43,0.08)' : 'var(--white)', border: `1px solid ${pending.length > 0 ? 'rgba(192,57,43,0.25)' : 'rgba(15,39,68,0.12)'}`, borderRadius: '2px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            {pending.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#c0392b', color: '#fff', fontSize: '9px', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', padding: '0 4px' }}>
                {pending.length > 9 ? '9+' : pending.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowDropdown(false)} />

              <div style={{ position: 'fixed', top: '64px', right: '12px', left: '12px', maxWidth: '380px', marginLeft: 'auto', background: 'var(--white)', border: '1px solid rgba(15,39,68,0.1)', borderRadius: '4px', boxShadow: '0 12px 40px rgba(7,15,28,0.15)', zIndex: 999, overflow: 'hidden' }}>
                {/* Dropdown header */}
                <div style={{ background: 'var(--navy-800)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--gold-pale)', margin: 0 }}>Pending Appointments</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{pending.length} awaiting confirmation</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => { navigate('/admin/appointments'); setShowDropdown(false) }} style={{ fontSize: '10px', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontWeight: 600, background: 'none', border: '1px solid rgba(199,166,106,0.3)', borderRadius: '2px', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                      View All →
                    </button>
                    <button onClick={() => setShowDropdown(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: 1 }}>✕</button>
                  </div>
                </div>

                {/* List */}
                {pending.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', margin: '0 0 8px' }}>✅</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>All caught up! No pending appointments.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {pending.map((a, i) => (
                      <div key={a.id} style={{ padding: '14px 16px', borderBottom: i < pending.length - 1 ? '1px solid rgba(15,39,68,0.06)' : 'none' }}>
                        {/* Patient info */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                            {(a.name || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-800)', margin: '0 0 2px', fontFamily: 'var(--font-body)' }}>{a.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.service || 'General'}{a.preferred_date ? ` · ${fmtDate(a.preferred_date)}` : ''}{a.preferred_time ? ` · ${a.preferred_time}` : ''}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-body)' }}>📞 {a.phone}</p>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-light)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {/* Action buttons - full width on mobile */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => confirm(a)} style={{ flex: 1, background: '#1e6f6a', color: '#fff', border: 'none', borderRadius: '2px', padding: '9px 10px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', letterSpacing: '0.3px' }}>
                            ✅ Confirm & WhatsApp
                          </button>
                          <a href={`https://wa.me/${(a.phone || '').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: '2px', padding: '9px 14px', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            💬
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* View Site */}
        <a href="/" target="_blank" rel="noreferrer" style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', padding: '8px 14px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🌐 View Site
        </a>
      </div>

      {/* Toast popup */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--navy-800)', border: '1px solid rgba(199,166,106,0.3)', borderRadius: '4px', padding: '16px 20px', zIndex: 9999, boxShadow: '0 8px 32px rgba(7,15,28,0.35)', maxWidth: '320px', animation: 'popIn 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)', borderRadius: '4px 4px 0 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>🌿</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--gold-pale)', margin: '0 0 4px' }}>New Appointment!</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', margin: '0 0 10px', lineHeight: 1.5 }}>
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{showToast.name}</strong> — {showToast.service}
              </p>
              <button onClick={() => { setShowDropdown(true); setShowToast(null) }} style={{ fontSize: '11px', color: 'var(--gold)', fontFamily: 'var(--font-body)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.5px' }}>
                View Details →
              </button>
            </div>
            <button onClick={() => setShowToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', padding: 0, flexShrink: 0 }}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('admin@ushamultispecialitydentalclinic.com')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function login() {
    setLoggingIn(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) {
      setError('Incorrect email or password')
    }
    setLoggingIn(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setPw('')
  }

  if (!checked) return null

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <p className="admin-login-logo">Usha Multi Speciality Dental Clinic</p>
          <h2>Admin Login</h2>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Enter admin password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className={error ? 'error' : ''}
          />
          {error && <p className="admin-error-text">{error}</p>}
          <button className="admin-btn-primary admin-login-btn" onClick={login} disabled={loggingIn}>
            {loggingIn ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/" className="admin-back-to-site">← Back to website</Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/calendar', label: 'Calendar', icon: '📅' },
    { to: '/admin/patients', label: 'Patients', icon: '👥' },
    { to: '/admin/patients/new', label: 'Add Patient', icon: '➕' },
    { to: '/admin/appointments', label: 'Appointments', icon: '📋' },
    { to: '/admin/templates', label: 'Rx Templates', icon: '💊' },
    { to: '/admin/faq', label: 'FAQ Manager', icon: '❓' },
    { to: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
    { to: '/admin/posts', label: 'Blog Posts', icon: '📝' },
    { to: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { to: '/admin/settings', label: 'Popup Settings', icon: '⚙️' },
    { to: '/admin/notes', label: 'My Notes', icon: '🗒️' },
  ]

  return (
    <div className="admin-shell">
      <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(p => !p)}>
        {sidebarOpen ? '✕' : '☰'} Menu
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src="/usha-dental-logo.png" alt="Usha Multi Speciality Dental Clinic" className="admin-sidebar-logo-img" />
          <p className="admin-sidebar-logo">Usha Multi Speciality Dental Clinic</p>
        </div>
        <NotificationBell />
        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="admin-nav-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-link" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <AdminHeader />
        <Routes>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="patients/:id" element={<AdminPatientProfile />} />
          <Route path="posts" element={<AdminBlogList />} />
          <Route path="posts/:id" element={<AdminBlogEditor />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="templates" element={<AdminPrescriptionTemplates />} />
          <Route path="faq" element={<AdminFAQ />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notes" element={<AdminNotes />} />
        </Routes>
      </main>
    </div>
  )
}
