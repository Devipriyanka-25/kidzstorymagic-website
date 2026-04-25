/**
 * Email Templates for Kidz Story Magic
 * HTML email templates for various user notifications
 */

/**
 * Email verification template
 */
export function getEmailVerificationTemplate(name, verificationLink) {
  return {
    subject: '✨ Verify Your Email - Kidz Story Magic',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 12px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .expires { background: #fff3cd; padding: 10px; border-radius: 6px; margin: 20px 0; font-size: 14px; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ Kidz Story Magic</div>
              <p>Welcome to the magical world of personalized children's stories!</p>
            </div>

            <div class="content">
              <h2>Hello ${name}! 👋</h2>
              <p>Thank you for signing up for Kidz Story Magic! We're excited to help you create personalized, magical stories for your child.</p>

              <p><strong>To get started, please verify your email address:</strong></p>

              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">✓ Verify My Email</a>
              </div>

              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; font-size: 12px; color: #666; background: #fff; padding: 10px; border-radius: 4px;">
                ${verificationLink}
              </p>

              <div class="expires">
                <strong>⏰ This link expires in 24 hours</strong><br>
                If you don't verify your email within 24 hours, you'll need to register again.
              </div>

              <h3>What's next?</h3>
              <ul>
                <li>✅ Verify your email</li>
                <li>📝 Choose your child's age and preferences</li>
                <li>🎨 Create a personalized story</li>
                <li>📚 Generate illustrations with AI</li>
                <li>🎭 Swap faces and add magic</li>
                <li>📥 Download as PDF</li>
              </ul>

              <p style="margin-top: 30px; color: #666;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>

            <div class="footer">
              <p>© 2026 Kidz Story Magic. All rights reserved.</p>
              <p>Need help? Contact us at support@kidzstorymagic.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${name}!

Thank you for signing up for Kidz Story Magic! To get started, please verify your email address by clicking the link below:

${verificationLink}

This link expires in 24 hours.

If you didn't create this account, you can safely ignore this email.

Best regards,
Kidz Story Magic Team
support@kidzstorymagic.com
    `,
  };
}

/**
 * Welcome email template (after verification)
 */
export function getWelcomeEmailTemplate(name) {
  return {
    subject: '🎉 Welcome to Kidz Story Magic!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 12px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #6366f1; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ Kidz Story Magic</div>
            </div>

            <div class="content">
              <h2>Welcome, ${name}! 🎉</h2>
              <p>Your email has been verified! You're all set to create magical stories for your child.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.kidzstorymagic.org/wizard" class="button">📖 Create Your First Story</a>
              </div>

              <h3>Here's what you can do:</h3>
              
              <div class="feature">
                <strong>📝 Personalize Every Detail</strong><br>
                Tell us about your child - their name, age, interests, and values. We'll create a story just for them!
              </div>

              <div class="feature">
                <strong>🤖 AI-Powered Storytelling</strong><br>
                Our advanced AI generates unique, engaging stories tailored to your child's interests and age group.
              </div>

              <div class="feature">
                <strong>🎨 Beautiful Illustrations</strong><br>
                Every page is illustrated with AI-generated artwork that brings the story to life.
              </div>

              <div class="feature">
                <strong>🎭 Face Swap Magic</strong><br>
                Add your child's photo to the story characters - they become the hero of their own tale!
              </div>

              <div class="feature">
                <strong>📥 Download & Print</strong><br>
                Get your finished storybook as a PDF to print, share, or keep digital.
              </div>

              <h3>Special Offer</h3>
              <p>As a new member, enjoy your first story at an exclusive price. Create now to get started!</p>

              <p style="margin-top: 30px; color: #666;">
                Questions? Check out our FAQ or contact us at support@kidzstorymagic.com
              </p>
            </div>

            <div class="footer">
              <p>© 2026 Kidz Story Magic. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome, ${name}!

Your email has been verified! You're all set to create magical stories for your child.

Visit us to create your first story: https://www.kidzstorymagic.org/wizard

Questions? Contact us at support@kidzstorymagic.com

Best regards,
Kidz Story Magic Team
    `,
  };
}
