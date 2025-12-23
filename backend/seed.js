const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('--- Starting Production Seed ---');

        // Clear existing data (Order matters for foreign keys)
        await db.query('DELETE FROM tasks');
        await db.query('DELETE FROM waste_logs');
        await db.query('DELETE FROM users');
        // Locations are seeded in init_db, but let's ensure they exist

        const hash = await bcrypt.hash('password123', 10);

        // 1. Super Admin
        await db.query(
            `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'admin')`,
            ['admin', hash]
        );

        // 2. Block Admins (Supervisor)
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, 'block_admin', 'HOSTEL_A')`,
            ['supervisor1', hash]
        );
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, 'block_admin', 'CANTEEN_MAIN')`,
            ['supervisor2', hash]
        );

        // 3. Staff (Cleaning Crew)
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, 'staff', 'HOSTEL_A')`,
            ['staff1', hash]
        );
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, 'staff', 'CANTEEN_MAIN')`,
            ['staff2', hash]
        );

        // 4. Students/Users
        await db.query(
            `INSERT INTO users (username, password_hash, role, impact_points, eco_level) VALUES ($1, $2, 'student', 1542, 4)`,
            ['student1', hash]
        );

        // 5. Initial Waste Logs
        const logs = [
            ['CANTEEN_MAIN', 'Wet', 45.5, 'Normal', 'Main canteen lunch rush waste'],
            ['HOSTEL_A', 'Dry', 12.0, 'Low', 'Cardboard boxes in lounge'],
            ['ADMIN_MAIN', 'Hazardous', 2.5, 'High', 'Old batteries found in storage']
        ];

        for (const [loc, type, qty, severity, desc] of logs) {
            await db.query(
                `INSERT INTO waste_logs (location_id, waste_type, quantity_kg, severity, description) VALUES ($1, $2, $3, $4, $5)`,
                [loc, type, qty, severity, desc]
            );
        }

        console.log('✅ Database seeded successfully with production-grade accounts.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
