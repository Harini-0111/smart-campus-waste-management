const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes (if any) - Departments for dropdowns
// GET /api/v1/locations (keeping for backwards compatibility but returning departments)
router.get('/locations', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, code, description FROM departments ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching departments:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/waste - Authenticated Users only
router.post('/waste', authenticateToken, async (req, res) => {
    const { location_id, waste_type, quantity_kg, image_url, description, department_id } = req.body;
    const studentId = req.user.id; // Get authenticated user's ID
    console.log('Received payload:', req.body); // Debug log

    if (!waste_type || !quantity_kg || !department_id) {
        return res.status(400).json({ error: 'Missing required fields: waste_type, quantity_kg, department_id' });
    }

    try {
        const result = await db.query(
            `INSERT INTO waste_logs (student_id, department_id, waste_type, quantity_kg, location_description, image_url, description, status, reported_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'Reported', NOW()) RETURNING *`,
            [studentId, department_id, waste_type, quantity_kg, location_id || 'General', image_url || null, description || null]
        );
        const inserted = result.rows[0];

        // Optional demo auto-assignment to speed up loop
        if (process.env.AUTO_ASSIGN === 'true') {
            try {
                const staffRes = await db.query("SELECT id FROM users WHERE role = 'staff' ORDER BY id LIMIT 1");
                if (staffRes.rowCount > 0) {
                    const staffId = staffRes.rows[0].id;
                    await db.query(
                        `INSERT INTO tasks (waste_log_id, assigned_by, assigned_to, status, priority, assigned_at, created_at)
                         VALUES ($1, $2, $3, 'Assigned', 'Normal', NOW(), NOW())`,
                        [inserted.id, studentId, staffId]
                    );
                    await db.query(`UPDATE waste_logs SET status = 'Assigned', updated_at = NOW() WHERE id = $1`, [inserted.id]);
                    inserted.status = 'Assigned';
                }
            } catch (autoErr) {
                console.warn('Auto-assign failed:', autoErr.message);
            }
        }

        res.status(201).json(inserted);
    } catch (err) {
        console.error('Error adding waste:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/dashboard - Admin only
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const totalToday = await db.query(
            'SELECT COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs WHERE DATE(reported_at) = CURRENT_DATE'
        );

        const byType = await db.query(
            'SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs GROUP BY waste_type'
        );

        const byDepartment = await db.query(
            `SELECT d.name, COALESCE(SUM(w.quantity_kg), 0) as total 
             FROM departments d 
             LEFT JOIN waste_logs w ON d.id = w.department_id 
             GROUP BY d.name`
        );

        const recent = await db.query(
            `SELECT 
                w.*, 
                d.name as department_name,
                u.username as student_name
             FROM waste_logs w 
             LEFT JOIN departments d ON w.department_id = d.id
             LEFT JOIN users u ON w.student_id = u.id
             ORDER BY w.reported_at DESC 
             LIMIT 10`
        );

        res.json({
            total_today: parseFloat(totalToday.rows[0].total),
            by_type: byType.rows.map(r => ({ name: r.waste_type, value: parseFloat(r.total) })),
            by_location: byDepartment.rows.map(r => ({ name: r.name, value: parseFloat(r.total) })),
            recent: recent.rows
        });
    } catch (err) {
        console.error('Error fetching dashboard:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET /api/v1/history - Authenticated Users (show only their own logs)
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT * FROM waste_logs WHERE student_id = $1 ORDER BY reported_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching history:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
