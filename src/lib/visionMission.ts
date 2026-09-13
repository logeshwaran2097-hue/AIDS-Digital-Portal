/**
 * Official Vision, Mission, PEOs, POs, and PSOs for the
 * Department of Artificial Intelligence and Data Science (AI & DS)
 * V.S.B. Engineering College (Autonomous), Karur
 * Extracted from AI&DS NEW vis mis.docx
 */

export interface MissionDirective {
  id: string
  title: string
  category: string
  statement: string
}

export interface PEOItem {
  id: string
  title: string
  tag: string
  statement: string
}

export interface PSOItem {
  id: string
  title: string
  tag: string
  statement: string
}

export interface POItem {
  id: string
  code: string
  name: string
  attribute: string
  statement: string
}

export const ACADEMIC_FRAMEWORK = {
  institution: {
    name: 'V.S.B. Engineering College',
    status: 'Autonomous Institution',
    location: 'Karur, Tamil Nadu',
    vision:
      'We endeavor to impart futuristic technical education of the highest quality to the student community and to inculcate discipline in them to face the world with self-confidence and thus we prepare them for life as responsible citizens to uphold human values and to be of service at large. We strive to bring up the Institution as an Institution of academic excellence of international standard.',
    mission:
      'We transform persons in to personalities by the state-of–the-art infrastructure, time consciousness, quick response and the best academic practices through assessment and advice.',
  },
  department: {
    name: 'Department of Artificial Intelligence and Data Science',
    accreditation: 'NBA Tier-1 Criteria 1.1 Compliant & Autonomous Curriculum',
    vision:
      'To emerge as a premier centre of excellence in Artificial Intelligence and Data Science by creating globally competent professionals, advancing impactful research, fostering innovation and entrepreneurship, and developing ethical, intelligent technologies for a sustainable and inclusive society.',
    missions: [
      {
        id: 'M1',
        title: 'World-Class Pedagogy',
        category: 'Pedagogy',
        statement:
          'Provide world-class education through innovative pedagogy, outcome-based learning, and industry-aligned curricula in Artificial Intelligence and Data Science.',
      },
      {
        id: 'M2',
        title: 'Interdisciplinary Research',
        category: 'Research',
        statement:
          'Promote interdisciplinary research, innovation, and lifelong learning to address global challenges through intelligent and data-driven solutions.',
      },
      {
        id: 'M3',
        title: 'Industry Partnerships',
        category: 'Industry',
        statement:
          'Collaborate with industries, research institutions, and professional bodies to enhance experiential learning, technology development, and employability.',
      },
      {
        id: 'M4',
        title: 'Ethical Leadership',
        category: 'Leadership',
        statement:
          'Cultivate ethical leadership, entrepreneurial mindset, social responsibility, and professional excellence for sustainable technological advancement.',
      },
    ] as MissionDirective[],
    peos: [
      {
        id: 'PEO1',
        title: 'Professional Competence',
        tag: 'Industry & Enterprise Solutions',
        statement:
          'Graduates will excel as competent professionals by applying Artificial Intelligence, Data Science, and computational intelligence to develop innovative solutions for complex engineering, industrial, and societal problems.',
      },
      {
        id: 'PEO2',
        title: 'Lifelong Learning & Research',
        tag: 'Higher Education & Research',
        statement:
          'Graduates will engage in lifelong learning, research, higher education, and technological innovation by adopting emerging AI technologies and contributing to knowledge creation and sustainable development.',
      },
      {
        id: 'PEO3',
        title: 'Ethical Leadership & Teamwork',
        tag: 'Global Tech Impact',
        statement:
          'Graduates will exhibit ethical values, leadership, entrepreneurial mindset, and effective communication while contributing to multidisciplinary teams and creating technology solutions with global impact.',
      },
    ] as PEOItem[],
    psos: [
      {
        id: 'PSO1',
        title: 'AI & Data Science',
        tag: 'Cognitive Intelligence',
        statement:
          'Design, implement, and optimize intelligent systems using Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, and Computer Vision techniques to solve domain-specific challenges.',
      },
      {
        id: 'PSO2',
        title: 'Data Analytics',
        tag: 'Actionable Intelligence',
        statement:
          'Apply advanced data engineering, analytics, visualization, and predictive modeling techniques using state-of-the-art industrial tools and AI frameworks to transform data into actionable intelligence for strategic decision-making.',
      },
      {
        id: 'PSO3',
        title: 'Intelligent Systems',
        tag: 'MLOps & Edge Systems',
        statement:
          'Engineer scalable, reliable, secure, and ethical AI-enabled solutions by integrating cloud computing, edge intelligence, Generative AI, IoT, and MLOps while effectively managing multidisciplinary projects and adhering to professional and societal responsibilities.',
      },
    ] as PSOItem[],
    pos: [
      {
        id: 'PO1',
        code: 'PO1',
        name: 'Engineering Knowledge',
        attribute: 'WK1 to WK4',
        statement:
          'Apply knowledge of mathematics, natural science, computing, engineering fundamentals and an engineering specialization as specified in WK1 to WK4 respectively to develop to the solution of complex engineering problems.',
      },
      {
        id: 'PO2',
        code: 'PO2',
        name: 'Problem Analysis',
        attribute: 'WK1 to WK4',
        statement:
          'Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions with consideration for sustainable development. (WK1 to WK4)',
      },
      {
        id: 'PO3',
        code: 'PO3',
        name: 'Design/Development of Solutions',
        attribute: 'WK5',
        statement:
          'Design creative solutions for complex engineering problems and design/develop systems/components/processes to meet identified needs with consideration for the public health and safety, whole-life cost, net zero carbon, culture, society and environment as required. (WK5)',
      },
      {
        id: 'PO4',
        code: 'PO4',
        name: 'Conduct Investigations of Complex Problems',
        attribute: 'WK8',
        statement:
          'Conduct investigations of complex engineering problems using research-based knowledge including design of experiments, modelling, analysis & interpretation of data to provide valid conclusions. (WK8).',
      },
      {
        id: 'PO5',
        code: 'PO5',
        name: 'Engineering Tool Usage',
        attribute: 'WK2 & WK6',
        statement:
          'Create, select and apply appropriate techniques, resources and modern engineering & IT tools, including prediction and modelling recognizing their limitations to solve complex engineering problems. (WK2 and WK6).',
      },
      {
        id: 'PO6',
        code: 'PO6',
        name: 'The Engineer and The World',
        attribute: 'WK1, WK5 & WK7',
        statement:
          'Analyze and evaluate societal and environmental aspects while solving complex engineering problems for its impact on sustainability with reference to economy, health, safety, legal framework, culture and environment. (WK1, WK5, and WK7).',
      },
      {
        id: 'PO7',
        code: 'PO7',
        name: 'Ethics',
        attribute: 'WK9',
        statement:
          'Apply ethical principles and commit to professional ethics, human values, diversity and inclusion; adhere to national & international laws. (WK9).',
      },
      {
        id: 'PO8',
        code: 'PO8',
        name: 'Individual and Collaborative Team work',
        attribute: 'Team Dynamics',
        statement:
          'Function effectively as an individual, and as a member or leader in diverse/multi-disciplinary teams.',
      },
      {
        id: 'PO9',
        code: 'PO9',
        name: 'Communication',
        attribute: 'Reports & Presentations',
        statement:
          'Communicate effectively and inclusively within the engineering community and society at large, such as being able to comprehend and write effective reports and design documentation, make effective presentations considering cultural, language, and learning differences.',
      },
      {
        id: 'PO10',
        code: 'PO10',
        name: 'Project Management and Finance',
        attribute: 'Finance & Mgmt',
        statement:
          'Apply knowledge and understanding of engineering management principles and economic decision-making and apply these to one’s own work, as a member and leader in a team, and to manage projects and in multidisciplinary environments.',
      },
      {
        id: 'PO11',
        code: 'PO11',
        name: 'Life-Long Learning',
        attribute: 'WK8',
        statement:
          'Recognize the need for, and have the preparation and ability for i) independent and life-long learning ii) adaptability to new and emerging technologies and iii) critical thinking in the broadest context of technological change. (WK8)',
      },
    ] as POItem[],
  },
}
