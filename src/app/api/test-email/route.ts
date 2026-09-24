import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import dns from 'dns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const targetEmail = 'logeshwaran2097@gmail.com'
    const userName = 'Logeshwaran'

    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS
    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'SMTP credentials missing in Vercel' }, { status: 500 })
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

    const mailOptions = {
      from: `"Digital Portal of AI&DS" <${smtpUser}>`,
      to: targetEmail,
      subject: `🎉 Happy Birthday, ${userName}! (Live Test)`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #071A3D; color: #ffffff; padding: 40px; border-radius: 20px; text-align: center; border: 4px solid #22C7E8;">
          <h1 style="color: #22C7E8; font-size: 32px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Happy Birthday!</h1>
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #e2e8f0;">
            Dear <strong>${userName}</strong>,
          </p>
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; color: #e2e8f0;">
            On this special day, we wish you immense joy, boundless laughter, and extraordinary success in all your future endeavors! ✨
          </p>
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px; color: #e2e8f0;">
            May this year bring you closer to your dreams and aspirations. Keep shining bright and making us proud!
          </p>
          <p style="font-size: 16px; font-weight: bold; font-style: italic; color: #22C7E8;">
            — With warm wishes from the Digital Portal of AI&amp;DS
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    
    return NextResponse.json({ success: true, message: `Test email successfully sent to ${targetEmail}!` })
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
