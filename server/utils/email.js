const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For production, configure with real email service
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // For development, use ethereal (fake SMTP)
  // In production, this will be skipped and use real credentials
  console.log('Email service not configured. Using test mode.');
  return null;
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Password reset URL with token
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[DEV MODE] Password reset email would be sent to: ${email}`);
    console.log(`[DEV MODE] Reset URL: ${resetUrl}`);
    return; // Skip actual email sending in dev mode
  }

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Bold Adventures'} <${process.env.EMAIL_FROM || 'noreply@boldadventures.com'}>`,
    to: email,
    subject: 'Password Reset Request - Bold Adventures',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You recently requested to reset your password for your Bold Adventures account. Click the button below to reset it:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bold Adventures. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${name},

      You recently requested to reset your password for your Bold Adventures account.
      
      Click the link below to reset it:
      ${resetUrl}

      This link will expire in 10 minutes.

      If you didn't request a password reset, you can safely ignore this email.

      © ${new Date().getFullYear()} Bold Adventures. All rights reserved.
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send booking confirmation email
 * @param {string} email - Recipient email
 * @param {object} bookingDetails - Booking information
 */
const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[DEV MODE] Booking confirmation email would be sent to: ${email}`);
    return;
  }

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Bold Adventures'} <${process.env.EMAIL_FROM || 'noreply@boldadventures.com'}>`,
    to: email,
    subject: 'Booking Confirmation - Bold Adventures',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello ${bookingDetails.userName},</p>
            <p>Your booking has been confirmed. Here are the details:</p>
            <div class="details">
              <p><strong>Tour:</strong> ${bookingDetails.tourName}</p>
              <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
              <p><strong>Participants:</strong> ${bookingDetails.participants}</p>
              <p><strong>Total Price:</strong> ${bookingDetails.currency} ${bookingDetails.totalPrice}</p>
              <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            </div>
            <p>We're excited to have you join us on this adventure!</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bold Adventures. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
