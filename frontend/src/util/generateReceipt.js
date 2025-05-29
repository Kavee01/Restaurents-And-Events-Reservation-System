import dayjs from 'dayjs';
import { notifications } from "@mantine/notifications";
import jsPDF from 'jspdf';

/**
 * Generates a PDF receipt for an approved restaurant booking and triggers a download
 * 
 * @param {Object} booking - The booking object with all details
 */
export function generateReceipt(booking) {
  // Ensure booking has all required properties with fallbacks
  const safeBooking = {
    _id: booking._id || 'UNKNOWN',
    restaurant: {
      name: booking.restaurant?.name || 'Unknown Restaurant',
      location: booking.restaurant?.location || 'No address provided'
    },
    dateTime: booking.dateTime || new Date(),
    pax: booking.pax || 1,
    user: {
      name: booking.user?.name || 'Guest',
      email: booking.user?.email || 'No email provided'
    },
    request: booking.request || ''
  };

  // Initialize PDF document
  const doc = new jsPDF();
  
  // Set font styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  
  // Add logo/header
  doc.setTextColor(26, 95, 122); // Deep Teal Blue
  doc.text("PEARLRESERVE", 105, 20, { align: "center" });
  doc.text("BOOKING CONFIRMATION", 105, 30, { align: "center" });
  
  // Reset font for content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(45, 49, 66); // Warm Charcoal
  
  // Add horizontal line
  doc.setDrawColor(26, 95, 122);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Add booking information
  let y = 50; // vertical position
  const leftMargin = 20;
  
  // Booking information
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Booking ID: ${safeBooking._id}`, leftMargin, y);
  y += 8;
  doc.text(`Status: APPROVED`, leftMargin, y);
  y += 15;
  
  // Restaurant information
  doc.setFont("helvetica", "bold");
  doc.text("RESTAURANT INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Restaurant: ${safeBooking.restaurant.name}`, leftMargin, y);
  y += 8;
  doc.text(`Address: ${safeBooking.restaurant.location}`, leftMargin, y);
  y += 15;
  
  // Reservation details
  doc.setFont("helvetica", "bold");
  doc.text("RESERVATION DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${dayjs(safeBooking.dateTime).format('DD/MM/YYYY')}`, leftMargin, y);
  y += 8;
  doc.text(`Time: ${dayjs(safeBooking.dateTime).format('hh:mm A')}`, leftMargin, y);
  y += 8;
  doc.text(`Number of Guests: ${safeBooking.pax}`, leftMargin, y);
  y += 15;
  
  // Customer information
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Reserved for: ${safeBooking.user.name}`, leftMargin, y);
  y += 8;
  doc.text(`Contact Email: ${safeBooking.user.email}`, leftMargin, y);
  y += 15;
  
  // Special requests (if any)
  if (safeBooking.request) {
    doc.setFont("helvetica", "bold");
    doc.text("SPECIAL REQUESTS", leftMargin, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.text(safeBooking.request, leftMargin, y);
    y += 15;
  }
  
  // Add note at the bottom
  y = 230;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("* Please arrive 10 minutes before your reservation time", leftMargin, y);
  y += 6;
  doc.text("* This receipt confirms your approved reservation", leftMargin, y);
  y += 15;
  
  // Add footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Thank you for choosing PearlReserve!`, leftMargin, y);
  y += 6;
  doc.text(`For any changes, please contact the restaurant directly.`, leftMargin, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`© ${new Date().getFullYear()} PearlReserve. All rights reserved.`, 105, 270, { align: "center" });
  
  // Save the PDF
  doc.save(`PearlReserve_Receipt_${safeBooking._id}.pdf`);
  
  // Show success notification
  notifications.show({
    title: 'Receipt Downloaded',
    message: `Your booking receipt for ${safeBooking.restaurant.name} has been downloaded as PDF.`,
    color: 'green',
    autoClose: 3000,
  });
}

/**
 * Generates a PDF receipt for a confirmed activity booking
 * 
 * @param {Object} booking - The activity booking object
 */
