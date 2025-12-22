const db = require('./db');

async function seed() {
    console.log('Seeding data...');
    try {
        const locations = ['LOC001', 'LOC002', 'LOC003', 'LOC004'];
        const types = ['Wet', 'Dry', 'Recyclable'];

        for (let i = 0; i < 10; i++) {
            const loc = locations[Math.floor(Math.random() * locations.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const qty = (Math.random() * 20).toFixed(2);

            await db.query(
                'INSERT INTO waste_logs (location_id, waste_type, quantity_kg, collected_at) VALUES ($1, $2, $3, NOW())',
                [loc, type, qty]
            );
        }
        console.log('Seeded 10 random entries.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
