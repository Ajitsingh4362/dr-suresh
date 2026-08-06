import { useEffect, useRef } from 'react'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy-800)', marginBottom: '10px', fontWeight: 600 }}>{title}</h2>
      <div style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.85', fontFamily: 'var(--font-body)' }}>{children}</div>
    </div>
  )
}

export default function PrivacyPolicy() {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.classList.add('page-enter') }, [])

  return (
    <div ref={ref} style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))', padding: '160px 0 60px' }}>
        <div className="container">
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--white)', fontWeight: 600, margin: '14px 0 0' }}>Privacy Policy</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontFamily: 'var(--font-body)' }}>Last updated: July 2026</p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '70px 0' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <Section title="1. Introduction">
            <p>Usha Multi Speciality Dental Clinic ("we", "us", "our"), located in Sitamarhi, Bihar, is committed to protecting the privacy of visitors to our website and patients who use our services. This Privacy Policy explains what information we collect, how we use it, and the choices you have.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We may collect the following information when you use our website or visit our clinic:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Contact details — name, phone number, email address</li>
              <li>Appointment details — preferred service, date, time, and any message you share with us</li>
              <li>Medical and dental history shared during consultations, for the purpose of providing treatment</li>
              <li>Payment information processed through our payment gateway partner (Razorpay). We do not store your card, UPI, or bank details on our servers</li>
              <li>Basic technical information such as browser type and device, collected automatically when you visit our website</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Schedule, confirm, and manage your appointments</li>
              <li>Provide dental treatment and maintain accurate medical records</li>
              <li>Send appointment confirmations, reminders, and follow-up communication via call, SMS, or WhatsApp</li>
              <li>Process payments securely through Razorpay</li>
              <li>Respond to your queries and improve our services</li>
            </ul>
          </Section>

          <Section title="4. Sharing of Information">
            <p>We do not sell or rent your personal information. We may share limited information with trusted third parties strictly to operate our services, including our payment gateway (Razorpay), appointment and communication tools (such as WhatsApp), and secure database hosting providers. These parties are only given the information necessary to perform their function.</p>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>Your information is stored on secure, access-controlled systems. While we take reasonable measures to protect your data, no method of electronic storage or transmission is completely secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You may request to access, correct, or delete the personal information we hold about you by contacting us using the details below. Certain medical records may need to be retained for a minimum period as required by applicable healthcare regulations.</p>
          </Section>

          <Section title="7. Cookies">
            <p>Our website may use minimal cookies or similar technologies to ensure the site functions correctly. We do not use cookies for third-party advertising.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date.</p>
          </Section>

          <Section title="9. Contact Us">
            <p>For any questions about this Privacy Policy or how your information is handled, please contact us:</p>
            <p style={{ marginTop: '10px' }}>
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
