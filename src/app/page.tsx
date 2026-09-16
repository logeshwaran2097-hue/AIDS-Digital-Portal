import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  if (session.role === 'admin') redirect('/admin')
  if (session.role === 'hod') redirect('/hod-dashboard')
  if (session.role === 'faculty') {
    if (session.isAdvisor || session.facultyType === 'advisor') {
      redirect('/faculty-dashboard/attendance?mode=morning&role=advisor')
    }
    redirect('/faculty-dashboard')
  }
  redirect('/dashboard')
}