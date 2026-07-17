import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { supabase } from '../lib/supabase'

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'
const WHATSAPP = '918987367274'

// ✅ RAZORPAY KEY — apni key yahan daalo
const RAZORPAY_KEY = 'rzp_test_XXXXXXXXXXXXXXXX'

const PROGRAMS = [
  'Root Canal Treatment (RCT)',
  'Cosmetic Dentistry / Smile Makeover',
  'Dental Implants',
  'Orthodontics (Braces)',
  'Pediatric Dentistry',
  'Emergency Dental Care',
  'Teeth Cleaning & General Check-up',
  'General Consultation',
]

const OPD_TIMINGS = [
  { day: 'Monday – Wednesday', morning: '10:00 AM – 2:00 PM', evening: '4:00 PM – 7:00 PM', open: true },
  { day: 'Thursday – Friday',  morning: '10:00 AM – 2:00 PM', evening: '4:00 PM – 6:00 PM', open: true },
  { day: 'Saturday',           morning: '9:00 AM – 1:00 PM',  evening: 'Morning only',       open: true },
  { day: 'Sunday',             morning: 'Closed',              evening: 'Emergency only',     open: false },
]

export default function Contact() {
  const ref = useRef(null)
  const [form, setForm]         = useState({ name: '', phone: '', email: '', program: '', concern: '', message: '', preferred_date: '', preferred_time: '' })
  const [status, setStatus]     = useState(null)
  const [payMode, setPayMode]   = useState('clinic') // 'online' | 'clinic'
  const [rzpReady, setRzpReady] = useState(false)

  useEffect(() => {
    if (ref.current) ref.current.classList.add('page-enter')
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRzpReady(true)
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const openRazorpay = () => {
    if (!rzpReady) { alert('Payment gateway loading, please try again in a moment.'); return }
    const options = {
      key: RAZORPAY_KEY,
      amount: 50000, // ₹500 in paise — doctor se confirm karke change karna
      currency: 'INR',
      name: 'Usha Multi Speciality Dental Clinic',
      description: form.program || 'Consultation Fee',
      image: '/usha-dental-logo.png',
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: '#C7A66A' },
      handler: function (response) {
        // Payment successful — ab form submit karo
        submitForm(response.razorpay_payment_id)
      },
      modal: {
        ondismiss: () => setStatus(null),
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const submitForm = async (paymentId = null) => {
    setStatus('loading')

    // Save to Supabase — admin panel mein dikhega
    await supabase.from('appointments').insert({
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      service: form.program || null,
      message: `Concern: ${form.concern}${form.message ? '\n' + form.message : ''}`,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      status: 'pending',
    })

    // EmailJS bhi try karo (optional, fail hone pe bhi booking save rahegi)
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name:       form.name,
        phone:      form.phone,
        email:      form.email || 'Not provided',
        program:    form.program || 'Not specified',
        concern:    form.concern,
        message:    form.message || 'No additional message',
        pay_mode:   payMode === 'online' ? 'Pay Online (Razorpay)' : 'Pay at Clinic',
        payment_id: paymentId || 'N/A',
      }, EMAILJS_PUBLIC_KEY)
    } catch (_) {}

    // WhatsApp notification to admin
    const adminPhone = '918987367274'
    const waMsg = encodeURIComponent(
      `🌿 New Appointment Request\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email || 'N/A'}\nProgram: ${form.program || 'General'}\nConcern: ${form.concern}\nPayment: ${payMode === 'online' ? 'Online' : 'At Clinic'}`
    )
    window.open(`https://wa.me/${adminPhone}?text=${waMsg}`, '_blank')

    setStatus('success')
    setForm({ name: '', phone: '', email: '', program: '', concern: '', message: '', preferred_date: '', preferred_time: '' })
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.concern.trim()) {
      setStatus('error'); return
    }
    if (payMode === 'online') {
      openRazorpay()
    } else {
      submitForm()
    }
  }

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(199,166,106,0.2)', borderRadius: '2px',
    padding: '13px 16px', color: 'var(--white)',
    fontSize: '14px', fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'border-color 0.25s', boxSizing: 'border-box',
  }

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '140px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(199,166,106,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Get in Touch</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 64px)', color: 'var(--white)', fontWeight: 600, marginBottom: '20px' }}>
            Book Your Appointment
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', lineHeight: '1.85', fontWeight: 300 }}>
            Don't wait to achieve the healthy, beautiful smile you deserve — book your visit at your convenience.
          </p>
        </div>
      </section>

      {/* Main */}
      <section style={{ padding: '90px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '56px', alignItems: 'start' }}>

            {/* Left */}
            <div style={{ minWidth: 0 }}>
              <span className="section-tag">Contact Details</span>
              <div className="gold-line" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--navy-800)', marginBottom: '32px' }}>
                Usha Multi Speciality Dental Clinic
              </h2>

              {[
                { icon: '📍', title: 'Clinic Address', desc: 'Near Bhawdepur Chowk, Shiv Mandir,\nMata Vaishno Mandir Road, Bhavdepur,\nSitamarhi – 843302, Bihar' },
                { icon: '📞', title: 'Phone & WhatsApp', desc: '+91 89873 67274' },
                { icon: '✉️', title: 'Email', desc: 'info@ushamultispecialitydentalclinic.com' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid rgba(15,39,68,0.08)', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, borderRadius: '2px' }}>{item.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--charcoal)', lineHeight: '1.7', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{item.desc}</div>
                  </div>
                </div>
              ))}

              <a href={'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent("Hello, I'd like to book an appointment at Usha Multi Speciality Dental Clinic.")}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '28px', background: '#25D366', color: '#fff', padding: '13px 24px', borderRadius: '2px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(37,211,102,0.3)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49"/></svg>
                WhatsApp Us
              </a>

              {/* Map */}
              <div style={{ marginTop: '32px', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(15,39,68,0.1)', height: '220px' }}>
                <iframe
                  src="https://maps.google.com/maps?q=Usha%20Multi%20Speciality%20Dental%20Clinic%2C%20Bhavdepur%2C%20Sitamarhi%2C%20Bihar%20843302&output=embed"
                  width="100%" height="220" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" title="Usha Multi Speciality Dental Clinic Location" />
              </div>

              {/* OPD Timings */}
              <div style={{ marginTop: '40px' }}>
                <span className="section-tag">Clinic Hours</span>
                <div className="gold-line" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--navy-800)', marginBottom: '20px' }}>OPD Timings</h3>
                <div style={{ background: 'var(--navy-800)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(199,166,106,0.15)' }}>
                  {OPD_TIMINGS.map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 20px',
                      borderBottom: i < OPD_TIMINGS.length - 1 ? '1px solid rgba(199,166,106,0.08)' : 'none',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      gap: '12px',
                    }}>
                      {/* Day name */}
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', minWidth: '120px', flexShrink: 0 }}>{row.day}</span>

                      {/* Timings stacked */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{ fontSize: '12px', color: row.open ? 'rgba(255,255,255,0.85)' : 'rgba(255,100,100,0.8)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{row.morning}</span>
                        {row.evening && (
                          <span style={{ fontSize: '12px', color: row.open ? 'rgba(199,166,106,0.8)' : 'rgba(255,180,100,0.8)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{row.evening}</span>
                        )}
                      </div>

                      {/* Status dot */}
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.open ? '#4ade80' : '#f97316', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'var(--navy-800)', padding: '40px', borderRadius: '2px', border: '1px solid rgba(199,166,106,0.15)', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--gold-pale)', marginBottom: '6px' }}>Book an Appointment</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '28px' }}>We will reach out within 24 hours to confirm your appointment.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" style={inp}
                      onFocus={e => e.target.style.borderColor = 'rgba(199,166,106,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(199,166,106,0.2)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Phone / WhatsApp *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" style={inp}
                      onFocus={e => e.target.style.borderColor = 'rgba(199,166,106,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(199,166,106,0.2)'} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" style={inp}
                    onFocus={e => e.target.style.borderColor = 'rgba(199,166,106,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(199,166,106,0.2)'} />
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Treatment Interested In</label>
                  <select name="program" value={form.program} onChange={handleChange} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="" style={{ background: '#0F2744' }}>Select a treatment...</option>
                    {PROGRAMS.map(p => <option key={p} value={p} style={{ background: '#0F2744' }}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Dental Concern *</label>
                  <input name="concern" value={form.concern} onChange={handleChange} placeholder="Brief description of your dental concern" style={inp}
                    onFocus={e => e.target.style.borderColor = 'rgba(199,166,106,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(199,166,106,0.2)'} />
                </div>

                {/* Date & Time */}
                <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Preferred Date</label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={form.preferred_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ ...inp, colorScheme: 'dark', cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(199,166,106,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(199,166,106,0.2)'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Preferred Time</label>
                    <select name="preferred_time" value={form.preferred_time} onChange={handleChange} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="" style={{ background: '#0F2744' }}>Select time slot</option>
                      <optgroup label="Morning" style={{ background: '#0F2744' }}>
                        <option value="9:00 AM" style={{ background: '#0F2744' }}>9:00 AM</option>
                        <option value="10:00 AM" style={{ background: '#0F2744' }}>10:00 AM</option>
                        <option value="11:00 AM" style={{ background: '#0F2744' }}>11:00 AM</option>
                        <option value="12:00 PM" style={{ background: '#0F2744' }}>12:00 PM</option>
                      </optgroup>
                      <optgroup label="Afternoon / Evening" style={{ background: '#0F2744' }}>
                        <option value="2:00 PM" style={{ background: '#0F2744' }}>2:00 PM</option>
                        <option value="3:00 PM" style={{ background: '#0F2744' }}>3:00 PM</option>
                        <option value="4:00 PM" style={{ background: '#0F2744' }}>4:00 PM</option>
                        <option value="5:00 PM" style={{ background: '#0F2744' }}>5:00 PM</option>
                        <option value="6:00 PM" style={{ background: '#0F2744' }}>6:00 PM</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Additional Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    placeholder="Any additional context, questions, or information..." rows={4}
                    style={{ ...inp, resize: 'vertical', lineHeight: '1.7' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(199,166,106,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(199,166,106,0.2)'} />
                </div>

                {/* ── PAYMENT MODE ── */}
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Payment Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { id: 'online', icon: '💳', title: 'Pay Online', sub: 'Razorpay – UPI / Card' },
                      { id: 'clinic', icon: '🏥', title: 'Pay at Clinic', sub: 'Cash / UPI in-person' },
                    ].map(opt => (
                      <div key={opt.id} onClick={() => setPayMode(opt.id)}
                        style={{
                          padding: '14px 16px', borderRadius: '4px', cursor: 'pointer',
                          border: payMode === opt.id ? '1.5px solid var(--gold)' : '1px solid rgba(199,166,106,0.2)',
                          background: payMode === opt.id ? 'rgba(199,166,106,0.1)' : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.2s',
                        }}>
                        <div style={{ fontSize: '20px', marginBottom: '6px' }}>{opt.icon}</div>
                        <div style={{ fontSize: '13px', color: payMode === opt.id ? 'var(--gold)' : 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: '3px' }}>{opt.title}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                  {payMode === 'online' && (
                    <p style={{ fontSize: '11px', color: 'rgba(199,166,106,0.6)', marginTop: '10px', lineHeight: '1.6' }}>
                      💡 Razorpay payment window will open after you click Book Appointment.
                    </p>
                  )}
                </div>

                {status === 'success' && (
                  <div style={{ background: 'rgba(30,111,106,0.2)', border: '1px solid rgba(30,111,106,0.4)', borderRadius: '2px', padding: '18px', fontSize: '13px', color: '#7dd5d0', lineHeight: '1.7' }}>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>✅</div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>Application Received!</div>
                    <div>Our team will reach out within 24 hours to confirm your appointment.</div>
                  </div>
                )}
                {status === 'error' && (
                  <div style={{ background: 'rgba(180,60,40,0.15)', border: '1px solid rgba(180,60,40,0.3)', borderRadius: '2px', padding: '16px', fontSize: '13px', color: '#f0907a' }}>
                    ⚠️ Please fill Name, Phone, and Dental Concern — these are required.
                  </div>
                )}

                <button onClick={handleSubmit} disabled={status === 'loading'}
                  style={{
                    width: '100%', background: status === 'loading' ? 'rgba(199,166,106,0.5)' : 'var(--gold)',
                    color: 'var(--navy-800)', border: 'none', padding: '16px',
                    borderRadius: '2px', fontSize: '13px', fontWeight: 700,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)', letterSpacing: '1.5px', textTransform: 'uppercase',
                    transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                  onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.background = 'var(--gold-light)' }}
                  onMouseLeave={e => { if (status !== 'loading') e.currentTarget.style.background = 'var(--gold)' }}>
                  {status === 'loading' ? 'Processing...' : payMode === 'online' ? '📅 Book & Pay Online' : '📅 Book Appointment'}
                </button>

                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: '1.6' }}>
                  🔒 Your information is secure. We never share patient data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}