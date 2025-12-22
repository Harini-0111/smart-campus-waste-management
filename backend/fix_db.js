const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const passwords = ['postgres', 'root', 'admin', 'password', '1234', ''];
const user = 'postgres';

async function tryConnect() {
    for (const pass of passwords) {
        console.log(`Trying password: '${pass}'...`);
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: pass,
            port: 5432,
        });

        try {
            await client.connect();
            console.log(`SUCCESS! Password is: '${pass}'`);

            const envPath = path.join(__dirname, '.env');
            const envContent = `PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=postgres
DB_PASSWORD=${pass}
DB_PORT=5432`;

            fs.writeFileSync(envPath, envContent);
            console.log('Updated .env file.');
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed: ${err.message}`);
            await client.end();
        }
    }
    console.log('All passwords failed.');
    process.exit(1);
}

tryConnect();
