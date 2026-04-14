// Email Template Utilities for Backend
const getWelcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 4px 4px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 4px 4px; }
        .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Kidz Story Magic! 🎉</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for joining Kidz Story Magic! We're thrilled to have you on our platform.</p>
            <p>Here's what you can do now:</p>
            <ul>
                <li>Create personalized storybooks for your children</li>
                <li>Choose from 6 different story themes</li>
                <li>Customize page counts and add photos</li>
                <li>Download and share stories in PDF format</li>
            </ul>
            <p style="margin: 20px 0;">
                <a href="https://kidzstorymagic.com/wizard" class="button">Start Creating Stories Now</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team at support@kidzstorymagic.com</p>
            <p>Happy storytelling!</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Kidz Story Magic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getOrderConfirmationTemplate = (orderDetails) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 4px 4px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation ✅</h1>
        </div>
        <div class="content">
            <p>Hi ${orderDetails.customerName},</p>
            <p>Thank you for your purchase! Your story is being prepared.</p>
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                <p><strong>Story Title:</strong> ${orderDetails.storyTitle}</p>
                <p><strong>Amount:</strong> ${orderDetails.amount}</p>
                <p><strong>Status:</strong> Processing</p>
            </div>
            <p>We'll notify you via email once your story is ready for download.</p>
            <p>Expected delivery: Within 24 hours</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Kidz Story Magic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getStoryReadyTemplate = (orderDetails) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 4px 4px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .button { background: #11998e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Story is Ready! 🎉</h1>
        </div>
        <div class="content">
            <p>Hi ${orderDetails.customerName},</p>
            <p>Exciting news! Your personalized storybook <strong>"${orderDetails.storyTitle}"</strong> is now ready for download!</p>
            <p style="margin: 20px 0;">
                <a href="${orderDetails.downloadLink}" class="button">Download Your Story</a>
            </p>
            <p>Or log in to your account to download it from your dashboard.</p>
            <p>Happy reading! 📖</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Kidz Story Magic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
  getWelcomeEmailTemplate,
  getOrderConfirmationTemplate,
  getStoryReadyTemplate
};
