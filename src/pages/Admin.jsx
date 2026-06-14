import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Link, Navigate } from 'react-router-dom'
import { ADMIN_PASSWORD } from '../lib/supabase'
import AdminBlogList from './admin/AdminBlogList'
import AdminBlogEditor from './admin/AdminBlogEditor'
import AdminGallery from './admin/AdminGallery'
import AdminAppointments from './admin/AdminAppointments'
import AdminSettings from './admin/AdminSettings'
import AdminNotes from './admin/AdminNotes'

const AUTH_KEY = 'mmm_admin_authed'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') setAuthed(true)
    setChecked(true)
  }, [])

  function login() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setError(false)
      sessionStorage.setItem(AUTH_KEY, 'true')
    } else {
      setError(true)
    }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
    setPw('')
  }

  if (!checked) return null

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <p className="admin-login-logo">Mind Motion Matrix</p>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className={error ? 'error' : ''}
            autoFocus
          />
          {error && <p className="admin-error-text">Incorrect password</p>}
          <button className="admin-btn-primary admin-login-btn" onClick={login}>Login</button>
          <Link to="/" className="admin-back-to-site">← Back to website</Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { to: '/admin/posts', label: 'Blog Posts', icon: '📝' },
    { to: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
    { to: '/admin/settings', label: 'Popup Settings', icon: '⚙️' },
    { to: '/admin/notes', label: 'My Notes', icon: '🗒️' },
  ]

  return (
    <div className="admin-shell">
      <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(p => !p)}>
        {sidebarOpen ? '✕' : '☰'} Menu
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <p className="admin-sidebar-logo">Mind Motion Matrix</p>
        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="admin-nav-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link" target="_blank">🌐 View Site</Link>
          <button className="admin-nav-link" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route index element={<Navigate to="posts" replace />} />
          <Route path="posts" element={<AdminBlogList />} />
          <Route path="posts/:id" element={<AdminBlogEditor />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notes" element={<AdminNotes />} />
        </Routes>
      </main>
    </div>
  )
}
