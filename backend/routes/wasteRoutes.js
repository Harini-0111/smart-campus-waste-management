const express = require('express');
const router = express.Router();
const db = require('../db');

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

// POST /api/v1/waste
router.post('/waste', async (req, res) => {
    const { location_id, waste_type, quantity_kg } = req.body;
    console.log('Received payload:', req.body); // Debug log

    if (!location_id || !waste_type || !quantity_kg) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const result = await db.query(
            'INSERT INTO waste_logs (location_id, waste_type, quantity_kg, collected_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [location_id, waste_type, quantity_kg]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding waste:', err.message); // Better logging
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const totalToday = await db.query(
            'SELECT COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs WHERE DATE(collected_at) = CURRENT_DATE'
        );

        const byType = await db.query(
            'SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs GROUP BY waste_type'
        );

        const recent = await db.query(
            'SELECT w.*, l.name as location_name FROM waste_logs w LEFT JOIN locations l ON w.location_id = l.id ORDER BY collected_at DESC LIMIT 5'
        );

        res.json({
            total_today: parseFloat(totalToday.rows[0].total),
            by_type: byType.rows.map(r => ({ name: r.waste_type, value: parseFloat(r.total) })),
            recent: recent.rows
        });
    } catch (err) {
        console.error('Error fetching dashboard:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET /api/v1/history
router.get('/history', async (req, res) => {
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
