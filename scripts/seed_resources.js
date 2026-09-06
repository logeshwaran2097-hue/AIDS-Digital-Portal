const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedResources() {
  console.log('Seeding Study Resources & E-Books...')

  // Find subjects
  const subjects = await prisma.subject.findMany()
  const subjectMap = {}
  subjects.forEach((s) => {
    subjectMap[s.code] = s.id
  })

  // Find Lonely Boy user
  const advisor = await prisma.user.findFirst({
    where: { role: 'faculty', name: { contains: 'Lonely' } },
  })
  const uploadedById = advisor ? advisor.id : 'cmtoi8cm50000wa54r7f9qg3g'
  const uploadedByName = 'Lonely Boy (Class Advisor)'

  const resourcesData = [
    {
      name: 'Data Structures & Algorithm Analysis in C++ (4th Ed) - Mark Allen Weiss',
      description: 'Standard prescribed Anna University textbook covering Stacks, Queues, Binary Trees, AVL Trees, Splay Trees, B-Trees, Priority Queues, Graph Algorithms, and Sorting Analysis.',
      fileName: 'AD2301_Weiss_Data_Structures_Analysis.pdf',
      fileType: 'application/pdf',
      fileSize: 14250000, // ~14.2 MB
      fileUrl: '/uploads/resources/AD2301_Weiss_Data_Structures_Analysis.pdf',
      subjectId: subjectMap['AD2301'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'textbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Database System Concepts (7th Ed) - Silberschatz, Korth & Sudarshan',
      description: 'Definitive reference for Relational Algebra, SQL Queries, Schema Normalization (1NF to BCNF), Transaction Processing, ACID properties, Concurrency Control, and Indexing.',
      fileName: 'AD2302_Korth_Database_System_Concepts.pdf',
      fileType: 'application/pdf',
      fileSize: 18400000, // ~18.4 MB
      fileUrl: '/uploads/resources/AD2302_Korth_Database_System_Concepts.pdf',
      subjectId: subjectMap['AD2302'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'textbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Artificial Intelligence: A Modern Approach (4th Ed) - Russell & Norvig',
      description: 'Core reference text for Intelligent Agents, Informed & Uninformed Search, A* Heuristic Search, Adversarial Games, Constraint Satisfaction Problems, and First-Order Logic.',
      fileName: 'AD2303_Russell_Norvig_AI_Modern_Approach.pdf',
      fileType: 'application/pdf',
      fileSize: 22100000, // ~22.1 MB
      fileUrl: '/uploads/resources/AD2303_Russell_Norvig_AI_Modern_Approach.pdf',
      subjectId: subjectMap['AD2303'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'textbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Discrete Mathematics & Its Applications (8th Ed) - Kenneth H. Rosen',
      description: 'Mathematical foundation covering Propositional Logic, Predicates & Quantifiers, Proof Methods, Recurrence Relations, Combinatorics, Graph Theory, and Trees for CS & AI.',
      fileName: 'MA2301_Rosen_Discrete_Mathematics.pdf',
      fileType: 'application/pdf',
      fileSize: 16800000, // ~16.8 MB
      fileUrl: '/uploads/resources/MA2301_Rosen_Discrete_Mathematics.pdf',
      subjectId: subjectMap['MA2301'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'textbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Operating System Concepts (10th Ed) - Silberschatz, Galvin & Gagne',
      description: 'Essential operating system principles covering Processes, Threads, CPU Scheduling, Deadlock Prevention, Memory Management, Virtual Memory, and Linux File Systems.',
      fileName: 'CS2304_Silberschatz_Operating_Systems.pdf',
      fileType: 'application/pdf',
      fileSize: 15300000, // ~15.3 MB
      fileUrl: '/uploads/resources/CS2304_Silberschatz_Operating_Systems.pdf',
      subjectId: subjectMap['CS2304'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'textbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Pattern Recognition and Machine Learning - Christopher M. Bishop',
      description: 'Advanced reference guide for Probability Distributions, Linear Models for Regression and Classification, Neural Networks, Kernel Methods, and Graphical Models.',
      fileName: 'AD2401_Bishop_Pattern_Recognition_ML.pdf',
      fileType: 'application/pdf',
      fileSize: 19800000, // ~19.8 MB
      fileUrl: '/uploads/resources/AD2401_Bishop_Pattern_Recognition_ML.pdf',
      subjectId: subjectMap['AD2401'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'textbook',
      semester: 4,
      academicYear: '2025-2026',
    },
    {
      name: 'Anna University R-2021 Sem-3 AI & DS Comprehensive Course Handbook',
      description: 'Department curated academic handbook containing syllabus unit breakdowns, lecture schedule notes, two-mark question banks with answers, and university question paper patterns.',
      fileName: 'AIDS_Sem3_Comprehensive_Handbook.pdf',
      fileType: 'application/pdf',
      fileSize: 8400000, // ~8.4 MB
      fileUrl: '/uploads/resources/AIDS_Sem3_Comprehensive_Handbook.pdf',
      subjectId: subjectMap['AD2301'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'handbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Data Structures & DBMS Laboratory Practical Manual (30 Experiments)',
      description: 'Complete step-by-step practical laboratory manual for Year II students covering C++ STL implementations, Tree traversals, Graph BFS/DFS, and MySQL Complex Nested Queries.',
      fileName: 'AIDS_Sem3_Laboratory_Manual.pdf',
      fileType: 'application/pdf',
      fileSize: 6200000, // ~6.2 MB
      fileUrl: '/uploads/resources/AIDS_Sem3_Laboratory_Manual.pdf',
      subjectId: subjectMap['AD2302'] || null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'handbook',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: '2026 AI & DS Tech Interview & Placement Prep Handbook (Tier-1 MNCs)',
      description: 'Curated competitive coding patterns, LeetCode top 150 problems categorized by data structures, System Design interview architecture, and SQL query optimization guide.',
      fileName: 'AIDS_2026_Tech_Placement_Kit.pdf',
      fileType: 'application/pdf',
      fileSize: 12500000, // ~12.5 MB
      fileUrl: '/uploads/resources/AIDS_2026_Tech_Placement_Kit.pdf',
      subjectId: null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'placement_guide',
      semester: 3,
      academicYear: '2025-2026',
    },
    {
      name: 'Machine Learning & GenAI Engineering Campus Placement Handbook',
      description: 'Comprehensive placement guidebook covering Python NumPy/Pandas cheat sheets, scikit-learn models, LLM fine-tuning concepts, Vector DBs, and portfolio project ideas.',
      fileName: 'AIDS_ML_GenAI_Placement_Guide.pdf',
      fileType: 'application/pdf',
      fileSize: 11200000, // ~11.2 MB
      fileUrl: '/uploads/resources/AIDS_ML_GenAI_Placement_Guide.pdf',
      subjectId: null,
      uploadedById,
      uploadedByName,
      status: 'published',
      resourceType: 'placement_guide',
      semester: 3,
      academicYear: '2025-2026',
    },
  ]

  for (const r of resourcesData) {
    await prisma.resource.create({
      data: r,
    })
    console.log(`Created resource: ${r.name}`)
  }

  console.log(`Seeded ${resourcesData.length} resources successfully!`)
  process.exit(0)
}

seedResources().catch((e) => {
  console.error(e)
  process.exit(1)
})
