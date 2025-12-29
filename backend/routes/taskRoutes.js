const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/v1/tasks/new-reports-count - Admin only (for notification badge)
router.get('/new-reports-count', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT COUNT(*) as count FROM waste_logs 
             WHERE status = 'Reported' 
             AND id NOT IN (SELECT waste_log_id FROM tasks WHERE waste_log_id IS NOT NULL)`
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error('Error fetching new reports count:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/v1/tasks/unassigned - Admin only (get new reports needing assignment)
router.get('/unassigned', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                w.*,
                u.username as student_name,
                d.name as department_name
             FROM waste_logs w
             LEFT JOIN users u ON w.student_id = u.id
             LEFT JOIN departments d ON w.department_id = d.id
             WHERE w.status = 'Reported'
             AND w.id NOT IN (SELECT waste_log_id FROM tasks WHERE waste_log_id IS NOT NULL)
             ORDER BY w.reported_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching unassigned reports:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/v1/tasks/assign - Admin only (assign task to staff)
router.post('/assign', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    const { waste_log_id, staff_id, priority } = req.body;
    const adminId = req.user.id;

    if (!waste_log_id || !staff_id) {
        return res.status(400).json({ error: 'waste_log_id and staff_id are required' });
    }

    try {
        // Create task
        const taskResult = await db.query(
            `INSERT INTO tasks (waste_log_id, assigned_by, assigned_to, status, priority, assigned_at, created_at)
             VALUES ($1, $2, $3, 'Assigned', $4, NOW(), NOW())
             RETURNING *`,
            [waste_log_id, adminId, staff_id, priority || 'Normal']
        );

        // Update waste_log status
        await db.query(
            `UPDATE waste_logs SET status = 'Assigned', updated_at = NOW() WHERE id = $1`,
            [waste_log_id]
        );

        res.status(201).json(taskResult.rows[0]);
    } catch (err) {
        console.error('Error assigning task:', err);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});

// GET /api/v1/tasks/my-tasks - Staff only (get assigned tasks)
router.get('/my-tasks', authenticateToken, authorizeRoles('staff'), async (req, res) => {
    try {
        const staffId = req.user.id;
        const result = await db.query(
            `SELECT 
                t.*,
                w.waste_type,
                w.quantity_kg,
                w.location_description,
                w.image_url,
                w.description,
                w.reported_at,
                w.status as waste_status,
                d.name as department_name,
                u.username as student_name
             FROM tasks t
             JOIN waste_logs w ON t.waste_log_id = w.id
             LEFT JOIN departments d ON w.department_id = d.id
             LEFT JOIN users u ON w.student_id = u.id
             WHERE t.assigned_to = $1
             ORDER BY 
                CASE t.priority
                    WHEN 'Urgent' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Normal' THEN 3
                    WHEN 'Low' THEN 4
                END,
                t.assigned_at DESC`,
            [staffId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching staff tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /api/v1/tasks/:id/status - Staff only (update task status)
router.put('/:id/status', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    const { id } = req.params;
    const { status, completion_notes, completion_image_url } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const updateFields = ['status = $1', 'updated_at = NOW()'];
        const values = [status];
        let paramCounter = 2;

        if (completion_notes) {
            updateFields.push(`completion_notes = $${paramCounter}`);
            values.push(completion_notes);
            paramCounter++;
        }

        if (completion_image_url) {
            updateFields.push(`completion_image_url = $${paramCounter}`);
            values.push(completion_image_url);
            paramCounter++;
        }

        if (status === 'Completed') {
            updateFields.push('completed_at = NOW()');
        }

        values.push(id);

        const result = await db.query(
            `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
            values
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update corresponding waste_log status
        const task = result.rows[0];
        await db.query(
            `UPDATE waste_logs SET status = $1, updated_at = NOW() WHERE id = $2`,
            [status, task.waste_log_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating task status:', err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// GET /api/v1/tasks/all - Admin only (get all tasks)
router.get('/all', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                t.*,
                w.waste_type,
                w.quantity_kg,
                w.location_description,
                w.reported_at,
                w.status as waste_status,
                d.name as department_name,
                student.username as student_name,
                staff.username as staff_name
             FROM tasks t
             JOIN waste_logs w ON t.waste_log_id = w.id
             LEFT JOIN departments d ON w.department_id = d.id
             LEFT JOIN users student ON w.student_id = student.id
             LEFT JOIN users staff ON t.assigned_to = staff.id
             ORDER BY t.created_at DESC
             LIMIT 100`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Legacy endpoints for backwards compatibility
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                t.*,
                w.waste_type,
                w.quantity_kg,
                w.location_description,
                d.name as department_name,
                u.username as assigned_to_name
             FROM tasks t
             JOIN waste_logs w ON t.waste_log_id = w.id
             LEFT JOIN departments d ON w.department_id = d.id
             LEFT JOIN users u ON t.assigned_to = u.id
             ORDER BY t.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch tasks error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authenticateToken, authorizeRoles('admin', 'block_admin'), async (req, res) => {
    const { waste_log_id, assigned_to } = req.body;

    try {
        const check = await db.query('SELECT id FROM tasks WHERE waste_log_id = $1', [waste_log_id]);

        if (check.rows.length > 0) {
            const update = await db.query(
                'UPDATE tasks SET assigned_to = $1, status = $2, updated_at = NOW() WHERE waste_log_id = $3 RETURNING *',
                [assigned_to, 'Assigned', waste_log_id]
            );
            return res.json(update.rows[0]);
        }

        const result = await db.query(
            'INSERT INTO tasks (waste_log_id, assigned_by, assigned_to, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [waste_log_id, req.user.id, assigned_to, 'Assigned']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Assign task error:', err);
        res.status(500).json({ error: err.message });
    }
});

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
