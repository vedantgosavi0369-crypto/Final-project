// quick script to verify SMTP configuration for OTP emails
// Usage: node sendTestEmail.js recipient@example.com

require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
    const to = process.argv[2];
    if (!to) {
        console.error('Please provide a recipient address as the first argument');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to,
            subject: 'SMTP configuration test',
            text: 'This is a test message from your JeevanConnect backend.',
        });
        console.log('Message sent:', info.messageId);
        process.exit(0);
    } catch (err) {
        console.error('Failed to send test message', err);
        process.exit(1);
    }
})();
