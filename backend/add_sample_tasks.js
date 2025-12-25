const db = require('./db');

async function addSampleTasks() {
    try {
        // Add some tasks
        await db.query('INSERT INTO tasks (waste_log_id, assigned_to, status) VALUES (1, 4, "Assigned")');
        await db.query('INSERT INTO tasks (waste_log_id, assigned_to, status) VALUES (2, 5, "In Progress")');
        console.log('✅ Sample tasks added successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error adding tasks:', err);
        process.exit(1);
    }
}

addSampleTasks();