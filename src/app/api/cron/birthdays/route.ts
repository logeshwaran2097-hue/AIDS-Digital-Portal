import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import nodemailer from 'nodemailer'
import dns from 'dns'

// Force dynamic execution for API route
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 1. Verify Authorization (Vercel Cron automatically sends this header)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET environment variable is missing' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Determine today's month and day (in IST to align with college timezone)
    // Vercel server time is UTC. We shift it to IST (+5:30) for checking birthdays.
    const nowUtc = new Date()
    const offsetMs = 5.5 * 60 * 60 * 1000
    const nowIst = new Date(nowUtc.getTime() + offsetMs)
    const todayMonth = nowIst.getMonth()
    const todayDate = nowIst.getDate()

    // 3. Fetch all active students (or all students)
    const allStudents = await prisma.student.findMany()
    
    // Filter in-memory for those whose birthday is today
    const birthdayStudents = allStudents.filter(student => {
      if (!student.dateOfBirth) return false
      const dob = new Date(student.dateOfBirth)
      // The dob stored in DB might be UTC midnight. We just check the getUTCMonth and getUTCDate
      // or local getMonth if it was stored without timezones.
      return dob.getMonth() === todayMonth && dob.getDate() === todayDate
    })

    if (birthdayStudents.length === 0) {
      return NextResponse.json({ message: 'No birthdays today', sentCount: 0 })
    }

    const userIds = birthdayStudents.map(s => s.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        status: 'active'
      }
    })

    const usersToEmail = users.filter(u => u.email)

    if (usersToEmail.length === 0) {
      return NextResponse.json({ message: 'No active users found for today\'s birthdays', sentCount: 0 })
    }

    // 4. Setup Nodemailer Transport (re-using logic from auth.ts)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    if (!smtpUser || !smtpPass) {
      console.warn('SMTP credentials not configured. Skipping email dispatch.')
      return NextResponse.json({ error: 'SMTP credentials missing', sentCount: 0 }, { status: 500 })
    }

    const portStr = process.env.SMTP_PORT || '465'
    const port = parseInt(portStr, 10)
    let resolvedHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    
    try {
      const ip = await new Promise<string>((resolve, reject) => {
        dns.lookup(resolvedHost, (err: any, address: string) => {
          if (err || !address) reject(err)
          else resolve(address)
        })
      })
      if (ip) resolvedHost = ip
    } catch {}

    const transporter = nodemailer.createTransport({
      host: resolvedHost,
      port: port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        servername: process.env.SMTP_HOST || 'smtp.gmail.com',
        rejectUnauthorized: false,
      },
    })

    // 5. Send Emails
    let sentCount = 0
    for (const user of usersToEmail) {
      const mailOptions = {
        from: `"Digital Portal of AI&DS" <${smtpUser}>`,
        to: user.email,
        subject: `🎉 Happy Birthday, ${user.name}!`,
        html: `
          <div style="background-color: #F7F2F0; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAE0DF; border-top: 5px solid #C07C88; padding: 50px 40px; text-align: center; box-shadow: 0 15px 35px rgba(192, 124, 136, 0.1); border-radius: 8px;">
              <h1 style="color: #C07C88; font-size: 38px; font-family: 'Georgia', serif; font-weight: normal; letter-spacing: 3px; margin-bottom: 25px; text-transform: uppercase;">Happy Birthday</h1>
              
              <p style="font-size: 22px; color: #333333; font-weight: 300; letter-spacing: 1px; margin-bottom: 25px;">
                Dear <strong style="font-weight: 600; color: #C07C88;">${user.name}</strong>,
              </p>
              
              <div style="height: 1px; width: 60px; background-color: #C07C88; margin: 0 auto 30px auto; opacity: 0.6;"></div>
              
              <p style="font-size: 17px; line-height: 1.8; color: #555555; margin-bottom: 20px;">
                On this beautiful day, we celebrate you! We wish you a day filled with immense joy, boundless laughter, and unforgettable moments with those you cherish.
              </p>
              
              <p style="font-size: 17px; line-height: 1.8; color: #555555; margin-bottom: 20px;">
                May the year ahead bring you closer to your grandest dreams and highest aspirations. May you conquer every challenge with grace and continue to shine brilliantly in all your endeavors.
              </p>
              
              <p style="font-size: 17px; line-height: 1.8; color: #555555; margin-bottom: 40px;">
                Your dedication and spirit make us exceptionally proud to have you as part of our community. Here's to health, happiness, and extraordinary success!
              </p>
              
              <p style="font-size: 15px; font-style: italic; color: #888888; letter-spacing: 1px;">
                With our warmest wishes,<br>
                <span style="color: #C07C88; font-weight: bold; display: inline-block; margin-top: 10px;">DIGITAL PORTAL OF AI&DS</span>
              </p>
            </div>
          </div>
        `
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log(`[CRON] Sent birthday email to ${user.email}`)
        sentCount++
      } catch (err) {
        console.error(`[CRON] Failed to send birthday email to ${user.email}:`, err)
      }
    }

    return NextResponse.json({ message: 'Birthday cron execution complete', sentCount })

  } catch (error: any) {
    console.error('[CRON] Error executing birthday cron:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
