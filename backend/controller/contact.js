const express = require("express");
const router = express.Router();
const sendMail = require("../utils/sendMail");

// POST - Send contact form email
router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (name, email, subject, message)",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Message length validation
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long",
      });
    }

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMPT_MAIL;

    if (!adminEmail) {
      console.error("Admin email not configured in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please try again later.",
      });
    }

    // Format the email content
    const currentDate = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // HTML email template for admin
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                📬 New Contact Message
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 14px;">
                Received on ${currentDate}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Subject Badge -->
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                <p style="margin: 0; color: #1e40af; font-weight: 600; font-size: 16px;">
                  📋 Subject: ${subject}
                </p>
              </div>
              
              <!-- Contact Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 10px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="font-size: 20px;">👤</span>
                        </td>
                        <td>
                          <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                          <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">${name}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="font-size: 20px;">✉️</span>
                        </td>
                        <td>
                          <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                          <p style="margin: 0;">
                            <a href="mailto:${email}" style="color: #2563eb; font-size: 16px; font-weight: 600; text-decoration: none;">${email}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${phone ? `
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="font-size: 20px;">📞</span>
                        </td>
                        <td>
                          <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                          <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">${phone}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- Message -->
              <div style="margin-bottom: 30px;">
                <p style="margin: 0 0 15px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  💬 Message
                </p>
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              
              <!-- Reply Button -->
              <div style="text-align: center;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
                  ↩️ Reply to ${name}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px; text-align: center;">
                This message was sent from the Contact Form on your website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Plain text version for admin
    const adminEmailText = `
New Contact Form Submission
============================

Date: ${currentDate}

Contact Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'Not provided'}
- Subject: ${subject}

Message:
${message}

---
Reply to this message by emailing: ${email}
    `;

    // Send email to admin
    await sendMail({
      email: adminEmail,
      subject: `[Contact Form] ${subject} - from ${name}`,
      message: adminEmailText,
      html: adminEmailHtml,
    });

    // Send confirmation email to user
    const userConfirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Received Your Message</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✉️</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Message Received!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 18px; font-weight: 600;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.7;">
                Thank you for reaching out to us! We've received your message and our team will review it shortly.
              </p>
              <p style="margin: 0 0 30px; color: #475569; font-size: 15px; line-height: 1.7;">
                We typically respond within <strong>24 hours</strong> during business days. If your matter is urgent, please feel free to call us directly.
              </p>
              
              <!-- Message Summary -->
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; border: 1px solid #bbf7d0; margin-bottom: 30px;">
                <p style="margin: 0 0 15px; color: #166534; font-weight: 600; font-size: 14px;">
                  📋 Your Message Summary:
                </p>
                <p style="margin: 0 0 8px; color: #166534; font-size: 14px;">
                  <strong>Subject:</strong> ${subject}
                </p>
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  <strong>Submitted:</strong> ${currentDate}
                </p>
              </div>
              
              <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.7;">
                Best regards,<br>
                <strong>The Support Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                This is an automated confirmation email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send confirmation to user
    try {
      await sendMail({
        email: email,
        subject: "We received your message!",
        message: `Hi ${name}, Thank you for contacting us. We've received your message regarding "${subject}" and will get back to you within 24 hours.`,
        html: userConfirmationHtml,
      });
    } catch (userMailError) {
      // Log but don't fail if user confirmation fails
      console.error("Failed to send user confirmation email:", userMailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });

  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;
