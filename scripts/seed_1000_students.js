const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const firstNames = [
  'Aadhil', 'Aakash', 'Abhinav', 'Abishek', 'Aditya', 'Ajay', 'Akash', 'Amarnath', 'Anand', 'Anbu',
  'Anirudh', 'Aravind', 'Arjun', 'Arul', 'Arun', 'Ashwin', 'Balaji', 'Barath', 'Bhuvanesh', 'Chandran',
  'Deepak', 'Dhanush', 'Dharani', 'Dinesh', 'Elango', 'Ganesh', 'Gautam', 'Gokul', 'Gopinath', 'Hariharan',
  'Harish', 'Hemnath', 'Ilango', 'Iniyan', 'Ishaan', 'Jagan', 'Jayanth', 'Jeeva', 'Kailash', 'Kalyan',
  'Kamal', 'Kannan', 'Karthik', 'Karthikeyan', 'Kaviarasan', 'Kavin', 'Kishore', 'Krishnan', 'Kumar', 'Lakshman',
  'Lokesh', 'Madhavan', 'Mani', 'Manikandan', 'Mano', 'Manoj', 'Mathan', 'Midhun', 'Mohan', 'Mouli',
  'Mukesh', 'Muralidharan', 'Nagarajan', 'Naresh', 'Naveen', 'Nikhil', 'Nirmal', 'Nithish', 'Nithin', 'Padmanabhan',
  'Pavithran', 'Prabhu', 'Pradeep', 'Prakash', 'Pranav', 'Prasanna', 'Prasanth', 'Praveen', 'Premkumar', 'Raghav',
  'Raghavan', 'Rahul', 'Rajesh', 'Rakesh', 'Ramkumar', 'Ranjith', 'Ravi', 'Rithik', 'Rohit', 'Roshan',
  'Sabari', 'Sachin', 'Sai', 'Sakthi', 'Sanjay', 'Santhosh', 'Saravanan', 'Sasikumar', 'Sathish', 'Selvam',
  'Senthil', 'Shankar', 'Shiva', 'Siddharth', 'Siva', 'Snehan', 'Soorya', 'Sreekanth', 'Sridhar', 'Srikanth',
  'Srinath', 'Subash', 'Sudharshan', 'Sujith', 'Sundar', 'Surya', 'Tarun', 'Thangavel', 'Tharun', 'Udhaya',
  'Vasanth', 'Velu', 'Venkat', 'Venkatesh', 'Vignesh', 'Vijay', 'Vimal', 'Vinoth', 'Vishnu', 'Yogesh',
  'Aadhira', 'Abirami', 'Aishwarya', 'Akshaya', 'Amutha', 'Ananya', 'Anitha', 'Anu', 'Anupriya', 'Archana',
  'Arthi', 'Bavani', 'Bhavana', 'Brindha', 'Charulatha', 'Deepa', 'Deepika', 'Devi', 'Dhanyasree', 'Dharshini',
  'Divya', 'Gayathri', 'Geetha', 'Gomathi', 'Harini', 'Haripriya', 'Hemalatha', 'Indhu', 'Ishwarya', 'Janani',
  'Jeevitha', 'Kamali', 'Kanimozhi', 'Karthika', 'Kavitha', 'Keerthana', 'Kokila', 'Kowsalya', 'Lavanya', 'Madhumitha',
  'Malathi', 'Meena', 'Meenakshi', 'Monisha', 'Nandhini', 'Nithya', 'Pavithra', 'Pooja', 'Poornima', 'Praveena',
  'Priya', 'Priyadharshini', 'Radhika', 'Ramya', 'Revathi', 'Rithika', 'Roopa', 'Sandhya', 'Sangavi', 'Sangeetha',
  'Saranya', 'Sasi', 'Shalini', 'Sharmila', 'Sindhu', 'Sneha', 'Soundarya', 'Sowmya', 'Subhashini', 'Suganya',
  'Sumathi', 'Sunitha', 'Swathi', 'Swetha', 'Thangam', 'Uma', 'Vaishnavi', 'Varsha', 'Vasuki', 'Vidya', 'Vinitha'
]

