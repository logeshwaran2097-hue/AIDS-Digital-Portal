const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedResources() {
  const subjects = await prisma.subject.findMany();
  const subMap = new Map(subjects.map(s => [s.code, s.id]));

  const resourceList = [
    {
      name: 'Data Structures & Algorithms in C++ (Mark Allen Weiss - 4th Edition)',
      description: 'Comprehensive standard reference textbook covering trees, graphs, hashing, and asymptotic analysis.',
      fileName: 'DSA_Mark_Allen_Weiss_4thEd.pdf',
      fileType: 'pdf',
      fileSize: 14800000,
      fileUrl: '/resources/DSA_Mark_Allen_Weiss.pdf',
      subjectId: subMap.get('AD2301') || null,
      uploadedById: 'AI001',
      uploadedByName: 'Prof. R. Meena',
      status: 'approved',
      resourceType: 'REFERENCE_BOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Database System Concepts (Silberschatz, Korth & Sudarshan - 7th Edition)',
      description: 'The golden standard textbook for relational database design, SQL querying, concurrency control & NoSQL architectures.',
      fileName: 'Database_System_Concepts_Korth.pdf',
      fileType: 'pdf',
      fileSize: 22400000,
      fileUrl: '/resources/Database_System_Concepts.pdf',
      subjectId: subMap.get('AD2302') || null,
      uploadedById: 'AI002',
      uploadedByName: 'Dr. K. Mohan',
      status: 'approved',
      resourceType: 'REFERENCE_BOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Discrete Mathematics and Its Applications (Kenneth H. Rosen - 8th Edition)',
      description: 'Standard textbook for propositional calculus, combinatorics, graph theory, algebraic groups, and Boolean lattices.',
      fileName: 'Discrete_Math_Rosen_8thEd.pdf',
      fileType: 'pdf',
      fileSize: 18900000,
      fileUrl: '/resources/Discrete_Math_Rosen.pdf',
      subjectId: subMap.get('AD2303') || null,
      uploadedById: 'AI003',
      uploadedByName: 'Prof. T. Lakshmi',
      status: 'approved',
      resourceType: 'REFERENCE_BOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Operating System Concepts (Silberschatz, Galvin & Gagne - 10th Dinosaur Edition)',
      description: 'Definitive guide to operating system structures, CPU scheduling, synchronization primitives, paging, and storage architectures.',
      fileName: 'OS_Concepts_10th_Silberschatz.pdf',
      fileType: 'pdf',
      fileSize: 26500000,
      fileUrl: '/resources/OS_Concepts_Dinosaur.pdf',
      subjectId: subMap.get('AD2304') || null,
      uploadedById: 'AI001',
      uploadedByName: 'Prof. R. Meena',
      status: 'approved',
      resourceType: 'REFERENCE_BOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Pattern Recognition and Machine Learning (Christopher M. Bishop)',
      description: 'Graduate level reference text for Bayesian models, SVM kernels, EM clustering, and deep neural backpropagation.',
      fileName: 'PRML_Christopher_Bishop.pdf',
      fileType: 'pdf',
      fileSize: 31200000,
      fileUrl: '/resources/Bishop_PRML.pdf',
      subjectId: subMap.get('AD2305') || null,
      uploadedById: 'AI004',
      uploadedByName: 'Dr. S. Karthik',
      status: 'approved',
      resourceType: 'REFERENCE_BOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Artificial Intelligence: A Modern Approach (Stuart Russell & Peter Norvig - 4th Ed)',
      description: 'Comprehensive reference text for intelligent agent design, A* search, game trees, and knowledge representation.',
      fileName: 'AIMA_Russell_Norvig_4thEd.pdf',
      fileType: 'pdf',
      fileSize: 28400000,
      fileUrl: '/resources/AIMA_Russell_Norvig.pdf',
      subjectId: subMap.get('AD2306') || null,
      uploadedById: 'AI003',
      uploadedByName: 'Prof. T. Lakshmi',
      status: 'approved',
      resourceType: 'REFERENCE_BOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Python for Data Analysis (Wes McKinney - Creator of Pandas)',
      description: 'Essential hands-on guide for data manipulation, NumPy arrays, Pandas DataFrames, and time series data modeling.',
      fileName: 'Python_For_Data_Analysis_Wes_McKinney.pdf',
      fileType: 'pdf',
      fileSize: 12500000,
      fileUrl: '/resources/Python_Data_Analysis_Wes.pdf',
      subjectId: subMap.get('AD2307') || null,
      uploadedById: 'AI004',
      uploadedByName: 'Dr. S. Karthik',
      status: 'approved',
      resourceType: 'HANDBOOK',
      semester: 3,
      academicYear: '2025-2026'
    },
    {
      name: 'Complete AI & DS Placement & Technical Interview Cheatsheet (2026)',
      description: 'Curated 150+ SQL queries, machine learning algorithms derivations, data structure coding patterns, and system design questions.',
      fileName: 'AI_DS_Interview_Prep_Handbook_2026.pdf',
      fileType: 'pdf',
      fileSize: 8400000,
      fileUrl: '/resources/Placement_Prep_AI_DS.pdf',
      subjectId: null,
      uploadedById: 'AI001',
      uploadedByName: 'Department Placement Cell',
      status: 'approved',
      resourceType: 'PLACEMENT_GUIDE',
      semester: 3,
      academicYear: '2025-2026'
    },
  ];

  await prisma.resource.deleteMany({});
  for (const r of resourceList) {
    await prisma.resource.create({ data: r });
  }

  console.log('Successfully seeded', resourceList.length, 'digital resources!');
}

seedResources().then(() => process.exit(0));
