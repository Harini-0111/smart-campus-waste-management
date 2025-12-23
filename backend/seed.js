const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Clear existing data (optional, but good for consistent state)
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM waste_logs');
        // Locations are constant? If we want to reset them we can, but init_db handles that.

        const saltRounds = 10;
        const password = 'password123'; // Default password for all
        const hash = await bcrypt.hash(password, saltRounds);

        // 1. Super Admin
        await db.query(
            `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'admin')`,
            ['admin', hash]
        );

        // 2. Block Admin (Hostel)
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) VALUES ($1, $2, 'block_admin', 'LOC001')`,
            ['hostel_admin', hash]
        );

        // 3. Student
        await db.query(
            `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'student')`,
            ['student1', hash]
        );

        // 4. Staff
        await db.query(
            `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'staff')`,
            ['staff1', hash]
        );

        console.log('✅ Users seeded successfully!');
        console.log('Credentials (username / password):');
        console.log(' - admin / password123');
        console.log(' - hostel_admin / password123');
        console.log(' - staff1 / password123');
        console.log(' - student1 / password123');

        // Seed some sample waste logs
        const locations = ['LOC001', 'LOC002', 'LOC003', 'LOC004'];
        const types = ['Wet', 'Dry', 'Recyclable', 'Hazardous'];

        for (let i = 0; i < 15; i++) {
            const loc = locations[Math.floor(Math.random() * locations.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const qty = (Math.random() * 15 + 1).toFixed(2);

            // Random date in last 7 days
            const daysAgo = Math.floor(Math.random() * 7);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            await db.query(
                'INSERT INTO waste_logs (location_id, waste_type, quantity_kg, collected_at) VALUES ($1, $2, $3, $4)',
                [loc, type, qty, date]
            );
        }

        console.log('✅ Sample waste logs seeded.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding:', err);
        process.exit(1);
    }
}

seed();
