const http = require('http');

async function checkUrl(url, cookie = '') {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'Cookie': cookie,
        'User-Agent': 'AuditScript/1.0',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', (e) => resolve({ status: 500, data: e.message }));
    req.end();
  });
}

async function loginFaculty() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ facultyId: 'AI001', dateOfBirth: '1978-04-12' });
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/faculty',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'].join('; ') : '';
        resolve({ status: res.statusCode, cookie, data });
      });
    });
    req.on('error', (e) => resolve({ status: 500, cookie: '', data: e.message }));
    req.write(postData);
    req.end();
  });
}

async function runAudit() {
  console.log('===============================================================');
  console.log('         DEEP DIAGNOSTIC AUDIT: FACULTY PORTAL (100% HEALTH)   ');
  console.log('===============================================================');

  const auth = await loginFaculty();
  console.log(`[AUTH] Faculty Login (AI001): Status ${auth.status} -> ${auth.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  const cookie = auth.cookie;

  const pages = [
    { name: 'Faculty Dashboard Command Center', path: '/faculty-dashboard', keywords: ['Dr. S. Karthik', 'Allocated Subjects'] },
    { name: 'My Subjects & 5-Unit Curriculum', path: '/faculty-dashboard/subjects', keywords: ['AD2305', 'Curriculum &amp; Course Workspace'] },
    { name: 'Student Registry & Batch Roster', path: '/faculty-dashboard/students', keywords: ['Student Registry', 'Class Advisor Registry'] },
    { name: 'Biometric Roll Call & Attendance', path: '/faculty-dashboard/attendance', keywords: ['Attendance', 'Roll Call'] },
    { name: 'Study Resources & E-Books Library', path: '/faculty-dashboard/resources', keywords: ['Study Resources', 'Digital Library Repository'] },
    { name: 'Question Papers Assessment Bank', path: '/faculty-dashboard/question-papers', keywords: ['Question Paper Archive', 'Assessment'] },
    { name: 'Student Projects & Capstones', path: '/faculty-dashboard/projects', keywords: ['Student Projects', 'Research &amp; Innovation Hub'] },
    { name: 'Department Events & Hackathons', path: '/faculty-dashboard/events', keywords: ['Events', 'Department Events &amp; Workshops'] },
    { name: 'Official Circulars & Notice Board', path: '/faculty-dashboard/announcements', keywords: ['Notices', 'Department Circulars'] },
    { name: 'Notifications & Alerts Center', path: '/faculty-dashboard/notifications', keywords: ['Notifications', 'Faculty Alert Center'] },
    { name: 'Faculty Profile & Publications', path: '/faculty-dashboard/profile', keywords: ['Dr. S. Karthik', 'Publications'] },
    { name: 'Portal Settings & Midnight Theme', path: '/faculty-dashboard/settings', keywords: ['Settings', 'Portal Settings &amp; Preferences'] },
  ];

  let failures = 0;

  for (const p of pages) {
    const res = await checkUrl('http://localhost:3001' + p.path, cookie);
    const hasKeywords = p.keywords.every(kw => res.data.includes(kw));
    const passed = res.status === 200 && hasKeywords;

    if (!passed) failures++;

    console.log(`[PAGE] ${p.name.padEnd(38)} | HTTP ${res.status} | Content: ${hasKeywords ? 'VERIFIED' : 'KEYWORD MISSING'} | [${passed ? 'PASS' : 'FAIL'}]`);
  }

  // Check APIs
  console.log('\n--- VERIFYING FACULTY API ENDPOINTS ---');
  const apis = [
    '/api/resources',
    '/api/question-papers',
    '/api/projects',
    '/api/events',
    '/api/announcements',
    '/api/attendance',
  ];

  for (const api of apis) {
    const res = await checkUrl('http://localhost:3001' + api, cookie);
    const passed = res.status === 200 || res.status === 201;
    if (!passed) failures++;
    console.log(`[API]  ${api.padEnd(38)} | HTTP ${res.status} | [${passed ? 'PASS' : 'FAIL'}]`);
  }

  console.log('===============================================================');
  if (failures === 0) {
    console.log('🎉 AUDIT COMPLETE: ALL 12 FACULTY PAGES & 6 APIS ARE 100% HEALTHY (0 ERRORS)!');
  } else {
    console.log(`⚠️ AUDIT DETECTED ${failures} FAILURES!`);
  }
  console.log('===============================================================');
}

runAudit();
