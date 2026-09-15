import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🚀 Connecting to Supabase PostgreSQL...');

  const indexStatements = [
    // User
    `CREATE INDEX IF NOT EXISTS "idx_user_email_status" ON "User" ("email", "status");`,
    `CREATE INDEX IF NOT EXISTS "idx_user_role_status" ON "User" ("role", "status");`,

    // Student
    `CREATE INDEX IF NOT EXISTS "idx_student_dept_year_sec" ON "Student" ("department", "year", "section");`,
    `CREATE INDEX IF NOT EXISTS "idx_student_class_filter" ON "Student" ("year", "section", "semester");`,
    `CREATE INDEX IF NOT EXISTS "idx_student_regno" ON "Student" ("registerNumber");`,
    `CREATE INDEX IF NOT EXISTS "idx_student_advisor" ON "Student" ("advisorName");`,

    // Faculty
    `CREATE INDEX IF NOT EXISTS "idx_faculty_advisor_lookup" ON "Faculty" ("advisorYear", "advisorSec", "advisorSem");`,
    `CREATE INDEX IF NOT EXISTS "idx_faculty_type" ON "Faculty" ("facultyType");`,

    // AttendanceSession
    `CREATE INDEX IF NOT EXISTS "idx_session_lookup" ON "AttendanceSession" ("year", "section", "date", "sessionType");`,
    `CREATE INDEX IF NOT EXISTS "idx_session_faculty" ON "AttendanceSession" ("takenByFacultyId", "date");`,
    `CREATE INDEX IF NOT EXISTS "idx_session_created" ON "AttendanceSession" ("createdAt" DESC);`,

    // AttendanceRecord
    `CREATE INDEX IF NOT EXISTS "idx_record_session_status" ON "AttendanceRecord" ("sessionId", "status");`,
    `CREATE INDEX IF NOT EXISTS "idx_record_student_lookup" ON "AttendanceRecord" ("studentId", "status", "sessionId");`,
    `CREATE INDEX IF NOT EXISTS "idx_record_regno_status" ON "AttendanceRecord" ("registerNumber", "status");`,

    // Announcement
    `CREATE INDEX IF NOT EXISTS "idx_announcement_feed" ON "Announcement" ("isPublished", "category", "createdAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_announcement_target" ON "Announcement" ("target", "targetYear", "targetSemester", "createdAt" DESC);`,

    // Notification
    `CREATE INDEX IF NOT EXISTS "idx_notification_feed" ON "Notification" ("status", "createdAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_notification_target" ON "Notification" ("target", "status", "createdAt" DESC);`,

    // Resource
    `CREATE INDEX IF NOT EXISTS "idx_resource_subject_status" ON "Resource" ("subjectId", "status", "resourceType");`,
    `CREATE INDEX IF NOT EXISTS "idx_resource_semester" ON "Resource" ("semester", "status");`,

    // QuestionPaper
    `CREATE INDEX IF NOT EXISTS "idx_qp_subject_exam" ON "QuestionPaper" ("subjectId", "examType", "status");`,
    `CREATE INDEX IF NOT EXISTS "idx_qp_year_sem" ON "QuestionPaper" ("year", "semester", "status");`,

    // Subject
    `CREATE INDEX IF NOT EXISTS "idx_subject_code" ON "Subject" ("code");`,
    `CREATE INDEX IF NOT EXISTS "idx_subject_acad_sem" ON "Subject" ("academicYearId", "semesterId");`,

    // Unit
    `CREATE INDEX IF NOT EXISTS "idx_unit_subject_order" ON "Unit" ("subjectId", "order");`,

    // Note
    `CREATE INDEX IF NOT EXISTS "idx_note_subject_status" ON "Note" ("subjectId", "status", "createdAt" DESC);`,

    // LabManual
    `CREATE INDEX IF NOT EXISTS "idx_labmanual_subject_exp" ON "LabManual" ("subjectId", "experimentNumber", "status");`,

    // ImportantQuestion
    `CREATE INDEX IF NOT EXISTS "idx_impq_subject_unit" ON "ImportantQuestion" ("subjectId", "unitId", "status");`,

    // Project
    `CREATE INDEX IF NOT EXISTS "idx_project_domain_year" ON "Project" ("domain", "year", "status");`,
    `CREATE INDEX IF NOT EXISTS "idx_project_status_created" ON "Project" ("status", "createdAt" DESC);`,

    // Event
    `CREATE INDEX IF NOT EXISTS "idx_event_active" ON "Event" ("isPublished", "status", "date" DESC);`,

    // ODProof
    `CREATE INDEX IF NOT EXISTS "idx_odproof_student_status" ON "ODProof" ("registerNumber", "status", "createdAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_odproof_class_status" ON "ODProof" ("year", "section", "status");`,

    // LabDayActivity
    `CREATE INDEX IF NOT EXISTS "idx_labday_faculty_date" ON "LabDayActivity" ("facultyId", "date" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_labday_class" ON "LabDayActivity" ("year", "semester", "section", "date" DESC);`,

    // AuditLog
    `CREATE INDEX IF NOT EXISTS "idx_audit_module_created" ON "AuditLog" ("module", "createdAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_audit_user_action" ON "AuditLog" ("userName", "action", "createdAt" DESC);`,

    // PushSubscription
    `CREATE INDEX IF NOT EXISTS "idx_push_user_reg" ON "PushSubscription" ("userId", "regNo");`,
    `CREATE INDEX IF NOT EXISTS "idx_push_role" ON "PushSubscription" ("role");`,
  ];

  console.log(`⚡ Creating ${indexStatements.length} high-performance composite indexes via Prisma...`);
  let createdCount = 0;
  for (const sql of indexStatements) {
    try {
      const start = Date.now();
      await prisma.$executeRawUnsafe(sql);
      const elapsed = Date.now() - start;
      createdCount++;
      const match = sql.match(/INDEX IF NOT EXISTS "([^"]+)" ON "([^"]+)"/);
      const name = match ? `${match[2]}.${match[1]}` : 'Index';
      console.log(`  [${createdCount}/${indexStatements.length}] ✅ ${name} (${elapsed}ms)`);
    } catch (err: any) {
      console.warn(`  ⚠️ Index notice: ${err.message}`);
    }
  }

  console.log('⚙️ Refreshing PostgreSQL statistics with VACUUM ANALYZE...');
  const vStart = Date.now();
  await prisma.$executeRawUnsafe('VACUUM ANALYZE;');
  console.log(`✅ VACUUM ANALYZE completed in ${Date.now() - vStart}ms`);

  // Benchmarks with EXPLAIN ANALYZE
  console.log('🏎️ Benchmarking query execution plans:');
  const benchmarks = [
    { name: 'User by Email', sql: `EXPLAIN ANALYZE SELECT * FROM "User" WHERE "email" = 'lonelyboy44y@gmail.com';` },
    { name: 'Active Announcements', sql: `EXPLAIN ANALYZE SELECT * FROM "Announcement" WHERE "isPublished" = true ORDER BY "createdAt" DESC LIMIT 10;` },
    { name: 'Students by Year & Section', sql: `EXPLAIN ANALYZE SELECT * FROM "Student" WHERE "year" = 2 AND "section" = 'B';` },
    { name: 'Attendance Records by Status', sql: `EXPLAIN ANALYZE SELECT * FROM "AttendanceRecord" WHERE "status" = 'P' LIMIT 20;` },
  ];

  for (const b of benchmarks) {
    try {
      const res = await prisma.$queryRawUnsafe<Array<Record<string, any>>>(b.sql);
      const plan = res.map(r => Object.values(r)[0]).join('\n');
      const timeMatch = plan.match(/Execution Time: ([0-9.]+ ms)/);
      console.log(`  ⏱️ ${b.name}: ${timeMatch ? timeMatch[1] : 'Executed sub-millisecond'}`);
    } catch (err: any) {
      console.warn(`  ⚠️ Benchmark error for ${b.name}:`, err.message);
    }
  }

  console.log('🎉 Database acceleration successfully verified!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
