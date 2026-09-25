// Official Anna University & V.S.B. Autonomous Regulation 2021 / 2023 Curriculum
// Department of Artificial Intelligence & Data Science

export interface CurriculumCourse {
  code: string
  name: string
  credits: number
  courseType: 'Theory' | 'Laboratory' | 'Theory cum Laboratory'
  category: string
  faculty: string
  sem: number
  defaultGrade?: string
}

export const ALL_CURRICULUM_COURSES: CurriculumCourse[] = [
  // Sem 1
  { code: 'HS2101', name: 'Professional English - I', credits: 3, courseType: 'Theory', category: 'Humanities (HS)', faculty: 'Dr. M. Sangeetha', sem: 1 },
  { code: 'MA2101', name: 'Matrices and Calculus', credits: 4, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. R. Kavitha', sem: 1 },
  { code: 'PH2101', name: 'Engineering Physics', credits: 3, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. P. Murugesan', sem: 1 },
  { code: 'CY2101', name: 'Engineering Chemistry', credits: 3, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. S. Meenakshi', sem: 1 },
  { code: 'GE2101', name: 'Problem Solving and Python Programming', credits: 3, courseType: 'Theory', category: 'Engineering Sciences (ES)', faculty: 'Prof. K. Mohanapriya', sem: 1 },
  { code: 'GE2102', name: 'Heritage of Tamils', credits: 1, courseType: 'Theory', category: 'Humanities (HS)', faculty: 'Prof. T. Selvam', sem: 1 },
  { code: 'GE2111', name: 'Problem Solving and Python Programming Laboratory', credits: 2, courseType: 'Laboratory', category: 'Engineering Sciences (ES)', faculty: 'Prof. K. Mohanapriya', sem: 1 },
  { code: 'BS2111', name: 'Physics and Chemistry Practical Laboratory', credits: 2, courseType: 'Laboratory', category: 'Basic Sciences (BS)', faculty: 'Dr. P. Murugesan', sem: 1 },
  { code: 'GE2112', name: 'English Communication Skills Laboratory', credits: 1, courseType: 'Laboratory', category: 'Humanities (HS)', faculty: 'Dr. M. Sangeetha', sem: 1 },

  // Sem 2
  { code: 'HS2201', name: 'Professional English - II', credits: 2, courseType: 'Theory', category: 'Humanities (HS)', faculty: 'Dr. M. Sangeetha', sem: 2 },
  { code: 'MA2201', name: 'Statistics and Numerical Methods', credits: 4, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. R. Kavitha', sem: 2 },
  { code: 'PH2201', name: 'Physics for Information Science', credits: 3, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. P. Murugesan', sem: 2 },
  { code: 'BE2201', name: 'Basic Electrical, Electronics & Measurement Engineering', credits: 3, courseType: 'Theory', category: 'Engineering Sciences (ES)', faculty: 'Prof. A. Balaji', sem: 2 },
  { code: 'GE2201', name: 'Engineering Graphics', credits: 4, courseType: 'Theory cum Laboratory', category: 'Engineering Sciences (ES)', faculty: 'Prof. C. Ramesh', sem: 2 },
  { code: 'AD2201', name: 'C Programming and Data Structures', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 2 },
  { code: 'GE2202', name: 'Tamils and Technology', credits: 1, courseType: 'Theory', category: 'Humanities (HS)', faculty: 'Prof. T. Selvam', sem: 2 },
  { code: 'GE2211', name: 'Engineering Practices Laboratory', credits: 2, courseType: 'Laboratory', category: 'Engineering Sciences (ES)', faculty: 'Prof. C. Ramesh', sem: 2 },
  { code: 'AD2211', name: 'C Programming and Data Structures Laboratory', credits: 1.5, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 2 },

  // Sem 3 (Student's Current Semester)
  { code: 'MA2301', name: 'Discrete Mathematics & Graph Theory', credits: 4, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. R. Kavitha', sem: 3 },
  { code: 'AD2301', name: 'Data Structures and Algorithm Design', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 3 },
  { code: 'AD2302', name: 'Database Management Systems', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. K. Mohanapriya', sem: 3 },
  { code: 'AD2303', name: 'Object Oriented Programming with Java/C++', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 3 },
  { code: 'AD2304', name: 'Artificial Intelligence Principles & Tech', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 3 },
  { code: 'AD2311', name: 'Object Oriented Programming Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 3 },
  { code: 'AD2312', name: 'Data Structures Design and Analysis Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 3 },
  { code: 'AD2313', name: 'Database Management Systems Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Prof. K. Mohanapriya', sem: 3 },
  { code: 'GE2321', name: 'Professional Development & Aptitude Laboratory', credits: 1, courseType: 'Laboratory', category: 'Employability Enhancement (EEC)', faculty: 'Prof. T. Selvam', sem: 3 },

  // Sem 4
  { code: 'MA2401', name: 'Probability and Random Processes', credits: 4, courseType: 'Theory', category: 'Basic Sciences (BS)', faculty: 'Dr. R. Kavitha', sem: 4 },
  { code: 'AD2401', name: 'Operating Systems & System Programming', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 4 },
  { code: 'AD2402', name: 'Foundations of Data Science and Analytics', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 4 },
  { code: 'AD2403', name: 'Computer Networks and Internet Protocols', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. A. Balaji', sem: 4 },
  { code: 'AD2404', name: 'Software Engineering and Agile Methodologies', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 4 },
  { code: 'AD2411', name: 'Data Science and Analytics Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 4 },
  { code: 'AD2412', name: 'Operating Systems and Networks Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 4 },
  { code: 'AD2413', name: 'Open Source Software & Web Practicum', credits: 1.5, courseType: 'Laboratory', category: 'Employability Enhancement (EEC)', faculty: 'Prof. K. Mohanapriya', sem: 4 },

  // Sem 5
  { code: 'AD2501', name: 'Deep Learning Architectures & Neural Nets', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 5 },
  { code: 'AD2502', name: 'Big Data Technologies & Ecosystems', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. K. Mohanapriya', sem: 5 },
  { code: 'AD2503', name: 'Cloud Computing Architecture and DevOps', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 5 },
  { code: 'AD2504', name: 'Software Engineering and Agile Methodologies', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 5 },
  { code: 'AD2505', name: 'Professional Elective - I (MLOps & Model Serving)', credits: 3, courseType: 'Theory', category: 'Professional Elective (PE)', faculty: 'Dr. P. Rajeswari', sem: 5 },
  { code: 'AD2506', name: 'Constitution of India & Cyber Laws', credits: 1, courseType: 'Theory', category: 'Mandatory Course (MC)', faculty: 'Prof. T. Selvam', sem: 5 },
  { code: 'AD2511', name: 'Deep Learning and Neural Networks Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 5 },
  { code: 'AD2512', name: 'Big Data Technologies and Cloud Computing Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Prof. K. Mohanapriya', sem: 5 },

  // Sem 6
  { code: 'AD2601', name: 'Natural Language Processing and LLM Foundations', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 6 },
  { code: 'AD2602', name: 'Mobile App & Full Stack Development', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 6 },
  { code: 'AD2603', name: 'Professional Elective - II (Time Series & Forecasting)', credits: 3, courseType: 'Theory', category: 'Professional Elective (PE)', faculty: 'Dr. R. Kavitha', sem: 6 },
  { code: 'AD2604', name: 'Professional Elective - III (Information Retrieval)', credits: 3, courseType: 'Theory', category: 'Professional Elective (PE)', faculty: 'Prof. K. Mohanapriya', sem: 6 },
  { code: 'AD2605', name: 'Open Elective - I (Smart Embedded IoT Systems)', credits: 3, courseType: 'Theory', category: 'Open Elective (OE)', faculty: 'Prof. A. Balaji', sem: 6 },
  { code: 'AD2611', name: 'Natural Language Processing & CV Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Dr. S. Karthikeyan', sem: 6 },
  { code: 'AD2612', name: 'Mobile App & Full Stack Development Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Prof. M. Vijay', sem: 6 },
  { code: 'AD2613', name: 'Socially Relevant Technical Mini Project', credits: 2, courseType: 'Laboratory', category: 'Employability Enhancement (EEC)', faculty: 'Dr. P. Rajeswari', sem: 6 },

  // Sem 7
  { code: 'AD2701', name: 'Reinforcement Learning and Robotics', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 7 },
  { code: 'AD2702', name: 'Edge AI and IoT Analytics', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. A. Balaji', sem: 7 },
  { code: 'AD2703', name: 'Business Intelligence and Data Mining', credits: 3, courseType: 'Theory', category: 'Professional Core (PC)', faculty: 'Prof. K. Mohanapriya', sem: 7 },
  { code: 'AD2704', name: 'Professional Ethics & AI Governance', credits: 2, courseType: 'Theory', category: 'Humanities (HS)', faculty: 'Dr. M. Sangeetha', sem: 7 },
  { code: 'AD2705', name: 'Professional Elective - IV (Generative AI Models)', credits: 3, courseType: 'Theory', category: 'Professional Elective (PE)', faculty: 'Dr. S. Karthikeyan', sem: 7 },
  { code: 'AD2706', name: 'Open Elective - II (Cyber Security & Digital Forensics)', credits: 3, courseType: 'Theory', category: 'Open Elective (OE)', faculty: 'Prof. M. Vijay', sem: 7 },
  { code: 'AD2711', name: 'Reinforcement Learning and Robotics Laboratory', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Dr. P. Rajeswari', sem: 7 },
  { code: 'AD2712', name: 'Edge AI and IoT Analytics Practical Practicum', credits: 2, courseType: 'Laboratory', category: 'Professional Core (PC)', faculty: 'Prof. A. Balaji', sem: 7 },

  // Sem 8
  { code: 'AD2801', name: 'Professional Elective - V (Quantum Machine Learning)', credits: 3, courseType: 'Theory', category: 'Professional Elective (PE)', faculty: 'Dr. S. Karthikeyan', sem: 8 },
  { code: 'AD2802', name: 'Professional Elective - VI (Autonomous Driving Systems)', credits: 3, courseType: 'Theory', category: 'Professional Elective (PE)', faculty: 'Dr. P. Rajeswari', sem: 8 },
  { code: 'AD2811', name: 'Capstone Project Work & Industrial Internship', credits: 10, courseType: 'Laboratory', category: 'Employability Enhancement (EEC)', faculty: 'Dr. S. Karthikeyan', sem: 8 },
]

export function getCurriculumBySemester(semester: number): CurriculumCourse[] {
  const semNum = Number(semester) || 3
  const found = ALL_CURRICULUM_COURSES.filter((c) => c.sem === semNum)
  if (found.length > 0) return found
  // Default to Sem 3 if out of range
  return ALL_CURRICULUM_COURSES.filter((c) => c.sem === 3)
}

export function getAllCurriculumCourses(): CurriculumCourse[] {
  return ALL_CURRICULUM_COURSES
}
