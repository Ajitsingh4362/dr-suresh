import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://www.ushadental.com'
const SITE_NAME = 'Usha Multi Speciality Dental Clinic'
// Shorter brand tag used only in <title> tags — Google truncates titles past
// ~60 characters, so the full name (used everywhere else: OG tags, schema,
// footer, body copy) is too long to also append to every page title.
const SITE_NAME_SHORT = 'Usha Dental Clinic'
const DEFAULT_IMAGE = `${SITE_URL}/clinic-banner.png`

// Clinic identity — reused across every page's LocalBusiness/Dentist schema
export const CLINIC = {
  name: 'Usha Multi Speciality Dental Clinic',
  legalName: 'Usha Multi Speciality Dental Clinic',
  telephone: '+91-89873-67274',
  streetAddress: 'Near Bhawdepur Chowk, Shiv Mandir, Mata Vaishno Mandir Road, Bhavdepur',
  addressLocality: 'Sitamarhi',
  addressRegion: 'Bihar',
  postalCode: '843302',
  addressCountry: 'IN',
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  priceRange: '₹₹',
  sameAs: [],
}

/**
 * Drop this at the top of any page to control that page's <title>,
 * meta description, canonical URL, Open Graph / Twitter tags, and
 * (optionally) inject one or more JSON-LD structured-data blocks.
 *
 * jsonLd: a single schema.org object, or an array of them.
 */
export default function SEO({ title, description, path = '/', keywords, image, jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME_SHORT}` : `Best Dentist in Sitamarhi | ${SITE_NAME_SHORT}`
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`
  const desc = description || 'Usha Multi Speciality Dental Clinic — the leading dental clinic in Sitamarhi, Bihar. Root canal, dental implants, braces, cosmetic & pediatric dentistry by Dr. Suresh Kumar & Dr. Preeti Rajguru.'
  const img = image || DEFAULT_IMAGE
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* Local SEO */}
      <meta name="geo.region" content="IN-BR" />
      <meta name="geo.placename" content="Sitamarhi" />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  )
}

// Full Dentist/LocalBusiness schema — use once on the Home page.
export function dentistSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: CLINIC.name,
    image: CLINIC.image,
    url: CLINIC.url,
    telephone: CLINIC.telephone,
    priceRange: CLINIC.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.streetAddress,
      addressLocality: CLINIC.addressLocality,
      addressRegion: CLINIC.addressRegion,
      postalCode: CLINIC.postalCode,
      addressCountry: CLINIC.addressCountry,
    },
    areaServed: ['Sitamarhi', 'Bhavdepur', 'Dumra', 'Riga', 'Pupri', 'Bairgania', 'Bihar'],
    medicalSpecialty: ['Dentistry', 'Orthodontics', 'Oral Surgery', 'Pediatric Dentistry', 'Cosmetic Dentistry'],
    physician: [
      { '@type': 'Physician', name: 'Dr. Suresh Kumar', medicalSpecialty: 'Dentistry' },
      { '@type': 'Physician', name: 'Dr. Preeti Rajguru', medicalSpecialty: 'Dentistry' },
    ],
  }
}

// List of services/treatments as an OfferCatalog — use on the Specializations
// page so Google can understand the specific services offered, matching the
// standard schema.org pattern for a local business's service list.
export function servicesSchema(specs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: CLINIC.name,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Dental Services in Sitamarhi',
      itemListElement: specs.map(s => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.desc,
          areaServed: 'Sitamarhi, Bihar',
        },
      })),
    },
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function articleSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_image || DEFAULT_IMAGE,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/usha-dental-logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }
}
