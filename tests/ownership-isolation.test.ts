/**
 * Automated Ownership & IDOR Isolation Test Suite
 * Validates that:
 * 1. User A cannot access, mutate, or delete User B's records.
 * 2. User ID / Register Number is strictly derived from the verified session.
 * 3. Client parameter tampering (URL query, request body) is rejected or neutralized.
 * 4. Admin/Faculty-only routes reject unauthenticated or student access.
 */

import { GET as getPass, POST as postPass } from '@/app/api/pass/route'
import { GET as getOdApps, POST as postOdApps } from '@/app/api/od-applications/route'
import { POST as postOdProofs } from '@/app/api/od-proofs/route'
import { PUT as putStudent } from '@/app/api/students/route'
import { GET as getProfileReqs, POST as postProfileReqs, PATCH as patchProfileReqs } from '@/app/api/students/profile-requests/route'
import { POST as postCleanMockData } from '@/app/api/admin/clean-mock-data/route'
import { PUT as putProject, DELETE as deleteProject } from '@/app/api/projects/route'
import { PUT as putResource, DELETE as deleteResource } from '@/app/api/resources/route'
import { POST as postQuestionPaper } from '@/app/api/question-papers/route'
import { POST as postAnnouncement, DELETE as deleteAnnouncement } from '@/app/api/announcements/route'
import { POST as postEvent } from '@/app/api/events/route'
import { PUT as putLabActivity, DELETE as deleteLabActivity } from '@/app/api/faculty/laboratory/route'
import { DELETE as deleteQuestion } from '@/app/api/faculty/questions/route'
import { POST as postSyllabus } from '@/app/api/faculty/syllabus/route'
import { GET as getAttendance, POST as postAttendance } from '@/app/api/attendance/route'
import { GET as getUnlockRequest, POST as postUnlockRequest } from '@/app/api/attendance/unlock-request/route'
import { GET as getNotifications, POST as postNotifications, DELETE as deleteNotifications } from '@/app/api/notifications/route'
import { GET as getAdminStats } from '@/app/api/admin/dashboard/stats/route'
import { POST as postPushSubscribe } from '@/app/api/push/subscribe/route'
import { POST as postCompleteProfile } from '@/app/api/auth/complete-profile/route'
import { GET as getFormTracker, POST as postFormTracker } from '@/app/api/announcements/form-tracker/route'
import { GET as getAi } from '@/app/api/ai/route'
import { __setTestSession, type JWTPayload } from '@/lib/auth'

function setSession(session: JWTPayload | null) {
  __setTestSession(session)
}

const studentA: JWTPayload = {
  userId: 'user_student_a',
  email: 'studentA@vsb.edu.in',
  name: 'Student A',
  role: 'student',
  registerNumber: '922522AD001',
}

const studentB: JWTPayload = {
  userId: 'user_student_b',
  email: 'studentB@vsb.edu.in',
  name: 'Student B',
  role: 'student',
  registerNumber: '922522AD002',
}

const facultyA: JWTPayload = {
  userId: 'user_faculty_a',
  email: 'facultyA@vsb.edu.in',
  name: 'Faculty A',
  role: 'faculty',
  facultyId: 'FAC001',
}

const facultyB: JWTPayload = {
  userId: 'user_faculty_b',
  email: 'facultyB@vsb.edu.in',
  name: 'Faculty B',
  role: 'faculty',
  facultyId: 'FAC002',
}

let passed = 0
let failed = 0

