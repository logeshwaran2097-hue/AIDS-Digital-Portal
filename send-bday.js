
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const dns = require('dns');

const prisma = new PrismaClient();

async function main() {
  process.env.SMTP_PASS = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  
  const today = new Date();
  const m = today.getMonth();
  const d = today.getDate();
  
  const students = await prisma.student.findMany();
  const birthdayStudents = students.filter(s => s.dateOfBirth && new Date(s.dateOfBirth).getMonth() === m && new Date(s.dateOfBirth).getDate() === d);
  
  if (birthdayStudents.length === 0) {
    console.log('No birthdays today.');
    process.exit(0);
  }
  
  const userIds = birthdayStudents.map(s => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, status: 'active' }
  });
  
  const usersToEmail = users.filter(u => u.email);
  if (usersToEmail.length === 0) {
    console.log('No users with emails.');
    process.exit(0);
  }
  
  let resolvedHost = 'smtp.gmail.com';
  try {
    const ip = await new Promise((resolve, reject) => {
      dns.lookup(resolvedHost, 4, (err, address) => {
        if (err || !address) reject(err);
        else resolve(address);
      });
    });
    if (ip) resolvedHost = ip;
  } catch(e) {}
  
  const transporter = nodemailer.createTransport({
    host: resolvedHost,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: 'smtp.gmail.com',
      rejectUnauthorized: false
    }
  });

  for (const user of usersToEmail) {
    const mailOptions = {
      from: `"Digital Portal of AI&DS" <${process.env.SMTP_USER}>`,
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
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Sent to ${user.email}`);
    } catch (e) {
      console.error(e);
    }
  }
  process.exit(0);
}
main();
