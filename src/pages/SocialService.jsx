import Reveal from '../components/Reveal'
import SEO from '../components/SEO'

export default function SocialService() {
  return (
    <div className="page-fade">
      <SEO
        title="Social Service & Dental Camps in Sitamarhi"
        description="Usha Multi Speciality Dental Clinic runs free dental check-up camps and oral health awareness drives across Sitamarhi, Bihar — giving back to the community we serve."
        path="/social-service"
        keywords="free dental camp Sitamarhi, dental awareness Sitamarhi, Usha Dental Clinic social service"
      />
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--ivory), var(--white) 60%, var(--teal-pale))',
        padding: '188px 0 90px', color: 'var(--navy-800)', overflow: 'hidden',
      }}>
        <div className="container">
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <span className="section-tag">Giving Back</span>
              <div className="gold-line" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 56px)', color: 'var(--navy-800)', fontWeight: 600, marginBottom: '20px' }}>
                Social Service
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: '1.9', fontWeight: 300 }}>
                Beyond the clinic, Usha Multi Speciality Dental Clinic believes in giving back to the community of Sitamarhi through dental health awareness and outreach.
              </p>
            </div>

            {/* Community-care illustration — original artwork, on-brand */}
            <div className="social-hero-visual" style={{ display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: '360px' }}>
                <circle cx="200" cy="200" r="150" fill="none" stroke="#C9A45C" strokeWidth="1" opacity="0.35" />
                <circle cx="200" cy="200" r="115" fill="none" stroke="#C9A45C" strokeWidth="1.5" opacity="0.5" />
                <circle cx="200" cy="200" r="78" fill="var(--teal-pale)" stroke="#C9A45C" strokeWidth="2" opacity="0.95" />
                <g stroke="#C9A45C" strokeWidth="1" opacity="0.4">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const a = (i * 360 / 16) * Math.PI / 180
                    return <line key={i} x1={200 + 155 * Math.cos(a)} y1={200 + 155 * Math.sin(a)} x2={200 + 175 * Math.cos(a)} y2={200 + 175 * Math.sin(a)} />
                  })}
                </g>
                <path d="M200,225 C200,205 175,190 155,205 C138,218 138,245 155,262 L200,300 L245,262 C262,245 262,218 245,205 C225,190 200,205 200,225 Z" fill="none" stroke="#0d2340" strokeWidth="2.5" />
                <g transform="translate(58,84)">
                  <circle r="30" fill="var(--white)" stroke="#C9A45C" strokeWidth="1.5" />
                  <text x="0" y="10" fontSize="26" textAnchor="middle">🦷</text>
                </g>
                <g transform="translate(345,100)">
                  <circle r="30" fill="var(--white)" stroke="#C9A45C" strokeWidth="1.5" />
                  <text x="0" y="10" fontSize="26" textAnchor="middle">🏫</text>
                </g>
                <g transform="translate(200,368)">
                  <circle r="30" fill="var(--white)" stroke="#C9A45C" strokeWidth="1.5" />
                  <text x="0" y="10" fontSize="26" textAnchor="middle">🤝</text>
                </g>
              </svg>
            </div>
          </div>
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
