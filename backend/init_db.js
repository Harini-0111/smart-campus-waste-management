const db = require('./db');

async function init() {
  try {
    // Drop existing tables to ensure a clean slate for schema changes
    await db.query(`DROP TABLE IF EXISTS segregation_metrics CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS tasks CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS waste_logs CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS locations CASCADE;`);

    // 1. Locations (Canteen, Hostel, Library, etc.)
    await db.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50), -- Academic, Residential, Dining, Admin
                manager_id INTEGER, -- Assigned Block Admin (Reference to users.id handled later or loosely)
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // 2. Users with Location & Role
    await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) NOT NULL, -- admin, block_admin, staff, student
                location_id VARCHAR(50) REFERENCES locations(id), -- Null for super_admin
                impact_points INTEGER DEFAULT 0,
                eco_level INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // 3. Waste Logs (Reports)
    await db.query(`
            CREATE TABLE IF NOT EXISTS waste_logs (
                id SERIAL PRIMARY KEY,
                location_id VARCHAR(50) REFERENCES locations(id),
                waste_type VARCHAR(50) NOT NULL,
                quantity_kg DECIMAL(10, 2) NOT NULL,
                image_url TEXT,
                description TEXT,
                status VARCHAR(20) DEFAULT 'Reported', -- Reported, Assigned, In Progress, Resolved
                severity VARCHAR(20) DEFAULT 'Normal', -- Low, Normal, High, Critical
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // 4. Tasks (Assignments)
    await db.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                waste_log_id INTEGER REFERENCES waste_logs(id),
                assigned_to INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'Assigned', -- Assigned, In Progress, Completed, Verified
                completion_image_url TEXT, -- Proof of cleaning
                completion_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // Seed professional locations
    const locations = [
      ['HOSTEL_A', 'Boys Hostel Block A', 'Residential'],
      ['HOSTEL_B', 'Girls Hostel Block B', 'Residential'],
      ['CANTEEN_MAIN', 'Main Food Court', 'Dining'],
      ['ACADEMIC_BLOCK_1', 'Science & Tech Wing', 'Academic'],
      ['LIBRARY_CENTRAL', 'Central Library', 'Academic'],
      ['ADMIN_MAIN', 'Campus Administrative Hub', 'Admin']
    ];

    for (const [id, name, type] of locations) {
      await db.query(
        'INSERT INTO locations (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [id, name, type]
      );
    }

    console.log('✅ Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  }
}

init();
