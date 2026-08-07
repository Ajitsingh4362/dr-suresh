import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { generatePatientPDF, generatePatientPDFBlob } from '../../lib/generatePatientPDF'
import { generateInvoicePDF } from '../../lib/generateInvoicePDF'

const TABS = ['Overview', 'Medical History', 'Consultations', 'Billing', 'Notes', 'Documents', 'Appointments']
const TAGS = ['Root Canal', 'Orthodontics', 'Implant', 'Cosmetic', 'Pediatric', 'VIP', 'Follow-up Due']
const AVATAR_COLORS = ['#b9914f', '#1e6f6a', '#4a3d8f', '#8f3d3d', '#3d6b8f', '#6b8f3d', '#8f6b3d']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const WHATSAPP_API = 'https://dr-suresh-whatsapp.onrender.com'
// Appended to every automatic WhatsApp message sent from this app. WhatsApp
// renders *text* wrapped in single asterisks as bold, and still auto-links
// the URL inside it.
const WHATSAPP_FOOTER = '\n\n*Book your appointment on www.ushadental.com*'

// ─── Medicine Builder (quick-tap Rx, no free typing needed) ───
const DENTAL_MEDICINES = [
  'Amoxicillin', 'Amoxicillin + Clavulanate (Augmentin)', 'Metronidazole', 'Azithromycin', 'Clindamycin',
  'Ibuprofen', 'Diclofenac', 'Aceclofenac + Paracetamol', 'Paracetamol', 'Ketorolac',
  'Chlorhexidine Mouthwash', 'Betadine Mouthwash', 'Hydrogen Peroxide Rinse',
  'Pantoprazole', 'Vitamin C Tablet', 'Calcium + Vitamin D3', 'Sensodent-K Toothpaste',
  'Clove Oil (Topical)', 'Lignocaine Gel (Topical)', 'Tranexamic Acid',
]
const QUICK_DOSAGES = ['250mg', '500mg', '625mg', '650mg', '1 tab', '5ml', '10ml']
const QUICK_FREQUENCIES = [
  { label: 'OD', value: 'Once daily' },
  { label: '1-0-1 (BD)', value: 'Twice daily (1-0-1)' },
  { label: '1-1-1 (TDS)', value: 'Thrice daily (1-1-1)' },
  { label: '4x/day', value: '4 times daily' },
  { label: 'SOS', value: 'SOS (as needed)' },
  { label: 'HS (Bedtime)', value: 'Bedtime only' },
]
const QUICK_TIMINGS = ['After food', 'Before food', 'Anytime']
const QUICK_DURATIONS = ['3 days', '5 days', '7 days', '10 days', '15 days']

// ─── Quick-fill for Chief Complaint / Observations (tap instead of type) ───
const CONDITION_TEMPLATES = {
  'Root Canal': {
    complaint: 'Severe, throbbing tooth pain, worse at night; sensitivity to hot and cold.',
    observations: 'Deep caries extending to pulp; tooth tender on percussion. X-ray advised.',
  },
  Orthodontics: {
    complaint: 'Crooked / crowded teeth; concerned about bite alignment.',
    observations: 'Malocclusion noted; crowding in upper/lower arch. Orthodontic assessment recommended.',
  },
  Implant: {
    complaint: 'Missing tooth; wants a permanent replacement option.',
    observations: 'Edentulous space noted; bone support to be confirmed via X-ray/CBCT before implant planning.',
  },
  Cosmetic: {
    complaint: 'Unhappy with tooth colour/shape; wants a brighter, more even smile.',
    observations: 'Mild discolouration/staining noted; discussed whitening and veneer/bonding options.',
  },
  Pediatric: {
    complaint: 'Child complains of tooth pain; parent concerned about cavity in milk tooth.',
    observations: 'Carious lesion noted in deciduous tooth; child cooperative during examination.',
  },
}
const COMPLAINT_PHRASES = ['Tooth pain', 'Sensitivity to hot/cold', 'Swelling in gums', 'Bleeding gums', 'Bad breath', 'Broken tooth', 'Loose tooth', 'Pain while chewing']
const OBSERVATION_PHRASES = ['Visible cavity', 'Gum inflammation', 'Plaque/tartar buildup', 'Tooth mobility', 'X-ray advised', 'Referred for extraction', 'Healing well', 'No abnormality detected']

function appendPhrase(existing, phrase) {
  const trimmed = (existing || '').trim()
  if (!trimmed) return phrase
  return /[.,]$/.test(trimmed) ? `${trimmed} ${phrase}` : `${trimmed}, ${phrase}`
}

// Small tap-to-insert chip row — visually distinct from ChipGroup since these
// don't have a persistent "selected" state, just a one-off insert action.
function InsertChipRow({ options, onPick, tone = 'muted', highlightSet }) {
  const isBold = tone === 'bold'
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '14px' }}>
      {options.map(opt => {
        const isHighlighted = highlightSet && highlightSet.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            title={isHighlighted ? 'This patient is tagged with this condition' : undefined}
            style={{
              padding: isBold ? '7px 14px' : '5px 12px', borderRadius: '100px',
              border: isHighlighted ? '1px solid var(--gold)' : (isBold ? '1px solid rgba(199,166,106,0.4)' : '1px solid rgba(15,39,68,0.15)'),
              background: isHighlighted ? 'var(--gold)' : (isBold ? 'rgba(199,166,106,0.12)' : 'var(--white)'),
              color: isHighlighted ? '#fff' : (isBold ? 'var(--gold-deep)' : 'var(--text-muted)'),
              fontSize: isBold ? '11.5px' : '11px', fontFamily: 'var(--font-body)',
              fontWeight: isBold || isHighlighted ? 600 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {isBold ? `🦷 ${opt}${isHighlighted ? ' ✓' : ''}` : `+ ${opt}`}
          </button>
        )
      })}
    </div>
  )
}

