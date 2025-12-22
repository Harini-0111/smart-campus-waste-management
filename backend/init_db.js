const db = require('./db');

const schema = `
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS waste_logs (
  id SERIAL PRIMARY KEY,
  location_id VARCHAR(50) REFERENCES locations(id),
  waste_type VARCHAR(50) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS segregation_metrics (
  id SERIAL PRIMARY KEY,
  log_id INTEGER REFERENCES waste_logs(id),
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'staff' 
);

INSERT INTO locations (id, name, type) VALUES 
  ('LOC001', 'Hostel', 'RESIDENTIAL'),
  ('LOC002', 'Canteen', 'FOOD'),
  ('LOC003', 'Academic Block', 'ACADEMIC'),
  ('LOC004', 'Library', 'ACADEMIC'),
  ('LOC005', 'Admin Block', 'ADMIN'),
  ('LOC006', 'Sports Complex', 'SPORTS')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type;
`;

async function init() {
    try {
        await db.query(schema);
        console.log('Database initialized successfully with updated locations.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

init();
