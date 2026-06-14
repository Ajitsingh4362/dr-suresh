import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminNotes() {
  const [content, setContent] = useState('')
  const [noteId, setNoteId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    supabase.from('admin_notes').select('*').limit(1).single().then(({ data }) => {
      if (data) {
        setContent(data.content || '')
        setNoteId(data.id)
      }
      setLoading(false)
    })
    return () => clearTimeout(timerRef.current)
  }, [])

  function handleChange(val) {
    setContent(val)
    setStatus('saving')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (!noteId) return
      await supabase.from('admin_notes').update({ content: val, updated_at: new Date().toISOString() }).eq('id', noteId)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    }, 800)
  }

  if (loading) return <div className="admin-panel"><p className="admin-empty">Loading...</p></div>

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>My Notes</h1>
        <span className="admin-autosave-status">
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : ''}
        </span>
      </div>
      <p className="admin-settings-desc">Quick notes for yourself — patient reminders, ideas, to-dos. Autosaves as you type.</p>
      <textarea
        className="admin-notes-textarea"
        value={content}
        onChange={e => handleChange(e.target.value)}
        placeholder="Type your notes here..."
      />
    </div>
  )
}
