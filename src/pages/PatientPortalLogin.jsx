import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'drs_patient_portal_session'

function normalizePhone(value = '') {
  return (value || '').replace(/\D/g, '')
}

export default function PatientPortalLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ patientCode: '', last4: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const patientCode = form.patientCode.trim()
    const last4 = normalizePhone(form.last4).slice(-4)

    if (!patientCode || !last4) {
      setError('Please enter the patient code and the last 4 digits of the registered mobile number.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_code', patientCode)
      .maybeSingle()

    if (patientError || !data) {
      setLoading(false)
      setError('Patient code not found. Please check and try again.')
      return
    }

    const phoneDigits = normalizePhone(data.phone)
    if (!phoneDigits.endsWith(last4)) {
      setLoading(false)
      setError('The mobile number does not match this patient record.')
      return
    }

    const sessionToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`

    const sessionRow = {
      patient_id: data.id,
      session_token: sessionToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    await supabase
      .from('patient_portal_sessions')
      .insert(sessionRow)
      .catch(() => {})

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      patientId: data.id,
      patientCode: data.patient_code,
      name: data.name,
      token: sessionToken,
    }))

    setLoading(false)
    navigate('/patient-dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f7f3ee 0%, #fefaf6 100%)', padding: '130px 16px 80px' }}>
      <div className="container" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '18px', boxShadow: '0 20px 50px rgba(31,39,58,0.08)', padding: '36px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <img src="/usha-dental-logo.png" alt="Usha Multi Speciality Dental Clinic" style={{ height: '82px', width: 'auto', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>Patient Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--navy-800)', fontWeight: 600, fontSize: '0.88rem' }}>Patient Code</label>
              <input
                value={form.patientCode}
                onChange={e => setForm({ ...form, patientCode: e.target.value })}
                placeholder="e.g. UMDC-P-000123"
                style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '10px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--navy-800)', fontWeight: 600, fontSize: '0.88rem' }}>Last 4 digits of registered mobile</label>
              <input
                value={form.last4}
                onChange={e => setForm({ ...form, last4: e.target.value })}
                maxLength={4}
                inputMode="numeric"
                placeholder="1234"
                style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '10px', fontSize: '1rem' }}
              />
            </div>

            {error && (
              <div style={{ marginBottom: '16px', background: 'rgba(185,41,41,0.08)', color: '#a33434', border: '1px solid rgba(185,41,41,0.12)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 18px', fontSize: '0.95rem', fontWeight: 700 }}>
              {loading ? 'Checking...' : 'Login to Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Need help? <Link to="/contact" style={{ color: 'var(--navy-800)', fontWeight: 600 }}>Contact clinic</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
