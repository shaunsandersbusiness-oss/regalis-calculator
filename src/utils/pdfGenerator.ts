import { QuoteResult } from '../utils/calculatorLogic_v2';
import { Market, Tier, TIERS } from '../data/pricing_v2';
import { jsPDF } from 'jspdf';

export async function generatePDF(quote: QuoteResult, market: Market, tier: Tier) {
  // ──────────────────────────────────────────────
  // STEP A: Check that jsPDF loaded
  // ──────────────────────────────────────────────
  if (!jsPDF) {
    alert('PDF library failed to load. Please refresh the page and try again.');
    return;
  }

  // ──────────────────────────────────────────────
  // STEP B: Prepare Data
  // ──────────────────────────────────────────────
  const marketLabel = market === 'NJ' ? 'NJ & Boroughs' : 'Manhattan';
  const tierLabel = TIERS.find(t => t.value === tier)?.label || '';
  
  const services = [
    ...quote.items.map(item => ({
      name: item.name,
      price: item.price,
      isFree: item.isFree
    })),
    ...quote.complimentaryItems.map(item => ({
      name: item.replace('(Included)', ''),
      price: 0,
      isFree: true
    }))
  ];

  const discount = quote.discountName ? {
    name: quote.discountName,
    percent: (quote.discountPercent * 100).toFixed(0),
    savings: quote.discountAmount
  } : null;

  const total = quote.finalTotal;
  const alacarte = quote.alacarteTotal;

  // ──────────────────────────────────────────────
  // STEP C: Create the PDF
  // ──────────────────────────────────────────────
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'   // 215.9mm x 279.4mm
    });

    const pageW = doc.internal.pageSize.getWidth();   // ~215.9
    const pageH = doc.internal.pageSize.getHeight();  // ~279.4
    const marginL = 25;
    const marginR = 25;
    const contentW = pageW - marginL - marginR;
    let y = 0; // current vertical position

    // ── HEADER BAND (dark background) ──
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageW, 32, 'F');

    // Company name in header (since we can't reliably load the logo image)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(201, 168, 76); // gold
    doc.text('REGALIS REALTY MEDIA', pageW / 2, 15, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('regalisrealtymedia.com', pageW / 2, 22, { align: 'center' });

    y = 32;

    // ── GOLD DIVIDER ──
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.3);
    doc.line(marginL, y + 4, pageW - marginR, y + 4);
    y += 12;

    // ── QUOTE TITLE + DATE ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('PRICE QUOTE', marginL, y);

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(today, pageW - marginR, y, { align: 'right' });
    y += 7;

    // ── MARKET + SQFT ──
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Market: ' + marketLabel, marginL, y);
    y += 5;
    doc.text('Property Size: ' + tierLabel, marginL, y);
    y += 10;

    // ── GOLD DIVIDER ──
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.2);
    doc.line(marginL, y, pageW - marginR, y);
    y += 10;

    // ── SELECTED SERVICES HEADER ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('SELECTED SERVICES', marginL, y);
    y += 8;

    // ── SERVICE LIST ──
    doc.setFontSize(11);
    services.forEach(function(s) {
      // Check if we need a new page
      if (y > pageH - 50) {
        doc.addPage();
        y = 25;
      }

      // Service name
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(s.name, marginL, y);

      // Price (right aligned)
      if (s.isFree) {
        doc.setTextColor(201, 168, 76); // gold for FREE
        doc.text('FREE', pageW - marginR, y, { align: 'right' });
      } else {
        doc.setTextColor(40, 40, 40);
        doc.text('$' + s.price, pageW - marginR, y, { align: 'right' });
      }

      y += 4;

      // Light gray separator line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.1);
      doc.line(marginL, y, pageW - marginR, y);
      y += 7;
    });

    // ── DISCOUNT ROW (if applicable) ──
    if (discount && discount.name) {
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(201, 168, 76);
      doc.text('Discount: ' + discount.name, marginL, y);
      doc.text('-$' + discount.savings, pageW - marginR, y, { align: 'right' });
      y += 8;
    }

    // ── TOTALS SECTION ──
    // Heavy separator
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.4);
    doc.line(marginL, y, pageW - marginR, y);
    y += 8;

    // A la carte total (strikethrough)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('A la carte total', marginL, y);
    const alacarteText = '$' + alacarte;
    const alacarteX = pageW - marginR;
    doc.text(alacarteText, alacarteX, y, { align: 'right' });
    // Strikethrough line
    const alacarteWidth = doc.getTextWidth(alacarteText);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(alacarteX - alacarteWidth, y - 1, alacarteX, y - 1);
    y += 10;

    // TOTAL (large, bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Total', marginL, y);
    doc.setFontSize(20);
    doc.text('$' + total, pageW - marginR, y, { align: 'right' });

    if (discount) {
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(201, 168, 76);
      doc.text('You save $' + discount.savings + ' (' + discount.percent + '%)', pageW - marginR, y, { align: 'right' });
    }

    y += 14;

    // ── GOLD DIVIDER ──
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.2);
    doc.line(marginL, y, pageW - marginR, y);
    y += 10;

    // ── PRICING NOTE ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const note = 'This quote is an estimate based on selected services and property size. Final pricing confirmed upon booking. The discount applies to the entire order total. All prices round to the nearest $5.';
    const noteLines = doc.splitTextToSize(note, contentW);
    doc.text(noteLines, marginL, y);
    y += noteLines.length * 4 + 8;

    // ── GOLD DIVIDER ──
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.2);
    doc.line(marginL, y, pageW - marginR, y);
    y += 10;

    // ── CONTACT / CTA ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Ready to Book?', pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('regalisrealtymedia.com/calendar', pageW / 2, y, { align: 'center' });
    y += 5;
    doc.text('(917) 683-8034  ·  contact@regalisrealtymedia.com', pageW / 2, y, { align: 'center' });

    // ── FOOTER BAND ──
    doc.setFillColor(10, 10, 10);
    doc.rect(0, pageH - 14, pageW, 14, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Regalis Realty Media  ·  All rights reserved 2025', pageW / 2, pageH - 5, { align: 'center' });

    // ──────────────────────────────────────────────
    // STEP E: Download the PDF
    // ──────────────────────────────────────────────
    const filename = 'Regalis_Quote_' + today.replace(/[\s,]/g, '_') + '.pdf';
    doc.save(filename);

  } catch (error: any) {
    console.error('PDF generation error:', error);
    alert('PDF download failed: ' + error.message + '\n\nPlease try again or call (917) 683-8034 for a quote.');
  }
}
