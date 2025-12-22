const db = require('./db');

async function checkData() {
    try {
        console.log("--- CHECKING LOCATIONS ---");
        const locs = await db.query("SELECT * FROM locations");
        console.table(locs.rows);

        console.log("\n--- CHECKING RECENT LOGS ---");
        const logs = await db.query("SELECT * FROM waste_logs ORDER BY collected_at DESC LIMIT 5");
        console.table(logs.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
