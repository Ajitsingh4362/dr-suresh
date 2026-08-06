import { useEffect, useRef } from 'react'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy-800)', marginBottom: '10px', fontWeight: 600 }}>{title}</h2>
      <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.85', fontFamily: 'var(--font-body)' }}>{children}</div>
    </div>
  )
}

export default function TermsConditions() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '160px 0 60px' }}>
        <div className="container">
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--white)', fontWeight: 600, margin: '14px 0 0' }}>Terms & Conditions</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontFamily: 'var(--font-body)' }}>Last updated: July 2026</p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '70px 0' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using the Usha Multi Speciality Dental Clinic website, or by booking an appointment or availing our services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website or services.</p>
          </Section>

          <Section title="2. Appointments & Services">
            <p>Appointments booked through our website or WhatsApp are subject to confirmation by our clinic staff. We reserve the right to reschedule appointments due to unforeseen circumstances, and will make reasonable efforts to inform you in advance.</p>
          </Section>

          <Section title="3. Accuracy of Information">
            <p>You agree to provide accurate and complete information, including medical and dental history, when booking an appointment or during consultation. Inaccurate information may affect the quality and safety of the treatment provided.</p>
          </Section>

          <Section title="4. Not a Substitute for In-Person Diagnosis">
            <p>Content on this website, including descriptions of treatments and services, is provided for general informational purposes only and does not constitute medical advice. Any dental condition should be evaluated in person by Dr. Suresh Kumar or Dr. Preeti Rajguru before treatment.</p>
          </Section>

          <Section title="5. Payments">
            <p>Where online payment is enabled, payments are processed securely through our third-party payment gateway partner, Razorpay. We do not store your card, UPI, or banking details. By making a payment, you also agree to Razorpay's applicable terms of service.</p>
          </Section>

          <Section title="6. Cancellation & Refunds">
            <p>Cancellations, rescheduling, and refunds (where applicable) are governed by our <a href="/refund-policy" style={{ color: 'var(--teal, #1e6f6a)', fontWeight: 600 }}>Refund & Cancellation Policy</a>.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>All content on this website — including text, images, and logos — is the property of Usha Multi Speciality Dental Clinic unless otherwise stated, and may not be reproduced without prior written permission.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>While we strive to provide accurate information and quality care, Usha Multi Speciality Dental Clinic shall not be liable for any indirect or incidental damages arising from the use of this website, to the extent permitted by applicable law.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms & Conditions are governed by the laws of India, and any disputes shall be subject to the jurisdiction of the courts in Sitamarhi, Bihar.</p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>We may update these Terms & Conditions from time to time. Continued use of our website or services after changes are posted constitutes acceptance of the revised terms.</p>
          </Section>

          <Section title="11. Contact Us">
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
