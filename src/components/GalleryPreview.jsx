import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Home-page strip that mirrors whatever is in the Gallery — add/remove
// photos from Admin > Gallery and this section updates automatically,
// since it reads from the same `gallery` table as the Gallery page.
export default function GalleryPreview() {
  const [items, setItems] = useState([])

  useEffect(() => {
    supabase.from('gallery').select('*').eq('visible', true).order('sort_order').limit(16)
      .then(({ data }) => setItems(data || []))
  }, [])

  if (!items.length) return null

  // Render the list twice back-to-back so translateX(-50% -> 0%) loops
  // seamlessly no matter how many photos are in the gallery.
  const track = [...items, ...items]

  return (
    <section className="gallery-preview-section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag">Take A Look</span>
          <div className="gold-line center" />
          <h2 className="section-title">Inside Our Clinic</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            A glimpse of our facility, treatments, and the smiles we've helped restore at our Sitamarhi clinic.
          </p>
        </div>
      </div>

      <div className="gallery-preview-track-wrapper">
        <div className="gallery-preview-track">
          {track.map((item, i) => (
            <Link to="/gallery" key={`${item.id}-${i}`} className="gallery-preview-item">
              <img src={item.image_url} alt={item.title || 'Usha Multi Speciality Dental Clinic — Sitamarhi'} loading="lazy" />
            </Link>
          ))}
        </div>
      </div>

      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/gallery"><button className="btn-outline-dark">View Full Gallery</button></Link>
        </div>
      </div>

      <style>{`
        .gallery-preview-section { padding: 90px 0; background: var(--white); }
        .gallery-preview-track-wrapper { width: 100%; overflow: hidden; }
        .gallery-preview-track {
          display: inline-flex;
          animation: gallery-scroll-ltr 34s linear infinite;
          will-change: transform;
        }
        .gallery-preview-track-wrapper:hover .gallery-preview-track {
          animation-play-state: paused;
        }
        .gallery-preview-item {
          flex: 0 0 auto;
          width: 260px;
          height: 190px;
          margin-right: 18px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(199,166,106,0.25);
          box-shadow: 0 8px 20px rgba(15,39,68,0.08);
          display: block;
        }
        .gallery-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .gallery-preview-item:hover img { transform: scale(1.06); }
        @keyframes gallery-scroll-ltr {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @media (max-width: 600px) {
          .gallery-preview-item { width: 190px; height: 140px; margin-right: 12px; }
        }
      `}</style>
    </section>
  )
}
