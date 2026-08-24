'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  X,
  Search,
  CheckCircle2,
  Layers,
  GraduationCap,
  Sparkles,
  FileText,
  Clock,
  Award,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface SubjectItem {
  id: string
  code: string
  name: string
  credits: number
  category: string
  facultyInCharge: string
  semester: number
  description?: string | null
  units: { number: number; title: string; hours: number }[]
}

const ALL_SEMESTER_SUBJECTS: SubjectItem[] = [
  // SEMESTER 1
  {
    id: 's_s1_1',
    code: 'MA2101',
    name: 'Matrices & Calculus',
    credits: 4,
    category: 'Basic Science (BS)',
    facultyInCharge: 'Dr. M. Sowmya',
    semester: 1,
    description: 'Eigenvalues, Cayley-Hamilton theorem, differential calculus of several variables, and multiple integrals.',
    units: [
      { number: 1, title: 'Matrices & Linear Transformations', hours: 9 },
      { number: 2, title: 'Differential Calculus & Maxima-Minima', hours: 9 },
      { number: 3, title: 'Functions of Several Variables', hours: 9 },
      { number: 4, title: 'Multiple Integrals & Vector Calculus', hours: 9 },
      { number: 5, title: 'Differential Equations of Higher Order', hours: 9 },
    ],
  },
  {
    id: 's_s1_2',
    code: 'PH2101',
    name: 'Engineering Physics',
    credits: 3,
    category: 'Basic Science (BS)',
    facultyInCharge: 'Dr. K. Ramesh',
    semester: 1,
    description: 'Lasers, fiber optics, quantum physics, and crystal structures for computing hardware.',
    units: [
      { number: 1, title: 'Properties of Matter & Elasticity', hours: 9 },
      { number: 2, title: 'Laser Physics & Optical Waveguides', hours: 9 },
      { number: 3, title: 'Fiber Optics & Sensor Applications', hours: 9 },
      { number: 4, title: 'Quantum Mechanics & Schrödinger Equation', hours: 9 },
      { number: 5, title: 'Crystallography & Semiconductor Physics', hours: 9 },
    ],
  },
  {
    id: 's_s1_3',
    code: 'GE2101',
    name: 'Problem Solving & Python Programming',
    credits: 3,
    category: 'Engineering Science (ES)',
    facultyInCharge: 'Mrs. R. Priya',
    semester: 1,
    description: 'Algorithmic thinking, data structures in Python, control flow, functions, and file I/O operations.',
    units: [
      { number: 1, title: 'Computational Thinking & Algorithms', hours: 9 },
      { number: 2, title: 'Python Basics, Data Types & Operators', hours: 9 },
      { number: 3, title: 'Control Flow, Conditionals & Loops', hours: 9 },
      { number: 4, title: 'Functions, Strings, Lists & Tuples', hours: 9 },
      { number: 5, title: 'Dictionaries, Sets & File Handling', hours: 9 },
    ],
  },

  // SEMESTER 2
  {
    id: 's_s2_1',
    code: 'MA2201',
    name: 'Statistics & Numerical Methods',
    credits: 4,
    category: 'Basic Science (BS)',
    facultyInCharge: 'Dr. M. Sowmya',
    semester: 2,
    description: 'Probability distributions, sampling tests, ANOVA, curve fitting, and numerical root finding.',
    units: [
      { number: 1, title: 'Testing of Hypothesis & Large Samples', hours: 9 },
      { number: 2, title: 'Small Sample Tests (t, F, Chi-Square)', hours: 9 },
      { number: 3, title: 'Design of Experiments & ANOVA', hours: 9 },
      { number: 4, title: 'Numerical Solution of Equations', hours: 9 },
      { number: 5, title: 'Numerical Integration & Differentiation', hours: 9 },
    ],
  },
  {
    id: 's_s2_2',
    code: 'CS2201',
    name: 'Programming in C & Data Architecture',
    credits: 3,
    category: 'Engineering Science (ES)',
    facultyInCharge: 'Mr. S. Arun',
    semester: 2,
    description: 'Pointers, dynamic memory allocation, structs, bitwise operations, and low-level memory layout.',
    units: [
      { number: 1, title: 'C Fundamentals, Operators & Expressions', hours: 9 },
      { number: 2, title: 'Arrays, Pointers & Memory Management', hours: 9 },
      { number: 3, title: 'Structures, Unions & Preprocessor Directives', hours: 9 },
      { number: 4, title: 'File Handling & Command Line Arguments', hours: 9 },
      { number: 5, title: 'Advanced Pointers & Linked Representations', hours: 9 },
    ],
  },

  // SEMESTER 3
  {
    id: 's_s3_1',
    code: 'MA2301',
    name: 'Linear Algebra & Probability Theory',
    credits: 4,
    category: 'Basic Science (BS)',
    facultyInCharge: 'Dr. M. Sowmya',
    semester: 3,
    description: 'Vector spaces, linear transformations, inner products, SVD, and multivariate probability distributions.',
    units: [
      { number: 1, title: 'Vector Spaces, Subspaces & Basis', hours: 9 },
      { number: 2, title: 'Linear Transformations & Matrix Representations', hours: 9 },
      { number: 3, title: 'Inner Product Spaces & Gram-Schmidt Orthogonalization', hours: 9 },
      { number: 4, title: 'Eigen Decomposition & Singular Value Decomposition (SVD)', hours: 9 },
      { number: 5, title: 'Joint Distributions, Covariance & Central Limit Theorem', hours: 9 },
    ],
  },
  {
    id: 's_s3_2',
    code: 'AD2301',
    name: 'Foundations of Data Science',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 3,
    description: 'Data wrangling, exploratory data analysis, NumPy, Pandas, statistical modeling, and data pipelines.',
    units: [
      { number: 1, title: 'Introduction to Data Science Lifecycle', hours: 9 },
      { number: 2, title: 'Data Cleaning, Transformation & Imputation', hours: 9 },
      { number: 3, title: 'Exploratory Data Analysis (EDA) & Visualization', hours: 9 },
      { number: 4, title: 'Statistical Inference & Hypothesis Testing', hours: 9 },
      { number: 5, title: 'High-Dimensional Data & Feature Engineering', hours: 9 },
    ],
  },
  {
    id: 's_s3_3',
    code: 'CS2302',
    name: 'Object Oriented Programming in Java',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mrs. R. Priya',
    semester: 3,
    description: 'Classes, encapsulation, inheritance, polymorphism, Java Collections, multithreading, and streams.',
    units: [
      { number: 1, title: 'OOP Principles, Classes & Encapsulation', hours: 9 },
      { number: 2, title: 'Inheritance, Interfaces & Abstract Classes', hours: 9 },
      { number: 3, title: 'Exception Handling & Java Generics', hours: 9 },
      { number: 4, title: 'Java Collections Framework & Lambda Streams', hours: 9 },
      { number: 5, title: 'Multithreading, Concurrency & File I/O', hours: 9 },
    ],
  },

  // SEMESTER 4 (CURRENT)
  {
    id: 's_s4_1',
    code: 'AD2401',
    name: 'Data Structures & Algorithms',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 4,
    description: 'Linear & Non-linear data structures, trees, graphs, dynamic programming, and greedy algorithms.',
    units: [
      { number: 1, title: 'Linear Structures — Stacks & Queues', hours: 9 },
      { number: 2, title: 'Tree Structures — AVL, Red-Black & B-Trees', hours: 9 },
      { number: 3, title: 'Graph Algorithms — Dijkstra, MST & Traversals', hours: 9 },
      { number: 4, title: 'Algorithm Design — Divide & Conquer, Dynamic Programming', hours: 9 },
      { number: 5, title: 'NP-Completeness, Backtracking & Branch and Bound', hours: 9 },
    ],
  },
  {
    id: 's_s4_2',
    code: 'AD2402',
    name: 'Database Management Systems',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mrs. R. Priya',
    semester: 4,
    description: 'Relational model, SQL, normalization, ACID transaction management, indexing, and NoSQL architecture.',
    units: [
      { number: 1, title: 'Database Architecture & ER Modeling', hours: 9 },
      { number: 2, title: 'Relational Algebra & Advanced SQL Queries', hours: 9 },
      { number: 3, title: 'Relational Design Theory & Normalization (1NF to BCNF)', hours: 9 },
      { number: 4, title: 'Transaction Processing, Concurrency & Recovery', hours: 9 },
      { number: 5, title: 'Indexing, B+ Trees & NoSQL Distributed Databases', hours: 9 },
    ],
  },
  {
    id: 's_s4_3',
    code: 'AD2403',
    name: 'Discrete Mathematics',
    credits: 4,
    category: 'Basic Science (BS)',
    facultyInCharge: 'Dr. M. Sowmya',
    semester: 4,
    description: 'Propositional logic, set theory, combinatorics, recurrence relations, and algebraic structures.',
    units: [
      { number: 1, title: 'Mathematical Logic & Proof Techniques', hours: 9 },
      { number: 2, title: 'Combinatorics, Permutations & Generating Functions', hours: 9 },
      { number: 3, title: 'Recurrence Relations & Inclusion-Exclusion', hours: 9 },
      { number: 4, title: 'Graph Theory & Algebraic Structures', hours: 9 },
      { number: 5, title: 'Groups, Rings, Fields & Boolean Algebra', hours: 9 },
    ],
  },
  {
    id: 's_s4_4',
    code: 'AD2404',
    name: 'Operating Systems',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mr. S. Arun',
    semester: 4,
    description: 'Process synchronization, thread scheduling, virtual memory, paging, file systems, and deadlocks.',
    units: [
      { number: 1, title: 'OS Services, System Calls & Process Management', hours: 9 },
      { number: 2, title: 'CPU Scheduling Algorithms & Threads', hours: 9 },
      { number: 3, title: 'Process Synchronization, Semaphores & Deadlocks', hours: 9 },
      { number: 4, title: 'Memory Management, Paging & Virtual Memory', hours: 9 },
      { number: 5, title: 'Storage Systems, File Systems & Kernel Security', hours: 9 },
    ],
  },
  {
    id: 's_s4_5',
    code: 'AD2405',
    name: 'Machine Learning Foundations',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 4,
    description: 'Supervised and unsupervised learning, regression, classification, SVMs, decision trees, and ensemble methods.',
    units: [
      { number: 1, title: 'Linear Regression, Gradient Descent & Regularization', hours: 9 },
      { number: 2, title: 'Classification Models — Logistic Regression & Naive Bayes', hours: 9 },
      { number: 3, title: 'Support Vector Machines (SVM) & Kernel Methods', hours: 9 },
      { number: 4, title: 'Tree-Based Models — Random Forests & XGBoost', hours: 9 },
      { number: 5, title: 'Unsupervised Learning — K-Means, PCA & Clustering', hours: 9 },
    ],
  },
  {
    id: 's_s4_6',
    code: 'AD2406',
    name: 'Artificial Intelligence & Expert Systems',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mrs. R. Priya',
    semester: 4,
    description: 'Heuristic search algorithms, adversarial game playing, knowledge representation, inference engines, and expert systems.',
    units: [
      { number: 1, title: 'Intelligent Agents & Problem Formulation', hours: 9 },
      { number: 2, title: 'Informed Search — A*, IDA* & Heuristic Functions', hours: 9 },
      { number: 3, title: 'Adversarial Search, Alpha-Beta Pruning & Games', hours: 9 },
      { number: 4, title: 'Knowledge Representation, First-Order Logic & Ontologies', hours: 9 },
      { number: 5, title: 'Rule-Based Expert Systems & Inference Engines', hours: 9 },
    ],
  },
  {
    id: 's_s4_7',
    code: 'AD2407',
    name: 'Data Science & Machine Learning Laboratory',
    credits: 2,
    category: 'Employability Enhancement (EEC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 4,
    description: 'Hands-on practical implementations using Scikit-Learn, PyTorch, Pandas, and PostgreSQL.',
    units: [
      { number: 1, title: 'EDA & Feature Pipeline Implementation in Python', hours: 9 },
      { number: 2, title: 'Regression & Classification Model Benchmarking', hours: 9 },
      { number: 3, title: 'Ensemble Learning & Hyperparameter Tuning with GridSearch', hours: 9 },
      { number: 4, title: 'Dimensionality Reduction (PCA, t-SNE) & Clustering', hours: 9 },
      { number: 5, title: 'End-to-End ML Pipeline Deployment with Flask/FastAPI', hours: 9 },
    ],
  },

  // SEMESTER 5
  {
    id: 's_s5_1',
    code: 'AD2501',
    name: 'Deep Learning & Neural Networks',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 5,
    description: 'Feedforward networks, backpropagation, CNN architectures (ResNet, EfficientNet), RNNs, and LSTMs.',
    units: [
      { number: 1, title: 'Neural Networks Basics, Activation Functions & Optimizers', hours: 9 },
      { number: 2, title: 'Convolutional Neural Networks (CNNs) & ResNet', hours: 9 },
      { number: 3, title: 'Recurrent Neural Networks (RNNs), LSTMs & GRUs', hours: 9 },
      { number: 4, title: 'Autoencoders & Generative Adversarial Networks (GANs)', hours: 9 },
      { number: 5, title: 'PyTorch Deep Learning Pipeline & Model Deployment', hours: 9 },
    ],
  },
  {
    id: 's_s5_2',
    code: 'AD2502',
    name: 'Big Data Analytics & Distributed Systems',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mr. S. Arun',
    semester: 5,
    description: 'Hadoop, HDFS, MapReduce, Apache Spark, PySpark streaming, and distributed data lakes.',
    units: [
      { number: 1, title: 'Big Data Architecture, 5Vs & Distributed Storage', hours: 9 },
      { number: 2, title: 'Hadoop Ecosystem — HDFS, YARN & MapReduce', hours: 9 },
      { number: 3, title: 'Apache Spark Architecture & RDD Transformations', hours: 9 },
      { number: 4, title: 'Spark SQL, DataFrames & PySpark MLlib', hours: 9 },
      { number: 5, title: 'Real-Time Streaming with Apache Kafka & Spark Streaming', hours: 9 },
    ],
  },
  {
    id: 's_s5_3',
    code: 'AD2503',
    name: 'Natural Language Processing (NLP)',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mrs. R. Priya',
    semester: 5,
    description: 'Tokenization, word embeddings (Word2Vec, GloVe), attention mechanisms, and Transformer architectures.',
    units: [
      { number: 1, title: 'Text Processing, Tokenization & POS Tagging', hours: 9 },
      { number: 2, title: 'Language Modeling & Word Embeddings (Word2Vec, GloVe)', hours: 9 },
      { number: 3, title: 'Sequence Models, Seq2Seq & Attention Mechanism', hours: 9 },
      { number: 4, title: 'Transformer Architecture — BERT, RoBERTa & GPT', hours: 9 },
      { number: 5, title: 'Sentiment Analysis, NER & Text Summarization', hours: 9 },
    ],
  },
  {
    id: 's_s5_4',
    code: 'AD2504',
    name: 'Computer Networks & Cloud Computing',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mr. S. Arun',
    semester: 5,
    description: 'TCP/IP protocol stack, socket programming, AWS/GCP cloud services, and Docker containers.',
    units: [
      { number: 1, title: 'OSI & TCP/IP Reference Models & Physical Layer', hours: 9 },
      { number: 2, title: 'Data Link Protocols, Ethernet & Switching', hours: 9 },
      { number: 3, title: 'Network Routing Algorithms & IP Addressing', hours: 9 },
      { number: 4, title: 'Transport Layer Protocols (TCP/UDP) & Congestion', hours: 9 },
      { number: 5, title: 'Cloud Models (IaaS, PaaS), Virtualization & Docker', hours: 9 },
    ],
  },
  {
    id: 's_s5_5',
    code: 'AD2511',
    name: 'Deep Learning & Big Data Laboratory',
    credits: 2,
    category: 'Employability Enhancement (EEC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 5,
    description: 'Hands-on PyTorch deep neural networks and PySpark distributed cluster analytics.',
    units: [
      { number: 1, title: 'Image Classification using Custom CNNs in PyTorch', hours: 9 },
      { number: 2, title: 'Transfer Learning with ResNet-50 on Custom Datasets', hours: 9 },
      { number: 3, title: 'Sentiment Classification with LSTM / BiLSTM Networks', hours: 9 },
      { number: 4, title: 'Distributed Log Processing using Apache Spark DataFrames', hours: 9 },
      { number: 5, title: 'Real-Time Streaming Analytics with Spark & Kafka', hours: 9 },
    ],
  },

  // SEMESTER 6
  {
    id: 's_s6_1',
    code: 'AD2601',
    name: 'Computer Vision & Image Processing',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 6,
    description: 'Image filtering, edge detection, object detection (YOLOv8), semantic segmentation (U-Net), and 3D vision.',
    units: [
      { number: 1, title: 'Digital Image Fundamentals, Filtering & Morphology', hours: 9 },
      { number: 2, title: 'Feature Extraction — SIFT, SURF, ORB & Edge Detectors', hours: 9 },
      { number: 3, title: 'Object Detection Architectures (R-CNN, YOLOv8)', hours: 9 },
      { number: 4, title: 'Image Segmentation (Mask R-CNN, U-Net) & Tracking', hours: 9 },
      { number: 5, title: 'Generative Vision — Diffusion Models & NeRFs', hours: 9 },
    ],
  },
  {
    id: 's_s6_2',
    code: 'AD2602',
    name: 'Reinforcement Learning & Autonomous Agents',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mrs. R. Priya',
    semester: 6,
    description: 'MDPs, Dynamic Programming, Q-Learning, Deep Q-Networks (DQN), and Policy Gradient methods (PPO).',
    units: [
      { number: 1, title: 'Markov Decision Processes (MDPs) & Bellman Equations', hours: 9 },
      { number: 2, title: 'Dynamic Programming & Monte Carlo Methods', hours: 9 },
      { number: 3, title: 'Temporal Difference Learning & Q-Learning', hours: 9 },
      { number: 4, title: 'Deep Q-Networks (DQN) & Experience Replay', hours: 9 },
      { number: 5, title: 'Policy Gradients, Actor-Critic & PPO Algorithms', hours: 9 },
    ],
  },
  {
    id: 's_s6_3',
    code: 'AD2603',
    name: 'Generative AI & Large Language Models',
    credits: 4,
    category: 'Professional Elective (PE)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 6,
    description: 'Decoder-only transformers, prompt engineering, LoRA fine-tuning, RAG architecture, and LangChain.',
    units: [
      { number: 1, title: 'Modern Generative AI Landscape & GPT Architectures', hours: 9 },
      { number: 2, title: 'Prompt Engineering & In-Context Few-Shot Learning', hours: 9 },
      { number: 3, title: 'Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA)', hours: 9 },
      { number: 4, title: 'Retrieval-Augmented Generation (RAG) & Vector DBs', hours: 9 },
      { number: 5, title: 'Autonomous Multi-Agent Systems & LangChain Workflows', hours: 9 },
    ],
  },

  // SEMESTER 7
  {
    id: 's_s7_1',
    code: 'AD2701',
    name: 'Edge AI & Embedded IoT Robotics',
    credits: 3,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Mr. S. Arun',
    semester: 7,
    description: 'Model quantization, ONNX Runtime, TensorRT, Raspberry Pi/Jetson deployment, and ROS integration.',
    units: [
      { number: 1, title: 'Embedded Computing & Edge AI Paradigms', hours: 9 },
      { number: 2, title: 'Model Compression, Pruning & INT8 Quantization', hours: 9 },
      { number: 3, title: 'Inference Engines — ONNX, OpenVINO & TensorRT', hours: 9 },
      { number: 4, title: 'NVIDIA Jetson & Raspberry Pi Edge Deployment', hours: 9 },
      { number: 5, title: 'Robot Operating System (ROS) & Autonomous Navigation', hours: 9 },
    ],
  },
  {
    id: 's_s7_2',
    code: 'AD2702',
    name: 'Ethics, Privacy & Responsible AI',
    credits: 3,
    category: 'Humanities & Social Sciences (HSMC)',
    facultyInCharge: 'Dr. M. Sowmya',
    semester: 7,
    description: 'Algorithmic bias, differential privacy, explainable AI (SHAP, LIME), and international AI governance.',
    units: [
      { number: 1, title: 'Ethical Foundations & Societal Impact of AI', hours: 9 },
      { number: 2, title: 'Fairness Metrics & Mitigation of Algorithmic Bias', hours: 9 },
      { number: 3, title: 'Explainable AI (XAI) — SHAP, LIME & Integrated Gradients', hours: 9 },
      { number: 4, title: 'Data Privacy, Federated Learning & Differential Privacy', hours: 9 },
      { number: 5, title: 'Global AI Regulatory Frameworks (EU AI Act & India DPDP)', hours: 9 },
    ],
  },

  // SEMESTER 8
  {
    id: 's_s8_1',
    code: 'AD2801',
    name: 'Capstone Project Phase-II / Industry Internship',
    credits: 10,
    category: 'Employability Enhancement (EEC)',
    facultyInCharge: 'Prof. Dr. V. Sundar',
    semester: 8,
    description: 'Major industrial research capstone project, prototype building, thesis defense, IEEE paper publication, and patent filing.',
    units: [
      { number: 1, title: 'Problem Formulation, IEEE Literature Review & System Architecture', hours: 15 },
      { number: 2, title: 'Prototype Implementation, AI Model Training & Benchmarking', hours: 25 },
      { number: 3, title: 'Verification, Real-World User Testing & Optimization', hours: 20 },
      { number: 4, title: 'Scopus / IEEE Conference Research Paper Publication', hours: 15 },
      { number: 5, title: 'Final Project Viva-Voce Defense & Industrial Demonstration', hours: 15 },
    ],
  },
]

