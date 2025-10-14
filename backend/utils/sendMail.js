const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  try {
    // Validate required environment variables
    if (!process.env.SMPT_HOST || !process.env.SMPT_MAIL || !process.env.SMPT_PASSWORD) {
      throw new Error('Missing required SMTP configuration. Please check SMPT_HOST, SMPT_MAIL, and SMPT_PASSWORD environment variables.');
    }

    // Validate input options
    if (!options.email) {
      throw new Error('Recipient email is required');
    }
    if (!options.subject) {
      throw new Error('Email subject is required');
    }
    if (!options.message && !options.html) {
      throw new Error('Email message or HTML content is required');
    }

    // Validate SMTP configuration

    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: parseInt(process.env.SMPT_PORT) || 465,
      secure: parseInt(process.env.SMPT_PORT) === 465, // true for 465, false for other ports
      service: process.env.SMPT_SERVICE || undefined,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.NODE_ENV !== 'PRODUCTION', // Enable debug in development
      logger: process.env.NODE_ENV !== 'PRODUCTION' // Enable logging in development
    });

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: {
        name: 'Your Store',
        address: process.env.SMPT_MAIL
      },
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('Email sending failed:', error.message);
    
    // Provide specific error messages for common issues
    if (error.code === 'EAUTH') {
      throw new Error('SMTP Authentication failed. Please check your email and app password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to SMTP server. Please check your network connection and SMTP settings.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('SMTP connection timeout. Please try again later.');
    } else if (error.responseCode === 550) {
      throw new Error('Invalid recipient email address.');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
};

module.exports = sendMail;
