const db = require('./db');

async function test() {
    try {
        const res = await db.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables:', tables.rows.map(r => r.table_name));

        const checkLoc = await db.query('SELECT * FROM locations LIMIT 1');
        console.log('Locations count:', checkLoc.rowCount);
        if (checkLoc.rowCount === 0) {
            console.log('Inserting mock location...');
            await db.query("INSERT INTO locations (id, name, type) VALUES ('LOC001', 'Hostel A', 'HOSTEL') ON CONFLICT DO NOTHING");
        }

    } catch (err) {
        console.error('DB Error:', err);
    }
}

test();
