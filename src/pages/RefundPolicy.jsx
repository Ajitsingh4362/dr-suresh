import { useEffect, useRef } from 'react'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy-800)', marginBottom: '10px', fontWeight: 600 }}>{title}</h2>
      <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.85', fontFamily: 'var(--font-body)' }}>{children}</div>
    </div>
  )
}

export default function RefundPolicy() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '160px 0 60px' }}>
        <div className="container">
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--white)', fontWeight: 600, margin: '14px 0 0' }}>Refund & Cancellation Policy</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontFamily: 'var(--font-body)' }}>Last updated: July 2026</p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '70px 0' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <Section title="1. Overview">
            <p>This policy explains how Usha Multi Speciality Dental Clinic handles cancellations, rescheduling, and refunds for appointments and treatments booked or paid for through our website or in person.</p>
          </Section>

          <Section title="2. Appointment Cancellations">
            <p>You may cancel or reschedule an appointment by contacting us on WhatsApp or phone at +91 89873 67274, at least a few hours before your scheduled time, so that the slot can be offered to another patient. Repeated no-shows without prior notice may affect future appointment priority.</p>
          </Section>

          <Section title="3. Refunds on Advance Payments">
            <p>If you have made an advance payment for a consultation or treatment and wish to cancel:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>If cancelled with reasonable prior notice and the treatment has not yet begun, the amount paid will be refunded in full to the original payment method.</li>
              <li>If cancelled with very short notice, or after a treatment sitting has already been carried out, the amount already earned for services rendered will be deducted, and only the remaining balance (if any) will be refunded.</li>
              <li>In case of a genuine medical or clinic-side rescheduling, no deduction will apply and the appointment will simply be moved to a mutually convenient date.</li>
            </ul>
          </Section>

          <Section title="4. Non-Refundable Situations">
            <p>Once a dental treatment or procedure has been fully carried out, the amount paid for that specific treatment is non-refundable, as the service has already been delivered.</p>
          </Section>

          <Section title="5. How to Request a Refund">
            <p>To request a refund, please contact us on WhatsApp or phone at +91 89873 67274, or visit the clinic directly, with your payment reference/invoice number. Our team will review your request and confirm the outcome.</p>
          </Section>

          <Section title="6. Refund Processing Time">
            <p>Approved refunds are processed back to the original mode of payment through our payment gateway partner, Razorpay, and typically reflect within 5-10 business days, depending on your bank.</p>
          </Section>

          <Section title="7. Contact Us">
            <p>
              Usha Multi Speciality Dental Clinic<br />
              Near Bhawdepur Chowk, Shiv Mandir, Mata Vaishno Mandir Road, Bhavdepur, Sitamarhi - 843302, Bihar<br />
              Phone/WhatsApp: +91 89873 67274
            </p>
          </Section>
        </div>
      </section>
    </div>
  )
}
