const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes (if any) - Locations might be public? Let's make it public for dropdowns
// GET /api/v1/locations
router.get('/locations', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM locations');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching locations:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/waste - Authenticated Users only
router.post('/waste', authenticateToken, async (req, res) => {
    const { location_id, waste_type, quantity_kg, image_url, description } = req.body;
    console.log('Received payload:', req.body); // Debug log

    if (!location_id || !waste_type || !quantity_kg) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const result = await db.query(
            'INSERT INTO waste_logs (location_id, waste_type, quantity_kg, image_url, description, collected_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [location_id, waste_type, quantity_kg, image_url || null, description || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding waste:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/dashboard - Admin only
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const totalToday = await db.query(
            'SELECT COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs WHERE DATE(collected_at) = CURRENT_DATE'
        );

        const byType = await db.query(
            'SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs GROUP BY waste_type'
        );

        const byLocation = await db.query(
            'SELECT l.name, COALESCE(SUM(w.quantity_kg), 0) as total FROM locations l LEFT JOIN waste_logs w ON l.id = w.location_id GROUP BY l.name'
        );

        const recent = await db.query(
            'SELECT w.*, l.name as location_name FROM waste_logs w LEFT JOIN locations l ON w.location_id = l.id ORDER BY collected_at DESC LIMIT 5'
        );

        res.json({
            total_today: parseFloat(totalToday.rows[0].total),
            by_type: byType.rows.map(r => ({ name: r.waste_type, value: parseFloat(r.total) })),
            by_location: byLocation.rows.map(r => ({ name: r.name, value: parseFloat(r.total) })),
            recent: recent.rows
        });
    } catch (err) {
        console.error('Error fetching dashboard:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET /api/v1/history - Authenticated Users
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT w.*, l.name as location_name FROM waste_logs w LEFT JOIN locations l ON w.location_id = l.id ORDER BY collected_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching history:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
