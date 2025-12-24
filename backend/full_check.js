const db = require('./db');
const bcrypt = require('bcrypt');

(async () => {
    try {
        console.log('\n=== COMPREHENSIVE DATABASE CHECK ===\n');

        // 1. Check all users
        const allUsers = await db.query('SELECT username, role, location_id FROM users ORDER BY role, username');
        console.log('📊 Total users in database:', allUsers.rows.length);
        console.log('\nAll users:');
        allUsers.rows.forEach(u => {
            console.log(`  - ${u.username} (${u.role}) ${u.location_id ? '@ ' + u.location_id : ''}`);
        });

        // 2. Check supervisor1 specifically
        console.log('\n🔍 Checking supervisor1...');
        const supervisor = await db.query('SELECT * FROM users WHERE username = $1', ['supervisor1']);
        if (supervisor.rows.length > 0) {
            console.log('✅ supervisor1 EXISTS in database');
            console.log('   Role:', supervisor.rows[0].role);
            console.log('   Location:', supervisor.rows[0].location_id);
            console.log('   Has password hash:', supervisor.rows[0].password_hash ? 'YES' : 'NO');

            // 3. Test password
            const isValid = await bcrypt.compare('password123', supervisor.rows[0].password_hash);
            console.log('   Password "password123" valid:', isValid ? '✅ YES' : '❌ NO');
        } else {
            console.log('❌ supervisor1 NOT FOUND in database');
            console.log('\n🔧 Creating supervisor1...');
            const hash = await bcrypt.hash('password123', 10);
            await db.query(
                `INSERT INTO users (username, password_hash, role, location_id) 
                 VALUES ($1, $2, 'block_admin', 'HOSTEL_A')`,
                ['supervisor1', hash]
            );
            console.log('✅ supervisor1 created successfully');
        }

        // 4. Test login endpoint
        console.log('\n🌐 Testing login endpoint...');
        const axios = require('axios');
        try {
            const response = await axios.post('http://localhost:3001/api/v1/auth/login', {
                username: 'supervisor1',
                password: 'password123'
            });
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('   Token received:', response.data.token.substring(0, 20) + '...');
            console.log('   User data:', response.data.user);
        } catch (error) {
            console.log('❌ LOGIN FAILED');
            console.log('   Status:', error.response?.status);
            console.log('   Error:', error.response?.data);
            console.log('\n⚠️  Backend server may need restart!');
        }

        console.log('\n=== END OF CHECK ===\n');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
