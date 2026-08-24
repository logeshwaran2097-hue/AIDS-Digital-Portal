const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedContent() {
  // 1. Events
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const events = [
      {
        name: 'National Level AI & Machine Learning Hackathon 2026',
        description: '24-hour coding challenge on generative AI, computer vision, and predictive modeling with cash prizes worth 1 Lakh.',
        date: new Date('2026-09-15'),
        time: '09:00 AM - 05:00 PM',
        venue: 'Main Auditorium & AI Innovation Lab',
        category: 'Hackathon',
        status: 'published',
        isPublished: true,
        registrationUrl: 'https://hackathon.vsb.ac.in',
        createdByName: 'Dr. S. Karthik',
      },
      {
        name: 'Hands-on Workshop: Deep Learning with PyTorch & Transformers',
        description: 'Industry expert session on building large language models, attention mechanisms, and fine-tuning.',
        date: new Date('2026-09-22'),
        time: '10:00 AM - 04:00 PM',
        venue: 'Data Analytics Center (Lab 3)',
        category: 'Workshop',
        status: 'published',
        isPublished: true,
        registrationUrl: 'https://workshops.vsb.ac.in',
        createdByName: 'Prof. R. Meena',
      },
      {
        name: 'Guest Lecture: Scalable Cloud Architecture for Big Data',
        description: 'Distinguished lecture by Principal Architect, AWS Cloud Services on enterprise data pipelines.',
        date: new Date('2026-10-05'),
        time: '02:00 PM - 04:30 PM',
        venue: 'Seminar Hall II',
        category: 'Seminar',
        status: 'published',
        isPublished: true,
        registrationUrl: 'https://seminar.vsb.ac.in',
        createdByName: 'Dr. K. Mohan',
      },
    ];
    for (const e of events) {
      await prisma.event.create({ data: e });
    }
    console.log('Seeded events!');
  }

  // 2. Announcements
  const annCount = await prisma.announcement.count();
  if (annCount === 0) {
    const anns = [
      {
        title: 'Internal Assessment Test 1 (IAT-1) Schedule Released',
        content: 'IAT-1 for III Year and II Year AI & DS will commence from 1st September 2026. Seating plans and syllabus coverage are posted.',
        category: 'Examination',
        target: 'all',
        isPublished: true,
        createdByName: 'Prof. Dr. V. Sundar (HOD)',
      },
      {
        title: 'Placement Training: Python & DSA Mock Interview Sessions',
        content: 'Special placement training for final year and pre-final year students starts every Saturday from 09:30 AM in Lab 1.',
        category: 'Placement',
        target: 'students',
        isPublished: true,
        createdByName: 'Placement Cell',
      },
      {
        title: 'Department Technical Symposium: INTELLICA 2026',
        content: 'Call for papers and project prototypes open for national level symposium. Cash prizes and certificates for all finalists.',
        category: 'Academic',
        target: 'all',
        isPublished: true,
        createdByName: 'AI & DS Association',
      },
    ];
    for (const a of anns) {
      await prisma.announcement.create({ data: a });
    }
    console.log('Seeded announcements!');
  }

  // 3. Achievements
  const achCount = await prisma.achievement.count();
  if (achCount === 0) {
    const achs = [
      {
        title: '1st Prize - Smart India Hackathon (SIH 2025)',
        description: 'AI & DS Team "Neural Knights" won 1st prize of Rs. 1,00,000 for AI Crop Disease Detection System.',
        category: 'Hackathon',
        recipientType: 'Student Team',
        recipientName: 'K. Aishwarya & Team (III Year)',
        awardName: '1st Prize & Gold Trophy',
        eventName: 'Smart India Hackathon 2025',
        status: 'published',
        date: new Date('2025-12-10'),
      },
      {
        title: 'Best Research Paper Award - IEEE ICCCNT 2025',
        description: 'Research paper on "Edge AI for Precision Agriculture" published and presented.',
        category: 'Research',
        recipientType: 'Student',
        recipientName: 'R. Deepak (III Year)',
        awardName: 'Best Paper Award',
        eventName: 'IEEE ICCCNT 2025',
        status: 'published',
        date: new Date('2025-11-20'),
      },
      {
        title: 'Winner - National Level Code Marathon 2025',
        description: 'Fastest algorithmic solution developed using Python & PyTorch in 3-hour speed coding.',
        category: 'Coding',
        recipientType: 'Student',
        recipientName: 'N. Sandhiya (III Year)',
        awardName: '1st Rank Winner',
        eventName: 'National Code Marathon',
        status: 'published',
        date: new Date('2025-10-15'),
      },
    ];
    for (const ac of achs) {
      await prisma.achievement.create({ data: ac });
    }
    console.log('Seeded achievements!');
  }
}

seedContent().then(() => {
  console.log('Done seeding!');
  process.exit(0);
});
