const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { predictNextDay, detectHotspots, calculateEfficiency } = require('../utils/ml');

// GET /api/v1/analytics/prediction - Get waste prediction
router.get('/prediction', authenticateToken, async (req, res) => {
    const { department_id } = req.query;

    try {
        let query = `
            SELECT DATE(reported_at) as date, SUM(quantity_kg) as total 
            FROM waste_logs 
            WHERE reported_at >= NOW() - INTERVAL '30 days'
        `;
        let params = [];

        // Filter by department if specified or user's department
        const filterDept = department_id || req.user.department_id;
        if (filterDept) {
            query += ' AND department_id = $1';
            params.push(filterDept);
        }

        query += ' GROUP BY DATE(reported_at) ORDER BY DATE(reported_at) ASC';

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
router.get('/hotspots', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        let query = `
            SELECT w.department_id, w.severity, w.quantity_kg, d.name as department_name
            FROM waste_logs w
            JOIN departments d ON w.department_id = d.id
            WHERE w.reported_at >= NOW() - INTERVAL '7 days'
        `;
        let params = [];

        // Filter by admin's department if they have one
        if (req.user.department_id) {
            query += ' AND w.department_id = $1';
            params.push(req.user.department_id);
        }

        const result = await db.query(query, params);

        const hotspots = detectHotspots(result.rows.map(row => ({
            location_id: row.department_id,
            location_name: row.department_name,
            severity: row.severity,
            quantity_kg: row.quantity_kg
        })));

        res.json(hotspots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/analytics/efficiency - Staff Performance
router.get('/efficiency', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        let query = `
            SELECT t.assigned_to as staff_id, t.status, u.full_name as staff_name,
            EXTRACT(EPOCH FROM (t.updated_at - t.created_at))/3600 as response_time_hrs
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            JOIN waste_logs w ON t.waste_log_id = w.id
        `;
        let params = [];

        // Filter by admin's department if they have one
        if (req.user.department_id) {
            query += ' WHERE w.department_id = $1';
            params.push(req.user.department_id);
        }

        const result = await db.query(query, params);

        const efficiency = calculateEfficiency(result.rows);
        res.json(efficiency);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/analytics/department-stats - Department-wise statistics
router.get('/department-stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        let query = `
            SELECT 
                d.name as department_name,
                d.code as department_code,
                COUNT(w.id) as total_reports,
                COALESCE(SUM(w.quantity_kg), 0) as total_kg,
                COUNT(CASE WHEN w.status = 'Completed' THEN 1 END) as completed_reports,
                COUNT(CASE WHEN w.severity = 'High' OR w.severity = 'Critical' THEN 1 END) as high_priority_reports
            FROM departments d
            LEFT JOIN waste_logs w ON d.id = w.department_id
        `;
        let params = [];

        // Filter by admin's department if they have one
        if (req.user.department_id) {
            query += ' WHERE d.id = $1';
            params.push(req.user.department_id);
        }

        query += ' GROUP BY d.id, d.name, d.code ORDER BY total_reports DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

