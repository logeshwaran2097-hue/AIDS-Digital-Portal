const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStudyMaterials() {
  const subjects = await prisma.subject.findMany();
  console.log('Found', subjects.length, 'subjects in DB.');

  const syllabusData = {
    AD2301: {
      syllabus: `UNIT I: LINEAR DATA STRUCTURES - LISTS
Abstract Data Types (ADTs) – List ADT – Array-based implementation – Linked list implementation – Singly linked lists – Circularly linked lists – Doubly linked lists – Applications of lists – Polynomial addition.

UNIT II: LINEAR DATA STRUCTURES - STACKS AND QUEUES
Stack ADT – Operations – Applications of Stacks – Evaluating arithmetic expressions – Conversion of Infix to postfix expression – Queue ADT – Operations – Circular Queue – Priority Queue – Dequeue – Applications of queues.

UNIT III: NON-LINEAR DATA STRUCTURES - TREES
Tree ADT – Tree Traversals – Binary Tree ADT – Expression trees – Binary Search Tree ADT – AVL Trees – Priority Queue (Heaps) – Binary Heap – Applications of trees.

UNIT IV: NON-LINEAR DATA STRUCTURES - GRAPHS
Definition – Representation of Graphs – Breadth-first traversal – Depth-first traversal – Topological Sort – Shortest path algorithms: Dijkstra's Algorithm – Minimum Spanning Tree: Prim's and Kruskal's algorithms – Applications of graphs.

UNIT V: SEARCHING, SORTING AND HASHING TECHNIQUES
Searching – Linear Search – Binary Search – Sorting – Bubble Sort – Selection Sort – Insertion Sort – Shell Sort – Radix Sort – Quick Sort – Merge Sort – Hashing – Hash Functions – Separate Chaining – Open Addressing – Rehashing – Extendible Hashing.`,
      units: [
        { number: 1, title: 'Linear Data Structures - Lists', topics: JSON.stringify(['List ADT', 'Singly Linked List', 'Doubly Linked List', 'Circular Linked List', 'Polynomial Addition']) },
        { number: 2, title: 'Linear Data Structures - Stacks and Queues', topics: JSON.stringify(['Stack ADT', 'Infix to Postfix', 'Expression Evaluation', 'Queue ADT', 'Circular Queue', 'Priority Queue']) },
        { number: 3, title: 'Non-Linear Data Structures - Trees', topics: JSON.stringify(['Binary Tree ADT', 'Tree Traversals (Inorder, Preorder, Postorder)', 'Binary Search Tree (BST)', 'AVL Trees', 'Binary Heap']) },
        { number: 4, title: 'Non-Linear Data Structures - Graphs', topics: JSON.stringify(['Graph Representations', 'BFS and DFS Traversals', 'Topological Sort', 'Dijkstra Algorithm', 'Prim & Kruskal MST']) },
        { number: 5, title: 'Searching, Sorting and Hashing', topics: JSON.stringify(['Binary Search', 'Quick Sort', 'Merge Sort', 'Hash Functions', 'Collision Resolution (Chaining & Open Addressing)']) },
      ],
      notes: [
        { title: 'Unit 1: Linked Lists Complete Lecture Notes & Code Snippets', fileUrl: '/notes/AD2301_Unit1_Notes.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 2: Stack & Queue Applications & Expression Parsers', fileUrl: '/notes/AD2301_Unit2_Notes.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 3: AVL Tree Rotations & Heap Operations Guide', fileUrl: '/notes/AD2301_Unit3_Notes.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 4: Graph Algorithms, Shortest Paths & MST Walkthrough', fileUrl: '/notes/AD2301_Unit4_Notes.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 5: Sorting & Hashing Techniques Quick Revision Notes', fileUrl: '/notes/AD2301_Unit5_Notes.pdf', uploaderName: 'Prof. R. Meena' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'Array Implementation of Stack and Queue ADTs', title: 'Experiment 1: Stacks & Queues', fileUrl: '/labs/AD2301_Lab_Exp1.pdf', description: 'Implement push, pop, enqueue, dequeue with overflow/underflow checks.' },
        { experimentNumber: 2, experimentName: 'Singly and Doubly Linked List Operations', title: 'Experiment 2: Linked Lists', fileUrl: '/labs/AD2301_Lab_Exp2.pdf', description: 'Creation, insertion at head/tail/pos, deletion, and traversal.' },
        { experimentNumber: 3, experimentName: 'Infix to Postfix Conversion & Evaluation', title: 'Experiment 3: Expression Evaluator', fileUrl: '/labs/AD2301_Lab_Exp3.pdf', description: 'Stack based operator precedence parser and postfix evaluator.' },
        { experimentNumber: 4, experimentName: 'Binary Search Tree (BST) Insertion and Traversals', title: 'Experiment 4: BST Operations', fileUrl: '/labs/AD2301_Lab_Exp4.pdf', description: 'Recursive and iterative tree traversal algorithms in C++.' },
        { experimentNumber: 5, experimentName: 'Dijkstras Shortest Path Algorithm on Weighted Graphs', title: 'Experiment 5: Graph Shortest Path', fileUrl: '/labs/AD2301_Lab_Exp5.pdf', description: 'Finding minimum cost path between source and all destination nodes.' },
      ],
      iq: [
        { question: 'Differentiate between Array-based List and Linked List with time complexities.', marks: 2 },
        { question: 'What is an Abstract Data Type (ADT)? Give examples of Linear ADTs.', marks: 2 },
        { question: 'Explain AVL Tree single (LL, RR) and double (LR, RL) rotations with neat diagrams.', marks: 16 },
        { question: 'Write an algorithm to convert an Infix expression into Postfix notation using a Stack.', marks: 16 },
        { question: 'Explain Dijkstras algorithm with an example graph and trace the distance table.', marks: 16 },
        { question: 'Explain Quick Sort algorithm and analyze its best, average, and worst case time complexity.', marks: 16 },
      ]
    },
    AD2302: {
      syllabus: `UNIT I: RELATIONAL DATABASES
Purpose of Database System – Views of data – Data Models – Database System Architecture – Introduction to relational databases – Relational Model – Keys – Relational Algebra – SQL fundamentals – Advanced SQL queries – Embedded SQL – Dynamic SQL.

UNIT II: DATABASE DESIGN
Entity-Relationship model – E-R Diagrams – Enhanced-ER Model – ER-to-Relational Mapping – Functional Dependencies – Non-loss Decomposition – First, Second, Third Normal Forms, Dependency Preservation – Boyce/Codd Normal Form – Multi-valued Dependencies and Fourth Normal Form – Join Dependencies and Fifth Normal Form.

UNIT III: TRANSACTIONS
Transaction Concepts – ACID Properties – Schedules – Serializability – Concurrency Control – Need for Concurrency – Locking Protocols – Two Phase Locking – Deadlock – Transaction Recovery – Save Points – Isolation Levels – SQL Facilities for Concurrency and Recovery.

UNIT IV: IMPLEMENTATION TECHNIQUES
RAID – File Organization – Organization of Records in Files – Indexing and Hashing – Ordered Indices – B+ tree Index Files – B tree Index Files – Static Hashing – Dynamic Hashing – Query Processing Overview – Algorithms for SELECT and JOIN operations – Query optimization.

UNIT V: ADVANCED TOPICS
Distributed Databases: Architecture, Data Storage, Transaction Processing – Object and Object-Relational Databases – XML Databases: XML Schema – Tree Model – XQuery – Storage of XML Data – More Recent Applications: Mobile Databases, Multimedia Databases, NoSQL Databases (MongoDB, Cassandra).`,
      units: [
        { number: 1, title: 'Relational Database Architecture & SQL', topics: JSON.stringify(['Relational Model', 'Relational Algebra', 'DDL, DML, DCL Statements', 'Joins and Subqueries', 'Views and Triggers']) },
        { number: 2, title: 'Database Design & Normalization', topics: JSON.stringify(['ER Modeling', 'EER Diagrams', '1NF, 2NF, 3NF', 'BCNF Decomposition', 'Lossless Join & Dependency Preservation']) },
        { number: 3, title: 'Transactions & Concurrency Control', topics: JSON.stringify(['ACID Properties', 'Conflict & View Serializability', 'Two-Phase Locking (2PL)', 'Deadlock Handling', 'WAL & Recovery']) },
        { number: 4, title: 'Storage, Indexing & Query Processing', topics: JSON.stringify(['RAID Levels', 'B+ Tree Indexing', 'Static & Dynamic Hashing', 'Cost-based Query Optimization', 'Join Algorithms']) },
        { number: 5, title: 'NoSQL & Distributed Databases', topics: JSON.stringify(['Distributed Architectures', 'CAP Theorem', 'MongoDB Document Store', 'Cassandra Column Store', 'JSON/BSON Data Stores']) },
      ],
      notes: [
        { title: 'Unit 1: SQL Commands & Relational Algebra Comprehensive Handbook', fileUrl: '/notes/AD2302_Unit1_Notes.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 2: Normalization (1NF to BCNF) Step-by-Step Solved Examples', fileUrl: '/notes/AD2302_Unit2_Notes.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 3: Transaction Schedules & Concurrency Control Protocols', fileUrl: '/notes/AD2302_Unit3_Notes.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 4: B+ Tree Insertion & Deletion Illustrated Notes', fileUrl: '/notes/AD2302_Unit4_Notes.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 5: NoSQL Databases (MongoDB & Cassandra) Architecture Guide', fileUrl: '/notes/AD2302_Unit5_Notes.pdf', uploaderName: 'Dr. K. Mohan' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'DDL, DML, DCL Commands and Integrity Constraints', title: 'Experiment 1: SQL Basics', fileUrl: '/labs/AD2302_Lab_Exp1.pdf', description: 'Create tables with primary, foreign keys, check constraints and insert data.' },
        { experimentNumber: 2, experimentName: 'Complex SQL Queries with Nested Subqueries & Aggregate Functions', title: 'Experiment 2: Nested Queries', fileUrl: '/labs/AD2302_Lab_Exp2.pdf', description: 'Group By, Having, Inner/Outer Joins, Exists, and Correlated subqueries.' },
        { experimentNumber: 3, experimentName: 'Creation of Views, Triggers, and Stored Procedures in PL/SQL', title: 'Experiment 3: PL/SQL Programming', fileUrl: '/labs/AD2302_Lab_Exp3.pdf', description: 'Business logic validation using row-level and statement-level triggers.' },
        { experimentNumber: 4, experimentName: 'Database Design & Normalization for University Management System', title: 'Experiment 4: ER to Schema', fileUrl: '/labs/AD2302_Lab_Exp4.pdf', description: 'Design 3NF relational schemas from ER diagrams.' },
        { experimentNumber: 5, experimentName: 'CRUD Operations and Aggregation Pipelines in MongoDB', title: 'Experiment 5: NoSQL MongoDB', fileUrl: '/labs/AD2302_Lab_Exp5.pdf', description: 'Document creation, indexing, and map-reduce aggregation in MongoDB.' },
      ],
      iq: [
        { question: 'Define ACID properties of a transaction with examples.', marks: 2 },
        { question: 'State the difference between 3NF and BCNF.', marks: 2 },
        { question: 'Construct an ER diagram for a Hospital Management System and map it to 3NF relational tables.', marks: 16 },
        { question: 'Explain Two-Phase Locking (2PL) protocol and discuss how it prevents concurrency anomalies.', marks: 16 },
        { question: 'Construct a B+ Tree of order 4 for the given set of keys and trace deletion operations.', marks: 16 },
      ]
    },
    DEFAULT: {
      syllabus: `UNIT I: FOUNDATIONS & PRINCIPLES
Core terminology, historical perspective, fundamental models, mathematical formulation and architectural principles.

UNIT II: CORE ALGORITHMS & MECHANISMS
Algorithmic paradigms, optimization strategies, state-space representations, and computational efficiency analysis.

UNIT III: ADVANCED SYSTEM DESIGN
Component interactions, modular structures, concurrency models, synchronization primitives, and design patterns.

UNIT IV: PERFORMANCE & INTEGRATION
Benchmarking, profiling, latency tuning, hardware acceleration, distributed topologies, and scalability.

UNIT V: REAL-WORLD APPLICATIONS & CASE STUDIES
Enterprise deployments, security considerations, ethical implications, industry standards, and future research directions.`,
      units: [
        { number: 1, title: 'Foundations & Architectural Principles', topics: JSON.stringify(['Core Terminology', 'System Architecture', 'Mathematical Formalism', 'Design Paradigms']) },
        { number: 2, title: 'Core Algorithms & Model Execution', topics: JSON.stringify(['Algorithmic Models', 'Optimization Methods', 'Performance Metrics', 'Computational Complexity']) },
        { number: 3, title: 'Advanced System Concepts & Protocols', topics: JSON.stringify(['Modular Design', 'Concurrency & Threads', 'State Management', 'Fault Tolerance']) },
        { number: 4, title: 'Performance Optimization & Scaling', topics: JSON.stringify(['Hardware Acceleration', 'Benchmarking', 'Caching Strategies', 'Distributed Pipelines']) },
        { number: 5, title: 'Industry Applications & Emerging Trends', topics: JSON.stringify(['Case Studies', 'Deployment Frameworks', 'Security Policies', 'Future Innovations']) },
      ],
      notes: [
        { title: 'Unit 1 & 2 Complete Lecture Notes & Handouts', fileUrl: '/notes/Lecture_Notes_Part1.pdf', uploaderName: 'Department Faculty' },
        { title: 'Unit 3 & 4 Advanced Concepts & Architecture Guide', fileUrl: '/notes/Lecture_Notes_Part2.pdf', uploaderName: 'Department Faculty' },
        { title: 'Unit 5 Case Studies & Quick Revision Sheet', fileUrl: '/notes/Lecture_Notes_Part3.pdf', uploaderName: 'Department Faculty' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'Environment Setup and Fundamental Tooling', title: 'Experiment 1: Setup & Tools', fileUrl: '/labs/Exp1.pdf', description: 'Installing dependencies, setting up CLI tools and environment variables.' },
        { experimentNumber: 2, experimentName: 'Core Algorithm Implementation & Verification', title: 'Experiment 2: Core Algorithms', fileUrl: '/labs/Exp2.pdf', description: 'Writing baseline algorithmic scripts and testing with sample datasets.' },
        { experimentNumber: 3, experimentName: 'Pipeline Integration & Performance Benchmarking', title: 'Experiment 3: Pipeline Integration', fileUrl: '/labs/Exp3.pdf', description: 'Building full end-to-end pipelines and profiling memory and execution latency.' },
      ],
      iq: [
        { question: 'Define the primary objectives and architecture of this course domain.', marks: 2 },
        { question: 'Differentiate between the key algorithms discussed in Unit II.', marks: 2 },
        { question: 'Explain the foundational architecture in detail with a block diagram.', marks: 16 },
        { question: 'Discuss the optimization strategies and performance considerations with a case study.', marks: 16 },
      ]
    }
  };

  for (const s of subjects) {
    const data = syllabusData[s.code] || syllabusData.DEFAULT;

    // 1. Syllabus
    await prisma.syllabus.upsert({
      where: { subjectId: s.id },
      update: { content: data.syllabus, status: 'published' },
      create: { subjectId: s.id, content: data.syllabus, status: 'published', version: 1 }
    });

    // 2. Units
    for (const u of data.units) {
      await prisma.unit.upsert({
        where: { subjectId_number: { subjectId: s.id, number: u.number } },
        update: { title: u.title, topics: u.topics },
        create: { subjectId: s.id, number: u.number, title: u.title, topics: u.topics, order: u.number }
      });
    }

    // 3. Notes
    for (const n of data.notes) {
      await prisma.note.create({
        data: {
          title: n.title,
          subjectId: s.id,
          fileUrl: n.fileUrl,
          uploaderName: n.uploaderName,
          status: 'published'
        }
      });
    }

    // 4. Lab Manuals
    for (const l of data.labs) {
      await prisma.labManual.create({
        data: {
          subjectId: s.id,
          title: l.title,
          experimentNumber: l.experimentNumber,
          experimentName: l.experimentName,
          fileUrl: l.fileUrl,
          description: l.description,
          status: 'published'
        }
      });
    }

    // 5. Important Questions
    for (const q of data.iq) {
      await prisma.importantQuestion.create({
        data: {
          subjectId: s.id,
          question: q.question,
          marks: q.marks,
          status: 'published'
        }
      });
    }
  }

  console.log('Successfully seeded all study materials for all subjects!');
}

seedStudyMaterials().then(() => process.exit(0));
