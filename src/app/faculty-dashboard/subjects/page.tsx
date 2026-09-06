import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultySubjectsView } from './components/FacultySubjectsView'

export const dynamic = 'force-dynamic'

export default async function FacultySubjectsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.faculty.findUnique({ where: { facultyId: session.facultyId || '' } }).catch(() => null))

  let parsedSubjectCodes: string[] = []
  if (faculty?.subjects) {
    try {
      parsedSubjectCodes = JSON.parse(faculty.subjects)
    } catch {
      parsedSubjectCodes = []
    }
  }

  const dbSubjects = await prisma.subject.findMany({
    where: parsedSubjectCodes.length > 0 ? { code: { in: parsedSubjectCodes } } : undefined,
    orderBy: { code: 'asc' },
  }).catch(() => [])

  // Also query units, resources, and notes for these subjects
  const subjectIds = dbSubjects.map(s => s.id)
  const [dbUnits, dbNotes, dbResources, dbQuestions] = await Promise.all([
    prisma.unit.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { number: 'asc' } }).catch(() => []),
    prisma.note.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.resource.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.importantQuestion.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
  ])

  const DEFAULT_CURRICULUM_COURSES = [
    {
      code: 'AD3301',
      name: 'Design and Analysis of Algorithms',
      regulation: 'Regulation 2021 (Autonomous)',
      credits: 4,
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      section: faculty?.advisorSec || 'A',
      enrolledStudents: 68,
      hoursTaught: 36,
      attendanceRate: '96.5%',
      units: [
        {
          unit: 'Unit I',
          title: 'Algorithm Analysis & Divide-and-Conquer',
          hours: 9,
          topics: [
            'Asymptotic Notations (Big-O, Omega, Theta)',
            'Recurrence Relations & Master Theorem',
            'Binary Search & Merge Sort Analysis',
            'Quick Sort & Randomized Algorithms',
            'Strassen Matrix Multiplication',
          ],
          status: 'Completed' as const,
        },
        {
          unit: 'Unit II',
          title: 'Greedy Technique & Dynamic Programming',
          hours: 9,
          topics: [
            'Knapsack Problem & Greedy Heuristics',
            'Huffman Codes & Optimal Caching',
            '0/1 Knapsack & Dynamic Programming',
            'Matrix Chain Multiplication & Optimal BST',
            'All-Pairs Shortest Paths (Floyd-Warshall)',
          ],
          status: 'Completed' as const,
        },
        {
          unit: 'Unit III',
          title: 'State Space Trees & Backtracking',
          hours: 9,
          topics: [
            'N-Queens Problem & State Space Search',
            'Hamiltonian Circuits & Subset-Sum Problem',
            'Branch and Bound: Assignment Problem',
            'Traveling Salesperson Problem (TSP)',
            'Knapsack using Branch and Bound',
          ],
          status: 'In-Progress' as const,
        },
        {
          unit: 'Unit IV',
          title: 'Graph Algorithms & Flow Networks',
          hours: 9,
          topics: [
            'Depth-First Search (DFS) & Breadth-First Search (BFS)',
            'Topological Sorting & Strongly Connected Components',
            'Minimum Spanning Trees (Prim and Kruskal)',
            'Dijkstra Single Source Shortest Path',
            'Ford-Fulkerson Method for Maximum Flow',
          ],
          status: 'In-Progress' as const,
        },
        {
          unit: 'Unit V',
          title: 'NP-Completeness & Approximation Algorithms',
          hours: 9,
          topics: [
            'P, NP, NP-Complete, and NP-Hard Classes',
            'Circuit Satisfiability & Cook-Levin Theorem',
            'Vertex Cover & Set Cover Reductions',
            'Approximation Algorithms for TSP',
            'Randomized Algorithms & Las Vegas vs Monte Carlo',
          ],
          status: 'In-Progress' as const,
        },
      ],
      notes: [
        {
          unit: 'Unit I Notes',
          title: 'Divide-and-Conquer and Asymptotic Notations Handout',
          fileName: 'AD3301_Unit1_Lecture_Notes.pdf',
          fileSize: '3.4 MB',
          uploadedDate: 'Recently',
        },
        {
          unit: 'Unit II Notes',
          title: 'Greedy vs Dynamic Programming Comparative Analysis',
          fileName: 'AD3301_Unit2_DP_CheatSheet.pdf',
          fileSize: '2.8 MB',
          uploadedDate: 'Recently',
        },
        {
          unit: 'Unit III Notes',
          title: 'State Space Exploration & Branch-and-Bound Guide',
          fileName: 'AD3301_Unit3_Backtracking.pdf',
          fileSize: '4.1 MB',
          uploadedDate: 'Recently',
        },
      ],
      labs: [
        {
          expNo: 1,
          title: 'Implementation of Recursive and Iterative Binary Search with Complexity Analysis',
          tools: 'Python 3.12 / C++ GCC',
          guideFile: 'LabExp1_BinarySearch.pdf',
        },
        {
          expNo: 2,
          title: 'Divide-and-Conquer Merge Sort and Quick Sort Benchmark Comparison',
          tools: 'Python Matplotlib / C++',
          guideFile: 'LabExp2_Sorting_Benchmark.pdf',
        },
        {
          expNo: 3,
          title: 'Dynamic Programming 0/1 Knapsack vs Greedy Fractional Knapsack',
          tools: 'Python / Jupyter Notebook',
          guideFile: 'LabExp3_Knapsack_Optimization.pdf',
        },
        {
          expNo: 4,
          title: 'Dijkstra and Prim Minimum Spanning Tree Network Simulation',
          tools: 'NetworkX / Python',
          guideFile: 'LabExp4_Graph_MST.pdf',
        },
      ],
      questions: [
        {
          type: '2_mark' as const,
          q: 'Define asymptotic notation and distinguish between Big-O and Little-o notation.',
          bloom: 'K1 (Remember)',
        },
        {
          type: '2_mark' as const,
          q: 'State the Master Theorem conditions for solving divide-and-conquer recurrence relations.',
          bloom: 'K2 (Understand)',
        },
        {
          type: '16_mark' as const,
          q: 'Explain the 0/1 Knapsack problem using Dynamic Programming. Provide the recurrence relation, step-by-step table trace for weights {2, 3, 4, 5} and values {3, 4, 5, 6} with W = 8, and derive its time complexity.',
          bloom: 'K3 (Apply)',
        },
        {
          type: '16_mark' as const,
          q: 'Describe the Branch-and-Bound technique for the Traveling Salesperson Problem (TSP). Construct the state-space tree with bounding matrices and show the optimal route derivation.',
          bloom: 'K4 (Analyze)',
        },
      ],
    },
    {
      code: 'AD3391',
      name: 'Database Design and Management',
      regulation: 'Regulation 2021 (Autonomous)',
      credits: 3,
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      section: faculty?.advisorSec || 'A',
      enrolledStudents: 68,
      hoursTaught: 32,
      attendanceRate: '98.1%',
      units: [
        {
          unit: 'Unit I',
          title: 'Relational Model & Relational Algebra',
          hours: 9,
          topics: [
            'Database Architecture & Three-Tier Schema',
            'ER Modeling & Extended ER Features',
            'Relational Model Concepts & Integrity Constraints',
            'Relational Algebra Operations (Select, Project, Join)',
            'Tuple Relational Calculus & Domain Calculus',
          ],
          status: 'Completed' as const,
        },
        {
          unit: 'Unit II',
          title: 'SQL & Database Normalization',
          hours: 9,
          topics: [
            'Advanced SQL Queries, Subqueries & Aggregations',
            'Triggers, Stored Procedures & User Defined Functions',
            'Functional Dependencies & Axioms (Armstrong Axioms)',
            'Normal Forms (1NF, 2NF, 3NF, BCNF)',
            'Lossless Decomposition & Dependency Preservation',
          ],
          status: 'Completed' as const,
        },
        {
          unit: 'Unit III',
          title: 'Transaction Processing & Concurrency Control',
          hours: 9,
          topics: [
            'ACID Properties & Transaction States',
            'Serializability & Conflict Equivalence',
            'Lock-Based Protocols & Two-Phase Locking (2PL)',
            'Timestamp-Based & Optimistic Concurrency Control',
            'Deadlock Handling, Prevention & Recovery',
          ],
          status: 'In-Progress' as const,
        },
        {
          unit: 'Unit IV',
          title: 'Storage & Indexing Architectures',
          hours: 9,
          topics: [
            'RAID Storage Levels & Page Layouts',
            'B-Trees and B+ Trees Index Structures',
            'Static & Dynamic Hash Indexing',
            'Query Processing & Cost Estimation',
            'Relational Query Optimization Plans',
          ],
          status: 'In-Progress' as const,
        },
        {
          unit: 'Unit V',
          title: 'NoSQL Databases & Distributed Storage',
          hours: 9,
          topics: [
            'CAP Theorem & BASE Philosophy',
            'Document Databases (MongoDB Schema & CRUD)',
            'Columnar Storage (Cassandra Architecture)',
            'Key-Value Stores (Redis Caching Pipelines)',
            'Distributed Consensus & Replication Mechanisms',
          ],
          status: 'In-Progress' as const,
        },
      ],
      notes: [
        {
          unit: 'Unit I Notes',
          title: 'Relational Algebra & Schema Design Essentials',
          fileName: 'AD3391_Unit1_Relational_Model.pdf',
          fileSize: '3.1 MB',
          uploadedDate: 'Recently',
        },
        {
          unit: 'Unit II Notes',
          title: 'SQL Complex Queries & Normalization 1NF to BCNF',
          fileName: 'AD3391_Unit2_Normalization_Guide.pdf',
          fileSize: '4.5 MB',
          uploadedDate: 'Recently',
        },
      ],
      labs: [
        {
          expNo: 1,
          title: 'Database Schema Design using DDL and Integrity Constraints for University ERP',
          tools: 'PostgreSQL 16 / pgAdmin',
          guideFile: 'LabExp1_DDL_Constraints.pdf',
        },
        {
          expNo: 2,
          title: 'Complex Nested Queries, Window Functions and Views',
          tools: 'PostgreSQL',
          guideFile: 'LabExp2_Advanced_SQL.pdf',
        },
        {
          expNo: 3,
          title: 'Database Triggers for Audit Logging and Automated Roll Call Sync',
          tools: 'PL/pgSQL',
          guideFile: 'LabExp3_Triggers_Procedures.pdf',
        },
      ],
      questions: [
        {
          type: '2_mark' as const,
          q: 'Differentiate between 3NF and BCNF with a suitable example.',
          bloom: 'K2 (Understand)',
        },
        {
          type: '2_mark' as const,
          q: 'What is strict Two-Phase Locking (Strict 2PL) and how does it prevent cascading rollbacks?',
          bloom: 'K2 (Understand)',
        },
        {
          type: '16_mark' as const,
          q: 'Consider a relation R(A, B, C, D, E) with functional dependencies F = {A -> B, BC -> D, E -> C, D -> A}. Determine all candidate keys, find the highest normal form of R, and decompose into BCNF ensuring lossless join.',
          bloom: 'K4 (Analyze)',
        },
      ],
    },
    {
      code: 'CS3351',
      name: 'Digital Principles and Computer Organization',
      regulation: 'Regulation 2021 (Autonomous)',
      credits: 4,
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      section: faculty?.advisorSec || 'A',
      enrolledStudents: 68,
      hoursTaught: 30,
      attendanceRate: '95.8%',
      units: [
        {
          unit: 'Unit I',
          title: 'Combinational Circuit Design & Minimization',
          hours: 9,
          topics: [
            'Boolean Laws & Karnaugh Maps (4 & 5 Variables)',
            'Quine-McCluskey Minimization Method',
            'Full Adders, Ripple Carry Adders & CLA',
            'Decoders, Encoders & Priority Multiplexers',
            'Arithmetic Logic Unit (ALU) Slice Design',
          ],
          status: 'Completed' as const,
        },
        {
          unit: 'Unit II',
          title: 'Synchronous Sequential Logic',
          hours: 9,
          topics: [
            'Flip-Flops (SR, JK, D, T) & Master-Slave Flip-Flops',
            'State Machine Analysis (Mealy & Moore Models)',
            'State Reduction & State Assignment Algorithms',
            'Synchronous Up/Down Counters & Shift Registers',
            'Sequence Generators and Detectors',
          ],
          status: 'Completed' as const,
        },
        {
          unit: 'Unit III',
          title: 'Computer Architecture & Processor Datapath',
          hours: 9,
          topics: [
            'Von Neumann vs Harvard Architecture',
            'MIPS / RISC-V Instruction Set Architecture (ISA)',
            'Instruction Formats & Addressing Modes',
            'Single-Cycle Datapath & Control Unit Synthesis',
            'Multi-Cycle Implementation and Microprogramming',
          ],
          status: 'In-Progress' as const,
        },
        {
          unit: 'Unit IV',
          title: 'Pipelining & Instruction Level Parallelism',
          hours: 9,
          topics: [
            '5-Stage Pipelining (IF, ID, EX, MEM, WB)',
            'Structural, Data and Control Hazards',
            'Forwarding Units and Hazard Detection Unit',
            'Branch Prediction Strategies (1-bit & 2-bit Predictors)',
            'Superscalar Execution & Out-of-Order Processing',
          ],
          status: 'In-Progress' as const,
        },
        {
          unit: 'Unit V',
          title: 'Memory Hierarchy & I/O Organization',
          hours: 9,
          topics: [
            'Cache Memory Principles (Direct, Associative, Set-Associative)',
            'Cache Replacement Policies (LRU, FIFO, LFU)',
            'Virtual Memory, Paging & Translation Lookaside Buffer (TLB)',
            'Direct Memory Access (DMA) Controllers',
            'PCIe, USB, and Bus Arbitration Protocols',
          ],
          status: 'In-Progress' as const,
        },
      ],
      notes: [
        {
          unit: 'Unit I Notes',
          title: 'K-Map Minimization and ALU Combinational Circuit Design',
          fileName: 'CS3351_Unit1_Combinational.pdf',
          fileSize: '3.6 MB',
          uploadedDate: 'Recently',
        },
        {
          unit: 'Unit IV Notes',
          title: 'Pipelining Hazards, Forwarding and Branch Prediction',
          fileName: 'CS3351_Unit4_Pipelining.pdf',
          fileSize: '4.8 MB',
          uploadedDate: 'Recently',
        },
      ],
      labs: [
        {
          expNo: 1,
          title: 'Design and Simulation of 4-bit Arithmetic Logic Unit using Verilog HDL',
          tools: 'ModelSim / Vivado',
          guideFile: 'LabExp1_Verilog_ALU.pdf',
        },
        {
          expNo: 2,
          title: 'Simulation of Synchronous Decade Counter with 7-Segment Display',
          tools: 'Logisim / Verilog',
          guideFile: 'LabExp2_Counter_7Segment.pdf',
        },
      ],
      questions: [
        {
          type: '2_mark' as const,
          q: 'Explain data hazard in a pipelined processor and how operand forwarding mitigates it.',
          bloom: 'K2 (Understand)',
        },
        {
          type: '16_mark' as const,
          q: 'Explain the 5-stage RISC instruction execution pipeline in detail. Illustrate structural, data, and control hazards with timing diagrams and specify the architectural solutions.',
          bloom: 'K4 (Analyze)',
        },
      ],
    },
  ]

  const initialCourses = dbSubjects.length > 0 ? dbSubjects.map(sub => {
    const unitsForSub = dbUnits.filter(u => u.subjectId === sub.id)
    const notesForSub = dbNotes.filter(n => n.subjectId === sub.id)
    const questionsForSub = dbQuestions.filter(q => q.subjectId === sub.id)

    return {
      code: sub.code,
      name: sub.name,
      regulation: 'Regulation 2021 (Autonomous)',
      credits: sub.credits,
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      section: faculty?.advisorSec || 'A',
      enrolledStudents: 68,
      hoursTaught: 36,
      attendanceRate: '96.5%',
      units: unitsForSub.length > 0 ? unitsForSub.map(u => {
        let topicsArr: string[] = []
        try { topicsArr = JSON.parse(u.topics || '[]') } catch { topicsArr = [] }
        return {
          unit: `Unit ${u.number}`,
          title: u.title,
          hours: 9,
          topics: topicsArr,
          status: 'In-Progress' as const,
        }
      }) : DEFAULT_CURRICULUM_COURSES[0].units,
      notes: notesForSub.map(n => ({
        unit: 'Study Notes',
        title: n.title,
        fileName: `${sub.code}_Notes.pdf`,
        fileSize: '2.5 MB',
        uploadedDate: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'Recently',
      })),
      labs: [],
      questions: questionsForSub.map(q => ({
        type: (q.marks && q.marks > 5 ? '16_mark' : '2_mark') as '2_mark' | '16_mark',
        q: q.question,
        bloom: 'K2 (Understand)',
      })),
    }
  }) : DEFAULT_CURRICULUM_COURSES

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultySubjectsView initialCourses={initialCourses} />
      </div>
    </PortalLayout>
  )
}
