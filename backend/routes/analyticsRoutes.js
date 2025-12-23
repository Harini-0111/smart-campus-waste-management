const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { predictNextDay, analyzeRisk } = require('../utils/ml');

// GET /api/v1/analytics/prediction - Get waste prediction for a location
router.get('/prediction', authenticateToken, async (req, res) => {
    const { location_id } = req.query; // Optional: filter by location

    try {
        // Fetch daily totals for the last 30 days
        // Group by day index (0 = oldest, N = today) or just date
        // For regression, we need X (time) and Y (quantity)

        let query = `
            SELECT DATE(collected_at) as date, SUM(quantity_kg) as total 
            FROM waste_logs 
            WHERE collected_at >= NOW() - INTERVAL '30 days'
            ${location_id ? 'AND location_id = $1' : ''}
            GROUP BY DATE(collected_at)
            ORDER BY DATE(collected_at) ASC
        `;

        const params = location_id ? [location_id] : [];
        const result = await db.query(query, params);

        // Transform to format expected by ML util: [{ day_index: 0, qty: 10 }]
        const dataPoints = result.rows.map((row, index) => ({
            day_index: index,
            qty: parseFloat(row.total)
        }));

        const prediction = predictNextDay(dataPoints);

        // Also calculate overflow risk based on today's total vs Assumed Capacity (e.g., 50kg)
        const todayTotal = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].qty : 0;
        const capacity = location_id ? 50 : 200; // 50kg per block, 200kg total
        const risk = analyzeRisk(todayTotal, capacity);

        res.json({
            scope: location_id ? 'location' : 'global',
            historical_data_points: dataPoints.length,
            prediction,
            risk,
            forecast_message: `Predicted waste for tomorrow: ${prediction.prediction} kg (${prediction.trend}).`
        });

    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
