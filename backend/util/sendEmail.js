const nodemailer = require("nodemailer");
const dayjs = require("dayjs");

module.exports = {
  sendEmail,
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailOptions = (obj) => {
  const { userName, dateTime, restaurant, pax } = obj.payload || {};
  const date = dateTime ? dayjs(dateTime).format("DD/MM/YYYY") : null;
  const time = dateTime ? dayjs(dateTime).format("h:mm A") : null;
  
  switch (obj.type) {
    // Password Reset Request
    case "passwordResetRequest":
      return {
        subject: "Password Reset Request",
        text:
          `Hello ${obj.payload.name},\n\n` +
          `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste it into your browser to complete the process:\n\n` +
          `${obj.payload.resetLink}\n\n` +
          `This link will expire in 1 hour.\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
      
    // Password Reset Success  
    case "passwordResetSuccess":
      return {
        subject: "Password Reset Successful",
        text:
          `Hello ${obj.payload.name},\n\n` +
          `This is a confirmation that the password for your account has just been changed.\n\n` +
          `If you did not make this change, please contact our support team immediately.\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
    
    // Reservation Confirmation
    case "reservationCompleted":
      return {
        subject: "Reservation Completed",
        text:
          `Hello ${userName},\n\n` +
          `We are happy to inform you that your reservation is confirmed. Here are the details of your reservation:\n\n` +
          `- Reservation Date: ${date}\n` +
          `- Time: ${time}\n` +
          `- Restaurant: ${restaurant}\n` +
          `- Number of Guests: ${pax}\n\n` +
          `Your booking is pending approval by the restaurant owner. You will be notified once it's approved.\n\n` +
          `Enjoy your dining!\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
    // Booking Approved
    case "bookingApproved":
      return {
        subject: "Reservation Approved",
        text:
          `Hello ${userName},\n\n` +
          `We are happy to inform you that your reservation has been APPROVED. Here are the details of your reservation:\n\n` +
          `- Reservation Date: ${date}\n` +
          `- Time: ${time}\n` +
          `- Restaurant: ${restaurant}\n` +
          `- Number of Guests: ${pax}\n\n` +
          `You can now download a receipt for your booking from your account dashboard.\n` +
          `Please present this receipt when you arrive at the restaurant.\n\n` +
          `Enjoy your dining!\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
    // Booking Rejected
    case "bookingRejected":
      return {
        subject: "Reservation Rejected",
        text:
          `Hello ${userName},\n\n` +
          `We regret to inform you that your reservation for ${restaurant} has been rejected by the restaurant.\n\n` +
          `Reason: ${obj.payload.rejectionReason}\n\n` +
          `Please try booking at a different time or contact the restaurant directly for more information.\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
    //   Reservation Changed
    case "reservationChanged":
      return {
        subject: "Reservation Updated",
        text:
          `Hello ${userName},\n\n` +
          `Your reservation has been successfully changed. Here are the details of your reservation:\n\n` +
          `- Reservation Date: ${date}\n` +
          `- Time: ${time}\n` +
          `- Restaurant: ${restaurant}\n` +
          `- Number of Guests: ${pax}\n\n` +
          `Enjoy your dining!\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
    //   Reservation Cancelled
    case "reservationCancelled":
      return {
        subject: "Reservation Cancelled",
        text:
          `Hello ${userName},\n\n` +
          `Your reservation has been cancelled.\n\n` +
          `Best regards,\n` +
          `PearlReserve`,
      };
  }
};

async function sendEmail(obj) {
  try {
    console.log(`Preparing to send ${obj.type} email to ${obj.payload.userEmail || obj.payload.email}`);
    
    // Check if required email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("EMAIL_USER or EMAIL_PASSWORD environment variables not set");
      return;
    }
    
    const mail = mailOptions(obj);
    
    // Validate the mail object
    if (!mail) {
      console.error(`Invalid email type: ${obj.type}`);
      return;
    }
    
    if (!mail.subject || !mail.text) {
      console.error(`Missing subject or text for email type: ${obj.type}`);
      return;
    }
    
    // Log email details for debugging
    console.log(`Email details:
      Type: ${obj.type}
      To: ${obj.payload.userEmail || obj.payload.email}
      Subject: ${mail.subject}
    `);
    
    // Send email
    const info = await transporter.sendMail({
      from: '"PearlReserve" <noreply@pearlreserve.com>',
      to: obj.payload.userEmail || obj.payload.email,
      subject: mail.subject,
      text: mail.text,
    });
    
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send ${obj.type} email:`, error);
    
    // Additional Gmail-specific error information
    if (error.message && error.message.includes("Invalid login")) {
      console.error(`
        Gmail authentication error detected. Please check:
        1. EMAIL_USER and EMAIL_PASSWORD are correct
        2. Your Gmail account has "Less secure app access" enabled, or
        3. You've created an App Password for your application
        4. If using 2FA, you must use an App Password
      `);
    }
    
    // Don't throw the error - just log it and continue
    return null;
  }
}
