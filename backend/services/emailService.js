const nodemailer = require('nodemailer');
require('dotenv').config();

// Helper to create transporter depending on environment
const createTransporter = async () => {
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
    const emailUser = process.env.EMAIL_USER;

    if (!emailUser || !emailPass) {
        console.warn('⚠️  Email credentials not configured. Using development mode (Ethereal).');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    // Production: use Gmail with robust SMTP settings
    console.log(`📧 Using Gmail SMTP for: ${emailUser.substring(0, 3)}***${emailUser.substring(emailUser.indexOf('@'))}`);
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
    console.log(`\n📧 Attempting to send OTP to: ${email}`);
    console.log(`🔐 OTP Code: ${otp}`);

    const mailOptions = {
        from: {
            name: 'EcoCampus System',
            address: process.env.EMAIL_USER || 'noreply@ecocampus.edu'
        },
        to: email,
        subject: '🔐 EcoCampus Email Verification - OTP Code',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background-color: white; }
                    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
                    .header p { color: #dcfce7; margin: 10px 0 0 0; font-size: 14px; }
                    .content { padding: 40px 30px; }
                    .otp-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                    .otp-code { font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px; margin: 10px 0; }
                    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
                    .footer p { color: #64748b; font-size: 12px; margin: 5px 0; }
                    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
                    .warning p { color: #dc2626; margin: 0; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌱 EcoCampus</h1>
                        <p>Smart Waste Management System</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name}!</h2>
                        <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                            Welcome to EcoCampus! To complete your verification, please use the OTP code below:
                        </p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #059669; font-weight: bold;">Your Verification Code</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
                        </div>
                        
                        <p style="color: #475569; line-height: 1.6;">
                            Enter this code to verify your email and continue.
                        </p>
                        
                        <div class="warning">
                            <p><strong>Security Notice:</strong> Never share this OTP with anyone. EcoCampus will never ask for your OTP via phone or email.</p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>EcoCampus Team</strong></p>
                        <p>Building a sustainable future, one campus at a time 🌍</p>
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const transporter = await createTransporter();
        console.log('📧 Transporter created, sending email...');

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);

        // Check if using Ethereal (test account)
        if (info.messageId && info.messageId.includes('ethereal')) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`\n📬 Preview URL (Ethereal): ${previewUrl}`);
            console.log(`🔐 OTP for ${email}: ${otp}\n`);
            return { success: true, previewUrl, otp };
        }

        return { success: true };

    } catch (error) {
        console.error('\n❌ Email sending failed!');
        console.error('   Error Message:', error.message);
        console.error('   Error Code:', error.code || 'N/A');

        // Re-throw the error so the route handler knows it failed
        throw error;
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};