import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import CallFloat from './components/CallFloat'
// Home is loaded right away (it's the landing page). Every other page is
// code-split: its JS downloads only when someone opens it. This keeps the
// admin panel, patient dashboard, PDF/QR code etc. out of the first load.
import Home from './pages/Home'
import lazyWithRetry from './lib/lazyWithRetry'

const About = lazyWithRetry(() => import('./pages/About'))
const Specializations = lazyWithRetry(() => import('./pages/Specializations'))
const Contact = lazyWithRetry(() => import('./pages/Contact'))
const Blog = lazyWithRetry(() => import('./pages/Blog'))
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'))
const Gallery = lazyWithRetry(() => import('./pages/Gallery'))
const FAQ = lazyWithRetry(() => import('./pages/FAQ'))
const SocialService = lazyWithRetry(() => import('./pages/SocialService'))
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'))
const TermsConditions = lazyWithRetry(() => import('./pages/TermsConditions'))
const RefundPolicy = lazyWithRetry(() => import('./pages/RefundPolicy'))
const Admin = lazyWithRetry(() => import('./pages/Admin'))
const PatientLogin = lazyWithRetry(() => import('./pages/PatientLogin'))
const PatientDashboard = lazyWithRetry(() => import('./pages/PatientDashboard'))

// Shown for a moment while a page's code downloads. Keeps some height so
// the footer doesn't jump up under the navbar.
function PageLoader() {
  return (
    <div role="status" aria-live="polite" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: '34px', height: '34px', borderRadius: '50%', border: '3px solid rgba(199,166,106,0.25)', borderTopColor: 'var(--gold, #C7A66A)', animation: 'usha-spin 0.8s linear infinite' }} />
      <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Loading…</span>
      <style>{'@keyframes usha-spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  )
}

function Layout() {
  const loc = useLocation()
  const isAdmin = loc.pathname.startsWith('/admin')
  // Patient dashboard is a standalone app screen: no website header, footer or floating buttons
  const isDashboard = loc.pathname.startsWith('/patient-dashboard')

  return (
    <>
      {!isAdmin && !isDashboard && <Navbar />}
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/specializations" element={<Specializations />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/social-service" element={<SocialService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
      </Suspense>
      {!isAdmin && !isDashboard && <Footer />}
      {!isAdmin && !isDashboard && <WhatsAppFloat />}
      {!isAdmin && !isDashboard && <CallFloat />}
    </>
  )
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}
