// backend/routes/gift.js
// Add this as a new route file in backend/routes/
// Then in your main app.js: app.use('/api/gift', require('./routes/gift'))

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // already likely in your project

// Reuse your existing email transporter setup
const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * POST /api/gift/send
 * Called after payment succeeds when isGift=true
 * Body: { recipientName, recipientEmail, giftMessage, senderName, childName, downloadUrl }
 */
router.post('/send', async (req, res) => {
  try {
    const {
      recipientName,
      recipientEmail,
      giftMessage,
      senderName,
      childName,
      downloadUrl,
    } = req.body;

    if (!recipientEmail || !recipientName || !downloadUrl) {
      return res.status(400).json({ error: 'Missing required gift fields' });
    }

    const transporter = getTransporter();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Nunito', Arial, sans-serif; background: #f3f0ff; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 20px; padding: 40px; max-width: 520px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 32px; }
    .emoji { font-size: 56px; display: block; margin-bottom: 16px; }
    h1 { color: #1e1b4b; font-size: 26px; margin: 0 0 8px; }
    .subtitle { color: #6b7280; font-size: 15px; }
    .message-box { background: #fdf4ff; border-left: 4px solid #9333ea; border-radius: 0 12px 12px 0; padding: 16px 20px; margin: 24px 0; }
    .message-box p { color: #4b5563; margin: 0; line-height: 1.6; font-style: italic; }
    .btn { display: block; background: linear-gradient(135deg, #9333ea, #6366f1); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 14px; font-weight: 800; font-size: 17px; margin: 24px 0; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
    .logo { color: #9333ea; font-weight: 800; font-size: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="emoji">🎁</span>
      <h1>You've received a magical gift!</h1>
      <p class="subtitle"><strong>${senderName || 'Someone special'}</strong> gifted you a personalized storybook</p>
    </div>

    <p style="color: #374151; font-size: 15px;">Dear <strong>${recipientName}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      You have received a personalized storybook featuring <strong>${childName}</strong> as the hero! 
      This magical story was created just for you.
    </p>

    ${giftMessage ? `
    <div class="message-box">
      <p>"${giftMessage}"</p>
      <p style="margin-top: 8px; font-weight: 700; font-style: normal; color: #9333ea;">— ${senderName}</p>
    </div>` : ''}

    <a href="${downloadUrl}" class="btn">📚 Open Your Storybook →</a>

    <p style="color: #6b7280; font-size: 13px; text-align: center;">
      This download link is valid for 30 days. Save your PDF for unlimited reading!
    </p>

    <div class="footer">
      <p class="logo">✨ Kidz Story Magic</p>
      <p>Creating magical personalized stories for children worldwide</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Kidz Story Magic 🎁" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🎁 ${senderName} gifted you a magical storybook!`,
      html,
    });

    res.json({ success: true, message: 'Gift email sent!' });
  } catch (error) {
    console.error('Gift email error:', error);
    res.status(500).json({ error: 'Failed to send gift email' });
  }
});

module.exports = router;
