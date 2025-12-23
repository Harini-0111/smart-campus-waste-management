const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
                location_id: user.location_id,
                impact_points: user.impact_points,
                eco_level: user.eco_level
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    const { username, password, role, location_id } = req.body;
    // Basic validation
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
            [username, hashedPassword, role || 'student', location_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed (username might be taken)' });
    }
});

module.exports = router;
