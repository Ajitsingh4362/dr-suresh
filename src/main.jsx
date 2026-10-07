import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import './styles/features.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)

// PWA: service worker register karo taaki "Add to Home Screen" / app install
// kaam kare, khaas kar Admin panel ko mobile pe app jaisa use karne ke liye.
if ('serviceWorker' in navigator) {
  // If an older service worker was already controlling this page, reload
  // once when the new one takes over, so the visitor gets the latest site
  // straight away (old one served stale pages from cache).
  const hadController = !!navigator.serviceWorker.controller
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return
    reloaded = true
    window.location.reload()
  })
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => reg.update())
      .catch(() => {})
  })
}
