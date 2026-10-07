import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { getPortalSession, portalLogin } from '../lib/patientPortal'

const inp = {
  width: '100%', padding: '14px 16px', background: 'var(--white)',
  border: '1px solid rgba(15,39,68,0.18)', borderRadius: '2px',
  fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--navy-800)', outline: 'none',
}
const lbl = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--navy-800)',
  marginBottom: '8px', fontFamily: 'var(--font-body)',
}

export default function PatientLogin() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (getPortalSession()?.token) navigate('/patient-dashboard', { replace: true })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!code.trim() || password.length !== 4) {
      setError('Enter your Patient ID and the 4-digit password.')
      return
    }
    setLoading(true)
    const res = await portalLogin(code, password)
    setLoading(false)
    if (!res.ok) { setError(res.message); return }
    navigate('/patient-dashboard', { replace: true })
  }

  return (
    <div className="page-enter">
      <SEO
        title="Patient Login"
        description="Log in to your Usha Multi Speciality Dental Clinic patient dashboard to see your prescriptions, bills, reports and appointments."
        path="/patient-login"
      />
      <section className="page-hero" style={{ paddingTop: '170px', paddingBottom: '90px' }}>
        <div className="container page-hero-inner portal-login-grid">
          <div>
            <h1>Patient dashboard</h1>
            <p style={{ maxWidth: '460px', lineHeight: 1.9 }}>
              See your medicines, bills, reports and appointments from the clinic — and request your next visit.
            </p>
            <div style={{ marginTop: '28px', borderLeft: '2px solid var(--gold)', paddingLeft: '18px', maxWidth: '440px' }}>
              <p style={{ fontSize: '14px', color: 'var(--navy-800)', fontWeight: 600, margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>
                Where do I find my login?
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0, fontFamily: 'var(--font-body)' }}>
                Your Patient ID (like UMDC-P-000123) is printed on your clinic report. Your password is the last 4 digits of the mobile number you gave at the clinic.
                Can't find it? Call <a href="tel:+918987367274" style={{ color: 'var(--gold-deep)', fontWeight: 600 }}>+91 89873 67274</a>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{
            background: 'var(--white)', padding: 'clamp(24px, 4vw, 36px)', borderRadius: '2px',
            borderTop: '3px solid var(--maroon)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '420px', justifySelf: 'end',
          }}>
            <h2 style={{ fontSize: '24px', color: 'var(--navy-800)', margin: '0 0 22px', fontWeight: 600 }}>Log in</h2>

            <label htmlFor="pid" style={lbl}>Patient ID</label>
            <input
              id="pid" value={code} autoComplete="username" autoCapitalize="characters" spellCheck={false}
              onChange={e => setCode(e.target.value)} placeholder="UMDC-P-000123"
              style={{ ...inp, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            />

            <label htmlFor="ppw" style={lbl}>Password</label>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                id="ppw" value={password} type={showPw ? 'text' : 'password'} inputMode="numeric" maxLength={4}
                autoComplete="current-password"
                onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••" style={{ ...inp, paddingRight: '70px', letterSpacing: '6px' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--gold-deep)', fontSize: '12px', fontWeight: 600, padding: '6px',
              }}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '0 0 22px', fontFamily: 'var(--font-body)' }}>
              Last 4 digits of your registered mobile number
            </p>

            {error && (
              <p role="alert" style={{ background: '#fbeeee', color: '#8f2d2d', fontSize: '13px', padding: '10px 12px', borderRadius: '2px', margin: '0 0 18px', lineHeight: 1.6 }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>
      </section>

      <style>{`
        .portal-login-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; }
        @media (max-width: 860px) {
          .portal-login-grid { grid-template-columns: 1fr; gap: 32px; }
          .portal-login-grid form { justify-self: stretch !important; max-width: none !important; }
        }
      `}</style>
    </div>
  )
}
