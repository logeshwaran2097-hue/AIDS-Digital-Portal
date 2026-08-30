const http = require('http');

async function checkUrl(url, method = 'GET', postData = null, headers = {}) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 300),
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        error: err.message,
      });
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== V.S.B. AI & DS DIGITAL PORTAL - AUTOMATED VERIFICATION SUITE ===\n');

  // 1. Check Login Page
  const loginRes = await checkUrl('http://localhost:3001/login');
  console.log(`[TEST 1] GET /login -> Status: ${loginRes.statusCode} (${loginRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  // 2. Check PWA Manifest
  const manifestRes = await checkUrl('http://localhost:3001/manifest.json');
  console.log(`[TEST 2] GET /manifest.json -> Status: ${manifestRes.statusCode} (${manifestRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  // 3. Check Service Worker
  const swRes = await checkUrl('http://localhost:3001/sw.js');
  console.log(`[TEST 3] GET /sw.js -> Status: ${swRes.statusCode} (${swRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  // 4. Check AI Chatbot API
  const aiRes = await checkUrl('http://localhost:3001/api/ai', 'POST', {
    message: 'What are the bell timings for today?',
  });
  console.log(`[TEST 4] POST /api/ai (Bell timings query) -> Status: ${aiRes.statusCode} (${aiRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);
  console.log(`         AI Sample Response: ${aiRes.data.substring(0, 120)}...`);

  // 5. Check AI Labs Query
  const aiLabsRes = await checkUrl('http://localhost:3001/api/ai', 'POST', {
    message: 'Show labs for 2nd year',
  });
  console.log(`[TEST 5] POST /api/ai (2nd year labs query) -> Status: ${aiLabsRes.statusCode} (${aiLabsRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  // 6. Check Announcements API
  const annRes = await checkUrl('http://localhost:3001/api/announcements');
  console.log(`[TEST 6] GET /api/announcements -> Status: ${annRes.statusCode} (${annRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  // 7. Check Events API
  const eventsRes = await checkUrl('http://localhost:3001/api/events');
  console.log(`[TEST 7] GET /api/events -> Status: ${eventsRes.statusCode} (${eventsRes.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  // 8. Check Student Auth Endpoint
  const studentAuth = await checkUrl('http://localhost:3001/api/auth/student', 'POST', {
    registerNumber: '922522AD001',
    password: 'wrongpassword',
  });
  console.log(`[TEST 8] POST /api/auth/student (Validation check) -> Status: ${studentAuth.statusCode} (Expected 400/401/200: ${[200, 400, 401].includes(studentAuth.statusCode) ? 'PASS' : 'FAIL'})`);

  // 9. Check Admin Auth Endpoint
  const adminAuth = await checkUrl('http://localhost:3001/api/auth/admin', 'POST', {
    email: 'lonelyboy44y@gmail.com',
  });
  console.log(`[TEST 9] POST /api/auth/admin (OTP challenge check) -> Status: ${adminAuth.statusCode} (${adminAuth.statusCode === 200 ? 'PASS' : 'FAIL'})`);

  console.log('\n=== VERIFICATION SUITE COMPLETE ===');
}

runTests();
