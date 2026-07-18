import Reveal from '../components/Reveal'

export default function SocialService() {
  return (
    <div className="page-fade">
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--navy-900), var(--navy-800))',
        padding: '160px 0 80px', color: 'var(--white)',
      }}>
        <div className="container">
          <span className="section-tag">Giving Back</span>
          <div className="gold-line" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 60px)', color: 'var(--white)', fontWeight: 600, marginBottom: '20px' }}>
            Social Service
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: '600px', lineHeight: '1.9', fontWeight: 300 }}>
            Beyond the clinic, Usha Multi Speciality Dental Clinic believes in giving back to the community of Sitamarhi through dental health awareness and outreach.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '90px 0', background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', maxWidth: '960px', margin: '0 auto' }}>
            {[
              { icon: '🦷', title: 'Free Dental Check-up Camps', desc: 'Periodic free check-up camps for underserved communities in and around Sitamarhi.' },
              { icon: '🏫', title: 'School Oral Health Awareness', desc: 'Visits to local schools to teach children proper brushing habits and the basics of oral hygiene.' },
              { icon: '🤝', title: 'Community Outreach', desc: 'Supporting local initiatives focused on health awareness and accessible dental care.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ background: 'var(--white)', borderRadius: '8px', padding: '32px 26px', textAlign: 'center', border: '1px solid rgba(199,166,106,0.2)', height: '100%' }}>
                  <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--navy-800)', marginBottom: '10px', fontWeight: 600 }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8' }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 24px', lineHeight: '1.85' }}>
              Want to know more about our community initiatives, or partner with us? Get in touch.
            </p>
            <a href="/contact"><button className="btn-primary">Contact Us</button></a>
          </div>
        </div>
      </section>
    </div>
  )
}
