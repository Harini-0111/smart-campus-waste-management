const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
require('dotenv').config();

// Ensure supporting schema exists for OTP + email capture without breaking existing data
const ensureEmailVerificationTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS email_verifications (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            username VARCHAR(50),
            otp VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const ensureUserEmailColumns = async () => {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;`);
};

const isEmailColumnAvailable = async () => {
    const colCheck = await db.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name='users' AND column_name='email'
    `);
    return colCheck.rowCount > 0;
};

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, location_id: user.location_id },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                location_id: user.location_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/auth/register/send-otp
router.post('/register/send-otp', async (req, res) => {
    const { email, username } = req.body;
    if (!email || !username) return res.status(400).json({ error: 'Email and username are required' });

    try {
        await ensureEmailVerificationTable();

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.query(
            `INSERT INTO email_verifications (email, username, otp, expires_at, verified)
             VALUES ($1, $2, $3, $4, false)
             ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, verified = false, username = EXCLUDED.username`,
            [email, username, otp, expiresAt]
        );

        const emailSent = await sendOTPEmail(email, otp, username);
        if (!emailSent) {
            return res.status(500).json({ error: 'Could not send OTP email. Check email credentials.' });
        }

        res.json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// POST /api/v1/auth/register/complete (verify OTP + create account)
router.post('/register/complete', async (req, res) => {
    const { username, email, password, role, location_id, otp } = req.body;
    if (!username || !email || !password || !otp) {
        return res.status(400).json({ error: 'Username, email, password and OTP are required' });
    }

    try {
        await ensureEmailVerificationTable();
        await ensureUserEmailColumns();

        // Validate OTP
        const otpRecord = await db.query(
            `SELECT * FROM email_verifications WHERE email = $1 AND otp = $2 LIMIT 1`,
            [email, otp]
        );

        if (otpRecord.rowCount === 0) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const verification = otpRecord.rows[0];
        if (new Date(verification.expires_at) < new Date()) {
            return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
        }

        // Check for duplicates
        const emailColumnExists = await isEmailColumnAvailable();
        const duplicateUserQuery = emailColumnExists
            ? 'SELECT 1 FROM users WHERE username = $1 OR email = $2'
            : 'SELECT 1 FROM users WHERE username = $1';
        const duplicateUserParams = emailColumnExists ? [username, email] : [username];
        const duplicateCheck = await db.query(duplicateUserQuery, duplicateUserParams);
        if (duplicateCheck.rowCount > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);

        if (emailColumnExists) {
            await db.query(
                'INSERT INTO users (username, password_hash, role, location_id, email, email_verified) VALUES ($1, $2, $3, $4, $5, true)',
                [username, hashedPassword, role || 'student', location_id || null, email]
            );
        } else {
            await db.query(
                'INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, $3, $4)',
                [username, hashedPassword, role || 'student', location_id || null]
            );
        }

        // Mark verification used
        await db.query('UPDATE email_verifications SET verified = true WHERE email = $1', [email]);

        res.status(201).json({ success: true, message: 'Account created and email verified' });
    } catch (err) {
        console.error('Register with OTP error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

module.exports = router;
