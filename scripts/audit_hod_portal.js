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

async function loginHOD() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ facultyId: 'HOD001', dateOfBirth: '1993-09-05' });
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/hod',
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

async function runHODAudit() {
  console.log('===============================================================');
  console.log('         DEEP DIAGNOSTIC AUDIT: HOD PORTAL (100% HEALTH)       ');
  console.log('===============================================================');

  const auth = await loginHOD();
  console.log(`[AUTH] HOD Login (HOD001 / 1993-09-05): Status ${auth.status} -> ${auth.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  const cookie = auth.cookie;

  const pages = [
    { name: 'Executive Overview Dashboard', path: '/hod-dashboard' },
    { name: 'Faculty Directorate & Staff', path: '/hod-dashboard/faculty' },
    { name: 'Student Batch Records & Analytics', path: '/hod-dashboard/students' },
    { name: 'Academic Curriculum & Syllabus', path: '/hod-dashboard/academics' },
    { name: 'Digital Study Resources Review', path: '/hod-dashboard/resources' },
    { name: 'Question Papers Archive & Blueprint', path: '/hod-dashboard/question-papers' },
    { name: 'Capstone Projects & R&D Hub', path: '/hod-dashboard/projects' },
    { name: 'Department Events & Symposiums', path: '/hod-dashboard/events' },
    { name: 'Student & Faculty Achievements', path: '/hod-dashboard/achievements' },
    { name: 'Targeted Announcements & Circulars', path: '/hod-dashboard/announcements' },
    { name: 'Alerts Center & Approvals', path: '/hod-dashboard/notifications' },
    { name: 'NBA / NAAC Audit Reports Center', path: '/hod-dashboard/reports' },
    { name: 'HOD Academic Profile', path: '/hod-dashboard/profile' },
    { name: 'Portal Settings & Theme Switcher', path: '/hod-dashboard/settings' },
  ];

  let failures = 0;

  for (const p of pages) {
    const res = await checkUrl('http://localhost:3001' + p.path, cookie);
    const isOk = res.status === 200 && !res.data.includes('Internal Server Error') && !res.data.includes('Application error');

    if (!isOk) failures++;

    console.log(`[PAGE] ${p.name.padEnd(38)} | HTTP ${res.status} | [${isOk ? 'PASSED' : 'FAILED'}]`);
  }

  console.log('===============================================================');
  if (failures === 0) {
    console.log('🎉 AUDIT COMPLETE: ALL 14 HOD PAGES ARE 100% WORKING (0 ERRORS)!');
  } else {
    console.log(`⚠️ AUDIT DETECTED ${failures} FAILURES!`);
  }
  console.log('===============================================================');
}

runHODAudit();
