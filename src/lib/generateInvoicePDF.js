export async function generateInvoicePDF({ patient, invoice, autoPrint = false }) {
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

  const NAVY  = [15, 39, 68]
  const GOLD  = [185, 145, 79]
  const TEAL  = [30, 111, 106]
  const LIGHT = [247, 244, 240]
  const WHITE = [255, 255, 255]
  const GREY  = [130, 130, 130]
  const DARK  = [35, 35, 35]
  const RED   = [180, 60, 50]
  const GREEN = [40, 130, 90]

  const sf = (style, size) => { doc.setFontSize(size); doc.setFont('helvetica', style) }
  const dr = (x, y, w, h, c) => { doc.setFillColor(...c); doc.rect(x, y, w, h, 'F') }
  const dl = (x1, y1, x2, y2, c, w = 0.3) => { doc.setDrawColor(...c); doc.setLineWidth(w); doc.line(x1, y1, x2, y2) }
  const wt = (str, x, y, c, style, size, opts = {}) => {
    if (!str && str !== 0) return
    doc.setTextColor(...c); sf(style, size); doc.text(String(str), x, y, opts)
  }
  const money = n => '\u20B9 ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })

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

  // ─── HEADER ─────────────────────────────────────
  dr(0, 0, W, 46, NAVY)
  dr(0, 45, W, 1.5, GOLD)

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', margin, 7, 30, 30)
  } else {
    doc.setFillColor(...GOLD)
    doc.circle(margin + 12, 23, 11, 'F')
    doc.setTextColor(...NAVY); sf('bold', 16)
    doc.text('U', margin + 12, 27.5, { align: 'center' })
  }

  const tx = margin + 36
  wt('Usha Multi Speciality Dental Clinic', tx, 14, WHITE, 'bold', 14)
  wt('Dr. Suresh Kumar', tx, 20, [220, 195, 140], 'normal', 8.5)
  wt('Consultant Implantologist, MDS', tx, 26, [180, 160, 120], 'normal', 7.5)
  wt('General Dentistry  \u00B7  Orthodontics  \u00B7  Implants  \u00B7  Root Canal  \u00B7  Pediatric Care', tx, 31.5, [160, 140, 100], 'normal', 7)
  wt('Sitamarhi, Bihar', tx, 37, [140, 120, 90], 'normal', 7)
  wt('INVOICE', W - margin, 13, [199, 166, 106], 'bold', 10, { align: 'right' })
  wt('Date: ' + new Date(invoice.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), W - margin, 20, [160, 140, 100], 'normal', 7, { align: 'right' })
  wt('Invoice #: ' + (invoice.invoice_number || '-'), W - margin, 26, [140, 120, 90], 'normal', 7, { align: 'right' })

  // ─── BILL TO ─────────────────────────────────────
  let y = 58
  dr(margin, y, contentW, 26, LIGHT)
  dr(margin, y, 3, 26, GOLD)
  wt('BILL TO', margin + 8, y + 8, GREY, 'bold', 7)
  wt(patient?.name || 'Patient', margin + 8, y + 16, NAVY, 'bold', 12)
  const contactLine = [patient?.phone, patient?.email].filter(Boolean).join('  \u00B7  ')
  wt(contactLine || '\u2014', margin + 8, y + 22, DARK, 'normal', 8)

  if (invoice.status) {
    const statusColor = invoice.status === 'paid' ? GREEN : (invoice.status === 'partial' ? GOLD : RED)
    const label = invoice.status.toUpperCase()
    const bw = doc.getTextWidth(label) + 14
    dr(W - margin - bw, y + 8, bw, 9, statusColor)
    wt(label, W - margin - bw / 2, y + 14.2, WHITE, 'bold', 8, { align: 'center' })
  }

  y += 38

  // ─── ITEMS TABLE ─────────────────────────────────────
  dr(margin, y, contentW, 9, NAVY)
  wt('DESCRIPTION', margin + 6, y + 6, WHITE, 'bold', 7.5)
  wt('AMOUNT', W - margin - 6, y + 6, WHITE, 'bold', 7.5, { align: 'right' })
  y += 9

  const items = invoice.items || []
  items.forEach((item, i) => {
    const rowH = 10
    if (i % 2 === 0) dr(margin, y, contentW, rowH, LIGHT)
    wt(item.description || '-', margin + 6, y + 6.8, DARK, 'normal', 9)
    wt(money(item.amount), W - margin - 6, y + 6.8, DARK, 'bold', 9, { align: 'right' })
    y += rowH
  })

  dl(margin, y, W - margin, y, [200, 195, 190], 0.4)
  y += 10

  // ─── TOTALS ─────────────────────────────────────
  const totalsX = W - margin - 70
  const totalAmount = Number(invoice.total_amount || 0)
  const paidAmount = Number(invoice.paid_amount || 0)
  const dueAmount = Math.max(totalAmount - paidAmount, 0)

  wt('Total', totalsX, y, GREY, 'normal', 9)
  wt(money(totalAmount), W - margin - 6, y, DARK, 'bold', 9, { align: 'right' })
  y += 7
  wt('Paid', totalsX, y, GREY, 'normal', 9)
  wt(money(paidAmount), W - margin - 6, y, GREEN, 'bold', 9, { align: 'right' })
  y += 9

  dr(totalsX - 6, y - 6, 70 + 6, 12, dueAmount > 0 ? [252, 240, 238] : [235, 247, 240])
  wt('Balance Due', totalsX, y + 2, DARK, 'bold', 9.5)
  wt(money(dueAmount), W - margin - 6, y + 2, dueAmount > 0 ? RED : GREEN, 'bold', 10.5, { align: 'right' })
  y += 24

  if (invoice.notes) {
    wt('NOTES', margin, y, GREY, 'bold', 7)
    y += 5
    const lines = doc.splitTextToSize(invoice.notes, contentW)
    doc.setTextColor(...DARK); sf('normal', 8.5)
    doc.text(lines, margin, y)
  }

  // ─── FOOTER ─────────────────────────────────────
  dl(margin, H - 22, W - margin, H - 22, GOLD, 0.5)
  wt('Book your appointment:', margin, H - 16, GREY, 'normal', 7)
  doc.setTextColor(...TEAL); sf('bold', 7)
  doc.textWithLink('ushamultispecialitydentalclinic.com', margin + 39, H - 16, { url: 'https://ushamultispecialitydentalclinic.com' })
  wt('Usha Multi Speciality Dental Clinic  \u00B7  Dr. Suresh Kumar', margin, H - 10, NAVY, 'bold', 7.5)
  wt('Near Bhawdepur Chowk, Shiv Mandir, Mata Vaishno Mandir Road, Bhavdepur, Sitamarhi - 843302, Bihar  \u00B7  Confidential, for medical use only.', margin, H - 5.5, GREY, 'normal', 5.8)

  const filename = 'UMDC-Invoice-' + (invoice.invoice_number || Date.now()) + '-' + (patient?.name || 'Patient').replace(/\s+/g, '-') + '.pdf'

  if (autoPrint) {
    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    const win = window.open(url, '_blank')
    if (win) {
      win.onload = function () { setTimeout(function () { win.print() }, 500) }
    }
  } else {
    doc.save(filename)
  }
}
