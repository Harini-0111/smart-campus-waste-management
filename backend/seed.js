const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('🌱 Seeding EcoCampus Database...');

        // Clear existing data
        await db.query('DELETE FROM tasks');
        await db.query('DELETE FROM waste_logs');
        await db.query('DELETE FROM users');

        const hash = await bcrypt.hash('password123', 12);

        // Create sample users for each department
        const users = [
            // Students - [username, email, hash, full_name, registration_number, role, department_id, phone]
            ['john_doe', 'john.doe@student.edu', hash, 'John Doe', 'STU2024001', 'student', 1, '9876543210'],
            ['jane_smith', 'jane.smith@student.edu', hash, 'Jane Smith', 'STU2024002', 'student', 2, '9876543211'],
            ['mike_wilson', 'mike.wilson@student.edu', hash, 'Mike Wilson', 'STU2024003', 'student', 3, '9876543212'],
            ['sarah_jones', 'sarah.jones@student.edu', hash, 'Sarah Jones', 'STU2024004', 'student', 4, '9876543213'],
            ['alex_brown', 'alex.brown@student.edu', hash, 'Alex Brown', 'STU2024005', 'student', 5, '9876543214'],

            // Admins (one per department)
            ['admin_cse', 'admin.cse@college.edu', hash, 'Dr. Rajesh Kumar', 'ADM2024001', 'admin', 1, '9876543220'],
            ['admin_eee', 'admin.eee@college.edu', hash, 'Dr. Priya Sharma', 'ADM2024002', 'admin', 2, '9876543221'],
            ['admin_mech', 'admin.mech@college.edu', hash, 'Dr. Suresh Patel', 'ADM2024003', 'admin', 3, '9876543222'],
            ['admin_civil', 'admin.civil@college.edu', hash, 'Dr. Meera Gupta', 'ADM2024004', 'admin', 4, '9876543223'],
            ['admin_lib', 'admin.lib@college.edu', hash, 'Ms. Kavitha Nair', 'ADM2024005', 'admin', 5, '9876543224'],

            // Staff members
            ['staff_ram', 'ram.cleaner@college.edu', hash, 'Ram Kumar', 'STF2024001', 'staff', 1, '9876543230'],
            ['staff_shyam', 'shyam.cleaner@college.edu', hash, 'Shyam Prasad', 'STF2024002', 'staff', 2, '9876543231'],
            ['staff_gita', 'gita.cleaner@college.edu', hash, 'Gita Devi', 'STF2024003', 'staff', 3, '9876543232'],
            ['staff_rita', 'rita.cleaner@college.edu', hash, 'Rita Singh', 'STF2024004', 'staff', 4, '9876543233'],
            ['staff_mohan', 'mohan.cleaner@college.edu', hash, 'Mohan Lal', 'STF2024005', 'staff', 5, '9876543234'],

            // Super admin (no department restriction)
            ['superadmin', 'admin@ecocampus.edu', hash, 'System Administrator', 'ADM2024000', 'admin', null, '9876543200']
        ];

        for (const [username, email, password_hash, full_name, registration_number, role, department_id, phone] of users) {
            await db.query(
                `INSERT INTO users (username, email, password_hash, full_name, registration_number, role, department_id, phone, email_verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
                [username, email, password_hash, full_name, registration_number, role, department_id, phone]
            );
        }

        // Create sample waste reports
        const wasteReports = [
            [1, 1, 'Wet', 15.5, 'Near CS Lab entrance', null, 'Food waste from canteen overflow', 'Normal'],
            [2, 2, 'Dry', 8.2, 'EEE Department corridor', null, 'Paper and cardboard boxes', 'Low'],
            [3, 3, 'E-waste', 3.1, 'Mechanical workshop', null, 'Old circuit boards and wires', 'High'],
            [4, 4, 'Hazardous', 1.5, 'Civil lab storage', null, 'Chemical containers', 'Critical'],
            [5, 5, 'Recyclable', 12.0, 'Library reading hall', null, 'Plastic bottles and cans', 'Normal'],
            [1, 6, 'Wet', 22.3, 'Hostel A mess hall', null, 'Daily food waste', 'Normal'],
            [2, 7, 'Dry', 18.7, 'Hostel B common room', null, 'Newspapers and magazines', 'Low'],
            [3, 8, 'Wet', 45.2, 'Main canteen kitchen', null, 'Vegetable peels and leftovers', 'High']
        ];

        for (const [student_id, department_id, waste_type, quantity_kg, location_description, image_url, description, severity] of wasteReports) {
            await db.query(
                `INSERT INTO waste_logs (student_id, department_id, waste_type, quantity_kg, location_description, image_url, description, severity) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [student_id, department_id, waste_type, quantity_kg, location_description, image_url, description, severity]
            );
        }

        // Create sample tasks
        const tasks = [
            [1, 6, 11, 'Normal', 'Assigned'],  // CSE admin assigns to CSE staff
            [2, 7, 12, 'Low', 'Assigned'],     // EEE admin assigns to EEE staff
            [3, 8, 13, 'High', 'In Progress'], // MECH admin assigns to MECH staff
            [4, 9, 14, 'Urgent', 'Created']    // CIVIL admin creates task (not assigned yet)
        ];

        for (const [waste_log_id, assigned_by, assigned_to, priority, status] of tasks) {
            const assigned_at = assigned_to ? new Date() : null;
            await db.query(
                `INSERT INTO tasks (waste_log_id, assigned_by, assigned_to, priority, status, assigned_at) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [waste_log_id, assigned_by, assigned_to === 14 ? null : assigned_to, priority, status, assigned_at]
            );
        }

        console.log('✅ Database seeded successfully!');
        console.log('');
        console.log('🔐 Sample Login Credentials:');
        console.log('');
        console.log('👨‍🎓 STUDENTS:');
        console.log('  Username: john_doe     | Password: password123');
        console.log('  Username: jane_smith   | Password: password123');
        console.log('');
        console.log('👨‍💼 ADMINS:');
        console.log('  Username: admin_cse    | Password: password123 (CSE Department)');
        console.log('  Username: admin_eee    | Password: password123 (EEE Department)');
        console.log('  Username: superadmin   | Password: password123 (All Departments)');
        console.log('');
        console.log('👷‍♂️ STAFF:');
        console.log('  Username: staff_ram    | Password: password123');
        console.log('  Username: staff_shyam  | Password: password123');
        console.log('');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();