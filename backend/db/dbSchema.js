const db = require('./index');

async function initializeSchema() {
    console.log('🚀 Initializing EcoCampus Database Schema...');

    try {
        // Drop existing tables to ensure clean setup (CAUTION: wipes data)
        await db.query(`DROP TABLE IF EXISTS tasks CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS waste_logs CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS users CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS departments CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS email_verifications CASCADE;`);
        await db.query(`DROP TABLE IF EXISTS login_verifications CASCADE;`);

        // 1. Departments table
        await db.query(`
            CREATE TABLE departments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                code VARCHAR(20) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Email verification table for 2FA registration
        await db.query(`
            CREATE TABLE email_verifications (
                id SERIAL PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(50),
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Login verification table for 2FA login
        await db.query(`
            CREATE TABLE login_verifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                email VARCHAR(100) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Users table
        await db.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin', 'staff', 'block_admin')),
                location_id INTEGER REFERENCES departments(id),
                department_id INTEGER REFERENCES departments(id),
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. Waste logs table
        await db.query(`
            CREATE TABLE waste_logs (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(id) NOT NULL,
                department_id INTEGER REFERENCES departments(id) NOT NULL,
                waste_type VARCHAR(50) NOT NULL CHECK (waste_type IN ('Wet', 'Dry', 'Recyclable', 'E-waste', 'Hazardous')),
                quantity_kg DECIMAL(10, 2) NOT NULL,
                location_description TEXT NOT NULL,
                image_url TEXT,
                description TEXT,
                status VARCHAR(20) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Assigned', 'In Progress', 'Completed', 'Verified')),
                severity VARCHAR(20) DEFAULT 'Normal' CHECK (severity IN ('Low', 'Normal', 'High', 'Critical')),
                reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 6. Tasks table
        await db.query(`
            CREATE TABLE tasks (
                id SERIAL PRIMARY KEY,
                waste_log_id INTEGER REFERENCES waste_logs(id) NOT NULL,
                assigned_by INTEGER REFERENCES users(id) NOT NULL,
                assigned_to INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'Created' CHECK (status IN ('Created', 'Assigned', 'In Progress', 'Completed', 'Verified')),
                priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
                completion_image_url TEXT,
                completion_notes TEXT,
                assigned_at TIMESTAMP,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert sample departments
        const departments = [
            ['Computer Science & Engineering', 'CSE', 'Main CS building and labs'],
            ['Electrical & Electronics Engineering', 'EEE', 'Electrical engineering block'],
            ['Mechanical Engineering', 'MECH', 'Mechanical workshop and classrooms'],
            ['Civil Engineering', 'CIVIL', 'Civil engineering department'],
            ['Library', 'LIB', 'Central library building'],
            ['Hostel Block A', 'HOSTEL_A', 'Boys hostel accommodation'],
            ['Hostel Block B', 'HOSTEL_B', 'Girls hostel accommodation'],
            ['Main Canteen', 'CANTEEN', 'Central food court and dining'],
            ['Administrative Block', 'ADMIN', 'Administrative offices'],
            ['Sports Complex', 'SPORTS', 'Gymnasium and sports facilities']
        ];

        for (const [name, code, description] of departments) {
            await db.query(
                'INSERT INTO departments (name, code, description) VALUES ($1, $2, $3)',
                [name, code, description]
            );
        }

        console.log('✅ Database schema and seeding complete');
        return { success: true, message: 'Schema initialized and seeded' };
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
        throw err;
    }
}

module.exports = { initializeSchema };