export function generateActivityReceipt(booking) {
  // Ensure booking has all required properties with fallbacks
  const safeBooking = {
    _id: booking._id || 'UNKNOWN',
    activity: {
      title: booking.activity?.title || 'Unknown Activity',
      location: booking.activity?.location || 'No location provided',
      price: booking.activity?.price || 0
    },
    date: booking.date || new Date(),
    participants: booking.participants || 1,
    totalPrice: booking.totalPrice || 0,
    user: {
      name: booking.user?.firstName && booking.user?.lastName 
        ? `${booking.user.firstName} ${booking.user.lastName}` 
        : booking.user?.name || 'Guest',
      email: booking.user?.email || 'No email provided'
    },
    specialRequests: booking.specialRequests || ''
  };

  // Initialize PDF document
  const doc = new jsPDF();
  
  // Set font styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  
  // Add logo/header
  doc.setTextColor(26, 95, 122); // Deep Teal Blue
  doc.text("PEARLRESERVE", 105, 20, { align: "center" });
  doc.text("ACTIVITY CONFIRMATION", 105, 30, { align: "center" });
  
  // Reset font for content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(45, 49, 66); // Warm Charcoal
  
  // Add horizontal line
  doc.setDrawColor(26, 95, 122);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Add booking information
  let y = 50; // vertical position
  const leftMargin = 20;
  
  // Booking information
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Booking ID: ${safeBooking._id}`, leftMargin, y);
  y += 8;
  doc.text(`Status: CONFIRMED`, leftMargin, y);
  y += 15;
  
  // Activity information
  doc.setFont("helvetica", "bold");
  doc.text("ACTIVITY INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Activity: ${safeBooking.activity.title}`, leftMargin, y);
  y += 8;
  doc.text(`Location: ${safeBooking.activity.location}`, leftMargin, y);
  y += 15;
  
  // Booking details
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${dayjs(safeBooking.date).format('DD/MM/YYYY')}`, leftMargin, y);
  y += 8;
  doc.text(`Number of Participants: ${safeBooking.participants}`, leftMargin, y);
  y += 8;
  doc.text(`Price per Person: $${safeBooking.activity.price.toFixed(2)}`, leftMargin, y);
  y += 8;
  doc.text(`Total Price: $${safeBooking.totalPrice.toFixed(2)}`, leftMargin, y);
  y += 15;
  
  // Customer information
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Reserved for: ${safeBooking.user.name}`, leftMargin, y);
  y += 8;
  doc.text(`Contact Email: ${safeBooking.user.email}`, leftMargin, y);
  y += 15;
  
  // Special requests (if any)
  if (safeBooking.specialRequests) {
    doc.setFont("helvetica", "bold");
    doc.text("SPECIAL REQUESTS", leftMargin, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.text(safeBooking.specialRequests, leftMargin, y);
    y += 15;
  }
  
  // Add note at the bottom
  y = 230;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("* Please arrive 15 minutes before the activity start time", leftMargin, y);
  y += 6;
  doc.text("* This receipt confirms your confirmed activity booking", leftMargin, y);
  y += 15;
  
  // Add footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Thank you for choosing PearlReserve!`, leftMargin, y);
  y += 6;
  doc.text(`For any changes, please contact us directly.`, leftMargin, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`© ${new Date().getFullYear()} PearlReserve. All rights reserved.`, 105, 270, { align: "center" });
  
  // Save the PDF
  doc.save(`PearlReserve_Activity_${safeBooking._id}.pdf`);
  
  // Show success notification
  notifications.show({
    title: 'Receipt Downloaded',
    message: `Your booking receipt for ${safeBooking.activity.title} has been downloaded as PDF.`,
    color: 'green',
    autoClose: 3000,
  });
}

/**
 * Generates a PDF receipt for a confirmed service booking
 * 
 * @param {Object} booking - The service booking object
 */
export function generateServiceReceipt(booking) {
  // Ensure booking has all required properties with fallbacks
  const safeBooking = {
    _id: booking._id || 'UNKNOWN',
    service: {
      title: booking.service?.title || 'Unknown Service',
      price: booking.service?.price || 0,
      availability: booking.service?.availability || 'N/A',
    },
    appointmentDate: booking.appointmentDate || new Date(),
    price: booking.price || 0,
    user: {
      name: booking.user?.firstName && booking.user?.lastName 
        ? `${booking.user.firstName} ${booking.user.lastName}` 
        : booking.user?.name || 'Guest',
      email: booking.user?.email || 'No email provided'
    },
    notes: booking.notes || ''
  };

  // Initialize PDF document
  const doc = new jsPDF();
  
  // Set font styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  
  // Add logo/header
  doc.setTextColor(26, 95, 122); // Deep Teal Blue
  doc.text("PEARLRESERVE", 105, 20, { align: "center" });
  doc.text("SERVICE CONFIRMATION", 105, 30, { align: "center" });
  
  // Reset font for content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(45, 49, 66); // Warm Charcoal
  
  // Add horizontal line
  doc.setDrawColor(26, 95, 122);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Add booking information
  let y = 50; // vertical position
  const leftMargin = 20;
  
  // Booking information
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Booking ID: ${safeBooking._id}`, leftMargin, y);
  y += 8;
  doc.text(`Status: CONFIRMED`, leftMargin, y);
  y += 15;
  
  // Service information
  doc.setFont("helvetica", "bold");
  doc.text("SERVICE INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Service: ${safeBooking.service.title}`, leftMargin, y);
  y += 8;
  doc.text(`Availability: ${safeBooking.service.availability}`, leftMargin, y);
  y += 15;
  
  // Booking details
  doc.setFont("helvetica", "bold");
  doc.text("APPOINTMENT DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date & Time: ${dayjs(safeBooking.appointmentDate).format('DD/MM/YYYY hh:mm A')}`, leftMargin, y);
  y += 8;
  doc.text(`Price: $${safeBooking.price.toFixed(2)}`, leftMargin, y);
  y += 15;
  
  // Customer information
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Reserved for: ${safeBooking.user.name}`, leftMargin, y);
  y += 8;
  doc.text(`Contact Email: ${safeBooking.user.email}`, leftMargin, y);
  y += 15;
  
  // Notes (if any)
  if (safeBooking.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("NOTES", leftMargin, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.text(safeBooking.notes, leftMargin, y);
    y += 15;
  }
  
  // Add note at the bottom
  y = 230;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("* Please arrive 5 minutes before your appointment time", leftMargin, y);
  y += 6;
  doc.text("* This receipt confirms your confirmed service booking", leftMargin, y);
  y += 15;
  
  // Add footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Thank you for choosing PearlReserve!`, leftMargin, y);
  y += 6;
  doc.text(`For any changes, please contact us directly.`, leftMargin, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`© ${new Date().getFullYear()} PearlReserve. All rights reserved.`, 105, 270, { align: "center" });
  
  // Save the PDF
  doc.save(`PearlReserve_Service_${safeBooking._id}.pdf`);
  
  // Show success notification
  notifications.show({
    title: 'Receipt Downloaded',
    message: `Your service booking receipt for ${safeBooking.service.title} has been downloaded as PDF.`,
    color: 'green',
    autoClose: 3000,
  });
}

