const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { predictNextDay, detectHotspots, calculateEfficiency } = require('../utils/ml');

// GET /api/v1/analytics/prediction - Get waste prediction
router.get('/prediction', authenticateToken, async (req, res) => {
    const { location_id } = req.query;

    try {
        const query = `
            SELECT DATE(collected_at) as date, SUM(quantity_kg) as total 
            FROM waste_logs 
            WHERE collected_at >= NOW() - INTERVAL '30 days'
            ${location_id ? 'AND location_id = $1' : ''}
            GROUP BY DATE(collected_at)
            ORDER BY DATE(collected_at) ASC
        `;

        const params = location_id ? [location_id] : [];
        const result = await db.query(query, params);

        const dataPoints = result.rows.map((row, index) => ({
            day_index: index,
            qty: parseFloat(row.total)
        }));

        const prediction = predictNextDay(dataPoints);

        res.json({
            historical_data_points: dataPoints.length,
            prediction,
            forecast_message: `Predicted: ${prediction.prediction} kg (${prediction.trend}).`
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/analytics/hotspots - Identify problem zones
router.get('/hotspots', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const result = await db.query(`
            SELECT wl.location_id, wl.severity, wl.quantity_kg, l.name as location_name
            FROM waste_logs wl
            JOIN locations l ON wl.location_id = l.id
            WHERE wl.collected_at >= NOW() - INTERVAL '7 days'
        `);

        const hotspots = detectHotspots(result.rows);
        res.json(hotspots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/analytics/efficiency - Staff Performance
router.get('/efficiency', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.assigned_to as staff_id, t.status, u.username as staff_name,
            EXTRACT(EPOCH FROM (t.updated_at - t.created_at))/3600 as response_time_hrs
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
        `);

        const efficiency = calculateEfficiency(result.rows);
        res.json(efficiency);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

