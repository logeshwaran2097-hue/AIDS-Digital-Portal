const http = require('http');

async function fullAudit() {
  console.log('====================================================');
  console.log('   V.S.B. STUDENT PORTAL DEEP DIAGNOSTIC AUDIT     ');
  console.log('====================================================');
  
  let errors = [];

  // Step 1: Auth
  const authRes = await fetch('http://localhost:3001/api/auth/student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registerNumber: '23AD001', dateOfBirth: '2005-07-15' })
  });
  
  if (authRes.status !== 200) {
    errors.push('Auth failed with HTTP ' + authRes.status);
  }
  const cookie = authRes.headers.get('set-cookie') || '';
  console.log('Authentication: HTTP', authRes.status, 'Cookie acquired:', !!cookie);

  // Step 2: Route status & content check
  const routes = [
    { path: '/dashboard', checks: ['K. Aishwarya', '23AD001', 'Attendance', 'Upcoming Events'] },
    { path: '/dashboard/attendance', checks: ['92.5%', 'Subject-Wise Attendance Register', 'August 2026', 'Apply On-Duty'] },
    { path: '/dashboard/study', checks: ['AD2301', 'Data Structures', 'Curriculum', 'Download Course Pack'] },
    { path: '/dashboard/subjects', checks: ['AD2301', 'Database Management', 'Machine Learning'] },
    { path: '/dashboard/question-papers', checks: ['Question Paper Archive', 'Download PDF', 'Internal Test'] },
    { path: '/dashboard/projects', checks: ['Project', 'Crop Disease', 'Traffic Flow'] },
    { path: '/dashboard/faculty', checks: ['Dr. S. Karthik', 'Dr. M. Sowmya', 'Mr. S. Arun', 'Mrs. R. Priya'] },
    { path: '/dashboard/events', checks: ['National Level AI', 'Deep Learning with PyTorch', 'Register'] },
    { path: '/dashboard/announcements', checks: ['Symposium', 'INTELLICA', 'Placement Training'] },
    { path: '/dashboard/achievements', checks: ['Smart India Hackathon', 'IEEE ICCCNT', 'Code Marathon'] },
    { path: '/dashboard/resources', checks: ['Digital Library', 'Mark Allen Weiss', 'Silberschatz', 'Download PDF'] },
    { path: '/dashboard/notifications', checks: ['Notifications', 'Circulars'] },
    { path: '/dashboard/profile', checks: ['K. Aishwarya', '8.84', '92.5%', 'Download Student ID Card'] },
    { path: '/dashboard/settings', checks: ['Account Configuration', 'Notifications', 'Theme Appearance', 'Download Academic Dossier'] }
  ];

  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:3001' + r.path, { headers: { cookie } });
      if (res.status !== 200) {
        errors.push(r.path + ' returned HTTP ' + res.status);
      } else {
        const text = await res.text();
        const missing = r.checks.filter(c => !text.includes(c));
        if (missing.length > 0) {
          errors.push(r.path + ' is missing keywords: ' + missing.join(', '));
        } else {
          console.log('✅ ' + r.path.padEnd(30) + '-> 200 OK | Verified');
        }
      }
    } catch (err) {
      errors.push(r.path + ' exception: ' + err.message);
    }
  }

  // Step 3: Chatbot API Test
  const chatQueries = ['events', 'syllabus', 'faculty', 'placement', 'attendance'];
  for (const q of chatQueries) {
    try {
      const res = await fetch('http://localhost:3001/api/ai?q=' + encodeURIComponent(q));
      const json = await res.json();
      if (!json.success || !json.response?.answer) {
        errors.push('AI API query failed for ' + q);
      } else {
        console.log('✅ AI Query [' + q.padEnd(10) + '] -> Response OK: ' + json.response.answer.slice(0, 35).replace(/\n/g, ' ') + '...');
      }
    } catch (e) {
      errors.push('AI API error: ' + e.message);
    }
  }

  console.log('====================================================');
  console.log('Total Errors Detected:', errors.length);
  if (errors.length === 0) {
    console.log('RESULT: 100% HEALTHY - ALL STUDENT FEATURES VERIFIED');
  } else {
    console.log('Errors found:', errors);
  }
  console.log('====================================================');
}

fullAudit();