function emptyMed() {
  return { name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', timing: 'After food', duration: '5 days' }
}

function medsToPrescriptionText(meds) {
  return meds
    .filter(m => m.name && m.name.trim())
    .map(m => `${m.name} ${m.dosage} — ${m.frequency}, ${m.timing}, ${m.duration}`)
    .join('\n')
}

function ChipGroup({ options, value, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const label = typeof opt === 'string' ? opt : opt.label
        const val = typeof opt === 'string' ? opt : opt.value
        const active = value === val
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(val)}
            style={{
              padding: '7px 14px', borderRadius: '100px', border: '1px solid',
              borderColor: active ? 'var(--navy-800)' : 'rgba(15,39,68,0.15)',
              background: active ? 'var(--navy-800)' : 'var(--white)',
              color: active ? 'var(--gold-pale)' : 'var(--text-muted)',
              fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function MedicineChipRow({ med, idx, onChange, onDelete, isOnly }) {
  const s = (key, val) => onChange(idx, { ...med, [key]: val })
  return (
    <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.1)', borderRadius: '4px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{idx + 1}</div>
        <input
          list="dental-medicine-list"
          value={med.name}
          onChange={e => s('name', e.target.value)}
          placeholder="Type or pick medicine name..."
          style={{ flex: 1, padding: '9px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.92rem', fontFamily: 'var(--font-body)', fontWeight: 600, outline: 'none', color: 'var(--navy-800)' }}
        />
        {!isOnly && <button type="button" onClick={() => onDelete(idx)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}>×</button>}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Dosage</label>
        <ChipGroup options={QUICK_DOSAGES} value={med.dosage} onSelect={v => s('dosage', v)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Frequency</label>
        <ChipGroup options={QUICK_FREQUENCIES} value={med.frequency} onSelect={v => s('frequency', v)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Timing</label>
        <ChipGroup options={QUICK_TIMINGS} value={med.timing} onSelect={v => s('timing', v)} />
      </div>
      <div>
        <label style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Duration</label>
        <ChipGroup options={QUICK_DURATIONS} value={med.duration} onSelect={v => s('duration', v)} />
      </div>
    </div>
  )
}

function cleanPhone(phone) {
  let p = (phone || '').replace(/[^\d]/g, '')
  if (p.length === 10) p = '91' + p
  return p
}

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function Field({ label, value, onChange, type = 'text', multiline, options }) {
  const style = { padding: '10px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', width: '100%', background: 'var(--white)', resize: 'vertical' }
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
      {options ? (
        <select value={value || ''} onChange={e => onChange(e.target.value)} style={style}>
          <option value="">Select...</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} style={style} />
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} style={style} />
      )}
    </div>
  )
}

export default function AdminPatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'new'
  const [activeTab, setActiveTab] = useState('Overview')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showPdfDropdown, setShowPdfDropdown] = useState(false)

  async function downloadPDF() {
    setPdfLoading(true)
    setShowPdfDropdown(false)
    try {
      await generatePatientPDF({ patient, medical, consultations })
    } catch(e) {
      console.error(e)
    }
    setPdfLoading(false)
  }

  async function shareOnWhatsApp() {
    setPdfLoading(true)
    setShowPdfDropdown(false)
    try {
      // Pehle PDF download karo
      await generatePatientPDF({ patient, medical, consultations })
      // Phir WhatsApp kholo with message
      const phone = (patient.phone || '').replace(/[^\d]/g, '')
      const msg = encodeURIComponent(
        `Dear ${patient.name},\n\nYour health report from Usha Multi Speciality Dental Clinic has been downloaded on your device.\n\nPlease find it in your Downloads folder and attach it here if needed.\n\nFor appointments: ushamultispecialitydentalclinic.com\n\n— Dr. Suresh Kumar, Usha Multi Speciality Dental Clinic`
      )
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
      }, 800)
    } catch(e) {
      console.error(e)
    }
    setPdfLoading(false)
  }

  async function printPDF() {
    setPdfLoading(true)
    setShowPdfDropdown(false)
    try {
      await generatePatientPDF({ patient, medical, consultations, autoPrint: true })
    } catch(e) {
      console.error(e)
    }
    setPdfLoading(false)
  }

  // Auto-fill from appointment data (query params)
  const prefill = isNew ? Object.fromEntries(new URLSearchParams(location.search)) : {}

  // Patient basic info
  const [patient, setPatient] = useState({
    name: prefill.name || '', phone: prefill.phone || '', email: prefill.email || '',
    age: '', date_of_birth: '', gender: '', blood_group: '', address: '', occupation: '',
    referred_by: '', emergency_contact_name: '', emergency_contact_phone: '',
    avatar_color: '#b9914f', tags: prefill.service ? [prefill.service].filter(s => TAGS.includes(s)) : [], status: 'active'
  })

  // Medical history — pre-fill chief complaint from appointment message
  const [medical, setMedical] = useState({
    chief_complaint: prefill.message || '', past_medical_history: '', family_history: '',
    allergies: '', current_medications: '', lifestyle_notes: '',
    diet_type: '', sleep_pattern: '', stress_level: ''
  })
  const [medicalId, setMedicalId] = useState(null)

  // Consultations
  const [consultations, setConsultations] = useState([])
  const [showConsultForm, setShowConsultForm] = useState(false)
  const [newConsult, setNewConsult] = useState({ date: new Date().toISOString().split('T')[0], chief_complaint: '', observations: '', prescription: '', follow_up_date: '', follow_up_notes: '', consultation_type: 'in-person', medicines: [emptyMed()], sendWhatsApp: true })
  function updateNewConsultMed(idx, med) {
    setNewConsult(c => ({ ...c, medicines: c.medicines.map((m, i) => i === idx ? med : m) }))
  }
  function addNewConsultMed() {
    setNewConsult(c => ({ ...c, medicines: [...c.medicines, emptyMed()] }))
  }
  function removeNewConsultMed(idx) {
    setNewConsult(c => c.medicines.length === 1 ? c : ({ ...c, medicines: c.medicines.filter((_, i) => i !== idx) }))
  }
  // Quick-fill Chief Complaint + Observations from a condition template — fills
  // if empty, appends on a new line if the compounder already typed something,
  // so a stray tap never wipes out real notes.
  function applyConditionTemplate(condition) {
    const t = CONDITION_TEMPLATES[condition]
    if (!t) return
    setNewConsult(c => ({
      ...c,
      chief_complaint: c.chief_complaint?.trim() ? `${c.chief_complaint}\n${t.complaint}` : t.complaint,
      observations: c.observations?.trim() ? `${c.observations}\n${t.observations}` : t.observations,
    }))
  }

  // Billing
  const [invoices, setInvoices] = useState([])
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(null)
  const blankInvoice = () => ({
    date: new Date().toISOString().split('T')[0],
    items: [{ description: '', amount: '' }],
    paid_amount: '',
    status: 'unpaid',
    notes: '',
    sendWhatsApp: true,
  })
  const [newInvoice, setNewInvoice] = useState(blankInvoice())

  // Quick Appointment Fee (Overview tab)
  const [appointmentFee, setAppointmentFee] = useState('')

  // Template picker
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templateSearch, setTemplateSearch] = useState('')

  async function loadTemplates() {
    const { data } = await supabase.from('prescription_templates').select('*').order('use_count', { ascending: false })
    setTemplates(data || [])
    setShowTemplatePicker(true)
  }

  async function applyTemplate(t) {
    const meds = Array.isArray(t.medicines) ? t.medicines : JSON.parse(t.medicines || '[]')
    const prescription = meds.map(m =>
      `${m.name} ${m.dosage} — ${m.frequency}, ${m.timing}, ${m.duration}${m.notes ? ` (${m.notes})` : ''}`
    ).join('\n')

    const notes = t.instructions ? `Instructions: ${t.instructions}` : ''

    setNewConsult(prev => ({
      ...prev,
      prescription: prescription,
      medicines: meds.length ? meds.map(m => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, timing: m.timing, duration: m.duration })) : prev.medicines,
      follow_up_notes: t.follow_up_duration ? `Follow-up recommended in ${t.follow_up_duration}` : prev.follow_up_notes,
      observations: notes || prev.observations,
    }))

    // Increment use count
    await supabase.from('prescription_templates').update({ use_count: (t.use_count || 0) + 1 }).eq('id', t.id)

    setShowTemplatePicker(false)
    setTemplateSearch('')
    setShowConsultForm(true)
  }

  const filteredTemplates = templates.filter(t =>
    !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    (t.condition_tags || []).some(tag => tag.toLowerCase().includes(templateSearch.toLowerCase()))
  )

  // Notes
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState('general')

  // Documents
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)

  // Appointments
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    if (!isNew) fetchAll()
  }, [id])

  async function fetchAll() {
    const [{ data: p }, { data: m }, { data: c }, { data: n }, { data: d }, { data: a }, { data: inv }] = await Promise.all([
      supabase.from('patients').select('*').eq('id', id).single(),
      supabase.from('patient_medical_history').select('*').eq('patient_id', id).single(),
      supabase.from('patient_consultations').select('*').eq('patient_id', id).order('date', { ascending: false }),
      supabase.from('patient_notes').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
      supabase.from('patient_documents').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
      supabase.from('patient_invoices').select('*').eq('patient_id', id).order('date', { ascending: false }),
    ])
    if (p) setPatient({ ...patient, ...p })
    if (m) { setMedical({ ...medical, ...m }); setMedicalId(m.id) }
    setConsultations(c || [])
    setNotes(n || [])
    setDocs(d || [])
    setAppointments(a || [])
    setInvoices(inv || [])
    setLoading(false)
  }

  function setP(key, val) { setPatient(p => ({ ...p, [key]: val })) }

  function calcAge(dobStr) {
    if (!dobStr) return ''
    const dob = new Date(dobStr)
    if (isNaN(dob)) return ''
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age >= 0 ? age : ''
  }

  function setDob(val) {
    setPatient(p => ({ ...p, date_of_birth: val, age: val ? calcAge(val) : p.age }))
  }
  function setM(key, val) { setMedical(m => ({ ...m, [key]: val })) }

  async function savePatient() {
    if (!patient.name || !patient.phone) { setMsg('Name and phone required'); return }
    setSaving(true)
    let patientId = id

    if (isNew) {
      const { data, error } = await supabase.from('patients').insert({ ...patient, age: patient.age ? parseInt(patient.age) : null, date_of_birth: patient.date_of_birth || null }).select().single()
      if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
      patientId = data.id
      navigate(`/admin/patients/${patientId}`, { replace: true })

      // Welcome message
      if (patient.phone) {
        const welcomeMsg = `Hi ${patient.name}, welcome to Usha Multi Speciality Dental Clinic! Your patient record has been created. We look forward to taking care of your dental health. \ud83e\uddf7${WHATSAPP_FOOTER}`
        const phoneToSend = cleanPhone(patient.phone)
        fetch(`${WHATSAPP_API}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: phoneToSend, message: welcomeMsg }),
        })
          .then(res => res.json())
          .then(data => {
            if (!data.ok) {
              console.error('Welcome WhatsApp message failed:', data.error)
              alert('Patient saved, but the welcome WhatsApp message failed:\n\n' + data.error)
            } else {
              console.log('Welcome WhatsApp message sent to', phoneToSend)
            }
          })
          .catch(err => {
            console.error('Welcome WhatsApp message request failed:', err)
            alert('Patient saved, but the welcome WhatsApp request itself failed:\n\n' + err.message)
          })
      } else {
        console.warn('No phone number on new patient — welcome message skipped.')
      }
    } else {
      const { error } = await supabase.from('patients').update({ ...patient, age: patient.age ? parseInt(patient.age) : null, date_of_birth: patient.date_of_birth || null }).eq('id', id)
      if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
    }

    // Save medical history
    if (medicalId) {
      const { error } = await supabase.from('patient_medical_history').update(medical).eq('id', medicalId)
      if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('patient_medical_history').insert({ ...medical, patient_id: patientId }).select().single()
      if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
      if (data) setMedicalId(data.id)
    }

    // Appointment fee (optional) — creates a paid invoice, feeds Billing + Analytics
    const feeAmt = parseFloat(appointmentFee)
    if (feeAmt > 0) {
      const invoiceNumber = 'UMDC-INV-' + Date.now().toString().slice(-8)
      const feeDate = new Date().toISOString().split('T')[0]
      const { error: feeErr } = await supabase.from('patient_invoices').insert({
        patient_id: patientId,
        invoice_number: invoiceNumber,
        date: feeDate,
        items: [{ description: 'Appointment Fee', amount: feeAmt }],
        total_amount: feeAmt,
        paid_amount: feeAmt,
        status: 'paid',
        notes: null,
      })
      if (feeErr) {
        alert('Patient saved, but the appointment fee could not be recorded:\n\n' + feeErr.message)
      } else {
        if (patient.phone) {
          const msgText = buildInvoiceWhatsAppMessage({ invoice_number: invoiceNumber, date: feeDate, items: [{ description: 'Appointment Fee', amount: feeAmt }], total_amount: feeAmt, paid_amount: feeAmt })
          sendWhatsApp(cleanPhone(patient.phone), msgText).then(ok => {
            if (!ok) alert('Appointment fee saved, but the WhatsApp receipt could not be sent.')
          })
        }
        setAppointmentFee('')
        fetchAll()
      }
    }

    setSaving(false)
    setMsg('Saved ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function sendWhatsApp(number, message) {
    try {
      const res = await fetch(`${WHATSAPP_API}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, message }),
      })
      const data = await res.json()
      if (!data.ok) console.error('WhatsApp message failed:', data.error)
      return data.ok
    } catch (err) {
      console.error('WhatsApp request failed:', err)
      return false
    }
  }

  function buildPrescriptionWhatsAppMessage(consult, prescriptionText) {
    const lines = [`Hi ${patient.name}, here is your prescription from Usha Multi Speciality Dental Clinic 🦷`]
    if (consult.chief_complaint) lines.push(`\n📝 Reason: ${consult.chief_complaint}`)
    lines.push(`\n💊 Prescription:\n${prescriptionText}`)
    if (consult.follow_up_date) lines.push(`\n📅 Follow-up: ${fmtDate(consult.follow_up_date)}${consult.follow_up_notes ? ` — ${consult.follow_up_notes}` : ''}`)
    lines.push(`\nPlease follow the dosage exactly as prescribed. Call us if you have any questions. Take care! 🙏`)
    return lines.join('\n') + WHATSAPP_FOOTER
  }

  async function addConsultation() {
    if (!newConsult.chief_complaint) return
    const { medicines, sendWhatsApp: shouldSendWhatsApp, ...rest } = newConsult
    const builtPrescription = medsToPrescriptionText(medicines || [])
    const payload = {
      ...rest,
      prescription: builtPrescription || rest.prescription,
      patient_id: id,
      date: newConsult.date || new Date().toISOString().split('T')[0],
      follow_up_date: newConsult.follow_up_date || null,
    }
    const { error } = await supabase.from('patient_consultations').insert(payload)
    if (error) {
      alert('Could not save consultation: ' + error.message)
      return
    }

    // Auto-send the prescription on WhatsApp the moment medicines are added
    const finalPrescription = builtPrescription || rest.prescription
    if (shouldSendWhatsApp && finalPrescription && patient.phone) {
      const phoneToSend = cleanPhone(patient.phone)
      const msgText = buildPrescriptionWhatsAppMessage(payload, finalPrescription)
      sendWhatsApp(phoneToSend, msgText).then(ok => {
        if (!ok) alert('Consultation saved, but the WhatsApp prescription message could not be sent. You can resend it manually from WhatsApp.')
      })
    }

    setNewConsult({ date: new Date().toISOString().split('T')[0], chief_complaint: '', observations: '', prescription: '', follow_up_date: '', follow_up_notes: '', consultation_type: 'in-person', medicines: [emptyMed()], sendWhatsApp: true })
    setShowConsultForm(false)
    fetchAll()
  }

  async function deleteConsultation(cid) {
    if (!confirm('Delete this consultation record?')) return
    const { error } = await supabase.from('patient_consultations').delete().eq('id', cid)
    if (error) { alert('Could not delete: ' + error.message); return }
    fetchAll()
  }

  // ─── Billing ─────────────────────────────────────
  function addInvoiceItemRow() {
    setNewInvoice(inv => ({ ...inv, items: [...inv.items, { description: '', amount: '' }] }))
  }
  function removeInvoiceItemRow(idx) {
    setNewInvoice(inv => ({ ...inv, items: inv.items.filter((_, i) => i !== idx) }))
  }
  function setInvoiceItem(idx, key, val) {
    setNewInvoice(inv => ({ ...inv, items: inv.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) }))
  }
  function invoiceItemsTotal(items) {
    return (items || []).reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
  }

  function buildInvoiceWhatsAppMessage(inv) {
    const due = Math.max(inv.total_amount - inv.paid_amount, 0)
    const lines = [`Hi ${patient.name}, here is your invoice from Usha Multi Speciality Dental Clinic 🦷`]
    lines.push(`\n🧾 Invoice: ${inv.invoice_number}`)
    lines.push(`📅 Date: ${fmtDate(inv.date)}`)
    lines.push(`\nItems:`)
    inv.items.forEach(it => lines.push(`• ${it.description} — ₹${Number(it.amount).toLocaleString('en-IN')}`))
    lines.push(`\nTotal: ₹${inv.total_amount.toLocaleString('en-IN')}`)
    lines.push(`Paid: ₹${inv.paid_amount.toLocaleString('en-IN')}`)
    if (due > 0) {
      lines.push(`Due: ₹${due.toLocaleString('en-IN')}`)
      lines.push(`\nYou can pay the balance at your convenience or during your next visit. 🙏`)
    } else {
      lines.push(`\nThank you for your payment! 🙏`)
    }
    return lines.join('\n') + WHATSAPP_FOOTER
  }

  async function addInvoice() {
    const items = (newInvoice.items || []).filter(it => it.description && it.amount !== '')
    if (items.length === 0) { alert('Add at least one item with description and amount.'); return }
    const total = invoiceItemsTotal(items)
    const paid = parseFloat(newInvoice.paid_amount) || 0
    const status = paid <= 0 ? 'unpaid' : (paid >= total ? 'paid' : 'partial')
    const invoiceNumber = 'UMDC-INV-' + Date.now().toString().slice(-8)
    const invoiceDate = newInvoice.date || new Date().toISOString().split('T')[0]

    const payload = {
      patient_id: id,
      invoice_number: invoiceNumber,
      date: invoiceDate,
      items,
      total_amount: total,
      paid_amount: paid,
      status,
      notes: newInvoice.notes || null,
    }
    const { error } = await supabase.from('patient_invoices').insert(payload)
    if (error) { alert('Could not save invoice: ' + error.message); return }

    // Auto-send the invoice on WhatsApp the moment it's saved
    if (newInvoice.sendWhatsApp && patient.phone) {
      const phoneToSend = cleanPhone(patient.phone)
      const msgText = buildInvoiceWhatsAppMessage({ invoice_number: invoiceNumber, date: invoiceDate, items, total_amount: total, paid_amount: paid })
      sendWhatsApp(phoneToSend, msgText).then(ok => {
        if (!ok) alert('Invoice saved, but the WhatsApp message could not be sent. You can share the PDF manually from the invoice card.')
      })
    }

    setNewInvoice(blankInvoice())
    setShowInvoiceForm(false)
    fetchAll()
  }

  async function recordPayment(inv) {
    const due = Number(inv.total_amount) - Number(inv.paid_amount)
    const amt = prompt(`Record payment for ${inv.invoice_number}\nBalance due: ₹${due}`, due)
    if (amt === null) return
    const paidNow = parseFloat(amt)
    if (isNaN(paidNow) || paidNow <= 0) return
    const newPaid = Math.min(Number(inv.paid_amount) + paidNow, Number(inv.total_amount))
    const status = newPaid >= Number(inv.total_amount) ? 'paid' : 'partial'
    const { error } = await supabase.from('patient_invoices').update({ paid_amount: newPaid, status }).eq('id', inv.id)
    if (error) { alert('Could not update payment: ' + error.message); return }
    fetchAll()
  }

  async function deleteInvoice(invId) {
    if (!confirm('Delete this invoice?')) return
    const { error } = await supabase.from('patient_invoices').delete().eq('id', invId)
    if (error) { alert('Could not delete: ' + error.message); return }
    fetchAll()
  }

  async function downloadInvoice(inv) {
    setInvoicePdfLoading(inv.id)
    try {
      await generateInvoicePDF({ patient, invoice: inv })
    } catch (e) {
      alert('Could not generate invoice PDF: ' + e.message)
    }
    setInvoicePdfLoading(null)
  }

  async function addNote() {
    if (!newNote.trim()) return
    const { error } = await supabase.from('patient_notes').insert({ patient_id: id, note: newNote, note_type: noteType })
    if (error) { alert('Could not save note: ' + error.message); return }
    setNewNote('')
    fetchAll()
  }

  async function deleteNote(nid) {
    const { error } = await supabase.from('patient_notes').delete().eq('id', nid)
    if (error) { alert('Could not delete: ' + error.message); return }
    fetchAll()
  }

  async function uploadDocument(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `${id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('patient-documents').upload(path, file)
    if (!error) {
      // Store the storage path, not public URL
      const { error: insertErr } = await supabase.from('patient_documents').insert({
        patient_id: id,
        name: file.name,
        file_url: path, // store path only
        file_type: file.type
      })
      if (insertErr) alert('File uploaded but could not save record: ' + insertErr.message)
      fetchAll()
    } else {
      alert('Upload failed: ' + error.message)
    }
    setUploading(false)
  }

  async function viewDocument(doc) {
    // Generate signed URL valid for 1 hour
    const { data } = await supabase.storage.from('patient-documents').createSignedUrl(doc.file_url, 3600)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  async function deleteDoc(did) {
    if (!confirm('Delete this document?')) return
    const { error } = await supabase.from('patient_documents').delete().eq('id', did)
    if (error) { alert('Could not delete: ' + error.message); return }
    fetchAll()
  }

  function toggleTag(tag) {
    const tags = patient.tags || []
    setP('tags', tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  if (loading) return <div className="admin-panel"><p className="admin-empty">Loading...</p></div>

  return (
    <div className="admin-panel" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button className="admin-back-link" onClick={() => navigate('/admin/patients')}>← All Patients</button>
        <div style={{ flex: 1 }} />
        {msg && <span className="admin-save-msg">{msg}</span>}
        <button className="admin-btn-outline admin-btn-sm" onClick={savePatient} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        {!isNew && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPdfDropdown(p => !p)}
              disabled={pdfLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid rgba(15,39,68,0.15)', borderRadius: '2px', background: 'var(--white)', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', color: 'var(--navy-800)', letterSpacing: '0.5px' }}>
              {pdfLoading ? '⏳' : '📄'} {pdfLoading ? 'Generating...' : 'Report'} {!pdfLoading && '▾'}
            </button>

            {showPdfDropdown && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowPdfDropdown(false)} />
                <div style={{
                  position: 'fixed',
                  top: 'auto',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'var(--white)',
                  border: 'none',
                  borderTop: '1px solid rgba(15,39,68,0.1)',
                  borderRadius: '16px 16px 0 0',
                  boxShadow: '0 -8px 32px rgba(7,15,28,0.15)',
                  zIndex: 99,
                  overflow: 'hidden',
                  maxWidth: '480px',
                  margin: '0 auto',
                }}>
                  {/* Handle bar */}
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                    <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(15,39,68,0.15)' }} />
                  </div>

                  {/* Title */}
                  <div style={{ padding: '8px 20px 14px', borderBottom: '1px solid rgba(15,39,68,0.06)' }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy-800)' }}>Patient Report</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{patient.name}</p>
                  </div>

                  <button onClick={downloadPDF} style={{ width: '100%', padding: '16px 20px', border: 'none', borderBottom: '1px solid rgba(15,39,68,0.06)', background: 'none', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-body)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(15,39,68,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>⬇️</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--navy-800)' }}>Download PDF</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Save report to device</p>
                    </div>
                  </button>

                  <button onClick={shareOnWhatsApp} style={{ width: '100%', padding: '16px 20px', border: 'none', borderBottom: '1px solid rgba(15,39,68,0.06)', background: 'none', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-body)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💬</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--navy-800)' }}>Share on WhatsApp</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>PDF downloads + WhatsApp opens</p>
                    </div>
                  </button>

                  <button onClick={printPDF} style={{ width: '100%', padding: '16px 20px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-body)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(15,39,68,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🖨️</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--navy-800)' }}>Print</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Open print dialog</p>
                    </div>
                  </button>

                  {/* Cancel button */}
                  <div style={{ padding: '8px 16px 24px' }}>
                    <button onClick={() => setShowPdfDropdown(false)} style={{ width: '100%', padding: '13px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '8px', background: 'var(--ivory)', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {!isNew && (
          <a href={`https://wa.me/${(patient.phone || '').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="admin-btn-primary admin-btn-sm">WhatsApp</a>
        )}
      </div>

      {/* Patient Card */}
      <div style={{ background: 'var(--navy-800)', borderRadius: '2px', padding: '28px 24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar with color picker */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: patient.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '22px', fontFamily: 'var(--font-display)', border: '3px solid rgba(199,166,106,0.4)' }}>
              {initials(patient.name || 'P')}
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap', maxWidth: '80px' }}>
              {AVATAR_COLORS.map(c => (
                <div key={c} onClick={() => setP('avatar_color', c)} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, cursor: 'pointer', border: patient.avatar_color === c ? '2px solid var(--gold-pale)' : '2px solid transparent' }} />
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <input value={patient.name} onChange={e => setP('name', e.target.value)} placeholder="Patient Full Name" style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--gold-pale)', width: '100%', marginBottom: '8px' }} />
            {!isNew && patient.created_at && (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
                🗓️ First visit: {fmtDate(patient.created_at)}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TAGS.map(tag => (
                <span key={tag} onClick={() => toggleTag(tag)} style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '100px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.5px', background: (patient.tags || []).includes(tag) ? 'rgba(199,166,106,0.25)' : 'rgba(255,255,255,0.06)', color: (patient.tags || []).includes(tag) ? 'var(--gold-pale)' : 'rgba(255,255,255,0.4)', border: (patient.tags || []).includes(tag) ? '1px solid rgba(199,166,106,0.4)' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <select value={patient.status} onChange={e => setP('status', e.target.value)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(199,166,106,0.2)', borderRadius: '2px', padding: '8px 14px', color: 'var(--gold-pale)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none' }}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '24px', borderBottom: '1px solid rgba(15,39,68,0.1)', overflowX: 'auto' }}>
        {(isNew ? ['Overview', 'Medical History'] : TABS).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', padding: '10px 18px', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.5px', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === tab ? 'var(--navy-800)' : 'var(--text-muted)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'Overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Phone / WhatsApp *" value={patient.phone} onChange={v => setP('phone', v)} />
            <Field label="Email Address" value={patient.email} onChange={v => setP('email', v)} />
            <Field label="Date of Birth" value={patient.date_of_birth} onChange={setDob} type="date" />
            <Field label="Age" value={patient.age} onChange={v => setP('age', v)} type="number" />
            <Field label="Gender" value={patient.gender} onChange={v => setP('gender', v)} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} />
            <Field label="Blood Group" value={patient.blood_group} onChange={v => setP('blood_group', v)} options={BLOOD_GROUPS} />
            <Field label="Occupation" value={patient.occupation} onChange={v => setP('occupation', v)} />
            <Field label="Referred By" value={patient.referred_by} onChange={v => setP('referred_by', v)} />
          </div>
          <Field label="Address" value={patient.address} onChange={v => setP('address', v)} multiline />
          <div style={{ borderTop: '1px solid rgba(15,39,68,0.08)', paddingTop: '16px', marginTop: '8px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '12px' }}>Emergency Contact</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Contact Name" value={patient.emergency_contact_name} onChange={v => setP('emergency_contact_name', v)} />
              <Field label="Contact Phone" value={patient.emergency_contact_phone} onChange={v => setP('emergency_contact_phone', v)} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(15,39,68,0.08)', paddingTop: '16px', marginTop: '16px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '12px' }}>Appointment Fees</p>
            <div style={{ maxWidth: '260px' }}>
              <Field label="Amount (₹)" value={appointmentFee} onChange={setAppointmentFee} type="number" />
            </div>
            <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: '6px' }}>
              Saved automatically with the patient below — shows up in Billing and counts toward Analytics revenue.
            </p>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="admin-btn-primary"
              onClick={savePatient}
              disabled={saving}
              style={{ padding: '12px 32px', fontSize: '13px' }}
            >
              {saving ? 'Saving...' : (isNew ? 'Save Patient' : 'Save Changes')}
            </button>
            {msg && <span className="admin-save-msg">{msg}</span>}
          </div>
        </div>
      )}

      {/* TAB: Medical History */}
      {activeTab === 'Medical History' && (
        <div>
          <Field label="Chief Complaint / Primary Health Concern" value={medical.chief_complaint} onChange={v => setM('chief_complaint', v)} multiline />
          <Field label="Past Medical History" value={medical.past_medical_history} onChange={v => setM('past_medical_history', v)} multiline />
          <Field label="Family History" value={medical.family_history} onChange={v => setM('family_history', v)} multiline />
          <Field label="Known Allergies" value={medical.allergies} onChange={v => setM('allergies', v)} multiline />
          <Field label="Current Medications / Supplements" value={medical.current_medications} onChange={v => setM('current_medications', v)} multiline />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Diet Type" value={medical.diet_type} onChange={v => setM('diet_type', v)} options={['Vegetarian', 'Vegan', 'Non-vegetarian', 'Jain', 'Other']} />
            <Field label="Sleep Pattern" value={medical.sleep_pattern} onChange={v => setM('sleep_pattern', v)} options={['Good (7-9 hrs)', 'Poor (<6 hrs)', 'Irregular', 'Insomnia']} />
            <Field label="Stress Level" value={medical.stress_level} onChange={v => setM('stress_level', v)} options={['Low', 'Moderate', 'High', 'Very High']} />
          </div>
          <Field label="Lifestyle Notes" value={medical.lifestyle_notes} onChange={v => setM('lifestyle_notes', v)} multiline />
        </div>
      )}

      {/* TAB: Consultations */}
      {activeTab === 'Consultations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>{consultations.length} Consultation{consultations.length !== 1 ? 's' : ''}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="admin-btn-outline admin-btn-sm" onClick={loadTemplates}>💊 Apply Template</button>
              <button className="admin-btn-primary admin-btn-sm" onClick={() => setShowConsultForm(p => !p)}>+ New Consultation</button>
            </div>
          </div>

          {/* Template Picker Modal */}
          {showTemplatePicker && (
            <>
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,15,28,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }} onClick={() => setShowTemplatePicker(false)} />
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--white)', borderRadius: '8px', width: '90%', maxWidth: '560px', maxHeight: '80vh', overflow: 'hidden', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(7,15,28,0.25)' }}>
                {/* Modal header */}
                <div style={{ background: 'var(--navy-800)', padding: '18px 20px', position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold-pale)', margin: 0 }}>💊 Apply Prescription Template</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', margin: '3px 0 0' }}>Select a template to auto-fill the consultation</p>
                    </div>
                    <button onClick={() => setShowTemplatePicker(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                  </div>
                  <input
                    placeholder="Search by name or condition..."
                    value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                    autoFocus
                    style={{ width: '100%', marginTop: '12px', padding: '9px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                  />
                </div>

                {/* Template list */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {filteredTemplates.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>No templates found</p>
                  ) : filteredTemplates.map(t => {
                    const meds = Array.isArray(t.medicines) ? t.medicines : JSON.parse(t.medicines || '[]')
                    const catColors = { Homeopathy: '#1e6f6a', Psychotherapy: '#4a3d8f', Lifestyle: '#6b8f3d', Nutrition: '#8f6b3d', Integrative: '#b9914f' }
                    return (
                      <div key={t.id} onClick={() => applyTemplate(t)}
                        style={{ padding: '14px 20px', borderBottom: '1px solid rgba(15,39,68,0.06)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--navy-800)', fontFamily: 'var(--font-body)', margin: 0 }}>{t.name}</p>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0, marginLeft: '12px' }}>
                            {t.use_count > 0 && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Used {t.use_count}×</span>}
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: catColors[t.category] || '#666', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{t.category}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          {(t.condition_tags || []).map(tag => (
                            <span key={tag} style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '100px', background: 'rgba(15,39,68,0.06)', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{tag}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                          💊 {meds.map(m => `${m.name} ${m.dosage}`).join(' · ')}
                          {t.follow_up_duration ? ` · 📅 ${t.follow_up_duration}` : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {showConsultForm && (
            <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Date" value={newConsult.date} onChange={v => setNewConsult(c => ({ ...c, date: v }))} type="date" />
                <Field label="Type" value={newConsult.consultation_type} onChange={v => setNewConsult(c => ({ ...c, consultation_type: v }))} options={['in-person', 'video-call', 'phone-call', 'whatsapp']} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Quick Fill by Condition — fills both fields below</label>
                <InsertChipRow options={Object.keys(CONDITION_TEMPLATES)} onPick={applyConditionTemplate} tone="bold" highlightSet={patient.tags || []} />
              </div>
              <Field label="Chief Complaint" value={newConsult.chief_complaint} onChange={v => setNewConsult(c => ({ ...c, chief_complaint: v }))} multiline />
              <InsertChipRow options={COMPLAINT_PHRASES} onPick={p => setNewConsult(c => ({ ...c, chief_complaint: appendPhrase(c.chief_complaint, p) }))} />
              <Field label="Observations / Findings" value={newConsult.observations} onChange={v => setNewConsult(c => ({ ...c, observations: v }))} multiline />
              <InsertChipRow options={OBSERVATION_PHRASES} onPick={p => setNewConsult(c => ({ ...c, observations: appendPhrase(c.observations, p) }))} />

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>💊 Prescription — tap to build, no typing needed</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newConsult.sendWhatsApp} onChange={e => setNewConsult(c => ({ ...c, sendWhatsApp: e.target.checked }))} />
                    📲 Auto-send to patient on WhatsApp
                  </label>
                </div>
                {newConsult.medicines.map((med, idx) => (
                  <MedicineChipRow key={idx} med={med} idx={idx} onChange={updateNewConsultMed} onDelete={removeNewConsultMed} isOnly={newConsult.medicines.length === 1} />
                ))}
                <button type="button" className="admin-btn-outline admin-btn-sm" onClick={addNewConsultMed}>+ Add Another Medicine</button>
                <datalist id="dental-medicine-list">
                  {DENTAL_MEDICINES.map(m => <option key={m} value={m} />)}
                </datalist>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Follow-up Date" value={newConsult.follow_up_date} onChange={v => setNewConsult(c => ({ ...c, follow_up_date: v }))} type="date" />
                <Field label="Follow-up Notes" value={newConsult.follow_up_notes} onChange={v => setNewConsult(c => ({ ...c, follow_up_notes: v }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="admin-btn-primary admin-btn-sm" onClick={addConsultation}>Save Consultation</button>
                <button className="admin-btn-outline admin-btn-sm" onClick={() => { setShowConsultForm(false); setNewConsult({ date: new Date().toISOString().split('T')[0], chief_complaint: '', observations: '', prescription: '', follow_up_date: '', follow_up_notes: '', consultation_type: 'in-person', medicines: [emptyMed()], sendWhatsApp: true }) }}>Cancel</button>
              </div>
            </div>
          )}

          {consultations.length === 0 ? <p className="admin-empty">No consultations recorded yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {consultations.map(c => (
                <div key={c.id} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{fmtDate(c.date)}</span>
                      <span style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: 'rgba(15,39,68,0.06)', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>{c.consultation_type}</span>
                      {c.follow_up_date && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--gold-deep)', fontFamily: 'var(--font-body)' }}>Follow-up: {fmtDate(c.follow_up_date)}</span>}
                    </div>
                    <button className="admin-btn-danger admin-btn-sm" onClick={() => deleteConsultation(c.id)}>Delete</button>
                  </div>
                  {c.chief_complaint && <p style={{ fontSize: '13px', color: 'var(--navy-800)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}><strong>Complaint:</strong> {c.chief_complaint}</p>}
                  {c.observations && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}><strong>Observations:</strong> {c.observations}</p>}
                  {c.prescription && (
                    <div style={{ background: 'rgba(30,111,106,0.06)', border: '1px solid rgba(30,111,106,0.15)', borderRadius: '2px', padding: '10px 14px', marginTop: '10px' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: '#1e6f6a', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '4px' }}>Prescription</p>
                      <p style={{ fontSize: '13px', color: 'var(--charcoal)', margin: 0, fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap' }}>{c.prescription}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Billing */}
      {activeTab === 'Billing' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>{invoices.length} Invoice{invoices.length !== 1 ? 's' : ''}</p>
              {invoices.length > 0 && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>
                  Total billed: ₹{invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0).toLocaleString('en-IN')}
                  {'  \u00B7  '}
                  Due: ₹{invoices.reduce((s, i) => s + Math.max(Number(i.total_amount || 0) - Number(i.paid_amount || 0), 0), 0).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <button className="admin-btn-primary admin-btn-sm" onClick={() => setShowInvoiceForm(p => !p)}>+ New Invoice</button>
          </div>

          {/* New Invoice Form */}
          {showInvoiceForm && (
            <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Invoice Date" value={newInvoice.date} onChange={v => setNewInvoice(inv => ({ ...inv, date: v }))} type="date" />
              </div>

              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', margin: '8px 0 8px' }}>Items</label>
              {newInvoice.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    placeholder="Description (e.g. RCT - Molar)"
                    value={item.description}
                    onChange={e => setInvoiceItem(idx, 'description', e.target.value)}
                    style={{ flex: 3, padding: '9px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.85rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={e => setInvoiceItem(idx, 'amount', e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.85rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                  />
                  {newInvoice.items.length > 1 && (
                    <button onClick={() => removeInvoiceItemRow(idx)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>✕</button>
                  )}
                </div>
              ))}
              <button className="admin-btn-outline admin-btn-sm" onClick={addInvoiceItemRow} style={{ marginBottom: '16px' }}>+ Add Item</button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px', fontSize: '13px', color: 'var(--navy-800)', fontFamily: 'var(--font-body)' }}>
                <strong>Total: ₹{invoiceItemsTotal(newInvoice.items).toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Paid Now (optional)" value={newInvoice.paid_amount} onChange={v => setNewInvoice(inv => ({ ...inv, paid_amount: v }))} type="number" />
              </div>
              <Field label="Notes" value={newInvoice.notes} onChange={v => setNewInvoice(inv => ({ ...inv, notes: v }))} multiline />

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', cursor: 'pointer', marginBottom: '12px' }}>
                <input type="checkbox" checked={newInvoice.sendWhatsApp} onChange={e => setNewInvoice(inv => ({ ...inv, sendWhatsApp: e.target.checked }))} />
                📲 Auto-send this invoice to patient on WhatsApp
              </label>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="admin-btn-primary admin-btn-sm" onClick={addInvoice}>Save Invoice</button>
                <button className="admin-btn-outline admin-btn-sm" onClick={() => { setShowInvoiceForm(false); setNewInvoice(blankInvoice()) }}>Cancel</button>
              </div>
            </div>
          )}

          {invoices.length === 0 && !showInvoiceForm && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '32px 0' }}>No invoices yet.</p>
          )}

          {invoices.map(inv => {
            const due = Math.max(Number(inv.total_amount || 0) - Number(inv.paid_amount || 0), 0)
            const statusColor = inv.status === 'paid' ? '#1e8f5a' : (inv.status === 'partial' ? '#b98d1f' : '#c0392b')
            const statusBg = inv.status === 'paid' ? 'rgba(30,143,90,0.1)' : (inv.status === 'partial' ? 'rgba(185,141,31,0.1)' : 'rgba(192,57,43,0.08)')
            return (
              <div key={inv.id} style={{ border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-800)', margin: '0 0 2px', fontFamily: 'var(--font-body)' }}>{inv.invoice_number}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-body)' }}>{new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} \u00B7 {(inv.items || []).length} item{(inv.items || []).length !== 1 ? 's' : ''}</p>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', padding: '4px 10px', borderRadius: '20px', background: statusBg, color: statusColor, textTransform: 'uppercase' }}>{inv.status}</span>
                </div>

                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontFamily: 'var(--font-body)', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total: <strong style={{ color: 'var(--navy-800)' }}>₹{Number(inv.total_amount).toLocaleString('en-IN')}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Paid: <strong style={{ color: '#1e8f5a' }}>₹{Number(inv.paid_amount).toLocaleString('en-IN')}</strong></span>
                  {due > 0 && <span style={{ color: 'var(--text-muted)' }}>Due: <strong style={{ color: '#c0392b' }}>₹{due.toLocaleString('en-IN')}</strong></span>}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="admin-btn-outline admin-btn-sm" onClick={() => downloadInvoice(inv)} disabled={invoicePdfLoading === inv.id}>
                    {invoicePdfLoading === inv.id ? 'Generating...' : '\ud83d\udcc4 Download PDF'}
                  </button>
                  {due > 0 && (
                    <button className="admin-btn-primary admin-btn-sm" onClick={() => recordPayment(inv)}>✅ Record Payment</button>
                  )}
                  <button onClick={() => deleteInvoice(inv.id)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-body)', marginLeft: 'auto' }}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB: Notes */}
      {activeTab === 'Notes' && (
        <div>
          <div style={{ background: 'var(--ivory)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              {['general', 'important', 'follow-up', 'personal'].map(t => (
                <button key={t} onClick={() => setNoteType(t)} style={{ background: noteType === t ? 'var(--navy-800)' : 'var(--white)', color: noteType === t ? 'var(--gold-pale)' : 'var(--text-muted)', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '100px', padding: '4px 14px', fontSize: '11px', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>{t}</button>
              ))}
            </div>
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a quick note about this patient..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,39,68,0.12)', borderRadius: '2px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical' }} />
            <button className="admin-btn-primary admin-btn-sm" style={{ marginTop: '10px' }} onClick={addNote}>Add Note</button>
          </div>

          {notes.length === 0 ? <p className="admin-empty">No notes yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notes.map(n => (
                <div key={n.id} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: n.note_type === 'important' ? 'rgba(192,57,43,0.1)' : 'rgba(15,39,68,0.06)', color: n.note_type === 'important' ? '#c0392b' : 'var(--navy-800)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{n.note_type}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>{new Date(n.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--charcoal)', margin: 0, fontFamily: 'var(--font-body)', lineHeight: '1.6' }}>{n.note}</p>
                  </div>
                  <button className="admin-btn-danger admin-btn-sm" onClick={() => deleteNote(n.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Documents */}
      {activeTab === 'Documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy-800)', margin: 0 }}>{docs.length} Document{docs.length !== 1 ? 's' : ''}</p>
            <label className="admin-btn-primary admin-upload-label">
              {uploading ? 'Uploading...' : '+ Upload Document'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={uploadDocument} hidden />
            </label>
          </div>

          {docs.length === 0 ? <p className="admin-empty">No documents uploaded. Upload lab reports, prescriptions, or any relevant files.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {docs.map(d => (
                <div key={d.id} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '28px', textAlign: 'center' }}>{d.file_type?.includes('pdf') ? '📄' : d.file_type?.includes('image') ? '🖼️' : '📎'}</div>
                  <p style={{ fontSize: '12px', color: 'var(--navy-800)', fontFamily: 'var(--font-body)', fontWeight: 600, margin: 0, textAlign: 'center', wordBreak: 'break-all' }}>{d.name}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => viewDocument(d)} className="admin-btn-outline admin-btn-sm" style={{ flex: 1, textAlign: 'center' }}>View</button>
                    <button className="admin-btn-danger admin-btn-sm" onClick={() => deleteDoc(d.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Appointments */}
      {activeTab === 'Appointments' && (
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '16px' }}>{appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}</p>
          {appointments.length === 0 ? <p className="admin-empty">No appointments linked to this patient yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {appointments.map(a => (
                <div key={a.id} style={{ background: 'var(--white)', border: '1px solid rgba(15,39,68,0.08)', borderRadius: '2px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-800)', margin: '0 0 4px', fontFamily: 'var(--font-body)' }}>{a.service || 'General Consultation'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-body)' }}>
                      {fmtDate(a.preferred_date)} {a.preferred_time ? `· ${a.preferred_time}` : ''} · {new Date(a.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '100px', fontFamily: 'var(--font-body)', fontWeight: 600, background: a.status === 'confirmed' ? 'rgba(30,111,106,0.12)' : a.status === 'cancelled' ? 'rgba(192,57,43,0.1)' : 'rgba(199,166,106,0.15)', color: a.status === 'confirmed' ? '#1e6f6a' : a.status === 'cancelled' ? '#c0392b' : '#9c7a3c' }}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .admin-panel > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          .admin-panel > div > div[style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
