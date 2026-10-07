import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'drs_patient_portal_session'

function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function downloadFile(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [invoices, setInvoices] = useState([])
  const [oldStatus, setOldStatus] = useState({ is_old_patient: false, visit_count: 0, last_visit_date: null })
  const [activeTab, setActiveTab] = useState('appointments')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = getSession()
    if (!saved) {
      navigate('/patient-login')
      return
    }
    setSession(saved)
    fetchDashboard(saved.patientId)
  }, [navigate])

  async function fetchDashboard(patientId) {
    const [patientResult, consultationResult, invoiceResult, oldResult] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).maybeSingle(),
      supabase.from('patient_consultations').select('*').eq('patient_id', patientId).order('date', { ascending: false }),
      supabase.from('patient_invoices').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('patient_visit_history').select('*').eq('patient_id', patientId).maybeSingle(),
    ])

    setPatient(patientResult.data)
    setConsultations(consultationResult.data || [])
    setInvoices(invoiceResult.data || [])
    setOldStatus(oldResult.data || { is_old_patient: false, visit_count: 0, last_visit_date: null })
    setLoading(false)
  }

  async function logout() {
    localStorage.removeItem(STORAGE_KEY)
    navigate('/patient-login')
  }

  async function recordDownload(type, resourceId, resourceName) {
    if (!patient) return
    await supabase
      .from('patient_downloads')
      .insert({
        patient_id: patient.id,
        download_type: type,
        resource_id: resourceId,
        resource_name: resourceName,
      })
      .catch(() => {})
  }

  function downloadConsultation(item) {
    const summary = [
      `Dr. Suresh Clinic - Consultation Report`,
      `Patient: ${patient?.name || 'Patient'}`,
      `Patient Code: ${patient?.patient_code || '—'}`,
      `Date: ${formatDate(item.date)}`,
      `Consultation Type: ${item.consultation_type || 'Consultation'}`,
      '',
      'chief complaint:',
      item.chief_complaint || 'Not available',
      '',
      'observations:',
      item.observations || 'Not available',
      '',
      'prescription:',
      item.prescription || 'Not available',
      '',
      `Follow-up Date: ${formatDate(item.follow_up_date)}`,
    ].join('\n')

    const filename = `report_${(patient?.name || 'patient').replace(/\s+/g, '_')}_${item.id.slice(0, 6)}.txt`
    downloadFile(filename, summary)
    recordDownload('report', item.id, filename)
  }

  function downloadInvoice(item) {
    const total = item.total_amount ?? item.total ?? item.amount ?? 0
    const paid = item.paid_amount ?? item.paid ?? 0
    const balance = Number(total) - Number(paid)
    const summary = [
      `Dr. Suresh Clinic - Invoice`,
      `Patient: ${patient?.name || 'Patient'}`,
      `Invoice ID: ${item.id}`,
      `Status: ${item.status || 'Pending'}`,
      `Total Amount: ₹${Number(total).toLocaleString('en-IN')}`,
      `Paid Amount: ₹${Number(paid).toLocaleString('en-IN')}`,
      `Balance: ₹${Number(balance).toLocaleString('en-IN')}`,
      `Issue Date: ${formatDate(item.created_at || item.issue_date)}`,
    ].join('\n')

    const filename = `invoice_${(patient?.name || 'patient').replace(/\s+/g, '_')}_${(item.id || 'bill').slice(0, 6)}.txt`
    downloadFile(filename, summary)
    recordDownload('bill', item.id, filename)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '130px 16px 80px', background: 'linear-gradient(180deg, #f8f4ef 0%, #fffaf5 100%)' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', color: 'var(--navy-800)', fontSize: '1.05rem' }}>Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div style={{ minHeight: '100vh', padding: '130px 16px 80px' }}>
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--navy-800)' }}>Your patient record could not be found.</p>
          <Link to="/patient-login" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Back to login</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'appointments', label: 'Appointments' },
    { key: 'reports', label: 'Reports' },
    { key: 'bills', label: 'Bills' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8f5f1 0%, #fffdfb 100%)', padding: '130px 16px 80px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem', letterSpacing: '1.2px', textTransform: 'uppercase' }}>Welcome back</p>
            <h1 style={{ margin: '4px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{patient.name}</h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {oldStatus.is_old_patient && (
              <span style={{ background: 'rgba(31,120,72,0.12)', color: '#1e6f6a', border: '1px solid rgba(31,120,72,0.2)', borderRadius: '999px', padding: '8px 12px', fontWeight: 700, fontSize: '0.75rem' }}>
                Old Patient • {oldStatus.visit_count || 0} visit{(oldStatus.visit_count || 0) === 1 ? '' : 's'}
              </span>
            )}
            <button className="btn-primary" onClick={logout}>Logout</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Patient Code</p>
            <h3 style={{ margin: '8px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{patient.patient_code || '—'}</h3>
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Mobile</p>
            <h3 style={{ margin: '8px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{patient.phone || '—'}</h3>
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Last Visit</p>
            <h3 style={{ margin: '8px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{formatDate(oldStatus.last_visit_date)}</h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                border: '1px solid rgba(15,39,68,0.12)',
                background: activeTab === tab.key ? 'var(--navy-800)' : '#fff',
                color: activeTab === tab.key ? '#fff' : 'var(--navy-800)',
                padding: '10px 18px',
                borderRadius: '999px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'appointments' && (
          <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '18px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: 'var(--navy-800)', fontFamily: 'var(--font-display)' }}>My Appointments</h2>
              <Link to="/contact" className="btn-primary" style={{ display: 'inline-block' }}>Book New</Link>
            </div>

            {consultations.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No appointments found for this patient.</p>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {consultations.map(item => (
                  <div key={item.id} style={{ border: '1px solid rgba(15,39,68,0.08)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Consultation</p>
                        <h3 style={{ margin: '6px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{item.consultation_type || 'Visit'}</h3>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(item.date)}</div>
                    </div>
                    <p style={{ margin: '12px 0 0', color: 'var(--navy-800)', lineHeight: 1.6 }}>{item.chief_complaint || 'No complaint recorded.'}</p>
                    {item.follow_up_date && (
                      <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Follow-up: <strong>{formatDate(item.follow_up_date)}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '18px', padding: '20px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--navy-800)', fontFamily: 'var(--font-display)' }}>My Reports</h2>

            {consultations.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No reports available for this patient yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {consultations.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '12px', padding: '16px' }}>
                    <div>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Report</p>
                      <h3 style={{ margin: '6px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{item.consultation_type || 'Consultation Report'}</h3>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatDate(item.date)}</div>
                    <button className="btn-primary" onClick={() => downloadConsultation(item)}>Download</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bills' && (
          <div style={{ background: '#fff', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '18px', padding: '20px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--navy-800)', fontFamily: 'var(--font-display)' }}>My Bills</h2>

            {invoices.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No bills exist for this patient yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {invoices.map(item => {
                  const total = Number(item.total_amount ?? item.total ?? item.amount ?? 0)
                  const paid = Number(item.paid_amount ?? item.paid ?? 0)
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '12px', padding: '16px' }}>
                      <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Invoice</p>
                        <h3 style={{ margin: '6px 0 0', color: 'var(--navy-800)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{item.invoice_number || `Bill #${String(item.id).slice(0, 6)}`}</h3>
                      </div>
                      <div style={{ color: 'var(--navy-800)', fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.status || 'Pending'}</div>
                      <button className="btn-primary" onClick={() => downloadInvoice(item)}>Download</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
