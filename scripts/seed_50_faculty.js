const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const facultyList = [
  {
    name: 'Dr. S. K. Ramesh',
    designation: 'Professor & Head of Research',
    qualification: 'Ph.D., M.E. (Computer Science)',
    experience: 22,
    specialization: 'Artificial Intelligence & Neural Networks',
    advisorYear: 4, advisorSem: 8, advisorSec: 'A', advisorBatch: '2022-2026',
    subjects: ['AI Deep Learning Architectures', 'Advanced Neural Networks'],
  },
  {
    name: 'Dr. M. Soundararajan',
    designation: 'Professor',
    qualification: 'Ph.D., M.Tech. (Data Systems)',
    experience: 19,
    specialization: 'Big Data Analytics & Distributed Computing',
    advisorYear: 4, advisorSem: 8, advisorSec: 'B', advisorBatch: '2022-2026',
    subjects: ['Big Data Frameworks', 'Distributed Systems'],
  },
  {
    name: 'Dr. P. Vimaladevi',
    designation: 'Professor',
    qualification: 'Ph.D., M.E. (Software Engg)',
    experience: 18,
    specialization: 'Natural Language Processing & LLMs',
    advisorYear: 4, advisorSem: 8, advisorSec: 'C', advisorBatch: '2022-2026',
    subjects: ['Natural Language Processing', 'Generative AI Systems'],
  },
  {
    name: 'Dr. K. Balakrishnan',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.E. (Applied Electronics)',
    experience: 15,
    specialization: 'Computer Vision & Image Processing',
    advisorYear: 3, advisorSem: 6, advisorSec: 'A', advisorBatch: '2023-2027',
    subjects: ['Computer Vision', 'Pattern Recognition'],
  },
  {
    name: 'Dr. R. Anandhakumar',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.Tech. (Information Tech)',
    experience: 14,
    specialization: 'Reinforcement Learning & Robotics',
    advisorYear: 3, advisorSem: 6, advisorSec: 'B', advisorBatch: '2023-2027',
    subjects: ['Reinforcement Learning', 'Robotics AI'],
  },
  {
    name: 'Dr. S. Kavitha',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.E. (CSE)',
    experience: 14,
    specialization: 'Predictive Analytics & Statistics',
    advisorYear: 3, advisorSem: 6, advisorSec: 'C', advisorBatch: '2023-2027',
    subjects: ['Probability & Statistics for AI', 'Predictive Modeling'],
  },
  {
    name: 'Dr. N. Senthil Murugan',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.E. (Computer Science)',
    experience: 13,
    specialization: 'Cloud Computing & MLOps Infrastructure',
    advisorYear: 2, advisorSem: 4, advisorSec: 'A', advisorBatch: '2024-2028',
    subjects: ['Cloud Infrastructure', 'MLOps & Model Deployment'],
  },
  {
    name: 'Dr. G. Shanmugapriya',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.Tech. (AI & Robotics)',
    experience: 12,
    specialization: 'Knowledge Representation & Expert Systems',
    advisorYear: 2, advisorSem: 4, advisorSec: 'B', advisorBatch: '2024-2028',
    subjects: ['Knowledge Engineering', 'Cognitive Systems'],
  },
  {
    name: 'Dr. T. Muthukumar',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.E. (Network Engg)',
    experience: 12,
    specialization: 'Cyber Security in AI & Cryptography',
    advisorYear: 2, advisorSem: 4, advisorSec: 'C', advisorBatch: '2024-2028',
    subjects: ['AI Cyber Security', 'Data Privacy & Ethics'],
  },
  {
    name: 'Dr. A. Meenakshi',
    designation: 'Associate Professor',
    qualification: 'Ph.D., M.S. (Software Systems)',
    experience: 11,
    specialization: 'Time Series Forecasting & Econometrics',
    advisorYear: 1, advisorSem: 2, advisorSec: 'A', advisorBatch: '2025-2029',
    subjects: ['Data Structures & Algorithms', 'Python for Data Science'],
  },
  {
    name: 'Mr. C. Vigneshwaran',
    designation: 'Assistant Professor (Sr. Gr.)',
    qualification: 'M.E. (CSE), (Ph.D.)',
    experience: 10,
    specialization: 'Full-Stack Web Development & API Design',
    advisorYear: 1, advisorSem: 2, advisorSec: 'B', advisorBatch: '2025-2029',
    subjects: ['Object Oriented Programming with Java', 'Full Stack Development'],
  },
  {
    name: 'Mrs. D. Revathi',
    designation: 'Assistant Professor (Sr. Gr.)',
    qualification: 'M.Tech. (Data Science), (Ph.D.)',
    experience: 9,
    specialization: 'Data Mining & Data Warehousing',
    advisorYear: 1, advisorSem: 2, advisorSec: 'C', advisorBatch: '2025-2029',
    subjects: ['Database Management Systems', 'Data Warehousing'],
  },
  {
    name: 'Mr. V. Karthikeyan',
    designation: 'Assistant Professor (Sr. Gr.)',
    qualification: 'M.E. (Software Engg)',
    experience: 9,
    specialization: 'Embedded AI & Edge Computing',
    subjects: ['IoT & Embedded AI', 'Microcontrollers & Sensors'],
  },
  {
    name: 'Mrs. S. Bhuvaneshwari',
    designation: 'Assistant Professor (Sr. Gr.)',
    qualification: 'M.Tech. (Information Tech)',
    experience: 8,
    specialization: 'Graph Neural Networks & Social Analytics',
    subjects: ['Social Network Analytics', 'Graph Algorithms in AI'],
  },
  {
    name: 'Mr. M. Praveen Kumar',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 8,
    specialization: 'Deep Learning & Tensor Processing',
    subjects: ['Deep Learning Lab', 'AI Systems Architecture'],
  },
  {
    name: 'Mrs. K. Divyabharathi',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Communication Systems)',
    experience: 7,
    specialization: 'Speech Recognition & Audio Processing',
    subjects: ['Speech & Audio AI', 'Signal Processing for Data Science'],
  },
  {
    name: 'Mr. J. Naveenraj',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (AI & DS)',
    experience: 7,
    specialization: 'Generative Adversarial Networks (GANs)',
    subjects: ['Machine Learning', 'AI Model Optimization'],
  },
  {
    name: 'Mrs. P. Nandhini',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 7,
    specialization: 'Bioinformatics & Medical AI',
    subjects: ['Healthcare AI Applications', 'Bio-inspired Computing'],
  },
  {
    name: 'Mr. S. Dinesh Babu',
    designation: 'Assistant Professor',
    qualification: 'M.E. (CSE)',
    experience: 6,
    specialization: 'Blockchain & Smart Contracts in AI',
    subjects: ['Blockchain & Decentralized AI', 'Distributed Ledger Tech'],
  },
  {
    name: 'Mrs. R. Priyadharshini',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Data Analytics)',
    experience: 6,
    specialization: 'Business Intelligence & Tableau Visualization',
    subjects: ['Data Visualization & Storytelling', 'Business Intelligence'],
  },
  {
    name: 'Mr. B. Aravind',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Software Engg)',
    experience: 6,
    specialization: 'High-Performance Computing (CUDA/GPU)',
    subjects: ['Parallel & GPU Computing', 'C++ for High Performance Computing'],
  },
  {
    name: 'Mrs. M. Gayathri',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 5,
    specialization: 'Information Retrieval & Search Engines',
    subjects: ['Information Retrieval Systems', 'Semantic Web Technologies'],
  },
  {
    name: 'Mr. T. Gopinath',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Cyber Security)',
    experience: 5,
    specialization: 'Adversarial Machine Learning & AI Defense',
    subjects: ['Network Security', 'AI Security & Vulnerability Analysis'],
  },
  {
    name: 'Mrs. S. Shalini',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Applied Electronics)',
    experience: 5,
    specialization: 'Autonomous Vehicles & Navigation Systems',
    subjects: ['Sensor Fusion & Autonomous Systems', 'Robotics Perception'],
  },
  {
    name: 'Mr. K. Hariprasath',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Artificial Intelligence)',
    experience: 5,
    specialization: 'Explainable AI (XAI) & Interpretability',
    subjects: ['Explainable AI', 'Ethics & Responsible AI'],
  },
  {
    name: 'Mrs. V. Keerthana',
    designation: 'Assistant Professor',
    qualification: 'M.E. (CSE)',
    experience: 4,
    specialization: 'Recommender Systems & E-Commerce AI',
    subjects: ['Machine Learning Applications', 'Recommender Algorithms'],
  },
  {
    name: 'Mr. N. Manikandan',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Software Engineering)',
    experience: 4,
    specialization: 'Agile Software Development & DevOps',
    subjects: ['Software Engineering Methodologies', 'DevOps & CI/CD Pipelines'],
  },
  {
    name: 'Mrs. G. Archana',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Data Science)',
    experience: 4,
    specialization: 'Data Engineering & Pipeline Architectures',
    subjects: ['ETL & Data Engineering', 'Modern Database Systems'],
  },
  {
    name: 'Mr. P. Sathish Kumar',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 4,
    specialization: 'Reinforcement Learning in Game AI',
    subjects: ['Game Theory & AI', 'Algorithmic Problem Solving'],
  },
  {
    name: 'Mrs. A. Swathi',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Communication Systems)',
    experience: 4,
    specialization: '5G Wireless Networks & Edge AI',
    subjects: ['Wireless Communication & IoT', 'Mobile Computing'],
  },
  {
    name: 'Mr. S. Saravanan',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (CSE)',
    experience: 4,
    specialization: 'Quantum Machine Learning & Computing',
    subjects: ['Quantum Computing Fundamentals', 'Linear Algebra for Data Science'],
  },
  {
    name: 'Mrs. E. Mohanapriya',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 4,
    specialization: 'Sentiment Analysis & Opinion Mining',
    subjects: ['Text Analytics', 'Web & Social Media Mining'],
  },
  {
    name: 'Mr. R. Vijay Anand',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Embedded Systems)',
    experience: 3,
    specialization: 'TinyML & Low-Power AI Devices',
    subjects: ['Embedded AI & TinyML', 'Hardware Acceleration for AI'],
  },
  {
    name: 'Mrs. T. Subhashini',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Information Technology)',
    experience: 3,
    specialization: 'Cloud Native Microservices & Docker',
    subjects: ['Microservices Architecture', 'Cloud Application Development'],
  },
  {
    name: 'Mr. D. Gokulraj',
    designation: 'Assistant Professor',
    qualification: 'M.E. (CSE)',
    experience: 3,
    specialization: 'Geometric Deep Learning & 3D Vision',
    subjects: ['3D Computer Vision', 'Augmented & Virtual Reality AI'],
  },
  {
    name: 'Mrs. K. Madhumitha',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Software Engineering)',
    experience: 3,
    specialization: 'Automated Software Testing & QA AI',
    subjects: ['Software Testing & Quality Assurance', 'Design Patterns in AI'],
  },
  {
    name: 'Mr. M. Ilango',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Artificial Intelligence)',
    experience: 3,
    specialization: 'Multimodal AI & Speech-to-Image Generation',
    subjects: ['Multimodal Machine Learning', 'Generative AI Workshop'],
  },
  {
    name: 'Mrs. S. Pavithra',
    designation: 'Assistant Professor',
    qualification: 'M.E. (CSE)',
    experience: 3,
    specialization: 'Federated Learning & Privacy-Preserving AI',
    subjects: ['Privacy Preserving Data Mining', 'Information Security'],
  },
  {
    name: 'Mr. V. Balaji',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 3,
    specialization: 'Synthetic Data Generation & Data Augmentation',
    subjects: ['Data Preprocessing & Feature Engineering', 'Statistical Machine Learning'],
  },
  {
    name: 'Mrs. N. Ramya',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Data Analytics)',
    experience: 3,
    specialization: 'Customer Churn & Behavioral AI Analysis',
    subjects: ['Applied Data Analytics', 'Predictive Business Modeling'],
  },
  {
    name: 'Mr. J. Premkumar',
    designation: 'Assistant Professor',
    qualification: 'M.E. (CSE)',
    experience: 3,
    specialization: 'Deep Reinforcement Learning & Multi-Agent Systems',
    subjects: ['Multi-Agent Systems', 'Advanced Algorithms'],
  },
  {
    name: 'Mrs. C. Sowmya',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Communication Systems)',
    experience: 3,
    specialization: 'Neuromorphic Computing & Spiking Neural Networks',
    subjects: ['Brain-Computer Interfaces', 'Biometrics & Pattern Matching'],
  },
  {
    name: 'Mr. L. Rithik',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (AI & DS)',
    experience: 3,
    specialization: 'Large Language Model Fine-Tuning (RAG & LoRA)',
    subjects: ['RAG Systems & Vector Databases', 'Prompt Engineering & Fine-tuning'],
  },
  {
    name: 'Mrs. B. Anitha',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 3,
    specialization: 'AI for Climate Science & Satellite Imagery',
    subjects: ['Geospatial AI & Remote Sensing', 'Environmental Data Science'],
  },
  {
    name: 'Mr. H. Mohanraj',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Software Engg)',
    experience: 3,
    specialization: 'AI-Driven Code Optimization & Compilers',
    subjects: ['Compiler Design for AI Accelerators', 'Programming Language Theory'],
  },
  {
    name: 'Mrs. D. Sneha',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Data Science)',
    experience: 3,
    specialization: 'Automated Machine Learning (AutoML)',
    subjects: ['AutoML Systems', 'Data Science Toolkits'],
  },
  {
    name: 'Mr. K. Sanjay',
    designation: 'Assistant Professor',
    qualification: 'M.E. (CSE)',
    experience: 3,
    specialization: 'Real-time Video Analytics & Edge AI Inference',
    subjects: ['Video Stream Processing', 'Real-time AI Inference'],
  },
  {
    name: 'Mrs. G. Vinitha',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Information Technology)',
    experience: 3,
    specialization: 'Financial AI & Algorithmic Trading Systems',
    subjects: ['Financial Data Analytics', 'Quantitative Trading AI'],
  },
  {
    name: 'Mr. S. Roshan',
    designation: 'Assistant Professor',
    qualification: 'M.Tech. (Artificial Intelligence)',
    experience: 3,
    specialization: 'Causal Inference & Counterfactual AI',
    subjects: ['Causal Machine Learning', 'Advanced Probability & Random Processes'],
  },
  {
    name: 'Mrs. M. Deepa',
    designation: 'Assistant Professor',
    qualification: 'M.E. (Computer Science)',
    experience: 3,
    specialization: 'Human-AI Interaction & UX for Intelligent Systems',
    subjects: ['Human Centered AI', 'UI/UX Design for AI Applications'],
  }
]