async function assertTest(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`  ✓ PASS: ${name}`)
    passed++
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`)
    console.error(`    Error: ${err.message || err}`)
    failed++
  }
}

async function runTests() {
  console.log('\n🔒 RUNNING IDOR & OWNERSHIP VERIFICATION TEST SUITE...\n')

  // 1. Digital Pass
  await assertTest('GET /api/pass: Student A cannot query Student B pass (returns 403 Forbidden)', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/pass?id=VSB%2FAI%26DS%2FGP-2026-0847')
    const res = await getPass(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  await assertTest('POST /api/pass: Student A cannot create a pass under Student B register number', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/pass', {
      method: 'POST',
      body: JSON.stringify({
        id: 'pass_test_1',
        registerNumber: '922522AD002', // Student B
        category: 'Bus Pass',
        studentName: 'Student B',
      }),
    })
    const res = await postPass(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 2. OD Applications
  await assertTest('POST /api/od-applications: Student A cannot submit OD application for Student B', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/od-applications', {
      method: 'POST',
      body: JSON.stringify({
        registerNumber: '922522AD002', // Student B
        applicationType: 'On Duty',
        fromDate: '2026-10-01',
        toDate: '2026-10-02',
        eventName: 'Symposium',
      }),
    })
    const res = await postOdApps(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 3. OD Proofs
  await assertTest('POST /api/od-proofs: Student A cannot verify/approve OD applications (requires advisor/hod)', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/od-proofs', {
      method: 'POST',
      body: JSON.stringify({
        action: 'ADVISOR_VERIFY',
        proofId: 'proof_123',
      }),
    })
    const res = await postOdProofs(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 4. Students Profile
  await assertTest('PUT /api/students: Student A cannot update Student B profile record', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/students', {
      method: 'PUT',
      body: JSON.stringify({
        student: {
          id: 'non_existent_b',
          userId: 'user_student_b',
          registerNumber: '922522AD002',
          phone: '9999999999',
        },
      }),
    })
    const res = await putStudent(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 5. Students Profile Requests
  await assertTest('PATCH /api/students/profile-requests: Student A cannot approve pending profile change requests', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/students/profile-requests', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'req_123',
        status: 'approved',
      }),
    })
    const res = await patchProfileReqs(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 6. Admin Clean Mock Data
  await assertTest('POST /api/admin/clean-mock-data: Student A or unauthenticated cannot trigger admin database wipe', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/admin/clean-mock-data', { method: 'POST' })
    const res = await postCleanMockData(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }

    setSession(null)
    const resAnon = await postCleanMockData(req)
    if (resAnon.status !== 403 && resAnon.status !== 401) {
      throw new Error(`Expected status 401/403 for anonymous call, got ${resAnon.status}`)
    }
  })

  // 7. Announcements
  await assertTest('POST /api/announcements: Student A cannot create official announcements', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Fake Notice',
        content: 'Malicious announcement',
      }),
    })
    const res = await postAnnouncement(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  await assertTest('DELETE /api/announcements: Unauthenticated / student caller cannot clear all announcements', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/announcements?clearAll=true', { method: 'DELETE' })
    const res = await deleteAnnouncement(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 8. Events
  await assertTest('POST /api/events: Student A cannot create department events', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Unauthorized Event',
        date: '2026-10-10',
        venue: 'Hall',
      }),
    })
    const res = await postEvent(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 9. Question Papers
  await assertTest('POST /api/question-papers: Student A cannot upload examination question papers', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/question-papers', {
      method: 'POST',
      body: JSON.stringify({
        subjectId: 'sub_1',
        examType: 'Model Exam',
      }),
    })
    const res = await postQuestionPaper(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 10. Faculty Questions
  await assertTest('DELETE /api/faculty/questions: Student A cannot delete important question bank questions', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/faculty/questions?id=q_123', { method: 'DELETE' })
    const res = await deleteQuestion(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 11. Faculty Syllabus
  await assertTest('POST /api/faculty/syllabus: Student A cannot upload syllabus units', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/faculty/syllabus', {
      method: 'POST',
      body: JSON.stringify({
        subjectCode: 'CS101',
        units: [{ unit: 'Unit I', title: 'Intro' }],
      }),
    })
    const res = await postSyllabus(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 12. Attendance
  await assertTest('GET /api/attendance: Student A cannot view global report (?all=true)', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/attendance?all=true')
    const res = await getAttendance(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  await assertTest('POST /api/attendance: Student A cannot record/lock classroom attendance', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/attendance', {
      method: 'POST',
      body: JSON.stringify({
        year: 2,
        section: 'A',
        records: [{ registerNumber: '922522AD001', status: 'P' }],
      }),
    })
    const res = await postAttendance(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 13. Attendance Unlock Request
  await assertTest('POST /api/attendance/unlock-request: Student A cannot approve unlock requests', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/attendance/unlock-request', {
      method: 'POST',
      body: JSON.stringify({
        action: 'APPROVE',
        requestId: 'unlock_123',
      }),
    })
    const res = await postUnlockRequest(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 14. Notifications
  await assertTest('POST /api/notifications: Student A cannot broadcast department-wide notifications', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Spam Alert',
        message: 'Spam body',
      }),
    })
    const res = await postNotifications(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  await assertTest('DELETE /api/notifications: Student A cannot clear notifications', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/notifications?clearAll=true', { method: 'DELETE' })
    const res = await deleteNotifications(req)
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 15. Admin Dashboard Stats
  await assertTest('GET /api/admin/dashboard/stats: Student A cannot access admin dashboard statistics', async () => {
    setSession(studentA)
    const res = await getAdminStats()
    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`)
    }
  })

  // 16. Push Subscribe
  await assertTest('POST /api/push/subscribe: Unauthenticated caller cannot register push subscriptions', async () => {
    setSession(null)
    const req = new Request('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: 'https://push.example.com/sub/1',
        keys: { p256dh: 'test_key', auth: 'test_auth' },
      }),
    })
    const res = await postPushSubscribe(req)
    if (res.status !== 401) {
      throw new Error(`Expected status 401, got ${res.status}`)
    }
  })

  // 17. Auth Complete Profile
  await assertTest('POST /api/auth/complete-profile: Unauthenticated caller cannot change passwords without verified OTP', async () => {
    setSession(null)
    const req = new (Request as any)('http://localhost:3000/api/auth/complete-profile', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user_student_b',
        newPassword: 'hackedPassword123',
      }),
    })
    const res = await postCompleteProfile(req)
    if (res.status !== 401) {
      throw new Error(`Expected status 401, got ${res.status}`)
    }
  })

  // 18. Faculty Laboratory Day Activities
  await assertTest('PUT /api/faculty/laboratory: Student cannot modify faculty laboratory activities', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/faculty/laboratory', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'activity_123',
        topicCovered: 'Malicious modification',
      }),
    })
    const res = await putLabActivity(req)
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected status 401 or 403, got ${res.status}`)
    }
  })

  await assertTest('DELETE /api/faculty/laboratory: Student cannot delete faculty laboratory activities', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/faculty/laboratory?id=activity_123', {
      method: 'DELETE',
    })
    const res = await deleteLabActivity(req)
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected status 401 or 403, got ${res.status}`)
    }
  })

  // 19. Projects Ownership
  await assertTest('PUT /api/projects: Unauthenticated caller cannot edit projects', async () => {
    setSession(null)
    const req = new Request('http://localhost:3000/api/projects', {
      method: 'PUT',
      body: JSON.stringify({ id: 'proj_123', title: 'Hacked Title' }),
    })
    const res = await putProject(req)
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected status 401/403, got ${res.status}`)
    }
  })

  await assertTest('DELETE /api/projects: Unauthenticated caller cannot delete projects', async () => {
    setSession(null)
    const req = new Request('http://localhost:3000/api/projects?id=proj_123', {
      method: 'DELETE',
    })
    const res = await deleteProject(req)
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected status 401/403, got ${res.status}`)
    }
  })

  // 20. Resources Ownership
  await assertTest('PUT /api/resources: Unauthenticated caller cannot modify resources', async () => {
    setSession(null)
    const req = new Request('http://localhost:3000/api/resources', {
      method: 'PUT',
      body: JSON.stringify({ id: 'res_123', title: 'Hacked' }),
    })
    const res = await putResource(req)
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected status 401/403, got ${res.status}`)
    }
  })

  await assertTest('DELETE /api/resources: Unauthenticated caller cannot delete resources', async () => {
    setSession(null)
    const req = new Request('http://localhost:3000/api/resources?id=res_123', {
      method: 'DELETE',
    })
    const res = await deleteResource(req)
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected status 401/403, got ${res.status}`)
    }
  })

  // 21. Form Tracker Student Privacy
  await assertTest('GET /api/announcements/form-tracker: Student cannot access full cohort phone/contact list', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/announcements/form-tracker?announcementId=ann_1&year=2')
    const res = await getFormTracker(req)
    const data = await res.json()
    if (data.completedStudents?.length > 0 || data.pendingStudents?.length > 0) {
      throw new Error('Student received cohort personal details!')
    }
  })

  // 22. AI Knowledge Base Privacy
  await assertTest('GET /api/ai: Student A cannot lookup Student B directory records via AI', async () => {
    setSession(studentA)
    const req = new Request('http://localhost:3000/api/ai?q=student%20922522AD002')
    const res = await getAi(req)
    const data = await res.json()
    if (!data.answer?.includes('Student Directory Privacy Notice')) {
      throw new Error(`Expected Student Directory Privacy Notice, got: ${data.answer}`)
    }
  })

  console.log(`\n========================================`)
  console.log(`TOTAL TESTS: ${passed + failed}`)
  console.log(`PASSED: ${passed}`)
  console.log(`FAILED: ${failed}`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((e) => {
  console.error('Fatal error running tests:', e)
  process.exit(1)
})
