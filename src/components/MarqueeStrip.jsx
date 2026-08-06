export default function MarqueeStrip({ text = 'Usha Multi Speciality Dental Clinic — Book Your Appointment Today — Call +91 89873 67274' }) {
  const group = (
    <>
      {new Array(4).fill(0).map((_, i) => (
        <span key={i} style={{
          display: 'inline-block', color: 'var(--gold-pale)', fontSize: '12px',
          letterSpacing: '1px', fontFamily: 'var(--font-body)', fontWeight: 300,
          padding: '0 32px',
        }}>
          ✦ {text}
        </span>
      ))}
    </>
  )
  return (
    <div style={{
      background: 'var(--navy-900)', borderBottom: '1px solid rgba(199,166,106,0.25)',
      overflow: 'hidden', whiteSpace: 'nowrap', padding: '7px 0',
    }}>
      <div style={{ display: 'inline-flex', animation: 'marquee-scroll 26s linear infinite' }}>
        <div style={{ display: 'inline-flex', flexShrink: 0 }}>{group}</div>
        <div style={{ display: 'inline-flex', flexShrink: 0 }}>{group}</div>
      </div>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