async function seed50Faculty() {
  console.log('🚀 Seeding 50 Department of AI & DS Faculty Members...')

  const defaultPassword = 'Faculty@123'
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10)

  let count = 0
  for (let i = 0; i < facultyList.length; i++) {
    const f = facultyList[i]
    const fid = `VSBAIDS${String(i + 1).padStart(3, '0')}`
    const email = `${fid.toLowerCase()}@vsb.edu.in`
    const phone = `+91 94${String(40000000 + i * 12345).padStart(8, '0')}`
    const dob = new Date(`${1975 + Math.floor(i / 2)}-0${((i % 9) + 1)}-15`)

    try {
      // 1. Create or update User record
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: f.name,
          phone,
          role: 'faculty',
          status: 'active',
          passwordHash: defaultPasswordHash,
        },
        create: {
          email,
          name: f.name,
          phone,
          role: 'faculty',
          status: 'active',
          passwordHash: defaultPasswordHash,
          mustChangePassword: true,
        },
      })

      // 2. Create or update Faculty record
      await prisma.faculty.upsert({
        where: { facultyId: fid },
        update: {
          userId: user.id,
          dateOfBirth: dob,
          designation: f.designation,
          qualification: f.qualification,
          experience: f.experience,
          specialization: f.specialization,
          subjects: JSON.stringify(f.subjects || []),
          subjectName: f.subjects && f.subjects[0] ? f.subjects[0] : null,
          classDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i % 5],
          classPeriod: `Period ${(i % 6) + 1}`,
          classTime: ['09:00 - 09:50', '09:50 - 10:40', '11:00 - 11:50', '11:50 - 12:40', '01:30 - 02:20', '02:20 - 03:10'][i % 6],
          advisorYear: f.advisorYear || null,
          advisorSem: f.advisorSem || null,
          advisorSec: f.advisorSec || null,
          advisorBatch: f.advisorBatch || null,
          facultyType: 'both',
        },
        create: {
          userId: user.id,
          facultyId: fid,
          dateOfBirth: dob,
          designation: f.designation,
          qualification: f.qualification,
          experience: f.experience,
          specialization: f.specialization,
          subjects: JSON.stringify(f.subjects || []),
          subjectName: f.subjects && f.subjects[0] ? f.subjects[0] : null,
          classDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i % 5],
          classPeriod: `Period ${(i % 6) + 1}`,
          classTime: ['09:00 - 09:50', '09:50 - 10:40', '11:00 - 11:50', '11:50 - 12:40', '01:30 - 02:20', '02:20 - 03:10'][i % 6],
          advisorYear: f.advisorYear || null,
          advisorSem: f.advisorSem || null,
          advisorSec: f.advisorSec || null,
          advisorBatch: f.advisorBatch || null,
          facultyType: 'both',
        },
      })

      // 3. If class advisor, link into ClassAdvisor table
      if (f.advisorYear && f.advisorSem && f.advisorSec && f.advisorBatch) {
        await prisma.classAdvisor.upsert({
          where: {
            year_section_semester_academicYear: {
              year: f.advisorYear,
              section: f.advisorSec,
              semester: f.advisorSem,
              academicYear: '2025-2026',
            },
          },
          update: {
            facultyId: fid,
            facultyName: f.name,
          },
          create: {
            facultyId: fid,
            facultyName: f.name,
            year: f.advisorYear,
            section: f.advisorSec,
            semester: f.advisorSem,
            academicYear: '2025-2026',
          },
        })
      }

      count++
      if (count % 10 === 0 || count === facultyList.length) {
        console.log(`✅ Seeded ${count}/${facultyList.length} faculty members...`)
      }
    } catch (err) {
      console.error(`Error inserting faculty ${fid}:`, err.message)
    }
  }

  console.log(`\n🎉 Successfully seeded ${count} faculty members in the database!`)
  console.log('Default Faculty Login Password: Faculty@123')
}

seed50Faculty()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal seed error:', e)
    process.exit(1)
  })
