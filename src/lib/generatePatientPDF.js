export async function generatePatientPDF({ patient, medical, consultations, autoPrint = false }) {
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297, margin = 16, contentW = 210 - 16 * 2
  const FOOTER_H = 26 // reserved space for footer
  const MAX_Y = H - FOOTER_H // content must not go below this

  const NAVY  = [15, 39, 68]
  const GOLD  = [185, 145, 79]
  const TEAL  = [30, 111, 106]
  const LIGHT = [247, 244, 240]
  const WHITE = [255, 255, 255]
  const GREY  = [130, 130, 130]
  const DARK  = [35, 35, 35]

  const sf = (style, size) => { doc.setFontSize(size); doc.setFont('helvetica', style) }
  const dr = (x, y, w, h, c) => { doc.setFillColor(...c); doc.rect(x, y, w, h, 'F') }
  const dl = (x1, y1, x2, y2, c, w=0.3) => { doc.setDrawColor(...c); doc.setLineWidth(w); doc.line(x1, y1, x2, y2) }
  const wt = (str, x, y, c, style, size, opts={}) => {
    if (!str && str !== 0) return
    doc.setTextColor(...c); sf(style, size); doc.text(String(str), x, y, opts)
  }
  const wrp = (str, x, y, maxW, c, style, size, lh=5) => {
    if (!str) return y
    doc.setTextColor(...c); sf(style, size)
    const lines = doc.splitTextToSize(String(str), maxW)
    doc.text(lines, x, y)
    return y + lines.length * lh
  }

  // Check if enough space, else new page (no header on new pages)
  const checkY = (needed = 20) => {
    if (y + needed > MAX_Y) {
      doc.addPage()
      y = margin + 10
    }
  }

  // Load logo
  let logoDataUrl = null
  try {
    const response = await fetch('/usha-dental-logo.png')
    const blob = await response.blob()
    logoDataUrl = await new Promise(res => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch (_) {}

  // ─── HEADER (page 1 only) ────────────────────────────────
  dr(0, 0, W, 46, NAVY)
  dr(0, 45, W, 1.5, GOLD)

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', margin, 7, 30, 30)
  } else {
    doc.setFillColor(...GOLD)
    doc.circle(margin + 12, 23, 11, 'F')
    doc.setTextColor(...NAVY); sf('bold', 16)
    doc.text('M', margin + 12, 27.5, { align: 'center' })
  }

  const tx = margin + 36
  wt('Usha Multi Speciality Dental Clinic', tx, 14, WHITE, 'bold', 14)
  wt('Dr. Suresh Kumar', tx, 20, [220,195,140], 'normal', 8.5)
  wt('Consultant Implantologist, MDS', tx, 26, [180,160,120], 'normal', 7.5)
  wt('General Dentistry  ·  Orthodontics  ·  Implants  ·  Root Canal  ·  Pediatric Care', tx, 31.5, [160,140,100], 'normal', 7)
  wt('Sitamarhi, Bihar', tx, 37, [140,120,90], 'normal', 7)
  wt('PATIENT REPORT', W - margin, 13, [199,166,106], 'bold', 8, { align: 'right' })
  wt('Generated: ' + new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }), W - margin, 20, [160,140,100], 'normal', 7, { align:'right' })
  wt('Report ID: MMM-' + Date.now().toString().slice(-6), W - margin, 26, [140,120,90], 'normal', 7, { align:'right' })

  // ─── PATIENT INFO ─────────────────────────────────────────
  let y = 53
  dr(margin, y, contentW, 48, LIGHT)
  dr(margin, y, 3, 48, GOLD)
  wt(patient.name || 'Patient', margin + 8, y + 9, NAVY, 'bold', 14)
  if (patient.status) {
    dr(margin + 8, y + 12, 24, 6, TEAL)
    wt((patient.status).toUpperCase(), margin + 20, y + 16.5, WHITE, 'bold', 6.5, { align:'center' })
  }
  const details = [
    ['Phone', patient.phone], ['Email', patient.email],
    ['Age / Gender', [patient.age, patient.gender].filter(Boolean).join(' / ') || '—'],
    ['Blood Group', patient.blood_group || '—'],
    ['Occupation', patient.occupation || '—'],
    ['Referred By', patient.referred_by || '—'],
  ]
  const cols = [margin + 8, margin + 72, margin + 136]
  details.forEach(([lbl, val], i) => {
    const cx = cols[i % 3]
    const cy = Math.floor(i / 3) === 0 ? y + 25 : y + 34
    wt(lbl, cx, cy, GREY, 'normal', 7)
    wt(val || '—', cx, cy + 5, DARK, 'bold', 8)
  })

  // Next follow-up — most recent consultation that has one set
  const nextFollowUpC = (consultations || []).find(function(c) { return c.follow_up_date })
  const fuDate = nextFollowUpC && nextFollowUpC.follow_up_date
  dr(margin + 8, y + 39, contentW - 16, 7, TEAL)
  wt('NEXT FOLLOW-UP', margin + 12, y + 43.8, WHITE, 'bold', 6.5)
  wt(fuDate ? new Date(fuDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : 'Not scheduled', W - margin - 6, y + 43.8, WHITE, 'bold', 7.5, { align:'right' })

  y += 54

  // Section header helper
  const secHeader = (title) => {
    checkY(16)
    dr(margin, y, contentW, 8, NAVY)
    wt(title, margin + 5, y + 5.5, WHITE, 'bold', 8)
    y += 12
  }

  // ─── CHIEF COMPLAINT ─────────────────────────────────────
  if (medical && medical.chief_complaint) {
    secHeader('CHIEF COMPLAINT / PRIMARY HEALTH CONCERN')
    checkY(12)
    y = wrp(medical.chief_complaint, margin + 4, y, contentW - 8, DARK, 'normal', 9, 5.5)
    y += 6
  }

  // ─── MEDICAL HISTORY ─────────────────────────────────────
  const medFields = [
    ['Past Medical History', medical && medical.past_medical_history],
    ['Family History', medical && medical.family_history],
    ['Known Allergies', medical && medical.allergies],
    ['Current Medications / Supplements', medical && medical.current_medications],
    ['Lifestyle Notes', medical && medical.lifestyle_notes],
  ].filter(function(f) { return f[1] })

  if (medFields.length) {
    secHeader('MEDICAL HISTORY')
    medFields.forEach(function(f) {
      var lbl = f[0], val = f[1]
      checkY(16)
      wt(lbl, margin + 4, y, GOLD, 'bold', 7.5)
      y += 5
      y = wrp(val, margin + 4, y, contentW - 8, DARK, 'normal', 8.5, 5)
      y += 5
    })
  }

  // ─── LIFESTYLE ───────────────────────────────────────────
  var lifestyleItems = [
    ['Diet Type', medical && medical.diet_type],
    ['Sleep Pattern', medical && medical.sleep_pattern],
    ['Stress Level', medical && medical.stress_level],
  ].filter(function(f) { return f[1] })

  if (lifestyleItems.length) {
    checkY(20)
    dr(margin, y, contentW, 16, LIGHT)
    dr(margin, y, 3, 16, TEAL)
    lifestyleItems.forEach(function(f, i) {
      var lx = margin + 8 + i * 60
      wt(f[0], lx, y + 5, GREY, 'normal', 7)
      wt(f[1], lx, y + 11, DARK, 'bold', 8.5)
    })
    y += 22
  }

  // ─── CONSULTATIONS ───────────────────────────────────────
  if (consultations && consultations.length) {
    secHeader('CONSULTATION HISTORY  (' + consultations.length + ' records)')

    consultations.slice(0, 10).forEach(function(c, i) {
      // Estimate height needed for this consultation
      var estLines = 0
      if (c.chief_complaint) estLines += doc.splitTextToSize(c.chief_complaint, contentW - 10).length
      if (c.observations) estLines += doc.splitTextToSize('Observations: ' + c.observations, contentW - 10).length
      if (c.prescription) estLines += doc.splitTextToSize(c.prescription, contentW - 18).length + 2
      var estH = 16 + estLines * 5 + 10
      checkY(Math.min(estH, 50))

      var cardBg = i % 2 === 0 ? WHITE : LIGHT
      var accent = i === 0 ? GOLD : TEAL
      var startY = y

      var dateStr = c.date ? new Date(c.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'
      y += 3
      wt(dateStr, margin + 6, y + 3, NAVY, 'bold', 9)
      if (c.consultation_type) wt('[' + c.consultation_type + ']', margin + 46, y + 3, GREY, 'normal', 7)
      if (c.follow_up_date) wt('Follow-up: ' + new Date(c.follow_up_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }), W - margin, y + 3, TEAL, 'bold', 7.5, { align:'right' })
      y += 8

      if (c.chief_complaint) { y = wrp(c.chief_complaint, margin + 6, y, contentW - 10, DARK, 'normal', 8.5, 5); y += 3 }
      if (c.observations) { y = wrp('Observations: ' + c.observations, margin + 6, y, contentW - 10, GREY, 'italic', 8, 5); y += 3 }
      if (c.prescription) {
        var rxLines = doc.splitTextToSize(c.prescription, contentW - 18)
        var rxH = rxLines.length * 5 + 12
        dr(margin + 4, y, contentW - 8, rxH, [238,248,246])
        dr(margin + 4, y, 3, rxH, TEAL)
        wt('Rx  PRESCRIPTION', margin + 10, y + 6, TEAL, 'bold', 7.5)
        y += 10
        y = wrp(c.prescription, margin + 10, y, contentW - 18, DARK, 'normal', 8.5, 5)
        y += 4
      }

      var cardH = y - startY
      dr(margin, startY, contentW, cardH, cardBg)
      dr(margin, startY, 3, cardH, accent)

      // Re-draw text on top
      var ty = startY + 3
      wt(dateStr, margin + 6, ty + 3, NAVY, 'bold', 9)
      if (c.consultation_type) wt('[' + c.consultation_type + ']', margin + 46, ty + 3, GREY, 'normal', 7)
      if (c.follow_up_date) wt('Follow-up: ' + new Date(c.follow_up_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }), W - margin, ty + 3, TEAL, 'bold', 7.5, { align:'right' })
      ty += 8
      if (c.chief_complaint) { ty = wrp(c.chief_complaint, margin + 6, ty, contentW - 10, DARK, 'normal', 8.5, 5); ty += 3 }
      if (c.observations) { ty = wrp('Observations: ' + c.observations, margin + 6, ty, contentW - 10, GREY, 'italic', 8, 5); ty += 3 }
      if (c.prescription) {
        var rxLines2 = doc.splitTextToSize(c.prescription, contentW - 18)
        var rxH2 = rxLines2.length * 5 + 12
        dr(margin + 4, ty, contentW - 8, rxH2, [238,248,246])
        dr(margin + 4, ty, 3, rxH2, TEAL)
        wt('Rx  PRESCRIPTION', margin + 10, ty + 6, TEAL, 'bold', 7.5)
        ty += 10
        wrp(c.prescription, margin + 10, ty, contentW - 18, DARK, 'normal', 8.5, 5)
      }

      dl(margin, y, W - margin, y, [220,215,210], 0.2)
      y += 5
    })

    if (consultations.length > 10) {
      checkY(10)
      wt('... and ' + (consultations.length - 10) + ' more consultation records', margin + 4, y, GREY, 'italic', 8)
      y += 8
    }
  }

  // ─── FOOTER all pages ─────────────────────────────────────
  var totalPages = doc.getNumberOfPages()
  for (var pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg)
    dl(margin, H - 22, W - margin, H - 22, GOLD, 0.5)

    // Clickable website
    wt('Book your appointment:', margin, H - 16, GREY, 'normal', 7)
    doc.setTextColor(...TEAL); sf('bold', 7)
    doc.textWithLink('ushamultispecialitydentalclinic.com', margin + 39, H - 16, { url: 'https://ushamultispecialitydentalclinic.com' })

    wt('Usha Multi Speciality Dental Clinic  ·  Dr. Suresh Kumar', margin, H - 10, NAVY, 'bold', 7.5)
    wt('Near Bhawdepur Chowk, Shiv Mandir, Mata Vaishno Mandir Road, Bhavdepur, Sitamarhi - 843302, Bihar  ·  Confidential, for medical use only.', margin, H - 5.5, GREY, 'normal', 5.8)
    wt('Page ' + pg + ' of ' + totalPages, W - margin, H - 10, GOLD, 'bold', 7.5, { align:'right' })
  }

  var filename = 'MMM-Report-' + (patient.name || 'Patient').replace(/\s+/g, '-') + '-' + new Date().toISOString().split('T')[0] + '.pdf'

  if (autoPrint) {
    // Open in new tab for printing
    var pdfBlob = doc.output('blob')
    var url = URL.createObjectURL(pdfBlob)
    var win = window.open(url, '_blank')
    if (win) {
      win.onload = function() {
        setTimeout(function() { win.print() }, 500)
      }
    }
  } else {
    doc.save(filename)
  }
}

// Blob export for WhatsApp sharing
export async function generatePatientPDFBlob({ patient, medical, consultations }) {
  await generatePatientPDF({ patient, medical, consultations })
}
