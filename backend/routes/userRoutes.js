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

module.exports = router;
