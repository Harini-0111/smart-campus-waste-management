const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// GET /api/v1/users/staff - Get staff members (admin only)
router.get('/staff', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // Admin can see staff from their department or all if no department restriction
        let query = `
            SELECT u.id, u.username, u.full_name, u.email, u.phone, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'staff' AND u.is_active = true
        `;
        let params = [];

        // If admin has department restriction, only show staff from same department
        if (req.user.department_id) {
            query += ' AND (u.department_id = $1 OR u.department_id IS NULL)';
            params.push(req.user.department_id);
        }

        query += ' ORDER BY u.full_name';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching staff:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/v1/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.*, d.name as department_name, d.code as department_code 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.id = $1`,
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        // Remove password hash from response
        delete user.password_hash;
        
        res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/v1/users/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { full_name, email, phone } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name), 
                 email = COALESCE($2, email), 
                 phone = COALESCE($3, phone),
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING id, username, email, full_name, role, department_id, phone`,
            [full_name, email, phone, req.user.id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating profile:', err);
        if (err.code === '23505') { // Unique constraint violation
            res.status(409).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// GET /api/v1/users/stats - Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        let stats = {};

        if (req.user.role === 'student') {
            const result = await db.query(
                `SELECT 
                    COUNT(*) as total_reports,
                    COALESCE(SUM(quantity_kg), 0) as total_kg,
                    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_reports
                 FROM waste_logs 
                 WHERE student_id = $1`,
                [req.user.id]
            );
            stats = result.rows[0];
        } else if (req.user.role === 'admin') {
            const result = await db.query(
                `SELECT 
                    COUNT(DISTINCT w.id) as total_reports,
                    COUNT(DISTINCT t.id) as total_tasks,
                    COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks
                 FROM waste_logs w
                 LEFT JOIN tasks t ON w.id = t.waste_log_id
                 WHERE w.department_id = $1`,
                [req.user.department_id]
            );
            stats = result.rows[0];
        } else if (req.user.role === 'staff') {
            const result = await db.query(
                `SELECT 
                    COUNT(*) as assigned_tasks,
                    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
                    COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tasks
                 FROM tasks 
                 WHERE assigned_to = $1`,
                [req.user.id]
            );
            stats = result.rows[0];
        }

        res.json(stats);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/users/staff - Admin creates a staff user (username, password, full_name, email, department_id)
router.post('/staff', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { username, password, full_name, email, department_id, phone } = req.body;

    if (!username || !password || !full_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash password
        const hashed = await bcrypt.hash(password, 12);

        const result = await db.query(
            `INSERT INTO users (username, email, password_hash, full_name, registration_number, role, department_id, phone, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
             RETURNING id, username, email, full_name, role, department_id`,
            [username, email || null, hashed, full_name, `STAFF-${Date.now()}`, 'staff', department_id || req.user.department_id || null, phone || null]
        );

        res.status(201).json({ message: 'Staff user created', user: result.rows[0] });
    } catch (err) {
        console.error('Error creating staff user:', err);
        if (err.code === '23505') {
            res.status(409).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create staff user' });
        }
    }
});

module.exports = router;

