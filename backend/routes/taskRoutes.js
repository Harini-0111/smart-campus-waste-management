const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/v1/tasks - Get all tasks (Super Admin) or tasks for a block (Block Admin)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT t.*, w.waste_type, w.quantity_kg, l.name as location_name, u.username as assigned_to_name
            FROM tasks t
            JOIN waste_logs w ON t.waste_log_id = w.id
            JOIN locations l ON w.location_id = l.id
            LEFT JOIN users u ON t.assigned_to = u.id
        `;
        const params = [];

        if (req.user.role === 'block_admin') {
            query += ` WHERE w.location_id = $1`;
            params.push(req.user.location_id);
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch tasks error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/v1/tasks - Assign a waste report to a staff member
router.post('/', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    const { waste_log_id, assigned_to } = req.body;

    try {
        // Check if task already exists for this log
        const check = await db.query('SELECT id FROM tasks WHERE waste_log_id = $1', [waste_log_id]);

        if (check.rows.length > 0) {
            // Update existing task
            const update = await db.query(
                'UPDATE tasks SET assigned_to = $1, status = $2, updated_at = NOW() WHERE waste_log_id = $3 RETURNING *',
                [assigned_to, 'Assigned', waste_log_id]
            );
            return res.json(update.rows[0]);
        }

        const result = await db.query(
            'INSERT INTO tasks (waste_log_id, assigned_to, status) VALUES ($1, $2, $3) RETURNING *',
            [waste_log_id, assigned_to, 'Assigned']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Assign task error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/v1/tasks/:id/status - Update task status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await db.query(
            'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
