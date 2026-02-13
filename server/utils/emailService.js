const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
  // In production, use a real email service like SendGrid, Mailgun, or AWS SES
  // For development, you can use Gmail or a test service like Ethereal
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.SMTP_HOST) {
    // Generic SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // For testing only - logs to console instead of sending
    console.log('⚠️  No email configuration found. Emails will be logged to console.');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }
};

/**
 * Send email
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BoldAdventures <noreply@boldadventures.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // If using stream transport (testing), log the email
    if (info.message) {
      console.log('📧 Email would be sent:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('---');
      console.log(info.message.toString());
      console.log('---');
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (booking, user, tour) => {
  const subject = `Booking Confirmed - ${tour.title}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2caeba;">Booking Confirmed!</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${tour.title}</h3>
        <p><strong>Location:</strong> ${tour.location.country}${tour.location.city ? ', ' + tour.location.city : ''}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${tour.duration} days</p>
        <p><strong>Number of People:</strong> ${booking.numberOfPeople}</p>
        <p><strong>Total Price:</strong> ${booking.totalPrice} ${tour.currency}</p>
        <p><strong>Status:</strong> ${booking.status.toUpperCase()}</p>
      </div>
      
      <p>We're excited to have you on this adventure! If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>The BoldAdventures Team</p>
    </div>
  `;

  const text = `
Booking Confirmed!

Dear ${user.name},

Your booking has been confirmed. Here are the details:

Tour: ${tour.title}
Location: ${tour.location.country}${tour.location.city ? ', ' + tour.location.city : ''}
Start Date: ${new Date(booking.startDate).toLocaleDateString()}
Duration: ${tour.duration} days
Number of People: ${booking.numberOfPeople}
Total Price: ${booking.totalPrice} ${tour.currency}
Status: ${booking.status.toUpperCase()}

We're excited to have you on this adventure! If you have any questions, please don't hesitate to contact us.

Best regards,
The BoldAdventures Team
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send booking status update email
 */
const sendBookingStatusUpdate = async (booking, user, tour, oldStatus, newStatus) => {
  const subject = `Booking Status Updated - ${tour.title}`;
  
  const statusMessages = {
    pending: 'Your booking is pending confirmation.',
    confirmed: 'Your booking has been confirmed!',
    cancelled: 'Your booking has been cancelled.',
    completed: 'Your tour has been completed. We hope you had a great experience!',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2caeba;">Booking Status Updated</h2>
      <p>Dear ${user.name},</p>
      <p>The status of your booking has been updated from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
      
      <p>${statusMessages[newStatus] || ''}</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${tour.title}</h3>
        <p><strong>Location:</strong> ${tour.location.country}${tour.location.city ? ', ' + tour.location.city : ''}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong>Number of People:</strong> ${booking.numberOfPeople}</p>
        <p><strong>Current Status:</strong> ${newStatus.toUpperCase()}</p>
      </div>
      
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      
      <p>If you have any questions about this update, please contact us.</p>
      
      <p>Best regards,<br>The BoldAdventures Team</p>
    </div>
  `;

  const text = `
Booking Status Updated

Dear ${user.name},

The status of your booking has been updated from ${oldStatus} to ${newStatus}.

${statusMessages[newStatus] || ''}

Tour: ${tour.title}
Location: ${tour.location.country}${tour.location.city ? ', ' + tour.location.city : ''}
Start Date: ${new Date(booking.startDate).toLocaleDateString()}
Number of People: ${booking.numberOfPeople}
Current Status: ${newStatus.toUpperCase()}

${booking.notes ? `Notes: ${booking.notes}` : ''}

If you have any questions about this update, please contact us.

Best regards,
The BoldAdventures Team
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
};
