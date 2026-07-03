import nodemailer from 'nodemailer';

// Helper to check if custom SMTP settings are configured in the environment variables
const hasCustomSmtp = (): boolean => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

// Create a professional email template HTML
const getOtpTemplateHtml = (otp: string, recipientEmail: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your OTP - SkillBox</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          color: #334155;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          padding: 40px 20px;
          text-align: center;
          color: #ffffff;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14px;
          color: #bfdbfe;
          font-weight: 500;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1e293b;
          text-align: left;
        }
        .description {
          font-size: 14px;
          line-height: 1.6;
          color: #64748b;
          margin-bottom: 30px;
          text-align: left;
        }
        .otp-container {
          background-color: #f1f5f9;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          padding: 24px;
          margin: 20px 0 30px 0;
          text-align: center;
        }
        .otp-label {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #64748b;
          margin-bottom: 10px;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 8px;
          color: #2563eb;
          margin: 0;
        }
        .warning-box {
          background-color: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 12px;
          padding: 12px 16px;
          text-align: left;
          margin-bottom: 30px;
        }
        .warning-text {
          font-size: 12px;
          color: #b45309;
          margin: 0;
          line-height: 1.5;
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💼 SkillBox</div>
          <div class="subtitle">Secure Verification System</div>
        </div>
        <div class="content">
          <div class="greeting">Hello,</div>
          <p class="description">
            We received a request to reset the password for your SkillBox account linked to <strong>${recipientEmail}</strong>. 
            Use the secure One-Time Password (OTP) below to authenticate your identity and finalize your password reset.
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Your Security OTP Code</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning-box">
            <p class="warning-text">
              ⚠️ <strong>Security Notice:</strong> This code is valid for only <strong>10 minutes</strong>. 
              Do not forward or share this OTP code with anyone under any circumstances. SkillBox staff will never ask for your code.
            </p>
          </div>
          
          <p class="description" style="margin-bottom: 0; font-size: 12px; text-align: center;">
            If you did not initiate this request, you can safely ignore this email; your credentials remain fully secure.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBox recruitment platform. All rights reserved.</p>
          <p>Need assistance? Contact our <a href="#">Security Response Center</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Sends a real OTP verification email using SMTP or dynamic test account
 */
export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    let transporter;

    if (hasCustomSmtp()) {
      console.log(`[SMTP] Sending OTP email to ${email} using custom SMTP...`);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      console.log(`[SMTP] No SMTP credentials configured. Generating a dynamic Ethereal testing account...`);
      // Dynamic Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"SkillBox Security" <noreply@skillbox.com>',
      to: email,
      subject: `🔑 [SkillBox] ${otp} is your Security OTP Code`,
      text: `Your SkillBox password reset security OTP code is ${otp}. This code is valid for 10 minutes.`,
      html: getOtpTemplateHtml(otp, email),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Email dispatched successfully:', info.messageId);

    // If using test account, generate web preview URL
    let previewUrl: string | undefined;
    if (!hasCustomSmtp()) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log('[SMTP] Web preview URL:', previewUrl);
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error('[SMTP Error] Failed to send email:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sends a real message/query email to the candidate or recruiter
 */
export async function sendApplicationMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  senderRole: string,
  jobTitle: string,
  messageContent: string,
  appUrl: string
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    let transporter;

    if (hasCustomSmtp()) {
      console.log(`[SMTP] Sending query email to ${recipientEmail} using custom SMTP...`);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      console.log(`[SMTP] No SMTP credentials configured. Generating a dynamic Ethereal testing account...`);
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message Regarding Your Application</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 14px;
            color: #f5f3ff;
            font-weight: 500;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #1e293b;
          }
          .message-box {
            background-color: #fdfeff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #7c3aed;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0 30px 0;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.6;
            color: #1e293b;
          }
          .button-container {
            text-align: center;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #7c3aed;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 28px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
            transition: all 0.2s;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
          }
          .footer a {
            color: #7c3aed;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💼 SkillBox</div>
            <div class="subtitle">Direct Communication Hub</div>
          </div>
          <div class="content">
            <div class="greeting">Hi ${recipientName},</div>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 20px;">
              You have received a new message from <strong>${senderName} (${senderRole})</strong> regarding the application for the position of <strong>${jobTitle}</strong>.
            </p>
            
            <div class="message-box">${messageContent}</div>
            
            <div class="button-container">
              <a href="${appUrl}" class="btn" style="color: #ffffff !important;">View & Reply in SkillBox</a>
            </div>
            
            <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center; margin: 0;">
              You can also reply directly to this email or click the button above to log into your SkillBox account and chat in real-time.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillBox recruitment platform. All rights reserved.</p>
            <p>Need assistance? Contact our <a href="#">Support Center</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"SkillBox Messages" <noreply@skillbox.com>',
      to: recipientEmail,
      subject: `✉️ New Message from ${senderName} regarding ${jobTitle}`,
      text: `Hi ${recipientName},\n\nYou received a message from ${senderName} regarding the ${jobTitle} position:\n\n"${messageContent}"\n\nView and reply in SkillBox: ${appUrl}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP Message] Email sent successfully:', info.messageId);

    let previewUrl: string | undefined;
    if (!hasCustomSmtp()) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log('[SMTP Message] Ethereal Web preview:', previewUrl);
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error('[SMTP Message Error] Failed to send email:', err);
    return { success: false, error: err.message || String(err) };
  }
}