const lastNames = [
  'Kumar', 'Rajan', 'Murugan', 'Selvam', 'Palanisamy', 'Sundaram', 'Nadarajan', 'Krishnan', 'Mani', 'Perumal',
  'Shanmugam', 'Subramanian', 'Natarajan', 'Balakrishnan', 'Ganesan', 'Kandasamy', 'Velusamy', 'Swaminathan',
  'Ramasamy', 'Sengottaiyan', 'Manoharan', 'Govindasamy', 'Arumugam', 'Ponnusamy', 'Dharmalingam', 'Chandran',
  'Venkatesh', 'Mohan', 'Suresh', 'Babu', 'Prasad', 'Reddy', 'Menon', 'Iyer', 'Pillai', 'Naidu', 'Chettiar'
]

const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
const residencyOptions = ['Day Scholar', 'Hostel', 'College Bus']

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seed1000Students() {
  console.log('🚀 Starting generation of 1,000 AI & DS Students...')

  const defaultPassword = 'Student@123'
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10)

  const yearConfigs = [
    { year: 1, sem: 2, batch: '2025-2029', prefix: '922525104', birthYear: 2007 },
    { year: 2, sem: 4, batch: '2024-2028', prefix: '922524104', birthYear: 2006 },
    { year: 3, sem: 6, batch: '2023-2027', prefix: '922523104', birthYear: 2005 },
    { year: 4, sem: 8, batch: '2022-2026', prefix: '922522104', birthYear: 2004 },
  ]

  const sections = ['A', 'B', 'C', 'D']
  let totalInserted = 0

  for (const config of yearConfigs) {
    console.log(`\n⏳ Generating 250 students for Year ${config.year} (${config.batch})...`)

    for (let i = 1; i <= 250; i++) {
      const regNum = `${config.prefix}${String(i).padStart(3, '0')}`
      const fName = getRandomItem(firstNames)
      const lName = getRandomItem(lastNames)
      const fullName = `${fName} ${lName}`
      const section = sections[Math.floor((i - 1) / 63) % sections.length]
      const email = `${regNum.toLowerCase()}@student.vsb.edu.in`
      const phone = `+91 9${getRandomInt(100000000, 999999999)}`
      const parentPhone = `+91 9${getRandomInt(100000000, 999999999)}`
      const dob = new Date(`${config.birthYear}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}`)
      const cgpa = Number((Math.random() * (9.8 - 6.5) + 6.5).toFixed(2))
      const attendance = `${getRandomInt(78, 98)}%`
      const bloodGroup = getRandomItem(bloodGroups)
      const residency = getRandomItem(residencyOptions)

      try {
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: fullName,
            phone,
            role: 'student',
            status: 'active',
            passwordHash: defaultPasswordHash,
          },
          create: {
            email,
            name: fullName,
            phone,
            role: 'student',
            status: 'active',
            passwordHash: defaultPasswordHash,
            mustChangePassword: true,
          },
        })

        await prisma.student.upsert({
          where: { registerNumber: regNum },
          update: {
            userId: user.id,
            department: 'Artificial Intelligence & Data Science',
            year: config.year,
            semester: config.sem,
            section,
            batch: config.batch,
            dateOfBirth: dob,
            parentPhone,
            bloodGroup,
            residencyStatus: residency,
            cgpa,
            attendance,
          },
          create: {
            userId: user.id,
            registerNumber: regNum,
            department: 'Artificial Intelligence & Data Science',
            year: config.year,
            semester: config.sem,
            section,
            batch: config.batch,
            dateOfBirth: dob,
            parentPhone,
            bloodGroup,
            residencyStatus: residency,
            cgpa,
            attendance,
          },
        })

        totalInserted++
        if (totalInserted % 100 === 0) {
          process.stdout.write(`✅ Processed ${totalInserted}/1000 students...\n`)
        }
      } catch (err) {
        console.error(`Error inserting student ${regNum}:`, err.message)
      }
    }
  }

  console.log(`\n🎉 Successfully completed! Total ${totalInserted} students are in the database.`)
  console.log('Default Student Login Password: Student@123')
}

seed1000Students()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal seed error:', e)
    process.exit(1)
  })
