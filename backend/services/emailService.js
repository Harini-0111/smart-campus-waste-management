const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Creates a transporter using either Gmail Service or Ethereal for testing
 */
const createTransporter = async () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️  Email credentials missing. Falling back to Ethereal.');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
    }

    // Recommended way for Gmail in Nodemailer
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass // Must be a 16-character App Password
        }
    });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name = 'User') => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"EcoCampus System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 EcoCampus Verification Code',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #10b981;">Hello ${name}!</h2>
                    <p>Your verification code for EcoCampus is:</p>
                    <div style="background: #f0fdf4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; border-radius: 8px;">
                        ${otp}
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        This code expires in 10 minutes. If you didn't request this, please ignore this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`❌ Email error for ${email}:`, error.message);
        return false;
    }
};

module.exports = { generateOTP, sendOTPEmail };