/**
 * Generates a PDF receipt for a confirmed event booking
 * 
 * @param {Object} booking - The event booking object
 */
export function generateEventReceipt(booking) {
  // Ensure booking has all required properties with fallbacks
  const safeBooking = {
    _id: booking._id || 'UNKNOWN',
    event: {
      title: booking.event?.title || 'Unknown Event',
      location: booking.event?.location || 'No location provided',
      ticketPrice: booking.event?.ticketPrice || 0,
      date: booking.event?.date || new Date()
    },
    ticketQuantity: booking.ticketQuantity || 1,
    totalPrice: booking.totalPrice || 0,
    user: {
      name: booking.user?.firstName && booking.user?.lastName 
        ? `${booking.user.firstName} ${booking.user.lastName}` 
        : booking.user?.name || 'Guest',
      email: booking.user?.email || 'No email provided'
    },
    additionalInfo: booking.additionalInfo || ''
  };

  // Initialize PDF document
  const doc = new jsPDF();
  
  // Set font styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  
  // Add logo/header
  doc.setTextColor(26, 95, 122); // Deep Teal Blue
  doc.text("PEARLRESERVE", 105, 20, { align: "center" });
  doc.text("EVENT CONFIRMATION", 105, 30, { align: "center" });
  
  // Reset font for content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(45, 49, 66); // Warm Charcoal
  
  // Add horizontal line
  doc.setDrawColor(26, 95, 122);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Add booking information
  let y = 50; // vertical position
  const leftMargin = 20;
  
  // Booking information
  doc.setFont("helvetica", "bold");
  doc.text("BOOKING DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Booking ID: ${safeBooking._id}`, leftMargin, y);
  y += 8;
  doc.text(`Status: CONFIRMED`, leftMargin, y);
  y += 15;
  
  // Event information
  doc.setFont("helvetica", "bold");
  doc.text("EVENT INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Event: ${safeBooking.event.title}`, leftMargin, y);
  y += 8;
  doc.text(`Location: ${safeBooking.event.location}`, leftMargin, y);
  y += 8;
  doc.text(`Event Date: ${dayjs(safeBooking.event.date).format('DD/MM/YYYY')}`, leftMargin, y);
  y += 15;
  
  // Ticket details
  doc.setFont("helvetica", "bold");
  doc.text("TICKET DETAILS", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Ticket Quantity: ${safeBooking.ticketQuantity}`, leftMargin, y);
  y += 8;
  doc.text(`Price per Ticket: $${safeBooking.event.ticketPrice.toFixed(2)}`, leftMargin, y);
  y += 8;
  doc.text(`Total Price: $${safeBooking.totalPrice.toFixed(2)}`, leftMargin, y);
  y += 15;
  
  // Customer information
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER INFORMATION", leftMargin, y);
  y += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Reserved for: ${safeBooking.user.name}`, leftMargin, y);
  y += 8;
  doc.text(`Contact Email: ${safeBooking.user.email}`, leftMargin, y);
  y += 15;
  
  // Additional info (if any)
  if (safeBooking.additionalInfo) {
    doc.setFont("helvetica", "bold");
    doc.text("ADDITIONAL INFORMATION", leftMargin, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.text(safeBooking.additionalInfo, leftMargin, y);
    y += 15;
  }
  
  // Add note at the bottom
  y = 230;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("* Please bring this receipt to the event for check-in", leftMargin, y);
  y += 6;
  doc.text("* This receipt confirms your confirmed event booking", leftMargin, y);
  y += 15;
  
  // Add footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Thank you for choosing PearlReserve!`, leftMargin, y);
  y += 6;
  doc.text(`For any changes, please contact us directly.`, leftMargin, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`© ${new Date().getFullYear()} PearlReserve. All rights reserved.`, 105, 270, { align: "center" });
  
  // Save the PDF
  doc.save(`PearlReserve_Event_${safeBooking._id}.pdf`);
  
  // Show success notification
  notifications.show({
    title: 'Receipt Downloaded',
    message: `Your event ticket receipt for ${safeBooking.event.title} has been downloaded as PDF.`,
    color: 'green',
    autoClose: 3000,
  });
} 