const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function inspect() {
  const models = [
    'User', 'Student', 'Faculty', 'HOD', 'Admin', 
    'AcademicYear', 'Year', 'Semester', 'Subject', 'Syllabus', 'Unit', 
    'Resource', 'Note', 'LabManual', 'ImportantQuestion', 'QuestionPaper', 
    'Project', 'Event', 'Announcement', 'Notification', 'Achievement', 
    'OTP', 'AuditLog', 'FileRecord', 'SystemSettings', 'AIAssistantConfig', 
    'ClassAdvisor', 'AttendanceSession', 'AttendanceRecord', 'ProfileChangeRequest'
  ];

  console.log('--- Table Counts ---');
  for (const m of models) {
    const delegateName = m.charAt(0).toLowerCase() + m.slice(1);
    if (p[delegateName]) {
      try {
        const cnt = await p[delegateName].count();
        console.log(`${m}: ${cnt}`);
      } catch (err) {
        console.log(`${m}: Error (${err.message})`);
      }
    } else {
      console.log(`${m}: Delegate not found`);
    }
  }
}

inspect()
  .catch(console.error)
  .finally(() => p.$disconnect());
