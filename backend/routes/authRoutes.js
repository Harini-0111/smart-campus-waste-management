const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
require('dotenv').config();

// POST /api/v1/auth/send-otp - Send OTP for email verification
router.post('/send-otp', async (req, res) => {
    const { email, full_name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if email already exists
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing OTP for this email
        await db.query('DELETE FROM email_verifications WHERE email = $1', [email]);

        // Store OTP in database
        await db.query(
            'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp, full_name || 'User');

        if (emailSent) {
            const resp = { message: 'OTP sent successfully', email };
            // For local development include the OTP in the response for easier testing
            if (process.env.NODE_ENV === 'development') {
                resp.otp = otp;
                console.log(`Development OTP for ${email}: ${otp}`);
            }
            res.json(resp);
        } else {
            res.status(500).json({ error: 'Failed to send OTP email' });
        }

    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// POST /api/v1/auth/verify-otp - Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM email_verifications WHERE email = $1 AND otp = $2 AND expires_at > NOW() AND verified = false',
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as verified
        await db.query(
            'UPDATE email_verifications SET verified = true WHERE email = $1 AND otp = $2',
            [email, otp]
        );

        res.json({ message: 'Email verified successfully' });

    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ error: 'OTP verification failed' });
    }
});

// POST /api/v1/auth/register - User registration (after email verification)
router.post('/register', async (req, res) => {
    const { username, email, password, full_name, registration_number, role, department_id, phone } = req.body;

    // Validation
    if (!username || !email || !password || !full_name || !registration_number || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['student', 'admin', 'staff'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Allowed roles: student, admin, staff.' });
    }

    try {
        // Check if email is verified
        const verificationResult = await db.query(
            'SELECT * FROM email_verifications WHERE email = $1 AND verified = true',
            [email]
        );

        if (verificationResult.rows.length === 0) {
            return res.status(400).json({ error: 'Email not verified. Please verify your email first.' });
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2 OR registration_number = $3',
            [username, email, registration_number]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username, email, or registration number already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const result = await db.query(
            `INSERT INTO users (username, email, password_hash, full_name, registration_number, role, department_id, phone, email_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) 
             RETURNING id, username, email, full_name, registration_number, role, department_id`,
            [username, email, hashedPassword, full_name, registration_number, role, department_id || null, phone || null]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                department_id: user.department_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Clean up verification record
        await db.query('DELETE FROM email_verifications WHERE email = $1', [email]);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                registration_number: user.registration_number,
                role: user.role,
                department_id: user.department_id
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/v1/auth/login - User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        // Find user by username, email, or registration number
        const result = await db.query(
            `SELECT u.*, d.name as department_name, d.code as department_code 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.username = $1 OR u.email = $1 OR u.registration_number = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        // Check if email is verified
        if (!user.email_verified) {
            return res.status(401).json({ error: 'Email not verified. Please verify your email first.' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                department_id: user.department_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                registration_number: user.registration_number,
                role: user.role,
                department_id: user.department_id,
                department_name: user.department_name,
                department_code: user.department_code,
                phone: user.phone
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/v1/auth/send-login-otp - Send OTP for login (2FA for all roles)
router.post('/send-login-otp', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        // Find user by username, email, or registration number
        const result = await db.query(
            `SELECT u.*, d.name as department_name, d.code as department_code 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.username = $1 OR u.email = $1 OR u.registration_number = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing login OTP for this user
        await db.query('DELETE FROM login_verifications WHERE user_id = $1', [user.id]);

        // Store OTP in database (create table if needed)
        await db.query(
            `INSERT INTO login_verifications (user_id, email, otp, expires_at) 
             VALUES ($1, $2, $3, $4)`,
            [user.id, user.email, otp, expiresAt]
        );

        // Send OTP email
        const emailSent = await sendOTPEmail(user.email, otp, user.full_name);

        if (emailSent) {
            const resp = {
                message: 'OTP sent successfully. Please check your email.',
                email: user.email,
                requiresOTP: true
            };
            // For local development include the OTP in the response for easier testing
            if (process.env.NODE_ENV === 'development') {
                resp.otp = otp;
                console.log(`Development Login OTP for ${user.email}: ${otp}`);
            }
            res.json(resp);
        } else {
            res.status(500).json({ error: 'Failed to send OTP email' });
        }

    } catch (err) {
        console.error('Send login OTP error:', err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// POST /api/v1/auth/verify-login-otp - Verify OTP and complete login
router.post('/verify-login-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        // Verify OTP
        const result = await db.query(
            `SELECT lv.*, u.*, d.name as department_name, d.code as department_code 
             FROM login_verifications lv
             JOIN users u ON lv.user_id = u.id
             LEFT JOIN departments d ON u.department_id = d.id
             WHERE lv.email = $1 AND lv.otp = $2 AND lv.expires_at > NOW() AND lv.verified = false`,
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const user = result.rows[0];

        // Mark OTP as verified
        await db.query(
            'UPDATE login_verifications SET verified = true WHERE user_id = $1 AND otp = $2',
            [user.user_id, otp]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                department_id: user.department_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Clean up verification record
        await db.query('DELETE FROM login_verifications WHERE user_id = $1', [user.user_id]);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                registration_number: user.registration_number,
                role: user.role,
                department_id: user.department_id,
                department_name: user.department_name,
                department_code: user.department_code,
                phone: user.phone
            }
        });

    } catch (err) {
        console.error('Verify login OTP error:', err);
        res.status(500).json({ error: 'OTP verification failed' });
    }
});


// GET /api/v1/auth/me - Get current user info
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await db.query(
            `SELECT u.*, d.name as department_name, d.code as department_code 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        // Compute simple derived stats for frontend (impact points, eco level)
        try {
            const totals = await db.query(
                'SELECT COALESCE(COUNT(*),0) as reports_count, COALESCE(SUM(quantity_kg),0) as total_kg FROM waste_logs WHERE student_id = $1',
                [user.id]
            );
            const reportsCount = parseInt(totals.rows[0].reports_count);
            const totalKg = parseFloat(totals.rows[0].total_kg);

            // Simple impact points formula and eco level
            const impact_points = Math.floor(totalKg * 10);
            const eco_level = Math.min(6, Math.max(1, Math.floor(impact_points / 100) + 1));

            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                registration_number: user.registration_number,
                role: user.role,
                department_id: user.department_id,
                department_name: user.department_name,
                department_code: user.department_code,
                phone: user.phone,
                impact_points,
                eco_level,
                reports_count: reportsCount,
                total_kg: totalKg
            });
        } catch (errStats) {
            console.error('Error computing user stats:', errStats);
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                registration_number: user.registration_number,
                role: user.role,
                department_id: user.department_id,
                department_name: user.department_name,
                department_code: user.department_code,
                phone: user.phone
            });
        }

    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
