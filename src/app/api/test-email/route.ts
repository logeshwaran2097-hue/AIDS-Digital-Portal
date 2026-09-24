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
        <div style="background-color: #0B0E14; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #121826; border: 1px solid #2A3441; border-top: 4px solid #D4AF37; padding: 50px 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h1 style="color: #D4AF37; font-size: 36px; font-family: 'Georgia', serif; font-weight: normal; letter-spacing: 4px; margin-bottom: 30px; text-transform: uppercase;">Happy Birthday</h1>
            
            <p style="font-size: 20px; color: #FFFFFF; font-weight: 300; letter-spacing: 1px; margin-bottom: 25px;">
              Dear <strong style="font-weight: 600; color: #D4AF37;">${userName}</strong>,
            </p>
            
            <div style="height: 1px; width: 60px; background-color: #D4AF37; margin: 0 auto 30px auto;"></div>
            
            <p style="font-size: 16px; line-height: 1.8; color: #A0ABC0; margin-bottom: 25px;">
              On this special day, we wish you immense joy, boundless laughter, and extraordinary success in all your future endeavors. 
            </p>
            
            <p style="font-size: 16px; line-height: 1.8; color: #A0ABC0; margin-bottom: 40px;">
              May this year bring you closer to your dreams and aspirations. Keep shining bright and making us exceptionally proud.
            </p>
            
            <p style="font-size: 14px; font-style: italic; color: #718096; letter-spacing: 1px;">
              Warmest wishes,<br>
              <span style="color: #D4AF37; font-weight: bold; display: inline-block; margin-top: 10px;">DIGITAL PORTAL OF AI&DS</span>
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
