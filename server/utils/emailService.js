const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Create email transporter (for Nodemailer)
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
    console.log('WARNING: No email configuration found. Emails will be logged to console.');
    return nodemailer.createTransporter({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }
};

/**
 * Send email via SendGrid or Nodemailer
 */
const sendEmail = async (options) => {
  try {
    // Use SendGrid if API key is configured
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: options.to,
        from: process.env.SENDGRID_FROM || process.env.EMAIL_FROM || 'noreply@boldadventures.com',
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await sgMail.send(msg);
      console.log('Email sent via SendGrid to:', options.to);
      return { success: true, messageId: result[0].headers['x-message-id'] };
    }
    
    // Fallback to Nodemailer
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
      console.log('Email would be sent:');
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

/**
 * Send welcome email with verification link
 */
const sendWelcomeEmail = async (user, verificationUrl) => {
  const subject = 'Welcome to BoldAdventures - Verify Your Email';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #2caeba 0%, #1a8a95 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to BoldAdventures!</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thank you for joining BoldAdventures! We're thrilled to have you as part of our community of adventure enthusiasts.
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          To get started, please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 15px 30px; background: #2caeba; color: white; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #2caeba; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <p style="font-size: 14px; color: #999; margin-top: 30px;">
          <strong>This link will expire in 24 hours.</strong>
        </p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          If you didn't create an account with BoldAdventures, you can safely ignore this email.
        </p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #999; margin: 5px 0;">
          © ${new Date().getFullYear()} BoldAdventures. All rights reserved.
        </p>
        <p style="font-size: 12px; color: #999; margin: 5px 0;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to BoldAdventures!

Hello ${user.name},

Thank you for joining BoldAdventures! We're thrilled to have you as part of our community of adventure enthusiasts.

To get started, please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with BoldAdventures, you can safely ignore this email.

© ${new Date().getFullYear()} BoldAdventures. All rights reserved.
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send payment receipt email
 */
const sendPaymentReceipt = async (payment, user, booking, tour) => {
  const subject = `Payment Receipt - ${tour.title}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #2caeba; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Payment Received</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p style="font-size: 16px; color: #333;">Dear ${user.name},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thank you for your payment! Your transaction has been successfully processed.
        </p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #2caeba; font-size: 20px;">Payment Details</h2>
          <table style="width: 100%; font-size: 14px; color: #333;">
            <tr>
              <td style="padding: 8px 0;"><strong>Payment ID:</strong></td>
              <td style="padding: 8px 0;">${payment._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0;">${payment.amount.toLocaleString()} ${payment.currency}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0;">${payment.paymentMethod.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #4CAF50; font-weight: bold;">${payment.status.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(payment.createdAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e8f5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2caeba;">
          <h3 style="margin-top: 0; color: #2caeba; font-size: 18px;">Booking Information</h3>
          <table style="width: 100%; font-size: 14px; color: #333;">
            <tr>
              <td style="padding: 8px 0;"><strong>Tour:</strong></td>
              <td style="padding: 8px 0;">${tour.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Location:</strong></td>
              <td style="padding: 8px 0;">${tour.location.country}${tour.location.city ? ', ' + tour.location.city : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Start Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Duration:</strong></td>
              <td style="padding: 8px 0;">${tour.duration} days</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Participants:</strong></td>
              <td style="padding: 8px 0;">${booking.numberOfPeople}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          We're excited to have you on this adventure! A booking confirmation has also been sent to your email.
        </p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          If you have any questions about your payment or booking, please don't hesitate to contact us.
        </p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #999; margin: 5px 0;">
          © ${new Date().getFullYear()} BoldAdventures. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const text = `
Payment Received

Dear ${user.name},

Thank you for your payment! Your transaction has been successfully processed.

Payment Details:
- Payment ID: ${payment._id}
- Amount: ${payment.amount.toLocaleString()} ${payment.currency}
- Payment Method: ${payment.paymentMethod.toUpperCase()}
- Status: ${payment.status.toUpperCase()}
- Date: ${new Date(payment.createdAt).toLocaleString()}

Booking Information:
- Tour: ${tour.title}
- Location: ${tour.location.country}${tour.location.city ? ', ' + tour.location.city : ''}
- Start Date: ${new Date(booking.startDate).toLocaleDateString()}
- Duration: ${tour.duration} days
- Participants: ${booking.numberOfPeople}

We're excited to have you on this adventure! A booking confirmation has also been sent to your email.

If you have any questions, please contact us.

© ${new Date().getFullYear()} BoldAdventures. All rights reserved.
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send newsletter email to subscribers
 */
const sendNewsletterEmail = async (subscribers, subject, content) => {
  const promises = subscribers.map(subscriber => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
        <div style="background: #2caeba; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">BoldAdventures Newsletter</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          ${content}
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #999; margin: 5px 0;">
            © ${new Date().getFullYear()} BoldAdventures. All rights reserved.
          </p>
          <p style="font-size: 12px; color: #999; margin: 5px 0;">
            You're receiving this email because you subscribed to our newsletter.
          </p>
          <p style="font-size: 12px; color: #999; margin: 5px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/unsubscribe?email=${subscriber.email}" 
               style="color: #2caeba; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;

    return sendEmail({
      to: subscriber.email,
      subject,
      text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    });
  });

  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed, total: subscribers.length };
};

/**
 * Send security notification email
 */
const sendSecurityNotification = async (user, notificationType, details = {}) => {
  const notifications = {
    'password-changed': {
      subject: 'Password Changed - BoldAdventures',
      message: 'Your password has been successfully changed.',
    },
    'login-new-device': {
      subject: 'New Device Login - BoldAdventures',
      message: 'A new login to your account was detected from a different device.',
    },
    'email-changed': {
      subject: 'Email Address Changed - BoldAdventures',
      message: 'Your email address has been successfully updated.',
    },
  };

  const notification = notifications[notificationType] || {
    subject: 'Security Alert - BoldAdventures',
    message: 'There was a security-related change to your account.',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #ff9800; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Security Notification</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ${notification.message}
        </p>
        
        ${details.timestamp ? `
        <p style="font-size: 14px; color: #666;">
          <strong>Time:</strong> ${new Date(details.timestamp).toLocaleString()}
        </p>
        ` : ''}
        
        <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>WARNING: If this wasn't you:</strong><br>
            Please change your password immediately and contact our support team.
          </p>
        </div>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #999; margin: 5px 0;">
          © ${new Date().getFullYear()} BoldAdventures. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const text = `
Security Notification

Hello ${user.name},

${notification.message}

${details.timestamp ? `Time: ${new Date(details.timestamp).toLocaleString()}` : ''}

WARNING: If this wasn't you, please change your password immediately and contact our support team.

© ${new Date().getFullYear()} BoldAdventures. All rights reserved.
  `;

  return sendEmail({
    to: user.email,
    subject: notification.subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
  sendWelcomeEmail,
  sendPaymentReceipt,
  sendNewsletterEmail,
  sendSecurityNotification,
};
