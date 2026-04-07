import jsPDF from 'jspdf';
import { Invoice, InvoiceSettings } from '@/types';

export const generateInvoicePDF = (invoice: Invoice, settings: InvoiceSettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Colors (RGB values)
  const primaryColor = { r: 16, g: 185, b: 129 }; // Emerald green
  const textColor = { r: 30, g: 41, b: 59 }; // Slate-800
  const lightGray = { r: 241, g: 245, b: 249 }; // Slate-100

  // ========== HEADER ==========
  // Company info
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyInfo.name, margin, yPosition);
  yPosition += 10;

  doc.setTextColor(textColor.r, textColor.g, textColor.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.companyInfo.email, margin, yPosition);
  yPosition += 6;
  doc.text(settings.companyInfo.phone, margin, yPosition);
  yPosition += 6;

  // Address (multiline)
  const addressLines = doc.splitTextToSize(settings.companyInfo.address, pageWidth - margin * 2);
  doc.text(addressLines, margin, yPosition);
  yPosition += addressLines.length * 6 + 10;

  // Invoice title and number
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = invoice.type === 'invoice' ? 'INVOICE' : 'QUOTATION';
  doc.text(title, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.invoiceNumber}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;

  // Dates
  doc.setFontSize(9);
  doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 5;
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 10;

  // ========== CLIENT INFO ==========
  checkPageBreak(40);

  // Bill To section
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 7, 'F');
  yPosition += 5;

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, yPosition);
  yPosition += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Client name
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.client.name, margin, yPosition);
  yPosition += 6;

  // Company (if exists)
  if (invoice.client.company) {
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client.company, margin, yPosition);
    yPosition += 6;
  }

  // Contact info
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client.email, margin, yPosition);
  yPosition += 5;
  doc.text(invoice.client.phone, margin, yPosition);
  yPosition += 5;

  // Address
  const clientAddressLines = doc.splitTextToSize(invoice.client.address, pageWidth - margin * 2);
  doc.text(clientAddressLines, margin, yPosition);
  yPosition += clientAddressLines.length * 5 + 10;

  // ========== LINE ITEMS TABLE ==========
  checkPageBreak(80);

  // Table header
  const tableStartY = yPosition;
  const colWidths = {
    description: (pageWidth - margin * 2) * 0.4,
    quantity: (pageWidth - margin * 2) * 0.1,
    unitPrice: (pageWidth - margin * 2) * 0.15,
    tax: (pageWidth - margin * 2) * 0.1,
    discount: (pageWidth - margin * 2) * 0.1,
    total: (pageWidth - margin * 2) * 0.15,
  };

  let currentX = margin;

  // Header background
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, tableStartY, pageWidth - margin * 2, 8, 'F');

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  doc.text('Description', currentX, tableStartY + 5);
  currentX += colWidths.description;
  doc.text('Qty', currentX, tableStartY + 5);
  currentX += colWidths.quantity;
  doc.text('Unit Price', currentX, tableStartY + 5);
  currentX += colWidths.unitPrice;
  doc.text('Tax %', currentX, tableStartY + 5);
  currentX += colWidths.tax;
  doc.text('Disc %', currentX, tableStartY + 5);
  currentX += colWidths.discount;
  doc.text('Total', currentX, tableStartY + 5, { align: 'right' });

  yPosition = tableStartY + 8;

  // Table rows
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');

  invoice.items.forEach((item, index) => {
    checkPageBreak(12);

    const rowY = yPosition;
    currentX = margin;

    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, rowY, pageWidth - margin * 2, 10, 'F');
    }

    // Description (multiline if needed)
    const descriptionLines = doc.splitTextToSize(item.description, colWidths.description - 2);
    doc.setFontSize(8);
    doc.text(descriptionLines, currentX, rowY + 4);
    const rowHeight = Math.max(10, descriptionLines.length * 4 + 4);
    currentX += colWidths.description;

    // Quantity
    doc.text(String(item.quantity), currentX, rowY + 6);
    currentX += colWidths.quantity;

    // Unit Price
    doc.text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, currentX, rowY + 6);
    currentX += colWidths.unitPrice;

    // Tax
    doc.text(`${item.tax}%`, currentX, rowY + 6);
    currentX += colWidths.tax;

    // Discount
    doc.text(`${item.discount}%`, currentX, rowY + 6);
    currentX += colWidths.discount;

    // Total
    doc.text(`${invoice.currency} ${item.total.toFixed(2)}`, currentX + colWidths.total, rowY + 6, { align: 'right' });

    yPosition += rowHeight;
  });

  yPosition += 10;

  // ========== TOTALS SECTION ==========
  checkPageBreak(60);

  const totalsX = pageWidth - margin - 80;
  const totalsWidth = 80;

  // Subtotal
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, yPosition);
  doc.text(`${invoice.currency} ${invoice.subtotal.toFixed(2)}`, totalsX + totalsWidth, yPosition, { align: 'right' });
  yPosition += 6;

  // Tax
  doc.text(`Tax (${invoice.taxRate}%):`, totalsX, yPosition);
  doc.text(`${invoice.currency} ${invoice.taxAmount.toFixed(2)}`, totalsX + totalsWidth, yPosition, { align: 'right' });
  yPosition += 6;

  // Discount
  if (invoice.discountRate > 0) {
    doc.text(`Discount (${invoice.discountRate}%):`, totalsX, yPosition);
    doc.text(`-${invoice.currency} ${invoice.discountAmount.toFixed(2)}`, totalsX + totalsWidth, yPosition, { align: 'right' });
    yPosition += 6;
  }

  // Total
  doc.setFillColor(16, 185, 129);
  doc.rect(totalsX - 2, yPosition - 3, totalsWidth + 4, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', totalsX, yPosition + 4);
  doc.text(`${invoice.currency} ${invoice.total.toFixed(2)}`, totalsX + totalsWidth, yPosition + 4, { align: 'right' });
  yPosition += 15;

  // ========== PAYMENT STATUS ==========
  checkPageBreak(20);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const statusColors: Record<Invoice['status'], { r: number; g: number; b: number }> = {
    draft: { r: 148, g: 163, b: 184 },
    pending: { r: 251, g: 191, b: 36 },
    paid: { r: 16, g: 185, b: 129 },
    overdue: { r: 239, g: 68, b: 68 },
    partial: { r: 59, g: 130, b: 246 },
  };

  const statusText = {
    draft: 'DRAFT',
    pending: 'PENDING',
    paid: 'PAID',
    overdue: 'OVERDUE',
    partial: 'PARTIAL',
  };

  doc.text('Status:', margin, yPosition);
  const statusColor = statusColors[invoice.status];
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText[invoice.status], margin + 15, yPosition);
  yPosition += 8;

  // ========== NOTES & TERMS ==========
  if (invoice.notes || invoice.terms) {
    checkPageBreak(30);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    yPosition += 5;

    if (invoice.notes) {
      doc.text('Notes:', margin, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
      doc.text(notesLines, margin, yPosition);
      yPosition += notesLines.length * 4 + 5;
    }

    if (invoice.terms) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Terms & Conditions:', margin, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - margin * 2);
      doc.text(termsLines, margin, yPosition);
      yPosition += termsLines.length * 4 + 5;
    }
  }

  // ========== PAYMENT INFO ==========
  checkPageBreak(20);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPosition, pageWidth - margin * 2, 7, 'F');
  yPosition += 5;

  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PAYMENT INFORMATION', margin, yPosition);
  yPosition += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const paymentLines = doc.splitTextToSize(settings.paymentInfo, pageWidth - margin * 2);
  doc.text(paymentLines, margin, yPosition);

  // ========== FOOTER ==========
  const pageCount = (doc.internal as any).pages.length - 1; // jsPDF pages array includes page 0
  for (let i = 1; i <= pageCount; i++) {
    (doc.internal as any).currentPage = (doc.internal as any).pages[i];
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Invoice App`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `${invoice.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(fileName);

  return fileName;
};
