import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('popup_settings').select('*').single().then(({ data }) => setSettings(data))
  }, [])

  async function save() {
    setSaving(true)
    const { id, ...rest } = settings
    await supabase.from('popup_settings').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
    setSaving(false)
    setMsg('Saved ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  if (!settings) return <div className="admin-panel"><p className="admin-empty">Loading...</p></div>

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Popup Settings</h1>
      </div>

      <div className="admin-settings-card">
        <p className="admin-settings-desc">
          Controls the "Book Your Consultation" popup that appears when visitors first land on your website.
        </p>

        <label className="admin-checkbox admin-checkbox-lg">
          <input type="checkbox" checked={settings.enabled} onChange={e => setSettings(s => ({ ...s, enabled: e.target.checked }))} />
          Show popup to visitors
        </label>

        <div className="admin-field">
          <label>Delay before showing (seconds)</label>
          <input type="number" min="0" max="60" value={settings.delay_seconds} onChange={e => setSettings(s => ({ ...s, delay_seconds: parseInt(e.target.value) || 0 }))} />
        </div>

        <div className="admin-field">
          <label>Popup Title</label>
          <input value={settings.title} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} />
        </div>

        <div className="admin-field">
          <label>Popup Subtitle</label>
          <input value={settings.subtitle} onChange={e => setSettings(s => ({ ...s, subtitle: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {msg && <span className="admin-save-msg">{msg}</span>}
        </div>
      </div>
    </div>
  )
}
