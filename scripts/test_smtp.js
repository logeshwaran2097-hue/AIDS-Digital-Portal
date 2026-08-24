const nodemailer = require('nodemailer');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

async function testWithUser(email) {
  console.log(`Testing SMTP with account: ${email}...`);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: email,
      pass: 'cyfxkvqkqgfiicok',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"V.S.B. AI & DS Portal" <${email}>`,
      to: email,
      subject: 'V.S.B. AI & DS Portal — Real SMTP Test Email',
      text: 'Hello! Real Gmail SMTP integration is working successfully with IPv4!',
      html: '<b>Hello! Real Gmail SMTP integration is working successfully with IPv4!</b>',
    });
    console.log(`✅ SUCCESS with ${email}! Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed with ${email}:`, err.message);
    return false;
  }
}

async function run() {
  const r1 = await testWithUser('lonelyboy44y@gmail.com');
  if (!r1) {
    await testWithUser('lonelyking44y@gmail.com');
  }
}

run();
