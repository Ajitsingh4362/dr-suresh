import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import CallFloat from './components/CallFloat'
import Home from './pages/Home'
import About from './pages/About'
import Programs from './pages/Programs'
import Specializations from './pages/Specializations'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Gallery from './pages/Gallery'
import FAQ from './pages/FAQ'
import Admin from './pages/Admin'

function Layout() {
  const loc = useLocation()
  const isAdmin = loc.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/specializations" element={<Specializations />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppFloat />}
      {!isAdmin && <CallFloat />}
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
