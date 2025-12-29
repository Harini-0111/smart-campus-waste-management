const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/v1/users/staff - Only accessible by Admins
router.get('/staff', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, username, role FROM users WHERE role = 'staff'"
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching staff:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/v1/users/me/stats - Get current user's waste stats and environmental impact
router.get('/me/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get total waste logged by this user
        const totalResult = await db.query(
            'SELECT COALESCE(SUM(quantity_kg), 0) as total_waste FROM waste_logs WHERE id = $1',
            [userId]
        );

        // Get breakdown by type
        const byTypeResult = await db.query(
            'SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs WHERE id = $1 GROUP BY waste_type',
            [userId]
        );

        // Get total entries count
        const countResult = await db.query(
            'SELECT COUNT(*) as total_logs FROM waste_logs WHERE id = $1',
            [userId]
        );

        res.json({
            total_waste_kg: parseFloat(totalResult.rows[0].total_waste),
            by_type: byTypeResult.rows.map(r => ({ type: r.waste_type, value: parseFloat(r.total) })),
            total_logs: parseInt(countResult.rows[0].total_logs)
        });
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
