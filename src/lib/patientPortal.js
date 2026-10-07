import { createClient } from '@supabase/supabase-js'
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase'

const SESSION_KEY = 'umdc_patient_portal'

// Portal password = last 4 digits of the registered mobile number.
// Used by the admin profile + PDF report so staff can tell the patient.
export function portalPassword(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  return digits.length >= 4 ? digits.slice(-4) : ''
}

export function getPortalSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

function saveSession(s) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch (_) {}
}

export function clearPortalSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch (_) {}
}

const LOGIN_ERRORS = {
  missing: 'Please enter your Patient ID and password.',
  invalid: 'Patient ID or password is incorrect. Password is the last 4 digits of the mobile number registered at the clinic.',
  locked: 'Too many wrong attempts. Please wait 15 minutes and try again, or call the clinic.',
}

export async function portalLogin(patientCode, password) {
  const { data, error } = await supabase.rpc('patient_portal_login', {
    p_patient_code: patientCode,
    p_password: password,
  })
  if (error) return { ok: false, message: 'Could not reach the clinic server. Check your internet and try again.' }
  if (!data?.ok) return { ok: false, message: LOGIN_ERRORS[data?.error] || LOGIN_ERRORS.invalid }
  saveSession({ token: data.token, name: data.name, patient_code: data.patient_code })
  return { ok: true }
}

export async function portalLogout() {
  const s = getPortalSession()
  clearPortalSession()
  if (s?.token) {
    try { await supabase.rpc('patient_portal_logout', { p_token: s.token }) } catch (_) {}
  }
}

export async function portalFetchData() {
  const s = getPortalSession()
  if (!s?.token) return { ok: false, error: 'session_expired' }
  const { data, error } = await supabase.rpc('patient_portal_data', { p_token: s.token })
  if (error) return { ok: false, error: 'network' }
  if (!data?.ok) {
    if (data?.error === 'session_expired') clearPortalSession()
    return { ok: false, error: data?.error || 'unknown' }
  }
  return data
}

const BOOK_ERRORS = {
  past_date: 'Please pick today or a future date.',
  too_many: 'You have already sent 3 requests today. The clinic will call you soon.',
  session_expired: 'Your session has expired. Please log in again.',
}

export async function portalBookAppointment({ service, message, preferred_date, preferred_time }) {
  const s = getPortalSession()
  const { data, error } = await supabase.rpc('patient_portal_book_appointment', {
    p_token: s?.token,
    p_service: service || null,
    p_message: message || null,
    p_preferred_date: preferred_date || null,
    p_preferred_time: preferred_time || null,
  })
  if (error) return { ok: false, message: 'Could not send the request. Check your internet and try again.' }
  if (!data?.ok) return { ok: false, message: BOOK_ERRORS[data?.error] || 'Could not send the request.', error: data?.error }
  return { ok: true }
}

// Opens a report file (X-ray, scan…) from the private bucket. The session
// token goes in a header that the storage policy checks, so a patient
// can only open files from their own folder.
let docClient = null
let docClientToken = null

// Returns a short-lived link to the file, or null if it can't be opened.
export async function portalDocumentUrl(doc) {
  const s = getPortalSession()
  if (!s?.token) return null
  if (!docClient || docClientToken !== s.token) {
    docClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { 'x-portal-token': s.token } },
      auth: { persistSession: false, autoRefreshToken: false, storageKey: 'umdc-portal-storage' },
    })
    docClientToken = s.token
  }
  const { data } = await docClient.storage.from('patient-documents').createSignedUrl(doc.file_url, 600)
  return data?.signedUrl || null
}

const PAY_ERRORS = {
  already_paid: 'This bill is already fully paid.',
  not_found: 'Bill not found. Please refresh the page.',
  session_expired: 'Your session has expired. Please log in again.',
}

// Asks the server for a UPI payment link for one of this patient's own
// unpaid bills. The clinic's UPI ID is never stored in the website code.
export async function portalPaymentLink(invoiceId) {
  const s = getPortalSession()
  const { data, error } = await supabase.rpc('patient_portal_payment_link', {
    p_token: s?.token,
    p_invoice_id: invoiceId,
  })
  if (error) return { ok: false, message: 'Online payment is not available right now. You can pay at the clinic.' }
  if (!data?.ok) return { ok: false, error: data?.error, message: PAY_ERRORS[data?.error] || 'Could not start the payment.' }
  return data
}
