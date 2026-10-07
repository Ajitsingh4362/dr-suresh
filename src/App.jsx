import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import CallFloat from './components/CallFloat'
import Home from './pages/Home'
import About from './pages/About'
import Specializations from './pages/Specializations'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Gallery from './pages/Gallery'
import FAQ from './pages/FAQ'
import SocialService from './pages/SocialService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import RefundPolicy from './pages/RefundPolicy'
import Admin from './pages/Admin'
import PatientLogin from './pages/PatientLogin'
import PatientDashboard from './pages/PatientDashboard'

function Layout() {
  const loc = useLocation()
  const isAdmin = loc.pathname.startsWith('/admin')
  // Patient dashboard is a standalone app screen: no website header, footer or floating buttons
  const isDashboard = loc.pathname.startsWith('/patient-dashboard')

  return (
    <>
      {!isAdmin && !isDashboard && <Navbar />}
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
