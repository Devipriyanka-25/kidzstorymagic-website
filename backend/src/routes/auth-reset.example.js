// Forgot Password & Reset Password Routes (Extension to auth.routes.js)
// Add these endpoints to backend/src/routes/auth.routes.js

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Email template for password reset
const getResetEmailTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 4px 4px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 4px 4px; }
        .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="margin: 20px 0;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>Or copy this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Kidz Story Magic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Forgot password endpoint
// router.post('/forgot-password', [
//   body('email').isEmail()
// ], async (req, res) => {
//   try {
//     const { email } = req.body;
//     
//     const user = await User.findByEmail(email);
//     if (!user) {
//       return res.status(404).json({ error: 'Email not found' });
//     }
//     
//     const resetToken = uuidv4();
//     const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
//     
//     // Store reset token (you should add a column to users table)
//     await pool.query(
//       'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
//       [resetToken, resetTokenExpiry, user.id]
//     );
//     
//     // Send email
//     const transporter = nodemailer.createTransport({
//       service: config.email.service,
//       auth: {
//         user: config.email.user,
//         pass: config.email.password
//       }
//     });
//     
//     const resetLink = `${config.app.baseUrl}/auth/reset-password?token=${resetToken}`;
//     await transporter.sendMail({
//       to: email,
//       subject: 'Reset Your Password - Kidz Story Magic',
//       html: getResetEmailTemplate(resetLink)
//     });
//     
//     res.json({ message: 'Password reset email sent' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to send reset email' });
//   }
// });

// Reset password endpoint
// router.post('/reset-password', [
//   body('token').notEmpty(),
//   body('password').isLength({ min: 6 })
// ], async (req, res) => {
//   try {
//     const { token, password } = req.body;
//     
//     const result = await pool.query(
//       'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
//       [token]
//     );
//     
//     if (result.rows.length === 0) {
//       return res.status(400).json({ error: 'Invalid or expired token' });
//     }
//     
//     const userId = result.rows[0].id;
//     const passwordHash = await bcrypt.hash(password, 10);
//     
//     await pool.query(
//       'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
//       [passwordHash, userId]
//     );
//     
//     res.json({ message: 'Password reset successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Password reset failed' });
//   }
// });

module.exports = {
  getResetEmailTemplate
};
