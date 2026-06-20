import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission)
  const [supported] = useState('Notification' in window && 'serviceWorker' in navigator)
  const prevCountRef = useRef(null)

  async function requestPermission() {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  function showNotification(title, body, url = '/admin/appointments') {
    if (permission !== 'granted') return
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/mind_motion_matrix_navbar_logo.png',
        badge: '/mind_motion_matrix_navbar_logo.png',
        vibrate: [200, 100, 200],
        data: { url },
        requireInteraction: true,
      })
    })
  }

  // Real-time — new appointment aane pe notification
  useEffect(() => {
    if (permission !== 'granted') return

    // Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Get initial count
    supabase.from('appointments').select('id', { count: 'exact' })
      .eq('status', 'pending')
      .then(({ count }) => { prevCountRef.current = count })

    // Watch for new appointments
    const channel = supabase.channel('notif-appointments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
      }, (payload) => {
        const appt = payload.new
        showNotification(
          '🌿 New Appointment Request',
          `${appt.name} · ${appt.service || 'General Consultation'}${appt.preferred_date ? ` · ${new Date(appt.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}`,
          '/admin/appointments'
        )
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [permission])

  return { permission, supported, requestPermission, showNotification }
}