export function AdminAcademicsView({
  totalResources,
  totalQuestionPapers,
}: {
  totalResources: number
  totalQuestionPapers: number
}) {
  const [subjects, setSubjects] = useState<SubjectItem[]>(ALL_SEMESTER_SUBJECTS)
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<SubjectItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: 'Dr. S. Karthik',
    semester: 4,
    description: '',
  })

  const filteredSubjects = subjects.filter((s) => {
    const matchesSemester = selectedSemester === 'ALL' || s.semester === selectedSemester
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.facultyInCharge.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSemester && matchesSearch
  })

  const currentSemesterCredits = filteredSubjects.reduce((acc, s) => acc + s.credits, 0)

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      subtitle: `Regulation 2021 (Autonomous) · ${
        selectedSemester === 'ALL' ? 'Complete 8-Semester Curricular Blueprint' : `Semester ${selectedSemester} Syllabus Scheme`
      }`,
      author: 'Office of the Super Administrator & Academic Council',
      category: 'Official Academic Curriculum Blueprint',
      sections: [
        {
          heading: '1. CURRICULAR STRUCTURE & SCHEME OF INSTRUCTION',
          body: [
            `Total Courses in Current View: ${filteredSubjects.length} Approved Courses`,
            `Total Credits in Current View: ${currentSemesterCredits} Credits`,
            'Degree Awarded: Bachelor of Technology (B.Tech in AI & DS)',
            'Autonomous Body: Anna University, Chennai / NBA Tier-1 OBE Scheme',
            'Curriculum Standards: Bloom\'s Taxonomy, Outcome-Based Education (OBE)',
          ],
        },
        {
          heading: '2. DETAILED LIST OF APPROVED COURSES',
          body: filteredSubjects.map(
            (s, idx) =>
              `${idx + 1}. [${s.code}] ${s.name} — Sem ${s.semester} (${s.credits} Credits, ${s.category}) | Faculty Instructor: ${s.facultyInCharge}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Curriculum_${selectedSemester === 'ALL' ? 'Complete' : `Sem_${selectedSemester}`}_2026`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name) {
      alert('Please fill in Course Code and Name')
      return
    }

    const newSub: SubjectItem = {
      id: 'sub_' + Date.now(),
      code: formData.code,
      name: formData.name,
      credits: Number(formData.credits),
      category: formData.category,
      facultyInCharge: formData.facultyInCharge,
      semester: Number(formData.semester),
      description: formData.description,
      units: [
        { number: 1, title: 'Foundational Principles & Concepts', hours: 9 },
        { number: 2, title: 'Core Architectural Formulations', hours: 9 },
        { number: 3, title: 'Analytical & Methodological Frameworks', hours: 9 },
        { number: 4, title: 'Advanced Algorithms & System Design', hours: 9 },
        { number: 5, title: 'Industrial Case Studies & Applications', hours: 9 },
      ],
    }

    setSubjects([...subjects, newSub])
    setIsAddModalOpen(false)
    setFormData({
      code: '',
      name: '',
      credits: 4,
      category: 'Professional Core (PC)',
      facultyInCharge: 'Dr. S. Karthik',
      semester: 4,
      description: '',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this course from the curriculum?')) {
      setSubjects(subjects.filter((s) => s.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Curriculum &amp; Syllabus Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Regulation 2021 (Autonomous)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Academic Curriculum &amp; Courses</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Official 8-semester syllabus structure, 5-unit lesson blueprints &amp; course credit distribution
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Curriculum (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add New Course
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Curricular Courses</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{filteredSubjects.length} Subjects</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">
            {selectedSemester === 'ALL' ? 'All 8 Semesters' : `Semester ${selectedSemester} Active`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Course Credits</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{currentSemesterCredits} Credits</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Anna Univ R2021</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Digital Textbooks</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{totalResources || 8} Books</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Digital Library</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">COE Question Papers</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">{totalQuestionPapers || 10} Question Sets</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">IAT &amp; Model Exam</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search course code, subject name, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Semesters (1 to 8)</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4 (Current)</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredSubjects.length} Courses
          </span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((sub) => (
          <div
            key={sub.id}
            className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                    {sub.code}
                  </span>
                  <span className="ml-2 font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    Sem {sub.semester}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700">
                  {sub.credits} Credits
                </span>
              </div>

              <h3 className="font-bold text-base text-[#071A3D] line-clamp-2">{sub.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{sub.description}</p>

              <div className="pt-2 space-y-1.5 text-xs text-gray-600 border-t border-gray-100 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-gray-700 font-semibold">{sub.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Faculty Instructor:</span>
                  <span className="font-bold text-[#1455D9]">{sub.facultyInCharge}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedSubjectForModal(sub)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View 5-Unit Syllabus
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: 5-UNIT SYLLABUS DETAIL */}
      {selectedSubjectForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="font-mono text-xs font-black text-[#1455D9] px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                  {selectedSubjectForModal.code} · Sem {selectedSubjectForModal.semester}
                </span>
                <h2 className="text-xl font-black text-[#071A3D] mt-2">{selectedSubjectForModal.name}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Scheme of Instruction: 45 Lecture Hours · {selectedSubjectForModal.credits} Credits · {selectedSubjectForModal.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubjectForModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                5-Unit Course Curriculum &amp; Module Breakdown
              </h3>

              <div className="space-y-3">
                {selectedSubjectForModal.units.map((unit) => (
                  <div
                    key={unit.number}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#071A3D] text-white font-mono text-[10px] font-black">
                          UNIT {unit.number}
                        </span>
                        <h4 className="font-bold text-xs text-[#071A3D]">{unit.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Bloom&apos;s Taxonomy Level: Remember, Understand, Apply &amp; Analyze
                      </p>
                    </div>

                    <span className="font-mono text-xs font-bold text-gray-600 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shrink-0">
                      {unit.hours} Hours
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Faculty Instructor: <span className="font-bold text-[#071A3D]">{selectedSubjectForModal.facultyInCharge}</span>
              </div>

              <button
                onClick={() => setSelectedSubjectForModal(null)}
                className="px-5 py-2 rounded-xl bg-[#071A3D] text-white text-xs font-bold hover:bg-[#0a2a5e] transition-colors cursor-pointer"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD COURSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Add New Course</h3>
                <p className="text-xs text-gray-500">Regulation 2021 Autonomous Scheme</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AD2501"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                  </input>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning & Neural Networks"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Credits</label>
                  <select
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={4}>4 Credits</option>
                    <option value={3}>3 Credits</option>
                    <option value={2}>2 Credits (Lab)</option>
                    <option value={10}>10 Credits (Capstone Project)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Professional Core (PC)">Professional Core (PC)</option>
                    <option value="Basic Science (BS)">Basic Science (BS)</option>
                    <option value="Engineering Science (ES)">Engineering Science (ES)</option>
                    <option value="Professional Elective (PE)">Professional Elective (PE)</option>
                    <option value="Employability Enhancement (EEC)">Employability Lab (EEC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Faculty Instructor</label>
                <select
                  value={formData.facultyInCharge}
                  onChange={(e) => setFormData({ ...formData, facultyInCharge: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="Dr. S. Karthik">Dr. S. Karthik (Associate Professor)</option>
                  <option value="Mrs. R. Priya">Mrs. R. Priya (Assistant Professor)</option>
                  <option value="Mr. S. Arun">Mr. S. Arun (Assistant Professor)</option>
                  <option value="Dr. M. Sowmya">Dr. M. Sowmya (Associate Professor)</option>
                  <option value="Prof. Dr. V. Sundar">Prof. Dr. V. Sundar (HOD)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Course Description</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts, computational methods, tools and learning outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
