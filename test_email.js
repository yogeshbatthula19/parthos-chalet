const https = require('https');

function runTest() {
    const payload = JSON.stringify({
        service_id: 'service_q01yn3m',
        template_id: 'template_admin',
        user_id: 'Ke0cBUm0LWOTx2ryG', // Public Key
        template_params: {
            name: 'Test Guest',
            email: 'stay@parthoschalet.com',
            phone: '9999999999',
            checkIn: '2026-06-10',
            checkOut: '2026-06-12',
            guests: '2 Guests',
            roomPreference: '1 BHK Luxury Villa',
            submittedAt: new Date().toLocaleString(),
            page: 'Test Run'
        }
    });

    const options = {
        hostname: 'api.emailjs.com',
        port: 445,
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    console.log("Sending test request to EmailJS API...");

    // Try port 443 first (HTTPS default)
    options.port = 443;
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`Response Status: ${res.statusCode}`);
            console.log(`Response Body: ${data}`);
        });
    });

    req.on('error', (err) => {
        console.error("Connection error:", err);
    });

    req.write(payload);
    req.end();
}

runTest();
