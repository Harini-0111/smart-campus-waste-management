const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/v1/tasks - Get tasks based on role
router.get('/', authenticateToken, async (req, res) => {
    try {
        let query, params = [];

        if (req.user.role === 'admin') {
            // Admin sees tasks for their department
            query = `
                SELECT t.*, w.waste_type, w.quantity_kg, w.location_description as location_name, w.description as waste_description,
                       d.name as department_name, u_student.full_name as student_name,
                       u_staff.full_name as assigned_to_name, u_staff.username as assigned_to_username,
                       t.waste_log_id
                FROM tasks t
                JOIN waste_logs w ON t.waste_log_id = w.id
                JOIN departments d ON w.department_id = d.id
                JOIN users u_student ON w.student_id = u_student.id
                LEFT JOIN users u_staff ON t.assigned_to = u_staff.id
                WHERE t.assigned_by = $1 OR w.department_id = $2
                ORDER BY t.created_at DESC
            `;
            params = [req.user.id, req.user.department_id];
        } else if (req.user.role === 'staff') {
            // Staff sees only their assigned tasks
            query = `
                SELECT t.*, w.waste_type, w.quantity_kg, w.location_description as location_name, w.description as waste_description,
                       d.name as department_name, u_student.full_name as student_name, t.waste_log_id
                FROM tasks t
                JOIN waste_logs w ON t.waste_log_id = w.id
                JOIN departments d ON w.department_id = d.id
                JOIN users u_student ON w.student_id = u_student.id
                WHERE t.assigned_to = $1
                ORDER BY t.created_at DESC
            `;
            params = [req.user.id];
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch tasks error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/v1/tasks - Admin creates task from waste report
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { waste_log_id, assigned_to, priority } = req.body;

    if (!waste_log_id) {
        return res.status(400).json({ error: 'Waste log ID is required' });
    }

    try {
        // Check if waste log exists and belongs to admin's department
        const wasteCheck = await db.query(
            'SELECT * FROM waste_logs WHERE id = $1 AND department_id = $2',
            [waste_log_id, req.user.department_id]
        );

        if (wasteCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Waste report not found or access denied' });
        }

        // Check if task already exists for this waste log
        const existingTask = await db.query(
            'SELECT id FROM tasks WHERE waste_log_id = $1',
            [waste_log_id]
        );

        if (existingTask.rows.length > 0) {
            return res.status(409).json({ error: 'Task already exists for this waste report' });
        }

        // Create task
        const result = await db.query(
            `INSERT INTO tasks (waste_log_id, assigned_by, assigned_to, priority, status, assigned_at) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [
                waste_log_id, 
                req.user.id, 
                assigned_to || null, 
                priority || 'Normal',
                assigned_to ? 'Assigned' : 'Created',
                assigned_to ? new Date() : null
            ]
        );

        // Update waste log status
        await db.query(
            'UPDATE waste_logs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [assigned_to ? 'Assigned' : 'Reported', waste_log_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT /api/v1/tasks/:id/assign - Admin assigns task to staff
router.put('/:id/assign', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
        return res.status(400).json({ error: 'Staff ID is required' });
    }

    try {
        // Verify staff member exists and is active
        const staffCheck = await db.query(
            'SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true',
            [assigned_to, 'staff']
        );

        if (staffCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Staff member not found or inactive' });
        }

        // Update task
        const result = await db.query(
            `UPDATE tasks 
             SET assigned_to = $1, status = 'Assigned', assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 AND assigned_by = $3 
             RETURNING *`,
            [assigned_to, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        // Update corresponding waste log status
        await db.query(
            `UPDATE waste_logs 
             SET status = 'Assigned', updated_at = CURRENT_TIMESTAMP 
             WHERE id = (SELECT waste_log_id FROM tasks WHERE id = $1)`,
            [id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Assign task error:', err);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});

// PATCH /api/v1/tasks/:id/status - Update task status (staff or admin)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, completion_image_url, completion_notes } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        let query, params;

        if (req.user.role === 'staff') {
            // Staff can only update their own tasks
            query = `
                UPDATE tasks 
                SET status = $1, completion_image_url = $2, completion_notes = $3, 
                    completed_at = $4, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $5 AND assigned_to = $6 
                RETURNING *
            `;
            params = [
                status, 
                completion_image_url || null, 
                completion_notes || null,
                status === 'Completed' ? new Date() : null,
                id, 
                req.user.id
            ];
        } else if (req.user.role === 'admin') {
            // Admin can update any task in their department
            query = `
                UPDATE tasks 
                SET status = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 AND assigned_by = $3 
                RETURNING *
            `;
            params = [status, id, req.user.id];
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        // Update corresponding waste log status
        let wasteStatus = 'Reported';
        if (status === 'In Progress') wasteStatus = 'In Progress';
        else if (status === 'Completed') wasteStatus = 'Completed';
        else if (status === 'Verified') wasteStatus = 'Verified';

        await db.query(
            `UPDATE waste_logs 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = (SELECT waste_log_id FROM tasks WHERE id = $2)`,
            [wasteStatus, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update task status error:', err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// GET /api/v1/tasks/unassigned - Admin gets unassigned waste reports
router.get('/unassigned', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT w.*, u.full_name as student_name, d.name as department_name 
             FROM waste_logs w
             JOIN users u ON w.student_id = u.id
             JOIN departments d ON w.department_id = d.id
             LEFT JOIN tasks t ON w.id = t.waste_log_id
             WHERE t.id IS NULL AND w.department_id = $1
             ORDER BY w.reported_at DESC`,
            [req.user.department_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching unassigned reports:', err);
        res.status(500).json({ error: 'Failed to fetch unassigned reports' });
    }
});

// Alias endpoint expected by frontend
router.get('/unassigned-waste', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT w.id, w.waste_type, w.quantity_kg, w.location_description as location_name, w.description, w.reported_at as collected_at, u.full_name as student_name, d.name as department_name
             FROM waste_logs w
             JOIN users u ON w.student_id = u.id
             JOIN departments d ON w.department_id = d.id
             LEFT JOIN tasks t ON w.id = t.waste_log_id
             WHERE t.id IS NULL AND w.department_id = $1
             ORDER BY w.reported_at DESC`,
            [req.user.department_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching unassigned reports (alias):', err);
        res.status(500).json({ error: 'Failed to fetch unassigned reports' });
    }
});

module.exports = router;
