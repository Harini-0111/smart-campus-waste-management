const db = require('./db');

async function createLoginVerificationsTable() {
    try {
        console.log('🚀 Creating login_verifications table...');

        // Create login_verifications table for 2FA login
        await db.query(`
            CREATE TABLE IF NOT EXISTS login_verifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                email VARCHAR(100) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Created login_verifications table successfully');

        // Create indexes for faster lookups
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_login_verifications_email 
            ON login_verifications(email)
        `);

        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_login_verifications_user_id 
            ON login_verifications(user_id)
        `);

        console.log('✅ Created indexes for login_verifications table');
        console.log('✅ Migration completed successfully');

    } catch (error) {
        console.error('❌ Error creating login_verifications table:', error);
        throw error;
    }
}

// Run migration
createLoginVerificationsTable()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
