'use strict';

const PDFDocument = require('pdfkit');

const collectPdfBuffer = (build) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 48,
      size: 'A4',
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    build(doc);
    doc.end();
  });

const safeText = (value, fallback = 'N/A') =>
  value === undefined || value === null || value === '' ? fallback : String(value);

const drawHeading = (doc, title, subtitle) => {
  doc
    .fontSize(24)
    .fillColor('#111827')
    .text(title, { align: 'left' });

  if (subtitle) {
    doc
      .moveDown(0.3)
      .fontSize(10)
      .fillColor('#6b7280')
      .text(subtitle);
  }

  doc
    .moveDown(1)
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke()
    .moveDown(1);
};

const drawKeyValue = (doc, label, value) => {
  doc
    .fontSize(10)
    .fillColor('#6b7280')
    .text(label)
    .moveDown(0.15)
    .fontSize(12)
    .fillColor('#111827')
    .text(safeText(value))
    .moveDown(0.8);
};

const drawQrCode = (doc, qrCode) => {
  if (!qrCode || !qrCode.startsWith('data:image')) {
    return;
  }

  try {
    const base64Data = qrCode.split(',')[1];
    doc.image(Buffer.from(base64Data, 'base64'), {
      fit: [120, 120],
      align: 'left',
    });
    doc.moveDown(1);
  } catch {
    // Ignore QR embedding issues so PDF generation still succeeds.
  }
};

const generateBookingInvoicePdf = async ({ booking, tickets = [] }) =>
  collectPdfBuffer((doc) => {
    drawHeading(
      doc,
      'Ticket Bro Booking Invoice',
      `Booking Ref: ${safeText(booking?.bookingRef)}`,
    );

    drawKeyValue(doc, 'Event', booking?.event?.title);
    drawKeyValue(doc, 'Date', booking?.event?.startDate ? new Date(booking.event.startDate).toLocaleString() : null);
    drawKeyValue(doc, 'Location', booking?.event?.location?.name || booking?.event?.location?.city);
    drawKeyValue(doc, 'Contact', booking?.contactName);
    drawKeyValue(doc, 'Email', booking?.contactEmail);
    drawKeyValue(doc, 'Status', booking?.status);
    drawKeyValue(doc, 'Payment Status', booking?.paymentStatus);
    drawKeyValue(doc, 'Ticket Count', booking?.ticketCount || tickets.length);
    drawKeyValue(
      doc,
      'Totals',
      `${safeText(booking?.currency, 'USD')} ${Number(booking?.totalAmount || 0).toFixed(2)}`,
    );

    if (tickets.length) {
      doc
        .moveDown(0.5)
        .fontSize(14)
        .fillColor('#111827')
        .text('Issued Tickets');

      doc.moveDown(0.5);

      tickets.forEach((ticket, index) => {
        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(`${index + 1}. ${safeText(ticket.ticketCode)}`)
          .fontSize(10)
          .fillColor('#6b7280')
          .text(`${safeText(ticket.ticketTypeName)} | ${safeText(ticket.attendee?.firstName)} ${safeText(ticket.attendee?.lastName, '').trim()}`.trim())
          .moveDown(0.5);
      });
    }
  });

const generateTicketPdf = async ({ ticket }) =>
  collectPdfBuffer((doc) => {
    drawHeading(
      doc,
      'Ticket Bro Event Ticket',
      `Ticket Code: ${safeText(ticket?.ticketCode)}`,
    );

    drawKeyValue(doc, 'Event', ticket?.event?.title);
    drawKeyValue(doc, 'Date', ticket?.event?.startDate ? new Date(ticket.event.startDate).toLocaleString() : null);
    drawKeyValue(doc, 'Ticket Type', ticket?.ticketTypeName || ticket?.ticketType?.name);
    drawKeyValue(
      doc,
      'Attendee',
      `${safeText(ticket?.attendee?.firstName, '')} ${safeText(ticket?.attendee?.lastName, '')}`.trim() || ticket?.user?.email,
    );
    drawKeyValue(doc, 'Seat', ticket?.seat?.number ? `${ticket?.seat?.section || ''} ${ticket?.seat?.row || ''} ${ticket?.seat?.number || ''}`.trim() : 'General admission');
    drawKeyValue(doc, 'Status', ticket?.status);

    drawQrCode(doc, ticket?.qrCode);
  });

module.exports = {
  generateBookingInvoicePdf,
  generateTicketPdf,
};
