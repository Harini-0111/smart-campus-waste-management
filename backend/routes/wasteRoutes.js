const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/v1/departments - Get all departments (public for dropdown)
router.get('/departments', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM departments ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

// GET /api/v1/locations - alias of departments for frontend location dropdown
router.get('/locations', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name FROM departments ORDER BY name');
        // Map to { id, name }
        res.json(result.rows.map(r => ({ id: r.id, name: r.name })));
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/waste - Student reports waste
router.post('/waste', authenticateToken, authorizeRoles('student'), async (req, res) => {
    // Accept either department_id (legacy) or location_id from frontend
    const { department_id, location_id, waste_type, quantity_kg, location_description, image_url, description, severity } = req.body;

    const deptId = department_id || location_id;

    if (!deptId || !waste_type || !quantity_kg) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // If no location_description provided, try to use department name
        let locDesc = location_description || null;
        if (!locDesc) {
            const dept = await db.query('SELECT name FROM departments WHERE id = $1', [deptId]);
            locDesc = dept.rows[0]?.name || null;
        }

        const result = await db.query(
            `INSERT INTO waste_logs (student_id, department_id, waste_type, quantity_kg, location_description, image_url, description, severity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [req.user.id, deptId, waste_type, quantity_kg, locDesc, image_url || null, description || null, severity || 'Normal']
        );

        // Get department info for response
        const deptResult = await db.query('SELECT name FROM departments WHERE id = $1', [deptId]);

        res.status(201).json({
            ...result.rows[0],
            department_name: deptResult.rows[0]?.name
        });
    } catch (err) {
        console.error('Error reporting waste:', err);
        res.status(500).json({ error: 'Failed to report waste' });
    }
});

// GET /api/v1/waste/reports - Admin gets waste reports for their department
router.get('/waste/reports', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        let query = `
            SELECT w.*, u.full_name as student_name, u.username, d.name as department_name, d.code as department_code
            FROM waste_logs w
            JOIN users u ON w.student_id = u.id
            JOIN departments d ON w.department_id = d.id
        `;
        let params = [];

        // Admin can only see reports from their department
        if (req.user.department_id) {
            query += ' WHERE w.department_id = $1';
            params.push(req.user.department_id);
        }

        query += ' ORDER BY w.reported_at DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching waste reports:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET /api/v1/waste/my-reports - Student gets their own reports
router.get('/waste/my-reports', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT w.*, d.name as department_name, d.code as department_code
             FROM waste_logs w
             JOIN departments d ON w.department_id = d.id
             WHERE w.student_id = $1
             ORDER BY w.reported_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user reports:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET /api/v1/history - Unified history for both admins and students
router.get('/history', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT w.*, u.full_name as student_name, u.username, d.name as location_name, d.code as department_code
            FROM waste_logs w
            JOIN users u ON w.student_id = u.id
            JOIN departments d ON w.department_id = d.id
        `;
        let params = [];

        if (req.user.role === 'student' || req.user.role === 'staff') {
            query += ' WHERE w.student_id = $1';
            params.push(req.user.id);
        } else if (req.user.role === 'admin' || req.user.role === 'block_admin') {
            if (req.user.department_id) {
                query += ' WHERE w.department_id = $1';
                params.push(req.user.department_id);
            }
        }

        query += ' ORDER BY w.reported_at DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch history data' });
    }
});

