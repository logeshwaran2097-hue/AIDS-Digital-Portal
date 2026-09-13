/**
 * Standardized notification classifier for menu domain attribution.
 * Maps any notification to at most ONE primary domain key.
 * Ensures notifications are never duplicated across unrelated menus.
 */
export function categorizeNotification(title: string, message?: string | null): string | null {
  const t = (title || '').toLowerCase()
  const m = (message || '').toLowerCase()
  const combined = `${t} ${m}`

  // 1. OD Applications & Leave Requests (High priority for application & review notices)
  if (
    t.includes('od application') ||
    t.includes('od request') ||
    t.includes('[advisor endorsed]') ||
    t.includes('[od endorsed]') ||
    t.includes('[od approved]') ||
    t.includes('[od declined]') ||
    t.includes('[od rejected]') ||
    t.includes('[class advisor review]') ||
    t.includes('[hod approval needed]') ||
    t.includes('leave request') ||
    t.includes('permission request') ||
    t.includes('on-duty application') ||
    t.includes('personal / emergency leave') ||
    t.includes('technical hackathon / competition od')
  ) {
    return 'od-applications'
  }

  // 2. OD Proofs & Certificates
  if (
    t.includes('proof') ||
    t.includes('certificate') ||
    t.includes('geo-photo') ||
    combined.includes('proof submitted') ||
    combined.includes('proof uploaded') ||
    combined.includes('proof verification')
  ) {
    return 'od-proofs'
  }

  // 3. General OD & Leave terms in title
  if (
    t.includes('od') ||
    t.includes('on-duty') ||
    t.includes('on duty') ||
    t.includes('leave')
  ) {
    return 'od-applications'
  }

  // 3. Attendance & Unlocks
  if (
    t.includes('attendance') ||
    t.includes('roll call') ||
    t.includes('absent') ||
    t.includes('condonation') ||
    combined.includes('attendance unlock') ||
    combined.includes('attendance locked')
  ) {
    return 'attendance'
  }

  // 4. Question Papers & Examinations (IAT, tests)
  if (
    t.includes('question') ||
    t.includes('iat') ||
    t.includes('exam paper') ||
    t.includes('question paper') ||
    combined.includes('question paper') ||
    combined.includes('internal assessment') ||
    combined.includes('iat-')
  ) {
    return 'question-papers'
  }

  // 5. Projects & Capstone
  if (
    t.includes('project') ||
    t.includes('capstone') ||
    combined.includes('project review') ||
    combined.includes('project milestone')
  ) {
    return 'projects'
  }

  // 6. Events, Hackathons, Symposiums, Workshops
  if (
    t.includes('event') ||
    t.includes('hackathon') ||
    t.includes('symposium') ||
    t.includes('workshop') ||
    t.includes('webinar') ||
    t.includes('conference')
  ) {
    return 'events'
  }

  // 7. Achievements & Awards
  if (
    t.includes('achievement') ||
    t.includes('winner') ||
    t.includes('award') ||
    t.includes('trophy') ||
    t.includes('prize') ||
    t.includes('congratulation')
  ) {
    return 'achievements'
  }

  // 8. Resources & Study Materials
  if (
    t.includes('resource') ||
    t.includes('study material') ||
    t.includes('lab manual') ||
    t.includes('lecture notes')
  ) {
    return 'resources'
  }

  // 9. Academic Subjects & Curriculum
  if (
    t.includes('subject') ||
    t.includes('syllabus') ||
    t.includes('curriculum') ||
    t.includes('course material')
  ) {
    return 'subjects'
  }

  // 10. Announcements & Circulars
  if (
    t.includes('announcement') ||
    t.includes('circular') ||
    t.includes('official notice') ||
    t.includes('department notice')
  ) {
    return 'announcements'
  }

  // 11. Faculty or Student profile updates
  if (t.includes('faculty') || t.includes('staff')) {
    return 'faculty'
  }
  if (t.includes('student') || t.includes('admission') || t.includes('enrollment')) {
    return 'students'
  }

  // Fallback: Check combined content with strict phrases
  if (combined.includes('od application') || combined.includes('on-duty')) return 'od-applications'
  if (combined.includes('attendance')) return 'attendance'
  if (combined.includes('question paper')) return 'question-papers'
  if (combined.includes('resource') || combined.includes('study material')) return 'resources'
  if (combined.includes('announcement') || combined.includes('circular')) return 'announcements'

  return null
}

/**
 * Resolves a nav menu item to its canonical category key.
 * Returns empty string if not a category domain (e.g. root dashboard, generic notifications).
 */
export function getMenuCategoryKey(href: string, label: string): string {
  const lowerHref = href.toLowerCase()
  const lowerLabel = label.toLowerCase()

  const isRootDashboard =
    href === '/dashboard' ||
    href === '/faculty-dashboard' ||
    href === '/hod-dashboard' ||
    href === '/admin' ||
    href === '/admin/dashboard'
  if (isRootDashboard) return ''

  if (lowerHref.includes('/notifications') || lowerLabel === 'notifications') {
    return 'notifications'
  }

  if (lowerHref.includes('od-proofs') || lowerLabel.includes('proof')) return 'od-proofs'
  if (
    lowerHref.includes('od-applications') ||
    lowerHref.includes('od') ||
    lowerLabel.includes('od') ||
    lowerLabel.includes('leave')
  ) {
    return 'od-applications'
  }
  if (lowerHref.includes('attendance') || lowerLabel.includes('attendance')) return 'attendance'
  if (lowerHref.includes('announcement') || lowerLabel.includes('announcement')) return 'announcements'
  if (lowerHref.includes('event') || lowerLabel.includes('event')) return 'events'
  if (lowerHref.includes('project') || lowerLabel.includes('project')) return 'projects'
  if (lowerHref.includes('question') || lowerLabel.includes('question')) return 'question-papers'
  if (lowerHref.includes('achievement') || lowerLabel.includes('achievement')) return 'achievements'
  if (
    lowerHref.includes('resource') ||
    lowerHref.includes('study') ||
    lowerLabel.includes('resource') ||
    lowerLabel.includes('study')
  ) {
    return 'resources'
  }
  if (
    lowerHref.includes('subject') ||
    lowerHref.includes('academic') ||
    lowerLabel.includes('subject') ||
    lowerLabel.includes('academic')
  ) {
    return 'subjects'
  }
  if (lowerHref.includes('student') || lowerLabel.includes('student')) return 'students'
  if (lowerHref.includes('faculty') || lowerLabel.includes('faculty')) return 'faculty'
  if (lowerHref.includes('report') || lowerLabel.includes('report')) return 'reports'

  return ''
}
