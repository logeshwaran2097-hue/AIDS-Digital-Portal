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
        <div style="background-color: #F7F2F0; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAE0DF; border-top: 5px solid #C07C88; padding: 50px 40px; text-align: center; box-shadow: 0 15px 35px rgba(192, 124, 136, 0.1); border-radius: 8px;">
            <h1 style="color: #C07C88; font-size: 38px; font-family: 'Georgia', serif; font-weight: normal; letter-spacing: 3px; margin-bottom: 25px; text-transform: uppercase;">Happy Birthday</h1>
            
            <p style="font-size: 22px; color: #333333; font-weight: 300; letter-spacing: 1px; margin-bottom: 25px;">
              Dear <strong style="font-weight: 600; color: #C07C88;">${userName}</strong>,
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

    await transporter.sendMail(mailOptions)
    
    return NextResponse.json({ success: true, message: `Test email successfully sent to ${targetEmail}!` })
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