// GET /api/v1/dashboard - Dashboard data based on role
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        let dashboardData = {};

        if (req.user.role === 'student') {
            // Student dashboard - their own stats
            const totalReports = await db.query(
                'SELECT COUNT(*) as count FROM waste_logs WHERE student_id = $1',
                [req.user.id]
            );

            const totalKg = await db.query(
                'SELECT COALESCE(SUM(quantity_kg), 0) as total FROM waste_logs WHERE student_id = $1',
                [req.user.id]
            );

            const byType = await db.query(
                `SELECT waste_type, COUNT(*) as count, COALESCE(SUM(quantity_kg), 0) as total_kg 
                 FROM waste_logs WHERE student_id = $1 
                 GROUP BY waste_type`,
                [req.user.id]
            );

            const recentReports = await db.query(
                `SELECT w.*, d.name as department_name 
                 FROM waste_logs w 
                 JOIN departments d ON w.department_id = d.id 
                 WHERE w.student_id = $1 
                 ORDER BY w.reported_at DESC LIMIT 5`,
                [req.user.id]
            );

            dashboardData = {
                total_reports: parseInt(totalReports.rows[0].count),
                total_kg: parseFloat(totalKg.rows[0].total),
                total_today: parseFloat(totalKg.rows[0].total), // Map for stats card
                by_type: byType.rows.map(r => ({
                    name: r.waste_type,
                    count: parseInt(r.count),
                    value: parseFloat(r.total_kg) // Map for chart
                })),
                recent: recentReports.rows,
                by_location: [] // Fallback for student
            };

        } else if (req.user.role === 'admin') {
            // Admin dashboard - department stats
            const totalToday = await db.query(
                `SELECT COALESCE(SUM(quantity_kg), 0) as total 
                 FROM waste_logs 
                 WHERE DATE(reported_at) = CURRENT_DATE 
                 ${req.user.department_id ? 'AND department_id = $1' : ''}`,
                req.user.department_id ? [req.user.department_id] : []
            );

            const byType = await db.query(
                `SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as total 
                 FROM waste_logs 
                 ${req.user.department_id ? 'WHERE department_id = $1' : ''}
                 GROUP BY waste_type`,
                req.user.department_id ? [req.user.department_id] : []
            );

            const pendingReports = await db.query(
                `SELECT COUNT(*) as count 
                 FROM waste_logs 
                 WHERE status = 'Reported' 
                 ${req.user.department_id ? 'AND department_id = $1' : ''}`,
                req.user.department_id ? [req.user.department_id] : []
            );

            const recentReports = await db.query(
                `SELECT w.*, u.full_name as student_name, d.name as location_name 
                 FROM waste_logs w 
                 JOIN users u ON w.student_id = u.id 
                 JOIN departments d ON w.department_id = d.id 
                 ${req.user.department_id ? 'WHERE w.department_id = $1' : ''}
                 ORDER BY w.reported_at DESC LIMIT 10`,
                req.user.department_id ? [req.user.department_id] : []
            );

            const byLocation = await db.query(
                `SELECT d.name, COALESCE(SUM(w.quantity_kg), 0) as value
                 FROM departments d
                 LEFT JOIN waste_logs w ON d.id = w.department_id
                 GROUP BY d.name
                 ORDER BY value DESC`
            );

            dashboardData = {
                total_today: parseFloat(totalToday.rows[0].total),
                by_type: byType.rows.map(r => ({
                    name: r.waste_type,
                    value: parseFloat(r.total)
                })),
                by_location: byLocation.rows.map(r => ({
                    name: r.name,
                    value: parseFloat(r.value)
                })),
                pending_reports: parseInt(pendingReports.rows[0].count),
                recent: recentReports.rows.map(r => ({
                    ...r,
                    location_name: r.location_name // Ensure it matches frontend
                }))
            };

        } else if (req.user.role === 'staff') {
            // Staff dashboard - assigned tasks
            const assignedTasks = await db.query(
                `SELECT COUNT(*) as count 
                 FROM tasks 
                 WHERE assigned_to = $1 AND status IN ('Assigned', 'In Progress')`,
                [req.user.id]
            );

            const completedTasks = await db.query(
                `SELECT COUNT(*) as count 
                 FROM tasks 
                 WHERE assigned_to = $1 AND status = 'Completed'`,
                [req.user.id]
            );

            const recentTasks = await db.query(
                `SELECT t.*, w.waste_type, w.location_description, d.name as department_name 
                 FROM tasks t 
                 JOIN waste_logs w ON t.waste_log_id = w.id 
                 JOIN departments d ON w.department_id = d.id 
                 WHERE t.assigned_to = $1 
                 ORDER BY t.created_at DESC LIMIT 5`,
                [req.user.id]
            );

            dashboardData = {
                assigned_tasks: parseInt(assignedTasks.rows[0].count),
                completed_tasks: parseInt(completedTasks.rows[0].count),
                recent_tasks: recentTasks.rows
            };
        }

        res.json(dashboardData);
    } catch (err) {
        console.error('Error fetching dashboard:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;