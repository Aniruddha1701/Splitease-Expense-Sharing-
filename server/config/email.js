const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SplitEase" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

// Base email wrapper with premium design
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SplitEase</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button { padding: 16px 32px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 16px 20px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);">
                    <span style="font-size: 24px; color: white;">💰</span>
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #6366f1;">SplitEase</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 24px; border: 1px solid rgba(148, 163, 184, 0.1); overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);">
                
                <!-- Gradient Top Border -->
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);"></td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <a href="#" style="color: #64748b; text-decoration: none; font-size: 13px; margin: 0 12px;">Help Center</a>
                    <span style="color: #334155;">•</span>
                    <a href="#" style="color: #64748b; text-decoration: none; font-size: 13px; margin: 0 12px;">Privacy</a>
                    <span style="color: #334155;">•</span>
                    <a href="#" style="color: #64748b; text-decoration: none; font-size: 13px; margin: 0 12px;">Terms</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #475569; font-size: 12px; padding-bottom: 8px;">
                    © 2024 SplitEase. All rights reserved.
                  </td>
                </tr>
                <tr>
                  <td style="color: #334155; font-size: 11px;">
                    Split expenses with friends, easily.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: '🎉 Welcome to SplitEase!',
    html: emailWrapper(`
      <!-- Welcome Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h1 style="color: #f8fafc; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Welcome, ${name}!</h1>
            <p style="color: #94a3b8; font-size: 16px; margin: 0;">You're all set to start splitting expenses</p>
          </td>
        </tr>
      </table>
      
      <!-- Divider -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0;">
            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent);"></div>
          </td>
        </tr>
      </table>
      
      <!-- Features Grid -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom: 24px;">
            <h2 style="color: #e2e8f0; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Here's what you can do:</h2>
          </td>
        </tr>
        
        <!-- Feature 1 -->
        <tr>
          <td style="padding-bottom: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 12px;">
              <tr>
                <td style="padding: 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: top; padding-right: 14px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">👥</div>
                      </td>
                      <td>
                        <div style="color: #f8fafc; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Create Groups</div>
                        <div style="color: #94a3b8; font-size: 13px;">Organize expenses by trips, home, or events</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Feature 2 -->
        <tr>
          <td style="padding-bottom: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 12px;">
              <tr>
                <td style="padding: 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: top; padding-right: 14px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">💰</div>
                      </td>
                      <td>
                        <div style="color: #f8fafc; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Add Expenses</div>
                        <div style="color: #94a3b8; font-size: 13px;">Split equally, by exact amounts, or percentages</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Feature 3 -->
        <tr>
          <td style="padding-bottom: 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 12px;">
              <tr>
                <td style="padding: 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: top; padding-right: 14px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">💸</div>
                      </td>
                      <td>
                        <div style="color: #f8fafc; font-weight: 600; font-size: 15px; margin-bottom: 4px;">Settle Up</div>
                        <div style="color: #94a3b8; font-size: 13px;">See who owes whom and record payments</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 8px 0 16px;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);">Get Started →</a>
          </td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
        Questions? Reply to this email and we'll help you out!
      </p>
    `)
  }),

  expenseAdded: (groupName, description, amount, paidBy) => ({
    subject: `💰 New expense: ${description} (${groupName})`,
    html: emailWrapper(`
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 24px;">
            <div style="display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 50px; padding: 8px 20px; margin-bottom: 16px;">
              <span style="color: #34d399; font-size: 13px; font-weight: 500;">New Expense Added</span>
            </div>
            <h1 style="color: #f8fafc; font-size: 24px; font-weight: 700; margin: 0;">${groupName}</h1>
          </td>
        </tr>
      </table>
      
      <!-- Expense Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 28px;">
            <!-- Description -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              <tr>
                <td>
                  <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Description</div>
                  <div style="color: #f8fafc; font-size: 20px; font-weight: 600;">${description}</div>
                </td>
              </tr>
            </table>
            
            <!-- Divider -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 16px 0;">
                  <div style="height: 1px; background: rgba(148, 163, 184, 0.15);"></div>
                </td>
              </tr>
            </table>
            
            <!-- Amount and Payer Row -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="vertical-align: top;">
                  <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Amount</div>
                  <div style="color: #34d399; font-size: 32px; font-weight: 700;">₹${amount}</div>
                </td>
                <td width="50%" style="vertical-align: top; text-align: right;">
                  <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Paid By</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-left: auto;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 36px; height: 36px; border-radius: 50%; text-align: center; vertical-align: middle;">
                        <span style="color: white; font-weight: 600; font-size: 14px;">${paidBy.charAt(0).toUpperCase()}</span>
                      </td>
                      <td style="padding-left: 10px;">
                        <div style="color: #f8fafc; font-size: 16px; font-weight: 600;">${paidBy}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <!-- CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);">View Expense Details →</a>
          </td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
        You received this email because you're a member of ${groupName}
      </p>
    `)
  }),

  settlementReminder: (fromName, toName, amount, groupName) => ({
    subject: `💸 Payment reminder: ₹${amount} (${groupName})`,
    html: emailWrapper(`
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 24px;">
            <div style="font-size: 56px; margin-bottom: 16px;">💸</div>
            <h1 style="color: #f8fafc; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Payment Reminder</h1>
            <p style="color: #94a3b8; font-size: 15px; margin: 0;">Time to settle up in ${groupName}</p>
          </td>
        </tr>
      </table>
      
      <!-- Settlement Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 32px; text-align: center;">
            <!-- From User -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="display: inline-block; vertical-align: middle;">
              <tr>
                <td style="text-align: center;">
                  <div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 10px; line-height: 56px;">
                    <span style="color: white; font-weight: 700; font-size: 22px;">${fromName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div style="color: #f8fafc; font-weight: 600; font-size: 15px;">${fromName}</div>
                </td>
              </tr>
            </table>
            
            <!-- Arrow -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="display: inline-block; vertical-align: middle; margin: 0 20px;">
              <tr>
                <td style="text-align: center;">
                  <div style="color: #fbbf24; font-size: 12px; margin-bottom: 6px;">PAYS</div>
                  <div style="color: #f59e0b; font-size: 24px;">→</div>
                </td>
              </tr>
            </table>
            
            <!-- To User -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="display: inline-block; vertical-align: middle;">
              <tr>
                <td style="text-align: center;">
                  <div style="background: linear-gradient(135deg, #10b981, #059669); width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 10px; line-height: 56px;">
                    <span style="color: white; font-weight: 700; font-size: 22px;">${toName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div style="color: #f8fafc; font-weight: 600; font-size: 15px;">${toName}</div>
                </td>
              </tr>
            </table>
            
            <!-- Amount -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
              <tr>
                <td style="text-align: center;">
                  <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Amount Due</div>
                  <div style="color: #fbbf24; font-size: 42px; font-weight: 700;">₹${amount}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <!-- CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);">Settle Up Now →</a>
          </td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
        This is a friendly reminder to help keep track of shared expenses
      </p>
    `)
  }),

  settlementConfirmation: (fromName, toName, amount, groupName) => ({
    subject: `✅ Payment confirmed: ₹${amount} (${groupName})`,
    html: emailWrapper(`
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); width: 72px; height: 72px; border-radius: 50%; line-height: 72px; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);">
              <span style="font-size: 32px;">✓</span>
            </div>
            <h1 style="color: #f8fafc; font-size: 26px; font-weight: 700; margin: 0 0 8px 0;">Payment Confirmed!</h1>
            <p style="color: #34d399; font-size: 15px; margin: 0;">The settlement has been recorded</p>
          </td>
        </tr>
      </table>
      
      <!-- Confirmation Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%">
                  <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">From</div>
                  <div style="color: #f8fafc; font-size: 16px; font-weight: 600;">${fromName}</div>
                </td>
                <td width="50%" style="text-align: right;">
                  <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">To</div>
                  <div style="color: #f8fafc; font-size: 16px; font-weight: 600;">${toName}</div>
                </td>
              </tr>
            </table>
            
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
              <tr>
                <td style="text-align: center; padding: 20px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
                  <div style="color: #94a3b8; font-size: 12px; margin-bottom: 6px;">Amount Settled</div>
                  <div style="color: #34d399; font-size: 36px; font-weight: 700;">₹${amount}</div>
                  <div style="color: #64748b; font-size: 13px; margin-top: 8px;">in ${groupName}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0;">
        Keep splitting expenses with ease! 🎉
      </p>
    `)
  })
};

module.exports = { sendEmail, emailTemplates };
