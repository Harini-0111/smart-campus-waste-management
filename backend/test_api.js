const http = require('http');

const data = JSON.stringify({
    location_id: 'LOC001',
    waste_type: 'Wet',
    quantity_kg: 10.5
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/waste-entry',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
