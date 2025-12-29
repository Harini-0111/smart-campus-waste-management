require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

async function seedDemo() {
  console.log('🌱 Seeding demo users, waste logs, and tasks...');
  try {
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM waste_logs');

    const departments = await db.query('SELECT id, code FROM departments');
    if (departments.rowCount === 0) throw new Error('No departments found. Run schema init first.');
    const deptByCode = new Map(departments.rows.map((d) => [d.code, d.id]));
    const pickDept = (code) => deptByCode.get(code) || departments.rows[0].id;

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      { username: 'admin', email: 'admin@demo.com', role: 'admin', dept: 'ADMIN' },
      { username: 'hostel_admin', email: 'hostel@demo.com', role: 'block_admin', dept: 'HOSTEL_A' },
      { username: 'staff1', email: 'staff1@demo.com', role: 'staff', dept: 'CSE' },
      { username: 'staff2', email: 'staff2@demo.com', role: 'staff', dept: 'CANTEEN' },
      { username: 'student1', email: 'student1@demo.com', role: 'student', dept: 'CSE' },
      { username: 'student2', email: 'student2@demo.com', role: 'student', dept: 'EEE' },
    ];

    const userIds = {};
    for (const u of users) {
      const res = await db.query(
        `INSERT INTO users (username, email, password_hash, role, department_id, email_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, true, true)
         ON CONFLICT (username) DO UPDATE
         SET email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             department_id = EXCLUDED.department_id,
             email_verified = true,
             is_active = true
         RETURNING id`,
        [u.username, u.email, passwordHash, u.role, pickDept(u.dept)]
      );
      userIds[u.username] = res.rows[0].id;
    }

    const adminId = userIds.admin;
    const staffA = userIds.staff1;
    const staffB = userIds.staff2;

    const samples = [
      {
        student: 'student1',
        dept: 'CSE',
        waste_type: 'Wet',
        quantity_kg: 6.2,
        daysAgo: 0,
        status: 'Reported',
        severity: 'Normal',
        description: 'Food waste collected after lunch rush',
        location_description: 'CSE canteen lobby',
        priority: 'High',
      },
      {
        student: 'student2',
        dept: 'EEE',
        waste_type: 'Hazardous',
        quantity_kg: 1.2,
        daysAgo: 0,
        status: 'Reported',
        severity: 'Critical',
        description: 'Battery spill near the power systems lab',
        location_description: 'EEE power lab corridor',
        priority: 'Urgent',
      },
      {
        student: 'student1',
        dept: 'CSE',
        waste_type: 'Dry',
        quantity_kg: 3.5,
        daysAgo: 1,
        status: 'Assigned',
        severity: 'Normal',
        description: 'Paper waste after end-sem exam printing',
        location_description: 'CS block level 2',
        staff: staffA,
        priority: 'Normal',
      },
      {
        student: 'student2',
        dept: 'EEE',
        waste_type: 'Recyclable',
        quantity_kg: 5.0,
        daysAgo: 2,
        status: 'In Progress',
        severity: 'High',
        description: 'Plastic bottles stacked after workshop',
        location_description: 'EEE foyer',
        staff: staffB,
        priority: 'High',
      },
      {
        student: 'student1',
        dept: 'CSE',
        waste_type: 'Wet',
        quantity_kg: 4.0,
        daysAgo: 3,
        status: 'Completed',
        severity: 'Normal',
        description: 'Cafeteria leftovers cleared and sanitized',
        location_description: 'Main cafeteria rear exit',
        staff: staffA,
        priority: 'Normal',
      },
    ];

    for (const sample of samples) {
      const studentId = userIds[sample.student];
      const deptId = pickDept(sample.dept);
      const reportedAt = new Date();
      reportedAt.setDate(reportedAt.getDate() - sample.daysAgo);

      const wasteRes = await db.query(
        `INSERT INTO waste_logs (student_id, department_id, waste_type, quantity_kg, location_description, image_url, description, status, severity, reported_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
         RETURNING id, reported_at`,
        [
          studentId,
          deptId,
          sample.waste_type,
          sample.quantity_kg,
          sample.location_description,
          null,
          sample.description,
          sample.status,
          sample.severity,
          reportedAt,
        ]
      );

      const wasteId = wasteRes.rows[0].id;

      if (sample.status !== 'Reported') {
        const assignedAt = new Date(reportedAt.getTime() + 60 * 60 * 1000);
        const completedAt = sample.status === 'Completed' ? new Date(assignedAt.getTime() + 2 * 60 * 60 * 1000) : null;

        await db.query(
          `INSERT INTO tasks (waste_log_id, assigned_by, assigned_to, status, priority, assigned_at, completed_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $6, NOW())`,
          [wasteId, adminId, sample.staff || staffA, sample.status, sample.priority || 'Normal', assignedAt, completedAt]
        );
      }
    }

    console.log('✅ Demo data ready. Credentials:');
    console.log(' admin / password123');
    console.log(' hostel_admin / password123');
    console.log(' staff1 / password123');
    console.log(' staff2 / password123');
    console.log(' student1 / password123');
    console.log(' student2 / password123');
  } catch (err) {
    console.error('❌ Demo seed failed:', err.message);
  } finally {
    process.exit(0);
  }
}

seedDemo();
