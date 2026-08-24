import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Booking } from '../types';

export function generateInvoicePDF(booking: Booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0); // black
  doc.text('BlackPearl', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(117, 117, 117); // gray
  doc.text('Tours & Travel Agency', pageWidth / 2, 32, { align: 'center' });

  // Invoice info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${booking.invoice_number || 'N/A'}`, 20, 50);
  doc.text(`Date: ${new Date(booking.booked_at).toLocaleDateString()}`, 20, 57);
  
  doc.text(`Payment Status: ${booking.payment_status.toUpperCase()}`, pageWidth - 20, 50, { align: 'right' });
  doc.text(`Booking Status: ${booking.status.toUpperCase()}`, pageWidth - 20, 57, { align: 'right' });

  // Divider
  doc.setDrawColor(0, 0, 0); // black divider
  doc.setLineWidth(0.5);
  doc.line(20, 65, pageWidth - 20, 65);

  // Customer Details
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Customer Details', 20, 78);

  const travelerDetails = (booking.traveler_details || {}) as Record<string, string>;
  doc.setFontSize(10);
  doc.setTextColor(117, 117, 117);
  
  const customerInfo = [
    ['Name', travelerDetails.name || 'N/A'],
    ['Email', travelerDetails.email || 'N/A'],
    ['Phone', travelerDetails.phone || 'N/A'],
    ['Emergency Contact', travelerDetails.emergency_contact || 'N/A'],
  ];

  autoTable(doc, {
    startY: 83,
    head: [],
    body: customerInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
  });

  // Booking Details
  const bookingY = (doc as any).lastAutoTable?.finalY || 120;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Booking Details', 20, bookingY + 10);

  const bookingType = booking.booking_type === 'deal' ? 'Tour Deal' : 'Custom Package';
  const title = booking.deal?.title || booking.custom_package?.title || 'N/A';
  const destination = booking.deal?.destination || 'N/A';
  const travelDate = booking.deal ? `${booking.deal.duration_days} days` : booking.custom_package?.travel_date || 'N/A';
  
  const bookingInfo = [
    ['Type', bookingType],
    ['Title', title],
    ['Destination', destination],
    ['Duration/Date', travelDate],
    ['Number of Travelers', String((booking.custom_package?.num_travelers || 1))],
  ];

  autoTable(doc, {
    startY: bookingY + 15,
    head: [],
    body: bookingInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });

  // Price Breakdown
  const priceY = (doc as any).lastAutoTable?.finalY || 180;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Price Breakdown', 20, priceY + 10);

  const priceInfo = [
    ['Base Price', `₹${booking.total_amount.toLocaleString()}`],
    ['Taxes', '₹0'],
    ['Discounts', '₹0'],
  ];

  autoTable(doc, {
    startY: priceY + 15,
    head: [],
    body: priceInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
  });

  // Total
  const totalY = (doc as any).lastAutoTable?.finalY || 230;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Amount:', 20, totalY + 10);
  doc.setFontSize(14);
  doc.text(`₹${booking.total_amount.toLocaleString()}`, pageWidth - 20, totalY + 10, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(117, 117, 117);
  doc.text('Thank you for choosing BlackPearl! 🐚', pageWidth / 2, 270, { align: 'center' });
  doc.text('For queries, contact us at support@blackpearl.travel', pageWidth / 2, 277, { align: 'center' });

  // Save
  doc.save(`BlackPearl-Invoice-${booking.invoice_number || 'draft'}.pdf`);
}
