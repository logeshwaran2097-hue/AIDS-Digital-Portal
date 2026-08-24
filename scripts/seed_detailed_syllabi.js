const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDetailedSyllabi() {
  const subjects = await prisma.subject.findMany();

  const fullData = {
    AD2301: {
      name: 'Data Structures & Algorithms',
      credits: 4,
      faculty: 'Prof. R. Meena (Assoc. Professor)',
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
        { number: 1, title: 'Linear Data Structures - Lists', hours: '9 Hours', topics: JSON.stringify(['List ADT & Dynamic Arrays', 'Singly Linked Lists Operations', 'Doubly & Circular Linked Lists', 'Polynomial Representation & Addition', 'Memory Allocation Strategies']) },
        { number: 2, title: 'Linear Data Structures - Stacks and Queues', hours: '9 Hours', topics: JSON.stringify(['Stack ADT & Array/Linked Implementation', 'Infix to Postfix Conversion', 'Arithmetic Expression Evaluation', 'Circular & Double-Ended Queues (Deque)', 'Priority Queues & Task Scheduling']) },
        { number: 3, title: 'Non-Linear Data Structures - Trees', hours: '10 Hours', topics: JSON.stringify(['Binary Trees & Expression Trees', 'Tree Traversals (Inorder, Preorder, Postorder)', 'Binary Search Tree (BST) Operations', 'AVL Self-Balancing Trees & Rotations', 'Binary Min/Max Heaps']) },
        { number: 4, title: 'Non-Linear Data Structures - Graphs', hours: '10 Hours', topics: JSON.stringify(['Graph Representations (Adjacency Matrix/List)', 'Breadth First Search (BFS) & DFS', 'Topological Sorting for DAGs', 'Dijkstra Single-Source Shortest Path', 'Prim & Kruskal Minimum Spanning Trees']) },
        { number: 5, title: 'Searching, Sorting and Hashing', hours: '8 Hours', topics: JSON.stringify(['Linear & Binary Search Algorithms', 'Divide & Conquer: Quick & Merge Sort', 'Hash Tables & Hash Functions', 'Collision Resolution (Chaining vs Open Addressing)', 'Extendible & Dynamic Hashing']) },
      ],
      notes: [
        { title: 'Unit 1: Linked Lists & Memory Models Handbook', fileUrl: '/notes/AD2301_Unit1.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 2: Stack & Queue Applications with Code Implementation', fileUrl: '/notes/AD2301_Unit2.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 3: AVL Tree Rotations & Balanced Trees Illustrated', fileUrl: '/notes/AD2301_Unit3.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 4: Graph Traversals & Shortest Path Trace Manual', fileUrl: '/notes/AD2301_Unit4.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 5: Sorting Complexities & Hash Tables Cheatsheet', fileUrl: '/notes/AD2301_Unit5.pdf', uploaderName: 'Prof. R. Meena' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'Array Implementation of Stack and Queue ADTs', title: 'Experiment 1: Stacks & Queues', fileUrl: '/labs/AD2301_Exp1.pdf', description: 'Implement stack and queue operations with boundary condition handling.' },
        { experimentNumber: 2, experimentName: 'Singly and Doubly Linked List Operations', title: 'Experiment 2: Linked Lists', fileUrl: '/labs/AD2301_Exp2.pdf', description: 'Node insertion, deletion at arbitrary positions, and list reversal.' },
        { experimentNumber: 3, experimentName: 'Infix to Postfix Expression Converter', title: 'Experiment 3: Infix/Postfix', fileUrl: '/labs/AD2301_Exp3.pdf', description: 'Operator precedence stack parsing and evaluation of postfix expressions.' },
        { experimentNumber: 4, experimentName: 'Binary Search Tree (BST) Creation and Traversals', title: 'Experiment 4: BST Operations', fileUrl: '/labs/AD2301_Exp4.pdf', description: 'Recursive insertion, search, and depth-first traversals in C++.' },
        { experimentNumber: 5, experimentName: 'Dijkstras Shortest Path on Weighted Graphs', title: 'Experiment 5: Shortest Path', fileUrl: '/labs/AD2301_Exp5.pdf', description: 'Shortest path computation on road network adjacency matrices.' },
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
      name: 'Database Management Systems',
      credits: 4,
      faculty: 'Dr. K. Mohan (Asst. Professor)',
      syllabus: `UNIT I: RELATIONAL DATABASES & SQL
Purpose of Database System – Views of data – Data Models – Database System Architecture – Introduction to relational databases – Relational Model – Keys – Relational Algebra – SQL fundamentals – Advanced SQL queries – Embedded SQL – Dynamic SQL.

UNIT II: DATABASE DESIGN & NORMALIZATION
Entity-Relationship model – E-R Diagrams – Enhanced-ER Model – ER-to-Relational Mapping – Functional Dependencies – Non-loss Decomposition – First, Second, Third Normal Forms, Dependency Preservation – Boyce/Codd Normal Form – Multi-valued Dependencies and 4NF – Join Dependencies and 5NF.

UNIT III: TRANSACTIONS & CONCURRENCY
Transaction Concepts – ACID Properties – Schedules – Serializability – Concurrency Control – Need for Concurrency – Locking Protocols – Two Phase Locking (2PL) – Deadlock – Transaction Recovery – Save Points – Isolation Levels – SQL Facilities for Concurrency.

UNIT IV: IMPLEMENTATION & INDEXING
RAID – File Organization – Organization of Records in Files – Indexing and Hashing – Ordered Indices – B+ tree Index Files – B tree Index Files – Static Hashing – Dynamic Hashing – Query Processing Overview – Algorithms for SELECT and JOIN – Query optimization.

UNIT V: ADVANCED & NOSQL DATABASES
Distributed Databases: Architecture, Data Storage, Transaction Processing – Object and Object-Relational Databases – XML Databases – NoSQL Databases: Key-Value, Document (MongoDB), Column-family (Cassandra), Graph (Neo4j).`,
      units: [
        { number: 1, title: 'Relational Database Architecture & SQL', hours: '9 Hours', topics: JSON.stringify(['Relational Model & Codd Rules', 'Relational Algebra Operations', 'Complex SQL: Subqueries & Joins', 'Views, Triggers & Stored Procedures', 'Dynamic & Embedded SQL']) },
        { number: 2, title: 'Database Design & Normalization', hours: '10 Hours', topics: JSON.stringify(['ER & EER Diagram Modeling', 'Functional Dependencies & Closure', '1NF, 2NF, 3NF Normalization', 'Boyce-Codd Normal Form (BCNF)', 'Lossless Decomposition & Dependency Preservation']) },
        { number: 3, title: 'Transactions & Concurrency Control', hours: '9 Hours', topics: JSON.stringify(['ACID Properties & Transaction States', 'Conflict & View Serializability', 'Two-Phase Locking (2PL) Protocol', 'Deadlock Detection & Prevention', 'Write-Ahead Logging (WAL) & Recovery']) },
        { number: 4, title: 'Storage, Indexing & Query Processing', hours: '9 Hours', topics: JSON.stringify(['RAID Storage Architectures', 'B-Tree & B+ Tree Index Files', 'Dynamic & Extendible Hashing', 'Query Evaluation Engine & Cost Estimation', 'Nested Loop & Hash Join Algorithms']) },
        { number: 5, title: 'NoSQL & Distributed Data Stores', hours: '8 Hours', topics: JSON.stringify(['CAP Theorem & BASE Properties', 'MongoDB Document Store & Aggregation', 'Cassandra Wide-Column Architecture', 'Graph Databases with Neo4j', 'Distributed Concurrency Processing']) },
      ],
      notes: [
        { title: 'Unit 1: SQL Masterclass & Relational Algebra Handbook', fileUrl: '/notes/AD2302_Unit1.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 2: Normalization (1NF to BCNF) Step-by-Step Solved Problems', fileUrl: '/notes/AD2302_Unit2.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 3: Concurrency Control Protocols & ACID Guide', fileUrl: '/notes/AD2302_Unit3.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 4: B+ Tree Indexing & Query Optimization Handbook', fileUrl: '/notes/AD2302_Unit4.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 5: NoSQL & Big Data Architecture Guide', fileUrl: '/notes/AD2302_Unit5.pdf', uploaderName: 'Dr. K. Mohan' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'DDL, DML Commands and Table Constraints', title: 'Experiment 1: SQL DDL/DML', fileUrl: '/labs/AD2302_Exp1.pdf', description: 'Table schema creation with primary/foreign keys and domain constraints.' },
        { experimentNumber: 2, experimentName: 'Advanced Nested Subqueries and Multi-Table Joins', title: 'Experiment 2: Advanced SQL', fileUrl: '/labs/AD2302_Exp2.pdf', description: 'Writing aggregate queries with GROUP BY, HAVING, and correlated subqueries.' },
        { experimentNumber: 3, experimentName: 'PL/SQL Stored Procedures, Functions, and Row Triggers', title: 'Experiment 3: PL/SQL Modules', fileUrl: '/labs/AD2302_Exp3.pdf', description: 'Encapsulating transactional logic and audit logs in PL/SQL.' },
        { experimentNumber: 4, experimentName: 'Database Design and 3NF Normalization for Banking System', title: 'Experiment 4: Schema Normalization', fileUrl: '/labs/AD2302_Exp4.pdf', description: 'Mapping real-world ER diagrams to normalized SQL tables.' },
        { experimentNumber: 5, experimentName: 'Document Storage and Aggregation Pipelines in MongoDB', title: 'Experiment 5: MongoDB NoSQL', fileUrl: '/labs/AD2302_Exp5.pdf', description: 'CRUD operations and complex aggregation stages in MongoDB Compass.' },
      ],
      iq: [
        { question: 'State the ACID properties of a database transaction with examples.', marks: 2 },
        { question: 'Differentiate between 3NF and BCNF with a decomposition example.', marks: 2 },
        { question: 'Construct an ER diagram for a Hospital Information System and convert it into 3NF relational schemas.', marks: 16 },
        { question: 'Explain Two-Phase Locking (2PL) and Strict 2PL protocols in concurrency management.', marks: 16 },
        { question: 'Construct a B+ Tree of order 3 for key insertion and explain its search efficiency.', marks: 16 },
      ]
    },
    AD2303: {
      name: 'Discrete Mathematics',
      credits: 4,
      faculty: 'Prof. T. Lakshmi (Asst. Professor)',
      syllabus: `UNIT I: PROPOSITIONAL AND PREDICATE CALCULUS
Propositions – Logical connectives – Compound propositions – Conditional and biconditional propositions – Truth tables – Tautology – Contradiction – Logical equivalence – De Morgan’s laws – Predicates and quantifiers – Rules of inference.

UNIT II: COMBINATORICS AND RECURRENCE RELATIONS
Mathematical induction – Strong induction and well ordering – The basics of counting – The pigeonhole principle – Permutations and combinations – Recurrence relations – Solving linear recurrence relations – Generating functions – Inclusion and exclusion principle.

UNIT III: GRAPHS AND GRAPH MODELS
Graphs and graph models – Graph terminology and special types of graphs – Matrix representation of graphs – Graph isomorphism – Connectivity – Euler and Hamilton paths – Shortest-path problems – Planar graphs – Graph coloring.

UNIT IV: ALGEBRAIC STRUCTURES
Algebraic systems – Semi groups and monoids – Groups – Subgroups – Homomorphism’s – Normal subgroup and cosets – Lagrange’s theorem – Rings and Fields.

UNIT V: LATTICES AND BOOLEAN ALGEBRA
Partial ordering – Posets – Lattices as posets – Properties of lattices – Lattices as algebraic systems – Sub lattices – Direct product and homomorphism – Some special lattices – Boolean algebra.`,
      units: [
        { number: 1, title: 'Propositional & Predicate Calculus', hours: '9 Hours', topics: JSON.stringify(['Truth Tables & Tautologies', 'Logical Equivalences & De Morgans Laws', 'Predicates & Universal/Existential Quantifiers', 'Rules of Inference & Proof Methods', 'Normal Forms (CNF & DNF)']) },
        { number: 2, title: 'Combinatorics & Recurrence Relations', hours: '10 Hours', topics: JSON.stringify(['Mathematical Induction Techniques', 'Pigeonhole Principle Applications', 'Permutations & Combinations with Repetition', 'Solving Homogeneous Recurrence Relations', 'Generating Functions & Inclusion-Exclusion']) },
        { number: 3, title: 'Graph Theory & Network Models', hours: '10 Hours', topics: JSON.stringify(['Graph Terminology & Isomorphism', 'Euler & Hamiltonian Circuits', 'Planar Graphs & Eulers Formula', 'Graph Coloring & Four Color Theorem', 'Trees & Spanning Tree Properties']) },
        { number: 4, title: 'Algebraic Structures & Group Theory', hours: '9 Hours', topics: JSON.stringify(['Semigroups, Monoids & Groups', 'Subgroups & Cyclic Groups', 'Cosets & Lagranges Theorem', 'Group Homomorphism & Isomorphism', 'Introduction to Rings & Fields']) },
        { number: 5, title: 'Posets, Lattices & Boolean Algebra', hours: '8 Hours', topics: JSON.stringify(['Partial Order Relations & Hasse Diagrams', 'Lattices as Posets & Properties', 'Distributive & Complemented Lattices', 'Boolean Algebra & Boolean Functions', 'Karnaugh Map Minimization Logic']) },
      ],
      notes: [
        { title: 'Unit 1: Propositional Logic & Inference Rules Solved Guide', fileUrl: '/notes/AD2303_Unit1.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 2: Generating Functions & Recurrence Relations Handbook', fileUrl: '/notes/AD2303_Unit2.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 3: Graph Theory Theorems & Isomorphism Notes', fileUrl: '/notes/AD2303_Unit3.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 4: Group Theory & Lagranges Theorem Proof Notes', fileUrl: '/notes/AD2303_Unit4.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 5: Hasse Diagrams & Lattices Illustrated Handbook', fileUrl: '/notes/AD2303_Unit5.pdf', uploaderName: 'Prof. T. Lakshmi' },
      ],
      labs: [],
      iq: [
        { question: 'State Pigeonhole Principle with a practical application example.', marks: 2 },
        { question: 'Define a Poset and give an example of a Hasse diagram.', marks: 2 },
        { question: 'Solve the recurrence relation a_n = 5a_{n-1} - 6a_{n-2} with initial conditions a_0 = 1, a_1 = 4.', marks: 16 },
        { question: 'State and prove Lagranges Theorem for finite groups.', marks: 16 },
        { question: 'Check whether the given pair of graphs are isomorphic and justify with adjacency matrices.', marks: 16 },
      ]
    },
    AD2304: {
      name: 'Operating Systems',
      credits: 3,
      faculty: 'Prof. R. Meena (Assoc. Professor)',
      syllabus: `UNIT I: OPERATING SYSTEM OVERVIEW & PROCESSES
Operating system overview – Structures – System Calls – OS Services – System Programs – Process Concept – Process Scheduling – Operations on Processes – Inter-process Communication – CPU Scheduling – Scheduling criteria – Scheduling algorithms – Threads overview – Multithreading models.

UNIT II: PROCESS SYNCHRONIZATION & DEADLOCKS
Process Synchronization – The critical-section problem – Peterson’s Solution – Synchronization Hardware – Mutex Locks – Semaphores – Classic problems of synchronization – Monitors – Deadlocks – System Model – Deadlock Characterization – Methods for handling deadlocks – Deadlock Prevention – Deadlock Avoidance – Bankers algorithm – Deadlock Detection – Recovery.

UNIT III: MEMORY MANAGEMENT
Main Memory – Contiguous Memory Allocation – Paging – Structure of the Page Table – Segmentation – Virtual Memory – Demand Paging – Page Replacement – Page Replacement Algorithms (FIFO, LRU, Optimal) – Allocation of Frames – Thrashing.

UNIT IV: STORAGE MANAGEMENT & FILE SYSTEMS
Mass Storage Structure – Disk Structure – Disk Attachment – Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN) – Disk Management – Swap-Space Management – File Concept – Access Methods – Directory Structure – File-System Mounting – File Sharing – Protection – File System Structure – Allocation Methods – Free-Space Management.

UNIT V: CASE STUDY & LINUX INTERNALS
Linux System – Design Principles – Kernel Modules – Process Management – Scheduling – Memory Management – File Systems – Input and Output – Inter-process Communication – Network Structure – Security.`,
      units: [
        { number: 1, title: 'OS Structures & CPU Scheduling', hours: '9 Hours', topics: JSON.stringify(['Kernel Architecture & System Calls', 'Process State Models & Context Switching', 'Inter-Process Communication (IPC)', 'Preemptive & Non-preemptive Scheduling', 'Multithreading Models & Thread Pools']) },
        { number: 2, title: 'Synchronization & Deadlock Management', hours: '10 Hours', topics: JSON.stringify(['Critical Section Problem & Petersons Solution', 'Mutex Locks & Counting Semaphores', 'Classic Problems (Dining Philosophers, Producer-Consumer)', 'Bankers Deadlock Avoidance Algorithm', 'Deadlock Detection & Recovery Strategies']) },
        { number: 3, title: 'Memory Management & Virtual Memory', hours: '9 Hours', topics: JSON.stringify(['Paging & Multi-level Page Tables', 'Translation Lookaside Buffer (TLB)', 'Demand Paging & Page Fault Handling', 'Page Replacement (FIFO, LRU, Optimal)', 'Thrashing & Working Set Model']) },
        { number: 4, title: 'Storage Systems & File Architectures', hours: '9 Hours', topics: JSON.stringify(['Magnetic Disk & SSD Architecture', 'Disk Scheduling (SSTF, SCAN, C-SCAN)', 'File Allocation (Contiguous, Linked, Indexed)', 'Free Space Management (Bitmaps & Linked Lists)', 'File Permissions & Protection Domains']) },
        { number: 5, title: 'Linux Kernel Internals & Security', hours: '8 Hours', topics: JSON.stringify(['Linux Monolithic Kernel & Loadable Modules', 'Completely Fair Scheduler (CFS)', 'Linux Virtual File System (VFS)', 'System Security & Access Control Lists', 'Containerization & Namespaces Overview']) },
      ],
      notes: [
        { title: 'Unit 1: CPU Scheduling Algorithms & Gantt Charts Solved Problems', fileUrl: '/notes/AD2304_Unit1.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 2: Semaphores & Bankers Algorithm Step-by-Step Guide', fileUrl: '/notes/AD2304_Unit2.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 3: Paging & Virtual Memory LRU Numerical Notes', fileUrl: '/notes/AD2304_Unit3.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 4: Disk Scheduling & File Allocation Schemes', fileUrl: '/notes/AD2304_Unit4.pdf', uploaderName: 'Prof. R. Meena' },
        { title: 'Unit 5: Linux System Calls & Kernel Internal Architecture', fileUrl: '/notes/AD2304_Unit5.pdf', uploaderName: 'Prof. R. Meena' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'Unix System Calls for Process Creation (fork, exec, wait, exit)', title: 'Experiment 1: Unix System Calls', fileUrl: '/labs/AD2304_Exp1.pdf', description: 'Process lifecycle management using POSIX system calls in C.' },
        { experimentNumber: 2, experimentName: 'CPU Scheduling Algorithms Simulation (FCFS, SJF, Priority, Round Robin)', title: 'Experiment 2: CPU Schedulers', fileUrl: '/labs/AD2304_Exp2.pdf', description: 'Simulate CPU scheduling and compute average turnaround and waiting times.' },
        { experimentNumber: 3, experimentName: 'Inter-Process Communication using Shared Memory and Message Queues', title: 'Experiment 3: IPC Mechanisms', fileUrl: '/labs/AD2304_Exp3.pdf', description: 'POSIX shared memory and semaphore synchronization.' },
        { experimentNumber: 4, experimentName: 'Bankers Algorithm for Deadlock Avoidance and Safety State Check', title: 'Experiment 4: Bankers Algorithm', fileUrl: '/labs/AD2304_Exp4.pdf', description: 'Determine safe sequence and evaluate resource request feasibility.' },
        { experimentNumber: 5, experimentName: 'Page Replacement Algorithms Simulation (FIFO, LRU, Optimal)', title: 'Experiment 5: Page Replacement', fileUrl: '/labs/AD2304_Exp5.pdf', description: 'Calculate total page faults for varying frame allocation sizes.' },
      ],
      iq: [
        { question: 'Define a context switch and explain its operational overhead.', marks: 2 },
        { question: 'What are the four necessary conditions for a deadlock to occur?', marks: 2 },
        { question: 'Given processes with burst and arrival times, compute average waiting time for Round Robin (Quantum=2) and SJF.', marks: 16 },
        { question: 'Explain Bankers Deadlock Avoidance Algorithm with an example system allocation matrix.', marks: 16 },
        { question: 'Explain Demand Paging and trace LRU, FIFO, and Optimal page replacement for a given reference string.', marks: 16 },
      ]
    },
    AD2305: {
      name: 'Machine Learning Foundations',
      credits: 4,
      faculty: 'Dr. S. Karthik (Professor)',
      syllabus: `UNIT I: INTRODUCTION TO MACHINE LEARNING
Machine Learning Foundations – Types of Machine Learning: Supervised, Unsupervised, Reinforcement Learning – Machine Learning Pipeline – Feature Engineering – Feature Scaling – Dimensionality Reduction (PCA, LDA) – Train/Validation/Test Splits – Cross-Validation.

UNIT II: SUPERVISED LEARNING - REGRESSION & CLASSIFICATION
Linear Regression – Cost Function – Gradient Descent – Ridge and Lasso Regularization – Logistic Regression – Decision Trees – ID3, C4.5, CART – Ensemble Learning – Random Forest – Bagging and Boosting: AdaBoost, Gradient Boosting, XGBoost.

UNIT III: SUPPORT VECTOR MACHINES & PROBABILISTIC MODELS
Support Vector Machines (SVM) – Linear SVM – Soft Margin Classification – Kernel Trick – Polynomial and RBF Kernels – Naive Bayes Classifier – Maximum Likelihood Estimation – MAP – Bayesian Networks.

UNIT IV: UNSUPERVISED LEARNING & CLUSTERING
Clustering – K-Means Algorithm – K-Medoids – Hierarchical Clustering (Agglomerative & Divisive) – Density-Based Clustering (DBSCAN) – Gaussian Mixture Models (GMM) – Expectation Maximization (EM) Algorithm – Association Rule Mining (Apriori, FP-Growth).

UNIT V: NEURAL NETWORKS & MODEL EVALUATION
Artificial Neural Networks – Perceptron – Multi-Layer Perceptron (MLP) – Activation Functions – Backpropagation Algorithm – Overfitting & Regularization – Model Evaluation Metrics: Precision, Recall, F1-Score, ROC-AUC Curve, Confusion Matrix.`,
      units: [
        { number: 1, title: 'ML Foundations & Feature Engineering', hours: '9 Hours', topics: JSON.stringify(['Supervised vs Unsupervised Paradigms', 'ML Lifecycle & Data Pipelines', 'Feature Encoding & Normalization', 'Principal Component Analysis (PCA)', 'K-Fold Cross-Validation Strategies']) },
        { number: 2, title: 'Regression & Ensemble Classifiers', hours: '10 Hours', topics: JSON.stringify(['Linear Regression & Gradient Descent', 'L1 (Lasso) & L2 (Ridge) Regularization', 'Logistic Regression & Decision Boundaries', 'Decision Trees (Entropy & Gini Impurity)', 'Random Forests, AdaBoost & XGBoost']) },
        { number: 3, title: 'Support Vector Machines & Bayes Classifiers', hours: '9 Hours', topics: JSON.stringify(['Maximal Margin Hyperplanes', 'Soft Margin & Slack Variables', 'Non-linear SVM with RBF Kernels', 'Naive Bayes & Conditional Independence', 'Maximum Likelihood Estimation (MLE)']) },
        { number: 4, title: 'Unsupervised Clustering & Density Models', hours: '9 Hours', topics: JSON.stringify(['K-Means & Elbow Method Optimization', 'Hierarchical Dendrogram Clustering', 'DBSCAN Density Clustering & Outlier Detection', 'Gaussian Mixture Models (GMM)', 'Apriori Association Rule Mining']) },
        { number: 5, title: 'Neural Networks & Performance Evaluation', hours: '8 Hours', topics: JSON.stringify(['Biological vs Artificial Neurons', 'Multi-Layer Perceptron (MLP) Architecture', 'Backpropagation & Loss Optimization', 'Confusion Matrix, Precision, Recall, F1', 'ROC Curves & Area Under Curve (AUC)']) },
      ],
      notes: [
        { title: 'Unit 1: Feature Engineering & PCA Dimensionality Reduction Guide', fileUrl: '/notes/AD2305_Unit1.pdf', uploaderName: 'Dr. S. Karthik' },
        { title: 'Unit 2: Linear, Logistic Regression & Tree Ensembles Complete Notes', fileUrl: '/notes/AD2305_Unit2.pdf', uploaderName: 'Dr. S. Karthik' },
        { title: 'Unit 3: SVM Kernel Mathematics & Naive Bayes Handbook', fileUrl: '/notes/AD2305_Unit3.pdf', uploaderName: 'Dr. S. Karthik' },
        { title: 'Unit 4: Clustering Algorithms (K-Means, DBSCAN, GMM) Guide', fileUrl: '/notes/AD2305_Unit4.pdf', uploaderName: 'Dr. S. Karthik' },
        { title: 'Unit 5: Neural Networks & Backpropagation Illustrated Handbook', fileUrl: '/notes/AD2305_Unit5.pdf', uploaderName: 'Dr. S. Karthik' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'Data Preprocessing, Encoding and Feature Scaling in Python (Scikit-Learn)', title: 'Experiment 1: Data Preprocessing', fileUrl: '/labs/AD2305_Exp1.pdf', description: 'Handle missing values, label encoding, standard scaling on real-world datasets.' },
        { experimentNumber: 2, experimentName: 'Linear and Polynomial Regression with Cost Function Plotting', title: 'Experiment 2: Regression Models', fileUrl: '/labs/AD2305_Exp2.pdf', description: 'Train linear and ridge regression models and evaluate MSE and R2 score.' },
        { experimentNumber: 3, experimentName: 'Decision Tree and Random Forest Classification on Medical Datasets', title: 'Experiment 3: Ensemble Classifiers', fileUrl: '/labs/AD2305_Exp3.pdf', description: 'Construct decision trees and tune hyperparameters for maximum accuracy.' },
        { experimentNumber: 4, experimentName: 'Non-linear Classification using Support Vector Machines with RBF Kernel', title: 'Experiment 4: SVM Classification', fileUrl: '/labs/AD2305_Exp4.pdf', description: 'Plot decision boundaries and benchmark C and gamma regularization parameters.' },
        { experimentNumber: 5, experimentName: 'K-Means and DBSCAN Clustering for Customer Segmentation', title: 'Experiment 5: Clustering Algorithms', fileUrl: '/labs/AD2305_Exp5.pdf', description: 'Cluster customer purchasing trends and plot silhouette scores.' },
      ],
      iq: [
        { question: 'Explain the bias-variance tradeoff in machine learning models.', marks: 2 },
        { question: 'Differentiate between L1 (Lasso) and L2 (Ridge) regularization.', marks: 2 },
        { question: 'Derive the mathematical formulation of Gradient Descent for Linear Regression.', marks: 16 },
        { question: 'Explain Support Vector Machines and discuss how the Kernel trick handles non-linear boundaries.', marks: 16 },
        { question: 'Explain the Backpropagation algorithm in detail with forward and backward pass weight updates.', marks: 16 },
      ]
    },
    AD2306: {
      name: 'Artificial Intelligence & Expert Systems',
      credits: 3,
      faculty: 'Prof. T. Lakshmi (Asst. Professor)',
      syllabus: `UNIT I: INTRODUCTION & PROBLEM SOLVING
Introduction to AI – Foundations of AI – Intelligent Agents: Structure and Types – Problem Solving by Searching – Uninformed Search Strategies (BFS, DFS, Uniform Cost Search) – Informed Search Strategies (A* Search, Greedy Best First Search) – Heuristics.

UNIT II: ADVERSARIAL SEARCH & CONSTRAINT SATISFACTION
Adversarial Search – Games – Optimal Decisions in Games – Minimax Algorithm – Alpha-Beta Pruning – Constraint Satisfaction Problems (CSP) – Constraint Propagation – Backtracking Search for CSP – Forward Checking.

UNIT III: KNOWLEDGE REPRESENTATION & REASONING
Logical Agents – Propositional Logic – First-Order Logic – Syntax and Semantics – Knowledge Engineering in First-Order Logic – Inference in First-Order Logic – Forward Chaining – Backward Chaining – Resolution – Ontologies.

UNIT IV: PLANNING & PROBABILISTIC REASONING
Classical Planning – Planning with State-Space Search – Partial-Order Planning – Planning Graphs – Quantifying Uncertainty – Probabilistic Reasoning – Bayesian Networks – Exact Inference in Bayesian Networks – Markov Models.

UNIT V: EXPERT SYSTEMS & RECENT ADVANCES
Expert Systems Architecture – Rule-Based Expert Systems – Inference Engine – Knowledge Acquisition – Fuzzy Logic Systems – Natural Language Processing Overview – Robotics and Computer Vision in AI – Ethical AI.`,
      units: [
        { number: 1, title: 'Intelligent Agents & State Space Search', hours: '9 Hours', topics: JSON.stringify(['Agent Architectures (PEAS Model)', 'Uninformed Search (BFS, DFS, UCS)', 'Informed Search & A* Optimality', 'Admissible & Consistent Heuristics', 'Local Search & Hill Climbing']) },
        { number: 2, title: 'Adversarial Games & CSP Solvers', hours: '10 Hours', topics: JSON.stringify(['Minimax Algorithm in Game Theory', 'Alpha-Beta Pruning Optimization', 'Constraint Satisfaction Problems (CSP)', 'Arc Consistency (AC-3 Algorithm)', 'Backtracking & Forward Checking']) },
        { number: 3, title: 'Knowledge Representation & First Order Logic', hours: '9 Hours', topics: JSON.stringify(['First Order Logic (FOL) Syntax & Semantics', 'Unification Algorithm', 'Forward & Backward Chaining Inference', 'Resolution Refutation Proofs', 'Ontologies & Knowledge Graphs']) },
        { number: 4, title: 'Classical Planning & Probabilistic Models', hours: '9 Hours', topics: JSON.stringify(['STRIPS & PDDL Planning Frameworks', 'Planning Graphs & GraphPlan', 'Uncertainty & Conditional Probability', 'Bayesian Belief Networks', 'Hidden Markov Models (HMM)']) },
        { number: 5, title: 'Expert Systems, Fuzzy Logic & AI Ethics', hours: '8 Hours', topics: JSON.stringify(['Rule-Based Expert System Shells', 'Knowledge Acquisition & Explanation Modules', 'Fuzzy Sets, Membership & Fuzzy Rules', 'Conversational Agents & NLP Overview', 'AI Safety & Responsible AI Directives']) },
      ],
      notes: [
        { title: 'Unit 1: A* Search Algorithm & Heuristic Design Notes', fileUrl: '/notes/AD2306_Unit1.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 2: Minimax Game Trees & Alpha-Beta Pruning Solved Problems', fileUrl: '/notes/AD2306_Unit2.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 3: First Order Logic & Resolution Refutation Guide', fileUrl: '/notes/AD2306_Unit3.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 4: Bayesian Networks & Probabilistic Inference Handbook', fileUrl: '/notes/AD2306_Unit4.pdf', uploaderName: 'Prof. T. Lakshmi' },
        { title: 'Unit 5: Expert Systems Architecture & Fuzzy Logic Notes', fileUrl: '/notes/AD2306_Unit5.pdf', uploaderName: 'Prof. T. Lakshmi' },
      ],
      labs: [],
      iq: [
        { question: 'Explain the PEAS framework for an Automated Taxi Driver agent.', marks: 2 },
        { question: 'What is an admissible heuristic? Give an example for the 8-puzzle problem.', marks: 2 },
        { question: 'Explain the A* search algorithm and prove that A* is optimal when using an admissible heuristic.', marks: 16 },
        { question: 'Trace the Minimax algorithm with Alpha-Beta pruning on a given 4-ply game tree.', marks: 16 },
        { question: 'Explain the architecture and inference mechanism of a Rule-Based Expert System.', marks: 16 },
      ]
    },
    AD2307: {
      name: 'Data Science Tools & Laboratory',
      credits: 2,
      faculty: 'Dr. S. Karthik & Dr. K. Mohan',
      syllabus: `UNIT I: PYTHON DATA SCIENCE STACK
NumPy for Scientific Computing – Multi-dimensional arrays – Array indexing – Mathematical operations – Broadcasting – Vectorization – Pandas for Data Manipulation – Series and DataFrames – Data cleaning – GroupBy – Merging and Joining datasets.

UNIT II: DATA VISUALIZATION
Matplotlib: Line plots, Scatter plots, Histograms, Bar charts, Subplots – Seaborn: Heatmaps, Pairplots, Box plots, Violin plots, Distribution plots – Interactive Visualizations using Plotly.

UNIT III: STATISTICAL MODELING & EDA
Exploratory Data Analysis (EDA) – Descriptive statistics – Correlation analysis – Hypothesis Testing – Z-test, T-test, ANOVA, Chi-Square Test – Outlier detection techniques (IQR, Z-score).

UNIT IV: BIG DATA TOOLS & SPARK
Introduction to PySpark – Resilient Distributed Datasets (RDD) – Transformations and Actions – PySpark DataFrames – Spark SQL – Distributed data processing pipelines.

UNIT V: CLOUD & DEPLOYMENT TOOLS
JupyterLab & Google Colab – Git version control for ML – Streamlit and Gradio for Model Deployment – FastAPI for ML REST APIs – Dockerizing Data Science Workflows.`,
      units: [
        { number: 1, title: 'NumPy & Pandas High-Performance Computing', hours: '6 Hours', topics: JSON.stringify(['NumPy N-Dimensional Arrays & Slicing', 'Vectorized Operations & Broadcasting', 'Pandas DataFrames & Missing Value Imputation', 'Data Aggregation, Pivot Tables & GroupBy', 'Time Series Data Processing']) },
        { number: 2, title: 'Exploratory Visualization (Matplotlib & Seaborn)', hours: '6 Hours', topics: JSON.stringify(['Matplotlib Custom Subplots & Styling', 'Seaborn Multi-Variate Categorical Plots', 'Correlation Heatmaps & Pairwise Distributions', 'Interactive Visualizations with Plotly Express', 'Dashboard Component Design']) },
        { number: 3, title: 'Statistical Analysis & Hypothesis Testing', hours: '6 Hours', topics: JSON.stringify(['Summary Metrics: Mean, Median, Skewness, Kurtosis', 'Parametric Tests: Student T-Test & ANOVA', 'Non-parametric Tests: Chi-Square Independence', 'IQR & Isolation Forest Outlier Filtering', 'Confidence Interval Estimation']) },
        { number: 4, title: 'PySpark & Distributed Data Analytics', hours: '6 Hours', topics: JSON.stringify(['Spark RDD Transformations & Lazy Evaluation', 'Spark SQL Queries on Large CSV/Parquet', 'Distributed Joins & Aggregations', 'Spark MLlib Machine Learning Pipeline', 'Cluster Execution Architecture']) },
        { number: 5, title: 'Model Serving with Streamlit & FastAPI', hours: '6 Hours', topics: JSON.stringify(['Interactive Web Apps with Streamlit', 'FastAPI REST Endpoints for Model Inference', 'Pydantic Data Validation Schemas', 'Dockerizing Data Science Microservices', 'GitHub Actions CI/CD for ML Code']) },
      ],
      notes: [
        { title: 'Unit 1: NumPy & Pandas Cheatsheet & Real-World Case Studies', fileUrl: '/notes/AD2307_Unit1.pdf', uploaderName: 'Dr. S. Karthik' },
        { title: 'Unit 2: Data Visualization with Seaborn & Plotly Masterclass', fileUrl: '/notes/AD2307_Unit2.pdf', uploaderName: 'Dr. S. Karthik' },
        { title: 'Unit 3: Hypothesis Testing & Statistical EDA Handbook', fileUrl: '/notes/AD2307_Unit3.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 4: PySpark Big Data Processing Cookbook', fileUrl: '/notes/AD2307_Unit4.pdf', uploaderName: 'Dr. K. Mohan' },
        { title: 'Unit 5: Building & Deploying ML Web Apps with Streamlit & FastAPI', fileUrl: '/notes/AD2307_Unit5.pdf', uploaderName: 'Dr. S. Karthik' },
      ],
      labs: [
        { experimentNumber: 1, experimentName: 'Data Cleaning and Wrangling with Pandas on Real-World Datasets', title: 'Experiment 1: Pandas Wrangling', fileUrl: '/labs/AD2307_Exp1.pdf', description: 'Data ingestion, handling NULL values, one-hot encoding, and datetime parsing.' },
        { experimentNumber: 2, experimentName: 'Exploratory Data Analysis and Multi-Variate Visualization with Seaborn', title: 'Experiment 2: Seaborn EDA', fileUrl: '/labs/AD2307_Exp2.pdf', description: 'Create distribution plots, correlation heatmaps, and pairplots.' },
        { experimentNumber: 3, experimentName: 'Hypothesis Testing (T-Test & ANOVA) for A/B Testing Validation', title: 'Experiment 3: Hypothesis Testing', fileUrl: '/labs/AD2307_Exp3.pdf', description: 'Formulate null hypotheses, calculate p-values, and draw statistical inferences.' },
        { experimentNumber: 4, experimentName: 'Distributed Word Count and Big Data Aggregation using PySpark', title: 'Experiment 4: PySpark Pipelines', fileUrl: '/labs/AD2307_Exp4.pdf', description: 'Write PySpark RDD transformations and Spark SQL dataframe operations.' },
        { experimentNumber: 5, experimentName: 'Deploying an End-to-End Predictive Model using Streamlit and FastAPI', title: 'Experiment 5: App Deployment', fileUrl: '/labs/AD2307_Exp5.pdf', description: 'Build interactive sliders, predict customer churn, and expose REST API.' },
      ],
      iq: [
        { question: 'Explain NumPy array broadcasting rules with an example.', marks: 2 },
        { question: 'What is the purpose of a P-value in hypothesis testing?', marks: 2 },
        { question: 'Demonstrate an end-to-end Exploratory Data Analysis workflow in Python using Pandas and Seaborn.', marks: 16 },
        { question: 'Explain the PySpark architecture and compare RDDs with DataFrames.', marks: 16 },
        { question: 'Design and write a complete Streamlit web application that serves a trained ML classifier.', marks: 16 },
      ]
    }
  };

  for (const s of subjects) {
    const data = fullData[s.code] || fullData.AD2301;

    // Update subject name & credits
    await prisma.subject.update({
      where: { id: s.id },
      data: {
        name: data.name,
        credits: data.credits,
        description: `Regulation 2021 · Instructor: ${data.faculty}`
      }
    });

    // 1. Syllabus
    await prisma.syllabus.upsert({
      where: { subjectId: s.id },
      update: { content: data.syllabus, status: 'published' },
      create: { subjectId: s.id, content: data.syllabus, status: 'published', version: 1 }
    });

    // 2. Units
    await prisma.unit.deleteMany({ where: { subjectId: s.id } });
    for (const u of data.units) {
      await prisma.unit.create({
        data: {
          subjectId: s.id,
          number: u.number,
          title: u.title,
          topics: u.topics,
          order: u.number
        }
      });
    }

    // 3. Notes
    await prisma.note.deleteMany({ where: { subjectId: s.id } });
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
    await prisma.labManual.deleteMany({ where: { subjectId: s.id } });
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
    await prisma.importantQuestion.deleteMany({ where: { subjectId: s.id } });
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

  console.log('Successfully refreshed detailed academic syllabi and course materials for all subjects!');
}

seedDetailedSyllabi().then(() => process.exit(0));
